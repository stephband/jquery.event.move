// jquery.events.move
// 
// 0.1
// 
// Stephen Band
// 
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Event objects passed to the bound handlers are augmented with the
// properties:
// 
// pageX:
// pageY:		Page coordinates of pointer.
// startX:
// startY:	Page coordinates of pointer at movestart.
// deltaX:
// deltaY:	Distance the pointer has moved since movestart.

(function(jQuery, undefined){
	
	var threshold = 4,
			types = ['movestart', 'move', 'moveend'],
			bound = false;
			doc = jQuery(document);
	
	function mousedown(e){
		var elem = jQuery(this),
				start = { x: e.pageX, y: e.pageY };
		
		function checkThreshold(delta, threshold){
			if ((delta.x * delta.x) + (delta.y * delta.y) > (threshold * threshold)) {
				
				checkThreshold = function(delta, threshold) {
					elem.triggerHandler('move', [e, start, delta]);
				};
				
				elem.triggerHandler('movestart', [e, start, {x: 0, y: 0}]);
				elem.triggerHandler('move', [e, start, delta]);
				
				// Bind the handler that will trigger moveend
				doc.bind('mouseup', mouseupend);
			}
		}
		
		function mousemove(e){
			var delta = {
						x: e.pageX - start.x,
						y: e.pageY - start.y
					};
			
			checkThreshold(delta, threshold);
		}
		
		function mouseup(e){
			doc
			.unbind('mousemove', mousemove)
			.unbind('mouseup', mouseup);
		}
		
		function mouseupend(e) {
			var delta = {
						x: e.pageX - start.x,
						y: e.pageY - start.y
					};
			
			doc.unbind('mouseup', mouseupend);
			elem.triggerHandler('moveend', [e, start, delta]);
		}
		
		jQuery(document)
		.bind('mousemove', mousemove)
		.bind('mouseup', mouseup);
	};
	
	function setup( data, namespaces, eventHandle ) {
		var special = jQuery.event.special;
		
		// Setup just once for all three events.
		delete special.movestart.setup;
		delete special.move.setup;
		delete special.moveend.setup;
		
		jQuery(this).bind('mousedown', mousedown);
	}
	
	function teardown( namespaces ) {
		var elem = jQuery(this),
				events = elem.data('events'),
				special = jQuery.event.special;
		
		// If another move event is still setup,
		// don't teardown just yet.
		if (((events.movestart ? 1 : 0) +
				 (events.move ? 1 : 0) +
				 (events.moveend ? 1 : 0)) > 1) { return; }
		
		special.movestart.setup = setup;
		special.move.setup = setup;
		special.moveend.setup = setup;
		
		elem.unbind('mousedown', mousedown);
	}
	
	function add(handleObj) {
	  var handler = handleObj.handler;
	  
	  handleObj.handler = function(e, obj, start, delta) {
	  	e.deltaX = delta.x;
	  	e.deltaY = delta.y;
	  	e.startX = start.x;
	  	e.startY = start.y;
	  	e.pageX = obj.pageX;
	  	e.pageY = obj.pageY;
	  	
	  	// Call the originally-bound event handler and return its result.
	  	return handler.apply(this, arguments);
	  };
	}
	
	// The meat and potatoes
	
	jQuery.event.special.movestart =
	jQuery.event.special.move =
	jQuery.event.special.moveend = {
		setup: setup,
		teardown: teardown,
		add: add
	};
	
})(jQuery);