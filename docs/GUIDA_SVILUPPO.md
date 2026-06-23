# DocDrift — Guida Completa di Sviluppo e Lancio

**Prodotto:** DocDrift — Auto-sync della documentazione da GitHub PR  
**Stack:** Next.js 14 + Supabase + Anthropic API + Stripe  
**Obiettivo:** $1.000 MRR entro 8 settimane dal lancio  
**Modello:** $12/mese (Starter, 3 repos) · $29/mese (Pro, repo illimitati)

---

> **Come usare questa guida**
> Ogni fase ha una checklist. Spunta ogni punto solo quando è davvero completato e testato,
> non quando "sembra fatto". Alla fine di ogni fase c'è un Gate: un criterio oggettivo
> che devi soddisfare prima di passare alla fase successiva.

---

## IL TUO ARSENALE AI — Guida all'uso ottimale degli strumenti

Prima di iniziare a sviluppare, devi capire esattamente cosa hai a disposizione,
i limiti reali di ogni tool, e come usarli in modo da non sprecare quota nei momenti sbagliati.

### OpenCode Go ($10/mese, primo mese $5)

**Cos'è davvero:** un'API key unica che ti dà accesso a 14 modelli open source di qualità,
con un endpoint OpenAI-compatibile. Funziona con qualsiasi agente (OpenCode TUI, Cursor, ecc.).

**Modelli inclusi e forza per il tuo progetto:**
- `DeepSeek V4 Pro` — il più capace del bundle. Ottimo per task complessi multi-file.
- `DeepSeek V4 Flash` — veloce ed economico in termini di quota. Ideale per task ripetitivi.
- `Kimi K2.7 Code` — specializzato nel codice, ottimo per refactoring e debugging.
- `GLM-5.2 / GLM-5.1` — capacità generale elevata, buon ragionamento architetturale.
- `MiniMax M3 / M2.7` — estremamente economici in termini di quota (100K+ req/mese).
  Usali per task semplici: completamento, formattazione, piccole fix.
- `Qwen3.7 Max / Plus`, `MiMo-V2.5-Pro` — buoni per coding generale.

**Limiti reali:** $12 ogni 5 ore, $30 settimanali, $60 mensili in crediti equivalenti.
Più usi i modelli leggeri (MiniMax, Flash, Qwen Plus), più richieste ottieni.
Con MiniMax M2.7 arrivi a ~100.000 richieste/mese. Con GLM-5.2 drasticamente di meno.

**Come usarlo:** configura l'endpoint `https://opencode.ai/zen/go/v1/chat/completions`
con la tua Go API key in qualsiasi agente che accetti endpoint OpenAI-compatibili.
Nel terminale OpenCode TUI: `/connect` → seleziona OpenCode Go → incolla la chiave.

**Strategia:** OpenCode Go è il tuo **cavallo di battaglia quotidiano** per tutto il coding
di routine. Usa i modelli pesanti (DeepSeek V4 Pro, Kimi K2.7 Code) solo per i task difficili.
Per il resto, MiniMax M3 e DeepSeek V4 Flash ti fanno durare il mese senza problemi.

---

### Antigravity 2.0 (Google AI Pro $20/mese — già pagato)

**Cos'è davvero:** la piattaforma agentica di Google, alimentata da Gemini 3.5 Flash
come modello principale, con accesso anche a Gemini 3 Pro e Claude 4.5 Sonnet (sì, Claude
è disponibile dentro Antigravity sul piano Pro). Multi-agent: può orchestrare più agenti
in parallelo su task diversi.

**Situazione dei limiti (importante):** i limiti di Antigravity Pro sono stati
controversi nel 2026. Il piano Pro ($20/mese) dà una quota che si rinnova ogni 5 ore,
ma c'è anche un cap settimanale che può far scattare lockout di diversi giorni se vai pesante.
Google ha triplicato i limiti a maggio 2026 dopo le proteste della community, ma restano
più bassi di prima del marzo 2026. Utenti heavy riportano ancora lockout.

