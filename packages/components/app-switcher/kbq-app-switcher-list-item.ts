import { NgOptimizedImage } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqAppSwitcherApp } from './app-switcher';

/** @docs-private */
@Component({
    selector: '[kbq-app-switcher-list-item]',
    imports: [
        KbqIconModule,
        NgOptimizedImage
    ],
    template: `
        @if (app.icon) {
            <span class="kbq-app-switcher-list-item__icon" [innerHtml]="getIcon(app.icon)"></span>
        } @else if (app.iconSrc) {
            <span class="kbq-app-switcher-list-item__icon">
                <img alt="{{ app.type }}" width="24" height="24" [ngSrc]="app.iconSrc" />
            </span>
        }

        <div class="kbq-app-switcher-list-item__container">
            <div class="kbq-app-switcher-list-item__name">{{ app.name }}</div>
            @if (app.caption) {
                <div class="kbq-app-switcher-list-item__caption">{{ app.caption }}</div>
            }
        </div>

        @if (toggle) {
            <div class="kbq-app-switcher-list-item__toggle" [class.kbq-expanded]="!collapsed">
                <i kbq-icon="kbq-chevron-down-s_16" [color]="'contrast-fade'"></i>
            </div>
        }
    `,
    styleUrls: ['kbq-app-switcher-list-item.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqAppSwitcherApp',
    host: {
        class: 'kbq-app-switcher-list-item',
        '[class.kbq-dropdown-item]': 'false',
        '(click)': 'clickHandler($event)'
    },
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherListItem },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherListItem }
    ]
})
export class KbqAppSwitcherListItem extends KbqDropdownItem {
    private sanitizer = inject(DomSanitizer);

    @Input() app: KbqAppSwitcherApp;
    @Input({ transform: booleanAttribute }) toggle = false;
    @Input({ transform: booleanAttribute }) collapsed: boolean = false;

    clickHandler(event: MouseEvent) {
        if (this.toggle) {
            event.stopPropagation();
            event.preventDefault();

            this.collapsed = !this.collapsed;
        }
    }

    getIcon(icon: string | null) {
        return this.sanitizer.bypassSecurityTrustHtml(icon || '');
    }
}
