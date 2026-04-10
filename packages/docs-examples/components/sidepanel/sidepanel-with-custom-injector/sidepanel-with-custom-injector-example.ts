import { ChangeDetectionStrategy, Component, inject, InjectionToken, Injector } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';

export const EXAMPLE_SIDEPANEL_TOKEN = new InjectionToken<{ name: string; role: string }>('SidepanelUser');

@Component({
    selector: 'example-sidepanel-with-custom-injector-content',
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">User info</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            <p>Name: {{ user.name }}</p>
            <p>Role: {{ user.role }}</p>
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button kbq-sidepanel-close>Close</button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleSidepanelWithCustomInjectorContent {
    protected readonly user = inject(EXAMPLE_SIDEPANEL_TOKEN);
}

/**
 * @title Sidepanel with custom injector
 */
@Component({
    selector: 'sidepanel-with-custom-injector-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">
            <span>Open</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelWithCustomInjectorExample {
    private readonly injector = inject(Injector);
    private readonly sidepanelService = inject(KbqSidepanelService);

    open() {
        this.sidepanelService.open(ExampleSidepanelWithCustomInjectorContent, {
            injector: Injector.create({
                parent: this.injector,
                providers: [
                    {
                        provide: EXAMPLE_SIDEPANEL_TOKEN,
                        useValue: { name: 'John Doe', role: 'Administrator' }
                    }
                ]
            })
        });
    }
}
