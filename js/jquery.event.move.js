// jquery.event.move
//
// 0.8
//
// Stephen Band
//
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Move events are throttled to animation frames. Move event objects
// have the properties:
//
// pageX:
// pageY:   Page coordinates of pointer.
// startX:
// startY:  Page coordinates of pointer at movestart.
// deltaX:
// deltaY:  Distance the pointer has moved since movestart.


(function(jQuery, undefined){
	var debug = false;

	var threshold = 3,
			
	    add = jQuery.event.add,
	   
	    remove = jQuery.event.remove,

	    // Just sugar, so we can have arguments in the same order as
	    // add and remove.
	    trigger = function(node, type, data) {
	      jQuery.event.trigger(type, data, node);
	    },

			// Shim for requestAnimationFrame, falling back to timer. See:
			// see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
			requestFrame = (function(){
				return (
					window.requestAnimationFrame ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function(fn, element){
						return window.setTimeout(function(){
							fn(+new Date());
						}, 25);
					}
				);
			})(),
			
			ignoreTags = {
				textarea: true,
				input: true,
				select: true
			},
			
			mouseevents = {
				move: 'mousemove',
				cancel: 'mouseup dragstart',
				end: 'mouseup'
			},
			
			touchevents = {
				move: 'touchmove',
				cancel: 'touchend',
				end: 'touchend'
			};
	
	// Constructors
	
	function Timer(fn){
		var callback = fn,
				active = false,
				running = false;
		
		function trigger(time) {
			if (active){
				callback();
				requestFrame(trigger);
				running = true;
				active = false;
			}
			else {
				running = false;
			}
		}
		
		this.kick = function(fn) {
			active = true;
			if (!running) { trigger(); }
		};
		
		this.end = function(fn) {
			var cb = callback;
			
			if (!fn) { return; }
			
			// If the timer is not running, simply call the end callback.
			if (!running) {
				fn();
			}
			// If the timer is running, and has been kicked lately, then
			// queue up the current callback and the end callback, otherwise
			// just the end callback.
			else {
				callback = active ?
					function(){ cb(); fn(); } : 
					fn ;
				
				active = true;
			}
		};
	}
	
	// Functions
	
	function returnFalse(e) {
		return false;
	}
	
	function preventDefault(e) {
		e.preventDefault();
	}
	
	function preventIgnoreTags(e) {
		// Don't prevent interaction with form elements.
		if (ignoreTags[ e.target.tagName.toLowerCase() ]) { return; }
		
		e.preventDefault();
	}
	
	function identifiedTouch(touchList, id) {
		var i, l;

		if (touchList.identifiedTouch) {
			return touchList.identifiedTouch(id);
		}
		
		// touchList.identifiedTouch() does not exist in
		// webkit yet… we must do the search ourselves...
		
		i = -1;
		l = touchList.length;
		
		while (++i < l) {
			if (touchList[i].identifier === id) {
				return touchList[i];
			}
		}
	}
	

	// Handlers that decide when the first movestart is triggered
	
	function mousedown(e){
		// Respond only to mousedowns on the left mouse button
		if (e.which !== 1) { return; }

		add(document, mouseevents.move, mousemove, e);
		add(document, mouseevents.cancel, mouseend, e);
	}

	function mousemove(e){
		var touchstart = e.data,
		    touch = e;

		checkThreshold(touchstart, touch, undefined, removeMouse);
	}

	function mouseend(e) {
		removeMouse();
	}

	function removeMouse() {
		remove(document, mouseevents.move, mousemove);
		remove(document, mouseevents.cancel, removeMouse);
	}

	function touchstart(e) {
		var t, touch;

		// Don't get in the way of interaction with form elements.
		if (ignoreTags[ e.target.tagName.toLowerCase() ]) { return; }

		t = e.changedTouches[0];
		
		// iOS has a nasty habit of live updating the touch objects, rather
		// than giving us a copy on each move. That means we can't trust the
		// touchstart object to stay the same, so make a clone.
		touch = {
			target: t.target,
			pageX: t.pageX,
			pageY: t.pageY,
			timeStamp: e.timeStamp,
			identifier: t.identifier
		};

		// Use the touch identifier as a namespace, so that we can later
		// remove handlers pertaining only to this touch.
		add(document, touchevents.move + '.' + touch.identifier, touchmove, touch);
		add(document, touchevents.cancel + '.' + touch.identifier, touchend, touch);
	}

	function touchmove(e){
		var touchstart = e.data,
		    touch = identifiedTouch(e.changedTouches, touchstart.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		checkThreshold(touchstart, touch, e.targetTouches, removeTouch);
	}

	function touchend(e) {
		var touchstart = e.data,
		    touch = identifiedTouch(e.changedTouches, touchstart.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		removeTouch(touchstart);
	}

	function removeTouch(touchstart) {
		remove(document, '.' + touchstart.identifier, touchmove);
		remove(document, '.' + touchstart.identifier, touchend);
	}


	// Logic for deciding when to trigger a movestart.

	function checkThreshold(touchstart, touch, touches, fn) {
		var distX = touch.pageX - touchstart.pageX,
		    distY = touch.pageY - touchstart.pageY;

		// Do nothing if the threshold has not been crossed.
		if ((distX * distX) + (distY * distY) < (threshold * threshold)) { return; }

		return triggerStart(touchstart, touch, touches, distX, distY, fn);
	}

	function triggerStart(touchstart, touch, touches, distX, distY, fn) {
		var node = touchstart.target,
		    data, e;

		// Climb the parents of this target to find out if one of the
		// move events is bound somewhere. This is an optimisation that
		// may or may not be good. I should test.
		while (node !== document.documentElement) {
			data = jQuery.data(node, 'events');
			
			// Test to see if one of the move events has been bound.
			if (data && (data.movestart || data.move || data.moveend)) {

				e = {
					type: 'movestart',
					distX: distX,
					distY: distY,
					deltaX: distX,
					deltaY: distY,
					startX: touchstart.pageX,
					startY: touchstart.pageY,
					pageX: touch.pageX,
					pageY: touch.pageY,
					identifier: touchstart.identifier,
					targetTouches: touches
				};

				// Trigger the movestart event, passing the object as data
				// to be used as template for the move and moveend events.
				trigger(touchstart.target, e, e);

				return fn(touchstart);
			}
			
			node = node.parentNode;
		}
	}


	// Handlers that control what happens following a movestart

	function activeMousemove(e) {
		var event = e.data.event,
		    timer = e.data.timer;

		updateEvent(event, e, timer);
	}

	function activeMouseend(e) {
		var event = e.data.event,
		    timer = e.data.timer;
		
		removeActiveMouse();
		endEvent(event, timer, function() {
			// Unbind the click suppressor, waiting until after mouseup
			// has been handled.
			setTimeout(function(){
				remove(e.target, 'click', returnFalse);
			}, 0);
		});
	}

	function removeActiveMouse(event) {
		remove(document, mouseevents.move, activeMousemove);
		remove(document, mouseevents.end, activeMouseend);
	}

	function activeTouchmove(e) {
		var event = e.data.event,
		    timer = e.data.timer,
		    touch = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }
		
		// Stop the interface from gesturing
		e.preventDefault();

		event.targetTouches = e.targetTouches;
		updateEvent(event, touch, timer);
	}

	function activeTouchend(e) {
		var event = e.data.event,
		    timer = e.data.timer,
		    touch = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		removeActiveTouch(event);
		endEvent(event, timer);
	}

	function removeActiveTouch(event) {
		remove(document, '.' + event.identifier, activeTouchmove);
		remove(document, '.' + event.identifier, activeTouchend);
	}


	// Logic for triggering move and moveend events

	function updateEvent(event, touch, timer) {
		event.type = 'move';
		event.distX =  touch.pageX - event.startX;
		event.distY =  touch.pageY - event.startY;
		event.deltaX = touch.pageX - event.pageX;
		event.deltaY = touch.pageY - event.pageY;
		event.pageX =  touch.pageX;
		event.pageY =  touch.pageY;

		timer.kick();
	}

	function endEvent(event, timer, fn) {
		timer.end(function(){
			event.type = 'moveend';

			trigger(event.target, event);
			
			return fn && fn();
		});
	}


	// jQuery special event definition

	function isSetup(events) {
		return ((events.movestart ? 1 : 0) +
		        (events.move ? 1 : 0) +
		        (events.moveend ? 1 : 0)) > 1;
	}

	function setup(data, namespaces, eventHandle) {
		var events = jQuery.data(this, 'events');
		
		// If another move event is already setup, don't setup again.
		if (isSetup(events)) { return; }
		
		// Stop the node from being dragged
		add(this, 'dragstart.move drag.move', preventDefault);
		// Prevent text selection and touch interface scrolling
		add(this, 'mousedown.move touchstart.move', preventIgnoreTags);

		// Don't bind to the DOM. For speed.
		return true;
	}
	
	function teardown(namespaces) {
		var events = jQuery.data(this, 'events');
		
		// If another move event is already setup, don't setup again.
		if (isSetup(events)) { return; }
		
		remove(this, 'dragstart drag', preventDefault);
		remove(this, 'mousedown touchstart', preventIgnoreTags);

		// Don't bind to the DOM. For speed.
		return true;
	}
	
	jQuery.event.special.movestart = {
		setup: setup,
		teardown: teardown,

		_default: function(e, event) {
			var data = {
			      event: event,
			      timer: new Timer(function(time){
			        trigger(e.target, event);
			      })
			    };
			
			if (event.identifier === undefined) {
				// We're dealing with a mouse

				// Stop clicks from propagating during a move
				// Why? I can't remember, but it is important...
				add(e.target, 'click', returnFalse);

				add(document, mouseevents.move, activeMousemove, data);
				add(document, mouseevents.end, activeMouseend, data);
			}
			else {
				add(document, touchevents.move + '.' + event.identifier, activeTouchmove, data);
				add(document, touchevents.end + '.' + event.identifier, activeTouchend, data);
			}
		}
	};
	
	jQuery.event.special.move =
	jQuery.event.special.moveend = {
		setup: setup,
		teardown: teardown
	};

	add(document, 'mousedown.move', mousedown);
	add(document, 'touchstart.move', touchstart);
	
})(jQuery);


// Make jQuery copy touch event properties over to the jQuery event
// object, if they are not already listed. But only do the ones we
// really need.

(function(jQuery, undefined){
	var props = ["changedTouches", "targetTouches"],
	    l = props.length;
	
	while (l--) {
		if (jQuery.event.props.indexOf(props[l]) === -1) {
			jQuery.event.props.push(props[l]);
		}
	}
})(jQuery);