**Modelli disponibili su Pro:** Gemini 3.5 Flash (principale, economico), Gemini 3 Pro
(più capace, pesa di più sulla quota), Claude 4.5 Sonnet (accesso limitato), GPT-OSS 120B.

**Nota Gemini CLI:** il Gemini CLI è stato dismesso il 18 giugno 2026 per i consumer.
Se lo usavi, devi migrare all'Antigravity CLI. Le conversazioni sono in `~/.gemini/antigravity-backup/`.

**Strategia:** usa Antigravity per i **task di alto livello che richiedono ragionamento
architetturale** e per sessioni di pianificazione, non per il coding di routine.
Il suo multi-agent è ottimo per task paralleli (es. scrivere test mentre un altro agente
scrive il codice). Risparmia la quota settimanale per i momenti in cui ne hai davvero bisogno.
**Non usarlo mai per task semplici** — bruceresti la quota in poche ore.

---

### Codex (free tier ChatGPT)

**Cos'è davvero:** l'agente coding di OpenAI, incluso nel piano ChatGPT Free a $0.
Accesso a GPT-5.x in modalità coding agent, con CLI, VS Code extension, e interfaccia web.
Il free tier è il più piccolo di tutti i piani (da aprile 2026 è token-based, non più
a messaggi fissi), ma è permanente — non è un trial.

**Limiti reali free tier:** i più bassi disponibili. La finestra è di 5 ore rolling.
Per task semplici e script brevi puoi fare un buon numero di richieste; per task complessi
multi-file consumi la finestra in fretta. Niente cloud task delegation nel free tier
(solo local). Adatto per sessioni brevi e mirate.

**Strategia:** usa Codex free come **riserva di emergenza** quando hai bruciato la quota
OpenCode Go e non vuoi toccare quella di Antigravity. Ottimo per sessioni rapide di
debugging puntuale o per fare domande tecniche veloci al modello. Non basarci per
sessioni di sviluppo lunghe — la quota free non lo regge.

---

### Workflow ottimale per non sprecare quota

```
Task di routine (completamento, piccole fix, formattazione, test unitari)
    → OpenCode Go: DeepSeek V4 Flash o MiniMax M3
    → Costa pochissimo quota, puoi farne tanti

Task di coding medio (nuova feature, componente React, API route)  
    → OpenCode Go: Kimi K2.7 Code o DeepSeek V4 Pro

Task architetturali (design del DB, struttura del flusso webhook, decisioni di stack)
    → Antigravity 2.0 con Gemini 3 Pro o Claude 4.5 Sonnet
    → Usa questa quota con parsimonia

Debugging difficile su errori oscuri
    → Prima: OpenCode Go con DeepSeek V4 Pro (spesso basta)
    → Se non risolve: Antigravity con un agente dedicato

Codex free
    → Riserva. Usalo solo se hai bruciato tutto il resto.

Sessioni di pianificazione e revisione architettura (conversazione, non codice)
    → Parla con me (Claude in chat) — non consuma nessuna delle tue quote di coding
```

---

## FASE 0 — Setup (Giorni 1–2)

L'obiettivo di questa fase è avere tutto l'ambiente configurato e funzionante
prima di scrivere una sola riga di codice del prodotto.

### Account e servizi da creare
- [ ] Account Supabase — crea un nuovo progetto chiamato `docdrift`
- [ ] Account Vercel — collega il tuo GitHub
- [ ] Account Resend — verifica il tuo dominio email (o usa il sandbox per ora)
- [ ] Account Stripe — crea account in modalità test
- [ ] Compra il dominio `docdrift.dev` (o equivalente disponibile) su Cloudflare o Namecheap
- [ ] Crea una GitHub App nel tuo account GitHub
- [ ] Sottoscrivi OpenCode Go ($5 il primo mese) e configura la chiave API nel tuo agente preferito

### Repository
- [ ] Crea il repo `docdrift` su GitHub (privato per ora)
- [ ] Inizializza con `npx create-next-app@latest docdrift --typescript --tailwind --app`
- [ ] Copia `AGENTS.md` e `.env.example` nella root del progetto
- [ ] Crea `.env.local` da `.env.example` e riempilo con le chiavi reali
- [ ] Primo commit: `chore: initial setup`
- [ ] Configura il deploy automatico su Vercel collegando il repo

