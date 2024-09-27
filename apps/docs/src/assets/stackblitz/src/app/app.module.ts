import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoKoobiqModule } from '../koobiq.module';
import { KoobiqDocsExample } from './koobiq-docs-example';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        DemoKoobiqModule,
        ReactiveFormsModule,
        ScrollingModule
    ],
    declarations: [KoobiqDocsExample],
    bootstrap: [KoobiqDocsExample]
})
export class AppModule {}
