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
     * Name of the project where Koobiq library should be installed
     */
    project?: string;
}
