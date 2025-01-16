---
title: "Unity DOTS 5. DOTS와 Entities Package"
date: "2025-01-16 20:04:39"
categories: ["Unity", "DOTS"]
tags: ["DOTS", "ECS", "Entities", "Component", "System", "데이터 지향", "병렬 처리", "Unity"]
math: true
toc: true
comments: true
---

## DOTS

> Entities 1.0.16 기준입니다.

**DOTS(Data-Oriented Technology Stack)** **데이터 지향 기술 스택**이다. 아래 패키지들을 한번에 DOTS라고 부른다.

- **Entities**
- **Entities Graphics**
- **Job System**
- **Unity Physics**
- Havok Physics for Unity
- Netcode for Entities
- Burst^[[Unity DOTS 2. Burst Package](https://qlsjtmek2.github.io/posts/Unity-DOTS-2-Burst-Package/)]
- Collections^[[Unity DOTS 3. Collections Package](https://qlsjtmek2.github.io/posts/Unity-DOTS-3-Collections-Package/)]
- Mathematics^[[Unity DOTS 4. Mathematics Package](https://qlsjtmek2.github.io/posts/Unity-DOTS-4-Mathematics-Package/)]

Job, Burst, Collections, Mathematics 패키지는 꼭 Entites와 같이 사용해야 하는건 아니다. 기존의 Monobehavior에서도 사용 가능하다. Entities와 사용하면 시너지가 좋을 뿐이다.

## Entities

Entities는 ECS의 핵심 패키지다. ECS는 Entity, Component, System의 약자다. 여기서 Entity는 그저 고유 ID를 갖는 Component 집합이다. Compoent도 그저 데이터를 갖는 struct일 뿐이다. ECS에서 모든 기능은 System에서 구현한다. 이렇게 함으로써, **데이터와 로직**이 완전히 **분리**된다.

> 객체 지향은 하나의 객체가 데이터와 메서드를 갖고, 객체 단위로 프로그래밍한다.
> 데이터 지향은 데이터와 로직을 완전히 분리하여, 데이터를 예쁘게 Packing한다.

즉, ECS로 프로그래밍한다는 것은 다음 과정을 반복하는 것입니다.

1. Entity를 생성한다. `(Entity는 고유의 ID를 갖고있음)`
2. Entity에 Component를 부착한다. `(Component = Struct라고 봐도 됨)`
3. System을 작성한다.
	1. 특정 Component를 갖는 Entity들을 찾는다. `(이를 Query한다고 함)`
	2. Query하여 얻은 Data를 사용해 원하는 로직을 구현한다.
4. 가능하면 Burst Compile을 사용하며, 필요한 경우 Job으로 병렬 처리한다. `(Job은 각 객체가 비동기적으로 실행되도 문제 없고 독립적으로 처리해도 문제 없을 때 사용하면 좋다.)`

예를 들어, 다음과 같은 컴포넌트를 정의한다고 가정하자.

```c#
public struct Transform : IComponentData
{
    public float3 Position;
    public float3 Scale;
    public quaternion Rotation;
}

public struct Shooter : IComponentData
{
    public float Damage;
    public float Speed;
}

public struct Monster : IComponentData
{
    public float Health;
}

public struct Player : IComponentData
{
    public float Health;
    public float MoveSpeed;
}
```

또한 다음과 같은 컴포넌트를 갖는 Entity 3개를 만들었다고 가정하자.

```
Entity ID=1
{
    Transform,
    Shooter,
    Monster
}

Entity ID=2
{
    Transform,
    Shooter,
    Monster
}

Entity ID=3
{
    Transform,
    Shooter,
    Player
}
```

시스템에선 그저 Component를 불러와 로직을 작성하면 된다. 

```c#
public partial struct ShooterSystem : ISystem
{
    public void OnUpdate(ref SystemState state)
    {
        foreach (var shooter in SystemAPI.Query<RefRO<Shooter>>())
        {
            var damage = shooter.ValueRO.Damage;
            var speed = shooter.ValueRO.Speed;
            
            /* 이곳에서 로직을 구현한다. */
        }
    }
}
```

## 장단점

- **장점**
	- 기능의 확장이 편리하다. 
		- `그저 Component와 System을 추가하고, Entity에 Component를 부착하기만 하면 된다.`
	- 코드가 독립적이다.
		- `코드 간 의존성이 거의 없다. 따라서 재사용하기 좋다.`
		- `만약 Shooter 기능에 문제가 있다면, ShooterSystem만 체크하면 된다.`
	- 모듈성이 좋으니 테스트도 편리해진다.
	- 데이터의 직렬화 속도가 빨라진다.
		- `FPS와 같이 반응 속도가 중요한 멀티 게임에서 유리하다.`
- **단점**
	- 초기에 학습할 내용이 많다.
	- 국내 학습 자료가 적다.
	- 익숙하지 않다.
		- `기존과는 완전히 다른 스타일의 코드를 작성해야 한다.`
	- 이벤트 드리븐 방식을 사용할 수 없다.
		- `ECS에선 상태 개념이 없기 때문에 상태 변화도 없다.`

## References

- [\[ECS/DOTS #1\] Unity ECS - Entity Component System 베이직 튜토리얼 \[Best Tips & Tricks by Unity Japan\] - YouTube](https://www.youtube.com/watch?v=3m2GI_GSt5Y)
- [Unity ECS로 속도 향상, 캐릭터 5000개 만들어 보기](https://www.youtube.com/watch?v=LVjb_fQs2J8)
- [\[ECS/DOTS #3\] ECS에서 물리 엔진 Unity Physics 사용해 보기 \[Best Tips & Tricks by Unity Japan\] - YouTube](https://www.youtube.com/watch?v=oDKXml53fVQ)
- [Entities overview \| Entities \| 1.0.16](https://docs.unity3d.com/Packages/com.unity.entities@1.0/manual/index.html)
- [GitHub - Unity-Technologies/EntityComponentSystemSamples](https://github.com/Unity-Technologies/EntityComponentSystemSamples?tab=readme-ov-file)
- [ECS : Unity ECS, Unity DOTS (초급 강좌) - YouTube](https://www.youtube.com/watch?v=7UphiG8UtTg)