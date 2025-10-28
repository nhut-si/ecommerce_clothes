# CI/CD Jenkins + Docker + GitHub (Step-by-Step)

## 1. Yêu cầu cài đặt & Chuẩn bị

### 1.1. Hệ điều hành
- Ubuntu Server 22.04 LTS (khuyến nghị)
- RAM tối thiểu 2GB (tốt hơn là 4GB nếu build NodeJS nặng)
- Disk ≥ 30GB

### 1.2. Tài khoản & công cụ
- GitHub: nơi lưu source code.
- Docker Hub: nơi push/pull image.
- Server production: nơi deploy (cài Docker + Compose).
- Jenkins server: có thể cùng hoặc tách với production.

### 1.3. Network
Mở port:
- 8080 → Jenkins.
- 22 → SSH.
- 80/443 → Web app.

### 1.4. Cấu trúc source code
Lưu ý đây là cấu trúc của 1 dự án NodeJS + React:

```
ecommerce-clothes/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── docker-compose.prod.yml
├── nginx/
│   └── nginx.conf
└── Jenkinsfile
```

## 2. Cài Jenkins & Setup lần đầu

### 2.1. Cài đặt Jenkins
```bash
# Update hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Java (Jenkins yêu cầu Java 17+)
sudo apt install fontconfig openjdk-21-jre

# Thêm key và repo Jenkins
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Cài Jenkins
sudo apt update
sudo apt install jenkins

# Start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

### 2.2. Truy cập giao diện web
- Mở trình duyệt: http://<server-ip>:8080
- Lấy admin password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`
- Làm theo wizard: tạo admin user, cài plugin mặc định.

## 3. Cài Docker & Docker Compose

### 3.1. Cài Docker
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3.2. Thêm quyền cho Jenkins & user
```bash
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Kiểm tra Docker chạy
docker run hello-world
```

## 4. Tạo Dockerfile

Ví dụ ứng dụng NodeJS + React (bạn hãy thay bằng tech stack của mình để phù hợp với project của bạn):

### Backend Dockerfile:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

USER node
CMD ["node", "server.js"]
```

### Frontend Dockerfile:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

# Build-time environment cho Vite
ARG VITE_BACKEND_URL
ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 5. Viết docker-compose.prod.yml cho production server

```yaml
version: "3.8"

services:
  backend:
    image: docker.io/yoursi/ecommerce-backend:latest
    container_name: ecommerce-backend
    restart: always
    expose:
      - "5000"
    environment:
      NODE_ENV: production
      MONGO_URL: ${MONGO_URL_PROD}
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    env_file:
      - .env
    networks:
      - app-network

  frontend:
    image: docker.io/yoursi/ecommerce-frontend:latest
    container_name: ecommerce-frontend
    restart: always
    expose:
      - "80"
    environment:
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 6. Kết nối GitHub → Jenkins

### 6.1. Tạo PAT (Personal Access Token) trên GitHub
Vào Settings → Developer settings → Personal access tokens → Fine-grained tokens.
Scope: repo (read), admin:repo_hook.
Copy token.

### 6.2. Add vào Jenkins
Vào Manage Jenkins → Credentials → Global.
Add new credential:
- Kind: Username with password
- Username: GitHub username
- Password: PAT token
- ID: github-pat

### 6.3. Tạo webhook GitHub
Repo → Settings → Webhooks → Add webhook.
- URL: http://<jenkins-server>:8080/github-webhook/.
- Content type: application/json.
- Trigger: push events.

## 7. Quản lý Credentials trong Jenkins

- dockerhub-cred → Docker Hub username + Access Token.
- server-ssh-key → SSH Private Key login vào production.
- mongo-url-prod → Secret text chứa MongoDB connection string.
- jwt-secret → Secret text chứa JWT secret.
- cloudinary-cloud-name → Cloudinary cloud name.
- cloudinary-api-key → Cloudinary API key.
- cloudinary-api-secret → Cloudinary API secret.

## 8. Chuẩn bị Production server

Cài Docker + Docker Compose.
Copy public key vào ~/.ssh/authorized_keys.
Có sẵn thư mục ~/ecommerce-clothes/

### Setup SSH Key:
```bash
# Trên Jenkins server, tạo SSH key
sudo -u jenkins ssh-keygen -t rsa -b 4096 -f /var/lib/jenkins/.ssh/jenkins_key

# Copy public key lên production server
sudo -u jenkins ssh-copy-id -i /var/lib/jenkins/.ssh/jenkins_key.pub root@3.107.188.121

# Test connection
sudo -u jenkins ssh -i /var/lib/jenkins/.ssh/jenkins_key root@3.107.188.121 "echo 'SSH OK'"
```

## 9. Jenkinsfile (Pipeline Script)

```groovy
pipeline {
    agent any

    environment {
        REGISTRY = "docker.io/${DOCKER_USERNAME}"
        BACKEND_IMAGE = "ecommerce-backend"
        FRONTEND_IMAGE = "ecommerce-frontend"
        SERVER_HOST = "3.107.188.121"
        SERVER_USER = "root"
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
                        scp -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no docker-compose.prod.yml $SERVER_USER@$SERVER_HOST:~/ecommerce-clothes/docker-compose.yml

                        # Copy nginx configuration
                        scp -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no -r nginx $SERVER_USER@$SERVER_HOST:~/ecommerce-clothes/

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
```

## 10. Tạo Jenkins Pipeline Job

- Dashboard → New Item → Pipeline → đặt tên Ecommerce-CICD.
- Pipeline script from SCM → Git → repo URL + branch master → credentials github-pat.
- Save.

## 11. Test Pipeline

- Push code lên GitHub.
- Jenkins trigger job → chạy các stage: Checkout → Build Backend → Build Frontend → Push → Deploy.
- Vào server check container: `docker ps`
- Mở http://<server-ip> để test app.

## Troubleshooting

### SSH Permission Denied
```bash
# Kiểm tra SSH config trên production server
sudo nano /etc/ssh/sshd_config

# Đảm bảo các dòng sau:
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitRootLogin yes

# Restart SSH service
sudo systemctl restart ssh
```
