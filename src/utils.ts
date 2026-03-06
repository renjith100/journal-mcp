import fs from "fs-extra";
import { format, parseISO } from "date-fns";
import { JOURNAL_ROOT } from "./config.js";

export function parseDate(dateStr: string): Date {
	return parseISO(dateStr);
}

export function formatDate(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

export function currentTime(): string {
	return format(new Date(), "HH:mm");
}

export function isToday(date: Date): boolean {
	return formatDate(date) === formatDate(new Date());
}

export function dayFilePath(date: Date): string {
	return `${JOURNAL_ROOT}/${formatDate(date)}.md`;
}

export function dayFileName(date: Date): string {
	return `${formatDate(date)}.md`;
}

export function createDayTemplate(date: Date): string {
	return `---
date: ${formatDate(date)}
tags: []
mood: neutral
---
## Thoughts

## Daily Review

## Plan for Tomorrow
`;
}

export async function ensureDayFile(date: Date): Promise<string> {
	const path = dayFilePath(date);
	let content = await fs.readFile(path, "utf8").catch(() => "");
	if (!content) {
		if (!isToday(date)) {
			throw new Error(`No journal file found for ${formatDate(date)}`);
		}
		content = createDayTemplate(date);
		await fs.ensureDir(JOURNAL_ROOT);
		await fs.writeFile(path, content);
	}
	return content;
}
