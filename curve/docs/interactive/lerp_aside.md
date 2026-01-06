### Bonus: Implementing Lerp

> The math itself it really easy! Here's a lerp function:
>
> ```ts
> /**
> * @param progress A number from "0" to "1" inclusive!
> */
> function Lerp(start: number, end: number, progress: number) {
>   return ((end - start) * progress) + start;
> }
> ```
> You can kind of break it down three main parts, the first being
>  `end - start`, which is just the
> "distance" between the two points.
>
> The "distance" then gets multiplied by progress ` * progress`: it the Lerp
> has to travel 100 units in total, then at `progress=0`, its gone
> nowhere, by `progress=0.5` it's traveled 50 units, and by `progress=100`
> it will have moved the full 100.
>
> And finally, we push it up to it's starting position with ` + start`,
> so altogether its always moving from wherever start was.