import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-triangle-vertical-thin-24,[kbqRectangleTriangleVerticalThin24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M7.8 0A1.8 1.8 0 0 0 6 1.8v20.4A1.8 1.8 0 0 0 7.8 24h8.4a1.8 1.8 0 0 0 1.8-1.8V1.8A1.8 1.8 0 0 0 16.2 0zm3.729 7.781c.185-.375.757-.375.943 0l3.68 7.433c.158.32-.093.686-.472.686H8.32c-.379 0-.63-.366-.472-.687z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleTriangleVerticalThin24 extends KbqSvgIcon {}
