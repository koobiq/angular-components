import { Component, ViewEncapsulation } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Typography
 */
@Component({
    standalone: true,
    selector: 'typography-overview-example',
    templateUrl: 'typography-overview-example.html',
    styleUrls: ['typography-overview-example.css'],
    imports: [KbqTableModule],
    encapsulation: ViewEncapsulation.None
})
export class TypographyOverviewExample {}
