import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';

/**
 * @title Scrollbar scroll to top
 */
@Component({
    selector: 'scrollbar-scroll-to-top-example',
    imports: [
        KbqScrollbarModule,
        KbqButtonModule
    ],
    template: `
        <kbq-scrollbar #scrollbarRef="kbqScrollbar" style="width: 200px; height: 200px;" (onScroll)="onScroll($event)">
            @for (item of items; track item) {
                <div>{{ item }}</div>
                <hr />
            }
        </kbq-scrollbar>
        <button
            kbq-button
            [disabled]="!(scrollbarRef?.contentElement?.nativeElement?.scrollTop || 0 > 0)"
            (click)="scrollbarRef.scrollTo({ top: 0, left: 0, behavior: 'smooth' })"
        >
            Scroll To Top
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollbarScrollToTopExample {
    readonly items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);

    onScroll(event): void {
        console.log('onScroll', event);
    }
}
