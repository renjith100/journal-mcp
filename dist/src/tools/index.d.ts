export declare const toolDefinitions: readonly [{
    readonly name: "get_or_create_day_file";
    readonly description: "Get or create today's journal file, returns full content";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly date: {
                readonly type: "string";
                readonly description: "ISO date string (optional, defaults to today)";
            };
        };
    };
}, {
    readonly name: "append_thought";
    readonly description: "Append a timestamped thought to the Thoughts section";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly date: {
                readonly type: "string";
            };
            readonly text: {
                readonly type: "string";
            };
            readonly tag: {
                readonly type: "string";
            };
        };
        readonly required: readonly ["date", "text"];
    };
}, {
    readonly name: "update_section";
    readonly description: "Replace content of Daily Review or Plan for Tomorrow section";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly date: {
                readonly type: "string";
            };
            readonly section: {
                readonly type: "string";
                readonly enum: readonly ["Daily Review", "Plan for Tomorrow"];
            };
            readonly content: {
                readonly type: "string";
            };
        };
        readonly required: readonly ["date", "section", "content"];
    };
}, {
    readonly name: "list_range";
    readonly description: "List journal files within a date range";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly start: {
                readonly type: "string";
            };
            readonly end: {
                readonly type: "string";
            };
        };
        readonly required: readonly ["start", "end"];
    };
}, {
    readonly name: "read_files";
    readonly description: "Read journal files for the given dates";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly dates: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
        readonly required: readonly ["dates"];
    };
}];
export declare function executeTool(name: string, args: Record<string, unknown>): Promise<string>;
