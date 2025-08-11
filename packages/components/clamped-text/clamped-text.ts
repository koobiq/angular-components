import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    output,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { skip } from 'rxjs';
import { kbqClampedTextDefaultMaxRows } from './constants';
import { KbqClampedTextConfig } from './types';

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

                    @if (collapsedState()) {
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                        {{ config.openText }}
                    } @else {
                        <i kbq-icon="kbq-chevron-up-s_16"></i>
                        {{ config.closeText }}
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
    readonly rows = input<number>(kbqClampedTextDefaultMaxRows);
    readonly isCollapsed = input<boolean | undefined>();
    readonly isCollapsedChange = output<boolean>();

    protected readonly text = viewChild<ElementRef<HTMLSpanElement>>('text');
    protected readonly textContainer = viewChild<ElementRef<HTMLDivElement>>('textContainer');

    /** This flag controls event emission, aria/css-class calculation */
    protected readonly collapsedState = signal<boolean | undefined>(undefined);
    protected readonly isToggleCollapsed = signal<boolean | undefined>(undefined);
    protected readonly hasToggle = signal(true);
    protected readonly lineClamp = signal<number | null>(null);

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly config: KbqClampedTextConfig = {
        openText: 'Развернуть',
        closeText: 'Свернуть'
    };

    private isEventFromToggle = false;

    constructor() {
        toObservable(this.isCollapsed)
            .pipe(takeUntilDestroyed())
            .subscribe((collapsed) => {
                this.collapsedState.set(collapsed ?? this.isToggleCollapsed() ?? false);
            });

        toObservable(this.collapsedState)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe((collapsed) => {
                this.isCollapsedChange.emit(collapsed || true);
            });

        toObservable(this.rows)
            .pipe(takeUntilDestroyed())
            .subscribe((rows) => this.lineClamp.set(rows));
    }

    ngAfterViewInit(): void {
        const textContainer = this.textContainer()!.nativeElement;

        this.resizeObserver
            .observe(textContainer)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.updateToggleVisibilityState();
                this.updateCollapsedState();
            });
    }

    /** @docs-private */
    toggleIsCollapsed(event: Event): void {
        event.stopPropagation();

        this.collapsedState.update((state) =>
            this.toggleCollapseState(this.isToggleCollapsed() ?? this.isCollapsed() ?? state)
        );
        this.isToggleCollapsed.update((state) => this.toggleCollapseState(state ?? this.isCollapsed()));

        // set flag to true  since `collapseState` change will trigger resize event
        this.isEventFromToggle = true;

        if (this.collapsedState()) {
            setTimeout(() => this.elementRef.nativeElement.scrollIntoView());
        }
    }

    /**
     * Calculates next collapsed state according to previous one.
     * `undefined` is treated as collapsed and not touched stated.
     */
    private toggleCollapseState = (state: boolean | undefined): boolean => {
        return state === undefined ? false : !state;
    };

    private updateToggleVisibilityState(): void {
        this.hasToggle.set(this.getRowsCount() > this.rows() + 1);
    }

    private updateCollapsedState(): void {
        if (this.isEventFromToggle) {
            this.isEventFromToggle = false;

            return;
        }

        this.collapsedState.set(this.hasToggle() && (this.isToggleCollapsed() ?? this.isCollapsed() ?? true));
    }

    private getRowsCount(): number {
        const rects = Array.from(this.text()!.nativeElement.getClientRects());

        return [...new Set(rects.map((rects) => rects.top))].length;
    }
}
