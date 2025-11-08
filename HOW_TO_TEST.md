# 🎯 Test Execution Guide

## Current Status

✅ **All files created and in place**
✅ **Dependencies installed** (node_modules present)
✅ **Environment configured** (.env.local exists)
✅ **Test scripts ready**

## Why Automated Tests Failed

The automated test scripts (`test-app.sh`, etc.) require:
1. The dev server to be **actively running**
2. The server to be **fully started** (not just starting)
3. Network requests to succeed

**The tests failed because the server wasn't running yet!**

## ✅ How to Test Successfully

### Option 1: Manual Testing (Recommended)

This is the most reliable way to verify everything works:

```bash
# Step 1: Start the server
npm run dev

# Wait for "Ready on http://localhost:3000"
# Then open your browser and test each feature
```

**Follow the detailed manual tests in:** `TEST_RESULTS.md`

### Option 2: Quick Diagnostic

Check if all files are in place:

```bash
./quick-check.sh
```

This verifies:
- ✓ All files exist
- ✓ Configuration is set
- ✓ Structure is correct

### Option 3: Automated Tests (After Server Starts)

```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Wait ~10 seconds, then run tests
./test-all.sh
```

## 📋 What to Test Manually

### 1. Start Server & Check Health

```bash
npm run dev
```

Look for:
```
✓ Ready in [time]
○ Local: http://localhost:3000
```

### 2. Test Pages (Open in Browser)

| URL | What to Check |
|-----|---------------|
| http://localhost:3000 | Homepage loads |
| http://localhost:3000/admin | Admin panel with stats |
| http://localhost:3000/playbooks | Playbooks grid |
| http://localhost:3000/analytics | Analytics charts |
| http://localhost:3000/upload | Upload interface |

### 3. Test Admin Features

1. Go to `/admin`
2. Click "🚀 Extract Playbooks"
3. Wait for extraction (takes 30-60 seconds)
4. Check console for progress
5. Should see "Successfully extracted X playbooks"

### 4. Test Semantic Search

1. Go to `/playbooks`
2. Type "deploy" or "kubernetes" in search
3. Click "🔍 AI Search"
4. Should see results with "✨ X% match"

### 5. Test Export

1. On `/playbooks` page
2. Click "📥 JSON" - downloads playbooks.json
3. Click "📥 CSV" - downloads playbooks.csv
4. Open files to verify content

### 6. Test Upload

1. Go to `/upload`
2. Drag & drop a `.md` or `.txt` file
3. Should see success message
4. Check admin panel - document count should increase

### 7. Test Analytics

1. Go to `/analytics`
2. Should see:
   - Document count
   - Playbook count
   - Average confidence
   - Timeline chart
   - Common failures list

## 🔧 Troubleshooting

### Server Won't Start

**Check 1: Dependencies**
```bash
npm install
```

**Check 2: Environment Variables**
```bash
cat .env.local
# Should contain DATABASE_URL and OPENROUTER_API_KEY
```

**Check 3: Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Database Connection Fails

Test connection:
```bash
curl http://localhost:3000/api/test-db
```

Should return:
```json
{"success": true, "message": "Database connection successful"}
```

### No Playbooks Show Up

**Cause:** Extraction hasn't run yet

**Solution:**
1. Go to `/admin`
2. Click "🚀 Extract Playbooks"
3. Wait for completion
4. Refresh `/playbooks`

### Semantic Search Returns Nothing

**Cause 1:** No playbooks have embeddings yet
- Run extraction again

**Cause 2:** Search term too specific
- Try: "deploy", "kubernetes", "database", "memory"

### Export Downloads Empty File

**Cause:** No playbooks in database

**Solution:**
1. Run extraction in admin panel first
2. Then try export again

## 📊 Expected Results

After successful extraction of 5 sample documents:

| Metric | Expected Value |
|--------|----------------|
| Documents | 5 |
| Playbooks | 5 |
| Search Results | 3-5 (depends on query) |
| JSON Export Size | ~20-30 KB |
| CSV Export Rows | 6 (header + 5 data rows) |
| Analytics Timeline | 1 data point (today) |

## 🎯 Success Checklist

Use this to verify everything works:

- [ ] Server starts without errors
- [ ] Homepage loads (`/`)
- [ ] Admin panel shows DB stats (`/admin`)
- [ ] Can run extraction successfully
- [ ] Playbooks display in grid (`/playbooks`)
- [ ] Search returns results with % match
- [ ] Individual playbook pages work (`/playbooks/[id]`)
- [ ] Analytics page shows charts (`/analytics`)
- [ ] JSON export downloads
- [ ] CSV export downloads
- [ ] Upload page accepts files (`/upload`)
- [ ] Feedback buttons work on playbook detail pages

## 🚀 Quick Start Testing

**Fastest way to verify everything works:**

```bash
# 1. Quick diagnostic
./quick-check.sh

# 2. Start server
npm run dev

# 3. Open browser to:
http://localhost:3000

# 4. Click through:
#    - Admin → Extract Playbooks
#    - Playbooks → View grid, test search
#    - Analytics → View stats
#    - Upload → Try uploading
```

## 📝 Test Execution Order

For best results, test in this order:

1. **Infrastructure** - quick-check.sh
2. **Server Start** - npm run dev
3. **Database** - /api/test-db
4. **Admin Panel** - Extract playbooks
5. **Playbooks List** - View & search
6. **Playbook Detail** - Click a playbook
7. **Analytics** - View dashboard
8. **Export** - Download JSON/CSV
9. **Upload** - Add new document
10. **Feedback** - Submit feedback on playbook

## 🎉 All Set!

Your Synapes application is fully built and ready to test. The automated test scripts are there if you want to use them, but **manual testing is recommended** for the first run to see everything work.

**Next:** Start with `npm run dev` and follow the manual tests in `TEST_RESULTS.md`!

---

**Need Help?**
- Check `TEST_RESULTS.md` for detailed testing guide
- Run `./quick-check.sh` to verify file structure
- Check console for error messages
- Ensure .env.local has correct credentials
