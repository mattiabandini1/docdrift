# AGENTS.md — DocDrift

Questo file è la fonte di verità per qualsiasi agente AI (Claude Code, Cursor, Copilot, ecc.)
che lavora su questo repository. **Leggilo sempre per intero prima di toccare qualsiasi file.**

---

## 1. Cos'è DocDrift

DocDrift è un Micro-SaaS che sincronizza automaticamente la documentazione di un repository
con il codice sorgente. Quando una Pull Request viene mergiata su GitHub, DocDrift:

1. Analizza il diff della PR
2. Identifica le sezioni della documentazione impattate (README interno e/o doc pubblica)
3. Genera una bozza aggiornata tramite LLM
4. Apre una PR separata sul repo dell'utente con le modifiche alla doc

**Utente target:** team di sviluppo da 2–15 persone, indie developer con prodotti SaaS attivi.
**Pain point risolto:** la documentazione che diventa obsoleta dopo ogni merge.
**Modello di business:** SaaS con abbonamento mensile ($12/mese per 3 repo, $29/mese illimitati).

---

## 2. Stack tecnologico

| Layer | Tecnologia | Motivo |
|---|---|---|
| Frontend + API Routes | Next.js 14 (App Router, TypeScript) | Full-stack in un solo repo, deploy su Vercel |
| Database + Auth | Supabase (PostgreSQL + Auth) | Free tier generoso, RLS nativa, realtime |
| Email transazionale | Resend | 3.000 email/mese gratis, SDK TypeScript |
| Pagamenti | Stripe | Standard de facto, webhook affidabili |
| Integrazione GitHub | GitHub App (Octokit) | Webhook PR, apertura PR automatica |
| LLM | Anthropic Claude API (claude-haiku per matching, claude-sonnet per generazione) | Costo/qualità ottimale |
| Deploy | Vercel (frontend + API) | Free tier, zero config, edge functions |
| Embedding / Ricerca semantica | Supabase pgvector + OpenAI text-embedding-3-small | Già incluso in Supabase |

---

## 3. Struttura del repository

```
docdrift/
├── AGENTS.md                  ← questo file, leggilo sempre
├── ROADMAP.md                 ← piano di sviluppo per fasi
├── .env.local                 ← variabili d'ambiente necessarie (mai committare .env)
├── app/                       ← Next.js App Router
│   ├── (auth)/                ← pagine di autenticazione
│   ├── (dashboard)/           ← area loggata: repos, impostazioni, preview
│   ├── api/                   ← API Routes
│   │   ├── webhooks/
│   │   │   └── github/        ← endpoint webhook GitHub App
│   │   ├── stripe/            ← webhook Stripe
│   │   └── repos/             ← CRUD repos collegati
│   └── layout.tsx
├── lib/
│   ├── supabase/              ← client Supabase (server e browser)
│   ├── github/                ← logica GitHub App (Octokit, diff parsing)
│   ├── llm/                   ← wrapper Anthropic API
│   ├── embeddings/            ← logica di matching semantico
│   └── stripe/                ← helper Stripe
├── components/                ← componenti React riutilizzabili
├── supabase/
│   └── migrations/            ← migration SQL versionate
├── docs/                      ← documentazione interna del progetto
└── __tests__/                 ← test (Vitest)
```

---

## 4. Convenzioni di codice — OBBLIGATORIE

### Generali
- **TypeScript strict mode sempre attivo.** Nessun `any` esplicito. Se il tipo non è chiaro, usa `unknown` e gestiscilo.
- **Nessun `console.log` in produzione.** Usa il logger interno in `lib/logger.ts` (da creare nella fase 1).
- **Commenti in inglese** nel codice. La comunicazione con l'utente (UI, email) è in inglese.
- Ogni funzione pubblica deve avere un JSDoc minimo con `@param` e `@returns`.
- Naming: `camelCase` per variabili e funzioni, `PascalCase` per componenti e tipi, `SCREAMING_SNAKE_CASE` per costanti.

### API Routes (Next.js)
- Ogni route deve validare l'input con **Zod** prima di qualsiasi altra operazione.
- Risposta di errore sempre in formato `{ error: string, code: string }`.
- Risposta di successo sempre in formato `{ data: T }`.
- Autenticazione: usa sempre il middleware Supabase SSR, mai fidarsi del solo cookie lato client.

### Database (Supabase)
- **Ogni tabella ha RLS abilitato.** Nessuna tabella senza policy RLS.
- Le migration sono file SQL numerati: `001_init.sql`, `002_add_repos.sql`, ecc.
- Nessuna query raw nelle API route: usa sempre le funzioni helper in `lib/supabase/`.
- I campi sensibili (token, chiavi) non vanno mai in chiaro nel DB — usa la encryption di Supabase Vault.

