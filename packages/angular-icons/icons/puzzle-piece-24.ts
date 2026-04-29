import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-puzzle-piece-24,[kbqPuzzlePiece24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M9.229 4.5c.46 0 .76-.51.656-.959a2.7 2.7 0 0 1-.072-.603 2.188 2.188 0 0 1 4.374 0c0 .193-.025.397-.072.603-.103.45.196.959.656.959H19.2a.3.3 0 0 1 .3.3v4.429c0 .46.51.76.959.656.206-.047.41-.072.604-.072a2.188 2.188 0 0 1 0 4.374c-.194 0-.398-.025-.604-.072-.45-.103-.959.196-.959.656V19.2a.3.3 0 0 1-.3.3h-4.429c-.46 0-.76-.51-.656-.959.047-.206.072-.41.072-.604a2.188 2.188 0 0 0-4.374 0c0 .194.025.398.072.604.103.45-.196.959-.656.959H4.8a.3.3 0 0 1-.3-.3v-4.429c0-.46.51-.76.959-.656q.311.071.604.072a2.188 2.188 0 0 0 0-4.374q-.293 0-.604.072c-.45.103-.959-.196-.959-.656V4.8a.3.3 0 0 1 .3-.3h4.429"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPuzzlePiece24 extends KbqSvgIcon {}
