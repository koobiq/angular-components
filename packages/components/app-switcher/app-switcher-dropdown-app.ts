import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAppSwitcherApp } from './app-switcher';

/** @docs-private */
@Component({
    selector: '[kbq-app-switcher-dropdown-app]',
    imports: [KbqIcon, NgOptimizedImage],
    template: `
        <i class="kbq kbq-icon" [className]=""></i>
        @if (app.icon) {
            <span class="kbq-app-switcher-dropdown-app__icon" [innerHtml]="getIcon(app.icon)"></span>
        } @else if (app.iconSrc) {
            <span class="kbq-app-switcher-dropdown-app__icon">
                <img alt="{{ app.type }}" width="24" height="24" [ngSrc]="app.iconSrc" />
            </span>
        }

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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqAppSwitcherDropdownApp',
    host: {
        class: 'kbq-app-switcher-dropdown-app',
        '[class.kbq-dropdown-item]': 'false'
    },
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
