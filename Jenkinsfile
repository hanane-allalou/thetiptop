pipeline {
  agent any
  tools { nodejs 'Node20' }

   environment {
    TRAEFIK_NET     = 'furious-ducks_proxy'
    API_PROD        = 'api-thetiptop.wk-dsp5-archi-o23dis-5-g4.fr'
    API_PREPROD     = 'preprod-api.thetiptop.wk-dsp5-archi-o23dis-5-g4.fr'
    API_DEV         = 'api-thetiptop-dev.wk-dsp5-archi-o23dis-5-g4.fr'
    FRONT_PROD      = 'thetiptop.wk-dsp5-archi-o23dis-5-g4.fr'
    FRONT_PREPROD   = 'thetiptop-preprod.wk-dsp5-archi-o23dis-5-g4.fr'
    FRONT_DEV       = 'thetiptop-dev.wk-dsp5-archi-o23dis-5-g4.fr'
    ADMIN_PROD      = 'adminthetiptop.wk-dsp5-archi-o23dis-5-g4.fr'
    ADMIN_PREPROD   = 'adminthetiptop-preprod.wk-dsp5-archi-o23dis-5-g4.fr'
    ADMIN_DEV       = 'admin-thetiptop-dev.wk-dsp5-archi-o23dis-5-g4.fr'
    REGISTRY_HOST   = 'registry.gitlab.com'
    GITLAB_REGISTRY = 'registry.gitlab.com/toure18/thetiptop'
  }


  stages {
    stage('Tests') {
      parallel {
        stage('Test back') {
          steps {
            dir('back/app') {
              sh '''#!/bin/sh
              set -eu
              rm -rf reports/junit || true
              mkdir -p reports/junit
              export JEST_JUNIT_OUTPUT_DIR=reports/junit
              export JEST_JUNIT_OUTPUT_NAME=junit.xml
              npm ci
              CI=true npm test -- --ci --runInBand --reporters=default --reporters=jest-junit
              '''
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'back/app/reports/junit/*.xml'
            }
          }
        }

        stage('Test front') {
          steps {
            dir('front') {
              sh '''#!/bin/sh
              set -eu
              rm -rf reports/junit || true
              mkdir -p reports/junit
              export JEST_JUNIT_OUTPUT_DIR=reports/junit
              export JEST_JUNIT_OUTPUT_NAME=junit.xml
              npm ci
              CI=true npm test -- --ci --reporters=default --reporters=jest-junit
              '''
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'front/reports/junit/*.xml'
            }
          }
        }
      }
    }

    stage('Build & Push Docker Images') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'gitlab-registry-project-credentials', passwordVariable: 'GITLAB_TOKEN', usernameVariable: 'GITLAB_USER')]) {
            sh "echo ${GITLAB_TOKEN} | docker login -u ${GITLAB_USER} --password-stdin ${REGISTRY_HOST}"

            // Détermine le tag de branche
            def BRANCH_TAG = (env.BRANCH_NAME == 'main') ? 'latest' :
                            (env.BRANCH_NAME == 'preprod') ? 'preprod' :
                            (env.BRANCH_NAME == 'dev') ? 'dev' : env.BRANCH_NAME

            // ------- API -------
            dir('back/app') {
              def image = "${GITLAB_REGISTRY}/api"
              withCredentials([file(credentialsId: 'thetiptop-api-prod', variable: 'ENV_FILE')]) {
                sh """
                  cp "${ENV_FILE}" .env
                  docker build -t ${image}:${BUILD_ID} -t ${image}:${BRANCH_TAG} .
                  docker push ${image}:${BUILD_ID}
                  docker push ${image}:${BRANCH_TAG}
                """
              }
            }

            // ------- FRONT -------
            dir('front') {
              def image = "${GITLAB_REGISTRY}/front"
              withCredentials([file(credentialsId: 'thetiptop-front-prod', variable: 'ENV_FILE')]) {
                sh """
                  cp "${ENV_FILE}" .env
                  docker build -t ${image}:${BUILD_ID} -t ${image}:${BRANCH_TAG} .
                  docker push ${image}:${BUILD_ID}
                  docker push ${image}:${BRANCH_TAG}
                """
              }
            }

          
            dir('admin/next-admin/frontend') {
              def image = "${GITLAB_REGISTRY}/admin"
              withCredentials([file(credentialsId: 'thetiptop-admin-prod', variable: 'ENV_FILE')]) {
                sh """
                  cp "${ENV_FILE}" .env
                  docker build -t ${image}:${BUILD_ID} -t ${image}:${BRANCH_TAG} .
                  docker push ${image}:${BUILD_ID}
                  docker push ${image}:${BRANCH_TAG}
                """
              }
            }
          }
        }
      }
    }

    stage('Deploy DEV') {
      when { branch 'dev' }
      steps {
        script {
          withCredentials([file(credentialsId: 'thetiptop-api-dev', variable: 'API_ENV_FILE')]) {
            sh """
              docker pull ${GITLAB_REGISTRY}/api:dev || true
              docker rm -f api-dev || true
              docker run -d --name api-dev --network ${TRAEFIK_NET} \\
                --env-file ${API_ENV_FILE} \\
                -l traefik.enable=true \\
                -l "traefik.http.routers.api-dev.rule=Host(\\`${API_DEV}\\`)" \\
                -l traefik.http.routers.api-dev.entrypoints=web,websecure \\
                -l traefik.http.routers.api-dev.tls.certresolver=le \\
                -l traefik.http.services.api-dev.loadbalancer.server.port=3000 \\
                ${GITLAB_REGISTRY}/api:dev
            """
          }

          withCredentials([file(credentialsId: 'thetiptop-front-dev', variable: 'FRONT_ENV_FILE')]) {
            sh """
              docker pull ${GITLAB_REGISTRY}/front:dev || true
              docker rm -f front-dev || true
              docker run -d --name front-dev --network ${TRAEFIK_NET} \\
                --env-file ${FRONT_ENV_FILE} \\
                -l traefik.enable=true \\
                -l "traefik.http.routers.front-dev.rule=Host(\\`${FRONT_DEV}\\`)" \\
                -l traefik.http.routers.front-dev.entrypoints=web,websecure \\
                -l traefik.http.routers.front-dev.tls.certresolver=le \\
                -l traefik.http.services.front-dev.loadbalancer.server.port=80 \\
                ${GITLAB_REGISTRY}/front:dev
            """
          }

          withCredentials([file(credentialsId: 'thetiptop-admin-dev', variable: 'ADMIN_ENV_FILE')]) {
            sh """
              docker pull ${GITLAB_REGISTRY}/admin:dev || true
              docker rm -f admin-dev || true
              docker run -d --name admin-dev --network ${TRAEFIK_NET} \\
                --env-file ${ADMIN_ENV_FILE} \\
                -l traefik.enable=true \\
                -l "traefik.http.routers.admin-dev.rule=Host(\\`${ADMIN_DEV}\\`)" \\
                -l traefik.http.routers.admin-dev.entrypoints=web,websecure \\
                -l traefik.http.routers.admin-dev.tls.certresolver=le \\
                -l traefik.http.services.admin-dev.loadbalancer.server.port=80 \\
                ${GITLAB_REGISTRY}/admin:dev
            """
          }
        }
      }
    }

    stage('Deploy PREPROD') {
      when { branch 'preprod' }
      steps {
        script {
          withCredentials([file(credentialsId: 'thetiptop-api-preprod', variable: 'API_ENV_FILE')]) {
            sh """
              docker pull ${GITLAB_REGISTRY}/api:preprod || true
              docker rm -f api-preprod || true
              docker run -d --name api-preprod --network ${TRAEFIK_NET} \\
                --env-file ${API_ENV_FILE} \\
                -l traefik.enable=true \\
                -l "traefik.http.routers.api-preprod.rule=Host(\\`${API_PREPROD}\\`)" \\
                -l traefik.http.routers.api-preprod.entrypoints=web,websecure \\
                -l traefik.http.routers.api-preprod.tls.certresolver=le \\
                -l traefik.http.services.api-preprod.loadbalancer.server.port=3000 \\
                ${GITLAB_REGISTRY}/api:preprod
            """
          }

          withCredentials([file(credentialsId: 'thetiptop-front-preprod', variable: 'FRONT_ENV_FILE')]) {
            sh """
              docker pull ${GITLAB_REGISTRY}/front:preprod || true
              docker rm -f front-preprod || true
              docker run -d --name front-preprod --network ${TRAEFIK_NET} \\
                --env-file ${FRONT_ENV_FILE} \\
                -l traefik.enable=true \\
                -l "traefik.http.routers.front-preprod.rule=Host(\\`${FRONT_PREPROD}\\`)" \\
                -l traefik.http.routers.front-preprod.entrypoints=web,websecure \\
                -l traefik.http.routers.front-preprod.tls.certresolver=le \\
                -l traefik.http.services.front-preprod.loadbalancer.server.port=80 \\
                ${GITLAB_REGISTRY}/front:preprod
            """
          }

          withCredentials([file(credentialsId: 'thetiptop-admin-preprod', variable: 'ADMIN_ENV_FILE')]) {
            sh """
              docker pull ${GITLAB_REGISTRY}/admin:preprod || true
              docker rm -f admin-preprod || true
              docker run -d --name admin-preprod --network ${TRAEFIK_NET} \\
                --env-file ${ADMIN_ENV_FILE} \\
                -l traefik.enable=true \\
                -l "traefik.http.routers.admin-preprod.rule=Host(\\`${ADMIN_PREPROD}\\`)" \\
                -l traefik.http.routers.admin-preprod.entrypoints=web,websecure \\
                -l traefik.http.routers.admin-preprod.tls.certresolver=le \\
                -l traefik.http.services.admin-preprod.loadbalancer.server.port=80 \\
                ${GITLAB_REGISTRY}/admin:preprod
            """
          }
        }
      }
    }


    stage('Deploy PROD') {
      when { branch 'main' }
      steps {
        script {
          // On s’assure qu’aucun ancien front-prod ne tourne
          sh "docker rm -f front-prod || true"

          // API PROD (sert API + SSR du site public PROD)
          withCredentials([file(credentialsId: 'thetiptop-api-prod', variable: 'API_ENV_FILE')]) {
            sh """
              docker rm -f api-prod || true
              docker run -d --name api-prod --network ${TRAEFIK_NET} \\
                --env-file ${API_ENV_FILE} \\
                -l traefik.enable=true \\
                -l traefik.docker.network=${TRAEFIK_NET} \\
                -l "traefik.http.routers.api-prod.rule=Host(\\`${API_PROD}\\`)" \\
                -l traefik.http.routers.api-prod.entrypoints=web,websecure \\
                -l traefik.http.routers.api-prod.tls.certresolver=le \\
                -l traefik.http.routers.api-prod.service=api-rest \\
                -l traefik.http.services.api-rest.loadbalancer.server.port=3000 \\
                -l "traefik.http.routers.front-prod.rule=Host(\\`${FRONT_PROD}\\`)" \\
                -l traefik.http.routers.front-prod.entrypoints=web,websecure \\
                -l traefik.http.routers.front-prod.tls.certresolver=le \\
                -l traefik.http.routers.front-prod.service=api-ssr \\
                -l traefik.http.services.api-ssr.loadbalancer.server.port=3000 \\
                -l "traefik.http.routers.metrics-prod.rule=Host(\\`${API_PROD}\\`) && Path(\\`/metrics\\`)" \\
                -l traefik.http.routers.metrics-prod.entrypoints=web,websecure \\
                -l traefik.http.routers.metrics-prod.tls.certresolver=le \\
                -l traefik.http.routers.metrics-prod.service=api-metrics \\
                -l traefik.http.services.api-metrics.loadbalancer.server.port=3000 \\
                -l metrics.enable=true \\
                -l metrics.port=3000 \\
                -l metrics.path=/metrics \\
                ${GITLAB_REGISTRY}/api:latest
            """
          }

          // ADMIN PROD
          withCredentials([file(credentialsId: 'thetiptop-admin-prod', variable: 'ADMIN_ENV_FILE')]) {
            sh """
              docker rm -f admin-prod || true
              docker run -d --name admin-prod --network ${TRAEFIK_NET} \\
                --env-file ${ADMIN_ENV_FILE} \\
                -l traefik.enable=true \\
                -l traefik.docker.network=${TRAEFIK_NET} \\
                -l "traefik.http.routers.admin-prod.rule=Host(\\`${ADMIN_PROD}\\`)" \\
                -l traefik.http.routers.admin-prod.entrypoints=web,websecure \\
                -l traefik.http.routers.admin-prod.tls.certresolver=le \\
                -l traefik.http.services.admin-prod.loadbalancer.server.port=80 \\
                ${GITLAB_REGISTRY}/admin:latest
            """
          }
        }
      }
    }

  }

  post {
    always {
      echo '🧹 Nettoyage léger...'
      sh 'docker container prune -f || true'
    }
  }
}
