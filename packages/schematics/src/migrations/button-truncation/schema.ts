export interface Schema {
    /** Name of the project to migrate. */
    project?: string;
    /** When true, applies the marker-slot replacements; when false, only logs what would change. */
    fix: boolean;
}
