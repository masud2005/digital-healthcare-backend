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

    LIVE_DOMAIN = 'prod.weightlossmdcherrycreek.com'
    PRE_DOMAIN = 'pre.weightlossmdcherrycreek.com'

    SERVER_DIR = '/home/admin/projects/doc-backend'
    COMPOSE_FILE = 'docker-compose.release.yaml'
    RELEASE_DIR = './releases'
  }

  stages {
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

    stage('Quality Gate') {
      when {
        anyOf {
          branch 'dev'
          branch 'master'
          branch 'main'
        }
      }
      steps {
        sh '''
          set -eu
          npm install --force
          npm run prisma:validate
          npm run prisma:generate
          npm run build
        '''
      }
    }

    stage('Build Image') {
      when {
        anyOf {
          branch 'dev'
          branch 'master'
        }
      }
      steps {
        sh '''
          set -eu

          docker build \
            --pull \
            -t "$CANDIDATE_IMAGE" \
            -t "$LATEST_IMAGE" \
            .
        '''
      }
    }

    stage('Push Image') {
      when {
        anyOf {
          branch 'dev'
          branch 'master'
        }
      }
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

            printf '%s' "$DOCKER_PASSWORD" | docker login \
              -u "$DOCKER_USERNAME" \
              --password-stdin

            docker push "$CANDIDATE_IMAGE"
            docker push "$LATEST_IMAGE"

            docker logout
          '''
        }
      }
    }

    stage('Sync Release Files') {
      when {
        anyOf {
          branch 'master'
          branch 'main'
        }
      }
      steps {
        withCredentials([
          file(credentialsId: 'doc-backend-env-production', variable: 'ENV_PRODUCTION_FILE'),
          file(credentialsId: 'doc-backend-env-prerelease', variable: 'ENV_PRERELEASE_FILE')
        ]) {
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu

              SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
              SCP="scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

              $SSH "$VPS_USER@$VPS_HOST" "mkdir -p '$SERVER_DIR/scripts' '$SERVER_DIR/releases'"

              $SCP "$COMPOSE_FILE" "$VPS_USER@$VPS_HOST:$SERVER_DIR/$COMPOSE_FILE"
              $SCP Caddyfile "$VPS_USER@$VPS_HOST:$SERVER_DIR/Caddyfile"
              $SCP scripts/clone-db-for-prerelease.sh "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/clone-db-for-prerelease.sh"
              $SCP scripts/deploy-prerelease.sh "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/deploy-prerelease.sh"
              $SCP scripts/promote-production.sh "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/promote-production.sh"
              $SCP scripts/rollback-production.sh "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/rollback-production.sh"
              $SCP scripts/backup-postgres.sh "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/backup-postgres.sh"
              $SCP "$ENV_PRODUCTION_FILE" "$VPS_USER@$VPS_HOST:$SERVER_DIR/.env.production"
              $SCP "$ENV_PRERELEASE_FILE" "$VPS_USER@$VPS_HOST:$SERVER_DIR/.env.prerelease"

              $SSH "$VPS_USER@$VPS_HOST" "chmod +x '$SERVER_DIR'/scripts/*.sh && chmod 600 '$SERVER_DIR'/.env.production '$SERVER_DIR'/.env.prerelease"
            '''
          }
        }
      }
    }

    stage('Deploy Pre-Release') {
      when {
        branch 'master'
      }
      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu

            SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH "$VPS_USER@$VPS_HOST" "
              set -eu
              cd '$SERVER_DIR'

              export COMPOSE_FILE='$COMPOSE_FILE'
              export PRE_IMAGE='$CANDIDATE_IMAGE'
              export PRE_DOMAIN='$PRE_DOMAIN'
              export RELEASE_DIR='$RELEASE_DIR'

              sh scripts/deploy-prerelease.sh
            "
          '''
        }
      }
    }

    stage('Promote Production') {
      when {
        branch 'main'
      }
      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu

            SSH="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH "$VPS_USER@$VPS_HOST" "
              set -eu
              cd '$SERVER_DIR'

              export COMPOSE_FILE='$COMPOSE_FILE'
              export LIVE_DOMAIN='$LIVE_DOMAIN'
              export RELEASE_DIR='$RELEASE_DIR'

              sh scripts/promote-production.sh
            "
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
      script {
        if (env.BRANCH_NAME == 'dev') {
          echo "Docker image pushed: ${env.CANDIDATE_IMAGE}"
        }
        if (env.BRANCH_NAME == 'master') {
          echo "Prerelease healthy: https://${PRE_DOMAIN}/api/health"
          echo "Prerelease image marked green: ${env.CANDIDATE_IMAGE}"
        }
        if (env.BRANCH_NAME == 'main') {
          echo "Production healthy: https://${LIVE_DOMAIN}/api/health"
        }
      }
    }

    failure {
      echo "Pipeline failed. Production should remain on the previous healthy color or rollback script will run when public health fails."
    }
  }
}
