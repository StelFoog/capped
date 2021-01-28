FROM node:14
WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 8080

CMD ["npm", "run", "server"]
