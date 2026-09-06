import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { enUSLocaleData } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';
import { KbqClampedText } from './clamped-text';
import { kbqClampedTextDefaultMaxRows, kbqClampedTextLocaleConfigurationProvider } from './constants';

const text =
    'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources. More sophisticated strategies are required to mitigate this type of attack; simply attempting to block a single source is insufficient as there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade and losing the business money. Criminal perpetrators of DoS attacks often target sites or services hosted on high-profile web servers such as banks or credit card payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these attacks.';

type ClampedTextState = {
    rows: number;
    isCollapsed?: boolean;
};

@Component({
    selector: 'e2e-clamped-text-state-and-style',
    imports: [KbqClampedText],
    template: `
        <div>
            <table data-testid="e2eClampedTextTable">
                @for (row of states(); track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td style="max-width: 300px;">
                                <kbq-clamped-text [rows]="cell.rows" [isCollapsed]="cell.isCollapsed">
                                    {{ text }}
                                </kbq-clamped-text>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedTextStateAndStyle'
    }
})
export class E2eClampedTextStateAndStyle {
    protected readonly text = text;

    constructor() {
        afterNextRender(() => {
            this.states.set([
                [{ isCollapsed: true, rows: kbqClampedTextDefaultMaxRows }],
                [{ isCollapsed: false, rows: kbqClampedTextDefaultMaxRows }],
                [{ rows: 3 }]
            ]);
        });
    }

    protected readonly states = signal<ClampedTextState[][]>([
        [{ rows: kbqClampedTextDefaultMaxRows }],
        [{ rows: kbqClampedTextDefaultMaxRows }],
        [{ rows: 3 }]
    ]);
}

@Component({
    selector: 'e2e-clamped-text-states',
    imports: [KbqClampedText],
    template: `
        <div data-testid="auto_collapsed" style="max-width: 200px;">
            <kbq-clamped-text [rows]="2">{{ text }}</kbq-clamped-text>
        </div>

        <div data-testid="resize_persistence" [style.max-width.px]="resizeWidth()">
            <kbq-clamped-text [rows]="2">{{ text }}</kbq-clamped-text>
        </div>
        <button data-testid="resize_persistence_widen" type="button" (click)="widen()">Widen</button>

        <div data-testid="unbreakable_token" style="max-width: 200px;">
            <kbq-clamped-text [rows]="2">{{ unbreakableToken }}</kbq-clamped-text>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-s);
        }
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedTextStates'
    }
})
export class E2eClampedTextStates {
    protected readonly text = text;
    protected readonly resizeWidth = signal(200);
    /** A single 80-character word: nothing in it can wrap, so a collapsed block that scrolls will. */
    protected readonly unbreakableToken = 'a'.repeat(80);

    protected widen(): void {
        this.resizeWidth.set(1000);
    }
}

/**
 * Renders `kbqClampedList` on a page with no `kbq-clamped-text`, so the trigger is shown with only
 * the styling the directive owns.
 */
@Component({
    selector: 'e2e-clamped-list',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqLink],
    template: `
        <div #clampedList="kbqClampedList" class="layout-column layout-gap-xxs" kbqClampedList [items]="items">
            @for (item of clampedList.visibleItems(); track item) {
                <span>{{ item }}</span>
            }

            @if (clampedList.hasToggle()) {
                <a data-testid="e2eClampedListTrigger" kbq-link kbqClampedListTrigger pseudo>
                    @if (clampedList.isCollapsed()) {
                        {{ clampedList.showMoreCountText() }}
                    } @else {
                        {{ clampedList.localeConfiguration().closeText }}
                    }
                </a>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-s);
        }
    `,
    providers: [kbqClampedTextLocaleConfigurationProvider(enUSLocaleData.clampedText)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eClampedList'
    }
})
export class E2eClampedList {
    protected readonly items = Array.from({ length: 17 }, (_, index) => `Item ${index + 1}`);
}
