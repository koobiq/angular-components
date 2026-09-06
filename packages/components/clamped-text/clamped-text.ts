import { _IdGenerator } from '@angular/cdk/a11y';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    Injector,
    input,
    model,
    numberAttribute,
    signal,
    Signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { debounce, timer } from 'rxjs';
import { KbqClampedListTrigger } from './clamped-list';
import {
    KbqClamped,
    KbqClampedRoot,
    kbqClampedTextDefaultMaxRows,
    kbqInjectClampedTextLocaleConfiguration
} from './constants';

/**
 * Clamps projected text to `rows` lines and offers a disclosure control that reveals the rest.
 * The control only appears once a measurement has shown the content does not fit.
 */
@Component({
    selector: 'kbq-clamped-text',
    imports: [
        KbqIcon,
        KbqLinkModule,
        KbqClampedListTrigger
    ],
    template: `
        <div
            #textContainer
            class="kbq-clamped-text__content"
            [id]="contentId"
            [style.--kbq-clamped-text-line-clamp]="rows()"
            [class.kbq-clamped-text__content_collapsed]="collapsedState()"
        >
            <span #text>
                <ng-content />
            </span>
        </div>

        @if (hasToggle()) {
            <span class="kbq-clamped-text__toggle" kbq-link noUnderline pseudo kbqClampedListTrigger>
                @let config = localeConfiguration();

                @if (collapsedState()) {
                    <i kbq-icon="kbq-chevron-down_16"></i>
                    <span class="kbq-link__text">{{ config.openText }}</span>
                } @else {
                    <i kbq-icon="kbq-chevron-up_16"></i>
                    <span class="kbq-link__text">{{ config.closeText }}</span>
                }
            </span>
        }
    `,
    styleUrls: ['./clamped-text.scss'],
    providers: [
        { provide: KbqClampedRoot, useExisting: KbqClampedText }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-clamped-text'
    },
    exportAs: 'kbqClampedText'
})
export class KbqClampedText implements KbqClamped, AfterViewInit {
    /**
     * Max rows before text is clamped.
     * @default kbqClampedTextDefaultMaxRows
     */
    readonly rows = input(kbqClampedTextDefaultMaxRows, { transform: numberAttribute });
    /**
     * Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = auto.
     * Writable half of the `[(isCollapsed)]` two-way binding — written when the user operates the
     * toggle, never by the component's own measurement.
     */
    readonly isCollapsed = model<boolean | undefined>(undefined);
    /**
     * Debounce time on resize observer when recalculating toggle and text visibility.
     * @default 0
     */
    readonly debounceTime = input(0, { transform: numberAttribute });
    /**
     * Whether collapsing scrolls the component back into view.
     * @default true
     */
    readonly scrollOnCollapse = input(true, { transform: booleanAttribute });

    /** Id of the clamped region, published by the toggle as its `aria-controls`. */
    readonly contentId = inject(_IdGenerator).getId('kbq-clamped-text-content-');

    /** @docs-private */
    protected readonly text = viewChild.required<ElementRef<HTMLSpanElement>>('text');
    /** @docs-private */
    protected readonly textContainer = viewChild.required<ElementRef<HTMLDivElement>>('textContainer');

    private readonly hasToggleState = signal(false);
    /** Whether the content overflows `rows` lines by enough to be worth a toggle. */
    readonly hasToggle: Signal<boolean> = this.hasToggleState.asReadonly();

    /** Whether the content has been measured at least once. */
    private readonly measured = signal(false);

    /**
     * Rendered collapsed state, which drives the css class and the toggle's `aria-expanded`.
     *
     * Before the first measurement nothing is known about the content, so the requested state is
     * applied as-is: the server and the first paint clamp the text rather than flashing all of it.
     * @docs-private
     */
    protected readonly collapsedState = computed(() => {
        const collapsed = this.isCollapsed() ?? true;

        return this.measured() ? this.hasToggle() && collapsed : collapsed;
    });

    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly platform = inject(Platform);

    /**
     * Clamped text locale configuration.
     * @docs-private
     */
    readonly localeConfiguration = kbqInjectClampedTextLocaleConfiguration();

    ngAfterViewInit(): void {
        if (!this.platform.isBrowser) return;

        const textContainer = this.textContainer().nativeElement;

        this.resizeObserver
            .observe(textContainer)
            // `debounce` re-reads the input on every delivery, so a later `[debounceTime]` applies.
            .pipe(
                debounce(() => timer(this.debounceTime())),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.updateToggleVisibilityState());
    }

    /** Flips the collapsed state. Stops event propagation. */
    toggle(event: Event): void {
        event.stopPropagation();

        this.isCollapsed.update((state) => !(state ?? true));

        if (this.scrollOnCollapse() && this.collapsedState()) {
            afterNextRender(
                () => this.elementRef.nativeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
                { injector: this.injector }
            );
        }
    }

    private updateToggleVisibilityState(): void {
        this.hasToggleState.set(this.getRowsCount() > this.rows() + 1);
        this.measured.set(true);
    }

    private getRowsCount(): number {
        const rects = Array.from(this.text().nativeElement.getClientRects());

        return [...new Set(rects.map(({ top }) => top))].length;
    }
}
