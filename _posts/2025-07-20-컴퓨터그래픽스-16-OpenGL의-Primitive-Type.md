---
title: "컴퓨터그래픽스 16. OpenGL의 Primitive Type"
date: "2025-07-20 16:09:44"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

#### OpenGL의 Primitive가 무엇인가?
Primitive는 여러개의 Vertex를 이어서 어떤 도형을 만들건지에 대한 규칙을 정하는 것이다. 같은 정점 데이터여도, Primitive Type에 따라 다른 도형이 그려진다.

```c
glDrawArryas(PRIMITIVE_TYPE, start, count);
```

그릴 때 Primitive Type을 지정할 수 있다.

![Pasted image 20250612141706.png](/assets/img/posts/Pasted image 20250612141706.png){: width="200" .shadow}

**GL_POINTS**는 Vertex를 잇지 않고, 점을 찍는다. 점의 크기는 `gl_PointSize`로 설정 가능하다. 이 함수를 사용하려면 Init 과정에서 둘 중 하나가 활성화 되어야 한다.
- `glEnable(GL_PROGRAM_POINT_SIZE)`
- `glEnable(GL_VERTEX_PROGRAM_POINT_SIZE)`

> [!tip] gl_PointCoord 사용법{title}
> - `glEnable(GL_POINT_SPRITE);`
>   
>   위 기능을 활성화 했다면, Fragment Shader에서 gl_PointCoord를 사용할 수 있다.
> 
> ```glsl
> if (gl_PointCoord.x > 0.5) 
>     discard;
> ```
> 
> 점의 크기가 충분히 크다면, 한 점 내에 여러개의 프래그먼트가 들어갈 수 있다. PointCoord는 점을 기준으로 현재 프래그먼트가 어디 위치에 있는지 나타내는 좌표다. 만약 프래그먼트가 점의 x축 절반보다 오른쪽에 있으면 discard하면 점의 오른쪽은 안그릴 수 있다.
> 
> ```glsl
> vec2 diff = gl_PointCoord - vec2(0.5, 0.5);
> if (length(diff) < 0.5)
>     discard;
> ```
> 
> 만약 중심점으로부터 가까운 쪽을 discard하면, 원의 테두리를 만들 수 있다.

![Pasted image 20250612142803.png](/assets/img/posts/Pasted image 20250612142803.png){: width="500" .shadow}

선을 그리는 세가지 방법이다. Line은 그냥 Vertex가 입력된 순서대로 이어진다. 그 순서를 임의로 정하고 싶다면 Index Buffer를 쓰면 된다.

**GL_LINES**는 두개 정점씩 짝지어서 선분을 그린다.
**GL_LINE_LOOP, GL_LINE_STRIP**의 경우 한 Vertex Buffer 내의 모든 Vertex를 선분으로 잇는다.

![Pasted image 20250612143008.png](/assets/img/posts/Pasted image 20250612143008.png){: width="500" .shadow}

**GL_TRIANGELS**는 세개의 정점씩 짝지어서 삼각형을 만든다.
**GL_TRIANGLE_STRIP**는 (이전 두 정점 + 새 정점) 규칙으로 삼각형을 생성한다.
**GL_TRIANGLE_FAN**은 (첫번째 정점 + 이전 정점 + 새 정점) 규칙으로 삼각형을 생성한다. 위 두개는 Vertex Buffer내의 모든 정점을 이어 붙인다.

> [!example] example{title}
> 
> ![Pasted image 20250612143507.png](/assets/img/posts/Pasted image 20250612143507.png){: width="200" .shadow}
> 
> 만약 위와 같은 모양을 그리려면 어떻게 해야할까? 우선 꼭짓점마다 정점을 생성한다. 이후 한붓 그리기로 그릴 수 있도록 정점 순서를 자 정한다. 이후 GL_TRIANGLE_STRIP을 사용하면 그릴 수 있을 것 같다.