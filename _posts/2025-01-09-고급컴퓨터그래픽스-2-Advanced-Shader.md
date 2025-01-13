---
title: "고급컴퓨터그래픽스 2. Advanced Shader"
date: "2025-01-09 15:21:36"
categories: ["IT", "고급컴퓨터그래픽스"]
tags: ["OpenGL", "GPU", "렌더링", "Shader", "Vertex", "Fragment", "Geometry", "GLSL"]
math: true
toc: true
comments: true
---

건국대학교 고급컴퓨터그래픽스 김형석 교수님의 수업을 정리한 내용입니다.

## OpenGL

GPU를 사용하여 컴퓨터 그래픽을 빠르게 렌더링할 수 있게 만드는 API.
OpenGL은 보통 Microsoft SDK에 포함되어 있어 따로 설치하지 않고 링커 설정`-lopengl 프롬포트 추가` 만 해줘도 된다.

추가로 설치해야 하는 라이브러리는 **GLEW** or **GLAD**와 **GLUT** or **FreeGLUT** or **GLFW**다.
- GLEW, GLAD : . 둘중에 마음에 드는거 쓰면 됨.
- GLUT, FreeGLUT, GLFW : 윈도우 창, 입력 등을 대신 처리해주는 라이브러리.
- GLUT < FreeGLUT < GLFW 순으로 최신임.

## OpenGL Pipeline

(+)가 표기된 프로세스는 생략 가능하다.

1. 그리고 싶은 Object를 데이터로 변환한다. 
    1. 만약 3D 공간이라면 3D Scene 좌표의 정보 2D 공간이라면 2D Scene의 좌표 정보를 넘겨주면 된다. `(Vertex는 일반적으로 Position, Color, Normal Vector 정보를 가짐.)`
2. Input Vertex : 변환된 데이터를 GPU로 보내 Object를 그리게한다.
    1. 그래픽에서 가장 느린 과정이 CPU $$\iff$$ GPU Data Bus 과정이 제일 느리기 때문에, 이 과정을 프로세스에서 최대한 줄인다.
