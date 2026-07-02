import { AfterViewInit, ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { kbqBuildUsernameText, KbqUserInfo, KbqUsernameModule, KbqUsernamePipe } from '@koobiq/components/username';

const USERS: KbqUserInfo[] = [
    { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' },
    { firstName: 'Alice', middleName: 'Marie', lastName: 'Stone', login: 'astone' },
    { firstName: 'Robert', lastName: 'Green', login: 'rgreen', site: 'dev' },
    { firstName: 'Elena', middleName: 'Vera', lastName: 'Fox', login: 'efox' }
];

/**
 * @title Username filter bar option
 */
@Component({
    selector: 'username-filter-bar-option-example',
    imports: [KbqFilterBarModule, KbqUsernameModule, KbqHighlightBackgroundPipe],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>

        <ng-template #userOption let-pipe let-option="option">
            @let searchText = pipe.searchControl.value;

            <kbq-username>
                <kbq-username-custom-view>
                    @let fullName = option.value | kbqUsername;
                    <span kbqUsernamePrimary [innerHTML]="fullName | kbqHighlightBackground: searchText"></span>

                    @if (option.value?.login) {
                        <span
                            kbqUsernameSecondary
                            [innerHTML]="option.value.login | kbqHighlightBackground: searchText"
                        ></span>
                    }
                </kbq-username-custom-view>
            </kbq-username>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameFilterBarOptionExample implements AfterViewInit {
    private readonly usernamePipe = inject(KbqUsernamePipe);
    private readonly userOptionTemplate = viewChild<TemplateRef<any>>('userOption');

    activeFilter: KbqFilter = {
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'Assignee',
                type: KbqPipeTypes.Select,
                value: null,
                search: true,
                cleanable: true,
                removable: false,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [];

    ngAfterViewInit(): void {
        this.pipeTemplates = [
            {
                name: 'Assignee',
                type: KbqPipeTypes.Select,
                values: USERS.map((user) => ({
                    name: kbqBuildUsernameText(
                        { name: this.usernamePipe.transform(user), login: user.login, site: user.site },
                        { formatSite: (s) => s }
                    ),
                    value: user,
                    id: user.login
                })),
                valueTemplate: this.userOptionTemplate(),
                cleanable: true,
                removable: false,
                disabled: false
            }
        ];
    }
}
