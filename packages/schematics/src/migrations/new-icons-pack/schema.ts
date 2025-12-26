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
     * Name of the project where Koobiq library should be installed
     */
    project?: string;
    /**
     * Whether to change icon prefixes
     */
    updatePrefix?: boolean;
    /**
     * path to custom data. When providing this property, use `migration.json` file as a default
     */
    customDataPath?: string;
    /**
     * path to custom attributes replacement. When providing this property, use `replacement.json` file as a default.
     */
    customIconReplacementPath?: string;
}
