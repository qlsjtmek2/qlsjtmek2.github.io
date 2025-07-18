---
title: "영상처리 5. Edge detection을 어떻게 할까"
date: "2025-07-18 12:19:16"
categories: ["IT", "영상처리"]
tags: []
math: true
toc: true
comments: true
---

### Edge Detected
**엣지가 무엇인가? 픽셀의 값이 급격하게 변하는 지점이다.** 엣지는 다음과 같은 종류가 있다.
- **Step Edge**: 밝기가 순간적으로 급변하는 가장 이상적인 엣지.
- **Ramp Edge**: 밝기 변화가 점진적으로 일어나는 형태. 가장 많이 보임.
- **Ridge/Roof Edge**: 선이나 가는 객체에서 나타남. 밝기가 급변하고 짧은 거리 내에 다시 원래 거리로 돌아옴.

**엣지를 왜 검출하는가?** 이미지의 불필요한 정보는 없애면서, 핵심적인 구조적 정보를 남기기 위함이다. 이미지의 구성 요소가 무엇인지 알고 싶을 때 사용할 수 있다. 예를들어 자율주행의 경우, 현재 도로의 구성 요소가 무엇이지 파악하는게 가장 1차적으로 해야하는 목표다.

그럼 엣지 검출의 아이디어는 무엇인가? 엣지란 픽셀의 밝기 값이 급격하게 변하는 구간이다. 즉, 미분했을 때 그 값이 큰 구간이 바로 엣지다. 따라서 **미분을 활용한다.**

고전적인 Edge Detected 방법은 세가지가 존재한다.
**(1) Gradient based methods**
Gradient 값이 큰 곳이 바로 엣지다. 이미지는 2차원이다. **2차원 평면에서의 Gradient가 무엇을 의미하는가?** $$\nabla f(x,y)$$는 함수 $$f(x,y)$$의 기울기가 가장 가파른 방향을 가리키는 벡터와 같다.

그러나 우리는 방향 정보는 필요 없고, 임의의 픽셀에서 주변 픽셀들의 변화율이 얼마나 큰지만 알면 된다. 이때 임의의 픽셀이 엣지가 되기 때문이다.

**Gradient를 근사하는 Operator Type은 세가지가 존재한다.**

> [!NOTE] Homogeneity Operators{title}
> 중심 픽셀과, 주변 8개 이웃 픽셀 간의 차이 중 최댓값을 계산한다. 8번의 뺄셈을 해야한다.
> 
> ![Pasted image 20250706181525.png](/assets/img/posts/Pasted image 20250706181525.png){: .shadow}

> [!NOTE] Difference Operators{title}
> 중심 픽셀을 둘러싼 서로 마주보는 픽셀 쌍의 차이 중 최댓값을 계산한다. 4번의 뺄셈만 하면 된다.
> 
> ![Pasted image 20250706181616.png](/assets/img/posts/Pasted image 20250706181616.png){: .shadow}

> [!NOTE] Differential Operators{title}
> Mask를 이용한 컨볼루션 연산이다. 가장 수학적인 미분값에 가깝다.
> 
> **그라디언트를 다음과 같이 근사한다.**
> 
> $$
> \nabla f(x,y) = \begin{pmatrix} G_{x} \\
> G_{y}
> \end{pmatrix}= \begin{pmatrix}
> \frac{\partial f}{\partial x} \\
> \frac{\partial f}{\partial y}
> \end{pmatrix} \simeq \begin{pmatrix}
> f(i+1, j)-f(i,j) \\
> f(i,j+1)-f(i,j)
> \end{pmatrix}
> $$
> 
> x축 방향 기울기는 현재 픽셀과, 바로 오른쪽 픽셀의 차이로 근사한다.
> y축 방향 기울기는 현재 픽셀과, 바로 아래쪽 픽셀의 차이로 근사한다.
> 
> 이를 Mask로 변환하면 다음과 같다.
> 
> $$
> G_{x} \simeq \begin{pmatrix}
> -1 & 1
> \end{pmatrix}, ~~G_{y} \simeq \begin{pmatrix}
> -1 \\
> 1
> \end{pmatrix}
> $$
> 
> 현재 선택된 픽셀은 마스크의 첫번째 셀에 가져다 대면, 근사한 그라디언트 식과 동일한 결과를 얻는다.
> 
> **라플라스 연산은 어떻게 근사할까?** 라플라스는 2차 미분이고, 2차 미분은 **기울기의 기울기**다. 현재 픽셀 $$f(i,j)$$를 기준으로 왼쪽 기울기와, 오른쪽 기울기를 정의해보자.
> 
> $$
> D_{r} = f(i+1,j) - f(i,j), ~~D_{l} = f(i,j) - f(i-1,j)
> $$
> 
> 이 둘의 차이가 기울기의 기울기 즉 2차 미분이다.
> 
> $$
> \frac{\partial^2f}{\partial x^2} \simeq D_{r} - D_{l}
> $$
> 
> 
> $$
> = (f(i+1,j) - f(i,j)) - (f(i,j)-f(i-1,j))
> $$
> 
> 
> $$
> = f(i+1,j) - 2 f(i,j) + f(i-1,j)
> $$
> 
> 이를 Mask로 변환하면 다음과 같다.
> 
> $$
> G_{x} \simeq \begin{pmatrix}
> 1 & -2 & 1
> \end{pmatrix}
> $$
> 
> 
> $$
> G_{y} \simeq \begin{pmatrix}
> 1 \\
> -2 \\
> 1
> \end{pmatrix}
> $$
> 

