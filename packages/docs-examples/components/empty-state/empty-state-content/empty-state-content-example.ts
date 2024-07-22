import { Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title empty-state-content
 */
@Component({
    selector: 'empty-state-content-example',
    templateUrl: 'empty-state-content-example.html',
    styleUrls: ['empty-state-content-example.css']
})
export class EmptyStateContentExample {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
