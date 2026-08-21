import { CdkScrollableModule, ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    NgZone,
    inject,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KBQ_SELECT_SCROLL_STRATEGY,
    KbqAutoHideScrollStrategy,
    kbqAutoHideScrollStrategyFactory
} from '@koobiq/components/core';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';

/**
 * @title select-auto-hide-scroll-strategy
 */
@Component({
    selector: 'select-auto-hide-scroll-strategy-example',
    imports: [CdkScrollableModule, KbqSelectModule, KbqNativeScrollbar],
    template: `
        <div class="example-select-auto-hide-scroll-strategy__container" kbqNativeScrollbar cdkScrollable>
            <div class="example-select-auto-hide-scroll-strategy__spacer">Scroll down</div>

            <kbq-form-field>
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>

            <div class="example-select-auto-hide-scroll-strategy__spacer">Scroll up</div>
        </div>
    `,
    styles: `
        .example-select-auto-hide-scroll-strategy__container {
            height: 200px;
            overflow-y: auto;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: 4px;
            padding: 16px;
        }

        .example-select-auto-hide-scroll-strategy__spacer {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 250px;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    providers: [
        {
            provide: KBQ_SELECT_SCROLL_STRATEGY,
            useFactory: () => {
                const scrollDispatcher = inject(ScrollDispatcher);
                const viewportRuler = inject(ViewportRuler);
                const ngZone = inject(NgZone);

                return kbqAutoHideScrollStrategyFactory(scrollDispatcher, viewportRuler, ngZone);
            }
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectAutoHideScrollStrategyExample implements AfterViewInit {
    protected readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    protected readonly selected = this.options[0];

    private readonly select = viewChild.required(KbqSelect);
    private readonly destroyRef = inject(DestroyRef);

    ngAfterViewInit(): void {
        const select = this.select();

        // `scrollStrategy` is created eagerly as a field initializer, so it's ready to subscribe
        // to as soon as the view is initialized — no need to force-create an overlay first.
        const scrollStrategy = select.scrollStrategy as KbqAutoHideScrollStrategy;

        scrollStrategy.hide.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => select.close());
    }
}
