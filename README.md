# jQuery.event.move

Move events provide an easy way to set up press-move-release interactions on mouse and touch devices.

## Install

With npm: `npm install jquery.event.move`

Just import the file `js/jquery.event.move.js`.

## Demo and docs

[stephband.info/jquery.event.move](http://stephband.info/jquery.event.move/)

## Move events

#### `movestart`

Fired following mousedown or touchstart, when the pointer crosses a threshold distance from the position of the mousedown or touchstart.
	
#### `move`

Fired on every animation frame where a mousemove or touchmove has changed the cursor position.
	
#### `moveend`

Fired following mouseup or touchend, after the last move event, and in the case of touch events when the finger that started the move has been lifted.

### Move event objects are augmented with the properties

* `e.pageX`,`e.pageY`: Current page coordinates of pointer.
* `e.startX`,`e.startY`: Page coordinates the pointer had at movestart.
* `e.deltaX`,`e.deltaY`: Distance the pointer has moved since movestart.
* `e.velocityX`,`e.velocityY`: Velocity in pixels/ms, averaged over the last few events.

Use them in the same way as you normally bind to events in jQuery:

```javascript
jQuery('.mydiv')
.bind('movestart', function(e) {
	// move starts.

})
.bind('move', function(e) {
	// move .mydiv horizontally
	jQuery(this).css({ left: e.startX + e.deltaX });

}).bind('moveend', function() {
	// move is complete!

});
```

## Example

[stephband.info/jquery.event.move](href="http://stephband.info/jquery.event.move)

## Tweet me

If you use move events on something interesting, tweet me [@stephband](http://twitter.com/stephband)!