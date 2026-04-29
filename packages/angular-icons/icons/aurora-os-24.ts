import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-aurora-os-24,[kbqAuroraOs24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                fill-rule="evenodd"
                d="m12.13 23.778 3.283-5.63a.3.3 0 0 1 .26-.148h6.566l.078-.02a.15.15 0 0 0 .051-.206l-1.531-2.625a.3.3 0 0 0-.26-.149h-2.224l1.11-1.903a.3.3 0 0 0 0-.303l-1.597-2.738a.15.15 0 0 0-.26 0L14.723 15H12.64l3.967-6.8a.3.3 0 0 0 0-.302L15.01 5.159a.15.15 0 0 0-.26 0L9.01 15H6.926L13.75 3.304a.3.3 0 0 0 0-.303L12.13.222a.15.15 0 0 0-.26 0L1.632 17.774l-.014.03a.15.15 0 0 0 .066.175L1.76 18h6.567a.3.3 0 0 1 .259.149l3.283 5.629.057.056a.15.15 0 0 0 .147 0zM1.617 17.804l.001-.004z"
                clip-rule="evenodd"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAuroraOs24 extends KbqSvgIcon {}
