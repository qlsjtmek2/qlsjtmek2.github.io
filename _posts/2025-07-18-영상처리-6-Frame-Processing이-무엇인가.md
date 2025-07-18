---
title: "영상처리 6. Frame Processing이 무엇인가"
date: "2025-07-18 12:19:16"
categories: ["IT", "영상처리"]
tags: []
math: true
toc: true
comments: true
---

### Frame Processing
여러 이미지로 새로운 이미지를 생성하는 기법이다. 두 이미지를 연산하는 연산자는 덧셈, 뺄셈, AND/OR, 평균 등이 있다.

**(1) Addition**

$$
\text{new piexl} = (1-t) \cdot \text{pixel}_{1} + t \cdot\text{pixel}_{2}
$$

두 이미지를 더한다. 가중치를 조절할 수 있다.

**(2) Subtaction**
두 이미지를 뺀다.

**(3) AND**
두 이미지를 AND 연산한다. 이미지를 Masking하는데 사용 가능하다. 보이게 할 부분을 255(11111111), 가릴 부분을 0(00000000)으로 설정하고 AND 연산하면 마스킹 가능하다.

**(4) OR**
두 이미지를 OR 연산한다. 이미지에 어떤 부분을 추가할 때 사용 가능하다.

**(5) Averaging**
두 픽셀 값을 더한 후 2로 나눈다. 같은 이미지를 여러장 찍고, 평균내면 노이즈를 줄일 수 있다. 그 이유는 무엇인가? 신호는 그대로고, 노이즈는 무작위적인 오차와 같다. 만약 원본 픽셀 값이 100이라고 하자. +5의 노이즈가 적용되어 105인 이미지와, -8의 노이즈가 적용되어 92인 이미지가 있다. 이를 평균내면 98.5로 원본 이미지에 가까워진다. 즉, 노이즈가 상쇄된다.
#### Image Morphing
Image Morhping이란 한 이미지에서 다른 이미지로 자연스럽게 변형되는 시각 효과다. 이는 Image Warping과 Cross-dissolving을 동시에 사용한다.

![Pasted image 20250714134207.png](/assets/img/posts/Pasted image 20250714134207.png){: width="500" .shadow}

##### Cross-dissolving
픽셀을 선형 보간하여 Fade 효과를 구현하는 방법이다.

$$
\text{new piexl} = (1-t) \cdot \text{pixel}_{1} + t \cdot\text{pixel}_{2}
$$

t를 시간에 따라 0부터 1까지 증가하면 Fade 효과가 만들어진다.

##### Image Warping
이미지의 Mesh를 잘 찾아서, Mesh의 Point를 조절해서 이미지를 변형시키는 기술이다.

![Pasted image 20250715173122.png](/assets/img/posts/Pasted image 20250715173122.png){: width="500" .shadow}