export interface Schema {
    /** Name of the project to migrate. */
    project?: string;
    /** When true, removes the handlers; when false, only logs what would change. Defaults to true. */
    fix?: boolean;
}
