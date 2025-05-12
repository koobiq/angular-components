import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

@Component({
    standalone: true,
    imports: [KbqTextareaModule, KbqFormFieldModule, FormsModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value: string;
}
