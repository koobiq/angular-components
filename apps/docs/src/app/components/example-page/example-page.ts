import { NgComponentOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
    Type,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { EXAMPLE_COMPONENTS, loadExample } from '@koobiq/docs-examples';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs';

const loadExampleComponent = async (id: string): Promise<Type<unknown> | null> => {
    const { componentName } = EXAMPLE_COMPONENTS[id];

    try {
        const component = (await loadExample(id))?.[componentName];

        if (typeof component !== 'function') {
            throw new Error(`the module does not export '${componentName}'`);
        }

        return component;
    } catch (error) {
        console.error(`Could not load example '${id}': ${error}`);

        return null;
    }
};

/** A live example on a page of its own, without the site navigation. */
@Component({
    selector: 'docs-example-page',
    imports: [NgComponentOutlet],
    template: `
        <div
            class="docs-live-example__example docs-live-example__example_{{ id() }}"
            [attr.aria-busy]="isLoading() || null"
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
    private readonly destroyRef = inject(DestroyRef);

    private readonly id$ = inject(ActivatedRoute).paramMap.pipe(
        map((params) => params.get('id')!),
        distinctUntilChanged()
    );

    /** Id of the example, one that the route has found in `EXAMPLE_COMPONENTS`. */
    protected readonly id = toSignal(this.id$, { requireSync: true });

    /** Class of the example, once it has loaded. */
    protected readonly component = signal<Type<unknown> | null>(null);

    protected readonly isLoading = signal(true);

    constructor() {
        // Render hooks do not run on the server, which leaves the example to the browser: not every example can
        // render on the server, and hydration finds the same empty frame there.
        afterNextRender(() => {
            this.id$
                .pipe(
                    tap(() => {
                        this.component.set(null);
                        this.isLoading.set(true);
                    }),
                    switchMap(loadExampleComponent),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((component) => {
                    this.component.set(component);
                    this.isLoading.set(false);
                });
        });
    }
}
