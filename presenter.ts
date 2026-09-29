import {Events, Behaviors} from "./renkon-core";
type moveFunc = (evt:PointerEvent) => PointerEvent;

export function initialization() {
  const init = (() => {
    const script = document.createElement("script");
    script.id = "markdownit";
    script.src = "./markdown-it.min.js";
    const promise = new Promise((resolve) => {
      script.onload = () => {
        resolve(window.markdownit);
      };
    });

    document.head.querySelector("#markdownit")?.remove();
    document.head.appendChild(script);

    const container = document.createElement("div");
    container.id = "container";
    document.body.querySelector("#container")?.remove();
    document.body.appendChild(container);
    container.innerHTML = `
    <div id="presenter-result"></div>
    <div id="separator"></div>
    <div id="editorContainer">
      <div id="buttons">
        <button class="menuButton" id="save">save</button>
        <button class="menuButton" id="load">load</button>
      </div>
      <div id="editorContainer2"></div>
    </div>
`.trim();
    return {markdownit: promise, container};
})();

  const resolved = Behaviors.resolvePart(init);
  const md = resolved.markdownit({html: true});
  const container = resolved.container;
  const separator = container.querySelector("#separator");

  return {md, separator};
}

export function newEditorNodes() {
  const newEditor = (id:string, doc:string, ext:any) => {
    const mirror = (window as any).CodeMirror;

    const editor = new mirror.EditorView({
      doc: doc || `# Hello, Renkon`,

      extensions: [
        mirror.basicSetup,
        mirror.EditorView.lineWrapping,
        ext.of([]),
        mirror.EditorView.editorAttributes.of({"class": "editor"}),
        mirror.view.keymap.of([mirror.commands.indentWithTab])
      ],
    });
    editor.dom.id = `${id}-editor`;
    return editor;
  };
  return {newEditor};
}

export function rendering(md:any, container:any, numberUpdated:number) {
  const divTarget:HTMLElement = Events.receiver<HTMLElement>();

  const editorString = Events.observe((notify) => {
    let lastText:string|null|undefined;
    const callback = (window as any).CodeMirror.EditorView.updateListener.of((viewUpdate) => {
      if (viewUpdate.selectionSet) {
        const from = viewUpdate.state.selection.main?.from;
        const line = viewUpdate.state.doc.lineAt(from);
        if (line) {
          const number = line.number;
          Events.send(numberUpdated, number);
        }
      }
      const current = viewUpdate.state.doc.toString();
      if (lastText === undefined || current !== lastText) {
        if (lastText === undefined) {
          lastText = null;
        } else {
          lastText = current;
        }
        notify(current);
      }
    });
    editor.dispatch({
      effects: callbackExt.reconfigure([callback])
    });
    return () => {
      editor.dispatch({
        effects: callbackExt.reconfigure([])
      });    
    }
  });

  const markdown = Behaviors.keep(md.render(editorString));
  const map = ((editorString) => {
    let result = [];
    try {
      result = Behaviors.keep(md.parse(editorString));
    }
    catch (e) {}
    return result;
  })(editorString);
    
  const hMap = map.filter((m) => m.type === "heading_open" && ["h1", "h2"].includes(m.tag));
  const sections = [...resultDiv.querySelectorAll(":is(h1, h2)")];

  const resultDiv = Behaviors.keep(((markdown, container) => {
    const div = document.createElement("div");
    div.id = "renkon";
    container.querySelector("#renkon")?.remove();
    container.querySelector("#presenter-result").appendChild(div);
    div.innerHTML = markdown;
    return div;
  })(markdown, container));

  const editor = newEditor("0", ``, callbackExt);
  const callbackExt = new (window as any).CodeMirror.state.Compartment();

  container.querySelector("#editorContainer2").appendChild(editor.dom);
  return {hMap, editorString, sections, divTarget};
}

