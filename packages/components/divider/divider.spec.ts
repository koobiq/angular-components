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
});

@Component({
    imports: [KbqDividerModule],
    template: `
        <kbq-divider [vertical]="vertical" />
    `
})
class KbqDividerTestComponent {
    vertical: boolean;
}
