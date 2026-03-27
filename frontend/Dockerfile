# ──────────────────────────────────────────────
# Stage: development (hot-reload via volume mount)
# ──────────────────────────────────────────────
FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "500"]

# ──────────────────────────────────────────────
# Stage: build
# ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# ──────────────────────────────────────────────
# Stage: production (nginx)
# ──────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist/dufief/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
