import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUserMultiple24]',
    template: `
        <svg:path
            d="M11.826 4.653c1.84.853 3.04 2.803 3.232 4.882 1.749-.048 3.156-2.237 3.156-4.285 0-2.071-1.439-3.75-3.214-3.75-1.6 0-2.928 1.366-3.174 3.153m7.64 12.597h1.308a.3.3 0 0 0 .288-.218l1.047-3.663a1.8 1.8 0 0 0-.851-2.065l-2.892-1.62c-.79.899-1.935 1.652-3.366 1.652h-.02c-.1.57-.266 1.129-.49 1.656l3.324 1.993a3.6 3.6 0 0 1 1.652 2.265m-6.18-7.125c0 2.278-1.583 4.714-3.536 4.714s-3.536-2.436-3.536-4.714S7.797 6 9.75 6s3.536 1.847 3.536 4.125M9.75 16.639c1.68 0 2.996-.985 3.84-2.088l3.298 1.978a1.8 1.8 0 0 1 .83 1.934l-.844 3.802a.3.3 0 0 1-.293.235H2.919a.3.3 0 0 1-.293-.235l-.844-3.802a1.8 1.8 0 0 1 .83-1.934L5.91 14.55c.844 1.103 2.161 2.088 3.84 2.088"
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
export class KbqUserMultiple24 extends KbqSvgIcon {}
