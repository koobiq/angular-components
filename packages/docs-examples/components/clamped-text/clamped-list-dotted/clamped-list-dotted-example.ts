import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqClampedList, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Clamped-list dotted
 */
@Component({
    selector: 'clamped-list-dotted-example',
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
                        <span class="example-list-item">
                            <span>{{ item }}</span>
                            @if (clampedList.hasToggle()) {
                                <span
                                    class="example-list-item__divider layout-align-center-center layout-margin-left-xxs layout-margin-right-xxs"
                                >
                                    <svg
                                        width="2"
                                        height="2"
                                        viewBox="0 0 2 2"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M0.894886 1.78977C0.649621 1.78977 0.439157 1.70194 0.263494 1.52628C0.0878314 1.35062 0 1.14015 0 0.894887C0 0.649621 0.0878314 0.439157 0.263494 0.263494C0.439157 0.0878315 0.649621 0 0.894886 0C1.14015 0 1.35062 0.0878315 1.52628 0.263494C1.70194 0.439157 1.78977 0.649621 1.78977 0.894887C1.78977 1.05729 1.74834 1.20644 1.66548 1.34233C1.58594 1.47822 1.47822 1.58759 1.34233 1.67045C1.20975 1.75 1.06061 1.78977 0.894886 1.78977Z"
                                            fill="#6C7393"
                                        />
                                    </svg>
                                </span>
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
    styles: `
        .example-list-item {
            display: inline-flex;
        }

        .example-list-item__divider {
            display: inline-flex;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListDottedExample {
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
