document.addEventListener('DOMContentLoaded', function () {
  // 문서 전체에서 각주 문법을 찾아 변환
  document.querySelectorAll('p, li').forEach((element) => {
    element.innerHTML = element.innerHTML.replace(
      /\^\[(.*?)\]/g,
      '<sup class="footnote">$1</sup>'
    );
  });
});
