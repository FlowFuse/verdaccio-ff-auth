FROM node:lts-alpine AS builder

WORKDIR /usr/src
ADD . /usr/src
RUN npm install && npm run build

FROM verdaccio/verdaccio:6.0

COPY --chown=$VERDACCIO_USER_UID:root --from=builder \
  /usr/src \
  /usr/local/lib/node_modules/verdaccio-flowfuse-auth