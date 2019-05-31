const cron = require("node-cron");
const express = require("express");
const { MongoClient } = require("mongodb");
const PQueue = require("p-queue");

const generate = require("./lighthouse");
const uri = "mongodb://db:27017/hub";
const queue = new PQueue({ concurrency: 1, autoStart: false });

app = express();

cron.schedule("30 0-23 * * *", () => {
  MongoClient.connect(uri, (err, client) => {
    if (err) throw err;

    const db = client.db("hub");

    db.collection("url")
      .find()
      .toArray(async (err, urls) => {
        if (err) throw err;

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
      });
  });
});

app.listen("3001");
