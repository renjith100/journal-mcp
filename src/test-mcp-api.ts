/**
 * TEST SCRIPT - Validates MCP + Anthropic API integration
 *
 * Run this BEFORE setting up Telegram to verify the core flow works.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=your-key tsx src/test-mcp-api.ts "your test thought"
 */

import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// ============================================================
// CONFIG - Same as main bot
// ============================================================
const CONFIG = {
	journalMcp: {
		command: "tsx",
		args: ["/Users/renjith/Developer/Code/Projects/journal-mcp/src/index.ts"],
		env: {
			JOURNAL_ROOT: "/Users/renjith/perplexity-journal",
		},
	},
};

async function test() {
	const testMessage =
		process.argv[2] || `Test thought from CLI at ${new Date().toISOString()}`;

	console.log("=".repeat(60));
	console.log("🧪 MCP + Anthropic API Integration Test");
	console.log("=".repeat(60));
	console.log(`\n📝 Test message: "${testMessage}"\n`);

	// Step 1: Connect to MCP
	console.log("1️⃣  Connecting to Journal MCP server...");
	const transport = new StdioClientTransport({
		command: CONFIG.journalMcp.command,
		args: CONFIG.journalMcp.args,
		env: { ...process.env, ...CONFIG.journalMcp.env },
	});

	const mcpClient = new Client({
		name: "test-client",
		version: "1.0.0",
	});

	await mcpClient.connect(transport);
	console.log("   ✅ Connected to MCP server");

	// Step 2: List available tools
	console.log("\n2️⃣  Fetching MCP tools...");
	const { tools } = await mcpClient.listTools();
	console.log("   📦 Available tools:");
	for (const t of tools) {
		console.log(`      - ${t.name}: ${t.description?.slice(0, 50)}...`);
	}

	// Convert to Anthropic format
	const anthropicTools: Anthropic.Tool[] = tools.map((tool) => ({
		name: tool.name,
		description: tool.description || "",
		input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
	}));

	// Step 3: Call Claude API with tools
	console.log("\n3️⃣  Calling Claude API...");
	const anthropic = new Anthropic();

	const systemPrompt = `You are a thought capture assistant. Save the user's thought using append_thought tool.
Today's date is ${new Date().toISOString().split("T")[0]}.
Use an appropriate tag like "test", "idea", "todo", etc.`;

	let messages: Anthropic.MessageParam[] = [
		{ role: "user", content: testMessage },
	];

	let response = await anthropic.messages.create({
		model: "claude-sonnet-4-20250514",
		max_tokens: 1024,
		system: systemPrompt,
		tools: anthropicTools,
		messages,
	});

	console.log(`   📤 Initial response - stop_reason: ${response.stop_reason}`);

	// Step 4: Handle tool calls
	while (response.stop_reason === "tool_use") {
		const toolUseBlocks = response.content.filter(
			(block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
		);

		console.log(`\n4️⃣  Processing ${toolUseBlocks.length} tool call(s)...`);

		const toolResults: Anthropic.ToolResultBlockParam[] = [];

		for (const toolUse of toolUseBlocks) {
			console.log(`   🔧 Calling: ${toolUse.name}`);
			console.log(`      Input: ${JSON.stringify(toolUse.input, null, 2)}`);

			const result = await mcpClient.callTool({
				name: toolUse.name,
				arguments: toolUse.input as Record<string, unknown>,
			});

			console.log(`   ✅ Result: ${JSON.stringify(result.content)}`);

			toolResults.push({
				type: "tool_result",
				tool_use_id: toolUse.id,
				content:
					typeof result.content === "string"
						? result.content
						: JSON.stringify(result.content),
			});
		}

		// Continue conversation
		messages = [
			...messages,
			{ role: "assistant", content: response.content },
			{ role: "user", content: toolResults },
		];

		response = await anthropic.messages.create({
			model: "claude-sonnet-4-20250514",
			max_tokens: 1024,
			system: systemPrompt,
			tools: anthropicTools,
			messages,
		});

		console.log(
			`   📤 Follow-up response - stop_reason: ${response.stop_reason}`,
		);
	}

	// Step 5: Get final response
	console.log("\n5️⃣  Final response from Claude:");
	const textBlocks = response.content.filter(
		(block): block is Anthropic.TextBlock => block.type === "text",
	);
	const finalText = textBlocks.map((b) => b.text).join("\n");
	console.log(`   💬 "${finalText}"`);

	// Cleanup
	await mcpClient.close();

	console.log(`\n${"=".repeat(60)}`);
	console.log("✅ TEST COMPLETE - The integration works!");
	console.log("=".repeat(60));
	console.log("\nNext steps:");
	console.log("1. Check your journal file for the captured thought");
	console.log("2. Set up Telegram bot token from @BotFather");
	console.log("3. Run the full bot with: tsx src/index.ts");
}

test().catch((err) => {
	console.error("\n❌ TEST FAILED:", err);
	process.exit(1);
});
