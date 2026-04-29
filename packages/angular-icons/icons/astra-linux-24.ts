import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-astra-linux-24,[kbqAstraLinux24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m8.137 16.783 2.404 1.069-2.785 1.523zm4.275.478L8.25 11.25l7.503 4.502.53 3.606-3.407-1.846zm3.274-3.138L13.5 9.75l4.083 2.333-1.456 1.567zm4.801-5.016-.138-.023-4.972-.845a743 743 0 0 1-2.373-4.97l-.094-.198-.227-.48-.243-.524-.154-.33a.3.3 0 0 0-.542-.003l-.158.328-.48 1-.096.2L8.623 8.24l-4.999.85-.124.02-1.002.17-.45.077a.3.3 0 0 0-.169.5l.311.334.693.744.086.092 3.624 3.888-.816 5.544-.026.178-.156 1.064-.058.393a.3.3 0 0 0 .44.307l.35-.19.943-.517.158-.086 4.59-2.512 4.593 2.487.155.084.943.51.352.191a.3.3 0 0 0 .44-.307l-.059-.397-.156-1.06-.025-.175-.817-5.55c.696-.747 2.609-2.808 3.57-3.855l.087-.094c.266-.29.444-.485.476-.526l.223-.23.304-.315a.3.3 0 0 0-.165-.504l-.432-.073z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAstraLinux24 extends KbqSvgIcon {}
