import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sparkles-24,[kbqSparkles24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M19.038.985c-.084-.288-.492-.288-.576 0L17.931 2.8a2.4 2.4 0 0 1-1.63 1.63l-1.816.531c-.288.084-.288.492 0 .576l1.816.531a2.4 2.4 0 0 1 1.63 1.63l.531 1.816c.084.288.492.288.576 0l.531-1.816a2.4 2.4 0 0 1 1.63-1.63l1.816-.531c.288-.084.288-.492 0-.576L21.2 4.431a2.4 2.4 0 0 1-1.63-1.63zM11.076 4.97c-.168-.576-.984-.576-1.152 0L8.862 8.601a4.8 4.8 0 0 1-3.26 3.26l-3.633 1.062c-.575.168-.575.984 0 1.152l3.633 1.062a4.8 4.8 0 0 1 3.26 3.26l1.062 3.633c.168.575.984.575 1.152 0l1.062-3.633a4.8 4.8 0 0 1 3.26-3.26l3.633-1.062c.575-.168.575-.984 0-1.152l-3.633-1.062a4.8 4.8 0 0 1-3.26-3.26z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSparkles24 extends KbqSvgIcon {}
