---
title: "영상처리 4. Morphological Processing이 무엇인가"
date: "2025-07-18 12:19:16"
categories: ["IT", "영상처리"]
tags: []
math: true
toc: true
comments: true
---

### Morphological Processing
형태학적 처리Morphological Processing란, 이미지의 구성 요소들을 단순화할 수 있다. 이러한 Processing은 이미지의 구성요소를 추출하거나, 경계를 추출하는데 유용하게 사용할 수 있다.

구성 요소를 어떻게 단순화하는가? Morphological Processing은 마치 **포토샵의 브러쉬를 쓰는 것**으로 비유할 수 있다. 사용되는 Mask는 브러쉬 모양과 같다. 이후 Mask를 픽셀에 일일히 대조해가며 Operator를 적용한다.

방법이 두가지가 있다. **첫번째는 Gray Scale 이미지를 Gray level thresholding 적용하여 각 픽셀의 값을 0과 1로 바꾸는 것이다.** 이후 Operator를 적용한다.

두번째는 **Gray Scale 이미지 자체에 마스크를 적용하는 것이다.** OR, AND 연산이 MAX, MIN으로 치환된다. 팽창 규칙(OR)은 필터 영역 중 가장 최대값을 현재 픽셀에 넣는 것으로 바뀌고, 침식 규칙(AND)은 필터 영역 중 가장 최소값을 현재 픽셀에 넣는 것으로 바뀐다.

Operator는 4가지가 존재한다.
1. **팽창Dilation**: Mask 영역 내에 1이 하나라도 있으면, 현재 픽셀의 값을 1로 설정한다.
	- 마스크 영역 내에 1이 하나라도 있으면 값이 채워지므로, 마치 구성 요소가 팽창하는 효과가 있다.
	- 이는 마치 브러쉬 내에 값이 하나라도 들어오면 브러쉬를 칠하는 것과 같다.
2. **침식Erosion**: Mask 영역 내의 모든 값이 1이라면, 현재 픽셀의 값을 1로 설정한다.
	- 마스크 영역 내의 모든 값이 1이어야 하므로, 마치 구성 요소가 수축하는 효과가 있다.
	- 이는 마치 브러쉬 내의 모든 값이 들어와야 브러쉬를 칠하는 것과 같다.
3. **닫힘Closing**: 팽창 후 침식
	- 이는 객체 내부의 빈 공간이나 틈을 메우고, 다시 깔끔하게 외곽선을 정리하며 원래 크기로 되돌리는 효과가 있다.
4. **열림Opening**: 침식 후 팽창
	- 이는 마치 포토샵의 '부드럽게 깎는 브러쉬'와 같다. 노이즈를 갈아내고, 구성 요소의 울퉁불퉁한 표면을 매끄럽게 다듬는다.

> [!NOTE]- 사진{title}
> ![Pasted image 20250705203347.png](/assets/img/posts/Pasted image 20250705203347.png){: width="300" .shadow}
> _팽창_
> 
> 
> ![Pasted image 20250705203402.png](/assets/img/posts/Pasted image 20250705203402.png){: width="400" .shadow}
> _침식_
> 
> ![Pasted image 20250705203420.png](/assets/img/posts/Pasted image 20250705203420.png){: width="500" .shadow}
> _팽창 후 침식(Closeing)_
> 
> ![Pasted image 20250705203448.png](/assets/img/posts/Pasted image 20250705203448.png){: width="500" .shadow}
> _침식 후 팽창(Opening)_

#### Use Cases
- Opening 연산은 Noise Filtering 효과가 있다. 
- Opening, Closeing 연산을 통해 불필요한 것들을 가지치기하여 핵심 요소만 추출할 수 있다.
- 만약 팽창시킨 이미지와 침식시킨 이미지를 빼면? 바로 Edge 추출이다. 
- Opening Top-Hat: 원본 이미지에서 Opening 연산한 이미지를 빼면, 원본에서 큰 구조를 제거한 디테일한 객체들만 추출 가능하다.
	- 온전한 모양의 과자와 부서진 조각을 구분하는 방법. 부서진 과자에 침식 연산을 적용하면, 원형의 과자보다 훨씬 더 많이 깎인다. 이후 팽창시키면 부서진 과자는 원래 모양보다 훨씬 더 작아진다. 반대로 원본 과자는 거의 원형을 유지한다. 이 결과를 원본 이미지에서 빼면, 원본 과자는 약간의 자잘한 노이즈만 생기고, 부서진 과자는 구조를 얻게 된다. 이후 원본 과자에서 생긴 노이즈를 없애주면 최종적인 부서진 과자가 무엇인지 검출할 수 있다.
- Closeing Top-Hat: Closeing 연산한 이미지에서 원본 이미지를 빼면, Closeing이 채운 부분을 추출한다. 즉 원본 이미지에 있던 구멍을 찾는다.
	- 정상적인 회로에서 미세하게 끊어진 부분은 어둡고 작은 틈으로 볼 수 있으므로, 클로즈 탑햇 연산을 적용하여 찾아낸다.