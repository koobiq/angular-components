import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUserMask24]',
    template: `
        <svg:path
            d="M16.836 2.936A8.9 8.9 0 0 0 12 1.5a8.91 8.91 0 0 0-6.364 2.686A9.26 9.26 0 0 0 3 10.671a9.24 9.24 0 0 0 2.105 5.895c-1.254.846-2.033 1.926-2.1 3.108-.003.1.061.188.156.216l8.754 2.598a.3.3 0 0 0 .17 0l8.753-2.598a.22.22 0 0 0 .157-.216c-.068-1.18-.846-2.26-2.101-3.107a9.26 9.26 0 0 0 2.029-4.698 9.33 9.33 0 0 0-.766-5.073 9.1 9.1 0 0 0-3.321-3.86M6.838 8.65c0-1.36 2.4-.421 3.483.374.377.277.663.582.663.872 0 .786-1.156.781-2.207.777h-.23c-1.105 0-1.71-1.18-1.71-2.023m6.934.31c1.092-.73 3.417-1.64 3.417-.31 0 .844-.556 2.022-1.661 2.022h-.23c-1.064.005-2.314.01-2.314-.776 0-.312.348-.644.787-.937m-.646 5.558A8 8 0 0 0 12 14.418c-.41 0-.795.053-1.126.099-.66.091-1.105.153-1.105-.302 0-.681.999-1.568 2.231-1.568s2.23.887 2.23 1.568c0 .455-.443.393-1.104.302"
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
export class KbqUserMask24 extends KbqSvgIcon {}
