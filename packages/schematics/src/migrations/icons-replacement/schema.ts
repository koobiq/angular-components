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
    project?: string;
    customDataPath?: string;
    /**
     * Custom replacement data path. Will be used as relative to `project.root`.
     * Default replacement data will be used instead
     * @see https://github.com/koobiq/icons/pull/68
     */
    replacementDataPath?: string;
}
