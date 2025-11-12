---
title: "WSL2 - Window Emulator 연결"
date: "2025-11-11 10:59:26"
categories: ["IT", "App Development"]
tags: []
math: true
toc: true
comments: true
---

## Questions
ADB가 무엇인가? Metro Bundler가 무엇인가? React Native는 어떻게 앱을 빌드하고, 어떻게 핫 리로드를 수행하는가? ADB 서버가 무엇인가? SDK는 뭐지? JDK는 왜 필요하지?

## Answers
**adb**란, android 기기와 다른 OS 환경 사이에 통신할 수 있게 만든 다리다. 클라이언트에서 명령을 내리면 그 명령이 서버로 전달되고, 서버는 명령을 Android 기기의 데몬(adbd)로 전달해 수행한다. 데몬이란, 안드로이드 백그라운드 프로세스이며 Android Debug Bridge다. 

**안드로이드 SDK**란, Software Development Kit의 약어며 Android 앱 개발에 필요한 모든 도구, API, 에뮬레이터, 문서, ADB의 모음이다. SDK가 그저 Software Development Kit라면, WSL2 환경과 Window 환경에 각각 SDK를 설치하여 독립적으로 사용해도 무방할 것이다. JDK도 동일한 맥락이다.

따라서 안드로이드 기기와 클라이언트가 원활히 통신 가능하려면, 안드로이드 기기와 클라이언트가 둘다 네트워크에 접속해있거나 USB로 연결되어있어야 하며, 둘 다 adb 서버에 접근 가능해야 한다.

adb 서버를 열고, WSL2 환경에서 adb 서버에 접속하고, 에뮬레이터에서도 adb 서버에 접속한다. 이러면 adb를 통해 WSL2 환경에서 에뮬레이터를 제어할 수 있는 환경이 마련된다. 그리고 adb 서버의 버전이 서로 같아야 할 것이다.

## 시행착오
Window, WSL2에 각각 SDK, JDK를 설치하고 환경 변수로 연결한다.
각각 adb의 버전을 체크한다.
```
adb --version
```
Window에서 adb 서버를 연다.
```
adb kill-server
adb -a nodaemon server start
```
IP와 포트를 WSL2에서 가져오고, 그곳으로 접속하도록 환경변수를 설정한다.
```
WSL_HOST=$$(ip route \mid  grep default \mid  awk '{print $$3}')
export ADB_SERVER_SOCKET=tcp:$$WSL_HOST:5037
```
5037은 adb 기본 포트이다.
에뮬레이터를 window에서 실행하면, window에서 실행되고 있는 adb server에 자동으로 연결한다.
```
emulator -avd Phone_9_16d
```

wsl에서 metro bundler server를 실행한다.
```
npx react-native start
```
wsl에서 adb에 연결된 emulator devices를 체크하고, 
```
adb devices
```
프로젝트 앱을 에뮬레이터에 빌드하고 설치한다.
```
npx react-native run-android --device emulator-5554
```
만약 앱이 이미 설치되어있다면, 그냥 metro bundler만 실행하고, 에뮬레이터가 네트워크에 연결만 되어있어도 hot reload가 가능하다. 따라서 다시 빌드해야할 때는 네이티브 라이브러리 의존성을 변경했을 경우, React Native 버전 업그레이드, SDK 버전 변경, 새로운 npm 패키지 설치 후, 앱 컴파일러 또는 환경 변경 시, **초기 앱 설치 및 배포 시** 등이다.

여기까지 했을 시, **문제가 발생한다.** run-android 명령어를 실행하고 나면, 빌드까지는 정상적으로 되지만 wsl의 Gradle가 window의 adb를 인식하지 못하는 문제가 발생했다. 이는 근본적으로 WSL과 Window의 네트워크가 분리되어있기 때문에 벌어진다.

WSL2는 NAT 네트워크를 사용한다.
```
Windows Network: 192.168.x.x
WSL2 Network:    172.x.x.x (별도 IP)
```
이로인해 발생하는 문제는 다음과 같다.

1. **Gradle installDebug 실패**
   - WSL2의 Gradle → Windows ADB 서버(127.0.0.1:5037) 연결 불가
   - DeviceMonitor가 다른 네트워크 대역의 ADB 서버를 찾지 못함

