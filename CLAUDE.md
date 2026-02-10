# CLAUDE.md

## Project Overview

MCP server providing calculator tools for accounting and tax calculations. Published as `@halfords-pro/calculator` on npm.

## Build & Test Commands

- `npm run build` — Compile TypeScript to `./build`
- `npm test` — Run all tests (vitest)
- `npm run test:coverage` — Run tests with coverage report
- `npm run watch` — Watch mode for TypeScript compilation
- `npm run inspector` — Launch MCP Inspector for manual testing

## Architecture

- `src/index.ts` — MCP server entry point. Exports `createServer()`, `calculateSum()`, `validateSumInput()`
- `src/types.ts` — TypeScript interfaces
- `tests/sum.test.ts` — Unit tests for calculation and validation logic
- `tests/server.test.ts` — Integration tests using MCP Client/Server with InMemoryTransport

## Key Conventions

- **ESM modules** (`"type": "module"` in package.json)
- **Decimal arithmetic** via `decimal.js` — never use native JS floating-point for calculations
- **Rounding** uses ROUND_HALF_UP (round half away from zero, equivalent to Excel ROUND) — standard for accounting/tax
- **Follows freeagent-mcp patterns**: shebang, Server class with request handlers, StdioServerTransport
- Tool input validation returns discriminated union: `{ valid: true, input } | { valid: false, error }`

## Deployment

- GitHub Actions workflow (`.github/workflows/publish.yml`) publishes to npm on push to `main`
- Requires `NPM_TOKEN` secret in repo settings
- Scoped package published with `--access public`
