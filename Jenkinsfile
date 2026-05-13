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
    APP_PORT = '80'
    CONTAINER_PORT = '5000'
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
        sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .'
      }
    }

    stage('Deploy on EC2') {
      steps {
        withCredentials([
          string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
          string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
        ]) {
          sh '''
            docker stop ${APP_NAME} || true
            docker rm ${APP_NAME} || true
            docker run -d \
              --name ${APP_NAME} \
              --restart unless-stopped \
              -p ${APP_PORT}:${CONTAINER_PORT} \
              -e NODE_ENV=production \
              -e PORT=${CONTAINER_PORT} \
              -e MONGO_URI="${MONGO_URI}" \
              -e JWT_SECRET="${JWT_SECRET}" \
              -e CLIENT_URL="${CLIENT_URL:-http://localhost}" \
              ${IMAGE_NAME}:latest
          '''
        }
      }
    }

    stage('Docker Push Optional') {
      when {
        expression { return env.DOCKER_REGISTRY?.trim() }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USER" --password-stdin
            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
            docker tag ${IMAGE_NAME}:latest ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
            docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
            docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
          '''
        }
      }
    }
  }

  post {
    success {
      echo "EC2 deployment completed successfully for ${env.APP_NAME}"
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
