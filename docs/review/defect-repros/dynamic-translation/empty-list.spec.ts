import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDynamicTranslationModule } from '@koobiq/components/dynamic-translation';

@Component({
    selector: 'test-empty-list',
    imports: [KbqDynamicTranslationModule],
    template: `
        <kbq-dynamic-translation [text]="text()">
            <ul *kbqDynamicTranslationSlot="'list'; let list" [attr.data-is-array]="isArray(list)">
                @for (item of list; track $index) {
                    <li>{{ item }}</li>
                }
            </ul>
        </kbq-dynamic-translation>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly text = signal('Selected: [[list:()]]');

    protected isArray(value: unknown): boolean {
        return Array.isArray(value);
    }
}

describe('KbqDynamicTranslation triage: empty list', () => {
    it('DEFECT: () gives a list template the string "()" and @for renders its characters as items', () => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const list: HTMLElement = fixture.nativeElement.querySelector('ul');
        const items = Array.from(list.querySelectorAll('li')).map((item) => item.textContent?.trim());

        expect(list.getAttribute('data-is-array')).toBe('false');
        expect(items).toEqual(['(', ')']);
    });
});
