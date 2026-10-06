export interface Schema {
    /** Name of the project to inspect. If omitted, the whole tree is inspected. */
    project?: string;
    /** When true, applies the signal-read replacements; when false, only logs what would change. */
    fix?: boolean;
}