export function scroll(hMap:any, sections:HTMLElement[], divTarget:HTMLElement, container:HTMLElement, editor:any) {
  const numberUpdated:number = Events.receiver<number>();
  
  const key:KeyboardEvent = Events.observe((notify) => {
    const handler = (evt:KeyboardEvent) => {
      if (evt.target !== document.body) {return;}
      if (evt.key !== "ArrowUp" && evt.key !== "ArrowDown") {return;}
      evt.preventDefault();
      notify(evt);
    };
    document.body.addEventListener("keydown", handler);
    return () => document.body.removeEventListener("keydown", handler);
  });

  const currentSectionUpdated = ((evt:KeyboardEvent, sections:HTMLElement[]) => {
    if (evt.target !== document.body) {return;}

    if (evt.key !== "ArrowUp" && evt.key !== "ArrowDown") {return;}
    let found;
    if (evt.key === "ArrowDown") {
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 20) {
          found = section;
          break;
        }
      }
    } else if (evt.key === "ArrowUp") {
      for (let ind = sections.length - 1; ind >= 0; ind--) {
        const section = sections[ind];
        const rect = section.getBoundingClientRect();
        if (rect.top < -5) {
          found = section;
          break;
        }
      }
    }
    if (!found) {return;}

    evt.preventDefault();

    Events.send<HTMLElement>(divTarget, found);

    return found;
  })(key, sections);

  const currentLineUpdated = ((currentSectionUpdated, sections, hMap) => {
    const index = sections.indexOf(currentSectionUpdated!);
    return hMap[index].map?.[1];
  })(currentSectionUpdated, sections, hMap);

  const divGoto = ((divTarget) => {
    const result = container.querySelector("#presenter-result");
    if (!result) {return;}
    result.scrollTop += divTarget.getBoundingClientRect().top;
    return divTarget;
  })(divTarget);

  const goto = ((currentLineUpdated, editor) => {
    const line = editor.state.doc.line(currentLineUpdated);
    /*
    I want to show the selected line at the top of the editor, but not sure how to do that.
    editor.dispatch({
    selection: { head: editor.state.doc.length, anchor: editor.state.doc.length },
    scrollIntoView: true
    });
     */

    editor.dispatch({
      selection: { head: line.from, anchor: line.from },
      scrollIntoView: true
    });
  })(currentLineUpdated, editor);

  const currentSection = Behaviors.collect<null|HTMLElement, HTMLElement>(null, currentSectionUpdated!, (_prev, currentSectionUpdated) => currentSectionUpdated);

  const newSelectedDiv = ((hMap, sections, numberUpdated) => {
    for (let i = 0; i < hMap.length - 2; i++) {
      const prev = hMap[i].map;
      const next = hMap[i + 1].map;
      if (prev[0] <= numberUpdated && numberUpdated < next[0]) {
        return sections[i];
      }
    }
  })(hMap, sections, numberUpdated);

  const anotherGoto = ((newSelectedDiv, currentSection) => {
    if (newSelectedDiv === currentSection) {return;}
    Events.send(divTarget, newSelectedDiv);
  })(newSelectedDiv, currentSection);
  return {anotherGoto, divGoto, goto};
}

