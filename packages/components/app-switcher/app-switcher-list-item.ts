import { NgOptimizedImage } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_TITLE_TEXT_REF, KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqAppSwitcherApp } from './app-switcher';
import { KbqAppSwitcherIconSanitizer } from './app-switcher-icon-sanitizer';

/** @docs-private */
@Component({
    selector: '[kbq-app-switcher-list-item]',
    imports: [
        KbqIconModule,
        NgOptimizedImage,
        KbqHighlightBackgroundPipe
    ],
    template: `
        @if (safeIcon(); as icon) {
            <span class="kbq-app-switcher-list-item__icon" aria-hidden="true" [innerHtml]="icon"></span>
        } @else if (app().iconSrc; as iconSrc) {
            <span class="kbq-app-switcher-list-item__icon" aria-hidden="true">
                <img alt="" width="24" height="24" [ngSrc]="iconSrc" />
            </span>
        }

        <div class="kbq-app-switcher-list-item__container">
            <div
                class="kbq-app-switcher-list-item__name"
                [innerHTML]="app().name | kbqHighlightBackground: highlightText()"
            ></div>
            @if (app().caption; as caption) {
                <div class="kbq-app-switcher-list-item__caption">{{ caption }}</div>
            }
        </div>

        @if (toggle()) {
            <div class="kbq-app-switcher-list-item__toggle" [class.kbq-expanded]="!collapsed()">
                <i kbq-icon="kbq-chevron-down-s_16" aria-hidden="true" [color]="'contrast-fade'"></i>
            </div>
        }
    `,
    styleUrls: ['app-switcher-list-item.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherListItem },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherListItem }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher-list-item',
        role: 'menuitem',
        '[class.kbq-dropdown-item]': 'false',
        '[attr.tabindex]': 'getTabIndex()',
        '[attr.aria-expanded]': 'toggle() ? !collapsed() : null',
        '(click)': 'clickHandler($event)'
    },
    exportAs: 'kbqAppSwitcherApp'
})
export class KbqAppSwitcherListItem extends KbqDropdownItem {
    private readonly iconSanitizer = inject(KbqAppSwitcherIconSanitizer);

    /** Application (or synthetic app group) rendered by this row. */
    readonly app = input.required<KbqAppSwitcherApp>();

    /** Whether the row is a group header carrying the expand/collapse toggle. */
    readonly toggle = input(false, { transform: booleanAttribute });

    /** Search query to highlight within the app name. */
    readonly highlightText = input<string>('');

    /** Whether the group's aliases are hidden. */
    readonly collapsed = model(false);

    /**
     * Inline SVG of the app icon, sanitized against an SVG allow-list.
     *
     * Computed from the `app` input instead of being called from the template, so the `SafeHtml` is produced
     * once per app rather than on every change-detection pass — a fresh object would make `[innerHtml]`
     * re-parse the SVG each time.
     */
    protected readonly safeIcon = computed(() => this.iconSanitizer.sanitize(this.app().icon));

    /** Toggles the group when this row is a group header; plain rows keep their link behaviour. */
    clickHandler(event: MouseEvent) {
        if (this.toggle()) {
            event.stopPropagation();
            event.preventDefault();

            this.collapsed.set(!this.collapsed());
        }
    }
}
