import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link visited
 */
@Component({
    standalone: true,
    selector: 'link-visited-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a
                [useVisited]="visited"
                (click)="visited = true"
                href="/components/link/overview"
                kbq-link
                target="_blank"
            >
                Отчет от 19.05.2020
            </a>
        </div>
    `
})
export class LinkVisitedExample {
    visited = false;
}
