# ---------- BUILD ----------
  FROM node:20-alpine AS build
  WORKDIR /app
  
  COPY package*.json ./
  RUN npm ci
  
  COPY . ./
  RUN npm run build && npm run build:ssr
  
  # ---------- RUN (Nginx) ----------
  FROM nginx:1.27-alpine AS runtime
  RUN rm -f /etc/nginx/conf.d/default.conf
  COPY nginx.conf /etc/nginx/conf.d/site.conf
  
  # Fichiers statiques
  COPY --from=build /app/build /usr/share/nginx/html
  
  # On expose le bundle SSR pour l’image back
  COPY --from=build /app/build-ssr /opt/ssr
  
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  