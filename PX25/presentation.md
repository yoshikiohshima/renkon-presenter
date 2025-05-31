# Renkon-pad: A Live and Self-Sustaining Programming Environment based on Functional Reactive Programming
### Yoshiki Ohshima, Adam Bouhenguel and Matthew Good

<img style="width: 50%" src="./tinlizzie.jpeg"/>

<style>
html {
   background-color: #FAF4F4
}

#renkon {
  padding: 24px
}

.pagebreak {
   height: 100vh
}

h1 {
  color: #484;
}

h2 {
  padding-top: 24px;
  color: #484;
}

code {
    font-size: 24px;
    color: #448;
}

ul {
    font-size: 24px;
}

img {
  width: 80%;
}
</style>

<div class="pagebreak"></div>

## Motivation

- A local AI project called **Project Substrate**.
- Create a programming environment that can be improved by humans and AI models.
- Clear a bad rap around FRP by showing that it can support a dynamically modifiable self-sustained environment.

<div class="pagebreak"></div>

## Renkon: An FRP Language

- Borrow syntax from JavaScript.
- Free variables become dependencies for a <b>node</b> in the reactive network.
- Separation between behaviors on the continuous time domain and events on the discrete domain: A very good thing!
- A sound foundation to build a data-flow based programming environment.

<div class="pagebreak"></div>

## Renkon: A Simple Example

``` JavaScript
const hundred = new Promise(
    (resolve) => setTimeout(() => resolve(100), 500));
const timer1 = Events.timer(1000);
console.log(hundred + timer1);
```

<div class="pagebreak"></div>

## Renkon: DOM Manipulation

``` JavaScript
const timer = Events.timer(1000);
const _adder = ((timer) => {
  const button = document.createElement("button");
  button.textContent = timer;
  document.body.appendChild(button);
})(timer);
```

<div class="pagebreak"></div>

## Renkon: Preact Virtual DOM

``` JavaScript
const {h, render} = import("./preact.standalone.module.js");

const timer = Events.timer(1000);
const dom = h("button", {}, timer);
render(dom, document.body);
```

<div class="pagebreak"></div>

## Renkon: Combinators

### A familiar set of combinators: "or", "collect", etc.

<div class="pagebreak"></div>

## Renkon: Events.or()

```
const {html, render} = import("./preact.standalone.module.js");
const vdom = html`<div>
  <button id="up">up</button>
  <button id="down">down </button>
</div>`;
const myRender = ((vdom, dom) => {render(vdom, dom); return dom});

const realDom = myRender(vdom, document.body);

const up = Events.listener(
  realDom.querySelector("#up"),
  "click",
  evt => evt);
const down = Events.listener(
  realDom.querySelector("#down"),
  "click",
  evt => evt);
const upOrDown = Events.or(up, down);
console.log(upOrDown);
```

<div class="pagebreak"></div>

## Renkon: Behaviors.collect()

### analogical to the "fby" construct in some other synchronous languages.

```
const data = Behaviors.collect([],
  upOrDown, (prev, evt) => [...prev, evt.target.id]
);
console.log(data);
```

### select: multi-arm variation

```
const collection = Behaviors.select([],
  reset, (now, _reset) => [],
  timer, (now, timer) => [...now, timer]
);
```

<div class="pagebreak"></div>

## Renkon: Ways to break Cyclic Dependencies

### There are three ways to accommodate some kind of cyclic dependency

- (collect and select)
- Events.send() and Events.receiver()
- $-variable

<div class="pagebreak"></div>

## Events.send() and Events.receiver()

```
const {html, render} = import('./preact.standalone.module.js');

const reset = Events.receiver();
const timer = Events.timer(1000);
const collection = Behaviors.select([],
  reset, (_now, _reset) => [],
  timer, (now, timer) => [...now, timer]
);

const resetter = (evt) => Events.send(reset, "reset");
const buttonDOM = collection.map((n) =>
   html`<button onClick=${resetter}>${n}</button>`);
const buttonsHTML = html`<div>${buttonDOM}</div>`;
render(buttonsHTML, document.body);
```

