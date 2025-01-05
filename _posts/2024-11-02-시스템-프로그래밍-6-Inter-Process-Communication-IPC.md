---
title: "시스템 프로그래밍 6. Inter-Process Communication (IPC)"
date: "2025-01-05"
categories: ["IT", "시스템 프로그래밍"]
tags: ["IPC", "Sockets", "Pipe", "Message Queue", "Shared Memory", "Semaphore", "SysV", "POSIX"]
math: true
toc: true
comments: true
---

건국대학교 시스템 프로그래밍 진현욱 교수님의 수업을 정리한 내용입니다.

## IPC

IPC는 Inter-Process Communication의 약어다. IPC에는 같은 컴퓨팅 노드에 있는 프로세스 사이의 통신 방법`(Pipe, Message queue, Shared memory + Semaphore)`과, 다른 컴퓨팅 노드에 있는 프로세스 사이의 통신 방법`(Sockets)`이 존재한다.

Sockets은 같은 컴퓨팅 노드 사이의 통신에도 사용할 순 있지만,  Pipe나 Message queue와 같이 아에 그쪽 특화로 만들어진 기능을 사용하는 것보다 훨씬 느리다.

> [!error] IPC과 Signal를 사용할 때 주의{title}
> ![Pasted image 20241017173935.png](/assets/img/posts/Pasted image 20241017173935.png){: width="400"}
> 
> 데이터를 읽거나 쓰기 위해 Write, Read를 하기 위해 프로세스가 Blocking Mode로 전환될 수 있다.
> 
> Blocking는 특별한 시그널을 받기 전까지 CPU 자원이 할당되지 않고 계속 유지된다.
> 
> 데이터를 정상적으로 Read해서 Blocking이 해제되면 문제가 안되는데,
> 만약 강제로 Blocking Mode를 해제하라는 Signal을 받으면 Read나 Wrtie 함수에서 에러 코드를 반환하게 된다.
> 
> 이런 경우, Read나 Write를 다시 하도록 코드를 구현해야 한다.
> 
> 강제로 시그널이 들어와 Read나 Write가 끊긴 경우 errno에 EINTR 값이 저장되므로, 이 값을 확인해서 다시 Read나 Wrtie를 할 수 있도록 구현하면 된다.

## Pipe

- Pipe는 Stream oriented (스트림 지향) 방식이다.

> [!question] What is Stream oriented?{title}
> 데이터 사이의 구분 없이, 바이트 단위로 데이터를 전송한다.
> 받는이도 바이트 단위로만 데이터를 받을 수 있다.

-  보내는 쪽, 받는 쪽 따로 정해져있다.

![Pasted image 20241011174656.png](/assets/img/posts/Pasted image 20241011174656.png)

-  Pipe의 용량이 꽉 차면 데이터가 보내지지 않는다.
-  파이프는 Kernel에 존재한다.

> [!question] Why?{title}
> 두 프로세스의 메모리는 Virtual Address Space로 구성되어 서로 간섭할 수 없다.
> 
> 하지만, 공유되는 공간이 딱 한군데 있다. 바로 Kernel 공간이다.
> 
> Kernel 내용은 모든 Virtual Address Space 다 같은 내용이므로, 하나만 존재하고 VAS에선 참조만 한다.
> 
> 이걸 응용하여, Kernel 공간에 Pipe Memory 공간을 만들고, Process -> Pipe in Kernel -> Process 방식으로 데이터를 주고 받는다.
> 
> > [!question] 프로세스가 파이프 메모리 주소에 직접 데이터를 쓸 수 있나?{title}
> > 불가능하다. 일개 프로세스가 직접 커널에 접근하는 권한을 가지면 위험하다.
> > 
> > 따라서, 커널이 구현한 System Call을 통해 **요청**만 가능하다. (read, write)

-  FIFO 방식이다.

### pipe()

