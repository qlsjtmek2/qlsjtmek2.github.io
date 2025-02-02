---
title: "Unity DOTS - Rigidbody의 Freeze Rotation이 작동 안함 해결법"
date: "2025-01-20 17:56:26"
categories: ["Unity", "DOTS"]
tags: []
math: true
toc: true
comments: true
---

## Problem

Unity의 **Collider**과 **Rigidbody** 컴포넌트가 Subscene에서 자동으로 Bake되는 것 같긴 합니다만.. 몇몇 동작하지 않는 기능이 있는 것 같습니다. 

![Pasted image 20250120175804.png](/assets/img/posts/Pasted image 20250120175804.png){: .shadow}

Rotation을 Freeze해도 기능이 적용되지 않습니다.

## Solution

![Pasted image 20250120175913.png](/assets/img/posts/Pasted image 20250120175913.png){: .shadow}

`Package Manager > Unity Physics > Samples > Custom physics Authoring`을 Import합니다.  Import하면 **Physics Body**와 **Physics Shape** 컴포넌트를 사용할 수 있습니다.

> 현재 저는 Import한 상태이기에 Reimport 버튼이 보여집니다.

![Pasted image 20250120180305.png](/assets/img/posts/Pasted image 20250120180305.png){: .shadow}

두 컴포넌트를 Entity에 부착 후, `Advanced > Override Default Mass Distribution Check > Inertia Tensor`의 X, Z 값을 `Infinity`로 수정합니다.

![unity-axis-with-rotation.png](/assets/img/posts/unity-axis-with-rotation.png){: .shadow}

Inertia Tensor는 관성 텐서로, 회전 질량으로 생각할 수 있습니다. X값을 아주 높이면, X축을 기준으로 회전하기 더 어려워집니다. X, Z축 방향으로 회전하면 문제가 되므로 이를 Infinity로 설정하는 것입니다.

![Animation 3.gif](/assets/img/posts/Animation 3.gif){: .shadow}
_설정 전_

![Animation 4.gif](/assets/img/posts/Animation 4.gif){: .shadow}
_설정 후_

## References

- [Freeze Specific Rotations in ECS Physics Body - Unity Engine - Unity Discussions](https://discussions.unity.com/t/freeze-specific-rotations-in-ecs-physics-body/862378)