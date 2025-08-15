# 네임스페이스 규칙
## 개요
네임스페이스는 협업 개발에 필수적입니다. 저희 모든 프로젝트에도 마찬가지로 반드시 필연적으로 모든 스크립트에 네임스페이스가 들어갑니다. 네임스페이스가 없는 스크립트는 디버깅 코드로 간주되어 배포될 수 없습니다. 그러나 디버깅 목적일지라도 네임스페이스를 포함하는 것을 권장합니다.

## 규칙
아래는 저희 개발팀이 모든 프로젝트에 적용하는 네임스페이스 규칙입니다.

### 네임스페이스 경로
이것은 네임스페이스 구조 템플릿입니다.
<code>APUCSW.[ProjectName].[ModuleName]</code>

그리고 이것은 각 프로그래밍 언어에 따른 템플릿입니다.

#### C#
<code class="language-csharp">APUCSW.[ProjectName].[ModuleName]</code>

<b>예시</b>:
<code class="language-csharp">namespace APUCSW.ProjectAssets.Client</code>

#### Java
<code class="language-java">apucsw.[ProjectName].[ModuleName]</code>

<b>예시</b>:
<code class="language-java">apucsw.examplemod.client</code>

### 네임스페이스 트리
이것은 네임스페이스 트리 구조 템플릿입니다.
프로젝트의 생성 시기에 따라 구조가 약간씩 다를 수 있으나 보통은 아래와 같습니다.

<div class="prism-style"><pre class="line-numbers"><code class="language-textfile">
    ProjectAssets
    ├─ Client
    │  ├─ Game
    │  ├─ Player
    │  ├─ Audio
    │  ├─ Rendering
    │  ├─ Network
    │  ├─ System
    │  │  ├─ UI
    │  │  ├─ Input
    │  │  ├─ Save
    │  │  ├─ Localization
    │  │  ├─ ...
    │  ├─ ...
    ├─ Server
    │  ├─ Network
    │  ├─ Auth
    │  ├─ Database
    │  ├─ Logic
    │  ├─ API
    │  ├─ ...
    ├─ Common
    │  ├─ Data
    │  ├─ Enum
    │  ├─ Interface
    │  ├─ Event
    │  ├─ Util
    │  ├─ ...
    └─ Editor

</code></pre></div>

<b>정보</b>: <code>Editor</code> 모듈은 유니티 프로젝트에 사용합니다.