- `int pipe(int pipefd[2])`
- `int pipe(int pipefd[2], int flags)
    - **Flags**
        - `O_CLOEXEC` : 자식 프로세스가 `exec()` 계열 함수를 호출할 때, fd가 자동으로 닫히게 합니다,
        - `O_DIRECT` : 버퍼링 없이 바로 디스크 I/O를 수행하기 위한 플래그다. 파이프에서 사용하지는 않는다.
        - `O_NONBLOCK` : 읽을 바이트가 없어도, read가 바로 return됩니다.

pipe read를 위한 Descriptor, pipe write를 위한 Descriptor 총 두개를 반환받는다. `빈 배열을 넣으면, pipe 함수가 디스크립터를 생성하여 채워준다.`

> [!question]- What is Descriptor (디스크립터)?{title}
> File Descriptor (`파일 디스크립터, 줄여서 fd`)는 운영체제에서 소켓, 파이프, 데이터, 마우스 등 모든 I/O Device 자원에 올바르게 접근하기 위해 사용하는 식별값이다.
> 
> 그냥 디스크립터라고 하지, 왜 앞에 '**파일**'이 붙었냐?
> 
> 우리가 보통 파일을 스토리지에 쓰여진 값만을 파일이라고 부르는데,
> 사실 운영체제에서의 파일은 I/O Device들을 추상화한 것을 통칭 File이라고 부른다.
> 
> File을 열면, 운영체제가 그 File에 대해 접근할 수 있도록 File Descriptor을 할당하며, 이 Descriptor 값을 통해 프로그램이 파일에 접근할 수 있다.
> 
> 파일을 다 사용하고 나면, File Descriptor을 없애줘야(`Close한다고 함`) 한다.

### read()

- `ssize_t read(int fd, void *buf, size_t count)`

파이프를 통해 값을 읽을 수 있다. fd`(file descriptor)`가 가리키는 파일에서 데이터를 최대 count 바이트만큼 읽어서, buf에 저장한다.

- 성공시, 읽은 바이트 수를 반환한다.
- 실패시, -1를 반환한다.
- EOF(End of File) 상태가 될 경우, 0을 반환한다.

> [!question]- count보다 적은 바이트가 들어있으면 어떻게 하는가?{title}
> 두가지 경우에 따라 다르게 동작한다.
> 
> 1. Write Descriptor가 열려있어 추가로 쓸 가능성이 있는 경우
> 데이터가 추가로 들어올 때까지 Blocking 상태를 유지한다.
> 
> 2. Write Descriptor가 닫힌 경우
> read는 즉시 0을 반환한다.
> 
> 운영체제가 Race Condition이 일어나지 않도록 자동으로 관리하고 있기 때문에,
> read가 읽는 도중에 write descriptor가 닫히는 일은 일어나지 않는다.

### write()

- `ssize_t write(int fd, const void *buf, size_t count)`

파이프에 데이터를 넣을 수 있다. 버퍼(buf)로부터 count 바이트만큼 데이터를 fd(file descriptor)가 가리키는 파일에 넣는다.

- 성공시, 실제 기록한 바이트 수를 반환한다. 이 값은 count보다 더 작을 수 있다.
- 실패시, -1를 반환한다.

> [!question] Why?{title}
> 파이프에 저장된 값이 일정 값 이상이 넘어가면, 더이상 값을 쓸 수 없게 막는다.
> 이런 경우 데이터를 더 넣을 수 없기 떄문에 count보다 데이터를 덜 쓰게 된다.

### close()

- `int close(int fd);`

파일 스크립터를 닫는다. 성공하면 0을 반환하고, 실패하면 -1을 반환한다.

> [!example]- example{title}
> ![Pasted image 20241015170018.png](/assets/img/posts/Pasted image 20241015170018.png){: width="500"}
> 
> 파이프를 생성해서 read fd, write fd 두개를 열고 fork()한다.
> 
> 그럼 Descriptor값 또한 Child Process에게 그대로 전달된다.
> 
> 이후 읽기만 할 쪽은 write fd를 Close하고, 쓰기만 할 쪽은 read fd를 Close하면
> 한쪽에선 읽기만 하고, 한쪽에선 쓰기만 가능한 상태가 된다.

> [!question]- 한쪽에서 close하면 file descripter가 닫히는거 아닌가?{title}
> ㄴㄴ. 
> 운영체제는 file descripter를 몇명이 사용하고 있는지 count 개수를 관리한다.
> 
> Parent Process에서 pipe()로 fd 두개를 열면, read fd count = 1, write fd count = 1 상태다.
> 
> 포크하면, 자식 또한 fd를 갖고 file에 접근이 가능하기 때문에 read fd count = 2, write fd count = 2 상태가 된다.
> 
> 한쪽에서 write fd를 닫으면 write fd count가 1로 줄어든다.
> 
> **운영체제는 한명이라도 fd를 참조하고 있다면, fd를 완전히 close하지 않는다.**
> 이 count가 0이 되는 그 때 fd를 완전히 close하여 없앤다.

### mkfifo

- `int mkfifo(const char *pathname, mode_t mode);`

일반적인 익명 파이프(`pipe()`)와 달리, 네이밍을 가진 pipe를 생성할 수 있다. name을 가진 pipe는 모든 프로세스에서 name을 통해 접근할 수 있다.

> [!question]- 왜 만들었는가?{title}
> cmd1 | cmd2 
> 
> 이 파이프 명령어를 기존의 pipe만 가지고는 구현하기 어렵다.
> 부모 자식 프로세스 사이에는 file descriptor를 공유하고 있어서 통신이 가능하지만,
> 전혀 관계 없는 남인 프로세스 사이에선 file descriptor가 공유될 수 없기 때문이다.
> 
> 따라서, 완전히 별개의 프로세스끼리 통신을 할 수 있는 시스템이 필요했고, 바로 그것이 이름이 있는 pipe (`mkfifo`)이다.

## Message Queue

- Mesage Queue는 Message oriented (메세지 지향) 방식이다.

> [!question] What is Message oriented?{title}
> 데이터 사이의 구분이 존재해, 데이터 단위로 받을 수 있다.

-  양방향으로 데이터를 주고 받을 수 있다.

![Pasted image 20241011174742.png](/assets/img/posts/Pasted image 20241011174742.png)

-  기본적으로 FIFO지만, Message에 priority를 지정할 수 있어 늦게 들어간 메세지가 먼저 처리될 수 있다.
- Pipe와 마찬가지로 Kernel 내에 존재한다. Linked List로 구현되어 있다.

### SysV 방식

> [!question] What is SysV?{title}
> 옛날에 SysV라는 OS에서 시스템 콜을 잘 만들어놨는데,
> 그거 좋다 하면서 너도나도 다 따라서 만들었다.
> 공식 규격은 아닌데, 많이 사용한다

#### 1.  Message Queue의 Id 값을 얻어온다.

- `int msgget(key_t key, int flag)`
    - **Flags**
        - `IPC_CREAT` : key에 대응하는 Queue가 존재하지 않으면, 큐를 생성한다.
        - `IPC_EXCL` : 큐가 이미 존재할 경우, Queue의 ID값이 아닌 오류를 반환한다.
        - `0xxx` : 메세지 큐의 접근 권한을 설정한다.
            - ex) IPC_CREAT | IPC_EXCL | 0666

key값에 대응하는 Message Queue가 존재하면, Message Queue의 ID 값을 반환한다.

> [!question]- What is Key?{title}
> Message Queue는 Map으로 관리된다.
> 만약 key값에 대응하는 Queue가 존재하지 않으면, 플래그 값에 따라 오류를 반환하거나, 생성해서 반환한다.
> 
> 키값은 `ftok(path_name)`으로 생성한 갑슬 많이 사용한다.

> [!question]- What is 접근권한?{title}
> 맨 앞에 붙은 0은, 8진수를 의미한다.
> 
> 숫자 순서대로 user group observer의 권한을 의미한다.
> 
> 각 권한의 숫자는 Read : 4, Write : 2, Execute : 1와 같다.
> 
> 예를들어, 0753로 설정하면
> 
> user는 Read(4) + Write(2) + Execute(1)가 전부 가능하다.
> group는 Read(4) + Execute(1)만 가능하다.
> observer는 Write(2) + Execute(1)만 가능하다.
> 
> 이런식으로 Message Queue에 접근권한을 설정할 수 있다. 

#### 2. Message Queue에 데이터를 보낸다.

- `int msgsnd(int msgid, const void *ptr, size_t nbytes, int flag)`
    - `msgid` : Message Queue의 ID.
    - `void* ptr` : 전송할 메시지를 담은 `struct msgbuf`의 포인터.
    - `size_t nbytes` : 전송할 메세지의 Byte 크기.
    - **Flags**
        - `0` : 메세지 큐가 가득 차있으면, 전송될 때까지 Blocking한다.
        - `IPC_NOWAIT` : 메세지 큐가 가득 차면, -1가 즉시 반환된다.

```c
struct msgbuf {
    long mtype;
    char mtext[N];
}
```

 ``` C
