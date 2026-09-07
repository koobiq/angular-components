import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ENTER, SPACE, TAB } from '@angular/cdk/keycodes';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    contentChild,
    effect,
    ElementRef,
    inject,
    input,
    Input,
    OnDestroy,
    signal,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    Highlightable,
    IFocusableOption,
    KBQ_TITLE_TEXT_REF,
    KbqComponentColors,
    KbqTitleTextRef
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { Subject } from 'rxjs';
import {
    KBQ_DROPDOWN_ITEM_ACTION_HOST,
    KbqDropdownItemAction,
    KbqDropdownItemActionHost
} from './dropdown-item-action';
import { KBQ_DROPDOWN_PANEL, KbqDropdownPanel } from './dropdown.types';

/** Elements that carry no label text of their own and are skipped when reading an item's label. */
const NON_LABEL_SELECTOR = '[kbq-icon], .kbq-icon, [kbqDropdownItemAction]';

/** Tags that turn ENTER/SPACE into a click on their own, so the item must not synthesise a second one. */
const NATIVELY_ACTIVATABLE_TAGS = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

/**
 * Roles that make the host a child of a composite widget whose own key manager owns activation —
 * `KbqAppSwitcherListItem` is `role="menuitem"` and replays the click itself, so synthesising here
 * would fire it twice. A standalone role such as `button` or `link` is deliberately absent: ARIA adds
 * no behaviour of its own, so those hosts still need the synthesis.
 */
const COMPOSITE_CHILD_ROLES = new Set([
    'gridcell',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'row',
    'tab',
    'treeitem'
]);

/** `Node.ELEMENT_NODE` / `Node.TEXT_NODE`, spelled out so no DOM global is dereferenced on the server. */
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/**
 * This directive is intended to be used inside an kbq-dropdown tag.
 *
 * Note that it sets no ARIA role: neither the panel nor its items currently carry menu semantics, so
 * triggers must not advertise a popup they cannot describe.
 */
