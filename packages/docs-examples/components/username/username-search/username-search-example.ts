import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createSearchPredicate, KbqHighlightModule, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule, kbqSelectOptionsProvider } from '@koobiq/components/select';
import { KbqToggleModule } from '@koobiq/components/toggle';
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
        FormsModule,
        ReactiveFormsModule,
        KbqSelectModule,
        KbqInputModule,
        KbqIconModule,
        KbqToggleModule,
        KbqUsernameModule,
        KbqHighlightModule
    ],
    template: `
        <div class="example__content">
            <kbq-toggle [(ngModel)]="isCompact">Compact</kbq-toggle>

            <kbq-form-field>
                <kbq-select placeholder="Assignee" [(value)]="selectedUser">
                    <kbq-select-trigger>
                        @if (selectedUser(); as user) {
                            <kbq-username [userInfo]="user" [isCompact]="isCompact()" />
                        }
                    </kbq-select-trigger>

                    <kbq-form-field noBorders kbqSelectSearch>
                        <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                        <input kbqInput type="text" [formControl]="searchControl" />
                        <kbq-cleaner />
                    </kbq-form-field>

                    <div kbq-select-search-empty-result>Nothing found</div>

                    @for (user of filteredUsers(); track user) {
                        <kbq-option [value]="user">
                            <kbq-username>
                                <kbq-username-custom-view>
                                    @let fullName = user | kbqUsername;

                                    @if (isCompact()) {
                                        <span kbqUsernamePrimary>
                                            <span
                                                [innerHTML]="fullName | kbqHighlightBackground: keywords() : true"
                                            ></span>
                                            @if (user.site) {
                                                <span
                                                    kbqUsernameSecondaryHint
                                                    [innerHTML]="
                                                        '(' + user.site + ')'
                                                            | kbqHighlightBackground: keywords() : true
                                                    "
                                                ></span>
                                            }
                                        </span>
                                    } @else {
                                        <span
                                            kbqUsernamePrimary
                                            [innerHTML]="fullName | kbqHighlightBackground: keywords() : true"
                                        ></span>

                                        @if (user.login) {
                                            <span kbqUsernameSecondary>
                                                <span
                                                    [innerHTML]="user.login | kbqHighlightBackground: keywords() : true"
                                                ></span>
                                                @if (user.site) {
                                                    <span
                                                        kbqUsernameSecondaryHint
                                                        [innerHTML]="
                                                            '(' + user.site + ')'
                                                                | kbqHighlightBackground: keywords() : true
                                                        "
                                                    ></span>
                                                }
                                            </span>
                                        }
                                    }
                                </kbq-username-custom-view>
                            </kbq-username>
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        .kbq-username__secondary-hint {
            margin-inline-start: var(--kbq-size-xxs);
        }

        .example__content {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            width: 320px;
        }
    `,
    providers: [
        kbqSelectOptionsProvider({ searchMinOptionsThreshold: 0 })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-margin-5xl'
    }
})
export class UsernameSearchExample {
    private readonly formatUsername = kbqInjectUsernameFormatter();

    protected readonly isCompact = model(false);
    protected readonly searchControl = new FormControl('', { nonNullable: true });

    private readonly searchText = toSignal(this.searchControl.valueChanges.pipe(startWith('')), { initialValue: '' });

    protected readonly users: KbqUserInfo[] = [
        { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' },
        { firstName: 'Alice', middleName: 'Marie', lastName: 'Stone', login: 'astone' },
        { firstName: 'Robert', lastName: 'Green', login: 'rgreen', site: 'dev' },
        { firstName: 'Elena', middleName: 'Vera', lastName: 'Fox', login: 'efox' },
        { firstName: 'Madonna', login: 'madonna', site: 'corp' }
    ];

    protected readonly selectedUser = signal<KbqUserInfo | null>(this.users[0]);

    // The name, the login and the site are rendered in separate elements, so each word of the query is highlighted on its own.
    protected readonly keywords = computed(() => tokenizeSearchQuery(this.searchText()));

    protected readonly filteredUsers = computed(() => {
        const matches = createSearchPredicate(this.searchText());

        return this.users.filter((user) =>
            matches(
                kbqBuildUsernameText(
                    { name: this.formatUsername(user), login: user.login, site: user.site },
                    { formatSite: (s) => s }
                )
            )
        );
    });
}
