FROM node:19-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN mkdir /app/resources

RUN chown node:node /app/resources

USER node

CMD ["npm", "run", "start:prod"]