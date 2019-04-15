# use latest version of node
FROM mhart/alpine-node:latest

# set working directory
WORKDIR /dist

# bundle source code
COPY . .

# expose port 3001
EXPOSE 3001

# install packages
RUN yarn install

# start app with yarn
CMD ["yarn", "start"]
