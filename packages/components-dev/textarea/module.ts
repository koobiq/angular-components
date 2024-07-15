import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqFormFieldModule } from '../../components/form-field';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['../main.scss', './styles.scss'],
})
export class DemoComponent {
    value: string;
}

@NgModule({
    declarations: [
        DemoComponent,
    ],
    imports: [
        BrowserModule,
        KbqTextareaModule,
        KbqFormFieldModule,
        FormsModule,
    ],
    bootstrap: [
        DemoComponent,
    ],
})
export class DemoModule {}
