# Navbar component

## Objectives

-   create the navbar component
-   create child components to get them included into it

## Allowed child components

We strongly recommend adhere to use our child components until it is possible but you are free to insert there what you want.

 - left\right side container **kbq-navbar-section**
   - product\company title **kbq-navbar-brand**
   - logo container **kbq-navbar-logo**
     - any markup
       - **kbq-navbar-title** (please see below)
	 - title **kbq-navbar-title**
	   - any markup, only font size, font color, font family is gonna be styled
	- menu item container **kbq-navbar-item**
	  - icon **[kbq-icon]** (another PT koobiq component, out of the scope of this)
	  - title **kbq-navbar-title**
    - dropdown **[kbq-dropdown]** (another PT koobiq component, out of the scope of this)
	  - any markup
	- any markup
- any markup

## States

We believe you are able to manage navbar child components from outside. Meantime we provide number of kbq-navbar-item states based on css classes which may be combined between each others.

 - kbq-active - selected item
 - kbq-progress - something in progress (striped animation)
 - cdk-focused - focused state, we control it as well for common tab order behaviour
 
Disable state also could be combined with other states but it is **disabled** attribute.

## Collapsing
In the case that absence of space the following elements is collapsed:

-  kbq-navbar-item is collapsed to [kbq-icon] if exists (if not then the item is not collapsed). The title attribute is added for [kbq-icon] from kbq-navbar-item text;
-  kbq-navbar-item is collapsed to [kbq-icon] if exists (if not then the item is not collapsed). 
