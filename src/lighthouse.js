require("dotenv").config();

const chromeLauncher = require("chrome-launcher");
const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const request = require("request");
const util = require("util");
const fs = require("fs");
const { Pool } = require("pg");
const authenticateAndVisitURL = require("./lib/authenticate-and-visit-url");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const generate = async (
  url,
  login_url,
  username_or_email_address_field_selector,
  username_or_email_address_field_value,
  password_field_selector,
  password_field_value,
  submit_button_selector
) => {
  /**
   * Default configs
   */
  const delay = 5000;
  const loginURL = "https://bulk.hulk.ehqstag.com/login";
  const opts = {
    chromeFlags: ["--headless", "--no-sandbox"],
    logLevel: "info",
    output: "json"
  };

  /**
   * Launch chrome using chrome-launcher.
   */
  const chrome = await chromeLauncher.launch(opts);

  opts.port = chrome.port;

  /**
   * Connect to it using puppeteer.connect()
   */
  const resp = await util.promisify(request)(
    `http://localhost:${opts.port}/json/version`
  );
  const { webSocketDebuggerUrl } = JSON.parse(resp.body);
  let browser;

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl
    });
  } catch (error) {
    console.log(error);
  }

  let page;

  try {
    page = await browser.newPage();
  } catch (error) {
    console.log(error);
  }

  try {
    if (login_url) {
      /**
       * Perform authentication and visit the URL
       */
      await authenticateAndVisitURL(
        page,
        delay,
        url.link,
        login_url,
        username_or_email_address_field_selector,
        username_or_email_address_field_value,
        password_field_selector,
        password_field_value,
        submit_button_selector
      );
    }

    /**
     * Run Lighthouse
     */
    let results;

    try {
      results = await lighthouse(url.link, opts, null);

      (async () => {
        const client = await pool.connect();

        try {
          await client.query("BEGIN");
          await client.query(
            "INSERT INTO audit(user_agent,environment, lighthouse_version, fetch_time, requested_url, final_url, audits, config_settings, categories, category_groups, timing, i18n, url_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id",
            [
              results.lhr.userAgent,
              results.lhr.environment,
              results.lhr.lighthouseVersion,
              results.lhr.fetchTime,
              results.lhr.requestedUrl,
              results.lhr.finalUrl,
              results.lhr.audits,
              results.lhr.configSettings,
              results.lhr.categories,
              results.lhr.categoryGroups,
              results.lhr.timing,
              results.lhr.i18n,
              url.id
            ]
          );

          await client.query("COMMIT");

          await client.release();
        } catch (e) {
          await client.query("ROLLBACK");

          throw e;
        }
      })().catch(e => console.error(e.stack));
      await browser.disconnect();
      await chrome.kill();
    } catch (error) {
      await browser.disconnect();
      await chrome.kill();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = generate;
