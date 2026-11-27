import { _IdGenerator, LiveAnnouncer } from '@angular/cdk/a11y';
import { afterEveryRender, inject, Injector } from '@angular/core';

/**
 * Popup that a search field filters, as the field describes it to assistive technology.
 *
 * @docs-private
 */
export interface KbqSearchFieldPopup {
    /**
     * Role of the popup when the field acts as its combobox: an option list or a tree. `null` keeps the native role
     * of the field, for a popup that a combobox cannot control, such as a list of actions.
     */
    readonly comboboxPopupRole: 'listbox' | 'tree' | null;
    /** Element the field filters. */
    popup(): HTMLElement | null | undefined;
    /** Item the keyboard highlights while the caret stays in the field. */
    activeDescendant(): HTMLElement | null | undefined;
}

/** `type` of the fields whose native role, `textbox` or `searchbox`, may become a `combobox`. */
const TEXT_FIELD_TYPES = new Set(['text', 'search', 'email', 'tel', 'url']);

/**
 * Describes a search field projected into a popup to assistive technology, after every render.
 *
 * The field keeps DOM focus while the arrow keys move a highlight through the popup, so the highlighted item reaches
 * a screen reader through `aria-activedescendant` or a live announcement across shadow roots. A field with no name of its own gets `fallbackLabel`: it
 * usually shows nothing but a magnifying glass. The attributes are written to the DOM because the field belongs to
 * the consumer's template, where the component that renders the popup has no bindings.
 *
 * @param host Element that holds the field, such as the `kbq-form-field` of the search.
 * @param popup Popup the field filters. Without one only the name of the field is kept.
 * @param fallbackLabel Name of a field that has no label, `aria-label`, `aria-labelledby`, title or placeholder.
 *
 * @docs-private
 */
export function kbqSyncSearchFieldA11y(
    host: HTMLElement,
    popup: () => KbqSearchFieldPopup | null | undefined,
    fallbackLabel: () => string
): void {
    const idGenerator = inject(_IdGenerator);
    const injector = inject(Injector);
    let lastAnnounced: HTMLElement | null = null;
    let appliedLabel: string | null = null;

    afterEveryRender({
        write: () => {
            // A field out of the document is perceived by nobody: its popup is closed. It is synced again in the
            // render that attaches it.
            if (!host.isConnected) {
                lastAnnounced = null;

                return;
            }

            const field = host.querySelector('input');

            if (!field) return;

            appliedLabel = syncLabel(field, appliedLabel, fallbackLabel());

            const description = popup();

            // As with the autocomplete trigger, only a text field may take the combobox role and `aria-autocomplete`.
            if (!description || !TEXT_FIELD_TYPES.has(field.type)) return;

            const { comboboxPopupRole } = description;

            if (comboboxPopupRole) {
                setAttribute(field, 'role', 'combobox');
                // The field is rendered only inside the open popup.
                setAttribute(field, 'aria-expanded', 'true');
                setAttribute(field, 'aria-haspopup', comboboxPopupRole);
            }

            setAttribute(field, 'aria-autocomplete', 'list');
            const root = field.getRootNode();
            const panel = description.popup();
            const active = description.activeDescendant();
            const sameTree = active?.getRootNode() === root;

            setAttribute(field, 'aria-controls', getId(panel?.getRootNode() === root ? panel : null, idGenerator));
            setAttribute(field, 'aria-activedescendant', getId(sameTree ? active : null, idGenerator));

            // ID references stop at a shadow boundary. Announce a new highlight only for the
            // field that currently owns the caret, and only once across unrelated renders.
            const announce = !sameTree && active?.isConnected && field.matches(':focus') ? active : null;

            if (announce && announce !== lastAnnounced) {
                const label = getAnnouncement(announce);

                if (label) void injector.get(LiveAnnouncer).announce(label);
            }

            lastAnnounced = announce;
        }
    });
}

/** Prefer the explicitly provided accessible name over the item's visible text. */
function getAnnouncement(item: HTMLElement): string {
    const root = item.getRootNode() as Document | ShadowRoot;
    const labelledBy = item
        .getAttribute('aria-labelledby')
        ?.trim()
        .split(/\s+/)
        .map((id) => root.getElementById(id)?.textContent?.trim())
        .filter(Boolean)
        .join(' ');

    return labelledBy || item.getAttribute('aria-label') || item.textContent?.trim() || item.title;
}

/** Writes the fallback name, or takes it back once the field has one of its own. Returns the name now applied. */
function syncLabel(field: HTMLInputElement, applied: string | null, fallback: string): string | null {
    const current = field.getAttribute('aria-label');
    const hasOwnName =
        (current !== null && current !== applied) ||
        field.hasAttribute('aria-labelledby') ||
        !!field.labels?.length ||
        !!field.title.trim() ||
        !!field.placeholder.trim();
    const label = hasOwnName ? null : fallback;

    if (label !== null) {
        setAttribute(field, 'aria-label', label);
    } else if (applied !== null && current === applied) {
        field.removeAttribute('aria-label');
    }

    return label;
}

/**
 * Id of an element the field refers to, assigned when it has none. `null` once the element has left the document: the
 * filter removed it, or the popup has closed.
 */
function getId(element: HTMLElement | null | undefined, idGenerator: _IdGenerator): string | null {
    if (!element?.isConnected) return null;

    element.id ||= idGenerator.getId('kbq-search-field-target-');

    return element.id;
}

/** Writes only a changed value, so a render that changes nothing touches no attribute. */
function setAttribute(element: HTMLElement, name: string, value: string | null): void {
    if (element.getAttribute(name) === value) return;

    if (value === null) {
        element.removeAttribute(name);
    } else {
        element.setAttribute(name, value);
    }
}
