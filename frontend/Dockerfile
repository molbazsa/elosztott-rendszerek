FROM node:23-alpine

ARG DKR_UID=123000
ARG DKR_GID=123999

USER ${DKR_UID}:${DKR_GID}

WORKDIR /frontend
CMD ["/bin/sh", "-c", "npm install && npm run dev -- --host '0.0.0.0' --port '8080'"]
