import { NgModule } from '@angular/core';
import {
    KbqUsername,
    KbqUsernameCustomView,
    KbqUsernamePrimary,
    KbqUsernameSecondary,
    KbqUsernameSecondaryHint
} from './username';
import { KbqUsernameCustomPipe, KbqUsernamePipe } from './username.pipe';

const COMPONENTS = [
    KbqUsername,
    KbqUsernameCustomView,
    KbqUsernamePrimary,
    KbqUsernameSecondary,
    KbqUsernameSecondaryHint,
    KbqUsernameCustomPipe,
    KbqUsernamePipe
];

/** Exports every `kbq-username` building block: the component, the styling directives and both pipes. */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqUsernameModule {}
