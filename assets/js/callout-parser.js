document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('blockquote').forEach((quote) => {
    if (quote.innerHTML.includes('[!')) {
      const match = quote.innerHTML.match(/\[!(.*?)\](-?)(.*?){title}/);
      if (match) {
        const type = match[1].toLowerCase();
        const isCollapsible = match[2] === '-';
        const title = match[3].trim();

        // div 엘리먼트 생성
        const calloutDiv = document.createElement('div');

        // 클래스 및 내용 설정
        calloutDiv.className = `callout ${type} ${
          isCollapsible ? 'callout-collapsed' : ''
        }`;

        // 콘텐츠를 분리하여 접을 수 있는 구조로 변경
        const content = quote.innerHTML.replace(
          /\[!(.*?)\](-?)(.*?){title}/,
          ''
        );
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

        // 접기/펼치기 이벤트 추가
        const titleElement = calloutDiv.querySelector('.callout-title');
        titleElement.addEventListener('click', () => {
          calloutDiv.classList.toggle('callout-collapsed');
        });

        // blockquote를 새로운 div로 교체
        quote.parentNode.replaceChild(calloutDiv, quote);
      }
    }
  });
});
