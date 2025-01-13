---
title: "시스템 프로그래밍 10. Memory Mapped IO"
date: "2024-11-28 15:18:37"
categories: ["IT", "시스템 프로그래밍"]
tags: ["Memory Mapped I/O", "mmap", "munmap", "File Descriptor", "Page Size", "PROT_READ", "MAP_SHARED", "시스템 프로그래밍"]
math: true
toc: true
comments: true
---

건국대학교 시스템 프로그래밍 진현욱 교수님의 수업을 정리한 내용입니다.

## Why is it use?

Memory Mapped I/O는, write, read System Call을 사용하지 않고 파일의 내용을 변수 읽고 쓰듯이 사용할 수 있게 해주는 기술이다. `*file = "HIHI";` Memory Space와 File의 내용의 Sync를 맞춰주는 원리이다.

## How to mapped?

- `void *mmap (void *addr, size_t len, int prot, int flags, int fd, off_t offset)`
    - `prot` : 여러 Flag를 동시에 줄 수 있다. File Open할 때 준 권한 값과 동일하게 주면 된다.
        - `PROT_READ`
        - `PROT_WRITE`
        - `PROT_EXEC`
    - `flags` : PRIVATE와 SHARD 중 하나는 반드시 인자로 넣어야 하며, 동시에 넣을 수 없다.
        - `MAP_PRIVATE` : 메모리 값 수정시, 연결된 파일에 내용을 반영하지 않는다. 읽기 전용으로 쓰고싶다면 Private를 설정하면 된다.
        - `MAP_SHARED` : 메모리 값 수정시, 연결된 파일에 내용을 반영한다.
        - `MAP_FIXED`
- `int munmap (void *addr, size_t len)`

Open된 File이 있을 때 사용 가능하다. File과 메모리 영역을 Sync하는 기술이기 떄문이다. File descriptor 값을 mmap 함수로 넘기고, mmap에 성공하면 mapping된 memory 주소를 반환하고, mapping에 실패하면 `MAP_FAILED`를 반환한다.

`void *addr`는 어떤 Memory 번지를 사용할지 운영체제에게 힌트를 줄 수 있다. Flag 값에 `MAP_FIXED`를 설정한다면 반드시 addr로 제공한 memory address를 사용하도록 만들 수 있다. 일반적으로 addr는 0을 넘기면 운영체제가 알아서 할당 가능한 메모리 공간에 할당해준다.

![Pasted image 20241126151624.png](/assets/img/posts/Pasted image 20241126151624.png){: width="300" .shadow}

`size_t len`, `off_t offset`으로 file의 어디서부터 시작하여 어디까지 memory와 mapping할건지 설정 가능하다. file의 처음부터 끝까지 mapping하고 싶다면 `fstat(fd, &sb)`로 File의 정보를 가져와서 offset은 0, len은 sb.st_size를 넘기면 된다. 이때 주의할 점으로, offset값은 아무 값이나 넘기면 안된다. 반드시 page size의 배수 단위로 넘겨야 한다. 보통 page size는 4KB지만, 안전하게 `int page_size = getpagesize();` 또는  `int page_size = PAGE_SIZE;` 함수를 사용하여 얻어내자.

mmap 함수를 사용하면, File Descriptor와 연결되어있는 File Entry의 Reference Count가 증가한다. 이 말은 곧, mmap을 사용해서 Memory에 File을 Mapping하고, 열었던 File을 Close해도 File Entry는 닫히지 않으며 메모리를 통해 File에 접근할 수 있음을 의미한다. File을 완전히 닫으려면, 열었던 File을 Close하고 munmap까지 사용하여 Mapping을 해제 해야 File이 완전히 Close된다. 

이후 munmap()를 사용하여 해제할 수 있다. 해제 성공시 0, 실패시 -1을 반환한다.

## Example

> [!example]- mmap 사용 예제 코드{title}
> ```c
> #include <stdio.h>
> #include <sys/mman.h>
> #include <sys/stat.h>
> #include <fcntl.h>
> #include <unistd.h>
> 
> int main(int argc, char *argv[]) {
>     struct stat sb;
>     off_t len;
>     char *p;
>     int fd;
> 
>     // 인자 확인
>     if (argc < 2) {
>         printf("Usage: %s <file_path>\n", argv[0]);
>         return 1;
>     }
> 
>     // 파일 열기
>     fd = open(argv[1], O_RDONLY);
>     if (fd == -1) {
>         perror("open");
>         return 1;
>     }
> 
>     // 파일 정보 가져오기
>     if (fstat(fd, &sb) == -1) {
>         perror("fstat");
>         close(fd);
>         return 1;
>     }
> 
>     // 파일인지 확인
>     if (!S_ISREG(sb.st_mode)) {
>         printf("%s is not a regular file\n", argv[1]);
>         close(fd);
>         return 1;
>     }
> 
>     // 파일을 메모리에 매핑
>     p = mmap(NULL, sb.st_size, PROT_READ, MAP_SHARED, fd, 0);
>     if (p == MAP_FAILED) {
>         perror("mmap");
>         close(fd);
>         return 1;
>     }
> 
>     // 파일 디스크립터 닫기 (매핑 이후에 필요 없음)
>     if (close(fd) == -1) {
>         perror("close");
>         return 1;
>     }
> 
>     // 매핑된 내용을 출력
>     for (len = 0; len < sb.st_size; len++) {
>         putchar(p[len]);
>     }
> 
>     // 매핑 해제
>     if (munmap(p, sb.st_size) == -1) {
>         perror("munmap");
>         return 1;
>     }
> 
>     return 0;
> }
> ```

이 방법을 쓰면 무조건 좋은거 아니냐? 싶겠지만 장단점이 있다. 장점은, 프로그래머가 직관적으로 File을 다룰 수 있게 된다. 또, Read Write 함수를 사용하지 않아 오버헤드가 줄어든다. 단점으로는, 메모리 할당을 반드시 Page Size 단위로 하기 떄문에 아주 작은 파일을 Mapping하는 경우 메모리 낭비가 발생할 수 있다. 또는 아주아주 큰 파일은 Memory에 다 담기 어렵다. 이론상 64비트 컴퓨터의 Virtual Address Space의 크기는 $$2^{64}\text{byte}$$라서 너무 크지만 않으면 된다. 또, 파일과 메모리 간의 Sync를 맞추기 위해 내부적으로 추가 동작이 발생하기 때문에 이에 대한 오버헤드가 존재한다. 하지만 장점으로 줄이는 오버헤드 효과가 단점으로 생기는 오버헤드보다 더 크다고 보는 의견이 주류이기 때문에 큰 문제는 없다.