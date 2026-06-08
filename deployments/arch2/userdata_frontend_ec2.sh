#!/bin/bash
dnf update -y
dnf install nginx aws-cli -y

# Sync frontend files from S3
aws s3 sync s3://office-eb-deployments-203557140324/arch2/frontend/ /usr/share/nginx/html/

# Configure Nginx for React SPA routing
cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

systemctl enable nginx
systemctl start nginx
