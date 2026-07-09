import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';
import { DocsStackblitzWriter } from './stackblitz-writer';

@Component({
    selector: 'docs-stackblitz-button',
    imports: [KbqIconModule, KbqLinkModule],
    template: `
        <span class="kbq-link__text">StackBlitz</span>
        <i kbq-icon="kbq-north-east_16"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-stackblitz-button kbq-link_external',
        '(click)': 'openStackBlitz()',
        '(keydown.enter)': 'openStackBlitz()'
    }
})
export class DocsStackblitzButtonComponent extends KbqLink {
    private stackBlitzWriter = inject(DocsStackblitzWriter);

    readonly exampleId = input<string>();

    private readonly exampleData = computed(() => {
        const id = this.exampleId();

        return id ? new ExampleData(id) : undefined;
    });

    get hasIcon() {
        return true;
    }

    protected openStackBlitz(): void {
        const id = this.exampleId();
        const data = this.exampleData();

        if (!id || !data) return;

        this.stackBlitzWriter.createStackBlitzForExample(id, data).then((open) => open());
    }
}
