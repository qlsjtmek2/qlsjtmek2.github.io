---
title: "Unity DOTS 3. System 앞에 partial을 붙이는 이유"
date: "2025-01-12 21:46:59"
categories: ["Unity", "DOTS"]
tags: ["partial", "namespace", "클래스", "자동 생성 코드", "메서드", "컴파일", "여러 개발자", "C#"]
math: true
toc: true
comments: true
---

## partial

**partial** 키워드는 같은 namespace에 있는 클래스, 구조체, 인터페이스, 메서드의 정의를 여러 파일에서 할 수 있게 해주는 키워드다. 

예를 들어 `File1.cs` 파일의 내용은 다음과 같다.

```c#
// File1.cs
namespace MyNamespace
{
    public partial class MyClass
    {
        public void MethodA()
        {
            Console.WriteLine("MethodA");
        }
    }
}
```

`File2.cs` 파일의 내용은 다음과 같다.

```c#
// File2.cs
namespace MyNamespace
{
    public partial class MyClass
    {
        public void MethodB()
        {
            Console.WriteLine("MethodB");
        }
    }
}
```

두 파일을 컴파일하는 과정에서, `MyClass` 클래스가 합쳐지게 된다. 따라서 런타임 시에는 하나의 MyClass로 동작한다.

```c#
// After compile
public class MyClass
{
    public void MethodA()
    {
        Console.WriteLine("MethodA");
    }
    
    public void MethodB()
    {
        Console.WriteLine("MethodB");
    }
}
```

만약 partial 키워드를 붙이지 않는다면 컴파일 오류가 발생한다.

## System에 partial을 붙여야 하는 이유

partial 키워드는 보통 **자동 생성되는 코드**가 있을 때 사용한다. 실제로 `Project -> Temp -> GeneratedCode -> Assembly-CSharp`를 확인해보면 자동으로 생성된 코드들을 확인할 수 있다.

![Pasted image 20250112214521.png](/assets/img/posts/Pasted image 20250112214521.png){: .shadow}

또는 여러명의 개발자가 한 클래스를 구현해야 할 때 partial 키워드가 유용하게 사용될 수 있다.

## Reference

- <https://www.youtube.com/watch?v=t2S9-pC05hs>
- <https://storycompiler.tistory.com/215?utm_source=chatgpt.com>