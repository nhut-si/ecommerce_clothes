FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN npm ci --silent

# Build-time environment for Vite
ARG VITE_BACKEND_URL
ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

COPY . .

RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Lightweight static server
RUN npm i -g serve

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"] 
