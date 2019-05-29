const chromeLauncher = require("chrome-launcher");
const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const request = require("request");
const util = require("util");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const uri = "mongodb://db:27017/hub";

const generate = async (url, projectName) => {
  console.log(
    `LH Job started for url: ${url} belonging to project: ${projectName}`
  );

  const opts = {
    chromeFlags: ["--headless", "--no-sandbox"],
    logLevel: "info",
    output: "json"
  };

  // Launch chrome using chrome-launcher.
  const chrome = await chromeLauncher.launch(opts);

  opts.port = chrome.port;

  // Connect to it using puppeteer.connect().
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
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "load"
  });

  // Run Lighthouse.
  const results = await lighthouse(url, opts, null);

  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;

    const db = client.db("hub");

    db.collection("audit").insert({
      userAgent: results.lhr.userAgent,
      environment: results.lhr.environment,
      lighthouseVersion: results.lhr.lighthouseVersion,
      fetchTime: results.lhr.fetchTime,
      requestedUrl: results.lhr.requestedUrl,
      finalUrl: results.lhr.finalUrl,
      audits: results.lhr.audits,
      configSettings: results.lhr.configSettings,
      categories: results.lhr.categories,
      categoryGroups: results.lhr.categoryGroups,
      timing: results.lhr.timing,
      i18n: results.lhr.i18n
    });
  });

  await browser.disconnect();
  await chrome.kill();

  console.log(
    `LH Job finished for url: ${url} belonging to project: ${projectName}`
  );
};

module.exports = generate;
