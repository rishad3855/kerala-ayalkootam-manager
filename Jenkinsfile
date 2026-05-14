pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME = 'kerala-ayalkootam-manager'
    IMAGE_NAME = 'kerala-ayalkootam-manager'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    DOCKER_BUILDKIT = '1'
    K8S_NAMESPACE = 'ayalkootam'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Backend') {
      steps {
        dir('backend') {
          sh 'npm ci'
        }
      }
    }

    stage('Install Frontend') {
      steps {
        dir('frontend') {
          sh 'npm ci'
        }
      }
    }

    stage('Backend Syntax Check') {
      steps {
        dir('backend') {
          sh 'find src -name "*.js" -print0 | xargs -0 -n1 node --check'
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          sh 'VITE_API_URL=/api npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          test -n "$DOCKER_REGISTRY" || (echo "DOCKER_REGISTRY is required for Kubernetes deploy" && exit 1)
          docker build \
            -t ${IMAGE_NAME}:${IMAGE_TAG} \
            -t ${IMAGE_NAME}:latest \
            -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
            -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest \
            .
        '''
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USER" --password-stdin
            docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
            docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([
          file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG'),
          string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
          string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
        ]) {
          sh '''
            export FULL_IMAGE=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
            kubectl create namespace ${K8S_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

            kubectl -n ${K8S_NAMESPACE} create secret generic ayalkootam-secrets \
              --from-literal=MONGO_URI="${MONGO_URI}" \
              --from-literal=JWT_SECRET="${JWT_SECRET}" \
              --dry-run=client -o yaml | kubectl apply -f -

            sed \
              -e "s#IMAGE_PLACEHOLDER#${FULL_IMAGE}#g" \
              -e "s#CLIENT_URL_PLACEHOLDER#${CLIENT_URL:-http://localhost}#g" \
              k8s/deployment.yaml | kubectl -n ${K8S_NAMESPACE} apply -f -

            kubectl -n ${K8S_NAMESPACE} apply -f k8s/service.yaml
            kubectl -n ${K8S_NAMESPACE} rollout status deployment/${APP_NAME} --timeout=180s
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Kubernetes deployment completed successfully for ${env.APP_NAME}"
    }
    failure {
      echo 'Pipeline failed. Check the stage logs above.'
    }
    always {
      sh 'docker image prune -f || true'
      archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
    }
  }
}
