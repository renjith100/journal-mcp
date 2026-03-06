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
];
export async function executeTool(name, args) {
    switch (name) {
        case "get_or_create_day_file":
            return getOrCreateDayFile(args);
        case "append_thought":
            return appendThought(args);
        case "update_section":
            return updateSection(args);
        case "list_range":
            return listRange(args);
        case "read_files":
            return readFiles(args);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
//# sourceMappingURL=index.js.map