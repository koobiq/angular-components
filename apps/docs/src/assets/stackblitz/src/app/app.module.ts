import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMosaicModule } from '../koobiq.module';
// tslint:disable-next-line:no-import-side-effect
import '../polyfills';
import { KoobiqDocsExample } from './koobiq-docs-example';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        DemoMosaicModule,
        ReactiveFormsModule,
        ScrollingModule,
    ],
    declarations: [KoobiqDocsExample],
    bootstrap: [KoobiqDocsExample],
})
export class AppModule {}
