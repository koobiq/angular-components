import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRouter16]',
    template: `
        <svg:path
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m-.831-7.712-3.206-.641a.1.1 0 0 1-.05-.169l.857-.858-1.111-1.11a.2.2 0 0 1 0-.284l.565-.565a.2.2 0 0 1 .283 0l1.111 1.11.858-.857a.1.1 0 0 1 .17.051l.64 3.205a.1.1 0 0 1-.117.118m4.911-3.484a.1.1 0 0 1 .118.117l-.641 3.206a.1.1 0 0 1-.169.05l-.857-.857-1.112 1.111a.2.2 0 0 1-.283 0l-.565-.565a.2.2 0 0 1 0-.283l1.11-1.111-.857-.858a.1.1 0 0 1 .051-.17zm-8.278 8.275.641-3.206a.1.1 0 0 1 .169-.05l.858.857 1.11-1.111a.2.2 0 0 1 .284 0l.565.565a.2.2 0 0 1 0 .283l-1.11 1.111.857.858a.1.1 0 0 1-.051.17l-3.205.64a.1.1 0 0 1-.118-.117m5.03-3.367 3.205.641a.1.1 0 0 1 .05.169l-.857.857 1.111 1.112a.2.2 0 0 1 0 .283l-.565.565a.2.2 0 0 1-.283 0l-1.111-1.11-.858.857a.1.1 0 0 1-.17-.051l-.64-3.205a.1.1 0 0 1 .117-.118"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqRouter16 extends KbqSvgIcon {}
