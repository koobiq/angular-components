import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqTagList, KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag list selectable
 */
@Component({
    selector: 'tag-list-selectable-example',
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list selectable>
            <kbq-tag>Tag</kbq-tag>
            <kbq-tag selected>Tag</kbq-tag>
            <kbq-tag selected>Tag</kbq-tag>
            <kbq-tag>Tag</kbq-tag>
        </kbq-tag-list>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-xxl);
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListSelectableExample {
    private readonly tagList = viewChild.required(KbqTagList);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        afterNextRender(() =>
            this.tagList()
                .tagSelectionChanges.pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.onSelectionChange(event))
        );
    }

    private onSelectionChange(event: KbqTagSelectionChange) {
        console.log('Selection changed:', event);
    }
}
