---
title: "고급컴퓨터그래픽스 7. Motion Retargetting"
date: "2024-12-14 12:09:18"
categories: ["IT", "고급컴퓨터그래픽스"]
tags: ["Motion Capture", "Motion Retargeting", "Motion Blending", "Animation Models", "Dynamics", "Branching", "AI", "3D Animation"]
math: true
toc: true
comments: true
---

건국대학교 고급컴퓨터그래픽스 김형석 교수님의 수업을 정리한 내용입니다.

## Motion Capture

사람의 움직임을 직접 캡처하여 관절의 움직임, 피부의 움직임의 키프레임을 뽑아내는 기술이다.
1. 기계적 장치를 이용 (Electro-Mechanical)
2. 자기장을 이용 (Magnetic)
3. 마커를 부착 (Passive Optical)
4. 비디오를 AI가 분석

> [!question]- Passive Optical?{title}
> 1. 마커를 부착하고 환경을 설정한다.
> 2. 이미지처리를 통해 각 프레임에서 마커의 위치를 추출한다.
> 3. 여러 프레임의 거쳐 마커를 Tracking한다.
> 4. 다각도 카메라로 찍은 이미지를 통해 마커의 3D 위치를 계산한다.
> 5. 마커 위치를 기반으로 관절의 위치, 각도를 추정한다.
> 6. 마지막으로 잘못된 데이터, Noise, 손실된 마커를 수작업으로 고친다.
> 
> 이 방법은 꽤 정확하지만, 귀찮고 비용이 많이든다.

캡처를 통해 만들어낸 Motion은 그 사람과 비슷한 체형에서만 자연스러운 움직임을 만들어낸다는 단점이 있다. 따라서 여러 체형에 애니메이션을 적용 가능하도록 **Motion Retargeting**을 해야 한다. 만약 총쏘면서 걷는 애니메이션을 만들고 싶다면 일일히 다 캡처하지 말고, 걷는 모션과 총을 쏘는 모션을 적절히 혼합하면 많은 Animation 바리에이션을 만들 수 있을 것이다. 따라서 **Motion Blending** 기술이 필요하다. 이후 물리 기반 **Dynamics**를 적용하면 다양한 상호작용까지 고려할 수 있다.

## Animation Models

모델은 Born(Bodies, Links), Meshes, Textures으로 이루어지고, Bodies는 Position, Orientation(방향), , Functions으로 이루어진다. Function이란 Model의 특정 segment가 어떤 기능을 할 수 있는지 정의한 것과 같다. 예를들어 손은 물체를 잡을 수 있고, 입은 벌렸다 오므릴 수 있고 등등을 Function으로 정의한다.

Mesh의 Vertex는 특정 Born들과 Mapping 되어있어서 Born이 움직이면 자동으로 따라 움직이도록 설계되어 있다.

Bodies, Linkes는 DAG로 계층 구조를 이룬다. Bodies의 기본 Pose는 T-Pose를 많이 사용하며, 모든 포즈는 기본 포즈로부터 얼마나 움직였냐를 기준으로 생성된다.

## Motion Retargeting

특정 Hierarchical 구조에서 생성된 애니메이션을, 다른 Hierarchical 구조를 갖는 모델에 적용시키는 기술이 Motion Retargeting이다. Motion Retargeting의 이슈는 다음과 같다.
1. 여러개의 Joint, Link가 하나로 합쳐질 수 있음.
2. Joint, Link가 없어질 수 있음.
3. 새로운 Joint, Link가 생겨날 수 있음.

Motion Retarting을 위해 다음과 같은 과정을 거치면 된다.
1. 두 model의 Links, Joints 사이의 관계를 Mapping한다.
    1. Mapping을 수동으로 직접 할 수 있다.
    2. Mapping을 **자동으로 하는 방법**을 만들어낼 수 있다.
2. Source Joint가 얼마 움직였을 때, Target Joint가 어떻게 움직일지에 대한 규칙을 만들어낸다.
    1. 규칙을 수작업으로 만들어낼 수 있다.
    2. 미리 만들어진 규칙을 적용할 수 있다. 이를 Mode라고 한다.
3. Mapping 관계와 Move Mode를 가지고 최종적으로 Target model에 적용된 Animation Keyframe을 추출한다.

