import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export enum DocsNavbarState {
    Opened,
    Closed
}

@Injectable({ providedIn: 'root' })
export class DocsDocStates {
    readonly viewerTopOverflown = new BehaviorSubject<boolean>(false);
    readonly navbarTopOverflown = new BehaviorSubject<boolean>(false);

    currentHeader?: HTMLElement;
    currentHeaderScrollContainer?: HTMLElement;
    navbarScrollContainer?: HTMLElement;

    isHeaderOverflown: boolean = false;

    get navbarMenu(): Observable<DocsNavbarState> {
        return this._navbarMenu;
    }

    private _navbarMenu = new BehaviorSubject<DocsNavbarState>(DocsNavbarState.Closed);

    /**
     * Only the most recently registered scroll container is tracked. `register*` is a
     * `providedIn: 'root'` singleton method that viewers call again on every client-side
     * navigation, so the previous subscription must be torn down first — otherwise one live
     * `scroll` listener leaks per navigation and keeps firing against a detached element.
     */
    private headerScrollSubscription?: Subscription;
    private navbarScrollSubscription?: Subscription;

    openNavbarMenu() {
        this._navbarMenu.next(DocsNavbarState.Opened);
    }

    closeNavbarMenu() {
        this._navbarMenu.next(DocsNavbarState.Closed);
    }

    toggleNavbarMenu() {
        if (this._navbarMenu.value === DocsNavbarState.Closed) {
            this.openNavbarMenu();
        } else {
            this.closeNavbarMenu();
        }
    }

    scrollUp() {
        this.currentHeaderScrollContainer?.scroll(0, 0);
    }

    registerHeader(element: HTMLElement) {
        this.currentHeader = element;
    }

    registerHeaderScrollContainer(element: HTMLElement) {
        this.currentHeaderScrollContainer = element;

        this.headerScrollSubscription?.unsubscribe();
        this.headerScrollSubscription = fromEvent(element, 'scroll')
            .pipe(debounceTime(10))
            .subscribe(this.checkHeaderOverflow);

        Promise.resolve().then(() => this.checkHeaderOverflow());
    }

    checkHeaderOverflow = () => {
        if (!this.currentHeaderScrollContainer || !this.currentHeader) {
            return;
        }

        this.isHeaderOverflown = this.currentHeaderScrollContainer.scrollTop > this.currentHeader.offsetHeight;
        this.viewerTopOverflown.next(this.currentHeaderScrollContainer.scrollTop > 0);
    };

    registerNavbarScrollContainer(element: HTMLElement) {
        this.navbarScrollContainer = element;

        this.navbarScrollSubscription?.unsubscribe();
        this.navbarScrollSubscription = fromEvent(element, 'scroll')
            .pipe(debounceTime(10))
            .subscribe(this.checkNavbarOverflow);
    }

    checkNavbarOverflow = () => {
        if (!this.navbarScrollContainer) {
            return;
        }

        this.navbarTopOverflown.next(this.navbarScrollContainer.scrollTop > 0);
    };
}