<div class="pagebreak"></div>

## $-variable

```
const abortController = Behaviors.collect(
  new AbortController(),
  $responses,
  (prev, _resp) => {prev.abort(); return new AbortController();});

const response = fetch("http://localhost:8080/completion", {
    method: 'POST',
    body: JSON.stringify(completionRequest),
    signal: abortController.signal,
});

const responses = Behaviors.collect(
  [],
  response, (chunks, resp) => [...chunks, resp.value]);
```

<div class="pagebreak"></div>

## Renkon-pad: A self-sustaining programming environment

### An overlapping window to edit code and run it. 

- Text boxes and Runner iframes
- A number of Renkon node definitions in a text box
- Dataflow visualization

<div class="pagebreak"></div>

## Dependency Visualization

### Lines are purely informational.

<img style="width: 60%" src="dependency-1.png"/>

<div class="pagebreak"></div>

## Renkon-pad: Implementation

- Data Structure: windows, positions, windowTypes, titles, etc. Properties are composed in "side-ways"
- Initialization
- User Interaction: click buttons, pointer move, etc.
- Rendering
- Saving and Loading
- New Component
- Dataflow visualization
- CSS

<div class="pagebreak"></div>

## Renkon-pad: Data Structure (1)

### What is a good way to represent the array of windows?

<img src="data-1.png"/>

<div class="pagebreak"></div>

## Renkon-pad: Data Structure (2)

<img style="width: 25%" src="data-1.png"/>

<div style="margin-left: auto; margin-right:auto; border: 1px solid black; width: fit-content">
<code>
  <pre>
windows: [
   {id: “1”,
	position: {x: 100, y: 243, w: 325, h: 96},
	title: “test”,
	type: “code”,
	contents: EditorView
  }, {id: “2”,
	position: {x: 530, y: 330, w: 582, h: 320},
	title: “my runner”,
	type: “runner”,
	contents: iframe
  }
]
</pre>
</code>
</div>

<div class="pagebreak"></div>

## Renkon-pad: Data Structure (3)

<div style="margin-left: auto; margin-right:auto; border: 1px solid black; width: fit-content">
<code>
  <pre>
windows: [“1”, “2”]
positions: Map(
	“1” → {x: 100, y: 243, w: 325, h: 96},
	“2” → {x: 530, y: 330, w: 582, h: 320})
titles: Map(
	“1” → “test”,
	“2” → “my runner”)
windowTypes: Map(
	“1”→ “code”,
	“2” → “runner”)
windowContents: Map(
       “1” → EditorView,
       “2” → iframe)
</pre>
</code>
</div>

<img src="excel.png"/>

<div class="pagebreak"></div>

## Renkon-pad: User Interaction

### Allows direct handling of a DOM event and use it as an FRP update

```
const addCode = Events.listener(
    root.querySelector("#addCodeButton"),
    "click",
    () => "code");

const _padMove = Events.listener(
    root.querySelector("#pad"),
    "pointermove",
    moveCompute);

Events.listener(document.body, "gesturestart", preventDefaultSafari);

```

### wheel, multi touch and all that takes a lot of lines, and a listener function needs to be invoked directly

<div class="pagebreak"></div>

## Demo (1): Delayed event

<div class="pagebreak"></div>

## Demo (2): Blown up graph

<div class="pagebreak"></div>

## Demo (3): Self modification

<div class="pagebreak"></div>

## Demo (4): Rotating Windows

<div class="pagebreak"></div>

## Demo (5): Markdown Editor

<code><pre>https://yoshikiohshima.github.io/renkon-presenter/presenter.html</pre></code>

<div class="pagebreak"></div>

## Demo (6): Rhythm Game

<code><pre>https://yoshikiohshima.github.io/renkon-garupa/garupa.html</pre></code>

<div class="pagebreak"></div>

## Future Work:

- Better integration with lint by writing custome rules for Renkon.
- LLM integration

<div class="pagebreak"></div>

## おわりです。

<div class="pagebreak"></div>

## まじ終わり。
