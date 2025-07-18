---
title: "영상처리 3. Area Processing이 무엇인가"
date: "2025-07-18 12:19:16"
categories: ["IT", "영상처리"]
tags: []
math: true
toc: true
comments: true
---

### Area Processing
Point Processing은 본인의 픽셀 값만 사용했다면, Area Processing은 주변 픽셀 값을 사용하여 현재 픽셀 값을 계산한다. **그렇다면 어디까지가 주변이고, 주변 픽셀 값을 어떻게 사용하는가?**

**Mask**`또는 Kernel, Window`를 사용한다. **Mask**란, 작은 가중치 행렬이다. 임의의 한 픽셀을 중심으로 마스크를 설정한다. `때문에 행렬의 크기를 3x3, 5x5와 같이 홀수 크기의 정사각행렬을 사용한다.` 마스크의 각 계수coefficient와, 이에 대응하는 주변 픽셀의 값을 곱하여 모두 더한다. 최종 계산 결과를 해당 픽셀의 새로운 값으로 설정한다.

Area Processing의 일반화된 연산은 다음과 같다.

$$
G[x,y] = \sum_{u=-k}^{k} \sum_{v=-k}^{k} H_{uv}F[i+u, j+v]
$$

이를 **Cross-correlation filtering** 방법이라고 부른다.

> [!NOTE]- Syntex 의미{title}
> $$G[x,y]$$ = 이후 픽셀 결과
> $$F[x,y]$$ = 기존의 픽셀 값
> $$H$$ = Mask 행렬
> $$H$$의 크기 = $$(2k + 1) \times (2k + 1)$$

> [!tip] Convolution filtering?{title}
> Convolution filtering은 Cross-correlation filtering 과정을 수행하기 전에, Kernel을 Filp한다. **Filp**이란, 행렬을 수평과 수직으로 180도 뒤집는 것을 의미한다.
> 
> **왜 뒤집는가?** Convolution 연산은 결합법칙과 분배법칙칙이 성립한다. 반면에 Cross-correlation 연산은 결합법칙이 성립하지 않는다.
> 
> $$
> \text{(이미지 * 필터A) * 필터B = 이미지 * (필터A * 필터B)}
> $$
> 
> 이때 곱셈 연산이 Convolution 연산이다.
> 
> **이를 통해 여러 필터링을 하나의 필터로 합쳐서 연산을 단순화할 수 있다. 때문에 Convolution이 이미지 처리에서 기본 연산으로 사용한다.**
> 
> 만약 Kernel이 상하좌우 대칭 형태라면 Flip해도 동일한 행렬이기 때문에, Convolution와 Cross-correlation 결과는 동일하다.

Area Processing 기법으로 할 수 있는 것은 노이즈 필터링, 이미지 샤프닝, 엣지 검출, 모폴로지 연산이 있다.

#### Noise Filtering
**Noise가 무엇인가?** 영상에서 불필요하게 추가된 잡음이다. **어떤 노이즈들이 있을까?**

> [!NOTE]- Impulse noise, Salt and pepper noise{title}
> 임의로 찍힌 검은색과 흰 점
> 
> ![Pasted image 20250705174209.png](/assets/img/posts/Pasted image 20250705174209.png){: width="200" .shadow}

> [!NOTE]- Gaussian noise{title}
> 가우시안 분포를 따르는 노이즈가 더해져 자글자글하거나 거친 질감.
> 
> ![Pasted image 20250705174143.png](/assets/img/posts/Pasted image 20250705174143.png){: width="200" .shadow}

**Noise를 어떻게 제거할까?** 각 픽셀의 값을 주변 픽셀의 값으로 평균내면 '극단적으로 팍 튀는' 값을 줄일 수 있다. 여기서 '극단적으로 팍 튀는' 값이 바로 노이즈다.

노이즈를 제거하기 위해 사용 가능한 Mask가 세가지가 있다. 이 Mask를 Smoothing Filter라고 부른다.

**(1) Mean Filter**
Kernel의 모든 픽셀을 더하고, 픽셀 개수만큼 나누는 간단한 필터다. 예를들어, Kernel이 $$3\times 3$$ 크기라면 다음과 같다.

