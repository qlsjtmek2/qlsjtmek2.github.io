---
title: "Unity DOTS 2. Burst Package"
date: "2025-01-14 15:27:39"
categories: ["Unity", "DOTS"]
tags: ["Burst", "Compiler", "AOT", "JIT", "Mono", "IL2CPP", "SIMD", "Managed Data", "Unmanaged Data"]
math: true
toc: true
comments: true
---

## What is this?

- **Burst는 마법의 도구인가?**
- **왜 Burst는 빠른가?**
- **기존 Compiler는 무엇이고, 그것이 왜 느린가?**

이를 이해하기 위해서, 기존의 유니티 컴파일 방식에 대한 이해가 필요하다.

### Compilation Method

컴파일 방식에는 크게 AOT 방식과 JIT 방식이 존재한다.

**AOT(Ahead-Of-Time)** 방식은 흔히 알고있는 컴파일 방법과 같다. 실행 전에 모든 코드를 전부 컴파일한다. **JIT(Just-In-Time)** 방식은, 미리 모든 코드를 컴파일해두지 않는다. 코드가 필요하다고 판단되는 시점에 그때그때 컴파일한다. `즉, 코드가 Runtime에서 비동기적으로 컴파일된다.`

왜 JIT과 같은 컴파일 방식이 필요한가? **테스트**하기 위함이다. 만약 Unity의 Play mode를 실행할 때마다 모든 파일을 컴파일 한 뒤 실행하면, 한번 테스트할 때마다 몇 분, 몇십 분이 걸릴 수 있다. 테스트할 땐 굳이 모든 파일을 컴파일할 필요가 없다. 딱 필요한 파일만 컴파일하는 JIT 방식을 사용하면 좋을 것이다. 따라서, 개발 중엔 **JIT** 방식으로 생산성을 챙기고, 최종 빌드는 **AOT** 방식을 사용하는 것을 권장한다.

> [!NOTE] NOTE{title}
> - JIT(Just-In-Time)
> 	- **장점**: Build 시간이 빠르다.
> 	- **단점**: Runtime시 성능이 AOT에 비해 떨어진다.
> - AOT(Ahead-Of-Time)
> 	- **장점**: Runtime 성능이 좋다.
> 	- **단점**: Build 시간이 오래걸린다.

### Mono

![Pasted image 20250114152134.png](/assets/img/posts/Pasted image 20250114152134.png){: .shadow}

Unity 내에서 `Project Settings > Player > Configuration > Scripting Backend`를 보면 두가지 방식이 존재한다. **Mono**가 JIT 방식이고, **IL2CPP**가 AOT 방식이다. 

**Mono**란 C# 코드를 여러 플랫폼에서 구동시키고자 만든 프레임워크다. C#은 .NET Framework에서만 동작하고, 닷넷 프레임워크는 윈도우에서만 구동된다. 따라서 .NET 위에서 실행되는 **Managed Code**를 **Native Code**로 변환하는 중간 어댑터가 필요하다. 그 역할을 하는 것이 Mono다. 컴파일 과정은 다음과 같다.

- `C# > .NET Assembly > (Mono) > Assembly > 기계어`

**.NET Assembly**는 High Level도 아니고, Low Level도 아닌 중간 언어`(IL, Intermediate Language)` 라고 생각하면 된다. .NET에서 C# 코드를 중간 언어(IL)로 변환한다. 크로스 플랫폼을 지원하기 위해선 .NET을 사용할 수 없으므로, 실제 빌드된 파일에는 C# 코드가 아닌 IL 코드와 함께 Mono 프레임워크가 들어있다. Mono는 Runtime으로 필요한 코드를 Native Code로 컴파일한다.

> [!Question] **Managed Code, Native Code?**{title}
> Managed Code는 .NET의 CLR, Java의 JVM과 같은 가상 머신 환경에서 실행되는 코드를 의미한다. 메모리 관리가 GC에 의해 자동으로 이루어진다. Native Code는 가상 머신 환경 없이 프로세서에 의해 직접 실행되는 코드를 의미한다. 
> 
> Virtual Machine을 사용하면 생산성을 챙길 수 있다. 사용하지 않고 직접 Native Code를 작성한다면, 가상 머신 오버헤드가 없으므로 성능이 좋은 코드를 작성할 수 있다.

### IL2CPP

**IL2CPP**는 중간 코드(IL)을 CPP로 변환해주는 컴파일러다. AOT 방식으로 동작한다. 컴파일 과정은 다음과 같다.

