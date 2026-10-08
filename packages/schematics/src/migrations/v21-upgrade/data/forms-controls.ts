import type { AreaData } from '../data';

// A call on `this` is the consumer's own `ControlValueAccessor`, not a checkbox or toggle.
const NOT_ON_THIS = '(?<!\\bthis)\\??';

/** Removed in 21.0.0: the unused ControlValueAccessor members of KbqCheckbox and KbqToggleComponent. */
export const formsControls: AreaData = {
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
        }
    ]
};
