# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: "[plugin:runtime-error-plugin]"
    - generic [ref=e6]: Cannot read properties of undefined (reading 'objects')
  - generic [ref=e8] [cursor=pointer]: /home/boss/IdeaProjects/CanvasBlox/client/src/pages/LevelEditor.tsx:68:49
  - generic [ref=e9]: "66 | } 67 | }, 68 | [editorState.selectedTool, currentLevel.objects, currentLevel.spawnPoints, _selectObject, setEditorState] | ^ 69 | ); 70 |"
  - generic [ref=e10]:
    - text: at LevelEditor
    - generic [ref=e11] [cursor=pointer]: /home/boss/IdeaProjects/CanvasBlox/client/src/pages/LevelEditor.tsx:68:49
  - generic [ref=e12]:
    - text: Click outside, press
    - generic [ref=e13]: Esc
    - text: key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e14]: server.hmr.overlay
    - text: to
    - code [ref=e15]: "false"
    - text: in
    - code [ref=e16]: vite.config.js
    - text: .
```