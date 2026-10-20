describe('toHaveNoViolations', () => {
    let host: HTMLElement;

    // axe-core looks the context up in the document, so every case renders into an element attached to it.
    beforeEach(() => {
        host = document.createElement('div');
        document.body.append(host);
    });

    afterEach(() => host.remove());

    it('passes an element without violations', async () => {
        host.innerHTML = '<button type="button">Save</button>';

        await expect(host).toHaveNoViolations();
    });

    it('fails on a violation, naming the rule and the element', async () => {
        host.innerHTML = '<button type="button"></button>';

        await expect(() => expect(host).toHaveNoViolations()).rejects.toThrow(
            /button-name \(critical\)[\s\S]*at button/
        );
    });

    it('passes a violation through .not', async () => {
        host.innerHTML = '<button type="button"></button>';

        await expect(host).not.toHaveNoViolations();
    });

    // A visible label missing from the accessible name is a label-in-name violation in a browser. Evaluated here,
    // the rule would only report jsdom's missing canvas to the console.
    it('leaves out the rules jsdom cannot render', async () => {
        host.innerHTML = '<button type="button" aria-label="Close the dialog">Save</button>';

        await expect(host).toHaveNoViolations();
    });

    it('refuses an element outside the document', async () => {
        await expect(() => expect(document.createElement('div')).toHaveNoViolations()).rejects.toThrow(TypeError);
    });

    it('refuses markup that is not an element, naming what it got', async () => {
        await expect(() => expect('<button></button>').toHaveNoViolations()).rejects.toThrow(
            /attached to the document, got "<button><\/button>"/
        );
    });
});
