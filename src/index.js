const cron = require("node-cron");
const express = require("express");
const PQueue = require("p-queue");
const { Pool } = require("pg");

const generate = require("./lighthouse");
const pool = new Pool({
  connectionString: "postgres://postgres:@db:5432/postgres"
});
const queue = new PQueue({ concurrency: 1, autoStart: false });

app = express();

cron.schedule("30 0-23 * * *", () => {
  (async () => {
    const client = await pool.connect();

    try {
      const res = await client.query("SELECT * FROM url");
      const urls = res.rows;

      urls.map(async url => {
        if (!url.link) {
          return false;
        }

        await queue.add(() => generate(url));
      });

      console.log(queue.size);
      console.log(queue.pending);

      await queue.start();
      await queue.onEmpty();
    } finally {
      client.release();
    }
  })().catch(e => console.log(e.stack));
});

app.listen("3001");
