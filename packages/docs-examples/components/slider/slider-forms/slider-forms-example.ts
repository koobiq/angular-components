import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider with Angular forms */
@Component({
    selector: 'slider-forms-example',
    imports: [KbqSlider, KbqFormFieldModule, KbqButtonModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="settings" (ngSubmit)="save()">
            <kbq-form-field>
                <kbq-label>{{ t().retention }}</kbq-label>
                <kbq-slider showTooltip formControlName="retention" [min]="1" [max]="90" />
            </kbq-form-field>
            <kbq-form-field>
                <kbq-label>{{ t().window }}</kbq-label>
                <kbq-slider showTooltip formControlName="analysisWindow" [min]="1" [max]="90" />
                <kbq-hint>{{ t().hint }}</kbq-hint>
                <kbq-error>{{ t().error }}</kbq-error>
            </kbq-form-field>
            <button color="contrast" kbq-button type="submit">{{ t().save }}</button>
            @if (saved(); as settings) {
                <output>{{ t().saved }} {{ settings[0] }} / {{ settings[1] }}</output>
            }
        </form>
    `,
    styles: `
        form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            justify-content: center;
            min-height: 96px;
            font-variant-numeric: tabular-nums;
        }
        button {
            align-self: start;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderFormsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    private readonly retention = new FormControl(30, { nonNullable: true });
    private readonly analysisWindow = new FormControl(14, {
        nonNullable: true,
        validators: (control) => (control.value > this.retention.value ? { retention: true } : null)
    });
    protected readonly settings = new FormGroup({ retention: this.retention, analysisWindow: this.analysisWindow });
    protected readonly saved = signal<readonly [number, number] | null>(null);

    constructor() {
        this.retention.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.analysisWindow.updateValueAndValidity());
    }

    protected save(): void {
        this.settings.markAllAsTouched();
        if (this.settings.valid) this.saved.set([this.retention.value, this.analysisWindow.value]);
    }
}
