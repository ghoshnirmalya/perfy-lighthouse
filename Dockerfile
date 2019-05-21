FROM mhart/alpine-node:11.1.0

RUN mkdir /cron-lighthouse-app

WORKDIR /cron-lighthouse-app

COPY package.json /cron-lighthouse-app/package.json

RUN yarn install

CMD ["yarn", "dev"]
