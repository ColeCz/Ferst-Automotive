FROM node:22 as build-step

WORKDIR /app-home

ENV PATH /app-home/node_modules/.bin:$PATH

COPY package.json package-lock.json ./
COPY ./src ./src
COPY ./public ./public

RUN yarn install
RUN yarn build


FROM nginx:stable

COPY --from=build-step /app-home/build /usr/share/nginx/html
COPY deployment/nginx.default.conf /etc/nginx/conf.d/default.conf