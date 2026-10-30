export interface Schema {
    /**
     * Whether overwrite icons or simply inform in console
     */
    fix: boolean;
    /**
     * File extension where schematics will be applied.
     * If provided empty array, will be applied to all files.
     */
    allowed: string[];
    /**
     * Name of the project, or a folder to migrate (e.g. `./libs`). Without it the whole workspace is migrated
     */
    project: string;
    /**
     * JSON file with an icon mapping that replaces the built-in one, an array of
     * `{ "replace": "<old>", "replaceWith": "<new>" }`. Resolved from the workspace root.
     */
    customDataPath?: string;
    /**
     * @deprecated Use `customDataPath`. Resolved from the project root or the folder first, then as
     * `customDataPath` is.
     */
    replacementDataPath?: string;
}
