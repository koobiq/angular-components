import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { ToggleExamplesModule } from 'packages/docs-examples/components/toggle';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [ToggleExamplesModule],
    selector: 'dev-examples',
    template: `
        <toggle-multiline-example />
        <hr />
        <toggle-indeterminate-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqToggleModule,
        KbqButtonModule,
        KbqFormFieldModule,
        ReactiveFormsModule,
        JsonPipe,
        DevExamples,
        DevThemeToggle
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
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
