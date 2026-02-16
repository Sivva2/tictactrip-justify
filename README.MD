# Justify API — TicTacTrip Technical Test

A REST API that justifies text to 80 characters per line, with a React frontend demo.

**No external library is used for the text justification algorithm.**

## Live Demo

- **Frontend** : https://tictac-justify.netlify.app
- **API** : https://tictactrip-justify-api-production.up.railway.app

## Quick Start

```bash
# Install dependencies
npm install

# Start the API (port 4000)
cd apps/api
npm run dev

# Start the frontend (port 5173)
cd apps/web
npm run dev
```

## API Endpoints

### `POST /api/token`

Generate an authentication token.

```bash
curl -X POST https://tictactrip-justify-api-production.up.railway.app/api/token \
  -H "Content-Type: application/json" \
  -d '{"email": "foo@bar.com"}'
```

**Response:** `{ "token": "uuid-v4-token" }`

### `POST /api/justify`

Justify text to exactly 80 characters per line.

```bash
curl -X POST https://tictactrip-justify-api-production.up.railway.app/api/justify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: text/plain" \
  -d "Your long text here..."
```

**Response:** Justified text (`text/plain`)

### `GET /api/health`

Health check endpoint.

## Authentication

All requests to `/api/justify` require a Bearer token obtained via `/api/token`:

```
Authorization: Bearer <your-token>
```

## Rate Limiting

- **80,000 words per day** per token
- Exceeding the limit returns `402 Payment Required`
- Counter resets at **midnight UTC**
- Remaining quota returned via `X-RateLimit-Remaining` header

## Justification Algorithm

The algorithm works in 4 steps:

1. **Split** the input into paragraphs (separated by double newlines)
2. **Pack** words greedily into lines (max 80 characters per line)
3. **Distribute** extra spaces evenly between words (left-biased for remainders)
4. **Left-align** the last line of each paragraph (typographic convention)

## Tests

```bash
cd apps/api
npm test
```

## Tech Stack

| Layer    | Technology                   |
| -------- | ---------------------------- |
| API      | Node.js, TypeScript, Express |
| Frontend | React, TypeScript, Tailwind  |
| Testing  | Jest, Supertest              |
| Deploy   | Railway (API), Netlify (Web) |
