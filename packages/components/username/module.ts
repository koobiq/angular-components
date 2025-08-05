import { NgModule } from '@angular/core';
import { KbqUsername, KbqUsernameCustomView, KbqUsernamePrimary, KbqUsernameSecondary } from './username';
import { KbqUsernameCustomPipe, KbqUsernamePipe } from './username.pipe';

const COMPONENTS = [
    KbqUsername,
    KbqUsernameCustomView,
    KbqUsernamePrimary,
    KbqUsernameSecondary,
    KbqUsernameCustomPipe,
    KbqUsernamePipe
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqUsernameModule {}
