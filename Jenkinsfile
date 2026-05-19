pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 60, unit: 'MINUTES')
  }

  environment {
    APP_NAME = 'doc-backend'
    DOCKER_IMAGE = 'softvence/doc-backend'

    DOCKER_CREDENTIALS_ID = 'dockerhub-creds'
    VPS_SSH_CREDENTIALS_ID = 'doc-vps-ssh'

    VPS_HOST = '13.214.29.147'
    VPS_USER = 'admin'

    LIVE_DOMAIN = 'doco-prod.duckdns.org'
    PRE_DOMAIN  = 'doco-pre.duckdns.org'

    SERVER_DIR = "/home/admin/projects/doc-backend"
    COMPOSE_FILE = 'docker-compose.release.yaml'
  }

  stages {

    // =========================
    // Checkout + Build metadata
    // =========================
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_SHORT_SHA = sh(
            script: 'git rev-parse --short=12 HEAD',
            returnStdout: true
          ).trim()

          env.IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
            .replaceAll('[^A-Za-z0-9_.-]', '-')

          env.CANDIDATE_IMAGE = "${env.DOCKER_IMAGE}:${env.IMAGE_TAG}"
          env.LATEST_IMAGE = "${env.DOCKER_IMAGE}:${env.BRANCH_NAME}"
        }
      }
    }

    // =========================
    // Build Docker Image
    // =========================
    stage('Build Image') {
      steps {
        sh '''
          set -eu

          echo "Building Docker image..."
          docker build \
            --pull \
            -t "$CANDIDATE_IMAGE" \
            -t "$LATEST_IMAGE" \
            .
        '''
      }
    }

    // =========================
    // Push Image
    // =========================
    stage('Push Image') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: "${DOCKER_CREDENTIALS_ID}",
            usernameVariable: 'DOCKER_USERNAME',
            passwordVariable: 'DOCKER_PASSWORD'
          )
        ]) {
          sh '''
            set -eu

            echo "Logging into Docker..."
            printf '%s' "$DOCKER_PASSWORD" | docker login \
              -u "$DOCKER_USERNAME" \
              --password-stdin

            echo "Pushing images..."
            docker push "$CANDIDATE_IMAGE"
            docker push "$LATEST_IMAGE"

            docker logout
          '''
        }
      }
    }

    // =========================
    // Deploy PRE (master branch)
    // =========================
    stage('Deploy Pre-Release') {
      when {
        branch 'master'
      }

      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu

            SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH $VPS_USER@$VPS_HOST "
              set -eu
              cd '$SERVER_DIR'

              export PRE_IMAGE='$CANDIDATE_IMAGE'
              export APP_IMAGE='$CANDIDATE_IMAGE'
              export PRE_DOMAIN='$PRE_DOMAIN'

              echo 'Starting prerelease stack...'

              docker compose -f '$COMPOSE_FILE' up -d db_pre
              docker compose -f '$COMPOSE_FILE' pull app_pre
              docker compose -f '$COMPOSE_FILE' up -d --no-deps app_pre caddy

              echo 'Done prerelease deploy'
              docker compose -f '$COMPOSE_FILE' ps
            "
          '''
        }
      }
    }

    // =========================
    // Verify PRE
    // =========================
    stage('Verify Pre-Release') {
      when {
        branch 'master'
      }

      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu

            SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH $VPS_USER@$VPS_HOST '
              set -eu

              i=1
              max=30

              while [ $i -le $max ]; do
                if curl -fsS "https://'"$PRE_DOMAIN"'/api/health" >/dev/null 2>&1; then
                  echo "PRE healthy"
                  exit 0
                fi

                echo "Waiting PRE health $i/$max"
                i=$((i + 1))
                sleep 5
              done

              echo "PRE failed health check"
              docker compose -f '"$COMPOSE_FILE"' logs --tail=200 app_pre
              exit 1
            '
          '''
        }
      }
    }

    // =========================
    // Deploy PRODUCTION (main branch)
    // =========================
    stage('Deploy Production') {
      when {
        branch 'main'
      }

      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu

            SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH $VPS_USER@$VPS_HOST "
              set -eu
              cd '$SERVER_DIR'

              export APP_IMAGE='$CANDIDATE_IMAGE'
              export LIVE_DOMAIN='$LIVE_DOMAIN'

              echo 'Deploying production...'

              docker compose -f '$COMPOSE_FILE' up -d db_live
              docker compose -f '$COMPOSE_FILE' pull app_live
              docker compose -f '$COMPOSE_FILE' up -d --no-deps app_live caddy

              echo 'Production deployed'
            "
          '''
        }
      }
    }

    // =========================
    // Verify PRODUCTION
    // =========================
    stage('Verify Production') {
      when {
        branch 'main'
      }

      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu

            SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH $VPS_USER@$VPS_HOST '
              set -eu

              i=1
              max=30

              while [ $i -le $max ]; do
                if curl -fsS "https://'"$LIVE_DOMAIN"'/api/health" >/dev/null 2>&1; then
                  echo "LIVE healthy"
                  exit 0
                fi

                echo "Waiting LIVE health $i/$max"
                i=$((i + 1))
                sleep 5
              done

              echo "LIVE failed health check"
              docker compose -f '"$COMPOSE_FILE"' logs --tail=200 app_live
              exit 1
            '
          '''
        }
      }
    }
  }

  post {
    always {
      echo "Pipeline finished for branch: ${env.BRANCH_NAME}"
    }

    success {
      echo "Build success: ${env.CANDIDATE_IMAGE}"
      echo "PRE: https://${PRE_DOMAIN}/api/health"
      echo "LIVE: https://${LIVE_DOMAIN}/api/health"
    }

    failure {
      echo "Pipeline failed. Previous stable containers remain running."
    }
  }
}