import { FocusMonitor } from '@angular/cdk/a11y';
import {
    afterEveryRender,
    afterNextRender,
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    HostAttributeToken,
    inject,
    InjectionToken,
    input,
    linkedSignal,
    NgZone,
    numberAttribute,
    Renderer2,
    viewChild,
    ViewEncapsulation,
    type Provider
} from '@angular/core';
import { KbqDefaultSizes, kbqInjectNativeElement, supportsNativeDisabled } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/** When the text of a link is underlined: always, only while the pointer is over the link, or never. */
export type KbqLinkUnderline = 'always' | 'hover' | 'none';

// The protocol and the `www.` say nothing on paper
const PRINTED_URL_PREFIX = /^https?:\/\/(www\.)?/;

// The whitespace Angular collapses to one space; a non-breaking space is the author's and stays
const COLLAPSIBLE_SPACES = ' \t\n\r\f';

// The keys that activate a link or open what is attached to it, such as a dropdown
const ACTIVATION_KEYS = ['Enter', ' ', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * Settings a whole application shares, rather than something a single link decides: how big links are, when
 * they are underlined and whether visited ones stand out. Where a link leads and how it behaves stay on the
 * link itself.
 */
export type KbqLinkOptions = {
    /** Size of a link: its typography and the gaps to its icons. */
    size: KbqDefaultSizes;
    /**
     * When the text of a link and of a pseudo link is underlined. Unset, a link is always underlined and a pseudo
     * link only on hover.
     */
    underline?: KbqLinkUnderline;
    /** Whether a visited link is styled differently. */
    useVisited: boolean;
};

const KBQ_LINK_DEFAULT_OPTIONS: KbqLinkOptions = {
    size: 'normal',
    useVisited: false
};

/** Injection token holding the current {@link KbqLinkOptions}. */
export const KBQ_LINK_OPTIONS = new InjectionToken<KbqLinkOptions>('KBQ_LINK_OPTIONS', {
    factory: () => KBQ_LINK_DEFAULT_OPTIONS
});

/**
 * Overrides the default link options within the given injector scope: the whole application from
 * `bootstrapApplication`, or one subtree from the `providers` of a component or a route.
 */
export function kbqLinkOptionsProvider(options: Partial<KbqLinkOptions>): Provider {
    return {
        provide: KBQ_LINK_OPTIONS,
        useValue: { ...KBQ_LINK_DEFAULT_OPTIONS, ...options }
    };
}

/** Marks content to be projected before the text of a link, such as a leading icon. */
@Directive({
    selector: '[kbqLinkPrefix]',
    host: {
        class: 'kbq-link__prefix'
    }
})
export class KbqLinkPrefix {}

/**
 * Marks content to be projected after the text of a link: a trailing icon, or the punctuation that ends a
 * sentence, which takes the link color without the underline. It wraps to the next line together with the last
 * word only.
 */
@Directive({
    selector: '[kbqLinkSuffix]',
    host: {
        class: 'kbq-link__suffix'
    }
})
export class KbqLinkSuffix {}

/**
 * Link of the design system. Applied to an `<a>` with a `href`, so that the browser keeps treating it as a
 * link, or to any other element, which makes it a pseudo link that acts as a button. The component renders the
 * text between the `kbqLinkPrefix` and `kbqLinkSuffix` content, and only the text is underlined.
 */
@Component({
    selector: '[kbqLink]',
    imports: [KbqIcon],
    template: `
        <ng-content select="[kbqLinkPrefix]" />
        <span #text class="kbq-link__text"><ng-content /></span>
        <span class="kbq-link__trailing">
            @if (external()) {
                <i class="kbq-link__external-icon" kbq-icon="kbq-north-east_16"></i>
            }
            <ng-content select="[kbqLinkSuffix]" />
        </span>
    `,
    styleUrls: ['./link.scss', './link-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-link',
        '[class.kbq-link_size_compact]': 'size() === "compact"',
        '[class.kbq-link_size_normal]': 'size() === "normal"',
        '[class.kbq-link_size_big]': 'size() === "big"',
        '[class.kbq-link_underline_always]': 'underlineMode() === "always"',
        '[class.kbq-link_underline_hover]': 'underlineMode() === "hover"',
        '[class.kbq-link_underline_none]': 'underlineMode() === "none"',
        '[class.kbq-link_pseudo]': 'isPseudo()',
        '[class.kbq-link_use-visited]': 'useVisited()',
        '[class.kbq-disabled]': 'disabledSignal()',
        '[attr.role]': 'role()',
        '[attr.disabled]': 'nativeDisabledAttribute()',
        '[attr.aria-disabled]': 'ariaDisabledAttribute()',
        '[attr.tabindex]': 'hostTabIndex()'
    },
    exportAs: 'kbqLink'
})
export class KbqLink implements AfterViewChecked {
    private readonly renderer = inject(Renderer2);
    private readonly destroyRef = inject(DestroyRef);
    private readonly ngZone = inject(NgZone);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly options = inject(KBQ_LINK_OPTIONS);
    private readonly nativeElement = kbqInjectNativeElement<HTMLElement>();

    private readonly textElement = viewChild.required<ElementRef<HTMLElement>>('text');

    /**
     * `disabled` is valid on a `<button>`, but not on an `<a>` or a `<span>`, where it means nothing to
     * assistive tech, so the state is exposed through ARIA there instead.
     */
    private readonly hostSupportsNativeDisabled = supportsNativeDisabled(this.nativeElement);

    /**
     * The role written on the element in the template. Such an element owns its semantics and its keyboard, and
     * the binding keeps the role in place. It is read from the template rather than from the element: on a
     * hydrated page the element already carries the role this component rendered on the server.
     */
    private readonly declaredRole = inject(new HostAttributeToken('role'), { optional: true });

    /**
     * Whether a pseudo link may supply the button semantics itself: a `<button>` and a `<label>` are
     * activatable on their own, and so is an element that declares a role in the template.
     */
    private readonly ownsPseudoSemantics =
        !['BUTTON', 'LABEL'].includes(this.nativeElement.tagName) && this.declaredRole === null;

    /** A `<label>` is reached through its control, so it stays out of the tab order unless it declares a role. */
    private readonly focusable = this.nativeElement.tagName !== 'LABEL' || this.declaredRole !== null;

    /** Only an anchor can lead somewhere: on any other element the link is a pseudo link. */
    private readonly anchor = this.nativeElement.tagName === 'A' ? (this.nativeElement as HTMLAnchorElement) : null;

    /** The text nodes trimmed at an edge of the text, with their data before, for one that leaves the edge. */
    private readonly trimmedTexts = new Map<Text, { source: string; trimmed: string }>();

    /** Whether the link is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * Effective disabled state, mirroring the `disabled` input. It stays writable because `kbqTooltip`
     * accepts a link through `forDisabledComponent` and reads this signal to keep a tooltip reachable on a
     * disabled link; the host bindings read it rather than the input so such a write still shows.
     *
     * @docs-private
     */
    readonly disabledSignal = linkedSignal(() => this.disabled());

    /**
     * Tab order of the link: the `tabindex` written on the element, or 0. A disabled link is taken out of the tab
     * order regardless of this value, and a `<label>` is left out of it: the control it labels is the one that
     * takes the focus.
     */
    readonly tabIndex = input(numberAttribute(inject(new HostAttributeToken('tabindex'), { optional: true }), 0), {
        transform: numberAttribute
    });

    /**
     * Whether an `<a>` is a pseudo link: a control without a `href` that looks like a link. Any other element is
     * a pseudo link anyway. A pseudo link gets the `button` role and is activated with Enter and Space, unless
     * the element is a `<button>` or a `<label>`, declares a role of its own in the template, or is taken out of
     * the tab order with a negative `tabIndex`. A key that another directive on the element has already handled,
     * as `kbqDropdownTriggerFor` does, is left to it.
     */
    readonly pseudo = input(false, { transform: booleanAttribute });

    /**
     * Whether the link leads outside the product. Adds the external link icon after the text. It does not set
     * `target`: bind `target="_blank"` as well to open the page in a new tab.
     */
    readonly external = input(false, { transform: booleanAttribute });

    /**
     * When the text is underlined. Defaults to the app-wide {@link KBQ_LINK_OPTIONS}, and without one there to
     * `always` for a link and `hover` for a pseudo link.
     */
    readonly underline = input<KbqLinkUnderline>();

    /**
     * Size of the link: its typography and the gaps to its icons. Defaults to the app-wide
     * {@link KBQ_LINK_OPTIONS}.
     */
    readonly size = input<KbqDefaultSizes>(this.options.size);

    /** Whether a visited link is styled differently. Defaults to the app-wide {@link KBQ_LINK_OPTIONS}. */
    readonly useVisited = input(this.options.useVisited, { transform: booleanAttribute });

    /**
     * What to print after the link text when the page is printed. An empty string, which a valueless `print`
     * attribute is, prints the `href` without its protocol and `www.`; any other string is printed as is. Unbound
     * or `null`, nothing is printed.
     */
    readonly print = input<string | null>();

    /** @docs-private */
    protected readonly isPseudo = computed(() => this.pseudo() || !this.anchor);

    /** @docs-private */
    protected readonly underlineMode = computed(
        () => this.underline() ?? this.options.underline ?? (this.isPseudo() ? 'hover' : 'always')
    );

    /**
     * Whether the pseudo link is a button of its own. One taken out of the tab order with a negative
     * `tabIndex` is activated through something else - the file input of a file upload's label, for
     * instance - and gets neither the role nor the keyboard.
     */
    private readonly actsAsButton = computed(() => this.isPseudo() && this.ownsPseudoSemantics && this.tabIndex() >= 0);

    /** @docs-private */
    protected readonly role = computed(() => (this.actsAsButton() ? 'button' : this.declaredRole));

    /** @docs-private */
    protected readonly nativeDisabledAttribute = computed(() =>
        this.disabledSignal() && this.hostSupportsNativeDisabled ? true : null
    );

    /** @docs-private */
    protected readonly ariaDisabledAttribute = computed(() =>
        this.disabledSignal() && !this.hostSupportsNativeDisabled ? true : null
    );

    /** @docs-private */
    protected readonly hostTabIndex = computed(() => {
        if (!this.focusable) return null;

        return this.disabledSignal() ? -1 : this.tabIndex();
    });

    constructor() {
        this.monitorFocus();
        this.blockActivationWhileDisabled();

        // In the browser, after the first render: by then the template and the other directives on the element have
        // their listeners in place, so a key one of them has already handled, as `kbqDropdownTriggerFor` does, is left
        // to it
        afterNextRender(() => this.activateOnEnterAndSpace());

        // Text projected through another component is checked with the view that declares it, which does not check
        // the view of this link
        afterEveryRender(() => this.trimEdgeTextNodes());
    }

    /**
     * Angular collapses the whitespace that a formatted template leaves around the text to a single space
     * instead of removing it. Inside the text that space would be underlined, widen the gap to an icon and
     * let the suffix wrap away from the last word, so it is trimmed. The printed text is written here too: by
     * now `routerLink` has set the `href`.
     */
    ngAfterViewChecked(): void {
        this.trimEdgeTextNodes();
        this.updatePrintedText();
    }

    /** Focuses the link. */
    focus(): void {
        this.nativeElement.focus();
    }

    /** The element the link is applied to. */
    getHostElement(): HTMLElement {
        return this.nativeElement;
    }

    // Without a subscription, which would run change detection on every focus and blur. The children count too: a
    // `<label>` link shows the focus of the control inside it.
    private monitorFocus(): void {
        this.focusMonitor.monitor(this.nativeElement, true);
        this.destroyRef.onDestroy(() => this.focusMonitor.stopMonitoring(this.nativeElement));
    }

    private activateOnEnterAndSpace(): void {
        const unlisten = ['keydown.enter', 'keydown.space'].map((name) =>
            this.renderer.listen(this.nativeElement, name, (event: KeyboardEvent) => this.activate(event))
        );

        this.destroyRef.onDestroy(() => unlisten.forEach((remove) => remove()));
    }

    private activate(event: KeyboardEvent): void {
        if (!this.actsAsButton() || event.defaultPrevented || event.target !== this.nativeElement) return;

        // An anchor with a `href` already turns Enter into a click
        if (event.key === 'Enter' && this.anchor?.hasAttribute('href')) return;

        // Space would scroll the page
        event.preventDefault();

        // A held Space repeats the keydown, while a native button is pressed once
        if (event.repeat && event.key === ' ') return;

        this.nativeElement.click();
    }

    // A disabled link keeps its `href`, which `routerLink` may own, so its activation is stopped instead:
    // `pointer-events` only keeps the mouse away, assistive tech clicks the link itself, and the keys reach the
    // other directives on the element, such as `kbqDropdownTriggerFor`. The capture phase runs before the
    // listeners of the template, of the other directives and of the content. Outside Angular: nothing it renders
    // changes.
    private blockActivationWhileDisabled(): void {
        const stopWhileDisabled = (event: Event) => {
            if (!this.disabledSignal()) return;

            if (event instanceof KeyboardEvent && !ACTIVATION_KEYS.includes(event.key)) return;

            event.preventDefault();
            event.stopImmediatePropagation();
        };

        const unlisten = this.ngZone.runOutsideAngular(() =>
            ['click', 'keydown'].map((name) =>
                this.renderer.listen(this.nativeElement, name, stopWhileDisabled, { capture: true })
            )
        );

        this.destroyRef.onDestroy(() => unlisten.forEach((remove) => remove()));
    }

    // `href` is DOM state that `[href]` or `routerLink` may set rather than a signal, so the printed text is kept
    // in an attribute for the print stylesheet and written once the bindings that set `href` have run
    private updatePrintedText(): void {
        const print = this.print();
        const text = print == null ? null : print || this.anchor?.href.replace(PRINTED_URL_PREFIX, '') || null;

        if (this.nativeElement.getAttribute('data-print') === text) return;

        if (text === null) {
            this.renderer.removeAttribute(this.nativeElement, 'data-print');
        } else {
            this.renderer.setAttribute(this.nativeElement, 'data-print', text);
        }
    }

    private trimEdgeTextNodes(): void {
        const start = this.edgeTextNode('firstChild', 'nextSibling');
        const end = this.edgeTextNode('lastChild', 'previousSibling');

        // A block rendered next to a trimmed node takes its place at the edge, and the node gets its spaces back
        for (const node of this.trimmedTexts.keys()) {
            if (node !== start && node !== end) this.trimText(node, false, false);
        }

        if (start) this.trimText(start, true, start === end);
        if (end && end !== start) this.trimText(end, false, true);
    }

    // The text node at an edge of the text, past the anchors of control flow blocks
    private edgeTextNode(edge: 'firstChild' | 'lastChild', inward: 'nextSibling' | 'previousSibling'): Text | null {
        let node = this.textElement().nativeElement[edge];

        while (node?.nodeType === Node.COMMENT_NODE) {
            node = node[inward];
        }

        return node?.nodeType === Node.TEXT_NODE ? (node as Text) : null;
    }

    private trimText(node: Text, start: boolean, end: boolean): void {
        const record = this.trimmedTexts.get(node);
        // An interpolation is written anew, with its spaces
        const source = record?.trimmed === node.data ? record.source : node.data;
        let from = 0;
        let to = source.length;

        while (start && from < to && COLLAPSIBLE_SPACES.includes(source[from])) from++;
        while (end && to > from && COLLAPSIBLE_SPACES.includes(source[to - 1])) to--;

        const trimmed = source.slice(from, to);

        if (trimmed !== node.data) {
            node.data = trimmed;
        }

        if (trimmed === source) {
            this.trimmedTexts.delete(node);
        } else {
            this.trimmedTexts.set(node, { source, trimmed });
        }
    }
}