### Configurazione GitHub App
- [ ] Vai su github.com/settings/apps → New GitHub App
- [ ] Nome: `DocDrift`
- [ ] Webhook URL: `https://[tuo-progetto].vercel.app/api/webhooks/github`
- [ ] Permessi: `Pull requests: Read & Write`, `Contents: Read & Write`, `Metadata: Read`
- [ ] Sottoscrivi evento: `Pull request` (solo `closed` con `merged: true`)
- [ ] Salva App ID e genera chiave privata (.pem) → metti in `.env.local`

### Database Supabase — tabelle iniziali

**Agente consigliato per questa fase:** OpenCode Go con **DeepSeek V4 Pro**
(le migration SQL richiedono ragionamento preciso, non usare modelli leggeri)

- [ ] Abilita l'estensione `pgvector` in Supabase (Database → Extensions)
- [ ] Crea la migration `001_init.sql` con queste tabelle:
  ```sql
  -- Utenti (estende auth.users di Supabase)
  create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text default 'free' check (plan in ('free', 'starter', 'pro')),
    created_at timestamptz default now()
  );

  -- Repository collegati
  create table public.repos (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    github_repo_id bigint not null,
    full_name text not null,
    doc_mode text default 'internal'
      check (doc_mode in ('internal', 'public', 'both')),
    doc_paths jsonb default '["README.md"]',
    installation_id bigint,
    is_active boolean default true,
    created_at timestamptz default now(),
    unique(user_id, github_repo_id)
  );

  -- Log degli aggiornamenti doc generati
  create table public.doc_updates (
    id uuid default gen_random_uuid() primary key,
    repo_id uuid references public.repos(id) on delete cascade,
    github_pr_number integer not null,
    github_pr_title text,
    doc_pr_url text,
    status text default 'pending'
      check (status in ('pending', 'generated', 'skipped', 'error')),
    error_message text,
    tokens_used integer,
    created_at timestamptz default now()
  );

  -- RLS
  alter table public.profiles enable row level security;
  alter table public.repos enable row level security;
  alter table public.doc_updates enable row level security;

  create policy "Users see own profile" on public.profiles
    for all using (auth.uid() = id);
  create policy "Users manage own repos" on public.repos
    for all using (auth.uid() = user_id);
  create policy "Users see own updates" on public.doc_updates
    for select using (
      repo_id in (select id from public.repos where user_id = auth.uid())
    );
  ```
- [ ] Applica la migration: `npx supabase db push`
- [ ] Genera tipi TypeScript: `npx supabase gen types typescript --local > lib/supabase/database.types.ts`

### ✅ Gate Fase 0
> - `npm run dev` parte senza errori
> - Vercel mostra il deploy verde sulla `main`
> - Supabase ha le 3 tabelle con RLS attiva
> - Le variabili d'ambiente sono tutte valorizzate

---

## FASE 1 — Core engine (Giorni 3–10)

Il cuore del prodotto. Costruisci il flusso da "PR mergiata" a "PR di doc aperta".

### Guida agli agenti per questa fase

Questa è la fase più tecnica. Ecco come distribuire il lavoro:

| Task | Agente consigliato | Perché |
|---|---|---|
| Struttura di `lib/github/` | OpenCode Go — Kimi K2.7 Code | Specializzato nel codice, capisce bene le API REST |
| Logica HMAC e sicurezza webhook | OpenCode Go — DeepSeek V4 Pro | Richiede precisione su dettagli di sicurezza |
| Prompt di sistema LLM | **Antigravity** con Gemini 3 Pro | È un task di ragionamento, non di scrittura codice |
| Wrapper `lib/llm/` | OpenCode Go — DeepSeek V4 Pro | API call e gestione errori |
| Logica embedding + cosine similarity | OpenCode Go — Kimi K2.7 Code | Matematica applicata al codice |
| Test unitari di `lib/` | OpenCode Go — MiniMax M3 o DeepSeek Flash | Task ripetitivo, non serve un modello pesante |
| Debug difficile su errori Octokit | OpenCode Go — DeepSeek V4 Pro, poi Antigravity | Scala dalla soluzione economica a quella costosa |

