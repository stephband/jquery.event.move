# jquery.event.move

Move events provide an easy way to set up press-move-release interactions on
mouse and touch devices.

*UPDATE 2.0*: `move` events are now compatible with jQuery 3.x. In addition, the
underlying implementation is rewritten using vanilla DOM (where before it
was jQuery special events only) – jQuery is no longer a requirement. However,
if you do not have jQuery you will require a polyfill for Object.assign to
support older browsers. I can recommend [Object.assign polyfill](https://github.com/cruncher/object.assign) :)

## Demo and docs

[stephband.info/jquery.event.move/](http://stephband.info/jquery.event.move/)

## Move events

### movestart

Fired following mousedown or touchstart, when the pointer crosses a threshold distance from the position of the mousedown or touchstart.

### move

Fired on every animation frame where a mousemove or touchmove has changed the cursor position.

### moveend

Fired following mouseup or touchend, after the last move event, and in the case of touch events when the finger that started the move has been lifted.

## Event parameters

Move event objects are augmented with the properties:

### e.pageX / e.pageY

Current page coordinates of pointer.

### e.startX / e.startY

Page coordinates the pointer had at movestart.

### e.deltaX / e.deltaY

Distance the pointer has moved since movestart.

### e.velocityX / e.velocityY

Velocity in pixels/ms, averaged over the last few events.

## Usage

Use them in the same way as you bind to any other DOM event:

```js
var node = document.querySelector('.mydiv');

// A movestart event must be bound and explicitly
// enabled or other move events will not fire
node.addEventListener('movestart', function(e) {
  e.enableMove();
});

node.addEventListener('move', function(e) {
  // move .mydiv horizontally
  this.style.left = (e.startX + e.distX) + 'px';
});

node.addEventListener('moveend', function() {
  // move is complete!
});
```

Or if you have jQuery in your project:

```js
jQuery('.mydiv')
.on('move', function(e) {
  // move .mydiv horizontally
  jQuery(this).css({ left: e.startX + e.deltaX });
}).bind('moveend', function() {
  // move is complete!
});
```

(`.enableMove()` is a performance optimisation that avoids unnecessarily
sending `move` when there are no listeners. jQuery's special event system
does the work of enabling move events so using jQuery there is no need to
explicitly bind to `movestart`.)

To see an example of what could be done with it, [stephband.info/jquery.event.move/](http://stephband.info/jquery.event.move/)

## CommonJS

If you're using Browserify, or any other CommonJS-compatible module system,
you can require this script by passing it your jQuery reference. For example,

```js
require('./path/to/jquery.event.move.js')();
```

## Tweet me

If you use move events on something interesting, tweet me [@stephband](http://twitter.com/stephband)!
