# DocDrift — Architettura tecnica

Documento di riferimento per capire come sono collegati i pezzi del sistema.
Aggiorna questo file ogni volta che cambia qualcosa di strutturale.

---

## Diagramma del flusso principale

```
[GitHub]                    [DocDrift]                      [Utente]
   |                            |                               |
   | PR merged event            |                               |
   |--------------------------->|                               |
   |                            |                               |
   |                     Verifica HMAC                         |
   |                     Carica repo da DB                     |
   |                     Controlla piano utente                |
   |                            |                               |
   |    Fetch PR diff           |                               |
   |<---------------------------|                               |
   | diff JSON                  |                               |
   |--------------------------->|                               |
   |                            |                               |
   |    Fetch doc files         |                               |
   |<---------------------------|                               |
   | file content               |                               |
   |--------------------------->|                               |
   |                            |                               |
   |                     Matching semantico                    |
   |                     (embedding + cosine)                  |
   |                            |                               |
   |                     Chiamata Claude API                   |
   |                     → doc aggiornata                      |
   |                            |                               |
   |    Create branch           |                               |
   |<---------------------------|                               |
   |    Commit changes          |                               |
   |<---------------------------|                               |
   |    Open PR                 |                               |
   |<---------------------------|                               |
   | PR URL                     |                               |
   |--------------------------->|                               |
   |                            |                               |
   |                     Salva log in DB                       |
   |                            |                               |
   |                            | Email notifica                |
   |                            |------------------------------>|
   |                            |                               |
   |                            | [Utente vede PR su GitHub]   |
```

---

## Componenti principali

### `/app/api/webhooks/github/route.ts`
Entry point per tutti gli eventi GitHub. È il componente più critico:
deve essere veloce (GitHub aspetta risposta entro 10 secondi) e non deve mai crashare.
Se il processing è lungo, rispondi 200 subito e metti il lavoro in background.

**Nota MVP:** per l'MVP il processing è sincrono. Se supera i 10s di Vercel,
valuta di usare Vercel Edge Functions o una queue leggera (Trigger.dev free tier).

### `lib/github/`
Tutto ciò che riguarda l'interazione con GitHub. Non mettere logica di business qui:
solo operazioni atomiche (fetch diff, fetch file, create branch, open PR).

### `lib/llm/`
Wrapper intorno all'API Anthropic. Il prompt di sistema è in `prompts.ts` e
non va mai hardcodato nelle route. Ogni modifica al prompt deve essere tracciata in git.

### `lib/embeddings/`
Logica di matching semantico. Usa OpenAI solo per gli embedding (modello piccolo ed economico).
Il calcolo della cosine similarity è fatto in memoria, non serve un vector DB per l'MVP.
Supabase pgvector sarà utile quando il volume di sezioni da confrontare crescerà.

### `lib/stripe/`
Webhook Stripe e helper per creare checkout session. La logica del piano utente
(cosa può fare con il piano free vs starter vs pro) va in `lib/plans.ts` per
centralizzarla e non spargerla ovunque.

---

## Decisioni architetturali e perché

**Perché Next.js full-stack invece di backend separato?**
Per un solo-dev è più semplice avere tutto in un repo. Le API Routes di Next.js
su Vercel sono serverless e scalano automaticamente. Quando il prodotto cresce,
si può estrarre il backend senza riscrivere il frontend.

**Perché Supabase invece di Prisma + PostgreSQL hosted?**
Supabase dà Auth, RLS, realtime e pgvector già integrati. Per un MVP è imbattibile.
Il costo dello stack passa da $0 a qualcosa di significativo solo dopo $2K+ MRR.

**Perché Claude per la generazione e non GPT?**
Claude Sonnet ha una finestra di contesto più grande (utile per diff lunghi) e
produce testo più coerente con lo stile esistente del documento. Haiku è usato
per il matching iniziale (economico e veloce) e Sonnet solo per la generazione finale.

**Perché non una queue (BullMQ, Trigger.dev) per il processing?**
Per l'MVP non serve. Se il processing supera i 10 secondi limite di GitHub,
si risponde 200 subito e si usa `waitUntil` di Vercel per completare in background.
Una queue si aggiunge quando c'è volume reale.

---

## Limiti noti dell'architettura MVP

1. **Nessuna retry logic** — se il LLM fallisce, l'update viene perso. Acceptable per l'MVP.
2. **Processing sincrono** — se la PR ha un diff enorme, potrebbe andare in timeout.
3. **Nessun caching degli embedding** — ogni webhook ricalcola tutto. Da ottimizzare con il volume.
4. **GitHub App installata a livello di repo, non di org** — semplifica l'MVP ma limita i team.
