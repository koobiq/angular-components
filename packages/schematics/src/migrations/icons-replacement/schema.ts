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
     * Custom replacement data path, relative to the project root or the folder.
     * Without it the built-in mapping is used
     * @see https://github.com/koobiq/icons/pull/68
     */
    replacementDataPath?: string;
}
