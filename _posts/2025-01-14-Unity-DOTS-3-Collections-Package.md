---
title: "Unity DOTS 3. Collections Package"
date: "2025-01-14 18:06:00"
categories: ["Unity", "DOTS"]
tags: ["Unmanaged Data", "Native Collection", "Unsafe Collection", "Garbage Collection", "Burst Compiler", "AtomicSafetyHandle", "메모리 관리", "Job 시스템"]
math: true
toc: true
comments: true
---

## What is this?

**관리되지 않는 데이터 구조**를 제공하는 패키지다. 여기서 **관리되지 않는다**는 의미는 Garbage Collection (GC)가 메모리를 자동으로 관리해주지 않는다는 의미다. 따라서 **Unmanaged Data**는 프로그래머가 **메모리를 직접 관리**해야 하는 의무가 있다.

**Native Collection**과 **Unsafe Collection** 두가지 타입이 존재한다. 차이점은 **안전 검사의 유무**이다.

- Native Collection은 **쓰레드 안정성**이 보장된다.
- Native Collection은 인덱스 접근, 메모리 할당 해제 등의 작업을 처리할 때 **안전 검사를 수행**한다.
- Unsafe Collection은 둘다 보장되지 않는다.

Native Collection이 쓰레드에 대해 안전한 이유는 무엇일까? 각 Native Collection마다 마치 **Mutex 변수**^[[시스템 프로그래밍 7. Thread 프로그래밍](https://qlsjtmek2.github.io/posts/%EC%8B%9C%EC%8A%A4%ED%85%9C-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D-7-Thread-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D/)] 역할을 하는 `AtomicSafetyHandle`를 갖는다. `(Collection이 직접 갖고있는건 아님)` Job에서 스케쥴을 예약하면, Job 내에 쓰기 권한이 있는 모든 Native Collection의 `AtomicSafetyHandle`를 Lock한다. 작업을 완료하면 Unlock한다. 다른 Job에서는 Native Collection의 `AtomicSafetyHandle`의 Lock을 시도해서, Lock이 걸리면 작업하고 걸리지 않으면 대기한다.

## Why is it needed?

왜 Unmanaged Collection이 필요한가? **Burst Compiler**^[[Unity DOTS 2. Burst Package](https://qlsjtmek2.github.io/posts/Unity-DOTS-2-Burst-Package/)]를 사용하기 위함이다. Burst Compile은 Managed Data를 지원하지 않는다. 따라서 Unmanaged Data만 사용해야 하고, 이를 위해 Collections, Mathematics과 같은 라이브러리를 제공하는 것이다.

## How to use?

- **Native Collections**
	- `NativeArray`
	- `NativeList`
	- `NativeHashMap`
	- `NativeHashSet`
	- `NativeStream`
	- `NativeQueue`
- **Unsafe Collections**
	- `UnsafeArray`
	- `UnsafeList`
	- `UnsafePtrList`
	- `UnsafeHashMap`
	- `UnsafeHashSet`
	- `UnsafeStream`
	- `UnsafeQueue`
- **Attribute**
	- `[DeallocateOnJobCompletion]`
		- Job 수행이 완료되면 자동으로 메모리 할당을 해제한다.
		- Job의 Field에서 Collection을 정의할 때 사용할 수 있다.
	- `[NativeDisableParallelForRestriction]`
		- 멀티 쓰레드에서 직접 Native Collection에 Write 접근을 허용한다.
		- 일반적으로 Job에서 직접 Write 접근은 허용되지 않고, ParallelWriter 객체를 사용해야 한다.
		- 이 어트리뷰트를 사용해서 Write를 허용하면, 쓰레드 안전성이 보장되지 않는다. 따라서, Race Condition에 대한 책임은 프로그래머에게 있다.
	- `[NativeFixedLength]`
		- Native Collection의 크기가 절대 변경되지 않는다.
	- `[ReadOnly]`
		- Read 전용 Collection을 Job 내에서 사용해도 `AtomicSafetyHandle` Lock을 걸지 않는다.
		- 따라서 확실히 읽기 전용이면 사용을 권장한다.
	- `[WriteOnly]`
- **Allocator** (할당자)
	- `Allocator.Temp`
		- '임시'적으로 사용할 Collection을 할당함.
		- Job에 전달할 수 없음.
		- 1프레임 내에서만 유효함.
		- `Dispose()` 메서드를 사용하지 않아도 프레임이 끝나면 자동으로 할당 해제됨.
	- `Allocator.TempJob`
		- '임시'적으로 사용할 Collection을 할당함.
		- Job에 전달할 수 있음.
		- 전달받은 Job에서 `Dispose()`을 사용하여 할당을 해제해야 한다.
			- 넉넉잡아 4프레임이 제공된다. 4프레임 내에 할당을 해제해야 한다.
			- 그렇지 않으면 Native Collection의 경우 예외가 발생한다.
		- 자동으로 할당이 해제되지 않음.
	- `Allocator.Persistent`
		- 영구적으로 유지됨.
		- 자동으로 할당이 해제되지 않음.
- **Constructor**
	- `NativeList<int> nums = new NativeList<int>(10, Allocator.Temp)`
		- 크기 10의 비어있는 임시 Native 리스트를 생성한다.

사용법은 간단하다. Collection을 동적 생성한다. 사용이 끝나면, `collection.Dispose()` 메서드를 사용해 메모리 할당을 해제하면 된다. `Allocator.Temp` 할당자를 사용해 Collection을 생성한 경우, 자동으로 메모리 할당이 해제되어 `Dispose()`를 생략 가능하다. 하지만 명시적으로 `Dispose()`를 선언하는 것은 좋은 습관이다.

Job에서 Native Collection에 안전하게 Write 작업을 하려면 **ParallelWriter**을 사용해야 한다.

```c#
NativeList<int> nums = new NativeList<int>(1000, Allocator.TempJob);
var job = new MyParallelJob { NumsWriter = nums.AsParallelWriter() };
```

ParallelWriter 객체를 Job에 전달한다.

```c#
public struct MyParallelJob : IJobParallelFor 
{
    public NativeList<int>.ParallelWriter NumsWriter;
    
    public void Execute(int i)
    {
        NumsWriter.AddNoResize(i); 
    } 
}
```

Read는 여러 쓰레드에서 동시에 접근해도 문제 없기 때문에 ParallelReader는 필요 없다.

공식 문서에선 **Native Collection 사용을 권장**한다. 그럼 항상 Native만 사용하면 되냐? 그렇진 않다. Native Collection은 Native Collection을 포함할 수 없다. 따라서, `NativeList<NativeList<T>>`와 같은 사용이 불가능하다. 대신 `NativeList<UnsafeList<T>>`으로 사용해야 한다. 

컨테이너 별 Insert, Delete, Search의 퍼포먼스는 [공식 문서](https://docs.unity3d.com/Packages/com.unity.collections@2.1/manual/performance-comparison-containers.html)에서 확인할 수 있으니, 사용할 때 참고하면 좋을 것 같다.

### References

- [Known issues \| Collections \| 2.1.4](https://docs.unity3d.com/Packages/com.unity.collections@2.1/manual/issues.html)
- [Collections overview \| Collections \| 2.1.4](https://docs.unity3d.com/Packages/com.unity.collections@2.1/manual/collections-overview.html)
- [Unity - Scripting API: AtomicSafetyHandle](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Unity.Collections.LowLevel.Unsafe.AtomicSafetyHandle.html)
- [Unity - Scripting API: NativeArray\<T0\>](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Unity.Collections.NativeArray_1.html)
- [커스텀 네이티브 컨테이너 구현 - Unity 매뉴얼](https://docs.unity3d.com/kr/2022.3/Manual/job-system-custom-nativecontainer.html)
- [Collection types \| Collections \| 2.1.4](https://docs.unity3d.com/Packages/com.unity.collections@2.1/manual/collection-types.html)
- [Collections overview \| Collections \| 2.1.4](https://docs.unity3d.com/Packages/com.unity.collections%402.1/manual/collections-overview.html)
- [Unity Collections Package \| Collections \| 1.0.0-pre.6](https://docs.unity3d.com/Packages/com.unity.collections%401.0/manual/index.html)
- [Unity - Scripting API: DeallocateOnJobCompletionAttribute](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/Unity.Collections.DeallocateOnJobCompletionAttribute.html)