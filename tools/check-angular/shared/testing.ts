import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckConfig } from './config';

/** Renders a scenario the way the configuration's application would, and waits for it to settle. */
export async function renderScenario<T>(component: Type<T>, config: CheckConfig): Promise<ComponentFixture<T>> {
    TestBed.configureTestingModule({ imports: [component], providers: config.providers });

    const fixture = TestBed.createComponent(component);

    fixture.autoDetectChanges();
    await fixture.whenStable();

    return fixture;
}
