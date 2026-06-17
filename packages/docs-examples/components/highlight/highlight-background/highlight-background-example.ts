import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';

/**
 * @title Highlight with background color
 */
@Component({
    selector: 'highlight-background-example',
    imports: [KbqHighlightBackgroundPipe],
    template: `
        <div class="kbq-headline layout-margin-bottom-s" [innerHTML]="title | kbqHighlightBackground: keyword"></div>
        <div class="kbq-text-normal" [innerHTML]="text | kbqHighlightBackground: keyword"></div>
    `,
    styles: `
        :host {
            display: block;
        }

        .highlight-background-example p {
            margin: var(--kbq-size-m) 0 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightBackgroundExample {
    readonly keyword = 'cub';
    readonly title = 'Cube';
    readonly text =
        'The cube can be represented in many ways. One example is by drawing a graph, a structure in graph' +
        ' theory consisting of a set of vertices that are connected with an edge. This graph also represents the' +
        ' family of a cuboid, a polyhedron with six quadrilateral faces, which includes the cube as its special' +
        ' case. The cube and its graph are a three dimensional hypercube, a family of polytopes that also includes' +
        ' the two-dimensional square and four-dimensional tesseract.';
}