### Autenticazione
- [ ] Installa `@supabase/ssr` e configura il middleware di autenticazione
- [ ] Crea le pagine `/login` e `/signup` con GitHub OAuth (il provider naturale per i tuoi utenti)
- [ ] Crea il trigger Supabase che inserisce il profilo in `public.profiles` alla registrazione
- [ ] Testa il flusso completo: signup → email di conferma → redirect al dashboard

### Lib: GitHub (`lib/github/`)
**Agente: OpenCode Go con Kimi K2.7 Code**
- [ ] Installa `@octokit/app` e `@octokit/rest`
- [ ] Crea `lib/github/client.ts`: istanza Octokit autenticata per `installation_id`
- [ ] Crea `lib/github/diff.ts`: funzione `extractDiff(owner, repo, prNumber, installationId)`
- [ ] Crea `lib/github/docs.ts`: funzione `fetchDocContent(owner, repo, paths, installationId)`
- [ ] Crea `lib/github/pr.ts`: funzione `openDocPR(...)` che:
  1. Crea branch `docdrift/update-[prNumber]`
  2. Committa le modifiche
  3. Apre una PR con titolo e descrizione standard

### Lib: LLM (`lib/llm/`)
**Agente: OpenCode Go con DeepSeek V4 Pro (per il codice) + Antigravity per raffinare il prompt**
- [ ] Installa `@anthropic-ai/sdk`
- [ ] Crea `lib/llm/prompts.ts` con il prompt di sistema (vedi AGENTS.md sezione 5)
- [ ] Crea `lib/llm/generate.ts`: funzione `generateDocUpdate(diff, currentDoc, docPath, docMode)`
- [ ] Logica anti-rumore: se la risposta è identica alla doc attuale, restituisce `null`

**Nota sul prompt:** prima di scrivere il codice del prompt, apri una sessione in Antigravity
e chiedi a Gemini 3 Pro di aiutarti a raffinare il prompt di sistema per il caso specifico
di DocDrift. È un task di ragionamento puro — non spreca quota di coding.

### Lib: Embeddings (`lib/embeddings/`)
**Agente: OpenCode Go con Kimi K2.7 Code**
- [ ] Installa `openai` (solo per gli embedding)
- [ ] Crea `lib/embeddings/match.ts`: funzione `findImpactedSections(diff, docContent)` che:
  1. Divide il documento per heading `##`
  2. Genera embedding del diff con `text-embedding-3-small`
  3. Calcola cosine similarity con ogni sezione
  4. Restituisce le top 3 sezioni con similarity > 0.3

### Webhook GitHub (`app/api/webhooks/github/route.ts`)
**Agente: OpenCode Go con DeepSeek V4 Pro — questo è il codice più critico**
- [ ] Crea l'endpoint POST
- [ ] Prima cosa nel handler: verifica firma HMAC con `GITHUB_WEBHOOK_SECRET`
- [ ] Filtra solo `pull_request` con `action: "closed"` e `merged: true`
- [ ] Recupera il repo dal DB tramite `github_repo_id`
- [ ] Se repo non trovato o `is_active` false → restituisce `{ status: "skipped" }` HTTP 200
- [ ] Esegui il flusso completo (diff → matching → LLM → PR)
- [ ] Salva risultato in `doc_updates`
- [ ] Invia email di notifica con Resend
- [ ] Usa `ngrok` in locale per testare webhook reali da GitHub

### Test unitari
**Agente: OpenCode Go con MiniMax M3 (task ripetitivo, risparmia quota)**
- [ ] Test per ogni funzione in `lib/github/` con mock Octokit
- [ ] Test per `lib/llm/generate.ts` con risposta mock dell'API
- [ ] Test per `lib/embeddings/match.ts` con vettori di esempio

