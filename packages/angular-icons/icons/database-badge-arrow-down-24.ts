import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-database-badge-arrow-down-24,[kbqDatabaseBadgeArrowDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 1.5c4.97 0 9 1.679 9 3.75v1.515c-.02 2.064-4.042 3.735-9 3.735S3.02 8.83 3 6.765V5.25C3 3.179 7.03 1.5 12 1.5m5.176 10.185-4.605 4.807a22 22 0 0 1-2.164-.05 20 20 0 0 1-1.542-.176c-2.545-.394-4.546-1.254-5.406-2.33-.294-.369-.455-.762-.459-1.17V9.972c.573.438 1.241.797 1.944 1.09C6.84 11.853 9.337 12.3 12 12.3q.25 0 .497-.005c1.675-.035 3.271-.247 4.679-.61m-6.908 6.551q.297.022.598.037l-.266.278 3.812 3.813c-.767.088-1.576.136-2.412.136-1.087 0-2.13-.08-3.094-.227l-.041-.007C5.44 21.736 3 20.362 3 18.75v-2.777c.573.438 1.241.797 1.944 1.09 1.479.616 3.321 1.023 5.324 1.173m8.23 5.676-4.99-4.99a.3.3 0 0 1 0-.424l1.274-1.272a.3.3 0 0 1 .424 0l2.305 2.304v-6.48a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v6.48l2.304-2.304a.3.3 0 0 1 .424 0l1.273 1.273a.3.3 0 0 1 0 .424l-4.99 4.99a.3.3 0 0 1-.424 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDatabaseBadgeArrowDown24 extends KbqSvgIcon {}
