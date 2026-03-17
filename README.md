## ExtensionHub (GitHub package marketplace)

ExtensionHub is a lightweight npm-like marketplace built with **Next.js App Router** where packages are stored in a GitHub repository:

- Package ZIPs are written to `packages/{packageName}/{version}.zip`
- The marketplace index is stored in `metadata/packages.json`

## Features

- **Auth**: GitHub OAuth only via NextAuth (no email/password)
- **Storage/DB**: GitHub REST API (server-side token only)
- **Versioning**: multiple versions per package; latest tracked in metadata
- **Anti-spam**: upload limit per user per day
- **Validation**: `.zip` only with size limit

## Local setup

### 1) Install

```bash
pnpm install
```

### 2) Environment variables

Create `.env` (copy from `.env.example`) and fill in:

- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- `MAX_ZIP_BYTES`, `MAX_UPLOADS_PER_DAY`

### 3) Run dev server

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Pages

- **Marketplace**: `/` (all packages)
- **Upload**: `/upload` (requires login)
- **Package**: `/packages/[name]`

## Deployment (Vercel)

1. Add all environment variables from `.env.example` in Vercel Project Settings.
2. Ensure `GITHUB_TOKEN` has permission to write to the storage repo.
3. Deploy.

