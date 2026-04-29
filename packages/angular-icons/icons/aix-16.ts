import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-aix-16,[kbqAix16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.205 4.36a.2.2 0 0 1 .172.098l1.409 2.38h.057l1.415-2.38a.2.2 0 0 1 .172-.098h1.267a.2.2 0 0 1 .17.304l-2.034 3.332 2.079 3.33a.2.2 0 0 1-.17.307h-1.295a.2.2 0 0 1-.171-.097L12.843 9.15h-.057l-1.433 2.386a.2.2 0 0 1-.172.097H9.894a.2.2 0 0 1-.17-.306l2.085-3.33-2.046-3.332a.2.2 0 0 1 .17-.305zM8.812 4.36c.11 0 .2.09.2.2v6.873a.2.2 0 0 1-.2.2H7.675a.2.2 0 0 1-.2-.2V4.56c0-.11.09-.2.2-.2zM1.693 11.495a.2.2 0 0 1-.19.138H.28a.2.2 0 0 1-.19-.266l2.373-6.872a.2.2 0 0 1 .19-.135H4.35a.2.2 0 0 1 .189.135l2.369 6.873a.2.2 0 0 1-.19.265H5.498a.2.2 0 0 1-.19-.138l-.495-1.52H2.188zm.885-2.72h1.847L3.53 6.021h-.057z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAix16 extends KbqSvgIcon {}
