---
title: "고급컴퓨터그래픽스 9. Physically Based Animation"
date: "2024-12-14"
categories: ["IT", "고급컴퓨터그래픽스"]
tags: ["고급컴퓨터그래픽스", "애니메이션", "물리 시뮬레이션", "유체 애니메이션", "뉴턴 역학", "Navier-Stokes 방정식", "충돌 처리", "Sping-Mass 시스템"]
math: true
toc: true
comments: true
---

건국대학교 고급컴퓨터그래픽스 김형석 교수님의 수업을 정리한 내용입니다.

## 왜 필요한가?

단순히 관절 구조, 위치를 사전 정의하는 것 많으론 다양한 상호작용 애니메이션을 만들어내는데 한계가 존재한다. 따라서 물리적으로 고려해서 더 다양한 상황에 적합한 애니메이션을 만들어 내는 것을 목표라 한다.

## Physic Simulator

뉴턴 역학을 사용한다. object는 힘을 받으며, 힘을 받는 위치, 세기, 방향 등을 고려하여 object를 상호작용한다. $F=ma$에 기초한다. 고려해야 할 힘들은 다음과 같다.

1. 중력 : $\displaystyle F=G \frac{m_{1}m_{2}}{r^2}$
2. 마찰력 : $f_{s} = \mu_{s}N$, $f_{k}=\mu_{k}N$
3. 복원력 : $F=-kd$
4. 충돌 : 탄성 충돌 vs 비탄성 충돌

계산에 사용되는 주요 요소는 다음과 같다.

1. 질량 중심 : $\displaystyle C= \frac{% raw %}{{\sum_{i} m_{i}r_{i}}{% endraw %}}{\sum m_{i}}$
2. 관성 모멘트
3. 병진 운동 속성 : 위치, 속도, 가속도, 힘
4. 회전 운동 속성 : 각, 각속도, 각가속도, 토크

애니메이션의 Use Case는 다음과 같다.

1. Sping-Mass System
	- 옷, Soft Body와 같은 변형 가능한 모델에 적용한다.
	- 외부 힘(중력, 바람 등)과 내부 힘(복원력)을 고려하여 위치를 정한다.
2. Particle System
	- 연기, 불꽃 등을 시뮬레이션한다.
3. 충돌 처리
	- 탄성 vs 비탄성 충돌을 계산하여 상호 작용을 구현한다.

## Fluid Animation

유체는 Volume 단위로 모델링된다. 유체의 주요 성질은 다음과 같다.

1. Viscous vs Non-viscous (점성 vs 비점성)
2. Compressible vs Incompressible (압축성 vs 비압축성)

고려해야 하는 유체의 Property는 Density(밀도), Mass(질량), Pressure(압력), Velocity(속도), Heat(열) 등이 존재한다.

유체의 종류는 크게 세가지로 분류한다.
1. Water :: 비점성, 비압축성
2. Smoke : 비점성, 압축성
3. Fire : 열에 의해 움직임이 결정됨.

### Navier-Stokes Equation

- $\displaystyle \rho\frac{ {\partial \vec{u}}}{\partial t} + \rho(\vec{u} \cdot \nabla)\vec{u} = - \nabla p + \mu \nabla^2 \vec{u} + \vec{f}$
	- $\rho$ : 유체의 밀도
	- $\vec{u}$ : 유체의 속도
	- $t$ : 시간
	- $p$ : 압력
	- $\mu$ : 점성 계수
	- $\vec{f}$ : 단위 질량당 알짜힘 (중력 저항력 등..)

유체에서 사용하는 기본 운동 방정식이다. 해석적으로 풀기는 불가능에 가깝기 때문에, 상황을 최대한 단순화하여 수치적으로 계산한다.

1. 비압축성으로 가정한다. 밀도가 일정하며, 질량 보존 방정식 $\displaystyle \frac{% raw %}{{\partial \rho}}{% endraw %}{\partial t} + \nabla \cdot (\rho \vec{u}) = 0$이 다음과 같이 단순화된다. $\nabla \cdot \vec{u} = 0$
2. Steady flow로 가정한다. 따라서 $\displaystyle \frac{% raw %}{{\partial \vec{u}}{% endraw %}}{\partial t} = 0$이다.

$\displaystyle (\vec{u} \cdot \nabla) \vec{u} = - \frac{1}{\rho} \nabla p + \mu \nabla^2 \vec{u} + \vec{f}$로 단순화한다. 이후 유체가 점성이냐, 비점성이냐에 따라서 다른 방정식을 적용한다.

1. 비점성 유체일 경우 점성 계수 $\mu \nabla^2 \vec{u}$를 무시한다. $\displaystyle \implies (\vec{u} \cdot \nabla)\vec{u} = - \frac{1}{\rho} \nabla p + \vec{f}$
2. 점성 유체일 경우, 관성력이 점성력보다 아주 작다고 가정하여 관성력 항 $\rho(\vec{u} \cdot \nabla)\vec{u} \simeq 0$을 무시하고 $\mu \nabla^2 \vec{u} = \nabla p$로 근사한다. $\implies \mu \nabla^2 \vec{u} = \nabla p - \vec{f}$