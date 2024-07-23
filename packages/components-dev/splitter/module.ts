import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { Direction, KbqSplitterModule } from '../../components/splitter';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {
    guttersVisibility = true;

    DIRECTION = Direction;

    toggleVisibility() {
        this.guttersVisibility = !this.guttersVisibility;
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqButtonModule,
        KbqSplitterModule,
        KbqIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
