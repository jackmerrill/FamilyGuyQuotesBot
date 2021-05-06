FROM node:alpine

WORKDIR /usr/src/bot

COPY package*.json ./

RUN npm install

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
