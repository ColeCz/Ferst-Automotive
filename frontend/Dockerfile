FROM node:22

WORKDIR /app-home

ENV PATH /app-home/node_modules/.bin:$PATH

COPY package.json package-lock.json ./

RUN yarn install

COPY ./src ./src
COPY ./public ./public

ENV WATCHPACK_POLLING=true

CMD ["npm", "start"]