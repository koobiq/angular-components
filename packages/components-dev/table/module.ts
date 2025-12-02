import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';

@Component({
    selector: 'dev-app',
    imports: [KbqTableModule, KbqButtonModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    protected readonly colors = KbqComponentColors;
}
