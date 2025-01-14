---
title: "Unity DOTS 4. Mathematics Package"
date: "2025-01-14 21:11:08"
categories: ["Unity", "DOTS"]
tags: ["Unity", "Mathematics", "Unmanaged type", "Vector", "Matrix", "Quaternion", "Random", "DOTS"]
math: true
toc: true
comments: true
---

## What is this?

벡터, 행렬 등 Unmanaged type을 제공한다. 사용하는 이유는 [Unity DOTS 2. Burst Package](https://qlsjtmek2.github.io/posts/Unity-DOTS-2-Burst-Package/)를 참고하라.

## How to use?

```c#
using static Unity.Mathematics.math;
```

Unity Mathematics을 사용하려면 코드에 위와 같이 Import해야 한다. 다음과 같은 Type을 제공한다.

- `typeN`
	- `int3`
	- `float4`
	- ...
- `typeNxN`
	- `int3x3`
	- `int4x4`
	- `float4x4`
	- ...
- `quaternion`

다음과 같은 메서드를 제공한다.

- `min, max, fabs, ...`
- `sin, cos, sqrt, normalize, dot, cross, ...`
- `mul`

두 행렬 간 `*` 연산은 각 요소를 곱하는 연산이다. 행렬 곱을 하기 위해선 `math.mul()` 함수를 사용해야 한다.

```c#
var m1 = new float4x4(1);
var m2 = new float4x4(2);

math.mul(m1, m2);
```

두 벡터간 곱연산은 `*` 으로 가능하다.

```c#
var v0 = new float4(2.0f, 4.0f, 6.0f, 8.0f);
var v1 = new float4(1.0f, -1.0f, 1.0f, -1.0f);
var result = v0 * v1;
```

쿼터니언을  회전하기 위해선 `quaternion.AxisAngle(axis, radians)`을 사용한다. 도를 라디안으로 변환하는 메서드는 `math.radians(angle)`이다.

```c#
var axis = new float3(0.0f, 1.0f, 0.0f); 
var q = quaternion.AxisAngle(axis,math.radians(45.0f)); 
var orientation = quaternion.Euler( math.radians(45.0f), 
                                    math.radians(90.0f),
                                    math.radians(180.0f)); 
var result = math.mul(q, orientation);
```

난수는 `Random` 구조체를 사용할 수 있다. 생성할 때 seed를 넘기면 된다.

```c#
uint seed = 1;
Unity.Mathematics.Random rng = new Unity.Mathematics.Random(seed);

// [0, 1) exclusive
float randomFloat1 = rng.NextFloat(); 

// [-5, 5) exclusive 
float randomFloat2 = rng.NextFloat(-5.0f, 5.0f);
```

## References

- <https://docs.unity3d.com/Packages/com.unity.mathematics@1.3/manual/index.html>