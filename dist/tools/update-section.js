import fs from "fs-extra";
import { parseDate, dayFilePath, dayFileName } from "../utils.js";
export async function updateSection(params) {
    const date = parseDate(params.date);
    const filename = dayFileName(date);
    const path = dayFilePath(date);
    const fileContent = await fs.readFile(path, "utf8");
    const sectionHeading = `## ${params.section}\n`;
    const updated = fileContent.replace(new RegExp(`${sectionHeading}.*?(?=\\n#{2,}|$)`, "s"), `${sectionHeading}\n\n${params.content}\n`);
    await fs.writeFile(path, updated);
    return `Updated ${params.section} in ${filename}`;
}
//# sourceMappingURL=update-section.js.map