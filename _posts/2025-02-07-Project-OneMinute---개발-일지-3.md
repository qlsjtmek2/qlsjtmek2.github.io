---
title: "Project OneMinute - 개발 일지 (3)"
date: "2025-02-07 16:14:05"
categories: ["Unity", "Projects"]
tags: []
math: true
toc: true
comments: true
---

## Enemy Shooter

![Pasted image 20250208005336.png](/assets/img/posts/Pasted image 20250208005336.png){: .shadow}

총알을 발사하는 **Spawner**를 구현했습니다. `EnemyPool`에서 오브젝트 풀링을 담당하고, `EnemyShooter`에서 에너미 스폰을 관리합니다. 소환된 에너미는 바라보는 방향으로 나아가며, Enemy가 비활성화되면 EnemyPool에 반환됩니다.

```c#
// 적 객체를 요청할 때 사용하는 메서드로, 성공 여부를 bool로 반환하고 out Enemy를 전달합니다.
public bool GetEnemy(Vector3 position, Quaternion rotation, out Enemy enemy)
{
    if (enemyQueue.Count > 0)
    {
        enemy = enemyQueue.Dequeue();
        enemy.transform.position = position;
        enemy.transform.rotation = rotation;
        enemy.gameObject.SetActive(true);
        return true;
    }
    else
    {
        enemy = null;
        return false;
    }
}

public void ReturnEnemy(Enemy enemy)
{
    enemy.gameObject.SetActive(false);
    enemyQueue.Enqueue(enemy);
}
```
{: file="EnemyPool.cs" }

```c#
private IEnumerator EnemySpawnRoutine()
{
    while (true)
    {
        ShootEnemy();

        // 기본 발사 주기와 랜덤 오프셋을 적용합니다.
        float baseInterval = (settings != null) ? settings.SpawnInterval : 1f;
        float spawnIntervalRange = (settings != null) ? settings.SpawnIntervalRange : 0f;
        float randomOffset = Random.Range(-spawnIntervalRange, spawnIntervalRange);
        float interval = Mathf.Max(0f, baseInterval + randomOffset); // 0 이하가 되지 않도록 보정

        yield return new WaitForSeconds(interval);
    }
}

public void ShootEnemy()
{
    if (_enemyPool.GetEnemyCount() > 0)
    {
        var randomizedDirection = GetRandomDirection(transform.forward);
        var position = SpawnPosition.position;
        var rotation = Quaternion.LookRotation(randomizedDirection);

        if (_enemyPool.GetEnemy(position, rotation, out Enemy enemy))
        {
            enemy.Speed = currentSpeed;
            enemy.gameObject.SetActive(true);
        }
    }
}
```
{: file="EnemyShooter.cs" }

## Enemy Shooter 배치

![Animation 13.gif](/assets/img/posts/Animation 13.gif){: .shadow}
_Auto Batcher_

Shooter를 일일히 Scene에서 노가다로 배치하고싶지 않았기 때문에, 자동으로 배치해주는 도구를 만들었습니다. 두 지점을 지정하면, 그 선분 내에 일정한 간격으로 오브젝트가 배치되는 간단한 도구입니다.

