import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs nav bar overview
 */
@Component({
    selector: 'tabs-nav-bar-overview-example',
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar [tabNavPanel]="tabNavPanel">
            @for (link of links; track link) {
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
    readonly links = ['BruteForce', 'Complex attack', 'DDos'];
    activeLink = this.links[0];
}
