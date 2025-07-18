---
title: "영상처리 8. Geometric Processing을 어떻게 할까"
date: "2025-07-18 12:34:01"
categories: ["IT", "영상처리"]
tags: []
math: true
toc: true
comments: true
---

### Geometric Processing
픽셀의 위치를 변경하여 이미지를 수정하는 기술이다.
이미지 전체를 수정하는 **기본적인 기하학적 변환Basic Geometric Transformation**은 네가지가 있다.

1. **Translation (이동)** : 이미지를 특정 방향으로 이동한다.

$$
\begin{pmatrix}
X \\
Y
\end{pmatrix} = \begin{pmatrix}
x \\
y
\end{pmatrix} + \begin{pmatrix}
x_{0} \\
y_{0}
\end{pmatrix}
$$


2. **Mirroring (미러링)** : 이미지를 뒤집는다.

$$
\text{Mirroring to Y : }\begin{pmatrix}
X \\
Y
\end{pmatrix} = \begin{pmatrix}
- (x-x_{0}) \\
y
\end{pmatrix} + \begin{pmatrix}
x_{0} \\
0
\end{pmatrix}
$$


$$
\text{Mirroring to X : }\begin{pmatrix}
X \\
Y
\end{pmatrix} = \begin{pmatrix}
x \\
-(y-y_{0})
\end{pmatrix} + \begin{pmatrix}
0 \\
y_{0}
\end{pmatrix}
$$


3. **Scaling (크기 조절)** : 확대하거나 축소한다.

$$
\begin{pmatrix}
X \\
Y
\end{pmatrix} = \begin{pmatrix}
S_{x}x \\
S_{y}y
\end{pmatrix}
$$


4. **Rotation (회전)** : 회전한다.

$$
\begin{pmatrix}
X \\
Y
\end{pmatrix} = \begin{pmatrix}
\cos \theta& - \sin \theta \\
\sin \theta& \cos \theta
\end{pmatrix} \begin{pmatrix}
x \\
y
\end{pmatrix}
$$


이동, 회전, 스케일링 등을 일반화한 선형 변환을 Affine Transformation라고 한다. Homogenous Coordinate로 차원을 하나 늘려 Affine Space에서 좌표를 표현하며, 이때 Affine Transformation은 3x3 행렬과 같다.

$$
\text{Translation : }\begin{pmatrix}
1 & 0 & x_{0} \\
0 & 1 & y_{0} \\
0 & 0 & 1
\end{pmatrix}
$$


$$
\text{Scaling : } \begin{pmatrix}
S_{x} & 0 & 0 \\
0 & S_{y} & 0 \\
0 & 0 & 1
\end{pmatrix}
$$


$$
\text{Rotation : } \begin{pmatrix}
\cos \theta & -\sin \theta & 0 \\
\sin \theta & \cos \theta & 0 \\
0 & 0 & 1
\end{pmatrix}
$$

#### Geometry Processing의 문제
두가지 문제가 발생한다.

**(1) 빈 곳이 생기거나, 픽셀이 중첩되는 경우 어떻게 하는가?**
Mapping 전략을 사용한다. 기존의 방법을 **Forward Mapping**이라고 한다. Forward Mapping은 원본 이미지의 픽셀에서 변환 공식을 적용 하고, 계산된 위치에 원본 픽셀의 값을 복사하는 것이다. 이 방법은 빈 구멍이 생기고, 기존의 픽셀 값과 겹칠 가능성이 있다.

이를 해결하기 위해 **Backward Mapping**을 사용한다. 목표 이미지 픽셀에서 시작하여, '이 자리를 채우려면 원본의 어떤 픽셀을 가져와야 할까?' 역으로 계산한다. 목표 이미지의 픽셀에서 역변환 공식 `역행렬`을 적용하고, 계산된 위치의 원본 픽셀 값을 가져온다. 목표 이미지의 모든 픽셀을 빠짐없이 채우기 때문에 빈 공간이 생기지 않는다.

그런데 만약 **역행렬을 적용했는데 원본 이미지에서 벗어난 위치라면?** 미리 지정한 Background Color로 채우는게 표준 해결 방법이다.

**(2) 새로운 위치 계산 결과가 소숫점이면, 어떻게 처리하는가?**
Backward Mapping했을 때 **계산 결과가 소숫점이면, 어떤 픽셀을 가져와야 하는가?** 답은 주변 픽셀들의 정보를 사용하여 보간하여 새로운 픽셀 값을 만들어내는 방법을 사용한다. 

가장 간단한 방법은 계산된 위치에서 가장 가까운 점을 그대로 사용하는 것이다. 이를 **최근접 이웃 보간법Nearest Neighbor Interpolation** 라고 한다. 이는 이미지의 계단 현상이 생기는 단점이 있다.

계산된 위치를 둘러싼 4개의 픽셀값을 거리에 따라 가중 평균하여 새로운 값을 만든다. **이를 쌍선형 보간법Bilinear Interpolation** 라고 한다. 예를들어, 계산된 위치가 $$(10.4, 24.7)$$라고 하자. 이 위치를 둘러싸는 4개의 픽셀은 $$(10, 24), (10, 25), (11, 24), (11,25)$$와 같다. 이 4개의 픽셀 값을 각각 $$Q_{11}, Q_{12}, Q_{21}, Q_{22}$$라고 하자. 가로 방향 거리는 $$dx=0.4$$, 세로 방향 거리는 $$dy=0.7$$이다. 

가중치는 거리에 반비례함을 고려하여 계산한다.

$$
R_{1} = (1-dx)Q_{11} + dxQ_{21}
$$


$$
R_{2} = (1-dx) Q_{12} + dxQ_{22}
$$

$$R_{1}$$은 $$y=24$$일 때, $$R_{2}$$는 $$y=25$$일 때 계산한 픽셀 값이다. 이를 $$y$$에 대해서 보간하면 최종 픽셀 값을 얻을 수 있다.

$$
R = (1-dy)R_{1} + dy R_{2}
$$


B-Spline 등을 사용하여 보간하는 방법도 있다. 이를 **고차 보간법Higher-order Interpolation**라고 한다. 가장 부드럽고 좋지만, 계산 양도 가장 많고 복잡하다.