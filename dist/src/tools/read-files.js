import fs from "fs-extra";
import { JOURNAL_ROOT } from "../config.js";
export async function readFiles(params) {
    const contents = await Promise.all(params.dates.map(async (date) => {
        const content = await fs.readFile(`${JOURNAL_ROOT}/${date}.md`, "utf8").catch(() => "");
        return { date, content };
    }));
    return JSON.stringify(contents);
}
//# sourceMappingURL=read-files.js.map