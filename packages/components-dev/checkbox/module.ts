import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { KbqPseudoCheckboxModule, ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqCheckboxModule } from '../../components/checkbox';

@Component({
    selector: 'app',
    styleUrls: ['../main.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent {
    themePalette = ThemePalette;

    checked: boolean[] = [true, true, false];
    indeterminate: boolean = true;
    disabled: boolean = false;
    labelPosition = 'after';

    onCheckboxChange(val) {
        console.log('onCheckboxChange', val);
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        FormsModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqPseudoCheckboxModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
