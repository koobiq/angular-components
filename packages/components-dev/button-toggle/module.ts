import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqButtonModule } from '../../components/button';
import { KbqButtonToggleModule } from '../../components/button-toggle';
import { ButtonToggleExamplesModule } from '../../docs-examples/components/button-toggle';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonToggleDemoComponent {
    modelResult: any;
    disabled: boolean;
}

@NgModule({
    declarations: [
        ButtonToggleDemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqButtonModule,
        KbqButtonToggleModule,
        KbqIconModule,
        FormsModule,
        KbqTitleModule,
        ButtonToggleExamplesModule,
        KbqFormFieldModule,
        KbqTextareaModule,
        KbqPopoverModule
    ],
    bootstrap: [
        ButtonToggleDemoComponent
    ]
})
export class DemoModule {}
