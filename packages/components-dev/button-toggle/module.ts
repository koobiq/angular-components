import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';
import { ButtonToggleExamplesModule } from '../../docs-examples/components/button-toggle';

@Component({
    selector: 'dev-app',
    imports: [
        ButtonToggleExamplesModule,
        KbqButtonModule,
        KbqButtonToggleModule,
        KbqIconModule,
        FormsModule,
        KbqTitleModule,
        KbqFormFieldModule,
        KbqTextareaModule,
        KbqPopoverModule
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    modelResult: any;
    disabled: boolean;
}
