import { NgComponentOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    Type,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { loadExampleComponent } from '@koobiq/docs-examples/loader';

/** A live example on a page of its own, without the site navigation. */
@Component({
    selector: 'docs-example-page',
    imports: [NgComponentOutlet],
    template: `
        <div
            class="docs-live-example__example docs-live-example__example_{{ id }}"
            [attr.aria-busy]="component() === undefined || null"
        >
            @if (component(); as component) {
                <ng-container [ngComponentOutlet]="component" />
            }
        </div>
    `,
    styleUrl: './example-page.scss',
    // What the examples get from the page wrapper in the docs, see `DocsComponentViewerComponent`.
    providers: [KbqSidepanelService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-example-page'
    },
    hostDirectives: [KbqScrollbarViewport]
})
export class DocsExamplePage {
    /**
     * Id of the example: the segment the route has found in the catalogue. Read once, as the page is only opened by
     * loading its URL, and the links inside an example lead below it or away from it.
     */
    protected readonly id = inject(ActivatedRoute).snapshot.url[0].path;

    /** Class of the example: `undefined` while it loads, `null` if it has failed to. */
    protected readonly component = signal<Type<unknown> | null | undefined>(undefined);

    constructor() {
        // Render hooks do not run on the server, which leaves the example to the browser: not every example can
        // render on the server, and hydration finds the same empty frame there.
        afterNextRender(() => {
            loadExampleComponent(this.id)
                .then((component) => {
                    if (!component) {
                        throw new Error('the loader has no such example');
                    }

                    this.component.set(component);
                })
                .catch((error) => {
                    console.error(`Could not load example '${this.id}': ${error}`);
                    this.component.set(null);
                });
        });
    }
}
