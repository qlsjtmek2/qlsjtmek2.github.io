---
title: "Project OneMinute - 개발 일지 (4)"
date: "2025-02-11 24:16:42"
categories: ["Unity", "Projects"]
tags: []
math: true
toc: true
comments: true
---

## 다국어 지원

Localization Package를 이용하여 여러 언어를 지원하도록 만들었습니다. 방법은 [\[유니티 TIPS\] Unity 로컬라이제이션 패키지로 다국어 시스템 간편하게 구축하기! - YouTube](https://www.youtube.com/watch?v=VNhzMEsy7xc&t=1296s) 유튜브를 참고했습니다. 

Localization Tables을 CSV로 저장해서 엑셀로 열고, AI를 통해 자동으로 번역하면 과정이 아주 수월해질 것이라고 생각했습니다.

![Pasted image 20250210205827.png](/assets/img/posts/Pasted image 20250210205827.png){: .shadow}
_깨짐_

CSV 파일을 바로 열었더니 깨지는 문제가 있었습니다. 검색해보니, 빈 엑셀을 열고 `데이터->텍스트/CSV`로 들어가서 Export한 CSV 파일을 UTF-8 인코딩으로 로드하면 된다고 합니다.

![Pasted image 20250210205654.png](/assets/img/posts/Pasted image 20250210205654.png){: .shadow}
_해결_

이후 GPT한테 다음과 같은 프롬프트로 표와 함께 번역을 요청했습니다.

- `나는 다중 언어를 지원하고싶어. 각 언어에 맞게 번역하여 표를 채워줘.`

![Pasted image 20250210205738.png](/assets/img/posts/Pasted image 20250210205738.png){: .shadow}
_결과_

이후 엑셀에 붙여넣고, 유니티에서 Table을 Import하니 성공적으로 불러와졌습니다. 앞으로 번역은 이런 과정으로 진행하면 될 것 같습니다.

![Pasted image 20250210205746.png](/assets/img/posts/Pasted image 20250210205746.png){: .shadow}

![Pasted image 20250212171444.png](/assets/img/posts/Pasted image 20250212171444.png){: .shadow}

## 버그 수정

![Pasted image 20250210201706.png](/assets/img/posts/Pasted image 20250210201706.png){: .shadow}
_수정 전전_

적용하고 나니 글씨의 정렬이 삐뚤해지는 문제가 있어 수정했습니다.

![Pasted image 20250210203833.png](/assets/img/posts/Pasted image 20250210203833.png){: .shadow}
_수정 이후_

Text에 붙여둔 Content Size fitter의 `Horizontal Fit`의 설정을 `Unconstrained`로 바꿨습니다. 이후 Width를 300으로 고정하고, `Text Wrapping Mode : Normal`, `Overflow : Overflow`로 설정했습니다.

![Pasted image 20250210203853.png](/assets/img/posts/Pasted image 20250210203853.png){: .shadow}

![Pasted image 20250212171043.png](/assets/img/posts/Pasted image 20250212171043.png){: .shadow}
_TextMeshPro - Text (UI) Component_

## 다국어 폰트 지원

![Pasted image 20250210201716.png](/assets/img/posts/Pasted image 20250210201716.png){: .shadow}
_Japenese_

폰트가 깨지는 문제가 있어, 이를 해결해야 했습니다. 찾아보니 NotoSans가 대부분의 언어를 지원하는 폰트라기에, 임시로 사용하기로 했습니다.

NotoSans 폰트를 다운받고, 유니티에 불러왔습니다. 폰트를 선택해 Ctrl + Shift + F12 단축키로 TMP Font Assets 생성 후 Fallback Font Assets를 지정했습니다.

![Pasted image 20250212165427.png](/assets/img/posts/Pasted image 20250212165427.png){: .shadow}
_Fallback Font Assets_

이 기능은 현재 폰트에 없는 문자가 있다면 자동으로 Fallback Font에서 찾아서 그 폰트를 사용한다고 합니다.
- 참고 : [Unity Localization with Automatic Translation and TextMeshPro - YouTube](https://www.youtube.com/watch?v=NFn74l2WA_8)

![Animation 15.gif](/assets/img/posts/Animation 15.gif){: .shadow}

## 다음 목표

- 플레이어 이동이 좀 더 자연스러워지도록 가속 추가
- 조이스틱의 위치를 고정된 위치에서 터치한 위치에서 생성되도록 변경
- 플레이어 사망