FROM arm32v7/node:8-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

RUN npm run build

ENV CONFIG_DIR="/config"
ENV NODE_ENV=production

CMD [ "node", "/usr/src/app/index.js" ]

VOLUME /config
