FROM node:19-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN chown node:node /app/resources

USER node

CMD ["npm", "run", "start:prod"]