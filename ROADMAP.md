# DocDrift — Roadmap

Versione corrente: **0.0.0 (pre-lancio)**  
Aggiornato: Giugno 2026

---

## MVP (v0.1) — Target: settimana 4

Obiettivo: un utente può registrarsi, connettere un repo GitHub, e ricevere
automaticamente una PR di documentazione aggiornata ogni volta che mergia una PR.

**Incluso:**
- Auth con GitHub OAuth
- Connessione repo tramite GitHub App
- Webhook handler per PR mergiate
- Generazione doc con Claude API
- Apertura PR automatica sul repo dell'utente
- Dashboard minimale (lista repo, activity log)
- Pagamenti Stripe (Starter $29/mo, Pro $79/mo)
- Email notifiche con Resend
- Homepage pubblica

**Non incluso nell'MVP (backlog):**
- GitLab / Bitbucket
- Slack notifications
- Team plans
- API pubblica

---

## v0.2 — Target: settimana 8 post-lancio

- [ ] GitLab support
- [ ] Slack notifications (alternativa email)
- [ ] Preview della doc generata nel dashboard prima che la PR venga aperta
- [ ] Statistiche avanzate: token usati, costo stimato per repo

## v0.3 — Target: mese 4

- [ ] Team plans con fatturazione centralizzata
- [ ] Bitbucket support
- [ ] API pubblica (per integrazioni custom)
- [ ] Webhook outbound (notifica sistemi esterni quando una doc PR viene aperta)

## Idee nel backlog (non datate)

- Doc mode "public" con integrazione Mintlify/GitBook
- Support per monitorare anche commenti nel codice (non solo file .md)
- Dashboard analytics per vedere quali sezioni della doc cambiano più spesso
