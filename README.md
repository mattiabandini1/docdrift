This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AI Model
For the first, second and third -> gemini-2.5-flash-lite
Then -> gemini-2.5-flash

## How It Works

DocDrift monitors every Pull Request merged into your `main` branch.
When a PR is merged, DocDrift:

1. Extracts the diff of all files changed in the PR
2. Fetches the documentation files you configured (default: `README.md`)
3. Uses semantic search to find documentation sections related to the changes
4. Generates an updated version of those sections using AI
5. Opens a new Pull Request with the documentation changes for your review

DocDrift only updates documentation when it detects a real gap between
what your code does and what your docs say. If no relevant sections are
found, or if the documentation is already accurate, no PR is opened.
T## Webhook Pipeline

The pipeline is triggered by GitHub webhook events on `pull_request`
with action `closed` and `merged: true`.

Each event goes through:
- HMAC-SHA256 signature verification
- Rate limiting (10 requests/minute per IP)
- Plan enforcement (repo limits and monthly update limits)
- Skipping PRs opened by DocDrift itself to prevent infinite loops.
- Semantic matching between the diff and your documentation
- AI-powered documentation generation via Gemini Flashff and your documentation
- AI-powered documentation generation via Gemini Flash
