import fs from "fs-extra";
import { parseDate } from "../utils.js";
import { JOURNAL_ROOT } from "../config.js";

export async function listRange(params: { start: string; end: string }): Promise<string> {
	const files = (await fs.readdir(JOURNAL_ROOT)) as string[];
	const start = parseDate(params.start);
	const end = parseDate(params.end);

	const inRange = files
		.filter((f) => f.endsWith(".md") && /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
		.map((f) => ({ date: f.replace(".md", ""), path: `${JOURNAL_ROOT}/${f}` }))
		.filter(({ date }) => {
			const d = parseDate(date);
			return d >= start && d <= end;
		});

	return JSON.stringify(inRange.map(({ path, date }) => ({ filename: path, date })));
}
