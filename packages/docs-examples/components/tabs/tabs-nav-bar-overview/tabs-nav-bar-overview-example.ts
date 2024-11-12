import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs nav bar overview
 */
@Component({
    standalone: true,
    selector: 'tabs-nav-bar-overview-example',
    imports: [KbqTabsModule],
    template: `
        <nav
            [tabNavPanel]="tabNavPanel"
            kbqTabNavBar
        >
            @for (link of links; track link) {
                <a
                    [active]="activeLink === link"
                    (click)="activeLink = link"
                    kbqTabLink
                >
                    {{ link }}
                </a>
            }
            <a
                disabled
                kbqTabLink
            >
                DoS
            </a>
        </nav>
        <main
            #tabNavPanel="kbqTabNavPanel"
            kbqTabNavPanel
        >
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
