import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Tabs nav bar overview
 */
@Component({
    selector: 'tabs-nav-bar-overview-example',
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar [tabNavPanel]="tabNavPanel">
            @for (link of links(); track link) {
                <a kbqTabLink [active]="activeLink === link" (click)="activeLink = link">
                    {{ link }}
                </a>
            }
            <a disabled kbqTabLink>DoS</a>
        </nav>
        <main #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel>
            Active link: {{ activeLink }}
            <!-- Perfect place for your <router-outlet /> -->
        </main>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsNavBarOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly links = computed(() => [this.t().bruteforce, this.t().complexAttack, this.t().ddos]);
    activeLink = this.links[0];
}