> [!question]- How to Auto Mapping?{title}
> 1. Function : 구성 요소가 갖는 의미로 찾을 수 있다. 예를 들어, 입의 기능으로 정의된 '벌렸다 오므렸다' Function을 Target Model에서 같은 Function을 찾아 Mapping할 수 있다.
>     1. mouth
>     2. graspers
>     3. spine
>     4. root 등등..
> 2. Spatial Query : 위치 관계에 따라 Mapping도 가능하다. 예를들어 몸통의 왼쪽에 있는 것을 똑같이 Mapping하고, 몸통의 오른쪽에 있는 것을 똑같이 Mapping할 수 있다.
>     1. Root로부터 Front, Center, Back, Left, Right, Top, Bottom에 있는 것.
> 3. Extent Query : 가장 멀리 있는 것을 기준으로 Mapping한다. T-Pose 기준 왼쪽에서 가장 멀리 있는 것은 같은 손일 것이므로 똑같이 생각할 수 있다.
>     1. FrontMost, Back Most
>     2. LeftMost, RightMost
>     3. TopMost, BottomMost
>     4. Most에서 바로 붙은 것들.
> 
> 이것들이 1:1 Mapping된다면 오히려 부자연 스러운 결과가 생길 수 있다. 

> [!tip]- Mode Types{title}
> - Identity
>     - 원본 움직임을 그대로 복사함
> - Rest Relative
>     - 기본 포즈를 기준으로 상대적 움직임을 계산함
> - Scale Mode
>     - 크기, 길이에 따라 움직임 비율을 결정함
> - Ground Relative
>     - 지면과의 상대적 위치로 계산함
> - Secondary Relative Movement
>     - 다른 Target object에 대해 얼마나 떨어져 있는지를 통해 계산해낸다. Ground Relative의 일반화된 버전.
> - Lookat
>     - 특정 목표를 바라보도록 계산함
> - Mirroring Mode
>     - 움직임을 반대로 복사함

위 방법을 적용해도 부자연스러운 동작이 너무 많이 나온다. 이를 해결해야 한다. 아이디어는 다음과 같다. 
1. 특정 시간에 반드시 이 조건은 만족해야 한다는 **'제약 조건'** 을 설정한다. 예를들어 '1초에는 왼쪽 발이 지면에 닿아야 한다.' 와 같은 조건이 있을 수 있다.
2. 제약 조건을 수식으로, 모션을 함수로 표현한다. 
3. 원본 모션 함수와 리타게팅된 모션 함수의 차이 함수를 계산하여, 차이 함수를 제약 조건 하에서 최소값을 찾는다. 이는 최적화 문제와 같다.

위 방법을 사용해봤더니, 여러 실패 Case가 발생한다.
1. 대상 캐릭터의 구조 차이로 인해 상호작용 문제?가 발생한다.
2. IK 기반일 경우, 갑자기 부자연 스러운 동작이 나온다. jerkiness
    1. 이를 해결하기 위해 모션에 Smooting Data (Low-pass Filtering)를 적용한다.
    2. 하지만 노이즈를 제거하는 과정에서 모션의 디테일이 손상된다.

이를 다음과 같이 해결하고 있다.
1. 모든  프레임을 동시에 최적화한다.
2. AI로 Source skelecton과 Target skelecton의 Mapping, Mode를 자동으로 찾아내자.

## Motion Blending

여러 모션을 결합하여 새로운 동작을 생성해내는 기술이다. 두가지 과제를 해결해야 한다.
1. Transition. 한 동작에서 다른 동작으로 자연스럽게 전환.
2. Combine. 여러 동작을 하나의 동작으로 자연스럽게 합친다.

Combine을 하기 위한 아이디어는, 여러 애니메이션 모션들을 Variant groups으로 묶는 것이다. 같은 Variant groups의 모션은 Combine할 수 없도록 한다. 예를들어 '하체 모션', '상체 모션'으로 두개의 Variant groups를 만들면 훨씬 많은 바리에이션의 모션을 적은 애니메이션으로도 만들어낼 수 있다. 예를들어 걸으면서 총쏘는 모션과, 앉으면서 총쏘는 모션을 두개를 각각 애니메이션을 만드는것이 아니라 '걷는 모션', '앉는 모션'은 하체 모션으로 넣고, 'Idle 모션', '총쏘는 모션'은 상체 모션으로 넣으면 된다. 걸을 때는 하체 모션에만 영향을 주고, 다른 동작을 할때는 상체 모션에만 영향을 준다.

## Branching

사용자 입력이나, Timeline을 통해 여러 모션을 실행하는 상황이라고 하자. Retargeting된 애니메이션은 기존에는 가능했던 모션이 변환 후 불가능해졌다거나, 기존에는 불가능했던 모션이 변환 후 가능해지는 경우가 있을 수 있다. 예를들어 2발 동물에서 4발 동물로 애니메이션을 Retargeting했을 때 척추를 세우는 동작은 기존엔 가능한 동작이었지만 변환 이후 불가능한 동작이 되었다. 이런 조건들을 Animation Clip이 가지고 있어야 하며, 모션을 재생해달라고 요청을 받았을 때 조건을 확인해서 재생이 불가능한 모션을 분기문으로 체크하여 무시해야 한다. 이를 **Branching**라고 한다.