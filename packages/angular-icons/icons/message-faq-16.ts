import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-message-faq-16,[kbqMessageFaq16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M12.17 8.016h-.784l.558.737a1.2 1.2 0 0 1-.238.023c-.671 0-1.108-.5-1.108-1.425s.436-1.426 1.108-1.426c.669 0 1.108.501 1.108 1.426 0 .475-.118.84-.32 1.08zM6.646 7.817h1.108l-.537-1.65h-.034z"
                />
                <path
                    d="M1 4.4A2.4 2.4 0 0 1 3.4 2h9.2A2.4 2.4 0 0 1 15 4.4v6.2a2.4 2.4 0 0 1-2.4 2.4H7.747l-3.422 2.738A.2.2 0 0 1 4 15.58V13h-.6A2.4 2.4 0 0 1 1 10.6zm12.554 5.328-.495-.621c.426-.382.69-.978.69-1.756 0-1.428-.886-2.242-2.043-2.242-1.164 0-2.044.814-2.044 2.242 0 1.421.88 2.241 2.044 2.241.272 0 .53-.044.765-.134l.291.359a.2.2 0 0 0 .155.074h.559a.1.1 0 0 0 .078-.163m-7.611-.195a.2.2 0 0 0 .19-.138l.279-.857h1.574l.28.857a.2.2 0 0 0 .19.138h.703a.1.1 0 0 0 .094-.133L7.841 5.304a.2.2 0 0 0-.189-.135h-.904a.2.2 0 0 0-.189.135L5.145 9.4a.1.1 0 0 0 .095.133zM2.45 5.169a.2.2 0 0 0-.2.2v3.964c0 .11.09.2.2.2h.523a.2.2 0 0 0 .2-.2V7.73h1.574a.2.2 0 0 0 .2-.2v-.36a.2.2 0 0 0-.2-.2H3.174V5.93H4.94a.2.2 0 0 0 .2-.2v-.361a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMessageFaq16 extends KbqSvgIcon {}
