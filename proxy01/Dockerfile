# STAGE frontend-build
FROM node:23-alpine AS frontend-build
USER node

COPY --chown=node:node frontend/ /frontend/

WORKDIR /frontend
RUN npm install
RUN npm run build


# STAGE nginx
FROM nginxinc/nginx-unprivileged AS nginx

COPY --chown=nginx:nginx proxy01/config/main.conf /etc/nginx/conf.d/main.conf
COPY --from=frontend-build --chown=nginx:nginx /frontend/dist/ /frontend/

USER root
RUN rm /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
RUN rm /etc/nginx/conf.d/default.conf

USER nginx
