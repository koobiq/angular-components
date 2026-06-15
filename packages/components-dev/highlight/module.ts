import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { HighlightExamplesModule } from 'packages/docs-examples/components/highlight';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DevThemeToggle } from '../theme-toggle';
import { DEV_OPTIONS } from './mock';

@Component({
    selector: 'dev-examples',
    imports: [HighlightExamplesModule],
    template: `
        <highlight-select-example />
        <hr />

        <highlight-background-example />
        <hr />

        <highlight-background-complex-example />
        <hr />

        <highlight-background-table-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqHighlightModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqSelectModule,
        DevThemeToggle,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    readonly options: string[] = DEV_OPTIONS;

    readonly searchCtrl = new UntypedFormControl('');
    readonly selectSearchCtrl = new UntypedFormControl('');

    readonly filteredOptions: Observable<string[]> = this.searchCtrl.valueChanges.pipe(
        startWith(''),
        map((value: string | null) => this.filter(value, this.options))
    );

    readonly filteredSelectOptions: Observable<string[]> = this.selectSearchCtrl.valueChanges.pipe(
        startWith(''),
        map((value: string | null) => this.filter(value, this.options))
    );

    private filter(value: string | null, source: string[]): string[] {
        return value ? source.filter((option) => option.toLowerCase().includes(value.toLowerCase())) : source;
    }
}
