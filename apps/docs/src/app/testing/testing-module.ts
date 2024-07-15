import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { KBQ_SANITY_CHECKS } from '@koobiq/components/core';

@NgModule({
    imports: [RouterTestingModule, HttpClientTestingModule],
    exports: [RouterTestingModule],
    providers: [{ provide: KBQ_SANITY_CHECKS, useValue: false }],
})
export class DocsAppTestingModule {}
