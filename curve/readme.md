# @lukekaalim/curve

An animation library for @lukekaalim/act

## Guide

### Interpolation

The core of this library is about the interpolation
of values.

The `lerp` function will return an interpolated value
from two inputs, based on a `t`/progress values
from zero to one.

<LerpDemo />

### Vectors

This library contains a few vector types
(`Vector1D`/`Vector2D`/`Vector3D`).

It also defines a interpolation function
for each type, as well as some basic math
operations.

<VectorInterpolateDemo />

Each vector type has a different set 
of functions, but each group of function
is organised into a `VectorAPI` structure -
letting you define functions that can work
across different vector types as long as the
specific VectorAPI is passed as an argument.

<VectorAPIDemo />

### Curves

Each of the vectors can be used to build out
a Bezier curve through the `CurveAPI`.

A Bezier Curve is made of four points - 
a start and end, plus two control points in the
middle.

Much like a linear interpolation, we can get the result
of a point moving across the curve.

<BezierCurveDemo />

### Animation

We can use these curves to drive values more
smoothly than a linear interpolation. Since
the curve can let us control momentum more,
we can define the start and end speed of the
animation.

<CurveAnimationDemo />