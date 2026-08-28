import { Replacement } from '../../utils/typescript';

/**
 * Replacement data for the removal of the deprecated file-upload outputs
 *
 * `KbqMultipleFileUploadComponent.fileQueueChanged` and
 * `KbqSingleFileUploadComponent.fileQueueChange` were deprecated in favor of
 * `filesChange` / `fileChange` and are removed in this release. Both names
 * are unambiguous — they don't collide with any other Angular or TypeScript
 * identifier — so a plain `\b…\b` word-boundary rename is safe everywhere
 * the identifier can appear: an `(fileQueueChanged)="…"` template binding
 * (external `.html` or inline `template:` string), or a programmatic
 * `.fileQueueChanged` property access / `.subscribe(...)` call in `.ts`.
 */

export const replacements: Replacement[] = [
    { from: '\\bfileQueueChanged\\b', to: 'filesChange' },
    { from: '\\bfileQueueChange\\b', to: 'fileChange' }
];

/** Printed once per run — the rewrite is a plain text replace, not scoped to Koobiq usage. */
export const BEHAVIOUR_NOTE = [
    'This is a textual rename, not scoped to `@koobiq/components` usage — it also matches an unrelated',
    'string, attribute value or identifier of your own that happens to be named `fileQueueChanged` or',
    '`fileQueueChange`. Review the diff before committing.'
];
