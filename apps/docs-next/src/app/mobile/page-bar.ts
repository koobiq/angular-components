import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocsNextPageActions } from '../ui/page-actions';

/**
 * Row over an article on a phone: "Copy" with its menu and the link to the source (Figma: Article, 66:32982). It
 * scrolls away with the page; only the header sticks.
 */
@Component({
    selector: 'docs-next-page-bar',
    imports: [DocsNextPageActions],
    template: `
        <docs-next-page-actions [githubUrl]="githubUrl()" [source]="source()" />
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l) var(--kbq-size-l) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextPageBar {
    /** Element whose text "Copy" copies. */
    readonly source = input.required<HTMLElement>();
    readonly githubUrl = input<string>();
}