2. **Metro Bundler 연결 실패**
   - 에뮬레이터 → WSL2 Metro 서버(8081 포트) 연결 불가
   - JavaScript 번들 로딩 실패

해결책은, 네트워크를 미러링하여 WSL2와 Windows가 같은 localhost를 공유하도록 한다.
```
Before (NAT):
Windows: 192.168.1.100
WSL2:    172.29.36.1 ❌ 서로 다른 네트워크

After (Mirrored):
Windows: 192.168.1.100
WSL2:    192.168.1.100 ✅ 동일한 네트워크
```

이러면 WSL Gradle가 Windows ADB에 직접 연결할 수 있고, 에뮬레이터에서 WSL2 Metro에 직접 연결할 수 있다. socat을 사용한 포트포워딩도 불필요하며, Windows에서 adb 서버를 따로 켜야하는 불편함도 없어진다.

## 최종 해결책
### 환경 설정

**(1) `C:\Users\[사용자명]\.wslconfig` 파일 생성**
```ini
[wsl2]
networkingMode=mirrored
hostAddressLoopback=true
dnsTunneling=true
autoProxy=true
```

**(2) wsl 재시작**
```powershell
wsl --shutdown
```

**(3) 방화벽 규칙 추가**
Windows Defender 방화벽 → 고급 설정 → 인바운드 규칙 → 새 규칙
- 포트: TCP 5037 (ADB), 8081 (Metro)
- 작업: 연결 허용
- 프로필: 도메인, 프라이빗, 퍼블릭
- 원격 IP: 172.16.0.0/12 (WSL2 IP 범위)


**(4) WSL2의 `~/.bashrc` 파일 끝에 다음 환경변수 추가 후 적용**
```bash
# Android SDK
export ANDROID_HOME=/home/사용자명/Android/Sdk
export ANDROID_SDK_ROOT=/home/사용자명/Android/Sdk
export PATH=$$PATH:$$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$$PATH:$$ANDROID_HOME/platform-tools

# Windows ADB 사용 (중요!)
alias adb="/mnt/c/Users/사용자명/AppData/Local/Android/Sdk/platform-tools/adb.exe"
```

**(4-1) 적용**
```bash
source ~/.bashrc
```
(4-2) 만약 ADB_SERVER_SOCKET 또는 WSL_HOST를 적용했다면, 다음 명령어를 통해 제거한다.
```bash
unset ADB_SERVER_SOCKET WSL_HOST
```

**(5) 검증**
```
which adb
wslinfo --networking-mode
# 출력: mirrored ✅
```

### 실제 빌드

**(1) react-native metro server 시작**
```
react-native start --host 127.0.0.1
```

**(2) Window에서 에뮬레이터 시작**
```powershell
# devices 검색
adb devices
emulator -avd device_id
```

**(3) build 후 앱 설치**
```
react-native run-android --deviceId=device-id
```

**(4) 각종 디버깅 명령**
```bash
# 디버그 도구 열기
adb shell input keyevent 82

# 리로딩
adb shell input keyevent 46 && adb shell input keyevent 46

# 로그 확인
adb logcat | grep ReactNative

# 전체 로그 확인 (네이티브 모듈 문제시)
adb logcat
```

### 자동화 전략

**(1) package.json 설정**
```json
"scripts": {
    "android": "react-native run-android --deviceId=emulator-5554",
    "emulator:phone": "powershell.exe -Command \"& { \\$$env:JAVA_HOME='C:\\Program Files\\Android\\Android Studio\\jbr'; & 'C:\\Users\\shinhuigon\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe' -avd Phone_9_16 }\"",
    "debug:menu": "adb shell input keyevent 82",
    "debug:reload": "adb shell input keyevent 46 && adb shell input keyevent 46",
    "debug:logs": "adb logcat | grep ReactNative",
    "debug:logs-all": "adb logcat",
}
```

**(2) 다음 명령어를 순차적으로 실행**
```bash
npm run emulator:phone
npm start
npm run android
```

**(3) 디버깅 도구**
```bash
# 코드 수정 후
npm run debug:reload  # 앱 새로고침

# 1. 에러 발생 시
npm run debug:logs          # 로그 확인

# 2. 디버그 도구 필요 시
npm run debug:menu          # Chrome DevTools, Inspector 등

# 3. 네이티브 모듈 문제 시
npm run debug:logs-all      # 전체 로그에서 원인 찾기
```