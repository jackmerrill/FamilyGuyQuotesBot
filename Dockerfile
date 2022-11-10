FROM node:18-alpine

WORKDIR /usr/src/bot

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
