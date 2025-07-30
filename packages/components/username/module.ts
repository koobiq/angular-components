import { NgModule } from '@angular/core';
import { KbqUsername } from './username';
import { KbqUsernamePipe } from './username.pipe';

const COMPONENTS = [KbqUsername, KbqUsernamePipe];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqUsernameModule {}
