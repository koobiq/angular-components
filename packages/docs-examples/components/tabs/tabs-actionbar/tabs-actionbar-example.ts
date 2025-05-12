import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs actionbar
 */
@Component({
    standalone: true,
    imports: [
        KbqTabsModule,
        KbqButtonModule,
        KbqIconModule
    ],
    selector: 'tabs-actionbar-example',
    template: `
        <div class="example-tabs-actionbar">
            <div class="example-tabs-actionbar_nav">
                <nav kbqTabNavBar underlined>
                    @for (dashboard of dashboards; track dashboard) {
                        <a [active]="activeDashboard === dashboard" (click)="activeDashboard = dashboard" kbqTabLink>
                            {{ dashboard }}
                        </a>
                    }
                </nav>
            </div>

            <div class="example-tabs-actionbar_controls">
                <button class="kbq-button_transparent" color="contrast" kbq-button>
                    <i kbq-icon="kbq-list_16"></i>
                </button>
                <button class="kbq-button_transparent" color="contrast" kbq-button>
                    <i kbq-icon="kbq-filter_16"></i>
                </button>
                <button (click)="createDashboard()" color="contrast" kbq-button>
                    <i kbq-icon="kbq-plus_16"></i>
                    Create dashboard
                </button>
            </div>
        </div>
    `,
    styleUrls: ['tabs-actionbar-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsActionbarExample {
    readonly dashboards = new Array(2).fill(0).map((_, index) => `Dashboard ${index}`);
    activeDashboard = this.dashboards[0];

    createDashboard(): void {
        this.dashboards.push(`Dashboard ${this.dashboards.length + 1}`);
    }
}
