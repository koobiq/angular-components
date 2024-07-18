import { Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title empty-state-actions
 */
@Component({
    selector: 'empty-state-actions-example',
    templateUrl: 'empty-state-actions-example.html',
    styleUrls: ['empty-state-actions-example.css']
})
export class EmptyStateActionsExample {
    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;
}
