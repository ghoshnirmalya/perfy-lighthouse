require('dotenv').config()

const cron = require('node-cron')
const express = require('express')
const { default: PQueue } = require('p-queue')
const { Pool } = require('pg')

const generate = require('./lighthouse')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const queue = new PQueue({ concurrency: 1, autoStart: false })

app = express()

cron.schedule('30 12 * * *', () => {
  ;(async () => {
    const client = await pool.connect()

    try {
      const res = await client.query('SELECT * FROM page')

      const pages = res.rows

      pages.map(async page => {
        if (!page.link) {
          return false
        }

        try {
          const siteRes = await client.query(
            `SELECT * FROM site where id='${page.site_id}'`
          )

          const {
            login_url,
            username_or_email_address_field_selector,
            username_or_email_address_field_value,
            password_field_selector,
            password_field_value,
            submit_button_selector,
          } = siteRes.rows[0]

          if (login_url) {
            await queue.add(() =>
              generate(
                page,
                login_url,
                username_or_email_address_field_selector,
                username_or_email_address_field_value,
                password_field_selector,
                password_field_value,
                submit_button_selector
              )
            )
          } else {
            await queue.add(() => generate(page))
          }
        } catch (error) {
          console.log(error)
        }
      })

      console.log(queue.size)
      console.log(queue.pending)

      await queue.start()
      await queue.onEmpty()
    } finally {
      client.release()
    }
  })().catch(e => console.log(e.stack))
})

app.listen('3001')
