FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm install
COPY . .
ARG VITE_SOCKET_URL=http://localhost:3000
ARG VITE_DEMO_MODE=false
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build -w apps/web

FROM nginx:1.27-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