3. Vertex Processing :  공간에서 표현된 좌표를 스크린 위의 좌표로 옮긴다. 이 과정을 Vertex Shader로 사용자 지정할 수 있다.
4. Primitive Assembly : Vertex들을 [Primitive](https://qlsjtmek2.github.io/posts/Primitive/)로 묶는다,
5. (+) Tessellation : 프리미티브를 잘게 쪼개서 모델을 디테일하게 만든다. 이 과정을 Tessellation Control Shader와 Tessellation Evaluation Shader로 사용자 지정 가능하다.
    1. Tessellation Control Shader : 하나의 Primitive를 Patch라는 단위`(선분, 삼각형, 사각형)`로 Input 받는다. 이후 Tessellation Level을 결정하여 TPG에 전달한다.
    2. Tessellation Primitive Generator : Tessellation Level에 따라 Primitive를 쪼개도록 하는 Vertex를 생성한다. 이후 생성한 Vertex하나당 하나의 TES에게 전달한다.
    3. Tessellation Evaluation Shader : 생성된 Vertex를 받고, 원래 Primitive가 갖는 Vertex 좌표와, 생성된 Vertex의 상대적인 좌표값을 가지고 생성된 Vertex의 위치를 계산한다.
    4. Primitive Assembly : 생성된 Vertex들을 다시 Primitive로 합친다.
6. (+) Geometry Shader : [Primitive](https://qlsjtmek2.github.io/posts/Primitive/)를 입력받아, Primitive Strip (집합)를 반환한다. Vertex를 내 마음대로 추가하거나 삭제할 수 있는 유일한 단계이다. `ex) 동물의 털`
7. Culling : 불필요한 정점을 걸러낸다.
    - 다른 오브젝트에 가려짐
    - 카메라 뒤에 있음
    - 안보이는 뒷면
9. Clipping : 카메라 화면 밖에 있는 정점은 걸러낸다.
10. Rasterization : 프리미티브를 받아 한 픽셀에 대응되는 [Fragment](https://qlsjtmek2.github.io/posts/Fragment/)를 생성한다.
11. Fragment Shader : Rasterization된 Fragment 정보를 주면, Fragment의 최종 Color를 Output한다.
12. Post Processing
13. Output FrameBuffer : 최종적으로 계산된 Fragment (픽셀의 정보)들을 FrameBuffer에 넘겨 화면에 출력한다.

## OpenGL 사용법

1. 라이브러리 초기화 (GLUT, GLEW)
2. Shader 프로그램 컴파일 후 링크
3. Vertex Data를 GPU에 전송
4. 매 프레임마다 화면 Draw.

> [!question] 드로우 과정이 어떻게 되는가?{title}
> 여러 Object를 정의하고, `(Create VAO)`
> Object들을 Screen에 그린 후 `(glDrawArrays(VAO1), glDrawArrays(VAO2), ...)`
> 화면에 표시한다. `(glutSwapBuffers())`

> [!tip]- Back Buffer에 VAO Draw하기 : glDrawArrays{title}
> > void glDrawArrays(GLenum mode, GLint first, GLsizei count);
> 
> mode (그릴 도형의 유형):
> - GL_TRINAGLES
> - GL_TRIANGLE_STRIP
> - GL_TRIANGLE_FAN
> - GL_LINES
> - GL_POINT
>   
> first (버텍스 배열에서 시작할 첫 번째 인덱스)
> 보통 0으로 잡아야 모든 Vertex를 그릴 수 있다.
> 
> count (그릴 Vertex의 개수)
> 
> > [!example] VAO의 처음 3개 Vertex를 사용하여 삼각형 그리기{title}
> > ```c
> > glBindVertexArray(VAO);
> > glDrawArrays(GL_TRIANGLES, 0, 3);
> > ```
> 
> > [!example] VAO를 사용해 삼각형 Mesh 그리기{title}
> > ```c
> > struct object
> > {
> >     GLfloat vertices[];
> >     int vertexStride;
> > }
> > glBindVertexArray(VAO);
> > 
> > int vertexCount = sizeof(object.vertices) / (object.vertexStride * sizeof(float));
> > glDrawArrays(GL_TRIANGLE_STRIP, 0, vertexCount);
> > ```

> [!question]- glDrawArrays 하면 화면에 바로 그려지는거 아니야?{title}
> 아니다. glDrawArrays을 하면, VAO는 GPU의 Back Buffer에 그려진다.
> 
> 이는 **Double Buffering** 기법을 사용하기 때문이다.
> 
> 컴퓨터는 이미지를 지웠다가 새 이미지를 그리는 작업을 반복한다.
> 
> 이걸 쌩으로 하게되면, 지우고 그려지는 시간동안 사용자는
> 흰 화면이 됬다가 이미지가 보였다가 하는 깜빡이 현상이 발생한다.
> 
> 따라서, 이미지를 뒤에다가 미리 그려두고, 요청이 들어오면 미리 그려둔 이미지를 화면에 출력하고, 그 출력되는 시간 동안 새로운 이미지를 미리 그려둔다.
> 
> ![Pasted image 20241016104417.jpg](/assets/img/posts/Pasted image 20241016104417.jpg){: .shadow}
> 
> 뒤에다가 이미지를 저장해두는 공간을 **Back Buffer** 라고 하며, Back Buffer에 VAO를 그리는 함수가 바로 **glDrawArrays(VAO)** 다.
> Back Buffer에 그려둔 이미지를 스크린에 출력해주는 함수가 바로 **glutSwapBuffers()** 다. 

> [!question]- Object 정의를 어떻게 하는가?{title}
> 1. Vertex Array Object (Obejct의 Vertex 정보)를 정의한다.
>     1. VAO와 VBO를 생성한다 `(glGenVertexArrays(1, &VAO), glGenBuffers(1, &VBO))`
>     2. VAO를 바인딩한다 `(glBindVertexArray(VAO))
>     3. VBO를 바인딩한다 `(glBindBuffer(GL_ARRAY_BUFFER, VBO)``
>     4. VBO에 배열의 정보를 넣고, GPU로 전송한다. `glBufferData, 이는 최초 한번만 실행되게 된다.`
>     5. AttribPointer 설정 `(1차원 배열에 저장된 값을 어떻게 읽어들일지..)`
>     6. Attrib 활성화 `(glEnableVertexAttribArray(attrib))`
>     7. 바인딩 해제 `(glBindVertexArray(0))`

> [!tip]- Buffer를 바인딩하는 함수 : glBindBuffer(BUFFER_TYPE, vbo);{title}
> Vertex Buffer Object Type를 정점 데이터로 설정하고, Vertex Shader의 interface와 바인딩을 시작한다.
> 
> 바인딩 함수를 선언한 뒤에 interface 변수와 Binding하면 된다.
> 
> BUFFER_TYPE:
> - GL_ARRAY_BUFFER : 정점 데이터를 담기 위한 버퍼. (VBO)
> - GL_ELEMENT_ARRAY_BUFFER : 인덱스 데이터를 담기 위한 버퍼. (EBO)
> - GL_PIXEL_PACK_BUFFER : 보통 프레임버퍼에서 읽은 픽셀 데이터를 GPU에서 CPU로 복사할 때 사용하는 버퍼.
> - GL_PIXEL_UNPACK_BUFFER : 픽셀 데이터를 CPU에서 GPU로 전송할 때 사용하는 버퍼.
> - GL_COPY_READ_BUFFER : 한 버퍼의 데이터를 다른 버퍼로 복사할 때 사용하는 임시 버퍼.
> - CL_COPY_WRITET_BUFFER : COPY_READ_BUFFER에서 복사한 데이터를 이 버퍼로 복사한다.
> - GL_TRANSFORM_FEEDBACK_BUFFER : 셰이더에서 계산된 정점 데이터를 다시 버퍼로 저장할 때 사용함. 입력된 정점 데이터를 처리한 후, 결과를 다시 GPU로 전달할 때 사용.
> - GL_UNIFORM_BUFFER : 유니폼 데이터를 담기 위한 버퍼. (UBO)
> - GL_TEXTURE_BUFFER : 텍스처를 담기 위한 버퍼.

> [!tip]- VBO 생성 함수 : glGenBuffers(n, &vbo);{title}
> n개의 Vertex Buffer Object를 생성한다.
> 
> ```c
> GLuint vbo;
> glGenBuffers(1, &vbo); // 1개의 VBO 생성\
> 
> GLuint vbos[3];
> glGenBuffers(3, &vbos); // 3개의 VBO 생성
> ```

> [!tip]- 쉐이더 속성 포인터 설정 함수 : glVertexAttribPointer{title}
> > glVertexAttribPointer(GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride, const GLvoid *pointer);
>
> index: Attrib Index location.
> size: 속성이 몇 개의 요소로 이루어져 있는가? vec3이면 3. vec4면 4.
> type: 
> - GL_FLOAT
>  - GL_INT
>  - GL_UNSIGNED_BYTE
>    
> normalized: 데이터가 0.0 ~ 1.0 범위로 정규화될지 말지.
> - GL_TRUE
> - GL_FALSE
>   
> stride: 버텍스 사이의 메모리 간격.
> - 위치 3개, 색상 3개가 하나의 Vertex라면 `6 * sizeof(float)`를 넣는다.
>   
> pointer: 속성 데이터가 시작하는 위치.
> - 만약 x, y, z, r, g, b, x2, y2, z2, r2, g2, b2, ... 이렇게 Vertex Array가 저장되어있다면
> - 위치 속성의 경우 `((void*) 0)`
> - Color 속성의 경우  `(void*)(3 * sizeof(float))`
>    
> > [!example] example{title}
> > ```c
> > GLint positionAttribute = glGetAttribLocation(shaderProgram, "position"); 
> > 
> > if (positionAttribute == -1) 
> > { 
> >     std::cerr << "Could not find attribute 'position' in shader program." << std::endl; 
> > } 
> > else 
> > { 
> >     std::cout << "Position attribute location: " << positionAttribute << std::endl; 
> > }
> > 
> > glVertexAttribPointer(positionAttribute, 4, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*) 0);
> > ```

> [!tip]- GPU로 VBO 전송 함수 : void glBufferData(GLenum target, GLsizeiptr size, const void \*data, GLenum usage);{title}
> target: GL_ARRAY_BUFFER
> size: 버퍼에 할당할 데이터의 크기.
> data: GPU로 복사할 데이터. 배열, 벡터와 같은 자료구조를 넘긴다.
> usage:
>  - GL_STATIC_DRAW : 데이터가 GPU에 한번 전송된 후 거의 수정되지 않는 경우 사용한다.**
>  - GL_DYNAMIC_DRAW : 데이터가 자주 수정되어 GPU에 자주 복사될 때 사용한다.
>  - GL_STREAM_DRAW : 임시 데이터를 빠르게 사용하고 버릴 때 사용한다.

> [!tip]- VAO 생성, 바인딩, 바인딩 해제{title}
> ```c
> GLuint VAO;
> glGenVertexArrays(1, &VAO);
> glBindVertexArray(VAO);
> glBindVertexArray(0);
> ```
> 
> 여러개의 VAO 생성: 
> ```c
> GLuint VAO[2];
> glGenVertexArrays(2, &VAO);
> 
> glBindVertexArray(VAO[0]);
> // ...
> glBindVertexArray(VAO[1]);
> // ...
> glBindVertexArray(0);
> ```

> [!question]- glBufferData를 VAO에 넣게되면, CPU에서 GPU로 데이터를 넘기는 BUS 연산이 자주 일어나는거 아닌가?{title}
> glBufferData 이거는 CPU Memory에 있는 Vertex 정보를 GPU VRam의 VBO로 넘기는 함수라고 알고있는데,
> 
> 이걸 VAO를 그릴때마다 실행하게되면 쓸데없이 계속 넘기게 되는거 아니야?

> [!question]- VAO랑 VBO가 무슨 차이야?{title}
> **VAO**는 Vertex Array 단위로 다룰 수 있게 해주는 Object.
> 즉, 1차원으로 저장된 **Vertex 정보가 담긴 Array를 읽는 방법**을 담는 Object이다.
> 
> **VBO**는 **실제 Vertex** 정보가 **저장될 Buffer Object**.
> 
> VAO를 Binding하면, 해당 VAO와 연결된 VBO와 속성 정보가 활성화된다.
> 이 상태에서 DrawArrays()하면, VAO에서 설정한 속성 정보에 따라,
> VBO에 담긴 Vertex List를 쉐이더 Interface 변수에 전달한다.
> 
> 이후 Pipeline의 결과가 Back Buffer에 담긴다.

> [!question]- VAO, VBO를 바인딩한다는게 무슨 말이야?{title}
> GPU가 해당 객체를 활성화하여, 그 이후의 작업이나 명령이 그 객체에 적용되도록 하는 것을 의미한다.

> [!question]- glEnableVertexAttribArray를 써야하는 이유가 뭐야?{title}
> 속성을 활성화 해줘야 쉐이더 Interface 변수에 값이 제대로 전달된다.
> 비활성화되있으면, 그 속성(Interface) 변수를 무시하게 된다.
> 
> 따로 속성을 활성화해주지 않으면, **기본값이 비활성화**이기 때문에
> 속성을 AttribPointer로 연결해줬다면, 활성화를 해줘야 한다.
> 
> 활성화 / 비활성화 기능을 만들어둔 이유는, 어떤 객체를 렌더링할 땐 Texture 정보나 Color 정보가 필요하지 않을 수 있다.
> 
> 그런 객체를 렌더링할 땐 속성을 비활성화 하고 렌더링하면 불필요한 연산을 줄일 수 있다.
> 
> ```c
> glDrawArrays(VAO1);
> glDrawArrays(VAO2);
> 
> glDisableVertexAttribArray(textureAttrib);
> glDrawArrays(VAO3);
> ```
> 
> 실제로는 VAO 안에 어떤 속성을 활성화할건지 정보까지 다 매크로로 저장해서 사용하게 되므로, 딱히 신경쓰지 않고 아래와 같이 사용하면 된다.
> ```c
> glBindVertexArray(VAO);
> glDrawArrays(GL_TRIANGLES, 0, 3);
> 
> glBindVertexArray(VAO2);
> glDrawArrays(GL_LINES, 0, 3);
> 
> glBindVertexArray(VAO3);
> glDrawArrays(GL_POINTS, 0, 3);
> ```

> [!question]- glUseProgram는 적게 사용할 수록 좋은거 아닌가?{title}
> Yes. 쉐이더 프로그램을 전환하면, 내부적으로 **셰이더 상태**와 **유니폼 변수**들을 다시 설정해야 하기 때문에 오버헤드가 발생함.
> 
> 하지만 각 VAO마다 다른 Shader Program를 적용시켜야 할 경우엔 어쩔 수 없이 매 드로우 과정마다 glUseProgram를 사용할 수 밖에 없다.
> ```c
> glUseProgram(shader1);
> glDrawArrays(VAO1);
> glDrawArrays(VAO2);
> 
> glUseProgram(shader2);
> glDrawArrays(VAO3);
> ```
> 
> 만약, 모든 오브젝트가 하나의 쉐이더만 사용하는 경우 최초 한번만 `glUseProgram(shader)`를 사용하고, 매 Draw 과정에선 glDrawArrays만 사용하는게 더 효율적이다.

> [!question]- 만약 60프레임마다 화면을 그리고싶으면, 드로우 과정을 처음부터 프레임마다 해야하는가?{title}
> ㅇㅇ. 컴퓨터는 이미지를 기본적으로 스크린을 클리어하고 이미지를 그리는 것을 반복한다.
> 
> VBO 정보는 씬이 전환되지 않는 이상, 매 프레임마다 BUS를 통해 CPU에서 GPU로 보낼 필요는 없다.
> 
> 매 프레임마다 해야할 작업은, 
> 화면을 Clear하고
> 각 오브젝트에 맞는 쉐이더 프로그램을 활성화하여 VAO를 Draw하고,
> 그려진 이미지를 화면에 보여주면 된다. 

> [!question]- Frame Buffer가 무엇인가?{title}
> Frame Buffer는 총 10개있음
> Color Buffer 8개, Depth Buffer 1개, Stencil Buffer 1개가 존재

> [!question]- Frame Buffer에 출력된 결과를 그대로 재활용해서 다시한번 렌더링이 가능한가?{title}
> Yes. **FBO**`(Frame Buffer Object)`를 사용하면 가능하다.
> 
> FBO가 바인딩되어 있는 상태에서 glDrawArrays가 수행되면, 결과가 Back Buffer로 넘어가지 않고 그대로 FBO에 들어간다.
> 
> 그 FBO를 통해서 Image Processing 전용 Shader를 적용한 Pipeline을 한번 더 거쳐서 Texture를 만들어낸다.
> 
> 그 Texture를 화면에 띄우면 끝.
> 
> **사용법:**
> 1. FBO를 바인딩한다.
> 2. VAO들을 Draw한다.
> 3. FBO 바인딩을 해제한다.
> 4. 스크린 전체를 의미하는 VAO를 바인딩한다.
> 5. 텍스쳐를 바인딩 후 사각형을 그려서 Screen VAO에 Texture를 입힌다.

> [!example]- 예제{title}
> ```c
> // FBO 생성 및 텍스처 설정 (1회 설정)
> GLuint fbo, textureColorbuffer;
> setupFBO(&fbo, &textureColorbuffer);  // FBO와 텍스처 설정 함수 (위 코드처럼)
> 
> while (!glfwWindowShouldClose(window)) {
>     // FBO에 오브젝트 렌더링
>     glBindFramebuffer(GL_FRAMEBUFFER, fbo);
>     glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
> 
>     // 셰이더 1로 VAO1, VAO2 렌더링
>     glUseProgram(shader1);
>     glBindVertexArray(VAO1);
>     glDrawArrays(GL_TRIANGLES, 0, vertexCount1);
> 
>     glBindVertexArray(VAO2);
>     glDrawArrays(GL_TRIANGLES, 0, vertexCount2);
> 
>     // 기본 프레임 버퍼로 돌아감
>     glBindFramebuffer(GL_FRAMEBUFFER, 0);
>     glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
> 
>     // 이미지 프로세싱 (FBO 텍스처 사용)
>     glUseProgram(shader2);
>     glBindTexture(GL_TEXTURE_2D, textureColorbuffer);
>     glBindVertexArray(screenVAO);  // 화면 전체에 렌더링할 QUAD
>     glDrawArrays(GL_TRIANGLES, 0, 6);  // 화면을 덮는 사각형 그리기
> 
>     // 화면에 결과 출력
>     glfwSwapBuffers(window);
>     glfwPollEvents();
> }
> ```

> [!question]- FBO (Frame Buffer Object)가 뭔데?{title}
> GPU 내에서 사용하는 Object인데, Frame Buffer의 내용을 가져온다는 뜻이다.
> 
> **생성법:**
> 1. FBO를 생성한다 `(glGenFramebuffers(1, &fbo);)`
> 2. FBO를 바인딩한다
> 3. 컬러 빈 텍스쳐를 생성한다 `(텍스쳐 공간만 만들어서 내용이 채워지도록.)`
> 4. 필요시, Depth Stenci 버퍼까지 생성한다.
> 5. FBO 설정이 잘 되었는지 체크한다.
> 6. FBO 바인딩 해제.

> [!example]- FBO 생성 예제{title}
> ```c
>  // 1. FBO 생성 및 바인딩
> GLuint fbo;
> glGenFramebuffers(1, &fbo);
> glBindFramebuffer(GL_FRAMEBUFFER, fbo);
> 
> // 컬러 텍스처 생성 및 FBO에 첨부
> GLuint textureColorbuffer;
> glGenTextures(1, &textureColorbuffer);
> glBindTexture(GL_TEXTURE_2D, textureColorbuffer);
> glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 800, 600, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
> glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
> glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
> glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, textureColorbuffer, 0);
> 
> // 깊이 버퍼 설정 (선택 사항)
> GLuint rbo;
> glGenRenderbuffers(1, &rbo);
> glBindRenderbuffer(GL_RENDERBUFFER, rbo);
> glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, 800, 600);
> glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);
> 
> // FBO 상태 확인
> if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
>    std::cerr << "ERROR::FRAMEBUFFER:: Framebuffer is not complete!" << std::endl;
>    
> glBindFramebuffer(GL_FRAMEBUFFER, 0);
> ```

> [!question]- 텍스쳐를 어떻게 GPU에 넘겨주지?{title}
> 쉐이더 프로그램에선, 유니폼 변수로 텍스쳐를 입력받는다.
> > uniform sampler2D texture;
> 
> 어떻게 넘겨줄 수 있을까?
> 1. 텍스쳐를 생성한다. `GLuint texture; glGenTextures(1, &texture);`
> 2. 텍스쳐를 바인딩한다. `(glBindTexture)`
> 3. 텍스쳐 옵션을 설정한다. `(glTexParameteri)`
> 4. 텍스처 데이터를 GPU로 전송한다. `(glTexImage2D)`
> 5. 텍스쳐 바인딩 해제. `(glBindTexture(GL_TEXTURE_2D, 0);)`
> 

> [!question]- 바인딩한 텍스쳐를 어떻게 사용하는가?{title}
> 텍스쳐 유닛을 활성화하고,
> 텍스쳐를 텍스쳐 유닛 0에 바인딩한다.
> 쉐이더 프로그램을 활성화하고,
> 텍스쳐 유닛과 유니폼 변수를 연결한다.
> 
> 위 과정은 드로우 과정때마다 실행해야 한다..
> 
> 이후 VAO를 바인딩하고 그리기 전에 텍스쳐까지 바인딩해주면 됨.
> ```c
> glActiveTexture(GL_TEXTURE0);
> glBindTexture(GL_TEXTURE_2D, texture);
> 
> glUseProgram(shaderProgram);
> glUniform1i(glGetUniformLocation(shaderProgram, "texture"), 0);
> 
> glBindVertexArray(VAO);
> glActiveTexture(GL_TEXTURE0);
> glBindTexture(GL_TEXTURE_2D, texture);
> glDrawArrays(GL_TRIANGLES, 0, 6);
> ```

> [!question]- 텍스쳐 유닛이 무엇인가?{title}
> 텍스쳐 유니폼 변수와 순서대로 연결함.
> 
> ```c
> glActiveTexture(GL_TEXTURE0); // 텍스쳐 유닛 1 활성화
> glBindTexture(GL_TEXTURE_2D, textureID1); // 텍스처1을 텍스처 유닛 0에 바인딩
> 
> glActiveTexture(GL_TEXTURE1); 
> glBindTexture(GL_TEXTURE_2D, textureID2);
> ```
> 
> 이후 텍스쳐 유닛과 texture uniform 변수와 연결하면 된다.
> ```c
> // 텍스처 유닛 0을 'texture1' 유니폼에 설정
> glUniform1i(glGetUniformLocation(shaderProgram, "texture1"), 0);  // 텍스처 유닛 0
> // 텍스처 유닛 1을 'texture2' 유니폼에 설정
> glUniform1i(glGetUniformLocation(shaderProgram, "texture2"), 1);  // 텍스처 유닛 1
> ```
> 
> 쉐이더 코드 예시
> ```c
> uniform sampler2D texture1; // 텍스처 유닛 0과 연결 
> uniform sampler2D texture2; // 텍스처 유닛 1과 연결
> ```

> [!tip]- 텍스쳐 바인딩 : glBindTexture(GLenum target, GLuint texture);{title}
> GPU가 사용할 텍스쳐를 활성화한다.
> 
> target:
> - GL_TEXTURE_2D : 2D 텍스쳐
> - GL_TEXTURE_CUBE_MAP : 큐브맵 텍스쳐(Skybox 등..)
> 
> texture: 바인딩할 텍스처의 ID.

> [!tip]- 텍스쳐 옵션 설정 : glTexParameteri(GLenum target, GLenum pname, GLint param);{title}
> Warpping, Filtering 등을 설정한다.
> 
> target: 
> - GL_TEXTURE_2D : 2D 텍스쳐
> - GL_TEXTURE_CUBE_MAP : 큐브맵 텍스쳐(Skybox 등..)
>   
> pname: 설정할 파라미터 종류
> 1. Warpping Mode : 텍스처 좌표가 벗어났을 때 어떻게 처리할까?
>     - GL_TEXTURE_WRAP_S : S축 (수평)에 대하여
>     - GL_TEXTURE_WRAP_T : T축 (수직)에 대하여
> 
>     param:
>     - GL_REPEAT : 그냥 반복한다.
>     - GL_MIRRORED_REPEAT : 뒤집어가며 반복한다.
>     - GL_CLAMP_TO_EDGE : 가장자리 텍스처 색깔이 연장된다.
>     - GL_CLAMP_TO_BORDER : 지정된 경계색을 사용한다.
>   <br>
> 2. Filtering Mode : 텍스쳐가 확대되거나 축소될 때 어떻게 필터링할까?
>     - GL_TEXTURE_MIN_FILTER : 축소될 때에 대하여
>     - GL_TEXTURE_MAX_FILTER : 확대될 때에 대하여
>      
>     param:
>     - GL_NEAREST : 가장 가까운 텍셀을 사용한다.
>     - GL_LINEAR : 인접한 텍셀의 색상을 선형 보간한다.

> [!tip]- 텍스쳐 GPU로 전송 : glTexImage2D{title}
> ```c
> void glTexImage2D(
 >   GLenum target, // GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP
 >   GLint level,       // 상세도 수준(MipMap level) 지정. 보통 0.
 >   GLint internalFormat, // 텍스처가 GPU에 저장될 때 Format. GL_RGB or GL_RGBA
 >   GLsizei width,    // 텍스쳐의 너비
 >   GLsizei height,  // 텍스쳐의 높이
 >   GLint border,    // 테두리 설정. 0밖에 쓸 수 없다.
 >   GLenum format,  // 텍스처가 Memory에 저장될 때 Format. GL_RGB or GL_RGBA. 내부 포맷과 달라도 된다.
 >   GLenum type,   // Texture Data가 무슨 타입으로 저장됨? GL_UNSIGNED_BYTE or GL_FLOAT
 >   const void *data // 텍스처 데이터가 저장된 메모리 주소. 이미지가 없이 공간만 할당하고 싶다면 NULL.
> );
> ```
> 
> > [!example] example{title}
> > `glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);`

> [!example]- Vertex Shader에 Position 정보만 전달하기{title}
> ```c
> GLfloat vertices[] = {
>    0.5f,  0.5f, 0.0f,  // 첫 번째 점
>   -0.5f, -0.5f, 0.0f,  // 두 번째 점
>    0.5f, -0.5f, 0.0f   // 세 번째 점
> };
> // ...
> // layout(location = 0)에 vec3 타입으로 3개씩 끊어서 전달.
> glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0); 
> glEnableVertexAttribArray(0);
> ```

> [!example]- Vertex Shader에 Position, Color, Normal Vector 정보 다 전달하기{title}
> ```c
> // Vertex 데이터: 위치(x, y, z), 색상(r, g, b), 법선(nx, ny, nz)
> GLfloat vertices[] = {
>     // Position       // Color         // Normal
>      0.5f, 0.5f, 0.0f,   1.0f, 0.0f, 0.0f,   0.0f, 0.0f, 1.0f,
>     -0.5f, -0.5f, 0.0f,   0.0f, 1.0f, 0.0f,   0.0f, 0.0f, 1.0f,
>      0.5f, -0.5f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f, 1.0f
> };
> // ...
> // Position 속성 (0번 속성)
> glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 9 * sizeof(float), (void*)0);
> glEnableVertexAttribArray(0);
> // Color 속성 (1번 속성)
> glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 9 * sizeof(float), (void*)(3 * sizeof(float)));
> glEnableVertexAttribArray(1);
>
> // Normal 속성 (2번 속성)
> glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, 9 * sizeof(float), (void*)(6 * sizeof(float)));
> glEnableVertexAttribArray(2);
> ```
> 
> Vertex Shader
> ```c
> #version 330 core
> 
> layout(location = 0) in vec3 aPosition;  // 0번 속성: 위치
> layout(location = 1) in vec3 aColor;     // 1번 속성: 색상
> layout(location = 2) in vec3 aNormal;    // 2번 속성: 법선 벡터
> 
> out vec3 vertexColor;  // Fragment Shader로 넘길 색상
> 
> void main()
> {
>     gl_Position = vec4(aPosition, 1.0);
>     vertexColor = aColor;  // 색상 정보를 Fragment Shader로 넘김
> }
> ```

## GLSL

GLSL이란, Shader Programming을 위한 언어다. C와 유사한 문법체계를 가진다. 대신, (포인터, 재귀 함수, 동적 메모리 관리, 객체지향) 기능들을 사용할 수 없는 것이 차이점이다.

> [!note]- 전처리 문법{title}
> ```c
> #define MAX_LIGHTS 10
> #define SQUARE(x) (x * x)
> 
> #ifdef MAX_LIGHTS 
> // 텍스처를 사용하는 코드 
> #else 
> // 텍스처를 사용하지 않는 코드
> #endif
> ```

> [!note]- 메인 구조{title}
> 
> ```c
> uniform mat4 modelTransform;
> in vec4 position;
> out vec4 color;
> 
> void main()
> {
> 
> }
> ```
> 
> - Interface Variables
> 1) 모든 쉐이더가 공통적으로 Input 받는 데이터를 uniform 변수로 선언한다.
> 2) 내 쉐이더에 input 받아야 하는 값을 in 변수로 선언한다.
> 3) 그 다음 쉐이더에 output할 값을 out 변수로 선언한다.
> 
> > [!tip] 변수의 이름을 ID로 사용한다.{title}
> > 변수의 이름이 같으면, 똑같은 변수라고 본다.
> > 
> > 예를들어, 이전 쉐이더의 out 변수 이름과, 현재 쉐이더의 in 변수 이름이 같으면 쉐이더 끼리 데이터를 주고 받을 수 있다.
> 

> [!note]- Struct (구조체){title}
> 
> 객체지향 프로그래밍은 불가능하지만, 구조체를 선언해서 쓸 수는 있다.
> 
> ```c
> struct light 
> { 
>     members;
> };
> 
> light lightVar = light(3.0, vec3(1.0, 2.0, 3.0));
> ```
> 
> 만약 쉐이더 프로그램에서 정의한 구조체를 다른 쉐이더 프로그램에서 똑같이 사용하고싶으면,
> 
> 구조체 정의를 따로 파일로 빼내고
> 
> ```c
> #include "common.glsl"
> ```
> 
> 이렇게 Include 하면 되겠는데?

> [!note]- Vector{title}
> 
> - Type
>    
> ```c
> vec2, vec3, vec4     // 성분 타입이 float
> dvec2, dvec3, dvec4  // 성분 타입이 double
> bvec2, bvec3, bvec4  // 성분 타입이 bool
> ivec2, ivec3, ivec4  // 성분 타입이 int (정수)
> uvec2, uvec3, uvec4  // 성분 타입이 unsigned int
> ```
> 
> - 생성자
>    
> ```c
> vec3 xcz = vec3(1.0, 2.0, 3.0);
> vec3 xyz = vec3(1.0); // [1.0, 1.0, 1.0]
> vec3 xyz = vec3(vec2(1.0), 2.0); // [1.0, 1.0, 2.0]
> ```
> 
> - 성분 참조
> rgba는 Vector가 Color를 담고있을 때 사용하면 좋다.
> stpq는 Vector가 Texture Coordinate를 담고있을 때 사용하면 좋다.
> 
> ```c
> vec4 v = vec3(1.0, 2.0, 3.0, 4.0);
> 
> float x = v.x; // = v.r = v.s
> float y = v.y; // = v.g = v.t
> float z = v.z; // = v.b = v.p
> float w = v.w; // = v.a = v.q
> 
> // Swizzle 가능
> vec2 xy = v.xy;
> vec2 yz = v.yz;
> vec3 xyw = v.xyw;
> vec4 wwww = v.wwww;
> ```
> 
> 
> - 벡터 연산
>    
> ```c
> vec3 v1 = vec3(1.0, 2.0, 3.0);
> vec3 v2 = vec3(2.0, 4.0, 6.0);
> 
> vec3 v = v1 + v2; // Component Sum OK!
> vec3 v = v1 * v2; // Component Product OK!
> vec3 v = 3.0 * v1; // Scalar Product OK!
> float dot = dot(v1, v2); // OK!
> vec3 cross = cross(v1, v2); // OK!
> vec3 normal = normalize(v1); // OK!
> ```
> 
> > [!warrning] 주의!{title}
> > 두 벡터를 곱하는 연산은, 점곱과 크로스곱이 아니다.
> > 두 벡터의 각 성분을 곱하는 연산이다.
> > 
> > $$
> > v.x = v_{0}.x * v_{1}.x
> > $$
> > 
> > 
> > $$
> > v.y = v_{0}.y * v_{1}.y
> > $$
> > 
> > 
> > $$
> > v.z = v_{0}.z * v_{1}.z
> > $$
> > 
> 
> - 관련 함수
>    
> ```c
> vec3 p = vec3(1.0, 2.0, 3.0);
> vec3 q = vec3(2.0, 2.0, 6.0);
> 
> float f = length(p);      // 벡터의 길이 반환
> float d = distance(p, q); // 두 벡터 사이의 거리 반환
> 
> bvec3 b = equal(p, q);        // (false, true, false)
> bvec3 b2 = lessThan(p, q);    // p < q => true, (true, false, false)
> bvec3 b3 = greaterThan(p, q); // p > q => true, (false,  false, false)
> 
> bool b4 = any(b);  // bvec중 하나라도 참이면 true.
> bool b5 = all(b);  // bvec가 전부 true야 true.
> ```
> 
> 추가: 빛 계산(Fragment Shader)에 사용하는 함수
> 
> ```c
> vec3 N = normalize(surfaceNormal); 
> vec3 I = normalize(eyeDirection); // 카메라(또는 광원)로부터의 방향 
> vec3 Nref = normalize(referenceNormal); // 참조 벡터, 일반적으로 입사광과 반사광의 계산에서 사용됨
> 
> vec3 ref = reflect(v, N); // 반사. 빛 계산에 사용함.
> vec3 correctedNormal = faceforward(N, I, Nref); // 표면의 방향 계산. 빛 계산에 사용함.
> ```

> [!NOTE]- Matrix{title}
> 
> - Type
>    
> ```c
> mat2, mat3, mat4     // 성분 타입이 float. mat2 = mat2x2, ...
> dmat2, dmat3, dmat4  // 성분 타입이 double
> imat2, imat3, imat4  // 성분 타입이 int (정수)
> umat2, umat3, umat4  // 성분 타입이 unsigned int
> bmat2, bmat3, bmat4  // 성분 타입이 bool
> 
> mat2x3, mat2x4, mat5x3, ... // 이런 타입 사용 가능.
> matmxn  // column이 m개, row가 n개인 행렬.
> ```
> 
> - 생성자
>    
> ```c
> mat3 A = mat3(1.0);  // 3x3 identity matrix
> mat2 B = mat2(1.0, 2.0, 3.0, 4.0);
> mat3 C = mat3(v1, v2);
> ```
> 
> > [!tip] Identity Matrix{title}
> > 벡터의 생성자에  vec3 v = vec(1.0); 이렇게 넣으면 아래와 같이 만들어진다.
> > 
> > $$
> > [1, 1, 1]
> > $$
> > 
> > 
> > 행렬의 생성자에 mat3 A = mat3(1.0); 이런식으로 넣으면 identity matrix가 만들어진다.
> > 
> > $$
> > \begin{bmatrix}1&0&0 \\ 0&1&0 \\ 0&0&1 \end{bmatrix}
> > $$
> > 
> 
> > [!tip] column 우선으로 stored 된다.{title}
> > 예를들어, mat2 m = mat2(1,0, 2.0, 3.0, 4.0); 이렇게 2x2 Matrix를 생성하면 아래와 같이 행 우선으로 축적된다.
> > 
> > $$
> > \begin{bmatrix}1.0&3.0 \\ 2.0&4.0\\ \end{bmatrix}
> > $$
> > 
> 
> - 성분 참조
>    
> ```c
> mat3 A = //...
> 
> float f = A[column][row];
> 
> float y = A[1][1]; // 2번째 Column의 2번째 값 가져오기
> vec3 c = A[1]; // 2번째 column 가져오기
> vec2 yz = A[0].yz; // 첫번째 Column의 yz값 가져오기
> 
> A[1] = vec3(2.0); // 두번째 Column의 내용을 모두 2.0으로 변경.
> ```
> 
> - 행렬 연산
>    
> ```c
> vec3 v = //...
> mat3 A = //...
> mat3 B = //...
> 
> mat3 AB = A * B; // Matrix-Matrix Product OK!
> mat3 MV = A * v; // Matrix-Vector Product OK!
> mat3 VM = v * A; // Vector-Matrix Product OK?
> ```
> 
> > [!question] 벡터 행렬곱 뭔데{title}
> > 원래는 없는 연산인데, $$\text{vector} \times \text{matrix}$$ 곱이 가능하다.
> > 
> > ![Pasted image 20241006142555.png](/assets/img/posts/Pasted image 20241006142555.png){: .shadow}
> 
> - 관련 함수
>    
> ```c
> mat3 A = //...
> mat3 B = //...
> 
> mat3 P = matrixCompMult(A, B); // 행렬의 성분끼리 곱셈.
> mat3 T = transpose(A);  // 전치 행렬
> float determinant(A);   // 행렬식 계산
> mat3 I = inverse(A);    // 역행렬 계산
> ```
> 

> [!NOTE]- 수학 라이브러리 함수{title}
> 
> - 삼각함수
>   
> ```c
> float angle = degree(3.14); // 180. Radian to Degree
> float theta = radian(90);   // Degree to Radian
> 
> float s = sin(theta);
> float c = cos(theta);
> float t = tan(theta);
> 
> float as = asin(s);
> float ac = acos(c);
> float at = atan(t);
> 
> vec3 vs = sin(v); // (sin(v.x), sin(v.y), sin(v.z)) 벡터를 반환.
> ```
> 
> - 지수, 로그, 제곱근 함수
>   
> ```c
> float x^y = pow(x, y);
> float e^x = exp(x);
> float 2^x = exp2(x);
> 
> float l = log(x);   // ln
> float l2 = log2(x); // log_2
> 
> float s = sqrt(x);
> float is = inversesqrt(x); // 
> ```
> 
> - 절댓값, 부호
>   
> ```c
> float ax = abs(x);
> float sx = sign(x);  // -1, 0, 1 부호를 반환함.
> ```
> 
> - min, max, clamp
>   
> ```c
> float m0 = min(x, y);
> float m1 = max(x, y);
> float c = clamp(x, 0.0, 1.0);
> ```
> 
> > [!question] What is Clamp?{title}
> > 주어진 값을 특정 범위 내로 제한하는 역할을 한다.
> > 
> > x, min, max 세 값을 입력받으며,
> > x < min일 경우 min 값을 반환한다.
> > min <= x <= max일 경우 x값을 반환한다.
> > x > max일 경우 max 값을 반환한다.
> > 
> > ![Pasted image 20241006143656.png](/assets/img/posts/Pasted image 20241006143656.png){: .shadow}
> 

> [!tip]- 프로그래밍 팁{title}
> 
> 1. 분기문(if, else), for문과 같이 브랜치가 분기되는 코드는 사용할수록 성능이 떨어진다.
> 
> > [!question]- Why?{title}
> > GPU는 병렬 처리할 때, 모든 코어가 한라인 한라인 동기화해서 동시에 실행된다.
> > 
> > 따라서 분기가 나뉘는 if문이나 for문을 사용하면
> > 
> > 한 코어의 쉐이더의 분기가 끝날 때까지 다른 쉐이더에서 아무것도 안하고 정지상태가 된다.
> > 
> > for문도 마찬가지로, 어떤 코어가 실행중인 쉐이더의 for문이 끝날때까지 다른 코어는 아무것도 안하고 가만히 있는다.
> > 
> > 따라서, 최대한 안쓰는게 좋다.
> 
> > [!example]- if문 대신 Sign 사용{title}
> > ![Pasted image 20241006175143.png](/assets/img/posts/Pasted image 20241006175143.png){: .shadow}
> > 
> > x가 양수면 f에 2.0 넣고, 음수면 -2.0을 넣는다.
> > `f = 2.0 * sign(x);`
> > if문도 없애면서 한줄로 줄일 수 있다.
> 
> > [!example]- if문 대신 min, max 사용{title}
> > ![Pasted image 20241006175205.png](/assets/img/posts/Pasted image 20241006175205.png){: .shadow}
> > 
> > root1가 작으면 root1 선택, 아니면 root2 선택.
> > `return vec3(0.0, 0.0, min(root1, root2));`
> 
> 2. 라인수를 줄이는게 좋다.
> 
> > [!example]- min, max 함수 대신 clamp 사용{title}
> > ![Pasted image 20241006175436.png](/assets/img/posts/Pasted image 20241006175436.png){: .shadow}
> > 
> > x가 minimum보다 작으면 minimum이 반환되고,
> > x가 minimum보다 크고, maximum보다 작으면 x가 반환되고
> > x가 maximum보다 크면 maximum이 반환된다.
> > 
> > 이거 클램프네?
> > `float f = clamp(x, minimum, maximum);`
> > 2개의 함수 call을 하나로 줄였다.
> 
> > [!example]- 분기문 대신 then, any, all 함수 사용{title}
> > ![Pasted image 20241006175736.png](/assets/img/posts/Pasted image 20241006175736.png){: .shadow}
> > 
> > 각 성분끼리 비교해서 p가 하나라도 작으면 true, 아니면 false.
> > 
> > `return any(lessThen(p, q));`
> 
> 3. 쉐이더 프로그램을 자주 바꿀 시 성능에 좋지 않다. 쉐이더 프로그램을 바꿀때마다, 렌더링 파이프라인의 상태를 다시 설정하고 캐시가 초기화되기 때문에 느려진다.
> 
> > [!example]- 예를들어..{title}
> > ```c
> > glUseProgram (1); glDrawArrays( A ...); 
> > glUseProgram (2); glDrawArrays( B ...); 
> > glUseProgram (1); glDrawArrays( C ...); 
> > glUseProgram (2); glDrawArrays( D ...); 
> > ```
> > 
> > 보다는
> > 
> > ```c
> > glUseProgram(1); glDrawArrays(A...); glDrawArrays(C... );
> > glUseProgram(2); glDrawArrays(B...); glDrawArrays(D... );
> > ```
> > 
> > 가 더 효율적이다.

## Vertex Shader

3D 공간 위의 Vertex 정보를 입력받아, Screen 좌표계로 변환한다. MVP 행렬을 uniform variable으로 입력받아 MVP 행렬 곱을 수행하면 된다.

```c
#version 330 core

layout (location = 0) in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    // 정점 좌표에 모델, 뷰, 투영 변환을 적용하여 화면 공간으로 변환
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

- **Default Input Interface Variables**
    - in int gl_VertexID;
        - 정점의 Indesx ID
    - in int gl_InstanceID;
    - in int gl_BaseInstance;
    - in int gl_BaseVertex;
    - in int gl_DrawID:
- **Default Output Interface Variables**
    - vec4 gl_Position;
        - Vertex의 스크린 상의 정점 위치를 출력.
        - `gl_Position = vec4(1.0, 0.0, 0.0, 1.0);`
    - float gl_PointSize;
        - 정점 크기를 지정. 기본값은 1.0
        - `gl_PointSize = 10.0; // 포인트 크기를 10으로 설정`
    - float gl_ClipDistance\[];
        - Clip 조건 설정. 이 값이 0보다 작으면 클리핑됨.
        - `gl_ClipDistance[0] = gl_Position.x - 0.5; // x 좌표가 0.5보다 작은 정점은 클리핑됨`
    - float gl_CullDistance\[]; 
        - Cull 조건 설정. 이 값이 0보다 작으면 컬링됨.
        - `gl_CullDistance[0] = gl_Position.x - 0.5; // x 좌표가 0.5보다 작은 정점은 컬링됨`

## Fragment Shader

Fragment Shader는 Out 변수가 없어서 내가 뭘 출력해줄건지 지정해줘야 한다.

```c
#version 330 core

// 출력을 통해 픽셀 색상을 지정합니다.
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0, 0.5, 0.2, 1.0);  // RGB + 알파 값 (투명도)
}
```

- **Default Input Interface Variables**
    - in vec4 gl_FragCoord;
    - in bool gl_FrontFacing;
    - in float gl_ClipDistance\[];
    - in float gl_CullDistance\[];
    - in vec2 gl_PointCoord;
    - in int gl_PrimitiveID;
    - in int gl_SampleID;
    - in vec2 gl_SamplePosition;
    - in int gl_SampleMaskIn\[];
    - in int gl_Layer;
    - in int gl_ViewportIndex;
    - in bool gl_HelperInvocation;
- **Default Output Interface Variables**
    - out float gl_FragDepth;
    - out int gl_SampleMask\[];

## Geometry Shader

> [!tip]- 등장 배경{title}
> 사용하다보니, Vertex Shader, Fragment Shader 두개로는 충분하지 않다.
> 삼각형으로만 다 표현하려면, 사람 머리카락만 5억개인데 이걸 일일히 삼각형으로 모델링할 수도 없는 노릇.
>
> 따라서, 모델에는 간단한 삼각형 정보만 표현하고, 쉐이더에서 Vertex를 추가하는 방식을 사용한다.
> 
> > [!note] 즉, 핵심 IDEA는 다음과 같다{title}
> > 동물같은거 만들 때 털까지 다 Vertex로 주지 말고,
> > Geometry Shader를 써서 멀리서 볼땐 대충 그리고 가까이서 볼 땐 자세히 그리도록 만들자.

입력은 점, 선, 삼각형(points, lines, triangles) 셋 중 하나를 입력받는다. 각각 따로따로 쉐이더를 만들어 points, lines, triangles마다 다른 로직을 적용시킬 수 있다. 이후 새로운 Primitive를 만들거나, 기존의 Primitive를 수정하여 Primitive Strip(집합)을 반환한다. 아래는 Geometrh Shader의 예제 코드다.

```c
#version 330 core

layout (triangles) in; // 입력 프리미티브는 삼각형. points, lines, triangles중 하나 선택.
layout (triangle_strip, max_vertices = 6) out;  // 예제의 삼각형 스트립으로 최대 6개의 정점만 출력한다.

uniform float furLength; // 털의 길이 (유니폼으로 전달됨)

void main()
{
    vec3 A = gl_in[0].gl_Position.xyz;
    vec3 B = gl_in[1].gl_Position.xyz;
    vec3 C = gl_in[2].gl_Position.xyz;
    
    vec3 face_normal = normalize(cross(C - A, B - A));

    for (int i = 0; i < 3; i++)
    {
        // 원래 위치에서 점 한번 찍고, 위로 올려서 점 한번 찍고 EndPrimitive.
        gl_Position = gl_in[i].gl_Position;
        EmitVertex();
    
        gl_Position = vec4(gl_in[i].gl_Position.xyz + furLength * face_normal, 1.0);
        EmitVertex();
        
        EndPrimitive();
    }
}
```

Geometry Shader는 간단하다. 정점을 생성하고 싶은 위치를 gl_Position에 넣고, EmitVertex() 함수를 실행하면 정점이 만들어진다. 정점들을 찍고, EndPrimitive(); 함수를 실행하면 하나의 Primitive가 만들어진다. 이를 반복하면 된다.

`gl_in[i].gl_Position`을 사용하면 입력받은 Primitive의 Vertex 위치를 받아올 수 있다. line이라면 0, 1 두개를, 삼각형이라면 0, 1, 2 세개의 Vertex를 받는다.

예를들어, 삼각형을 받아서 털을 그리고싶다면 삼각형의 세 점을 사용해서 두 벡터를 만들어 외적하여 삼각형의 Normal Vector를 계산한다. 이후 각 정점 위치에서 Normal Vector만큼 더해서 Vertex를 찍고 Primitive를 만들면 된다.

- 출력 Primitive Type
    - points : 점 집합으로 출력.
    - lines : 연결되지 않은 선 집합으로 출력.
    - line_strip : 연결된 선으로 출력.
    - line_loop : 시작과 끝점까지 연결된 선으로 출력.
    - triangles : 연결되지 않은 삼각형 집합으로 출력,
    - triangle_strip : 연결된 삼각형으로 출력.
    - triangle_fan : 부채꼴 모양으로 연결된 삼각형으로 출력.
    - lines_adjacency : 인접한 정점까지 포함
    - triangles_adjacency
    - line_strip_adjacency
    - triangle_strip_adjacency
- 출력할 Vertex 개수
    - max_vertices = N : 하나의 프리미티브가 생성할 수 있는 최대 Vertex 개수를 제한한다.
        - 만약 삼각형이라면 최소 3개 이상은 되어야 한다.
        - 과도하게 Vertex가 생성되는 것을 방지한다.

## Tessellation Shader

Tessellation의 의미는 '촘촘하게 나누는 것'이다. **Tessellation Control Shader**에서 하나의 선, 삼각형, 사각형을 얼마나 쪼갤지 결정하고, **Tessellation Primitive Generator**에서 쪼개지는 위치에 정점을 만들고, 더 작은 단위의 도형을 만들어 TES에 전달한다. **Tessellation Evaluation Shader**는 쪼개진 도형 조각을 받아 최종 위치를 결정한다.

### Tessellation Control Shader

```c
#version 400 core
layout(vertices = 3) out; // Vertex를 3개씩 묶어서 TES로 보낸다.

void main() {
    if (gl_InvocationID == 0) {  // 첫 번째 호출에서만 세분화 레벨을 설정
        gl_TessLevelOuter[0] = 5.0;
        gl_TessLevelOuter[1] = 5.0;
        gl_TessLevelOuter[2] = 5.0;
        
        gl_TessLevelInner[0] = 3.0;
    }

    // 각 정점의 위치를 Tessellation Evaluation Shader로 전달
    gl_out[gl_InvocationID].gl_Position = gl_in[gl_InvocationID].gl_Position;
}
```

위는 Tessellation Control Shader의 예제 코드이다. 

```c
gl_TessLevelOuter[0] = ...
gl_TessLevelOuter[1] = ...
gl_TessLevelOuter[2] = ...
gl_TessLevelOuter[3] = ...

gl_TessLevelInner[0] = ... 
gl_TessLevelInner[1] = ...
```

위 6개의 변수에 값을 넣어주면 Tessellation Level이 결정된다. 
1. 만약 TES에서 처리할 도형이 선(isolines)이면, `Outer[0], Outer[1]`에만 값을 넣으면 된다. 두 값이 동일하면 균일하게 Tessellation된다. 두 값이 다르다면, 한쪽은 촘촘하고 한쪽은 덜 촘촘하게 나눌 수 있다.
2. TES에서 처리할 도형이 삼각형(triangles)이면, `Outer[0], Outer[1], Outer[2], Inner[0]`에만 값을 넣으면 된다. Outer Level 하나당 삼각형 변 하나를 얼마나 쪼갤지 결정한다. Inner Level은 안쪽 방향으로는 얼마나 쪼갤지 결정한다.

![Pasted image 20241007010811.png](/assets/img/posts/Pasted image 20241007010811.png){: width="300" .shadow}

3. TES에서 처리할 도형이이 사각형(quads)이라면, `Outer[0], Outer[1], Outer[2], Outer[3], Inner[0], Inner[1]` 전부 값을 지정해줘야 한다. Outer Level 하나당 사각형 변 하나를 얼마나 쪼갤지 결정한다. Inner Level은 안쪽 방향으로 얼마나 쪼갤지 결정하는데, x축 y축 따로따로 나누고자 Inner Level을 2개 사용한다.

![Pasted image 20241007010935.png](/assets/img/posts/Pasted image 20241007010935.png){: width="300" .shadow}

## Tessellation Evaluation Shader

> [!tip]- 무슨 역할을 하는가?{title}
> Tessellation Control Shader에는 하나의 Primitive (선, 삼각형, 사각형)이 들어오고
> Tessellation Primitive Genetator에서 Tessellation Level를 보고 Tessellation을 쪼개도록 하는 Vertex를 생성한다.
> 
> 생성한 Vertex 하나당 Tessellation Eveluation Shader 하나씩 배정되며,
> TES에선 생성된 Vertex의 최종 위치를 결정하는 역할을 담당한다.

입력받은 Vertex를 선, 삼각형, 사각형(isolines, triangles, quads) 셋중 하나로 처리할 수 있다.
만약 3개 이상의 Vertex를 입력받았는데 isolines를 사용한다면, Lines로 인식한다.
5개 이상의 Vertex를 입력받았는데 triangles를 사용한다면, 3개의 삼각형으로 인식한다.

```c
#version 400 core 

layout(triangles, fractional_even_spacing, ccw) in;
```

- 첫번째 인자
    - isolines : 선형 패치를 입력받는다.
    - triangles : 삼각형 패치를 입력받는다.
    - quads : 사각형 패치를 입력받는다.
- 두번째 인자
    - equal_spacing : 모든 정점이 패치 위에서 균등하게 배치됨.
    - fractional_even_spacing : 정점들이 짝수 간격으로 배치됨? 가능한 균등하게 배치된다.
    - fractional_odd_spacing : 정점들이 홀수 간격으로 배치됨? 가능한 균등하게 배치된다.
- 세번째 인자
    - cw (clockwise) : 정점들이 시계 방향으로 배치된다.
    - ccw (counterclockwise) : 정점들이 반시계 방향으로 배치된다.

원래 Primitive가 갖는 Vertex 정보와, Primitive 내의 상대 좌표를 사용하여 생성된 Vertex의 최종 위치를 결정하면 된다. 원래 Primitive의 Vertex 정보는 다음과 같이 가져올 수 있다.

```c
void main() {
    // 선이면 2개, 삼각형이면 3개, 4각형이면 4개를 가져오면 됨.
    vec3 p0 = gl_in[0].gl_Position.xyz;
    vec3 p1 = gl_in[1].gl_Position.xyz;
    vec3 p2 = gl_in[2].gl_Position.xyz;
    vec3 p3 = gl_in[3].gl_Position.xyz;
```

![Pasted image 20241020155010.png](/assets/img/posts/Pasted image 20241020155010.png){: width="300" .shadow}

이후, gl_TessCoord를 사용해서 최종 위치를 결정한다. gl_TessCoord는 원래 Primitive 좌표에 대해 상대적으로 표현된 점이다. 선분이면, 한쪽 점이 0이고, 반대쪽 점이 1이면 그 사이에 상대적으로 어느 위치에 있는지만 표시하면 되므로, gl_TessCoord.x 정보만 사용하면 된다.

![img1.daumcdn 1.png](/assets/img/posts/img1.daumcdn 1.png){: width="300" .shadow}

삼각형은 **Barycentric Coordinates**를 사용한다. 이는 gl_TessCoord.x, y, z 모두 사용된다. Barycentric 좌표의 합은 항상 1이다. 예를들어, gl_TessCoord가 `(0.2, 0.3, 0.5)`로 주어지면, 해당 버텍스는 첫 번째, 두 번째, 세 번째 꼭짓점으로부터 각각 20%, 30%, 50% 떨어진 위치에 있다는 것을 의미한다.

![Pasted image 20241020155548.png](/assets/img/posts/Pasted image 20241020155548.png){: width="300" .shadow}

사각형은, gl_TessCoord.z를 사용하지 않아도 된다. gl_TessCoord.x는 가로 축에서 상대적인 위치를,
gl_TessCoord.y는 세로 축에서 상대적인 위치를 나타낸다.
`
```c
vec3 position = gl_TessCoord.x * p0 + gl_TessCoord.y * p1 + gl_TessCoord.z * p2;

// 생성된 정점의 최종 위치 결정.
gl_Position = vec4(position, 1.0);
```