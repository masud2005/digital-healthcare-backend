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
      description: 'Promote this exact tested image to live after prerelease health checks. Keep false if testers approve manually from Jenkins.'
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
    // VPS_HOST = credentials('doc-backend-vps-host')
    VPS_HOST = '13.214.29.147'
    VPS_USER = 'admin'
    // LIVE_DOMAIN = credentials('doc-backend-live-domain')
    LIVE_DOMAIN = 'doco-prod.duckdns.org'
    // PRE_DOMAIN = credentials('doc-backend-pre-domain')
    PRE_DOMAIN = 'doco-pre.duckdns.org'
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
          env.IMAGE_TAG = "${env.BRANCH_NAME ?: 'manual'}-${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}".replaceAll('[^A-Za-z0-9_.-]', '-')
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
        withCredentials([usernamePassword(
          credentialsId: "${DOCKER_CREDENTIALS_ID}",
          usernameVariable: 'DOCKER_USERNAME',
          passwordVariable: 'DOCKER_PASSWORD'
        )]) {
          sh '''
            set -eu
            printf '%s' "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
            docker push "$CANDIDATE_IMAGE"
            docker push "$LATEST_BRANCH_IMAGE"
            docker logout
          '''
        }
      }
    }

    stage('Upload Release Files') {
      when {
        expression { return params.DEPLOY_PRERELEASE || params.PROMOTE_TO_LIVE }
      }
      steps {
        withCredentials([
          file(credentialsId: 'doc-backend-env-production', variable: 'PROD_ENV_FILE'),
          file(credentialsId: 'doc-backend-env-prerelease', variable: 'PRE_ENV_FILE')
        ]) {
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu
              ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "mkdir -p '$SERVER_DIR/scripts'"
              scp -o StrictHostKeyChecking=no "$COMPOSE_FILE" Caddyfile "$VPS_USER@$VPS_HOST:$SERVER_DIR/"
              scp -o StrictHostKeyChecking=no scripts/clone-db-for-prerelease.sh "$VPS_USER@$VPS_HOST:$SERVER_DIR/scripts/"
              scp -o StrictHostKeyChecking=no "$PROD_ENV_FILE" "$VPS_USER@$VPS_HOST:$SERVER_DIR/.env.production"
              scp -o StrictHostKeyChecking=no "$PRE_ENV_FILE" "$VPS_USER@$VPS_HOST:$SERVER_DIR/.env.prerelease"
              ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "chmod +x '$SERVER_DIR/scripts/clone-db-for-prerelease.sh'"
            '''
          }
        }
      }
    }

    stage('Deploy Prerelease') {
      when {
        expression { return params.DEPLOY_PRERELEASE }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: "${DOCKER_CREDENTIALS_ID}",
          usernameVariable: 'DOCKER_USERNAME',
          passwordVariable: 'DOCKER_PASSWORD'
        )]) {
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu
              ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "
                set -eu
                cd '$SERVER_DIR'
                export LIVE_DOMAIN='$LIVE_DOMAIN'
                export PRE_DOMAIN='$PRE_DOMAIN'
                export APP_IMAGE='$CANDIDATE_IMAGE'
                export PRE_IMAGE='$CANDIDATE_IMAGE'
                printf '%s' '$DOCKER_PASSWORD' | docker login -u '$DOCKER_USERNAME' --password-stdin
                docker compose -f '$COMPOSE_FILE' pull app_pre || true
                docker compose -f '$COMPOSE_FILE' up -d db_live db_pre
                if [ '${REFRESH_PRERELEASE_DB}' = 'true' ]; then
                  sh scripts/clone-db-for-prerelease.sh
                fi
                docker compose -f '$COMPOSE_FILE' run --rm app_pre npm run prisma:migrate
                docker compose -f '$COMPOSE_FILE' up -d --no-deps app_pre caddy
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
        expression { return params.DEPLOY_PRERELEASE }
      }
      steps {
        sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
          sh '''
            set -eu
            ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "
              set -eu
              cd '$SERVER_DIR'
              for i in \$(seq 1 30); do
                if curl -fsS 'https://$PRE_DOMAIN/api/health' >/dev/null; then
                  echo 'Prerelease is healthy'
                  exit 0
                fi
                echo \"Waiting for prerelease health... \$i/30\"
                sleep 5
              done
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
        withCredentials([usernamePassword(
          credentialsId: "${DOCKER_CREDENTIALS_ID}",
          usernameVariable: 'DOCKER_USERNAME',
          passwordVariable: 'DOCKER_PASSWORD'
        )]) {
          sshagent(credentials: ["${VPS_SSH_CREDENTIALS_ID}"]) {
            sh '''
              set -eu
              ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "
                set -eu
                cd '$SERVER_DIR'
                export LIVE_DOMAIN='$LIVE_DOMAIN'
                export PRE_DOMAIN='$PRE_DOMAIN'
                export APP_IMAGE='$CANDIDATE_IMAGE'
                export PRE_IMAGE='$CANDIDATE_IMAGE'
                printf '%s' '$DOCKER_PASSWORD' | docker login -u '$DOCKER_USERNAME' --password-stdin
                docker compose -f '$COMPOSE_FILE' pull app_live || true
                docker compose -f '$COMPOSE_FILE' run --rm app_live npm run prisma:migrate
                docker compose -f '$COMPOSE_FILE' up -d --no-deps app_live caddy
                for i in \$(seq 1 30); do
                  if curl -fsS 'https://$LIVE_DOMAIN/api/health' >/dev/null; then
                    echo 'Live is healthy now'
                    docker logout || true
                    exit 0
                  fi
                  echo \"Waiting for live health... \$i/30\"
                  sleep 5
                done
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
      echo 'Pipeline failed. Existing live container is left running unless the failure happened after a successful health check.'
    }
  }
}
