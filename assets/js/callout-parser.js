// document.addEventListener('DOMContentLoaded', () => {
//   const blockquotes = document.querySelectorAll('blockquote');

//   blockquotes.forEach((quote) => {
//     const lines = quote.innerHTML.trim().split('\n');
//     const firstLine = lines[0];
//     const match = firstLine.match(/\[!(\w+)\]([+-])?\s*(.*)/);

//     if (match) {
//       const [fullMatch, type, fold, title] = match;
//       const content = lines.slice(1).join('\n');

//       const isFolded = fold === '-';

//       quote.className = `callout ${type.toLowerCase()} ${
//         isFolded ? 'is-folded' : ''
//       }`;
//       quote.innerHTML = `
//         <div class="callout-title">
//           <span class="callout-icon"></span>
//           <span>${title || type}</span>
//           <div class="fold-indicator">›</div>
//         </div>
//         <div class="callout-content">
//           <p>${content}</p>
//         </div>
//       `;

//       const titleEl = quote.querySelector('.callout-title');
//       titleEl.addEventListener('click', () => {
//         quote.classList.toggle('is-folded');
//       });
//     }
//   });
// });

document.addEventListener('DOMContentLoaded', () => {
  const blockquotes = document.querySelectorAll('blockquote');

  blockquotes.forEach((quote) => {
    // 1) 블록인용문 내 자식 노드들을 배열로 가져옵니다.
    const children = Array.from(quote.childNodes)
      // ELEMENT_NODE(1) 또는 TEXT_NODE(3)만 관심이 있으므로 필터
      .filter(
        (n) => n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE
      );

    // 자식이 전혀 없으면 패스
    if (children.length === 0) return;

    // 2) 가장 첫 번째 노드에서 텍스트를 뽑아서 callout 패턴을 찾습니다.
    let firstChild = children[0];
    // 텍스트 노드라면 textContent, 엘리먼트(p 등)라면 innerText 사용
    let text =
      firstChild.nodeType === Node.TEXT_NODE
        ? firstChild.textContent
        : firstChild.innerText;

    // 3) 콜아웃 패턴 정규식
    //    [!TYPE] 뒤에 +나 -가 있을 수도 없을 수도 있고, 뒤에 (타이틀) 부분이 있을 수도 없을 수도 있음
    //    ex) [!INFO] [!WARNING-] [!TIP+] 등
    const pattern = /^\[!(\w+)\]([+-])?\s*(.*)/;
    const match = text.trim().match(pattern);

    // 매칭 안 되면 이 blockquote는 callout 아님
    if (!match) return;

    const [_, calloutType, foldMark, titlePart] = match;
    const isFolded = foldMark === '-';
    // 만약 `[!INFO]`만 써서 제목이 없으면, 타입 자체를 제목으로 사용
    const calloutTitleText = titlePart || calloutType;

    // 4) 첫 노드에서 콜아웃 패턴 문구를 제거하고, 나머지 텍스트를 다시 세팅
    const newText = text.replace(pattern, '').trim();
    if (firstChild.nodeType === Node.TEXT_NODE) {
      firstChild.textContent = newText;
    } else {
      firstChild.innerText = newText;
    }

    // 5) blockquote 요소에 콜아웃 관련 클래스 지정
    //    (기존 'callout' + calloutType + fold 여부)
    quote.className = `callout ${calloutType.toLowerCase()}${
      isFolded ? ' is-folded' : ''
    }`;

    // 6) 콜아웃 상단(타이틀)과 내용 영역을 담을 요소 생성
    const titleEl = document.createElement('div');
    titleEl.className = 'callout-title';
    titleEl.innerHTML = `
      <span class="callout-icon"></span>
      <span>${calloutTitleText}</span>
      <div class="fold-indicator">›</div>
    `;

    const contentEl = document.createElement('div');
    contentEl.className = 'callout-content';

    // 7) 기존 blockquote 안의 모든 자식 노드를 contentEl로 옮기기
    //    (기존 첫 줄(패턴 부분)도 “나머지 텍스트”로 수정됐으므로 그대로 포함)
    while (quote.firstChild) {
      contentEl.appendChild(quote.firstChild);
    }

    // 8) blockquote 내부를 싹 비운 뒤, 새 구조(타이틀 + 내용)로 재구성
    quote.appendChild(titleEl);
    quote.appendChild(contentEl);

    // 9) 타이틀 클릭 시 접고 펴는 이벤트
    titleEl.addEventListener('click', () => {
      quote.classList.toggle('is-folded');
    });
  });
});
