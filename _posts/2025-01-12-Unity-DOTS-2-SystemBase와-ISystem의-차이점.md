---
title: "Unity DOTS 2. SystemBase와 ISystem의 차이점"
date: "2025-01-12"
categories: ["Unity", "DOTS"]
tags: ["SystemBase", "ISystem", "관리형 데이터", "비관리형 데이터", "가비지 컬렉터", "멀티스레딩", "최적화", "Unity"]
math: true
toc: true
comments: true
---

**SystemBase**는 class이고, 관리형 데이터(Managed Data)에 접근할 수 있다. 
**ISystem**은 struct이고, 관리형 데이터에 접근할 수 없다.

## 관리형 데이터(Managed Data)

**관리형 데이터**란 무엇인가? 관리형 데이터란 .NET 환경에서 가비지 컬렉터(Garbage Collector)에 의해 자동으로 메모리가 관리되는 데이터를 의미한다. 일반적인 `class, delegate, string` 등이 이에 해당한다. 참조 타입이며, Heap 메모리 영역에 저장되는 특징이 있다.

다음은 SystemBase를 사용한 예제 코드이다.

```c#
using Unity.Entities;
using Unity.Transforms;

public partial class RotationSystem : SystemBase
{
    protected override void OnUpdate()
    {
        float deltaTime = Time.DeltaTime;

        Entities.ForEach((ref Rotation rotation, in RotationSpeed speed) =>
        {
            rotation.Value = math.mul(math.normalize(rotation.Value),
                                      quaternion.AxisAngle(math.up(), speed.Value * deltaTime));
        }).Schedule();
    }
}
```

- 관리형 데이터를 사용해야 할 때 사용한다.
- 멀티스레딩이 필요 없는 작업에 적합하다.

## 비관리형 데이터(Unmanaged Data)

**비관리형 데이터**란 무엇인가? 가비지 컬렉터가 수집하지 않는 데이터를 의미한다. 즉 개발자가 직접 메모리 관리를 수행해줘야 하거나, Stack 영역에 저장되어 자동으로 할당이 해제되는 데이터가 이에 해당한다. 비관리형 데이터는 다음과 같다.

- `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `nint`, `nuint`, `char`, `float`, `double`, `decimal`, or `bool`
- 모든 `enum` type
- 모든 `pointer` type
- 비관리형 데이터로만 이루어진 `tuple`
- 비관리형 데이터로만 이루어진 `struct`

다음은 ISystem을 사용한 예제 코드이다.

```c#
using Unity.Burst;
using Unity.Entities;
using Unity.Transforms;

public partial struct RotationSystem : ISystem
{
	[BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float deltaTime = SystemAPI.Time.DeltaTime;

        var rotationJob = new RotationJob
        {
            DeltaTime = deltaTime
        };

        rotationJob.ScheduleParallel();
    }
}

public partial struct RotationJob : IJobEntity
{
    public float DeltaTime;

	[BurstCompile]
    public void Execute(ref Rotation rotation, in RotationSpeed speed)
    {
        rotation.Value = math.mul(math.normalize(rotation.Value),
                                  quaternion.AxisAngle(math.up(), speed.Value * DeltaTime));
    }
}
```

- 멀티스레딩, BurstCompile 사용이 가능하다.
- 최적화가 중요한 System에 적합하다.
- 비관리형 데이터만 사용 가능하다.

## Reference

- https://www.youtube.com/watch?v=t2S9-pC05hs