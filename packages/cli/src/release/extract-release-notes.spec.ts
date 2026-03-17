import fs from 'fs';
import { extractReleaseNotes } from './extract-release-notes';

const CHANGELOG_CONTENT = `# 18.10.0 (2024-12-11)

### Cdk

### Koobiq

 * bug fix  **docs:** added build-tokens script missing transform ([#474](https://github.com/koobiq/angular-components/issues/474)) ([f1b873b](https://github.com/koobiq/angular-components/commit/f1b873b1a14ebc36c96432cf67997390d4b73b18))
 * bug fix  **sidepanel:** prevent capturing focus on initialization without backdrop ([#DS-3073](https://github.com/koobiq/angular-components/issues/issue/DS-3073)) ([#471](https://github.com/koobiq/angular-components/issues/471)) ([bf0f569](https://github.com/koobiq/angular-components/commit/bf0f569fa80f14157f7814102b8868c10d5b82dc))
 * feature  **docs:** design-tokens page ([#DS-2997](https://github.com/koobiq/angular-components/issues/issue/DS-2997)) ([#468](https://github.com/koobiq/angular-components/issues/468)) ([44f09b4](https://github.com/koobiq/angular-components/commit/44f09b42cdc1d443e986ab996b3fb9e23617fafa))
 * feature  **form-field:** autofill backgrounds ([#DS-2873](https://github.com/koobiq/angular-components/issues/issue/DS-2873)) ([#476](https://github.com/koobiq/angular-components/issues/476)) ([16e43f6](https://github.com/koobiq/angular-components/commit/16e43f66fdd105fa4275265aaf7ef1f8b518ed4e))
 * feature  **markdown:** code with links styles ([#DS-3218](https://github.com/koobiq/angular-components/issues/issue/DS-3218)) ([#473](https://github.com/koobiq/angular-components/issues/473)) ([3605e00](https://github.com/koobiq/angular-components/commit/3605e0067087c7853ff2097b025d29381cc77105))

## 18.9.1 (2024-12-04)

### Koobiq

 * bug fix  **common:** support SSR ([#DS-3147](https://github.com/koobiq/angular-components/issues/issue/DS-3147)) ([#465](https://github.com/koobiq/angular-components/issues/465)) ([c29f62b](https://github.com/koobiq/angular-components/commit/c29f62bd1a5b05bd89fc30dbe2f45775127bed6d))
 * bug fix  **dl:** last element margin ([#DS-3207](https://github.com/koobiq/angular-components/issues/issue/DS-3207)) ([#467](https://github.com/koobiq/angular-components/issues/467)) ([98f76b7](https://github.com/koobiq/angular-components/commit/98f76b7a9eab912adf0f074cfdae0e2633aa3c00))
 * bug fix  **docs,tags:** add missing FormsModule to enable correct tag addition ([#DS-3109](https://github.com/koobiq/angular-components/issues/issue/DS-3109)) ([#461](https://github.com/koobiq/angular-components/issues/461)) ([e81a79d](https://github.com/koobiq/angular-components/commit/e81a79d9f9dfba20a4e9787adb7392fe28e99c0e))
 * bug fix  **file-upload:** link in upload error ([#DS-2971](https://github.com/koobiq/angular-components/issues/issue/DS-2971))  ([#460](https://github.com/koobiq/angular-components/issues/460)) ([d998b89](https://github.com/koobiq/angular-components/commit/d998b8911017ef7a8f8c450762092392e19dd063))
 * bug fix  **form-field:** add missing tokens for hint ([#DS-3188](https://github.com/koobiq/angular-components/issues/issue/DS-3188))  ([#463](https://github.com/koobiq/angular-components/issues/463)) ([c8ad1bc](https://github.com/koobiq/angular-components/commit/c8ad1bc184a0a7eca66696c97becf29e0c65e2c5))
 * bug fix  **forms:** vertical form label padding bottom ([#DS-2717](https://github.com/koobiq/angular-components/issues/issue/DS-2717)) ([#459](https://github.com/koobiq/angular-components/issues/459)) ([b17619e](https://github.com/koobiq/angular-components/commit/b17619e8569570f85a4a734b22b526f5210a4eb4))
 * bug fix  **icon:** changed default icon color ([#DS-3081](https://github.com/koobiq/angular-components/issues/issue/DS-3081)) ([#440](https://github.com/koobiq/angular-components/issues/440)) ([1a0ff5c](https://github.com/koobiq/angular-components/commit/1a0ff5c9514b04dc58ad29aafbe20987514a8735))
 * bug fix  **popover:** footer z-index if shadow ([#DS-3204](https://github.com/koobiq/angular-components/issues/issue/DS-3204))  ([#466](https://github.com/koobiq/angular-components/issues/466)) ([7035c36](https://github.com/koobiq/angular-components/commit/7035c36c5918ff7c000fc6e25b9ff7ec1c3c4256))
 * bug fix  **popover:** header z-index fix ([#DS-3095](https://github.com/koobiq/angular-components/issues/issue/DS-3095)) ([#464](https://github.com/koobiq/angular-components/issues/464)) ([a8b9326](https://github.com/koobiq/angular-components/commit/a8b932650de8d022bdc96eb232964c0032fc5deb))

# 18.9.0 (2024-11-29)

### Koobiq

 * bug fix  **perf:** components tokens usage optimization ([#DS-3117](https://github.com/koobiq/angular-components/issues/issue/DS-3117)) ([#453](https://github.com/koobiq/angular-components/issues/453)) ([d53c76f](https://github.com/koobiq/angular-components/commit/d53c76f195a26b92cbcddcb4ad3895055dd6caaf))
 * bug fix  **select:** customMatcher error ([#DS-3179](https://github.com/koobiq/angular-components/issues/issue/DS-3179)) ([#457](https://github.com/koobiq/angular-components/issues/457)) ([802fc41](https://github.com/koobiq/angular-components/commit/802fc41220aca51e40912cc02d69d8c6e5665169))
 * feature  **code-block:** removed ngx-highlightjs dependency ([#DS-3043](https://github.com/koobiq/angular-components/issues/issue/DS-3043)) ([#455](https://github.com/koobiq/angular-components/issues/455)) ([4a252f8](https://github.com/koobiq/angular-components/commit/4a252f8bc3af231e8c006fcba13ae8141cf854e2))
 * feature  **link:** new icon for external link ([#DS-3020](https://github.com/koobiq/angular-components/issues/issue/DS-3020)) ([#451](https://github.com/koobiq/angular-components/issues/451)) ([1144f99](https://github.com/koobiq/angular-components/commit/1144f99733f19814808874fc40493a3c1a6dea3f))
 * feature  **scrollbar:** removed overlayscrollbars from dependencies ([#DS-2982](https://github.com/koobiq/angular-components/issues/issue/DS-2982)) ([#456](https://github.com/koobiq/angular-components/issues/456)) ([e9aaac1](https://github.com/koobiq/angular-components/commit/e9aaac17db021da4a4ea920fdbb1639540cff3f2))
 * feature  **select:** added support for panel width customization ([#DS-2922](https://github.com/koobiq/angular-components/issues/issue/DS-2922)) ([#447](https://github.com/koobiq/angular-components/issues/447)) ([db0dd2a](https://github.com/koobiq/angular-components/commit/db0dd2a1dbe91a3e319adc2179d1ab15fd5b9495))
 * feature  **visual:** updated border-radius for list components ([#DS-2171](https://github.com/koobiq/angular-components/issues/issue/DS-2171)) ([#454](https://github.com/koobiq/angular-components/issues/454)) ([26ed111](https://github.com/koobiq/angular-components/commit/26ed111f32a90e3e5e3523b92f5e08ef9462c175))
 
# 18.8.99 (2024-11-29)

 * bumped package to 15.10.1
 
# 18.8.11 (2024-11-29)

source code didn't change.

# 18.8.0 (2024-11-26)

### Koobiq

 * bug fix  **chore,schematics:** schematics bundle imports ([#449](https://github.com/koobiq/angular-components/issues/449)) ([1513ea4](https://github.com/koobiq/angular-components/commit/1513ea46a0727fb1ade0027649603f527fe1f418))
 * bug fix  **chore:** updated date-related packages versions ([#DS-3128](https://github.com/koobiq/angular-components/issues/issue/DS-3128)) ([#448](https://github.com/koobiq/angular-components/issues/448)) ([0473a4b](https://github.com/koobiq/angular-components/commit/0473a4b0f816a1e588c404ff554ec9f843c61f4c))
 * bug fix  **common:** unable to get overlay element in shadowRoot ([#DS-3157](https://github.com/koobiq/angular-components/issues/issue/DS-3157)) ([#450](https://github.com/koobiq/angular-components/issues/450)) ([ab6eec4](https://github.com/koobiq/angular-components/commit/ab6eec480c300464fc152d7e6f264399261e28b8))
 * feature  **tabs:** added pagination for KbqTabNavBar ([#DS-3105](https://github.com/koobiq/angular-components/issues/issue/DS-3105)) ([#431](https://github.com/koobiq/angular-components/issues/431)) ([c2c8e30](https://github.com/koobiq/angular-components/commit/c2c8e30cbd96f9d57e2c13af67044e360bd4c0bd))`;

