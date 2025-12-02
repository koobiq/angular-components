import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqDividerModule } from './divider.module';

describe('KbqDivider', () => {
    let fixture: ComponentFixture<KbqDividerTestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqDividerModule, KbqDividerTestComponent]
        }).compileComponents();
        fixture = TestBed.createComponent(KbqDividerTestComponent);
    });

    it('should apply vertical class to vertical divider', () => {
        fixture.componentInstance.vertical = true;
        fixture.detectChanges();

        const divider = fixture.debugElement.query(By.css('kbq-divider'));

        expect(divider.nativeElement.className).toContain('kbq-divider');
        expect(divider.nativeElement.className).toContain('kbq-divider_vertical');
    });

    it('should apply inset class to inset divider', () => {
        fixture.componentInstance.inset = true;
        fixture.detectChanges();

        const divider = fixture.debugElement.query(By.css('kbq-divider'));

        expect(divider.nativeElement.className).toContain('kbq-divider');
        expect(divider.nativeElement.className).toContain('kbq-divider_inset');
    });

    it('should apply inset and vertical classes to vertical inset divider', () => {
        fixture.componentInstance.vertical = true;
        fixture.componentInstance.inset = true;
        fixture.detectChanges();

        const divider = fixture.debugElement.query(By.css('kbq-divider'));

        expect(divider.nativeElement.className).toContain('kbq-divider');
        expect(divider.nativeElement.className).toContain('kbq-divider_inset');
        expect(divider.nativeElement.className).toContain('kbq-divider_vertical');
    });
});

@Component({
    imports: [KbqDividerModule],
    template: `
        <kbq-divider [vertical]="vertical" [inset]="inset" />
    `
})
class KbqDividerTestComponent {
    vertical: boolean;
    inset: boolean;
}
