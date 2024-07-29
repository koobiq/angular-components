import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqButtonModule } from '../../components/button/';
import { KbqToggleModule } from '../../components/toggle/';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    themePalette = ThemePalette;

    valueSmallOff: boolean = false;
    valueSmallOn: boolean = true;

    valueBigOff: boolean = false;
    valueBigOn: boolean = true;

    disabled: boolean = false;

    toggleControl = new UntypedFormControl(true);

    constructor() {
        this.toggleControl.valueChanges.subscribe(console.log);
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        KbqToggleModule,
        KbqButtonModule,
        KbqFormFieldModule,
        ReactiveFormsModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
