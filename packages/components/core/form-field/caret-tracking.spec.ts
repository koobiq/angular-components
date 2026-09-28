import { Component, Renderer2, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchFakeEvent } from '../testing';
import { kbqListenForCaretMoves } from './caret-tracking';

@Component({ template: '' })
class RendererHost {
    readonly renderer = inject(Renderer2);
}

describe('kbqListenForCaretMoves', () => {
    let renderer: Renderer2;
    let field: HTMLTextAreaElement;

    beforeEach(() => {
        renderer = TestBed.createComponent(RendererHost).componentInstance.renderer;
        field = document.createElement('textarea');
        document.body.appendChild(field);
    });

    afterEach(() => field.remove());

    it.each(['input', 'keyup', 'click', 'select', 'scroll'])('should report a caret move on %s', (name) => {
        const callback = jest.fn();

        kbqListenForCaretMoves(renderer, field, callback);
        dispatchFakeEvent(field, name);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should ignore events that do not move the caret', () => {
        const callback = jest.fn();

        kbqListenForCaretMoves(renderer, field, callback);
        dispatchFakeEvent(field, 'mouseenter');

        expect(callback).not.toHaveBeenCalled();
    });

    it('should stop listening once torn down', () => {
        const callback = jest.fn();
        const stop = kbqListenForCaretMoves(renderer, field, callback);

        stop();
        dispatchFakeEvent(field, 'input');

        expect(callback).not.toHaveBeenCalled();
    });
});
