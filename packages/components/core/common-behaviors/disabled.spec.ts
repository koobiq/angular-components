import { mixinDisabled } from './disabled';

describe('MixinDisabled', () => {
    // The mixin is deprecated and says so, in dev mode, every time it is instantiated.
    let warn: jest.SpyInstance;

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should warn that it is deprecated', () => {
        new (mixinDisabled(class {}))();

        expect(warn).toHaveBeenCalledWith('mixinDisabled deprecated and will be deleted in next major release');
    });

    it('should augment an existing class with a disabled property', () => {
        class EmptyClass {}

        const classWithDisabled = mixinDisabled(EmptyClass);
        const instance = new classWithDisabled();

        expect(instance.disabled).toBe(false);

        instance.disabled = true;
        expect(instance.disabled).toBe(true);
    });
});
