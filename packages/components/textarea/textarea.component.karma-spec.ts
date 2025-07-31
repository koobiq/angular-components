import { Component, Provider, Type } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextarea, KbqTextareaModule } from './index';

const MIN_TEXTAREA_HEIGHT = 50;

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            KbqTextareaModule,
            KbqFormFieldModule,
            ...imports
        ],
        declarations: [component],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers
        ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [placeholder]="placeholder" [disabled]="disabled" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaForBehaviors {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [canGrow]="false" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaGrowOff {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

describe('KbqTextarea', () => {
    describe('grow', () => {
        it('should grow initially', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.detectChanges();
            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.getBoundingClientRect().height).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);
        }));

        it('should grow on input', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.componentInstance.value = 'test\ntest';
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            const firstSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);

            textareaElement.value = 'test\ntest\ntest\ntest\ntest\ntest';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            tick();

            const secondSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeLessThan(secondSize);
        }));

        it('should shrink on input', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.componentInstance.value = 'test\ntest\ntest\ntest\ntest\ntest';
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            const firstSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);

            textareaElement.value = 'test\ntest';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            tick();

            const secondSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(secondSize);
        }));

        it('should have the class when grow is off', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaGrowOff);

            fixture.detectChanges();
            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.classList.contains('kbq-textarea-resizable')).toBeTruthy();
        }));

        it('should not have the class when grow is on', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.classList.contains('kbq-textarea-resizable')).toBeFalsy();
        }));

        it('should not scroll on focus when textarea is out of viewport', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.detectChanges();
            tick();

            fixture.componentInstance.value =
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque scelerisque non purus et tristique. Phasellus tincidunt eleifend mollis. Fusce non mi semper, accumsan erat ac, auctor nisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur mattis justo est, non egestas mauris venenatis vitae. Sed nisi orci, tincidunt eget est non, egestas volutpat quam. Etiam eget interdum urna. Duis vitae erat posuere est malesuada accumsan. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel hendrerit dui. Vivamus tristique nulla sagittis luctus semper.\nVestibulum a magna maximus, consequat sem sit amet, egestas magna. Nam nunc nulla, porttitor in dignissim nec, pharetra nec ante. Integer auctor, ex vel imperdiet vulputate, erat mauris suscipit ligula, vitae aliquet urna elit quis magna. Vivamus volutpat vel massa sit amet malesuada. Quisque accumsan a sem ac convallis. Sed euismod, elit in varius vehicula, odio eros interdum nisl, porta venenatis leo libero non arcu. Fusce rutrum ultrices venenatis. Vestibulum a elit vel metus tincidunt auctor id in turpis. Vivamus a mi faucibus, varius nunc sed, sagittis metus.\nDonec pharetra, orci viverra vulputate consequat, magna nunc feugiat erat, vel egestas enim nibh in ipsum. Pellentesque egestas mi in lectus accumsan sodales. Nunc gravida, purus ac pulvinar tristique, massa eros pellentesque tellus, vel feugiat lectus urna a est. Sed nibh erat, scelerisque et justo ut, gravida feugiat ante. Fusce sollicitudin mi ipsum, nec interdum nisl venenatis mollis. Etiam massa orci, vulputate vel nulla eget, interdum pellentesque orci. Proin faucibus consectetur nulla ut volutpat. Donec sodales vestibulum semper. Etiam dui est, condimentum eu odio nec, ullamcorper interdum quam. Duis rhoncus feugiat quam et ultrices. Duis mattis, libero eget euismod tempor, mauris neque malesuada odio, vitae vulputate est est sit amet sapien. Proin ut risus eu justo commodo blandit. Fusce feugiat nec mi eu finibus. Mauris sit amet nulla diam. Nullam eu venenatis metus.\nInteger pretium, augue eget ultrices commodo, tellus massa dignissim mauris, eu tempus quam lacus nec felis. Sed in molestie enim. Duis varius eu purus id rhoncus. Vestibulum iaculis ipsum dui. Cras scelerisque mauris a sapien interdum, non eleifend turpis aliquam. Cras bibendum id metus et malesuada. Curabitur dignissim euismod diam non venenatis. Curabitur posuere risus diam, in interdum ligula commodo vitae. Sed lobortis pharetra porta. Ut ut metus pharetra turpis laoreet tempor at sit amet nulla. Suspendisse blandit ullamcorper sem id faucibus. Vestibulum turpis urna, semper eget metus at, fermentum vestibulum libero. Ut id libero nec felis laoreet sodales.\nVestibulum vitae neque purus. Aliquam justo ipsum, consequat vel efficitur a, pharetra vitae dui. Nunc quis nibh ut velit cursus ultricies non faucibus nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque lacinia lacinia placerat. Mauris at dui sit amet turpis scelerisque egestas. Integer sapien purus, tincidunt at lectus eu, aliquet elementum massa. Nunc nec arcu quam. Nam tristique scelerisque odio, et porttitor arcu varius eu. Maecenas quis blandit neque. Curabitur consequat ultrices arcu sit amet commodo. Ut ex odio, consectetur vitae nisi at, feugiat tempor justo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque scelerisque non purus et tristique. Phasellus tincidunt eleifend mollis. Fusce non mi semper, accumsan erat ac, auctor nisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur mattis justo est, non egestas mauris venenatis vitae. Sed nisi orci, tincidunt eget est non, egestas volutpat quam. Etiam eget interdum urna. Duis vitae erat posuere est malesuada accumsan. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel hendrerit dui. Vivamus tristique nulla sagittis luctus semper.\nVestibulum a magna maximus, consequat sem sit amet, egestas magna. Nam nunc nulla, porttitor in dignissim nec, pharetra nec ante. Integer auctor, ex vel imperdiet vulputate, erat mauris suscipit ligula, vitae aliquet urna elit quis magna. Vivamus volutpat vel massa sit amet malesuada. Quisque accumsan a sem ac convallis. Sed euismod, elit in varius vehicula, odio eros interdum nisl, porta venenatis leo libero non arcu. Fusce rutrum ultrices venenatis. Vestibulum a elit vel metus tincidunt auctor id in turpis. Vivamus a mi faucibus, varius nunc sed, sagittis metus.\nDonec pharetra, orci viverra vulputate consequat, magna nunc feugiat erat, vel egestas enim nibh in ipsum. Pellentesque egestas mi in lectus accumsan sodales. Nunc gravida, purus ac pulvinar tristique, massa eros pellentesque tellus, vel feugiat lectus urna a est. Sed nibh erat, scelerisque et justo ut, gravida feugiat ante. Fusce sollicitudin mi ipsum, nec interdum nisl venenatis mollis. Etiam massa orci, vulputate vel nulla eget, interdum pellentesque orci. Proin faucibus consectetur nulla ut volutpat. Donec sodales vestibulum semper. Etiam dui est, condimentum eu odio nec, ullamcorper interdum quam. Duis rhoncus feugiat quam et ultrices. Duis mattis, libero eget euismod tempor, mauris neque malesuada odio, vitae vulputate est est sit amet sapien. Proin ut risus eu justo commodo blandit. Fusce feugiat nec mi eu finibus. Mauris sit amet nulla diam. Nullam eu venenatis metus.\nInteger pretium, augue eget ultrices commodo, tellus massa dignissim mauris, eu tempus quam lacus nec felis. Sed in molestie enim. Duis varius eu purus id rhoncus. Vestibulum iaculis ipsum dui. Cras scelerisque mauris a sapien interdum, non eleifend turpis aliquam. Cras bibendum id metus et malesuada. Curabitur dignissim euismod diam non venenatis. Curabitur posuere risus diam, in interdum ligula commodo vitae. Sed lobortis pharetra porta. Ut ut metus pharetra turpis laoreet tempor at sit amet nulla. Suspendisse blandit ullamcorper sem id faucibus. Vestibulum turpis urna, semper eget metus at, fermentum vestibulum libero. Ut id libero nec felis laoreet sodales.\nVestibulum vitae neque purus. Aliquam justo ipsum, consequat vel efficitur a, pharetra vitae dui. Nunc quis nibh ut velit cursus ultricies non faucibus nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque lacinia lacinia placerat. Mauris at dui sit amet turpis scelerisque egestas. Integer sapien purus, tincidunt at lectus eu, aliquet elementum massa. Nunc nec arcu quam. Nam tristique scelerisque odio, et porttitor arcu varius eu. Maecenas quis blandit neque. Curabitur consequat ultrices arcu sit amet commodo. Ut ex odio, consectetur vitae nisi at, feugiat tempor justo.';
            fixture.detectChanges();
            tick();

            const textareaElement: HTMLTextAreaElement = fixture.debugElement.query(
                By.directive(KbqTextarea)
            ).nativeElement;

            expect(textareaElement.scrollHeight).toBeGreaterThan(window.innerHeight);

            const previousScrollTop = textareaElement.scrollTop;

            dispatchFakeEvent(textareaElement, 'click');
            fixture.detectChanges();
            tick();
            dispatchFakeEvent(textareaElement, 'focus');
            fixture.detectChanges();
            tick();
            // simulate scroll event when focus triggered
            textareaElement.scroll(0, textareaElement.getBoundingClientRect().bottom);
            fixture.detectChanges();
            tick();

            expect(textareaElement.scrollTop).toBe(previousScrollTop);
        }));
    });
});
