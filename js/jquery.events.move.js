// jquery.events.move
// 
// 0.4
// 
// Stephen Band
// 
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Move events are throttled to animation frames. Event objects
// passed to handlers have the properties:
// 
// pageX:
// pageY:		Page coordinates of pointer.
// startX:
// startY:	Page coordinates of pointer at movestart.
// deltaX:
// deltaY:	Distance the pointer has moved since movestart.

(function(jQuery, undefined){
	
	var doc = jQuery(document)
			
			threshold = 6,
			
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
			})();
	
	// CONSTRUCTORS
	
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
		};
		
		this.kick = function(fn) {
			active = true;
			if (!running) { trigger(+new Date()); }
		};
		
		this.end = function(fn) {
			var cb = callback;
			
			// If the timer is not running, we want to call just
			// the end callback
			if (!running) {
				fn && fn();
			}
			else if (active) {
				if (fn) {
					callback = function(){
						cb();
						fn();
					};
				}
			}
			else {
				callback = fn || function(){};
				active = true;
			}
		}
	}
	
	// FUNCTIONS
	
	function mousedown(e){
		doc
		.bind('mousemove', e, mousemove)
		.bind('mouseup', mouseup);
	}
	
	function mousemove(e){
		var o = e.data,
				node = o.target,
				deltaX = e.pageX - o.pageX,
				deltaY = e.pageY - o.pageY,
				elem, data;
		
		// Do nothing if the threshold has not been crossed
		if ((deltaX * deltaX) + (deltaY * deltaY) < (threshold * threshold)) { return; }
		
		// Climb the parents of this target.
		while (node !== document.documentElement) {
			elem = jQuery(node);
			data = elem.data('events');
			
			// Test to see if one of the move events has been bound.
			if (data && (data.movestart || data.move || data.moveend)) {
				
				elem.trigger({
					type: 'movestart',
					pageX: e.pageX,
					pageY: e.pageY,
					startX: o.pageX,
					startY: o.pageY,
					deltaX: deltaX,
					deltaY: deltaY
				});
				
				// Note: If movestart is not cancelled, its' functions are
				// bound to doc. By unbinding this function after the trigger,
				// we avoid calling teardown of the mousemove handler(s).
				
				doc
				.unbind('mousemove', mousemove)
				.unbind('mouseup', mouseup);
				
				return;
			}
			
			node = node.parentNode;
		}
	}
	
	function mouseup(e) {
	  doc
	  .unbind('mousemove', mousemove)
	  .unbind('mouseup', mouseup);
	}
	
	
	// !--
	
	function activeMousemove(e) {
		var obj = e.data.obj,
				timer = e.data.timer;
		
		obj.pageX = e.pageX;
		obj.pageY = e.pageY;
		obj.deltaX = e.pageX - obj.startX;
		obj.deltaY = e.pageY - obj.startY;
		
		timer.kick();
	}
	
	function activeMouseup(e) {
		var target = e.data.target,
				obj = e.data.obj,
				timer = e.data.timer;
		
		doc
		.unbind('mousemove', activeMousemove)
		.unbind('mouseup', activeMouseup);
		
		obj.pageX = e.pageX;
		obj.pageY = e.pageY;
		obj.deltaX = e.pageX - obj.startX;
		obj.deltaY = e.pageY - obj.startY;
		
		timer.end(function(){
			obj.type = 'moveend';
			
			target
			.trigger(obj)
			.unbind('click', returnFalse);
		});
	}
	
	function returnFalse(e) {
		return false;
	}
	
	function preventDefault(e){
		e.preventDefault();
	}
	
	function setup( data, namespaces, eventHandle ) {
		var elem = jQuery(this),
				events = elem.data('events');
		
		// If another move event is already setup,
		// don't setup again.
		if (((events.movestart ? 1 : 0) +
				 (events.move ? 1 : 0) +
				 (events.moveend ? 1 : 0)) > 1) { return; }
		
		// Prevent text selection and stop the node from being dragged.
		jQuery(this).bind('mousedown.move dragstart.move drag.move', preventDefault);
	}
	
	function teardown( namespaces ) {
		var elem = jQuery(this),
				events = elem.data('events');
		
		// If another move event is still setup,
		// don't teardown just yet.
		if (((events.movestart ? 1 : 0) +
				 (events.move ? 1 : 0) +
				 (events.moveend ? 1 : 0)) > 1) { return; }
		
		jQuery(this).unbind('mousedown dragstart drag', preventDefault);
	}
	
	
	// THE MEAT AND POTATOES
	
	doc.bind('mousedown.move', mousedown);
	
	jQuery.event.special.movestart = {
		setup: setup,
		teardown: teardown,
		_default: function(e) {
			var target = jQuery(e.target),
					obj = {
						type: 'move',
				  	startX: e.startX,
				  	startY: e.startY,
				  	deltaX: e.pageX - e.startX,
				  	deltaY: e.pageY - e.startY
					},
					timer = new Timer(function(time){
						target.trigger(obj);
					}),
					data = {
						target: target,
						obj: obj,
						timer: timer
					};
			
			// Stop clicks from propagating during a move
			target
			.bind('click', returnFalse);
			
			// Track mouse events
			doc
			.bind('mousemove.move', data, activeMousemove)
			.bind('mouseup.move', data, activeMouseup);
		}
	};
	
	jQuery.event.special.move = {
		setup: setup,
		teardown: teardown
	};
	
	jQuery.event.special.moveend = {
		setup: setup,
		teardown: teardown
	};
})(jQuery);