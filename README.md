<h2>jquery.events.move</h2>

<p>Provides custom events 'movestart', 'move' and 'moveend'. These events behave in a similar way
to 'dragstart', 'drag' and 'dragend', but are intended for building interaction that moves nodes
by position only within the DOM. Move events are throttled to fire on animation frames.</p>

<h3>movestart</h3>
<p>Fired following mousedown, after mousemoves cross a threshold distance from the position of the mousedown. From now until moveend, clicks do not propagate (but if there are click handlers bound to this node they will still fire).</p>

<h3>move</h3>
<p>Fired on every animation frame where a mousemove has changed the cursor position.</p>

<h3>moveend</h3>
<p>Fired following mouseup, after the last move event</p>

<h2>Event Object</h2>

<p>Event objects passed to the bound handlers are augmented with the properties:</p>

<dl>
  <dt>e.pageX<br/>e.pageY</dt><dd>Current page coordinates of pointer.</dd>
  <dt>e.startX<br/>e.startY</dt><dd>Page coordinates the pointer had at movestart.</dd>
  <dt>e.deltaX<br/>e.deltaY</dt><dd>Distance the pointer has moved since movestart.</dd>
</dl>