```c#
using UnityEngine;
using System.Collections.Generic;
using Sirenix.OdinInspector;

#if UNITY_EDITOR
using UnityEditor;
#endif

[ExecuteAlways]
public class EnemyShooterPlacer : MonoBehaviour
{
    [TabGroup("Settings", Icon = SdfIconType.GearFill)]
    [Tooltip("라인의 시작점")]
    public Transform lineStart;

    [TabGroup("Settings", Icon = SdfIconType.GearFill)]
    [Tooltip("라인의 끝점")]
    public Transform lineEnd;

    [TabGroup("Settings", Icon = SdfIconType.GearFill)]
    [Tooltip("배치할 Enemy Shooter 프리팹")]
    public GameObject enemyShooterPrefab;

    [TabGroup("Settings")]
    [Tooltip("프리팹 간 간격 (유닛)")]
    public float placementInterval = 5f;

    [TabGroup("Settings")]
    [Tooltip("배치한 프리팹들을 이 오브젝트의 자식으로 구성할지 여부")]
    public bool organizeUnderThisTransform = true;

    [TabGroup("Settings", Icon = SdfIconType.GearFill)]
    [Tooltip("일괄 로테이션 오프셋 (Euler 각도)")]
    public Vector3 rotationOffset;

    // ContextMenu를 통해 실행하여 프리팹을 선(Line) 상에 배치합니다.
    [Button("Prefabs 배치하기")]
    public void PlaceEnemyShooters()
    {
        // 유효성 검사
        if (lineStart ** null || lineEnd ** null)
        {
            Debug.LogError("라인의 시작점과 끝점을 반드시 설정해야 합니다.");
            return;
        }

        if (enemyShooterPrefab == null)
        {
            Debug.LogError("배치할 Enemy Shooter 프리팹이 설정되지 않았습니다.");
            return;
        }
        
        if (placementInterval <= 0)
        {
            Debug.LogError("placementInterval 값은 0보다 커야 합니다.");
            return;
        }
        
        // 이전에 배치된 프리팹들을 제거합니다.
        ClearPlacedPrefabs();
        
        Vector3 startPos = lineStart.position;
        Vector3 endPos = lineEnd.position;
        float distance = Vector3.Distance(startPos, endPos);

        // 간격에 따른 배치 개수 계산 
        // (시작점과 끝점을 포함하기 위해 +1)
        int count = Mathf.FloorToInt(distance / placementInterval) + 1;
        if (count < 2)
            count = 2;
        
        // 라인의 방향 구하기 
        Vector3 direction = (endPos - startPos).normalized;
        // 기본 회전은 라인의 방향을 따라 결정됩니다.
        Quaternion baseRotation = Quaternion.LookRotation(direction);
        // 일괄 로테이션 오프셋을 적용하여 최종 회전 생성
        Quaternion finalRotation = baseRotation * Quaternion.Euler(rotationOffset);

        // 계산된 개수만큼 선 상에 프리팹 배치 (Lerp 함수로 보간)
        for (int i = 0; i < count; i++)
        {
            float t = (float)i / (count - 1);   // 0부터 1 사이의 보간 값
            Vector3 position = Vector3.Lerp(startPos, endPos, t);

            GameObject instance = Instantiate(enemyShooterPrefab, position, finalRotation);
            // 옵션에 따라 배치한 오브젝트를 이 오브젝트의 자식으로 지정
            if (organizeUnderThisTransform)
            {
                instance.transform.parent = this.transform;
            }
            
            // 편의를 위해 이름 변경
            instance.name = enemyShooterPrefab.name + "_" + i;
        }
    }

    // ContextMenu를 통해 실행하면, 이전에 배치된 프리팹들을 삭제합니다.
    [Button("배치한 Prefabs 삭제하기")]
    public void ClearPlacedPrefabs()
    {
        if (organizeUnderThisTransform)
        {
            #if UNITY_EDITOR
            // 에디터 모드에서 자식 오브젝트를 안전하게 삭제
            List<GameObject> children = new List<GameObject>();
            foreach (Transform child in transform)
            {
                children.Add(child.gameObject);
            }
            foreach (GameObject child in children)
            {
                Undo.DestroyObjectImmediate(child);
            }
            #else
            foreach (Transform child in transform)
            {
                Destroy(child.gameObject);
            }
            #endif
        }
    }

    // Scene 뷰에서 lineStart와 lineEnd를 잇는 라인을 Gizmos로 표시합니다.
    private void OnDrawGizmos()
    {
        if (lineStart != null && lineEnd != null)
        {
            Gizmos.color = Color.cyan;
            Gizmos.DrawLine(lineStart.position, lineEnd.position);

            // 시작점과 끝점에 작은 구체도 그려서 위치를 강조합니다.
            Gizmos.DrawSphere(lineStart.position, 0.2f);
            Gizmos.DrawSphere(lineEnd.position, 0.2f);
        }
    }
} 
```
{: file="EnemyShooterPlacer.cs" }

사용된 버튼이나 탭 그룹은 오딘 인스펙터를 사용합니다.

## 결과

![Animation 14.gif](/assets/img/posts/Animation 14.gif){: .shadow}

## 타이머, 조이스틱, 정지 버튼 추가

![Pasted image 20250211001225.png](/assets/img/posts/Pasted image 20250211001225.png){: .shadow}

조이스틱은 Input System의 On-Screen 컴포넌트를 사용하려했으나, 버그가 있는것 같아 그냥 만들었습니다.

```c#
public class Joystick : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler, IPointerDownHandler
{
    [TabGroup("Dependency", Icon = SdfIconType.Diagram2Fill)]
    public RectTransform Background;    // 조이스틱 배경

    [TabGroup("Dependency")]
    public RectTransform Handle;        // 조이스틱 핸들
    
    [TabGroup("Dependency", Icon = SdfIconType.Diagram2Fill)]
    [SerializeField] private MoveController _moveController;
    
    private float _maxDistance;
    
    void Start()
    {
        _maxDistance = Background.sizeDelta.x / 2f;
    }
    
    public void OnPointerDown(PointerEventData eventData)
    {
        UpdateHandlePosition(eventData);
    }
    
    public void OnDrag(PointerEventData eventData)
    {
        UpdateHandlePosition(eventData);
    }
    
    public void OnBeginDrag(PointerEventData eventData)
    {
        UpdateHandlePosition(eventData);
    }
    
    public void OnEndDrag(PointerEventData eventData)
    {
        Handle.anchoredPosition = Vector2.zero;
        if (_moveController != null)
        {
            _moveController.MoveDirection = Vector2.zero;
        }
    }
    
    private void UpdateHandlePosition(PointerEventData eventData)
    {
        Vector2 localPoint;
        // 스크린 좌표를 Background(RectTransform)의 로컬 좌표로 변환
        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
            Background, 
            eventData.position, 
            eventData.pressEventCamera, 
            out localPoint))
        {
            // 로컬 좌표 기준 방향(벡터) 계산 및 정규화
            Vector2 direction = localPoint;
            Vector2 normalizedInput = Vector2.ClampMagnitude(direction / _maxDistance, 1f);
            
            // Handle을 로컬 좌표 기준으로 이동
            Handle.anchoredPosition = normalizedInput * _maxDistance;
            
            // 플레이어 이동에 반영
            if (_moveController != null)
            {
                _moveController.MoveDirection = normalizedInput;
            }
        }
    }
}

```
{: file="Joystick.cs" }

![Pasted image 20250211001417.png](/assets/img/posts/Pasted image 20250211001417.png){: .shadow}
_Pause UI_

![Pasted image 20250211001436.png](/assets/img/posts/Pasted image 20250211001436.png){: .shadow}
_Option UI_

## 다음 목표

이후에는 다국어 지원 기능을 만들고, 플레이어 이동이 좀 더 자연스러워지도록 가속을 넣어보겠습니다.