import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Stylized flag
 */
@Component({
    selector: 'flag-stylized-example',
    imports: [KbqFlag, FlagSrcPipe],
    templateUrl: 'flag-stylized-example.html',
    styleUrls: ['flag-stylized-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagStylizedExample {}
