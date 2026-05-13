# Docker Setup

This Dockerfile expects the original project structure:

```text
backend/
frontend/
package.json
Dockerfile
.dockerignore
```

Build the image:

```bash
docker build -t kerala-ayalkootam-manager .
```

Run the container with MongoDB Atlas:

```bash
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI="mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam" \
  -e JWT_SECRET="change-this-secret" \
  -e CLIENT_URL="http://localhost:5000" \
  kerala-ayalkootam-manager
```

Open:

```text
http://localhost:5000
```

Important: the Express backend must serve `backend/public` in production. If your current `server.js` does not do that yet, add static serving before deployment.
