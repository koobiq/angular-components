import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { kbqInjectNativeElement } from '../utils';
import { KbqSearchFieldPopup, kbqSyncSearchFieldA11y } from './search-field';

@Component({
    selector: 'search-field-host',
    template: `
        <input
            [attr.type]="type()"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledby]="ariaLabelledby()"
            [attr.title]="title()"
            [attr.placeholder]="placeholder()"
        />
        @if (popupOpen()) {
            <div class="popup" [attr.id]="popupId()">
                @for (item of items(); track item) {
                    <div class="item" [attr.id]="item === itemWithId() ? 'own-item-id' : null">{{ item }}</div>
                }
            </div>
        }
    `
})
class SearchFieldHost {
    readonly type = signal('text');
    readonly ariaLabel = signal<string | null>(null);
    readonly ariaLabelledby = signal<string | null>(null);
    readonly title = signal<string | null>(null);
    readonly placeholder = signal<string | null>(null);
    readonly popupOpen = signal(true);
    readonly fallbackLabel = signal('Search');
    readonly popupId = signal<string | null>(null);
    readonly items = signal(['One', 'Two']);
    readonly itemWithId = signal<string | null>(null);
    readonly activeItem = signal<string | null>(null);
    readonly popup = signal<KbqSearchFieldPopup | null>(null);

    private readonly nativeElement = kbqInjectNativeElement();

    constructor() {
        kbqSyncSearchFieldA11y(this.nativeElement, this.popup, this.fallbackLabel);
    }

    describePopup(comboboxPopupRole: KbqSearchFieldPopup['comboboxPopupRole']): void {
        const host = this.nativeElement;

        this.popup.set({
            comboboxPopupRole,
            popup: () => host.querySelector<HTMLElement>('.popup'),
            activeDescendant: () =>
                Array.from(host.querySelectorAll<HTMLElement>('.item')).find(
                    (item) => item.textContent === this.activeItem()
                )
        });
    }
}

