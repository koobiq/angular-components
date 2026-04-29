import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-user-16,[kbqShieldUser16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 1.5h11.6c.386 0 .7.314.7.702v9.214l-6.52 4.03-6.48-4.029V2.202c0-.388.314-.702.7-.702Zm7.598 5.715q-.09.172-.198.326c-.344.49-.902.94-1.62.94s-1.276-.45-1.62-.94a3 3 0 0 1-.19-.312l-.24-.452-.447.25-.463.261a1.7 1.7 0 0 0-.835 1.825l.375 1.841a.7.7 0 0 0 .686.56h5.506a.7.7 0 0 0 .686-.56l.375-1.84a1.7 1.7 0 0 0-.835-1.826l-.494-.277-.448-.251zM7.979 3.504C6.816 3.504 6 4.579 6 5.734c0 .258.038.52.106.775h-.141l.457.758q.077.127.167.244c.315.416.79.767 1.391.767.608 0 1.088-.357 1.403-.779H9.38q.085-.112.158-.232l.457-.758h-.142c.07-.254.107-.517.107-.775 0-1.155-.817-2.23-1.982-2.23Z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldUser16 extends KbqSvgIcon {}
