---
title: "시스템 프로그래밍 11. IO Redirection"
date: "2024-12-16 19:26:00"
categories: ["IT", "시스템 프로그래밍"]
tags: ["I/O Redirection", "Standard Output", "Standard Error", "Duplication", "File Descriptors", "command", "Redirection Operators", "dup2"]
math: true
toc: true
comments: true
---

건국대학교 시스템 프로그래밍 진현욱 교수님의 수업을 정리한 내용입니다.

## I/O Redirection Operators

1. `command > file.txt`
2. `command >> file.txt`
3. `command 2> file.txt`
4. `command >& file.txt`

Redirection이란, Standard Output/Error으로 화면에 '출력될 값'을 다른 File의 Input으로 넣는 방법이다. 

(1)은 Standard Output의 출력 값을 File에 덮어쓰기한다. 기존의 File 내용은 지워진다. `>`과 `1>`은 동일한 Operator다.
(2)는 Standard Output의 출력 값을 File 맨 끝에 추가한다. 기존의 File 내용은 지워지지 않는다.
(3)은 Standard Error의 출력 값을 File에 덮어쓰기한다. 기존의 File 내용은 지워진다.
(4)는 Standard Error와 Output의 출력값을 둘다 File에 덮어쓰기한다. 기존의 File 내용은 지워진다.

Standard Output과 Standard Error의 출력값은 둘다 콘솔창에 찍히고, 콘솔창만 보면 어디서 출력된 결과인지 알 수 없다. 하지만 내부적으로 다른 Stream을 사용하고 있다.

Redirection이 성공하면 출력값이 뜨지 않는다. 만약 출력값이 뜬다면 다른 Stream에서 출력되는 값이라는 뜻이다.

> [!example]- command example{title}
> cat aaa >& err.txt
> echo abcdef > test.txt

## Duplication File Descriptors

- `int dup(int oldfd)`
- `int dup2(int oldfd, int newfd)`

dup() 함수는 인자값의 file descriptor를 복사한다. 이는, oldfd가 참조하는 File Entry를 참조하는 file descriptor를 하나 더 만드는 것과 같다. 따라서 File Entry Struct의 ref값이 1 증가하게 된다. 성공하면 사용 가능한 File Descriptor 값 중 가장 작은 값에 할당되어 반환되고, 실패하면 -1이 반환된다.

dup()를 사용하면 가장 낮은 file descrioptor 값을 자동으로 할당해주지만, dup2()를 사용하면 어떤 file descriptor 값을 사용할건지 지정해줄 수 있다. 만약 내가 인자값으로 넘긴 fd 값이 이미 사용중이라면 강제로 close()하고 덮어쓰기한다. 성공하면 내가 넘겨준 file dscriptor 값과 똑같은 값이 반환되고, 실패하면 -1 값이 반환된다.

예를들어 fd1이라는 파일이 Open되어 있을 때 `dup2(fd2, fd1)`를 실행하게 되면 열려있던 fd1의 File을 닫아버리고 fd2의 File Entry를 참조하게 된다.