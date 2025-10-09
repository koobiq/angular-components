import { ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAppSwitcherApp } from './app-switcher';

/** @docs-private */
@Component({
    standalone: true,
    selector: '[kbq-app-switcher-dropdown-app]',
    exportAs: 'kbqAppSwitcherDropdownApp',
    template: `
        <i class="kbq kbq-icon" [className]=""></i>
        <span class="kbq-app-switcher-dropdown-app__icon" [innerHtml]="getIcon(app.icon)"></span>

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
    imports: [KbqIcon],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherDropdownApp },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherDropdownApp }
    ]
})
export class KbqAppSwitcherDropdownApp extends KbqDropdownItem {
    private sanitizer = inject(DomSanitizer);

    @Input('kbq-app-switcher-dropdown-app') app: KbqAppSwitcherApp;

    getIcon(icon: string | null) {
        return this.sanitizer.bypassSecurityTrustHtml(icon || '');
    }
}
