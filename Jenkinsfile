pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 60, unit: 'MINUTES')
  }

  parameters {
    booleanParam(
      name: 'DEPLOY_PRERELEASE',
      defaultValue: true,
      description: 'Deploy this build to the prerelease environment.'
    )
    booleanParam(
      name: 'PROMOTE_TO_LIVE',
      defaultValue: false,
      description: 'Promote this exact tested image to live after prerelease health checks.'
    )
    booleanParam(
      name: 'REFRESH_PRERELEASE_DB',
      defaultValue: true,
      description: 'Clone live database into prerelease before prerelease migration.'
    )
  }
  environment {
    APP_NAME = 'doc-backend'
    DOCKER_IMAGE = 'softvence/doc-backend'
    DOCKER_CREDENTIALS_ID = 'dockerhub-creds'
    VPS_SSH_CREDENTIALS_ID = 'doc-vps-ssh'
    VPS_HOST = '13.214.29.147'
    VPS_USER = 'admin'
    // Domains
    LIVE_DOMAIN = 'doco-prod.duckdns.org'
    PRE_DOMAIN = 'doco-pre.duckdns.org'
    // IMPORTANT:
    SERVER_DIR = "/home/${VPS_USER}/projects/${APP_NAME}"
    COMPOSE_FILE = 'docker-compose.release.yaml'
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
          env.IMAGE_TAG = "${env.BRANCH_NAME ?: 'manual'}-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
            .replaceAll('[^A-Za-z0-9_.-]', '-')
          env.CANDIDATE_IMAGE = "${env.DOCKER_IMAGE}:${env.IMAGE_TAG}"
          env.LATEST_BRANCH_IMAGE = "${env.DOCKER_IMAGE}:${env.BRANCH_NAME ?: 'manual'}"
        }
      }
    }
    stage('Build Image') {
      steps {
        sh '''
          set -eu
          docker build \
            --pull \
            -t "$CANDIDATE_IMAGE" \
            -t "$LATEST_BRANCH_IMAGE" \
            .
        '''
      }
    }
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
            printf '%s' "$DOCKER_PASSWORD" | docker login \
              -u "$DOCKER_USERNAME" \
              --password-stdin
            docker push "$CANDIDATE_IMAGE"
            docker push "$LATEST_BRANCH_IMAGE"
            docker logout
          '''
        }
      }
    }
    stage('Upload Release Files') {
      when {
        expression {
          return params.DEPLOY_PRERELEASE || params.PROMOTE_TO_LIVE
        }
      }
      steps {
        withCredentials([
          file(credentialsId: 'doc-backend-env-production', variable: 'PROD_ENV_FILE'),
          file(credentialsId: 'doc-backend-env-prerelease', variable: 'PRE_ENV_FILE')
        ]) {
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu
              SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
              echo "Creating remote directories..."
              ssh $SSH_OPTIONS "$VPS_USER@$VPS_HOST" "
                mkdir -p '$SERVER_DIR/scripts'
              "
              echo "Uploading docker compose..."
              scp $SSH_OPTIONS \
                "$COMPOSE_FILE" \
                "$VPS_USER@$VPS_HOST:$SERVER_DIR/"
              echo "Uploading Caddyfile..."
              scp $SSH_OPTIONS \
                Caddyfile \
                "$VPS_USER@$VPS_HOST:$SERVER_DIR/"
              echo "Uploading database clone script..."
              scp $SSH_OPTIONS \
                scripts/clone-db-for-prerelease.sh \
                "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/"
              echo "Uploading production env..."
              scp $SSH_OPTIONS \
                "$PROD_ENV_FILE" \
                "$VPS_USER@$VPS_HOST:$SERVER_DIR/.env.production"
              echo "Uploading prerelease env..."
              scp $SSH_OPTIONS \
                "$PRE_ENV_FILE" \
                "$VPS_USER@$VPS_HOST:$SERVER_DIR/.env.prerelease"
              echo "Setting execute permissions..."
              ssh $SSH_OPTIONS "$VPS_USER@$VPS_HOST" "
                chmod +x '$SERVER_DIR/scripts/clone-db-for-prerelease.sh'
              "
            '''
          }
        }
      }
    }
    stage('Deploy Prerelease') {
      when {
        expression {
          return params.DEPLOY_PRERELEASE
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
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu
              SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
              ssh $SSH_OPTIONS "$VPS_USER@$VPS_HOST" "
                set -eu
                cd '$SERVER_DIR'
                # Validate important deployment files
                test -f '$COMPOSE_FILE' || { echo 'Compose file missing'; exit 1; }
                test -f 'Caddyfile' || { echo 'Caddyfile missing'; exit 1; }
                export LIVE_DOMAIN='$LIVE_DOMAIN'
                export PRE_DOMAIN='$PRE_DOMAIN'
                export APP_IMAGE='$CANDIDATE_IMAGE'
                export PRE_IMAGE='$CANDIDATE_IMAGE'
                echo 'Docker login...'
                printf '%s' '$DOCKER_PASSWORD' | docker login \
                  -u '$DOCKER_USERNAME' \
                  --password-stdin
                echo 'Starting databases...'
                docker compose -f '$COMPOSE_FILE' up -d db_live db_pre
                if [ '${REFRESH_PRERELEASE_DB}' = 'true' ]; then
                  echo 'Refreshing prerelease database from live...'
                  sh scripts/clone-db-for-prerelease.sh
                fi
                echo 'Pulling prerelease image...'
                docker compose -f '$COMPOSE_FILE' pull app_pre || true
                echo 'Running Prisma migrations...'
                docker compose -f '$COMPOSE_FILE' run --rm app_pre npm run prisma:migrate
                echo 'Starting prerelease services...'
                docker compose -f '$COMPOSE_FILE' up -d --no-deps app_pre caddy
                echo 'Container status:'
                docker compose -f '$COMPOSE_FILE' ps
                docker logout || true
              "
            '''
          }
        }
      }
    }
    stage('Verify Prerelease') {
      when {
        expression {
          return params.DEPLOY_PRERELEASE
        }
      }
      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu
            SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
            ssh $SSH_OPTIONS "$VPS_USER@$VPS_HOST" "
              set -eu
              cd '$SERVER_DIR'
              echo 'Waiting for prerelease health check...'
              for i in \$(seq 1 30); do
                if curl -fsS 'https://$PRE_DOMAIN/api/health' >/dev/null; then
                  echo 'Prerelease is healthy'
                  exit 0
                fi
                echo \"Waiting for prerelease health... \$i/30\"
                sleep 5
              done
              echo 'Prerelease failed health check'
              docker compose -f '$COMPOSE_FILE' logs --tail=200 app_pre
              exit 1
            "
          '''
        }
      }
    }
    stage('Human Approval') {
      when {
        allOf {
          expression { return params.DEPLOY_PRERELEASE }
          expression { return !params.PROMOTE_TO_LIVE }
        }
      }
      steps {
        timeout(time: 7, unit: 'DAYS') {
          input(
            message: "Promote ${env.CANDIDATE_IMAGE} to live?",
            ok: 'Promote to live'
          )
        }
      }
    }
    stage('Promote To Live') {
      when {
        anyOf {
          expression { return params.PROMOTE_TO_LIVE }
          expression { return params.DEPLOY_PRERELEASE }
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
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu
              SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
              ssh $SSH_OPTIONS "$VPS_USER@$VPS_HOST" "
                set -eu
                cd '$SERVER_DIR'
                export LIVE_DOMAIN='$LIVE_DOMAIN'
                export PRE_DOMAIN='$PRE_DOMAIN'
                export APP_IMAGE='$CANDIDATE_IMAGE'
                export PRE_IMAGE='$CANDIDATE_IMAGE'
                echo 'Docker login...'
                printf '%s' '$DOCKER_PASSWORD' | docker login \
                  -u '$DOCKER_USERNAME' \
                  --password-stdin
                echo 'Pulling live image...'
                docker compose -f '$COMPOSE_FILE' pull app_live || true
                echo 'Running production migrations...'
                docker compose -f '$COMPOSE_FILE' run --rm app_live npm run prisma:migrate
                echo 'Starting production containers...'
                docker compose -f '$COMPOSE_FILE' up -d --no-deps app_live caddy
                echo 'Waiting for production health check...'
                for i in \$(seq 1 30); do
                  if curl -fsS 'https://$LIVE_DOMAIN/api/health' >/dev/null; then
                    echo 'Live environment is healthy'
                    docker logout || true
                    exit 0
                  fi
                  echo \"Waiting for live health... \$i/30\"
                  sleep 5
                done
                echo 'Production health check failed'
                docker compose -f '$COMPOSE_FILE' logs --tail=200 app_live
                docker logout || true
                exit 1
              "
            '''
          }
        }
      }
    }
  }
  post {
    always {
      echo 'Pipeline finished.'
    }
    success {
      echo "Build succeeded: ${CANDIDATE_IMAGE}"
      echo "Prerelease URL: https://${PRE_DOMAIN}/api/health"
      echo "Live URL: https://${LIVE_DOMAIN}/api/health"
    }
    failure {
      echo 'Pipeline failed. Existing live container remains running unless failure happened after successful promotion.'
    }
  }
}