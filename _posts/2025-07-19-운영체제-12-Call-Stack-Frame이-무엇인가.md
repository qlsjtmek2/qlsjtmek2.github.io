---
title: "운영체제 12. Call Stack Frame이 무엇인가"
date: "2025-07-19 14:56:43"
categories: ["IT", "운영체제"]
tags: []
math: true
toc: true
comments: true
---

### Call Stack Frame이 무엇인가?
Frame이 무엇인가? 스택에 쌓이는 데이터 묶음이다. 함수 호출 한번당 스택 프레임이 하나씩 생성되어 스택에 쌓인다. Frame의 구성 요소는 무엇이 있는가? 
1. Parameters : 함수가 호출될 때 넘겨받은 값.
2. Return Address : 함수가 끝나고 돌아가야 하는 메모리 주소. 즉 함수가 호출된 메모리 주소의 다음 번지를 가리킨다.
3. Saved Frame Pointer : Frame Pointer란, 현재 Frame의 Saved Frame Pointer를 가리킨다. 현재 Frame의 Frame Pointer는 FP 레지스터에 저장된다. Saved Frame Pointer란, 이전 프레임의 FP 값을 저장한다. 왜 이전 프레임의 Frame Pointer를 저장해야 하는가? 함수가 리턴될 때 FP 레지스터를 복원해야 하기 떄문이다. 프레임의 크기가 함수마다 다르기 때문에, FP를 백업해 두지 않으면 FP가 어디인지 알 방법이 없다.
4. Local Variables : 함수 안에서 선언되는 지역 변수.

스택은 하나인데, 구성 요소가 여러개면 섞일 수 있지 않을까? 그렇기 때문에 구성 요소를 스택에 쌓을 때 약속된 순서대로 push, pop을 해야 한다. 콜스택 프레임을 생성하면, 맨 밑칸부터 차례대로 parameters, return address, saved frame pointer를 채운다. 가장 위 영역을 변동성이 심한 지역 변수 영역으로 사용한다. 

함수가 리턴되는 과정을 살펴보자. 함수가 리턴되면, 기존의 콜 스택 프레임은 필요가 없다. FP 레지스터의 값을 SP 레지스터에 덮어쓴다. 그 메모리 위치에는 Saved Frame Pointer가 존재한다. 이 값을 FP에 덮어쓴다. 즉, 이전 Frame의 Frame Pointer를 복원한다. 이후 Pop을 한번 하면 SP가 가리키는 주소에는 Return Address가 존재한다. 이 POP 과정은 RET 명령어가 수행한다. Return Address 값을 PC에 덮어쓴다. 이후 SC를 이전 함수 Frame의 가장 윗 주소로 복원해야 한다. 현재는 stack 위에 파라미터들이 채워진 상태다. 이를 정리하는 두가지 방식이 존재한다.

첫번째로 Caller 방식이다. 일단 이전 함수로 복귀한다. 이후 함수를 호출했던 Caller는 함수를 호출할 때 파라미터를 몇개 넣었는지 알고 있다. 따라서, SC의 값에 파라미터 크기를 더하면 SC 값은 복귀한 함수의 Frame 맨 윗 주소로 설정된다.

두번째로 Callee 방식이다. 이 방식은 가변 인자의 경우 사용하지 못한다. 함수가 받는 파라미터의 개수가 고정되어 있으면, SC의 위치를 이전 함수 Frame의 최상단 주소로 옮길 수 있다.