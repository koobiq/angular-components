export interface Schema {
    /** Name of the project to migrate. If omitted, the whole tree is migrated. */
    project?: string;
    /** When true, applies the renames; when false, only logs what would change. Defaults to true. */
    fix?: boolean;
}
