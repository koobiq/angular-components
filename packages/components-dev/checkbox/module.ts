import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqPseudoCheckboxModule, ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTableModule } from '@koobiq/components/table';
import { CheckboxExamplesModule } from 'packages/docs-examples/components/checkbox';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    selector: 'dev-checkbox-examples',
    imports: [CheckboxExamplesModule],
    template: `
        <checkbox-indeterminate-example />
        <hr />
        <checkbox-overview-example />
        <hr />
        <pseudo-checkbox-example />
        <hr />
        <checkbox-multiline-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqPseudoCheckboxModule,
        DevExamples,
        KbqTableModule,
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
    readonly checked: boolean[] = [true, true, false];
}
