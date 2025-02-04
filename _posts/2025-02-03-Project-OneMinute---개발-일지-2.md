---
title: "Project OneMinute - 개발 일지 (2)"
date: "2025-02-03 16:51:04"
categories: ["Unity", "Projects"]
tags: []
math: true
toc: true
comments: true
---

### DOTS 폐기

현재 DOTS에는 지원하지 않는 것들이 너무 많아, 잠시 내려놓고자 합니다. AI Navigation, Animation 등등이 DOTS에 추가되면 그때 다시 사용하려 합니다.. 그 전까진 아쉬운대로 Job + Burst Compile만 사용해서 최적화를 해보겠습니다.

---
## Top Down Camera

![Pasted image 20250205005224.png](/assets/img/posts/Pasted image 20250205005224.png){: .shadow}
_Cinemachine Camera_

DOTS로 구현했던 것을 다시 Game Object로 옮기는 작업을 해야 했습니다. 우선 Cinemachine으로 TopDown Camera를 만들었습니다.

## Camera Zoom

![Pasted image 20250205005319.png](/assets/img/posts/Pasted image 20250205005319.png){: .shadow}

![Animation 8.gif](/assets/img/posts/Animation 8.gif){: .shadow}
_Camera Zoom_

Camera Zoom 컴포넌트를 만들어서 카메라 줌을 간단히 구현합니다.

```c#
void LateUpdate()
{
    if (_zoomController ** null || _cineamachinePositionComposer ** null)
    {
        Debug.LogError("CinemachineCameraZoomSystem is not properly configured");
        return;
    }

    var distance = _cineamachinePositionComposer.CameraDistance;
    distance = Mathf.Clamp(distance - _zoomController.ZoomDelta * ZoomSpeed * Time.deltaTime, MinDistance, MaxDistance);
    _cineamachinePositionComposer.CameraDistance = distance;
}
```

## Player Move

이동 방법은 두가지 옵션을 제공해야 합니다.

1. WASD 이동
2. 클릭 이동

입력은 **Input System**을 사용하고, 클릭 이동은 **AI Navigation**를 사용했습니다.

```c#
public class MoveController : MonoBehaviour
{
    [TabGroup("State", Icon = SdfIconType.EyeFill)]
    public Vector2 MoveDirection;


    public void OnMove(InputValue value)
    {
        MoveDirection = value.Get<Vector2>();
    }

    public bool IsMove()
    {
        return MoveDirection.magnitude > 0;
    }
}
```
{: file="MoveController.cs" }

```c#
public enum ClickType
{
    Left,
    Right
}

public class ClickController : MonoBehaviour
{
    [TabGroup("Setting", Icon = SdfIconType.GearFill)]
    public ClickType ClickType;

    [TabGroup("State", Icon = SdfIconType.EyeFill)]
    public bool IsClick;

    [TabGroup("State")]
    public Vector3 MousePosition;

    [TabGroup("Event", Icon = SdfIconType.MegaphoneFill)]
    public UnityEvent<Vector3> OnClick;


    public void OnLeftClick(InputValue value)
    {
        if (ClickType != ClickType.Left) return;

        if (value.isPressed)
        {
            IsClick = true;
            Update();
            OnClick.Invoke(MousePosition);
        }
        else
        {
            IsClick = false;
        }
    }

    public void OnRightClick(InputValue value)
    {
        if (ClickType != ClickType.Right) return;

        if (value.isPressed)
        {
            IsClick = true;
            Update();
            OnClick.Invoke(MousePosition);
        }
        else
        {
            IsClick = false;
        }
    }

    void Update()
    {
        if (!IsClick) return;

        RaycastHit hit;
        if (Physics.Raycast(Camera.main.ScreenPointToRay(Mouse.current.position.ReadValue()), out hit))
        {
            MousePosition = hit.point;
        }
    }
}
```
{: file="ClickController.cs" }

```c#
[RequireComponent(typeof(Speed))]
[RequireComponent(typeof(NavMeshAgent))]
public class PlayerMoveSystem : MonoBehaviour
{
    [TabGroup("Dependency", Icon = SdfIconType.Diagram2Fill)]
    [SerializeField] private MoveController _moveController;

    private NavMeshAgent _agent;

    void Start()
    {
        _agent = GetComponent<NavMeshAgent>();
    }

    void FixedUpdate()
    {
        if (_moveController ** null || _agent ** null) 
        {
            Debug.LogError("PlayerMoveSystem is not properly configured");
            return;
        }

        var moveDirection = _moveController.MoveDirection.normalized;
        var moveDistance = new Vector3(moveDirection.x, 0, moveDirection.y);

        // _rigid.MovePosition(_rigid.position + moveDistance * speed * Time.fixedDeltaTime);

        if (_moveController.IsMove())
        {
            _agent.destination = transform.position + moveDistance;
        }
    }
}
```
{: file="PlayerMoveSystem.cs" }

```c#
[RequireComponent(typeof(Speed))]
[RequireComponent(typeof(NavMeshAgent))]
public class PlayerPointerMoveSystem : MonoBehaviour
{
    [TabGroup("Dependency", Icon = SdfIconType.Diagram2Fill)]
    [SerializeField] private ClickController _clickController;

    private NavMeshAgent _agent;

    void Start()
    {
        _agent = GetComponent<NavMeshAgent>();
    }

    void FixedUpdate()
    {
        if (_clickController ** null || _agent ** null) 
        {
            Debug.LogError("PlayerPointerMoveSystem is not properly configured");
            return;
        }

        if (_clickController.IsClick)
        {
            _agent.destination = _clickController.MousePosition;
        }
    }
}
```
{: file="PlayerPointerMoveSystem.cs" }

