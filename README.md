# Mermaid Parser Server

A TypeScript HTTP server built with Hono to parse Mermaid diagram text into a JSON Abstract Syntax Tree (AST).

## Prerequisites

- Node.js 20+
- pnpm

## Installation

```bash
npx corepack pnpm install
```

## Development

```bash
npx corepack pnpm start
```

The server runs with debug logging enabled by default in development mode.

## Testing

```bash
npx corepack pnpm test
```

## Production

Build the project:
```bash
npx corepack pnpm build
```

Run the built server:
```bash
node dist/index.js
```

Or use Docker:
```bash
docker build -t mermaid-ast-server .
docker run -p 5000:5000 mermaid-ast-server
```

The server will start on `http://localhost:5000`.

## Usage

Send a `POST` request to the `/parse` endpoint with the Mermaid text as JSON.

### Example

```bash
curl -X POST -H "Content-Type: application/json" --data '{"data":"graph TD; A-->B;"}' http://localhost:5000/parse
```

### Output

A JSON object representing the AST of the parsed Mermaid text.

## Endpoints

- `POST /parse` - Parse Mermaid diagram text to AST
- `GET /health` - Health check with metrics and cache statistics

## Environment Variables

- `PORT`: Server port (default: 5000)
- `DEBUG`: Enable debug logging (default: enabled in development)
- `ENABLE_CACHE`: Enable internal caching (default: true, set to 'false' to disable)

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Hono
- **Build Tool**: Vite
- **Test Runner**: Vitest
- **Logger**: Pino with structured logging
