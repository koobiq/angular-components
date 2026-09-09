import { FocusMonitor } from '@angular/cdk/a11y';
import { ContentObserver } from '@angular/cdk/observers';
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
    untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    getContentNodes,
    kbqInjectNativeElement,
    leftIconClassName,
    rightIconClassName,
    supportsNativeDisabled
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
        '[attr.disabled]': 'nativeDisabledAttribute()',
        '[attr.aria-disabled]': 'ariaDisabledAttribute()',
        '[attr.tabindex]': 'hostTabIndex()',
        '[attr.print]': 'printUrl()'
    },
    exportAs: 'kbqLink'
})
export class KbqLink implements AfterViewInit, OnDestroy {
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly contentObserver = inject(ContentObserver);
    private readonly nativeElement = kbqInjectNativeElement<HTMLAnchorElement>();

    /**
     * `[kbq-link]` styles an `<a>` or a `<span>`, where `disabled` is not a valid attribute and means
     * nothing to assistive tech, so the state is exposed through ARIA instead. The check is on the tag
     * rather than hardcoded, because the selector does not restrict the host.
     */
    private readonly hostSupportsNativeDisabled = supportsNativeDisabled(this.nativeElement);

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
     * protocol, which is what a valueless `print` attribute and an empty string ask for; bind it to print
     * something else, or bind `null` to opt out.
     */
    readonly print = input<string | null>();

    /** @docs-private */
    protected readonly hasIcon = computed(() => this.icons().length > 0);

    /** @docs-private */
    protected readonly printMode = computed(() => this.print() != null);

    /** @docs-private */
    protected readonly nativeDisabledAttribute = computed(() =>
        this.disabledSignal() && this.hostSupportsNativeDisabled ? true : null
    );

    /** @docs-private */
    protected readonly ariaDisabledAttribute = computed(() =>
        this.disabledSignal() && !this.hostSupportsNativeDisabled ? true : null
    );

    /** @docs-private */
    protected readonly hostTabIndex = computed(() => (this.disabledSignal() ? -1 : this.tabIndex()));

    constructor() {
        // Icons projected asynchronously (e.g. behind an `@if`) update the `icons` signal after content
        // init, so class assignment must react to the signal, not just run once.
        effect(() => {
            this.icons();

            untracked(() => this.updateClassModifierForIcons());
        });

        // Which icon is the edge one also depends on the nodes beside it, which no query can see: a text
        // node appearing next to a lone icon turns it into a left icon without `icons` changing at all.
        this.contentObserver
            .observe(this.nativeElement)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateClassModifierForIcons());
    }

    /**
     * The URL printed next to the link text. `href` is DOM state rather than a signal, so it is read
     * where a binding is evaluated: host bindings run after the template bindings that set `href`, and
     * again on every check, so a changing `[href]` cannot leave a stale URL behind.
     *
     * @docs-private
     */
    protected printUrl(): string | undefined {
        return this.print() || this.nativeElement.href?.replace(baseURLRegex, '');
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

        const contentNodes = getContentNodes(this.nativeElement);

        if (icons.length && contentNodes.length > 1) {
            icons.forEach(({ nativeElement }) => {
                const iconIndex = contentNodes.findIndex((node) => node === nativeElement);

                if (iconIndex === 0) {
                    this.renderer.addClass(nativeElement, leftIconClassName);
                }

                if (iconIndex === contentNodes.length - 1) {
                    this.renderer.addClass(nativeElement, rightIconClassName);
                }
            });
        }
    }
}
