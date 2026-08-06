import { Injectable } from '@angular/core';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { BehaviorSubject, Observable } from 'rxjs';

export enum DocsNavbarState {
    Opened,
    Closed
}

@Injectable({ providedIn: 'root' })
export class DocsDocStates {
    readonly viewerTopOverflown = new BehaviorSubject<boolean>(false);

    currentHeader?: HTMLElement;

    isHeaderOverflown: boolean = false;

    get navbarMenu(): Observable<DocsNavbarState> {
        return this._navbarMenu;
    }

    private _navbarMenu = new BehaviorSubject<DocsNavbarState>(DocsNavbarState.Closed);

    // The scrollbar whose `scrollUp()`/overflow state is currently tracked. No manual
    // unsubscribe bookkeeping needed on re-registration (unlike a plain `fromEvent` subscription)
    // — `OutputEmitterRef.subscribe()` is torn down automatically once the previous page's
    // `KbqScrollbar` host directive is destroyed on navigation.
    private headerScrollbar?: KbqScrollbar;

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
        this.headerScrollbar?.scrollToTop();
    }

    registerHeader(element: HTMLElement) {
        this.currentHeader = element;
    }

    registerHeaderScrollContainer(scrollbar: KbqScrollbar) {
        this.headerScrollbar = scrollbar;

        scrollbar.scrollChange.subscribe(({ top }) => this.checkHeaderOverflow(scrollbar, top));

        this.checkHeaderOverflow(scrollbar, scrollbar.getScrollElement()?.scrollTop ?? 0);
    }

    /**
     * `scrollTop` is only needed for `isHeaderOverflown` — a docs-specific threshold against
     * `currentHeader`'s own height, which `KbqScrollbar` has no notion of. Whether the container
     * is scrolled away from the top at all is already `scrollbar`'s own public `isTopReached`.
     */
    private checkHeaderOverflow(scrollbar: KbqScrollbar, scrollTop: number): void {
        this.viewerTopOverflown.next(!scrollbar.isTopReached());

        if (!this.currentHeader) {
            return;
        }

        this.isHeaderOverflown = scrollTop > this.currentHeader.offsetHeight;
    }
}
