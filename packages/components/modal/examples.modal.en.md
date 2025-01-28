### Custom Injector for Modal Component

When you need to use component-level services within dynamically created modal components, include information about the current `injector` instance.  
To achieve this, pass the `injector` instance from the parent component as an argument to the `modalService.open` method.
This ensures proper behavior and access to the required dependencies.

<!-- example(modal-component-with-injector) -->
