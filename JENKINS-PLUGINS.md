# Jenkins Plugins Checklist

Use this checklist for running the Kerala Ayalkootam Manager CI/CD pipeline on Jenkins in an EC2 instance.

## Required Jenkins Plugins

Install these first:

```text
Pipeline
Git
GitHub
GitHub Branch Source
Credentials
Credentials Binding
Docker Pipeline
Workspace Cleanup
Timestamper
```

## Recommended Jenkins Plugins

These make the pipeline easier to view and manage:

```text
Pipeline: Stage View
Blue Ocean
SSH Agent
NodeJS Plugin
Environment Injector
```

## Docker / Registry Plugins

Install these if you plan to push Docker images to Docker Hub, ECR, or another registry:

```text
Docker Commons
Docker API
CloudBees Docker Build and Publish
```

## GitHub Webhook Plugins

Install these if you want Jenkins to run automatically when code is pushed to GitHub:

```text
GitHub Integration
GitHub API Plugin
```

## Minimum Plugin Set for This Project

If you want the shortest working list, install:

```text
Pipeline
Git
GitHub
Credentials Binding
Docker Pipeline
Timestamper
Workspace Cleanup
```

## EC2 Server Requirements

These are not Jenkins plugins. Install them on the EC2 machine:

```bash
sudo apt update
sudo apt install -y git docker.io fontconfig openjdk-17-jre
```

Install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Allow Jenkins to run Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

If Docker permission still fails:

```bash
sudo reboot
```

## Jenkins Credentials Needed

Create these credentials in Jenkins:

### MongoDB Atlas URI

```text
Kind: Secret text
ID: mongo-uri
Secret: mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam
```

### JWT Secret

```text
Kind: Secret text
ID: jwt-secret
Secret: your-long-random-secret
```

Optional Docker registry credentials:

```text
Kind: Username with password
ID: docker-registry-credentials
```

## Security Group Ports

Open these inbound ports in the EC2 security group:

```text
22    SSH
80    Application
8080  Jenkins
```
