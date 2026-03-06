import { parseDate, dayFileName, ensureDayFile } from "../utils.js";
export async function getOrCreateDayFile(params) {
    const date = params.date ? parseDate(params.date) : new Date();
    const filename = dayFileName(date);
    const content = await ensureDayFile(date);
    return `File: ${filename}\nContent:\n${content}`;
}
//# sourceMappingURL=get-or-create-day-file.js.map