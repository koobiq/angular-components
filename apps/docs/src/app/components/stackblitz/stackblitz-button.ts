import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';
import { DocsStackblitzWriter } from './stackblitz-writer';

@Component({
    selector: 'docs-stackblitz-button',
    imports: [KbqIconModule, KbqLinkModule],
    template: `
        <span
            kbq-link
            big
            class="kbq-link_external"
            role="button"
            tabindex="0"
            (click)="openStackBlitz()"
            (keydown.enter)="openStackBlitz()"
            (keydown.space)="$event.preventDefault(); openStackBlitz()"
        >
            <span class="kbq-link__text">StackBlitz</span>
            <i kbq-icon="kbq-north-east_16"></i>
        </span>
    `,
    // The host is a layout-less wrapper: `display: contents` keeps the link itself the flex item of
    // whatever lays this component out.
    styles: `
        .docs-stackblitz-button {
            display: contents;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-stackblitz-button'
    }
})
export class DocsStackblitzButtonComponent {
    readonly exampleId = input<string>();

    private readonly stackBlitzWriter = inject(DocsStackblitzWriter);

    private readonly exampleData = computed(() => {
        const id = this.exampleId();

        return id ? new ExampleData(id) : undefined;
    });

    protected openStackBlitz(): void {
        const id = this.exampleId();
        const data = this.exampleData();

        if (!id || !data) return;

        this.stackBlitzWriter.createStackBlitzForExample(id, data).then((open) => open());
    }
}
