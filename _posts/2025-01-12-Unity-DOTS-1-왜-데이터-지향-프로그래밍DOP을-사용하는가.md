---
title: "Unity DOTS 1. 왜 데이터 지향 프로그래밍(DOP)을 사용하는가"
date: "2025-01-12 18:03:18"
categories: ["Unity", "DOTS"]
tags: ["DOP", "CPU", "메모리", "캐시", "Sparse Set", "Archetype", "데이터 중심 프로그래밍", "캐시 효율성"]
math: true
toc: true
comments: true
---

**DOP (Data Oriented Programming)** 의 등장 배경을 이해하기 위해 CPU와 메모리가 어떻게 데이터를 주고받는지 이해할 필요가 있다.

## CPU

우리가 작성한 코드는 컴파일되면 모두 **CPU가 이해할 수 있는 명령어** 형태로 번역된다. 컴파일 된 **프로그램**을 실행하면, 코드와 데이터들이 메모리에 쓰여진다. 이렇게 메모리에 올라가 실행중인 프로그램을 **프로세스**라고 부른다.

CPU는 계산을 담당하는 **ALU**와, 데이터를 잠시 담아두는 **Register**를 갖고 있다. 여러개의 Register 중엔 **Program Counter (PC)** 라는 것이 존재한다. PC 레지스터는 **다음 실행할 명령어의 메모리 주소**를 가지고 있다. 즉, CPU는 PC 레지스터에 접근하여 명령어를 불러와 수행하고, PC의 값을 1씩 증가하는 방법으로 코드를 한줄씩 실행할 수 있다.

CPU에서 명령어를 수행하기 위해 필요한 데이터는 모두 메모리에 존재한다. CPU는 메모리에 있는 데이터를 바로 사용할 수 없다. 항상 메모리에 있는 데이터는 CPU 내의 레지스터로 불러와야 연산이 가능하다. CPU 연산 자체는 빠르지만, CPU와 Memory 간의 **Bus 연산은 느리다**. 따라서 Bus 연산이 많이 일어날수록 CPU는 제 효율을 낼 수 없다.

```c
int array[50];
int sum;

for (int i = 0; i < 50; i++)
{
    sum += array[i];
}
```

간단한 예제를 살펴보자. 만약 연산을 수행하기 위해 매번 `array[i]`의 메모리 주소에 접근하여 데이터를 불러온다면, 약 50번의 Bus 연산이 발생한다. Bus 연산은 느리므로, 이는 매우 비효율적이다. 이를 **CPU Cache Memory**를 도입하여 해결할 수 있다.

## CPU Cache

![Pasted image 20250112142507.png](/assets/img/posts/Pasted image 20250112142507.png){: .shadow}

아이디어는 다음과 같다. 메모리에서 데이터를 가져올 때, 필요한 데이터만 가져오는 것이 아니라 메모리 주소 주변에 있는 데이터까지 한번에 가져오는 것이다. 가져온 데이터를 CPU 내부에 있는 Cache에 저장한다. CPU에는 L1, L2, L3 캐시가 존재한다. L1 캐시가 제일 빠르고 용량이 작다. L3 캐시가 가장 느리지만 용량이 크다. 

다음 명령어를 실행할 때 바로 메모리에 접근하지 않고, 먼저 캐시에 있는지 확인한다. L1, L2, L3 캐시를 순서대로 확인한다. 캐시에 없다면 그 때 Memory를 확인한다. 위 예제 코드의 경우 Array는 연속된 메모리 주소에 저장되므로, 최대 1번의 Bus 연산으로 줄일 수 있게 되었다.

**캐시 히트(Cache Hit)** 와 **캐시 미스(Cache Miss)** 라는 개념이 있다. CPU가 필요한 데이터를 캐시에서 찾으면 캐시 히트가 발생하고, 찾지 못하면 캐시 미스가 발생한다. 즉 캐시 히트가 많을 수록 CPU의 퍼포먼스는 높아진다.

## Data Oriented Programming

객체 지향 프로그래밍 (OOP) 방식으로 구현하면, Object들이 갖고 있는 데이터들은 힙 메모리 영역에서 산재하게 된다. 데이터가 메모리 상에서 퍼져있다면, 캐시 입장에서는 비효율적이다. 만약 관련된 데이터끼리 모아둔다면 캐시 입장에서 효율적일 것이다.

데이터를 메모리 위에서 어떤 방식으로 모아두는가? Data를 Packing하는 두가지 방법이 존재한다:
- **Sparse Set**
- **Archetype**

### Entity, Component, System

![Pasted image 20250110204612.png](/assets/img/posts/Pasted image 20250110204612.png){: .shadow}

ECS의 핵심 요소 세가지의 의미는 다음과 같다.

- **Entity** : Component의 집합
- **Component** : 데이터
- **System** : 게임 내 모든 Logic

### Sparse Set

Sparse Set는 **같은 컴포넌트를 하나의 배열**로 관리하는 자료구조다. Entity ID를 통해 Entity가 갖는 Component를 Search하는 시간은 $$O(1)$$으로 가능하다.

Sparse Set는 2개의 Array를 갖는다. 
- **Dense Array**: 컴포넌트를 담는 배열
- **Sparse Array**: Entity ID를 Index로 갖고, Dense Array Index를 Value로 갖는 Array

각각의 컴포넌트마다 Sparse Set를 하나씩 갖게 된다. 만약 ID=3인 Entity의 특정 컴포넌트를 찾고 싶다면, 그 컴포넌트의 Sparse Set를 찾는다. Set의 Sparse Array를 통해 Dense Array Index를 얻어내어 컴포넌트를 찾는다. 이 과정이 $$O(1)$$에 수행된다.

