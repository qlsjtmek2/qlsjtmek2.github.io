document.addEventListener('DOMContentLoaded', () => {
  // prompt-{type} 클래스가 달린 blockquote 모두 선택
  const titleBlockquotes = document.querySelectorAll(
    'blockquote.prompt-tip, blockquote.prompt-info, blockquote.prompt-warning, blockquote.prompt-danger'
  );

  titleBlockquotes.forEach((titleBQ) => {
    // 다음 형제 노드가 "내용" blockquote인지 확인
    const contentBQ = titleBQ.nextElementSibling;
    if (!contentBQ) return; // 형제 노드가 없으면 패스
    if (contentBQ.tagName !== 'BLOCKQUOTE') return; // 다음 형제가 blockquote가 아니면 패스

    // prompt-{type} 에서 type 추출
    // (classList 중 prompt- 로 시작하는 것을 찾아서 뒤쪽만 떼어 씁니다)
    const classList = Array.from(titleBQ.classList);
    const promptClass = classList.find((c) => c.startsWith('prompt-'));
    if (!promptClass) return; // 혹시라도 못 찾으면 패스
    const calloutType = promptClass.replace('prompt-', ''); // tip, info, warning, danger

    // ----------------------------
    // 1) 새로운 callout 컨테이너 생성
    // ----------------------------
    const calloutDiv = document.createElement('div');
    calloutDiv.className = `callout ${calloutType}`;

    // ----------------------------
    // 2) title 영역 만들기
    // ----------------------------
    const titleEl = document.createElement('div');
    titleEl.className = 'callout-title';

    // 아이콘 엘리먼트 추가
    const iconEl = document.createElement('span');
    iconEl.className = 'callout-icon';

    // 접기 표시기 추가
    const foldIndicator = document.createElement('span');
    foldIndicator.className = 'fold-indicator';
    foldIndicator.textContent = '›';

    // 제목 텍스트를 위한 span
    const titleText = document.createElement('span');
    titleText.className = 'callout-title-text';

    // (A) titleBQ.innerHTML을 가져와서, 공백 제거 후 비었는지 확인
    let extractedTitle = titleBQ.innerHTML.trim();

    // (B) 비었다면, 해당 calloutType을 'Tip', 'Info', 'Warning', 'Danger' 형태로 대체
    if (!extractedTitle) {
      extractedTitle =
        calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
    } else {
      // ]와 {title} 사이의 텍스트를 제목으로 추출
      const titleMatch = extractedTitle.match(/\](.*?)\{title\}/);
      if (titleMatch) {
        extractedTitle = titleMatch[1].trim();
      }
    }

    // (C) titleText에 최종 타이틀 넣기
    titleText.innerHTML = extractedTitle;

    // title 구조 조립
    titleEl.appendChild(iconEl);
    titleEl.appendChild(titleText);
    titleEl.appendChild(foldIndicator);

    // 접기 기능 추가 - 만약 prompt-{type}- 형식이면 기본적으로 접혀있도록 설정
    const isFolded = promptClass.endsWith('-');
    if (isFolded) {
      calloutDiv.classList.add('is-folded');
    }

    // ----------------------------
    // 3) content 영역 만들기
    // ----------------------------
    const contentEl = document.createElement('div');
    contentEl.className = 'callout-content';
    // 내용으로 쓸 것: 두 번째 blockquote의 내부 HTML
    contentEl.innerHTML = contentBQ.innerHTML;

    // ----------------------------
    // 4) callout 구조 조립
    // ----------------------------
    calloutDiv.appendChild(titleEl);
    calloutDiv.appendChild(contentEl);

    // ----------------------------
    // 5) DOM에 삽입: 원래 titleBQ 자리 앞에 calloutDiv 삽입
    //    이후에 기존 blockquote 2개를 제거
    // ----------------------------
    titleBQ.parentNode.insertBefore(calloutDiv, titleBQ);
    titleBQ.remove();
    contentBQ.remove();
  });
});