describe(extractReleaseNotes.name, () => {
    beforeEach(() => {
        fs.readFileSync = jest.fn(() => CHANGELOG_CONTENT) as any;
    });

    it('should extract release notes for a version between two other versions', () => {
        const targetVersion = '18.9.1';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toContain(`${targetVersion} (2024-12-04)`);
        expect(result!.releaseNotes).toContain('Koobiq');
        expect(result!.releaseNotes).toContain('**common:** support SSR');
        expect(result!.releaseNotes).toContain('bug fix  **popover:** header z-index fix');
    });

    it('should extract release notes for the latest version', () => {
        const targetVersion = '18.10.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toBe(`# ${targetVersion} (2024-12-11)`);
        expect(result!.releaseNotes).toContain('Cdk');
        expect(result!.releaseNotes).toContain('Koobiq');
        expect(result!.releaseNotes).toContain('* feature  **markdown:** code with links styles');
    });

    it('should extract release notes for the initial version properly', () => {
        const targetVersion = '18.8.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toContain(targetVersion);
        expect(result!.releaseNotes).toContain('Koobiq');
        expect(result!.releaseNotes).toContain('* feature  **tabs:** added pagination for KbqTabNavBar');
    });

    it('should not include notes from other versions', () => {
        const result = extractReleaseNotes('CHANGELOG.md', '18.10.0');

        expect(result!.releaseNotes).not.toContain('18.9.1');
        expect(result!.releaseNotes).not.toContain('* bug fix  **common:** support SSR');
    });

    it('should return null when the version is not found', () => {
        const result = extractReleaseNotes('CHANGELOG.md', '3.0.0');

        expect(result).toBeNull();
    });

    it('should extract properly if release notes contains only simple string', () => {
        const targetVersion = '18.8.11';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toContain(targetVersion);
        expect(result!.releaseNotes).toContain("source code didn't change.");
        expect(result!.releaseNotes).not.toContain('18.8.0');
    });

    it('should extract properly if release notes contains third-party package version bump', () => {
        const targetVersion = '18.8.99';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toContain(targetVersion);
        expect(result!.releaseTitle).not.toContain('15.10.1');
        expect(result!.releaseNotes).toContain('bumped package to 15.10.1');
    });
});
