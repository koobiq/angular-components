import { Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title empty-state-align
 */
@Component({
    selector: 'empty-state-align-example',
    templateUrl: 'empty-state-align-example.html',
    styleUrls: ['empty-state-align-example.css']
})
export class EmptyStateAlignExample {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
