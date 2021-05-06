FROM node:alpine

WORKDIR /usr/src/bot

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]