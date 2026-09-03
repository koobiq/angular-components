import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    computed,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    linkedSignal,
    numberAttribute,
    OnDestroy,
    Renderer2,
    signal
} from '@angular/core';
import {
    getNodesWithoutComments,
    kbqInjectNativeElement,
    leftIconClassName,
    rightIconClassName
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/** @docs-private */
export const baseURLRegex = /^http(s)?:\/\//;

/** Directive that styles an anchor as a link. */
@Directive({
    selector: '[kbq-link]',
    host: {
        class: 'kbq-link',
        '[class.kbq-link_no-underline]': 'noUnderline()',
        '[class.kbq-link_use-visited]': 'useVisited()',
        '[class.kbq-link_big]': 'big()',
        '[class.kbq-link_compact]': 'compact()',
        '[class.kbq-link_pseudo]': 'pseudo()',
        '[class.kbq-link_multiline]': 'multiline()',
        '[class.kbq-link_print]': 'printMode()',
        '[class.kbq-text-only]': '!hasIcon()',
        '[class.kbq-text-with-icon]': 'hasIcon()',
        '[class.kbq-disabled]': 'disabledSignal()',
        '[attr.disabled]': 'disabledSignal() || null',
        '[attr.tabindex]': 'hostTabIndex()',
        '[attr.print]': 'printUrl()'
    },
    exportAs: 'kbqLink'
})
export class KbqLink implements AfterViewInit, OnDestroy {
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly nativeElement = kbqInjectNativeElement<HTMLAnchorElement>();

    protected readonly renderer = inject(Renderer2);

    private readonly icons = contentChildren(
        forwardRef(() => KbqIcon),
        { read: ElementRef }
    );

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

    /** Tab order of the link. A disabled link is taken out of the tab order regardless of this value. */
    readonly tabIndex = input(0, { transform: numberAttribute });

    /** Whether the link is rendered without a `href`, as a control that looks like a link. */
    readonly pseudo = input(false, { transform: booleanAttribute });

    /** Whether the link is rendered without an underline. */
    readonly noUnderline = input(false, { transform: booleanAttribute });

    /** Whether the link uses the big typography. */
    readonly big = input(false, { transform: booleanAttribute });

    /** Whether the link uses the compact typography. */
    readonly compact = input(false, { transform: booleanAttribute });

    /** Whether the link has an increased hit area for multiline usage. */
    readonly multiline = input(false, { transform: booleanAttribute });

    /** Whether a visited link is styled differently. */
    readonly useVisited = input(false, { transform: booleanAttribute });

    /**
     * URL printed next to the link text when the page is printed. Defaults to the `href` without its
     * protocol; bind it to print something else, or bind `null` to opt out.
     */
    readonly print = input<string | null>();

    /** @docs-private */
    protected readonly hasIcon = computed(() => this.icons().length > 0);

    /** @docs-private */
    protected readonly printMode = computed(() => this.print() != null);

    /** @docs-private */
    protected readonly hostTabIndex = computed(() => (this.disabledSignal() ? -1 : this.tabIndex()));

    /** @docs-private */
    protected readonly printUrl = signal<string | undefined>(undefined);

    constructor() {
        effect((onCleanup) => {
            const print = this.print();

            // `href` is DOM state rather than a signal, so it is read once the binding that sets it has
            // landed — and dropped again if `print` changes or the view goes away before that.
            let cancelled = false;

            onCleanup(() => (cancelled = true));

            Promise.resolve().then(() => {
                if (!cancelled) {
                    this.printUrl.set(print || this.nativeElement.href?.replace(baseURLRegex, ''));
                }
            });
        });

        // Icons projected asynchronously (e.g. behind an `@if`) update the `icons` signal after content
        // init, so class assignment must react to the signal, not just run once.
        effect(() => this.updateClassModifierForIcons());
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.nativeElement, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.nativeElement);
    }

    /** Focuses the link. */
    focus(): void {
        this.getHostElement().focus();
    }

    /** The anchor the directive is applied to. */
    getHostElement(): HTMLAnchorElement {
        return this.nativeElement;
    }

    private updateClassModifierForIcons(): void {
        const icons = this.icons();

        icons.forEach(({ nativeElement }) => {
            this.renderer.removeClass(nativeElement, leftIconClassName);
            this.renderer.removeClass(nativeElement, rightIconClassName);
        });

        const filteredNodesWithoutComments = getNodesWithoutComments(this.nativeElement.childNodes as NodeList);

        if (icons.length && filteredNodesWithoutComments.length > 1) {
            icons.forEach(({ nativeElement }) => {
                const iconIndex = filteredNodesWithoutComments.findIndex((node) => node === nativeElement);

                if (iconIndex === 0) {
                    this.renderer.addClass(nativeElement, leftIconClassName);
                }

                if (iconIndex === filteredNodesWithoutComments.length - 1) {
                    this.renderer.addClass(nativeElement, rightIconClassName);
                }
            });
        }
    }
}
