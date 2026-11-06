import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KbqNativeScrollbar, kbqNativeScrollbarOptionsProvider } from '@koobiq/components/scrollbar';
import { DocsNextPageTitle } from './services/page-title';
import { DocsNextSlowNetworkBadge } from './ui/slow-network-badge';

/** Styles the browser scrollbars of the whole site with the Koobiq ones; the page's own scrollbar is styled by the classes on `<html>`. */
@Component({
    selector: 'docs-next-app',
    imports: [RouterOutlet, DocsNextSlowNetworkBadge],
    template: '<router-outlet /><docs-next-slow-network-badge />',
    providers: [kbqNativeScrollbarOptionsProvider({ descendants: true })],
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [KbqNativeScrollbar]
})
export class DocsNextApp {
    constructor() {
        inject(DocsNextPageTitle);
    }
}
