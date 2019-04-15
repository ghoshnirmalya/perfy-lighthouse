const cron = require("node-cron");
const express = require("express");

const generate = require("./lighthouse");

app = express();

cron.schedule("* * * * *", async () => {
  console.log("---------------------");
  console.log("Cron Job started");

  await generate();

  console.log("Cron Job finished");
  console.log("---------------------");
});

app.listen("3001");
