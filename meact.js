const Meact = (() => {
    let hooks = []
    let index = 0

    const useState = (iv) => {
        const _idx = index++
        const val = hooks[_idx] || iv
        const setVal = (v) => {
            hooks[_idx] = v
        }
        return [val, setVal]
    }

    const useEffect = (f, deps) => {
        const _idx = index++
        const oldDeps = hooks[_idx] || deps
        const hasChanged = _arraysAreDiff(deps, oldDeps)
        if (hasChanged) f()
        hooks[_idx] = deps
    }

    const _arraysAreDiff = (arr1, arr2) => {
        return arr1.some((item, i) => !Object.is(item, arr2[i]))
    }


    let internal = []
    let iidx = 0
    const _render = (c, p, i=0) => {
        // Diffs based on previous tag and some other stuff
        let _iidx = iidx++
        const _c = c()
        const oC = internal[_iidx]

        const [tag, props, handlers, text, children] = _c
        const [oTag, oProps, oHandlers, oText, oEl] = oC || []

        let el
        if (tag !== oTag) {
            el = document.createElement(tag)
            if (oEl) {
                oEl.replaceWith(el) 
            } else {
                p.appendChild(el)
            }
        } else {
            el = oEl
        }
        
        for (let p in props) el[p] = props[p]

        for (let e in oHandlers) el.removeEventListener(e, oHandlers[e])
        for (let e in handlers) el.addEventListener(e, handlers[e])

        if (text !== oText) {
            updated = true
            let tn
            if (oText) {
                tn = el.firstChild
            } else {
                tn = document.createTextNode(text)
                el.appendChild(tn)
            }
            tn.textContent = text
        }
        internal[_iidx] = [tag, props, handlers, text, el]
        for(let child of children) _render(child, el, ++i)
    }

    const render = (c, p) => {
        index = 0
        iidx = 0
        _render(c, p)
        setTimeout(() => render(c, p), 50)
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
        () => ["button", {}, {click: () => onUpdateText(text)}, `Update to: ${text}`, []],
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
