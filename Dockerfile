FROM node:10.8.0

RUN mkdir /cron-lighthouse-app

WORKDIR /cron-lighthouse-app

ENV PATH /cron-lighthouse-app/node_modules/.bin:$PATH

COPY package.json /cron-lighthouse-app/package.json

RUN yarn install

CMD ["yarn", "dev"]
