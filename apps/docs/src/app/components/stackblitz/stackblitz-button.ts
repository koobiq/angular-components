import { ChangeDetectionStrategy, Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';
import { ExampleData } from '@koobiq/docs-examples';
import { DocsStackblitzWriter } from './stackblitz-writer';

@Component({
    selector: 'docs-stackblitz-button',
    imports: [KbqLink],
    template: `
        <span
            kbqLink
            size="big"
            external
            role="button"
            tabindex="0"
            [disabled]="isOpening()"
            (pointerenter)="prefetch()"
            (focus)="prefetch()"
            (click)="openStackBlitz($event)"
            (keydown.enter)="openStackBlitz($event)"
            (keydown.space)="$event.preventDefault(); openStackBlitz($event)"
        >
            StackBlitz
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

    /**
     * The project of the example, ready to open within the click: Firefox blocks a StackBlitz tab opened after
     * the files are loaded as a pop-up.
     */
    private prepared?: { exampleId: string; open: () => void };

    /** Whether a click waits for the files of the example; the clicks that follow it are ignored. */
    protected readonly isOpening = signal(false);

    /** Loads the files of the example before the click. */
    protected prefetch(): void {
        // A failed build is evicted from the writer's cache, so the click loads the files again.
        this.prepare()?.catch(() => undefined);
    }

    protected openStackBlitz(event: Event): void {
        // The second click of a double click and a held key would open the project once more each.
        if (this.isOpening() || (event as MouseEvent).detail > 1 || (event as KeyboardEvent).repeat) return;

        const prepared = this.prepared;

        if (prepared && prepared.exampleId === this.exampleId()) {
            prepared.open();

            return;
        }

        const preparing = this.prepare();

        if (!preparing) return;

        this.isOpening.set(true);
        preparing.then((open) => open()).finally(() => this.isOpening.set(false));
    }

    private prepare(): Promise<() => void> | undefined {
        const id = this.exampleId();
        const data = this.exampleData();

        if (!id || !data?.isKnown) return;

        return this.stackBlitzWriter.createStackBlitzForExample(id, data).then((open) => {
            this.prepared = { exampleId: id, open };

            return open;
        });
    }
}