Sparse Set에 컴포넌트를 Insert, Delete하는 연산 또한 $$O(1)$$에 수행된다. 따라서 Query가 많을 때 Search, Insert, Delete 연산을 효율적으로 처리 가능하다.

### Archetype

![Pasted image 20250115155021.png](/assets/img/posts/Pasted image 20250115155021.png){: .shadow}

동일한 Component 구조를 갖는 Entity들을 한 덩어리(**Chunk**)로 묶어 **배열**에 저장하는 방식이다. Archetype은 **Chunk**라는 구조로 구현된다. Chunk는 크기가 16KB로 고정되며, 컴포넌트 종류만큼 Array를 갖는 자료구조다. 

> [!question]- 왜 청크의 크기는 16KB인가?{title}
> 청크의 크기가 너무 크면 메모리 낭비가 발생할 수 있고, 청크의 크기가 너무 작으면 캐시 히트의 이점을 받기 힘들다. `(L1 캐시 용량은 대략 (8KB~64KB) 정도이다.)` 이런 점을 고려해서 청크의 크기는 적절히 16KB라는 값을 사용한다.
> 
> - [Why chunk has size 16k? - Unity Engine - Unity Discussions](https://discussions.unity.com/t/why-chunk-has-size-16k/784184)
> - [Why chunk size is 16kb? - Unity Engine - Unity Discussions](https://discussions.unity.com/t/why-chunk-size-is-16kb/920107)

![Pasted image 20250115155338.png](/assets/img/posts/Pasted image 20250115155338.png){: width="300" .shadow}

가로로 같은 Component가 연속적인 Array로 배치되며, 같은 Index에 있는 세로 줄이 하나의 Entity에 해당한다. 한 청크에 많은 엔티티를 넣을 수록 캐시 적중률이 높아진다. 그러기 위해선 컴포넌트 수가 적을 수록 한 청크안에 많은 엔티티가 들어간다. 따라서 **엔티티에는 딱 필요한 컴포넌트만** 갖도록 설계하는 것이 권장된다.

![Pasted image 20250115155611.png](/assets/img/posts/Pasted image 20250115155611.png){: .shadow}

실제 청크는 컴포넌트 삽입, 삭제 비용 최소화를 위해 연결리스트로 구현된다. 개별 청크 내에서만 캐쉬 적중률이 높다.

### Sparse Set vs Archetype

- **Sparse Set**
	- **장점**
		- Entity의 컴포넌트 추가/삭제가 빈번할 때 오버헤드가 적다.
		- 단일 컴포넌트끼리 처리가 효율적이다.
	- **단점**
		- Entity 단위로 쿼리한다면, 데이터가 떨어져 있기 때문에 캐시 효율성이 떨어진다.
		- Entity가 많아질 수록 Array 크기가 커질 수 있다.
	- **Use Cases**
		- Minecraft, Overwatch
- **Archetype**
	- **장점**
		- 다중 컴포넌트를 접근하는데 캐시 효율이 높다.
	- **단점**
		- 엔티티에 동적으로 컴포넌트를 추가/삭제하는 연산의 오버헤드가 높다.
		- 컴포넌트 조합이 매우 다양하면, 하나의 Archetype당 엔티티 수가 적어져 효율이 떨어진다.
	- **Use Cases**
		- V Rising, Unity, Unreal Engine

왜 많은 게임 엔진에서 **Archetype** 방식을 채택하는가? 일반적으로 System에선 여러 컴포넌트를 한번에 Query하는 경우가 많기 때문이다. Sparse Set 방식은 여러 컴포넌트를 한번에 쿼리하면, 컴포넌트가 메모리에서 흩어져 있기 때문에 Cache Miss가 자주 발생한다. Archetype은 엔티티가 갖는 컴포넌트 단위로 데이터가 묶여 있으므로, Cache Hit가 발생할 확률이 높다.

하지만 단점도 존재한다. Archetype은 여러 시너지가 중첩되어 무수히 많은 조합을 만들어내는 게임에선 효율적이지 않다. **로그라이크** 장르가 그 예시다. 로그라이크와 같은 장르는 Player Entity에게 시너지 Component를 추가하거나 삭제할 일이 많다. 따라서, **Sparse Set** 방식을 채택하는 것이 효율적이다.

즉, 두 방식 모두 장단점이 존재하며 **본인 게임 장르에 맞는 Memory Packing 방식**을 사용하면 된다. 하지만 Unity를 사용한다면 선택의 여지가 없다...

### Reference

- [[운영체제] 프로세스와 레지스터(PC, SP)](https://velog.io/@wejaan/%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C-stack-pointer-and-program-counter)
- [[컴퓨터 구조] CPU Cache란 무엇인가](https://chunsubyeong.tistory.com/73)
- [캐시 메모리(Cache Memory)의 원리](https://microelectronics.tistory.com/20)
- [ECS : Unity ECS, Unity DOTS (초급 강좌)](https://www.youtube.com/watch?v=7UphiG8UtTg)
- [Unity ECS로 속도 향상, 캐릭터 5000개 만들어 보기](https://www.youtube.com/watch?v=LVjb_fQs2J8)
- [[Unity] DOTS 시스템과 Unity JobSystem, Burst, ECS 개념](https://usingsystem.tistory.com/539)
- [Sparse Set - GeeksforGeeks](https://www.geeksforgeeks.org/sparse-set/)
- [C# Job System + ECS usage and demo with Intel - Unite LA - YouTube](https://www.youtube.com/watch?v=fp1D45hhVEM)