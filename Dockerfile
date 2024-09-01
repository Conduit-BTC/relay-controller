FROM caddy:alpine

RUN apk update && apk add --no-cache nodejs yarn

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

ARG BUILD_COMMAND=build
RUN yarn ${BUILD_COMMAND}

ENV SERVE_DIR=/app/dist

COPY ./Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
