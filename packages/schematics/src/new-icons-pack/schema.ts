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
}
