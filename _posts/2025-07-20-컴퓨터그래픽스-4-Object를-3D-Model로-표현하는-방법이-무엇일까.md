---
title: "컴퓨터그래픽스 4. Object를 3D Model로 표현하는 방법이 무엇일까"
date: "2025-07-20 15:58:32"
categories: ["IT", "컴퓨터그래픽스"]
tags: []
math: true
toc: true
comments: true
---

### Object를 어떻게 3D Model로 표현하는가?
Object를 컴퓨터가 이해 가능한 Model로 표현하는 방법은 생각보다 다양하다.

![Pasted image 20250401225623.png](/assets/img/posts/Pasted image 20250401225623.png){: width="500" .shadow}

현재는 Vertex (정점)을 이어 선(Edge)과 도형(Primitive)를 만드는 방식을 채택한다. 왜 이 방법이 채택되었는가? GPU의 병렬성을 이용하기 가장 용이하고, 데이터 구조가 간단하기 때문이다. 또한 변형이나 애니메이션을 적용하기도 좋다. 또 대부분의 모양을 Mesh 구조로 표현 가능하다.