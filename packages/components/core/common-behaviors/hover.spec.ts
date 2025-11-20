import { ChangeDetectionStrategy, Component, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqHover } from './hover';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    standalone: true,
    selector: 'test-by-attr-directive',
    template: '<div kbqHover>test</div>',
    imports: [KbqHover],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestByAttrDirective {}

@Component({
    standalone: true,
    selector: 'test-by-host-directive',
    hostDirectives: [KbqHover],
    template: '<div>test</div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestByHostDirective {}

describe(KbqHover.name, () => {
    it('should toggle selector by attribute directive', () => {
        const { debugElement } = createComponent(TestByAttrDirective);
        const element = debugElement.query(By.css('div')).nativeElement as HTMLElement;

        expect(element.classList).not.toContain('kbq-hovered');

        element.dispatchEvent(new MouseEvent('mouseenter'));

        expect(element.classList).toContain('kbq-hovered');

        element.dispatchEvent(new MouseEvent('mouseleave'));

        expect(element.classList).not.toContain('kbq-hovered');
    });

    it('should toggle selector by host directive', () => {
        const { debugElement } = createComponent(TestByHostDirective);
        const element = debugElement.nativeElement as HTMLElement;

        expect(element.classList).not.toContain('kbq-hovered');

        element.dispatchEvent(new MouseEvent('mouseenter'));

        expect(element.classList).toContain('kbq-hovered');

        element.dispatchEvent(new MouseEvent('mouseleave'));

        expect(element.classList).not.toContain('kbq-hovered');
    });
});