위 Differential Operators의 아이디어를 확장하여, **고전적인 Gradient based methods에서 사용하는 세가지 Operator가 존재한다.**

핵심은 각 Operator로 $$G_{x},G_{y}$$를 얻는다. 이후 다음을 계산한다.

$$
g = \sqrt{ G_{x}^2 + G_{y}^2 }
$$

그리고 이 $$g$$ 값이 Thresold 값 이상이면, 그 점은 Edge다.

필요한 경우 그라디언트의 각도도 계산 가능하다.

$$
\theta = \tan^{-1}\left( \frac{G_{y}}{G_{x}} \right)
$$

> [!note] Prewitt Operator{title}
> 
> $$
> S_{x} = \begin{pmatrix}
> -1 & 0 & 1 \\
> -1 & 0 & 1 \\
> -1 & 0 & 1
> \end{pmatrix}, ~~ S_{y} = \begin{pmatrix}
> 1 & 1 & 1 \\
> 0 & 0 & 0 \\
> -1 & -1 & -1
> \end{pmatrix}
> $$
> 
> 
> 
![Pasted image 20250706190238.png](/assets/img/posts/Pasted image 20250706190238.png){: width="400" .shadow}

> [!note] Sobel Operator{title}
> 
> $$
> S_{x} = \begin{pmatrix}
> -1 & 0 & 1 \\
> -2 & 0 & 2 \\
> -1 & 0 & 1
> \end{pmatrix}, ~~ S_{y} =  \begin{pmatrix}
> 1 & 2 & 1 \\
> 0 & 0 & 0 \\
> -1 & -2 & -1
> \end{pmatrix}
> $$
> 
> 
> 

> [!note] Roberts Operator{title}
> 
> $$
> S_{x} = \begin{pmatrix}
> 0 & 1 \\
> -1 & 0
> \end{pmatrix}, ~~ S_{y} = \begin{pmatrix}
> 1 & 0 \\
> 0 & -1
> \end{pmatrix}
> $$
> 
> 
> Robert의 경우 연산 단축을 위해 다음 값을 g로 사용한다.
> 
> $$
> g= \lvert G_{x} \rvert + \lvert G_{y} \rvert
> $$
> 

> [!question] What is $$S_{x}, S_{y}$$?{title}
> $$G_{x}, G_{y}$$는 $$f(x,y)$$의 x방향, y방향의 그라디언트와 같다. $$S_{x}, S_{y}$$는 $$G_{x}$$, $$G_{y}$$를 측정하기 위한 도구와 같다. $$S_{x}, S_{y}$$로 그라디언트 값을 근사할 수 있다

> [!example] example{title}
> ![Pasted image 20250706190714.png](/assets/img/posts/Pasted image 20250706190714.png){: .shadow}

**(2) Zero-crossing based methods**

![Pasted image 20250706191050.png](/assets/img/posts/Pasted image 20250706191050.png){: width="350" .shadow}

1차 미분은 '어디까지가 변화율이 큰 값인가?' 를 정해야 하는 문제가 있었다. 그 기준값인 Thresold을 설정해야 했다. 이는 엣지가 너무 두꺼워지는 단점이 있었다.

어차피 엣지는 기울기의 변화량이 가장 큰 지점이다. 이는 2차 미분으로 찾을 수 있다. 기울기가 최대가 되는 지점은, 2차 미분의 Zero crossing 지점과 같다. 이를 Edge로 설정하면, Edge를 한 픽셀로 정확하게 결정localize할 수 있다.

2차 미분을 근사하는 필터는 **Laplacian Operator**이다.

$$
\begin{pmatrix}
0 & 1 & 0 \\
1 & -4 & 1 \\
0 & 1 & 0
\end{pmatrix}
$$

이 마스크를 각 픽셀에 적용 후, 부호가 바뀌는 지점이 바로 Edge와 같다. 그러나 문제가 있다...

**(3) Gaussian based methods**
위 두 방법은 엣지와 노이즈를 구분할 수 없다. 노이즈란 무엇이었는가? 바로 값이 '팍 튀는' 지점이다. 즉, '밝기 변화가 큰 곳'이 엣지인데, 둘을 구분할 수 없다.

따라서 정확한 엣지 검출을 위해, 먼저 스무딩 과정이 필요하다. **1차 미분 전에 가우시안 스무딩을 하는 방법과, 2차 미분 전에 가우시안 스무딩을 하는 방법. 마지막으로 고급 방법까지 세가지 방법을 알아보자.**

