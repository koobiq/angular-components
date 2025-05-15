import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioChange, KbqRadioModule } from '@koobiq/components/radio';
import { RadioExamplesModule } from 'packages/docs-examples/components/radio';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [RadioExamplesModule],
    selector: 'dev-examples',
    template: `
        <radio-size-example />
        <hr />
        <radio-style-example />
        <hr />
        <radio-content-example />
        <hr />
        <radio-group-example />
        <hr />
        <radio-multiline-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqRadioModule,
        DevExamples,
        DevThemeToggle
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly themePalette = ThemePalette;

    favoriteFruit: string;

    isDisabled: boolean = true;

    readonly fruits = [
        'Apple',
        'Banana',
        'Tomato'
    ];

    readonly selectionList = [
        { name: 'Yes', value: 'true', selected: false },
        { name: 'No', value: 'false', selected: true }
    ];

    onChange($event: KbqRadioChange): void {
        console.log('KbqRadioChange: ', $event);
    }
}
