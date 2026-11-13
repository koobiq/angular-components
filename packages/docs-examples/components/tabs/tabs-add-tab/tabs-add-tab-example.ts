import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    Injector,
    viewChildren
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabLink, KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Tabs add tab
 */
@Component({
    selector: 'tabs-add-tab-example',
    imports: [KbqTabsModule, KbqButtonModule, KbqIconModule, KbqToolTipModule],
    template: `
        <div class="example-tabs-add-tab__bar">
            <nav kbqTabNavBar class="example-tab-nav-bar" [tabNavPanel]="tabNavPanel">
                @for (tab of tabs; track tab) {
                    <a kbqTabLink [active]="activeTab === tab" (click)="activeTab = tab">
                        {{ tab }}
                        @if (activeTab === tab) {
                            <div class="example-tab-close">
                                <button
                                    color="contrast-fade"
                                    kbq-icon-button="kbq-xmark-s_16"
                                    kbqTooltip="Remove tab"
                                    aria-label="Remove tab"
                                    (click)="removeTab(tab, $event)"
                                    (keydown)="$event.stopPropagation()"
                                ></button>
                            </div>
                        }
                    </a>
                }
            </nav>
            <button
                color="contrast"
                kbqStyle="transparent"
                kbq-button
                aria-label="Add"
                kbqTooltip="Add tab"
                (click)="addTab()"
            >
                <i kbq-icon="kbq-plus_16"></i>
            </button>
        </div>

        <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel class="example-tabs-add-tab__content">
            {{ activeTab }} content
        </div>
    `,
    styleUrls: ['./tabs-add-tab-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsAddTabExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly injector = inject(Injector);
    private readonly tabLinks = viewChildren(KbqTabLink);

    private readonly defaultTabs = computed(() => [
        this.t().bruteforce,
        this.t().complexAttack,
        this.t().ddos,
        this.t().hipsAlert
    ]);

    protected tabs: string[] = [];
    protected activeTab: string = '';

    constructor() {
        effect(() => {
            // Rebuild the localized tabs on a locale switch, keeping the tabs added at runtime.
            const base = this.defaultTabs();
            const added = this.tabs.filter((tab) => !this.baseTabs.includes(tab));

            this.baseTabs = base;
            this.tabs = [...base, ...added];

            if (!this.tabs.includes(this.activeTab)) {
                this.activeTab = this.tabs[0];
            }
        });
    }

    private baseTabs: string[] = [];

    protected addTab(): void {
        const newTab = 'Tab ' + (this.tabs.length + 1);

        this.tabs = [...this.tabs, newTab];
        this.activeTab = newTab;

        afterNextRender(() => this.tabLinks().at(-1)?.focus(), { injector: this.injector });
    }

    protected removeTab(tab: string, event: Event): void {
        event.stopPropagation();
        const index = this.tabs.indexOf(tab);

        this.tabs = this.tabs.filter((t) => t !== tab);

        if (this.tabs.length > 0) {
            this.activeTab = this.tabs[Math.max(0, index - 1)];
        }
    }
}
