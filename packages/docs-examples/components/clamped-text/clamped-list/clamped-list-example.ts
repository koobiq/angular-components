import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqClampedList, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Clamped-list
 */
@Component({
    selector: 'clamped-list-example',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqLink],
    template: `
        <div class="layout-margin-bottom-l layout-margin-top-l">
            <div
                #clampedList="kbqClampedList"
                kbqClampedList
                class="layout-row layout-wrap"
                [items]="countries"
                [(isCollapsed)]="collapsed"
            >
                @for (item of clampedList.visibleItems(); track item) {
                    <div>
                        <span>
                            <span>{{ item }}</span>
                            @if (clampedList.hasToggle()) {
                                <span>,&nbsp;</span>
                            }
                        </span>
                    </div>
                }
                @if (clampedList.hasToggle()) {
                    <a
                        #trigger="kbqClampedListTrigger"
                        kbqClampedListTrigger
                        kbq-link
                        pseudo
                        style="margin-top: 0px !important"
                    >
                        @if (clampedList.isCollapsed()) {
                            {{ clampedList.exceededItemCount() }} {{ clampedList.localeConfiguration().moreText }}
                        } @else {
                            {{ clampedList.localeConfiguration().closeText }}
                        }
                    </a>
                }
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListExample {
    protected readonly collapsed = model(true);
    protected countries = [
        'Australia',
        'Austria',
        'Argentina',
        'Belgium',
        'Brazil',
        'United Kingdom',
        'Germany',
        'Greece',
        'Denmark',
        'Egypt',
        'India',
        'Spain',
        'Italy',
        'Canada',
        'Mexico',
        'Netherlands',
        'Norway',
        'Poland',
        'Portugal',
        'Russia',
        'United States',
        'Thailand',
        'Turkey',
        'France',
        'Japan'
    ];
}
