---
title: "Unity - Event System"
date: "2025-02-13 18:18:50"
categories: ["Unity", "Tip"]
tags: []
math: true
toc: true
comments: true
---

## What is this?

사용자의 입력이 들어오면 이벤트를 발생시킨다. 이벤트가 발생하면, 등록된 핸들러에 이벤트 정보를 보낸다. 이 작업은 하나의 Event System에서 관리된다.

## Why is it needed?

UI 관련 상호작용을 처리하는데 유용하다. UGUI의 버튼과 같은 오브젝트는 Event System으로 만들어졌다. 따라서 Canvas를 만들면 자동으로 Event System까지 만들어진다.

만약 Event System을 2개 이상 만들면, 다음과 같은 경고가 뜨게 된다.

![Pasted image 20250213182635.png](/assets/img/posts/Pasted image 20250213182635.png){: .shadow}

## How to use?

MonoBehaviour 스크립트에 Handler 인터페이스를 구현하기만 하면, 자동으로 이벤트를 수신할 수 있다. Handler 이벤트들은 다음과 같다.

- [IPointerEnterHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IPointerEnterHandler.html) - 포인터가 오브젝트 안으로 들어올 때 호출된다.
- [IPointerExitHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IPointerExitHandler.html) - 포인터가 오브젝트 밖으로 나갈 때 호출된다.
- [IPointerDownHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IPointerDownHandler.html) - 오브젝트를 클릭하거나 터치하는 순간 호출된다.
- [IPointerUpHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IPointerUpHandler.html)- 오브젝트를 클릭하거나 터치하고 뗄 때 호출된다.
- [IPointerClickHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IPointerClickHandler.html) -  오브젝트를 클릭하거나 터치후 똈을 때 호출된다.
- [IInitializePotentialDragHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IInitializePotentialDragHandler.html) - 드래그 대상이 감지되었을 때 호출되며, 초기값을 설정하는 데 사용될 수 있다.
- [IBeginDragHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IBeginDragHandler.html) - 드래그가 시작되기 직전에 호출된다.
- [IDragHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IDragHandler.html) - 오브젝트를 드래그 중이라면 호출된다.
- [IEndDragHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IEndDragHandler.html) - 오브젝트 드래그가 종료되었을 때 호출된다.
- [IDropHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IDropHandler.html) - 드래그가 끝나고 오브젝트 위에 드롭되었을 때 호출된다.
- [IScrollHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IScrollHandler.html) - 마우스 휠 스크롤이 발생했을 때 호출된다.
- [IUpdateSelectedHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IUpdateSelectedHandler.html) - 선택된 오브젝트에 대해 매 프레임(또는 각 틱) 호출된다.
- [ISelectHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.ISelectHandler.html) - 오브젝트가 선택되었을 때 호출된다.
- [IDeselectHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IDeselectHandler.html) - 선택된 오브젝트의 선택이 해제될 때 호출된다.
- [IMoveHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.IMoveHandler.html) - 이동 이벤트(왼쪽, 오른쪽, 위, 아래)가 발생했을 때 호출된다.
- [ISubmitHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.ISubmitHandler.html) - 제출 버튼이 눌렸을 때 호출된다.
- [ICancelHandler](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/api/UnityEngine.EventSystems.ICancelHandler.html) - 취소 버튼이 눌렸을 때 호출된다.

UI 뿐만 아니라 오브젝트에도 적용하고 싶다면, 카메라에 다음과 같은 컴포넌트를 하나 추가하면 된다.

- [Physics 2D Raycaster](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/manual/script-Physics2DRaycaster.html) - 2D 물리 요소에 사용됨
- [Physics Raycaster](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/manual/script-PhysicsRaycaster.html) - 3D 물리 요소에 사용됨

UI 요소에는 이미 [Graphic Raycaster](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/manual/script-GraphicRaycaster.html)가 붙어있기 때문에, 고려하지 않아도 된다.

#### Script Example

```c#
public class Joystick : MonoBehaviour, IDragHandler
{
    public void OnDrag(PointerEventData eventData)
    {
        // 스크린 좌표를 Background(RectTransform)의 로컬 좌표로 변환
        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
            Background, 
            eventData.position, 
            eventData.pressEventCamera, 
            out Vector2 localPoint))
        {
            // 로컬 좌표 기준 방향(벡터) 계산 및 정규화
            Vector2 direction = localPoint;
            Vector2 normalizedInput = Vector2.ClampMagnitude(direction / _maxDistance, 1f);
            
            // Handle을 로컬 좌표 기준으로 이동
            Handle.anchoredPosition = normalizedInput * _maxDistance;
            
            // 이동 컨트롤러에 감도를 적용한 이동 입력 전달 (최대값 1을 넘지 않도록 Clamp)
            if (_moveController != null)
            {
                Vector2 moveInput = Vector2.ClampMagnitude(normalizedInput * Sensitivity, 1f);
                _moveController.MoveDirection = moveInput;
            }
        }
    }
}
```

Interface를 구현하고, eventData를 이용하여 로직을 구현하기만 하면 끝이다.

## References

- [Supported Events \| Unity UI \| 3.0.0-exp.4](https://docs.unity3d.com/Packages/com.unity.ugui@3.0/manual/SupportedEvents.html)