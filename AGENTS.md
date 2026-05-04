# AGENTS.md

This file contains configuration and guidance for AI agents working on this repository.

## Agent skills

### Issue tracker

Issues are tracked via GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout with `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

---

## Development Workflow for Agents

### First Time Setup

```bash
npm run setup        # install → rebuild sqlite → build → seed db → start server
```

This single command takes a fresh clone to a running production server with test data.

### Node.js Version

The project requires the Node.js version specified in `.nvmrc`. Use `nvm use` or `fnm use` before running any commands.

### Start / Stop Server

```bash
# Development server (hot reload, slower, error overlays)
npm run dev:bg       # starts on port 3000 in background

# Production server (requires build first, optimized)
npm run start:bg     # starts on port 3000 in background

# Stop the running server (graceful → forceful after 5s)
npm run stop

# Full restart: stop → clean cache → build → start
npm run restart

# Check if server is running and on which port
npm run status

# Tail live server logs
npm run logs
```

**Important:** Only one server instance is allowed at a time. The scripts enforce this via a `.server.pid` lock file. If you try to start a second server, you'll get a clear error message.

### Development vs Production Mode

| Command | Use When |
|---------|----------|
| `npm run dev:bg` | Active development — hot reload, friendly errors |
| `npm run start:bg` | QA testing, Lighthouse audits, verifying production builds |

### Database

```bash
# Wipe all data (requires --confirm)
npm run db:reset -- --confirm

# Populate with rich test data covering all features
npm run db:seed
```

**Seed data includes:**
- **PETR4** (Ação) — multiple buys, positive gain with live quote
- **VALE3** (Ação) — multiple buys, negative gain with live quote
- **HGLG11** (FII) — single buy, appears in FIIs tab
- **ABCD3** (Ação) — fake ticker, tests "preço não disponível" fallback
- **TEST99** (Renda Fixa) — tests non-Ação tab rendering
- **BTCETF** (ETF) — tests ETF tab rendering

### Run Tests

```bash
npm test             # full test suite
npm run test:watch   # watch mode
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Module did not self-register` (better-sqlite3) | Native binary compiled for different Node version | `npm run rebuild:sqlite` |
| Port 3000 in use | Another server running | `npm run stop` first |
| Stale data after edits | `.next` cache | `npm run clean` |
| Database not found | `data/` directory missing | `npm run db:seed` creates it |

### Logs

Logs rotate daily and are stored in `logs/server-YYYY-MM-DD.log`. A symlink `logs/server.log` always points to today's file. Old logs are automatically deleted after 7 days.
