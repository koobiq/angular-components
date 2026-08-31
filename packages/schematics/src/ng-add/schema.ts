export interface Schema {
    /**
     * Name of the project where Koobiq library should be installed
     */
    project?: string;

    /**
     * The prebuilt Koobiq theme to install. Defaults to 'auto'.
     */
    theme?: 'auto' | 'light' | 'dark';

    /**
     * Whether to add `provideAnimations()` automatically. Defaults to true.
     */
    animations?: boolean;
}