describe('kbqSyncSearchFieldA11y', () => {
    let fixture: ComponentFixture<SearchFieldHost>;
    let host: SearchFieldHost;

    const getField = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
    const getPopup = (): HTMLElement => fixture.nativeElement.querySelector('.popup');
    const getItem = (index: number): HTMLElement => fixture.nativeElement.querySelectorAll('.item')[index];
    // The attributes are synced after a render, and in a component every change they follow is rendered too.
    const render = () => fixture.detectChanges();

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFieldHost);
        host = fixture.componentInstance;
        render();
    });

    describe('name', () => {
        it('should name a field that has no name of its own', () => {
            render();

            expect(getField().getAttribute('aria-label')).toBe('Search');
        });

        it('should follow the fallback name', () => {
            render();

            expect(getField().getAttribute('aria-label')).toBe('Search');

            host.fallbackLabel.set('Поиск');
            render();

            expect(getField().getAttribute('aria-label')).toBe('Поиск');
        });

        it('should leave the name to a placeholder', () => {
            host.placeholder.set('City or time zone');
            render();

            expect(getField().hasAttribute('aria-label')).toBe(false);
        });

        it('should take the fallback name back once a placeholder appears', () => {
            render();

            expect(getField().getAttribute('aria-label')).toBe('Search');

            host.placeholder.set('City or time zone');
            render();

            expect(getField().hasAttribute('aria-label')).toBe(false);
        });

        it('should keep an aria-label bound after the fallback name was applied', () => {
            render();

            expect(getField().getAttribute('aria-label')).toBe('Search');

            host.ariaLabel.set('Find a user');
            render();

            expect(getField().getAttribute('aria-label')).toBe('Find a user');

            host.fallbackLabel.set('Поиск');
            render();

            expect(getField().getAttribute('aria-label')).toBe('Find a user');
        });

        it('should leave the name to aria-labelledby', () => {
            host.ariaLabelledby.set('external-label');
            render();

            expect(getField().hasAttribute('aria-label')).toBe(false);
        });

        it('should leave the name to a title', () => {
            host.title.set('Find a user');
            render();

            expect(getField().hasAttribute('aria-label')).toBe(false);
        });

        it('should name the field again once its own name is gone', () => {
            host.placeholder.set('City or time zone');
            render();

            expect(getField().hasAttribute('aria-label')).toBe(false);

            host.placeholder.set(null);
            render();

            expect(getField().getAttribute('aria-label')).toBe('Search');
        });
    });

    describe('out of the document', () => {
        it('should wait for the render that attaches the field', () => {
            const detached = TestBed.createComponent(SearchFieldHost);
            const element: HTMLElement = detached.nativeElement;

            element.remove();
            detached.detectChanges();

            expect(element.querySelector('input')!.hasAttribute('aria-label')).toBe(false);

            document.body.appendChild(element);
            detached.detectChanges();

            expect(element.querySelector('input')!.getAttribute('aria-label')).toBe('Search');

            element.remove();
        });
    });

    describe('without a popup', () => {
        it('should not describe the field as controlling anything', () => {
            render();

            const field = getField();

            expect(field.hasAttribute('role')).toBe(false);
            expect(field.hasAttribute('aria-autocomplete')).toBe(false);
            expect(field.hasAttribute('aria-controls')).toBe(false);
            expect(field.hasAttribute('aria-activedescendant')).toBe(false);
        });
    });

    describe('with a listbox popup', () => {
        beforeEach(() => {
            host.describePopup('listbox');
        });

        it('should make the field a combobox that controls the popup', () => {
            render();

            const field = getField();

            expect(field.getAttribute('role')).toBe('combobox');
            expect(field.getAttribute('aria-expanded')).toBe('true');
            expect(field.getAttribute('aria-haspopup')).toBe('listbox');
            expect(field.getAttribute('aria-autocomplete')).toBe('list');
            expect(field.getAttribute('aria-controls')).toBe(getPopup().id);
        });

        it('should keep an id the popup already has', () => {
            host.popupId.set('own-popup-id');
            render();

            expect(getField().getAttribute('aria-controls')).toBe('own-popup-id');
        });

        it('should point aria-activedescendant at the highlighted item', () => {
            host.activeItem.set('Two');
            render();

            const item = getItem(1);

            expect(item.id).toBeTruthy();
            expect(getField().getAttribute('aria-activedescendant')).toBe(item.id);
        });

        it('should keep an id the highlighted item already has', () => {
            host.itemWithId.set('One');
            host.activeItem.set('One');
            render();

            expect(getField().getAttribute('aria-activedescendant')).toBe('own-item-id');
        });

        it('should drop aria-activedescendant when nothing is highlighted', () => {
            host.activeItem.set('Two');
            render();

            expect(getField().hasAttribute('aria-activedescendant')).toBe(true);

            host.activeItem.set(null);
            render();

            expect(getField().hasAttribute('aria-activedescendant')).toBe(false);
        });

        it('should drop aria-activedescendant when the highlighted item has left the document', () => {
            host.activeItem.set('Two');
            render();

            const item = getItem(1);

            expect(getField().getAttribute('aria-activedescendant')).toBe(item.id);

            host.popup.set({ ...host.popup()!, activeDescendant: () => item });
            host.items.set(['One']);
            render();

            expect(item.isConnected).toBe(false);
            expect(getField().hasAttribute('aria-activedescendant')).toBe(false);
        });

        it('should drop aria-controls once the popup has closed', () => {
            render();

            expect(getField().hasAttribute('aria-controls')).toBe(true);

            host.popupOpen.set(false);
            render();

            expect(getField().hasAttribute('aria-controls')).toBe(false);
        });

        it('should not make a field that is not a text field a combobox', () => {
            host.type.set('number');
            render();

            const field = getField();

            expect(field.hasAttribute('role')).toBe(false);
            expect(field.hasAttribute('aria-autocomplete')).toBe(false);
            expect(field.hasAttribute('aria-controls')).toBe(false);
        });
    });

    describe('with a tree popup', () => {
        it('should announce the tree the combobox controls', () => {
            host.describePopup('tree');
            render();

            expect(getField().getAttribute('role')).toBe('combobox');
            expect(getField().getAttribute('aria-haspopup')).toBe('tree');
        });
    });

    describe('with a popup a combobox cannot control', () => {
        beforeEach(() => {
            host.describePopup(null);
        });

        it('should keep the native role of the field', () => {
            render();

            const field = getField();

            expect(field.hasAttribute('role')).toBe(false);
            expect(field.hasAttribute('aria-expanded')).toBe(false);
            expect(field.hasAttribute('aria-haspopup')).toBe(false);
        });

        it('should still point the field at the popup and its highlighted item', () => {
            host.activeItem.set('One');
            render();

            const field = getField();

            expect(field.getAttribute('aria-autocomplete')).toBe('list');
            expect(field.getAttribute('aria-controls')).toBe(getPopup().id);
            expect(field.getAttribute('aria-activedescendant')).toBe(getItem(0).id);
        });
    });
});
