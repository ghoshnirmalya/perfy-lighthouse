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

    db.collection("project")
      .find()
      .toArray(async (err, projects) => {
        if (err) throw err;

        projects.map(project => {
          if (!project.urls) {
            return false;
          }

          project.urls.map(async url => {
            await queue.add(() => generate(url, project.name));
          });
        });

        console.log(queue.size);
        console.log(queue.pending);

        await queue.start();
        console.log("############ STARTED ############");

        await queue.onEmpty();
        console.log("############ FINISHED ############");
      });
  });
});

app.listen("3001");
