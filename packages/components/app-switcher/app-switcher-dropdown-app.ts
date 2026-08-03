import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { KBQ_TITLE_TEXT_REF } from '@koobiq/components/core';
import { KbqDropdownItem } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAppSwitcherApp } from './app-switcher';
import { KbqAppSwitcherIconSanitizer } from './app-switcher-icon-sanitizer';

/** @docs-private */
@Component({
    selector: '[kbq-app-switcher-dropdown-app]',
    imports: [KbqIcon, NgOptimizedImage],
    template: `
        @if (safeIcon(); as icon) {
            <span class="kbq-app-switcher-dropdown-app__icon" aria-hidden="true" [innerHtml]="icon"></span>
        } @else if (app().iconSrc; as iconSrc) {
            <span class="kbq-app-switcher-dropdown-app__icon" aria-hidden="true">
                <img alt="" width="24" height="24" [ngSrc]="iconSrc" />
            </span>
        }

        <div class="kbq-app-switcher-dropdown-app__container">
            <div class="kbq-app-switcher-dropdown-app__name">
                <span>{{ app().name }}</span>

                @if (isNested) {
                    <i
                        kbq-icon="kbq-chevron-right-s_16"
                        aria-hidden="true"
                        class="kbq-app-switcher-dropdown-item-trigger__icon"
                        [color]="componentColors.ContrastFade"
                    ></i>
                }
            </div>
            @if (app().caption; as caption) {
                <div class="kbq-app-switcher-dropdown-app__caption">{{ caption }}</div>
            }
        </div>
    `,
    styleUrls: ['app-switcher-dropdown-app.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqAppSwitcherDropdownApp },
        { provide: KbqDropdownItem, useExisting: KbqAppSwitcherDropdownApp }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-app-switcher-dropdown-app',
        role: 'menuitem',
        '[class.kbq-dropdown-item]': 'false',
        '[attr.tabindex]': 'getTabIndex()',
        '[attr.aria-haspopup]': "isNested ? 'menu' : null"
    },
    exportAs: 'kbqAppSwitcherDropdownApp'
})
export class KbqAppSwitcherDropdownApp extends KbqDropdownItem {
    private readonly iconSanitizer = inject(KbqAppSwitcherIconSanitizer);

    /** Application (or synthetic app group) rendered by this flyout row. */
    readonly app = input.required<KbqAppSwitcherApp>({ alias: 'kbq-app-switcher-dropdown-app' });

    /** Inline SVG of the app icon, sanitized against an SVG allow-list. See `KbqAppSwitcherListItem.safeIcon`. */
    protected readonly safeIcon = computed(() => this.iconSanitizer.sanitize(this.app().icon));
}
