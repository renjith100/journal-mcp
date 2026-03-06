import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions, executeTool } from "./tools/index.js";

export async function startServer(): Promise<void> {
	const server = new Server(
		{ name: "journal-mcp", version: "1.0.0" },
		{ capabilities: { tools: {} } },
	);

	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: toolDefinitions,
	}));

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args = {} } = request.params;
		try {
			const text = await executeTool(name, args as Record<string, unknown>);
			return { content: [{ type: "text", text }] };
		} catch (e) {
			return {
				content: [{ type: "text", text: e instanceof Error ? e.message : String(e) }],
				isError: true,
			};
		}
	});

	const transport = new StdioServerTransport();
	await server.connect(transport);
}