원래는 PlayerMoveSystem은 Rigidbody를 사용해서 이동을 구현했으나, NevMeshAgent랑 호환이 되지 않는 것 같았습니다. 따라서 PlayerMoveSystem도 NevMeshAgent를 사용하도록 변경했습니다. 

Speed는 그저 Player의 속도를 의미하는 Value Objects입니다.

```c#
public class Speed : MonoBehaviour
{
    [TabGroup("Setting", Icon = SdfIconType.GearFill)]
    public float InitValue;

    [TabGroup("Setting")]
    public bool IsDebug = false;

    [TabGroup("Event", Icon = SdfIconType.MegaphoneFill)]
    public UnityEvent OnValueChanged;
    
    private float _value;
    public float Value
    {
        get
        {
            return _value;
        }
        set
        {
            _value = Math.Max(value, 0);

            OnValueChanged?.Invoke();

            if (IsDebug)
            {
                Debug.Log($"Speed: {Value}");
            }
        }
    }

    void Start()
    {
        _value = InitValue;
    }
}
```
{: file="Speed.cs" }

![Animation 9.gif](/assets/img/posts/Animation 9.gif){: .shadow}
_Player Move_

## NevMeshAgent 느낌 개선

![Animation 10.gif](/assets/img/posts/Animation 10.gif){: .shadow}
_Before_

![Animation 11.gif](/assets/img/posts/Animation 11.gif){: .shadow}
_After_

NevMeshAgent의 회전 시스템이 마음에 들지 않았습니다. 회전 속도를 아무리 높혀도 원하는 느낌이 나오지 않아서, 그냥 직접 회전시키는 방식으로 바꿨습니다.

```c#
void Start()
{
    // 1. 회전 비활성화
    _agent.updateRotation = false;
}

void Update() 
{
    if (_agent == null)
    {
        Debug.LogError("BetterNavMeshAgent is not properly configured");
        return;
    }

    // 2. 회전 개선
    if (_agent.desiredVelocity.sqrMagnitude > 0.01f)
    {
        Vector3 lookrotation = _agent.desiredVelocity;
        transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(lookrotation), 10.0f * Time.deltaTime); 
    }
}
```
{: file="BetterNavMeshAgent.cs" }

## 화면 고정, 이동

![Animation 12.gif](/assets/img/posts/Animation 12.gif){: .shadow}
_Camera Lock and Move_

```c#
public class CameraLockSystem : MonoBehaviour
{
    [TabGroup("Setting", Icon = SdfIconType.GearFill)]
    [Tooltip("카메라 이동 속도")]
    public float CameraMoveSpeed = 50f;

    [TabGroup("Setting")]
    [Tooltip("스크린 테두리의의 감지 영역 (픽셀 단위)")]
    public float BorderThickness = 10f;

    [TabGroup("Setting")]
    [Tooltip("초기 잠금 여부")]
    public bool IsAwakeLock = true;

    [TabGroup("Dependency", Icon = SdfIconType.Diagram2Fill)]
    [SerializeField] private CameraLockController _cameraLockController;
    
    [TabGroup("Dependency")]
    [SerializeField] private Transform _target;

    private void Awake()

    {
        if (IsAwakeLock)
        {
            _cameraLockController.Lock();
        }
    }

    void Update()
    {
        // 창이 포커스 되어있지 않으면 실행하지 않음
        if (!Application.isFocused)
            return;

        if (_cameraLockController ** null || _target ** null)
        {
            Debug.LogError("CameraLockSystem is not properly configured");
            return;
        }

        if (_cameraLockController.IsLock)
        {
            transform.position = _target.position;
        }
        else
        {
            Vector3 mousePos = Input.mousePosition;
            float screenWidth = Screen.width;
            float screenHeight = Screen.height;
            
            // 카메라 이동 방향 계산
            Vector3 moveDirection = Vector3.zero;
            
            // 좌우 이동: 마우스가 왼쪽 또는 오른쪽 테두리에 가까울 때
            if (mousePos.x < BorderThickness)
                moveDirection += -transform.right;
            else if (mousePos.x > screenWidth - BorderThickness)
                moveDirection += transform.right;
            
            // 상하 이동: 마우스가 화면 상단이나 하단 테두리에 가까울 때
            if (mousePos.y < BorderThickness)
                moveDirection += -transform.forward;
            else if (mousePos.y > screenHeight - BorderThickness)
                moveDirection += transform.forward;
            
            // 평면 이동을 위해 y축 요소는 제거
            moveDirection.y = 0;
            
            // moveDirection이 0이 아니면(즉, 커서가 테두리 근처라면) 이동 처리합니다.
            if (moveDirection != Vector3.zero)
            {
                transform.position += moveDirection.normalized * CameraMoveSpeed * Time.deltaTime;
            }
        }
    }
}
```
{: file="CameraLockSystem.cs" }

마치 롤처럼 Y를 누르면 화면 고정을 활성화/비활성화할 수 있고, 스페이스바를 누르면 화면고정되는 기능을 추가했습니다. 또 마우스를 통해 화면을 움직일 수 있도록 만들었습니다. 단순하게 스크린의 가장자리에 마우스가 있다면 Camera Target의 Transform을 해당 방향으로 옮기는 방식으로 구현했습니다.

---
## 다음 목표

![Pasted image 20250205012318.png](/assets/img/posts/Pasted image 20250205012318.png){: .shadow}

다음엔 에너미를 만드는 것이 목표입니다. 기존의 게임에선 에너미가 랜덤한 방향으로 사방에서 스폰됩니다. 이를 비슷하게 구현해보겠습니다.