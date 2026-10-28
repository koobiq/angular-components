// Types of `changed-specs.mjs`, which stays plain JavaScript because the e2e job runs it with nothing installed.

export declare const burnInRepeat: (specCount: number) => number;

export declare const reachedSpecs: (changedFiles: readonly string[], specs: readonly string[]) => string[];
