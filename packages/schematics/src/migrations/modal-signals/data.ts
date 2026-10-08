/**
 * Data for the `modal-signals` migration.
 *
 * The decorator inputs of `KbqModalComponent` are signal inputs named `<member>Input` now, handed to the unchanged
 * member from `ngOnChanges`, and its outputs are `<member>Output` over the unchanged emitters. Reads and writes of the
 * members, and the options of `KbqModalService`, are unchanged; a subclass and a hand-made `SimpleChanges` are not.
 * Warn-only.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bextends\\s+KbqModalComponent\\b',
        pattern: '\\bextends\\s+KbqModalComponent\\b',
        message:
            'A subclass of KbqModalComponent, whose inputs became signal inputs. Every bound value reaches its member ' +
            'from ngOnChanges now, so an ngOnChanges of the subclass has to call super.ngOnChanges(changes). An input ' +
            'the subclass redeclared with @Input() is overridden through the `<member>Input` signal input instead, ' +
            "e.g. `override readonly kbqTitleInput = input<string | undefined>(undefined, { alias: 'kbqTitle' })`, " +
            'and an output redeclared with @Output() through `<member>Output`. kbqVisible and kbqMaskClosable are ' +
            'fields rather than accessors, so they can no longer be overridden with a getter.'
    },
    {
        anchor: '\\bKbqModalComponent\\b',
        pattern: '(?<!\\bsuper)\\.ngOnChanges\\s*\\(',
        message:
            'A direct call of ngOnChanges in a file that uses KbqModalComponent. Its SimpleChanges are keyed by the ' +
            '`<member>Input` names now (kbqVisibleInput, not kbqVisible), and a bound value reaches its member only ' +
            'through them: set the input with a template binding or ComponentRef.setInput instead. This pattern ' +
            'also matches ngOnChanges of an unrelated class in the same file — check before changing it.'
    }
];

export const SUMMARY = [
    'Reads and writes of the KbqModalComponent members, and the options of KbqModalService, are unchanged.'
];
