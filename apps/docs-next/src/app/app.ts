import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KbqNativeScrollbar, kbqNativeScrollbarOptionsProvider } from '@koobiq/components/scrollbar';

/** Styles the browser scrollbars of the whole site with the Koobiq ones; the page's own scrollbar is styled by the classes on `<html>`. */
@Component({
    selector: 'docs-next-app',
    imports: [RouterOutlet],
    template: '<router-outlet />',
    providers: [kbqNativeScrollbarOptionsProvider({ descendants: true })],
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [KbqNativeScrollbar]
})
export class DocsNextApp {}
