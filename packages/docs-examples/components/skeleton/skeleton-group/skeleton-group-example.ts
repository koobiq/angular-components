import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqSkeletonGroup } from '@koobiq/components/skeleton';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from './l10n';

/**
 * @title Skeleton group preset
 */
@Component({
    selector: 'skeleton-group-example',
    imports: [KbqSkeletonGroup, KbqToggleModule, FormsModule, KbqTagsModule, KbqLink],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-group preset="tag" />
            <kbq-skeleton-group preset="link" [count]="4" />
        } @else {
            <kbq-tag-list>
                <kbq-tag [color]="colors.ContrastFade">LDAP</kbq-tag>
                <kbq-tag [color]="colors.Theme">Active Directory</kbq-tag>
                <kbq-tag [color]="colors.Error">{{ text().blocked }}</kbq-tag>
            </kbq-tag-list>
            <div class="example-row">
                <a kbqLink pseudo>{{ text().groupLinks[0] }}</a>
                /a>
                <a kbqLink pseudo>{{ text().groupLinks[1] }}</a>
                /a>
                <a kbqLink pseudo>{{ text().groupLinks[2] }}</a>
                /a>
                <a kbqLink pseudo>{{ text().groupLinks[3] }}</a>
                /a>
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

    protected readonly text = injectExampleText();
    protected readonly colors = KbqComponentColors;
}
