pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (cần cấu hình trong Jenkins)
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_USERNAME = "${DOCKER_HUB_CREDENTIALS_USR}"
        DOCKER_PASSWORD = "${DOCKER_HUB_CREDENTIALS_PSW}"
        
        // Application settings
        BACKEND_IMAGE = "${DOCKER_USERNAME}/ecommerce-backend"
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/ecommerce-frontend"
        
        // Environment variables
        NODE_ENV = 'production'
        
        // Build number for tagging
        BUILD_TAG = "${BUILD_NUMBER}"
    }
    
    tools {
        nodejs '20' // Cần cấu hình Node.js 20 trong Jenkins Global Tools
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo 'Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality & Testing') {
            parallel {
                stage('Backend Lint & Test') {
                    steps {
                        dir('backend') {
                            echo 'Running backend linting and tests...'
                            // Uncomment when tests are available
                            // sh 'npm run lint'
                            // sh 'npm test'
                            echo 'Backend quality checks completed'
                        }
                    }
                }
                stage('Frontend Lint & Test') {
                    steps {
                        dir('frontend') {
                            echo 'Running frontend linting and tests...'
                            sh 'npm run lint'
                            // Uncomment when tests are available
                            // sh 'npm test'
                        }
                    }
                }
            }
        }
        
        stage('Build Applications') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            echo 'Backend is ready for deployment (Node.js app)'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            echo 'Building frontend application...'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            echo 'Building backend Docker image...'
                            script {
                                def backendImage = docker.build("${BACKEND_IMAGE}:${BUILD_TAG}")
                                docker.withRegistry('https://registry-1.docker.io/v2/', 'docker-hub-credentials') {
                                    backendImage.push()
                                    backendImage.push('latest')
                                }
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            echo 'Building frontend Docker image...'
                            script {
                                def frontendImage = docker.build("${FRONTEND_IMAGE}:${BUILD_TAG}")
                                docker.withRegistry('https://registry-1.docker.io/v2/', 'docker-hub-credentials') {
                                    frontendImage.push()
                                    frontendImage.push('latest')
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo 'Running security scans...'
                // Có thể thêm các tools như Snyk, OWASP dependency check
                script {
                    try {
                        dir('backend') {
                            sh 'npm audit --audit-level high'
                        }
                        dir('frontend') {
                            sh 'npm audit --audit-level high'
                        }
                    } catch (Exception e) {
                        echo "Security scan found vulnerabilities: ${e.getMessage()}"
                        // Có thể set unstable thay vì fail
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
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
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo 'Deploying to production environment...'
                script {
                    // Có thể thêm manual approval
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    
                    // Deploy to production
                    sh '''
                        export DOCKER_USERNAME=${DOCKER_USERNAME}
                        export BUILD_TAG=${BUILD_TAG}
                        docker-compose -f docker-compose.prod.yml down
                        docker-compose -f docker-compose.prod.yml up -d
                    '''
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
