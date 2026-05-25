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
    PRERELEASE_SOURCE_IMAGE = 'softvence/doc-backend:dev'

    DOCKER_CREDENTIALS_ID = 'dockerhub-creds'
    DEPLOY_SSH_CREDENTIALS_ID = 'doc-vps-ssh'
    DEPLOY_HOST = '187.77.23.79'
    DEPLOY_USER = 'root'

    LIVE_DOMAIN = 'prod.weightlossmdcherrycreek.com'
    PRE_DOMAIN = 'pre.weightlossmdcherrycreek.com'

    SERVER_DIR = '/var/projects/doc-backend'
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
        branch 'dev'
      }
      agent {
        docker {
          image 'node:22'
          reuseNode true
          args '-u root'
        }
      }
      environment {
        DATABASE_URL = 'postgresql://ci:ci@localhost:5432/ci'
      }
      steps {
        sh '''
          set -eu
          node --version
          npm --version
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

    stage('Promote Dev Image Tag') {
      when {
        branch 'master'
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

            docker pull "$PRERELEASE_SOURCE_IMAGE"
            docker tag "$PRERELEASE_SOURCE_IMAGE" "$CANDIDATE_IMAGE"
            docker tag "$PRERELEASE_SOURCE_IMAGE" "$LATEST_IMAGE"

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
          sshUserPrivateKey(
            credentialsId: "${DEPLOY_SSH_CREDENTIALS_ID}",
            keyFileVariable: 'DEPLOY_SSH_KEY',
            usernameVariable: 'DEPLOY_SSH_USER'
          )
        ]) {
          sh '''
            set -eu

            SSH_USER="${DEPLOY_SSH_USER:-$DEPLOY_USER}"
            SSH="ssh -i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
            SCP="scp -i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH "$SSH_USER@$DEPLOY_HOST" "mkdir -p '$SERVER_DIR/scripts' '$SERVER_DIR/releases'"

            $SCP "$COMPOSE_FILE" "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/$COMPOSE_FILE"
            $SCP Caddyfile "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/Caddyfile"
            $SCP scripts/clone-db-for-prerelease.sh "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/scripts/clone-db-for-prerelease.sh"
            $SCP scripts/clone-storage-for-prerelease.sh "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/scripts/clone-storage-for-prerelease.sh"
            $SCP scripts/deploy-prerelease.sh "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/scripts/deploy-prerelease.sh"
            $SCP scripts/promote-production.sh "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/scripts/promote-production.sh"
            $SCP scripts/rollback-production.sh "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/scripts/rollback-production.sh"
            $SCP scripts/backup-postgres.sh "$SSH_USER@$DEPLOY_HOST:$SERVER_DIR/scripts/backup-postgres.sh"

            $SSH "$SSH_USER@$DEPLOY_HOST" "
              set -eu
              chmod +x '$SERVER_DIR'/scripts/*.sh
              touch '$SERVER_DIR/.env.production' '$SERVER_DIR/.env.prerelease'
              chmod 600 '$SERVER_DIR/.env.production' '$SERVER_DIR/.env.prerelease'
              docker version
            "
          '''
        }
      }
    }

    stage('Deploy Pre-Release') {
      when {
        branch 'master'
      }
      steps {
        withCredentials([
          sshUserPrivateKey(
            credentialsId: "${DEPLOY_SSH_CREDENTIALS_ID}",
            keyFileVariable: 'DEPLOY_SSH_KEY',
            usernameVariable: 'DEPLOY_SSH_USER'
          )
        ]) {
          sh '''
            set -eu

            SSH_USER="${DEPLOY_SSH_USER:-$DEPLOY_USER}"
            SSH="ssh -i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH "$SSH_USER@$DEPLOY_HOST" "
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
        withCredentials([
          sshUserPrivateKey(
            credentialsId: "${DEPLOY_SSH_CREDENTIALS_ID}",
            keyFileVariable: 'DEPLOY_SSH_KEY',
            usernameVariable: 'DEPLOY_SSH_USER'
          )
        ]) {
          sh '''
            set -eu

            SSH_USER="${DEPLOY_SSH_USER:-$DEPLOY_USER}"
            SSH="ssh -i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

            $SSH "$SSH_USER@$DEPLOY_HOST" "
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
      script {
        if (env.BRANCH_NAME == 'dev') {
          echo "Dev pipeline failed before Docker image promotion. Check the Quality Gate, Build Image, or Push Image stage above."
        } else if (env.BRANCH_NAME == 'master') {
          echo "Master prerelease pipeline failed. Check Promote Dev Image Tag, Sync Release Files, or Deploy Pre-Release above."
        } else if (env.BRANCH_NAME == 'main') {
          echo "Production pipeline failed. Production should remain on the previous healthy color or rollback script will run when public health fails."
        } else {
          echo "Pipeline failed for branch: ${env.BRANCH_NAME}. Check the failed stage above."
        }
      }
    }
  }
}
