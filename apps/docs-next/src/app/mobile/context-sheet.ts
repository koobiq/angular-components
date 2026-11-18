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
                    <div class="docs-next-context__row" role="group" aria-labelledby="docs-next-context-framework">
                        @for (framework of frameworks; track framework.id) {
                            <a
                                class="docs-next-context__chip"
                                [attr.tabindex]="framework.id === activeFramework() ? 0 : -1"
                                [attr.aria-current]="framework.id === state.framework() ? 'true' : null"
                                [routerLink]="state.frameworkTarget(framework.id).url"
                                (click)="onFrameworkClick(framework.id)"
                                (focus)="focusedFramework.set(framework.id)"
                                (keydown)="onFrameworkKeydown($event)"
                            >
                                {{ framework.title }}
                            </a>
                        }
                    </div>
                </section>

                <section class="docs-next-context__group" aria-labelledby="docs-next-context-version">
                    <h2 class="docs-next-context__label" id="docs-next-context-version">{{ state.t('version') }}</h2>
                    <div
                        #versionTiles
                        class="docs-next-context__tiles"
                        role="group"
                        aria-labelledby="docs-next-context-version"
                    >
                        @for (row of versionRows(); track $index; let rowIndex = $index) {
                            <div class="docs-next-context__row">
                                @for (version of row; track version.id; let colIndex = $index) {
                                    <button
                                        class="docs-next-context__chip"
                                        type="button"
                                        [attr.aria-pressed]="version.id === state.version()"
                                        [tabindex]="flatIndex(rowIndex, colIndex) === activeIndex() ? 0 : -1"
                                        (click)="state.version.set(version.id)"
                                        (focus)="active.set(flatIndex(rowIndex, colIndex))"
                                        (keydown)="onTilesKeydown($event)"
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

    /** The tile that is the Tab stop of the group and takes the arrow keys, as an index among all the tiles. */
    protected readonly active = signal<number | null>(null);
    /** Without a tile focused yet, the group is entered at the chosen version. */
    protected readonly activeIndex = computed(() => {
        const versions = this.state.versions();
        const index = this.active() ?? versions.findIndex(({ id }) => id === this.state.version());

        return Math.min(Math.max(index, 0), versions.length - 1);
    });

    protected readonly focusedFramework = signal<DocsNextFramework | null>(null);
    /** The framework that is the Tab stop of its row: the one last focused, else the open one. */
    protected readonly activeFramework = computed(() => this.focusedFramework() ?? this.state.framework());

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
        this.active.set(null);
        this.focusedFramework.set(null);
        this.sheet().open();
        // The rows are laid out before the first frame of the sheet; the observer follows a turn of the phone.
        this.tilesWidth.set(this.versionTiles().nativeElement.getBoundingClientRect().width);
    }

    protected flatIndex(row: number, col: number): number {
        return this.versionRows()
            .slice(0, row)
            .reduce((sum, { length }) => sum + length, col);
    }

    /** Arrows move between the tiles, Home and End go to the ends of the row, with Ctrl of all the tiles; Enter and Space choose. */
    protected onTilesKeydown(event: KeyboardEvent): void {
        const rows = this.versionRows();
        const current = this.activeIndex();
        let row = 0;
        let col = current;

        while (col >= rows[row].length) col -= rows[row++].length;

        const target = ((): [number, number] | null => {
            switch (event.key) {
                case 'ArrowLeft':
                    return [row, Math.max(col - 1, 0)];
                case 'ArrowRight':
                    return [row, Math.min(col + 1, rows[row].length - 1)];
                case 'ArrowUp':
                    return row > 0 ? [row - 1, Math.min(col, rows[row - 1].length - 1)] : [row, col];
                case 'ArrowDown':
                    return row < rows.length - 1 ? [row + 1, Math.min(col, rows[row + 1].length - 1)] : [row, col];
                case 'Home':
                    return event.ctrlKey ? [0, 0] : [row, 0];
                case 'End':
                    return event.ctrlKey
                        ? [rows.length - 1, rows[rows.length - 1].length - 1]
                        : [row, rows[row].length - 1];
                default:
                    return null;
            }
        })();

        if (!target) return;

        event.preventDefault();

        const tiles = this.versionTiles().nativeElement.querySelectorAll<HTMLElement>('button');

        tiles[this.flatIndex(...target)]?.focus();
    }

    /** Left and right arrows, Home and End move the focus along the frameworks; Enter follows the link. */
    protected onFrameworkKeydown(event: KeyboardEvent): void {
        const current = event.currentTarget as HTMLElement;
        const links = Array.from(current.parentElement!.querySelectorAll<HTMLElement>('a'));
        const index = links.indexOf(current);
        const target = {
            ArrowLeft: Math.max(index - 1, 0),
            ArrowRight: Math.min(index + 1, links.length - 1),
            Home: 0,
            End: links.length - 1
        }[event.key];

        if (target === undefined) return;

        event.preventDefault();
        links[target].focus();
    }

    protected onFrameworkClick(framework: DocsNextFramework): void {
        this.state.setPendingNotice(this.state.frameworkTarget(framework).notice);
    }
}
