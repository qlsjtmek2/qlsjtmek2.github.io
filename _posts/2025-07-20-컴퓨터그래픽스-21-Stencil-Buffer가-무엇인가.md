---
title: "컴퓨터그래픽스 21. Stencil Buffer가 무엇인가"
date: "2025-07-20 16:09:49"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

#### Stencil Buffer가 무엇인가?

![Pasted image 20250612184214.png](/assets/img/posts/Pasted image 20250612184214.png){: width="500" .shadow}

특정 픽셀의 렌더링을 제한하거나, 제어할 수 있다. 이를 통해 마스킹 효과, 특수한 이미지 효과를 구현할 수 있다.

Stencil Buffer는 8비트(0~255) 정수형 데이터 타입으로 구성된다. 렌더링 여부만 파악하면 1비트만 있어도 되는거 아닌가? **왜 8비트나 사용할까?** 여러 비트를 다른 목적으로 동시에 사용할 수 있기 때문이다.
- 특정 비트는 그림자 계산용
- 다른 비트는 반사 효과용
- 또 다른 비트는 아웃라인 효과용

현재 픽셀이 Stencil 값이 몇인지 검사해서, 렌더링할지 특수효과를 적용할지를 검사하는 단계를 **Stencil Test**라고 한다. 이 단계는 Depth Test보다 먼저 수행되야 이득이다. Stencil Test에서 걸러지면, Depth Test를 안해도 되기 때문이다.

#### Stencil Buffer를 어떻게 사용하는가?
INIT에서 Stencil Test를 활성화한다.

```c
glEnable(GL_STENCIL_TEST);
```

Depth Buffer와 같이 매 프레임마다 Stencil Buffer를 초기화해야 한다.

```c
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
```

스탠실 버퍼 내의 값은 총 8비트를 사용할 수 있고, 이 8비트 중 각 비트를 사용자 입맛에 맞게 설정할 수 있다.

```c
glStencilMask(0xFF); // 11111111 - 모든 비트 쓰기 가능 
glStencilMask(0x00); // 00000000 - 모든 비트 쓰기 금지 
glStencilMask(0x0F); // 00001111 - 하위 4비트만 쓰기 가능
```

위 함수로 Stencil Buffer의 특정 비트를 쓰게 하거나, 못쓰게 보호를 할 수 있다.

```c
glStencilFunc(GLenum func, GLint ref, GLuint mask);
```

위 함수로 조건문을 만들어 해당 픽셀을 렌더링할지, 말지 결정할 수 있다. 
**func**는 비교 함수다. 다음 옵션이 가능하다.

| 함수              | 의미         | 통과 조건                            |
| --------------- | ---------- | -------------------------------- |
| **GL_NEVER**    | 항상 실패      | 어떤 경우에도 픽셀을 그리지 않음               |
| **GL_ALWAYS**   | 항상 통과      | 모든 픽셀을 그림                        |
| **GL_EQUAL**    | 같으면 통과     | (ref & mask) == (stencil & mask) |
| **GL_NOTEQUAL** | 다르면 통과     | (ref & mask) != (stencil & mask) |
| **GL_LESS**     | 작으면 통과     | (ref & mask) < (stencil & mask)  |
| **GL_LEQUAL**   | 작거나 같으면 통과 | (ref & mask) <= (stencil & mask) |
| **GL_GREATER**  | 크면 통과      | (ref & mask) > (stencil & mask)  |
| **GL_GEQUAL**   | 크거나 같으면 통과 | (ref & mask) >= (stencil & mask) |

**ref**는 비교의 기준이 되는 값이다. 예를들어 `ref = 1`로 설정하고, `GL_EQUAL`로 설정하면 Stencil Buffer가 1인 값만 렌더링될 것이다.

**mask**는 비교에 사용할 비트를 선택한다. `11111111`로 설정하면 모든 비트를 비교에 사용할 수 있다.

```c
glStencilOp(GLenum sfail, GLenum dpfail, GLenum dppass);
```

