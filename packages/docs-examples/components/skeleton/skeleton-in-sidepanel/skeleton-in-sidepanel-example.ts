import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, TemplateRef, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqTableModule } from '@koobiq/components/table';
import { take } from 'rxjs';

/**
 * @title Skeleton in sidepanel
 */
@Component({
    selector: 'skeleton-in-sidepanel-example',
    imports: [KbqSkeleton, KbqButtonModule, KbqSidepanelModule, KbqIconModule, KbqDlModule, KbqTableModule],
    template: `
        <button kbq-button (click)="open()">Open sidepanel</button>

        <ng-template>
            <kbq-sidepanel-header [closeable]="true">
                @if (loading()) {
                    <kbq-skeleton [style.height.px]="28" />
                } @else {
                    LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae45
                }
            </kbq-sidepanel-header>
            <kbq-sidepanel-body class="example-body">
                <div class="example-actions">
                    @if (loading()) {
                        @for (_ of [0, 1, 2]; track _) {
                            <kbq-skeleton [style.height.px]="32" [style.width.%]="$last ? 15 : 30" />
                        }
                    } @else {
                        <button kbq-button (click)="startLoading()">
                            <i kbq-icon="kbq-circle-play_16"></i>
                            Start synchronization
                        </button>
                        <button kbq-button (click)="startLoading()">
                            <i kbq-icon="kbq-pencil_16"></i>
                        </button>
                        <button kbq-button (click)="startLoading()">
                            <i kbq-icon="kbq-trash_16"></i>
                            Remove
                        </button>
                    }
                </div>

                @if (loading()) {
                    <div class="example-list-skeletons">
                        @for (_ of [0, 1, 2, 3, 4, 5]; track _) {
                            <kbq-skeleton [style.height.px]="20" />
                        }
                    </div>
                } @else {
                    <kbq-dl>
                        <kbq-dt>Domain</kbq-dt>
                        <kbq-dd>domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43</kbq-dd>
                        <kbq-dt>Connection type</kbq-dt>
                        <kbq-dd>Synchronization and authentication</kbq-dd>
                    </kbq-dl>
                }

                <table kbq-table width="100%">
                    <thead>
                        @if (loading()) {
                            <tr>
                                @for (_ of [0, 1]; track _) {
                                    <th [style.width.%]="$first ? 80 : 20">
                                        <kbq-skeleton [style.height.px]="20" />
                                    </th>
                                }
                            </tr>
                        } @else {
                            <tr>
                                <th>Address</th>
                                <th>Port</th>
                                <th>SSL</th>
                            </tr>
                        }
                    </thead>
                    <tbody>
                        @if (loading()) {
                            @for (_ of [0, 2, 3]; track _) {
                                <tr>
                                    @for (_ of [0, 1]; track _) {
                                        <td [style.width.%]="$first ? 80 : 20">
                                            <kbq-skeleton [style.height.px]="20" />
                                        </td>
                                    }
                                </tr>
                            }
                        } @else {
                            @for (_ of [0, 1, 2, 3, 4, 5]; track _) {
                                <tr>
                                    <td>productname{{ $index }}.security.com</td>
                                    <td>{{ 555 + $index }}</td>
                                    <td><i kbq-icon="kbq-check_16"></i></td>
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonInSidepanelExample implements OnDestroy {
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private readonly sidepanel = inject(KbqSidepanelService);
    private readonly template = viewChild.required(TemplateRef);
    protected readonly loading = signal(true);

    protected open(): void {
        this.startLoading();
        this.sidepanel
            .open(this.template())
            .afterClosed()
            .pipe(take(1))
            .subscribe(() => this.clearTimeout());
    }

    protected startLoading(): void {
        this.clearTimeout();
        this.loading.set(true);
        this.timeoutId = setTimeout(() => this.loading.set(false), 2000);
    }

    private clearTimeout(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    ngOnDestroy(): void {
        this.clearTimeout();
    }
}
