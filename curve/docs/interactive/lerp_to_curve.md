## Lerp to Curve

The basic building block of this animation
library is the "lerp", or the "**L**inear Int**erp**olation".

Lerp is a function that takes two points, a variable for how
"far along" or "progress" (often called just shortened to **t**,
and can be represented as number from `0` to `1`)
you are going, and returns a point in the middle.

> So, lerping between `0` and `200` as your points,
> and `0.5` as your "t" value, you would get 
> `100` as your result.

