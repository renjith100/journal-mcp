import fs from "fs-extra";
import { parseDate, dayFilePath, dayFileName, ensureDayFile, currentTime } from "../utils.js";
export async function appendThought(params) {
    const date = parseDate(params.date);
    const filename = dayFileName(date);
    const path = dayFilePath(date);
    const content = await ensureDayFile(date);
    const tag = params.tag ? `[${params.tag}] ` : "";
    const newLine = `- [${currentTime()}] ${tag}${params.text}`;
    const updated = content.replace(/## Thoughts\n/, `## Thoughts\n\n${newLine}\n`);
    await fs.writeFile(path, updated);
    return `Appended to ${filename}`;
}
//# sourceMappingURL=append-thought.js.map