import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with tags
 */
@Component({
    selector: 'skeleton-tag-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqTagsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <kbq-tag-list>
            <kbq-tag [color]="colors.ContrastFade" [kbqSkeleton]="loading()">LDAP</kbq-tag>
            <kbq-tag [color]="colors.Theme" [kbqSkeleton]="loading()">Active Directory</kbq-tag>
            <kbq-tag [color]="colors.Error" [kbqSkeleton]="loading()">Blocked</kbq-tag>
        </kbq-tag-list>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTagExample {
    protected readonly loading = model(true);
    protected readonly colors = KbqComponentColors;
}
