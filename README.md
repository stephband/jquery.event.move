<h1>jquery.event.move</h1>

<p>Move events provide an easy way to set up press-move-release interactions on mouse and touch devices.</p>


<h2 id="what">Move events</h2>

<h3>movestart</h3>
<p>Fired following mousedown or touchstart, when the pointer crosses a threshold distance from the position of the mousedown or touchstart.</p>

<h3>move</h3>
<p>Fired on every animation frame where a mousemove or touchmove has changed the cursor position.</p>

<h3>moveend</h3>
<p>Fired following mouseup or touchend, after the last move event, and in the case of touch events when the finger that started the move has been lifted.</p>

<h2>Event Object</h2>

<p>Event objects passed to the bound handlers are augmented with the properties:</p>

<dl>
  <dt>e.pageX<br/>e.pageY</dt><dd>Current page coordinates of pointer.</dd>
  <dt>e.startX<br/>e.startY</dt><dd>Page coordinates the pointer had at movestart.</dd>
  <dt>e.deltaX<br/>e.deltaY</dt><dd>Distance the pointer has moved since movestart.</dd>
</dl>


<h2 id="how">How to use move events</h2>

<p>Use them in the same way as you normally bind to events in jQuery:</p>

<pre><code class="js">
jQuery('.mydiv').bind('move', function(e) {
	
	// move .mydiv horizontally
	jQuery(this).css({ left: e.startX + e.deltaX });

}).bind('moveend', function() {
	
	// move is complete!

});
</code></pre>


<h2 id="why1">Why not just use mouse or touch events?</h2>

<p>You could, but jquery.event.move abstracts away the details that need attention when writing this kind of interaction model with raw mouse or touch events:</p>

<ul>
	<li>Supports mouse and touch devices, exposing the same event API for both</li>
	<li>Prevents momentary presses triggering interactions (via a movement threshold)</li>
	<li>Throttles moves to animation frames (stopping unneccesary processing and rendering)</li>
	<li>Publishes the distance moved (as part of the move event object)</li>
	<li>Ignores the right mouse button</li>
	<li>Prevents text selection while moving</li>
	<li>Prevents scrolling of touch interfaces while moving</li>
	<li>Stops the interaction while more than one touch is on screen</li>
	<li>Does not stop interaction with form inputs inside moveable nodes</li>
	<li>Suppresses drag and drop events</li>
</ul>


<h2 id="why2">What about drag events?</h2>

<p>They're not really the same thing.</p>

<p>Move events are designed to compliment drag events, where the two have different meanings: drag events are for transferring data while move events are for making responsive interfaces.
That said, <code>movestart</code>, <code>move</code> and <code>moveend</code> events deliberately echo <code>dragstart</code>, <code>drag</code> and <code>dragend</code> events, with one significant difference:
where the <code>drag</code> event fires continuously whether you have moved the pointer or not, the <code>move</code> event fires only after the pointer has been moved.</p>

<p>Where both a <code>dragstart</code> and any move event are bound to the same node, drag events are suppressed.</p>


<h2 id="where">Where is jquery.event.move being used?</h2>

<ul>
	<li><a href="http://www.webdoc.com">webdoc.com</a>, mostly in the editor</li>
</ul>