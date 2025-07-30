import { KbqUsernamePipe } from './username.pipe';

describe(KbqUsernamePipe.name, () => {
    let pipe: KbqUsernamePipe<object>;

    beforeEach(() => {
        pipe = new KbqUsernamePipe();
    });

    it('create an instance', () => {
        pipe = new KbqUsernamePipe();
        expect(pipe).toBeTruthy();
    });
});
