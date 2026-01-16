import { A11yModule } from '@angular/cdk/a11y';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormsModule, PopUpPlacements, PopUpSizes, ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSplitterModule } from '@koobiq/components/splitter';
import { PopoverExamplesModule } from 'packages/docs-examples/components/popover';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [PopoverExamplesModule],
    selector: 'dev-examples',
    template: `
        <popover-paddings-example />
        <popover-small-example />
        <!--        <popover-width-example />-->
        <!--        <popover-common-example />-->
        <!--        <popover-hover-example />-->
        <!--        <popover-arrowless-example />-->
        <!--        <popover-arrow-and-offset-example />-->
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html',
    imports: [
        A11yModule,
        FormsModule,
        CdkScrollableModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqIconModule,
        KbqInputModule,
        KbqSplitterModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqLinkModule,
        DevExamples,
        NgClass,
        DevThemeToggle
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    @ViewChildren(KbqPopoverTrigger) popovers: QueryList<KbqPopoverTrigger>;

    themePalette = ThemePalette;
    popUpPlacements = PopUpPlacements;

    popoverActiveStage: number;
    selectedOrder: boolean;
    isClosable: boolean = false;

    isPopoverVisibleLeft: boolean = false;

    activatedPosition: string = '';

    ELEMENTS = {
        BUTTON: 'button',
        CONFIRM_BUTTON: 'confirm-button',
        INPUT: 'input',
        ICON: 'icon',
        RADIO_GROUP: 'radio-group',
        LINK: 'link'
    };

    TRIGGERS = {
        CLICK: 'click',
        FOCUS: 'focus',
        HOVER: 'hover',
        PROGRAM: 'program'
    };

    SIZE = {
        LARGE: 'large',
        MEDIUM: 'medium',
        SMALL: 'small'
    };

    selectedElement: string = this.ELEMENTS.BUTTON;
    selectedPlacement: PopUpPlacements = PopUpPlacements.Left;
    selectedTrigger: string = this.TRIGGERS.CLICK;
    selectedSize: PopUpSizes = PopUpSizes.Medium;
    layoutClass: string = 'layout-row layout-align-center-center';
    stickToWindow: PopUpPlacements;
    content: string = 'button text';
    userDefinedPlacementPriority: string[] = ['bottom', 'right'];
    multipleSelected: string[] = [];

    confirmText: string = 'Вы уверены, что хотите продолжить?';
    confirmButtonText: string = 'Да';

    constructor() {
        this.popoverActiveStage = 1;
    }

    openPopover() {
        this.popovers.forEach((popover) => popover.show());
    }

    closePopover() {
        this.popovers.forEach((popover) => popover.hide());
    }

    changeStep(direction: number) {
        const newStage = this.popoverActiveStage + direction;

        if (newStage < 1 || newStage > 3) {
            return;
        }

        this.popoverActiveStage += direction;
    }

    onPopoverVisibleChange($event) {
        if (!$event) {
            this.activatedPosition = '';
        }
    }

    onStrategyPlacementChange(event) {
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

    getOrder(forElement: string): number {
        if (forElement === 'config') {
            return this.selectedOrder ? 2 : 1;
        }

        if (forElement === 'result') {
            return this.selectedOrder ? 1 : 2;
        }

        return 1;
    }

    get isFallbackActivated(): boolean {
        return this.selectedPlacement !== this.activatedPosition && this.activatedPosition !== '';
    }

    onConfirm() {
        alert('confirmed');
    }
}
