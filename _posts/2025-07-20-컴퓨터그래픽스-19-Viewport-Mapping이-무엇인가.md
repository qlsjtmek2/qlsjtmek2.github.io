---
title: "컴퓨터그래픽스 19. Viewport Mapping이 무엇인가"
date: "2025-07-20 16:09:47"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

#### Viewport Mapping이 무엇인가?

![Pasted image 20250612181235.png](/assets/img/posts/Pasted image 20250612181235.png){: width="250" .shadow}

클립 공간에서 클리핑이 일어나고, 이후 Screen Space로 Vertex가 Mapping된다. **어떻게 화면 공간으로 옮길까?** 우선 화면의 해상도를 알아야 한다. OpenGL에선 추가적으로 Screen의 좌측 하단 좌표인 $$(x,y)$$도 설정 가능하다.

```c
glViewport(0, 0, 1920, 1080);
```

NDC 공간 위의 좌표를 변환하는 공식은 다음과 같다.

$$
X_{screen} = \frac{(X_{NDC} + 1) }{2}\cdot W + x
$$


$$
Y_{screen} = \frac{1 - Y_{NDC}}{2} \cdot H+ y
$$


$$
Z_{buffer} = \frac{Z_{NDC} + 1}{2} \cdot (far - near) + near
$$

NDC 공간은 $$y$$축이 위쪽 방향이 증가하는 방향이지만, OpenGL의 Screen 공간은 $$y$$축이 아래쪽 방향이 증가하는 방향이다. 따라서 $$1-Y_{NDC}$$로 방향을 뒤집는다.