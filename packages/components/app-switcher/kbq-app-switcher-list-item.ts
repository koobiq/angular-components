import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAppSwitcherApp } from './app-switcher';

/** @docs-private */
@Component({
    standalone: true,
    selector: '[kbq-app-switcher-list-item]',
    exportAs: 'kbqAppSwitcherApp',
    template: `
        <span class="kbq-app-switcher-list-item__icon" [innerHtml]="getIcon(app.icon)"></span>

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher-list-item',
        '[class.kbq-dropdown-item]': 'false',
        '(click)': 'clickHandler($event)'
    },
    imports: [
        KbqIcon,
        NgTemplateOutlet
    ],
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
