FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Em Docker o frontend fala com a API pelo mesmo host via proxy do Nginx (URLs relativas),
# então VITE_API_URL fica vazio de propósito — veja nginx.conf.
ENV VITE_API_URL=""
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
