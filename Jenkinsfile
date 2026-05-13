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
          bat 'npm ci'
        }
      }
    }

    stage('Install Frontend') {
      steps {
        dir('frontend') {
          bat 'npm ci'
        }
      }
    }

    stage('Backend Syntax Check') {
      steps {
        dir('backend') {
          bat 'for /R src %%f in (*.js) do node --check "%%f"'
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          bat 'npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest .'
      }
    }

    stage('Docker Push') {
      when {
        expression { return env.DOCKER_REGISTRY?.trim() }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          bat 'echo %DOCKER_PASS% | docker login %DOCKER_REGISTRY% -u %DOCKER_USER% --password-stdin'
          bat 'docker tag %IMAGE_NAME%:%IMAGE_TAG% %DOCKER_REGISTRY%/%IMAGE_NAME%:%IMAGE_TAG%'
          bat 'docker tag %IMAGE_NAME%:latest %DOCKER_REGISTRY%/%IMAGE_NAME%:latest'
          bat 'docker push %DOCKER_REGISTRY%/%IMAGE_NAME%:%IMAGE_TAG%'
          bat 'docker push %DOCKER_REGISTRY%/%IMAGE_NAME%:latest'
        }
      }
    }

    stage('Deploy Local Container') {
      when {
        expression { return env.DEPLOY_LOCAL == 'true' }
      }
      steps {
        bat 'docker stop %APP_NAME% || exit 0'
        bat 'docker rm %APP_NAME% || exit 0'
        bat 'docker run -d --name %APP_NAME% -p 5000:5000 -e PORT=5000 -e MONGO_URI="%MONGO_URI%" -e JWT_SECRET="%JWT_SECRET%" -e CLIENT_URL="%CLIENT_URL%" %IMAGE_NAME%:latest'
      }
    }
  }

  post {
    success {
      echo "Pipeline completed successfully for ${env.APP_NAME}"
    }
    failure {
      echo "Pipeline failed. Check the stage logs above."
    }
    always {
      archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
    }
  }
}
