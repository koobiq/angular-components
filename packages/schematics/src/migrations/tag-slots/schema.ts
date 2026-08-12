export interface Schema {
    /** Name of the project to migrate. */
    project?: string;
    /** When true, marks legacy kbq-icon content with the explicit tag-prefix slot; otherwise only logs. Defaults to true. */
    fix?: boolean;
}
