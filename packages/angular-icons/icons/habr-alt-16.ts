import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-habr-alt-16,[kbqHabrAlt16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M13.8 1A1.2 1.2 0 0 1 15 2.2v11.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V2.2A1.2 1.2 0 0 1 2.2 1zM5.1 12.084h1.92c0-.024.011-.873.018-1.832.005-1.575.016-1.771.11-1.958.195-.406.54-.574 1.037-.52.291.032.475.165.646.454.12.218.126.241.126 2.035v1.82h1.948l-.018-2.23c-.017-1.997-.029-2.254-.117-2.5A1.99 1.99 0 0 0 9.484 6.09c-.282-.1-.447-.117-.85-.106-.613.023-.937.142-1.322.48l-.275.248-.014-3.38H5.1z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHabrAlt16 extends KbqSvgIcon {}
