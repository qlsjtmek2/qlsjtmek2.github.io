---
title: "컴퓨터그래픽스 6. 데이터를 받은 GPU는 어떤 작업을 하는가 - Pipeline"
date: "2025-07-20 16:00:32"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

### 데이터를 받은 GPU는 무슨 작업을 하는가?
Geometry State 부분에 해당한다.
데이터는 Graphics Pipeline을 타고 내려가서 프레임 버퍼에 쓰여진다. Pipeline이란 Vertex에서 Pixel이 되는 흐름이다. Pipeline 과정을 살펴보자.

![Pasted image 20250401231648.png](/assets/img/posts/Pasted image 20250401231648.png){: .shadow}

위 그림에서 초록색은 프로그래머가 프로그래밍 가능한 부분이다. 노란색은 프로그래밍은 안되지만 옵션을 설정할 수 있다. 빨간색은 수정할 수 없는 부분이다.

Pipeline의 Input으로 Vertex 정보를 입력받는다. 하나의 Vertex는 하나의 파이프라인을 타고 내려간다. Vertex Shader에서 3D 공간 위의 좌표를 2D 클립 공간에 투영(**Projection**)하는 작업을 한다. 

이후 Tessellation, Geometry 등의 과정을 거쳐 Vertex를 늘리거나 줄인다. 2D 공간으로 변환된 Vertex를 Primitive로 묶는 작업을 한다. 만약 Index Buffer가 있으면 이 정보를 보고 Primitive를 만든다. 없다면, Draw 설정 `(Primitive 모양)`과 Vertex 입력 순서를 근거로 Primitive Assemble 작업을 한다. `(대부분의 경우 삼각형으로 Primitive를 만든다.)`

클립 공간에서 카메라 범위 밖의 Vertex는 거르고 `(Clipping)`, 카메라 기준으로 안보이는 면들은 쳐내는 `(Backface culling)` 최적화 작업을 한다. 이후 원근을 나눠 NDC 좌표계로 변환한다. `(Perspective transformation)`

> [!question] 원근을 나눈다는게 무슨 뜻인가?{title}
> 클립 공간은 4차원 동차 좌표계고, NDC는 3차원 직교 좌표계다.
> 프로젝션 행렬을 적용하고 나온 Point는 4번째 성분이 1이 아니고, 원근 정보를 담고 있다.
> 
> $$
> \begin{pmatrix} x_{p} \\ y_{p} \\ z_{p} \\ w\end{pmatrix}
> $$
> 
> 따라서 이를 다음과 같이 나눠 실제 정규화된 좌표 공간으로 옮긴다.
> 
> $$
> \begin{pmatrix} \frac{x_{p}}{w} \\ \frac{y_{p}}{w}\\ \frac{z_{p}}{w}\\ 1\end{pmatrix} \implies \begin{pmatrix} \frac{x_{p}}{w}\\ \frac{y_{p}}{w}\\ \frac{z_{p}}{w}\end{pmatrix}
> $$
> 
> 이때 $$\frac{z_{p}}{w}$$는 깊이 정보를 담고 있어, 나중에 Z-Test에서 활용한다.
> NDC까진 3차원 좌표계고, Viewport 좌표계로 옮기면 진짜 2차원 좌표가 만들어진다.

> [!tip] Backface culling{title}
> Backface culling의 원리는, 카메라를 등지고 있는 면을 Culling하는 것이다. 어떻게 아는가? Face의 법선 벡터와 카메라가 바라보는 방향을 내적했을 때 양수값이 나오는 것으로 판별 가능하다.
> 
> 게임에서 버그로 물체 안을 뚫고 들어갔을 때, 안에선 밖이 보이는 이유가 Backface culling 때문이다. 오브젝트가 닫힌 오브젝트라면, 보통 Face를 한쪽 방향으로만 만들어둔다. 오브젝트 안을 뚫고 들어가면 겉면이 카메라를 등지고 있는 면이 되기 때문에, Backface culling 되어버린다.

NDC 좌표계에서 스크린 좌표계로 변환 한다. 이를 **뷰포트 변환**이라 한다. 이후 **rasterization**을 수행한다. rasterization이란, Primitive `(보통 삼각형)`가 어떤 픽셀을 덮는지 계산하여 **Fragment**들을 생성한다. 

**Fragment란 무엇인가?** 픽셀이 될 수 있는 후보라고 생각하라. Fragment는 삼각형 테두리 뿐만 아니라, 삼각형 내부의 있는 모든 픽셀을 Fragment로 생성한다. Fragment의 정보는 기존 단계에서 넘어온 정보 유형과 동일하게 갖는다. 예를들어 위치, 색깔, 법선벡터, 텍스처 좌표가 기존 단계에서 넘어왔다면, 프래그먼트 또한 위 네개의 정보를 갖는다. 프래그먼트의 정보는 Primitive의 Vertex 정보에서 보간된 값을 사용한다.

Fragment와 Texture 정보는 Fragment Shader에 입력으로 들어간다. `그 전에 Early Z-Test를 진행해서 가려지는 픽셀을 걸러내어 최적화할 수 있다.` Fragment의 각종 정보, 빛, 텍스처 등을 토대로 최종적인 Fragment 색깔을 결정한다.

이후 Z-Test, Alpha Blending `(반투명 처리)`, Anti-aliasing (`계단 현상 완화`) 과정을 거친다. 아까 Z-Test 했는데, 왜 뒤에 또 하는가? 그 이유는, Fragment Shader에서 Z `(깊이)` 값이 변했을 가능성이 있기 때문이다.

마지막으로 필요하면 Post Processing (`후처리`) 적용 후 현재 픽셀 위치에 대응하는 Back Frame Buffer 주소에 저장하면 끝이다.

과정을 한번에 표현하면 다음과 같다.
- Input Vertex -> Vertex Processing `(3D -> 2D Clip Space)` -> (Tessellation -> Geometry) -> Primitive Assemble -> Clipping & Backface culling -> Transformation NDC Coordinate -> Viewport Transform -> Rasterization `(Create Fragment)` -> Fragment Proessing -> Z-Test, Alpha Bleanding, Anti-aliasing, ... -> Output Back Frame Buffer