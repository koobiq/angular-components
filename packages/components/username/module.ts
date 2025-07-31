import { NgModule } from '@angular/core';
import { KbqUsername } from './username';
import { KbqUsernameCustomPipe, KbqUsernamePipe } from './username.pipe';

const COMPONENTS = [KbqUsername, KbqUsernameCustomPipe, KbqUsernamePipe];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqUsernameModule {}
