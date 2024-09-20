import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, KbqFormattersModule, KbqLocaleService } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastModule } from '@koobiq/components/toast';
import { KbqTreeModule } from '@koobiq/components/tree';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { AnchorsModule } from './components/anchors/anchors.module';
import { ComponentViewerModule } from './components/component-viewer/component-viewer.module';
import { DocumentationItems } from './components/documentation-items';
import { DocStates } from './components/doс-states';
import { FooterModule } from './components/footer/footer.module';
import { IconItems } from './components/icons-items/icon-items';
import { NavbarModule } from './components/navbar';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SidenavModule } from './components/sidenav/sidenav.module';
import { WelcomeModule } from './components/welcome/welcome.module';
import { DocsAppComponent } from './containers/docs-app/docs-app.component';
import { IconsViewerModule } from './containers/icons-viewer/icons-viewer.module';
import { APP_ROUTES } from './docs.module-routes';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AnchorsModule,
        RouterModule,
        KbqFormattersModule,
        KbqTreeModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqDividerModule,
        KbqToastModule,
        NavbarModule,
        FooterModule,
        WelcomeModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(APP_ROUTES, {
            scrollPositionRestoration: 'disabled',
            onSameUrlNavigation: 'reload'
        }),
        ComponentViewerModule,
        IconsViewerModule,
        SidenavModule

    ],
    declarations: [DocsAppComponent, PageNotFoundComponent],
    providers: [
        DocumentationItems,
        DocStates,
        IconItems,
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        },
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                fullLibraryLoader: () => import('highlight.js'),
                lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
                lineNumbers: true
            }
        },
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
    ],
    bootstrap: [DocsAppComponent]
})
export class AppModule {}
