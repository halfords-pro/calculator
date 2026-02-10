import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/index.js";

async function createConnectedClient() {
  const server = createServer();
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  return client;
}

describe("MCP Server Integration", () => {
  describe("list tools", () => {
    it("returns the sum tool", async () => {
      const client = await createConnectedClient();
      const result = await client.listTools();

      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].name).toBe("sum");
      expect(result.tools[0].inputSchema.required).toEqual([
        "values",
        "decimalPlaces",
      ]);
    });
  });

  describe("call sum tool", () => {
    it("sums values and rounds correctly", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: [1.5, 2.5, 3.0], decimalPlaces: 2 },
      });

      expect(result.content).toEqual([{ type: "text", text: "7.00" }]);
      expect(result.isError).toBeFalsy();
    });

    it("handles negative numbers", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: [10.0, -3.5, -2.5], decimalPlaces: 2 },
      });

      expect(result.content).toEqual([{ type: "text", text: "4.00" }]);
    });

    it("handles an empty values array", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: [], decimalPlaces: 2 },
      });

      expect(result.content).toEqual([{ type: "text", text: "0.00" }]);
      expect(result.isError).toBeFalsy();
    });

    it("handles a single value", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: [42.123], decimalPlaces: 2 },
      });

      expect(result.content).toEqual([{ type: "text", text: "42.12" }]);
      expect(result.isError).toBeFalsy();
    });

    it("applies round half away from zero", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: [2.125], decimalPlaces: 2 },
      });

      expect(result.content).toEqual([{ type: "text", text: "2.13" }]);
    });

    it("returns error for invalid values", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: "not-array", decimalPlaces: 2 },
      });

      expect(result.isError).toBe(true);
      expect(
        (result.content as Array<{ type: string; text: string }>)[0].text
      ).toContain("must be an array");
    });

    it("returns error for invalid decimalPlaces", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "sum",
        arguments: { values: [1, 2], decimalPlaces: -1 },
      });

      expect(result.isError).toBe(true);
      expect(
        (result.content as Array<{ type: string; text: string }>)[0].text
      ).toContain("decimalPlaces");
    });
  });

  describe("unknown tool", () => {
    it("returns error for unknown tool name", async () => {
      const client = await createConnectedClient();
      const result = await client.callTool({
        name: "unknown-tool",
        arguments: {},
      });

      expect(result.isError).toBe(true);
      expect(
        (result.content as Array<{ type: string; text: string }>)[0].text
      ).toContain("Unknown tool");
    });
  });
});
