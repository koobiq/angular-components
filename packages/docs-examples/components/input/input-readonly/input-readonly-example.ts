import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Input readonly
 */
@Component({
    selector: 'input-readonly-example',
    imports: [
        KbqInputModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="readonly">{{ text().readonly }}</kbq-toggle>

        <kbq-form-field class="layout-margin-bottom-m">
            <kbq-label>{{ text().text }}</kbq-label>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput [placeholder]="text().placeholder" [readonly]="readonly()" [(ngModel)]="textValue" />
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field class="layout-margin-bottom-m">
            <kbq-label>{{ text().number }}</kbq-label>
            <input kbqNumberInput [placeholder]="text().placeholder" [readonly]="readonly()" [(ngModel)]="number" />
            <kbq-stepper />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ text().password }}</kbq-label>
            <input kbqInputPassword [readonly]="readonly()" [(ngModel)]="password" />
            <kbq-password-toggle [kbqTooltipHidden]="text().showPassword" [kbqTooltipNotHidden]="text().hidePassword" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class InputReadonlyExample {
    protected readonly text = injectExampleText();

    protected readonly readonly = model(true);
    protected readonly textValue = model('Text');
    protected readonly number = model<number | null>(42);
    protected readonly password = model('Pa$$w0rd');
}
