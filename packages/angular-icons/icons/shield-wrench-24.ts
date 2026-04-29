import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-wrench-24,[kbqShieldWrench24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3.3 1.5c-.994 0-1.8.807-1.8 1.803v14.075a.3.3 0 0 0 .172.272l10.2 6.321a.3.3 0 0 0 .256 0l10.2-6.321a.3.3 0 0 0 .172-.272V3.303c0-.996-.806-1.803-1.8-1.803zm12.402 4.702-1.9 1.898a.3.3 0 0 0-.083.271l.216 1.08a.3.3 0 0 0 .236.236l1.084.217a.3.3 0 0 0 .27-.082l1.904-1.9a.15.15 0 0 1 .254.086l.296 2.065a.3.3 0 0 1-.085.255l-1.79 1.785a.3.3 0 0 1-.278.08l-2.567-.59-4.071 5.345c-.651.855-1.908.94-2.668.181a1.77 1.77 0 0 1 .18-2.662l5.331-4.043-.606-2.622a.3.3 0 0 1 .08-.28l1.789-1.785a.3.3 0 0 1 .254-.085l2.07.295a.15.15 0 0 1 .084.255"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldWrench24 extends KbqSvgIcon {}
