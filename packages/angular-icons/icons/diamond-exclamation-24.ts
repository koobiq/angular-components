import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-diamond-exclamation-24,[kbqDiamondExclamation24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M11.788.967a.3.3 0 0 1 .424 0l10.821 10.82a.3.3 0 0 1 0 .425l-10.82 10.821a.3.3 0 0 1-.425 0L.967 12.213a.3.3 0 0 1 0-.425zm.21 14.093c-.734 0-1.33.586-1.33 1.32s.596 1.335 1.33 1.335 1.33-.6 1.33-1.335c0-.734-.595-1.32-1.33-1.32M10.909 6a.31.31 0 0 0-.3.33l.463 7.425c.01.158.142.27.3.27h1.252a.29.29 0 0 0 .298-.27l.468-7.425a.31.31 0 0 0-.3-.33z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiamondExclamation24 extends KbqSvgIcon {}
