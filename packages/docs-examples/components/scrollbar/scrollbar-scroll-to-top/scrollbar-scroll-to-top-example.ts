import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';

/**
 * @title Scrollbar Scroll To Top
 */
@Component({
    standalone: true,
    selector: 'scrollbar-scroll-to-top-example',
    imports: [
        KbqButtonModule,
        KbqScrollbarModule
    ],
    template: `
        <div
            class="scrollarea_with-scroll-to-top"
            style="position: relative; width: 400px"
        >
            <div
                #scrollbarRef="kbqScrollbar"
                (onScroll)="cdr.markForCheck()"
                kbq-scrollbar
                style="height: 300px; max-width: 400px"
            >
                <div [style.width.px]="400">
                    @for (paragraph of text; track paragraph) {
                        {{ paragraph }}
                    }
                </div>
            </div>

            @if (scrollbarRef?.contentElement?.nativeElement?.scrollTop || 0 > 0) {
                <button
                    class="button_scroll-to-top"
                    (click)="scrollbarRef.scrollTo({ top: 0, left: 0, behavior: 'smooth' })"
                    kbq-button
                    style="position: absolute; bottom: 5px; right: 5px"
                >
                    Scroll To Top
                </button>
            }
        </div>
    `,
    encapsulation: ViewEncapsulation.None
})
export class ScrollbarScrollToTopExample {
    text = Array<string>(20).fill(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla elementum mauris ut hendrerit lobortis. Nam tincidunt eros dolor, vitae auctor dolor suscipit quis. Quisque sagittis sit amet lectus sed vulputate. Cras ornare purus quis suscipit vulputate. Proin vitae dolor in velit tristique finibus eget ut lorem. Integer eu maximus lorem. Maecenas eu consectetur ligula, id mattis urna. Donec nisi ipsum, sollicitudin sit amet euismod ut, tempor eu felis. Quisque sit amet sapien purus. Curabitur quis nisi eros. Cras at aliquet sem, vel tincidunt turpis.'
    );

    constructor(public cdr: ChangeDetectorRef) {}
}