- `C# > .NET Assembly > (IL2CPP) > C++ > Assembly > 기계어`

.NET이 생성한 .NET Assembly 코드를 IL2CPP Compiler에 의해 C++로 변환된다. C++ 코드는 Assembly를 거쳐 최종적으로 Binary Code로 컴파일된다. 이 과정은 모두 Runtime 이전에 수행되며, IL2CPP를 사용하여 빌드한 파일은 Binary Code만 포함된다.

> [!question]- C#을 C++로 변환해주면, 변환된 C++ 코드에는 가비지 컬렉터가 없는건가?{title}
> 그렇다면, 굳이 C++로 개발하지 않아도 무조건 C#으로 개발하는 것이 더 좋은 것 아닌가? 왜냐하면 C#을 자동으로 C++으로 변환해주니까.
> 
> **그렇지 않다**. C++로 변환된다고 해서 가비지 컬렉터가 사용되지 않는 것이 아니다. C++에서 구현된 가비지 컬렉터가 메모리를 관리한다. 따라서 C++로 직접 Native Code를 작성하는 것이 C#에서 작성하는 것보다 더 빠르다.

### Burst

원래 주제의 Topic인 **Burst**에 대해서 알아보자. Burst에 대해서 한마디로 정의하면, **Native Code에 한에서 빠르게 실행되는 코드를 만들어내는 컴파일러**로 설명할 수 있다.

위에서 설명한 Mono와 IL2CPP는 Unity에서 사용하는 일반적인 컴파일 방법이다. Brust는 AOT 방식이며, IL2CPP 과정을 거치지 않고 IL에서 바로 Assembly 코드로 변환한다. 컴파일하는 과정은 다음과 같다.

- `C# > .NET Assembly > (Burst) > Assembly > 기계어`

왜 Burst로 생성한 코드는 빠른가?

- **SIMD** 맞춤 코드를 생성한다.
- AMD, Intel 등.. 각각 CPU 아키텍처에 최적화된 코드를 생성한다.

Burst는 기본적으로 **AOT(Ahead-of-Time)** 방식을 사용한다. 그렇다면, Burst Compile로 작성된 코드는 유니티 에디터의 플레이 모드에서 테스트하는게 느리지 않을까? 이를 해결하기 위해 플레이 모드를 실행하면, Mono 방식과 Burst 방식의 Compile을 동시에 진행한다. 플레이 모드가 재생되면 JIT 방식으로 컴파일된 코드가 실행된다. 동시에 Burst가 백그라운드에서 코드를 비동기적으로 컴파일한다. 컴파일이 끝나면, Burst로 Compile한 코드로 대체한다. 요약하면, 플레이 모드에선 **Burst Compile이 완료되기 전까지 Mono 컴파일러로 실행**된다.

> [!question]- What is **SIMD**?{title}
> **SIMD(Single Insturction Multiple Data)** 는 한번의 명령어로 여러개의 데이터를 한번에 처리하는 기술이다. 대부분의 최신 CPU에는 SIMD를 처리할 수 있는 아키텍처가 탑재되어 있다.
> 
> 예를들어, Vector4과 같은 자료형은 덧셈을 한번 하면 덧셈이 총 4번 발생한다.
> 
> ```c#
> vec1.x + vec2.x
> vec1.y + vec2.y
> vec1.z + vec2.z
> vec1.w + vec2.w
> ```
> 
> SIMD 기술은 벡터의 속성을 묶어서 한번의 연산만으로 계산할 수 있게 해준다. 이는 벡터, 행렬 연산 최적화에 용이하다.
> 
> ![simd_1.jpg](/assets/img/posts/simd_1.jpg){: .shadow}
> 

## Why is it needed?

왜 Burst Compiler를 사용해야 하는가?

- **빠르다.**
- 플랫폼별 최적화가 필요하지 않다.
- 플랫폼 전반에 걸쳐 일관된 성능을 제공한다.

그렇다면, 항상 Burst Compile을 쓰면 좋은 것 아니냐? 그렇진 않다. Burst Compile은 Native Code만 컴파일 가능하다. 즉, **관리되지 않는 데이터**만 사용해야 한다. 이는 일부 기능이나 자료형을 사용할 수 없음을 의미하며, 메모리를 직접 관리해야 하는 불편함이 있다. `예를 들어, class 대신 struct를, List 대신 NativeList를, Vector3 대신 float3을 사용해야 한다.`

