# Jenkins CI/CD Setup

This project includes a `Jenkinsfile` for a Windows Jenkins agent.

## Requirements

Install these on the Jenkins agent:

- Git
- Node.js 22+
- Docker Desktop or Docker Engine
- Jenkins Pipeline plugin

## Jenkins Job Setup

1. Create a new Jenkins Pipeline job.
2. Choose **Pipeline script from SCM**.
3. SCM: Git.
4. Repository URL:

```text
https://github.com/rishad3855/kerala-ayalkootam-manager.git
```

5. Branch:

```text
main
```

6. Script Path:

```text
Jenkinsfile
```

## Environment Variables

Add these in Jenkins job environment or Jenkins global credentials/settings:

```text
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam
JWT_SECRET=change-this-secret
CLIENT_URL=http://localhost:5000
```

Optional local deployment:

```text
DEPLOY_LOCAL=true
```

Optional Docker registry push:

```text
DOCKER_REGISTRY=registry.example.com
```

If using registry push, create Jenkins credentials:

```text
ID: docker-registry-credentials
Type: Username with password
```

## Pipeline Stages

1. Checkout code
2. Install backend dependencies
3. Install frontend dependencies
4. Backend JavaScript syntax check
5. Frontend production build
6. Docker image build
7. Optional Docker image push
8. Optional local Docker container deployment

## Manual Docker Run

```bash
docker run -d --name kerala-ayalkootam-manager \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI="mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam" \
  -e JWT_SECRET="change-this-secret" \
  -e CLIENT_URL="http://localhost:5000" \
  kerala-ayalkootam-manager:latest
```
