import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-notebook-user-16,[kbqNotebookUser16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.2 1a.2.2 0 0 0-.2.2v.804H1.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2H3v1.507H1.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2H3v1.506H1.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2H3v1.507H1.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2H3v1.506H1.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2H3v.77c0 .11.09.2.2.2h11.6a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2zm5.78 7.282c-.411 0-.771-.239-1.04-.594a2 2 0 0 1-.145-.212h.002a2.7 2.7 0 0 1-.369-1.333c0-1 .695-1.811 1.552-1.811s1.552.81 1.552 1.81c0 .456-.136.941-.37 1.334h.003q-.065.108-.14.205c-.27.359-.632.601-1.045.601m0 1.2c.963 0 1.67-.601 2.079-1.181q.13-.187.24-.394l.604.338a1.2 1.2 0 0 1 .59 1.288l-.404 1.975a.2.2 0 0 1-.196.16H6.107a.2.2 0 0 1-.196-.16l-.404-1.975a1.2 1.2 0 0 1 .59-1.288l.573-.32q.105.196.23.376c.409.58 1.117 1.181 2.08 1.181"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqNotebookUser16 extends KbqSvgIcon {}
