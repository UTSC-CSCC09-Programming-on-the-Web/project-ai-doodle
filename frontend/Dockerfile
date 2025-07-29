# Step 1: Build the app
FROM node:20-slim AS build

WORKDIR /app
COPY . .
RUN npm install

ARG VITE_API_BASE
ARG VITE_BACKEND_URL
ARG VITE_OPENAI_API_KEY
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}

RUN npm run build

# Step 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
