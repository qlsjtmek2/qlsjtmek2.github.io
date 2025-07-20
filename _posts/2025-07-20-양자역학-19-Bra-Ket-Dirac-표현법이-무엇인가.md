---
title: "양자역학 19. Bra-Ket (Dirac) 표현법이 무엇인가"
date: "2025-07-20 16:30:59"
categories: ["Physics", "양자역학"]
tags: []
math: true
toc: true
comments: true
---

### 양자계의 일반적인 성질은 무엇인가?
무한 퍼텐셜 우물, 조화 진동자, 디렉 퍼텐셜, 유한 퍼텐셜 우물은 양자계에서 얼마 안되는 슈뢰딩거 방정식을 풀 수 있는 시스템이다. 대부분의 슈뢰딩거 방정식은 풀 수 없기 때문에, 이 얼마 안되는 사례에서 일반적인 성질을 뽑아내야 한다.

파동함수는 힐베르트 공간 위의 벡터이며, 연산자는 선형 변환의 형태로 파동함수에 적용된다. 따라서 양자역학은 선형대수의 언어로 기술된다. 양자 상태와 연산자를 특정 좌표계나 기저에 얽매이지 않고 추상적으로 다룰 수 있게 해주는 새로운 표현법`(브라-켓 표현법)`을 배울 것이다.

### 브라-켓(Dirac) 표현법이 무엇일까?
Bra-Ket는 복소수 벡터 공간 $$V$$ 내의 벡터를 나타내는 표기법이다. **Ket** 벡터의 정의는 다음과 같다.

$$
\ket{\beta} = \begin{pmatrix}
b_{1} \\
b_{2} \\
\vdots \\
b_{n}
\end{pmatrix}
$$

**Bra** 벡터의 정의는 다음과 같다.

$$
\bra{\alpha} = \begin{pmatrix}
a_{1}^* & a_{2}^* & \dots & a_{n}^*
\end{pmatrix}
$$

**두 벡터의 내적**은 다음과 같다. 일반적으로 복소수 값을 반환한다.

$$
\braket { \alpha \mid \beta } = \begin{pmatrix}
a_{1}^* & a_{2}^* & \dots & a_{n}^*
\end{pmatrix}\begin{pmatrix}
b_{1} \\
b_{2} \\
\vdots \\
b_{n}
\end{pmatrix} = a_{1}^*b_{1} + a_{2}^*b_{2} + \dots + a_{n}^* b_{n}
$$

동일한 두 벡터를 내적하면, **벡터의 크기 제곱**을 얻는다.

$$
\braket{ v \mid v} = \lvert v_{1} \rvert^2 + \lvert v_{2} \rvert^2 + \dots + \lvert v_{n} \rvert^2
$$

**내적 연산에 대한 성질**은 다음과 같다.

$$
\braket{v \mid w}^* = \braket{w \mid v}
$$


$$
\braket{v \mid v} \geq 0
$$

**켤레 대칭성**은 내적의 물리적 일관성을, **양의 정부호성**은 확률 해석의 타당성을 부여한다.

**두 벡터의 외적**은 다음과 같다. 외적의 결과는 $$N \times N$$ 행렬이다.

$$
\ket{\beta} \bra{\alpha} = \begin{pmatrix}
b_{1} \\
b_{2} \\
\vdots \\
b_{n}
\end{pmatrix}\begin{pmatrix}
a_{1}^* & a_{2}^* & \dots & a_{n}^*
\end{pmatrix} = \begin{pmatrix}
a_{1}^*b_{1} & a_{2}^*b_{1} & \dots & a_{n}^* b_{1} \\
a_{1}^*b_{2} & a_{2}^* b_{2} & \dots & a_{n}^* b_{2} \\
\vdots & \vdots & & \vdots \\
a_{1}^* b_{n} & a_{2}^* b_{n} & \dots & a_{n}^* b_{n}
\end{pmatrix}
$$

