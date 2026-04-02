import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqDisableLegacyValidationDirectiveProvider,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFileItem, KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { Observable } from 'rxjs';

const MAX_LINE_COUNT = 100;

function readFileAsText(file: File): Observable<string> {
    return new Observable((observer) => {
        const reader = new FileReader();

        reader.onload = () => {
            observer.next(reader.result as string);
            observer.complete();
        };

        reader.onerror = () => {
            observer.error(reader.error);
        };

        reader.readAsText(file);
    });
}

function maxLinesValidator(maxLines: number): AsyncValidatorFn {
    return (control: AbstractControl<KbqFileItem | null>): Observable<ValidationErrors | null> => {
        return new Observable((observer) => {
            if (!control.value) {
                observer.next(null);
                observer.complete();

                return;
            }

            const subscription = readFileAsText(control.value.file).subscribe({
                next: (content) => {
                    const lines = content.split('\n').length;

                    observer.next(lines > maxLines ? { maxLines: { max: maxLines, actual: lines } } : null);
                    observer.complete();
                },
                error: () => {
                    observer.next({ fileReadError: true });
                    observer.complete();
                }
            });

            return () => subscription.unsubscribe();
        });
    };
}

/**
 * @title File upload single async validation
 */
@Component({
    selector: 'file-upload-single-async-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqIconModule,
        KbqSingleFileUploadComponent
    ],
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <kbq-file-upload
                #kbqFileUpload
                class="layout-margin-bottom-s"
                formControlName="fileUpload"
                [errorStateMatcher]="errorStateMatcher"
                [progressMode]="'indeterminate'"
                [accept]="['.txt']"
            >
                @if (form.controls.fileUpload.pending) {
                    <i kbq-icon="kbq-spinner_16"></i>
                } @else if (kbqFileUpload.invalid) {
                    <i kbq-icon="kbq-triangle-exclamation_16"></i>
                } @else {
                    <i kbq-icon="kbq-file-o_16"></i>
                }

                @if (form.controls.fileUpload.hasError('maxLines')) {
                    <kbq-hint color="error">
                        File exceeds {{ form.controls.fileUpload.errors?.['maxLines'].max }} lines ({{
                            form.controls.fileUpload.errors?.['maxLines'].actual
                        }}
                        found)
                    </kbq-hint>
                }

                @if (form.controls.fileUpload.hasError('fileReadError')) {
                    <kbq-hint color="error">Failed to read file content</kbq-hint>
                }

                <kbq-hint>Only TXT files with up to {{ maxLines }} lines are allowed</kbq-hint>
            </kbq-file-upload>

            <button class="layout-margin-top-m" kbq-button type="submit" [disabled]="form.pending">Submit</button>
        </form>
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadSingleAsyncValidationExample {
    protected readonly maxLines = MAX_LINE_COUNT;
    protected readonly errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();

    protected readonly form = new FormGroup({
        fileUpload: new FormControl<KbqFileItem | null>(null, { asyncValidators: maxLinesValidator(MAX_LINE_COUNT) })
    });

    onSubmit(): void {
        console.log('perform action on submit');
    }
}
