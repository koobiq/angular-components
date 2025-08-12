import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, KbqClampedTextLocaleConfig } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { debounceTime, map, of, pairwise, skip } from 'rxjs';
import { KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION, kbqClampedTextDefaultMaxRows } from './constants';

const baseClass = 'kbq-clamped-text';

@Component({
    selector: 'kbq-clamped-text',
    standalone: true,
    exportAs: 'kbqClampedText',
    imports: [
        KbqIcon,
        KbqButtonModule,
        KbqLinkModule
    ],
    template: `
        <div
            #textContainer
            class="kbq-clamped-text__content"
            [style.-webkit-line-clamp]="lineClamp()"
            [style.line-clamp]="lineClamp()"
            [class.kbq-clamped-text__content_collapsed]="collapsedState()"
        >
            <span #text>
                <ng-content />
            </span>
        </div>

        @if (hasToggle()) {
            <span
                class="kbq-clamped-text__toggle"
                kbq-link
                noUnderline
                pseudo
                role="button"
                (click)="toggleIsCollapsed($event)"
                (keydown.enter)="toggleIsCollapsed($event)"
                (keydown.space)="toggleIsCollapsed($event)"
            >
                <span class="kbq-link__text">
                    <ng-content select="kbq-clamped-text-toggle,[kbq-clamped-text-toggle]" />

                    @let config = localeConfiguration();

                    @if (collapsedState()) {
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                        {{ config!.openText }}
                    } @else {
                        <i kbq-icon="kbq-chevron-up-s_16"></i>
                        {{ config!.closeText }}
                    }
                </span>
            </span>
        }
    `,
    styleUrls: ['./clamped-text.scss', './clamped-text-tokens.scss'],
    host: {
        class: baseClass,
        '[attr.aria-expanded]': 'collapsedState() ? "false" : "true"'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClampedText implements AfterViewInit {
    /**
     * Max rows before text is clamped.
     * @default kbqClampedTextDefaultMaxRows
     */
    readonly rows = input<number>(kbqClampedTextDefaultMaxRows);
    /** Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = auto. */
    readonly isCollapsed = input<boolean>();
    /** Emits when collapsed state changes. Used for two-way binding with `isCollapsed`. */
    readonly isCollapsedChange = output<boolean>();
    /**
     * Debounce time on resize observer when recalculating toggle and text visibility.
     * @default 0
     */
    readonly debounceTime = input(0, { transform: numberAttribute });

    /** @docs-private */
    protected readonly text = viewChild<ElementRef<HTMLSpanElement>>('text');
    /** @docs-private */
    protected readonly textContainer = viewChild<ElementRef<HTMLDivElement>>('textContainer');

    /** This flag controls event emission, aria/css-class calculation */
    protected readonly collapsedState = signal<boolean | undefined>(undefined);
    /** @docs-private */
    protected readonly isToggleCollapsed = signal<boolean | undefined>(undefined);
    /** @docs-private */
    protected readonly hasToggle = signal(true);
    /** @docs-private */
    protected readonly lineClamp = signal<number | null>(null);

    private readonly destroyRef = inject(DestroyRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    /**
     * Clamped text locale configuration.
     * @docs-private
     */
    protected readonly localeConfiguration = toSignal<KbqClampedTextLocaleConfig>(
        this.localeService
            ? this.localeService.changes.pipe(
                  map(() => this.localeService!.getParams('clampedText') satisfies KbqClampedTextLocaleConfig)
              )
            : of(inject(KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION))
    );

    /**
     * This flag is used to prevent trigger resize observer on toggle click.
     */
    private isEventFromToggle = false;

    constructor() {
        toObservable(this.isCollapsed)
            .pipe(pairwise(), takeUntilDestroyed())
            .subscribe(([previous, current]) => {
                this.collapsedState.set(current);
                // store previous collapsed value to reduce unnecessary changes
                this.isToggleCollapsed.set(!this.hasToggle() ? previous : current);
            });

        toObservable(this.collapsedState)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe((collapsed) => {
                if (collapsed === undefined) return;
                this.isCollapsedChange.emit(collapsed);
            });

        toObservable(this.rows)
            .pipe(takeUntilDestroyed())
            .subscribe((rows) => this.lineClamp.set(rows));
    }

    ngAfterViewInit(): void {
        const textContainer = this.textContainer()!.nativeElement;

        this.resizeObserver
            .observe(textContainer)
            .pipe(debounceTime(this.debounceTime()), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.updateToggleVisibilityState();
                this.updateCollapsedState();
            });
    }

    /** @docs-private */
    toggleIsCollapsed(event: Event): void {
        event.stopPropagation();

        this.collapsedState.update((state) => {
            return this.toggleCollapseState(this.isToggleCollapsed() ?? state);
        });
        this.isToggleCollapsed.update(this.toggleCollapseState);

        this.isEventFromToggle = true;

        if (this.collapsedState()) {
            setTimeout(() => this.elementRef.nativeElement.scrollIntoView({ block: 'center', inline: 'center' }));
        }
    }

    private updateToggleVisibilityState(): void {
        const state = this.getRowsCount() > this.rows() + 1;

        this.hasToggle.set(state);
    }

    private updateCollapsedState(): void {
        if (this.isEventFromToggle) {
            this.isEventFromToggle = false;

            return;
        }

        this.collapsedState.set(this.hasToggle() && (this.isToggleCollapsed() ?? true));
    }

    /**
     * Calculates next collapsed state according to previous one.
     * `undefined` is treated as collapsed and not touched stated.
     */
    private toggleCollapseState = (state: boolean | undefined): boolean => {
        return state === undefined ? false : !state;
    };

    private getRowsCount(): number {
        const rects = Array.from(this.text()!.nativeElement.getClientRects());

        return [...new Set(rects.map(({ top }) => top))].length;
    }
}
