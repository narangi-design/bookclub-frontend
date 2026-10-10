FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* vars into the bundle at build time, not at container
# start time — pass the API's browser-reachable URL as a build arg.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Bot @username for Telegram login (redirect + Login Widget fallback).
# Unset/empty hides Telegram login on LoginPage.tsx, leaving only the
# password form.
ARG VITE_TELEGRAM_BOT_USERNAME=
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME

# Public bot id (not a secret), needed for the redirect-based Telegram login
# (oauth.telegram.org) in LoginPage.tsx — unset falls back to the Login
# Widget popup only.
ARG VITE_TELEGRAM_BOT_ID=
ENV VITE_TELEGRAM_BOT_ID=$VITE_TELEGRAM_BOT_ID

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
