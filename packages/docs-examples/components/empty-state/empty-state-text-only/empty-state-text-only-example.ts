import { Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';


/**
 * @title empty-state-text-only
 */
@Component({
    selector: 'empty-state-text-only-example',
    templateUrl: 'empty-state-text-only-example.html',
    styleUrls: ['empty-state-text-only-example.css']
})
export class EmptyStateTextOnlyExample {
    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;
}