위 함수로 스텐실 테스트 결과에 따라 스텐실 버퍼의 값을 어떻게 바꿀지 규칙을 설정할 수 있다.
**sfail**는 스텐실 테스트가 실패시 동작, **dpfail**은 깊이 테스트가 실패시 동작, **dppass**는 둘다 통과시 동작한다. 각 매개변수에는 다음 선택지가 존재한다.

| 연산               | 설명                           |
| ---------------- | ---------------------------- |
| **GL_KEEP**      | 현재 스텐실 값을 유지 (기본값)           |
| **GL_ZERO**      | 스텐실 값을 0으로 설정                |
| **GL_REPLACE**   | glStencilFunc에서 지정한 참조값으로 대체 |
| **GL_INCR**      | 스텐실 값을 1 증가 (최대값에서 고정)       |
| **GL_INCR_WRAP** | 스텐실 값을 1 증가 (최대값에서 0으로 순환)   |
| **GL_DECR**      | 스텐실 값을 1 감소 (0에서 고정)         |
| **GL_DECR_WRAP** | 스텐실 값을 1 감소 (0에서 최대값으로 순환)   |
| **GL_INVERT**    | 비트별 반전 연산 수행                 |

즉 스탠실 버퍼는 마스킹하고, 스탠실 테스트 조건을 설정하고, 테스트 성공 또는 실패시 스탠실 버퍼의 값을 어떻게 바꿀지 설정해서 다양한 특수 효과를 구현할 수 있다.

그렇다면 특정 마스크 영역을 1로 설정하고, func로 equal 1일때만 test 통과하도록 하면 마스킹할 수 있다. 그럼 **stencil buffer를 어떻게 초기화하는데?** 마스킹 영역을 1로 초기화해야 하잖아.

스탠실 버퍼를 채우기 위해서, **Stencil Buffer만 활성화 해서 Mask Object를 Draw하면 된다.**

COLOR_BUFFER, DEPTH_BUFFER를 잠시 비활성화고 STENCIL_BUFFER만 활성화해둔다.

```c
// 색상 버퍼 쓰기 비활성화 (마스크만 그리고 실제 색상은 안 그림) 
glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE);

// 깊이 버퍼 쓰기 비활성화 (선택사항) 
glDepthMask(GL_FALSE); 

// 스텐실 버퍼 쓰기 활성화 
glStencilMask(0xFF);
```

그리고 스탠실 테스트를 항상 통과하도록 하고, 통과하면 버퍼의 값이 1로 대체되도록 만든다.

```c
glStencilFunc(GL_ALWAYS, 1, 0xFF);
glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
```

이후 마스크로 설정할 도형을 Draw하면, 그 도형 모양이 Stencil Buffer에 채워진다. 이런 원리로 Stencil Buffer를 채울 수 있다.

예제 코드는 다음과 같다.

```c
void renderWithCircularMask() {
    // 1. 초기화
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    glEnable(GL_STENCIL_TEST);
    
    // 2. 마스크 영역 설정
    glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE);
    glStencilMask(0xFF);
    glStencilFunc(GL_ALWAYS, 1, 0xFF);
    glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
    
    drawCircle();  // 원형 마스크 영역 그리기
    
    // 3. 실제 렌더링 설정
    glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_TRUE);
    glStencilMask(0x00);  // 스텐실 쓰기 금지
    glStencilFunc(GL_EQUAL, 1, 0xFF);   // 스텐실 값이 1인 곳만
    glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP);  // 스텐실 값 유지
    
    // 4. 최종 객체 렌더링
    drawBackground();  // 원형 영역에만 배경이 그려짐
    drawObjects();     // 원형 영역에만 객체들이 그려짐
}
```

#### Fragment Pipeline의 Test들..

![Pasted image 20250612191023.png](/assets/img/posts/Pasted image 20250612191023.png){: .shadow}

프래그먼트는 위와 같은 여러 테스트를 거쳐 최종적으로 Frame Buffer에 기록된다.