struct msgbuf msg;
msg.mtype = 1;
msg.mtest = "HELLO!";

msgsnd(id, &msg, sizeof(msg.mtext))
```

#### 3. 다른 쪽에선, Message Queue에서 데이터를 받는다.

- `int msgrcv(int msgid, void *ptr, size_t nbytes, long type, int flag)`
    - `msgid` : Message Queue의 ID.
    - `void* ptr` : 수신받을 struct msgbuf 변수의 주소. 수신받으면, 이 변수에 msgbuf 값이 담겨서 온다.
    - `nbytes` : 수신할 메세지의 최대 크기.
    - `type`
        - `0` : mtype 값에 관계없이, 큐에 있는 다음 메세지를 가져온다.
        - `> 0` : 지정한 mtype과 동일한 값을 가진 다음 메세지를 가져온다.
            - 만약 mtype과 동일한 값의 메세지가 없을 경우,
            - 플래그에 따라, 동일한 값을 가진 메세지가 들어올때까지 Blocking되거나, 바로 -1를 반환한다.
        - `< 0` : mtype의 절댓값보다 작거나 같은 다음 메세지를 가져온다.
    - `flag`
        - `0` : 메세지가 도착할 때까지 Blocking한다.
        - `IPC_NOWAIT` : 받을 메세지가 없으면, 바로 -1를 리턴한다.
        - `MSG_NOERROR` : 메세지를 버퍼에 다 담을 수 없으면, 나머지 부분을 버리고 그냥 받아라.

수신이 성공하면, 가져온 메세지의 바이트 수를 반환한다. 실패시, -1를 반환한다.

> [!question]- 만약 저장할 버퍼보다 메세지의 크기가 더 크면 어떻게 될까?{title}
> ![Pasted image 20241017165751.png](/assets/img/posts/Pasted image 20241017165751.png){: width="300"}
> 
> 설정한 플래그 값에 따라 다르다.
> 기본 동작은, 그냥 실패했다고 보고 -1를 반환한다.
> 
> 만약 MSG_NOERROR 플래그가 설정되어 있으면, 짤리는 부분을 그냥 버리고 메세지를 받은 뒤 받은 바이트 수만큼 값이 리턴된다.

#### 4. Message Queue를 다 사용하면, Close한다.

SysV에선 따로 Close하는 System Call을 제공하지 않는다. 따라서, msgctl라는 Message Queue List를 관리하는 System Call을 사용해서 지우거나, Command Line에서 직접 제거한다.

##### System Call을 통해 삭제하기

```c
if (msgctl(msqid, IPC_RMID, NULL) == -1) 
{ 
    perror("메시지 큐 삭제 실패"); 
//    exit(1); 
}
```

##### Command Line 명령어로 삭제하기

먼저 Message Queue List를 확인한다.

```shell
> ipcs -q

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages
0x00001234 32768      user       666        0            0
0x00005678 32769      user       666        0            0
```

이후 Queue를 삭제한다.

```shell
ipcrm -q <msqid>
```

> [!example]- Message Queue Sender Example{title}
> ```c
> #define MAX_ID 5
> 
> int main(void)
> {
>     struct {
>         long id;
>         int value;
>     } myMsg;
>     
>     // MsgQueue Unique Id 생성 (Hash 함수와 비슷)
>     key_t ipcKey = ftok("./tmp/foo", 1946);
>     
>     // MsgQueue 생성
>     int msgqId = msgget(ipcKey, IPC_CREAT | 0600);
>     
>     if (msgqId < 0)
>     {
>         perror("msgget()");
>         exit(0);
>     }
>     
>     for (int i = 0; i <= MAX_ID; i++)
>     {
>         myMsg.id = i + 1;
>         myMsg.value = i * 3;
>         
>         printf(“Sending a message (val: %d, id: %ld)\n”, mymsg.value, mymsg.id);
>         
>         // MsgQueue에 Queue 보내기. 구조체를 사용해 보냄.
>         if (msgsnd(mqdes, &myMsg, buf_len, 0) == -1)
>         { 
>             perror(“msgsnd()”); 
>             exit(0); 
>         }
>     }
> }
> ```

### POSIX 방식

> [!question] What is POSIX?{title}
> System Call의 표준.
> 
> 기껏 만들었는데, 이미 사람들이 SysV를 너무 많이 쓰고있고, 바꾸기 쉽지 않아서
> 지금은 둘다 존재한다.

> [!tip] 컴파일 시, -lrt 옵션을 추가해서 Link해야 사용가능하다.{title}

똑같이 메세지 큐를 열고, 데이터 쓰고 읽고, 메세지 큐를 닫으면 된다.

#### 1. name 이름을 갖는 Message Queue를 Open한다.

- `mqd_t mq_open(const char *name, int oflag, /* mode_t mode, struct mq_attr *attr */)`
    - `mqd = message queue descriptor`
    - `oflag`
        - 접근 모드 설정 Flags
            - O_RDONLY
            - O_WRONLY
            - O_RDWR
        - 옵션 Flags
            - O_CREAT
            - O_EXCL
            - O_NONBLOCK : Open한 Message Queue를 사용할 떄, Read Write 과정에서 Blocking하지 않고 바로바로 -1를 반환하도록 한다.
    - `mode` : (`O_CREAT` 사용 시) 메세지 큐의 접근 권한을 설정함. ex) 0664
        - 이는 oflag에서 설정한 O_RDONLY와 다르다. Message Queue를 생성할 때 자체의 권한을 설정해주는 값. oflag의 O_RDONLY는 Message Queue를 Open할 때, READ ONLY 전용으로 Open하는 플래그.
    - `attr` : (`O_CREAT` 사용 시) Message의 속성을 지정한다.

```c
struct mq_attr {
    long mq_flags;   // 메시지 큐의 플래그: 0 또는 O_NONBLOCK
    long mq_maxmsg;  // 최대 메시지 개수. 이보다 많으면 Write 불가능. Linux의 Default 값은 10
    long mq_msgsize; // 메시지의 최대 크기 (바이트 단위). Linux의 Default 값은 8192
    long mq_curmsgs; // 현재 메시지 개수 (mq_setattr() 시 무시됨)
};
```

mqd_t Type의 Message Queue ID를 반환한다.

메세지 큐를 이름으로 관리한다. O_CREAT 플래그가 설정되어 있으면, name 이름을 갖는 Message Queue를 찾지 못해도 Message Queue를 생성한다. O_CREAT 플래그가 설정되어있지 않으면, open을 실패하고 `(mqd_t)-1`를 반환한다.

#### 2. Message Queue에 데이터를 보낸다.

- `mqd_t mq_send( mqd_t mqdes, const char *msg_ptr, size_t msg_len, unsigned prio)`
    - `mqdes` : Message Queue의 Descriptor.
    - `msg_ptr` : 보낼 메세지가 담겨있는 버퍼.
    - `msg_len` : 메세지의 길이.
    - `prio` : 우선순위.

메세지는 우선순위가 높은 순서대로 정렬한다.
prio 값이 높을수록 우선순위가 높고, 낮을 수록 우선순위가 낮다.

#### 3. 다른 곳에선, Message Queue에서 값을 Read한다.

- `ssize_t mq_receive( mqd_t mqdes, char *msg_ptr, size_t msg_len, unsigned *msg_prio)`
    - `mqdes` : Message Queue의 Descriptor.
    - `msg_ptr` : 메세지를 담을 버퍼. 이곳에 메세지가 담겨서 반환된다.
    - `msg_len` : 버퍼의 크기
    - `msg_prio` : 메세지의 우선순위. 빈 포인터 변수를 넘겨주면, 받아온 메세지의 우선순위가 담긴다.

#### 4. 다 사용한 Message Queue는 Close한다.

- `int mq_close(mqd_t mqdes)`
- `int mq_unlink(const char *name)`

`mq_close()` 함수는 현재 프로세스에서 Message Queue의 Descriptor를 닫는다. Message Queue를 완전히 삭제하는건 아니다.

`mq_unlink()`는 모든 Message Queue Descriptor가 닫혔을 때 Message Queue를 삭제하도록 명령을 걸어두는 함수다.

## Shared Memory

![Pasted image 20241011175456.png](/assets/img/posts/Pasted image 20241011175456.png)

원래 Virtual Address Space는 엄격하게 구분되어 있어서 메모리가 공유되지 않는다. 프로세스의 Virtual Address Space의 일정 부분을 Shared Memory로 쓰자고 약속한다. Shared Memory는 동일한 물리 메모리 공간을 사용하여, 한쪽이 Shared Memory를 쓰면, 다른 쪽에서 자연스럽게 그 값을 볼 수 있다.

Shaded Memory는 Race Condition이 마구마구 발생하기 때문에, 동기화를 도와주는 **Semaphore**와 같이 사용한다. 양쪽에 Mapping된 Memory 주소가 같지 않을 수 있다.

### SysV

- shmget()
- shmat()
- shmt()
### POSIX

- shm_open()
- shm_unlink()

## Shemaphore

공유되는 자원의 동기화를 맞춰준다.
사실 프로세스 사이에선 쓸 일이 Shared Memory 밖에 없다.
나중에 쓰레드에서 용이하게 사용한다.

### SysV

- semget()
- semctl()
- semop()

### POSIX

- sem_open()
- sem_init()
- sem_wait()
- sem_post()
- sem_close()
- sem_unlink()

## Sockets

TCP는 Stream oriented (바이트 단위)
UDT는 Data oriented (데이터 단위)

Sockets는 서로 다른 컴퓨팅 노드에서 돌고 있는 프로세스 사이의 통신을 지원해주는 System Call이다.

Sockets는 같은 노드의 Process, 다른 노드의 Process 사이의 통신을 모두 지원해준다. 통신 대상이 같은 노드인지 다른 노드인지 모를때, 확실하게 다른 노드 사이에서 통신하면 소켓을 사용하는 것이 좋다. 같은 노드끼리 통신이 확실하면 IPC를 사용하는게 성능이 좋다.