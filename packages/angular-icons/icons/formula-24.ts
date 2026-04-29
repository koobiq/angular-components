import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-formula-24,[kbqFormula24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.691 8.754a.3.3 0 0 1 .3.3v1.81a.3.3 0 0 1-.3.3h-2.856v7.047q0 1.63-.582 2.752a3.83 3.83 0 0 1-1.648 1.698q-1.068.59-2.563.589-.498 0-.914-.055a80 80 0 0 1-2.898-.385.267.267 0 0 1-.219-.292l.157-1.937a.37.37 0 0 1 .407-.32c.734.1 2.287.284 2.511.305q.444.055.665.055.595 0 .984-.288.387-.273.568-.821.193-.534.193-1.301v-7.047H7.541a.3.3 0 0 1-.3-.3v-1.81a.3.3 0 0 1 .3-.3h2.955V5.83q0-1.656.61-2.78a4.04 4.04 0 0 1 1.773-1.711q1.15-.59 2.757-.589.54 0 1.053.082c.293.046 1.481.312 2.067.446.15.034.248.177.23.329l-.243 1.917a.306.306 0 0 1-.37.259c-.505-.114-1.399-.308-1.574-.322a6 6 0 0 0-.762-.04q-.72 0-1.219.273a1.74 1.74 0 0 0-.734.822q-.25.534-.25 1.314v2.924z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFormula24 extends KbqSvgIcon {}