복소수 벡터 공간 $$V$$는 **Module (가군)** 이다. Module은 환 또는 체 $$\mathbb{M}$$에 대하여 $$(\mathbb{Z}, +, c \cdot_{c \in \mathbb{M}})$$ [Algebraic structure (대수 구조)|대수 구조](https://qlsjtmek2.github.io/posts/Algebraic-structure-%EB%8C%80%EC%88%98-%EA%B5%AC%EC%A1%B0%EB%8C%80%EC%88%98-%EA%B5%AC%EC%A1%B0/)와 같다. 즉, 8개의 성질과, 두 연산의 닫힘성이 만족되어야 한다.
- $$+$$ in 결합법칙, 항등원, 역원, 교환법칙
- 스칼라/벡터 덧셈 분배법칙, 결합법칙, 항등원

따라서, Bra-ket 벡터는 다음 성질을 만족한다.
**(1) $$+$$ 결합 법칙**

$$
( \ket{v}  + \ket{w} ) + \ket{x}  = \ket{v}  + ( \ket{w}  + \ket{x}  )
$$

**(2) $$+$$ 항등원**

$$
^\exists \ket{0} , ~~ \ket{v}  + \ket{0}  = \ket{v}
$$

**(3) $$+$$ 역원**

$$
^\forall \ket{v} , ~ ^\exists \ket{-v} ,~~\ket{v}  + \ket{-v}  = \ket{0}
$$

**(4) $$+$$ 교환법칙**

$$
\ket{v}  + \ket{w}  = \ket{w}  + \ket{v}
$$

**(5) 스칼라 덧셈 분배법칙**

$$
(a+b) \ket{v}  = a \ket{v}  + b \ket{v}
$$

**(6) 벡터 덧셈 분배법칙**

$$
a(\ket{v}  + \ket{w} ) = a \ket{v}  + a \ket{w}
$$

**(7) 스칼라 곱셈 결합법칙**

$$
a(b\ket{v} ) = b(a\ket{v} ) = ab\ket{v}
$$

**(8) 스칼라 항등원**

$$
1 \cdot \ket{v}  = \ket{v}  ~~~(1 \in \mathbb{F})
$$

**(9) $$+$$ 이항 연산, 스칼라 연산의 닫힘성**

$$
\ket{v}  + \ket{w}  \in V
$$


$$
a\ket{v}  \in V
$$

연산의 닫힘성으로 인해 Bra-Ket 벡터는 선형성을 만족한다.

$$
\ket{x}  = a \ket{w}  + b \ket{z}
$$


$$
\ket{x} ^* = \bra{x} = a^* \bra{w}  + b^* \bra{z}
$$

**켓의 선형성**은 중첩 원리를, **브라의 반선형성**은 쌍대 공간과의 호환성을 유지한다.

> [!question] **쌍대 공간** (Dual Space)이 무엇인가?{title}
> 벡터 공간에서 스칼라 체(Field)로의 선형변환 집합이다.
> 
> $$
> V^* = \{ f : V \to \mathbb{F} ~\mid~ \text{f는 선형함수}\}
> $$
> 
> 켓 $$\ket{v}$$은 벡터 공간 $$V$$ 위의 벡터, 브라 $$\bra{v}$$는 쌍대 공간 $$V^*$$ 위의 쌍대 벡터와 같다.

이때까지 유한 차원의 벡터 공간 위의 Bra-Ket을 다루었다. 그러나 양자역학에서 사용되는 파동함수는 함수다. 함수는 연속된 무한차원 공간 위에 존재한다. 이때 Bra-ket 표기법이 어떻게 바뀔까?

우선 파동함수를 일반화하자. 파동함수는 무한차원 벡터다. 그리고 정규화되어있다.

$$
\int \lvert \Psi \rvert^2 dx = 1
$$

이 조건을 통해 자연스럽게 제곱적분 조건이 만족한다. 파동함수는 $$(-\infty, \infty)$$ 범위를 갖지만, 더 일반적으로 $$(a, b)$$ 범위를 상정한다.

$$
\int_{a}^{b} \lvert f(x) \rvert^2dx < \infty
$$

제곱 적분이 가능한 함수는, $$L^2(a,b)$$ 공간 위에 존재한다. $$L^2(a, b)$$ 공간은 완비성을 갖춘 내적 공간이며, 이를 더 일반적으로 **Hillbert 공간**이라 한다. 따라서, **파동 함수는 Hillbert 공간 안에 존재한다.**

힐베르트 공간은 완비성을 갖춘 내적 공간이므로, 벡터 공간의 모든 성질을 만족한다. 따라서, **파동 함수 또한 위에서 서술한 Bra-ket의 모든 성질을 만족**한다.

**함수의 내적**은 다음과 같이 정의된다.

$$
\braket{f \mid g} \equiv \int_{a}^{b} f(x)^* g(x) dx
$$

자기 자신과의 내적은 실수이며, 0 이상이다.

$$
\braket{f \mid f} = \int_{a}^{b} \lvert f(x)^2 \rvert dx
$$

두 함수가 제곱적분이 가능하면, Schwarz 부등식으로부터 내적값이 반드시 존재함이 보장된다.

> [!note]- 증명{title}
> 슈바르츠 부등식이 무엇인가? 임의의 두 벡터 $$\vec{a}, \vec{b}$$에 대해 두 벡터의 내적의 절댓값은 각 벡터의 크기의 곱보다 크지 않다는 것이다.
> 
> $$
> \lvert \vec{a} \cdot \vec{b} \rvert \leq \lvert \vec{a} \rvert \cdot \lvert \vec{b} \rvert
> $$
> 
> 왜? 생각해보면 당연하다. $$\vec{a} \cdot \vec{b} = \lvert \vec{a} \rvert \cdot \lvert \vec{b} \rvert\cos \theta$$이고, $$\cos \theta$$의 최댓값은 1이기 때문임. 
> 
슈바르츠 부등식을 함수 내적에 적용하면 다음과 같다.
> 
> $$
> \lvert \langle f \mid g \rangle \rvert \leq \sqrt{ \langle f\mid f \rangle } \cdot \sqrt{ \langle g \mid g \rangle }
> $$
> 
> 
> $$
> \implies \left\lvert \int_{a}^{b} f(x)^* g(x) dx  \right\rvert \leq \sqrt{ \int_{a}^{b}\lvert f(x) \rvert^2 dx  } \sqrt{ \int_{a}^{b} \lvert g(x) \rvert^2 dx }
> $$
> 
> 
> > [!question] 그런데, 유한 차원 또는 무한 차원의 일반적인 벡터끼리도 각도 $$\theta$$를 사용 가능한가?{title}
> > 그렇다. 정확히는, 삼각형의 코사인 법칙에서 내적의 기하학적 의미를 자연스럽게 유도할 수 있다. 코사인 법칙은 다음과 같다.
> > 
> > $$
> > A^2 = B^2 + C^2 - 2BC\cos \theta
> > $$
> > 
> > 이를 벡터로 표현하면 다음과 같다.
> > 
> > $$
> > \lvert \vec{a} - \vec{b} \rvert^2 = \lvert \vec{a} \rvert^2 + \lvert \vec{b} \rvert^2 - 2 \lvert \vec{a} \rvert \lvert \vec{b} \rvert \cos \theta
> > $$
> > 
> > 그리고, $$\lvert \vec{a} - \vec{b} \rvert^2$$는 다음과 같다.
> > 
> > $$
> > \lvert \vec{a} - \vec{b} \rvert^2 = (\vec{a} - \vec{b}) \cdot (\vec{a} - \vec{b})
> > $$
> > 
> > 
> > $$
> > = \lvert \vec{a} \rvert^2 + \lvert \vec{b} \rvert^2 - 2 \vec{a} \cdot \vec{b}
> > $$
> > 
> > 첫번째 식과 두번째 식이 같으려면, 다음이 성립해야 한다.
> > 
> > $$
> > \vec{a} \cdot \vec{b} = \lvert \vec{a} \rvert \lvert \vec{b} \rvert \cos \theta
> > $$
> > 
> > 따라서, 내적과 노름이 잘 정의되어 있는 공간 위에서 각도 $$\theta$$를 내적으로 정의할 수 있다.
> > 
> > $$
> > \cos \theta = \frac{\vec{a} \cdot \vec{b}}{\lvert \vec{a} \rvert \lvert \vec{b} \rvert  }
> > $$
> > 
> 
> > [!question] 4차원 이상의 벡터 공간에서 코사인 법칙을 사용할 수 있는가?{title}
> > 그렇다. 그 이유는, 두 벡터가 만드는 공간은 그 벡터가 몇차원 벡터이든 관계 없이, 항상 2차원 평면을 Span하기 때문이다. 2차원 평면 위에선 삼각형의 코사인 법칙을 얼마든지 사용할 수 있다.

만약 어떤 함수열 $$\{ f_{n} \}$$이 **규격화** 되어있고, 서로 직교한다면 이를 **직교규격화** 되어있다고 한다. 그리고 다음 성질을 만족한다.

$$
\braket{ f_{n} \mid f_{m} } = \delta_{nm}
$$

힐베르트 위의 모든 함수를 함수열 $$f_{n}$$의 선형 결합으로 나타낼 수 있다면, 이 함수는 **완전**(complete) 하다.

$$
\ket{f}  = \sum_{n=1}^{\infty} c_{n} \ket{f_{n}}
$$

계수 $$c_{n}$$은 양 변에 $$\langle f_{m}\mid$$을 곱하여 얻을 수 있다.

$$
c_{n} = \braket{f_{n} \mid f}
$$


### 왜 Bra-Ket 표기법이 파동함수의 일반화된 표현인가?
왜 Bra-Ket 표기법을 사용하면, 파동 함수를 특정 기저에 의존하지 않고 일반화된 상태를 표현할 수 있다고 말할까?

애초에 벡터란 추상적인 개념이기 때문이다. 벡터란 벡터 공간 내의 원소와 같다. 벡터 공간은 특정 연산 규칙을 만족하는 대수 구조와 같다.

규격화된 파동 함수는 힐베르트 공간 위의 존재한다. 따라서, 파동 함수는 힐베르트 공간 위의 벡터 (원소)와 같다. 이를 Bra-Ket 표기법으로 나타낼 수 있으며, 이때 파동 함수는 특정 기저에 의존하지 않는다.

추상적인 벡터를 특정 기저 `(특정 좌표계)`를 설정하고, 그 기저의 관점으로 바라보면 성분 벡터와 같다. 따라서 성분 벡터는 특정 기저에 의존한다.

### 파동 함수의 기저는 무엇인가?
완비성을 가지고, 직교규격화 되어있는 함수 집합을 기저로 사용할 수 있다. 이러한 기저는 힐베르트 공간을 Span한다.

각 기저는 서로 다른 **관측 가능량**(observable)에 대해 “측정 결과를 확정”하는 상태를 모은 것이며, 모두 동일한 힐베르트 공간을 완비하게 스팬한다.

파동 함수를 위치 기저로 표현하면?

$$
\Psi(x) = \braket{x \mid \Psi}, ~~~\ket{\Psi}  = \int \Psi(x) \ket{x}  dx
$$

파동 함수를 에너지 기저로 표현하면?

$$
c_{n} = \braket{ \psi_{n} \mid \Psi }, ~~ \ket{\Psi}  = \sum_{n}c_{n} \ket{\psi_{n}}
$$

파동 함수를 운동량 기저로 표현하면?

$$
\Phi(p) = \braket{ p \mid \Psi }, ~~ \ket{\Psi}  = \int \Phi(p) \ket{p}  dp
$$

기저 선택은 특정 관측가능량에 대한 계산을 용이하게 하기 위한 편의일 뿐이다.

### 왜 기저와 연산자를 내적하면, 파동함수가 그 성분으로 표현되는가?
직교 규격화된 기저는 다음 성질이 성립한다.

$$
\braket{n \mid m} = \delta_{nm}
$$

임의의 상태 $$\ket{\Psi}$$를 이 기저의 선형 결합으로 표현할 수 있다.

$$
\ket{\Psi}  = \sum_{n} c_{n} \ket{n}
$$

이때 기저 $$\ket{m}$$과 내적하면, 파동함수 $$\ket{\Psi}$$의 $$m$$ 성분인 $$c_{m}$$을 추출할 수 있다.

$$
\braket{ m \mid \Psi } = \braket{  m \mid \sum_{n} c_{n} \mid n  } = \sum_{n} c_{n} \braket{n \mid m} = c_{m}
$$

따라서, 기저 $$\bra{x}$$와 내적하면, 파동함수 $$\ket{\Psi}$$의 $$x$$ 성분인 $$\Psi(x)$$를 추출할 수 있다.

$$
\braket{ x \mid \Psi } = \Psi (x)
$$

생각해보면 당연하다. 특정 벡터와 내적하는 것은 어떤 벡터를 특정 벡터로 **사영**(Projection)하는 것과 같다. 즉, 기저 $$\ket{x}$$와 $$\ket{\Psi}$$를 내적하는 것은, 추상 벡터 $$\ket{\Psi}$$를 그 기저 방향으로 사영하여 그 성분`(크기)`을 측정하는 행위와 같다.