# Production Dockerfile for the Kerala Ayalkootam Manager full-stack app.
# It builds the Vite frontend, copies it into the Express backend, and runs one Node server.

FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-build /app/backend ./backend
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]
