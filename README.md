# BrandLoom

BrandLoom is an explainable brand-governance platform. It checks marketing and content drafts against an organisation's approved brand guidelines, terminology and facts before they are published. Every finding points to the passage it relies on, suggested fixes are optional, and people make every publishing decision.

This repository contains the working prototype for **Team Alpha** (Gaurav Kumar, team lead; Shimpy Kumari) for the Inkloom AI Brand-Governance Challenge.

## What the prototype does

- **Review a draft.** Write or paste copy, choose a channel, and see highlighted text with findings.
- **Cited findings.** Each finding names its category, severity, confidence, the reason it was raised, and the approved source passage behind it.
- **Suggested fixes.** Fixes appear as a before-and-after change. Accept, edit, or dismiss each one. Dismissals need a written reason.
- **Approval routing.** Drafts can only be sent for approval once every finding is resolved. A dismissed claim or fact routes the draft to a Reviewer; otherwise a Manager approves it.
- **Decisions and comments.** Approvers approve or request changes, with a note. An activity log records every edit, decision and comment.
- **Source library.** Browse the guidelines and approved facts, with versions, owners and expiry dates.

The demo uses a fictional brand, **Northwind Outdoor**, with synthetic guidelines and facts. No real or confidential material is included.

## Quick start

```bash
npm install
npm run dev        # local development server
npm run build      # production build into dist/
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/PRODUCT.md](docs/PRODUCT.md) | The problem, the users, the workflow, and the feature list with priorities |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the prototype is built, how a review runs, and the planned production stack |
| [docs/REVIEW_RULES.md](docs/REVIEW_RULES.md) | Every rule the review engine applies, the source it cites, and what happens when it fires |
| [docs/RESPONSIBLE_AI.md](docs/RESPONSIBLE_AI.md) | Human oversight, confidentiality, AI disclosure, and data handling |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What is built, what is planned for Rounds 2 and 3, and known limitations |

## Project structure

```
src/
  App.tsx                  Page shell, tabs and tab heroes
  types.ts                 Shared types (findings, sources, workflow)
  data/demoBrand.ts        Fictional brand sources and sample copy
  lib/reviewEngine.ts      Review rules and citation check
  hooks/useReviewWorkflow.ts  Draft, findings, decisions and activity state
  components/              Screens and UI pieces
docs/                      Product, architecture, rules and responsible-AI documents
public/robots.txt          Search engine crawl policy
```

## Search visibility

The page includes a descriptive title, meta description, Open Graph and Twitter card tags, and schema.org `SoftwareApplication` markup in `index.html`. A `<noscript>` summary gives crawlers a readable description. Each tab sets its own title, description, canonical URL and social tags when it opens. `public/sitemap.xml` and the `Sitemap` line in `public/robots.txt` contain the placeholder `https://your-domain.com`; replace it with the production domain before submitting the site to search engines.

## Status

Prototype for Round 2 of the challenge. Data lives in the browser session only and is not stored in a database, so a refresh starts the demo draft again. Review checks are rule-based and run in the browser. AI analysis and user sign-in are not built yet; the role switch in the header is a demo control. See [docs/ROADMAP.md](docs/ROADMAP.md).
