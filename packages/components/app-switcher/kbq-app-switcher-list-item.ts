import { NgOptimizedImage } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    input,
    ViewEncapsulation
} from '@angular/core';
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

        @if (toggle()) {
            <div class="kbq-app-switcher-list-item__toggle" [class.kbq-expanded]="!collapsed">
                <i kbq-icon="kbq-chevron-down-s_16" [color]="'contrast-fade'"></i>
            </div>
        }
    `,
    styleUrls: ['kbq-app-switcher-list-item.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherListItem },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherListItem }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher-list-item',
        '[class.kbq-dropdown-item]': 'false',
        '(click)': 'clickHandler($event)'
    },
    exportAs: 'kbqAppSwitcherApp'
})
export class KbqAppSwitcherListItem extends KbqDropdownItem {
    private sanitizer = inject(DomSanitizer);

    // TODO: Skipped for migration because:
    //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
    //  and migrating would break narrowing currently.
    @Input() app: KbqAppSwitcherApp;
    readonly toggle = input(false, { transform: booleanAttribute });
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) collapsed: boolean = false;

    clickHandler(event: MouseEvent) {
        if (this.toggle()) {
            event.stopPropagation();
            event.preventDefault();

            this.collapsed = !this.collapsed;
        }
    }

    getIcon(icon: string | null) {
        return this.sanitizer.bypassSecurityTrustHtml(icon || '');
    }
}
