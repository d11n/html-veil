# HTML Veil

Drop a veil (or more than one) into HTML that obscures and prevents user interactions with content that is behind the veil (e.g. lightboxes and modals).

<br/>

## Installation

```shell
$ yarn add html-veil
```

```shell
$ npm install html-veil --save
```

<br/>

## Basic Usage

```javascript
var Veil = require('html-veil');

var veil = new Veil;
veil.inject(); // Drop the veil into the DOM.
veil.toggle(); // Turn it on and off.
```

The default `z-index` is `1000`. So position HTML elements accordingly. And note that elements behind the veil are obscured and do not respond to user interactions. If desired, the `z-index` can be overridden by passing in an option when constructing a veil.

<br/>

## Basic Options

```javascript
var lightbox_veil = new Veil({
    html_id: 'lightbox-veil',
    color: 'rgba(255, 255, 255, 0.85)',
    z_index: 100,
    });
```

`var veil = new Veil;` (with no options) is the equivalent of:

```javascript
var veil = new Veil({
    html_id: 'veil',
    color: 'rgba(0, 0, 0, 0.7)',
    z_index: 1000,
    });
```

Even though color can easily be set via CSS, it is simpler to set color in JavaScript when no extra CSS styling is needed.

<br/>

## Full JavaScript Interface

```javascript
var Veil = require('html-veil');

// Get the default veil (see "Manipulating an Existing Veil")
Veil.get();

// Destroy the default veil (see "Removing All Traces of a Veil")
Veil.destroy();

// For a veil constructed with { html_id: 'lightbox-veil' }
Veil.get('lightbox-veil');
Veil.destroy('lightbox-veil');

var veil = new Veil;
veil.inject(); // Drop the veil into the DOM
veil.is_activated();
veil.is_deactivated();
veil.activate();
veil.deactivate();
veil.toggle(); // Alternates between veil.activate() and veil.deactivate()
veil.remove(); // Only removes the HTML element from the DOM (i.e. veil.inject() would put it back)
```

<br/>

## Advanced Customization

##### In JavaScript:

```javascript
var modal_veil = new Veil({
    html_id: 'modal-veil',
    z_index: 999,
    });
modal_veil.inject();

var mobile_nav_veil = new Veil({
    html_id: 'mobile-nav-veil',
    z_index: 998,
    });
mobile_nav_veil.inject();
```

##### In CSS:

```css
/*
** All Veils
*/
.html-veil {
    transition-property: opacity, transform !important;
    transition-duration: 0.3s !important;
    transition-timing-function: ease !important;
}
.html-veil-activated {
    opacity: 0.7 !important;
}
.html-veil-changing_state {
    /* rules that apply while a veil is in the process of activating or deactivating */
}

/*
** Modal Veil
*/
#modal-veil {
    background-image: url('/images/bg-blur-texture.png');
    transform: scale(0.95); /* slight zoom-in effect */

}
.modal-veil-activated {
    opacity: 0.9 !important;
    transform: scale(1) !important;
}
.modal-veil-changing_state {}

/*
** Mobile Nav Veil
*/
#mobile-nav-veil {
    background-color: #333333;
    transform: translateX(100%); /* animate in from right */
}
.mobile-nav-veil-activated {
    transform: translateX(0) !important;
}
.mobile-nav-veil-changing_state {}
```

Setting no style rules is the equivalent of:

```css
.html-veil {
    background-color: rgba(0, 0, 0, 0.7);
    position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
    opacity: 0;
    transition-property: opacity;
    transition-duration: 0.5s;
    transition-timing-function: linear;
    transition-delay: 0s;
}
.html-veil.html-veil-activated {
    z-index: 1000;
    opacity: 1;
}
.html-veil.html-veil-changing_state {
    z-index: 1000;
}
```

<br/>

## Manipulating an Existing Veil

##### In `index.js`

```javascript
var Veil = require('html-veil');

// Default veil
var veil = new Veil;
veil.inject();

var lightbox_veil = new Veil({
    html_id: 'lightbox-veil'
    color: 'rgba(51, 51, 51, 0.8)',
    });
lightbox_veil.inject();
```

##### In `nav.js`

```javascript
var Veil = require('html-veil');

// Default veil
var veil = Veil.get();
var nav_icon = document.getElementById('nav-super-menu-icon');
nav_icon && nav_icon.addEventListener('click', handle_nav_icon_click);

var lightbox_veil = Veil.get('lightbox-veil');
var lightbox_images = document.getElementsByClassName('lightbox');
for (var i = 0, n = lightbox_images.length - 1; i <= n; i++) {
    var image = lightbox_images[i];
    if ('img' === image.tagName.toLowerCase() && image.src) {
        image.addEventListener('click', handle_lightbox_image_click);
    }
}

function handle_nav_icon_click() {
    veil.toggle();
    // toggle_nav_menu();
}
function handle_lightbox_image_click(event_) {
    lightbox_veil.toggle();
    if (lightbox_veil.is_activated()) {
        // show_lightbox(event_.target);
    } else {
        // hide_lightbox();
    }
}
```

With modular JavaScript, it is not always obvious whether an expected veil has been constructed/injected yet. Requiring (as a dependency) the module that injects the expected veil may be necessary to guarantee that the veil exists, and can thus be toggled/(de)activated.

<br/>

## Removing All Traces of a Veil

```javascript
var Veil = require('html-veil');

// Default veil
var veil = new Veil;
veil.inject();

var lightbox_veil = new Veil({ html_id: 'lightbox-veil' });
lightbox_veil.inject();

// Remove the HTML elements and all knowledge of the Veil objects
Veil.destroy(); // equivalent to Veil.destroy('veil')
Veil.destroy('lightbox-veil');

// Remove the only remaining references
veil = null;
lightbox_veil = null;

// Let garbage collection take care of the rest
```
