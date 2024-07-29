import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioChange, KbqRadioModule } from '@koobiq/components/radio';

@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html'
})
export class DemoComponent {
    themePalette = ThemePalette;

    favoriteFruit: string;

    isDisabled: boolean = true;

    fruits = [
        'Apple',
        'Banana',
        'Tomato',
        'Крякать как уточка'
    ];

    selectionList = [
        { name: 'Yes', value: 'true', selected: false },
        { name: 'No', value: 'false', selected: true }
    ];

    onChange($event: KbqRadioChange) {
        console.log('KbqRadioChange: ', $event);
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        FormsModule,
        KbqFormFieldModule,
        KbqRadioModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
