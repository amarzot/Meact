const Meact = (() => {
    let hooks = []
    let shouldUpdate = true;
    let index = 0;

    const useState = (iv) => {
        const _idx = index++;
        const val = hooks[_idx] || iv
        const setVal = (v) => {
            hooks[_idx] = v
            shouldUpdate = true
        }
        return [val, setVal]
    }

    const useEffect = (f, deps) => {
        const _idx = index++;
        const oldDeps = hooks[_idx] || deps
        const hasChanged = deps.some((dep, i) => !Object.is(dep, oldDeps[i]))
        if (hasChanged) f()
        hooks[_idx] = deps
    }


    const _render = (c, p) => {
        // TODO: Only rerender if different
        const [tag, props, handlers, text, children] = c()
        const el = document.createElement(tag)
        for (let p in props) el[p] = props[p]
        for (let e in handlers) el.addEventListener(e, handlers[e])
        if (text) {
            const tn = document.createTextNode(text)
            el.appendChild(tn)
        }

        for(let child of children) _render(child, el)
        p.appendChild(el)
    }

    const render = (c, p) => {
        if (shouldUpdate) {
            shouldUpdate = false
            index = 0
            p.textContent = ''
            _render(c, p)
        }
        setTimeout(() => render(c, p), 100)
    }

    return {useState, useEffect, render}
})()

function Counter({initial=0}={}) {
    const [val, setVal] = Meact.useState(initial)
    return [ "div", {}, {}, null, [
        () => ["button", {}, {click: () => setVal(val-1)}, "-", []],
        () => ["span", {}, {}, `Count is: ${val}`, []],
        () => ["button", {}, {click: () => setVal(val+1)}, "+", []],
    ]]
}

function TextUpdater({placeholder="Type new text here!", onUpdateText=()=>{}}={}) {
    const [text, setText] = Meact.useState("")

    return [  "div", {}, {}, null, [
        () => ["input", {value: text}, {input: e=>setText(e.target.value)}, null, []],
        () => ["button", {}, {click: () => onUpdateText(text)}, "update", []],
    ]]
}

function App() {
    const [text, setText] = Meact.useState("Hello World!")

    return [ "div", {}, {}, text, [
        () => [ "br", {}, {}, null, [] ],
        () => Counter({initial: 5}),
        () => TextUpdater({onUpdateText: setText}),
    ]]
}

document.addEventListener("DOMContentLoaded", function () {
    const root = document.getElementById("root")
    Meact.render(App, root)
})
