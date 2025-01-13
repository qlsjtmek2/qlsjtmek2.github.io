---
title: "시스템 프로그래밍 9. Multiplexed IO"
date: "2024-11-28 15:17:37"
categories: ["IT", "시스템 프로그래밍"]
tags: ["Multiplexed I/O", "File descriptor set", "select", "pselect", "네트워크 프로그래밍", "시스템 프로그래밍", "진현욱 교수", "클라이언트"]
math: true
toc: true
comments: true
---

건국대학교 시스템 프로그래밍 진현욱 교수님의 수업을 정리한 내용입니다.

## Why is it use?

Multiplexed I/O란, 여러개의 File에 적히는 값을 하나의 Thread에서 읽기 위해 사용되는 기술이다. 여러 파일을 모니터링하는 방법이라고 생각해도 된다. 여러개의 File을 읽기 위해서는 여러개의 File에 대해 Read를 수행해야 한다. 만약, File1를 Read하면 File1에 어떤 내용이 적힐 때까지 하염없이 기다리는 상태가 된다. 그 과정에서 다른 파일에서 값이 적혀도 그 파일의 값을 읽어들일 수 없는 상태다. 이는 너무 비효율적이다. 모든 파일을 한번에 모니터링하면서, 내용이 적힌 파일만 딱딱 알아내는 방법이 있으면 좋지 않을까?

## File descriptor set

- `FD_ZERO(fd_set *set)`
- `FD_SET(int fd, fd_set *set)`
- `FD_CLR(int fd, fd_set *set)`
- `FD_ISSET(int fd, fd_set *set)`

여러개의 File을 관찰하고 싶으므로, FIle descriptor set을 정의해야 한다. 먼저, `fd_set fds;`변수를 정의하고, `FD_ZERO(&fds)`로 초기화한다. FD_SET으로 fd를 추가할 수 있으며, FD_CLR로 set에서 fd를 제거할 수 있다. 만약 fd_set 안에 특정 fd가 있는지 체크하고 싶다면 FD_ISSET를 사용하면 된다.

## How to use?

- `int select(int n, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout)`
- `int pselect(int n, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, const struct timespec *timeout, const sigset_t *sigmask)`

n은 인자로 넘기는 모든 File Desciptor 중 가장 High Value Descriptor + 1한 값을 반환한다. 예를들어 감시할 File Descriptor가 0, 4, 5번이면 n=6을 넣으면 된다. `select` 함수 내에서는 각각의 File Descriptor Set를 보고 Read, Write, Except가 가능한 File이 아무것도 없다면 기다린다. timeout 값을 NULL로 넘겼다면, 무한정 대기한다. timeval 값을 줬다면, 그 시간만큼 기다린다. 만약 작업이 가능한 File이 있다면 인자로 넘긴 fd_set 변수를 직접 수정하여, 작업 가능한 File Descriptor 목록만 남기고 반환한다. 

음수가 아닌 값이 반환된다면 작업을 할 수 있는 file을 찾은 Case이다. 작업 가능한 file은 우리가 인자값으로 넘긴 fd_set 변수에 담겨서 반환되며, FD_ISSET로 하나하나 체크해보면 된다. 만약 Timeout이 다 될때까지 기다렸는데 찾을 수 없었다면 0을 반환한다. -1을 반환받으면 errno를 확인해야 한다. 이때 errno갸 EINTR이면 Wait 상태에서 시그널을 받아 강제로 해제된 경우이며, 다시 select를 하면 된다.

작업 후 다시 Select를 할 때, fd_set이 수정되었으므로 fd_set을 재설정 후 select 함수를 호출해야 한다.

`pselect`와 `select` 함수와 차이점은 두가지다. 첫번째는, pselect는 함수 실행 도중 Block할 Signal Mask 정보를 넘길 수 있다. 두번째는, timeout 부분이다. `select`는 timeout 자체를 수정한다. 즉, 100초를 넘겼는데 40초 후에 함수를 반환하면 timeout에 60초가 찍겨서 반환된다. 반대로 `pselect`는 timeout을 수정하지 않는다. 즉 100초를 넘기면 그대로 100초가 반환되어 객체의 값을 재활용할 수 있다.

이 기능은 보통 Socket을 사용한 네트워크 프로그래밍에서 사용하면 좋다. Server의 한 프로세스에서 여러개의 Client와 연결해야 할 때, Client에서 값이 들어오기 전까지 계속 기다린다. 아무 클라이언트에서나 값이 들어오면, 바로 작업을 처리하고 다시 기다리는 상태로 전환한다. 

> [!example]- STDIN를 감시하다가 입력되면 출력하는 예제{title}
> ```c
> #include <stdio.h>
> #include <sys/select.h>
> #include <unistd.h>
> #include <errno.h>
> 
> #define BUF_LEN 1024
> 
> int main(void) {
>     fd_set readfds;       // 감시할 파일 디스크립터 집합
>     int ret;              // select() 반환값
> 
>     /* 파일 디스크립터 집합 초기화 */
>     FD_ZERO(&readfds);             // 집합 초기화
>     FD_SET(STDIN_FILENO, &readfds); // 표준 입력(STDIN)을 감시 대상으로 추가
> 
>     /* select() 호출 */
>     ret = select(STDIN_FILENO + 1, &readfds, NULL, NULL, NULL);
>     if (ret == -1) {
>         perror("select");
>         return 1;
>     }
> 
>     /* 입력 데이터가 준비된 경우 */
>     if (FD_ISSET(STDIN_FILENO, &readfds)) {
>         char buf[BUF_LEN + 1]; // 입력 데이터를 저장할 버퍼
>         int len;
> 
>         /* 데이터 읽기 (이 동작은 블로킹되지 않음) */
>         len = read(STDIN_FILENO, buf, BUF_LEN);
>         if (len == -1) {
>             perror("read");
>             return 1;
>         }
> 
>         /* 읽은 데이터 출력 */
>         if (len) {
>             buf[len] = '\0'; // 문자열 종료 처리
>             printf("read: %s\n", buf);
>         }
>         return 0;
>     }
> 
>     /* select()가 준비 상태를 반환했지만 FD_ISSET에서 실패 */
>     printf("This should not happen!\n");
>     return 1;
> }
> ```