@Component({
    selector: 'kbq-dropdown-item, [kbq-dropdown-item]',
    imports: [
        KbqIcon
    ],
    templateUrl: 'dropdown-item.html',
    styleUrls: ['dropdown-item.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqDropdownItem },
        { provide: KBQ_DROPDOWN_ITEM_ACTION_HOST, useExisting: KbqDropdownItem }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dropdown-item',
        '[class.kbq-dropdown-item_highlighted]': 'highlighted',
        '[class.kbq-dropdown-item_active]': 'active()',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-progress]': 'progress()',
        '[class.kbq-dropdown-item_has-action]': '!!itemAction()',

        '[attr.disabled]': 'disabled || null',
        // `disabled` is inert on the `<div>`/`<a>` hosts the package documents and is never exposed to
        // assistive technology, so the state is published separately.
        '[attr.aria-disabled]': 'disabled || null',
        '[attr.tabindex]': 'getTabIndex()',

        '(click)': 'checkDisabled($event)',
        '(mouseenter)': 'handleMouseEnter()',
        '(keydown)': 'handleKeydown($event)'
    },
    exportAs: 'kbqDropdownItem'
})
export class KbqDropdownItem
    implements KbqTitleTextRef, KbqDropdownItemActionHost, IFocusableOption, Highlightable, OnDestroy
{
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private focusMonitor = inject(FocusMonitor);
    parentDropdownPanel? = inject<KbqDropdownPanel>(KBQ_DROPDOWN_PANEL, { optional: true });
    @ViewChild('kbqTitleText') textElement: ElementRef;

    @ContentChild(KbqIcon) icon: KbqIcon;

    /** Secondary, independently-focusable icon action projected into the item (e.g. a settings link). */
    readonly itemAction = contentChild(KbqDropdownItemAction);

    // Kept as an accessor input: `KbqDropdownItemActionHost` and the key manager read `disabled` as a
    // plain boolean, so it cannot become a signal without a breaking change to both contracts.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    /** Whether the dropdown item is in a loading state. */
    readonly progress = input(false, { transform: booleanAttribute });

    /** Stream that emits when the dropdown item is hovered. */
    readonly hovered = new Subject<KbqDropdownItem>();

    /** Stream that emits when the menu item is focused. */
    readonly focused = new Subject<KbqDropdownItem>();

    /** Whether the dropdown item is highlighted. */
    highlighted: boolean = false;

    /** Whether the item is the panel's active item while DOM focus is held elsewhere. */
    protected readonly active = signal(false);

    /** Whether the dropdown item acts as a trigger for a nested dropdown. */
    isNested: boolean = false;

    /** @docs-private */
    protected readonly componentColors = KbqComponentColors;

    /** Memoised `getLabel()` result, keyed on the raw text it was derived from. */
    private cachedLabel?: { text: string; label: string };

    constructor() {
        effect(() => {
            // Start monitoring the element so it gets the appropriate focused classes. We want to
            // show the focus style for menu items only when the focus was not caused by a mouse or
            // touch interaction. When `itemAction` is present, focus can land on it instead of the
            // host, so children must be checked too for the focused classes to still be applied to
            // the host. `monitor()` doesn't update `checkChildren` on an already-monitored element,
            // so this restarts monitoring whenever `itemAction()` changes to keep it in sync.
            this.focusMonitor.stopMonitoring(this.elementRef);
            this.focusMonitor.monitor(this.elementRef, !!this.itemAction());
        });
    }

    ngOnDestroy() {
        if (this.focusMonitor) {
            this.focusMonitor.stopMonitoring(this.elementRef);
        }

        this.hovered.complete();
        this.focused.complete();
    }

    resetStyles() {
        this.getHostElement().classList.remove('cdk-keyboard-focused');
    }

    /** Styles the item as active without focusing it. */
    setActiveStyles(): void {
        this.active.set(true);
    }

    /** Removes the styles applied by `setActiveStyles`. */
    setInactiveStyles(): void {
        this.active.set(false);
    }

    /**
     * Focuses the dropdown item and reveals it.
     *
     * The reveal is explicit because the one `focus()` performs implicitly is not portable: WebKit defers
     * it to a later rendering update, where it lands after — and undoes — any scrolling the reader did in
     * the meantime. `preventScroll` is therefore always forced on, overriding `options`.
     */
    focus(origin?: FocusOrigin, options?: FocusOptions): void {
        if (this.disabled) return;

        const element = this.getHostElement();
        const focusOptions: FocusOptions = { ...options, preventScroll: true };

        if (this.focusMonitor && origin) {
            this.focusMonitor.focusVia(element, origin, focusOptions);
        } else {
            element.focus(focusOptions);
        }

        // With the pointer already on this item, revealing it would shift the list out from under it.
        if (origin !== 'mouse') {
            element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
        }

        this.focused.next(this);
    }

    /** Returns the host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** Used to set the `tabindex`. */
    getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Prevents the default element actions if it is disabled. Bound via `host` metadata. */
    checkDisabled(event: Event): void {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /** Emits to the hover stream. Bound via `host` metadata. */
    handleMouseEnter() {
        this.hovered.next(this);

        // In search mode the panel makes the hovered item active instead, keeping the caret in the query.
        if (this.parentDropdownPanel?.inSearchMode?.()) return;

        this.focus('mouse');
    }

    /** Handles key presses on the item. Bound via `host` metadata. */
    protected handleKeydown(event: KeyboardEvent): void {
        if (this.disabled || this.progress()) return;

        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.handleActivationKeydown(event);

            return;
        }

        this.handleActionKeydown(event);
    }

    /**
     * The package documents a non-interactive item host for items carrying a secondary action ("a
     * regular block, not a button"), and neither the host nor `ListKeyManager` binds ENTER/SPACE —
     * so such a row is arrow-navigable and highlighted but cannot be activated from the keyboard.
     * Replaying the key as a click makes the consumer's `(click)` handler and the panel's own close
     * behave exactly as they do for the mouse.
     */
    private handleActivationKeydown(event: KeyboardEvent): void {
        const hostElement = this.getHostElement();

        // A nested trigger owns ENTER/SPACE itself — it opens the submenu instead of activating the row.
        if (this.isNested || event.target !== hostElement) return;

        // Natively actionable hosts already turn the key into a click; synthesising a second one
        // would fire the consumer's handler twice.
        if (NATIVELY_ACTIVATABLE_TAGS.has(hostElement.tagName) || hostElement.matches('a[href]')) return;

        // A host that joins a composite widget has handed activation to that widget's key manager.
        // Standalone roles are not excluded: `role="button"` is exactly the markup a consumer adds to
        // make a non-interactive item accessible, and it gets no activation from the browser either.
        if (COMPOSITE_CHILD_ROLES.has(hostElement.getAttribute('role') || '')) return;

        event.preventDefault();
        // The key is fully handled: nothing above should replay it as a click, and SPACE must not also
        // reach the panel's typeahead.
        event.stopPropagation();
        hostElement.click();
    }

    /**
     * Lets Tab move focus between the host and `itemAction` without leaving the dropdown
     * (`stopPropagation` only — the browser's native focus move still happens). Any other Tab
     * press, i.e. actually leaving the item, is left untouched and still closes the dropdown via
     * the panel's `FocusKeyManager.tabOut`.
     */
    private handleActionKeydown(event: KeyboardEvent): void {
        const action = this.itemAction();

        if (!action || event.keyCode !== TAB) return;

        const target = event.target as HTMLElement;
        const hostEl = this.getHostElement();
        const actionEl = action.getHostElement();

        const movesToAction = !event.shiftKey && target === hostEl;
        const movesBackToHost = event.shiftKey && target === actionEl;

        if (movesToAction || movesBackToHost) {
            event.stopPropagation();
        }
    }

    /**
     * Gets the label to be used when determining whether the option should be focused.
     *
     * Typeahead asks every candidate for its label on each keystroke, so the text is read by walking
     * the item once — no subtree clone — and memoised against the item's raw `textContent`, which
     * changes whenever the rendered label does.
     */
    getLabel(): string {
        const hostElement = this.getHostElement();
        const text = hostElement.textContent || '';

        if (this.cachedLabel?.text !== text) {
            this.cachedLabel = { text, label: this.readLabel(hostElement).trim() };
        }

        return this.cachedLabel.label;
    }

    /** Concatenates the item's own text, skipping icons and the projected action. */
    private readLabel(element: HTMLElement): string {
        let label = '';

        element.childNodes.forEach((node) => {
            if (node.nodeType === TEXT_NODE) {
                label += node.textContent;
            } else if (node.nodeType === ELEMENT_NODE && !(node as HTMLElement).matches(NON_LABEL_SELECTOR)) {
                label += this.readLabel(node as HTMLElement);
            }
        });

        return label;
    }

    haltDisabledEvents(event: Event) {
        if (this.disabled || this.progress()) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    }
}
