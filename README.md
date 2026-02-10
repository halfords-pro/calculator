# @halfords-pro/calculator

An MCP (Model Context Protocol) server providing calculator tools with precise decimal arithmetic, suitable for accounting and tax calculations.

## Features

- **Precise decimal arithmetic** — uses [decimal.js](https://github.com/MikeMcl/decimal.js) to avoid floating-point errors
- **Excel-style rounding** — round half away from zero (ROUND_HALF_UP), the standard for accounting and tax
- **MCP protocol** — integrates with any MCP-compatible client (Claude Desktop, Claude Code, etc.)

## Installation

```bash
npm install -g @halfords-pro/calculator
```

## Usage

### Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": ["-y", "@halfords-pro/calculator"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add calculator -- npx -y @halfords-pro/calculator
```

## Tools

### sum

Sum an array of signed decimal numbers and round the result to a specified number of decimal places.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `values` | `number[]` | Yes | Array of signed decimal numbers to sum |
| `decimalPlaces` | `number` | Yes | Number of decimal places to round the result to |

**Examples:**

```
sum({ values: [1.00, -2.50, 3.89], decimalPlaces: 2 })
→ "2.39"

sum({ values: [1.00, -2.50, 3.89283829, -539.38390293], decimalPlaces: 4 })
→ "-536.9911"

sum({ values: [0.1, 0.2], decimalPlaces: 2 })
→ "0.30"  (not 0.30000000000000004)
```

**Rounding behaviour:**

Uses "round half away from zero" (equivalent to Excel `ROUND()`):

| Value | Rounded to 2dp |
|-------|---------------|
| 2.125 | 2.13 |
| -2.125 | -2.13 |
| 2.124 | 2.12 |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Launch MCP Inspector
npm run inspector
```

## License

ISC