> [!NOTE] Derivative of Gaussian{title}
> 1차 미분 전에 가우시안 스무딩을 하는 방법이다. 
> 미분 연산은 컨볼루션이다. 따라서 결합 법칙이 성립한다. 연산을 1회 줄일 수 있다.
> 
> $$
> \frac{\partial}{\partial x} (f * G) = f * \frac{\partial G}{\partial x}
> $$
> 
> $$G$$는 가우시안 Kernel이다.
> 
> $$
> \frac{\partial G}{\partial x}
> $$
> 가 무엇인가? 가우시안 함수는 다음과 같다.
> 
> $$
> G(x,y) = e^{- (x^2 + y^2) / 2 \sigma^2}
> $$
> 
> 이를 $$x$$에 대해 미분하면 다음과 같다.
> 
> $$
> \frac{\partial G}{\partial x} = - \frac{x}{\sigma^2} e^{- (x^2 + y^2) / 2 \sigma^2}
> $$
> 
> 이를 Kernel로 만들기 위해 $$\sigma$$ 파라미터를 정하고, 가운데 값을 $$(x=0,y=0)$$으로 지정하고 각 Cell에 맞는 $$x, y$$ 값을 대입한다. ex) 가운데 윗칸 = $$(1, 0)$$
> 

> [!NOTE] Laplacian of Gaussian (LoG) `(Marr and Hildreth Operator)`{title}
> 2차 미분 전에 가우시안 스무딩을 하는 방법이다. 방법은다음과 같다.
> 1. 가우시안 스무딩 적용
> 2. Laplacian Operator 적용하여 2차 미분값 계산
> 3. 계산한 결과에서 Zero crossing 찾기
> 4. 1차 미분값이 임계값 이상인 Zero crossing만 유효한 엣지로 인정
> 
> 노이즈에 강하다. 라플라시안은 이렇게 활용하면 된다.

> [!NOTE] Canny Edge Operator{title}
> 과정은 다음과 같다.
> 
> 먼저, **(1) 가우시안 스무딩을 적용한다.**
> 이후 **(2) Gradiant의 크기와 방향을 계산한다.**
> 그라디언트 방향을 보고 픽셀 강도가 최대인 픽셀만 남긴다. 이것이 **(3) Non-maximum Suppression** 과정이다.
> 
> ![Pasted image 20250707151419.png](/assets/img/posts/Pasted image 20250707151419.png){: width="150" .shadow}
> 
> 현재 처리중인 픽셀을 p라고 하자. 그라디언트 방향에 따라 바로 앞뒤 픽셀과 비교한다. 자신이 이웃 픽셀보다 큰 경우만 생존하고, 그렇지 않은 경우 엣지로 취하지 않는다. 이 과정을 통해 두꺼운 엣지가 얇은 엣지로 변환된다.
> 
> 높은 임계값과 낮은 임계값을 사용해 확실한 엣지, 엣지 가능성, 엣지가 아닌 것을 구분한다. 높은 임계값 위의 엣지는 확실한 엣지고, 높은 임계값과 낮은 임계값 사이에 있는 엣지는 엣지가 될 가능성이 있는 애들이고, 낮은 임계값보다 낮은 엣지는 버린다. 이를 **(4) Doubole threshold**라고 한다.
> 
> **(5) 이후 애매한 엣지는 확실한 엣지와 연결되어 있을 때만 엣지로 취급한다.** 그렇지 않은 경우 버린다. 이 과정으로 노이즈 떄문에 생긴 가짜 엣지들을 효과적으로 제거할 수 있다.
> 
> (5) 과정에서, 확실한 엣지와 연결되어 있다는 것을 어떻게 판단할 수 있을까? 
> 먼저 확실한 엣지를 찾으면, 그 픽셀을 중심으로 주변 8개의 이웃 픽셀을 확인한다. 그 이웃 픽셀 중 애매한 엣지가 있다면, 그 애매한 엣지를 확실한 엣지로 승격한다. 이 과정을 연쇄적으로 진행하면, 확실한 엣지와 연결되어 있던 모든 애매한 엣지가 확실한 엣지로 확산된다.

##### 어떤 방법을 쓰는게 제일 좋을까?
**Roberts, Prewitt, Sobel**은 매우 빠르고 간단하다. 그러나 노이즈에 취약하고, 엣지가 두껍게 나온다. 노이즈가 거의 없고, 실시간 처리가 중요할 때 사용할 수 있다.

**LoG**는 엣지 위치를 정확하게 찾으며, 위 방법보다는 노이즈에 강하다.

**Canny**는 노이즈에 가장 강하고, 위치가 정확하며, 엣지 연결성 우수하다. 다만 계산양이 가장 많다. 대부분의 응용 분야에서 **standard 방법**으로 인정받는다.

$$
\text{1980년대 후반에 나온 이후로 아무도 이보다 더 나은 것을 만들지 못했다.}
$$
