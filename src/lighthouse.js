const chromeLauncher = require("chrome-launcher");
const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const request = require("request");
const util = require("util");
const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator");
const fs = require("fs");

const generate = async () => {
  const URL = "https://nirmalyaghosh.com/";
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
  const browser = await puppeteer.connect({
    browserWSEndpoint: webSocketDebuggerUrl
  });
  const page = await browser.newPage();

  await page.goto(URL, {
    waitUntil: "load"
  });

  // Run Lighthouse.
  const results = await lighthouse(URL, opts, null);
  const html = ReportGenerator.generateReport(results.lhr, "html");

  // Save the html in a file
  fs.writeFile(`./reports/${new Date()}.html`, html, function(err) {
    if (err) {
      return console.error(err);
    }

    console.info("The file was saved!");
  });

  await browser.disconnect();
  await chrome.kill();
};

module.exports = generate;
