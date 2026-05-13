# Production Dockerfile for EC2.
# Builds the Vite frontend, copies it into the Express backend, and runs one Node server.

FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api
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
ENV PORT=5000
COPY --from=backend-build /app/backend ./backend
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]
