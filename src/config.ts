import { homedir } from "node:os";

export const JOURNAL_ROOT =
	process.env.JOURNAL_ROOT ?? `${homedir()}/second-brain/journal`;
