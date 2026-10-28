import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    kbqBuildUsernameText,
    kbqInjectUsernameFormatter,
    KbqUserInfo,
    KbqUsernameModule
} from '@koobiq/components/username';
import { startWith } from 'rxjs';

/**
 * @title Username search
 */
@Component({
    selector: 'username-search-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqUsernameModule,
        KbqIconModule,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput type="text" placeholder="Search" autocomplete="off" [formControl]="searchControl" />
            <kbq-cleaner />
        </kbq-form-field>

        <div class="example__users-list">
            @for (user of filteredUsers(); track user) {
                <kbq-username>
                    <kbq-username-custom-view>
                        @let fullName = user | kbqUsername;
                        <span kbqUsernamePrimary [innerHTML]="fullName | kbqHighlightBackground: keywords()"></span>

                        @if (user.login) {
                            <span kbqUsernameSecondary>
                                <span [innerHTML]="user.login | kbqHighlightBackground: keywords()"></span>
                                @if (user.site) {
                                    {{ ' ' }}
                                    <span
                                        kbqUsernameSecondaryHint
                                        [innerHTML]="'(' + user.site + ')' | kbqHighlightBackground: keywords()"
                                    ></span>
                                }
                            </span>
                        }
                    </kbq-username-custom-view>
                </kbq-username>
            } @empty {
                <span class="kbq-text-normal kbq-second">Nothing found</span>
            }
        </div>
    `,
    styles: `
        .example__users-list {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-m layout-padding-m'
    }
})
export class UsernameSearchExample {
    private readonly formatUsername = kbqInjectUsernameFormatter();

    protected readonly searchControl = new FormControl('', { nonNullable: true });

    private readonly searchText = toSignal(this.searchControl.valueChanges.pipe(startWith('')), { initialValue: '' });

    protected readonly users: KbqUserInfo[] = [
        { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' },
        { firstName: 'Alice', middleName: 'Marie', lastName: 'Stone', login: 'astone' },
        { firstName: 'Robert', lastName: 'Green', login: 'rgreen', site: 'dev' },
        { firstName: 'Elena', middleName: 'Vera', lastName: 'Fox', login: 'efox' },
        { firstName: 'Madonna', login: 'madonna', site: 'corp' }
    ];

    // The name, the login and the site are rendered in separate elements, so each word of the query is highlighted on its own.
    protected readonly keywords = computed(() => (this.searchText() ?? '').split(/\s+/).filter(Boolean));

    protected readonly filteredUsers = computed(() => {
        const keywords = this.keywords().map((word) => word.toLowerCase());

        if (!keywords.length) return this.users;

        return this.users.filter((user) => {
            const text = kbqBuildUsernameText(
                { name: this.formatUsername(user), login: user.login, site: user.site },
                { formatSite: (s) => s }
            ).toLowerCase();

            return keywords.every((word) => text.includes(word));
        });
    });
}
