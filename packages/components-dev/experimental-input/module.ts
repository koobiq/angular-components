import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components-experimental/input';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';
import { maskitoTimeOptionsGenerator } from '@maskito/kit';

@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule,
        MaskitoDirective
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalInput {
    readonly formControl1 = new FormControl('test');
    readonly formControl2 = new FormControl('1.500');

    readonly options: MaskitoOptions = maskitoTimeOptionsGenerator({
        mode: 'HH:MM:SS',
        step: 1
    });

    constructor() {
        // this.formControl2.disable();
    }
}
