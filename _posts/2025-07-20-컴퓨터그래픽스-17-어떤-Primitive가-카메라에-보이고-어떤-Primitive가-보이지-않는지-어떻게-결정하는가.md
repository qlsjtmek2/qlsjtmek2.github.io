---
title: "컴퓨터그래픽스 17. 어떤 Primitive가 카메라에 보이고, 어떤 Primitive가 보이지 않는지 어떻게 결정하는가"
date: "2025-07-20 16:09:45"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

#### 어떤 Primitive가 카메라에 보이고, 어떤 Primitive가 보이지 않는지 어떻게 결정하는가?
예를들어 거대한 삼각형이 앞에 있고, 작은 삼각형이 뒤에 있다면 작은 삼각형은 거대한 삼각형에 가려져 보이지 않을 것이다. 이를 어떻게 판단하는가?

**(1) Painter's Algorithm (Depth-sorting Method)**
Primitive의 z값을 결정하고, 그 z값 순서대로 Primitive 그릴 순서를 정렬한다. 이후 가장 먼 쪽부터 그려나간다. 이는 프리미티브가 래스터화되기 전에 정렬해야 한다. 이후 Primitive를 Fragment가 변환되고, Fragment를 그리면 자연스럽게 멀리 있는 Fragment가 덮어씌워진다.

단점은 어차피 가려질 거를 쓸데없이 그리게 되어 **연산 낭비가 발생**한다. 또, primitive의 **z값을 어떻게 결정**하는가? 그리고 **만약 두 Primitive가 겹친다면**? 

**(2) Depth-buffer Method**
각 픽셀마다 깊이값을 저장하고, 가장 깊이값이 가까운 픽셀만 그리자. 픽셀의 깊이값을 저장하는 Buffer를 이를 **Z-buffer** 또는 **Depth Buffer**라고 한다.

**아니 어떻게 픽셀의 깊이값을 알 수 있는가?** 일단 정규화 과정을 통해서 각 Vertex의 깊이 값은 자연스럽게 알고 있는 상태다. Primitive Assemble을 해서 Primitive가 만들어진다. Primitive는 각 정점과, 그 정점의 깊이값을 알고 있다. 이후 Rasterization 과정에서 Primitive가 Fragment로 변환된다. 이때 Fragment의 Depth 값을 알고있는 각 정점의 Depth 값으로 보간해서 결정할 수 있다.

Depth Buffer의 크기는 화면 해상도와 동일해야 한다. 현재 Fragment의 위치가 $$(x,y)$$라고 하자. `Zbuffer[x][y]`보다 현재 계산중인 Fragment의 Depth가 더 작으면, Depth Buffer와 Frame Buffer를 업데이트한다. 그렇지 않으면, Fragment를 그리지 않는다. 이 과정이 **Depth Test**다.

단점은.. **결국 계산량은 Painter's Algorithm랑 또이또이한 것 아닌가?** 왜냐하면 Depth Test는 Framgent Processing 과정 이후에 일어나야 한다. Framgment Shader에서 프로그래머에 의해 Depth 값이 변동될 수 있기 때문이다.

또, Z-Buffer는 한 픽셀당 하나의 Fragment만 저장하기 때문에 문제가 발생한다. **투명한 객체가 앞에 있으면, 뒤의 물체가 그려지지 않는다.** 또, **깊이가 거의 차이나지 않으면 어떤 Fragment를 그려야 하는가?** 실제로 이때문에 Z-fighting 문제가 발생한다. `픽셀 깜빡임`

**(3) A-Buffer Method**
따라서 한 픽셀에 여러개의 Fragment의 깊이 정보를 저장해야 위 문제를 해결할 수 있다. 이 Buffer가 **A-Buffer**다. 이때 Fragment의 Color 정보에 Alpha 값이 포함되어야 할 것이다.

픽셀마다 가까운 순서대로 Linked-List 방식으로 저장된다. 이후 Alpha 값을 사용해 색상을 Blending한다.

그러나 **계산 비용이 가장 높다**는게 단점이다.

**(4) Hierarchical Z-Buffer**
**Z-pyramid** 구조를 사용해서 Z-Buffer를 최적화한다고 한다.. Z-pyramid 구조는 Fragment를 계산할 때마다 더 정확하게 업데이트 된다. Z-Buffer를 계층화하며, 낮은 계층은 더 자세한 픽셀의 깊이 정보가 담겨있으며, 높은 계층은 주변의 픽셀을 4개씩 합쳐서 뭉뚱그린 픽셀 깊이 정보가 담겨있다. 높은 계층은 한단계 낮은 계층의 4개 픽셀중 가장 먼 픽셀의 깊이 정보를 저장한다. 이 Buffer는 전역적으로 관리되어야 할 것이다. 이 픽셀 정보를 가지고 Object Space에서 삼각형의 Z값과 Z-pyramid의 Depth 정보를 비교해서 삼각형을 그릴지 말지 결정한다. 삼각형 크기가 다양하므로, 적당한 계층을 선택하는 알고리즘이 존재한다.

---

**정리해보자.** Rasterization 이전의 객체가 Vertex, Prmitive로 존재하는 경우 Objet Space에 있다. Rasterization 이후에 픽셀로 변환되면, Object가 Image Space로 이동한 것이다. 

**Hidden Surface Removal** 방법에는 크게 두가지 방법이 있다.
- Object space method: Depth-Sorting, Backface Culling
- Image space method: Z-Buffer, A-Buffer

일반적으로 오브젝트 공간 방식이 더 빠르고 효율적이다. 권장하는 방식은 **두 방식을 적절히 조합해서 사용하는 것**이다. 오브젝트 공간에서 미리 거르고, 이미지 공간에서 최종적인 처리를 결정한다.

#### 그럼 OpenGL에선 어떻게 쓰고있는데?
Backface Culling 방식으로 Object space에서 1차적으로 거른다. 이후 Depth-buffer로 실제로 화면에 보이는 부분만 렌더링한다.

OpenGL에선 A-Buffer 방법을 지원하지 않는다. A-Buffer는 정확하지만 비용이 비싸서 실시간 그래픽스에서 적합하지 않는다고 한다.

OpenGL에서는 **기본적으로 일반 Z-buffer 방법**을 사용하지만, **현대 GPU 하드웨어에서는 내부적으로 Hierarchical Z-buffer**를 구현하여 성능을 최적화한다. 따라서 개발자는 Z-Buffer처럼 쓰되, 내부적으로 최적화를 한다.

#### 각 방법을 OpenGL에서 어떻게 사용하는데?
OpenGL에선 Z-Buffer 방법을 사용한다. Z-Buffer를 활성화 하려면 INIT 과정에서 다음을 Enable한다.

```c
glEnable(GL_DEPTH_TEST);
```

이후 매 Draw하기 전에 Depth Buffer를 Clear 해줘야 한다.

```c
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
```

투명도를 고려하기 위해선 다음을 활성화 해야한다.

```c
glEnable(GL_ALPHA_TEST);       // 알파 테스트 활성화
glAlphaFunc(GL_GREATER, 0.01); // 알파값이 0.01보다 클 때만 그리기
```