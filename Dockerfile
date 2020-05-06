FROM node:12-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn --frozen-lockfile

COPY .next/ /app/.next/
COPY public/ /app/public/

USER node

CMD ["yarn", "start"]