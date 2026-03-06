import { getOrCreateDayFile } from "./get-or-create-day-file.js";
import { appendThought } from "./append-thought.js";
import { updateSection } from "./update-section.js";
import { listRange } from "./list-range.js";
import { readFiles } from "./read-files.js";

export const toolDefinitions = [
	{
		name: "get_or_create_day_file",
		description: "Get or create today's journal file, returns full content",
		inputSchema: {
			type: "object",
			properties: {
				date: { type: "string", description: "ISO date string (optional, defaults to today)" },
			},
		},
	},
	{
		name: "append_thought",
		description: "Append a timestamped thought to the Thoughts section",
		inputSchema: {
			type: "object",
			properties: {
				date: { type: "string" },
				text: { type: "string" },
				tag: { type: "string" },
			},
			required: ["date", "text"],
		},
	},
	{
		name: "update_section",
		description: "Replace content of Daily Review or Plan for Tomorrow section",
		inputSchema: {
			type: "object",
			properties: {
				date: { type: "string" },
				section: { type: "string", enum: ["Daily Review", "Plan for Tomorrow"] },
				content: { type: "string" },
			},
			required: ["date", "section", "content"],
		},
	},
	{
		name: "list_range",
		description: "List journal files within a date range",
		inputSchema: {
			type: "object",
			properties: {
				start: { type: "string" },
				end: { type: "string" },
			},
			required: ["start", "end"],
		},
	},
	{
		name: "read_files",
		description: "Read journal files for the given dates",
		inputSchema: {
			type: "object",
			properties: {
				dates: { type: "array", items: { type: "string" } },
			},
			required: ["dates"],
		},
	},
] as const;

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
	switch (name) {
		case "get_or_create_day_file":
			return getOrCreateDayFile(args as { date?: string });
		case "append_thought":
			return appendThought(args as { date: string; text: string; tag?: string });
		case "update_section":
			return updateSection(args as { date: string; section: "Daily Review" | "Plan for Tomorrow"; content: string });
		case "list_range":
			return listRange(args as { start: string; end: string });
		case "read_files":
			return readFiles(args as { dates: string[] });
		default:
			throw new Error(`Unknown tool: ${name}`);
	}
}