export function separator(separator:HTMLElement) {
  const sepDown = Events.listener(
   separator,
   "pointerdown",
   evt => evt);

  const down = Events.collect<undefined|{type:string, x:number}, PointerEvent>(undefined, sepDown, (old, evt) => {
    if (evt.isPrimary) {
      (evt.target as HTMLElement).setPointerCapture(evt.pointerId);
    }
    return {type: "sepDown", x: evt.clientX};
  });

  const up = Events.listener(
    separator,
    "pointerup",
    (evt) => {
      if (evt.isPrimary) {
        evt.target.releasePointerCapture(evt.pointerId);
      }
      return {type: "sepUp"}
    }
  );

  const _sepMove = Events.listener<(move:any)=>void>(separator, "pointermove", moveCompute);

  const moveCompute:moveFunc = Behaviors.select<moveFunc>(
    evt => evt,
    down, (_old:moveFunc, down:{type:string, x:number}) => {
      return (move:PointerEvent) => {
        const newX = move.clientX;
        const newRenkonWidth = Math.min(window.innerWidth - 8, Math.max(newX - 8, 0));
        const newEditorWidth = Math.max(window.innerWidth - 22 - newRenkonWidth, 60);
        const showButton = newEditorWidth !== 60;
        const right = newEditorWidth === 60 ? -60 - 16 + (window.innerWidth - newX) : 0;

        document.head.querySelector("#separator-style")!.textContent = `
#presenter-result {
  width: ${newRenkonWidth}px;
}
#editorContainer {
  width: ${newEditorWidth}px;
  right: ${right}px;
}

#buttons {
  visibility: ${showButton ? "visible" : "hidden"};
}


`.trim();
      return move;
    }
  },
    up, (_old, _up) => (move) => move,
    resize, (old, resize) => {
      const newX = window.innerWidth - 22;
      const newEditorWidth = 60;
      const showButton = newEditorWidth !== 60;
      const right = -60;
      document.head.querySelector("#separator-style")!.textContent = `
#presenter-result {
  width: ${newX}px;
}

#editorContainer {
  width: ${newEditorWidth}px;
  right: ${right}px;
}

#buttons {
  visibility: ${showButton ? "visible" : "hidden"};
}

`.trim();
    return old;
  }
);

  const resize = Events.listener(window, "resize", (evt) => ({type: "resize"}));
  return {down, sepDown};
}

export function css() {
const css = `
#container, html, body {
  width: 100%;
  height: 100%;
  margin: 0px;
}

#container {
  display: flex;
}

#presenter-result {
  height: 100%;
  width: calc(100% - 220px);
  overflow: scroll;
  scroll-behavior: smooth;
}

#renkon {
  height: 100%;
}

#separator {
   width: 8px;
   min-width: 8px;
   height: 100%;
   background-color: #f8f8f8;
}

#separator:hover {
   background-color: #e8e8e8;
   cursor: ew-resize;
}

#editorContainer {
  position: fixed;
  right: 0px;
  min-height: 100%;
  height: 100%;
  width: 200px;
  border: 1px solid black;
  padding: 6px;
  min-width: 0px;
  background-color: white;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
}

#editorContainer2 {
  overflow: scroll;
}

#buttons {
   display: flex;
   justify-content: right;
   margin-bottom: 6px;
}

.menuButton {
  font-family: 'OpenSans-SemiBold';
  color: black;
  margin-left: 4px;
  margin-right: 4px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid #555;
}

`.trim();

((css) => {
    document.head.querySelector("#presenter-style")?.remove();
    const style = document.createElement("style");
    style.id = "presenter-style";
    style.textContent = css;
    document.head.appendChild(style);

    document.head.querySelector("#separator-style")?.remove();
    const sepStyle = document.createElement("style");
    sepStyle.id = "separator-style";
    document.head.appendChild(sepStyle);
})(css);
  return {css}
}

export function saveAndLoad(container:HTMLElement, editor:any) {
  const save = Events.listener(container.querySelector("#save"), "click", (evt) => evt)
  const load = Events.listener(container.querySelector("#load"), "click", (evt) => evt)

  const _saver = ((editor, save) => {
    const data = editor.state.doc.toString();

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(data);
    const div = document.createElement("a");
    div.setAttribute("href", dataStr);
    div.setAttribute("download", `presentation.md`);
    div.click();
  })(editor, save);

  const loadData = (() => {
    const input = document.createElement("div");
    input.innerHTML = `<input id="imageinput" type="file" accept=".md">`;
    const imageInput = input.firstChild;

    imageInput.oncancel = () => imageInput.remove();
    document.body.appendChild(imageInput);
    imageInput.click();
    return new Promise((resolve, reject) => {
      imageInput.onchange = () => {
        const file = imageInput.files[0];
        if (!file) {imageInput.remove(); return;}
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
      };
    }).then((data) => {
      imageInput.value = "";
      return new TextDecoder("utf-8").decode(data);
    });

  })(load);

  const _loader = ((loadData, editor) => {
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: loadData
      }
    });
  })(loadData, editor);
  return {_loader, _saver}
}
