import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleModule } from '@koobiq/components/toggle';

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
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="readonly">Readonly</kbq-toggle>

        <kbq-form-field class="layout-margin-bottom-m">
            <kbq-label>Text</kbq-label>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput placeholder="Placeholder" [readonly]="readonly()" [(ngModel)]="text" />
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field class="layout-margin-bottom-m">
            <kbq-label>Number</kbq-label>
            <input kbqNumberInput placeholder="Placeholder" [readonly]="readonly()" [(ngModel)]="number" />
            <kbq-stepper />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Password</kbq-label>
            <input kbqInputPassword [readonly]="readonly()" [(ngModel)]="password" />
            <kbq-password-toggle [kbqTooltipHidden]="'Show password'" [kbqTooltipNotHidden]="'Hide password'" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class InputReadonlyExample {
    protected readonly readonly = model(true);
    protected readonly text = model('Text');
    protected readonly number = model<number | null>(42);
    protected readonly password = model('Pa$$w0rd');
}
