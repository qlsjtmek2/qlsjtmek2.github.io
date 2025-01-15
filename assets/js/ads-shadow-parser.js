// 구글 광고가 로드되면 실행될 콜백 함수
function addShadowToAds() {
  document
    .querySelectorAll('.GoogleActiveViewElement')
    .forEach(function (element) {
      element.classList.add('shadow');
    });
}

// 구글 광고 로드 완료 이벤트 리스너 등록
if (window.adsbygoogle) {
  window.adsbygoogle.push(function () {
    addShadowToAds();
  });
} else {
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push(function () {
    addShadowToAds();
  });
}

// 페이지 로드 완료 후 한번 더 체크
window.addEventListener('load', function () {
  setTimeout(addShadowToAds, 1000); // 1초 후 실행
});
