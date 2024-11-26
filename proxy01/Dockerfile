FROM nginxinc/nginx-unprivileged

COPY --chown=nginx:nginx proxy01/config/main.conf /etc/nginx/conf.d/main.conf
COPY --chown=nginx:nginx frontend/ /frontend/

RUN rm /etc/nginx/conf.d/default.conf
