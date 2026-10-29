export interface Schema {
    /**
     * Whether overwrite icons prefixes or simply inform in console
     */
    fix: boolean;
    /**
     * Use this option to specify styles extension preferred in your project
     */
    stylesExt: string;
    /**
     * Name of the project, or a folder to migrate (e.g. `./libs`). Without it the whole workspace is migrated
     */
    project?: string;
    /**
     * Whether to change icon prefixes
     */
    updatePrefix?: boolean;
    /**
     * JSON file with the icon mapping, relative to the workspace root. Without it the built-in mapping is used
     */
    customDataPath?: string;
    /**
     * JSON file with the scope pair, relative to the workspace root. Without it the scope is `mc` -> `kbq`
     */
    customIconReplacementPath?: string;
}
