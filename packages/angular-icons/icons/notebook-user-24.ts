import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNotebookUser24]',
    template: `
        <svg:path
            d="M4.8 1.5a.3.3 0 0 0-.3.3v1.207H1.8a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h2.7v2.26H1.8a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h2.7v2.259H1.8a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h2.7v2.26H1.8a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h2.7v2.26H1.8a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h2.7V22.2a.3.3 0 0 0 .3.3h17.4a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3zm8.67 10.923c-.617 0-1.157-.358-1.561-.892q-.116-.15-.217-.317h.004a4.03 4.03 0 0 1-.554-2c0-1.5 1.042-2.716 2.328-2.716s2.327 1.216 2.327 2.716c0 .684-.204 1.41-.553 2h.003a3 3 0 0 1-.208.307c-.406.539-.949.902-1.57.902m0 1.8c1.444 0 2.506-.902 3.118-1.772q.197-.28.36-.59l.906.507a1.8 1.8 0 0 1 .885 1.931l-.605 2.963a.3.3 0 0 1-.294.24H9.16a.3.3 0 0 1-.294-.24l-.605-2.963a1.8 1.8 0 0 1 .884-1.93l.86-.482q.157.296.346.564c.612.87 1.674 1.772 3.119 1.772"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqNotebookUser24 extends KbqSvgIcon {}
