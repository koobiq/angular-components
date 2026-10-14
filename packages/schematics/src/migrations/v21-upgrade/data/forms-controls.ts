import { listItemPattern } from '../../../utils/list-item-pattern';
import type { AreaData } from '../data';

const CHECKBOX = '@koobiq/components/checkbox';

// A call on `this` is the consumer's own `ControlValueAccessor`, not a checkbox or toggle.
const NOT_ON_THIS = '(?<!\\bthis)\\??';

/** The rest of a named import or re-export clause of the checkbox entry point. */
const CHECKBOX_CLAUSE_END = `(?=[^}]*\\}\\s*from\\s*['"]${CHECKBOX}['"])`;

/**
 * Removed in 21.0.0: the unused ControlValueAccessor members of KbqCheckbox and KbqToggleComponent, and the
 * re-export of `TransitionCheckState` from the checkbox entry point. Also reports
 * `KbqToggleComponent.onLabelTextChange()`, deprecated for removal in 22.0.0.
 */
export const formsControls: AreaData = {
    tsReplacements: [
        {
            // The specifier, with one of its commas; an emptied clause is dropped by `removeImport`.
            from: `(?<=import\\s*(?:type\\s*)?\\{[^}]*)${listItemPattern('\\bTransitionCheckState\\b(?!\\s+as\\b)')}${CHECKBOX_CLAUSE_END}`,
            to: '',
            removeImport: { symbol: 'TransitionCheckState', from: CHECKBOX },
            ensureImport: { symbol: 'TransitionCheckState', from: '@koobiq/components/core' }
        }
    ],
    warnPatterns: [
        {
            pattern: '\\bKBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR\\b',
            message:
                'KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR was removed: KbqCheckbox is not a ControlValueAccessor any more, ' +
                'the KbqCheckable host directive registers itself as the value accessor of kbq-checkbox. Drop the ' +
                'provider; [(ngModel)] and [formControl] work without it. Manual migration required.'
        },
        {
            anchor: '\\bKbqCheckbox\\b|\\bKbqToggleComponent\\b|<kbq-(?:checkbox|toggle)\\b',
            pattern: `${NOT_ON_THIS}\\.(?:writeValue|registerOnChange|registerOnTouched|setDisabledState)\\b`,
            message:
                'KbqCheckbox and KbqToggleComponent no longer implement ControlValueAccessor: their writeValue(), ' +
                'registerOnChange(), registerOnTouched() and setDisabledState() were removed, the KbqCheckable ' +
                'host directive is the value accessor. On a checkbox or toggle, replace writeValue(v) with ' +
                'checked = !!v, setDisabledState(v) with disabled = v and registerOnChange(fn) with the (change) ' +
                'output; bind [formControl] / [(ngModel)] to track touched, or call them on the host KbqCheckable ' +
                '(viewChild(KbqCheckbox, { read: KbqCheckable })). Manual migration required.'
        },
        {
            anchor: '\\bKbqCheckbox\\b|<kbq-checkbox\\b',
            pattern: `${NOT_ON_THIS}\\.onTouched\\b`,
            message:
                'KbqCheckbox.onTouched was removed: forms never called it, the KbqCheckable host directive ' +
                'tracks touched. Drop the call or assignment and read touched from the bound [formControl] / ' +
                '[(ngModel)]. Manual migration required.'
        },
        {
            anchor: `\\bKbqToggleComponent\\b|<kbq-toggle\\b|["']kbqToggle["']`,
            pattern: `${NOT_ON_THIS}\\.onLabelTextChange\\s*\\(`,
            message:
                'KbqToggleComponent.onLabelTextChange() does nothing now and is deprecated for removal in 22.0.0: ' +
                'the toggle reads nothing from its label, so a change of it needs no re-check. Delete the call.'
        },
        {
            // Protected, so only a subclass reaches it; a read that is already a call is migrated.
            anchor: '\\bextends\\s+KbqToggleComponent\\b',
            pattern: '\\bcurrentCheckState\\b(?!\\s*\\()',
            message:
                'KbqToggleComponent.currentCheckState is a Signal<TransitionCheckState> now, shared with the host ' +
                'KbqCheckable: read it as currentCheckState(). It is read-only; a transition goes through the ' +
                'checked and indeterminate setters. Manual migration required.'
        },
        {
            // A plain named import is moved by the rewrite above.
            pattern:
                `\\bTransitionCheckState\\s+as\\s+\\w+${CHECKBOX_CLAUSE_END}` +
                `|\\bexport\\s*(?:type\\s*)?\\{[^}]*\\bTransitionCheckState\\b${CHECKBOX_CLAUSE_END}` +
                `|import\\s*\\*\\s*as\\s+(\\w+)\\s+from\\s*['"]${CHECKBOX}['"][\\s\\S]*\\b\\1\\.TransitionCheckState\\b`,
            message:
                'TransitionCheckState is no longer exported from @koobiq/components/checkbox: import or re-export ' +
                'it from @koobiq/components/core.'
        }
    ]
};
