#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Decimal from "decimal.js";
import { SumInput } from "./types.js";

// Configure Decimal.js to use ROUND_HALF_UP (round half away from zero)
// This matches Excel ROUND() behaviour, standard for accounting and tax calculations
Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export function calculateSum(values: number[], decimalPlaces: number): string {
  const sum = values.reduce(
    (acc, val) => acc.plus(new Decimal(val)),
    new Decimal(0)
  );
  return sum.toFixed(decimalPlaces);
}

export function validateSumInput(
  args: Record<string, unknown>
): { valid: true; input: SumInput } | { valid: false; error: string } {
  const { values, decimalPlaces } = args;

  if (!Array.isArray(values)) {
    return { valid: false, error: "'values' must be an array of numbers." };
  }

  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== "number" || !Number.isFinite(values[i])) {
      return {
        valid: false,
        error: `'values[${i}]' must be a finite number. Received: ${values[i]}`,
      };
    }
  }

  if (
    typeof decimalPlaces !== "number" ||
    !Number.isInteger(decimalPlaces) ||
    decimalPlaces < 0
  ) {
    return {
      valid: false,
      error: "'decimalPlaces' must be a non-negative integer.",
    };
  }

  return { valid: true, input: { values: values as number[], decimalPlaces } };
}

export function createServer(): Server {
  const server = new Server(
    { name: "calculator-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "sum",
        description:
          "Sum an array of signed decimal numbers and round the result to a specified number of decimal places. Uses precise decimal arithmetic suitable for accounting and tax calculations. Rounding uses the 'round half away from zero' strategy (equivalent to Excel ROUND).",
        inputSchema: {
          type: "object" as const,
          properties: {
            values: {
              type: "array",
              items: { type: "number" },
              description:
                "Array of signed decimal numbers to sum (e.g. [1.00, -2.50, 3.89])",
            },
            decimalPlaces: {
              type: "number",
              description:
                "Number of decimal places to round the result to (e.g. 2 for 2 decimal places)",
            },
          },
          required: ["values", "decimalPlaces"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "sum") {
      const validation = validateSumInput(
        request.params.arguments as Record<string, unknown>
      );

      if (!validation.valid) {
        return {
          content: [{ type: "text", text: `Error: ${validation.error}` }],
          isError: true,
        };
      }

      const { values, decimalPlaces } = validation.input;
      const result = calculateSum(values, decimalPlaces);

      return {
        content: [{ type: "text", text: result }],
      };
    }

    return {
      content: [
        { type: "text", text: `Error: Unknown tool '${request.params.name}'.` },
      ],
      isError: true,
    };
  });

  return server;
}

async function main() {
  const transport = new StdioServerTransport();
  const server = createServer();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
