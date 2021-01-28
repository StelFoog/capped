FROM node:14
WORKDIR /app

COPY package.json ./

RUN yarn install

COPY . .

EXPOSE 8080

CMD ["node", "server/server.js"]