$$
\frac{1}{9}\begin{pmatrix}
1 & 1 & 1 \\
1 & 1 & 1 \\
1 & 1 & 1
\end{pmatrix}
$$

RGB 이미지에 Mean Filter를 적용할 땐, R G B 각 채널에 Mean Filter 연산을 수행하면 된다.

**(2) Gaussian Filter**
중심 픽셀에 가장 높은 가중치를 부여하고, 중심에서 멀어질 수록 낮은 가중치를 주는 필터다. 예를들어, Kernel이 $$3\times 3$$ 크기라면 다음과 같다.

$$
\frac{1}{16}\begin{pmatrix}
1 & 2 & 1 \\
2 & 4 & 2 \\
1 & 2 & 1
\end{pmatrix}
$$

Gaussian function은 다음과 같다.

$$
h(u,v) = \frac{1}{2\pi \sigma^2} e^{- (u^2 + v^2) / \sigma^2}
$$

RGB 이미지에 Gaussian Filter를 적용할 땐, Mean Filter와 같이 R G B 각 채널에 Gaussian Filter 연산을 수행하면 된다.

**(3) Median Filter**
커널 내의 픽셀값들을 크기 순으로 정렬 후, 중간에 위치한 중앙값으로 픽셀 값을 대치한다. 예를들어, 3x3 Filter의 경우 9개의 값 중 중앙 값(4번째)의 값을 현재 픽셀 값으로 채택한다.

RGB 이미지에 Median Filter를 적용할 때 각 채널에 독립적으로 Median Filter를 적용하면, 원래 없던 색상을 만들어내버릴 수 있다. 따라서, Vector Median Filter 방법을 사용한다. $$(R, G, B)$$ 값을 하나의 값으로 취급한다. **벡터의 중앙값을 어떻게 정의하는가?** 임의의 벡터와 다른 모든 벡터와의 거리를 계산하고, 이를 합한다. **이 값이 가장 작은 벡터가 바로 Median Vector다.**

위와 같이 다른 모든 값의 차이의 합이 가장 작은 것이 중앙이라는 정의는 합리적이다. 예를 들어, $$\{1, 2, 100\}$$의 중앙 값은 2다. 그리고 1과 다른 모든 값의 차이의 합은 $$1+99=100$$다. 2는 $$1 + 98 = 99$$다. 100은 $$99 + 98 = 197$$이다. 따라서 이 합이 가장 작은 값은 **2**다.

> [!tip]- 이때 거리는 유클리드 거리나, City Block 거리를 사용할 수 있다.{title}

> [!question] Median Filter 연산은 Convolution인가?{title}
> 그렇지 않다. Convolution 연산은 결합 법칙이 적용해야 한다. 그러나 Median Filter는 비선형 연산이므로 결합 법칙이 적용되지 않는다.

##### 무슨 필터가 좋은가?
Mean Filter는 간단하지만, 경계선까지 흐릿하게 만든다. Gaussian Filter는 Mean Filter보다 경계선을 더 잘 보존하면서 노이즈를 잘 제거한다. Median Filter는 **Salt and pepper** 노이즈 제거에 탁월하고, 경계선을 가장 잘 보존해준다. 그러나 Gaussian Noise는 Mean과 Gaussian Filter보다 성능이 떨어질 수 있다.

#### Image Sharpening
Image Sharpening이란, 이미지를 더 선명하게 만드는 방법이다.

![Pasted image 20250705192242.png](/assets/img/posts/Pasted image 20250705192242.png){: width="300" .shadow}

##### **이미지가 선명하다는 것의 정의는 무엇인가?** 
이미지의 선명도는 **해상도resolution**와 **선예도acutance**가 결정한다. 선예도란, 이미지의 경계의 뚜렷한 정도를 뜻한다. 경계가 뚜렷할 수록 영상이 선명하고, 경계선이 희미할 수록 흐릿하다. Image Sharpening은 이 선예도를 높이는 것을 목적으로 한다.

