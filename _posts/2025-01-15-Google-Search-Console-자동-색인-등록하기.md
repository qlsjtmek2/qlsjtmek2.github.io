---
title: "Google Search Console 자동 색인 등록하기"
date: "2025-01-15 12:42:32"
categories: ["Github Pages"]
tags: ["Google Search Console", "Web Search Indexing API", "Python", "색인 요청", "서비스 계정", "JSON", "GUI", "URL 목록"]
math: true
toc: true
comments: true
---

![Pasted image 20250115124706.png](/assets/img/posts/Pasted image 20250115124706.png){: .shadow}

Google Search Console에서 직접 색인 요청을 하려면 모든 URL에 대해 일일히 요청해야 합니다. 이 과정을 조금이나마 편하게 만들어 보겠습니다. Google에서 제공하는 **Web Search Indexing API**를 사용할 것입니다.

## 전제 조건

1. [Google Search Console](https://search.google.com/search-console?hl=ko)에 블로그를 등록한 상태입니다.
2. 블로그에 sitemap.xml을 업로드했습니다.
3. Python이 설치되어 있고, pip를 사용할 수 있습니다.

## 과정

[Google Cloud](https://console.cloud.google.com/)에 접속하여 로그인합니다. 이후 새 프로젝트를 생성합니다.

![Pasted image 20250115125122.png](/assets/img/posts/Pasted image 20250115125122.png){: .shadow}

![Pasted image 20250115125147.png](/assets/img/posts/Pasted image 20250115125147.png){: .shadow}

상단에서 **Web Search Indexing API**를 검색합니다. 이후 들어가 사용을 클릭합니다.

![Pasted image 20250115125305.png](/assets/img/posts/Pasted image 20250115125305.png){: .shadow}

이후 서비스 계정을 만들어야 합니다. `사용자 인증 정보 > 서비스 계정 관리`로 들어가 `서비스 계정 만들기`를 클릭합니다.

![Pasted image 20250115125547.png](/assets/img/posts/Pasted image 20250115125547.png){: .shadow}

![Pasted image 20250115125635.png](/assets/img/posts/Pasted image 20250115125635.png){: .shadow}

대충 본인의 ID를 넣고 `만들고 계속하기 > 계속 > 계속` 누르면 됩니다. 선택사항은 굳이 채울 필요가 없습니다.

![Pasted image 20250115125717.png](/assets/img/posts/Pasted image 20250115125717.png){: .shadow}

이후 생성된 서비스 계정의 `작업(점 세개) > 키 관리 > 키 추가 > 새 키 만들기`를 클릭해 **JSON**으로 생성합니다.

![Pasted image 20250115125838.png](/assets/img/posts/Pasted image 20250115125838.png){: .shadow}

최종적으로 `project-..-..json` 파일을 얻을 수 있습니다. 이를 잘 저장해둡시다.

파일을 열고, "client_email" 부분의 `id-숫자@...iam.gserviceaccount.com` 이메일 항목을 복사해둡니다.

이후 Search Sonsole로 들어가 `설정 > 사용자 및 권한 > 사용자 추가`로 들어가 복사해둔 이메일을 입력하고, 권한을 소유자료 변경하여 추가합니다. 여기까지 진행하면 사전 작업은 완료됩니다.

![Pasted image 20250115130245.png](/assets/img/posts/Pasted image 20250115130245.png){: .shadow}

```shell
pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2
```

위 명령어를 터미널에 입력하여 api를 설치합니다. 이후 파이썬 파일을 하나 생성하여 아래 코드를 복사하여 붙여넣습니다.

```python
import json
from googleapiclient.discovery import build
from google.oauth2 import service_account
import tkinter as tk
from tkinter import ttk, scrolledtext

# ---------------------------------------------------------
# 1. 서비스 계정 키 파일 경로 설정
# ---------------------------------------------------------
SERVICE_ACCOUNT_FILE = './service_account_key.json'  # 실제 키 파일 경로


# ---------------------------------------------------------
# 2. 서비스 계정 인증 객체 생성
#    - 권한 범위: <https://www.googleapis.com/auth/indexing>
# ---------------------------------------------------------
SCOPES = ['<https://www.googleapis.com/auth/indexing'>]
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

# ---------------------------------------------------------
# 3. Indexing API 클라이언트 생성
# ---------------------------------------------------------
service = build('indexing', 'v3', credentials=credentials)


def publish_to_indexing_api(url_list, action='URL_UPDATED'):
    """
    Google Indexing API에 URL을 등록(색인 요청)하거나 색인을 제거(삭제 요청)하는 함수.
    :param url_list: 색인 대상이 될 URL 목록 (list)
    :param action: 'URL_UPDATED' or 'URL_DELETED'
                   - 'URL_UPDATED' -> 색인 요청
                   - 'URL_DELETED' -> 색인 제거 요청
    """
    body = {
        "url": "",       # 실제 요청 시 반복문에서 개별 URL로 대체
        "type": action   # URL_UPDATED or URL_DELETED
    }

    results = []
    for url in url_list:
        body["url"] = url
        try:
            # ---------------------------------------------------------
            # 4. API 호출 (urls: publish 메서드)
            # ---------------------------------------------------------
            request = service.urlNotifications().publish(body=body)
            response = request.execute()

            result = f"[{action.upper()}] {url} --> 결과: {response}"
            print(result)
            results.append(result)

        except Exception as e:
            error_msg = f"[에러] {url}: {e}"
            print(error_msg)
            results.append(error_msg)

    # GUI의 결과 텍스트 영역에 결과 표시
    if hasattr(app, 'result_text'):
        app.result_text.insert(tk.END, "\n".join(results) + "\n")

class IndexingUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Google 색인 요청 도구")

        # URL 입력 영역
        url_frame = ttk.LabelFrame(root, text="URL 목록 입력", padding="10")
        url_frame.pack(fill="both", expand=True, padx=10, pady=5)

        self.url_text = scrolledtext.ScrolledText(url_frame, height=10)
        self.url_text.pack(fill="both", expand=True)

        # 버튼 영역
        btn_frame = ttk.Frame(root, padding="10")
        btn_frame.pack(fill="x", padx=10, pady=5)

        ttk.Button(btn_frame, text="색인 요청", command=self.request_indexing).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="색인 제거", command=self.request_deletion).pack(side="left", padx=5)

        # 결과 표시 영역
        result_frame = ttk.LabelFrame(root, text="결과", padding="10")
        result_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        self.result_text = scrolledtext.ScrolledText(result_frame, height=10)
        self.result_text.pack(fill="both", expand=True)

    def get_url_list(self):
        urls = self.url_text.get("1.0", tk.END).strip().split("\n")
        return [url.strip() for url in urls if url.strip()]

    def request_indexing(self):
        urls = self.get_url_list()
        if urls:
            self.result_text.delete("1.0", tk.END)
            self.result_text.insert(tk.END, "색인 요청 처리 중...\n")
            publish_to_indexing_api(urls, action='URL_UPDATED')

    def request_deletion(self):
        urls = self.get_url_list()
        if urls:
            self.result_text.delete("1.0", tk.END)
            self.result_text.insert(tk.END, "색인 제거 처리 중...\n")
            publish_to_indexing_api(urls, action='URL_DELETED')

if __name__ == "__main__":
    root = tk.Tk()
    app = IndexingUI(root)
    root.mainloop()
```

아까 다운로드 받았던 .json 파일의 이름을 `service_account_key.json`으로 수정하여 `.py` 파일과 같은 위치에 넣습니다. 이후 실행하면 다음과 같은 창을 볼 수 있습니다.

![Pasted image 20250115130651.png](/assets/img/posts/Pasted image 20250115130651.png){: width="600" .shadow}

URL 입력부에 URL를 입력하고 색인 요청을 하면 됩니다. 요청이 성공적으로 전달되면, `결과: ~~` 이런 메세지가 뜹니다. 제대로 작동하지 않았을 경우, 오류 문구가 뜹니다. 

![Pasted image 20250115130802.png](/assets/img/posts/Pasted image 20250115130802.png){: width="600" .shadow}

개인적으론 배치파일을 하나 만들어서 관리하고 있습니다.

![Pasted image 20250115130935.png](/assets/img/posts/Pasted image 20250115130935.png){: .shadow}

아래는 `Search Console 자동 색인.bat` 파일의 내용입니다.

```bat
@echo off
python "Search Sonole 자동 색인.py"
pause
```