## Transitioning Curves

While we can animate from one point to another fairly
smooly, often another animation may happen as afterwards,
and sometime interrupting our current animation.

In either case, our animation has a bit of "state" when
it might be interrupted, which is it's position and velocity.

When our next animation starts, we want it to respect our
current state. We don't want the animation to start from
nothing, we want it to "inherit" our current velocity
and position, and treat that as it's starting point,
while moving us to our "destination" or "target".