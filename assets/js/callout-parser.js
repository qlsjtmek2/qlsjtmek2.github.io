document.addEventListener('DOMContentLoaded', () => {
  const blockquotes = document.querySelectorAll('blockquote');

  blockquotes.forEach((quote) => {
    const lines = quote.innerHTML.trim().split('\n');
    const firstLine = lines[0];
    const match = firstLine.match(/\[!(\w+)\]([+-])?\s*(.*)/);

    if (match) {
      const [fullMatch, type, fold, title] = match;
      const content = lines.slice(1).join('\n');

      const isFolded = fold === '-';

      quote.className = `callout ${type.toLowerCase()} ${
        isFolded ? 'is-folded' : ''
      }`;
      quote.innerHTML = `
        <div class="callout-title">
          <span class="callout-icon"></span>
          <span>${title || type}</span>
          <div class="fold-indicator">›</div>
        </div>
        <div class="callout-content">
          <p>${content}</p>
        </div>
      `;

      const titleEl = quote.querySelector('.callout-title');
      titleEl.addEventListener('click', () => {
        quote.classList.toggle('is-folded');
      });
    }
  });
});
