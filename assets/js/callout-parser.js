document.addEventListener('DOMContentLoaded', function () {
  // 재귀적으로 Callout을 처리하는 함수
  function processCallouts(element) {
    // 현재 element(혹은 문서 범위)에서 blockquote를 찾음
    const blockquotes = element.querySelectorAll('blockquote');
    blockquotes.forEach((quote) => {
      // 내부에 [!] 문구가 있는지 확인
      if (quote.innerHTML.includes('[!')) {
        // 정규식으로 [!타입](-옵션){title} 구조 찾기
        const match = quote.innerHTML.match(/\[!(.*?)\](-?)(.*?){title}/);
        if (match) {
          const type = match[1].toLowerCase();
          const isCollapsible = match[2] === '-';
          const title = match[3].trim();

          // callout용 div 생성
          const calloutDiv = document.createElement('div');
          calloutDiv.className = `callout ${type} ${
            isCollapsible ? 'callout-collapsed' : ''
          }`;

          // blockquote 본문에서 [! ... ] 부분을 제거한 나머지
          const content = quote.innerHTML.replace(
            /\[!(.*?)\](-?)(.*?){title}/,
            ''
          );
          // callout 구조의 HTML 작성
          calloutDiv.innerHTML = `
            <div class="callout-title">
              <span class="callout-icon"></span>
              <span class="callout-title-text">${title}</span>
              <span class="fold-indicator">›</span>
            </div>
            <div class="callout-content">
              ${content}
            </div>
          `;

          // 접기/펼치기 이벤트
          const titleElement = calloutDiv.querySelector('.callout-title');
          titleElement.addEventListener('click', () => {
            calloutDiv.classList.toggle('callout-collapsed');
          });

          // 기존 blockquote를 calloutDiv로 교체
          quote.parentNode.replaceChild(calloutDiv, quote);

          // **중첩 blockquote** 처리를 위해,
          // 방금 만든 calloutDiv 내부의 .callout-content 영역을 다시 스캔
          processCallouts(calloutDiv.querySelector('.callout-content'));
        }
      }
    });
  }

  // 문서 로드 후 최상위부터 시작
  processCallouts(document.body);
});
