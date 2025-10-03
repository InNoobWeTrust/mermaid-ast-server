# Mermaid Parser Server

A simple HTTP server to parse Mermaid diagram text into a JSON Abstract Syntax Tree (AST).

## Prerequisites

- Node.js
- pnpm

## Installation

```bash
npx corepack pnpm install
```

## Running the server

```bash
npx corepack pnpm start
```

The server will start on `http://localhost:3000`.

## Usage

Send a `POST` request to the `/parse` endpoint with the Mermaid text as the request body.

### Example

```bash
curl -X POST -H "Content-Type: text/plain" --data "graph TD; A-->B;" http://localhost:3000/parse
```

### Output

A JSON object representing the AST of the parsed Mermaid text.
