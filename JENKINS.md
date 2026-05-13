# Jenkins CI/CD Setup for EC2

This project includes a `Jenkinsfile` designed for Jenkins running on an Ubuntu EC2 instance.

## EC2 Requirements

Install Git, Node.js, Docker, and Jenkins on the EC2 instance.

```bash
sudo apt update
sudo apt install -y git docker.io fontconfig openjdk-17-jre
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

Install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Allow Jenkins to use Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

If Docker permission still fails, reboot EC2:

```bash
sudo reboot
```

## AWS Security Group

Open inbound rules:

```text
22   SSH
80   HTTP
8080 Jenkins
```

After setup, your app will run on:

```text
http://YOUR_EC2_PUBLIC_IP
```

Jenkins usually runs on:

```text
http://YOUR_EC2_PUBLIC_IP:8080
```

## Jenkins Credentials

Create these Jenkins credentials:

### MongoDB URI

```text
Kind: Secret text
ID: mongo-uri
Secret: mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam
```

### JWT Secret

```text
Kind: Secret text
ID: jwt-secret
Secret: any-long-random-secret
```

Optional Docker registry credentials:

```text
Kind: Username with password
ID: docker-registry-credentials
```

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

## Jenkins Environment Variables

In the Jenkins job configuration, add:

```text
CLIENT_URL=http://YOUR_EC2_PUBLIC_IP
```

Optional:

```text
APP_PORT=80
CONTAINER_PORT=5000
DOCKER_REGISTRY=your-registry.example.com
```

## Pipeline Stages

1. Checkout code
2. Install backend dependencies
3. Install frontend dependencies
4. Backend JavaScript syntax check
5. Frontend production build with `/api`
6. Docker image build
7. Stop old app container
8. Start new app container on EC2 port 80
9. Optional Docker registry push

## MongoDB Atlas

In MongoDB Atlas Network Access, allow your EC2 public IP.

For testing only, you can temporarily allow:

```text
0.0.0.0/0
```

## Manual Docker Run

```bash
docker run -d --name kerala-ayalkootam-manager \
  --restart unless-stopped \
  -p 80:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGO_URI="mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam" \
  -e JWT_SECRET="change-this-secret" \
  -e CLIENT_URL="http://YOUR_EC2_PUBLIC_IP" \
  kerala-ayalkootam-manager:latest
```
