import { InjectionToken, Signal } from '@angular/core';

/**
 * Contract for a control that cannot scroll on its own element and hands its scrolling to the form field,
 * which turns the infix around the control into the scrollport.
 *
 * It exists for `KbqTextarea`: a `<textarea>` cannot have element children, so it cannot host the custom
 * scrollbar's track. Controls that scroll themselves, or do not scroll at all, do not provide it, and the
 * form field builds no track for them.
 *
 * @docs-private
 */
export interface KbqFormFieldScrollport {
    /**
     * Height the control's whole content needs, in px, or `0` before it has been measured. The form field
     * watches it to reveal the scrollbar when the content grows past the visible box.
     */
    readonly contentHeight: Signal<number>;

    /**
     * Height cap for the scrollport, in px, or `null` while it is uncapped.
     *
     * A signal because the form field applies it from a template binding and runs `OnPush`.
     */
    readonly maxHeight: Signal<number | null>;
}

/**
 * Token a control provides — `{ provide: KBQ_FORM_FIELD_SCROLLPORT, useExisting: MyControl }` — to ask the
 * form field to scroll on its behalf.
 *
 * The form field reads it with a content query rather than `inject`, because injection does not reach from a
 * component to its own projected content.
 *
 * @docs-private
 */
export const KBQ_FORM_FIELD_SCROLLPORT = new InjectionToken<KbqFormFieldScrollport>('KbqFormFieldScrollport');
