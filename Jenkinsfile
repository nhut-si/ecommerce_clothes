pipeline {
    agent any

    environment {
        REGISTRY = "docker.io/${DOCKER_USERNAME}"
        BACKEND_IMAGE = "ecommerce-backend"
        FRONTEND_IMAGE = "ecommerce-frontend"
        SERVER_HOST = "3.107.188.121"
        SERVER_USER = "unbuntu"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                  branches: [[name: '*/master']],
                  userRemoteConfigs: [[
                    url: 'https://github.com/nhut-si/ecommerce_clothes.git',
                    credentialsId: 'github-pat'
                  ]]
                ])
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        
                        sh "docker build -t docker.io/\$DOCKER_USER/\$BACKEND_IMAGE:latest ."
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        
                        sh '''
                            docker build -t docker.io/$DOCKER_USER/$FRONTEND_IMAGE:latest \\
                                --build-arg VITE_BACKEND_URL="" \\
                                --build-arg VITE_PAYPAL_CLIENT_ID="" .
                        '''
                    }
                }
            }
        }

        stage('Push Docker Hub') {
            steps {
               withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push docker.io/\$DOCKER_USER/\$BACKEND_IMAGE:latest"
                    sh "docker push docker.io/\$DOCKER_USER/\$FRONTEND_IMAGE:latest"
                }
            }
        }

        stage('Deploy Server') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                    string(credentialsId: 'mongo-url-prod', variable: 'MONGO_URL_PROD'),
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'cloudinary-cloud-name', variable: 'CLOUDINARY_CLOUD_NAME'),
                    string(credentialsId: 'cloudinary-api-key', variable: 'CLOUDINARY_API_KEY'),
                    string(credentialsId: 'cloudinary-api-secret', variable: 'CLOUDINARY_API_SECRET'),
                    sshUserPrivateKey(credentialsId: 'server-ssh-key', keyFileVariable: 'SSH_KEY')
                ]) {
                    sh '''
                        # Setup SSH
                        mkdir -p ~/.ssh
                        cp "$SSH_KEY" ~/.ssh/deploy_key
                        chmod 600 ~/.ssh/deploy_key

                        # Copy docker-compose.yml từ Jenkins sang server
                        scp -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no -q docker-compose.prod.yml $SERVER_USER@$SERVER_HOST:~/ecommerce-clothes/docker-compose.yml

                        # Copy nginx configuration
                        scp -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no -q -r nginx $SERVER_USER@$SERVER_HOST:~/ecommerce-clothes/

                        # SSH vào server để deploy
                        ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "
                        cd ~/ecommerce-clothes && \\
                        echo \\"MONGO_URL_PROD=$MONGO_URL_PROD\\" > .env && \\
                        echo \\"JWT_SECRET=$JWT_SECRET\\" >> .env && \\
                        echo \\"CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME\\" >> .env && \\
                        echo \\"CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY\\" >> .env && \\
                        echo \\"CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET\\" >> .env && \\
                        echo \\"CORS_ORIGIN=http://3.107.188.121,https://3.107.188.121\\" >> .env && \\
                        echo \\"$DOCKER_PASS\\" | docker login -u $DOCKER_USER --password-stdin && \\
                        docker compose --env-file .env pull && \\
                        docker compose --env-file .env down && \\
                        docker compose --env-file .env up -d && \\
                        docker image prune -f
                        "

                        # Cleanup
                        rm -f ~/.ssh/deploy_key
                    '''
                }
            }
        }
    }
}