### Gestione degli errori
- Nessun `try/catch` vuoto. Ogni errore catturato deve essere loggato e restituito in modo utile.
- Gli errori webhook (GitHub, Stripe) devono restituire HTTP 200 con body di errore — non 500, altrimenti i provider fanno retry infiniti.

---

## 5. Flusso critico: webhook → PR di doc

Questo è il cuore del prodotto. Ogni modifica a questo flusso richiede attenzione massima.

```
GitHub PR mergiata
       ↓
POST /api/webhooks/github
       ↓
Verifica firma HMAC (secret GitHub App)
       ↓
Estrai diff della PR (file modificati + righe cambiate)
       ↓
Carica la documentazione corrente del repo (README / docs/)
       ↓
Matching semantico: quali sezioni doc sono impattate dal diff?
(embedding del diff → cosine similarity → top 3 sezioni)
       ↓
Chiamata LLM (claude-sonnet) con:
  - diff della PR
  - sezione doc attuale
  - prompt di sistema (vedi lib/llm/prompts.ts)
       ↓
Crea branch "docdrift/update-[pr-number]" sul repo utente
       ↓
Apre PR con le modifiche generate
       ↓
Invia email di notifica all'utente (Resend)
       ↓
Salva log dell'operazione su Supabase (tabella doc_updates)
```

**Regole per modificare questo flusso:**
- Non saltare mai la verifica della firma HMAC. È la prima cosa da fare, sempre.
- Il LLM non deve mai sovrascrivere sezioni che non sono semanticamente correlate al diff.
- La PR aperta deve avere sempre una descrizione che spiega cosa è stato cambiato e perché.
- Se il LLM genera una modifica identica alla doc esistente, non aprire la PR.

---

## 6. Variabili d'ambiente

Tutte le variabili necessarie sono in `.env.local`. Prima di qualsiasi operazione che
richiede connessioni esterne, verifica che le variabili siano definite.

**Non committare mai:**
- `.env` o `.env.local`
- Chiavi API di qualsiasi provider
- Token GitHub (personali o da GitHub App)
- Chiavi Stripe (specialmente `STRIPE_SECRET_KEY`)

---

## 7. Testing

- Ogni funzione in `lib/` deve avere almeno un test unitario.
- Il flusso webhook → PR deve avere un test di integrazione con mock di GitHub API.
- Usa **Vitest** (non Jest). La configurazione è in `vitest.config.ts`.
- Prima di ogni commit su `main`, i test devono passare tutti.
- Copertura minima accettabile: 70% sulle funzioni in `lib/`.

---

## 8. Sicurezza — checklist prima di ogni deploy

- [ ] Firma HMAC webhook verificata
- [ ] Input utente validato con Zod
- [ ] RLS Supabase attiva su tutte le tabelle modificate
- [ ] Nessuna chiave in chiaro nel codice o nei log
- [ ] Rate limiting sull'endpoint webhook (max 100 req/min per IP)
- [ ] Headers di sicurezza configurati in `next.config.ts` (CSP, HSTS, X-Frame-Options)

---

## 9. Cosa NON fare — errori da evitare

- **Non usare `fetch` diretto per chiamare GitHub API.** Usa sempre Octokit tramite `lib/github/`.
- **Non chiamare il LLM direttamente nelle API route.** Passa sempre da `lib/llm/`.
- **Non modificare le migration SQL già applicate.** Crea sempre una nuova migration.
- **Non mettere logica di business nei componenti React.** I componenti ricevono dati, non li elaborano.
- **Non ignorare i rate limit di GitHub API** (5.000 req/ora per GitHub App). Implementa caching dove possibile.
- **Non aprire PR sul repo dell'utente senza che l'utente abbia connesso e autorizzato il repo** nel dashboard DocDrift.

---

## 10. Comandi utili

```bash
# Sviluppo locale
npm run dev

# Build di produzione
npm run build

# Test
npm run test
npm run test:coverage

# Linting
npm run lint

# Migration Supabase
npx supabase db push

# Generazione tipi Supabase (dopo ogni migration)
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

---

## 11. Contesto aggiuntivo per l'agente

- Questo è un progetto **solo-dev**. Soluzioni semplici e mantenibili sono sempre preferite a soluzioni eleganti ma complesse.
- Il time-to-market è critico. Quando hai due opzioni, scegli quella più veloce da implementare correttamente.
- Il prodotto è in fase MVP: **non over-engineerare**. Niente microservizi, niente queue complesse — tutto deve girare su Vercel + Supabase finché il MRR non giustifica infrastruttura più complessa.
- Se hai dubbi su una scelta architetturale, commenta il codice con `// ARCH: [dubbio]` e vai avanti con l'opzione più semplice.
- Il branch principale è `main`. I feature branch seguono il pattern `feat/[nome-feature]`.
