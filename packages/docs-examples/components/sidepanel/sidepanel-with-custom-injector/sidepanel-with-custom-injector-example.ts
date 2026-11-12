import { ChangeDetectionStrategy, Component, inject, InjectionToken, Injector } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

export const EXAMPLE_SIDEPANEL_TOKEN = new InjectionToken<{ name: string; role: string }>('SidepanelUser');

@Component({
    selector: 'example-sidepanel-with-custom-injector-content',
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">{{ text().userInfo }}</kbq-sidepanel-header>
        <kbq-sidepanel-body>
            <p>{{ text().name }} {{ user.name }}</p>
            <p>{{ text().role }} {{ user.role }}</p>
        </kbq-sidepanel-body>
        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button kbq-sidepanel-close>{{ text().close }}</button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleSidepanelWithCustomInjectorContent extends BaseLocalizedExample<ExampleText> {
    protected readonly user = inject(EXAMPLE_SIDEPANEL_TOKEN);

    constructor() {
        super(TEXT);
    }
}

/**
 * @title Sidepanel with custom injector
 */
@Component({
    selector: 'sidepanel-with-custom-injector-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">
            <span>{{ text().open }}</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelWithCustomInjectorExample extends BaseLocalizedExample<ExampleText> {
    private readonly injector = inject(Injector);
    private readonly sidepanelService = inject(KbqSidepanelService);

    open() {
        this.sidepanelService.open(ExampleSidepanelWithCustomInjectorContent, {
            injector: Injector.create({
                parent: this.injector,
                providers: [
                    {
                        provide: EXAMPLE_SIDEPANEL_TOKEN,
                        useValue: { name: 'John Doe', role: this.text().administrator }
                    }
                ]
            })
        });
    }

    constructor() {
        super(TEXT);
    }
}
