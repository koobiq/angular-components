import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'dev-app',
    imports: [KbqAccordionModule, KbqIconModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
