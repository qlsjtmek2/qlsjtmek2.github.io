---
title: "영상처리 1. Image Processing이 무엇인가"
date: "2025-07-18 12:18:34"
categories: ["IT", "영상처리"]
tags: []
math: true
toc: true
comments: true
---

## 영상처리가 무엇인가?
**영상처리**란, 이미지의 품질을 높이는 **전처리** 과정이다.
사람이 사물을 보고 특징을 파악하듯, 컴퓨터가 영상처리된 이미지를 보고 그 영상의 특징을 이해하도록 연구하는 분야가 **컴퓨터 비전**이다.

### 영상 처리 기술로 할 수 있는 것들이 무엇인가?
영상처리를 배우면 다음과 같은 것을 할 수 있게 된다.
1. 영상 품질 개선 및 복원 (Image Enhancement & Restoration)
	1. **명암 개선**
	2. **노이즈 제거**
	3. **이미지 뚜렷하게**
	4. **색상 보정**
	5. **왜곡 보정**
2. 영상 분석 및 특징 추출 (Image Analysis & Feature Extraction)
	1. **엣지 검출**
	2. **영역`(객체, 배경)` 분할**
	3. **특징`(특정 영역의 색상, 질감, 모양 등.)` 추출**
3. 영상 변환 및 압축 (Image Transformation & Compression)
	1. 주파수 변환
		- `이미지를 공간 영역에서 주파수 영역으로 푸리에 변환하여 특정 주파수를 제거하거나 강조하는 방법으로 이미지를 개선하는 아이디어. `
	2. **영상 압축**
4. 영상 이해 및 인식 (Image Understanding & Recognition)
	1. **객체 탐지**
	2. **얼굴 인식**
	3. **문자 인식**
	4. **동영상 속 움직임 인식**

## 영상(Image)이 무엇인가?
**영상(Image)** 이란, 현실 세계의 장면을 디지털 정보로 변환하여 컴퓨터가 인식할 수 있도록 만든 데이터다.

컴퓨터는 영상을 2차원 함수 $$f(x,y)$$로 인식한다. $$(x,y)$$는 이미지 픽셀의 위치이며, $$f(x,y)$$는 해당 위치의 밝기 값을 의미한다. 이 값은 보통 0~255 범위를 지닌다.

흑백 영상이면 $$f(x,y)$$는 단일 스칼라 값을 가진다. 컬러 영상 또는 Color+Alpha 영상이면 Vector 값을 가진다. 그 각각의 성분은 R, G, B, A 값의 밝기와 같다.

**픽셀(Pixel)** 이란 디지털 이미지를 구성하는 가장 작은 점 단위다. 이미지는 픽셀의 집합과 같다.

**해상도(Resolution)** 란 이미지 퀄리티와 같다. 이미지 퀄리티가 높다는 것은, 이미지가 갖는 픽셀의 개수가 증가함과 동등하다. 그만큼 메모리도 많이 필요해진다.

**대비(Contrast)** 란 영사의 가장 밝은 영역과 가장 어두운 영역의 차이다. 사람의 눈은 특정 영역의 광도의 절댓값을 그대로 인식하는 것이 아니라, 그 주변에 색에 따라 광도를 다르게 인식한다.

$$
\text{Contrast} = \frac{I_{max} - I_{min}}{I_{max} + I_{min}}
$$

사람의 눈에 대한 특징중 하나는, 경계의 대비를 더 강조해서 인식하는 경향이 있다. 이를 **Mach Band**라고 한다.

![Pasted image 20250626103703.png](/assets/img/posts/Pasted image 20250626103703.png){: width="400" .shadow}

Neighbor of pixels

### 현실 세계의 장면을 어떻게 디지털 정보로 변환하는가?
이를 **영상 획득**(Image Capture)이라 한다.

보통 카메라로 Image를 찍는다. 카메라 렌즈를 통해 빛이 들어오고, 카메라 내의 수많은 포토사이드에 아날로그 신호가 기록된다. 기록된 아날로그 신호를 0~255 사이의 디지털 신호로 변환한다. 이 값을 그대로 픽셀의 값으로 사용하거나, 주변 포토사이드의 값을 합쳐서 하나의 픽셀 값으로 사용한다.

