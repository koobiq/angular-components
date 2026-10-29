import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    DOCS_NEXT_FRAMEWORKS,
    DOCS_NEXT_VERSION_TILE,
    DocsNextFramework,
    docsNextVersionRows,
    docsNextVersionShortTitle
} from '../data/site';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextSheet } from './sheet';

/**
 * Framework and version of the site on a phone (Figma: Version, Framework, 73:36420), opened from the header. The
 * version, changed more often, sits lower, closer to the thumb. A choice applies at once and the sheet stays open, so
 * both can be changed in one go.
 */
@Component({
    selector: 'docs-next-context-sheet',
    imports: [RouterLink, DocsNextSheet],
    template: `
        <docs-next-sheet [label]="state.t('versionAndFramework')">
            <div class="docs-next-context__body">
                <section class="docs-next-context__group" aria-labelledby="docs-next-context-framework">
                    <h2 class="docs-next-context__label" id="docs-next-context-framework">
                        {{ state.t('frameworkOrLibrary') }}
                    </h2>
                    <div class="docs-next-context__row">
                        @for (framework of frameworks; track framework.id) {
                            <a
                                class="docs-next-context__chip"
                                [attr.aria-current]="framework.id === state.framework() ? 'true' : null"
                                [routerLink]="state.frameworkTarget(framework.id).url"
                                (click)="onFrameworkClick(framework.id)"
                            >
                                {{ framework.title }}
                            </a>
                        }
                    </div>
                </section>

                <section class="docs-next-context__group" aria-labelledby="docs-next-context-version">
                    <h2 class="docs-next-context__label" id="docs-next-context-version">{{ state.t('version') }}</h2>
                    <div #versionTiles class="docs-next-context__tiles">
                        @for (row of versionRows(); track $index) {
                            <div class="docs-next-context__row">
                                @for (version of row; track version.id) {
                                    <button
                                        class="docs-next-context__chip"
                                        type="button"
                                        [attr.aria-pressed]="version.id === state.version()"
                                        (click)="state.version.set(version.id)"
                                    >
                                        {{ shortTitle(version.id) }}
                                    </button>
                                }
                            </div>
                        }
                    </div>
                </section>
            </div>

            <div class="docs-next-context__footer">
                <button class="docs-next-context__close" type="button" (click)="sheet().close()">
                    {{ state.t('close') }}
                </button>
            </div>
        </docs-next-sheet>
    `,
    styleUrl: './context-sheet.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextContextSheet {
    protected readonly state = inject(DocsNextSiteState);

    protected readonly frameworks = DOCS_NEXT_FRAMEWORKS;
    protected readonly shortTitle = docsNextVersionShortTitle;

    protected readonly sheet = viewChild.required(DocsNextSheet);
    private readonly versionTiles = viewChild.required<ElementRef<HTMLElement>>('versionTiles');

    /** Width of the version tiles, known once the sheet is shown. */
    private readonly tilesWidth = signal(0);

    protected readonly versionRows = computed(() => {
        const versions = this.state.versions();
        const { minWidth, gap } = DOCS_NEXT_VERSION_TILE;
        const perRow = Math.floor((this.tilesWidth() + gap) / (minWidth + gap));
        let start = 0;

        return docsNextVersionRows(versions.length, perRow).map((length) => versions.slice(start, (start += length)));
    });

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const observer = new ResizeObserver(([entry]) => this.tilesWidth.set(entry.contentRect.width));

            observer.observe(this.versionTiles().nativeElement);
            destroyRef.onDestroy(() => observer.disconnect());
        });
    }

    open(): void {
        this.sheet().open();
        // The rows are laid out before the first frame of the sheet; the observer follows a turn of the phone.
        this.tilesWidth.set(this.versionTiles().nativeElement.getBoundingClientRect().width);
    }

    protected onFrameworkClick(framework: DocsNextFramework): void {
        this.state.setPendingNotice(this.state.frameworkTarget(framework).notice);
    }
}
