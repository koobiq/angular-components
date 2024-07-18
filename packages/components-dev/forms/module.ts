/* tslint:disable:no-console no-reserved-keywords */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    value = '';
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        FormsModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqFormsModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
