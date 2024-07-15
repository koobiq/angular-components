The dialog is currently divided into 3 modes - `default`, `confirm box`, `custom`.

#### Using service to create Confirm Mode

```ts
showConfirm() {
    this.modalService.success({
        kbqContent   : 'Save changes made to the request "All assets with Windows"?',
        kbqOkText    : 'Save',
        kbqCancelText: 'Cancel',
        kbqOnOk      : () => console.log('OK')
    });
}
```

#### Using service to open modal Custom Mode

```ts
let dialogRef = modalService.open({
    kbqComponent: CustomComponent,
});
```

```ts
@Component({
    /* ... */
})
export class CustomComponent {
    constructor(private dialogRef: KbqModalRef) {}

    closeDialog() {
        this.modal.destroy({ data: 'this the result data' });
    }
}
```
