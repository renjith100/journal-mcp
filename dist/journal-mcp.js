#!/usr/bin/env node
"use strict";
// bin/journal-mcp.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_os_1 = require("node:os");
const node_process_1 = require("node:process");
const date_fns_1 = require("date-fns");
const fs_extra_1 = __importDefault(require("fs-extra"));
console.error(`CWD: ${process.cwd()}`);
console.error(`JOURNAL_ROOT: ${process.env.JOURNAL_ROOT || "MISSING"}`);
const JOURNAL_ROOT = process.env.JOURNAL_ROOT ?? `${(0, node_os_1.homedir)()}/perplexity-journal`;
// Emit manifest on startup so Perplexity knows what tools exist
node_process_1.stdout.write(`${JSON.stringify({
    tools: [
        {
            name: "get_or_create_day_file",
            description: "Get or create today's journal file, returns full content",
            parameters: { date: { type: "string", optional: true } },
        },
        {
            name: "append_thought",
            description: "Append a timestamped thought to the Thoughts section",
            parameters: {
                date: { type: "string" },
                text: { type: "string" },
                tag: { type: "string", optional: true },
            },
        },
        {
            name: "update_section",
            description: "Replace content of Daily Review or Plan for Tomorrow section",
            parameters: {
                date: { type: "string" },
                section: {
                    type: "string",
                    enum: ["Daily Review", "Plan for Tomorrow"],
                },
                content: { type: "string" },
            },
        },
        {
            name: "list_range",
            description: "List journal files within a date range",
            parameters: { start: { type: "string" }, end: { type: "string" } },
        },
        {
            name: "read_files",
            description: "Read journal files for the given dates",
            parameters: { dates: { type: "array", items: { type: "string" } } },
        },
    ],
})}\n`);
console.error("MCP alive - waiting stdin"); // Debug
// Read JSON-line requests from stdin
node_process_1.stdin.setEncoding("utf8");
let buffer = "";
node_process_1.stdin.on("data", (chunk) => {
    console.error(`Received chunk:`); // Debug stdin
    buffer += chunk;
    const lines = buffer.split("\n").filter(Boolean);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
        try {
            console.error(`INCOMING RAW: ${line}`);
            const request = JSON.parse(line);
            handleRequest(request).catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                node_process_1.stdout.write(`${JSON.stringify({ content: msg, isError: true })}\n`);
            });
        }
        catch {
            console.error(`Received: ${line}`); // Debug stdin
            node_process_1.stdout.write(`${JSON.stringify({ content: "Invalid JSON request", isError: true })}\n`);
        }
    }
});
async function handleRequest(req) {
    try {
        const response = {
            content: await executeTool(req.tool, req.params),
        };
        node_process_1.stdout.write(`${JSON.stringify(response)}\n`);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        node_process_1.stdout.write(`${JSON.stringify({ content: msg, isError: true })}\n`);
    }
}
async function executeTool(tool, params) {
    switch (tool) {
        case "get_or_create_day_file":
            return get_or_create_day_file(params);
        case "append_thought":
            return append_thought(params);
        case "update_section":
            return update_section(params);
        case "list_range":
            return list_range(params);
        case "read_files":
            return read_files(params);
        default:
            throw new Error(`Unknown tool: ${tool}`);
    }
}
async function get_or_create_day_file(params) {
    const date = params.date ? (0, date_fns_1.parseISO)(params.date) : new Date();
    const filename = `${(0, date_fns_1.format)(date, "yyyy-MM-dd")}.md`;
    const path = `${JOURNAL_ROOT}/${filename}`;
    let content = await fs_extra_1.default.readFile(path, "utf8").catch(() => "");
    if (!content) {
        content = `---
date: ${(0, date_fns_1.format)(date, "yyyy-MM-dd")}
tags: []
mood: neutral
---
## Thoughts

## Daily Review

## Plan for Tomorrow
`;
        await fs_extra_1.default.ensureDir(JOURNAL_ROOT);
        await fs_extra_1.default.writeFile(path, content);
    }
    return `File: ${filename}\nContent:\n${content}`;
}
async function append_thought(params) {
    const date = (0, date_fns_1.parseISO)(params.date);
    const filename = `${(0, date_fns_1.format)(date, "yyyy-MM-dd")}.md`;
    const path = `${JOURNAL_ROOT}/${filename}`;
    const content = await fs_extra_1.default.readFile(path, "utf8");
    const timestamp = (0, date_fns_1.format)(new Date(), "HH:mm");
    const tag = params.tag ? `[${params.tag}] ` : "";
    const newLine = `- [${timestamp}] ${tag}${params.text}`;
    const updated = content.replace(/## Thoughts\n/, `## Thoughts\n\n${newLine}\n`);
    await fs_extra_1.default.writeFile(path, updated);
    return `Appended to ${filename}`;
}
async function update_section(params) {
    const date = (0, date_fns_1.parseISO)(params.date);
    const filename = `${(0, date_fns_1.format)(date, "yyyy-MM-dd")}.md`;
    const path = `${JOURNAL_ROOT}/${filename}`;
    const fileContent = await fs_extra_1.default.readFile(path, "utf8");
    const sectionHeading = `## ${params.section}\n`;
    const updated = fileContent.replace(new RegExp(`${sectionHeading}.*?(?=\\n#{2,}|$)`, "s"), `${sectionHeading}\n\n${params.content}\n`);
    await fs_extra_1.default.writeFile(path, updated);
    return `Updated ${params.section} in ${filename}`;
}
async function list_range(params) {
    const files = (await fs_extra_1.default.readdir(JOURNAL_ROOT));
    const start = (0, date_fns_1.parseISO)(params.start);
    const end = (0, date_fns_1.parseISO)(params.end);
    const inRange = files
        .filter((f) => f.endsWith(".md") && /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .map((f) => ({
        date: f.replace(".md", ""),
        path: `${JOURNAL_ROOT}/${f}`,
    }))
        .filter(({ date }) => {
        const d = (0, date_fns_1.parseISO)(date);
        return d >= start && d <= end;
    });
    return JSON.stringify(inRange.map(({ path, date }) => ({
        filename: path,
        date,
    })));
}
async function read_files(params) {
    const contents = await Promise.all(params.dates.map(async (date) => {
        const path = `${JOURNAL_ROOT}/${date}.md`;
        const content = await fs_extra_1.default.readFile(path, "utf8").catch(() => "");
        return { date, content };
    }));
    return JSON.stringify(contents);
}