요약하면, Burst Compile은 **생산성을 내어주고 성능을 취하는 방법**이라고 생각할 수 있다.

### Managed Data

**관리형 데이터**란 무엇인가? 관리형 데이터란 .NET 환경에서 가비지 컬렉터(Garbage Collector)에 의해 자동으로 메모리가 관리되는 데이터를 의미한다. 일반적인 `class, delegate, string` 등이 이에 해당한다. 참조 타입이며, Heap 메모리 영역에 저장되는 특징이 있다.

### Unmanaged Data

**비관리형 데이터**란 무엇인가? 가비지 컬렉터가 수집하지 않는 데이터를 의미한다. 즉 개발자가 직접 메모리 관리를 수행해줘야 하거나, Stack 영역에 저장되어 자동으로 할당이 해제되는 데이터가 이에 해당한다. 비관리형 데이터는 다음과 같다.

- `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `nint`, `nuint`, `char`, `float`, `double`, `decimal`, or `bool`
- 모든 `enum` type
- 모든 `pointer` type
- 비관리형 데이터로만 이루어진 `tuple`
- 비관리형 데이터로만 이루어진 `struct`

## How to use?

- `[BurstCompile]`
	- `[BurstCompile(CompileSynchronously = true)]`
- `[BurstDiscard]`

사용법은 간단하다. struct 또는 method의 attribute로 `[BurstCompile]`를 붙이면 된다. 다만 위에서 설명한 **Unmanaged Data**만 사용해야 한다는 제약조건을 지켜야 한다.

만약 BurstCompile Attribute를 갖는 struct 내에서 예외적으로 Burst를 적용하고 싶지 않은 메서드가 존재할 수 있다. 그 경우, 메서드에 `[BurstDiscard]`를 붙이면 된다. 주의할 점으로 `[BurstDiscard]`를 사용하는 메서드는 반환 타입을 가지면 안된다. 예제 코드는 다음과 같다.

```c#
[BurstCompile] 
public struct MyJob : IJob 
{ 
    public void Execute() 
    { 
        // 전체 .NET 런타임에서 실행될 때만 실행됩니다. 
        // 이 메서드 호출은 [BurstCompile] 특성으로 
        // 이 작업을 컴파일할 때 제외됩니다.
        MethodToDiscard();
    }

    [BurstDiscard] 
    private static void MethodToDiscard(int arg) 
    {
        Debug.Log($"This is a test: {arg}"); 
    }
}
```

`Execute()` 메서드는 Burst로 Compile된다. 하지만 그 내부에 `MethodToDiscard()`를 호출하고 있는데, 이 메서드는 Burst Compile을 적용하지 않는다. 이런 경우 어떻게 되는가? Burst Compile 과정에서 `MethodToDiscard()` 메서드는 제외된다.

만약 BurstCompile으로 인해 성능이 얼마나 빨라지는지 프로파일링하고 싶을 땐, `[BurstCompile(CompileSynchronously = true)]`를 사용하면 된다. Burst Compile를 Play mode에서 실행할 땐 먼저 Mono로 컴파일된 결과가 실행되고, 비동기적으로 Burst Compile이 진행되어 나중에 그 결과가 반영된다. 이 어트리뷰트를 사용하면, Burst Compile이 동기적으로 실행되기 때문에 바로 Burst Compile 결과를 확인할 수 있다.

## References

- <https://programmingdev.com/mastering-unity-performance-optimization-with-c-burst-compiler-a-comprehensive-guide/>
- <https://docs.unity3d.com/Packages/com.unity.burst@1.8/manual/index.html>
- <https://docs.unity3d.com/2020.3/Documentation/Manual/Mono.html>
- <https://www.youtube.com/watch?v=ZuzBOXUuEeM>
- <https://www.youtube.com/watch?v=-9X965jXrn8>
- <https://yuu5666.tistory.com/215>
- <https://gus6615.tistory.com/104>
- <https://docs.unity3d.com/Packages/com.unity.burst%401.8/manual/compilation-overview.html>
- <https://docs.unity3d.com/Packages/com.unity.burst@1.8/manual/compilation-burstdiscard.html>
- <https://docs.unity3d.com/Packages/com.unity.burst@1.8/manual/compilation-synchronous.html>
- <https://stonzeteam.github.io/SIMD-%EB%B3%91%EB%A0%AC-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D/>