이를 일반화하면, 영상 획득 과정은 크게 두가지 과정으로 설명할 수 있다. 연속적인 장면을 이산적인 위치로 기록하는 **Sampling**과, 기록된 정보를 숫자로 변환하는 **Quantization** 과정이다.

> [!NOTE] NOTE{title}
> 카메라를 들고 셔터를 눌렀을 때 포토사이드에 아날로그 신호가 기록되는 과정이 Sampling 과정이고, 이 아날로그 신호를 디지털 신호로 변환하는 과정이 양자화(Quantization)에 해당한다.

> [!tip] 카메라 화소와 픽셀의 관계{title}
> 스마트폰 후면 카메라가 5000만 화소를 지원한다고 광고한다. 이는 포토사이드 개수가 5000만개임을 의미한다. 그럼 찍은 사진의 픽셀 개수가 5000만개일까? 아니다. 4개의 픽셀을 하나로 합치는 Pixel Binning 과정을 거친다. 이는 노이즈 제거를 위함이다. 저장되는 사진은 대략 1200만개 픽셀의 해상도 사진을 얻는다.

이렇게 얻은 영상은 컴퓨터에서 2차원 배열로 표현된다. 흑백 영상이면 각 픽셀당 하나의 밝기 값을 가진다. 컬러 영상은 각 픽셀당 세개의 밝기 값(RGB)를 가진다. 알파 채널을 포함한 컬러 영상은 각 픽셀당 네개의 숫자(RGB 밝기 + A)로 표현된다.

이를 파일로 저장할 땐 **Header 정보**와 **Real data values**로 구분한다. Header는 파일 식별자, 이미지 해상도, Read data values 해석 방법 등을 저장한다. Read data values는 픽셀 값들의 2차원 정보와 같다.

### 사람은 어떻게 장면을 볼 수 있는걸까?
핵심은 빛이다. 빛이 사물에 부딪히면, 사물이 갖는 고유 색의 파장 대역의 빛만 반사한다. 그 빛이 사람의 눈으로 들어온다.

빛이 사람의 눈으로 들어오면, 두개의 세포가 반응한다. **Rod(간상 세포), Cone (원뿔 세포)**

**Rod**는 아주 예민하다. 따라서 빛이 거의 없는 어두운 공간에선 Rod가 빛을 감지하는데 주도한다. 색을 구분할 순 없다.

빛 정보가 충분하면, Rod가 아닌 Cone이 빛을 감지하는데 주도한다. **Cone**은 색을 구분할 수 있다. Cone은 R, G, B 색을 민감하게 반응하는 세 종류의 원뿔 세포가 존재한다. 빛의 주파수와 빛의 밝기에 대응하여 각각의 원뿔세포의 활성도가 결정된다. 그 활성도의 혼합이 색을 결정한다. 이는 RGB 모델의 기초가 된다.

즉, **색깔은 세가지 Feature**로 추상화 가능하다.
1. **색상 (Hue)** : 빛의 파장으로 결정되는 순수 색깔
2. **채도 (Saturation)** : 색깔의 순수한 정도. 높을 수록 쨍하고, 낮을 수록 파스텔톤에 가깝다.
3. **명도 (Brightness)** : 빛의 밝고 어두운 정도. 높을 수록 밝아지고, 낮을 수록 어두워진다.

### 컴퓨터는 색을 어떻게 표현하는가?
#### RGB Color Model
색을 Red, Green, Blue 성분이 얼마나 들어있는지로 표현하자. 범위는 0~255이며, 세 색을 최대로 합하면 흰색이 되는 가산 혼합 (Additive color model) 방식이다.

이는 직관적으로 이해하기가 쉽다. 밝기 정보와 색상 정보가 분리되지 않다는 단점이 존재한다.

#### CMY/CMYK Color Model
색을 청록(Cyan), 자홍(Magenta), 노랑(Yellow) 성분이 얼마나 들어있는지로 표현하자. 각 색은 RGB의 보색이다. 세 색을 최대로 합하면 검은색이 되는 감산 혼합 (Subtractive color model) 방식이다.

