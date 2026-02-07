# STAGE 1: Build
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# STAGE 2: Serve
FROM nginx:alpine
# Kopiraj buildovane fajlove iz prethodnog stage-a u Nginx folder
COPY --from=build /app/dist/researchers-angular/browser /usr/share/nginx/html
# Kopiraj opcioni nginx config ako ga imaš (za routing)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
