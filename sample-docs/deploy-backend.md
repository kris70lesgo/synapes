# Sample Document: Deploy Backend Service

## Overview
This document describes how to deploy the backend API service to production.

## Prerequisites
- Docker installed
- Access to production server
- Environment variables configured

## Steps

### 1. Build the Docker Image
```bash
docker build -t backend-api:latest .
```

### 2. Tag for Registry
```bash
docker tag backend-api:latest registry.company.com/backend-api:latest
```

### 3. Push to Registry
```bash
docker push registry.company.com/backend-api:latest
```

### 4. Deploy to Production
```bash
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/backend-api
```

### 5. Verify Deployment
```bash
curl https://api.production.com/health
```

## Common Issues

### Issue: Image build fails
**Fix**: Clear Docker cache with `docker system prune -a`

### Issue: Pod fails to start
**Fix**: Check logs with `kubectl logs -f deployment/backend-api` and verify environment variables

### Issue: Health check fails
**Fix**: Ensure database connection is working and all required services are running
