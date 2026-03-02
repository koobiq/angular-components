import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
            <div #clampedList="kbqClampedList" kbqClampedList class="layout-row layout-wrap" [items]="countries">
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
                            {{ clampedList.localeConfiguration()?.openText ?? 'open' }}
                        } @else {
                            {{ clampedList.localeConfiguration()?.closeText ?? 'close' }}
                        }
                    </a>
                }
            </div>
        </div>
    `,
    styles: `
        :host > div {
            overflow: auto;
            resize: horizontal;
            max-width: 100%;
            min-width: 150px;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListExample {
    protected readonly collapsed = signal(true);
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
