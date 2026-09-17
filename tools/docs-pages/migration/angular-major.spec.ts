import { readFileSync } from 'fs';

/**
 * The migration guide page tells a reader to run `ng update @angular/core@N` for Koobiq N
 * (`docsMigrationUpdateCommand` in `apps/docs`), which is only right while a Koobiq major requires
 * the Angular major of the same number.
 */
describe('Koobiq and Angular majors', () => {
    it('should require the Angular major of the same number', () => {
        const { version, requiredAngularVersion } = JSON.parse(readFileSync('package.json', 'utf8'));
        const majorOf = (value: string): number => Number(value.match(/\d+/)![0]);

        expect(majorOf(requiredAngularVersion)).toBe(majorOf(version));
    });
});
