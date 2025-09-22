import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbqSearchExpandable } from './search-expandable';

describe('KbqSearchExpandable', () => {
    let component: KbqSearchExpandable;
    let fixture: ComponentFixture<KbqSearchExpandable>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [KbqSearchExpandable]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(KbqSearchExpandable);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