프린터에서 사용된다. 검은색을 만들기 위해선 세가지 색의 잉크를 모두 혼합해야 했고, 모두 혼합해도 온전한 검은색이 나오지 않는다는 단점이 존재헀다. 이를 개선하기 위해 검은색(Key) 잉크를 추가한 모델이 CMYK 모델이다. CMYK가 프린터 시스템에서 일반적으로 사용된다.

#### HSI (HSV) Color Model
Hue, Saturation, Intensity (Value) 정보로 색깔을 표현하자. 밝기 정보인 Intensity와 색상 정보인 Hue, Saturation가 분리되어 있어 영상처리에서 유용하다.

Hue는 0~360도로 표현된다. 채도는 원뿔의 반지름, 명도는 원뿔의 높이로 표현된다. 이를 이중 원뿔 모델로 나타낼 수 있다.

![Pasted image 20250625161053.png](/assets/img/posts/Pasted image 20250625161053.png){: width="200" .shadow}

#### $$YC_{b}C_{r}$$ Color Model
$$Y$$는 밝기 정보, $$C_{b}$$, $$C_{r}$$은 색상 정보다. 이 컬러 모델은 데이터 압축에서 사용된다.

HSV 모델은 사람이 직관적으로 의미를 알 수는 있지만, 컬러 모델끼리 변환이 좀 불편하다. $$YC_{b}C_{r}$$ 모델은 변환을 선형적으로 할 수 있다. 그럼으로써 밝기 정보 $$Y$$만 뽑아낼 수가 있다. 다만, $$C_{b}$$와 $$C_{r}$$의 의미를 직관적으로 알기는 어렵다.

#### 색상 모델끼리 어떻게 변환하는가?
(1) RGB <> CMY 변환

$$
C = 1.0 - R, ~~M = 1.0-G, ~~Y = 1.0 - B
$$


$$
R = 1.0 - C, ~~G = 1.0 - M, ~~B = 1.0 - Y
$$


(2) RGB <> CMYK 변환

$$
K = min(C,M,Y), ~~C = C-K, ~~M = M-K, ~~Y = Y-K
$$


(3) RGB <> HSI
![Pasted image 20250701123244.png](/assets/img/posts/Pasted image 20250701123244.png){: .shadow}

![Pasted image 20250701123255.png](/assets/img/posts/Pasted image 20250701123255.png){: .shadow}

> [!NOTE] NOTE{title}
> - 명도(Intensity, I)가 0일 때 **채도**(Saturation)는 정의되지 않습니다.
> - 채도(S)가 0일 때 **색상**(Hue)은 정의되지 않습니다.

(4) RGB <> $$YC_{b}C_{r}$$

![Pasted image 20250701123335.png](/assets/img/posts/Pasted image 20250701123335.png){: width="350" .shadow}

## 영상처리 알고리즘
영상처리에서 주로 사용되는 알고리즘 유형이 4가지 존재한다.
1. **Point Processing** : [영상처리 2. Point Processing이 무엇인가](https://qlsjtmek2.github.io/posts/%EC%98%81%EC%83%81%EC%B2%98%EB%A6%AC-2-Point-Processing%EC%9D%B4-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80/)
2. **Area Processing** : [영상처리 3. Area Processing이 무엇인가](https://qlsjtmek2.github.io/posts/%EC%98%81%EC%83%81%EC%B2%98%EB%A6%AC-3-Area-Processing%EC%9D%B4-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80/)
3. **Frame Processing** : [영상처리 6. Frame Processing이 무엇인가](https://qlsjtmek2.github.io/posts/%EC%98%81%EC%83%81%EC%B2%98%EB%A6%AC-6-Frame-Processing%EC%9D%B4-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80/)
4. **Geometric Processing** : [영상처리 8. Geometric Processing을 어떻게 할까](https://qlsjtmek2.github.io/posts/%EC%98%81%EC%83%81%EC%B2%98%EB%A6%AC-8-Geometric-Processing%EC%9D%84-%EC%96%B4%EB%96%BB%EA%B2%8C-%ED%95%A0%EA%B9%8C/)

이 알고리즘이 무엇인지 하나씩 다뤄보자.