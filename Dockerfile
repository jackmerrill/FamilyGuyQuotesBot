FROM tarampampam/node:15-alpine

WORKDIR /usr/src/bot

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]