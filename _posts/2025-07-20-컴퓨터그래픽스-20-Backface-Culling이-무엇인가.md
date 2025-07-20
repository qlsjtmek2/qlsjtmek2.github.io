---
title: "컴퓨터그래픽스 20. Backface Culling이 무엇인가"
date: "2025-07-20 16:09:48"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

#### Backface Culling는 무엇인가?

![Pasted image 20250612182641.png](/assets/img/posts/Pasted image 20250612182641.png){: width="400" .shadow}

카메라를 등지는 면은 보통 카메라에 보이지 않는다. 따라서 렌더링에서 제외하면 연산을 많이 줄일 수 있다. **어디까지를 Backface인지 그 기준은 무엇이고, Backface를 어떻게 감지할까?**

만약 면의 법선 벡터를 알고 있다면, 카메라 시선 벡터와 면의 법선벡터가 나란하면 후면일 것이고, 나란하지 않다면 후면이 아닐 것이다. 이는 내적해보면 된다. 내적 결과가 양수면 후면이고, 그렇지 않으면 후면이 아니다.

평면의 법선 벡터를 어떻게 구할까? 삼각형을 구성하는 정점으로 두 벡터를 만들고, 두 벡터를 외적하면 구할 수 있다. 정점으로 만들 수 있는 벡터의 가짓수가 여러가지인데, 벡터를 만드는 기준이 무엇일까?

CW(시계 방향) 또는 CCW(반시계 방향)으로 결정한다. 기본값은 CCW 방향이다. 따라서 반시계 방향으로 벡터를 만든다.

#### Backface Culling을 어떻게 사용하는가?
INIT에서 Backface culling을 활성화 해야한다. 기본값은 비활성화다.

```c
glEnable(GL_CULL_FACE);
glDisable(GL_CULL_FACE);
```

벡터 생성 방향도 정할 수 있다. 기본값은 `GL_CCW`다.

```c
glFrontFace(mode);  // GL_CCW, GL_CW
```

어떤 면을 Culling할건지도 정할 수 있다. 기본값은 `GL_BACK`이다.

```c
glCullFace(mode);  // GL_BACK, GL_FRONT, GL_FRONT_AND_BACK
```