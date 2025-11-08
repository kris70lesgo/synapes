# Sample Document: Database Migration

## Overview
Steps to run database migrations safely in production.

## Prerequisites
- Database backup completed
- Migration scripts tested in staging
- Maintenance window scheduled

## Steps

### 1. Backup Database
```bash
pg_dump -h prod-db.company.com -U admin -d mydb > backup_$(date +%Y%m%d).sql
```

### 2. Put Application in Maintenance Mode
```bash
kubectl scale deployment/backend-api --replicas=0
```

### 3. Run Migrations
```bash
npm run migrate:up
```

### 4. Verify Migration
```bash
psql -h prod-db.company.com -U admin -d mydb -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"
```

### 5. Restart Application
```bash
kubectl scale deployment/backend-api --replicas=3
```

### 6. Smoke Test
```bash
curl https://api.production.com/health
curl https://api.production.com/api/users/1
```

## Common Issues

### Issue: Migration fails midway
**Fix**: Rollback with `npm run migrate:down` and restore from backup: `psql -h prod-db.company.com -U admin -d mydb < backup_YYYYMMDD.sql`

### Issue: Application can't connect after migration
**Fix**: Check connection string and ensure new schema changes are compatible with app version

### Issue: Performance degradation
**Fix**: Run `VACUUM ANALYZE` on affected tables and rebuild indexes if needed
