import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-badge-file-text-16,[kbqUserBadgeFileText16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M11 4.5c0 1.933-1.343 4-3 4s-3-2.067-3-4S6.343 1 8 1s3 1.567 3 3.5M8 9.7c.279 0 .546-.036.8-.1V15H2.16a.2.2 0 0 1-.195-.157l-.777-3.499a1.2 1.2 0 0 1 .554-1.289l3.282-1.97C5.702 8.96 6.725 9.7 8 9.7m7.797-.7h-5.594a.204.204 0 0 0-.203.205v6.59c0 .113.091.205.203.205h5.594a.204.204 0 0 0 .203-.205v-6.59A.204.204 0 0 0 15.797 9m-4.391 2.004a.206.206 0 0 1-.206-.205v-.394c0-.114.092-.206.206-.206h3.189c.114 0 .206.092.206.206v.394a.206.206 0 0 1-.206.205zM11.2 12.8v-.39c0-.113.092-.205.206-.205h3.189c.114 0 .206.092.206.205v.39a.206.206 0 0 1-.206.205h-3.19a.206.206 0 0 1-.205-.205m0 2v-.39c0-.113.092-.205.206-.205h1.986c.114 0 .206.092.206.205v.39a.206.206 0 0 1-.206.205h-1.986a.206.206 0 0 1-.206-.205"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserBadgeFileText16 extends KbqSvgIcon {}
