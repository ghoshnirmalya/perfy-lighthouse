const cron = require("node-cron");
const express = require("express");

app = express();

cron.schedule("* * * * *", function() {
  console.log("---------------------");
  console.log("Running Cron Job");
});

app.listen("3001");
