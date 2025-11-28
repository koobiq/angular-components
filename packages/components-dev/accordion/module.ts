import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'dev-app',
    imports: [KbqAccordionModule, KbqIconModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
