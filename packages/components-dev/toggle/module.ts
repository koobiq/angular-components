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
    selector: 'dev-toggle-examples',
    template: `
        <toggle-multiline-example />
        <hr />
        <toggle-indeterminate-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevToggleExamples {}

@Component({
    standalone: true,
    selector: 'app',
    imports: [
        FormsModule,
        KbqToggleModule,
        KbqButtonModule,
        KbqFormFieldModule,
        ReactiveFormsModule,
        JsonPipe,
        DevToggleExamples,
        DevThemeToggle
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleDev {
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
