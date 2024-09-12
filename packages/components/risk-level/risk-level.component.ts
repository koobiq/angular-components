import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

export enum KbqRiskLevelColors {
    FadeContrast = 'fade-contrast',
    FadeSuccess = 'fade-success',
    FadeWarning = 'fade-warning',
    FadeError = 'fade-error',

    Success = 'success',
    Warning = 'warning',
    Error = 'error'
}

@Component({
    selector: 'kbq-risk-level',
    template: '<ng-content />',
    styleUrls: ['risk-level.component.scss', 'risk-level-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-risk-level',
        '[class.kbq-risk-level_filled]': '!outline',
        '[class.kbq-risk-level_outline]': 'outline',
        '[class]': 'riskLevelColor'
    }
})
export class KbqRiskLevel {
    @Input() outline: boolean = false;

    @Input()
    get riskLevelColor(): string {
        return `kbq-risk-level_${this._riskLevelColor}`;
    }

    set riskLevelColor(value: string | KbqRiskLevelColors) {
        this._riskLevelColor = value || KbqRiskLevelColors.FadeContrast;
    }

    private _riskLevelColor: string | KbqRiskLevelColors = KbqRiskLevelColors.FadeContrast;
}