##### **이미지의 경계가 무엇인가?** 
픽셀의 값이 급격하게 변하는 구간이 경계다. 즉, 이미지의 **고주파 성분**과 같다. 고주파 성분이 무엇인가? 주파수를 논하려면 파동이어야 하는 것 아닌가? 

##### **영상에 어떻게 주파수를 도입할까?**
이미지에서의 주파수는 시간에 대한 변화가 아니라, **공간(거리)에 대한 픽셀 밝기 변화율**로 정의한다. 예를 들어, 파동의 주파수는 '시간'에 따라 위상이 얼마나 빠르게 변하는지에 대한 척도다. 영상에서의 주파수는 '공간'에 따라 픽셀의 밝기가 얼마나 급격하게 변하는지에 대한 척도인 것이다.

즉, Image Sharpening의 아이디어는 원본 이미지의 고주파 성분을 계산해, 더해주는는 것이다. 과정은 다음과 같다.
##### How to Image Sharpening?
먼저 고주파 성분을 분리한다.

$$
\text{Highpass} = \text{Original} - \text{Lowpass}
$$

이때 $$\text{Lowpass}$$는 Mean 필터나 Gaussian 필터 등으로 흐릿하게 만든 이미지다.

이후 원본 이미지에 Highpass 성분을 더한다.

$$
\text{High-boost} = (A-1) \cdot \text{Origianl} + \text{Highpass}
$$

이때 $$A$$는 **원본의 비중을 결정하는 계수**다. 1 이상의 값을 설정한다. 이 식은 다음과도 같다.

$$
\text{High-boost} = (A-1) \cdot \text{Origianl} + \text{Original} - \text{Lowpass}
$$


$$
= A \cdot \text{Original} - \text{Lowpass}
$$


이를 Area Processing의 Mask로 표현할 수 있다. **어떻게?** 우선 $$\text{Lowpass}$$는 다음과 같이 표현할 수 있다.

$$
\text{Lowpass} = \text{Original} \times \text{Lowpass}_{mask}
$$

원본 이미지도 마스크로 표현할 수 있다. 중심값만 1이고, 나머지는 0인 행렬을 곱하면 된다.

$$
\text{Original} = \text{Original} \times I_{mask}
$$

$$\text{High-boost}$$ 식에 대입한다.

$$
\text{High-boost} = A \cdot \text{Original} \times I_{mask} - \text{Original} \times \text{Lowpass}_{mask}
$$

$$I$$를 곱하고, $$\text{Lowpass}_{mask}$$를 곱하는 연산은 컨볼루션이다. 따라서 결합, 분배법칙이 성립한다.

$$
= \text{Original} \times (A \cdot I_{mask} - \text{Lowpass}_{mask})
$$

이때 $$I_{mask}$$는 다음과 같다.

$$
\begin{pmatrix}
0 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 0
\end{pmatrix}
$$

$$\text{Lowpass}_{mask}$$를 Mean, Gaussian Mask로 채택할 수 있다. 이미지 샤프닝에선 **Laplacian** Mask를 사용한다.

$$
\begin{pmatrix}
1 & 1 & 1 \\
1 & -8 & 1 \\
1 & 1 & 1
\end{pmatrix}
$$

따라서 $$\text{High-boost}$$ Mask는 다음과 같다.

$$
\text{High-boost}_{mask} = A \cdot I_{mask} - \text{Lowpass}_{mask}
$$


$$
= \begin{pmatrix}
0 & 0 & 0 \\
0 & A & 0  \\
0 & 0 & 0
\end{pmatrix} - \begin{pmatrix}
1 & 1 & 1 \\
1 & -8 & 1 \\
1 & 1 & 1
\end{pmatrix}= \begin{pmatrix}
-1 & -1 & -1 \\
-1 & A+8 & -1 \\
-1 & -1 & -1
\end{pmatrix}
$$

다음과 같은 마스크도 있다.

$$
\begin{pmatrix}
0 & -1 & 0 \\
-1 & A+4 & -1 \\
0 & -1 & 0
\end{pmatrix}
$$
