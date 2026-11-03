# ADMIN DOCKERFILE (Vite + Nginx)

# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app
 
COPY package*.json ./
RUN npm ci
 
COPY . ./
# Exécute la commande de build Vite, qui crée le dossier 'dist'
RUN npm run build
 
# ---------- RUN (Nginx) ----------
FROM nginx:1.27-alpine AS runtime
 
# 1. Configuration Nginx
# Cette étape nécessite que le fichier nginx.conf soit dans le même dossier que ce Dockerfile
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/site.conf
 
# 2. Fichiers statiques : Copier le dossier de sortie 'dist' de Vite
# C'est la correction finale pour cette erreur.
COPY --from=build /app/dist /usr/share/nginx/html
 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]