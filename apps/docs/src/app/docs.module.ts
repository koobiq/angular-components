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
import { AnchorsModule } from './components/anchors/anchors.module';
import { ComponentViewerModule } from './components/component-viewer/component-viewer.module';
import { DesignTokensViewer } from './components/design-tokens-viewers/design-tokens-viewer';
import { DocStates } from './components/doс-states';
import { IconItems } from './components/icons-items/icon-items';
import { DocsNavbarComponent } from './components/navbar/navbar.component';
import { DocsSidenavComponent } from './components/sidenav/sidenav.component';
import { WelcomeModule } from './components/welcome/welcome.module';
import { DocsAppComponent } from './containers/docs-app/docs-app.component';
import { IconsViewerModule } from './containers/icons-viewer/icons-viewer.module';
import { DocsRoutingModule } from './docs-routing.module';

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
        DocsNavbarComponent,
        WelcomeModule,
        FormsModule,
        HttpClientModule,
        DocsRoutingModule,
        ComponentViewerModule,
        IconsViewerModule,
        DocsSidenavComponent,
        DesignTokensViewer
    ],
    declarations: [DocsAppComponent],
    providers: [
        DocStates,
        IconItems,
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        },
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
    ],
    bootstrap: [DocsAppComponent]
})
export class AppModule {}
