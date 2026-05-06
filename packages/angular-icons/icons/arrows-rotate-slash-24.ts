import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsRotateSlash24]',
    template: `
        <svg:g>
            <svg:path
                d="m20.716 22.411-2.187-2.187-1.713-1.71L5.487 7.182l-1.712-1.71-2.186-2.189a.303.303 0 0 1 0-.429L2.86 1.583a.303.303 0 0 1 .429 0l2.188 2.188A10.46 10.46 0 0 1 12 1.5c2.901 0 5.528 1.177 7.428 3.079l1.022-1.022.413-.414a.3.3 0 0 1 .504.145l1.362 5.9a.3.3 0 0 1-.36.36l-5.9-1.362a.3.3 0 0 1-.144-.505l1.406-1.405A8.07 8.07 0 0 0 12 3.9a8.06 8.06 0 0 0-4.81 1.583L18.516 16.81a8.06 8.06 0 0 0 1.562-4.226.153.153 0 0 1 .186-.14l1.938.448c.146.034.245.17.228.32a10.45 10.45 0 0 1-2.202 5.31l2.188 2.187a.303.303 0 0 1 0 .43l-1.272 1.271a.303.303 0 0 1-.43 0M2.76 7.008a10.4 10.4 0 0 0-1.19 3.78.294.294 0 0 0 .227.319l1.938.447a.153.153 0 0 0 .186-.139 8 8 0 0 1 .634-2.612zM15.197 19.445A8.1 8.1 0 0 1 12 20.1c-2.24 0-4.268-.91-5.735-2.38l1.41-1.41a.3.3 0 0 0-.144-.504l-5.9-1.362a.3.3 0 0 0-.359.36l1.361 5.9a.3.3 0 0 0 .505.144l.413-.414 1.017-1.017A10.47 10.47 0 0 0 12 22.5c1.807 0 3.507-.456 4.992-1.26z"
            />
        </svg:g>
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
export class KbqArrowsRotateSlash24 extends KbqSvgIcon {}
