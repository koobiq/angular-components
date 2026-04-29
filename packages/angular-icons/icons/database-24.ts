import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-database-24,[kbqDatabase24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M21 5.25c0-2.071-4.03-3.75-9-3.75S3 3.179 3 5.25v1.515C3.02 8.83 7.042 10.5 12 10.5s8.98-1.67 9-3.735z"
                />
                <path
                    d="M12.497 12.295c2.476-.052 4.78-.49 6.56-1.232.702-.293 1.37-.652 1.943-1.09v2.792c-.004.409-.165.802-.459 1.17-.86 1.077-2.861 1.937-5.406 2.331q-.758.118-1.572.178a21.5 21.5 0 0 1-3.156-.003 20 20 0 0 1-1.542-.175c-2.545-.394-4.546-1.254-5.406-2.33-.294-.369-.455-.762-.459-1.17V9.972c.573.438 1.241.797 1.944 1.09C6.84 11.853 9.337 12.3 12 12.3q.25 0 .497-.005"
                />
                <path
                    d="M13.6 18.246c2.053-.142 3.945-.553 5.456-1.183.703-.293 1.37-.652 1.944-1.09v2.777c0 1.612-2.44 2.986-5.865 3.516-.976.151-2.032.234-3.135.234a20.6 20.6 0 0 1-3.135-.234C5.44 21.736 3 20.362 3 18.75v-2.777c.573.438 1.241.797 1.944 1.09 1.479.616 3.321 1.023 5.324 1.173A23 23 0 0 0 12 18.3"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDatabase24 extends KbqSvgIcon {}
