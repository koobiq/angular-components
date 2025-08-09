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

        @if (hasExpander()) {
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
                    <ng-content select="clamped-text-toggle,[clamped-text-toggle]" />

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

    protected readonly collapsedState = signal<boolean>(true);
    protected readonly hasExpander = signal(true);
    protected readonly lineClamp = signal<number | null>(null);

    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly destroyRef = inject(DestroyRef);
    private isEventFromToggle: boolean | null = null;

    private readonly text = viewChild<ElementRef<HTMLSpanElement>>('text');
    private readonly textContainer = viewChild<ElementRef<HTMLDivElement>>('textContainer');

    protected readonly config: KbqClampedTextConfig = {
        openText: 'Развернуть',
        closeText: 'Свернуть'
    };

    constructor() {
        toObservable(this.isCollapsed)
            .pipe(takeUntilDestroyed())
            .subscribe((collapsed) => {
                this.collapsedState.set(collapsed ?? true);
            });

        toObservable(this.collapsedState)
            .pipe(takeUntilDestroyed())
            .subscribe((collapsed) => {
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const shouldCollapse = this.getRowsCount() > this.rows() + 1;

                this.hasExpander.set(shouldCollapse);

                if (!this.hasExpander() && !this.isEventFromToggle) {
                    this.collapsedState.set(false);
                }

                if (this.hasExpander() && this.isCollapsed === undefined && !this.isEventFromToggle) {
                    this.collapsedState.set(true);
                }

                this.isEventFromToggle = null;
            });
    }

    /** @docs-private */
    toggleIsCollapsed(event: Event): void {
        event.stopPropagation();
        const updatedState = !this.collapsedState();

        this.isEventFromToggle = true;

        this.collapsedState.set(updatedState);

        if (updatedState) {
            setTimeout(() => {
                event.target && event.target instanceof HTMLElement && event.target.scrollIntoView();
            });
        }
    }

    private getRowsCount(): number {
        return [
            ...new Set(Array.from(this.text()!.nativeElement.getClientRects()).map((rects) => rects.top))].length;
    }
}
