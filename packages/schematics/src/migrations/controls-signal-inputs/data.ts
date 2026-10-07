/**
 * Data for the `controls-signal-inputs` migration.
 *
 * The decorator inputs of the checkbox, toggle, radio, button toggle, buttons, icons and search-expandable are signal
 * inputs named `<member>Input` now, handed to the unchanged member from `ngOnChanges`. Reads and writes of the
 * members are unchanged; a subclass is not. Warn-only.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

const CONTROLS =
    '(?:KbqCheckbox|KbqToggleComponent|KbqRadioGroup|KbqRadioButton|KbqButtonToggleGroup|KbqButtonToggle|KbqButton|KbqButtonGroupRoot|KbqSplitButton|KbqIcon|KbqIconButton|KbqIconItem|KbqSearchExpandable)';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: `\\bextends\\s+${CONTROLS}\\b`,
        pattern: `\\bextends\\s+${CONTROLS}\\b`,
        message:
            'A subclass of a Koobiq control whose inputs became signal inputs. The bound value reaches the member from ' +
            'ngOnChanges now, so an ngOnChanges of the subclass has to call super.ngOnChanges(changes). An input the ' +
            'subclass redeclared with @Input() is overridden through the `<member>Input` signal input instead, e.g. ' +
            "`override readonly iconNameInput = input<string | undefined>(undefined, { alias: 'my-icon' })`."
    }
];

export const SUMMARY = [
    'Reads and writes of the checkbox, toggle, radio, button toggle, button, icon and search-expandable members are',
    'unchanged. A boolean input accepts boolean | string | null | undefined in a template now, rather than anything.'
];
