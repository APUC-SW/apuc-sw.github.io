# Namespace Rules
## Overview
Namespaces are essential for collaborative development. Therefore, all our projects require scripts to include namespaces. Scripts without namespaces are considered debugging code and cannot be deployed. However, we strongly recommend including namespaces even for debugging purposes.

## Rules
Below are the namespace rules that our development team applies to all projects.

### Namespace Path
This is a template of namespace structure.
<code>APUCSW.[ProjectName].[ModuleName]</code>

And this is a template of each programming languages.

#### C#
<code class="language-csharp">APUCSW.[ProjectName].[ModuleName]</code>

<b>Example</b>:
<code class="language-csharp">namespace APUCSW.ProjectAssets.Client</code>

#### Java
<code class="language-java">apucsw.[ProjectName].[ModuleName]</code>

<b>Example</b>:
<code class="language-java">apucsw.examplemod.client</code>

### Namespace Tree
This is a template of namespace tree structure.
The structure may vary slightly depending on when the project was created, but it is usually as follows:

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

<div class="wikitag-note">
    <div class="wikitag-titlewrapper">
        <div class="wikitag-icon">
            <span class="material-symbols-outlined">lightbulb</span>
        </div>
        <div class="wikitag-title">NOTE:</div>
    </div>
    <div class="wikitag-content"><code>Editor</code> module is used in Unity projects.</div>
</div>
