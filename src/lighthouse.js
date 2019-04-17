const chromeLauncher = require("chrome-launcher");
const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const request = require("request");
const util = require("util");
const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator");
const fs = require("fs");

const generate = async (url, projectName) => {
  console.log("---------------------");
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
    console.log;
  }
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "load"
  });

  // Run Lighthouse.
  const results = await lighthouse(url, opts, null);
  const html = ReportGenerator.generateReport(results.lhr, "html");
  const directoryPath = `./reports/${projectName}`;

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  // Save the html in a file
  fs.writeFile(`${directoryPath}/${new Date()}.html`, html, err => {
    if (err) {
      return console.error(err);
    }

    console.info("The file was saved!");
  });

  await browser.disconnect();
  await chrome.kill();

  console.log(
    `LH Job finished for url: ${url} belonging to project: ${projectName}`
  );
  console.log("---------------------");
};

module.exports = generate;
