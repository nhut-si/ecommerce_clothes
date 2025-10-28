pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (khớp ID với Jenkins: dockerhub-cred)
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-cred')
        DOCKER_USERNAME = "${DOCKER_HUB_CREDENTIALS_USR}"
        DOCKER_PASSWORD = "${DOCKER_HUB_CREDENTIALS_PSW}"
        
        // Application settings
        BACKEND_IMAGE = "${DOCKER_USERNAME}/ecommerce-backend"
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/ecommerce-frontend"
        
        // Environment variables
        NODE_ENV = 'production'
        
        // Build/run tags
        BUILD_TAG = "${BUILD_NUMBER}"
        COMMIT_SHA = "${GIT_COMMIT}"

        // Remote server
        SERVER_HOST = "3.107.188.121"
        SERVER_USER = "root"

        // Frontend build-time config
        FRONTEND_BACKEND_URL = ""
        CORS_ORIGIN = "http://3.107.188.121,https://3.107.188.121"
    }
    
    // Removed NodeJS tool usage to avoid agent dependency; all builds happen inside Dockerfiles
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        // Removed agent-side dependency installation; handled inside Docker images
        
        // Optional: Add quality gates using containerized tools (e.g., run linters/tests inside Docker) if needed
        
        // Removed separate app build; Dockerfiles handle builds during image creation
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            echo 'Building backend Docker image...'
                            withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh '''
                                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                    docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} .
                                    docker tag ${BACKEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:latest
                                    docker tag ${BACKEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:${COMMIT_SHA}
                                    docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                                    docker push ${BACKEND_IMAGE}:latest
                                    docker push ${BACKEND_IMAGE}:${COMMIT_SHA}
                                '''
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            echo 'Building frontend Docker image...'
                            withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh '''
                                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                    docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} \
                                        --build-arg VITE_BACKEND_URL=${FRONTEND_BACKEND_URL} \
                                        --build-arg VITE_PAYPAL_CLIENT_ID="" .
                                    docker tag ${FRONTEND_IMAGE}:${BUILD_TAG} ${FRONTEND_IMAGE}:latest
                                    docker tag ${FRONTEND_IMAGE}:${BUILD_TAG} ${FRONTEND_IMAGE}:${COMMIT_SHA}
                                    docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                                    docker push ${FRONTEND_IMAGE}:latest
                                    docker push ${FRONTEND_IMAGE}:${COMMIT_SHA}
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        // Optional: Add container image scanning (e.g., Trivy) stage if the tool is available on the agent
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Skipping staging deployment - no staging compose file'
                // Có thể thêm staging deployment logic ở đây nếu cần
            }
        }
        
        stage('Deploy to Production') {
            steps {
                echo 'Deploying to production environment...'
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }

                    withCredentials([
                        string(credentialsId: 'mongo-url-prod', variable: 'MONGO_URL_PROD'),
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'cloudinary-cloud-name', variable: 'CLOUDINARY_CLOUD_NAME'),
                        string(credentialsId: 'cloudinary-api-key', variable: 'CLOUDINARY_API_KEY'),
                        string(credentialsId: 'cloudinary-api-secret', variable: 'CLOUDINARY_API_SECRET')
                    ]) {
                        sshagent (credentials: ['server-ssh-key']) {
                            sh '''
                                set -e
                                # Prepare remote directory
                                ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "mkdir -p ~/ecommerce-clothes"

                                # Copy compose file
                                scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${SERVER_USER}@${SERVER_HOST}:~/ecommerce-clothes/docker-compose.yml

                                # Copy nginx configuration
                                scp -o StrictHostKeyChecking=no -r nginx ${SERVER_USER}@${SERVER_HOST}:~/ecommerce-clothes/

                                # Create .env and deploy remotely
                                ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "\
                                  cd ~/ecommerce-clothes && \
                                  echo DOCKER_USERNAME=${DOCKER_USERNAME} > .env && \
                                  echo BUILD_TAG=${COMMIT_SHA} >> .env && \
                                  echo MONGO_URL_PROD=\"${MONGO_URL_PROD}\" >> .env && \
                                  echo JWT_SECRET=\"${JWT_SECRET}\" >> .env && \
                                  echo CLOUDINARY_CLOUD_NAME=\"${CLOUDINARY_CLOUD_NAME}\" >> .env && \
                                  echo CLOUDINARY_API_KEY=\"${CLOUDINARY_API_KEY}\" >> .env && \
                                  echo CLOUDINARY_API_SECRET=\"${CLOUDINARY_API_SECRET}\" >> .env && \
                                  echo CORS_ORIGIN=\"${CORS_ORIGIN}\" >> .env && \
                                  echo \"${DOCKER_PASSWORD}\" | docker login -u ${DOCKER_USERNAME} --password-stdin && \
                                  docker compose --env-file .env pull && \
                                  docker compose --env-file .env up -d --pull always && \
                                  docker image prune -f \
                                "
                            '''
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            // Có thể thêm notification (Slack, email, etc.)
        }
        failure {
            echo 'Pipeline failed!'
            // Có thể thêm notification về failure
        }
        unstable {
            echo 'Pipeline completed with warnings!'
        }
    }
}
