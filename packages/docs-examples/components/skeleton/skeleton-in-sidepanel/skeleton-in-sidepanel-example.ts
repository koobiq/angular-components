import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Skeleton in sidepanel
 */
@Component({
    selector: 'skeleton-in-sidepanel-example',
    imports: [KbqSkeleton, KbqButtonModule, KbqSidepanelModule, KbqIconModule, KbqDlModule, KbqTableModule],
    template: `
        <button kbq-button (click)="sidepanel.open(template)">Open sidepanel</button>

        <ng-template #template>
            <kbq-sidepanel-header [closeable]="true">LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae45</kbq-sidepanel-header>
            <kbq-sidepanel-body class="example-body">
                <div class="example-actions">
                    @defer (on timer(1500ms)) {
                        <button kbq-button class="example-fade-in">
                            <i kbq-icon="kbq-circle-play_16"></i>
                            Start synchronization
                        </button>
                        <button kbq-button class="example-fade-in">
                            <i kbq-icon="kbq-pencil_16"></i>
                        </button>
                        <button kbq-button class="example-fade-in">
                            <i kbq-icon="kbq-trash_16"></i>
                            Remove
                        </button>
                    } @placeholder {
                        @for (_ of [0, 1, 2]; track _) {
                            <kbq-skeleton [style.height.px]="32" [style.width.%]="$last ? 15 : 30" />
                        }
                    }
                </div>

                @defer (on timer(1500ms)) {
                    <kbq-dl class="example-fade-in">
                        <kbq-dt>Domain</kbq-dt>
                        <kbq-dd>domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43</kbq-dd>
                        <kbq-dt>Connection type</kbq-dt>
                        <kbq-dd>Synchronization and authentication</kbq-dd>
                    </kbq-dl>
                } @placeholder {
                    <div class="example-list-skeletons">
                        @for (_ of [0, 1, 2, 3, 4, 5]; track _) {
                            <kbq-skeleton [style.height.px]="20" />
                        }
                    </div>
                }

                <table kbq-table width="100%">
                    <thead>
                        @defer (on timer(2500ms)) {
                            <tr class="example-fade-in">
                                <th>Address</th>
                                <th>Port</th>
                                <th>SSL</th>
                            </tr>
                        } @placeholder {
                            <tr>
                                @for (_ of [0, 1, 2]; track _) {
                                    <th [style.width.%]="$first ? 60 : 20">
                                        <kbq-skeleton [style.height.px]="20" />
                                    </th>
                                }
                            </tr>
                        }
                    </thead>
                    <tbody>
                        @defer (on timer(2500ms)) {
                            @for (_ of [0, 1, 2, 3, 4, 5]; track _) {
                                <tr class="example-fade-in">
                                    <td>productname{{ $index }}.security.com</td>
                                    <td>{{ 555 + $index }}</td>
                                    <td><i kbq-icon="kbq-check_16"></i></td>
                                </tr>
                            }
                        } @placeholder {
                            @for (_ of [0, 2, 3]; track _) {
                                <tr>
                                    @for (_ of [0, 1, 2]; track _) {
                                        <td [style.width.%]="$first ? 60 : 20">
                                            <kbq-skeleton [style.height.px]="20" />
                                        </td>
                                    }
                                </tr>
                            }
                        }
                    </tbody>
                </table>
            </kbq-sidepanel-body>
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--kbq-size-xl);
        }

        .example-body {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxl);
        }

        .example-actions {
            display: flex;
            gap: var(--kbq-size-m);
        }

        .example-list-skeletons {
            display: grid;
            gap: var(--kbq-size-m);
            grid-template-columns: 0.5fr 1fr;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .example-fade-in {
            animation: fadeIn 1500ms ease-out;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonInSidepanelExample {
    protected readonly sidepanel = inject(KbqSidepanelService);
}
