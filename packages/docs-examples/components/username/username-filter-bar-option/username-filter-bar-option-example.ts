import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { KbqHighlightBackgroundPipe, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import {
    kbqBuildUsernameText,
    kbqInjectUsernameFormatter,
    KbqUserInfo,
    KbqUsernameModule
} from '@koobiq/components/username';

const USERS: KbqUserInfo[] = [
    { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' },
    { firstName: 'Alice', middleName: 'Marie', lastName: 'Stone', login: 'astone' },
    { firstName: 'Robert', lastName: 'Green', login: 'rgreen', site: 'dev' },
    { firstName: 'Elena', middleName: 'Vera', lastName: 'Fox', login: 'efox' },
    { firstName: 'Madonna', login: 'madonna', site: 'corp' }
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
            @let keywords = tokenizeSearchQuery(pipe.searchControl.value ?? '');

            <kbq-username>
                <kbq-username-custom-view>
                    @let fullName = option.value | kbqUsername;
                    <span kbqUsernamePrimary [innerHTML]="fullName | kbqHighlightBackground: keywords : true"></span>

                    @if (option.value?.login) {
                        <span kbqUsernameSecondary>
                            <span [innerHTML]="option.value.login | kbqHighlightBackground: keywords : true"></span>
                            @if (option.value.site) {
                                <span
                                    kbqUsernameSecondaryHint
                                    [innerHTML]="
                                        '(' + option.value.site + ')' | kbqHighlightBackground: keywords : true
                                    "
                                ></span>
                            }
                        </span>
                    }
                </kbq-username-custom-view>
            </kbq-username>
        </ng-template>
    `,
    styles: `
        kbq-filter-bar {
            width: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class UsernameFilterBarOptionExample implements AfterViewInit {
    private readonly formatUsername = kbqInjectUsernameFormatter();
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

    protected readonly tokenizeSearchQuery = tokenizeSearchQuery;

    ngAfterViewInit(): void {
        this.pipeTemplates = [
            {
                name: 'Assignee',
                type: KbqPipeTypes.Select,
                values: USERS.map((user) => ({
                    name: kbqBuildUsernameText(
                        { name: this.formatUsername(user), login: user.login, site: user.site },
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
