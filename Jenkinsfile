pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }

    environment {
        // Core Server Details
        NGINX_SERVER_IP = '82.25.105.196'
        NGINX_USER      = 'root'        
        SSH_PORT        = '22'
        
        // Define web directories on your server for Comfort Air
        PROD_WEB_DIR    = '/var/www/comfortair.co.in' 
        DEV_WEB_DIR     = '/var/www/dev.comfortair.co.in'
        STAGING_WEB_DIR = '/var/www/staging.comfortair.co.in'
        
        // Next.js server ports per environment (Dev: 3061, Staging: 3062, Prod: 3063)
        DEV_PORT        = '3061'
        STAGING_PORT    = '3062'
        PROD_PORT       = '3063'
        CI              = 'false' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Configure Environment & Build') {
            steps {
                script {
                    def branch = env.BRANCH_NAME ?: env.GIT_BRANCH
                    if (branch == 'main' || branch == 'origin/main') {
                        sh '''
                            echo "NEXT_PUBLIC_API_BASE_URL=https://api.comfortair.co.in/api/v1" > .env.production
                            echo "NEXT_PUBLIC_API_URL=https://api.comfortair.co.in/api/v1" >> .env.production
                        '''
                    } else if (branch == 'staging' || branch == 'origin/staging') {
                        sh '''
                            echo "NEXT_PUBLIC_API_BASE_URL=https://staging.api.comfortair.co.in/api/v1" > .env.production
                            echo "NEXT_PUBLIC_API_URL=https://staging.api.comfortair.co.in/api/v1" >> .env.production
                        '''
                    } else {
                        sh '''
                            echo "NEXT_PUBLIC_API_BASE_URL=https://dev.api.comfortair.co.in/api/v1" > .env.production
                            echo "NEXT_PUBLIC_API_URL=https://dev.api.comfortair.co.in/api/v1" >> .env.production
                        '''
                    }
                }
                sh 'rm -rf .next'
                sh 'npm run build'
            }
        }

        // ==========================================
        // SETUP REMOTE SERVER (Install Node.js & PM2 if missing)
        // ==========================================
        stage('Setup Remote Server') {
            steps {
                sshagent(credentials: ['nginx-ssh-key']) {
                    sh '''
                        echo "Checking remote server for Node.js & PM2..."
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} '
                            # Install Node.js 20.x if not present
                            if ! command -v node &> /dev/null; then
                                echo "Node.js not found. Installing Node.js 20.x..."
                                curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                                apt-get install -y nodejs
                            else
                                echo "Node.js already installed: $(node -v)"
                            fi

                            # Install PM2 globally if not present
                            if ! command -v pm2 &> /dev/null; then
                                echo "PM2 not found. Installing PM2..."
                                npm install -g pm2
                                pm2 startup systemd -u root --hp /root
                            else
                                echo "PM2 already installed: $(pm2 -v)"
                            fi
                        '
                    '''
                }
            }
        }

        // ==========================================
        // DEVELOPMENT DEPLOYMENT (Runs on 'development' or 'dev' branch)
        // ==========================================
        stage('Deploy to Development') {
            when {
                anyOf {
                    branch 'development'
                    branch 'dev'
                }
            }
            steps {
                sshagent(credentials: ['nginx-ssh-key']) {
                    sh '''
                        echo "Deploying to DEVELOPMENT environment..."
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} \
                            "mkdir -p ${DEV_WEB_DIR} && rm -rf ${DEV_WEB_DIR}/.next ${DEV_WEB_DIR}/public"
                        rsync -avz \
                            -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no" \
                            .env.production .next package.json package-lock.json next.config.mjs public \
                            ${NGINX_USER}@${NGINX_SERVER_IP}:${DEV_WEB_DIR}/
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} \
                            "cd ${DEV_WEB_DIR} && npm install --production && (pm2 delete comfortair-dev 2>/dev/null; pm2 start npm --name comfortair-dev -- start -- -p ${DEV_PORT}) && pm2 save && sleep 2 && pm2 status"
                    '''
                }
            }
        }

        // ==========================================
        // STAGING DEPLOYMENT (Only runs on 'staging' branch)
        // ==========================================
        stage('Deploy to Staging') {
            when {
                branch 'staging'
            }
            steps {
                sshagent(credentials: ['nginx-ssh-key']) {
                    sh '''
                        echo "Deploying to STAGING environment..."
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} \
                            "mkdir -p ${STAGING_WEB_DIR} && rm -rf ${STAGING_WEB_DIR}/.next ${STAGING_WEB_DIR}/public"
                        rsync -avz \
                            -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no" \
                            .env.production .next package.json package-lock.json next.config.mjs public \
                            ${NGINX_USER}@${NGINX_SERVER_IP}:${STAGING_WEB_DIR}/
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} \
                            "cd ${STAGING_WEB_DIR} && npm install --production && (pm2 delete comfortair-staging 2>/dev/null; pm2 start npm --name comfortair-staging -- start -- -p ${STAGING_PORT}) && pm2 save && sleep 2 && pm2 status"
                    '''
                }
            }
        }

        // ==========================================
        // PRODUCTION DEPLOYMENT (Only runs on 'main' branch)
        // ==========================================
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                input message: 'Are you sure you want to deploy comfortair.co.in to LIVE PRODUCTION?'
                
                sshagent(credentials: ['nginx-ssh-key']) {
                    sh '''
                        echo "Deploying to PRODUCTION environment..."
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} \
                            "mkdir -p ${PROD_WEB_DIR} && rm -rf ${PROD_WEB_DIR}/.next ${PROD_WEB_DIR}/public"
                        rsync -avz \
                            -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no" \
                            .env.production .next package.json package-lock.json next.config.mjs public \
                            ${NGINX_USER}@${NGINX_SERVER_IP}:${PROD_WEB_DIR}/
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${NGINX_USER}@${NGINX_SERVER_IP} \
                            "cd ${PROD_WEB_DIR} && npm install --production && (pm2 delete comfortair-prod 2>/dev/null; pm2 start npm --name comfortair-prod -- start -- -p ${PROD_PORT}) && pm2 save && sleep 2 && pm2 status"
                    '''
                }
            }
        }

        stage('Debug') {
            steps {
                sh '''
                    echo "SSH_PORT=${SSH_PORT}"
                    echo "NGINX_USER=${NGINX_USER}"
                    echo "NGINX_SERVER_IP=${NGINX_SERVER_IP}"

                    which rsync || true
                    which ssh || true
                '''
            }
        }
    }
}

 