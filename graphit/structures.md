# Structures

Some common data structures to store/load data
from and display them on graphs.

More useful for a closer-to-realtime scenario, 
as regular arrays will be fine for most data.

`Graphit` has support for rendering each
of these structures.

<TypeDoc project="@lukekaalim/act-graphit" name="Ring" />

> This "Worm" demo generates pairs of random numbers,
> groups them into <Reference key="ts:@lukekaalim/act-curve.Vector2D">Vector2D</Reference>
> pushes them to the <Reference key="ts:@lukekaalim/act-graphit.Ring">Ring</Reference>,
> and then renders the Ring's contents
> as a PolyLine.
>
> You can see the Ring "forgetting" older elements as the line generates
> new ones, but still keeps the elements in the insertion order.


<Demo demo="Worm" />