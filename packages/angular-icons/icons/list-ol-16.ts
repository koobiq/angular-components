import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-list-ol-16,[kbqListOl16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.68 1v6H1.393V2.466L0 2.89v-.996L2.553 1zM15 3c0 .11-.088.2-.197.2H5.397A.2.2 0 0 1 5.2 3v-.8c0-.11.088-.2.197-.2h9.406c.109 0 .197.09.197.2zM12.054 5.8c0 .11-.088.2-.197.2h-6.46a.2.2 0 0 1-.197-.2V5c0-.11.088-.2.197-.2h6.46c.109 0 .197.09.197.2zM5.397 11.2A.2.2 0 0 1 5.2 11v-.8c0-.11.088-.2.197-.2h9.406c.109 0 .197.09.197.2v.8c0 .11-.088.2-.197.2zM5.2 13.8c0 .11.088.2.197.2h6.46c.109 0 .197-.09.197-.2V13c0-.11-.088-.2-.197-.2h-6.46a.2.2 0 0 0-.197.2zM4.209 15v-.987H1.775l.894-1.016q.316-.316.569-.6.252-.289.43-.566.18-.277.272-.556.098-.28.098-.581 0-.532-.224-.91a1.46 1.46 0 0 0-.658-.58Q2.721 9 2.08 9q-.625 0-1.093.268A1.91 1.91 0 0 0 0 10.962h1.276q0-.28.093-.5a.8.8 0 0 1 .268-.349.7.7 0 0 1 .419-.126q.227 0 .385.098a.6.6 0 0 1 .24.28 1.05 1.05 0 0 1 .012.804q-.072.191-.235.427a6 6 0 0 1-.427.544l-1.91 2.023V15z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqListOl16 extends KbqSvgIcon {}
