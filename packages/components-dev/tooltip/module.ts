import { A11yModule } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors, KbqFormsModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [
        A11yModule,
        FormsModule,
        KbqFormsModule,
        KbqAlertModule,
        KbqToolTipModule,
        KbqButtonModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqSelectModule,
        KbqIconModule,
        KbqToggleModule,
        NgClass,
        DevThemeToggle
    ],
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    placement = PopUpPlacements.Top;
    componentColors = KbqComponentColors;
    popUpPlacements = PopUpPlacements;

    tooltipActiveStage: number;
    selectedOrder: boolean;

    isPopoverVisibleLeft: boolean = false;

    activatedPosition: string = '';

    inputText = 'Tooltip text';

    ELEMENTS = {
        BUTTON: 'button',
        INPUT: 'input',
        ICON: 'icon',
        EXTENDED: 'extended'
    };

    TRIGGERS = {
        CLICK: 'click',
        FOCUS: 'focus',
        HOVER: 'hover'
    };

    selectedElement: string = 'button';
    selectedColor: KbqComponentColors = KbqComponentColors.Contrast;
    selectedPlacement: PopUpPlacements = PopUpPlacements.Top;
    selectedTrigger: string = 'hover';
    layoutClass: string = 'layout-row layout-align-center-center';
    content: string = 'button text';
    userDefinedPlacementPriority: string[] = ['bottom', 'right'];
    multipleSelected: string[] = [];

    toolTipContext = {
        header: 'Header',
        content: `В западной традиции рыбой выступает фрагмент латинского текста из философского трактата Цицерона «О пределах
             добра и зла», написанного в 45 году до нашей эры. Впервые этот текст был применен для набора шрифтовых образцов
            неизвестным печатником еще в XVI веке.`
    };
    hasArrow = true;

    constructor() {
        this.tooltipActiveStage = 1;
    }

    changeStep(direction: number) {
        const newStage = this.tooltipActiveStage + direction;

        if (newStage < 1 || newStage > 3) {
            return;
        }

        this.tooltipActiveStage += direction;
    }

    onTooltipVisibleChange($event) {
        if (!$event) {
            this.activatedPosition = '';
        }
    }

    onPlacementChange(event) {
        this.activatedPosition = event;
    }

    setPlacement(placement: PopUpPlacements) {
        this.selectedPlacement = placement;
    }

    showElement(): string {
        return this.selectedElement;
    }

    activated(value: string): boolean {
        return this.selectedPlacement === value;
    }

    isActual(value: string): boolean {
        return this.activatedPosition === value && this.selectedPlacement !== this.activatedPosition;
    }

    getOrder(forElement: string) {
        if (forElement === 'config') {
            return this.selectedOrder ? { order: 2 } : { order: 1 };
        }

        if (forElement === 'result') {
            return this.selectedOrder ? { order: 1 } : { order: 2 };
        }
    }

    get isFallbackActivated(): boolean {
        return this.selectedPlacement !== this.activatedPosition && this.activatedPosition !== '';
    }
}