### ✅ Gate Fase 1
> - Mergi una PR su un tuo repo di test e DocDrift apre automaticamente una PR di doc
> - La PR di doc generata modifica solo le sezioni pertinenti
> - Il log in `doc_updates` viene creato correttamente
> - Ricevi l'email di notifica

---

## FASE 2 — Dashboard e autenticazione (Giorni 11–17)

L'utente deve poter connettersi, configurare i repo e vedere cosa è successo.

### Guida agli agenti per questa fase

Il frontend è la parte dove i modelli open source di OpenCode Go brillano di più —
è codice strutturato e prevedibile. Risparmia Antigravity.

| Task | Agente consigliato |
|---|---|
| Componenti React / layout | OpenCode Go — DeepSeek V4 Pro o Kimi K2.7 Code |
| Stili Tailwind ripetitivi | OpenCode Go — MiniMax M3 o DeepSeek Flash |
| Logica GitHub App OAuth callback | OpenCode Go — DeepSeek V4 Pro |
| Revisione UX e suggerimenti design | **Antigravity** con Gemini 3.5 Flash (visione d'insieme) |

### Layout e navigazione
- [ ] Crea layout dashboard con sidebar: Dashboard, Repos, Activity, Settings
- [ ] Pagina `/dashboard`: stats rapide (repo collegati, aggiornamenti ultima settimana)
- [ ] Navbar con avatar utente e logout

### Gestione repo (`/dashboard/repos`)
- [ ] Lista repo collegati con status (attivo/inattivo)
- [ ] Flow installazione GitHub App:
  - Redirect a `https://github.com/apps/docdrift/installations/new`
  - Callback a `/api/github/callback` con `installation_id`
  - Salvataggio installation_id e recupero repo installati
  - Scelta dei repo da attivare
- [ ] Toggle attivo/inattivo, selezione doc mode, selezione percorsi
- [ ] Bottone "Remove" con conferma

### Activity log (`/dashboard/activity`)
- [ ] Tabella paginata dei `doc_updates`: data, repo, PR originale, PR doc generata, status
- [ ] Link cliccabili a GitHub
- [ ] Badge colorati per status

### Settings (`/dashboard/settings`)
- [ ] Modifica email di notifica
- [ ] Toggle notifiche email on/off
- [ ] Sezione "Danger zone": elimina account

### ✅ Gate Fase 2
> - Un nuovo utente può registrarsi, connettere un repo e ricevere la prima PR di doc
>   senza nessun intervento manuale da parte tua
> - Il dashboard mostra correttamente l'activity log

---

## FASE 3 — Pagamenti e piani (Giorni 18–22)

### Guida agli agenti per questa fase

| Task | Agente consigliato |
|---|---|
| Setup Stripe SDK e webhook | OpenCode Go — DeepSeek V4 Pro |
| Pagina pricing HTML/CSS | OpenCode Go — DeepSeek Flash o MiniMax M3 |
| Logica enforcement limiti piano | OpenCode Go — Kimi K2.7 Code |
| Strategia pricing e copy | **Antigravity** o chat con me — è ragionamento, non codice |

### Stripe setup
- [ ] Crea prodotti Stripe in modalità test:
  - "DocDrift Starter" → $12/mese → salva `price_id` in `.env`
  - "DocDrift Pro" → $29/mese → salva `price_id` in `.env`
- [ ] Installa `stripe` SDK
- [ ] Crea `lib/stripe/client.ts`

### Pagina pricing (`/pricing`)
- [ ] Pagina pubblica con confronto piani
- [ ] Free tier: 1 repo, max 10 aggiornamenti/mese
- [ ] Starter $12/mese: 3 repo, illimitati
- [ ] Pro $29/mese: repo illimitati, priority support
- [ ] CTA "Start free trial" (7 giorni, richiede carta)

### Checkout flow
- [ ] `POST /api/stripe/create-checkout`: crea Stripe Checkout Session
- [ ] Dopo pagamento → `/dashboard?upgraded=true` con banner benvenuto

### Webhook Stripe (`app/api/stripe/route.ts`)
- [ ] Verifica firma Stripe
- [ ] Gestione eventi:
  - `checkout.session.completed` → aggiorna `plan` in `profiles`
  - `customer.subscription.deleted` → riporta a `free`
  - `invoice.payment_failed` → email avviso

### Enforcement limiti
- [ ] Nel webhook GitHub: se utente `free` con 10 `doc_updates` nel mese → skippa + email

### ✅ Gate Fase 3
> - Checkout test completato (carta 4242 4242 4242 4242)
> - Il piano nel DB si aggiorna dopo il pagamento
> - Il downgrade funziona al webhook `subscription.deleted`

---

## FASE 4 — Polish e preparazione lancio (Giorni 23–26)

### Guida agli agenti per questa fase

Questa fase è metà codice, metà decisioni. Usa gli agenti per il codice,
usa me (Claude in chat) o Antigravity per le decisioni di prodotto e copywriting.

| Task | Agente consigliato |
|---|---|
| Loading states e gestione errori UI | OpenCode Go — DeepSeek Flash (task prevedibile) |
| Sicurezza: rate limiting webhook | OpenCode Go — DeepSeek V4 Pro |
| Headers di sicurezza `next.config.ts` | OpenCode Go — Kimi K2.7 Code |
| Copywriting homepage e tagline | **Chat con me** — è strategia, non codice |
| OG image | Genera con Figma o un tool online, non sprecare quota AI |
| Sitemap Next.js | OpenCode Go — MiniMax M3 (task semplice) |

### Qualità del prodotto
- [ ] Loading states su tutte le azioni asincrone
- [ ] Gestione errori visibile all'utente
- [ ] Test flusso completo in incognito come nuovo utente
- [ ] Test su mobile (usabile, non perfetto)
- [ ] Nessuna chiave API nei log di Vercel

### Pagine pubbliche
- [ ] Homepage (`/`): headline, demo video/GIF, pricing, FAQ, CTA
  - Headline suggerita: *"Your docs update themselves. Finally."*
  - GIF del flusso: PR mergiata → PR di doc aperta in 30 secondi
- [ ] Pagina `/changelog` per DocDrift stesso
- [ ] Pagina `/privacy` e `/terms` (usa Termly per l'MVP)

### SEO
- [ ] Meta title e description su ogni pagina pubblica
- [ ] OG image per i social
- [ ] Sitemap.xml

### Sicurezza finale
- [ ] Esegui checklist sicurezza in AGENTS.md (sezione 8)
- [ ] Rate limiting endpoint webhook (max 100 req/min per IP)
- [ ] Verifica RLS: logga con utente A e prova a chiamare API con ID di utente B

### ✅ Gate Fase 4
> - Hai fatto girare il flusso completo 5 volte senza errori
> - La homepage spiega il prodotto in meno di 10 secondi
> - Almeno 1 utente beta ha testato il prodotto in autonomia

---

## FASE 5 — Lancio e acquisizione (Giorni 27–42)

In questa fase scrivi poco codice. Il lavoro è distribuzione e conversazioni.

### Giorno del lancio (scegli martedì o mercoledì)

**Product Hunt:**
- [ ] Crea account Product Hunt almeno 2 settimane prima
- [ ] Prepara: titolo (60 car.), tagline (60 car.), descrizione, 5 screenshot, GIF demo
- [ ] Pubblica alle 00:01 Pacific Time
- [ ] Rispondi a ogni commento entro 30 minuti

**Hacker News — Show HN:**
- [ ] Titolo: `Show HN: DocDrift – GitHub PRs that auto-update your documentation`
- [ ] Pubblica tra le 9:00 e le 12:00 EST
- [ ] Rispondi a tutti i commenti, specialmente quelli critici

**Reddit:**
- [ ] r/webdev: storia su come hai risolto il problema della doc stale
- [ ] r/programming: angolo più tecnico
- [ ] r/SideProject: storia del lancio
- [ ] **Regola d'oro Reddit:** racconta la storia, non fare pubblicità

**Twitter/X:**
- [ ] Thread: "Ho mergiato 100 PR quest'anno senza aggiornare mai la doc. Allora ho costruito questo."
  - Tweet 1: il problema (storia personale)
  - Tweet 2: come funziona (GIF)
  - Tweet 3: dettagli tecnici
  - Tweet 4: link e invito

### Settimane 2–6 post-lancio

**Content marketing (1 articolo a settimana):**

Per la scrittura degli articoli, usa **Antigravity con Gemini 3.5 Flash** come sparring partner
per la struttura, poi scrivi tu il contenuto — Google penalizza i testi 100% AI.
Usa la quota Antigravity per la strategia, non per generare testo da pubblicare.

- [ ] "Why documentation is always wrong and how to fix it" → dev.to
- [ ] "How I built DocDrift in 4 weeks as a solo developer" → Indie Hackers
- [ ] "DocDrift vs. Swimm vs. manual documentation" → tuo blog

**Outreach diretto (20 contatti a settimana):**
- [ ] Cerca su GitHub repo con README datati (ultima modifica > 6 mesi, ancora attivi)
- [ ] Apri Issue cortese e personalizzata — mai template identico

**Early adopter program:**
- [ ] 3 mesi Pro gratis ai primi 10 utenti in cambio di:
  - Chiamata feedback 30 minuti
  - Testimonianza scritta se soddisfatti

---

## FASE 6 — Post-lancio e iterazione (Settimane 7–12)

### Se stai crescendo (> 20 utenti paganti)
- [ ] GitLab support
- [ ] Slack notifications
- [ ] Piano Team con fatturazione centralizzata

### Se la crescita è lenta (< 10 paganti dopo 6 settimane)
Non aggiungere feature. Invece:
- [ ] 10 chiamate con utenti che si sono registrati ma non hanno pagato
- [ ] Riscrivi la homepage con il linguaggio sentito nelle chiamate
- [ ] Considera di abbassare il prezzo temporaneamente a $9/mese

---

## Riepilogo: quale agente per cosa

| Tipo di task | Strumento | Modello |
|---|---|---|
| Coding routine (fix, completamento, test) | OpenCode Go | MiniMax M3 / DeepSeek Flash |
| Coding medio (feature, componenti, route) | OpenCode Go | Kimi K2.7 Code / DeepSeek V4 Pro |
| Codice critico (webhook, sicurezza, DB) | OpenCode Go | DeepSeek V4 Pro |
| Architettura e decisioni tecniche | Antigravity | Gemini 3 Pro |
| Raffinamento prompt LLM | Antigravity | Gemini 3 Pro o Claude 4.5 Sonnet |
| Revisione UX / design | Antigravity | Gemini 3.5 Flash |
| Copywriting e strategia prodotto | Chat con Claude | — |
| Pianificazione e domande aperte | Chat con Claude | — |
| Emergenza (quota esaurita ovunque) | Codex free | GPT-5.x |

**Regola pratica:** prima di aprire Antigravity, chiediti se potresti risolvere lo stesso
task con OpenCode Go. Se la risposta è sì, usa OpenCode Go. La quota Antigravity è il
tuo asset più prezioso per i task che davvero richiedono ragionamento profondo.

---

## Note finali

**Sul rapporto con gli agenti AI durante lo sviluppo:**
Prima di ogni sessione con qualsiasi agente, fornisci sempre il contenuto di `AGENTS.md`
come contesto. Gli agenti non hanno memoria tra sessioni diverse.

**Sul budget AI:**
- OpenCode Go: $10/mese — il tuo strumento principale
- Antigravity: già pagato nel Google AI Pro a $20/mese
- Codex: $0 (free tier)
- Total extra speso per AI sullo sviluppo di DocDrift: **$10/mese**

**Sul perfezionismo:**
Il codice dell'MVP non deve essere bello. Deve funzionare e portare i primi clienti.

**Sulla motivazione:**
Ci saranno 2–3 giorni in cui sembra che non funzioni niente. Il webhook → PR è la parte
più ostica: una volta che funziona, il resto è in discesa.
