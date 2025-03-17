import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqPseudoCheckboxModule, ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTableModule } from '@koobiq/components/table';
import { CheckboxExamplesModule } from 'packages/docs-examples/components/checkbox';
import { KbqCheckboxModule } from '../../components/checkbox';

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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevCheckboxExamples {}

@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqPseudoCheckboxModule,
        DevCheckboxExamples,
        KbqTableModule
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxDev {
    readonly themePalette = ThemePalette;
    readonly checked: boolean[] = [true, true, false];
}
