export declare function parseDate(dateStr: string): Date;
export declare function formatDate(date: Date): string;
export declare function currentTime(): string;
export declare function isToday(date: Date): boolean;
export declare function dayFilePath(date: Date): string;
export declare function dayFileName(date: Date): string;
export declare function createDayTemplate(date: Date): string;
export declare function ensureDayFile(date: Date): Promise<string>;
