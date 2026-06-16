import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLink } from '@koobiq/components/link';

type SearchResult = {
    title: string;
    url: string;
    snippet: string;
};

/**
 * @title Highlight in complex content
 */
@Component({
    selector: 'highlight-background-complex-example',
    imports: [
        KbqInputModule,
        KbqIcon,
        KbqButtonModule,
        ReactiveFormsModule,
        KbqHighlightBackgroundPipe,
        KbqLink
    ],
    template: `
        <div style="margin-bottom: var(--kbq-size-xl)">
            <kbq-fieldset>
                <kbq-form-field kbqFieldsetItem>
                    <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
                    <input kbqInput placeholder="Search" [formControl]="control" />
                </kbq-form-field>
                <button kbqFieldsetItem kbq-button [color]="colors.Contrast" (click)="applySearch()">Search</button>
            </kbq-fieldset>
        </div>

        @for (result of results; track result.url) {
            <article style="margin-bottom: var(--kbq-size-l)">
                <a href="{{ result.url }}" class="highlight-example__title" target="_blank" kbq-link>
                    <span class="kbq-link__text" [innerHTML]="result.title | kbqHighlightBackground: query()"></span>
                </a>
                <div class="highlight-example__header">{{ result.url }}</div>
                <p style="margin: 0" [innerHTML]="result.snippet | kbqHighlightBackground: query()"></p>
            </article>
        }
    `,
    styles: `
        :host {
            display: block;
        }

        .highlight-example__title {
            font-family: var(--kbq-typography-headline-font-family),serif;
            font-size: var(--kbq-typography-headline-font-size);
            line-height: var(--kbq-typography-headline-line-height);
            font-weight: var(--kbq-typography-headline-font-weight);
            letter-spacing: var(--kbq-typography-headline-letter-spacing);
        }

        .highlight-example__header {
            margin: var(--kbq-size-xxs) 0;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightBackgroundComplexExample {
    protected readonly colors = KbqComponentColors;
    protected readonly control = new FormControl('cube');
    protected readonly query = signal(this.control.value);
    protected readonly results: SearchResult[] = [
        {
            title: 'Cube',
            url: 'https://en.wikipedia.org/wiki/Cube',
            snippet:
                'A cube is a three-dimensional solid object in geometry. A cube has eight vertices and twelve straight' +
                ' edges of the same length, so that these edges form six faces.'
        },
        {
            title: 'Cube (1997 film)',
            url: 'https://en.wikipedia.org/wiki/Cube_(1997_film)',
            snippet:
                'Cube is a 1997 Canadian science fiction horror film directed and co-written by Vincenzo Natali.' +
                " A product of the Canadian Film Centre's First Feature Project."
        },
        {
            title: 'Cube (algebra)',
            url: 'https://en.wikipedia.org/wiki/Cube_(algebra)',
            snippet:
                'In arithmetic and algebra, the cube of a number n is its third power, that is, the result of' +
                ' multiplying three instances of n together.'
        },
        {
            title: 'Cube (2021 film)',
            url: 'https://en.wikipedia.org/wiki/Cube_(2021_film)',
            snippet:
                'The story centers on a group of strangers who awaken in a cube-shaped room connected to adjacent' +
                ' rooms, forming an elaborate maze filled with traps.'
        }
    ];

    protected applySearch(): void {
        this.query.set(this.control.value);
    }
}
