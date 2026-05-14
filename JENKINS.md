# Jenkins CI/CD Setup for Kubernetes on EC2

This project now deploys to Kubernetes from Jenkins running on an Ubuntu EC2 instance.

## Deployment Flow

1. Jenkins checks out the GitHub repo.
2. Installs backend and frontend dependencies.
3. Runs backend JavaScript syntax checks.
4. Builds the frontend.
5. Builds a Docker image.
6. Pushes the Docker image to a registry.
7. Creates/updates Kubernetes secrets.
8. Applies Kubernetes deployment and service manifests.
9. Waits for Kubernetes rollout to complete.

## EC2 Requirements

Install Git, Node.js, Docker, Java, Jenkins, and kubectl on the EC2 instance.

```bash
sudo apt update
sudo apt install -y git docker.io fontconfig openjdk-17-jre
sudo systemctl enable docker
sudo systemctl start docker
```

Install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Install kubectl:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl
kubectl version --client
```

Allow Jenkins to use Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

If Docker permission still fails:

```bash
sudo reboot
```

## Kubernetes Cluster

You need a working Kubernetes cluster reachable from Jenkins. This can be:

- Minikube on EC2
- kubeadm cluster
- Amazon EKS
- Any external Kubernetes cluster

Jenkins must have a valid kubeconfig for that cluster.

## AWS Security Group

For Jenkins and NodePort testing, open:

```text
22     SSH
8080   Jenkins
30080  Kubernetes NodePort app access
```

The app will be reachable at:

```text
http://YOUR_EC2_PUBLIC_IP:30080
```

If you later use an Ingress or LoadBalancer, expose port `80` instead.

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

### Docker Registry Credentials

```text
Kind: Username with password
ID: docker-registry-credentials
Username: your Docker registry username
Password: your Docker registry token/password
```

### Kubernetes Kubeconfig

```text
Kind: Secret file
ID: kubeconfig
File: your kubeconfig file
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

Set these in the Jenkins job:

```text
DOCKER_REGISTRY=docker.io/YOUR_DOCKERHUB_USERNAME
CLIENT_URL=http://YOUR_EC2_PUBLIC_IP:30080
K8S_NAMESPACE=ayalkootam
```

For Amazon ECR, `DOCKER_REGISTRY` will look different, for example:

```text
DOCKER_REGISTRY=123456789012.dkr.ecr.ap-south-1.amazonaws.com
```

## Kubernetes Files

The repo includes:

```text
k8s/deployment.yaml
k8s/service.yaml
```

The Jenkinsfile replaces `IMAGE_PLACEHOLDER` with the pushed Docker image tag during deployment.

## MongoDB Atlas

In MongoDB Atlas Network Access, allow your Kubernetes node/EC2 public IP.

For testing only:

```text
0.0.0.0/0
```

## Useful Commands

Check pods:

```bash
kubectl -n ayalkootam get pods
```

Check service:

```bash
kubectl -n ayalkootam get svc
```

View app logs:

```bash
kubectl -n ayalkootam logs deployment/kerala-ayalkootam-manager
```

Restart deployment:

```bash
kubectl -n ayalkootam rollout restart deployment/kerala-ayalkootam-manager
```
