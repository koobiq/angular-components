import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { kbqBuildUsernameText, KbqUserInfo, KbqUsernameModule, KbqUsernamePipe } from '@koobiq/components/username';
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
                        <span
                            kbqUsernamePrimary
                            [innerHTML]="fullName | kbqHighlightBackground: searchControl.value.trim()"
                        ></span>

                        @if (user.login) {
                            <span
                                kbqUsernameSecondary
                                [innerHTML]="user.login | kbqHighlightBackground: searchControl.value.trim()"
                            ></span>
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
    private readonly usernamePipe = inject(KbqUsernamePipe);

    protected readonly searchControl = new FormControl('', { nonNullable: true });

    private readonly searchText = toSignal(this.searchControl.valueChanges.pipe(startWith('')), { initialValue: '' });

    protected readonly users: KbqUserInfo[] = [
        { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' },
        { firstName: 'Alice', middleName: 'Marie', lastName: 'Stone', login: 'astone' },
        { firstName: 'Robert', lastName: 'Green', login: 'rgreen', site: 'dev' },
        { firstName: 'Elena', middleName: 'Vera', lastName: 'Fox', login: 'efox' }
    ];

    protected readonly filteredUsers = computed(() => {
        const query = (this.searchText() ?? '').toLowerCase().trim();

        if (!query) return this.users;

        return this.users.filter((user) =>
            kbqBuildUsernameText(
                { name: this.usernamePipe.transform(user), login: user.login, site: user.site },
                { formatSite: (s) => s }
            )
                .toLowerCase()
                .includes(query)
        );
    });
}
