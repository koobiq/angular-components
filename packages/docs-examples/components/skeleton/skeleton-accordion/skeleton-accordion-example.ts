import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqSkeletonAccordion } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton accordion preset
 */
@Component({
    selector: 'skeleton-accordion-example',
    imports: [KbqSkeletonAccordion, KbqToggleModule, FormsModule, KbqAccordionModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-accordion />
        } @else {
            <kbq-accordion [useStateSaving]="false">
                @for (section of sections; track section.title) {
                    <kbq-accordion-item>
                        <button kbq-accordion-trigger type="button">{{ section.title }}</button>
                        <kbq-accordion-content>{{ section.content }}</kbq-accordion-content>
                    </kbq-accordion-item>
                }
            </kbq-accordion>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonAccordionExample {
    protected readonly loading = model(true);
    protected readonly sections = [
        { title: 'Connection', content: 'The server address, the port and the type of the connection.' },
        { title: 'Synchronization', content: 'How often the users and the groups of the directory are updated.' },
        { title: 'Authentication', content: 'Who is allowed to sign in with an account of the directory.' }
    ];
}
