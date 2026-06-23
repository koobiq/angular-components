import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule } from '@koobiq/components/list';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Two-line list options
 */
@Component({
    selector: 'title-list-option-example',
    imports: [
        KbqListModule,
        KbqTitleModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <kbq-list-selection class="example-title-list" [(ngModel)]="selected">
            @for (server of servers; track server.value) {
                <kbq-list-option [value]="server.value">
                    <div kbq-title class="layout-row layout-align-space-between-center">
                        <div #kbqTitleContainer class="layout-column example-title-list__text">
                            <div #kbqTitleText class="server__name kbq-truncate-line">{{ server.name }}</div>

                            <div #kbqTitleText kbq-list-option-caption class="server__description kbq-truncate-line">
                                {{ server.description }}
                            </div>
                        </div>
                    </div>
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    styleUrls: ['./title-list-option-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListOptionExample {
    selected = [];
    servers = [
        {
            value: 'server-1',
            name: 'serverName serverName serverName serverName serverName serverName serverName serverName',
            description: 'description serverName serverName serverName serverName serverName'
        },
        {
            value: 'server-2',
            name: 'shortName',
            description: 'short description'
        },
        {
            value: 'server-3',
            name: 'anotherServer anotherServer anotherServer anotherServer anotherServer anotherServer',
            description: 'description anotherServer anotherServer anotherServer anotherServer'
        }
    ];
}
