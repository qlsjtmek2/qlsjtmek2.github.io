---
title: "컴퓨터그래픽스 8. Model Transform"
date: "2025-07-20 16:02:32"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

#### Model Transform은 어떻게?
Application Stage에서 Object의 Position, Rotate, Scale 정보를 가지고 있다. Position 정보를 가지고 평행 이동 행렬 $$T$$를 만든다. Scale 정보를 가지고 Scaling 행렬 $$S$$를 만든다. Rotate 정보를 가지고 회전 행렬 $$R$$을 만든다. 그런데 보통 회전 정보는 오일러 각으로 가지고 있는 경우가 많다. 이를 쿼터니언으로 변환해서, 쿼터니언 변환을 행렬로 바꾸고 싶은데 이를 어떻게 할 수 있을까?

먼저 각각의 회전 정보를 통해 쿼터니언을 만들 수 있다.

$$
q_{roll} = \left[  \cos\left( \frac{\phi}{2} \right), ~\sin\left( \frac{\phi}{2} \right)\left(1, 0, 0 \right) \right]
$$


$$
q_{pitch} = \left[  \cos\left( \frac{\theta}{2} \right), ~\sin\left( \frac{\theta}{2} \right)\left( 0, 1, 0 \right) \right]
$$


$$
q_{yaw} = \left[  \cos\left( \frac{\psi}{2} \right), ~\sin\left( \frac{\psi}{2} \right)\left(0, 0, 1 \right) \right]
$$

$$Rot_{q}(Rot_{p}(v)) = Rot_{qp}(v)$$ 성질을 통해 쿼터니언 곱을 하면 연쇄 회전 적용과 같다. 어떤 순서로 곱해야 할까? 보통 $$ZYX$$ 또는 $$XYZ$$ 순서를 사용한다. 왜? 그냥 관습인 것 같다. 오일러 각도를 사용하던 시절에는 짐벌락 현상이 치명적이기 때문에, 가장 덜 회전하는 값을 두번째에 두어야 했다. 두번째 회전양이 $$\pm 90 \degree$$가 된다면 짐벌락에 걸리기 때문이다. 따라서 $$Y$$를 중간에 두고, $$ZYX$$ 또는 $$YZX$$ 순서를 사용한다. 쿼터니언을 도입하면 짐벌락 현상이 없지만, 그냥 써왔던 순서를 계속 사용하는 것 같다.

$$
q_{zyx} = q_{yaw}q_{pitch}q_{roll}
$$

이후 $$Rot_{q_{zyx}}$$를 행렬로 변환하고, Model Matrix를 만든다.

$$
M=TRS
$$

이동은 항상 가장 마지막에 적용해야 한다. 원점이 아닌 다른곳에서 회전 또는 스케일링을 하게되면 고전을 하거나 찌그러질 수 있기 때문이다. 스케일링 변환이 다른 변환에 영향을 가장 덜 미치기 때문에, 먼저 변환하고 이후 회전, 이동 순서대로 변환을 적용한다.

이렇게 Application Stage 수준에서 Model Matrix를 만들고, Uniform Buffer를 통해 Vertex Shader에 전달해주면 된다. 이렇게 구현하면 한번 정한 Vertex Buffer를 바꾸지 않고 Model Matrix만 조작하면 되므로 간편하다. Vertex Buffer를 바꾸지 않으므로 하나의 Vertex Buffer만 만들고 무수히 많은 오브젝트를 그릴 수 있게 된다. `(물론 Rigidbody Transform가 아니게 되면 얘기가 복잡해진다.)`