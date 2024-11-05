import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select footer
 */
@Component({
    standalone: true,
    selector: 'select-footer-example',
    templateUrl: 'select-footer-example.html',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqIconModule, KbqLinkModule]
})
export class SelectFooterExample {
    selected = '';
}
