import { Component, contentChild, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqIconItem } from './icon-item.component';
import { KbqIcon } from './icon.component';

@Component({
    selector: 'icon-item-test-app',
    imports: [KbqIconItem],
    template: `
        <i kbq-icon-item="kbq-plus_16" [big]="big()" [fade]="fade()"></i>
    `
})
class IconItemTestApp {
    readonly big = signal(false);
    readonly fade = signal(false);
}

@Component({
    selector: 'icon-item-query-app',
    imports: [KbqIconItem],
    template: `
        <ng-content />
    `
})
class IconItemQueryApp {
    readonly icon = contentChild(KbqIcon);
}

@Component({
    selector: 'icon-item-projection-app',
    imports: [KbqIconItem, IconItemQueryApp],
    template: `
        <icon-item-query-app>
            <i kbq-icon-item="kbq-plus_16"></i>
        </icon-item-query-app>
    `
})
class IconItemProjectionApp {}

describe('KbqIconItem', () => {
    let fixture: ComponentFixture<IconItemTestApp>;

    const hostOf = () => fixture.nativeElement.querySelector('i') as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(IconItemTestApp);
        fixture.detectChanges();
    });

    it('should always carry the filled modifier', () => {
        expect(hostOf().classList).toContain('kbq-icon-item');
        expect(hostOf().classList).toContain('kbq-icon-item_filled');
    });

    it('should default to the normal size and the solid background', () => {
        expect(hostOf().classList).toContain('kbq-icon-item_normal');
        expect(hostOf().classList).not.toContain('kbq-icon-item_big');
        expect(hostOf().classList).toContain('kbq-icon-item_fade-off');
        expect(hostOf().classList).not.toContain('kbq-icon-item_fade-on');
    });

    it('should swap the size classes with big', () => {
        fixture.componentInstance.big.set(true);
        fixture.detectChanges();

        expect(hostOf().classList).toContain('kbq-icon-item_big');
        expect(hostOf().classList).not.toContain('kbq-icon-item_normal');
    });

    it('should swap the background classes with fade', () => {
        fixture.componentInstance.fade.set(true);
        fixture.detectChanges();

        expect(hostOf().classList).toContain('kbq-icon-item_fade-on');
        expect(hostOf().classList).not.toContain('kbq-icon-item_fade-off');
    });

    it('should render the icon name as a font class', () => {
        expect(hostOf().classList).toContain('kbq-plus_16');
    });

    it('should stay decorative', () => {
        expect(hostOf().getAttribute('aria-hidden')).toBe('true');
    });

    it('should not get the bare icon max-height, sizing itself through its own padding', () => {
        expect(hostOf().style.maxHeight).toBe('');
    });

    // ICN-ARCH-01: the host class is inherited from KbqIcon, the DI token is not — without the explicit
    // provider a `contentChild(KbqIcon)` walks straight past an icon item.
    it('should be found by a KbqIcon content query', () => {
        const projection = TestBed.createComponent(IconItemProjectionApp);

        projection.detectChanges();

        const queryHost = projection.debugElement.query(By.directive(IconItemQueryApp))
            .componentInstance as IconItemQueryApp;

        expect(queryHost.icon()).toBeInstanceOf(KbqIconItem);
    });
});
