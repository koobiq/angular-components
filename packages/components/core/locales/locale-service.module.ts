import { NgModule } from '@angular/core';
import { kbqLocaleServiceProvider } from './locale-service';

@NgModule({
    providers: [kbqLocaleServiceProvider()]
})
export class KbqLocaleServiceModule {}
