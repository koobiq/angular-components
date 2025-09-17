import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';

@Component({
    standalone: true,
    selector: '[kbq-app-switcher-dropdown-app]',
    exportAs: 'kbqAppSwitcherDropdownApp',
    template: `
        <i class="kbq kbq-icon" [className]=""></i>
        <span class="kbq-app-switcher-dropdown-app__icon">
            <!-- prettier-ignore -->
            <svg fill="none" height="24" viewBox="0 0 32 32" width="24"
                 xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z" fill-rule="evenodd" [attr.fill]="'#212121'"/>
                <path d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z" [attr.fill]="'white'"/></svg>
        </span>

        <div class="kbq-app-switcher-dropdown-app__container">
            <div class="kbq-app-switcher-dropdown-app__name">
                <span>{{ app.name }}</span>

                @if (isNested) {
                    <i
                        kbq-icon="kbq-chevron-right-s_16"
                        class="kbq-app-switcher-dropdown-item-trigger__icon"
                        [color]="componentColors.ContrastFade"
                    ></i>
                }
            </div>
            @if (app.caption) {
                <div class="kbq-app-switcher-dropdown-app__caption">{{ app.caption }}</div>
            }
        </div>
    `,
    styleUrls: ['app-switcher-dropdown-app.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher-dropdown-app',
        '[class.kbq-dropdown-item]': 'false'
    },
    imports: [
        KbqIcon
    ],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherDropdownApp },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherDropdownApp }
    ]
})
export class KbqAppSwitcherDropdownApp extends KbqDropdownItem {
    @Input('kbq-app-switcher-dropdown-app') app;
}
