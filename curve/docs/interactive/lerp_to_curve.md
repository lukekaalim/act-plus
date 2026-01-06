## Linear Interpolation

The basic building block of this animation
library is the "lerp", or the "*L*inear Int*erp*olation".

Lerp is a function that takes two points, a variable for how
"far along" or "progress" (often called just shortened to **t**,
and can be represented as number from `0` to `1`)
you are going, and returns a point somewhere along the way.

Most of the animations on this page are controlled by that value, take a look!

<ProgressBar />

Essentially, by simply slowly change a variable from zero to one,
we can animate another property doing a kind of complex movement
from one state to another!

We might call a property being controlled by such a function as being "driven"
by it. Lerp is just one of the functions in our toolkit, but it's a classic.

See how the point is kinda moving at the same speed the whole time? That's
why it's called Linear, but for real objects they have a bit of heft to them:
it takes them a while to speed up and slow down. So, our [next topic](#next-topic)
will be how we can animate the _speed_ over time as well as the position.