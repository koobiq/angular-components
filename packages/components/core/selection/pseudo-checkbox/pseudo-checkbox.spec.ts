import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqPseudoCheckbox, KbqPseudoCheckboxState } from './pseudo-checkbox';

@Component({
    imports: [KbqPseudoCheckbox],
    template: `
        <kbq-pseudo-checkbox [big]="big()" [state]="state()" />
    `
})
class TestApp {
    readonly big = signal(false);
    readonly state = signal<KbqPseudoCheckboxState>('unchecked');
}

describe(KbqPseudoCheckbox.name, () => {
    const setup = () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        return { fixture, host: fixture.nativeElement.querySelector('kbq-pseudo-checkbox') as HTMLElement };
    };

    it('should take the big size class its stylesheet styles', () => {
        const { fixture, host } = setup();

        expect(host.classList).not.toContain('kbq-pseudo-checkbox_big');

        fixture.componentInstance.big.set(true);
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-pseudo-checkbox_big');
    });

    it('should reflect the checked and indeterminate states', () => {
        const { fixture, host } = setup();

        fixture.componentInstance.state.set('checked');
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-checked');

        fixture.componentInstance.state.set('indeterminate');
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-indeterminate');
        expect(host.classList).not.toContain('kbq-checked');
    });
});
