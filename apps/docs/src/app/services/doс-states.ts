import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export enum DocsNavbarState {
    opened,
    closed
}

@Injectable({ providedIn: 'root' })
export class DocStates {
    readonly viewerTopOverflown = new BehaviorSubject<boolean>(false);
    readonly navbarTopOverflown = new BehaviorSubject<boolean>(false);

    currentHeader: HTMLElement;
    currentHeaderScrollContainer: HTMLElement;
    navbarScrollContainer: HTMLElement;

    isHeaderOverflown: boolean = false;

    get navbarMenu(): Observable<DocsNavbarState> {
        return this._navbarMenu;
    }

    private _navbarMenu = new BehaviorSubject<DocsNavbarState>(DocsNavbarState.closed);

    openNavbarMenu() {
        this._navbarMenu.next(DocsNavbarState.opened);
    }

    closeNavbarMenu() {
        this._navbarMenu.next(DocsNavbarState.closed);
    }

    toggleNavbarMenu() {
        this._navbarMenu.value === DocsNavbarState.closed ? this.openNavbarMenu() : this.closeNavbarMenu();
    }

    scrollUp() {
        this.currentHeaderScrollContainer.scroll(0, 0);
    }

    registerHeader(element: HTMLElement) {
        this.currentHeader = element;
    }

    registerHeaderScrollContainer(element: HTMLElement) {
        this.currentHeaderScrollContainer = element;

        fromEvent(this.currentHeaderScrollContainer, 'scroll')
            .pipe(debounceTime(10))
            .subscribe(this.checkHeaderOverflow);

        Promise.resolve().then(() => this.checkHeaderOverflow());
    }

    checkHeaderOverflow = () => {
        this.isHeaderOverflown = this.currentHeaderScrollContainer.scrollTop > this.currentHeader.offsetHeight;
        this.viewerTopOverflown.next(this.currentHeaderScrollContainer.scrollTop > 0);
    };

    registerNavbarScrollContainer(element: HTMLElement) {
        this.navbarScrollContainer = element;

        fromEvent(this.navbarScrollContainer, 'scroll').pipe(debounceTime(10)).subscribe(this.checkNavbarOverflow);
    }

    checkNavbarOverflow = () => {
        this.navbarTopOverflown.next(this.navbarScrollContainer.scrollTop > 0);
    };
}
