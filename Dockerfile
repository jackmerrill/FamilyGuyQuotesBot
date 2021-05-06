FROM node:alpine

WORKDIR /usr/src/bot

COPY package*.json ./

RUN npm install -g typescript

RUN npm install @types/node

RUN npm ci --only=production

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
