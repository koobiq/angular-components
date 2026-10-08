import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSkeletonGroup } from '@koobiq/components/skeleton';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton group preset
 */
@Component({
    selector: 'skeleton-group-example',
    imports: [KbqSkeletonGroup, KbqToggleModule, FormsModule, KbqTagsModule, KbqLinkModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-group preset="tag" />
            <kbq-skeleton-group preset="link" [count]="4" />
        } @else {
            <kbq-tag-list>
                <kbq-tag [color]="colors.ContrastFade">LDAP</kbq-tag>
                <kbq-tag [color]="colors.Theme">Active Directory</kbq-tag>
                <kbq-tag [color]="colors.Error">Blocked</kbq-tag>
            </kbq-tag-list>
            <div class="example-row">
                <a kbq-link pseudo>Overview</a>
                <a kbq-link pseudo>API</a>
                <a kbq-link pseudo>Examples</a>
                <a kbq-link pseudo>Changelog</a>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonGroupExample {
    protected readonly loading = model(true);
    protected readonly colors = KbqComponentColors;
}
