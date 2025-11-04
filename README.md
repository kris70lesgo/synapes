# 🧠 Synapes - AI Playbook Extraction System

> Transform documentation into actionable playbooks using AI

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-PostgreSQL-orange)](https://www.timescale.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)](https://openai.com/)

## 🎯 What is Synapes?

Synapes automatically extracts structured operational playbooks from your documentation using AI. It analyzes markdown files, deployment guides, runbooks, and other docs to create searchable, actionable playbooks with:

- **Step-by-step instructions** - Clear, executable commands
- **Common failure modes** - Known issues and solutions
- **Vector embeddings** - Semantic search capabilities
- **User feedback** - Continuous improvement loop

## ✨ Features

- 🤖 **AI-Powered Extraction** - GPT-4o-mini converts docs to playbooks
- 🔍 **Vector Search** - Semantic search using pgvector embeddings
- 📊 **Admin Dashboard** - Monitor and trigger extractions
- 💬 **Feedback System** - Learn what's helpful
- 🎨 **Beautiful UI** - Modern design with GridScan animation
- ⚡ **Fast & Scalable** - Built on Next.js + TimescaleDB

## 🚀 Quick Start

**👉 READ THIS FIRST: [START_HERE.md](START_HERE.md)**

### Prerequisites
- Node.js 18+
- Tiger Cloud database (TimescaleDB)
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd synapes

# Install dependencies
npm install

# Configure environment variables
# Edit .env.local with your credentials:
# - DATABASE_URL (from Tiger Cloud)
# - OPENAI_API_KEY (from OpenAI)

# Start development server
npm run dev
```

Visit: http://localhost:3000

## 📖 Documentation

- **[START_HERE.md](START_HERE.md)** - Complete getting started guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[STATUS.md](STATUS.md)** - Current project status

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              NEXT.JS APP                     │
│  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │  Admin   │  │Playbooks│  │  Detail   │  │
│  └────┬─────┘  └────┬────┘  └─────┬─────┘  │
└───────┼─────────────┼─────────────┼─────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────┐
│              API ROUTES                      │
│  /api/extract    /api/playbooks             │
│  /api/feedback   /api/playbooks/[id]        │
└─────────────────────────────────────────────┘
        │                          │
        ▼                          ▼
┌──────────────┐          ┌──────────────┐
│ TimescaleDB  │          │  OpenAI API  │
│   (Tiger)    │          │              │
│              │          │ GPT-4o-mini  │
│ • documents  │          │ • embeddings │
│ • playbooks  │          └──────────────┘
│ • feedback   │
│ • pgvector   │
└──────────────┘
```

## 📁 Project Structure

```
synapes/
├── app/
│   ├── api/              # API routes
│   │   ├── extract/      # Extraction endpoint
│   │   ├── playbooks/    # Playbooks CRUD
│   │   └── feedback/     # Feedback submission
│   ├── admin/            # Admin panel
│   ├── playbooks/        # Playbooks UI
│   ├── layout.tsx
│   └── page.tsx          # Home page
├── lib/
│   ├── db.ts            # Database utilities
│   ├── openai.ts        # AI integration
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
├── components/          # React components
├── .env.local          # Environment variables
└── package.json
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extract` | GET | Check database status |
| `/api/extract` | POST | Run playbook extraction |
| `/api/playbooks` | GET | List all playbooks |
| `/api/playbooks/[id]` | GET | Get single playbook |
| `/api/feedback` | POST | Submit feedback |

## 🎨 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: TimescaleDB (PostgreSQL + pgvector)
- **AI**: OpenAI GPT-4o-mini + text-embedding-3-small
- **Animation**: Framer Motion, GSAP
- **Deployment**: Vercel

## 📊 Database Schema

```sql
-- Documents (source material)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  source TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playbooks (extracted data)
CREATE TABLE playbooks (
  id SERIAL PRIMARY KEY,
  task_name TEXT,
  steps JSONB,
  common_failures JSONB,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback (user input)
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  playbook_id INTEGER REFERENCES playbooks(id),
  user_query TEXT,
  was_helpful BOOLEAN,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Development Roadmap

### ✅ Day 1: Foundation (Complete)
- [x] Next.js architecture
- [x] Database integration
- [x] OpenAI integration
- [x] API routes
- [x] Admin panel
- [x] Playbooks UI

### 📅 Day 2: Testing & Refinement
- [ ] Environment configuration
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Error handling

### 📅 Day 3: Features & Polish
- [ ] Semantic search
- [ ] Real-time progress
- [ ] Search filters
- [ ] Export functionality
- [ ] Mobile optimization

### 📅 Day 4: Deploy & Launch
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation finalization

## 🤝 Contributing

Contributions are welcome! Please read the setup docs first.

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [TimescaleDB](https://www.timescale.com/)
- AI by [OpenAI](https://openai.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Ready to get started?** Read [START_HERE.md](START_HERE.md) for complete setup instructions!
