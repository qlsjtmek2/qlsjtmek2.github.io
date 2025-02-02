---
title: "Project OneMinute - 개발 일지 (1)"
date: "2025-02-02 23:35:25"
categories: ["Unity", "Projects"]
tags: []
math: true
toc: true
comments: true
---

![Pasted image 20250202233738.png](/assets/img/posts/Pasted image 20250202233738.png){: .shadow}

대략 5년 전, 플레이 스토어에 [간단한 게임 하나](https://play.google.com/store/apps/details?id=com.shinkhan.DotGi&hl=ko&pli=1)를 출시한 적이 있습니다.
잊어먹고 있었는데 나중에 확인하니 1만 다운로드가 넘어있더군요 

그래서 이번 기회에 버전 2를 만들어 업데이트를 해보려 합니다.

개발 목표는 다음과 같습니다.

1. DOTS 사용
2. 그래픽/UI 개선
3. 3D로 변경
4. 멀티 추가
5. PC/Mobile 크로스 플랫폼으로 개발하여 스팀에도 출시
6. 1분을 버티는 컨셉의 다른 컨텐츠 추가

---
## 프로젝트를 생성 후 [프로토타입 리소스](https://www.kenney.nl/assets/prototype-textures) 적용

![Pasted image 20250202234304.png](/assets/img/posts/Pasted image 20250202234304.png){: .shadow}

## 플레이어 구현

플레이어 이동을 Unity Physics를 사용해서 구현하려 했으나, 찾아보니 ECS 전용으로 개발된 [Character Controller](https://docs.unity3d.com/Packages/com.unity.charactercontroller@1.2/manual/index.html)가 존재했습니다. 이것을 사용해보겠습니다.

![Pasted image 20250202234646.png](/assets/img/posts/Pasted image 20250202234646.png){: .shadow}

다운받아보니, FPS와 TPS 컨트롤러는 있지만 TopView 컨트롤러는 없습니다. 따라서 직접 개발해야 합니다.

![Pasted image 20250202234745.png](/assets/img/posts/Pasted image 20250202234745.png){: .shadow}

Camera, Character, Player 세 Entity를 생성하고 Authoring를 부착합니다. Camera에는 `MainEntityCameraAuthoring`를 붙이고, Character에는 `CameraTargetAuthoring`를 붙여야 합니다.

![Pasted image 20250202234845.png](/assets/img/posts/Pasted image 20250202234845.png){: .shadow}
_Camera_

![Pasted image 20250202234951.png](/assets/img/posts/Pasted image 20250202234951.png){: .shadow}
_Character_

![Pasted image 20250202234942.png](/assets/img/posts/Pasted image 20250202234942.png){: .shadow}
_Player_

플레이어에서 플레이어 입력을 받고, 캐릭터에서 실제 이동, 물리적인 처리를 담당합니다. Top View 형식의 카메라를 만들기 위해 `Character Controller Sample`에 들어있던 `ThirdPersonCamera`를 수정해서 `TopDownCamera`를 만들었습니다.

```c#
// TopDownCameraAuthoring.cs

using Unity.CharacterController;
using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using System;
using Shin.Components;

namespace Shin.Components
{
    [Serializable]
    public struct TopDownCharacter : IComponentData

    {
        public float RotationSharpness;
        public float GroundMaxSpeed;
        public float GroundedMovementSharpness;
        public float AirAcceleration;
        public float AirMaxSpeed;
        public float AirDrag;
        public float3 Gravity;
        public bool PreventAirAccelerationAgainstUngroundedHits;
        public BasicStepAndSlopeHandlingParameters StepAndSlopeHandling;
    }

    [Serializable]
    public struct TopDownCharacterControl : IComponentData
    {
        public float3 MovePosition;
        public float3 MoveDirection;
    }
}

namespace Shin.Authoring
{
    /// <summary>
    /// TopDownCameraAuthoring을 부착하면, 다음 컴포넌트가 Entity에 붙게 됩니다.
    /// - TopDownCamera
    /// - TopDownCameraControl
    /// - TopDownCameraState
    /// </summary>
    [DisallowMultipleComponent]
    public class TopDownCharacterAuthoring : MonoBehaviour
    {
        public AuthoringKinematicCharacterProperties CharacterProperties = AuthoringKinematicCharacterProperties.GetDefault();

        public float RotationSharpness = 25f;
        public float GroundMaxSpeed = 10f;
        public float GroundedMovementSharpness = 15f;
        public float AirAcceleration = 50f;
        public float AirMaxSpeed = 10f;
        public float AirDrag = 0f;
        public float JumpSpeed = 10f;
        public float3 Gravity = math.up() * -30f;
        public bool PreventAirAccelerationAgainstUngroundedHits = true;
        public BasicStepAndSlopeHandlingParameters StepAndSlopeHandling = BasicStepAndSlopeHandlingParameters.GetDefault();

        public class Baker : Baker<TopDownCharacterAuthoring>
        {
            public override void Bake(TopDownCharacterAuthoring authoring)
            {
                KinematicCharacterUtilities.BakeCharacter(this, authoring.gameObject, authoring.CharacterProperties);

                Entity entity = GetEntity(TransformUsageFlags.Dynamic | TransformUsageFlags.WorldSpace);
                
                AddComponent(entity, new TopDownCharacter
                {
                    RotationSharpness = authoring.RotationSharpness,
                    GroundMaxSpeed = authoring.GroundMaxSpeed,
                    GroundedMovementSharpness = authoring.GroundedMovementSharpness,
                    AirAcceleration = authoring.AirAcceleration,
                    AirMaxSpeed = authoring.AirMaxSpeed,
                    AirDrag = authoring.AirDrag,
                    Gravity = authoring.Gravity,
                    PreventAirAccelerationAgainstUngroundedHits = authoring.PreventAirAccelerationAgainstUngroundedHits,
                    StepAndSlopeHandling = authoring.StepAndSlopeHandling,
                });
                
                AddComponent(entity, new TopDownCharacterControl());
            }
        }
    }
}
```

Top Down 카메라가 가져야 하는 속성값을 생각해서 Component와 Authoring를 생성했습니다. 시스템에서 이 컴포넌트를 기반으로 카메라가 Top View로 플레이를 따라가도록 설정해야 합니다. 

```c#
// TopDownCameraSystem.cs

/*
Top Down Camera System에서 Top Down Camera의 로직을 담당한다.
*/

using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using Unity.Physics;
using Shin.Components;

namespace Shin.Systems
{
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(FixedStepSimulationSystemGroup))]
    [UpdateAfter(typeof(ThirdPersonPlayerVariableStepControlSystem))]
    [UpdateAfter(typeof(ThirdPersonCharacterVariableUpdateSystem))]
    [UpdateBefore(typeof(TransformSystemGroup))]
    [BurstCompile]

    public partial struct TopDownCameraSimulationSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            EntityQuery cameraQuery = SystemAPI.QueryBuilder().WithAll<TopDownCamera, TopDownCameraControl, TopDownCameraState>().Build();
            state.RequireForUpdate(cameraQuery);
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            TopDownCameraSimulationJob job = new TopDownCameraSimulationJob
            {
                LocalTransformLookup = SystemAPI.GetComponentLookup<LocalTransform>(false),
                ParentLookup = SystemAPI.GetComponentLookup<Parent>(true),
                PostTransformMatrixLookup = SystemAPI.GetComponentLookup<PostTransformMatrix>(true),
                CameraTargetLookup = SystemAPI.GetComponentLookup<CameraTarget>(true),
            };

            job.Schedule();
        }

        [BurstCompile]
        [WithAll(typeof(Simulate))]
        public partial struct TopDownCameraSimulationJob : IJobEntity
        {
            public ComponentLookup<LocalTransform> LocalTransformLookup;
            [ReadOnly] public ComponentLookup<Parent> ParentLookup;
            [ReadOnly] public ComponentLookup<PostTransformMatrix> PostTransformMatrixLookup;
            [ReadOnly] public ComponentLookup<CameraTarget> CameraTargetLookup;

            /// <summary>
            /// 카메라를 쿼리합니다.
            /// </summary>
            void Execute(Entity entity, ref TopDownCameraState topDownCameraState, in TopDownCamera topDownCamera, in TopDownCameraControl cameraControl)
            {
                /*
                Camera Control이 갖는 Follow Entity의 World Transform을 가져온다.
                카메라 회전값, 높이, 오프셋을 기반으로 카메라의 회전과 위치값을 잡는다.
                카메라의 회전과 위치값을 설정한다.
                */

                // 카메라가 따라갈 대상의 정확한 World Transform를 얻는다.
                if (OrbitCameraUtilities.TryGetCameraTargetSimulationWorldTransform(
                        cameraControl.FollowedCharacterEntity,
                        ref LocalTransformLookup,
                        ref ParentLookup,
                        ref PostTransformMatrixLookup,
                        ref CameraTargetLookup, 
                        out float4x4 targetWorldTransform))
                {
                    float3 targetUp = targetWorldTransform.Up();

                    // 최종 회전 쿼터니언
                    quaternion cameraRotation = TopDownCameraUtilities.CalculateCameraRotation(targetUp, topDownCamera.DefaultYawAngle, topDownCamera.DefaultPitchAngle, topDownCamera.DefaultRollAngle);

                    // 카메라 줌 계산
                    float desiredDistanceMovementFromInput = cameraControl.ZoomDelta * topDownCamera.DistanceChangeSpeed;
                    topDownCameraState.TargetDistance = math.clamp(topDownCameraState.TargetDistance + desiredDistanceMovementFromInput, topDownCamera.MinDistance, topDownCamera.MaxDistance);

                    // 회전만 즉시 적용
                    LocalTransformLookup[entity] = LocalTransform.FromRotation(cameraRotation);
                }
            }
        }
    }

    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TransformSystemGroup))]
    [BurstCompile]
    public partial struct TopDownCameraLateUpdateSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<PhysicsWorldSingleton>();
            state.RequireForUpdate(SystemAPI.QueryBuilder().WithAll<TopDownCamera, TopDownCameraControl, TopDownCameraState>().Build());
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            TopDownCameraLateUpdateJob job = new TopDownCameraLateUpdateJob
            {
                DeltaTime = SystemAPI.Time.DeltaTime,
                LocalToWorldLookup = SystemAPI.GetComponentLookup<LocalToWorld>(false),
                CameraTargetLookup = SystemAPI.GetComponentLookup<CameraTarget>(true),
            };
            job.Schedule();
        }

        [BurstCompile]
        [WithAll(typeof(Simulate))]
        public partial struct TopDownCameraLateUpdateJob : IJobEntity
        {
            public float DeltaTime;
            
            public ComponentLookup<LocalToWorld> LocalToWorldLookup;
            [ReadOnly] 
            public ComponentLookup<CameraTarget> CameraTargetLookup;

            void Execute(Entity entity, ref TopDownCameraState topDownCameraState, in TopDownCamera topDownCamera, in TopDownCameraControl cameraControl)
            {
                // 카메라 타겟의 보간된 위치의 World Transform를 얻는다.
                if (OrbitCameraUtilities.TryGetCameraTargetInterpolatedWorldTransform(
                        cameraControl.FollowedCharacterEntity,
                        ref LocalToWorldLookup,
                        ref CameraTargetLookup,
                        out LocalToWorld targetWorldTransform))
                {
                    // 이걸 재계산하지말고, 재활용하면 더 최적화 가능할 것임.
                    quaternion cameraRotation = TopDownCameraUtilities.CalculateCameraRotation(targetWorldTransform.Up, topDownCamera.DefaultYawAngle, topDownCamera.DefaultPitchAngle, topDownCamera.DefaultRollAngle);
                    float3 targetPosition = targetWorldTransform.Position;
                    
                    // 거리 스무딩을 더 부드럽게 처리
                    float smoothingFactor = math.min(1f, topDownCamera.DistanceMovementSharpness * DeltaTime);
                    topDownCameraState.SmoothedTargetDistance = math.lerp(
                        topDownCameraState.SmoothedTargetDistance, 
                        topDownCameraState.TargetDistance, 
                        smoothingFactor);
                    
                    // 스무딩된 거리를 사용하여 카메라 위치 계산
                    float3 cameraPosition = OrbitCameraUtilities.CalculateCameraPosition(targetPosition, cameraRotation, topDownCameraState.SmoothedTargetDistance);
                    
                    LocalToWorldLookup[entity] = new LocalToWorld { Value = new float4x4(cameraRotation, cameraPosition) };
                }
            }
        }
    }
}

public static class TopDownCameraUtilities
{
    public static quaternion CalculateCameraRotation(float3 targetUp, float yawAngle, float pitchAngle, float rollAngle)
    {
        // 카메라가 바라보는 방향은, 타깃의 업벡터의 반대 방향이 기본 축입니다.
        quaternion baseRotation = quaternion.LookRotation(-targetUp, math.forward());

        quaternion yawRotation = quaternion.Euler(targetUp * math.radians(yawAngle));
        quaternion pitchRotation = quaternion.Euler(math.right() * math.radians(pitchAngle));
        quaternion rollRotation = quaternion.Euler(math.forward() * math.radians(rollAngle));

        return math.mul(baseRotation, math.mul(yawRotation, math.mul(pitchRotation, rollRotation)));
    }
}
```

`TopDownCameraSimulationJob`에서 카메라 회전을, `TopDownCameraLateUpdateSystem`에서 카메라 위치를 설정합니다. 카메라 Distance는 줌을 확대 축소할 때 부드럽게 보여야하기 때문에 Late Update에서 처리합니다.

![Animation 5.gif](/assets/img/posts/Animation 5.gif){: .shadow}
_TopDown Camera와 Zoom 기능을 구현함_

롤같은 시점을 만들고 싶어 찾아보니, Camera FOV를 40으로 설정하고 Pitch를 52도로 기울이면 된다고 합니다. 따라서 다음과 같이 설정했습니다.

![Pasted image 20250203000041.png](/assets/img/posts/Pasted image 20250203000041.png){: .shadow}
_Top Down Camera Authoring_

---
## 다음 목표

다음으론 플레이어 이동을 구현해야 합니다. PC 환경에선 마우스 이동과 WASD 이동을 선택할 수 있도록 개발할 예정입니다. Entities에서 사용 가능한 Pathfinding 기능을 찾아봐야 할 것 같습니다.

이후, 시점을 시점을 잠그고 풀 수 있는 기능을 만들 예정입니다. 시점을 풀고 마우스를 통해 화면을 움직일 수 있어야 합니다.