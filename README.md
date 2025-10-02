## ApplyX - Intelligent Job Application Automation

### Stack
- Frontend: Next.js 14 App Router, Tailwind
- Backend: Edge/Node API routes (Vercel)
- DB: Supabase (Postgres)
- Queue: Upstash QStash (HTTP fanout)
- Storage: Cloudflare R2 (future)
- AI: OpenAI (resume parsing)
- Automation: Playwright (GitHub Actions)
- MCP: Model Context Protocol server

### Environment
Create `.env.local` and set values:

```
NEXT_PUBLIC_URL=http://localhost:3000

# Use Ollama locally (free)
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1:8b
OPENAI_API_KEY=ollama

# Supabase (choose Cloud free tier or Local CLI)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

### Supabase
Run the schema locally or via SQL editor:

```
supabase/schema.sql
```

### Development
```
npm run dev
```

Upload a PDF resume on the homepage. Parsed profile preview should appear.

### Build scraper & MCP
```
npm run build:scraper
npm run build:mcp
```

### GitHub Actions (optional, free schedule)
Add repository Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. The workflow runs every 3 hours and calls the scraper. QStash is not required.

### MCP Config (optional)
Example client config:

```
{
  "mcpServers": {
    "applyx": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": { "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}" }
    }
  }
}
```
