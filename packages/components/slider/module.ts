import { NgModule } from '@angular/core';
import { KbqInputSlider } from './input-slider';
import { KbqSlider } from './slider';

/** Slider controls for NgModule consumers. */
@NgModule({ imports: [KbqSlider, KbqInputSlider], exports: [KbqSlider, KbqInputSlider] })
export class KbqSliderModule {}
