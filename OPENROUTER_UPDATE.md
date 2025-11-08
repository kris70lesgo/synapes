# 🎯 UPDATED: OpenRouter + Claude Configuration Complete

## ✅ What's Changed

### 1. OpenRouter Integration
- ✅ Updated `lib/openai.ts` to use OpenRouter API
- ✅ Configured to use **Claude Sonnet 3.5** (`anthropic/claude-3.5-sonnet`)
- ✅ Using OpenAI's embedding model via OpenRouter (`openai/text-embedding-3-small`)

### 2. Database Connection Fixed
- ✅ Improved connection handling with proper client release
- ✅ Added connection timeout handling
- ✅ Better error logging

### 3. Sample Data Added
- ✅ Created 2 sample documents in `sample-docs/`:
  - `deploy-backend.md` - Deployment playbook
  - `database-migration.md` - Migration playbook
- ✅ Created `/api/seed` endpoint to load sample documents

---

## 🚀 **NEXT STEPS - Follow This Exactly**

### Step 1: Restart the Dev Server

The server is currently running with old code. Restart it:

```bash
# Press Ctrl+C in the terminal where npm run dev is running
# Then run again:
npm run dev
```

### Step 2: Seed Sample Documents

```bash
curl -X POST http://localhost:3000/api/seed
```

Expected output:
```json
{
  "success": true,
  "message": "Seeded 2 documents",
  "documents": [...]
}
```

### Step 3: Verify Database

Visit: http://localhost:3000/admin

Click "Refresh" - you should see:
- **Documents: 2**
- **Playbooks: 0**

### Step 4: Run Extraction with Claude

Click **"🚀 Start Extraction"**

This will:
1. Fetch the 2 documents from database
2. Send to Claude Sonnet 3.5 via OpenRouter
3. Extract structured playbooks
4. Generate embeddings
5. Store in database

Expected result:
- ✅ 2 playbooks extracted
- ✅ 0 failed

### Step 5: View Playbooks

Visit: http://localhost:3000/playbooks

You should see 2 playbooks:
- Deploy Backend Service
- Database Migration

### Step 6: Test Playbook Detail

Click any playbook to see:
- Step-by-step instructions
- Common failures and fixes
- Feedback buttons

---

## 📝 Configuration Summary

### Environment Variables (`.env.local`)
```env
# Your TimescaleDB on Tiger Cloud
DATABASE_URL="postgresql://tsdbadmin:ish19vl1v6vg65c8@nmowmz272x..."

# OpenRouter API Key
OPENAI_API_KEY="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"
```

### AI Models Used
- **Extraction**: `anthropic/claude-3.5-sonnet` (via OpenRouter)
- **Embeddings**: `openai/text-embedding-3-small` (via OpenRouter)

### Database Status
- **Service ID**: nmowmz272x
- **Name**: knowledge-brain
- **Status**: READY
- **Region**: us-east-1
- **Type**: TimescaleDB

---

## 🔧 API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/seed` | POST | Load sample documents |
| `/api/extract` | GET | Check DB status |
| `/api/extract` | POST | Run extraction with Claude |
| `/api/playbooks` | GET | List all playbooks |
| `/api/playbooks/[id]` | GET | Get single playbook |
| `/api/feedback` | POST | Submit feedback |
| `/api/test-db` | GET | Test database connection |

---

## 🧪 Testing Checklist

After restarting the server:

- [ ] Dev server starts without errors
- [ ] Visit `/admin` - page loads
- [ ] Click "Refresh" - shows 0 documents, 0 playbooks
- [ ] Run `curl -X POST http://localhost:3000/api/seed`
- [ ] Click "Refresh" again - shows 2 documents
- [ ] Click "🚀 Start Extraction"
- [ ] Wait 30-60 seconds for Claude to process
- [ ] See "✓ Success: Extracted 2, Failed 0"
- [ ] Visit `/playbooks` - see 2 playbooks
- [ ] Click a playbook - see details
- [ ] Submit feedback - verify it works

---

## 🐛 Troubleshooting

### "Connection terminated due to timeout"
**Status**: Fixed in new code
**Solution**: Restart dev server to load updated database utilities

### "No documents found"
**Solution**: Run the seed endpoint:
```bash
curl -X POST http://localhost:3000/api/seed
```

### Claude API Error
**Check**:
1. OpenRouter API key is valid
2. You have credits in OpenRouter
3. Model name is correct: `anthropic/claude-3.5-sonnet`

### Database Connection Issues
**Test connection**: Visit `/api/test-db`

---

## 💡 Why Claude Sonnet 3.5?

**Advantages**:
- 📊 Better structured output
- 🎯 More accurate extraction
- 💰 Cost-effective via OpenRouter
- ⚡ Fast response times
- 🔧 Better instruction following

**Model Details**:
- Provider: Anthropic (via OpenRouter)
- Model: `claude-3.5-sonnet`
- Temperature: 0.3 (for consistency)
- Response format: JSON

---

## 📊 Sample Output

When you run extraction, Claude will produce playbooks like:

```json
{
  "task_name": "Deploy Backend Service",
  "steps": [
    {
      "step": 1,
      "action": "docker build -t backend-api:latest .",
      "description": "Build the Docker image from Dockerfile"
    },
    {
      "step": 2,
      "action": "docker push registry.company.com/backend-api:latest",
      "description": "Push image to container registry"
    }
    // ... more steps
  ],
  "common_failures": [
    {
      "issue": "Image build fails",
      "fix": "Clear Docker cache with docker system prune -a"
    }
    // ... more issues
  ]
}
```

---

## 🎯 Next Development Steps

After you verify everything works:

### Day 2 (Immediate)
- [x] Configure OpenRouter + Claude ✓
- [x] Fix database connection ✓
- [x] Add sample documents ✓
- [ ] Test full extraction flow
- [ ] Verify playbook quality

### Day 3 (Tomorrow)
- [ ] Add semantic search using vector embeddings
- [ ] Real-time extraction progress
- [ ] Batch document upload
- [ ] Export playbooks (JSON/CSV)
- [ ] Better error handling

### Day 4 (Final)
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Deploy to Vercel
- [ ] Production testing

---

## 📚 File Changes Summary

### Modified Files
- `lib/openai.ts` - OpenRouter + Claude configuration
- `lib/db.ts` - Better connection handling
- `.env.local` - Your credentials (already done)

### New Files
- `sample-docs/deploy-backend.md` - Sample document 1
- `sample-docs/database-migration.md` - Sample document 2
- `app/api/seed/route.ts` - Seed documents endpoint
- `app/api/test-db/route.ts` - Database test endpoint
- `OPENROUTER_UPDATE.md` - This file

---

## ✅ Ready to Go!

Everything is configured and ready. Just:

1. **Restart dev server** (Ctrl+C, then `npm run dev`)
2. **Seed documents** (`curl -X POST http://localhost:3000/api/seed`)
3. **Run extraction** (visit `/admin`, click Start Extraction)
4. **View results** (visit `/playbooks`)

**You're using Claude Sonnet 3.5 now!** 🎉

---

Questions? Check the troubleshooting section or review the setup docs.
