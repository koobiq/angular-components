/**
 * Replacement data for the v21.0.0 migration — the removed deprecated APIs and the state that became signals — one
 * file per area under `data/`.
 *
 * Each replacement uses a RegExp source string in `from` and a literal `to`; the driver compiles it with the `g`
 * flag. One that deletes an element of a list takes one of its commas with it (`listItemPattern`): nothing tidies
 * the file afterwards. A warning reports what cannot be rewritten; its optional `anchor` limits it to files that also
 * match it.
 */

import { accordion } from './data/accordion';
import { codeBlockAndIcon } from './data/code-block-and-icon';
import { core } from './data/core';
import { dropdownAndSelect } from './data/dropdown-and-select';
import { filterBar } from './data/filter-bar';
import { formField } from './data/form-field';
import { formsControls } from './data/forms-controls';
import { navbarAndLayout } from './data/navbar-and-layout';
import { popover } from './data/popover';
import { stateSignals } from './data/state-signals';
import { styles } from './data/styles';
import { tags } from './data/tags';
import { toast } from './data/toast';
import { tree } from './data/tree';

export interface Replacement {
    from: string;
    to: string;
    /** Optional human-readable note shown in dry-run / warn mode. */
    note?: string;
    /** When this replacement matches in a .ts file, ensure the listed import specifier is present. */
    ensureImport?: { symbol: string; from: string };
    /** When this replacement matches in a .ts file, strip `symbol` from its named import of `from`. */
    removeImport?: { symbol: string; from: string };
}

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor?: string;
    pattern: string;
    message: string;
}

/** What one area of the library contributes to the migration. */
export interface AreaData {
    tsReplacements?: Replacement[];
    templateReplacements?: Replacement[];
    scssReplacements?: Replacement[];
    styleEntryReplacements?: Replacement[];
    warnPatterns?: WarnPattern[];
}

const AREAS: AreaData[] = [
    accordion,
    codeBlockAndIcon,
    core,
    dropdownAndSelect,
    filterBar,
    formField,
    formsControls,
    navbarAndLayout,
    popover,
    stateSignals,
    styles,
    tags,
    toast,
    tree
];

/** TypeScript-source replacements (imports, identifiers, member accesses). */
export const tsReplacements: Replacement[] = AREAS.flatMap((area) => area.tsReplacements ?? []);

/** Replacements in templates, external `.html` files and inline `template:` strings alike. */
export const templateReplacements: Replacement[] = AREAS.flatMap((area) => area.templateReplacements ?? []);

/** Replacements in `.scss` and `.css` files. */
export const scssReplacements: Replacement[] = AREAS.flatMap((area) => area.scssReplacements ?? []);

/** Replacements in the `styles` entries of `angular.json`; an entry they turn into a duplicate is dropped. */
export const styleEntryReplacements: Replacement[] = AREAS.flatMap((area) => area.styleEntryReplacements ?? []);

/** What the migration reports instead of rewriting. */
export const warnPatterns: WarnPattern[] = AREAS.flatMap((area) => area.warnPatterns ?? []);
