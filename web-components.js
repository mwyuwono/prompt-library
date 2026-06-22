var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/tslib/tslib.es6.mjs
function __decorate(decorators, target, key, desc) {
  var c4 = arguments.length, r7 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d4;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r7 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d4 = decorators[i6]) r7 = (c4 < 3 ? d4(r7) : c4 > 3 ? d4(target, key, r7) : d4(target, key)) || r7;
  return c4 > 3 && r7 && Object.defineProperty(target, key, r7), r7;
}

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t = (t6) => (e9, o8) => {
  void 0 !== o8 ? o8.addInitializer(() => {
    customElements.define(t6, e9);
  }) : customElements.define(t6, e9);
};

// node_modules/@lit/reactive-element/css-tag.js
var t2 = globalThis;
var e = t2.ShadowRoot && (void 0 === t2.ShadyCSS || t2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t6, e9, o8) {
    if (this._$cssResult$ = true, o8 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t6, this.t = e9;
  }
  get styleSheet() {
    let t6 = this.o;
    const s4 = this.t;
    if (e && void 0 === t6) {
      const e9 = void 0 !== s4 && 1 === s4.length;
      e9 && (t6 = o.get(s4)), void 0 === t6 && ((this.o = t6 = new CSSStyleSheet()).replaceSync(this.cssText), e9 && o.set(s4, t6));
    }
    return t6;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t6) => new n("string" == typeof t6 ? t6 : t6 + "", void 0, s);
var i = (t6, ...e9) => {
  const o8 = 1 === t6.length ? t6[0] : e9.reduce((e10, s4, o9) => e10 + ((t7) => {
    if (true === t7._$cssResult$) return t7.cssText;
    if ("number" == typeof t7) return t7;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t7 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t6[o9 + 1], t6[0]);
  return new n(o8, t6, s);
};
var S = (s4, o8) => {
  if (e) s4.adoptedStyleSheets = o8.map((t6) => t6 instanceof CSSStyleSheet ? t6 : t6.styleSheet);
  else for (const e9 of o8) {
    const o9 = document.createElement("style"), n5 = t2.litNonce;
    void 0 !== n5 && o9.setAttribute("nonce", n5), o9.textContent = e9.cssText, s4.appendChild(o9);
  }
};
var c = e ? (t6) => t6 : (t6) => t6 instanceof CSSStyleSheet ? ((t7) => {
  let e9 = "";
  for (const s4 of t7.cssRules) e9 += s4.cssText;
  return r(e9);
})(t6) : t6;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t6, s4) => t6;
var u = { toAttribute(t6, s4) {
  switch (s4) {
    case Boolean:
      t6 = t6 ? l : null;
      break;
    case Object:
    case Array:
      t6 = null == t6 ? t6 : JSON.stringify(t6);
  }
  return t6;
}, fromAttribute(t6, s4) {
  let i6 = t6;
  switch (s4) {
    case Boolean:
      i6 = null !== t6;
      break;
    case Number:
      i6 = null === t6 ? null : Number(t6);
      break;
    case Object:
    case Array:
      try {
        i6 = JSON.parse(t6);
      } catch (t7) {
        i6 = null;
      }
  }
  return i6;
} };
var f = (t6, s4) => !i2(t6, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t6) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t6);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t6, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t6) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t6, s4), !s4.noAccessor) {
      const i6 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t6, i6, s4);
      void 0 !== h3 && e2(this.prototype, t6, h3);
    }
  }
  static getPropertyDescriptor(t6, s4, i6) {
    const { get: e9, set: r7 } = h(this.prototype, t6) ?? { get() {
      return this[s4];
    }, set(t7) {
      this[s4] = t7;
    } };
    return { get: e9, set(s5) {
      const h3 = e9?.call(this);
      r7?.call(this, s5), this.requestUpdate(t6, h3, i6);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t6) {
    return this.elementProperties.get(t6) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t6 = n2(this);
    t6.finalize(), void 0 !== t6.l && (this.l = [...t6.l]), this.elementProperties = new Map(t6.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t7 = this.properties, s4 = [...r2(t7), ...o2(t7)];
      for (const i6 of s4) this.createProperty(i6, t7[i6]);
    }
    const t6 = this[Symbol.metadata];
    if (null !== t6) {
      const s4 = litPropertyMetadata.get(t6);
      if (void 0 !== s4) for (const [t7, i6] of s4) this.elementProperties.set(t7, i6);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t7, s4] of this.elementProperties) {
      const i6 = this._$Eu(t7, s4);
      void 0 !== i6 && this._$Eh.set(i6, t7);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i6 = [];
    if (Array.isArray(s4)) {
      const e9 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e9) i6.unshift(c(s5));
    } else void 0 !== s4 && i6.push(c(s4));
    return i6;
  }
  static _$Eu(t6, s4) {
    const i6 = s4.attribute;
    return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t6 ? t6.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t6) => this.enableUpdating = t6), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t6) => t6(this));
  }
  addController(t6) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t6), void 0 !== this.renderRoot && this.isConnected && t6.hostConnected?.();
  }
  removeController(t6) {
    this._$EO?.delete(t6);
  }
  _$E_() {
    const t6 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i6 of s4.keys()) this.hasOwnProperty(i6) && (t6.set(i6, this[i6]), delete this[i6]);
    t6.size > 0 && (this._$Ep = t6);
  }
  createRenderRoot() {
    const t6 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t6, this.constructor.elementStyles), t6;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t6) => t6.hostConnected?.());
  }
  enableUpdating(t6) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t6) => t6.hostDisconnected?.());
  }
  attributeChangedCallback(t6, s4, i6) {
    this._$AK(t6, i6);
  }
  _$ET(t6, s4) {
    const i6 = this.constructor.elementProperties.get(t6), e9 = this.constructor._$Eu(t6, i6);
    if (void 0 !== e9 && true === i6.reflect) {
      const h3 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
      this._$Em = t6, null == h3 ? this.removeAttribute(e9) : this.setAttribute(e9, h3), this._$Em = null;
    }
  }
  _$AK(t6, s4) {
    const i6 = this.constructor, e9 = i6._$Eh.get(t6);
    if (void 0 !== e9 && this._$Em !== e9) {
      const t7 = i6.getPropertyOptions(e9), h3 = "function" == typeof t7.converter ? { fromAttribute: t7.converter } : void 0 !== t7.converter?.fromAttribute ? t7.converter : u;
      this._$Em = e9;
      const r7 = h3.fromAttribute(s4, t7.type);
      this[e9] = r7 ?? this._$Ej?.get(e9) ?? r7, this._$Em = null;
    }
  }
  requestUpdate(t6, s4, i6, e9 = false, h3) {
    if (void 0 !== t6) {
      const r7 = this.constructor;
      if (false === e9 && (h3 = this[t6]), i6 ?? (i6 = r7.getPropertyOptions(t6)), !((i6.hasChanged ?? f)(h3, s4) || i6.useDefault && i6.reflect && h3 === this._$Ej?.get(t6) && !this.hasAttribute(r7._$Eu(t6, i6)))) return;
      this.C(t6, s4, i6);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t6, s4, { useDefault: i6, reflect: e9, wrapped: h3 }, r7) {
    i6 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t6) && (this._$Ej.set(t6, r7 ?? s4 ?? this[t6]), true !== h3 || void 0 !== r7) || (this._$AL.has(t6) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t6, s4)), true === e9 && this._$Em !== t6 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t6));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t7) {
      Promise.reject(t7);
    }
    const t6 = this.scheduleUpdate();
    return null != t6 && await t6, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t8, s5] of this._$Ep) this[t8] = s5;
        this._$Ep = void 0;
      }
      const t7 = this.constructor.elementProperties;
      if (t7.size > 0) for (const [s5, i6] of t7) {
        const { wrapped: t8 } = i6, e9 = this[s5];
        true !== t8 || this._$AL.has(s5) || void 0 === e9 || this.C(s5, void 0, i6, e9);
      }
    }
    let t6 = false;
    const s4 = this._$AL;
    try {
      t6 = this.shouldUpdate(s4), t6 ? (this.willUpdate(s4), this._$EO?.forEach((t7) => t7.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t6 = false, this._$EM(), s5;
    }
    t6 && this._$AE(s4);
  }
  willUpdate(t6) {
  }
  _$AE(t6) {
    this._$EO?.forEach((t7) => t7.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t6)), this.updated(t6);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t6) {
    return true;
  }
  update(t6) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t7) => this._$ET(t7, this[t7]))), this._$EM();
  }
  updated(t6) {
  }
  firstUpdated(t6) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/@lit/reactive-element/decorators/property.js
var o3 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r3 = (t6 = o3, e9, r7) => {
  const { kind: n5, metadata: i6 } = r7;
  let s4 = globalThis.litPropertyMetadata.get(i6);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i6, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t6 = Object.create(t6)).wrapped = true), s4.set(r7.name, t6), "accessor" === n5) {
    const { name: o8 } = r7;
    return { set(r8) {
      const n6 = e9.get.call(this);
      e9.set.call(this, r8), this.requestUpdate(o8, n6, t6, true, r8);
    }, init(e10) {
      return void 0 !== e10 && this.C(o8, void 0, t6, e10), e10;
    } };
  }
  if ("setter" === n5) {
    const { name: o8 } = r7;
    return function(r8) {
      const n6 = this[o8];
      e9.call(this, r8), this.requestUpdate(o8, n6, t6, true, r8);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n3(t6) {
  return (e9, o8) => "object" == typeof o8 ? r3(t6, e9, o8) : ((t7, e10, o9) => {
    const r7 = e10.hasOwnProperty(o9);
    return e10.constructor.createProperty(o9, t7), r7 ? Object.getOwnPropertyDescriptor(e10, o9) : void 0;
  })(t6, e9, o8);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r4(r7) {
  return n3({ ...r7, state: true, attribute: false });
}

// node_modules/@lit/reactive-element/decorators/base.js
var e3 = (e9, t6, c4) => (c4.configurable = true, c4.enumerable = true, Reflect.decorate && "object" != typeof t6 && Object.defineProperty(e9, t6, c4), c4);

// node_modules/@lit/reactive-element/decorators/query.js
function e4(e9, r7) {
  return (n5, s4, i6) => {
    const o8 = (t6) => t6.renderRoot?.querySelector(e9) ?? null;
    if (r7) {
      const { get: e10, set: r8 } = "object" == typeof s4 ? n5 : i6 ?? /* @__PURE__ */ (() => {
        const t6 = /* @__PURE__ */ Symbol();
        return { get() {
          return this[t6];
        }, set(e11) {
          this[t6] = e11;
        } };
      })();
      return e3(n5, s4, { get() {
        let t6 = e10.call(this);
        return void 0 === t6 && (t6 = o8(this), (null !== t6 || this.hasUpdated) && r8.call(this, t6)), t6;
      } });
    }
    return e3(n5, s4, { get() {
      return o8(this);
    } });
  };
}

// node_modules/lit-html/lit-html.js
var t3 = globalThis;
var i3 = (t6) => t6;
var s2 = t3.trustedTypes;
var e5 = s2 ? s2.createPolicy("lit-html", { createHTML: (t6) => t6 }) : void 0;
var h2 = "$lit$";
var o4 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n4 = "?" + o4;
var r5 = `<${n4}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t6) => null === t6 || "object" != typeof t6 && "function" != typeof t6;
var u2 = Array.isArray;
var d2 = (t6) => u2(t6) || "function" == typeof t6?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t6) => (i6, ...s4) => ({ _$litType$: t6, strings: i6, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t6, i6) {
  if (!u2(t6) || !t6.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e5 ? e5.createHTML(i6) : i6;
}
var N = (t6, i6) => {
  const s4 = t6.length - 1, e9 = [];
  let n5, l6 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c4 = v;
  for (let i7 = 0; i7 < s4; i7++) {
    const s5 = t6[i7];
    let a3, u3, d4 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d4 = -1) : void 0 === u3[1] ? d4 = -2 : (d4 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x3 = c4 === p2 && t6[i7 + 1].startsWith("/>") ? " " : "";
    l6 += c4 === v ? s5 + r5 : d4 >= 0 ? (e9.push(a3), s5.slice(0, d4) + h2 + s5.slice(d4) + o4 + x3) : s5 + o4 + (-2 === d4 ? i7 : x3);
  }
  return [V(t6, l6 + (t6[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e9];
};
var S2 = class _S {
  constructor({ strings: t6, _$litType$: i6 }, e9) {
    let r7;
    this.parts = [];
    let l6 = 0, a3 = 0;
    const u3 = t6.length - 1, d4 = this.parts, [f3, v3] = N(t6, i6);
    if (this.el = _S.createElement(f3, e9), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
      const t7 = this.el.content.firstChild;
      t7.replaceWith(...t7.childNodes);
    }
    for (; null !== (r7 = P.nextNode()) && d4.length < u3; ) {
      if (1 === r7.nodeType) {
        if (r7.hasAttributes()) for (const t7 of r7.getAttributeNames()) if (t7.endsWith(h2)) {
          const i7 = v3[a3++], s4 = r7.getAttribute(t7).split(o4), e10 = /([.?@])?(.*)/.exec(i7);
          d4.push({ type: 1, index: l6, name: e10[2], strings: s4, ctor: "." === e10[1] ? I : "?" === e10[1] ? L : "@" === e10[1] ? z : H }), r7.removeAttribute(t7);
        } else t7.startsWith(o4) && (d4.push({ type: 6, index: l6 }), r7.removeAttribute(t7));
        if (y2.test(r7.tagName)) {
          const t7 = r7.textContent.split(o4), i7 = t7.length - 1;
          if (i7 > 0) {
            r7.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i7; s4++) r7.append(t7[s4], c3()), P.nextNode(), d4.push({ type: 2, index: ++l6 });
            r7.append(t7[i7], c3());
          }
        }
      } else if (8 === r7.nodeType) if (r7.data === n4) d4.push({ type: 2, index: l6 });
      else {
        let t7 = -1;
        for (; -1 !== (t7 = r7.data.indexOf(o4, t7 + 1)); ) d4.push({ type: 7, index: l6 }), t7 += o4.length - 1;
      }
      l6++;
    }
  }
  static createElement(t6, i6) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t6, s4;
  }
};
function M(t6, i6, s4 = t6, e9) {
  if (i6 === E) return i6;
  let h3 = void 0 !== e9 ? s4._$Co?.[e9] : s4._$Cl;
  const o8 = a2(i6) ? void 0 : i6._$litDirective$;
  return h3?.constructor !== o8 && (h3?._$AO?.(false), void 0 === o8 ? h3 = void 0 : (h3 = new o8(t6), h3._$AT(t6, s4, e9)), void 0 !== e9 ? (s4._$Co ?? (s4._$Co = []))[e9] = h3 : s4._$Cl = h3), void 0 !== h3 && (i6 = M(t6, h3._$AS(t6, i6.values), h3, e9)), i6;
}
var R = class {
  constructor(t6, i6) {
    this._$AV = [], this._$AN = void 0, this._$AD = t6, this._$AM = i6;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t6) {
    const { el: { content: i6 }, parts: s4 } = this._$AD, e9 = (t6?.creationScope ?? l2).importNode(i6, true);
    P.currentNode = e9;
    let h3 = P.nextNode(), o8 = 0, n5 = 0, r7 = s4[0];
    for (; void 0 !== r7; ) {
      if (o8 === r7.index) {
        let i7;
        2 === r7.type ? i7 = new k(h3, h3.nextSibling, this, t6) : 1 === r7.type ? i7 = new r7.ctor(h3, r7.name, r7.strings, this, t6) : 6 === r7.type && (i7 = new Z(h3, this, t6)), this._$AV.push(i7), r7 = s4[++n5];
      }
      o8 !== r7?.index && (h3 = P.nextNode(), o8++);
    }
    return P.currentNode = l2, e9;
  }
  p(t6) {
    let i6 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t6, s4, i6), i6 += s4.strings.length - 2) : s4._$AI(t6[i6])), i6++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t6, i6, s4, e9) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t6, this._$AB = i6, this._$AM = s4, this.options = e9, this._$Cv = e9?.isConnected ?? true;
  }
  get parentNode() {
    let t6 = this._$AA.parentNode;
    const i6 = this._$AM;
    return void 0 !== i6 && 11 === t6?.nodeType && (t6 = i6.parentNode), t6;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t6, i6 = this) {
    t6 = M(this, t6, i6), a2(t6) ? t6 === A || null == t6 || "" === t6 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t6 !== this._$AH && t6 !== E && this._(t6) : void 0 !== t6._$litType$ ? this.$(t6) : void 0 !== t6.nodeType ? this.T(t6) : d2(t6) ? this.k(t6) : this._(t6);
  }
  O(t6) {
    return this._$AA.parentNode.insertBefore(t6, this._$AB);
  }
  T(t6) {
    this._$AH !== t6 && (this._$AR(), this._$AH = this.O(t6));
  }
  _(t6) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t6 : this.T(l2.createTextNode(t6)), this._$AH = t6;
  }
  $(t6) {
    const { values: i6, _$litType$: s4 } = t6, e9 = "number" == typeof s4 ? this._$AC(t6) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e9) this._$AH.p(i6);
    else {
      const t7 = new R(e9, this), s5 = t7.u(this.options);
      t7.p(i6), this.T(s5), this._$AH = t7;
    }
  }
  _$AC(t6) {
    let i6 = C.get(t6.strings);
    return void 0 === i6 && C.set(t6.strings, i6 = new S2(t6)), i6;
  }
  k(t6) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i6 = this._$AH;
    let s4, e9 = 0;
    for (const h3 of t6) e9 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e9], s4._$AI(h3), e9++;
    e9 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e9), i6.length = e9);
  }
  _$AR(t6 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t6 !== this._$AB; ) {
      const s5 = i3(t6).nextSibling;
      i3(t6).remove(), t6 = s5;
    }
  }
  setConnected(t6) {
    void 0 === this._$AM && (this._$Cv = t6, this._$AP?.(t6));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t6, i6, s4, e9, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t6, this.name = i6, this._$AM = e9, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t6, i6 = this, s4, e9) {
    const h3 = this.strings;
    let o8 = false;
    if (void 0 === h3) t6 = M(this, t6, i6, 0), o8 = !a2(t6) || t6 !== this._$AH && t6 !== E, o8 && (this._$AH = t6);
    else {
      const e10 = t6;
      let n5, r7;
      for (t6 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r7 = M(this, e10[s4 + n5], i6, n5), r7 === E && (r7 = this._$AH[n5]), o8 || (o8 = !a2(r7) || r7 !== this._$AH[n5]), r7 === A ? t6 = A : t6 !== A && (t6 += (r7 ?? "") + h3[n5 + 1]), this._$AH[n5] = r7;
    }
    o8 && !e9 && this.j(t6);
  }
  j(t6) {
    t6 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t6 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t6) {
    this.element[this.name] = t6 === A ? void 0 : t6;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t6) {
    this.element.toggleAttribute(this.name, !!t6 && t6 !== A);
  }
};
var z = class extends H {
  constructor(t6, i6, s4, e9, h3) {
    super(t6, i6, s4, e9, h3), this.type = 5;
  }
  _$AI(t6, i6 = this) {
    if ((t6 = M(this, t6, i6, 0) ?? A) === E) return;
    const s4 = this._$AH, e9 = t6 === A && s4 !== A || t6.capture !== s4.capture || t6.once !== s4.once || t6.passive !== s4.passive, h3 = t6 !== A && (s4 === A || e9);
    e9 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t6), this._$AH = t6;
  }
  handleEvent(t6) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t6) : this._$AH.handleEvent(t6);
  }
};
var Z = class {
  constructor(t6, i6, s4) {
    this.element = t6, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t6) {
    M(this, t6);
  }
};
var j = { M: h2, P: o4, A: n4, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t3.litHtmlPolyfillSupport;
B?.(S2, k), (t3.litHtmlVersions ?? (t3.litHtmlVersions = [])).push("3.3.2");
var D = (t6, i6, s4) => {
  const e9 = s4?.renderBefore ?? i6;
  let h3 = e9._$litPart$;
  if (void 0 === h3) {
    const t7 = s4?.renderBefore ?? null;
    e9._$litPart$ = h3 = new k(i6.insertBefore(c3(), t7), t7, void 0, s4 ?? {});
  }
  return h3._$AI(t6), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a2;
    const t6 = super.createRenderRoot();
    return (_a2 = this.renderOptions).renderBefore ?? (_a2.renderBefore = t6.firstChild), t6;
  }
  update(t6) {
    const r7 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t6), this._$Do = D(r7, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o5 = s3.litElementPolyfillSupport;
o5?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/lit-html/is-server.js
var o6 = false;

// node_modules/@material/web/icon/internal/icon.js
var Icon = class extends i4 {
  render() {
    return b2`<slot></slot>`;
  }
  connectedCallback() {
    super.connectedCallback();
    const ariaHidden = this.getAttribute("aria-hidden");
    if (ariaHidden === "false") {
      this.removeAttribute("aria-hidden");
      return;
    }
    this.setAttribute("aria-hidden", "true");
  }
};

// node_modules/@material/web/icon/internal/icon-styles.js
var styles = i`:host{font-size:var(--md-icon-size, 24px);width:var(--md-icon-size, 24px);height:var(--md-icon-size, 24px);color:inherit;font-variation-settings:inherit;font-weight:400;font-family:var(--md-icon-font, Material Symbols Outlined);display:inline-flex;font-style:normal;place-items:center;place-content:center;line-height:1;overflow:hidden;letter-spacing:normal;text-transform:none;user-select:none;white-space:nowrap;word-wrap:normal;flex-shrink:0;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale}::slotted(svg){fill:currentColor}::slotted(*){height:100%;width:100%}
`;

// node_modules/@material/web/icon/icon.js
var MdIcon = class MdIcon2 extends Icon {
};
MdIcon.styles = [styles];
MdIcon = __decorate([
  t("md-icon")
], MdIcon);

// node_modules/@material/web/divider/internal/divider.js
var Divider = class extends i4 {
  constructor() {
    super(...arguments);
    this.inset = false;
    this.insetStart = false;
    this.insetEnd = false;
  }
};
__decorate([
  n3({ type: Boolean, reflect: true })
], Divider.prototype, "inset", void 0);
__decorate([
  n3({ type: Boolean, reflect: true, attribute: "inset-start" })
], Divider.prototype, "insetStart", void 0);
__decorate([
  n3({ type: Boolean, reflect: true, attribute: "inset-end" })
], Divider.prototype, "insetEnd", void 0);

// node_modules/@material/web/divider/internal/divider-styles.js
var styles2 = i`:host{box-sizing:border-box;color:var(--md-divider-color, var(--md-sys-color-outline-variant, #cac4d0));display:flex;height:var(--md-divider-thickness, 1px);width:100%}:host([inset]),:host([inset-start]){padding-inline-start:16px}:host([inset]),:host([inset-end]){padding-inline-end:16px}:host::before{background:currentColor;content:"";height:100%;width:100%}@media(forced-colors: active){:host::before{background:CanvasText}}
`;

// node_modules/@material/web/divider/divider.js
var MdDivider = class MdDivider2 extends Divider {
};
MdDivider.styles = [styles2];
MdDivider = __decorate([
  t("md-divider")
], MdDivider);

// node_modules/lit-html/directive.js
var t4 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e6 = (t6) => (...e9) => ({ _$litDirective$: t6, values: e9 });
var i5 = class {
  constructor(t6) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t6, e9, i6) {
    this._$Ct = t6, this._$AM = e9, this._$Ci = i6;
  }
  _$AS(t6, e9) {
    return this.update(t6, e9);
  }
  update(t6, e9) {
    return this.render(...e9);
  }
};

// node_modules/lit-html/directives/class-map.js
var e7 = e6(class extends i5 {
  constructor(t6) {
    if (super(t6), t6.type !== t4.ATTRIBUTE || "class" !== t6.name || t6.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t6) {
    return " " + Object.keys(t6).filter((s4) => t6[s4]).join(" ") + " ";
  }
  update(s4, [i6]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter((t6) => "" !== t6)));
      for (const t6 in i6) i6[t6] && !this.nt?.has(t6) && this.st.add(t6);
      return this.render(i6);
    }
    const r7 = s4.element.classList;
    for (const t6 of this.st) t6 in i6 || (r7.remove(t6), this.st.delete(t6));
    for (const t6 in i6) {
      const s5 = !!i6[t6];
      s5 === this.st.has(t6) || this.nt?.has(t6) || (s5 ? (r7.add(t6), this.st.add(t6)) : (r7.remove(t6), this.st.delete(t6)));
    }
    return E;
  }
});

// node_modules/@material/web/internal/aria/aria.js
var ARIA_PROPERTIES = [
  "role",
  "ariaAtomic",
  "ariaAutoComplete",
  "ariaBusy",
  "ariaChecked",
  "ariaColCount",
  "ariaColIndex",
  "ariaColSpan",
  "ariaCurrent",
  "ariaDisabled",
  "ariaExpanded",
  "ariaHasPopup",
  "ariaHidden",
  "ariaInvalid",
  "ariaKeyShortcuts",
  "ariaLabel",
  "ariaLevel",
  "ariaLive",
  "ariaModal",
  "ariaMultiLine",
  "ariaMultiSelectable",
  "ariaOrientation",
  "ariaPlaceholder",
  "ariaPosInSet",
  "ariaPressed",
  "ariaReadOnly",
  "ariaRequired",
  "ariaRoleDescription",
  "ariaRowCount",
  "ariaRowIndex",
  "ariaRowSpan",
  "ariaSelected",
  "ariaSetSize",
  "ariaSort",
  "ariaValueMax",
  "ariaValueMin",
  "ariaValueNow",
  "ariaValueText"
];
var ARIA_ATTRIBUTES = ARIA_PROPERTIES.map(ariaPropertyToAttribute);
function isAriaAttribute(attribute) {
  return ARIA_ATTRIBUTES.includes(attribute);
}
function ariaPropertyToAttribute(property) {
  return property.replace("aria", "aria-").replace(/Elements?/g, "").toLowerCase();
}

// node_modules/@material/web/internal/aria/delegate.js
var privateIgnoreAttributeChangesFor = /* @__PURE__ */ Symbol("privateIgnoreAttributeChangesFor");
function mixinDelegatesAria(base) {
  var _a2;
  if (o6) {
    return base;
  }
  class WithDelegatesAriaElement extends base {
    constructor() {
      super(...arguments);
      this[_a2] = /* @__PURE__ */ new Set();
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (!isAriaAttribute(name)) {
        super.attributeChangedCallback(name, oldValue, newValue);
        return;
      }
      if (this[privateIgnoreAttributeChangesFor].has(name)) {
        return;
      }
      this[privateIgnoreAttributeChangesFor].add(name);
      this.removeAttribute(name);
      this[privateIgnoreAttributeChangesFor].delete(name);
      const dataProperty = ariaAttributeToDataProperty(name);
      if (newValue === null) {
        delete this.dataset[dataProperty];
      } else {
        this.dataset[dataProperty] = newValue;
      }
      this.requestUpdate(ariaAttributeToDataProperty(name), oldValue);
    }
    getAttribute(name) {
      if (isAriaAttribute(name)) {
        return super.getAttribute(ariaAttributeToDataAttribute(name));
      }
      return super.getAttribute(name);
    }
    removeAttribute(name) {
      super.removeAttribute(name);
      if (isAriaAttribute(name)) {
        super.removeAttribute(ariaAttributeToDataAttribute(name));
        this.requestUpdate();
      }
    }
  }
  _a2 = privateIgnoreAttributeChangesFor;
  setupDelegatesAriaProperties(WithDelegatesAriaElement);
  return WithDelegatesAriaElement;
}
function setupDelegatesAriaProperties(ctor) {
  for (const ariaProperty of ARIA_PROPERTIES) {
    const ariaAttribute = ariaPropertyToAttribute(ariaProperty);
    const dataAttribute = ariaAttributeToDataAttribute(ariaAttribute);
    const dataProperty = ariaAttributeToDataProperty(ariaAttribute);
    ctor.createProperty(ariaProperty, {
      attribute: ariaAttribute,
      noAccessor: true
    });
    ctor.createProperty(Symbol(dataAttribute), {
      attribute: dataAttribute,
      noAccessor: true
    });
    Object.defineProperty(ctor.prototype, ariaProperty, {
      configurable: true,
      enumerable: true,
      get() {
        return this.dataset[dataProperty] ?? null;
      },
      set(value) {
        const prevValue = this.dataset[dataProperty] ?? null;
        if (value === prevValue) {
          return;
        }
        if (value === null) {
          delete this.dataset[dataProperty];
        } else {
          this.dataset[dataProperty] = value;
        }
        this.requestUpdate(ariaProperty, prevValue);
      }
    });
  }
}
function ariaAttributeToDataAttribute(ariaAttribute) {
  return `data-${ariaAttribute}`;
}
function ariaAttributeToDataProperty(ariaAttribute) {
  return ariaAttribute.replace(/-\w/, (dashLetter) => dashLetter[1].toUpperCase());
}

// node_modules/@material/web/internal/events/redispatch-event.js
function redispatchEvent(element, event) {
  if (event.bubbles && (!element.shadowRoot || event.composed)) {
    event.stopPropagation();
  }
  const copy = Reflect.construct(event.constructor, [event.type, event]);
  const dispatched = element.dispatchEvent(copy);
  if (!dispatched) {
    event.preventDefault();
  }
  return dispatched;
}

// node_modules/@material/web/internal/motion/animation.js
var EASING = {
  STANDARD: "cubic-bezier(0.2, 0, 0, 1)",
  STANDARD_ACCELERATE: "cubic-bezier(.3,0,1,1)",
  STANDARD_DECELERATE: "cubic-bezier(0,0,0,1)",
  EMPHASIZED: "cubic-bezier(.3,0,0,1)",
  EMPHASIZED_ACCELERATE: "cubic-bezier(.3,0,.8,.15)",
  EMPHASIZED_DECELERATE: "cubic-bezier(.05,.7,.1,1)"
};

// node_modules/@material/web/dialog/internal/animations.js
var DIALOG_DEFAULT_OPEN_ANIMATION = {
  dialog: [
    [
      // Dialog slide down
      [{ "transform": "translateY(-50px)" }, { "transform": "translateY(0)" }],
      { duration: 500, easing: EASING.EMPHASIZED }
    ]
  ],
  scrim: [
    [
      // Scrim fade in
      [{ "opacity": 0 }, { "opacity": 0.32 }],
      { duration: 500, easing: "linear" }
    ]
  ],
  container: [
    [
      // Container fade in
      [{ "opacity": 0 }, { "opacity": 1 }],
      { duration: 50, easing: "linear", pseudoElement: "::before" }
    ],
    [
      // Container grow
      // Note: current spec says to grow from 0dp->100% and shrink from
      // 100%->35%. We change this to 35%->100% to simplify the animation that
      // is supposed to clip content as it grows. From 0dp it's possible to see
      // text/actions appear before the container has fully grown.
      [{ "height": "35%" }, { "height": "100%" }],
      { duration: 500, easing: EASING.EMPHASIZED, pseudoElement: "::before" }
    ]
  ],
  headline: [
    [
      // Headline fade in
      [{ "opacity": 0 }, { "opacity": 0, offset: 0.2 }, { "opacity": 1 }],
      { duration: 250, easing: "linear", fill: "forwards" }
    ]
  ],
  content: [
    [
      // Content fade in
      [{ "opacity": 0 }, { "opacity": 0, offset: 0.2 }, { "opacity": 1 }],
      { duration: 250, easing: "linear", fill: "forwards" }
    ]
  ],
  actions: [
    [
      // Actions fade in
      [{ "opacity": 0 }, { "opacity": 0, offset: 0.5 }, { "opacity": 1 }],
      { duration: 300, easing: "linear", fill: "forwards" }
    ]
  ]
};
var DIALOG_DEFAULT_CLOSE_ANIMATION = {
  dialog: [
    [
      // Dialog slide up
      [{ "transform": "translateY(0)" }, { "transform": "translateY(-50px)" }],
      { duration: 150, easing: EASING.EMPHASIZED_ACCELERATE }
    ]
  ],
  scrim: [
    [
      // Scrim fade out
      [{ "opacity": 0.32 }, { "opacity": 0 }],
      { duration: 150, easing: "linear" }
    ]
  ],
  container: [
    [
      // Container shrink
      [{ "height": "100%" }, { "height": "35%" }],
      {
        duration: 150,
        easing: EASING.EMPHASIZED_ACCELERATE,
        pseudoElement: "::before"
      }
    ],
    [
      // Container fade out
      [{ "opacity": "1" }, { "opacity": "0" }],
      { delay: 100, duration: 50, easing: "linear", pseudoElement: "::before" }
    ]
  ],
  headline: [
    [
      // Headline fade out
      [{ "opacity": 1 }, { "opacity": 0 }],
      { duration: 100, easing: "linear", fill: "forwards" }
    ]
  ],
  content: [
    [
      // Content fade out
      [{ "opacity": 1 }, { "opacity": 0 }],
      { duration: 100, easing: "linear", fill: "forwards" }
    ]
  ],
  actions: [
    [
      // Actions fade out
      [{ "opacity": 1 }, { "opacity": 0 }],
      { duration: 100, easing: "linear", fill: "forwards" }
    ]
  ]
};

// node_modules/@material/web/dialog/internal/dialog.js
var dialogBaseClass = mixinDelegatesAria(i4);
var Dialog = class extends dialogBaseClass {
  // We do not use `delegatesFocus: true` due to a Chromium bug with
  // selecting text.
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=950357
  /**
   * Opens the dialog when set to `true` and closes it when set to `false`.
   */
  get open() {
    return this.isOpen;
  }
  set open(open) {
    if (open === this.isOpen) {
      return;
    }
    this.isOpen = open;
    if (open) {
      this.setAttribute("open", "");
      this.show();
    } else {
      this.removeAttribute("open");
      this.close();
    }
  }
  constructor() {
    super();
    this.quick = false;
    this.returnValue = "";
    this.noFocusTrap = false;
    this.getOpenAnimation = () => DIALOG_DEFAULT_OPEN_ANIMATION;
    this.getCloseAnimation = () => DIALOG_DEFAULT_CLOSE_ANIMATION;
    this.isOpen = false;
    this.isOpening = false;
    this.isConnectedPromise = this.getIsConnectedPromise();
    this.isAtScrollTop = false;
    this.isAtScrollBottom = false;
    this.nextClickIsFromContent = false;
    this.hasHeadline = false;
    this.hasActions = false;
    this.hasIcon = false;
    this.escapePressedWithoutCancel = false;
    this.treewalker = o6 ? null : document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT);
    if (!o6) {
      this.addEventListener("submit", this.handleSubmit);
    }
  }
  /**
   * Opens the dialog and fires a cancelable `open` event. After a dialog's
   * animation, an `opened` event is fired.
   *
   * Add an `autofocus` attribute to a child of the dialog that should
   * receive focus after opening.
   *
   * @return A Promise that resolves after the animation is finished and the
   *     `opened` event was fired.
   */
  async show() {
    this.isOpening = true;
    await this.isConnectedPromise;
    await this.updateComplete;
    const dialog = this.dialog;
    if (dialog.open || !this.isOpening) {
      this.isOpening = false;
      return;
    }
    const preventOpen = !this.dispatchEvent(new Event("open", { cancelable: true }));
    if (preventOpen) {
      this.open = false;
      this.isOpening = false;
      return;
    }
    dialog.showModal();
    this.open = true;
    if (this.scroller) {
      this.scroller.scrollTop = 0;
    }
    this.querySelector("[autofocus]")?.focus();
    await this.animateDialog(this.getOpenAnimation());
    this.dispatchEvent(new Event("opened"));
    this.isOpening = false;
  }
  /**
   * Closes the dialog and fires a cancelable `close` event. After a dialog's
   * animation, a `closed` event is fired.
   *
   * @param returnValue A return value usually indicating which button was used
   *     to close a dialog. If a dialog is canceled by clicking the scrim or
   *     pressing Escape, it will not change the return value after closing.
   * @return A Promise that resolves after the animation is finished and the
   *     `closed` event was fired.
   */
  async close(returnValue = this.returnValue) {
    this.isOpening = false;
    if (!this.isConnected) {
      this.open = false;
      return;
    }
    await this.updateComplete;
    const dialog = this.dialog;
    if (!dialog.open || this.isOpening) {
      this.open = false;
      return;
    }
    const prevReturnValue = this.returnValue;
    this.returnValue = returnValue;
    const preventClose = !this.dispatchEvent(new Event("close", { cancelable: true }));
    if (preventClose) {
      this.returnValue = prevReturnValue;
      return;
    }
    await this.animateDialog(this.getCloseAnimation());
    dialog.close(returnValue);
    this.open = false;
    this.dispatchEvent(new Event("closed"));
  }
  connectedCallback() {
    super.connectedCallback();
    this.isConnectedPromiseResolve();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.isConnectedPromise = this.getIsConnectedPromise();
  }
  render() {
    const scrollable = this.open && !(this.isAtScrollTop && this.isAtScrollBottom);
    const classes = {
      "has-headline": this.hasHeadline,
      "has-actions": this.hasActions,
      "has-icon": this.hasIcon,
      "scrollable": scrollable,
      "show-top-divider": scrollable && !this.isAtScrollTop,
      "show-bottom-divider": scrollable && !this.isAtScrollBottom
    };
    const showFocusTrap = this.open && !this.noFocusTrap;
    const focusTrap = b2`
      <div
        class="focus-trap"
        tabindex="0"
        aria-hidden="true"
        @focus=${this.handleFocusTrapFocus}></div>
    `;
    const { ariaLabel } = this;
    return b2`
      <div class="scrim"></div>
      <dialog
        class=${e7(classes)}
        aria-label=${ariaLabel || A}
        aria-labelledby=${this.hasHeadline ? "headline" : A}
        role=${this.type === "alert" ? "alertdialog" : A}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleClose}
        @keydown=${this.handleKeydown}
        .returnValue=${this.returnValue || A}>
        ${showFocusTrap ? focusTrap : A}
        <div class="container" @click=${this.handleContentClick}>
          <div class="headline">
            <div class="icon" aria-hidden="true">
              <slot name="icon" @slotchange=${this.handleIconChange}></slot>
            </div>
            <h2 id="headline" aria-hidden=${!this.hasHeadline || A}>
              <slot
                name="headline"
                @slotchange=${this.handleHeadlineChange}></slot>
            </h2>
            <md-divider></md-divider>
          </div>
          <div class="scroller">
            <div class="content">
              <div class="top anchor"></div>
              <slot name="content"></slot>
              <div class="bottom anchor"></div>
            </div>
          </div>
          <div class="actions">
            <md-divider></md-divider>
            <slot name="actions" @slotchange=${this.handleActionsChange}></slot>
          </div>
        </div>
        ${showFocusTrap ? focusTrap : A}
      </dialog>
    `;
  }
  firstUpdated() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        this.handleAnchorIntersection(entry);
      }
    }, { root: this.scroller });
    this.intersectionObserver.observe(this.topAnchor);
    this.intersectionObserver.observe(this.bottomAnchor);
  }
  handleDialogClick() {
    if (this.nextClickIsFromContent) {
      this.nextClickIsFromContent = false;
      return;
    }
    const preventDefault = !this.dispatchEvent(new Event("cancel", { cancelable: true }));
    if (preventDefault) {
      return;
    }
    this.close();
  }
  handleContentClick() {
    this.nextClickIsFromContent = true;
  }
  handleSubmit(event) {
    const form = event.target;
    const { submitter } = event;
    if (form.getAttribute("method") !== "dialog" || !submitter) {
      return;
    }
    this.close(submitter.getAttribute("value") ?? this.returnValue);
  }
  handleCancel(event) {
    if (event.target !== this.dialog) {
      return;
    }
    this.escapePressedWithoutCancel = false;
    const preventDefault = !redispatchEvent(this, event);
    event.preventDefault();
    if (preventDefault) {
      return;
    }
    this.close();
  }
  handleClose() {
    if (!this.escapePressedWithoutCancel) {
      return;
    }
    this.escapePressedWithoutCancel = false;
    this.dialog?.dispatchEvent(new Event("cancel", { cancelable: true }));
  }
  handleKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }
    this.escapePressedWithoutCancel = true;
    setTimeout(() => {
      this.escapePressedWithoutCancel = false;
    });
  }
  async animateDialog(animation) {
    this.cancelAnimations?.abort();
    this.cancelAnimations = new AbortController();
    if (this.quick) {
      return;
    }
    const { dialog, scrim, container, headline, content, actions } = this;
    if (!dialog || !scrim || !container || !headline || !content || !actions) {
      return;
    }
    const { container: containerAnimate, dialog: dialogAnimate, scrim: scrimAnimate, headline: headlineAnimate, content: contentAnimate, actions: actionsAnimate } = animation;
    const elementAndAnimation = [
      [dialog, dialogAnimate ?? []],
      [scrim, scrimAnimate ?? []],
      [container, containerAnimate ?? []],
      [headline, headlineAnimate ?? []],
      [content, contentAnimate ?? []],
      [actions, actionsAnimate ?? []]
    ];
    const animations = [];
    for (const [element, animation2] of elementAndAnimation) {
      for (const animateArgs of animation2) {
        const animation3 = element.animate(...animateArgs);
        this.cancelAnimations.signal.addEventListener("abort", () => {
          animation3.cancel();
        });
        animations.push(animation3);
      }
    }
    await Promise.all(animations.map((animation2) => animation2.finished.catch(() => {
    })));
  }
  handleHeadlineChange(event) {
    const slot = event.target;
    this.hasHeadline = slot.assignedElements().length > 0;
  }
  handleActionsChange(event) {
    const slot = event.target;
    this.hasActions = slot.assignedElements().length > 0;
  }
  handleIconChange(event) {
    const slot = event.target;
    this.hasIcon = slot.assignedElements().length > 0;
  }
  handleAnchorIntersection(entry) {
    const { target, isIntersecting } = entry;
    if (target === this.topAnchor) {
      this.isAtScrollTop = isIntersecting;
    }
    if (target === this.bottomAnchor) {
      this.isAtScrollBottom = isIntersecting;
    }
  }
  getIsConnectedPromise() {
    return new Promise((resolve) => {
      this.isConnectedPromiseResolve = resolve;
    });
  }
  handleFocusTrapFocus(event) {
    const [firstFocusableChild, lastFocusableChild] = this.getFirstAndLastFocusableChildren();
    if (!firstFocusableChild || !lastFocusableChild) {
      this.dialog?.focus();
      return;
    }
    const isFirstFocusTrap = event.target === this.firstFocusTrap;
    const isLastFocusTrap = !isFirstFocusTrap;
    const focusCameFromFirstChild = event.relatedTarget === firstFocusableChild;
    const focusCameFromLastChild = event.relatedTarget === lastFocusableChild;
    const focusCameFromOutsideDialog = !focusCameFromFirstChild && !focusCameFromLastChild;
    const shouldFocusFirstChild = isLastFocusTrap && focusCameFromLastChild || isFirstFocusTrap && focusCameFromOutsideDialog;
    if (shouldFocusFirstChild) {
      firstFocusableChild.focus();
      return;
    }
    const shouldFocusLastChild = isFirstFocusTrap && focusCameFromFirstChild || isLastFocusTrap && focusCameFromOutsideDialog;
    if (shouldFocusLastChild) {
      lastFocusableChild.focus();
      return;
    }
  }
  getFirstAndLastFocusableChildren() {
    if (!this.treewalker) {
      return [null, null];
    }
    let firstFocusableChild = null;
    let lastFocusableChild = null;
    this.treewalker.currentNode = this.treewalker.root;
    while (this.treewalker.nextNode()) {
      const nextChild = this.treewalker.currentNode;
      if (!isFocusable(nextChild)) {
        continue;
      }
      if (!firstFocusableChild) {
        firstFocusableChild = nextChild;
      }
      lastFocusableChild = nextChild;
    }
    return [firstFocusableChild, lastFocusableChild];
  }
};
__decorate([
  n3({ type: Boolean })
], Dialog.prototype, "open", null);
__decorate([
  n3({ type: Boolean })
], Dialog.prototype, "quick", void 0);
__decorate([
  n3({ attribute: false })
], Dialog.prototype, "returnValue", void 0);
__decorate([
  n3()
], Dialog.prototype, "type", void 0);
__decorate([
  n3({ type: Boolean, attribute: "no-focus-trap" })
], Dialog.prototype, "noFocusTrap", void 0);
__decorate([
  e4("dialog")
], Dialog.prototype, "dialog", void 0);
__decorate([
  e4(".scrim")
], Dialog.prototype, "scrim", void 0);
__decorate([
  e4(".container")
], Dialog.prototype, "container", void 0);
__decorate([
  e4(".headline")
], Dialog.prototype, "headline", void 0);
__decorate([
  e4(".content")
], Dialog.prototype, "content", void 0);
__decorate([
  e4(".actions")
], Dialog.prototype, "actions", void 0);
__decorate([
  r4()
], Dialog.prototype, "isAtScrollTop", void 0);
__decorate([
  r4()
], Dialog.prototype, "isAtScrollBottom", void 0);
__decorate([
  e4(".scroller")
], Dialog.prototype, "scroller", void 0);
__decorate([
  e4(".top.anchor")
], Dialog.prototype, "topAnchor", void 0);
__decorate([
  e4(".bottom.anchor")
], Dialog.prototype, "bottomAnchor", void 0);
__decorate([
  e4(".focus-trap")
], Dialog.prototype, "firstFocusTrap", void 0);
__decorate([
  r4()
], Dialog.prototype, "hasHeadline", void 0);
__decorate([
  r4()
], Dialog.prototype, "hasActions", void 0);
__decorate([
  r4()
], Dialog.prototype, "hasIcon", void 0);
function isFocusable(element) {
  const knownFocusableElements = ":is(button,input,select,textarea,object,:is(a,area)[href],[tabindex],[contenteditable=true])";
  const notDisabled = ":not(:disabled,[disabled])";
  const notNegativeTabIndex = ':not([tabindex^="-"])';
  if (element.matches(knownFocusableElements + notDisabled + notNegativeTabIndex)) {
    return true;
  }
  const isCustomElement = element.localName.includes("-");
  if (!isCustomElement) {
    return false;
  }
  if (!element.matches(notDisabled)) {
    return false;
  }
  return element.shadowRoot?.delegatesFocus ?? false;
}

// node_modules/@material/web/dialog/internal/dialog-styles.js
var styles3 = i`:host{border-start-start-radius:var(--md-dialog-container-shape-start-start, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));border-start-end-radius:var(--md-dialog-container-shape-start-end, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));border-end-end-radius:var(--md-dialog-container-shape-end-end, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));border-end-start-radius:var(--md-dialog-container-shape-end-start, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));display:contents;margin:auto;max-height:min(560px,100% - 48px);max-width:min(560px,100% - 48px);min-height:140px;min-width:280px;position:fixed;height:fit-content;width:fit-content}dialog{background:rgba(0,0,0,0);border:none;border-radius:inherit;flex-direction:column;height:inherit;margin:inherit;max-height:inherit;max-width:inherit;min-height:inherit;min-width:inherit;outline:none;overflow:visible;padding:0;width:inherit}dialog[open]{display:flex}::backdrop{background:none}.scrim{background:var(--md-sys-color-scrim, #000);display:none;inset:0;opacity:32%;pointer-events:none;position:fixed;z-index:1}:host([open]) .scrim{display:flex}h2{all:unset;align-self:stretch}.headline{align-items:center;color:var(--md-dialog-headline-color, var(--md-sys-color-on-surface, #1d1b20));display:flex;flex-direction:column;font-family:var(--md-dialog-headline-font, var(--md-sys-typescale-headline-small-font, var(--md-ref-typeface-brand, Roboto)));font-size:var(--md-dialog-headline-size, var(--md-sys-typescale-headline-small-size, 1.5rem));line-height:var(--md-dialog-headline-line-height, var(--md-sys-typescale-headline-small-line-height, 2rem));font-weight:var(--md-dialog-headline-weight, var(--md-sys-typescale-headline-small-weight, var(--md-ref-typeface-weight-regular, 400)));position:relative}slot[name=headline]::slotted(*){align-items:center;align-self:stretch;box-sizing:border-box;display:flex;gap:8px;padding:24px 24px 0}.icon{display:flex}slot[name=icon]::slotted(*){color:var(--md-dialog-icon-color, var(--md-sys-color-secondary, #625b71));fill:currentColor;font-size:var(--md-dialog-icon-size, 24px);margin-top:24px;height:var(--md-dialog-icon-size, 24px);width:var(--md-dialog-icon-size, 24px)}.has-icon slot[name=headline]::slotted(*){justify-content:center;padding-top:16px}.scrollable slot[name=headline]::slotted(*){padding-bottom:16px}.scrollable.has-headline slot[name=content]::slotted(*){padding-top:8px}.container{border-radius:inherit;display:flex;flex-direction:column;flex-grow:1;overflow:hidden;position:relative;transform-origin:top}.container::before{background:var(--md-dialog-container-color, var(--md-sys-color-surface-container-high, #ece6f0));border-radius:inherit;content:"";inset:0;position:absolute}.scroller{display:flex;flex:1;flex-direction:column;overflow:hidden;z-index:1}.scrollable .scroller{overflow-y:scroll}.content{color:var(--md-dialog-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-dialog-supporting-text-font, var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-dialog-supporting-text-size, var(--md-sys-typescale-body-medium-size, 0.875rem));line-height:var(--md-dialog-supporting-text-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));flex:1;font-weight:var(--md-dialog-supporting-text-weight, var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400)));height:min-content;position:relative}slot[name=content]::slotted(*){box-sizing:border-box;padding:24px}.anchor{position:absolute}.top.anchor{top:0}.bottom.anchor{bottom:0}.actions{position:relative}slot[name=actions]::slotted(*){box-sizing:border-box;display:flex;gap:8px;justify-content:flex-end;padding:16px 24px 24px}.has-actions slot[name=content]::slotted(*){padding-bottom:8px}md-divider{display:none;position:absolute}.has-headline.show-top-divider .headline md-divider,.has-actions.show-bottom-divider .actions md-divider{display:flex}.headline md-divider{bottom:0}.actions md-divider{top:0}@media(forced-colors: active){dialog{outline:2px solid WindowText}}
`;

// node_modules/@material/web/dialog/dialog.js
var MdDialog = class MdDialog2 extends Dialog {
};
MdDialog.styles = [styles3];
MdDialog = __decorate([
  t("md-dialog")
], MdDialog);

// components/ui/wy-button.js
var WyButton = class extends i4 {
  constructor() {
    super();
    this.variant = "primary";
    this.size = "medium";
    this.iconPosition = "trailing";
    this.disabled = false;
    this.fullWidth = false;
  }
  render() {
    const classes = [
      "button",
      `variant-${this.variant}`,
      `size-${this.size}`
    ].join(" ");
    const iconElement = this.icon ? b2`<span class="icon">${this.icon}</span>` : null;
    return b2`
      <button 
        class="${classes}" 
        part="button"
        ?disabled="${this.disabled}"
        @click="${this._handleClick}"
      >
        ${this.iconPosition === "leading" ? iconElement : null}
        <span class="label"><slot></slot></span>
        ${this.iconPosition === "trailing" ? iconElement : null}
      </button>
    `;
  }
  _handleClick(e9) {
    if (this.disabled) {
      e9.preventDefault();
      e9.stopPropagation();
    }
  }
};
__publicField(WyButton, "properties", {
  variant: { type: String },
  size: { type: String },
  icon: { type: String },
  iconPosition: { type: String, attribute: "icon-position" },
  disabled: { type: Boolean, reflect: true },
  fullWidth: { type: Boolean, attribute: "full-width" }
});
__publicField(WyButton, "styles", i`
    /* Fonts are loaded globally via HTML link tags - no @import needed in Shadow DOM */

    :host {
      display: inline-block;
    }

    :host([full-width]) {
      display: block;
      width: 100%;
    }

    :host([full-width]) .button {
      width: 100%;
      justify-content: center;
    }

    :host([disabled]) {
      pointer-events: none;
    }

    .button {
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      border: none;
      cursor: pointer;
      text-decoration: none;
      font-family: var(--font-sans);
      font-weight: var(--wy-button-font-weight, 500);
      border-radius: var(--wy-button-radius, var(--radius-pill, 999px));
      transition: 
        transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
        box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
        background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
    }

    /* State layer for hover/focus/pressed */
    .button::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
      border-radius: inherit;
    }

    /* Focus visible outline */
    .button:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    /* ===== SIZE VARIANTS ===== */
    
    /* Large: 56px height */
    .button.size-large {
      height: 56px;
      padding: 16px 40px;
      font-size: 1rem;
    }

    .button.size-large .icon {
      font-size: 18px;
    }

    /* Medium: 44px height (default) */
    .button.size-medium {
      height: 44px;
      padding: 10px 32px;
      font-size: 0.875rem;
    }

    .button.size-medium .icon {
      font-size: 16px;
    }

    /* Small: 32px height */
    .button.size-small {
      height: 32px;
      padding: 6px 20px;
      font-size: 0.75rem;
    }

    .button.size-small .icon {
      font-size: 14px;
    }

    /* ===== PRIMARY VARIANT (Filled Hunter Green) ===== */
    .button.variant-primary {
      background-color: var(--wy-button-primary-bg);
      color: var(--wy-button-primary-fg);
    }

    .button.variant-primary::before {
      background-color: var(--wy-button-primary-fg);
    }

    .button.variant-primary:hover:not(:disabled) {
      background-color: var(--wy-button-primary-hover-bg);
      box-shadow: var(--wy-button-primary-shadow-hover);
      
    }

    .button.variant-primary:hover:not(:disabled)::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .button.variant-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .button.variant-primary:active:not(:disabled)::before {
      opacity: var(--md-sys-state-pressed-opacity);
    }

    /* ===== SECONDARY VARIANT (Tonal - Warm Clay / Serif) ===== */
    .button.variant-secondary {
      background-color: var(--wy-button-secondary-bg);
      color: var(--wy-button-secondary-fg);
      /* font-family: var(--font-serif); Removed in favor of sans-serif */
    }

    .button.variant-secondary::before {
      background-color: var(--md-sys-color-primary);
    }

    .button.variant-secondary:hover:not(:disabled) {
      background-color: var(--wy-button-secondary-hover-bg);
    }

    .button.variant-secondary:hover:not(:disabled)::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .button.variant-secondary:active:not(:disabled)::before {
      opacity: var(--md-sys-state-pressed-opacity);
    }

    /* ===== OUTLINED VARIANT (Editorial) ===== */
    .button.variant-outlined {
      background-color: var(--wy-button-outlined-bg);
      color: var(--wy-button-outlined-fg);
      border: 1px solid var(--wy-button-outlined-border);
      /* font-family: var(--font-serif); Removed in favor of sans-serif */
    }

    .button.variant-outlined::before {
      background-color: var(--wy-button-secondary-bg);
    }

    .button.variant-outlined:hover:not(:disabled) {
      background-color: var(--wy-button-outlined-hover-bg);
    }

    .button.variant-outlined:hover:not(:disabled)::before {
      opacity: 0.3;
    }

    .button.variant-outlined:active:not(:disabled)::before {
      opacity: 0.5;
    }

    /* ===== TEXT VARIANT (Utility - ALL CAPS) ===== */
    .button.variant-text {
      background-color: transparent;
      color: var(--wy-button-text-fg);
      text-transform: uppercase;
      letter-spacing: var(--wy-button-tracking-architectural);
      font-weight: 700;
      font-size: 0.75rem;
    }

    .button.variant-text::before {
      background-color: var(--md-sys-color-primary);
    }

    .button.variant-text.muted {
      color: var(--wy-button-text-fg-muted);
    }

    .button.variant-text:hover:not(:disabled) {
      background-color: var(--wy-button-text-hover-bg);
      color: var(--wy-button-text-fg);
    }

    .button.variant-text:hover:not(:disabled)::before {
      opacity: 0;
    }

    /* Text variant with leading indicator dot */
    .button.variant-text .indicator-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: color-mix(in srgb, currentColor 30%, transparent);
    }

    /* ===== DISABLED STATE ===== */
    .button:disabled {
      opacity: var(--md-sys-state-disabled-opacity);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    /* ===== ICON STYLING ===== */
    .icon {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: 'liga';
    }

    /* Content wrapper for proper ordering */
    .content {
      display: contents;
    }
  `);
customElements.define("wy-button", WyButton);

// components/ui/wy-filter-chip.js
var WyFilterChip = class extends i4 {
  render() {
    return b2`
      <span>${this.label}</span>
      ${this.count !== void 0 ? b2`<span class="count">(${this.count})</span>` : ""}
    `;
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "button");
    this.setAttribute("tabindex", "0");
    this.addEventListener("keydown", this._handleKeydown);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
  }
  _handleKeydown(e9) {
    if (e9.key === "Enter" || e9.key === " ") {
      e9.preventDefault();
      this.click();
    }
  }
};
__publicField(WyFilterChip, "properties", {
  label: { type: String },
  active: { type: Boolean, reflect: true },
  count: { type: Number },
  variant: { type: String, reflect: true }
});
__publicField(WyFilterChip, "styles", i`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--wy-filter-chip-padding, 5px 13px);
      min-height: var(--wy-filter-chip-min-height, 28px);
      box-sizing: border-box;
      border-radius: var(--wy-filter-chip-radius, var(--radius-pill, 999px));
      font-family: var(--wy-filter-chip-font-family, var(--font-sans, 'DM Sans', sans-serif));
      font-size: var(--wy-filter-chip-font-size, 11px);
      font-weight: var(--wy-filter-chip-font-weight, 500);
      cursor: pointer;
      transition:
        background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard),
        color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard),
        transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard);
      
      /* Opaque background by default; overridden by variant */
      background-color: var(--wy-filter-chip-bg, var(--md-sys-color-surface));
      border: 0;
      color: var(--wy-filter-chip-text, var(--md-sys-color-on-surface));
      box-shadow: none;
      
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }

    :host(:hover:not([active])) {
      background-color: var(--wy-filter-chip-hover-bg, color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 15%, transparent));
    }

    :host(:focus-visible) {
      outline: 2px solid var(--wy-filter-chip-focus, var(--md-sys-color-primary, #282828));
      outline-offset: 2px;
    }

    :host([active]) {
      background-color: var(--wy-filter-chip-active-bg, var(--md-sys-color-primary, #282828));
      color: var(--wy-filter-chip-active-fg, var(--md-sys-color-on-primary, #FFFFFF));
      border-color: transparent;
      font-weight: var(--wy-filter-chip-font-weight-active, 500);
      box-shadow: none;
    }

    /* Soft variant: no border, Surface Variant background */
    :host([variant="soft"]) {
      background-color: var(--wy-filter-chip-soft-bg, var(--md-sys-color-surface-variant));
      border: none;
      border-width: 0;
    }

    .count {
      opacity: 0.7;
      font-size: 10px;
    }

    :host([active]) .count {
      opacity: 0.85;
    }
  `);
customElements.define("wy-filter-chip", WyFilterChip);

// components/ui/wy-controls-bar.js
var WyControlsBar = class extends i4 {
  constructor() {
    super();
    this.viewMode = "grid";
    this.showDetails = false;
    this.activeCategory = "all";
    this.categories = ["Productivity", "Expertise", "Travel & Shopping"];
    this.searchValue = "";
    this.hideViewToggle = false;
    this.hideDetailsToggle = false;
    this.showPrivateVaultLink = false;
    this.privateVaultHref = "./private.html";
    this.showFeaturedOnly = false;
    this.showHiddenOnly = false;
    this.chipVariant = "";
    this.isScrolled = false;
    this.scrollState = "normal";
    this._mobileSearchOpen = false;
    this._scrollEnterThreshold = 64;
    this._scrollExitThreshold = 12;
    this._minScrollableDistance = 96;
    this._returnDuration = 160;
    this._scrollFrame = 0;
    this._returnTimer = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this._handleScroll = this._handleScroll.bind(this);
    this._handleViewportChange = this._handleViewportChange.bind(this);
    window.addEventListener("resize", this._handleViewportChange, { passive: true });
    setTimeout(() => {
      this._setupScrollListener();
    }, 100);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this._handleViewportChange);
    if (this._scrollFrame) {
      cancelAnimationFrame(this._scrollFrame);
      this._scrollFrame = 0;
    }
    clearTimeout(this._returnTimer);
    this._removeScrollListener();
  }
  _bindChipsTrackScroll() {
    const track = this.shadowRoot?.querySelector(".chips-track");
    if (!track || this._boundChipsTrack === track) return;
    this._boundChipsTrack = track;
    track.addEventListener("scroll", () => {
      track.classList.toggle("is-chips-scrolled", track.scrollLeft > 0);
    }, { passive: true });
  }
  _handleViewportChange() {
    this._handleScroll();
    this._syncScrolledHostSurface();
  }
  _setupScrollListener() {
    this._removeScrollListener();
    this._scrollContainer = this._findScrollableContainer();
    if (this._scrollContainer === window) {
      window.addEventListener("scroll", this._handleScroll, { passive: true });
    } else if (this._scrollContainer) {
      this._scrollContainer.addEventListener("scroll", this._handleScroll, { passive: true });
    }
    this._handleScroll();
  }
  _removeScrollListener() {
    if (this._scrollContainer === window) {
      window.removeEventListener("scroll", this._handleScroll);
    } else if (this._scrollContainer) {
      this._scrollContainer.removeEventListener("scroll", this._handleScroll);
    }
  }
  _findScrollableContainer() {
    const promptArea = document.querySelector(".prompt-area");
    if (promptArea) {
      const style = window.getComputedStyle(promptArea);
      if (style.overflowY === "auto" || style.overflowY === "scroll") return promptArea;
    }
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      const style = window.getComputedStyle(mainContent);
      if (style.overflowY === "auto" || style.overflowY === "scroll") return mainContent;
    }
    const siblings = this.parentElement?.querySelectorAll('[class*="scroll"], [class*="area"]');
    if (siblings) {
      for (const sibling of siblings) {
        const style = window.getComputedStyle(sibling);
        if (style.overflowY === "auto" || style.overflowY === "scroll") return sibling;
      }
    }
    let element = this.parentElement;
    while (element && element !== document.body) {
      const style = window.getComputedStyle(element);
      if (style.overflowY === "auto" || style.overflowY === "scroll") return element;
      element = element.parentElement;
    }
    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.overflowY === "auto" || bodyStyle.overflowY === "scroll") return document.body;
    return window;
  }
  _getScrollMetrics() {
    let rawScrollY = 0;
    let maxScroll = 0;
    if (this._scrollContainer === window) {
      const documentElement = document.documentElement;
      const body = document.body;
      rawScrollY = window.scrollY || documentElement.scrollTop || body.scrollTop || 0;
      maxScroll = Math.max(0, Math.max(documentElement.scrollHeight, body.scrollHeight) - window.innerHeight);
    } else {
      rawScrollY = this._scrollContainer ? this._scrollContainer.scrollTop : 0;
      maxScroll = this._scrollContainer ? Math.max(0, this._scrollContainer.scrollHeight - this._scrollContainer.clientHeight) : 0;
    }
    return { scrollY: Math.min(Math.max(rawScrollY, 0), maxScroll), maxScroll };
  }
  _handleScroll() {
    if (this._scrollFrame) return;
    this._scrollFrame = requestAnimationFrame(() => {
      this._scrollFrame = 0;
      this._updateScrollState();
    });
  }
  _updateScrollState() {
    const { scrollY, maxScroll } = this._getScrollMetrics();
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    const canFloat = !isMobile && maxScroll >= this._minScrollableDistance;
    if (!canFloat) {
      this._setScrollState("normal");
      return;
    }
    if (this.scrollState === "normal" || this.scrollState === "returning") {
      if (scrollY >= this._scrollEnterThreshold) this._setScrollState("floating");
      return;
    }
    if (this.scrollState === "floating" && scrollY <= this._scrollExitThreshold) {
      this._setScrollState("returning");
    }
  }
  _setScrollState(nextState) {
    if (this.scrollState === nextState) return;
    clearTimeout(this._returnTimer);
    this.scrollState = nextState;
    this.isScrolled = nextState !== "normal";
    this._syncStateAttributes();
    this.requestUpdate();
    if (nextState === "returning") {
      this._returnTimer = setTimeout(() => {
        if (this.scrollState === "returning") this._setScrollState("normal");
      }, this._returnDuration);
    }
  }
  _syncStateAttributes() {
    if (this.isScrolled) this.setAttribute("data-scrolled", "");
    else this.removeAttribute("data-scrolled");
    this.setAttribute("data-scroll-state", this.scrollState);
    this._syncScrolledHostSurface();
  }
  _syncScrolledHostSurface() {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (this.isScrolled && !isMobile) {
      this.style.setProperty("background", "var(--paper, #FFFAF5)");
      this.style.setProperty("backdrop-filter", "none");
      this.style.setProperty("-webkit-backdrop-filter", "none");
      this.style.setProperty("position", "fixed");
      this.style.setProperty("top", "var(--wy-controls-floating-top, 16px)");
      this.style.setProperty("right", "var(--wy-controls-floating-right, auto)");
      this.style.setProperty("left", "var(--wy-controls-floating-left, 50%)");
      this.style.setProperty("z-index", "var(--wy-controls-floating-z-index, 100)");
      this.style.setProperty("width", "var(--wy-controls-floating-width, auto)");
      this.style.setProperty("max-width", "var(--wy-controls-floating-max-width, min(900px, calc(100% - 32px)))");
      this.style.setProperty("margin-inline", "0");
      this.style.setProperty(
        "transform",
        this.scrollState === "returning" ? "var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-4px) scale(0.995))" : "var(--wy-controls-floating-transform, translateX(-50%))"
      );
    } else {
      this.style.removeProperty("background");
      this.style.removeProperty("backdrop-filter");
      this.style.removeProperty("-webkit-backdrop-filter");
      this.style.removeProperty("position");
      this.style.removeProperty("top");
      this.style.removeProperty("right");
      this.style.removeProperty("left");
      this.style.removeProperty("z-index");
      this.style.removeProperty("width");
      this.style.removeProperty("max-width");
      this.style.removeProperty("margin-inline");
      this.style.removeProperty("transform");
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("_mobileSearchOpen")) {
      if (this._mobileSearchOpen) {
        this.setAttribute("data-mobile-search", "");
        setTimeout(() => {
          this.shadowRoot?.querySelector(".search-input")?.focus();
        }, 260);
      } else {
        this.removeAttribute("data-mobile-search");
      }
    }
    this._bindChipsTrackScroll();
  }
  render() {
    this._syncStateAttributes();
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    const showToggles = !this.isScrolled && (!this.hideViewToggle || !this.hideDetailsToggle);
    return b2`
      <div class="controls-container" part="controls-container">

        <div class="search-section ${this.searchValue ? "has-value" : ""}">
          <input
            type="search"
            class="search-input"
            placeholder="Search prompts…"
            .value="${this.searchValue}"
            @input="${this._handleSearch}"
            @focus="${this._handleSearchFocus}"
            @click="${this._handleSearchFocus}"
            aria-label="Search prompts"
          >
          <span class="search-icon" aria-hidden="true">search</span>
          <button
            class="search-clear"
            @click="${this._clearSearch}"
            aria-label="Clear search"
            tabindex="${this.searchValue ? "0" : "-1"}"
          >close</button>
        </div>

        ${showToggles ? b2`
          <div class="divider"></div>
          <div class="toggle-section">
            ${!this.hideViewToggle ? b2`
              <div class="view-toggle" role="group" aria-label="View mode">
                <button
                  class="view-btn ${this.viewMode === "list" ? "active" : ""}"
                  @click="${() => this._setViewMode("list")}"
                  aria-label="List view"
                  aria-pressed="${this.viewMode === "list"}"
                >format_list_bulleted</button>
                <button
                  class="view-btn ${this.viewMode === "grid" ? "active" : ""}"
                  @click="${() => this._setViewMode("grid")}"
                  aria-label="Grid view"
                  aria-pressed="${this.viewMode === "grid"}"
                >grid_view</button>
              </div>
            ` : ""}
            ${!this.hideDetailsToggle ? b2`
              <label
                class="details-toggle-control ${this.showDetails ? "is-on" : ""}"
                @click="${this._toggleDetails}"
              >
                <input
                  type="checkbox"
                  ?checked="${this.showDetails}"
                  tabindex="0"
                  aria-label="Show descriptions"
                >
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label">Descriptions</span>
              </label>
            ` : ""}
          </div>
          <div class="divider"></div>
        ` : this.isScrolled ? b2`<div class="divider"></div>` : ""}

        <div class="category-section">
          ${this.showPrivateVaultLink ? b2`
            <a
              class="vault-link"
              href="${this.privateVaultHref}"
              aria-label="Open private prompts"
              title="Private prompts"
            >
              <span class="material-symbols-outlined" aria-hidden="true">lock</span>
            </a>
          ` : ""}
          <div class="chips-track" role="tablist">
            <button
              class="chip chip--featured ${this.showFeaturedOnly ? "active" : ""}"
              aria-pressed="${this.showFeaturedOnly}"
              @click="${this._toggleFeatured}"
            >Featured</button>
            <button
              class="chip chip--hidden ${this.showHiddenOnly ? "active" : ""}"
              aria-pressed="${this.showHiddenOnly}"
              @click="${this._toggleHidden}"
            >Hidden</button>
            <button
              class="chip ${this.activeCategory === "all" && !this.showFeaturedOnly && !this.showHiddenOnly ? "active" : ""}"
              aria-pressed="${this.activeCategory === "all" && !this.showFeaturedOnly && !this.showHiddenOnly}"
              @click="${() => this._setCategory("all")}"
            >All</button>
            ${this.categories.map((cat) => b2`
              <button
                class="chip ${this.activeCategory === cat && !this.showFeaturedOnly && !this.showHiddenOnly ? "active" : ""}"
                aria-pressed="${this.activeCategory === cat && !this.showFeaturedOnly && !this.showHiddenOnly}"
                @click="${() => this._setCategory(cat)}"
              >${cat}</button>
            `)}
          </div>
        </div>

        <button
          class="mobile-cancel"
          @click="${this._closeMobileSearch}"
          aria-label="Close search"
        >Cancel</button>

      </div>
    `;
  }
  _handleSearch(e9) {
    this.searchValue = e9.target.value;
    this._notifyChange();
  }
  _handleSearchFocus() {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && !this._mobileSearchOpen) {
      this._mobileSearchOpen = true;
    }
  }
  _clearSearch() {
    this.searchValue = "";
    this._notifyChange();
    this.shadowRoot?.querySelector(".search-input")?.focus();
  }
  dismissSearch({ clear = false } = {}) {
    const searchInput = this.shadowRoot?.querySelector(".search-input");
    if (clear) {
      this.searchValue = "";
      this._notifyChange();
    }
    this._mobileSearchOpen = false;
    searchInput?.blur();
  }
  _closeMobileSearch() {
    this.dismissSearch({ clear: true });
  }
  _setViewMode(mode) {
    this.viewMode = mode;
    this._notifyChange();
  }
  _toggleDetails(e9) {
    e9.preventDefault();
    this.showDetails = !this.showDetails;
    this._notifyChange();
  }
  _setCategory(cat) {
    this.activeCategory = cat;
    if (this.showFeaturedOnly) this.showFeaturedOnly = false;
    if (this.showHiddenOnly) this.showHiddenOnly = false;
    this._notifyChange();
  }
  _toggleFeatured() {
    this.showFeaturedOnly = !this.showFeaturedOnly;
    if (this.showFeaturedOnly) this.showHiddenOnly = false;
    this._notifyChange();
  }
  _toggleHidden() {
    this.showHiddenOnly = !this.showHiddenOnly;
    if (this.showHiddenOnly) this.showFeaturedOnly = false;
    this._notifyChange();
  }
  _notifyChange() {
    this.dispatchEvent(new CustomEvent("filter-change", {
      detail: {
        search: this.searchValue,
        viewMode: this.viewMode,
        showDetails: this.showDetails,
        category: this.activeCategory,
        showFeaturedOnly: this.showFeaturedOnly,
        showHiddenOnly: this.showHiddenOnly
      },
      bubbles: true,
      composed: true
    }));
  }
};
__publicField(WyControlsBar, "properties", {
  viewMode: { type: String, attribute: "view-mode" },
  showDetails: { type: Boolean, attribute: "show-details" },
  activeCategory: { type: String, attribute: "active-category" },
  categories: { type: Array },
  searchValue: { type: String, attribute: "search-value" },
  hideViewToggle: { type: Boolean, attribute: "hide-view-toggle" },
  hideDetailsToggle: { type: Boolean, attribute: "hide-details-toggle" },
  showPrivateVaultLink: { type: Boolean, attribute: "show-private-vault-link" },
  privateVaultHref: { type: String, attribute: "private-vault-href" },
  showFeaturedOnly: { type: Boolean, attribute: "show-featured-only" },
  showHiddenOnly: { type: Boolean, attribute: "show-hidden-only" },
  chipVariant: { type: String, attribute: "chip-variant" },
  isScrolled: { type: Boolean, state: true },
  scrollState: { type: String, state: true },
  _mobileSearchOpen: { type: Boolean, state: true }
});
__publicField(WyControlsBar, "styles", i`
    :host {
      display: block;
      background-color: transparent;
      padding: var(--s-3, 12px) var(--s-7, 32px);
      width: 100%;
      box-sizing: border-box;
      position: relative;

      --wy-controls-floating-top: 16px;
      --wy-controls-floating-right: auto;
      --wy-controls-floating-left: 50%;
      --wy-controls-floating-z-index: 100;
      --wy-controls-floating-width: auto;
      --wy-controls-floating-max-width: min(900px, calc(100% - 32px));
      --wy-controls-return-duration: var(--dur-1, 150ms);
      --wy-controls-return-opacity-duration: 140ms;
      --wy-controls-radius: var(--radius-pill, 999px);
    }

    /* Bottom hairline */
    :host::after {
      content: '';
      position: absolute;
      left: var(--wy-controls-rule-inset, var(--s-7, 32px));
      right: var(--wy-controls-rule-inset, var(--s-7, 32px));
      bottom: 0;
      height: 1px;
      background: var(--paper-edge, #E8E2DA);
    }

    :host([data-scrolled]) {
      position: fixed;
      top: var(--wy-controls-floating-top, 16px);
      left: var(--wy-controls-floating-left, 50%);
      transform: var(--wy-controls-floating-transform, translateX(-50%));
      z-index: var(--wy-controls-floating-z-index, 100);
      width: var(--wy-controls-floating-width, auto);
      max-width: var(--wy-controls-floating-max-width, min(900px, calc(100% - 32px)));
      background: var(--paper, #F7F4EE);
      border: 0;
      border-radius: 0;
      padding: var(--wy-controls-padding-scrolled, var(--s-2, 8px) var(--s-5, 24px));
      box-shadow: none;
      transition:
        top 300ms cubic-bezier(0.2, 0, 0, 1),
        transform 300ms cubic-bezier(0.2, 0, 0, 1),
        padding 300ms cubic-bezier(0.2, 0, 0, 1),
        box-shadow 300ms cubic-bezier(0.2, 0, 0, 1),
        opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host([data-scrolled])::after {
      display: none;
    }

    :host([data-scroll-state="returning"]) {
      opacity: 0.08;
      transform: var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-4px) scale(0.995));
      box-shadow: none;
      transition:
        top var(--wy-controls-return-duration, 150ms) cubic-bezier(0.2, 0, 0, 1),
        transform var(--wy-controls-return-duration, 150ms) cubic-bezier(0.2, 0, 0, 1),
        padding var(--wy-controls-return-duration, 150ms) cubic-bezier(0.2, 0, 0, 1),
        box-shadow var(--wy-controls-return-duration, 150ms) cubic-bezier(0.2, 0, 0, 1),
        opacity var(--wy-controls-return-opacity-duration, 140ms) cubic-bezier(0.2, 0, 0, 1);
    }

    /* ---- Controls container ---- */
    .controls-container {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: var(--s-5, 24px);
      max-width: 1600px;
      margin: 0 auto;
    }

    :host([data-scrolled]) .controls-container {
      gap: var(--s-4, 16px);
      max-width: 100%;
    }

    /* ---- Search ---- */
    .search-section {
      flex: 0 0 auto;
      width: 260px;
      position: relative;
      transition: width 250ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host([data-scrolled]) .search-section {
      width: 280px;
    }

    .search-input {
      width: 100%;
      height: 36px;
      padding: 0 var(--s-4, 16px) 0 40px;
      background: transparent;
      color: var(--ink, #1A1A1A);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 13px;
      font-weight: 400;
      outline: none;
      box-sizing: border-box;
      transition:
        background 150ms cubic-bezier(0.2, 0, 0, 1),
        border-color 150ms cubic-bezier(0.2, 0, 0, 1),
        box-shadow 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .search-input::placeholder {
      color: var(--ink-mute, #868685);
      font-weight: 300;
    }

    .search-input:hover {
      border-color: var(--ink-soft, #A8A49C);
    }

    .search-input:focus {
      background: transparent;
      border-color: var(--ink, #1A1A1A);
      box-shadow: none;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 18px;
      line-height: 1;
      color: var(--ink-mute, #868685);
      pointer-events: none;
      user-select: none;
      transition: color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .search-section:focus-within .search-icon {
      color: var(--ink, #282828);
    }

    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      display: none;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--ink-mute, #868685);
      cursor: pointer;
      padding: 0;
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 16px;
      line-height: 1;
      transition: background 150ms cubic-bezier(0.2, 0, 0, 1), color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .search-clear:hover {
      background: color-mix(in srgb, var(--ink, #282828) 8%, transparent);
      color: var(--ink, #282828);
    }

    .search-section.has-value .search-clear {
      display: flex;
    }

    /* ---- Divider ---- */
    .divider {
      width: 1px;
      height: 20px;
      background: var(--paper-edge, #E8E2DA);
      flex-shrink: 0;
    }

    /* ---- Toggles ---- */
    .toggle-section {
      display: flex;
      align-items: center;
      gap: var(--s-5, 24px);
      flex-shrink: 0;
    }

    :host([data-scrolled]) .toggle-section {
      display: none;
    }

    /* View toggle pill */
    .view-toggle {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      padding: 2px;
      height: 32px;
      box-sizing: border-box;
    }

    .view-btn {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--wy-controls-radius, 999px);
      color: var(--ink-mute, #868685);
      cursor: pointer;
      padding: 0;
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 16px;
      line-height: 1;
      transition: background 150ms cubic-bezier(0.2, 0, 0, 1), color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .view-btn:hover {
      color: var(--ink, #282828);
    }

    .view-btn.active {
      background: var(--ink, #1A1A1A);
      color: var(--paper, #F7F4EE);
      box-shadow: none;
    }

    /* Details toggle (custom checkbox) */
    .details-toggle-control {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2, 8px);
      cursor: pointer;
      user-select: none;
    }

    .details-toggle-control input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .toggle-track {
      width: 28px;
      height: 16px;
      background: var(--paper-edge, #E8E2DA);
      border-radius: 9999px;
      position: relative;
      flex-shrink: 0;
      transition: background 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      background: var(--white, #fff);
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .details-toggle-control.is-on .toggle-track {
      background: var(--ink, #282828);
    }

    .details-toggle-control.is-on .toggle-thumb {
      transform: translateX(12px);
    }

    .toggle-label {
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-mute, #868685);
      white-space: nowrap;
    }

    /* ---- Category chips ---- */
    .category-section {
      flex: 1 1 auto;
      min-width: 0;
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--s-2, 8px);
    }

    .chips-track {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--s-2, 8px);
      overflow-x: auto;
      padding: 2px 24px 2px 0;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      -webkit-overflow-scrolling: touch;
      -webkit-mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
      mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
    }

    .chips-track.is-chips-scrolled {
      -webkit-mask-image: linear-gradient(to right, transparent 0, black 28px, black calc(100% - 28px), transparent 100%);
      mask-image: linear-gradient(to right, transparent 0, black 28px, black calc(100% - 28px), transparent 100%);
    }

    .chips-track::-webkit-scrollbar {
      display: none;
    }

    .vault-link {
      flex: 0 0 auto;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--ink-mute, #6B6B6A);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      text-decoration: none;
      position: relative;
      overflow: hidden;
      transition:
        color var(--dur-1, 150ms) var(--ease, ease),
        border-color var(--dur-1, 150ms) var(--ease, ease);
    }

    .vault-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--ink, #282828);
      opacity: 0;
      transition: opacity var(--dur-1, 150ms) var(--ease, ease);
      pointer-events: none;
    }

    .vault-link:hover,
    .vault-link:focus-visible {
      color: var(--ink, #282828);
      border-color: var(--ink-soft, #B9B2A6);
    }

    .vault-link:hover::before,
    .vault-link:focus-visible::before {
      opacity: 0.06;
    }

    .vault-link:focus-visible {
      outline: 2px solid var(--ink, #282828);
      outline-offset: 2px;
    }

    .vault-link .material-symbols-outlined {
      position: relative;
      z-index: 1;
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 17px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      font-feature-settings: 'liga';
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }

    :host([data-scrolled]) .category-section {
      flex: 0 1 auto;
      max-width: 600px;
      transition: max-width 300ms cubic-bezier(0.2, 0, 0, 1);
    }

    .chip {
      flex-shrink: 0;
      height: 28px;
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      color: var(--ink-mute, #6B6B6A);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      white-space: nowrap;
      cursor: pointer;
      transition:
        color 150ms cubic-bezier(0.2, 0, 0, 1),
        background 150ms cubic-bezier(0.2, 0, 0, 1),
        border-color 150ms cubic-bezier(0.2, 0, 0, 1),
        transform 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .chip:hover {
      color: var(--ink, #282828);
      border-color: color-mix(in srgb, var(--ink, #282828) 25%, var(--paper-edge, #E8E2DA));
      background: color-mix(in srgb, var(--ink, #282828) 3%, transparent);
    }

    .chip:active {
      transform: scale(0.98);
    }

    .chip.active {
      background: var(--ink, #282828);
      color: var(--paper, #FFFAF5);
      border-color: var(--ink, #282828);
    }

    .chip.active:hover {
      background: color-mix(in srgb, var(--ink, #282828) 92%, var(--paper, #FFFAF5));
    }

    /* Featured dot marker */
    .chip--featured::before {
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.9;
      flex-shrink: 0;
    }

    .chip--hidden::before {
      content: 'visibility_off';
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0;
      text-transform: none;
      flex-shrink: 0;
    }

    /* ---- Mobile cancel button ---- */
    .mobile-cancel {
      flex: 0 0 auto;
      display: none;
      height: 36px;
      padding: 0 var(--s-2, 8px);
      background: transparent;
      border: none;
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 13px;
      font-weight: 500;
      color: var(--ink, #282828);
      cursor: pointer;
    }

    /* ---- Mobile (≤768px) ---- */
    @media (max-width: 768px) {
      :host {
        padding: var(--s-3, 12px) var(--s-4, 16px);
      }

      :host::after {
        left: var(--s-4, 16px);
        right: var(--s-4, 16px);
      }

      :host([data-scrolled]) {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: 100%;
        max-width: 100%;
        border-radius: 0;
        padding: var(--s-3, 12px) var(--s-4, 16px);
        background: transparent;
        box-shadow: none;
      }

      :host([data-scrolled])::after {
        display: block;
        left: var(--s-4, 16px);
        right: var(--s-4, 16px);
      }

      .controls-container {
        gap: var(--s-3, 12px);
      }

      .divider,
      .toggle-section {
        display: none;
      }

      /* Collapsed: search is an icon button */
      .search-section {
        flex: 0 0 auto;
        width: 36px;
        transition:
          width 250ms cubic-bezier(0.2, 0, 0, 1),
          flex 250ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-input {
        width: 36px;
        height: 36px;
        padding: 0;
        background: transparent;
        color: transparent;
        border-radius: var(--wy-controls-radius, 999px);
        font-size: 16px;
        cursor: pointer;
        transition:
          width 250ms cubic-bezier(0.2, 0, 0, 1),
          padding 250ms cubic-bezier(0.2, 0, 0, 1),
          background 250ms cubic-bezier(0.2, 0, 0, 1),
          color 150ms cubic-bezier(0.2, 0, 0, 1) 100ms,
          border-radius 250ms cubic-bezier(0.2, 0, 0, 1),
          border-color 150ms cubic-bezier(0.2, 0, 0, 1),
          box-shadow 150ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-input::placeholder {
        color: transparent;
        transition: color 150ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-icon {
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--ink, #282828);
        transition:
          left 250ms cubic-bezier(0.2, 0, 0, 1),
          transform 250ms cubic-bezier(0.2, 0, 0, 1),
          color 150ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-clear {
        display: none !important;
      }

      /* Category section: flex fills remaining space */
      .category-section {
        flex: 1 1 auto;
        min-width: 0;
        transition:
          opacity 250ms cubic-bezier(0.2, 0, 0, 1),
          transform 250ms cubic-bezier(0.2, 0, 0, 1),
          max-width 250ms cubic-bezier(0.2, 0, 0, 1);
      }

      /* Search open state */
      :host([data-mobile-search]) .search-section {
        flex: 1 1 auto;
        width: auto;
      }

      :host([data-mobile-search]) .search-input {
        width: 100%;
        padding: 0 var(--s-4, 16px) 0 40px;
        background: transparent;
        color: var(--ink, #1A1A1A);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--wy-controls-radius, 999px);
        cursor: text;
      }

      :host([data-mobile-search]) .search-input::placeholder {
        color: var(--ink-mute, #868685);
      }

      :host([data-mobile-search]) .search-icon {
        left: 14px;
        transform: translate(0, -50%);
        color: var(--ink-mute, #868685);
      }

      :host([data-mobile-search]) .search-section.has-value .search-clear {
        display: flex !important;
      }

      :host([data-mobile-search]) .category-section {
        opacity: 0;
        max-width: 0;
        transform: translateX(12px);
        pointer-events: none;
        overflow: hidden;
      }

      :host([data-mobile-search]) .mobile-cancel {
        display: inline-flex;
        align-items: center;
      }
    }

    /* ---- Tablet narrow (769–900px) ---- */
    @media (min-width: 769px) and (max-width: 900px) {
      .controls-container {
        flex-wrap: wrap;
        gap: var(--s-2, 8px) var(--s-1, 4px);
      }

      .search-section {
        flex: 1 1 auto;
        width: auto;
        min-width: 120px;
        max-width: 240px;
      }

      .divider { display: none; }

      .toggle-label { display: none; }

      .toggle-section { gap: var(--s-2, 8px); }

      .category-section {
        flex: 0 0 100%;
        order: 1;
      }
    }

    /* ---- Tablet (901–1023px) ---- */
    @media (min-width: 901px) and (max-width: 1023px) {
      :host {
        padding: var(--s-2, 8px) var(--s-5, 24px);
      }

      .controls-container {
        gap: var(--s-2, 8px);
      }

      .search-section {
        width: 160px;
      }

      .toggle-section {
        gap: var(--s-3, 12px);
      }

      .toggle-label {
        display: none;
      }
    }
  `);
customElements.define("wy-controls-bar", WyControlsBar);

// components/ui/wy-toast.js
var WyToast = class extends i4 {
  constructor() {
    super();
    this.message = "";
    this.show = false;
    this.duration = 3e3;
    this.variant = "success";
    this.actions = [];
    this.dismissible = false;
    this._timer = null;
  }
  /**
   * Get the icon name based on variant
   */
  get _icon() {
    switch (this.variant) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "check_circle";
    }
  }
  render() {
    const hasActions = Boolean(this.actions?.length);
    return b2`
      <div class="toast-container ${hasActions ? "has-actions" : ""}">
        <span class="icon variant-${this.variant}">${this._icon}</span>
        <span class="message">${this.message}</span>
        ${this.actions?.length ? b2`
          <div class="actions">
            ${this.actions.map((action) => b2`
              <a class="action" href="${action.href}" target="_blank" rel="noopener noreferrer">${action.label}</a>
            `)}
          </div>
        ` : ""}
        ${this.dismissible ? b2`
          <button class="dismiss" type="button" @click="${this._dismiss}" aria-label="Dismiss notification">
            <span class="icon">close</span>
          </button>
        ` : ""}
      </div>
    `;
  }
  _dismiss() {
    if (this._timer) clearTimeout(this._timer);
    this.show = false;
    this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true, composed: true }));
  }
  updated(changedProperties) {
    if (changedProperties.has("show") && this.show) {
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._dismiss();
      }, this.duration);
    }
  }
};
__publicField(WyToast, "properties", {
  message: { type: String },
  show: { type: Boolean, reflect: true },
  duration: { type: Number },
  variant: { type: String },
  actions: { type: Array },
  dismissible: { type: Boolean }
});
__publicField(WyToast, "styles", i`
    :host {
      display: block;
      position: fixed;
      bottom: calc(32px + env(safe-area-inset-bottom, 0px));
      left: 50%;
      transform: translateX(-50%) translateY(16px) scale(0.96);
      transform-origin: 50% 100%;
      z-index: 3000;
      pointer-events: none;
      transition:
        transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 220ms cubic-bezier(0.2, 0.6, 0.2, 1);
      opacity: 0;
      will-change: transform, opacity;
    }

    :host([show]) {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .toast-container {
        background-color: rgba(26, 26, 26, 0.92);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: opacity 180ms ease;
        transform: translateX(-50%) translateY(0) scale(1);
      }
      :host([show]) {
        opacity: 1;
      }
    }

    .toast-container {
      background-color: rgba(26, 26, 26, 0.62);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      color: rgba(247, 244, 238, 0.96);
      padding: 14px 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow:
        inset 0 1px 0 rgba(247, 244, 238, 0.10),
        0 18px 48px -12px rgba(13, 13, 13, 0.45),
        0 6px 16px -6px rgba(13, 13, 13, 0.28);
      outline: 1px solid rgba(247, 244, 238, 0.12);
      outline-offset: -1px;
      max-width: min(420px, calc(100vw - 32px));
    }

    .toast-container.has-actions {
      width: min(420px, calc(100vw - 32px));
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: 16px 12px;
      padding: 16px;
    }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: 'liga';
      flex-shrink: 0;
    }

    .icon.variant-success {
      color: rgba(247, 244, 238, 0.72);
    }

    .icon.variant-info {
      color: rgba(247, 244, 238, 0.72);
    }

    .icon.variant-error {
      color: #E89B7E;
    }

    .icon.variant-warning {
      color: #D9C28A;
    }

    .message {
      font-family: var(--ff-sans, var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif));
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0.005em;
      color: #FFFFFF;
    }

    .toast-container.has-actions .icon.variant-success {
      display: none;
    }

    .toast-container.has-actions .message {
      grid-column: 1;
      grid-row: 1;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.3;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toast-container.has-actions .actions {
      grid-column: 1 / -1;
      grid-row: 2;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
    }

    .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 0 14px;
      border-radius: 0;
      background: rgba(247, 244, 238, 0.12);
      color: rgba(247, 244, 238, 0.96);
      font-family: 'Inter', var(--font-body, sans-serif);
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1;
      text-decoration: none;
      white-space: nowrap;
      border: 1px solid rgba(247, 244, 238, 0.16);
    }

    .toast-container.has-actions .action {
      min-height: 40px;
      padding: 0 14px;
      font-size: 0.8125rem;
      font-weight: 600;
      min-width: 0;
    }

    .action:focus-visible {
      outline: 2px solid rgba(247, 244, 238, 0.72);
      outline-offset: 2px;
    }

    .dismiss {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: rgba(247, 244, 238, 0.6);
      cursor: pointer;
      font: inherit;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dismiss:hover {
      color: rgba(247, 244, 238, 0.96);
    }

    .dismiss .icon {
      font-size: 18px;
    }

    .toast-container.has-actions .dismiss {
      grid-column: 2;
      grid-row: 1;
      align-self: start;
      justify-self: end;
      width: 28px;
      height: 28px;
      transform: translate(4px, -4px);
    }

    .dismiss:focus-visible {
      outline: 2px solid rgba(247, 244, 238, 0.72);
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      .toast-container {
        width: calc(100vw - 32px);
        flex-wrap: wrap;
        justify-content: center;
        padding: 14px 16px;
      }

      .actions {
        order: 3;
        width: 100%;
        justify-content: center;
      }

      .toast-container.has-actions {
        width: calc(100vw - 32px);
        grid-template-columns: 1fr auto;
        gap: 16px 12px;
        padding: 16px;
        justify-content: initial;
      }

      .toast-container.has-actions .actions {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .toast-container.has-actions .action {
        min-height: 44px;
      }

      .toast-container.has-actions .dismiss {
        width: 28px;
        height: 28px;
        transform: translate(4px, -4px);
      }
    }
  `);
customElements.define("wy-toast", WyToast);

// components/ui/wy-copy-confirm.js
var WyCopyConfirm = class extends i4 {
  constructor() {
    super();
    this.show = false;
    this.duration = 4e3;
    this.links = [];
    this.title = "Copied!";
    this._timer = null;
    this._handleDocumentPointerDown = this._handleDocumentPointerDown.bind(this);
    this._handleDocumentKeyDown = this._handleDocumentKeyDown.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this._handleDocumentPointerDown);
    document.addEventListener("keydown", this._handleDocumentKeyDown);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this._handleDocumentPointerDown);
    document.removeEventListener("keydown", this._handleDocumentKeyDown);
    this._clearTimer();
  }
  render() {
    const links = (this.links || []).slice(0, 3);
    return b2`
      <div class="container" role="dialog" aria-live="polite" aria-labelledby="copyConfirmTitle">
        <div class="header">
          <h3 class="title" id="copyConfirmTitle">${this.title}</h3>
          <button class="close" type="button" @click="${this._dismiss}" aria-label="Close">
            <span class="ms">close</span>
          </button>
        </div>
        <div class="chips">
          ${links.map((link) => b2`
            <a
              class="chip"
              href="${link.url}"
              target="_blank"
              rel="noopener noreferrer"
              @click="${() => this._onLinkClick(link)}"
            >${link.name}</a>
          `)}
        </div>
      </div>
    `;
  }
  updated(changedProperties) {
    if (changedProperties.has("show")) {
      this._clearTimer();
      if (this.show && this.duration > 0) {
        this._timer = setTimeout(() => this._dismiss(), this.duration);
      }
    }
  }
  _handleDocumentPointerDown(event) {
    if (!this.show || event.composedPath().includes(this)) {
      return;
    }
    this._dismiss();
  }
  _handleDocumentKeyDown(event) {
    if (this.show && event.key === "Escape") {
      this._dismiss();
    }
  }
  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  _dismiss() {
    if (!this.show) {
      return;
    }
    this._clearTimer();
    this.show = false;
    this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true, composed: true }));
  }
  _onLinkClick(link) {
    this.dispatchEvent(new CustomEvent("link-click", {
      detail: { link },
      bubbles: true,
      composed: true
    }));
  }
};
__publicField(WyCopyConfirm, "properties", {
  show: { type: Boolean, reflect: true },
  duration: { type: Number },
  links: { type: Array },
  title: { type: String }
});
__publicField(WyCopyConfirm, "styles", i`
    :host {
      display: block;
      position: fixed;
      left: 50%;
      width: min(80vw, 420px);
      bottom: calc(32px + env(safe-area-inset-bottom, 0px));
      z-index: 3000;
      pointer-events: none;
      opacity: 0;
      transform: translateX(-50%) translateY(16px) scale(0.98);
      transform-origin: 50% 100%;
      transition:
        transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 220ms cubic-bezier(0.2, 0.6, 0.2, 1);
      will-change: transform, opacity;
    }

    :host([show]) {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
      pointer-events: auto;
    }

    @media (min-width: 640px) {
      :host {
        width: min(80vw, 420px);
      }
    }

    .container {
      background-color: var(--ink, #1A1A1A);
      color: var(--paper, #F7F4EE);
      padding: 16px;
      border-radius: 8px;
      box-shadow:
        0 18px 48px -12px rgba(13, 13, 13, 0.45),
        0 6px 16px -6px rgba(13, 13, 13, 0.28);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    .title {
      margin: 0;
      color: var(--paper, #F7F4EE);
      font-family: var(--ff-sans, var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif));
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: 0.005em;
    }

    .close {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--paper, #F7F4EE);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      transition: background-color 160ms ease;
    }

    .close:hover {
      background-color: color-mix(in srgb, var(--paper, #F7F4EE) 10%, transparent);
    }

    .close:focus-visible,
    .chip:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--paper, #F7F4EE) 62%, transparent);
      outline-offset: 2px;
    }

    .ms {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-flex;
      font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .chips {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    @media (min-width: 640px) {
      .chips {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .chip {
        flex: 1 1 0;
      }
    }

    .chip {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      box-sizing: border-box;
      padding: 14px 18px;
      border: 0;
      border-radius: 999px;
      background-color: var(--paper, #F7F4EE);
      color: var(--ink, #1A1A1A);
      font-family: var(--ff-sans, var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif));
      font-size: 16px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: 0.04em;
      text-decoration: none;
      cursor: pointer;
      transition:
        background-color 160ms ease,
        transform 160ms ease;
    }

    .chip:hover {
      background-color: var(--paper-deep, #EEE8DD);
    }

    .chip:active {
      transform: scale(0.98);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: opacity 200ms linear;
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
  `);
customElements.define("wy-copy-confirm", WyCopyConfirm);

// components/ui/wy-modal.js
var WyModal = class extends i4 {
  constructor() {
    super();
    this.open = false;
    this.heading = "";
    this.maxWidth = "560px";
    this.fullScreen = false;
  }
  render() {
    return b2`
      <md-dialog 
        ?open="${this.open}"
        @close="${this._handleClose}"
        @cancel="${this._handleCancel}"
        style="--md-dialog-container-max-width: ${this.maxWidth}"
      >
        <div slot="headline" class="headline-text">
          ${this.heading}
        </div>
        <form slot="content" method="dialog" class="modal-content">
          <slot></slot>
        </form>
        <div slot="actions" class="footer-actions">
          <slot name="actions"></slot>
        </div>
      </md-dialog>
    `;
  }
  show() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  _handleClose(e9) {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", {
      detail: e9.detail,
      bubbles: true,
      composed: true
    }));
  }
  _handleCancel(e9) {
    this.open = false;
  }
};
__publicField(WyModal, "properties", {
  open: { type: Boolean, reflect: true },
  heading: { type: String },
  maxWidth: { type: String, attribute: "max-width" },
  fullScreen: { type: Boolean, attribute: "full-screen" }
});
__publicField(WyModal, "styles", i`
    /* Required fonts - load in page <head>:
       <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    */

    :host {
      display: block;
    }

    /* Wrap md-dialog to override its internals if needed,
       but primarily use CSS variables for styling. */
    md-dialog {
      --md-dialog-container-color: var(--md-sys-color-surface);
      --md-dialog-container-shape: 28px;
      --md-dialog-container-max-height: min(90vh, calc(100% - 48px));
    }

    /* Soft Modernism Detail: Surface border instead of heavy shadow */
    md-dialog::part(container) {
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    /* Custom slide-up animation overrides for md-dialog */
    /* Note: md-dialog uses standard M3 transitions, 
       we'll inject specific timing for 'Soft Modernism' */
    
    
    /* Use more specific selector instead of !important */
    ::slotted(.headline-text) {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      color: var(--md-sys-color-text-heading);
      margin: 0;
      padding-top: 24px;
      padding-bottom: 8px;
      display: block;
    }
    
    /* Ensure specificity overrides any conflicting styles */
    md-dialog::slotted(.headline-text) {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      color: var(--md-sys-color-text-heading);
      margin: 0;
      padding-top: 24px;
      padding-bottom: 8px;
      display: block;
    }

    .modal-content {
      padding: 12px 4px 24px 4px;
      font-family: var(--font-body);
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      gap: 24px;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .footer-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      width: 100%;
      padding-bottom: 16px;
      padding-top: 8px;
      flex-shrink: 0;
    }

    /* Mobile button label utility class */
    ::slotted(.btn-label) {
      display: inline;
    }

    /* Ensure buttons in footer are capsule-shaped */
    ::slotted(md-filled-button),
    ::slotted(md-outlined-button),
    ::slotted(md-text-button) {
      /* Radius is already global, but ensure layout space */
    }

    @media (max-width: 600px) {
      md-dialog {
        --md-dialog-container-max-width: 100vw;
        --md-dialog-container-max-height: 100vh;
        --md-dialog-container-shape: 28px 28px 0 0;
        margin: 0;
        align-self: flex-end;
      }

      .footer-actions {
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        gap: 8px;
      }

      /* Hide button labels on mobile */
      ::slotted(.btn-label) {
        display: none;
      }
    }
  `);
customElements.define("wy-modal", WyModal);

// components/ui/wy-tabs.js
var WyTabs = class extends i4 {
  render() {
    return b2`
      <div class="tabs-list" role="tablist">
        <slot></slot>
      </div>
    `;
  }
  constructor() {
    super();
    this.addEventListener("click", (e9) => {
      const tabBtn = e9.target.closest('[role="tab"]');
      if (tabBtn) {
        const tabValue = tabBtn.getAttribute("data-tab");
        this.activeTab = tabValue;
        this._updateTabs();
        this.dispatchEvent(new CustomEvent("tab-change", {
          detail: { tab: tabValue },
          bubbles: true,
          composed: true
        }));
      }
    });
  }
  updated(changedProperties) {
    if (changedProperties.has("activeTab")) {
      this._updateTabs();
    }
  }
  _updateTabs() {
    const tabs = this.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
      if (tab.getAttribute("data-tab") === this.activeTab) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }
};
__publicField(WyTabs, "properties", {
  activeTab: { type: String, attribute: "active-tab" }
});
__publicField(WyTabs, "styles", i`
    :host {
      display: block;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .tabs-list {
      display: flex;
      gap: 32px; /* Wider gap for cleaner look */
      padding: 0 32px; /* Align with modal content padding */
    }

    .tab-item {
      padding: 12px 0 16px 0; /* More bottom padding for visual balance */
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
      background: none;
      border: none;
      margin: 0;
    }

    .tab-item:hover {
      color: var(--md-sys-color-text-heading);
    }

    .tab-item.active {
      color: var(--md-sys-color-text-heading);
      font-weight: 700;
    }

    .tab-item.active::after {
      content: '';
      position: absolute;
      bottom: -1px; /* Overlap the border-bottom */
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--md-sys-color-primary);
    }

    /* Responsive padding to match page/modal gutters */
    @media (max-width: 600px) {
      .tabs-list {
        padding: 0 16px;
        gap: 24px;
      }
    }
  `);
customElements.define("wy-tabs", WyTabs);

// components/ui/wy-form-field.js
var WyFormField = class extends i4 {
  render() {
    return b2`
      <div class="label-container">
        ${this.label ? b2`<label for="${this.id}">${this.label}${this.required ? b2`<span class="required-mark">*</span>` : ""}</label>` : ""}
      </div>
      ${this.description ? b2`<div class="description">${this.description}</div>` : ""}
      <slot></slot>
      ${this.error ? b2`<div class="error" id="${this.id}-error">${this.error}</div>` : ""}
    `;
  }
};
__publicField(WyFormField, "properties", {
  label: { type: String },
  id: { type: String },
  description: { type: String },
  error: { type: String },
  required: { type: Boolean }
});
__publicField(WyFormField, "styles", i`
    :host {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 24px;
      width: 100%;
    }

    .label-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--md-sys-color-on-surface-variant);
    }

    .required-mark {
      color: var(--err);
      margin-left: 2px;
    }

    .description {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .error {
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--err);
      margin-top: 4px;
    }

    ::slotted(input),
    ::slotted(textarea),
    ::slotted(select) {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      border-radius: var(--radius-2, var(--md-sys-shape-corner-small));
      border: 0;
      background-color: var(--field-bg, var(--md-sys-color-surface-container-lowest));
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--md-sys-color-on-surface);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
      transition:
        box-shadow var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
        background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
    }

    ::slotted(input:focus),
    ::slotted(textarea:focus),
    ::slotted(select:focus) {
      outline: none;
      background-color: var(--surface-2, var(--md-sys-color-surface-container-lowest));
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent),
        0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
    }

    ::slotted([aria-invalid="true"]) {
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--err) 32%, transparent),
        0 0 0 3px color-mix(in srgb, var(--err) 8%, transparent);
    }
  `);
customElements.define("wy-form-field", WyFormField);

// components/ui/wy-dropdown.js
var WyDropdown = class extends i4 {
  constructor() {
    super();
    this.label = "";
    this.value = "";
    this.options = [];
    this.placeholder = "Select option...";
    this.searchable = false;
    this.disabled = false;
    this.variant = "default";
    this._showDropdown = false;
    this._focusedIndex = -1;
  }
  render() {
    const selectedOption = this.options.find((opt) => opt.value === this.value);
    const displayValue = selectedOption ? selectedOption.label : this.placeholder;
    const isPlaceholder = !selectedOption;
    return b2`
            <div class="container">
                ${this.label ? b2`<div class="label">${this.label}</div>` : A}
                <button 
                    class="selector ${this._showDropdown ? "open" : ""}"
                    @click="${this._toggleDropdown}"
                    @blur="${this._handleBlur}"
                    @keydown="${this._handleKeyDown}"
                    ?disabled="${this.disabled}"
                    aria-haspopup="listbox"
                    aria-expanded="${this._showDropdown}"
                >
                    <span class="value ${isPlaceholder ? "placeholder" : ""}">${displayValue}</span>
                    <span class="material-symbols-outlined icon">expand_more</span>
                </button>
                ${this._showDropdown ? b2`
                    <div class="dropdown" role="listbox">
                        ${this.options.length > 0 ? this.options.map((option, i6) => b2`
                            <div 
                                class="item ${option.value === this.value ? "selected" : ""} ${i6 === this._focusedIndex ? "focused" : ""}"
                                role="option"
                                aria-selected="${option.value === this.value}"
                                @mousedown="${(e9) => {
      e9.preventDefault();
      this._select(option.value);
    }}"
                                @mouseenter="${() => this._focusedIndex = i6}"
                            >
                                ${option.label}
                            </div>
                        `) : b2`<div class="no-results">No options available</div>`}
                    </div>
                ` : A}
            </div>
        `;
  }
  _toggleDropdown() {
    if (!this.disabled) {
      this._showDropdown = !this._showDropdown;
      this._focusedIndex = this.options.findIndex((opt) => opt.value === this.value);
    }
  }
  _handleBlur() {
    setTimeout(() => {
      this._showDropdown = false;
    }, 150);
  }
  _handleKeyDown(e9) {
    if (this.disabled) return;
    if (e9.key === "ArrowDown") {
      e9.preventDefault();
      if (!this._showDropdown) {
        this._showDropdown = true;
        this._focusedIndex = this.options.findIndex((opt) => opt.value === this.value);
      } else {
        this._focusedIndex = Math.min(this._focusedIndex + 1, this.options.length - 1);
      }
    } else if (e9.key === "ArrowUp") {
      e9.preventDefault();
      if (this._showDropdown) {
        this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
      }
    } else if (e9.key === "Enter" || e9.key === " ") {
      e9.preventDefault();
      if (!this._showDropdown) {
        this._showDropdown = true;
        this._focusedIndex = this.options.findIndex((opt) => opt.value === this.value);
      } else if (this._focusedIndex >= 0 && this.options[this._focusedIndex]) {
        this._select(this.options[this._focusedIndex].value);
      }
    } else if (e9.key === "Escape") {
      e9.preventDefault();
      this._showDropdown = false;
      this.renderRoot.querySelector(".selector")?.blur();
    } else if (e9.key === "Home") {
      e9.preventDefault();
      if (this._showDropdown) {
        this._focusedIndex = 0;
      }
    } else if (e9.key === "End") {
      e9.preventDefault();
      if (this._showDropdown) {
        this._focusedIndex = this.options.length - 1;
      }
    }
  }
  _select(value) {
    if (this.value !== value) {
      this.value = value;
      this.dispatchEvent(new CustomEvent("change", {
        detail: { value },
        bubbles: true,
        composed: true
      }));
    }
    this._showDropdown = false;
  }
};
__publicField(WyDropdown, "properties", {
  label: { type: String },
  value: { type: String },
  options: { type: Array },
  placeholder: { type: String },
  searchable: { type: Boolean },
  disabled: { type: Boolean },
  variant: { type: String },
  _showDropdown: { type: Boolean, state: true },
  _focusedIndex: { type: Number, state: true }
});
__publicField(WyDropdown, "styles", i`
        /* Note: Fonts (DM Sans, Material Symbols) should be loaded in consuming page <head> */
        
        :host {
            display: block;
            /* Fallback values for component-specific tokens */
            --wy-dropdown-label-color: #71717A;
            --wy-dropdown-text-color: #52525B;
            --wy-dropdown-icon-color: #52525B;
            --wy-dropdown-bg: var(--md-sys-color-surface-container-lowest, #FDFBF7);
            --wy-dropdown-border: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-border-hover: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-menu-bg: var(--md-sys-color-surface-container-high, #EBE5DE);
            --wy-dropdown-item-hover-bg: var(--md-sys-color-surface-container-high, #EBE5DE);
        }
        
        /* Subtle variant - lighter backgrounds for modal integration */
        :host([variant="subtle"]) {
            --wy-dropdown-bg: var(--md-sys-color-surface-container-low, #FDFBF7);  /* Button bg - lighter than modal */
            --wy-dropdown-border: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-menu-bg: var(--md-sys-color-surface-container-low, #FDFBF7);  /* Menu bg */
            --wy-dropdown-item-hover-bg: var(--md-sys-color-surface-container, #F5F2EA);  /* Item hover */
        }
        
        /* Material Symbols font configuration */
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga';
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        
        .container {
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .label {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--wy-dropdown-label-color);
            margin-bottom: var(--spacing-sm, 8px);
            margin-left: var(--spacing-xs, 4px);
        }
        
        .selector {
            position: relative;
            overflow: hidden;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
            background-color: var(--wy-dropdown-bg);
            border: 1px solid var(--wy-dropdown-border);
            border-radius: var(--md-sys-shape-corner-medium, 12px);
            cursor: pointer;
            transition: border-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            text-align: left;
        }
        
        .selector:disabled {
            cursor: not-allowed;
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
        }
        
        /* MD3 State Layer for hover */
        .selector::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
            border-radius: inherit;
        }
        
        .selector:hover:not(:disabled) {
            border-color: var(--wy-dropdown-border-hover);
        }
        
        .selector:hover:not(:disabled)::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }
        
        .selector:focus-visible {
            outline: 3px solid var(--md-sys-color-primary, #282828);
            outline-offset: 2px;
        }
        
        .selector:active:not(:disabled)::before {
            opacity: var(--md-sys-state-pressed-opacity, 0.12);
        }
        
        .value {
            flex: 1;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--wy-dropdown-text-color);
            position: relative;
            z-index: 1;
        }
        
        .value.placeholder {
            opacity: 0.6;
        }
        
        .icon {
            color: var(--wy-dropdown-icon-color);
            transition: color var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                        transform var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            position: relative;
            z-index: 1;
            margin-left: var(--spacing-sm, 8px);
        }
        
        .selector:hover:not(:disabled) .icon {
            color: var(--wy-dropdown-text-color);
        }
        
        .selector.open .icon {
            transform: rotate(180deg);
        }
        
        .dropdown {
            position: absolute;
            top: calc(100% + var(--spacing-xs, 4px));
            left: 0;
            right: 0;
            background-color: var(--wy-dropdown-menu-bg);
            border: 1px solid var(--md-sys-color-outline-variant, #D7D3C8);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            z-index: 100;
            overflow: hidden;
            max-height: 240px;
            overflow-y: auto;
            margin-top: var(--spacing-sm, 8px);
        }
        
        .item {
            position: relative;
            overflow: hidden;
            padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--wy-dropdown-text-color);
            cursor: pointer;
            transition: background-color var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        /* State layer for menu items */
        .item::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }
        
        .item:hover::before,
        .item.focused::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }
        
        .item.selected {
            color: var(--md-sys-color-primary, #282828);
            font-weight: 600;
            background-color: var(--md-sys-color-primary-container, #E8F5E9);
        }
        
        .item.selected::before {
            background-color: var(--md-sys-color-primary, #282828);
        }
        
        .no-results {
            padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface-variant, #49454E);
            opacity: 0.6;
            font-style: italic;
            text-align: center;
        }
        
        /* Scrollbar styling */
        .dropdown::-webkit-scrollbar {
            width: 8px;
        }
        
        .dropdown::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .dropdown::-webkit-scrollbar-thumb {
            background: var(--md-sys-color-outline-variant, #D7D3C8);
            border-radius: var(--radius-1);
        }
        
        .dropdown::-webkit-scrollbar-thumb:hover {
            background: var(--md-sys-color-outline, #2d4e3c);
        }
    `);
customElements.define("wy-dropdown", WyDropdown);

// components/ui/wy-info-panel.js
var WyInfoPanel = class extends i4 {
  constructor() {
    super();
    this.content = "";
    this.variant = "default";
    this.heading = "";
  }
  render() {
    const panelClass = this.variant === "compact" ? "panel compact" : "panel";
    return b2`
            <div class="${panelClass}">
                ${this.heading ? b2`<h3 class="panel-heading">${this.heading}</h3>` : ""}
                ${this.content ? b2`<p>${this.content}</p>` : b2`<slot></slot>`}
            </div>
        `;
  }
};
__publicField(WyInfoPanel, "properties", {
  content: { type: String },
  variant: { type: String },
  heading: { type: String }
});
__publicField(WyInfoPanel, "styles", i`
        /* Note: DM Sans font should be loaded in consuming page <head> */
        
        :host {
            display: block;
            /* CSS custom properties for theming - can be overridden by parent component */
            --wy-info-panel-bg: var(--md-sys-color-background, #FDFBF7);
            --wy-info-panel-border: var(--md-sys-color-surface-container-highest, #D7D3C8);
            --wy-info-panel-text-color: #52525B;
            --wy-info-panel-compact-bg: var(--md-sys-color-secondary-container, #E8DDD7);
            --wy-info-panel-compact-border: var(--md-sys-color-outline-variant, #DDD);
            --wy-info-panel-padding: var(--spacing-lg, 24px);
            --wy-info-panel-compact-padding: var(--spacing-md, 16px);
            --wy-info-panel-font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
        }
        
        .panel {
            background-color: var(--wy-info-panel-bg);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--wy-info-panel-padding);
            color: var(--wy-info-panel-text-color);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: var(--wy-info-panel-font-size);
            line-height: 1.6;
            transition: background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        .panel p {
            margin: 0;
        }
        
        .panel p + p {
            margin-top: var(--spacing-md, 16px);
        }
        
        .panel.compact {
            padding: var(--wy-info-panel-compact-padding);
            background-color: var(--wy-info-panel-compact-bg);
        }
        
        .panel-heading {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: var(--md-sys-typescale-title-medium-size, 1rem);
            color: var(--md-sys-color-on-surface);
            margin: 0;
            font-weight: 500;
        }
        
    /* Support for slotted content */
    ::slotted(*) {
        color: var(--wy-info-panel-text-color);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
    }
    
    ::slotted(p) {
        margin: 0;
    }
    
    ::slotted(p + p) {
        margin-top: var(--spacing-md, 16px);
    }
    `);
customElements.define("wy-info-panel", WyInfoPanel);

// components/ui/wy-option-toggle.js
var WyOptionToggle = class extends i4 {
  constructor() {
    super();
    this.options = null;
    this.labels = null;
    this.valueDescriptions = null;
    this.value = "";
    this.checked = false;
    this.label = "";
    this.description = "";
    this.disabled = false;
    this.variant = "segmented";
    this.size = "default";
    this.showSelectedValueText = false;
    this.ariaLabel = "";
  }
  willUpdate(changedProperties) {
    if (!this._hasValidOptions()) {
      this.checked = false;
      return;
    }
    if (changedProperties.has("value") || changedProperties.has("options")) {
      const nextChecked = this.value === this.options[1];
      if (this.checked !== nextChecked) {
        this.checked = nextChecked;
      }
    } else if (changedProperties.has("checked")) {
      const nextValue = this.checked ? this.options[1] : this.options[0];
      if (this.value !== nextValue) {
        this.value = nextValue;
      }
    }
  }
  _hasValidOptions() {
    return Array.isArray(this.options) && this.options.length === 2;
  }
  _getDisplayLabel(index) {
    if (Array.isArray(this.labels) && this.labels.length === 2 && this.labels[index]) {
      return this.labels[index];
    }
    if (this._hasValidOptions() && this.options[index] !== "") {
      return this.options[index];
    }
    return index === 0 ? "Off" : "On";
  }
  _getSelectedIndex() {
    return this.checked ? 1 : 0;
  }
  _getSelectedValue() {
    if (!this._hasValidOptions()) return "";
    return this.options[this._getSelectedIndex()] ?? "";
  }
  _getSelectedDescription() {
    const index = this._getSelectedIndex();
    if (Array.isArray(this.valueDescriptions) && this.valueDescriptions.length === 2 && this.valueDescriptions[index]) {
      return this.valueDescriptions[index];
    }
    const selectedValue = this._getSelectedValue();
    if (selectedValue) return selectedValue;
    return "No additional prompt instruction will be added.";
  }
  _getA11yLabel() {
    return this.ariaLabel || this.label || "Option toggle";
  }
  _select(index) {
    if (this.disabled || !this._hasValidOptions()) return;
    if (index !== 0 && index !== 1) return;
    const nextChecked = index === 1;
    const nextValue = this.options[index];
    const didChange = this.checked !== nextChecked || this.value !== nextValue;
    this.checked = nextChecked;
    this.value = nextValue;
    if (didChange) {
      this.dispatchEvent(new CustomEvent("change", {
        detail: { checked: this.checked, value: this.value },
        bubbles: true,
        composed: true
      }));
    }
  }
  _handleKeyDown(event, index) {
    if (this.disabled) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      this._select(1);
      this.renderRoot.querySelector('[data-index="1"]')?.focus();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this._select(0);
      this.renderRoot.querySelector('[data-index="0"]')?.focus();
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this._select(index);
    }
  }
  _handleSwitchKeyDown(event) {
    if (this.disabled) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      this._select(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this._select(0);
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this._select(this.checked ? 0 : 1);
    }
  }
  render() {
    const hasValidOptions = this._hasValidOptions();
    const selectedIndex = this._getSelectedIndex();
    const ariaLabel = this._getA11yLabel();
    const showSelectedValueText = this.showSelectedValueText && hasValidOptions;
    return b2`
            ${this.variant === "switch" ? b2`
                <div class="switch-row">
                    <div class="switch-copy">
                        ${this.label ? b2`<p class="label">${this.label}</p>` : ""}
                        ${this.description ? b2`<p class="description">${this.description}</p>` : ""}
                    </div>
                    <div class="switch-control">
                        <span class="switch-state">${this._getDisplayLabel(selectedIndex)}</span>
                        <button
                            type="button"
                            class="switch-button ${this.checked ? "checked" : ""}"
                            role="switch"
                            aria-checked="${this.checked}"
                            aria-label="${ariaLabel}"
                            ?disabled="${this.disabled || !hasValidOptions}"
                            @click="${() => this._select(this.checked ? 0 : 1)}"
                            @keydown="${(event) => this._handleSwitchKeyDown(event)}"
                        >
                            <span class="switch-thumb"></span>
                        </button>
                    </div>
                </div>
            ` : b2`
                ${this.label ? b2`<p class="label">${this.label}</p>` : ""}
                ${this.description ? b2`<p class="description">${this.description}</p>` : ""}
                <div class="group" role="group" aria-label="${ariaLabel}">
                    ${[0, 1].map((index) => b2`
                        <button
                            type="button"
                            class="option ${selectedIndex === index ? "selected" : ""}"
                            data-index="${index}"
                            aria-pressed="${selectedIndex === index}"
                            tabindex="${selectedIndex === index ? "0" : "-1"}"
                            ?disabled="${this.disabled || !hasValidOptions}"
                            @click="${() => this._select(index)}"
                            @keydown="${(event) => this._handleKeyDown(event, index)}"
                        >
                            ${this._getDisplayLabel(index)}
                        </button>
                    `)}
                </div>
            `}
            ${showSelectedValueText ? b2`
                <p class="selected-value-text">${this._getSelectedDescription()}</p>
            ` : ""}
        `;
  }
};
__publicField(WyOptionToggle, "properties", {
  options: { type: Array },
  labels: { type: Array },
  valueDescriptions: { type: Array },
  value: { type: String },
  checked: { type: Boolean, reflect: true },
  label: { type: String },
  description: { type: String },
  disabled: { type: Boolean, reflect: true },
  variant: { type: String, reflect: true },
  size: { type: String, reflect: true },
  showSelectedValueText: { type: Boolean, attribute: "show-selected-value-text" },
  ariaLabel: { type: String, attribute: "aria-label" }
});
__publicField(WyOptionToggle, "styles", i`
        :host {
            display: block;
            width: 100%;
        }

        .label {
            margin: 0 0 var(--spacing-md, 16px) 0;
            color: var(--md-sys-color-primary, #282828);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }

        .description {
            margin: 0 0 var(--spacing-sm, 8px) 0;
            max-width: 36rem;
            color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 70%, transparent);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
            font-weight: 400;
            line-height: 1.8;
        }

        .group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-xxs, 2px);
            padding: var(--spacing-xxs, 2px);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--md-sys-color-surface-container-high, #EBE5DE);
        }

        .option {
            position: relative;
            overflow: hidden;
            border: 0;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            min-height: 34px;
            padding: var(--spacing-xs, 4px) var(--spacing-md, 16px);
            background: transparent;
            color: color-mix(in srgb, var(--md-sys-color-on-surface-variant, #5E6E66) 84%, transparent);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
            font-weight: 600;
            line-height: 1.2;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            transition:
                background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .option::after {
            content: '';
            position: absolute;
            inset: 0;
            background: currentColor;
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .option:hover::after {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .option.selected {
            background: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFFFFF);
        }

        .option:focus-visible {
            outline: 2px solid var(--md-sys-color-primary, #282828);
            outline-offset: 1px;
        }

        :host([disabled]) .group {
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
        }

        :host([disabled]) .option {
            cursor: not-allowed;
        }

        .switch-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: var(--spacing-md, 16px);
            min-height: 38px;
        }

        .switch-copy {
            min-width: 0;
        }

        .switch-copy .label {
            margin-bottom: var(--spacing-xs, 4px);
        }

        .switch-copy .description {
            margin-bottom: 0;
        }

        .switch-control {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            justify-self: end;
        }

        .switch-state {
            min-width: 2.5rem;
            text-align: right;
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.625rem;
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--md-sys-color-primary, #282828);
            transition: color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            user-select: none;
        }

        .switch-button {
            position: relative;
            overflow: hidden;
            border: 0;
            padding: 0;
            flex: 0 0 auto;
            width: 52px;
            height: 30px;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--wy-option-toggle-off-bg, #E8E4D8);
            cursor: pointer;
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        :host([size='compact']) .switch-button {
            width: 52px;
            height: 30px;
        }

        .switch-button.checked {
            background: var(--md-sys-color-primary, #282828);
        }

        .switch-button::after {
            content: '';
            position: absolute;
            inset: 0;
            background: currentColor;
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .switch-button:hover::after {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .switch-button:focus-visible {
            outline: 2px solid var(--md-sys-color-primary, #282828);
            outline-offset: 2px;
        }

        .switch-thumb {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 24px;
            height: 24px;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--md-sys-color-primary, #282828);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        :host([size='compact']) .switch-thumb {
            top: 3px;
            left: 3px;
            width: 24px;
            height: 24px;
        }

        .switch-button.checked .switch-thumb {
            transform: translateX(22px);
            background: var(--md-sys-color-surface, #F5F2EA);
        }

        :host([size='compact']) .switch-button.checked .switch-thumb {
            transform: translateX(22px);
        }

        :host([size='compact']) .switch-state {
            font-size: 0.5625rem;
            letter-spacing: 0.12em;
        }

        .selected-value-text {
            margin: var(--spacing-sm, 8px) 0 0 0;
            color: color-mix(in srgb, var(--md-sys-color-on-surface, #121714) 86%, transparent);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: var(--md-sys-typescale-body-medium-size, 1rem);
            font-weight: 400;
            line-height: 1.7;
        }

        :host([size='compact']) .selected-value-text {
            margin-top: var(--spacing-xs, 4px);
            font-size: 0.8125rem;
            line-height: 1.35;
        }

        :host([disabled]) {
            opacity: 0.4;
            filter: grayscale(1);
        }

        :host([disabled]) .switch-button {
            cursor: not-allowed;
            background: var(--wy-option-toggle-disabled-bg, #D1CDC0);
        }

        @media (max-width: 520px) {
            .switch-row {
                grid-template-columns: 1fr;
                align-items: start;
            }

            .switch-control {
                justify-self: start;
            }

            .switch-state {
                text-align: left;
            }
        }
    `);
customElements.define("wy-option-toggle", WyOptionToggle);

// components/ui/wy-image-upload.js
var WyImageUpload = class extends i4 {
  constructor() {
    super();
    this.value = "";
    this.accept = "image/*";
    this.maxSize = 5242880;
    this.label = "Background Texture";
    this.compact = false;
    this._isDragging = false;
  }
  _handleDragOver(e9) {
    e9.preventDefault();
    this._isDragging = true;
  }
  _handleDragLeave(e9) {
    e9.preventDefault();
    this._isDragging = false;
  }
  _handleDrop(e9) {
    e9.preventDefault();
    this._isDragging = false;
    const files = e9.dataTransfer?.files;
    if (files && files.length > 0) {
      this._handleFile(files[0]);
    }
  }
  _handleFileSelect(e9) {
    const files = e9.target.files;
    if (files && files.length > 0) {
      this._handleFile(files[0]);
    }
  }
  _handleFile(file) {
    if (!file.type.startsWith("image/")) {
      this.dispatchEvent(new CustomEvent("error", {
        detail: { message: "Please select an image file" },
        bubbles: true,
        composed: true
      }));
      return;
    }
    if (file.size > this.maxSize) {
      const maxSizeMB = (this.maxSize / 1048576).toFixed(1);
      this.dispatchEvent(new CustomEvent("error", {
        detail: { message: `File size must be less than ${maxSizeMB}MB` },
        bubbles: true,
        composed: true
      }));
      return;
    }
    this.dispatchEvent(new CustomEvent("change", {
      detail: { file },
      bubbles: true,
      composed: true
    }));
  }
  _handleRemove(e9) {
    e9.stopPropagation();
    this.value = "";
    this.dispatchEvent(new CustomEvent("remove", {
      detail: {},
      bubbles: true,
      composed: true
    }));
  }
  _handleClick() {
    if (!this.value) {
      this.shadowRoot.querySelector('input[type="file"]').click();
    }
  }
  render() {
    const hasImage = !!this.value;
    return b2`
            ${this.label ? b2`<div class="label">${this.label}</div>` : ""}
            <div 
                class="upload-zone ${this.compact ? "compact" : ""} ${this._isDragging ? "dragging" : ""} ${hasImage ? "has-image" : ""}"
                @dragover="${this._handleDragOver}"
                @dragleave="${this._handleDragLeave}"
                @drop="${this._handleDrop}"
                @click="${this._handleClick}"
            >
                ${hasImage ? b2`
                    <div class="image-preview">
                        <img src="${this.value}" alt="Preview" class="preview-image">
                        <button 
                            class="remove-button" 
                            @click="${this._handleRemove}"
                            aria-label="Remove image"
                        >
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                ` : this.compact ? b2`
                    <div class="compact-empty">
                        <div class="icon-container">
                            <span class="material-symbols-outlined">cloud_upload</span>
                        </div>
                        <div>
                            <div class="upload-text">Upload prompt image</div>
                            <div class="upload-hint">PNG, JPG, GIF up to ${(this.maxSize / 1048576).toFixed(1)}MB</div>
                        </div>
                    </div>
                ` : b2`
                    <div class="icon-container">
                        <span class="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <div class="upload-text">Click to upload or drag and drop</div>
                    <div class="upload-hint">PNG, JPG, GIF up to ${(this.maxSize / 1048576).toFixed(1)}MB</div>
                `}
                <input 
                    type="file" 
                    accept="${this.accept}"
                    @change="${this._handleFileSelect}"
                >
            </div>
        `;
  }
};
__publicField(WyImageUpload, "properties", {
  value: { type: String },
  accept: { type: String },
  maxSize: { type: Number, attribute: "max-size" },
  label: { type: String },
  compact: { type: Boolean },
  _isDragging: { type: Boolean, state: true }
});
__publicField(WyImageUpload, "styles", i`
        :host {
            display: block;
            width: 100%;
        }

        .label {
            font-family: var(--font-display, 'Playfair Display', serif);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--md-sys-color-text-heading, #121714);
            margin-bottom: var(--spacing-sm, 8px);
            display: block;
        }

        .upload-zone {
            position: relative;
            border: 2px dashed color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--spacing-2xl, 48px) var(--spacing-xl, 32px);
            text-align: center;
            cursor: pointer;
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            background-color: transparent;
        }

        .upload-zone:hover {
            background-color: var(--md-sys-color-surface, #FDFBF7);
            border-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 40%, transparent);
        }

        .upload-zone.dragging {
            border-color: var(--md-sys-color-primary, #282828);
            border-style: solid;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
        }

        .upload-zone.has-image {
            padding: 0;
            border-style: solid;
            border-color: var(--md-sys-color-outline-variant, #DDD);
            overflow: hidden;
        }

        .upload-zone.compact {
            min-height: 0;
            padding: var(--spacing-md, 16px);
            text-align: left;
        }

        .icon-container {
            width: 48px;
            height: 48px;
            margin: 0 auto var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 24px;
            color: var(--md-sys-color-primary, #282828);
        }

        .upload-text {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
            margin-bottom: var(--spacing-xs, 4px);
        }

        .upload-hint {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .image-preview {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .remove-button {
            position: absolute;
            top: var(--spacing-sm, 8px);
            right: var(--spacing-sm, 8px);
            width: 32px;
            height: 32px;
            background-color: var(--md-sys-color-error, #B3261E);
            border: none;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .image-preview:hover .remove-button {
            opacity: 1;
        }

        .remove-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-error, #B3261E) 90%, black);
        }

        .remove-button .material-symbols-outlined {
            font-size: 18px;
            color: white;
        }

        .compact-empty {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
        }

        .compact-empty .icon-container {
            flex: 0 0 auto;
            width: 36px;
            height: 36px;
            margin: 0;
        }

        input[type="file"] {
            display: none;
        }
    `);
customElements.define("wy-image-upload", WyImageUpload);

// components/ui/wy-code-textarea.js
var WyCodeTextarea = class extends i4 {
  constructor() {
    super();
    this.value = "";
    this.variables = [];
    this.placeholder = "";
    this.rows = 8;
    this.label = "Template";
    this.maxLength = 0;
  }
  _handleInput(e9) {
    this.value = e9.target.value;
    this.dispatchEvent(new CustomEvent("value-input", {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
  _handleChange(e9) {
    this.value = e9.target.value;
    this.dispatchEvent(new CustomEvent("value-change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
  updated(changedProperties) {
    if (changedProperties.has("value")) {
      const textarea = this.shadowRoot.querySelector("textarea");
      const isFocused = this.shadowRoot.activeElement === textarea;
      if (textarea && !isFocused && textarea.value !== this.value) {
        textarea.value = this.value;
      }
    }
  }
  _insertVariable(variableName) {
    const textarea = this.shadowRoot.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = this.value.substring(0, start);
    const textAfter = this.value.substring(end);
    const insertion = `{{${variableName}}}`;
    this.value = textBefore + insertion + textAfter;
    this.dispatchEvent(new CustomEvent("value-input", {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.updateComplete.then(() => {
      const newPosition = start + insertion.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    });
  }
  render() {
    const charCount = this.value.length;
    const showCharCount = this.maxLength > 0;
    const isOverLimit = showCharCount && charCount > this.maxLength;
    return b2`
            ${this.label ? b2`<div class="label">${this.label}</div>` : ""}
            <textarea
                placeholder="${this.placeholder}"
                rows="${this.rows}"
                maxlength="${this.maxLength > 0 ? this.maxLength : ""}"
                @input="${this._handleInput}"
                @change="${this._handleChange}"
            ></textarea>
            ${this.variables && this.variables.length > 0 ? b2`
                <div class="variable-chips">
                    ${this.variables.map((varName) => b2`
                        <button 
                            class="variable-chip"
                            @click="${() => this._insertVariable(varName)}"
                            type="button"
                        >
                            {{${varName}}}
                        </button>
                    `)}
                </div>
            ` : ""}
            ${showCharCount ? b2`
                <div class="char-count ${isOverLimit ? "over-limit" : ""}">
                    ${charCount}${this.maxLength > 0 ? ` / ${this.maxLength}` : ""} characters
                </div>
            ` : ""}
        `;
  }
};
__publicField(WyCodeTextarea, "properties", {
  value: { type: String },
  variables: { type: Array },
  placeholder: { type: String },
  rows: { type: Number },
  label: { type: String },
  maxLength: { type: Number, attribute: "max-length" }
});
__publicField(WyCodeTextarea, "styles", i`
        :host {
            display: block;
            width: 100%;
        }

        .label {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-bottom: var(--spacing-sm, 8px);
            display: block;
        }

        textarea {
            width: 100%;
            box-sizing: border-box;
            padding: var(--spacing-md, 16px);
            border-radius: var(--radius-2, 10px);
            border: 0;
            background-color: var(--field-bg, transparent);
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface, #121714);
            resize: vertical;
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
            transition: box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        textarea:focus {
            outline: none;
            box-shadow:
                inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary, #282828) 24%, transparent),
                0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
        }

        textarea::placeholder {
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            opacity: 0.6;
        }

        .variable-chips {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-xs, 4px);
            margin-top: var(--spacing-sm, 8px);
        }

        .variable-chip {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xxs, 2px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.75rem;
            color: var(--md-sys-color-primary, #282828);
            cursor: pointer;
            border: 0;
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary, #282828) 18%, transparent);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variable-chip:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary, #282828) 24%, transparent);
        }

        .char-count {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            text-align: right;
            margin-top: var(--spacing-xs, 4px);
        }

        .char-count.over-limit {
            color: var(--md-sys-color-error, #FF0101);
        }
    `);
customElements.define("wy-code-textarea", WyCodeTextarea);

// components/ui/wy-variable-editor.js
var WyVariableEditor = class extends i4 {
  constructor() {
    super();
    this.variables = [];
    this.allowReorder = true;
  }
  _emitChange() {
    this.dispatchEvent(new CustomEvent("change", {
      detail: { variables: [...this.variables] },
      bubbles: true,
      composed: true
    }));
  }
  _updateVariable(index, field, value) {
    const updated = [...this.variables];
    updated[index] = { ...updated[index], [field]: value };
    this.variables = updated;
    this._emitChange();
  }
  _removeVariable(index) {
    this.variables = this.variables.filter((_3, i6) => i6 !== index);
    this._emitChange();
  }
  _addVariable() {
    this.variables = [
      ...this.variables,
      {
        name: "",
        label: "",
        placeholder: "",
        inputType: "text"
      }
    ];
    this._emitChange();
  }
  render() {
    return b2`
            <div class="variables-list">
                ${this.variables.map((variable, index) => b2`
                    <div class="variable-item">
                        ${this.allowReorder ? b2`
                            <div class="drag-handle">
                                <span class="material-symbols-outlined">drag_indicator</span>
                            </div>
                        ` : ""}
                        <div class="variable-fields">
                            <div class="field">
                                <label class="field-label">
                                    <span class="name-prefix">{{</span>Name<span class="name-prefix">}}</span>
                                </label>
                                <input
                                    type="text"
                                    .value="${variable.name || ""}"
                                    @input="${(e9) => this._updateVariable(index, "name", e9.target.value)}"
                                    placeholder="variable-name"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Label</label>
                                <input
                                    type="text"
                                    .value="${variable.label || ""}"
                                    @input="${(e9) => this._updateVariable(index, "label", e9.target.value)}"
                                    placeholder="Display Label"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Placeholder</label>
                                <input
                                    type="text"
                                    .value="${variable.placeholder || ""}"
                                    @input="${(e9) => this._updateVariable(index, "placeholder", e9.target.value)}"
                                    placeholder="Helper text"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Input Type</label>
                                <select
                                    .value="${variable.inputType || "text"}"
                                    @change="${(e9) => this._updateVariable(index, "inputType", e9.target.value)}"
                                >
                                    <option value="text">Text</option>
                                    <option value="toggle">Toggle</option>
                                </select>
                            </div>
                            ${variable.inputType === "toggle" ? b2`
                                <div class="toggle-options">
                                    <div class="field">
                                        <label class="field-label">Off Value</label>
                                        <input
                                            type="text"
                                            .value="${variable.options?.[0] || ""}"
                                            @input="${(e9) => {
      const newOptions = [...variable.options || ["", ""]];
      newOptions[0] = e9.target.value;
      this._updateVariable(index, "options", newOptions);
    }}"
                                            placeholder="Value when off"
                                        >
                                    </div>
                                    <div class="field">
                                        <label class="field-label">On Value</label>
                                        <input
                                            type="text"
                                            .value="${variable.options?.[1] || ""}"
                                            @input="${(e9) => {
      const newOptions = [...variable.options || ["", ""]];
      newOptions[1] = e9.target.value;
      this._updateVariable(index, "options", newOptions);
    }}"
                                            placeholder="Value when on"
                                        >
                                    </div>
                                </div>
                            ` : ""}
                        </div>
                        <div class="remove-button">
                            <button 
                                class="icon-button"
                                @click="${() => this._removeVariable(index)}"
                                aria-label="Remove variable"
                            >
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>
                `)}
            </div>
            <button class="add-button" @click="${this._addVariable}">
                <span class="material-symbols-outlined">add</span>
                Add Variable
            </button>
        `;
  }
};
__publicField(WyVariableEditor, "properties", {
  variables: { type: Array },
  allowReorder: { type: Boolean, attribute: "allow-reorder" }
});
__publicField(WyVariableEditor, "styles", i`
        :host {
            display: block;
            width: 100%;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
            font-weight: normal;
            font-style: normal;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga';
        }

        .variables-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .variable-item {
            display: flex;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .drag-handle {
            display: flex;
            align-items: center;
            cursor: grab;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            padding: var(--spacing-xs, 4px);
        }

        .drag-handle:active {
            cursor: grabbing;
        }

        .variable-fields {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-sm, 8px);
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xxs, 2px);
        }

        .field.full-width {
            grid-column: 1 / -1;
        }

        .field-label {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        input, select {
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface, #121714);
            background-color: var(--md-sys-color-surface, #FDFBF7);
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        input:focus, select:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
        }

        input[readonly] {
            background-color: color-mix(in srgb, var(--md-sys-color-surface-variant, #F5F2EA) 50%, transparent);
            cursor: not-allowed;
        }

        .name-prefix {
            display: inline-block;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-right: var(--spacing-xxs, 2px);
        }

        .toggle-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-sm, 8px);
            grid-column: 1 / -1;
        }

        .remove-button {
            display: flex;
            align-items: flex-start;
            padding-top: 20px;
        }

        .icon-button {
            background: none;
            border: none;
            padding: var(--spacing-xs, 4px);
            cursor: pointer;
            color: var(--md-sys-color-error, #FF0101);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .icon-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-error, #FF0101) 10%, transparent);
        }

        .add-button {
            margin-top: var(--spacing-md, 16px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: transparent;
            border: 1px solid var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
        }
    `);
customElements.define("wy-variable-editor", WyVariableEditor);

// components/ui/wy-reference-image-editor.js
var WyReferenceImageEditor = class extends i4 {
  constructor() {
    super();
    this.referenceImages = [];
  }
  _emitChange() {
    this.dispatchEvent(new CustomEvent("change", {
      detail: { referenceImages: [...this.referenceImages] },
      bubbles: true,
      composed: true
    }));
  }
  _updateItem(index, field, value) {
    const updated = [...this.referenceImages];
    updated[index] = { ...updated[index], [field]: value };
    this.referenceImages = updated;
    this._emitChange();
  }
  _removeItem(index) {
    const item = this.referenceImages[index];
    if (item?.path) {
      this.dispatchEvent(new CustomEvent("reference-image-remove", {
        detail: { index, path: item.path },
        bubbles: true,
        composed: true
      }));
    }
    this.referenceImages = this.referenceImages.filter((_3, i6) => i6 !== index);
    this._emitChange();
  }
  _addItem() {
    this.referenceImages = [
      ...this.referenceImages,
      { variable: "", label: "", path: "", instructions: "" }
    ];
    this._emitChange();
  }
  _handleImageChange(e9, index) {
    e9.stopPropagation();
    const { file } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, index },
      bubbles: true,
      composed: true
    }));
  }
  _handleImageRemove(index) {
    const item = this.referenceImages[index];
    if (item?.path) {
      this.dispatchEvent(new CustomEvent("reference-image-remove", {
        detail: { index, path: item.path },
        bubbles: true,
        composed: true
      }));
    }
    this._updateItem(index, "path", "");
  }
  _isValidVariable(name) {
    return /^[a-zA-Z0-9_]*$/.test(name);
  }
  render() {
    return b2`
            <div class="refs-list">
                ${this.referenceImages.map((ref, index) => {
      const isInvalid = ref.variable && !this._isValidVariable(ref.variable);
      const hint = ref.variable && this._isValidVariable(ref.variable) ? `{{${ref.variable}}}` : "{{variable_name}}";
      return b2`
                        <div class="ref-item">
                            <div class="ref-item-header">
                                <div class="ref-fields">
                                    <div class="field">
                                        <label class="field-label">Variable Name</label>
                                        <input
                                            type="text"
                                            class="${isInvalid ? "invalid" : ""}"
                                            .value="${ref.variable || ""}"
                                            @input="${(e9) => this._updateItem(index, "variable", e9.target.value)}"
                                            placeholder="style_ref"
                                        >
                                        ${isInvalid ? b2`
                                            <span class="validation-error">Letters, numbers, and underscores only</span>
                                        ` : ""}
                                    </div>
                                    <div class="field">
                                        <label class="field-label">Label</label>
                                        <input
                                            type="text"
                                            .value="${ref.label || ""}"
                                            @input="${(e9) => this._updateItem(index, "label", e9.target.value)}"
                                            placeholder="Style Reference"
                                        >
                                    </div>
                                    <div class="field" style="grid-column: 1 / -1;">
                                        <span class="placeholder-hint ${ref.variable && this._isValidVariable(ref.variable) ? "has-value" : ""}">
                                            Use ${hint} in your template
                                        </span>
                                    </div>
                                    <div class="field" style="grid-column: 1 / -1;">
                                        <label class="field-label">Copy Instructions</label>
                                        <textarea
                                            .value="${ref.instructions || ""}"
                                            @input="${(e9) => this._updateItem(index, "instructions", e9.target.value)}"
                                            placeholder="Follow the composition in the provided reference image, which is available at [URL]"
                                        ></textarea>
                                        <span class="placeholder-hint">
                                            Optional. Use [URL] or {{url}} where the image URL should appear.
                                        </span>
                                    </div>
                                </div>
                                <div class="remove-button">
                                    <button
                                        class="icon-button"
                                        @click="${() => this._removeItem(index)}"
                                        aria-label="Remove reference image"
                                    >
                                        <span class="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>
                            <div class="upload-section">
                                <wy-image-upload
                                    label="${ref.label || "Reference Image"}"
                                    .value="${ref.path || ""}"
                                    @change="${(e9) => this._handleImageChange(e9, index)}"
                                    @remove="${() => this._handleImageRemove(index)}"
                                ></wy-image-upload>
                            </div>
                        </div>
                    `;
    })}
            </div>
            <button class="add-button" @click="${this._addItem}">
                <span class="material-symbols-outlined">add</span>
                Add Reference Image
            </button>
        `;
  }
};
__publicField(WyReferenceImageEditor, "properties", {
  referenceImages: { type: Array }
});
__publicField(WyReferenceImageEditor, "styles", i`
        :host {
            display: block;
            width: 100%;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
            font-weight: normal;
            font-style: normal;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga';
        }

        .refs-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .ref-item {
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .ref-item-header {
            display: flex;
            gap: var(--spacing-sm, 8px);
            align-items: flex-start;
            margin-bottom: var(--spacing-sm, 8px);
        }

        .ref-fields {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-sm, 8px);
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xxs, 2px);
        }

        .field-label {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        input,
        textarea {
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface, #121714);
            background-color: var(--md-sys-color-surface, #FDFBF7);
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        textarea {
            min-height: 84px;
            resize: vertical;
            line-height: 1.5;
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
        }

        input.invalid {
            border-color: var(--md-sys-color-error, #FF0101);
        }

        .placeholder-hint {
            margin-top: var(--spacing-xs, 4px);
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .placeholder-hint.has-value {
            color: var(--md-sys-color-primary, #282828);
        }

        .validation-error {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-error, #FF0101);
            margin-top: var(--spacing-xxs, 2px);
        }

        .remove-button {
            display: flex;
            align-items: flex-start;
            flex-shrink: 0;
        }

        .icon-button {
            background: none;
            border: none;
            padding: var(--spacing-xs, 4px);
            cursor: pointer;
            color: var(--md-sys-color-error, #FF0101);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .icon-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-error, #FF0101) 10%, transparent);
        }

        .upload-section {
            margin-top: var(--spacing-sm, 8px);
        }

        .add-button {
            margin-top: var(--spacing-md, 16px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: transparent;
            border: 1px solid var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
        }
    `);
customElements.define("wy-reference-image-editor", WyReferenceImageEditor);

// components/ui/wy-variation-editor.js
var WyVariationEditor = class extends i4 {
  constructor() {
    super();
    this.variations = [];
    this.allowReorder = true;
    this._expandedIndex = -1;
    this._expandedStepsByVariation = {};
  }
  _handleToggle(index) {
    this._expandedIndex = this._expandedIndex === index ? -1 : index;
    this._notifyVariationExpand();
  }
  expandVariation(index) {
    if (index < 0 || index >= this.variations.length) return;
    this._expandedIndex = index;
    this._notifyVariationExpand();
    this.requestUpdate();
  }
  getSectionElement(variationIndex, section = "variation") {
    const card = this.shadowRoot?.querySelector(`.variation-card[data-variation-index="${variationIndex}"]`);
    if (!card || section === "variation") return card;
    return card.querySelector(`[data-vsection="${section}"]`) || card;
  }
  _notifyVariationExpand() {
    this.dispatchEvent(new CustomEvent("variation-expand", {
      detail: { index: this._expandedIndex },
      bubbles: true,
      composed: true
    }));
  }
  _handleFieldChange(index, field, value) {
    const updatedVariations = [...this.variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    this._notifyChange(updatedVariations);
  }
  _handleModeChange(index, newMode) {
    const variation = this.variations[index];
    const updatedVariations = [...this.variations];
    if (newMode === "multi") {
      updatedVariations[index] = {
        ...variation,
        steps: variation.steps || [{
          id: "step-1",
          name: "Step 1",
          instructions: "",
          template: variation.template || "",
          variables: variation.variables || []
        }]
      };
    } else {
      const firstStep = variation.steps?.[0];
      updatedVariations[index] = {
        ...variation,
        template: firstStep?.template || variation.template || "",
        variables: firstStep?.variables || variation.variables || [],
        steps: void 0
      };
    }
    this._notifyChange(updatedVariations);
  }
  _handleStepChange(variationIndex, e9) {
    const { index: stepIndex, step } = e9.detail;
    const updatedVariations = [...this.variations];
    const variation = updatedVariations[variationIndex];
    if (variation.steps) {
      variation.steps[stepIndex] = step;
      this._notifyChange(updatedVariations);
    }
  }
  _handleStepDelete(variationIndex, e9) {
    const { index: stepIndex } = e9.detail;
    const updatedVariations = [...this.variations];
    const variation = updatedVariations[variationIndex];
    if (variation.steps && variation.steps.length > 1) {
      variation.steps.splice(stepIndex, 1);
      this._notifyChange(updatedVariations);
    } else {
      this._notifyToast("Cannot delete the last step. Convert to template mode instead.", "warning");
    }
  }
  _handleStepMoveUp(variationIndex, e9) {
    const { index: stepIndex } = e9.detail;
    if (stepIndex === 0) return;
    const updatedVariations = [...this.variations];
    const steps = updatedVariations[variationIndex].steps;
    [steps[stepIndex - 1], steps[stepIndex]] = [steps[stepIndex], steps[stepIndex - 1]];
    this._notifyChange(updatedVariations);
  }
  _handleStepMoveDown(variationIndex, e9) {
    const { index: stepIndex } = e9.detail;
    const updatedVariations = [...this.variations];
    const steps = updatedVariations[variationIndex].steps;
    if (stepIndex === steps.length - 1) return;
    [steps[stepIndex], steps[stepIndex + 1]] = [steps[stepIndex + 1], steps[stepIndex]];
    this._notifyChange(updatedVariations);
  }
  _handleStepToggle(variationIndex, e9) {
    const { index: stepIndex } = e9.detail;
    const currentExpanded = this._expandedStepsByVariation[variationIndex] || [];
    const stepIndexInArray = currentExpanded.indexOf(stepIndex);
    if (stepIndexInArray > -1) {
      currentExpanded.splice(stepIndexInArray, 1);
    } else {
      currentExpanded.push(stepIndex);
    }
    this._expandedStepsByVariation = {
      ...this._expandedStepsByVariation,
      [variationIndex]: [...currentExpanded]
    };
    this.requestUpdate();
  }
  _handleAddStep(variationIndex) {
    const updatedVariations = [...this.variations];
    const variation = updatedVariations[variationIndex];
    if (!variation.steps) {
      variation.steps = [];
    }
    const newStepNumber = variation.steps.length + 1;
    variation.steps.push({
      id: `step-${newStepNumber}`,
      name: `Step ${newStepNumber}`,
      instructions: "",
      template: "",
      variables: []
    });
    this._notifyChange(updatedVariations);
  }
  _handleVariableChange(variationIndex, e9) {
    this._handleFieldChange(variationIndex, "variables", e9.detail.variables);
  }
  _handleTemplateChange(variationIndex, e9) {
    this._handleFieldChange(variationIndex, "template", e9.detail.value);
  }
  _handleImageChange(variationIndex, e9) {
    e9.stopPropagation();
    const { file } = e9.detail;
    this.dispatchEvent(new CustomEvent("image-upload", {
      detail: { file, target: "variation", variationIndex, variationId: this.variations[variationIndex]?.id },
      bubbles: true,
      composed: true
    }));
  }
  _handleImageRemove(variationIndex) {
    this._handleFieldChange(variationIndex, "image", "");
    this.dispatchEvent(new CustomEvent("image-remove", {
      detail: { target: "variation", variationIndex, variationId: this.variations[variationIndex]?.id },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageChange(variationIndex, e9) {
    e9.stopPropagation();
    const { file, index } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, index, variationIndex, variationId: this.variations[variationIndex]?.id },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageRemove(variationIndex, e9) {
    e9.stopPropagation();
    const { index, path } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-remove", {
      detail: { index, path, variationIndex, variationId: this.variations[variationIndex]?.id },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageListChange(variationIndex, e9) {
    if (!Array.isArray(e9.detail?.referenceImages)) return;
    this._handleFieldChange(variationIndex, "referenceImages", e9.detail.referenceImages);
  }
  _handleMoveUp(index) {
    if (index === 0) return;
    const updatedVariations = [...this.variations];
    [updatedVariations[index - 1], updatedVariations[index]] = [updatedVariations[index], updatedVariations[index - 1]];
    this._notifyChange(updatedVariations);
  }
  _handleMoveDown(index) {
    if (index === this.variations.length - 1) return;
    const updatedVariations = [...this.variations];
    [updatedVariations[index], updatedVariations[index + 1]] = [updatedVariations[index + 1], updatedVariations[index]];
    this._notifyChange(updatedVariations);
  }
  _handleDelete(index) {
    if (this.variations.length === 1) {
      this._notifyToast("Cannot delete the last variation. Prompts must have at least one variation.", "warning");
      return;
    }
    const variation = this.variations[index];
    const confirmMessage = `Delete variation "${variation.name || "Unnamed"}"?

This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      const updatedVariations = this.variations.filter((_3, i6) => i6 !== index);
      this._notifyChange(updatedVariations);
      if (this._expandedIndex === index) {
        this._expandedIndex = -1;
      } else if (this._expandedIndex > index) {
        this._expandedIndex--;
      }
    }
  }
  _handleAddVariation() {
    const newNumber = this.variations.length + 1;
    const updatedVariations = [
      ...this.variations,
      {
        id: `variation-${newNumber}`,
        name: `Variation ${newNumber}`,
        description: "",
        image: "",
        template: "",
        variables: [],
        referenceImages: []
      }
    ];
    this._notifyChange(updatedVariations);
    this._expandedIndex = updatedVariations.length - 1;
  }
  _notifyChange(updatedVariations) {
    this.dispatchEvent(new CustomEvent("change", {
      detail: { variations: updatedVariations },
      bubbles: true,
      composed: true
    }));
  }
  _notifyToast(message, type = "info") {
    this.dispatchEvent(new CustomEvent("toast", {
      detail: { message, type },
      bubbles: true,
      composed: true
    }));
  }
  _renderVariation(variation, index) {
    const isExpanded = this._expandedIndex === index;
    const isFirst = index === 0;
    const isLast = index === this.variations.length - 1;
    const hasSteps = variation.steps && variation.steps.length > 0;
    const hasTemplate = variation.template || !hasSteps;
    const variationMode = hasSteps ? "multi" : "single";
    const variableNames = (variation.variables || []).map((v3) => v3.name);
    return b2`
            <div class="variation-card ${isExpanded ? "expanded" : ""}" data-variation-index="${index}">
                <!-- Header -->
                <div class="variation-header" @click="${() => this._handleToggle(index)}">
                    ${this.allowReorder ? b2`
                        <span class="material-symbols-outlined drag-handle">drag_indicator</span>
                    ` : ""}
                    <h3 class="variation-title">${variation.name || "Unnamed Variation"}</h3>
                    ${hasSteps ? b2`
                        <span class="variation-badge">Multi-Step</span>
                    ` : ""}
                    <span class="material-symbols-outlined collapse-icon">expand_more</span>
                </div>

                <!-- Content -->
                <div class="variation-content">
                    <div class="variation-content-inner">
                        <div class="variation-fields">
                            <!-- Variation Name -->
                            <wy-form-field label="Variation Name" required>
                                <input
                                    type="text"
                                    .value="${variation.name || ""}"
                                    @input="${(e9) => this._handleFieldChange(index, "name", e9.target.value)}"
                                    placeholder="e.g., Tina Barney Style Photo"
                                    @click="${(e9) => e9.stopPropagation()}"
                                >
                            </wy-form-field>

                            <!-- Variation ID -->
                            <wy-form-field 
                                label="Variation ID" 
                                description="Unique identifier (lowercase, no spaces)"
                            >
                                <input
                                    type="text"
                                    .value="${variation.id || ""}"
                                    @input="${(e9) => this._handleFieldChange(index, "id", e9.target.value)}"
                                    placeholder="e.g., tina-barney"
                                    @click="${(e9) => e9.stopPropagation()}"
                                >
                            </wy-form-field>

                            <!-- Variation Description -->
                            <wy-form-field label="Description" data-vsection="description">
                                <textarea
                                    rows="3"
                                    .value="${variation.description || ""}"
                                    @input="${(e9) => this._handleFieldChange(index, "description", e9.target.value)}"
                                    placeholder="Description shown in variation selector"
                                    @click="${(e9) => e9.stopPropagation()}"
                                ></textarea>
                            </wy-form-field>

                            <!-- Variation Instructions -->
                            <wy-form-field
                                data-vsection="instructions"
                                label="Instructions"
                                description="Optional usage notes shown with this variant. Supports lightweight Markdown such as **bold** and lists."
                            >
                                <textarea
                                    rows="4"
                                    .value="${variation.instructions || ""}"
                                    @input="${(e9) => this._handleFieldChange(index, "instructions", e9.target.value)}"
                                    placeholder="e.g., Upload with this variant:&#10;1. Your artwork&#10;2. The reference image"
                                    @click="${(e9) => e9.stopPropagation()}"
                                ></textarea>
                            </wy-form-field>

                            <div data-vsection="image" @click="${(e9) => e9.stopPropagation()}">
                                <wy-image-upload
                                    label="Variation Image"
                                    .value="${variation.image || ""}"
                                    @change="${(e9) => this._handleImageChange(index, e9)}"
                                    @remove="${() => this._handleImageRemove(index)}"
                                ></wy-image-upload>
                            </div>

                            <!-- Mode Toggle -->
                            <div class="mode-toggle" @click="${(e9) => e9.stopPropagation()}">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode-${index}" 
                                        value="single" 
                                        ?checked="${variationMode === "single"}"
                                        @change="${() => this._handleModeChange(index, "single")}"
                                    >
                                    Template
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode-${index}" 
                                        value="multi" 
                                        ?checked="${variationMode === "multi"}"
                                        @change="${() => this._handleModeChange(index, "multi")}"
                                    >
                                    Multi-Step
                                </label>
                            </div>

                            ${hasTemplate && !hasSteps ? b2`
                                <!-- Template Mode -->
                                <div class="section-divider"></div>
                                
                                <!-- Variables -->
                                <div class="field-group" data-vsection="variables">
                                    <label class="field-label">Variables</label>
                                    <p class="field-description">
                                        Define input fields for this variation
                                    </p>
                                    <wy-variable-editor
                                        .variables="${variation.variables || []}"
                                        @change="${(e9) => this._handleVariableChange(index, e9)}"
                                        @click="${(e9) => e9.stopPropagation()}"
                                    ></wy-variable-editor>
                                </div>

                                <!-- Reference Images -->
                                <div class="field-group" data-vsection="reference-images" @click="${(e9) => e9.stopPropagation()}">
                                    <label class="field-label">Reference Images</label>
                                    <p class="field-description">
                                        Upload images and reference them with {{variable_name}}. URLs are substituted when the prompt is copied.
                                    </p>
                                    <wy-reference-image-editor
                                        .referenceImages="${variation.referenceImages || []}"
                                        @change="${(e9) => this._handleRefImageListChange(index, e9)}"
                                        @reference-image-upload="${(e9) => this._handleRefImageChange(index, e9)}"
                                        @reference-image-remove="${(e9) => this._handleRefImageRemove(index, e9)}"
                                    ></wy-reference-image-editor>
                                </div>

                                <!-- Template -->
                                <div class="field-group" data-vsection="template">
                                    <label class="field-label">Template</label>
                                    <p class="field-description">
                                        Prompt template for this variation. Use {{variable-name}} for substitutions.
                                    </p>
                                    <wy-code-textarea
                                        .value="${variation.template || ""}"
                                        .variables="${variableNames}"
                                        placeholder="Enter your prompt template here..."
                                        rows="12"
                                        @value-input="${(e9) => this._handleTemplateChange(index, e9)}"
                                        @click="${(e9) => e9.stopPropagation()}"
                                    ></wy-code-textarea>
                                </div>
                            ` : ""}

                            ${hasSteps ? b2`
                                <!-- Multi-Step Mode -->
                                <div class="section-divider"></div>
                                
                                <div class="field-group" data-vsection="steps">
                                    <label class="field-label">Steps</label>
                                    <p class="field-description">
                                        Define the sequence of prompts for this variation
                                    </p>
                                    <div class="steps-section" @click="${(e9) => e9.stopPropagation()}">
                                        ${variation.steps.map((step, stepIndex) => {
      const expandedSteps = this._expandedStepsByVariation[index] || [];
      const isExpanded2 = expandedSteps.includes(stepIndex);
      return b2`
                                            <wy-step-editor
                                                .step="${step}"
                                                .index="${stepIndex}"
                                                .total="${variation.steps.length}"
                                                .expanded="${isExpanded2}"
                                                @step-change="${(e9) => this._handleStepChange(index, e9)}"
                                                @step-delete="${(e9) => this._handleStepDelete(index, e9)}"
                                                @step-move-up="${(e9) => this._handleStepMoveUp(index, e9)}"
                                                @step-move-down="${(e9) => this._handleStepMoveDown(index, e9)}"
                                                @step-toggle="${(e9) => this._handleStepToggle(index, e9)}"
                                            ></wy-step-editor>
                                        `;
    })}
                                        <button 
                                            class="add-step-button" 
                                            @click="${() => this._handleAddStep(index)}"
                                        >
                                            <span class="material-symbols-outlined">add</span>
                                            Add Step
                                        </button>
                                    </div>
                                </div>
                            ` : ""}
                        </div>

                        <!-- Variation Controls -->
                        <div class="variation-controls" @click="${(e9) => e9.stopPropagation()}">
                            ${this.allowReorder ? b2`
                                <button
                                    class="control-button"
                                    @click="${() => this._handleMoveUp(index)}"
                                    ?disabled="${isFirst}"
                                    title="Move variation up"
                                >
                                    <span class="material-symbols-outlined">arrow_upward</span>
                                    Move Up
                                </button>
                                <button
                                    class="control-button"
                                    @click="${() => this._handleMoveDown(index)}"
                                    ?disabled="${isLast}"
                                    title="Move variation down"
                                >
                                    <span class="material-symbols-outlined">arrow_downward</span>
                                    Move Down
                                </button>
                            ` : ""}
                            <button
                                class="control-button delete"
                                @click="${() => this._handleDelete(index)}"
                                ?disabled="${this.variations.length === 1}"
                                title="Delete variation"
                            >
                                <span class="material-symbols-outlined">delete</span>
                                Delete Variation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }
  render() {
    return b2`
            <div class="variations-list">
                ${this.variations.map(
      (variation, index) => this._renderVariation(variation, index)
    )}
            </div>
            <button class="add-variation-button" @click="${this._handleAddVariation}">
                <span class="material-symbols-outlined">add</span>
                Add Variation
            </button>
        `;
  }
};
__publicField(WyVariationEditor, "properties", {
  variations: { type: Array },
  allowReorder: { type: Boolean, attribute: "allow-reorder" },
  _expandedIndex: { type: Number, state: true },
  _expandedStepsByVariation: { type: Object, state: true }
});
__publicField(WyVariationEditor, "styles", i`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1');

        :host {
            display: block;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
        }

        .variations-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .variation-card {
            background-color: var(--field-bg, #FBF9F4);
            border-radius: var(--radius-2, 10px);
            border: 0;
            overflow: hidden;
            transition:
                box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .variation-card.expanded {
            box-shadow: 0 8px 22px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .variation-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            padding: 14px 16px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            user-select: none;
        }

        .variation-header::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .variation-header:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .drag-handle {
            flex-shrink: 0;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: grab;
        }

        .drag-handle:active {
            cursor: grabbing;
        }

        .variation-title {
            flex: 1;
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.0625rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .variation-badge {
            flex-shrink: 0;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--accent-terracotta, #C18A4D) 22%, transparent);
            color: color-mix(in srgb, var(--accent-rust, #C06F45) 78%, var(--ink, #1A1A1A));
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .collapse-icon {
            flex-shrink: 0;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variation-card.expanded .collapse-icon {
            transform: rotate(180deg);
        }

        .variation-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
        }

        .variation-card.expanded .variation-content {
            grid-template-rows: 1fr;
        }

        .variation-content-inner {
            overflow: hidden;
        }

        .variation-fields {
            padding: 4px var(--spacing-md, 16px) var(--spacing-md, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
        }

        .mode-toggle {
            display: inline-flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px);
            background-color: var(--paper-deep, #EEE8DD);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .mode-toggle label {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            padding: 0.5rem 1.1rem;
            cursor: pointer;
            user-select: none;
        }

        .mode-toggle input[type="radio"] {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }

        .mode-toggle label:has(input:checked) {
            background: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFF);
        }

        .steps-section {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .add-step-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-sm, 8px);
            background: transparent;
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 10%, transparent);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-step-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .add-step-button:hover {
            border-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
        }

        .add-step-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .variation-controls {
            display: flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 3.5%, transparent);
            box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .control-button {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background: color-mix(in srgb, var(--ink, #1A1A1A) 4%, transparent);
            border: 0;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .control-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .control-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .control-button:focus-visible {
            outline: 3px solid var(--md-sys-color-primary, #282828);
            outline-offset: 2px;
        }

        .control-button:disabled {
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
            cursor: not-allowed;
        }

        .control-button.delete {
            margin-left: auto;
            color: var(--md-sys-color-error, #BA1A1A);
        }

        .control-button.delete::before {
            background-color: var(--md-sys-color-error, #BA1A1A);
        }

        .control-button .material-symbols-outlined {
            font-size: 18px;
        }

        .add-variation-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-md, 16px);
            background: transparent;
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 10%, transparent);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            margin-top: var(--spacing-md, 16px);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-variation-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .add-variation-button:hover {
            border-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
        }

        .add-variation-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .add-variation-button .material-symbols-outlined {
            font-size: 24px;
        }

        .field-group {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);
        }

        .field-label {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .field-description {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-top: calc(-1 * var(--spacing-xs, 4px));
        }

        .section-divider {
            height: 1px;
            background-color: var(--md-sys-color-outline-variant, #DDD);
            margin: var(--spacing-md, 16px) 0;
        }
    `);
customElements.define("wy-variation-editor", WyVariationEditor);

// components/ui/wy-prompt-editor.js
var WyPromptEditor = class extends i4 {
  constructor() {
    super();
    this.prompt = null;
    this.categories = [];
    this.heroImageStatus = null;
    this.heroImageMasterPrompt = null;
    this.readonly = false;
    this._editedPrompt = null;
    this._promptMode = "single";
    this._expandedSteps = [];
    this._showGitInfo = false;
    this._heroProvider = "google";
    this._heroQuality = "draft";
    this._heroPrompt = "";
    this._heroPromptDirty = false;
    this._heroPreview = "";
    this._heroPreviewMimeType = "";
    this._heroPreviewMetadata = null;
    this._heroBusy = false;
    this._heroMessage = "";
    this._heroError = "";
    this._heroGeneratorOpen = false;
    this._activeSection = "basic";
    this._navOpen = false;
    this._openVariationIndex = -1;
    this._isDirty = false;
    this._handleWindowScroll = this._handleWindowScroll.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this._handleWindowScroll, { passive: true });
  }
  disconnectedCallback() {
    window.removeEventListener("scroll", this._handleWindowScroll);
    super.disconnectedCallback();
  }
  updated(changedProperties) {
    if (changedProperties.has("prompt") && this.prompt) {
      this._editedPrompt = JSON.parse(JSON.stringify(this.prompt));
      if (!this._editedPrompt.slug && this._editedPrompt.title) {
        this._editedPrompt.slug = this._generateSlug(this._editedPrompt.title);
      }
      this._promptMode = this._editedPrompt.steps && this._editedPrompt.steps.length > 0 ? "multi" : "single";
      this._expandedSteps = this._promptMode === "multi" ? [0] : [];
      this._showGitInfo = false;
      this._activeSection = "basic";
      this._navOpen = false;
      this._openVariationIndex = -1;
      this._isDirty = false;
      this._resetHeroImageState();
    }
    if (changedProperties.has("heroImageStatus") && this.heroImageStatus) {
      this._heroProvider = this._getDefaultHeroProvider();
    }
    if (changedProperties.has("heroImageMasterPrompt") && this._editedPrompt && !this._heroPromptDirty) {
      this._heroPrompt = this._buildHeroImagePrompt();
    }
  }
  _generateSlug(title) {
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  _getDefaultHeroProvider() {
    const providers = this.heroImageStatus?.providers || {};
    if (providers.google?.configured) return "google";
    if (providers.openai?.configured) return "openai";
    return this._heroProvider || "google";
  }
  _resetHeroImageState() {
    this._heroProvider = this._getDefaultHeroProvider();
    this._heroQuality = "draft";
    this._heroPrompt = this._buildHeroImagePrompt();
    this._heroPromptDirty = false;
    this._heroPreview = "";
    this._heroPreviewMimeType = "";
    this._heroPreviewMetadata = null;
    this._heroBusy = false;
    this._heroMessage = "";
    this._heroError = "";
    this._heroGeneratorOpen = false;
  }
  _getPromptTemplateSummary(prompt) {
    if (prompt.variations?.length) {
      return prompt.variations.map((variation, index) => {
        const body = variation.steps?.length ? variation.steps.map((step) => `${step.name || step.id || "Step"}:
${step.template || ""}`).join("\n\n") : variation.template || "";
        return [
          `Variation ${index + 1}: ${variation.name || variation.id || "Untitled"}`,
          variation.description ? `Description: ${variation.description}` : "",
          body
        ].filter(Boolean).join("\n");
      }).join("\n\n---\n\n");
    }
    if (prompt.steps?.length) {
      return prompt.steps.map((step) => `${step.name || step.id || "Step"}:
${step.template || ""}`).join("\n\n");
    }
    return prompt.template || "";
  }
  _buildHeroImagePrompt() {
    if (!this._editedPrompt) return "";
    const prompt = this._editedPrompt;
    const subjectPrompt = [
      `Title: ${prompt.title || "Untitled Prompt"}`,
      prompt.category ? `Category: ${prompt.category}` : "",
      prompt.description ? `Description: ${prompt.description}` : "",
      prompt.instructions ? `Instructions: ${prompt.instructions}` : "",
      `Prompt content:
${this._getPromptTemplateSummary(prompt) || "No prompt content yet."}`
    ].filter(Boolean).join("\n\n");
    const masterTemplate = this.heroImageMasterPrompt?.template || "";
    if (masterTemplate.includes("{{subject_prompt}}")) {
      return masterTemplate.replaceAll("{{subject_prompt}}", subjectPrompt);
    }
    return [
      masterTemplate || "Generate a polished 16:9 website hero image for this prompt library entry.",
      `Subject prompt:
${subjectPrompt}`
    ].join("\n\n");
  }
  _handleFieldChange(field, value) {
    if (!this._editedPrompt) return;
    this._editedPrompt = {
      ...this._editedPrompt,
      [field]: value
    };
    if (field === "title") {
      this._editedPrompt.slug = this._generateSlug(value);
    }
    if (!this._heroPromptDirty) {
      this._heroPrompt = this._buildHeroImagePrompt();
    }
    this._markDirty();
    this.requestUpdate();
  }
  _markDirty() {
    if (!this._isDirty) {
      this._isDirty = true;
    }
  }
  _getTextareaValue(codeTextarea) {
    const textarea = codeTextarea?.shadowRoot?.querySelector("textarea");
    return textarea ? textarea.value : null;
  }
  _syncStandardTemplateForSave() {
    const codeTextarea = this.shadowRoot.querySelector("wy-code-textarea");
    const value = this._getTextareaValue(codeTextarea);
    if (value !== null) {
      this._editedPrompt.template = value;
    }
  }
  _syncStepTemplatesForSave(stepEditors, steps) {
    if (!stepEditors || !steps) return;
    stepEditors.forEach((stepEditor, index) => {
      const codeTextarea = stepEditor.shadowRoot?.querySelector("wy-code-textarea");
      const value = this._getTextareaValue(codeTextarea);
      if (value !== null && steps[index]) {
        steps[index].template = value;
      }
    });
  }
  _syncVariationTemplatesForSave() {
    const variationEditor = this.shadowRoot.querySelector("wy-variation-editor");
    const variations = this._editedPrompt?.variations;
    if (!variationEditor || !variations) return;
    const variationCards = variationEditor.shadowRoot?.querySelectorAll(".variation-card") || [];
    variationCards.forEach((card, index) => {
      const variation = variations[index];
      if (!variation) return;
      if (variation.steps && variation.steps.length > 0) {
        const stepEditors = card.querySelectorAll("wy-step-editor");
        this._syncStepTemplatesForSave(stepEditors, variation.steps);
        return;
      }
      const codeTextarea = card.querySelector("wy-code-textarea");
      const value = this._getTextareaValue(codeTextarea);
      if (value !== null) {
        variation.template = value;
      }
    });
  }
  _handleSave() {
    if (this._editedPrompt?.variations?.length > 0) {
      this._syncVariationTemplatesForSave();
    } else if (this._promptMode === "multi") {
      this._syncStepTemplatesForSave(
        this.shadowRoot.querySelectorAll("wy-step-editor"),
        this._editedPrompt.steps
      );
    } else {
      this._syncStandardTemplateForSave();
    }
    this._showGitInfo = true;
    this._isDirty = false;
    this.dispatchEvent(new CustomEvent("save", {
      detail: { prompt: this._editedPrompt },
      bubbles: true,
      composed: true
    }));
  }
  _handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel", {
      detail: {},
      bubbles: true,
      composed: true
    }));
  }
  _getPreviewImage() {
    if (this._editedPrompt?.variations?.length > 0) {
      return this._editedPrompt.image || this._editedPrompt.variations[0]?.image || "";
    }
    return this._editedPrompt?.image || "";
  }
  setImageValue({ target = "prompt", variationIndex = null, variationId = null } = {}, imagePath = "") {
    if (!this._editedPrompt) return;
    const resolvedVariationIndex = variationId ? this._editedPrompt.variations?.findIndex((variation) => variation.id === variationId) : variationIndex;
    if (target === "variation" && Number.isInteger(resolvedVariationIndex) && this._editedPrompt.variations?.[resolvedVariationIndex]) {
      const variations = [...this._editedPrompt.variations];
      variations[resolvedVariationIndex] = {
        ...variations[resolvedVariationIndex],
        image: imagePath
      };
      this._editedPrompt = {
        ...this._editedPrompt,
        variations
      };
      this._markDirty();
      return;
    }
    this._editedPrompt = {
      ...this._editedPrompt,
      image: imagePath
    };
    this._markDirty();
  }
  _handleImageChange(e9) {
    const { file } = e9.detail;
    this.dispatchEvent(new CustomEvent("image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, target: "prompt" },
      bubbles: true,
      composed: true
    }));
  }
  _handleImageRemove() {
    this._handleFieldChange("image", "");
    this.dispatchEvent(new CustomEvent("image-remove", {
      detail: { promptId: this._editedPrompt?.id, target: "prompt" },
      bubbles: true,
      composed: true
    }));
  }
  setReferenceImageValue(index, imagePath) {
    if (!this._editedPrompt) return;
    const refs = [...this._editedPrompt.referenceImages || []];
    if (refs[index]) {
      refs[index] = { ...refs[index], path: imagePath };
      this._editedPrompt = { ...this._editedPrompt, referenceImages: refs };
      this._markDirty();
    }
  }
  _handleRefImageUpload(e9) {
    const { file, index } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, index },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageRemove(e9) {
    const { index, path } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-remove", {
      detail: { promptId: this._editedPrompt?.id, index, path },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationRefImageUpload(e9) {
    e9.stopPropagation();
    const { file, index, variationIndex, variationId } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, index, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationRefImageRemove(e9) {
    e9.stopPropagation();
    const { index, path, variationIndex, variationId } = e9.detail;
    this.dispatchEvent(new CustomEvent("reference-image-remove", {
      detail: { promptId: this._editedPrompt?.id, index, path, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  setVariationReferenceImageValue(variationIndex, refIndex, imagePath) {
    if (!this._editedPrompt) return;
    const variations = [...this._editedPrompt.variations || []];
    if (!variations[variationIndex]) return;
    const refs = [...variations[variationIndex].referenceImages || []];
    if (refs[refIndex]) {
      refs[refIndex] = { ...refs[refIndex], path: imagePath };
      variations[variationIndex] = { ...variations[variationIndex], referenceImages: refs };
      this._editedPrompt = { ...this._editedPrompt, variations };
      this._markDirty();
    }
  }
  _handleHeroProviderChange(e9) {
    this._heroProvider = e9.target.value;
    this._heroError = "";
  }
  _handleHeroQualityChange(e9) {
    this._heroQuality = e9.target.value;
    this._heroError = "";
  }
  _handleHeroPromptInput(e9) {
    this._heroPrompt = e9.target.value;
    this._heroPromptDirty = true;
    this._heroError = "";
  }
  _handleHeroGeneratorToggle(e9) {
    this._heroGeneratorOpen = e9.currentTarget.open;
  }
  _handleResetHeroPrompt() {
    this._heroPrompt = this._buildHeroImagePrompt();
    this._heroPromptDirty = false;
    this._heroMessage = "Prompt reset from current editor fields.";
    this._heroError = "";
  }
  _handleGenerateHeroImage() {
    if (!this._heroPrompt.trim()) {
      this._heroError = "Add prompt text before generating.";
      return;
    }
    const providerStatus = this.heroImageStatus?.providers?.[this._heroProvider];
    if (!providerStatus?.configured) {
      this._heroError = this._heroProvider === "openai" ? "OPENAI_API_KEY is not configured on the Admin server." : "GEMINI_API_KEY is not configured on the Admin server.";
      return;
    }
    this._heroBusy = true;
    this._heroGeneratorOpen = true;
    this._heroError = "";
    this._heroMessage = "Generating preview...";
    this.dispatchEvent(new CustomEvent("hero-image-generate", {
      detail: {
        provider: this._heroProvider,
        quality: this._heroQuality,
        prompt: this._heroPrompt
      },
      bubbles: true,
      composed: true
    }));
  }
  setHeroImagePreview({ image = "", mimeType = "image/png", metadata = null } = {}) {
    this._heroPreview = image;
    this._heroPreviewMimeType = mimeType;
    this._heroPreviewMetadata = metadata;
    this._heroBusy = false;
    this._heroError = "";
    this._heroGeneratorOpen = true;
    this._heroMessage = image ? "Preview generated. Accept it to attach it as this prompt image." : "";
  }
  setHeroImageError(message) {
    this._heroBusy = false;
    this._heroGeneratorOpen = true;
    this._heroError = message || "Hero image generation failed.";
    this._heroMessage = "";
  }
  _handleUseHeroImage() {
    if (!this._heroPreview) {
      this._heroError = "Generate a preview before attaching it.";
      return;
    }
    this._heroBusy = true;
    this._heroError = "";
    this._heroMessage = "Saving generated image...";
    this.dispatchEvent(new CustomEvent("hero-image-use", {
      detail: {
        promptId: this._editedPrompt?.id,
        image: this._heroPreview,
        mimeType: this._heroPreviewMimeType,
        metadata: this._heroPreviewMetadata
      },
      bubbles: true,
      composed: true
    }));
  }
  setHeroImageAccepted(imagePath) {
    this.setImageValue({ target: "prompt" }, imagePath);
    this._heroBusy = false;
    this._heroError = "";
    this._heroMessage = "Generated image attached. Save the prompt to keep this change.";
    this._heroGeneratorOpen = false;
    this._heroPreview = "";
    this._heroPreviewMimeType = "";
    this._heroPreviewMetadata = null;
  }
  _handleClearHeroPreview() {
    this._heroPreview = "";
    this._heroPreviewMimeType = "";
    this._heroPreviewMetadata = null;
    this._heroMessage = "";
    this._heroError = "";
  }
  _handleVariationImageChange(e9) {
    e9.stopPropagation();
    const { file, target, variationIndex, variationId } = e9.detail;
    this.dispatchEvent(new CustomEvent("image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, target, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationImageRemove(e9) {
    e9.stopPropagation();
    const { target, variationIndex, variationId } = e9.detail;
    this.dispatchEvent(new CustomEvent("image-remove", {
      detail: { promptId: this._editedPrompt?.id, target, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationsChange(e9) {
    if (!Array.isArray(e9.detail?.variations)) return;
    this._handleFieldChange("variations", e9.detail.variations);
  }
  _handleVariationSelectorChange(enabled) {
    if (!this._editedPrompt) return;
    if (enabled) {
      this._handleFieldChange("variationSelector", "visual");
      return;
    }
    const { variationSelector, variationSelectorTileMode, ...promptWithoutSelector } = this._editedPrompt;
    this._editedPrompt = promptWithoutSelector;
    this._markDirty();
    this.requestUpdate();
  }
  _handleVariationTileModeChange(mode) {
    if (!this._editedPrompt || this._editedPrompt.variationSelector !== "visual") return;
    const nextMode = mode === "details" ? "details" : "thumbnail";
    this._handleFieldChange("variationSelectorTileMode", nextMode);
  }
  _handleModeChange(event, newMode) {
    if (newMode === this._promptMode) return;
    const confirmMessage = newMode === "multi" ? "Convert to multi-step prompt?\n\nThis will move your template and variables into a single step." : "Convert to single-step prompt?\n\nThis will use Step 1 as the template and discard other steps.";
    if (!confirm(confirmMessage)) {
      event.preventDefault();
      this.requestUpdate();
      return;
    }
    this._convertPromptMode(newMode);
  }
  _convertPromptMode(newMode) {
    if (newMode === "multi") {
      this._editedPrompt.steps = [{
        id: "step-1",
        name: "Step 1",
        instructions: "",
        template: this._editedPrompt.template || "",
        variables: this._editedPrompt.variables || []
      }];
      this._editedPrompt.template = "";
      this._editedPrompt.variables = [];
      this._expandedSteps = [0];
    } else {
      const firstStep = this._editedPrompt.steps?.[0];
      this._editedPrompt.template = firstStep?.template || "";
      this._editedPrompt.variables = firstStep?.variables || [];
      delete this._editedPrompt.steps;
      this._expandedSteps = [];
    }
    this._promptMode = newMode;
    this._markDirty();
    this.requestUpdate();
  }
  /**
   * Convert standard prompt to variations mode
   */
  _convertToVariations() {
    const variation = {
      id: "variation-1",
      name: "Default",
      description: "",
      image: this._editedPrompt.image || ""
    };
    if (this._promptMode === "single") {
      variation.template = this._editedPrompt.template || "";
      variation.variables = [...this._editedPrompt.variables || []];
    } else {
      variation.steps = [...this._editedPrompt.steps || []];
      variation.variables = [...this._editedPrompt.variables || []];
    }
    this._editedPrompt.variations = [variation];
    delete this._editedPrompt.template;
    delete this._editedPrompt.steps;
    delete this._editedPrompt.image;
    this._promptMode = "single";
    this._markDirty();
    this.requestUpdate();
  }
  /**
   * Convert variations mode back to standard
   */
  async _convertFromVariations() {
    if (!this._editedPrompt.variations || this._editedPrompt.variations.length === 0) {
      return;
    }
    const confirmed = confirm(
      "Convert to standard mode?\n\nThis will use the first variation as the template. Other variations will be removed. This cannot be undone."
    );
    if (!confirmed) return;
    const firstVariation = this._editedPrompt.variations[0];
    if (firstVariation.steps) {
      this._editedPrompt.steps = [...firstVariation.steps];
      this._promptMode = "multi";
      this._expandedSteps = [0];
    } else {
      this._editedPrompt.template = firstVariation.template || "";
      this._promptMode = "single";
    }
    this._editedPrompt.variables = [...firstVariation.variables || []];
    this._editedPrompt.image = firstVariation.image || "";
    delete this._editedPrompt.variations;
    delete this._editedPrompt.variationSelector;
    delete this._editedPrompt.variationSelectorTileMode;
    this._markDirty();
    this.requestUpdate();
  }
  _handleStepChange(e9) {
    const { index, step } = e9.detail;
    this._editedPrompt.steps[index] = step;
    this._markDirty();
    this.requestUpdate();
  }
  _handleStepDelete(e9) {
    const { index } = e9.detail;
    if (this._editedPrompt.steps.length === 1) {
      this._notifyToast("Cannot delete the last step. Convert to single-step mode instead.", "warning");
      return;
    }
    this._editedPrompt.steps.splice(index, 1);
    this._expandedSteps = this._expandedSteps.map((i6) => i6 > index ? i6 - 1 : i6).filter((i6) => i6 < this._editedPrompt.steps.length);
    this._markDirty();
    this.requestUpdate();
  }
  _notifyToast(message, type = "info") {
    this.dispatchEvent(new CustomEvent("toast", {
      detail: { message, type },
      bubbles: true,
      composed: true
    }));
  }
  _handleStepMoveUp(e9) {
    const { index } = e9.detail;
    if (index === 0) return;
    const steps = this._editedPrompt.steps;
    [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
    if (this._expandedSteps.includes(index)) {
      this._expandedSteps = this._expandedSteps.filter((i6) => i6 !== index);
      this._expandedSteps.push(index - 1);
    } else if (this._expandedSteps.includes(index - 1)) {
      this._expandedSteps = this._expandedSteps.filter((i6) => i6 !== index - 1);
      this._expandedSteps.push(index);
    }
    this._markDirty();
    this.requestUpdate();
  }
  _handleStepMoveDown(e9) {
    const { index } = e9.detail;
    if (index === this._editedPrompt.steps.length - 1) return;
    const steps = this._editedPrompt.steps;
    [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
    if (this._expandedSteps.includes(index)) {
      this._expandedSteps = this._expandedSteps.filter((i6) => i6 !== index);
      this._expandedSteps.push(index + 1);
    } else if (this._expandedSteps.includes(index + 1)) {
      this._expandedSteps = this._expandedSteps.filter((i6) => i6 !== index + 1);
      this._expandedSteps.push(index);
    }
    this._markDirty();
    this.requestUpdate();
  }
  _handleStepToggle(e9) {
    const { index } = e9.detail;
    const expandedIndex = this._expandedSteps.indexOf(index);
    if (expandedIndex > -1) {
      this._expandedSteps.splice(expandedIndex, 1);
    } else {
      this._expandedSteps.push(index);
    }
    this.requestUpdate();
  }
  _handleAddStep() {
    const newStepNumber = this._editedPrompt.steps.length + 1;
    const newStep = {
      id: `step-${newStepNumber}`,
      name: `Step ${newStepNumber}`,
      instructions: "",
      template: "",
      variables: []
    };
    this._editedPrompt.steps.push(newStep);
    this._expandedSteps.push(this._editedPrompt.steps.length - 1);
    this._markDirty();
    this.requestUpdate();
  }
  _getNavItems() {
    if (!this._editedPrompt) return [];
    const items = [
      { id: "basic", label: "Basic Information" },
      { id: "visuals", label: "Visuals & Metadata" }
    ];
    if (this._editedPrompt.variations?.length) {
      items.push({ id: "variations", label: "Variations" });
      this._editedPrompt.variations.forEach((variation, index) => {
        const id = `variation-${index}`;
        items.push({
          id,
          label: variation.name || `Variation ${index + 1}`,
          type: "variant",
          variationIndex: index
        });
        if (index === this._openVariationIndex) {
          const hasSteps = variation.steps && variation.steps.length > 0;
          items.push({ id: `${id}-description`, label: "Description", type: "subitem", variationIndex: index, vsection: "description" });
          items.push({ id: `${id}-instructions`, label: "Instructions", type: "subitem", variationIndex: index, vsection: "instructions" });
          items.push({ id: `${id}-image`, label: "Image", type: "subitem", variationIndex: index, vsection: "image" });
          items.push({ id: `${id}-${hasSteps ? "steps" : "variables"}`, label: hasSteps ? "Steps" : "Variables", type: "subitem", variationIndex: index, vsection: hasSteps ? "steps" : "variables" });
          if (!hasSteps) {
            items.push({ id: `${id}-template`, label: "Template", type: "subitem", variationIndex: index, vsection: "template" });
          }
        }
      });
    } else {
      items.push({ id: "prompt-type", label: "Prompt Type" });
      if (this._promptMode === "single") {
        items.push({ id: "variables", label: "Variables" });
        items.push({ id: "reference-images", label: "Reference Images" });
        items.push({ id: "template", label: "Template" });
      } else {
        items.push({ id: "steps", label: "Steps" });
      }
    }
    items.push({ id: "visibility", label: "Visibility" });
    return items;
  }
  _renderEditorNav() {
    const items = this._getNavItems();
    const activeItem = items.find((item) => item.id === this._activeSection) || items[0];
    return b2`
            <nav class="editor-nav ${this._navOpen ? "open" : ""}" aria-label="Prompt editor sections">
                <button
                    class="editor-nav-toggle"
                    type="button"
                    @click="${() => {
      this._navOpen = !this._navOpen;
    }}"
                    aria-expanded="${this._navOpen ? "true" : "false"}"
                >
                    <span>${activeItem?.label || "Jump to section"}</span>
                    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                </button>
                <p class="editor-nav-title">Jump to</p>
                <div class="editor-nav-list">
                    ${items.map((item) => b2`
                        <button
                            class="editor-nav-item ${item.type || ""} ${this._activeSection === item.id ? "active" : ""}"
                            type="button"
                            title="${item.label}"
                            @click="${() => this._jumpToNavItem(item)}"
                        >${item.label}</button>
                    `)}
                </div>
            </nav>
        `;
  }
  async _jumpToNavItem(item) {
    if (!item) return;
    this._activeSection = item.id;
    this._navOpen = false;
    if (Number.isInteger(item.variationIndex)) {
      const variationEditor = this.shadowRoot?.querySelector("wy-variation-editor");
      variationEditor?.expandVariation(item.variationIndex);
      this._openVariationIndex = item.variationIndex;
      await this.updateComplete;
      await variationEditor?.updateComplete;
      const target = variationEditor?.getSectionElement(item.variationIndex, item.vsection || "variation");
      this._scrollTargetIntoView(target);
      return;
    }
    this._scrollTargetIntoView(this.shadowRoot?.querySelector(`[data-section="${item.id}"]`));
  }
  _scrollTargetIntoView(target) {
    if (!target) return;
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }
  _renderPromptImageControl() {
    const image = this._editedPrompt?.image || "";
    if (!image) {
      return b2`
                <wy-image-upload
                    label="Prompt Image"
                    compact
                    @change="${this._handleImageChange}"
                    @remove="${this._handleImageRemove}"
                ></wy-image-upload>
            `;
    }
    return b2`
            <div class="label">Prompt Image</div>
            <div class="prompt-image-card">
                <details>
                    <summary class="prompt-image-summary">
                        <img class="prompt-image-thumbnail" src="${image}" alt="Prompt hero thumbnail">
                        <span class="prompt-image-copy">
                            <span class="prompt-image-title">Hero image attached</span>
                            <span class="prompt-image-hint">Open to preview larger. Remove it to upload a replacement.</span>
                        </span>
                    </summary>
                    <div class="prompt-image-expanded">
                        <img src="${image}" alt="Prompt hero preview">
                    </div>
                </details>
                <button
                    class="prompt-image-remove"
                    type="button"
                    @click="${this._handleImageRemove}"
                    aria-label="Remove image"
                    title="Remove image"
                >
                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
            </div>
        `;
  }
  _handleVariationExpand(e9) {
    this._openVariationIndex = e9.detail?.index ?? -1;
  }
  _handleWindowScroll() {
    if (!this._editedPrompt) return;
    const sections = [...this.shadowRoot.querySelectorAll("[data-section]")].map((element) => ({ id: element.dataset.section, element }));
    const variationEditor = this.shadowRoot?.querySelector("wy-variation-editor");
    if (variationEditor && this._openVariationIndex >= 0) {
      ["description", "instructions", "image", "variables", "template", "steps"].forEach((section) => {
        const element = variationEditor.getSectionElement?.(this._openVariationIndex, section);
        if (element && element.dataset?.vsection === section) {
          sections.push({
            id: `variation-${this._openVariationIndex}-${section}`,
            element
          });
        }
      });
    }
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    sections.forEach(({ id, element }) => {
      const distance = Math.abs(element.getBoundingClientRect().top - 120);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = id;
      }
    });
    if (nearest && nearest !== this._activeSection) {
      this._activeSection = nearest;
    }
  }
  _renderHeroImageGenerator() {
    const providers = this.heroImageStatus?.providers || {};
    const providerOptions = [
      { value: "google", label: "Google Nano Banana 2", configured: Boolean(providers.google?.configured) },
      { value: "openai", label: "OpenAI GPT Image", configured: Boolean(providers.openai?.configured) }
    ];
    const hasConfiguredProvider = providerOptions.some((option) => option.configured);
    const selectedProviderConfigured = providerOptions.find((option) => option.value === this._heroProvider)?.configured;
    const previewUrl = this._heroPreview ? `data:${this._heroPreviewMimeType || "image/png"};base64,${this._heroPreview}` : "";
    return b2`
            <details
                class="hero-generator"
                .open="${this._heroGeneratorOpen}"
                @toggle="${this._handleHeroGeneratorToggle}"
            >
                <summary class="hero-generator-summary">
                    <span class="hero-generator-summary-text">
                        <span class="hero-generator-title">Generate Hero Image</span>
                        <span class="hero-provider-status">
                            ${hasConfiguredProvider ? "Preview and attach a generated image." : "Image generation needs an API key."}
                        </span>
                    </span>
                    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                </summary>

                <div class="hero-generator-body">
                    <div class="hero-generator-header">
                        <div class="hero-controls">
                            <label class="hero-control-label">
                                Provider
                                <select
                                    .value="${this._heroProvider}"
                                    @change="${this._handleHeroProviderChange}"
                                    ?disabled="${this._heroBusy}"
                                >
                                    ${providerOptions.map((option) => b2`
                                        <option value="${option.value}">
                                            ${option.label}${option.configured ? "" : " (not configured)"}
                                        </option>
                                    `)}
                                </select>
                            </label>
                            <label class="hero-control-label">
                                Quality
                                <select
                                    .value="${this._heroQuality}"
                                    @change="${this._handleHeroQualityChange}"
                                    ?disabled="${this._heroBusy}"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="standard">Standard</option>
                                    <option value="final">Final</option>
                                </select>
                            </label>
                        </div>
                        <div class="hero-generator-tools">
                            <a
                                class="button button-ghost button-small"
                                href="/admin-settings.html#hero-image-master-prompt"
                                title="Edit the persistent master prompt used by this generator"
                            >
                                <span class="material-symbols-outlined">edit</span>
                                Edit Master
                            </a>
                            <button
                                class="button button-ghost button-small"
                                type="button"
                                @click="${this._handleResetHeroPrompt}"
                                ?disabled="${this._heroBusy}"
                            >
                                <span class="material-symbols-outlined">refresh</span>
                                Reset Prompt
                            </button>
                        </div>
                    </div>

                    <label class="hero-control-label">
                        Image prompt
                        <textarea
                            class="hero-prompt-textarea"
                            .value="${this._heroPrompt}"
                            @input="${this._handleHeroPromptInput}"
                            ?disabled="${this._heroBusy}"
                        ></textarea>
                    </label>

                    <div class="hero-actions">
                        <button
                            class="button button-primary"
                            type="button"
                            @click="${this._handleGenerateHeroImage}"
                            ?disabled="${this._heroBusy || !selectedProviderConfigured}"
                        >
                            ${this._heroPreview ? "Regenerate Preview" : "Generate Preview"}
                        </button>
                        ${this._heroPreview ? b2`
                            <button
                                class="button button-secondary"
                                type="button"
                                @click="${this._handleClearHeroPreview}"
                                ?disabled="${this._heroBusy}"
                            >
                                Clear Preview
                            </button>
                        ` : ""}
                    </div>

                    ${this._heroError ? b2`<p class="hero-error-message">${this._heroError}</p>` : ""}
                    ${this._heroMessage ? b2`<p class="hero-status-message">${this._heroMessage}</p>` : ""}

                    ${previewUrl ? b2`
                        <div class="hero-preview-shell">
                            <img class="hero-preview-image" src="${previewUrl}" alt="Generated hero preview">
                            <div class="hero-preview-actions">
                                <button
                                    class="button button-primary"
                                    type="button"
                                    @click="${this._handleUseHeroImage}"
                                    ?disabled="${this._heroBusy}"
                                >
                                    Use as Hero
                                </button>
                            </div>
                        </div>
                    ` : ""}
                </div>
            </details>
        `;
  }
  render() {
    if (!this._editedPrompt) {
      return b2`<div>No prompt loaded</div>`;
    }
    const categoryOptions = this.categories.map((cat) => ({ value: cat, label: cat }));
    const variableNames = (this._editedPrompt.variables || []).map((v3) => v3.name);
    return b2`
            <div class="editor-layout">
                <div class="actions">
                    <div class="toolbar-context">
                        <span class="toolbar-title">${this._editedPrompt.title || "Untitled Prompt"}</span>
                        ${this._isDirty ? b2`<span class="toolbar-dirty" title="Unsaved changes"></span>` : ""}
                    </div>
                    <div class="toolbar-actions">
                        <button class="button button-secondary" @click="${this._handleCancel}">
                            Discard
                        </button>
                        <button class="button button-primary" @click="${this._handleSave}">
                            Save
                        </button>
                    </div>
                </div>

                ${this._renderEditorNav()}

                <!-- Left Column: Form -->
                <div class="editor-form">
                    <!-- Header -->
                    <div class="editor-header">
                        <nav class="breadcrumbs">
                            <a href="#" @click="${(e9) => {
      e9.preventDefault();
      window.location.hash = "";
    }}">← Back to prompts list</a>
                        </nav>
                        <h1>Prompt Editor</h1>
                        <p class="subtitle">Edit prompt details and template</p>
                    </div>
                    
                    ${this._showGitInfo ? b2`
                        <div class="info-banner">
                            <p><strong>Changes saved to prompts.json.</strong> Run <code>git add prompts.json && git commit -m "Update prompts" && git push</code> to publish. To undo: <code>git checkout -- prompts.json</code></p>
                        </div>
                    ` : ""}

                    <!-- Section 1: Basic Information -->
                    <div class="card" data-section="basic">
                        <h2 class="card-title" data-eyebrow="Section 01">Basic Information</h2>
                        <wy-form-field label="Prompt Title" id="title" required>
                            <input
                                type="text"
                                id="title"
                                .value="${this._editedPrompt.title || ""}"
                                @input="${(e9) => this._handleFieldChange("title", e9.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-form-field label="Slug" id="slug" description="URL-friendly identifier (auto-generated from title)">
                            <input
                                type="text"
                                id="slug"
                                .value="${this._editedPrompt.slug || ""}"
                                @input="${(e9) => this._handleFieldChange("slug", e9.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-form-field label="Prompt ID" id="id" description="Unique identifier (read-only)">
                            <input
                                type="text"
                                id="id"
                                .value="${this._editedPrompt.id || ""}"
                                disabled
                                readonly
                            >
                        </wy-form-field>
                        <wy-form-field label="Description" id="description">
                            <textarea
                                id="description"
                                rows="3"
                                .value="${this._editedPrompt.description || ""}"
                                @input="${(e9) => this._handleFieldChange("description", e9.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </wy-form-field>
                        <wy-form-field label="Instructions" id="instructions" description="Usage notes shown in the prompt modal and only on expanded prompt cards">
                            <textarea
                                id="instructions"
                                rows="4"
                                .value="${this._editedPrompt.instructions || ""}"
                                @input="${(e9) => this._handleFieldChange("instructions", e9.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </wy-form-field>
                    </div>

                    <!-- Section 2: Visuals & Metadata -->
                    <div class="card" data-section="visuals">
                        <h2 class="card-title" data-eyebrow="Section 02">Visuals & Metadata</h2>
                        <wy-form-field label="Icon" id="icon" description="Material Symbol icon name (e.g., 'restaurant', 'code', 'music_note')">
                            <input
                                type="text"
                                id="icon"
                                .value="${this._editedPrompt.icon || ""}"
                                @input="${(e9) => this._handleFieldChange("icon", e9.target.value)}"
                                placeholder="icon_name"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-dropdown
                            label="Category"
                            .value="${this._editedPrompt.category || ""}"
                            .options="${categoryOptions}"
                            @change="${(e9) => this._handleFieldChange("category", e9.detail.value)}"
                        ></wy-dropdown>
                        ${this._renderPromptImageControl()}
                        ${this._renderHeroImageGenerator()}
                    </div>

                    <!-- Section 3: Content Structure -->
                    ${this._editedPrompt.variations && this._editedPrompt.variations.length > 0 ? b2`
                        <!-- Variations Mode -->
                        <div class="card" data-section="variations">
                            <div class="card-header-with-action">
                                <div>
                                    <h2 class="card-title" data-eyebrow="Section 03">Variations</h2>
                                    <p class="card-description">
                                        This prompt has multiple variations. Each variation can be a simple template or multi-step workflow.
                                    </p>
                                </div>
                                <button 
                                    class="button button-ghost button-small"
                                    @click="${this._convertFromVariations}"
                                    title="Convert back to standard mode"
                                >
                                    <span class="material-symbols-outlined">undo</span>
                                    Convert to Standard
                                </button>
                            </div>
                            <div class="variation-display-setting">
                                <span class="variation-display-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">grid_view</span>
                                </span>
                                <div class="variation-display-options">
                                    <wy-option-toggle
                                        variant="switch"
                                        size="compact"
                                        label="Visual Variant Selector"
                                        description="Shows image tiles instead of the dropdown selector in the public prompt modal."
                                        .options="${["dropdown", "visual"]}"
                                        .labels="${["Off", "On"]}"
                                        .value="${this._editedPrompt.variationSelector === "visual" ? "visual" : "dropdown"}"
                                        @change="${(e9) => this._handleVariationSelectorChange(e9.detail.value === "visual")}"
                                    ></wy-option-toggle>
                                    ${this._editedPrompt.variationSelector === "visual" ? b2`
                                        <wy-option-toggle
                                            size="compact"
                                            label="Tile Content"
                                            description="Choose whether visual selector thumbnails include variant text."
                                            .options="${["thumbnail", "details"]}"
                                            .labels="${["Thumbnail only", "Title + description"]}"
                                            .value="${this._editedPrompt.variationSelectorTileMode === "details" ? "details" : "thumbnail"}"
                                            @change="${(e9) => this._handleVariationTileModeChange(e9.detail.value)}"
                                        ></wy-option-toggle>
                                    ` : ""}
                                </div>
                            </div>
                            <wy-variation-editor
                                .variations="${this._editedPrompt.variations}"
                                @change="${this._handleVariationsChange}"
                                @variation-expand="${this._handleVariationExpand}"
                                @image-upload="${this._handleVariationImageChange}"
                                @image-remove="${this._handleVariationImageRemove}"
                                @reference-image-upload="${this._handleVariationRefImageUpload}"
                                @reference-image-remove="${this._handleVariationRefImageRemove}"
                            ></wy-variation-editor>
                        </div>
                    ` : b2`
                        <!-- Standard Mode (No Variations) -->
                        <div class="card" data-section="prompt-type">
                            <div class="card-header-with-action">
                                <h2 class="card-title" data-eyebrow="Section 03">Prompt Type</h2>
                                <button 
                                    class="button button-ghost button-small"
                                    @click="${this._convertToVariations}"
                                    title="Create multiple variations of this prompt"
                                >
                                    <span class="material-symbols-outlined">library_add</span>
                                    Convert to Variations
                                </button>
                            </div>
                            <div class="mode-toggle">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="single" 
                                        ?checked="${this._promptMode === "single"}"
                                        @click="${(e9) => this._handleModeChange(e9, "single")}"
                                    >
                                    Single Step
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="multi" 
                                        ?checked="${this._promptMode === "multi"}"
                                        @click="${(e9) => this._handleModeChange(e9, "multi")}"
                                    >
                                    Multi-Step
                                </label>
                            </div>
                        </div>

                        <!-- Single-Step Content -->
                        ${this._promptMode === "single" ? b2`
                            <!-- Variables -->
                            <div class="card" data-section="variables">
                                <h2 class="card-title" data-eyebrow="Section 04">Variables</h2>
                                <wy-variable-editor
                                    .variables="${this._editedPrompt.variables || []}"
                                    @change="${(e9) => this._handleFieldChange("variables", e9.detail.variables)}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Reference Images -->
                            <div class="card" data-section="reference-images">
                                <h2 class="card-title" data-eyebrow="Section 05">Reference Images</h2>
                                <p class="card-description">Upload images and reference them in your template with {{variable_name}}. Their public URLs are substituted when the prompt is copied.</p>
                                <wy-reference-image-editor
                                    .referenceImages="${this._editedPrompt.referenceImages || []}"
                                    @change="${(e9) => this._handleFieldChange("referenceImages", e9.detail.referenceImages)}"
                                    @reference-image-upload="${this._handleRefImageUpload}"
                                    @reference-image-remove="${this._handleRefImageRemove}"
                                ></wy-reference-image-editor>
                            </div>

                            <!-- Template -->
                            <div class="card" data-section="template">
                                <h2 class="card-title" data-eyebrow="Section 06">Template</h2>
                                <wy-code-textarea
                                    label="Prompt Template"
                                    .value="${this._editedPrompt.template || ""}"
                                    .variables="${variableNames}"
                                    placeholder="Enter your prompt template here. Use {{variable-name}} for substitutions."
                                    rows="12"
                                    @value-input="${(e9) => this._handleFieldChange("template", e9.detail.value)}"
                                ></wy-code-textarea>
                            </div>
                        ` : ""}

                        <!-- Multi-Step Content -->
                        ${this._promptMode === "multi" ? b2`
                            <div class="card" data-section="steps">
                                <h2 class="card-title" data-eyebrow="Section 04">Steps</h2>
                                <p class="card-description">
                                    Define the sequence of prompts. Users will follow these steps in order.
                                </p>
                                
                                ${(this._editedPrompt.steps || []).map((step, index) => b2`
                                    <wy-step-editor
                                        .step="${step}"
                                        .index="${index}"
                                        .total="${this._editedPrompt.steps.length}"
                                        .expanded="${this._expandedSteps.includes(index)}"
                                        @step-change="${this._handleStepChange}"
                                        @step-delete="${this._handleStepDelete}"
                                        @step-move-up="${this._handleStepMoveUp}"
                                        @step-move-down="${this._handleStepMoveDown}"
                                        @step-toggle="${this._handleStepToggle}"
                                    ></wy-step-editor>
                                `)}
                                
                                <button 
                                    class="button button-secondary add-step-button" 
                                    @click="${this._handleAddStep}"
                                >
                                    <span class="material-symbols-outlined">add</span>
                                    Add Step
                                </button>
                            </div>
                        ` : ""}
                    `}

                    <!-- Section 5: Visibility -->
                    <div class="card" data-section="visibility">
                        <h2 class="card-title" data-eyebrow="Section Final">Visibility</h2>
                        <div class="visibility-settings">
                            <div class="visibility-setting">
                                <span class="visibility-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">hotel_class</span>
                                </span>
                                <wy-option-toggle
                                    variant="switch"
                                    size="compact"
                                    label="Featured"
                                    description="Featured prompts are highlighted and sorted to the top of the library."
                                    .options="${["false", "true"]}"
                                    .labels="${["Off", "On"]}"
                                    .value="${this._editedPrompt.featured ? "true" : "false"}"
                                    @change="${(e9) => this._handleFieldChange("featured", e9.detail.checked)}"
                                ></wy-option-toggle>
                            </div>
                            <div class="visibility-setting archive">
                                <span class="visibility-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">inventory_2</span>
                                </span>
                                <wy-option-toggle
                                    variant="switch"
                                    size="compact"
                                    label="Archive Prompt"
                                    description="Archived prompts are hidden from the public site but remain editable here."
                                    .options="${["false", "true"]}"
                                    .labels="${["Off", "On"]}"
                                    .value="${this._editedPrompt.archived ? "true" : "false"}"
                                    @change="${(e9) => this._handleFieldChange("archived", e9.detail.checked)}"
                                ></wy-option-toggle>
                            </div>
                            <div class="visibility-setting">
                                <span class="visibility-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">palette</span>
                                </span>
                                <wy-option-toggle
                                    variant="switch"
                                    size="compact"
                                    label="Color Palette"
                                    description="Shows the color palette tool when this prompt is open on the public site."
                                    .options="${["false", "true"]}"
                                    .labels="${["Off", "On"]}"
                                    .value="${this._editedPrompt.showPalette ? "true" : "false"}"
                                    @change="${(e9) => this._handleFieldChange("showPalette", e9.detail.checked)}"
                                ></wy-option-toggle>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
  }
};
__publicField(WyPromptEditor, "properties", {
  prompt: { type: Object },
  categories: { type: Array },
  heroImageStatus: { type: Object },
  heroImageMasterPrompt: { type: Object },
  readonly: { type: Boolean },
  _editedPrompt: { type: Object, state: true },
  _promptMode: { type: String, state: true },
  _expandedSteps: { type: Array, state: true },
  _showGitInfo: { type: Boolean, state: true },
  _heroProvider: { type: String, state: true },
  _heroQuality: { type: String, state: true },
  _heroPrompt: { type: String, state: true },
  _heroPromptDirty: { type: Boolean, state: true },
  _heroPreview: { type: String, state: true },
  _heroPreviewMimeType: { type: String, state: true },
  _heroPreviewMetadata: { type: Object, state: true },
  _heroBusy: { type: Boolean, state: true },
  _heroMessage: { type: String, state: true },
  _heroError: { type: String, state: true },
  _heroGeneratorOpen: { type: Boolean, state: true },
  _activeSection: { type: String, state: true },
  _navOpen: { type: Boolean, state: true },
  _openVariationIndex: { type: Number, state: true },
  _isDirty: { type: Boolean, state: true }
});
__publicField(WyPromptEditor, "styles", i`
        :host {
            display: block;
            width: 100%;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
        }

        .editor-layout {
            display: grid;
            grid-template-columns: minmax(190px, 240px) minmax(0, 1fr);
            gap: var(--spacing-xl, 32px);
            align-items: start;
        }

        .editor-form {
            grid-column: 2;
            grid-row: 2;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
            height: fit-content;
        }

        .editor-header {
            padding-bottom: var(--spacing-md, 16px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .breadcrumbs {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-bottom: var(--spacing-sm, 8px);
        }

        .breadcrumbs a {
            color: var(--md-sys-color-primary, #282828);
            text-decoration: none;
        }

        .breadcrumbs a:hover {
            text-decoration: underline;
        }

        h1 {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 2rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0 0 var(--spacing-xs, 4px) 0;
        }

        .subtitle {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 1rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-bottom: var(--spacing-md, 16px);
        }

        .info-banner {
            padding: var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
            border-left: 4px solid var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .info-banner p {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
            line-height: 1.5;
        }

        .info-banner code {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.8125rem;
            padding: 2px 6px;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
        }

        .actions {
            grid-column: 2;
            grid-row: 1;
            display: flex;
            justify-content: flex-end;
            gap: var(--spacing-sm, 8px);
            margin: 0 0 var(--spacing-md, 16px) 0;
            position: sticky;
            top: var(--spacing-lg, 24px);
            z-index: 5;
            padding: var(--spacing-sm, 8px);
            background-color: var(--md-sys-color-background, #FDFBF7);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
        }

        .button {
            padding: var(--spacing-sm, 8px) var(--spacing-lg, 24px);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        a.button {
            text-decoration: none;
        }

        .button-secondary {
            background-color: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            color: var(--md-sys-color-on-surface, #121714);
        }

        .button-secondary:hover {
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
        }

        .button-primary {
            background-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFFFFF);
        }

        .button-primary:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 90%, black);
        }

        .card {
            background-color: var(--md-sys-color-surface, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-large, 24px);
            padding: var(--spacing-lg, 24px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .card-title {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0 0 var(--spacing-md, 16px) 0;
        }

        .editor-nav {
            grid-column: 1;
            grid-row: 1 / span 2;
            position: sticky;
            top: var(--spacing-lg, 24px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px) 0;
            border-top: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-bottom: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .editor-nav-toggle {
            display: none;
        }

        .editor-nav-title {
            margin: 0 0 var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .editor-nav-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .editor-nav-item {
            width: 100%;
            min-height: 32px;
            padding: 6px 8px;
            border: 0;
            border-left: 2px solid transparent;
            background: transparent;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            line-height: 1.25;
            text-align: left;
            transition:
                border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .editor-nav-item:hover {
            color: var(--md-sys-color-on-surface, #121714);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
        }

        .editor-nav-item.active {
            color: var(--md-sys-color-primary, #282828);
            border-left-color: var(--md-sys-color-primary, #282828);
            font-weight: 600;
        }

        .editor-nav-item.subitem {
            min-height: 28px;
            padding-left: 20px;
            font-size: 0.8125rem;
        }

        .editor-nav-item.variant {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 0.9375rem;
            color: var(--md-sys-color-on-surface, #121714);
        }

        .mode-toggle {
            display: flex;
            gap: var(--spacing-md, 16px);
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-small, 8px);
        }

        .mode-toggle label {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            cursor: pointer;
            user-select: none;
        }

        .mode-toggle input[type="radio"] {
            cursor: pointer;
        }

        .card-description {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin: 0 0 var(--spacing-md, 16px) 0;
        }

        .label {
            font-family: var(--font-display, 'Playfair Display', serif);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--md-sys-color-text-heading, #121714);
            margin-bottom: var(--spacing-sm, 8px);
            display: block;
        }

        .hero-generator {
            display: flex;
            flex-direction: column;
            margin-top: var(--spacing-md, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            background: color-mix(in srgb, var(--paper, #F7F4EE) 42%, transparent);
            overflow: hidden;
        }

        .prompt-image-card {
            position: relative;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            padding: var(--spacing-sm, 8px);
        }

        .prompt-image-summary {
            display: grid;
            grid-template-columns: 132px minmax(0, 1fr);
            gap: var(--spacing-sm, 8px);
            align-items: center;
            padding-right: 44px;
            list-style: none;
            cursor: pointer;
        }

        .prompt-image-summary::-webkit-details-marker {
            display: none;
        }

        .prompt-image-summary:focus-visible {
            outline: 2px solid var(--md-sys-color-primary, #282828);
            outline-offset: 3px;
            border-radius: var(--md-sys-shape-corner-small, 8px);
        }

        .prompt-image-thumbnail {
            width: 132px;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            border-radius: var(--md-sys-shape-corner-small, 8px);
        }

        .prompt-image-copy {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .prompt-image-title {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--md-sys-color-on-surface, #121714);
        }

        .prompt-image-hint {
            font-size: 0.75rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .prompt-image-expanded {
            margin-top: var(--spacing-sm, 8px);
            overflow: hidden;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
        }

        .prompt-image-expanded img {
            display: block;
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: cover;
        }

        .prompt-image-remove {
            position: absolute;
            top: var(--spacing-sm, 8px);
            right: var(--spacing-sm, 8px);
            width: 32px;
            height: 32px;
            padding: 0;
            border: 0;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background-color: var(--md-sys-color-error, #B3261E);
            color: var(--md-sys-color-on-error, #FFF);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px color-mix(in srgb, var(--ink, #1A1A1A) 24%, transparent);
        }

        .prompt-image-remove .material-symbols-outlined {
            font-size: 18px;
            color: currentColor;
        }

        .hero-generator-summary {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-md, 16px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            list-style: none;
            cursor: pointer;
        }

        .hero-generator-summary::-webkit-details-marker {
            display: none;
        }

        .hero-generator-summary-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .hero-generator-summary .material-symbols-outlined {
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .hero-generator[open] .hero-generator-summary .material-symbols-outlined {
            transform: rotate(180deg);
        }

        .hero-generator-body {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm, 8px);
            padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
        }

        .hero-generator-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--spacing-md, 16px);
        }

        .hero-generator-tools {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: var(--spacing-xs, 4px);
        }

        .hero-generator-title {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .hero-provider-status {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin: var(--spacing-xs, 4px) 0 0;
        }

        .hero-controls {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: var(--spacing-sm, 8px);
        }

        .hero-control-label {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
        }

        .hero-control-label select,
        .hero-prompt-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            background-color: var(--md-sys-color-background, #FDFBF7);
            color: var(--md-sys-color-on-surface, #121714);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
        }

        .hero-control-label select {
            min-height: 40px;
            padding: 0 var(--spacing-sm, 8px);
        }

        .hero-prompt-textarea {
            min-height: 140px;
            padding: var(--spacing-sm, 8px);
            line-height: 1.45;
            resize: vertical;
        }

        .hero-actions,
        .hero-preview-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm, 8px);
            align-items: center;
        }

        .hero-preview-shell {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm, 8px);
        }

        .hero-preview-image {
            width: min(100%, 360px);
            aspect-ratio: 16 / 9;
            object-fit: cover;
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .hero-status-message,
        .hero-error-message {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            line-height: 1.4;
            margin: 0;
        }

        .hero-status-message {
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .hero-error-message {
            color: var(--err, #B3261E);
        }

        .add-step-button {
            width: 100%;
            margin-top: var(--spacing-md, 16px);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs, 4px);
        }

        .card-header-with-action {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--spacing-md, 16px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .card-header-with-action > div {
            flex: 1;
        }

        .button-ghost {
            background: color-mix(in srgb, var(--ink, #1A1A1A) 5%, transparent);
            border: 0;
            color: var(--md-sys-color-primary, #282828);
            position: relative;
            overflow: hidden;
        }

        .button-ghost::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .button-ghost:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .button-ghost:hover {
            color: var(--md-sys-color-primary, #282828);
        }

        .button-small {
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            font-size: 0.8125rem;
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            white-space: nowrap;
        }

        /* Refined admin polish layer */
        .editor-layout {
            grid-template-columns: 216px minmax(0, 1fr);
            grid-template-rows: auto 1fr;
            gap: 20px;
            max-width: 1140px;
            margin: 0 auto;
            padding: 0px clamp(20px, 20px, 56px) 96px;
        }

        .actions {
            grid-column: 1 / -1;
            grid-row: 1;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-sm, 8px);
            margin: 12px 0 28px;
            top: 12px;
            padding: 10px 12px 10px 18px;
            background: color-mix(in srgb, var(--surface-2, #FFF) 86%, var(--paper, #F7F4EE));
            backdrop-filter: blur(10px) saturate(120%);
            -webkit-backdrop-filter: blur(10px) saturate(120%);
            border: 0;
            border-radius: var(--radius-3, 16px);
            box-shadow: 0 10px 28px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
        }

        .toolbar-context {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .toolbar-title {
            max-width: min(48vw, 520px);
            overflow: hidden;
            color: var(--ink, #1A1A1A);
            font-family: var(--font-serif, 'Lora', serif);
            font-size: 1.0625rem;
            font-weight: 600;
            line-height: 1.2;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .toolbar-dirty {
            flex-shrink: 0;
            width: 7px;
            height: 7px;
            margin-top: 1px;
            border-radius: 50%;
            background: var(--accent-terracotta, #C18A4D);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-terracotta, #C18A4D) 16%, transparent);
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            flex-shrink: 0;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            padding: 0.55rem 1.25rem;
        }

        .button-secondary {
            border: 0;
            background: color-mix(in srgb, var(--ink, #1A1A1A) 5%, transparent);
        }

        .editor-nav {
            grid-column: 1;
            grid-row: 2;
            top: 84px;
            gap: var(--spacing-xs, 4px);
            padding: 14px 12px;
            background: var(--surface-1, var(--paper, #F7F4EE));
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: 0 10px 26px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .editor-nav-title,
        .card-title::before {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .editor-nav-title {
            padding: 0 6px 8px;
            margin: 0;
        }

        .editor-nav-item {
            position: relative;
            min-height: 32px;
            padding: 7px 10px 7px 14px;
            border-left: 0;
            border-radius: var(--radius-2, 10px);
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.8125rem;
            font-weight: 500;
        }

        .editor-nav-item::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 50%;
            width: 2px;
            height: 0;
            border-radius: 3px;
            background: var(--md-sys-color-primary, #282828);
            transform: translateY(-50%);
            transition: height var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .editor-nav-item.active {
            border-left-color: transparent;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 6%, transparent);
        }

        .editor-nav-item.active::before {
            height: 14px;
        }

        .editor-nav-item.subitem {
            padding-left: 24px;
            font-size: 0.78rem;
        }

        .editor-form {
            grid-column: 2;
            grid-row: 2;
        }

        .editor-header {
            margin-bottom: 2px;
            padding-bottom: 0;
        }

        .breadcrumbs {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.8125rem;
        }

        h1,
        .card-title,
        .hero-generator-title {
            font-family: var(--font-serif, 'Lora', serif);
            letter-spacing: -0.015em;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 6px;
        }

        .subtitle {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.95rem;
        }

        .card {
            background: var(--surface-2, #FFF);
            border: 0;
            border-radius: var(--radius-3, 16px);
            padding: 26px 28px;
            box-shadow: 0 12px 32px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .card-title {
            font-size: 1.375rem;
            margin-bottom: var(--spacing-md, 16px);
        }

        .card-title::before {
            content: attr(data-eyebrow);
            display: block;
            margin-bottom: 7px;
        }

        .card-description {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.875rem;
            line-height: 1.6;
        }

        .mode-toggle {
            display: inline-flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px);
            width: max-content;
            max-width: 100%;
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--paper-deep, #EEE8DD);
        }

        .mode-toggle label {
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            padding: 0.5rem 1.1rem;
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .mode-toggle label:has(input:checked) {
            background: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFF);
        }

        .mode-toggle input[type="radio"] {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }

        .info-banner {
            display: flex;
            border: 0;
            background: color-mix(in srgb, var(--accent-sage, #7D8E39) 12%, var(--surface-2, #FFF));
            border-radius: var(--radius-2, 10px);
        }

        .hero-control-label,
        .card-header-with-action,
        .hero-provider-status,
        .hero-status-message,
        .hero-error-message {
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .hero-control-label select,
        .hero-prompt-textarea {
            background: var(--field-bg, #FBF9F4);
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
        }

        .visibility-settings {
            display: grid;
            gap: var(--spacing-md, 16px);
        }

        .visibility-setting {
            display: grid;
            grid-template-columns: 40px minmax(0, 1fr);
            gap: var(--spacing-md, 16px);
            align-items: center;
            padding: 18px 20px;
            border: 0;
            border-radius: var(--radius-2, 10px);
            background: var(--field-bg, #FBF9F4);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .visibility-setting.archive {
            background: color-mix(in srgb, var(--err, #B3261E) 4%, var(--field-bg, #FBF9F4));
        }

        .variation-display-setting {
            display: grid;
            grid-template-columns: 40px minmax(0, 1fr);
            gap: var(--spacing-md, 16px);
            align-items: center;
            padding: 18px 20px;
            margin-bottom: var(--spacing-lg, 24px);
            border: 0;
            border-radius: var(--radius-2, 10px);
            background: var(--field-bg, #FBF9F4);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .variation-display-options {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
            min-width: 0;
        }

        .visibility-icon,
        .variation-display-icon {
            display: inline-grid;
            place-items: center;
            width: 40px;
            height: 40px;
            border-radius: var(--md-sys-shape-corner-full, 999px);
            background: var(--surface-2, #FFF);
            color: var(--ink, #1A1A1A);
            box-shadow: 0 4px 12px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
        }

        .visibility-setting.archive .visibility-icon {
            color: var(--err, #B3261E);
            box-shadow: 0 4px 12px color-mix(in srgb, var(--err, #B3261E) 10%, transparent);
        }

        .visibility-icon .material-symbols-outlined,
        .variation-display-icon .material-symbols-outlined {
            font-size: 21px;
        }

        .visibility-setting wy-option-toggle {
            --wy-option-toggle-off-bg: var(--paper-deep, #EEE8DD);
        }

        @media (max-width: 1200px) {
            .editor-layout {
                grid-template-columns: 1fr;
                gap: var(--spacing-lg, 24px);
            }

            .actions {
                grid-column: 1;
                grid-row: 1;
                top: 12px;
                margin: 8px 0 0;
                border-radius: var(--radius-3, 16px);
            }

            .toolbar-title {
                max-width: 46vw;
            }

            .editor-nav {
                grid-column: 1;
                grid-row: 2;
                top: 64px;
                z-index: 4;
                background: var(--surface-1, var(--paper, #F7F4EE));
                padding: var(--spacing-sm, 8px);
                border: 0;
                border-radius: var(--radius-2, 10px);
            }

            .editor-form {
                grid-column: 1;
                grid-row: 3;
            }

            .editor-nav-toggle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                min-height: 40px;
                border: 0;
                background: transparent;
                color: var(--md-sys-color-on-surface, #121714);
                cursor: pointer;
                font-family: var(--font-sans, 'DM Sans', sans-serif);
                font-size: 0.875rem;
                font-weight: 600;
                text-align: left;
            }

            .editor-nav-toggle .material-symbols-outlined {
                transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            }

            .editor-nav.open .editor-nav-toggle .material-symbols-outlined {
                transform: rotate(180deg);
            }

            .editor-nav-title {
                display: none;
            }

            .editor-nav-list {
                display: none;
                max-height: min(56vh, 520px);
                overflow-y: auto;
                padding-top: var(--spacing-xs, 4px);
            }

            .editor-nav.open .editor-nav-list {
                display: flex;
            }

            .hero-controls {
                grid-template-columns: 1fr;
            }

            .visibility-setting {
                grid-template-columns: 1fr;
                gap: var(--spacing-sm, 8px);
            }
        }
    `);
customElements.define("wy-prompt-editor", WyPromptEditor);

// components/ui/wy-step-editor.js
var WyStepEditor = class extends i4 {
  constructor() {
    super();
    this.step = null;
    this.index = 0;
    this.total = 1;
    this.expanded = false;
  }
  _handleToggle() {
    this.dispatchEvent(new CustomEvent("step-toggle", {
      detail: { index: this.index, expanded: !this.expanded },
      bubbles: true,
      composed: true
    }));
  }
  _handleFieldChange(field, value) {
    if (!this.step) return;
    const updatedStep = {
      ...this.step,
      [field]: value
    };
    this.dispatchEvent(new CustomEvent("step-change", {
      detail: { index: this.index, step: updatedStep },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariableChange(e9) {
    this._handleFieldChange("variables", e9.detail.variables);
  }
  _handleTemplateChange(e9) {
    this._handleFieldChange("template", e9.detail.value);
  }
  _handleMoveUp() {
    this.dispatchEvent(new CustomEvent("step-move-up", {
      detail: { index: this.index },
      bubbles: true,
      composed: true
    }));
  }
  _handleMoveDown() {
    this.dispatchEvent(new CustomEvent("step-move-down", {
      detail: { index: this.index },
      bubbles: true,
      composed: true
    }));
  }
  _handleDelete() {
    const confirmMessage = `Delete "${this.step?.name || "this step"}"?

This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.dispatchEvent(new CustomEvent("step-delete", {
        detail: { index: this.index },
        bubbles: true,
        composed: true
      }));
    }
  }
  render() {
    if (!this.step) {
      return b2`<div>No step data</div>`;
    }
    const variableNames = (this.step.variables || []).map((v3) => v3.name);
    const isFirst = this.index === 0;
    const isLast = this.index === this.total - 1;
    return b2`
            <div class="step-card ${this.expanded ? "expanded" : ""}">
                <!-- Header -->
                <div class="step-header" @click="${this._handleToggle}">
                    <div class="step-badge">Step ${this.index + 1}</div>
                    <h3 class="step-title">${this.step.name || "Unnamed Step"}</h3>
                    <span class="material-symbols-outlined collapse-icon">
                        expand_more
                    </span>
                </div>

                <!-- Content -->
                <div class="step-content">
                    <div class="step-content-inner">
                        <div class="step-fields">
                            <!-- Step Name -->
                            <div class="field-group">
                                <label class="field-label" for="step-name-${this.index}">
                                    Step Name
                                </label>
                                <input
                                    type="text"
                                    id="step-name-${this.index}"
                                    .value="${this.step.name || ""}"
                                    @input="${(e9) => this._handleFieldChange("name", e9.target.value)}"
                                    placeholder="e.g., Conceptual Decomposition"
                                >
                            </div>

                            <!-- Step ID -->
                            <div class="field-group">
                                <label class="field-label" for="step-id-${this.index}">
                                    Step ID
                                </label>
                                <p class="field-description">
                                    Unique identifier for this step (lowercase, no spaces)
                                </p>
                                <input
                                    type="text"
                                    id="step-id-${this.index}"
                                    .value="${this.step.id || ""}"
                                    @input="${(e9) => this._handleFieldChange("id", e9.target.value)}"
                                    placeholder="e.g., decomposition"
                                >
                            </div>

                            <!-- Instructions -->
                            <div class="field-group">
                                <label class="field-label" for="step-instructions-${this.index}">
                                    Instructions
                                </label>
                                <p class="field-description">
                                    Helper text shown to users explaining what to do in this step
                                </p>
                                <textarea
                                    id="step-instructions-${this.index}"
                                    .value="${this.step.instructions || ""}"
                                    @input="${(e9) => this._handleFieldChange("instructions", e9.target.value)}"
                                    placeholder="e.g., Start by entering your topic. This step will identify three distinct conceptual pillars..."
                                ></textarea>
                            </div>

                            <!-- Variables -->
                            <div class="field-group">
                                <label class="field-label">Variables</label>
                                <p class="field-description">
                                    Define input fields for this step
                                </p>
                                <wy-variable-editor
                                    .variables="${this.step.variables || []}"
                                    @change="${this._handleVariableChange}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Template -->
                            <div class="field-group">
                                <label class="field-label">Template</label>
                                <p class="field-description">
                                    Prompt template for this step. Use {{variable-name}} for substitutions.
                                </p>
                                <wy-code-textarea
                                    .value="${this.step.template || ""}"
                                    .variables="${variableNames}"
                                    placeholder="Enter your prompt template here..."
                                    rows="12"
                                    @value-input="${this._handleTemplateChange}"
                                ></wy-code-textarea>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="step-controls">
                            <button
                                class="control-button"
                                @click="${this._handleMoveUp}"
                                ?disabled="${isFirst}"
                                title="Move step up"
                            >
                                <span class="material-symbols-outlined">arrow_upward</span>
                                Move Up
                            </button>
                            <button
                                class="control-button"
                                @click="${this._handleMoveDown}"
                                ?disabled="${isLast}"
                                title="Move step down"
                            >
                                <span class="material-symbols-outlined">arrow_downward</span>
                                Move Down
                            </button>
                            <button
                                class="control-button delete"
                                @click="${this._handleDelete}"
                                title="Delete step"
                            >
                                <span class="material-symbols-outlined">delete</span>
                                Delete Step
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }
};
__publicField(WyStepEditor, "properties", {
  step: { type: Object },
  index: { type: Number },
  total: { type: Number },
  expanded: { type: Boolean }
});
__publicField(WyStepEditor, "styles", i`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1');

        :host {
            display: block;
            margin-bottom: var(--spacing-md, 16px);
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
        }

        .step-card {
            background-color: var(--field-bg, #FBF9F4);
            border-radius: var(--radius-2, 10px);
            border: 0;
            overflow: hidden;
            transition:
                box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .step-card.expanded {
            box-shadow: 0 8px 22px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .step-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            padding: 14px 16px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            user-select: none;
        }

        .step-header::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .step-header:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .step-badge {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 4px 11px;
            background-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFFFFF);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .step-title {
            flex: 1;
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.0625rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .collapse-icon {
            flex-shrink: 0;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .step-card.expanded .collapse-icon {
            transform: rotate(180deg);
        }

        .step-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
        }

        .step-card.expanded .step-content {
            grid-template-rows: 1fr;
        }

        .step-content-inner {
            overflow: hidden;
        }

        .step-fields {
            padding: 4px var(--spacing-md, 16px) var(--spacing-md, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .step-controls {
            display: flex;
            gap: var(--spacing-sm, 8px);
            padding: 10px var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 3.5%, transparent);
            box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .control-button {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background: color-mix(in srgb, var(--ink, #1A1A1A) 4%, transparent);
            border: 0;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .control-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .control-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .control-button:focus-visible {
            outline: 3px solid var(--md-sys-color-primary, #282828);
            outline-offset: 2px;
        }

        .control-button:disabled {
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
            cursor: not-allowed;
        }

        .control-button.delete {
            margin-left: auto;
            color: var(--md-sys-color-error, #BA1A1A);
        }

        .control-button.delete::before {
            background-color: var(--md-sys-color-error, #BA1A1A);
        }

        .control-button .material-symbols-outlined {
            font-size: 18px;
        }

        .field-group {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);
        }

        .field-label {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .field-description {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-top: calc(-1 * var(--spacing-xs, 4px));
        }

        input,
        textarea {
            width: 100%;
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            color: var(--md-sys-color-on-surface, #121714);
            background-color: var(--surface-2, #FFF);
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
            transition: box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        input:focus,
        textarea:focus {
            outline: none;
            box-shadow:
                inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary, #282828) 24%, transparent),
                0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary, #282828) 8%, transparent);
        }

        textarea {
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
        }
    `);
customElements.define("wy-step-editor", WyStepEditor);

// node_modules/lit-html/directive-helpers.js
var { I: t5 } = j;
var r6 = (o8) => void 0 === o8.strings;
var m2 = {};
var p3 = (o8, t6 = m2) => o8._$AH = t6;

// node_modules/lit-html/directives/live.js
var l3 = e6(class extends i5 {
  constructor(r7) {
    if (super(r7), r7.type !== t4.PROPERTY && r7.type !== t4.ATTRIBUTE && r7.type !== t4.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!r6(r7)) throw Error("`live` bindings can only contain a single expression");
  }
  render(r7) {
    return r7;
  }
  update(i6, [t6]) {
    if (t6 === E || t6 === A) return t6;
    const o8 = i6.element, l6 = i6.name;
    if (i6.type === t4.PROPERTY) {
      if (t6 === o8[l6]) return E;
    } else if (i6.type === t4.BOOLEAN_ATTRIBUTE) {
      if (!!t6 === o8.hasAttribute(l6)) return E;
    } else if (i6.type === t4.ATTRIBUTE && o8.getAttribute(l6) === t6 + "") return E;
    return p3(i6), t6;
  }
});

// node_modules/lit-html/directives/unsafe-html.js
var e8 = class extends i5 {
  constructor(i6) {
    if (super(i6), this.it = A, i6.type !== t4.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(r7) {
    if (r7 === A || null == r7) return this._t = void 0, this.it = r7;
    if (r7 === E) return r7;
    if ("string" != typeof r7) throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (r7 === this.it) return this._t;
    this.it = r7;
    const s4 = [r7];
    return s4.raw = s4, this._t = { _$litType$: this.constructor.resultType, strings: s4, values: [] };
  }
};
e8.directiveName = "unsafeHTML", e8.resultType = 1;
var o7 = e6(e8);

// node_modules/marked/lib/marked.esm.js
function M2() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T2 = M2();
function N2(l6) {
  T2 = l6;
}
var _2 = { exec: () => null };
function E2(l6) {
  let e9 = [];
  return (t6) => {
    let n5 = Math.max(0, Math.min(3, t6 - 1)), s4 = e9[n5];
    return s4 || (s4 = l6(n5), e9[n5] = s4), s4;
  };
}
function d3(l6, e9 = "") {
  let t6 = typeof l6 == "string" ? l6 : l6.source, n5 = { replace: (s4, r7) => {
    let i6 = typeof r7 == "string" ? r7 : r7.source;
    return i6 = i6.replace(m3.caret, "$1"), t6 = t6.replace(s4, i6), n5;
  }, getRegex: () => new RegExp(t6, e9) };
  return n5;
}
var Te = ((l6 = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + l6);
  } catch {
    return false;
  }
})();
var m3 = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l6) => new RegExp(`^( {0,3}${l6})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: E2((l6) => new RegExp(`^ {0,${l6}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: E2((l6) => new RegExp(`^ {0,${l6}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)), fencesBeginRegex: E2((l6) => new RegExp(`^ {0,${l6}}(?:\`\`\`|~~~)`)), headingBeginRegex: E2((l6) => new RegExp(`^ {0,${l6}}#`)), htmlBeginRegex: E2((l6) => new RegExp(`^ {0,${l6}}<(?:[a-z].*>|!--)`, "i")), blockquoteBeginRegex: E2((l6) => new RegExp(`^ {0,${l6}}>`)) };
var Oe = /^(?:[ \t]*(?:\n|$))+/;
var we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var B2 = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var j2 = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var ae = d3(oe).replace(/bull/g, j2).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var Se = d3(oe).replace(/bull/g, j2).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var F = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var $e = /^[^\n]+/;
var U = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var Le = d3(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", U).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var _e = d3(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, j2).getRegex();
var H2 = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var K = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var ze = d3("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", K).replace("tag", H2).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var le = d3(F).replace("hr", B2).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H2).getRegex();
var Me = d3(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", le).getRegex();
var W = { blockquote: Me, code: we, def: Le, fences: ye, heading: Pe, hr: B2, html: ze, lheading: ae, list: _e, newline: Oe, paragraph: le, table: _2, text: $e };
var se = d3("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", B2).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H2).getRegex();
var Ee = { ...W, lheading: Se, table: se, paragraph: d3(F).replace("hr", B2).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H2).getRegex() };
var Ie = { ...W, html: d3(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", K).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: _2, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: d3(F).replace("hr", B2).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ae = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ce = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var ue = /^( {2,}|\\)\n(?!\s*$)/;
var Be = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var I2 = /[\p{P}\p{S}]/u;
var Z2 = /[\s\p{P}\p{S}]/u;
var X = /[^\s\p{P}\p{S}]/u;
var De = d3(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Z2).getRegex();
var pe = /(?!~)[\p{P}\p{S}]/u;
var qe = /(?!~)[\s\p{P}\p{S}]/u;
var ve = /(?:[^\s\p{P}\p{S}]|~)/u;
var He = d3(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
var Ze = d3(ce, "u").replace(/punct/g, I2).getRegex();
var Ge = d3(ce, "u").replace(/punct/g, pe).getRegex();
var he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var Ne = d3(he, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z2).replace(/punct/g, I2).getRegex();
var Qe = d3(he, "gu").replace(/notPunctSpace/g, ve).replace(/punctSpace/g, qe).replace(/punct/g, pe).getRegex();
var je = d3("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z2).replace(/punct/g, I2).getRegex();
var Fe = d3(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, I2).getRegex();
var Ue = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var Ke = d3(Ue, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z2).replace(/punct/g, I2).getRegex();
var We = d3(/\\(punct)/, "gu").replace(/punct/g, I2).getRegex();
var Xe = d3(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var Je = d3(K).replace("(?:-->|$)", "-->").getRegex();
var Ve = d3("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Je).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var v2 = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/;
var Ye = d3(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", v2).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var ke = d3(/^!?\[(label)\]\[(ref)\]/).replace("label", v2).replace("ref", U).getRegex();
var de = d3(/^!?\[(ref)\](?:\[\])?/).replace("ref", U).getRegex();
var et = d3("reflink|nolink(?!\\()", "g").replace("reflink", ke).replace("nolink", de).getRegex();
var ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var J = { _backpedal: _2, anyPunctuation: We, autolink: Xe, blockSkip: He, br: ue, code: Ce, del: _2, delLDelim: _2, delRDelim: _2, emStrongLDelim: Ze, emStrongRDelimAst: Ne, emStrongRDelimUnd: je, escape: Ae, link: Ye, nolink: de, punctuation: De, reflink: ke, reflinkSearch: et, tag: Ve, text: Be, url: _2 };
var tt = { ...J, link: d3(/^!?\[(label)\]\((.*?)\)/).replace("label", v2).getRegex(), reflink: d3(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", v2).getRegex() };
var Q = { ...J, emStrongRDelimAst: Qe, emStrongLDelim: Ge, delLDelim: Fe, delRDelim: Ke, url: d3(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: d3(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex() };
var nt = { ...Q, br: d3(ue).replace("{2,}", "*").getRegex(), text: d3(Q.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var D2 = { normal: W, gfm: Ee, pedantic: Ie };
var A2 = { normal: J, gfm: Q, breaks: nt, pedantic: tt };
var rt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ge = (l6) => rt[l6];
function O(l6, e9) {
  if (e9) {
    if (m3.escapeTest.test(l6)) return l6.replace(m3.escapeReplace, ge);
  } else if (m3.escapeTestNoEncode.test(l6)) return l6.replace(m3.escapeReplaceNoEncode, ge);
  return l6;
}
function V2(l6) {
  try {
    l6 = encodeURI(l6).replace(m3.percentDecode, "%");
  } catch {
    return null;
  }
  return l6;
}
function Y(l6, e9) {
  let t6 = l6.replace(m3.findPipe, (r7, i6, o8) => {
    let u3 = false, a3 = i6;
    for (; --a3 >= 0 && o8[a3] === "\\"; ) u3 = !u3;
    return u3 ? "|" : " |";
  }), n5 = t6.split(m3.splitPipe), s4 = 0;
  if (n5[0].trim() || n5.shift(), n5.length > 0 && !n5.at(-1)?.trim() && n5.pop(), e9) if (n5.length > e9) n5.splice(e9);
  else for (; n5.length < e9; ) n5.push("");
  for (; s4 < n5.length; s4++) n5[s4] = n5[s4].trim().replace(m3.slashPipe, "|");
  return n5;
}
function $2(l6, e9, t6) {
  let n5 = l6.length;
  if (n5 === 0) return "";
  let s4 = 0;
  for (; s4 < n5; ) {
    let r7 = l6.charAt(n5 - s4 - 1);
    if (r7 === e9 && !t6) s4++;
    else if (r7 !== e9 && t6) s4++;
    else break;
  }
  return l6.slice(0, n5 - s4);
}
function ee(l6) {
  let e9 = l6.split(`
`), t6 = e9.length - 1;
  for (; t6 >= 0 && m3.blankLine.test(e9[t6]); ) t6--;
  return e9.length - t6 <= 2 ? l6 : e9.slice(0, t6 + 1).join(`
`);
}
function fe(l6, e9) {
  if (l6.indexOf(e9[1]) === -1) return -1;
  let t6 = 0;
  for (let n5 = 0; n5 < l6.length; n5++) if (l6[n5] === "\\") n5++;
  else if (l6[n5] === e9[0]) t6++;
  else if (l6[n5] === e9[1] && (t6--, t6 < 0)) return n5;
  return t6 > 0 ? -2 : -1;
}
function me(l6, e9 = 0) {
  let t6 = e9, n5 = "";
  for (let s4 of l6) if (s4 === "	") {
    let r7 = 4 - t6 % 4;
    n5 += " ".repeat(r7), t6 += r7;
  } else n5 += s4, t6++;
  return n5;
}
function xe(l6, e9, t6, n5, s4) {
  let r7 = e9.href, i6 = e9.title || null, o8 = l6[1].replace(s4.other.outputLinkReplace, "$1");
  n5.state.inLink = true;
  let u3 = { type: l6[0].charAt(0) === "!" ? "image" : "link", raw: t6, href: r7, title: i6, text: o8, tokens: n5.inlineTokens(o8) };
  return n5.state.inLink = false, u3;
}
function st(l6, e9, t6) {
  let n5 = l6.match(t6.other.indentCodeCompensation);
  if (n5 === null) return e9;
  let s4 = n5[1];
  return e9.split(`
`).map((r7) => {
    let i6 = r7.match(t6.other.beginningSpace);
    if (i6 === null) return r7;
    let [o8] = i6;
    return o8.length >= s4.length ? r7.slice(s4.length) : r7;
  }).join(`
`);
}
var w2 = class {
  constructor(e9) {
    __publicField(this, "options");
    __publicField(this, "rules");
    __publicField(this, "lexer");
    this.options = e9 || T2;
  }
  space(e9) {
    let t6 = this.rules.block.newline.exec(e9);
    if (t6 && t6[0].length > 0) return { type: "space", raw: t6[0] };
  }
  code(e9) {
    let t6 = this.rules.block.code.exec(e9);
    if (t6) {
      let n5 = this.options.pedantic ? t6[0] : ee(t6[0]), s4 = n5.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n5, codeBlockStyle: "indented", text: s4 };
    }
  }
  fences(e9) {
    let t6 = this.rules.block.fences.exec(e9);
    if (t6) {
      let n5 = t6[0], s4 = st(n5, t6[3] || "", this.rules);
      return { type: "code", raw: n5, lang: t6[2] ? t6[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t6[2], text: s4 };
    }
  }
  heading(e9) {
    let t6 = this.rules.block.heading.exec(e9);
    if (t6) {
      let n5 = t6[2].trim();
      if (this.rules.other.endingHash.test(n5)) {
        let s4 = $2(n5, "#");
        (this.options.pedantic || !s4 || this.rules.other.endingSpaceChar.test(s4)) && (n5 = s4.trim());
      }
      return { type: "heading", raw: $2(t6[0], `
`), depth: t6[1].length, text: n5, tokens: this.lexer.inline(n5) };
    }
  }
  hr(e9) {
    let t6 = this.rules.block.hr.exec(e9);
    if (t6) return { type: "hr", raw: $2(t6[0], `
`) };
  }
  blockquote(e9) {
    let t6 = this.rules.block.blockquote.exec(e9);
    if (t6) {
      let n5 = $2(t6[0], `
`).split(`
`), s4 = "", r7 = "", i6 = [];
      for (; n5.length > 0; ) {
        let o8 = false, u3 = [], a3;
        for (a3 = 0; a3 < n5.length; a3++) if (this.rules.other.blockquoteStart.test(n5[a3])) u3.push(n5[a3]), o8 = true;
        else if (!o8) u3.push(n5[a3]);
        else break;
        n5 = n5.slice(a3);
        let c4 = u3.join(`
`), p4 = c4.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s4 = s4 ? `${s4}
${c4}` : c4, r7 = r7 ? `${r7}
${p4}` : p4;
        let k2 = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(p4, i6, true), this.lexer.state.top = k2, n5.length === 0) break;
        let h3 = i6.at(-1);
        if (h3?.type === "code") break;
        if (h3?.type === "blockquote") {
          let R2 = h3, f3 = R2.raw + `
` + n5.join(`
`), S3 = this.blockquote(f3);
          i6[i6.length - 1] = S3, s4 = s4.substring(0, s4.length - R2.raw.length) + S3.raw, r7 = r7.substring(0, r7.length - R2.text.length) + S3.text;
          break;
        } else if (h3?.type === "list") {
          let R2 = h3, f3 = R2.raw + `
` + n5.join(`
`), S3 = this.list(f3);
          i6[i6.length - 1] = S3, s4 = s4.substring(0, s4.length - h3.raw.length) + S3.raw, r7 = r7.substring(0, r7.length - R2.raw.length) + S3.raw, n5 = f3.substring(i6.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s4, tokens: i6, text: r7 };
    }
  }
  list(e9) {
    let t6 = this.rules.block.list.exec(e9);
    if (t6) {
      let n5 = t6[1].trim(), s4 = n5.length > 1, r7 = { type: "list", raw: "", ordered: s4, start: s4 ? +n5.slice(0, -1) : "", loose: false, items: [] };
      n5 = s4 ? `\\d{1,9}\\${n5.slice(-1)}` : `\\${n5}`, this.options.pedantic && (n5 = s4 ? n5 : "[*+-]");
      let i6 = this.rules.other.listItemRegex(n5), o8 = false;
      for (; e9; ) {
        let a3 = false, c4 = "", p4 = "";
        if (!(t6 = i6.exec(e9)) || this.rules.block.hr.test(e9)) break;
        c4 = t6[0], e9 = e9.substring(c4.length);
        let k2 = me(t6[2].split(`
`, 1)[0], t6[1].length), h3 = e9.split(`
`, 1)[0], R2 = !k2.trim(), f3 = 0;
        if (this.options.pedantic ? (f3 = 2, p4 = k2.trimStart()) : R2 ? f3 = t6[1].length + 1 : (f3 = k2.search(this.rules.other.nonSpaceChar), f3 = f3 > 4 ? 1 : f3, p4 = k2.slice(f3), f3 += t6[1].length), R2 && this.rules.other.blankLine.test(h3) && (c4 += h3 + `
`, e9 = e9.substring(h3.length + 1), a3 = true), !a3) {
          let S3 = this.rules.other.nextBulletRegex(f3), te = this.rules.other.hrRegex(f3), ne = this.rules.other.fencesBeginRegex(f3), re = this.rules.other.headingBeginRegex(f3), be = this.rules.other.htmlBeginRegex(f3), Re = this.rules.other.blockquoteBeginRegex(f3);
          for (; e9; ) {
            let G = e9.split(`
`, 1)[0], C2;
            if (h3 = G, this.options.pedantic ? (h3 = h3.replace(this.rules.other.listReplaceNesting, "  "), C2 = h3) : C2 = h3.replace(this.rules.other.tabCharGlobal, "    "), ne.test(h3) || re.test(h3) || be.test(h3) || Re.test(h3) || S3.test(h3) || te.test(h3)) break;
            if (C2.search(this.rules.other.nonSpaceChar) >= f3 || !h3.trim()) p4 += `
` + C2.slice(f3);
            else {
              if (R2 || k2.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(k2) || re.test(k2) || te.test(k2)) break;
              p4 += `
` + h3;
            }
            R2 = !h3.trim(), c4 += G + `
`, e9 = e9.substring(G.length + 1), k2 = C2.slice(f3);
          }
        }
        r7.loose || (o8 ? r7.loose = true : this.rules.other.doubleBlankLine.test(c4) && (o8 = true)), r7.items.push({ type: "list_item", raw: c4, task: !!this.options.gfm && this.rules.other.listIsTask.test(p4), loose: false, text: p4, tokens: [] }), r7.raw += c4;
      }
      let u3 = r7.items.at(-1);
      if (u3) u3.raw = u3.raw.trimEnd(), u3.text = u3.text.trimEnd();
      else return;
      r7.raw = r7.raw.trimEnd();
      for (let a3 of r7.items) {
        this.lexer.state.top = false, a3.tokens = this.lexer.blockTokens(a3.text, []);
        let c4 = a3.tokens[0];
        if (a3.task && (c4?.type === "text" || c4?.type === "paragraph")) {
          a3.text = a3.text.replace(this.rules.other.listReplaceTask, ""), c4.raw = c4.raw.replace(this.rules.other.listReplaceTask, ""), c4.text = c4.text.replace(this.rules.other.listReplaceTask, "");
          for (let k2 = this.lexer.inlineQueue.length - 1; k2 >= 0; k2--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[k2].src)) {
            this.lexer.inlineQueue[k2].src = this.lexer.inlineQueue[k2].src.replace(this.rules.other.listReplaceTask, "");
            break;
          }
          let p4 = this.rules.other.listTaskCheckbox.exec(a3.raw);
          if (p4) {
            let k2 = { type: "checkbox", raw: p4[0] + " ", checked: p4[0] !== "[ ]" };
            a3.checked = k2.checked, r7.loose ? a3.tokens[0] && ["paragraph", "text"].includes(a3.tokens[0].type) && "tokens" in a3.tokens[0] && a3.tokens[0].tokens ? (a3.tokens[0].raw = k2.raw + a3.tokens[0].raw, a3.tokens[0].text = k2.raw + a3.tokens[0].text, a3.tokens[0].tokens.unshift(k2)) : a3.tokens.unshift({ type: "paragraph", raw: k2.raw, text: k2.raw, tokens: [k2] }) : a3.tokens.unshift(k2);
          }
        } else a3.task && (a3.task = false);
        if (!r7.loose) {
          let p4 = a3.tokens.filter((h3) => h3.type === "space"), k2 = p4.length > 0 && p4.some((h3) => this.rules.other.anyLine.test(h3.raw));
          r7.loose = k2;
        }
      }
      if (r7.loose) for (let a3 of r7.items) {
        a3.loose = true;
        for (let c4 of a3.tokens) c4.type === "text" && (c4.type = "paragraph");
      }
      return r7;
    }
  }
  html(e9) {
    let t6 = this.rules.block.html.exec(e9);
    if (t6) {
      let n5 = ee(t6[0]);
      return { type: "html", block: true, raw: n5, pre: t6[1] === "pre" || t6[1] === "script" || t6[1] === "style", text: n5 };
    }
  }
  def(e9) {
    let t6 = this.rules.block.def.exec(e9);
    if (t6) {
      let n5 = t6[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s4 = t6[2] ? t6[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r7 = t6[3] ? t6[3].substring(1, t6[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t6[3];
      return { type: "def", tag: n5, raw: $2(t6[0], `
`), href: s4, title: r7 };
    }
  }
  table(e9) {
    let t6 = this.rules.block.table.exec(e9);
    if (!t6 || !this.rules.other.tableDelimiter.test(t6[2])) return;
    let n5 = Y(t6[1]), s4 = t6[2].replace(this.rules.other.tableAlignChars, "").split("|"), r7 = t6[3]?.trim() ? t6[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i6 = { type: "table", raw: $2(t6[0], `
`), header: [], align: [], rows: [] };
    if (n5.length === s4.length) {
      for (let o8 of s4) this.rules.other.tableAlignRight.test(o8) ? i6.align.push("right") : this.rules.other.tableAlignCenter.test(o8) ? i6.align.push("center") : this.rules.other.tableAlignLeft.test(o8) ? i6.align.push("left") : i6.align.push(null);
      for (let o8 = 0; o8 < n5.length; o8++) i6.header.push({ text: n5[o8], tokens: this.lexer.inline(n5[o8]), header: true, align: i6.align[o8] });
      for (let o8 of r7) i6.rows.push(Y(o8, i6.header.length).map((u3, a3) => ({ text: u3, tokens: this.lexer.inline(u3), header: false, align: i6.align[a3] })));
      return i6;
    }
  }
  lheading(e9) {
    let t6 = this.rules.block.lheading.exec(e9);
    if (t6) {
      let n5 = t6[1].trim();
      return { type: "heading", raw: $2(t6[0], `
`), depth: t6[2].charAt(0) === "=" ? 1 : 2, text: n5, tokens: this.lexer.inline(n5) };
    }
  }
  paragraph(e9) {
    let t6 = this.rules.block.paragraph.exec(e9);
    if (t6) {
      let n5 = t6[1].charAt(t6[1].length - 1) === `
` ? t6[1].slice(0, -1) : t6[1];
      return { type: "paragraph", raw: t6[0], text: n5, tokens: this.lexer.inline(n5) };
    }
  }
  text(e9) {
    let t6 = this.rules.block.text.exec(e9);
    if (t6) return { type: "text", raw: t6[0], text: t6[0], tokens: this.lexer.inline(t6[0]) };
  }
  escape(e9) {
    let t6 = this.rules.inline.escape.exec(e9);
    if (t6) return { type: "escape", raw: t6[0], text: t6[1] };
  }
  tag(e9) {
    let t6 = this.rules.inline.tag.exec(e9);
    if (t6) return !this.lexer.state.inLink && this.rules.other.startATag.test(t6[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t6[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t6[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t6[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t6[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t6[0] };
  }
  link(e9) {
    let t6 = this.rules.inline.link.exec(e9);
    if (t6) {
      let n5 = t6[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n5)) {
        if (!this.rules.other.endAngleBracket.test(n5)) return;
        let i6 = $2(n5.slice(0, -1), "\\");
        if ((n5.length - i6.length) % 2 === 0) return;
      } else {
        let i6 = fe(t6[2], "()");
        if (i6 === -2) return;
        if (i6 > -1) {
          let u3 = (t6[0].indexOf("!") === 0 ? 5 : 4) + t6[1].length + i6;
          t6[2] = t6[2].substring(0, i6), t6[0] = t6[0].substring(0, u3).trim(), t6[3] = "";
        }
      }
      let s4 = t6[2], r7 = "";
      if (this.options.pedantic) {
        let i6 = this.rules.other.pedanticHrefTitle.exec(s4);
        i6 && (s4 = i6[1], r7 = i6[3]);
      } else r7 = t6[3] ? t6[3].slice(1, -1) : "";
      return s4 = s4.trim(), this.rules.other.startAngleBracket.test(s4) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n5) ? s4 = s4.slice(1) : s4 = s4.slice(1, -1)), xe(t6, { href: s4 && s4.replace(this.rules.inline.anyPunctuation, "$1"), title: r7 && r7.replace(this.rules.inline.anyPunctuation, "$1") }, t6[0], this.lexer, this.rules);
    }
  }
  reflink(e9, t6) {
    let n5;
    if ((n5 = this.rules.inline.reflink.exec(e9)) || (n5 = this.rules.inline.nolink.exec(e9))) {
      let s4 = (n5[2] || n5[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r7 = t6[s4.toLowerCase()];
      if (!r7) {
        let i6 = n5[0].charAt(0);
        return { type: "text", raw: i6, text: i6 };
      }
      return xe(n5, r7, n5[0], this.lexer, this.rules);
    }
  }
  emStrong(e9, t6, n5 = "") {
    let s4 = this.rules.inline.emStrongLDelim.exec(e9);
    if (!s4 || !s4[1] && !s4[2] && !s4[3] && !s4[4] || s4[4] && n5.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s4[1] || s4[3] || "") || !n5 || this.rules.inline.punctuation.exec(n5)) {
      let i6 = [...s4[0]].length - 1, o8, u3, a3 = i6, c4 = 0, p4 = s4[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (p4.lastIndex = 0, t6 = t6.slice(-1 * e9.length + i6); (s4 = p4.exec(t6)) !== null; ) {
        if (o8 = s4[1] || s4[2] || s4[3] || s4[4] || s4[5] || s4[6], !o8) continue;
        if (u3 = [...o8].length, s4[3] || s4[4]) {
          a3 += u3;
          continue;
        } else if ((s4[5] || s4[6]) && i6 % 3 && !((i6 + u3) % 3)) {
          c4 += u3;
          continue;
        }
        if (a3 -= u3, a3 > 0) continue;
        u3 = Math.min(u3, u3 + a3 + c4);
        let k2 = [...s4[0]][0].length, h3 = e9.slice(0, i6 + s4.index + k2 + u3);
        if (Math.min(i6, u3) % 2) {
          let f3 = h3.slice(1, -1);
          return { type: "em", raw: h3, text: f3, tokens: this.lexer.inlineTokens(f3) };
        }
        let R2 = h3.slice(2, -2);
        return { type: "strong", raw: h3, text: R2, tokens: this.lexer.inlineTokens(R2) };
      }
    }
  }
  codespan(e9) {
    let t6 = this.rules.inline.code.exec(e9);
    if (t6) {
      let n5 = t6[2].replace(this.rules.other.newLineCharGlobal, " "), s4 = this.rules.other.nonSpaceChar.test(n5), r7 = this.rules.other.startingSpaceChar.test(n5) && this.rules.other.endingSpaceChar.test(n5);
      return s4 && r7 && (n5 = n5.substring(1, n5.length - 1)), { type: "codespan", raw: t6[0], text: n5 };
    }
  }
  br(e9) {
    let t6 = this.rules.inline.br.exec(e9);
    if (t6) return { type: "br", raw: t6[0] };
  }
  del(e9, t6, n5 = "") {
    let s4 = this.rules.inline.delLDelim.exec(e9);
    if (!s4) return;
    if (!(s4[1] || "") || !n5 || this.rules.inline.punctuation.exec(n5)) {
      let i6 = [...s4[0]].length - 1, o8, u3, a3 = i6, c4 = this.rules.inline.delRDelim;
      for (c4.lastIndex = 0, t6 = t6.slice(-1 * e9.length + i6); (s4 = c4.exec(t6)) !== null; ) {
        if (o8 = s4[1] || s4[2] || s4[3] || s4[4] || s4[5] || s4[6], !o8 || (u3 = [...o8].length, u3 !== i6)) continue;
        if (s4[3] || s4[4]) {
          a3 += u3;
          continue;
        }
        if (a3 -= u3, a3 > 0) continue;
        u3 = Math.min(u3, u3 + a3);
        let p4 = [...s4[0]][0].length, k2 = e9.slice(0, i6 + s4.index + p4 + u3), h3 = k2.slice(i6, -i6);
        return { type: "del", raw: k2, text: h3, tokens: this.lexer.inlineTokens(h3) };
      }
    }
  }
  autolink(e9) {
    let t6 = this.rules.inline.autolink.exec(e9);
    if (t6) {
      let n5, s4;
      return t6[2] === "@" ? (n5 = t6[1], s4 = "mailto:" + n5) : (n5 = t6[1], s4 = n5), { type: "link", raw: t6[0], text: n5, href: s4, tokens: [{ type: "text", raw: n5, text: n5 }] };
    }
  }
  url(e9) {
    let t6;
    if (t6 = this.rules.inline.url.exec(e9)) {
      let n5, s4;
      if (t6[2] === "@") n5 = t6[0], s4 = "mailto:" + n5;
      else {
        let r7;
        do
          r7 = t6[0], t6[0] = this.rules.inline._backpedal.exec(t6[0])?.[0] ?? "";
        while (r7 !== t6[0]);
        n5 = t6[0], t6[1] === "www." ? s4 = "http://" + t6[0] : s4 = t6[0];
      }
      return { type: "link", raw: t6[0], text: n5, href: s4, tokens: [{ type: "text", raw: n5, text: n5 }] };
    }
  }
  inlineText(e9) {
    let t6 = this.rules.inline.text.exec(e9);
    if (t6) {
      let n5 = this.lexer.state.inRawBlock;
      return { type: "text", raw: t6[0], text: t6[0], escaped: n5 };
    }
  }
};
var x2 = class l4 {
  constructor(e9) {
    __publicField(this, "tokens");
    __publicField(this, "options");
    __publicField(this, "state");
    __publicField(this, "inlineQueue");
    __publicField(this, "tokenizer");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e9 || T2, this.options.tokenizer = this.options.tokenizer || new w2(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t6 = { other: m3, block: D2.normal, inline: A2.normal };
    this.options.pedantic ? (t6.block = D2.pedantic, t6.inline = A2.pedantic) : this.options.gfm && (t6.block = D2.gfm, this.options.breaks ? t6.inline = A2.breaks : t6.inline = A2.gfm), this.tokenizer.rules = t6;
  }
  static get rules() {
    return { block: D2, inline: A2 };
  }
  static lex(e9, t6) {
    return new l4(t6).lex(e9);
  }
  static lexInline(e9, t6) {
    return new l4(t6).inlineTokens(e9);
  }
  lex(e9) {
    e9 = e9.replace(m3.carriageReturn, `
`), this.blockTokens(e9, this.tokens);
    for (let t6 = 0; t6 < this.inlineQueue.length; t6++) {
      let n5 = this.inlineQueue[t6];
      this.inlineTokens(n5.src, n5.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e9, t6 = [], n5 = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e9 = e9.replace(m3.tabCharGlobal, "    ").replace(m3.spaceLine, ""));
    let s4 = 1 / 0;
    for (; e9; ) {
      if (e9.length < s4) s4 = e9.length;
      else {
        this.infiniteLoopError(e9.charCodeAt(0));
        break;
      }
      let r7;
      if (this.options.extensions?.block?.some((o8) => (r7 = o8.call({ lexer: this }, e9, t6)) ? (e9 = e9.substring(r7.raw.length), t6.push(r7), true) : false)) continue;
      if (r7 = this.tokenizer.space(e9)) {
        e9 = e9.substring(r7.raw.length);
        let o8 = t6.at(-1);
        r7.raw.length === 1 && o8 !== void 0 ? o8.raw += `
` : t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.code(e9)) {
        e9 = e9.substring(r7.raw.length);
        let o8 = t6.at(-1);
        o8?.type === "paragraph" || o8?.type === "text" ? (o8.raw += (o8.raw.endsWith(`
`) ? "" : `
`) + r7.raw, o8.text += `
` + r7.text, this.inlineQueue.at(-1).src = o8.text) : t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.fences(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.heading(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.hr(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.blockquote(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.list(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.html(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.def(e9)) {
        e9 = e9.substring(r7.raw.length);
        let o8 = t6.at(-1);
        o8?.type === "paragraph" || o8?.type === "text" ? (o8.raw += (o8.raw.endsWith(`
`) ? "" : `
`) + r7.raw, o8.text += `
` + r7.raw, this.inlineQueue.at(-1).src = o8.text) : this.tokens.links[r7.tag] || (this.tokens.links[r7.tag] = { href: r7.href, title: r7.title }, t6.push(r7));
        continue;
      }
      if (r7 = this.tokenizer.table(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      if (r7 = this.tokenizer.lheading(e9)) {
        e9 = e9.substring(r7.raw.length), t6.push(r7);
        continue;
      }
      let i6 = e9;
      if (this.options.extensions?.startBlock) {
        let o8 = 1 / 0, u3 = e9.slice(1), a3;
        this.options.extensions.startBlock.forEach((c4) => {
          a3 = c4.call({ lexer: this }, u3), typeof a3 == "number" && a3 >= 0 && (o8 = Math.min(o8, a3));
        }), o8 < 1 / 0 && o8 >= 0 && (i6 = e9.substring(0, o8 + 1));
      }
      if (this.state.top && (r7 = this.tokenizer.paragraph(i6))) {
        let o8 = t6.at(-1);
        n5 && o8?.type === "paragraph" ? (o8.raw += (o8.raw.endsWith(`
`) ? "" : `
`) + r7.raw, o8.text += `
` + r7.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o8.text) : t6.push(r7), n5 = i6.length !== e9.length, e9 = e9.substring(r7.raw.length);
        continue;
      }
      if (r7 = this.tokenizer.text(e9)) {
        e9 = e9.substring(r7.raw.length);
        let o8 = t6.at(-1);
        o8?.type === "text" ? (o8.raw += (o8.raw.endsWith(`
`) ? "" : `
`) + r7.raw, o8.text += `
` + r7.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o8.text) : t6.push(r7);
        continue;
      }
      if (e9) {
        this.infiniteLoopError(e9.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t6;
  }
  inline(e9, t6 = []) {
    return this.inlineQueue.push({ src: e9, tokens: t6 }), t6;
  }
  inlineTokens(e9, t6 = []) {
    this.tokenizer.lexer = this;
    let n5 = e9, s4 = null;
    if (this.tokens.links) {
      let a3 = Object.keys(this.tokens.links);
      if (a3.length > 0) for (; (s4 = this.tokenizer.rules.inline.reflinkSearch.exec(n5)) !== null; ) a3.includes(s4[0].slice(s4[0].lastIndexOf("[") + 1, -1)) && (n5 = n5.slice(0, s4.index) + "[" + "a".repeat(s4[0].length - 2) + "]" + n5.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (s4 = this.tokenizer.rules.inline.anyPunctuation.exec(n5)) !== null; ) n5 = n5.slice(0, s4.index) + "++" + n5.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let r7;
    for (; (s4 = this.tokenizer.rules.inline.blockSkip.exec(n5)) !== null; ) r7 = s4[2] ? s4[2].length : 0, n5 = n5.slice(0, s4.index + r7) + "[" + "a".repeat(s4[0].length - r7 - 2) + "]" + n5.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n5 = this.options.hooks?.emStrongMask?.call({ lexer: this }, n5) ?? n5;
    let i6 = false, o8 = "", u3 = 1 / 0;
    for (; e9; ) {
      if (e9.length < u3) u3 = e9.length;
      else {
        this.infiniteLoopError(e9.charCodeAt(0));
        break;
      }
      i6 || (o8 = ""), i6 = false;
      let a3;
      if (this.options.extensions?.inline?.some((p4) => (a3 = p4.call({ lexer: this }, e9, t6)) ? (e9 = e9.substring(a3.raw.length), t6.push(a3), true) : false)) continue;
      if (a3 = this.tokenizer.escape(e9)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.tag(e9)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.link(e9)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.reflink(e9, this.tokens.links)) {
        e9 = e9.substring(a3.raw.length);
        let p4 = t6.at(-1);
        a3.type === "text" && p4?.type === "text" ? (p4.raw += a3.raw, p4.text += a3.text) : t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.emStrong(e9, n5, o8)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.codespan(e9)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.br(e9)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.del(e9, n5, o8)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.autolink(e9)) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      if (!this.state.inLink && (a3 = this.tokenizer.url(e9))) {
        e9 = e9.substring(a3.raw.length), t6.push(a3);
        continue;
      }
      let c4 = e9;
      if (this.options.extensions?.startInline) {
        let p4 = 1 / 0, k2 = e9.slice(1), h3;
        this.options.extensions.startInline.forEach((R2) => {
          h3 = R2.call({ lexer: this }, k2), typeof h3 == "number" && h3 >= 0 && (p4 = Math.min(p4, h3));
        }), p4 < 1 / 0 && p4 >= 0 && (c4 = e9.substring(0, p4 + 1));
      }
      if (a3 = this.tokenizer.inlineText(c4)) {
        e9 = e9.substring(a3.raw.length), a3.raw.slice(-1) !== "_" && (o8 = a3.raw.slice(-1)), i6 = true;
        let p4 = t6.at(-1);
        p4?.type === "text" ? (p4.raw += a3.raw, p4.text += a3.text) : t6.push(a3);
        continue;
      }
      if (e9) {
        this.infiniteLoopError(e9.charCodeAt(0));
        break;
      }
    }
    return t6;
  }
  infiniteLoopError(e9) {
    let t6 = "Infinite loop on byte: " + e9;
    if (this.options.silent) console.error(t6);
    else throw new Error(t6);
  }
};
var y3 = class {
  constructor(e9) {
    __publicField(this, "options");
    __publicField(this, "parser");
    this.options = e9 || T2;
  }
  space(e9) {
    return "";
  }
  code({ text: e9, lang: t6, escaped: n5 }) {
    let s4 = (t6 || "").match(m3.notSpaceStart)?.[0], r7 = e9.replace(m3.endingNewline, "") + `
`;
    return s4 ? '<pre><code class="language-' + O(s4) + '">' + (n5 ? r7 : O(r7, true)) + `</code></pre>
` : "<pre><code>" + (n5 ? r7 : O(r7, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e9 }) {
    return `<blockquote>
${this.parser.parse(e9)}</blockquote>
`;
  }
  html({ text: e9 }) {
    return e9;
  }
  def(e9) {
    return "";
  }
  heading({ tokens: e9, depth: t6 }) {
    return `<h${t6}>${this.parser.parseInline(e9)}</h${t6}>
`;
  }
  hr(e9) {
    return `<hr>
`;
  }
  list(e9) {
    let t6 = e9.ordered, n5 = e9.start, s4 = "";
    for (let o8 = 0; o8 < e9.items.length; o8++) {
      let u3 = e9.items[o8];
      s4 += this.listitem(u3);
    }
    let r7 = t6 ? "ol" : "ul", i6 = t6 && n5 !== 1 ? ' start="' + n5 + '"' : "";
    return "<" + r7 + i6 + `>
` + s4 + "</" + r7 + `>
`;
  }
  listitem(e9) {
    return `<li>${this.parser.parse(e9.tokens)}</li>
`;
  }
  checkbox({ checked: e9 }) {
    return "<input " + (e9 ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e9 }) {
    return `<p>${this.parser.parseInline(e9)}</p>
`;
  }
  table(e9) {
    let t6 = "", n5 = "";
    for (let r7 = 0; r7 < e9.header.length; r7++) n5 += this.tablecell(e9.header[r7]);
    t6 += this.tablerow({ text: n5 });
    let s4 = "";
    for (let r7 = 0; r7 < e9.rows.length; r7++) {
      let i6 = e9.rows[r7];
      n5 = "";
      for (let o8 = 0; o8 < i6.length; o8++) n5 += this.tablecell(i6[o8]);
      s4 += this.tablerow({ text: n5 });
    }
    return s4 && (s4 = `<tbody>${s4}</tbody>`), `<table>
<thead>
` + t6 + `</thead>
` + s4 + `</table>
`;
  }
  tablerow({ text: e9 }) {
    return `<tr>
${e9}</tr>
`;
  }
  tablecell(e9) {
    let t6 = this.parser.parseInline(e9.tokens), n5 = e9.header ? "th" : "td";
    return (e9.align ? `<${n5} align="${e9.align}">` : `<${n5}>`) + t6 + `</${n5}>
`;
  }
  strong({ tokens: e9 }) {
    return `<strong>${this.parser.parseInline(e9)}</strong>`;
  }
  em({ tokens: e9 }) {
    return `<em>${this.parser.parseInline(e9)}</em>`;
  }
  codespan({ text: e9 }) {
    return `<code>${O(e9, true)}</code>`;
  }
  br(e9) {
    return "<br>";
  }
  del({ tokens: e9 }) {
    return `<del>${this.parser.parseInline(e9)}</del>`;
  }
  link({ href: e9, title: t6, tokens: n5 }) {
    let s4 = this.parser.parseInline(n5), r7 = V2(e9);
    if (r7 === null) return s4;
    e9 = r7;
    let i6 = '<a href="' + e9 + '"';
    return t6 && (i6 += ' title="' + O(t6) + '"'), i6 += ">" + s4 + "</a>", i6;
  }
  image({ href: e9, title: t6, text: n5, tokens: s4 }) {
    s4 && (n5 = this.parser.parseInline(s4, this.parser.textRenderer));
    let r7 = V2(e9);
    if (r7 === null) return O(n5);
    e9 = r7;
    let i6 = `<img src="${e9}" alt="${O(n5)}"`;
    return t6 && (i6 += ` title="${O(t6)}"`), i6 += ">", i6;
  }
  text(e9) {
    return "tokens" in e9 && e9.tokens ? this.parser.parseInline(e9.tokens) : "escaped" in e9 && e9.escaped ? e9.text : O(e9.text);
  }
};
var L2 = class {
  strong({ text: e9 }) {
    return e9;
  }
  em({ text: e9 }) {
    return e9;
  }
  codespan({ text: e9 }) {
    return e9;
  }
  del({ text: e9 }) {
    return e9;
  }
  html({ text: e9 }) {
    return e9;
  }
  text({ text: e9 }) {
    return e9;
  }
  link({ text: e9 }) {
    return "" + e9;
  }
  image({ text: e9 }) {
    return "" + e9;
  }
  br() {
    return "";
  }
  checkbox({ raw: e9 }) {
    return e9;
  }
};
var b3 = class l5 {
  constructor(e9) {
    __publicField(this, "options");
    __publicField(this, "renderer");
    __publicField(this, "textRenderer");
    this.options = e9 || T2, this.options.renderer = this.options.renderer || new y3(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L2();
  }
  static parse(e9, t6) {
    return new l5(t6).parse(e9);
  }
  static parseInline(e9, t6) {
    return new l5(t6).parseInline(e9);
  }
  parse(e9) {
    this.renderer.parser = this;
    let t6 = "";
    for (let n5 = 0; n5 < e9.length; n5++) {
      let s4 = e9[n5];
      if (this.options.extensions?.renderers?.[s4.type]) {
        let i6 = s4, o8 = this.options.extensions.renderers[i6.type].call({ parser: this }, i6);
        if (o8 !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(i6.type)) {
          t6 += o8 || "";
          continue;
        }
      }
      let r7 = s4;
      switch (r7.type) {
        case "space": {
          t6 += this.renderer.space(r7);
          break;
        }
        case "hr": {
          t6 += this.renderer.hr(r7);
          break;
        }
        case "heading": {
          t6 += this.renderer.heading(r7);
          break;
        }
        case "code": {
          t6 += this.renderer.code(r7);
          break;
        }
        case "table": {
          t6 += this.renderer.table(r7);
          break;
        }
        case "blockquote": {
          t6 += this.renderer.blockquote(r7);
          break;
        }
        case "list": {
          t6 += this.renderer.list(r7);
          break;
        }
        case "checkbox": {
          t6 += this.renderer.checkbox(r7);
          break;
        }
        case "html": {
          t6 += this.renderer.html(r7);
          break;
        }
        case "def": {
          t6 += this.renderer.def(r7);
          break;
        }
        case "paragraph": {
          t6 += this.renderer.paragraph(r7);
          break;
        }
        case "text": {
          t6 += this.renderer.text(r7);
          break;
        }
        default: {
          let i6 = 'Token with "' + r7.type + '" type was not found.';
          if (this.options.silent) return console.error(i6), "";
          throw new Error(i6);
        }
      }
    }
    return t6;
  }
  parseInline(e9, t6 = this.renderer) {
    this.renderer.parser = this;
    let n5 = "";
    for (let s4 = 0; s4 < e9.length; s4++) {
      let r7 = e9[s4];
      if (this.options.extensions?.renderers?.[r7.type]) {
        let o8 = this.options.extensions.renderers[r7.type].call({ parser: this }, r7);
        if (o8 !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(r7.type)) {
          n5 += o8 || "";
          continue;
        }
      }
      let i6 = r7;
      switch (i6.type) {
        case "escape": {
          n5 += t6.text(i6);
          break;
        }
        case "html": {
          n5 += t6.html(i6);
          break;
        }
        case "link": {
          n5 += t6.link(i6);
          break;
        }
        case "image": {
          n5 += t6.image(i6);
          break;
        }
        case "checkbox": {
          n5 += t6.checkbox(i6);
          break;
        }
        case "strong": {
          n5 += t6.strong(i6);
          break;
        }
        case "em": {
          n5 += t6.em(i6);
          break;
        }
        case "codespan": {
          n5 += t6.codespan(i6);
          break;
        }
        case "br": {
          n5 += t6.br(i6);
          break;
        }
        case "del": {
          n5 += t6.del(i6);
          break;
        }
        case "text": {
          n5 += t6.text(i6);
          break;
        }
        default: {
          let o8 = 'Token with "' + i6.type + '" type was not found.';
          if (this.options.silent) return console.error(o8), "";
          throw new Error(o8);
        }
      }
    }
    return n5;
  }
};
var _a;
var P2 = (_a = class {
  constructor(e9) {
    __publicField(this, "options");
    __publicField(this, "block");
    this.options = e9 || T2;
  }
  preprocess(e9) {
    return e9;
  }
  postprocess(e9) {
    return e9;
  }
  processAllTokens(e9) {
    return e9;
  }
  emStrongMask(e9) {
    return e9;
  }
  provideLexer(e9 = this.block) {
    return e9 ? x2.lex : x2.lexInline;
  }
  provideParser(e9 = this.block) {
    return e9 ? b3.parse : b3.parseInline;
  }
}, __publicField(_a, "passThroughHooks", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"])), __publicField(_a, "passThroughHooksRespectAsync", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"])), _a);
var q = class {
  constructor(...e9) {
    __publicField(this, "defaults", M2());
    __publicField(this, "options", this.setOptions);
    __publicField(this, "parse", this.parseMarkdown(true));
    __publicField(this, "parseInline", this.parseMarkdown(false));
    __publicField(this, "Parser", b3);
    __publicField(this, "Renderer", y3);
    __publicField(this, "TextRenderer", L2);
    __publicField(this, "Lexer", x2);
    __publicField(this, "Tokenizer", w2);
    __publicField(this, "Hooks", P2);
    this.use(...e9);
  }
  walkTokens(e9, t6) {
    let n5 = [];
    for (let s4 of e9) switch (n5 = n5.concat(t6.call(this, s4)), s4.type) {
      case "table": {
        let r7 = s4;
        for (let i6 of r7.header) n5 = n5.concat(this.walkTokens(i6.tokens, t6));
        for (let i6 of r7.rows) for (let o8 of i6) n5 = n5.concat(this.walkTokens(o8.tokens, t6));
        break;
      }
      case "list": {
        let r7 = s4;
        n5 = n5.concat(this.walkTokens(r7.items, t6));
        break;
      }
      default: {
        let r7 = s4;
        this.defaults.extensions?.childTokens?.[r7.type] ? this.defaults.extensions.childTokens[r7.type].forEach((i6) => {
          let o8 = r7[i6].flat(1 / 0);
          n5 = n5.concat(this.walkTokens(o8, t6));
        }) : r7.tokens && (n5 = n5.concat(this.walkTokens(r7.tokens, t6)));
      }
    }
    return n5;
  }
  use(...e9) {
    let t6 = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e9.forEach((n5) => {
      let s4 = { ...n5 };
      if (s4.async = this.defaults.async || s4.async || false, n5.extensions && (n5.extensions.forEach((r7) => {
        if (!r7.name) throw new Error("extension name required");
        if ("renderer" in r7) {
          let i6 = t6.renderers[r7.name];
          i6 ? t6.renderers[r7.name] = function(...o8) {
            let u3 = r7.renderer.apply(this, o8);
            return u3 === false && (u3 = i6.apply(this, o8)), u3;
          } : t6.renderers[r7.name] = r7.renderer;
        }
        if ("tokenizer" in r7) {
          if (!r7.level || r7.level !== "block" && r7.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let i6 = t6[r7.level];
          i6 ? i6.unshift(r7.tokenizer) : t6[r7.level] = [r7.tokenizer], r7.start && (r7.level === "block" ? t6.startBlock ? t6.startBlock.push(r7.start) : t6.startBlock = [r7.start] : r7.level === "inline" && (t6.startInline ? t6.startInline.push(r7.start) : t6.startInline = [r7.start]));
        }
        "childTokens" in r7 && r7.childTokens && (t6.childTokens[r7.name] = r7.childTokens);
      }), s4.extensions = t6), n5.renderer) {
        let r7 = this.defaults.renderer || new y3(this.defaults);
        for (let i6 in n5.renderer) {
          if (!(i6 in r7)) throw new Error(`renderer '${i6}' does not exist`);
          if (["options", "parser"].includes(i6)) continue;
          let o8 = i6, u3 = n5.renderer[o8], a3 = r7[o8];
          r7[o8] = (...c4) => {
            let p4 = u3.apply(r7, c4);
            return p4 === false && (p4 = a3.apply(r7, c4)), p4 || "";
          };
        }
        s4.renderer = r7;
      }
      if (n5.tokenizer) {
        let r7 = this.defaults.tokenizer || new w2(this.defaults);
        for (let i6 in n5.tokenizer) {
          if (!(i6 in r7)) throw new Error(`tokenizer '${i6}' does not exist`);
          if (["options", "rules", "lexer"].includes(i6)) continue;
          let o8 = i6, u3 = n5.tokenizer[o8], a3 = r7[o8];
          r7[o8] = (...c4) => {
            let p4 = u3.apply(r7, c4);
            return p4 === false && (p4 = a3.apply(r7, c4)), p4;
          };
        }
        s4.tokenizer = r7;
      }
      if (n5.hooks) {
        let r7 = this.defaults.hooks || new P2();
        for (let i6 in n5.hooks) {
          if (!(i6 in r7)) throw new Error(`hook '${i6}' does not exist`);
          if (["options", "block"].includes(i6)) continue;
          let o8 = i6, u3 = n5.hooks[o8], a3 = r7[o8];
          P2.passThroughHooks.has(i6) ? r7[o8] = (c4) => {
            if (this.defaults.async && P2.passThroughHooksRespectAsync.has(i6)) return (async () => {
              let k2 = await u3.call(r7, c4);
              return a3.call(r7, k2);
            })();
            let p4 = u3.call(r7, c4);
            return a3.call(r7, p4);
          } : r7[o8] = (...c4) => {
            if (this.defaults.async) return (async () => {
              let k2 = await u3.apply(r7, c4);
              return k2 === false && (k2 = await a3.apply(r7, c4)), k2;
            })();
            let p4 = u3.apply(r7, c4);
            return p4 === false && (p4 = a3.apply(r7, c4)), p4;
          };
        }
        s4.hooks = r7;
      }
      if (n5.walkTokens) {
        let r7 = this.defaults.walkTokens, i6 = n5.walkTokens;
        s4.walkTokens = function(o8) {
          let u3 = [];
          return u3.push(i6.call(this, o8)), r7 && (u3 = u3.concat(r7.call(this, o8))), u3;
        };
      }
      this.defaults = { ...this.defaults, ...s4 };
    }), this;
  }
  setOptions(e9) {
    return this.defaults = { ...this.defaults, ...e9 }, this;
  }
  lexer(e9, t6) {
    return x2.lex(e9, t6 ?? this.defaults);
  }
  parser(e9, t6) {
    return b3.parse(e9, t6 ?? this.defaults);
  }
  parseMarkdown(e9) {
    return (n5, s4) => {
      let r7 = { ...s4 }, i6 = { ...this.defaults, ...r7 }, o8 = this.onError(!!i6.silent, !!i6.async);
      if (this.defaults.async === true && r7.async === false) return o8(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n5 > "u" || n5 === null) return o8(new Error("marked(): input parameter is undefined or null"));
      if (typeof n5 != "string") return o8(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n5) + ", string expected"));
      if (i6.hooks && (i6.hooks.options = i6, i6.hooks.block = e9), i6.async) return (async () => {
        let u3 = i6.hooks ? await i6.hooks.preprocess(n5) : n5, c4 = await (i6.hooks ? await i6.hooks.provideLexer(e9) : e9 ? x2.lex : x2.lexInline)(u3, i6), p4 = i6.hooks ? await i6.hooks.processAllTokens(c4) : c4;
        i6.walkTokens && await Promise.all(this.walkTokens(p4, i6.walkTokens));
        let h3 = await (i6.hooks ? await i6.hooks.provideParser(e9) : e9 ? b3.parse : b3.parseInline)(p4, i6);
        return i6.hooks ? await i6.hooks.postprocess(h3) : h3;
      })().catch(o8);
      try {
        i6.hooks && (n5 = i6.hooks.preprocess(n5));
        let a3 = (i6.hooks ? i6.hooks.provideLexer(e9) : e9 ? x2.lex : x2.lexInline)(n5, i6);
        i6.hooks && (a3 = i6.hooks.processAllTokens(a3)), i6.walkTokens && this.walkTokens(a3, i6.walkTokens);
        let p4 = (i6.hooks ? i6.hooks.provideParser(e9) : e9 ? b3.parse : b3.parseInline)(a3, i6);
        return i6.hooks && (p4 = i6.hooks.postprocess(p4)), p4;
      } catch (u3) {
        return o8(u3);
      }
    };
  }
  onError(e9, t6) {
    return (n5) => {
      if (n5.message += `
Please report this to https://github.com/markedjs/marked.`, e9) {
        let s4 = "<p>An error occurred:</p><pre>" + O(n5.message + "", true) + "</pre>";
        return t6 ? Promise.resolve(s4) : s4;
      }
      if (t6) return Promise.reject(n5);
      throw n5;
    };
  }
};
var z2 = new q();
function g2(l6, e9) {
  return z2.parse(l6, e9);
}
g2.options = g2.setOptions = function(l6) {
  return z2.setOptions(l6), g2.defaults = z2.defaults, N2(g2.defaults), g2;
};
g2.getDefaults = M2;
g2.defaults = T2;
g2.use = function(...l6) {
  return z2.use(...l6), g2.defaults = z2.defaults, N2(g2.defaults), g2;
};
g2.walkTokens = function(l6, e9) {
  return z2.walkTokens(l6, e9);
};
g2.parseInline = z2.parseInline;
g2.Parser = b3;
g2.parser = b3.parse;
g2.Renderer = y3;
g2.TextRenderer = L2;
g2.Lexer = x2;
g2.lexer = x2.lex;
g2.Tokenizer = w2;
g2.Hooks = P2;
g2.parse = g2;
var Ft = g2.options;
var Ut = g2.setOptions;
var Kt = g2.use;
var Wt = g2.walkTokens;
var Xt = g2.parseInline;
var Vt = b3.parse;
var Yt = x2.lex;

// components/ui/wy-prompt-modal.js
var WyPromptModal = class extends i4 {
  constructor() {
    super();
    this.open = false;
    this.title = "";
    this.category = "";
    this.description = "";
    this.instructions = "";
    this.image = "";
    this.promptImage = "";
    this.variationImage = "";
    this.template = "";
    this.variables = [];
    this.referenceImages = [];
    this.variations = [];
    this.variationSelector = "";
    this.variationSelectorTileMode = "thumbnail";
    this.activeVariationIndex = 0;
    this.mode = "locked";
    this.activeTab = "variables";
    this.steps = [];
    this.activeStepIndex = 0;
    this.descriptionExpanded = false;
    this.variationDetailsExpanded = false;
    this.showPalette = false;
    this._values = {};
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("steps")) {
      if (!this.steps) {
        this.steps = [];
      }
      if (this.activeStepIndex >= this.steps.length) {
        this.activeStepIndex = 0;
      }
    }
    if (!this.activeTab) {
      this.activeTab = "variables";
    }
    if (changedProperties.has("variations") || changedProperties.has("activeVariationIndex")) {
      this._clampActiveVariationIndex();
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("steps") && this.steps && this.steps.length > 0) {
      if (this.activeStepIndex >= this.steps.length) {
        this.activeStepIndex = 0;
      }
    }
    if ((changedProperties.has("steps") || changedProperties.has("activeStepIndex")) && this.steps && this.steps.length > 0) {
      const safeIndex = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1));
      const currentStep = this.steps[safeIndex];
      if (currentStep && currentStep.variables) {
        const newValues = {};
        currentStep.variables.forEach((v3) => {
          newValues[v3.name] = v3.value || "";
        });
        this._values = newValues;
      }
    }
    if (changedProperties.has("variables") && this.variables) {
      const newValues = {};
      this.variables.forEach((v3) => {
        newValues[v3.name] = v3.value || "";
      });
      this._values = newValues;
    }
  }
  // Multi-step navigation methods
  nextStep() {
    if (this.activeStepIndex < this.steps.length - 1) {
      this.activeStepIndex++;
      this.dispatchEvent(new CustomEvent("step-change", {
        detail: { stepIndex: this.activeStepIndex, step: this.steps[this.activeStepIndex] },
        bubbles: true,
        composed: true
      }));
    }
  }
  previousStep() {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
      this.dispatchEvent(new CustomEvent("step-change", {
        detail: { stepIndex: this.activeStepIndex, step: this.steps[this.activeStepIndex] },
        bubbles: true,
        composed: true
      }));
    }
  }
  // Render stepper UI for multi-step prompts
  _renderStepper() {
    if (!this.steps || this.steps.length === 0) return "";
    const progressPercent = (this.activeStepIndex + 1) / this.steps.length * 100;
    const isFirstStep = this.activeStepIndex === 0;
    const isLastStep = this.activeStepIndex === this.steps.length - 1;
    return b2`
      <div class="stepper-container">
        <div class="stepper-progress">
          <div class="stepper-progress-bar" 
               style="width: ${progressPercent}%">
          </div>
        </div>
        <div class="stepper-header">
          <span class="stepper-label">
            Step ${this.activeStepIndex + 1} of ${this.steps.length}
          </span>
          <div class="stepper-nav">
            <button 
              class="icon-btn filled"
              ?disabled=${isFirstStep}
              @click=${() => this.previousStep()}
              aria-label="Previous step"
              title="Previous step">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <button 
              class="icon-btn filled"
              ?disabled=${isLastStep}
              @click=${() => this.nextStep()}
              aria-label="Next step"
              title="Next step">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  // Toggle description visibility (mobile only)
  _toggleDescription() {
    this.descriptionExpanded = !this.descriptionExpanded;
  }
  // Render markdown text as HTML using marked
  _renderDescriptionMarkdown(text) {
    if (!text) return "";
    return g2.parse(text, { breaks: true });
  }
  _renderPromptIntro(showDescription = true) {
    return b2`
      <div class="title-group">
          <h2 @click="${this._toggleDescription}">${this.title}</h2>
          ${showDescription ? b2`
            <div class="description-text ${this.descriptionExpanded ? "expanded" : ""}">${o7(this._renderDescriptionMarkdown(this.description))}</div>
          ` : ""}
          ${this.instructions ? b2`
            <wy-info-panel class="prompt-instructions-panel">
              <p class="prompt-instructions-heading">Instructions</p>
              <div class="prompt-instructions-copy">${o7(this._renderDescriptionMarkdown(this.instructions))}</div>
            </wy-info-panel>
          ` : ""}
      </div>
    `;
  }
  // Render multi-step body content
  _renderMultiStepBody() {
    if (!this.steps || this.steps.length === 0) {
      return b2`<div class="empty-message">No steps available</div>`;
    }
    const safeIndex = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1));
    const step = this.steps[safeIndex];
    if (!step) {
      return b2`<div class="empty-message">Step not found</div>`;
    }
    const compiledPrompt = this._compilePrompt(step.template || "");
    const hasStepVariables = Array.isArray(step.variables) && step.variables.length > 0;
    const showVariables = hasStepVariables && this.activeTab === "variables";
    return b2`
      ${this._renderStepper()}
      
      <!-- Add tabs for Variables/Preview -->
      ${hasStepVariables ? b2`
        <div class="tabs-header">
          <button 
            class="tab-item ${this.activeTab === "variables" ? "active" : ""}"
            data-tab="variables"
            @click="${this._setActiveTab}">
            Variables
          </button>
          <button 
            class="tab-item ${this.activeTab === "preview" ? "active" : ""}"
            data-tab="preview"
            @click="${this._setActiveTab}">
            Full prompt
          </button>
        </div>
      ` : ""}
      
      ${step.instructions ? b2`
        <wy-info-panel
          class="step-instructions"
          variant="compact"
          heading="${step.name}">
          ${step.instructions}
        </wy-info-panel>
      ` : ""}
      
      <!-- Conditionally render variables or preview based on active tab -->
      ${showVariables ? b2`
        <div class="variables-grid">
          ${step.variables.map((v3) => this._renderVariable(v3))}
        </div>
      ` : b2`
        <div class="preview-area">${o7(g2.parse(compiledPrompt, { breaks: true }))}</div>
      `}
    `;
  }
  _getActiveStandardTab() {
    if (this.activeTab === "preview") return "preview";
    return this.variables && this.variables.length > 0 ? "variables" : "overview";
  }
  _clampActiveVariationIndex() {
    if (!this.variations || this.variations.length === 0) {
      this.activeVariationIndex = 0;
      return;
    }
    if (!Number.isInteger(this.activeVariationIndex) || this.activeVariationIndex < 0 || this.activeVariationIndex >= this.variations.length) {
      this.activeVariationIndex = 0;
    }
  }
  _getActiveVariationIndex() {
    if (!this.variations || this.variations.length === 0) return 0;
    return Number.isInteger(this.activeVariationIndex) && this.activeVariationIndex >= 0 && this.activeVariationIndex < this.variations.length ? this.activeVariationIndex : 0;
  }
  _renderOverview(template) {
    return b2`
      <div class="overview">
        <span class="overview-eyebrow">Prompt Overview</span>
        ${this.promptImage ? b2`
          <figure class="overview-figure">
            <img src="${this.promptImage}" alt="${this.title}" loading="lazy">
            <figcaption>N&ordm; 01 &mdash; Example output</figcaption>
          </figure>
        ` : ""}
        <div class="overview-lead">${o7(this._renderDescriptionMarkdown(this.description))}</div>
      </div>
    `;
  }
  _toggleVariationDetails() {
    this.variationDetailsExpanded = !this.variationDetailsExpanded;
  }
  _usesVisualVariationSelector() {
    return this.variationSelector === "visual" && this.variations.length > 1;
  }
  _getVisualTileMode() {
    return this.variationSelectorTileMode === "details" ? "details" : "thumbnail";
  }
  _renderVariationSelector(activeVariation) {
    const useVisualSelector = this._usesVisualVariationSelector();
    const selector = this.variations.length > 1 ? b2`
      <label class="variation-description-heading" for="variation-select">Variant</label>
      ${useVisualSelector ? this._renderVisualVariationSelector(activeVariation) : b2`
        <div class="variation-select-wrap">
          <select
            id="variation-select"
            class="variation-select-native"
            .value=${l3(activeVariation?.id || "")}
            @change="${this._handleVariationSelectChange}"
          >
            ${this.variations.map((variation) => b2`
              <option value="${variation.id}" .selected=${variation.id === activeVariation?.id}>${variation.name}</option>
            `)}
          </select>
          <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
        </div>
      `}
    ` : "";
    const variationMeta = activeVariation?.description || activeVariation?.instructions ? b2`
      <wy-info-panel class="variation-description-panel">
        <div class="variation-meta-section">
          <button
            class="variation-name"
            type="button"
            aria-expanded="${this.variationDetailsExpanded ? "true" : "false"}"
            @click="${this._toggleVariationDetails}"
          >
            <span>${activeVariation.name}</span>
            <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
          </button>
          ${this.variationDetailsExpanded ? b2`
            <div class="variation-details">
              ${activeVariation?.description ? b2`
                <div class="variation-description-copy">${o7(this._renderDescriptionMarkdown(activeVariation.description))}</div>
              ` : ""}
              ${activeVariation?.instructions ? b2`
                <div class="variation-meta-section">
                  <p class="variation-description-heading">Instructions</p>
                  <div class="variation-description-copy">${o7(this._renderDescriptionMarkdown(activeVariation.instructions))}</div>
                </div>
              ` : ""}
            </div>
          ` : ""}
        </div>
      </wy-info-panel>
    ` : "";
    const referenceImages = this._getActiveReferenceImages(activeVariation);
    if (!selector && !this.variationImage && !variationMeta && referenceImages.length === 0) return "";
    return b2`
      <div class="variation-selector-container">
        ${selector}
        ${this._renderSelectedVariationPanel(activeVariation, variationMeta, referenceImages)}
      </div>
    `;
  }
  _renderSelectedVariationPanel(activeVariation, variationMeta = this._renderVariationMeta(activeVariation), referenceImages = this._getActiveReferenceImages(activeVariation)) {
    if (!this.variationImage && !variationMeta && referenceImages.length === 0) return "";
    return b2`
      <div class="visual-selected-panel">
        ${this.variationImage ? b2`
          <figure class="variation-image">
            <img src="${this.variationImage}" alt="${activeVariation?.name || this.title}" loading="lazy">
          </figure>
        ` : ""}
        ${variationMeta}
        ${this._renderReferenceImages(referenceImages)}
      </div>
    `;
  }
  _renderVariationMeta(activeVariation) {
    if (!activeVariation?.description && !activeVariation?.instructions) return "";
    return b2`
      <wy-info-panel class="variation-description-panel">
        <div class="variation-meta-section">
          <button
            class="variation-name"
            type="button"
            aria-expanded="${this.variationDetailsExpanded ? "true" : "false"}"
            @click="${this._toggleVariationDetails}"
          >
            <span>${activeVariation.name}</span>
            <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
          </button>
          ${this.variationDetailsExpanded ? b2`
            <div class="variation-details">
              ${activeVariation?.description ? b2`
                <div class="variation-description-copy">${o7(this._renderDescriptionMarkdown(activeVariation.description))}</div>
              ` : ""}
              ${activeVariation?.instructions ? b2`
                <div class="variation-meta-section">
                  <p class="variation-description-heading">Instructions</p>
                  <div class="variation-description-copy">${o7(this._renderDescriptionMarkdown(activeVariation.instructions))}</div>
                </div>
              ` : ""}
            </div>
          ` : ""}
        </div>
      </wy-info-panel>
    `;
  }
  _renderVisualVariationSelector(activeVariation) {
    const tileMode = this._getVisualTileMode();
    const showTileDetails = tileMode === "details";
    return b2`
      <div class="visual-variation-grid ${showTileDetails ? "details-mode" : "thumbnail-mode"}" role="listbox" aria-label="Variant">
        ${this.variations.map((variation, index) => {
      const selected = variation.id === activeVariation?.id;
      const description = variation.description || variation.instructions || "";
      const hasImage = Boolean(variation.image);
      const name = variation.name || `Variant ${index + 1}`;
      return b2`
            <button
              type="button"
              class="visual-variation-tile ${selected ? "selected" : ""} ${showTileDetails ? "details" : "thumbnail-only"} ${hasImage ? "has-image" : "no-image"}"
              role="option"
              aria-selected="${selected ? "true" : "false"}"
              aria-label="${name}"
              @click="${() => this._setVariationById(variation.id)}"
            >
              ${hasImage ? b2`
                <img class="visual-variation-media" src="${variation.image}" alt="" loading="lazy">
              ` : b2`
                <span class="visual-variation-text-tile" aria-hidden="true">
                  <span class="material-symbols-outlined">auto_awesome</span>
                </span>
              `}
              <span class="visual-variation-copy">
                <span class="visual-variation-name">${name}</span>
                ${showTileDetails && description ? b2`<span class="visual-variation-description">${description}</span>` : ""}
              </span>
            </button>
          `;
    })}
      </div>
    `;
  }
  _getImageUrl(path) {
    if (!path) return "";
    try {
      return new URL(path, window.location.origin).href;
    } catch {
      return path;
    }
  }
  _getReferenceImageMap(activeVariation = this.variations[this.activeVariationIndex]) {
    const refMap = /* @__PURE__ */ new Map();
    (this.referenceImages || []).forEach((ref) => {
      if (ref?.variable && ref?.path) refMap.set(ref.variable, ref);
    });
    (activeVariation?.referenceImages || []).forEach((ref) => {
      if (ref?.variable && ref?.path) refMap.set(ref.variable, ref);
    });
    return refMap;
  }
  _getActiveReferenceImages(activeVariation = this.variations[this.activeVariationIndex]) {
    return [...this._getReferenceImageMap(activeVariation).values()];
  }
  _renderReferenceImages(referenceImages) {
    if (!referenceImages.length) return "";
    return b2`
      <wy-info-panel class="reference-images-panel">
        <p class="variation-description-heading">Reference Images</p>
        <div class="reference-images-list">
          ${referenceImages.map((ref) => {
      const url = this._getImageUrl(ref.path);
      const label = ref.label || ref.variable || "Reference image";
      const copyText = this._getReferenceImageCopyText(ref, url, label);
      return b2`
              <div class="reference-image-row">
                <img class="reference-image-thumb" src="${url}" alt="${label}" loading="lazy">
                <div class="reference-image-meta">
                  <div class="reference-image-label" title="${label}">${label}</div>
                  <span class="reference-image-url" title="${copyText}">${copyText}</span>
                  ${ref.variable ? b2`<span class="reference-variable" title="{{${ref.variable}}}">{{${ref.variable}}}</span>` : ""}
                </div>
                <div class="reference-image-actions">
                  <button
                    type="button"
                    class="reference-image-copy"
                    @click="${() => this._copyReferenceImageUrl(ref, url, label)}"
                    aria-label="Copy reference image URL"
                    title="Copy URL and instructions"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">assignment</span>
                    <span>Copy Instruction</span>
                  </button>
                  <button
                    type="button"
                    class="reference-image-copy"
                    @click="${() => this._copyReferenceImageFile(url, label)}"
                    aria-label="Copy reference image file"
                    title="Copy image"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">image</span>
                    <span>Copy Image</span>
                  </button>
                </div>
              </div>
            `;
    })}
        </div>
      </wy-info-panel>
    `;
  }
  _renderVisualSelectorLayout(activeVariation, standardActiveTab, hasVariables, compiledPrompt, currentTemplate) {
    return b2`
      <div class="visual-selector-layout">
        <div class="visual-selector-main">
          <div class="header-main">
              ${this._renderPromptIntro(!(this.mode === "locked" && !hasVariables))}
          </div>

          ${this._renderSelectedVariationPanel(activeVariation)}

          <div class="tabs-container">
              <wy-tabs active-tab="${standardActiveTab}" @tab-change="${(e9) => this.activeTab = e9.detail.tab}">
                <button class="tab-item ${standardActiveTab === (hasVariables ? "variables" : "overview") ? "active" : ""}" role="tab" data-tab="${hasVariables ? "variables" : "overview"}">${hasVariables ? "Variables" : "Overview"}</button>
                <button class="tab-item ${standardActiveTab === "preview" ? "active" : ""}" role="tab" data-tab="preview">Full prompt</button>
              </wy-tabs>
              ${standardActiveTab === "variables" && this._hasValues() ? b2`
                <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
              ` : ""}
          </div>

          <div class="body">
            ${standardActiveTab === "preview" ? b2`
              <div class="preview-area">${o7(g2.parse(compiledPrompt, { breaks: true }))}</div>
            ` : hasVariables ? b2`
              <div class="variables-grid">
                ${this.variables.map((v3) => this._renderVariable(v3))}
              </div>
            ` : b2`
              ${this._renderOverview(currentTemplate)}
            `}
          </div>
        </div>

        <aside class="visual-selector-rail" aria-label="Variants">
          <p class="variation-description-heading">Variant</p>
          ${this._renderVisualVariationSelector(activeVariation)}
        </aside>
      </div>
    `;
  }
  render() {
    const activeVariationIndex = this._getActiveVariationIndex();
    const currentTemplate = this.variations.length > 0 ? this.variations[activeVariationIndex].template : this.template;
    const compiledPrompt = this._compilePrompt(currentTemplate);
    const activeVariation = this.variations[activeVariationIndex];
    const standardActiveTab = this._getActiveStandardTab();
    const hasVariables = this.variables.length > 0;
    const useVisualSelector = this._usesVisualVariationSelector();
    return b2`
      <div class="scrim" @click="${this._close}"></div>
      <div class="modal-container ${useVisualSelector ? "visual-selector-modal" : ""}">
        
        <!-- HEADER -->
        <header class="header">
            <div class="header-top">
                ${this.mode === "locked" ? b2`
                    <div class="header-actions-left">
                        <button class="labeled-btn primary" @click="${this._handleCopy}" aria-label="Copy to clipboard" title="Copy">
                            <span class="material-symbols-outlined">content_copy</span>
                            <span>Copy Prompt</span>
                        </button>
                        <button class="icon-btn filled" @click="${this._handleCopyLink}" aria-label="Copy link" title="Share">
                            <span class="material-symbols-outlined">link</span>
                        </button>
                        <button class="icon-btn filled" @click="${() => this.mode = "edit"}" aria-label="Edit prompt" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-btn filled" @click="${this._handleDownload}" aria-label="Download" title="Download">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                        ${this.showPalette ? b2`
                        <button class="icon-btn filled" @click="${this._handlePaletteRequest}" aria-label="Color palette" title="Color Palette">
                            <span class="material-symbols-outlined">palette</span>
                        </button>
                        ` : ""}
                    </div>
                ` : b2`
                    <div class="header-actions-left">
                        <button class="icon-btn filled" @click="${() => this.mode = "locked"}" aria-label="Cancel" title="Cancel">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                        <button class="icon-btn primary" @click="${this._handleSave}" aria-label="Save" title="Save">
                            <span class="material-symbols-outlined">save</span>
                        </button>
                    </div>
                `}
                
                <span class="badge category-badge">${this.category}</span>
                
                <div class="header-actions">
                    <button class="icon-btn filled" @click="${this._close}" aria-label="Close modal" title="Close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        </header>

        <div class="content">
          ${this.mode === "locked" ? b2`
            ${this.steps && this.steps.length > 0 ? b2`
              <!-- Multi-step mode -->
              <div class="header-main">
                  ${this._renderPromptIntro()}
              </div>
              <div class="body">
                ${this._renderVariationSelector(activeVariation)}
                ${this._renderMultiStepBody()}
              </div>
            ` : b2`
              <!-- Standard mode -->
              ${useVisualSelector ? this._renderVisualSelectorLayout(activeVariation, standardActiveTab, hasVariables, compiledPrompt, currentTemplate) : b2`
                <div class="header-main">
                    ${this._renderPromptIntro(!(this.mode === "locked" && !hasVariables))}
                </div>

                <div class="tabs-container">
                    <wy-tabs active-tab="${standardActiveTab}" @tab-change="${(e9) => this.activeTab = e9.detail.tab}">
                      <button class="tab-item ${standardActiveTab === (hasVariables ? "variables" : "overview") ? "active" : ""}" role="tab" data-tab="${hasVariables ? "variables" : "overview"}">${hasVariables ? "Variables" : "Overview"}</button>
                      <button class="tab-item ${standardActiveTab === "preview" ? "active" : ""}" role="tab" data-tab="preview">Full prompt</button>
                    </wy-tabs>
                    ${standardActiveTab === "variables" && this._hasValues() ? b2`
                      <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
                    ` : ""}
                </div>

                ${!(standardActiveTab === "overview" && !hasVariables) ? b2`
                  ${this._renderVariationSelector(activeVariation)}
                ` : ""}

                <div class="body">
                  ${standardActiveTab === "preview" ? b2`
                    <div class="preview-area">${o7(g2.parse(compiledPrompt, { breaks: true }))}</div>
                  ` : hasVariables ? b2`
                    <div class="variables-grid">
                      ${this.variables.map((v3) => this._renderVariable(v3))}
                    </div>
                  ` : b2`
                    ${this._renderOverview(currentTemplate)}
                    ${this._renderVariationSelector(activeVariation)}
                  `}
                </div>
              `}
            `}
          ` : b2`
            <div class="header-main">
                ${this._renderPromptIntro()}
            </div>
            <div class="body">
              <textarea 
                class="editor-area" 
                .value="${this.template}"
                @input="${(e9) => this.template = e9.target.value}"
              ></textarea>
            </div>
          `}
        </div>
      </div>
    `;
  }
  _getToggleDescription(variable, options) {
    if (variable.description) return variable.description;
    if (!Array.isArray(options) || options.length < 2 || options[0] !== "" || !options[1]) return "";
    const enabledText = String(options[1]).trim();
    const firstSentenceMatch = enabledText.match(/^.*?[.!?](?:\s|$)/);
    const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : enabledText;
    return firstSentence.length > 140 ? `${firstSentence.slice(0, 137).trim()}...` : firstSentence;
  }
  _renderVariable(v3) {
    const inputType = v3.inputType || v3.type || "text";
    if (inputType === "toggle") {
      const options = Array.isArray(v3.options) && v3.options.length >= 2 ? [v3.options[0], v3.options[1]] : ["", "true"];
      const labels = Array.isArray(v3.labels) && v3.labels.length >= 2 ? [v3.labels[0], v3.labels[1]] : null;
      const valueDescriptions = Array.isArray(v3.optionDescriptions) && v3.optionDescriptions.length >= 2 ? [v3.optionDescriptions[0], v3.optionDescriptions[1]] : null;
      const size = v3.size || "default";
      const currentValue = this._values[v3.name];
      const toggleValue = currentValue !== void 0 && currentValue !== null ? currentValue : options[0];
      const toggleDescription = this._getToggleDescription(v3, options);
      return b2`
        <div class="form-group">
          <wy-option-toggle
            .label="${v3.label || ""}"
            .description="${toggleDescription}"
            .options="${options}"
            .labels="${labels}"
            .valueDescriptions="${valueDescriptions}"
            .value="${toggleValue}"
            size="${size}"
            variant="switch"
            show-selected-value-text
            @change="${(e9) => this._handleInput(v3.name, e9.detail.value)}"
          ></wy-option-toggle>
        </div>
      `;
    }
    if (inputType === "textarea") {
      return b2`
        <div class="form-group">
          <label>${v3.label}</label>
          <textarea
            placeholder="${v3.placeholder || ""}"
            @input="${(e9) => this._handleInput(v3.name, e9.target.value)}"
            .value="${this._values[v3.name] || ""}"
            rows="4"
          ></textarea>
          <span class="helper-text">Markdown supported</span>
        </div>
      `;
    }
    return b2`
      <div class="form-group">
        <label>${v3.label}</label>
        <input
          type="text"
          placeholder="${v3.placeholder || ""}"
          @input="${(e9) => this._handleInput(v3.name, e9.target.value)}"
          .value="${this._values[v3.name] || ""}"
        >
      </div>
    `;
  }
  _handleInput(name, value) {
    this._values = { ...this._values, [name]: value };
    this.dispatchEvent(new CustomEvent("variable-change", {
      detail: { name, value, values: this._values },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }
  _hasValues() {
    return Object.values(this._values).some((v3) => v3 && v3.length > 0);
  }
  _clearAllVariables() {
    this._values = {};
    this.dispatchEvent(new CustomEvent("variables-cleared", {
      detail: { values: this._values },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }
  _handleVariationChange(e9) {
    const index = parseInt(e9.target.value);
    this.activeVariationIndex = index;
    this.dispatchEvent(new CustomEvent("variation-change", {
      detail: { index, variation: this.variations[index] },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationDropdownChange(e9) {
    const selectedId = e9.detail.value;
    this._setVariationById(selectedId);
  }
  _handleVariationSelectChange(e9) {
    this._setVariationById(e9.target.value);
  }
  _setVariationById(selectedId) {
    const index = this.variations.findIndex((v3) => v3.id === selectedId);
    if (index !== -1) {
      this.activeVariationIndex = index;
      this.steps = this.variations[index].steps || [];
      this.activeStepIndex = 0;
      this.activeTab = "variables";
      this.variationDetailsExpanded = false;
      this.dispatchEvent(new CustomEvent("variation-change", {
        detail: { index, variation: this.variations[index] },
        bubbles: true,
        composed: true
      }));
    }
  }
  _compilePrompt(template) {
    if (!template || typeof template !== "string") {
      return "";
    }
    let compiled = template;
    const refMap = this._getReferenceImageMap();
    refMap.forEach((ref, variable) => {
      compiled = compiled.split(`{{${variable}}}`).join(this._getImageUrl(ref.path));
    });
    Object.keys(this._values || {}).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      compiled = compiled.replace(regex, this._values[key] ?? "");
    });
    return compiled;
  }
  _setActiveTab(e9) {
    const tab = e9.target.dataset.tab || e9.target.closest("[data-tab]")?.dataset.tab;
    if (tab) {
      this.activeTab = tab;
    }
  }
  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }
  async _handleCopy() {
    let textToCopy;
    if (this.steps && this.steps.length > 0) {
      const step = this.steps[this.activeStepIndex];
      textToCopy = this._compilePrompt(step.template);
    } else {
      textToCopy = this._compilePrompt(
        this.variations.length > 0 ? this.variations[this.activeVariationIndex].template : this.template
      );
    }
    const copied = await this._writeTextToClipboard(textToCopy);
    if (copied) {
      this.dispatchEvent(new CustomEvent("copy", {
        detail: { text: textToCopy },
        bubbles: true,
        composed: true
      }));
    } else {
      this.dispatchEvent(new CustomEvent("toast", {
        detail: { message: "Copy failed", options: { variant: "error" } },
        bubbles: true,
        composed: true
      }));
    }
  }
  async _copyReferenceImageUrl(ref, url, label = "Reference image") {
    const text = this._getReferenceImageCopyText(ref, url, label);
    const copied = await this._writeTextToClipboard(text);
    this.dispatchEvent(new CustomEvent("toast", {
      detail: {
        message: copied ? "Reference image copied" : "Copy failed",
        options: { variant: copied ? "success" : "error" }
      },
      bubbles: true,
      composed: true
    }));
  }
  _getReferenceImageCopyText(ref, url, label = "Reference image") {
    const instructions = (ref?.instructions || "").trim();
    if (!instructions) return url;
    const textWithUrl = instructions.includes("[URL]") || instructions.includes("{{url}}") ? instructions.replaceAll("[URL]", url).replaceAll("{{url}}", url) : `${instructions}
${url}`;
    return `Reference Image:
${textWithUrl}`;
  }
  async _copyReferenceImageFile(url, label = "Reference image") {
    const copied = await this._writeImageToClipboard(url);
    this.dispatchEvent(new CustomEvent("toast", {
      detail: {
        message: copied ? `${label} copied as image` : "Image copy failed",
        options: { variant: copied ? "success" : "error" }
      },
      bubbles: true,
      composed: true
    }));
  }
  async _writeImageToClipboard(url) {
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        return false;
      }
      const response = await fetch(url);
      if (!response.ok) return false;
      const sourceBlob = await response.blob();
      const pngBlob = sourceBlob.type === "image/png" ? sourceBlob : await this._convertImageBlobToPng(sourceBlob);
      if (!pngBlob) return false;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob })
      ]);
      return true;
    } catch (error) {
      console.warn("Image clipboard copy failed:", error);
      return false;
    }
  }
  async _convertImageBlobToPng(blob) {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await this._loadImage(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const context = canvas.getContext("2d");
      if (!context || !canvas.width || !canvas.height) return null;
      context.drawImage(image, 0, 0);
      return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }
  async _writeTextToClipboard(text) {
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        const blob = new Blob([text], { type: "text/plain" });
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
        return true;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn("Clipboard API copy failed, trying fallback:", error);
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch (error) {
      console.warn("Fallback copy failed:", error);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
  _handleSave() {
    this.mode = "locked";
    this.dispatchEvent(new CustomEvent("save", {
      detail: { template: this.template },
      bubbles: true,
      composed: true
    }));
  }
  _handleDownload() {
    let textToDownload;
    if (this.steps && this.steps.length > 0) {
      const step = this.steps[this.activeStepIndex];
      textToDownload = this._compilePrompt(step.template);
    } else {
      textToDownload = this._compilePrompt(
        this.variations.length > 0 ? this.variations[this.activeVariationIndex].template : this.template
      );
    }
    this.dispatchEvent(new CustomEvent("download", {
      detail: { text: textToDownload, title: this.title },
      bubbles: true,
      composed: true
    }));
  }
  _handleCopyLink() {
    this.dispatchEvent(new CustomEvent("copy-link", {
      bubbles: true,
      composed: true
    }));
  }
  _handlePaletteRequest() {
    this.dispatchEvent(new CustomEvent("palette-request", {
      bubbles: true,
      composed: true
    }));
  }
};
__publicField(WyPromptModal, "properties", {
  open: { type: Boolean, reflect: true },
  title: { type: String },
  category: { type: String },
  description: { type: String },
  instructions: { type: String },
  image: { type: String },
  promptImage: { type: String, attribute: "prompt-image" },
  variationImage: { type: String, attribute: "variation-image" },
  template: { type: String },
  variables: { type: Array },
  referenceImages: { type: Array },
  variations: { type: Array },
  variationSelector: { type: String, attribute: "variation-selector" },
  variationSelectorTileMode: { type: String, attribute: "variation-selector-tile-mode" },
  activeVariationIndex: { type: Number, attribute: "active-variation-index" },
  mode: { type: String },
  // 'locked' or 'edit'
  activeTab: { type: String },
  // 'variables' or 'preview'
  steps: { type: Array },
  // Array of step objects for multi-step prompts
  activeStepIndex: { type: Number, attribute: "active-step-index" },
  // Current step (0-based)
  descriptionExpanded: { type: Boolean, attribute: "description-expanded" },
  // Mobile description toggle
  variationDetailsExpanded: { type: Boolean, attribute: "variation-details-expanded" },
  showPalette: { type: Boolean, attribute: "show-palette" }
});
__publicField(WyPromptModal, "styles", i`
    /* Required fonts - load in page <head>:
       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,899&display=swap" rel="stylesheet">
       <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    */

    /* Material Symbols base styling */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: 'liga';
    }

    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 2000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    :host([open]) {
      pointer-events: auto;
      opacity: 1;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3); /* Darker scrim for focus */
      backdrop-filter: blur(4px);
    }

    .modal-container {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      background: var(--wy-prompt-modal-surface, var(--paper, #F7F4EE));
      border-radius: 0;
      box-shadow: var(--shadow-modal);
      transform: translate(-50%, -50%) scale(0.95);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden; /* Clip content to border-radius */
      border: 1px solid var(--paper-edge, #DDD6C8);
      font-family: var(--ff-sans, 'Inter', sans-serif);
    }

    .modal-container.visual-selector-modal {
      width: min(94vw, 1120px);
      max-width: 1120px;
    }

    :host([open]) .modal-container {
      transform: translate(-50%, -50%) scale(1);
    }

    /* HEADER STYLES */
    .header {
      padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) var(--spacing-sm, 8px);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md, 16px);
      flex-shrink: 0; /* Header stays fixed, doesn't shrink */
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        gap: 12px;
    }

    .header-actions-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 0 0 auto;
    }

    /* Icon Button - Perfect circle with centered icon */
    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: background-color 0.2s, transform 0.15s;
    }

    .icon-btn.filled {
        background: transparent;
        color: var(--ink, #1A1A1A);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
    }

    .icon-btn.filled:hover {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
    }

    .icon-btn.primary {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
        border-radius: 0;
    }

    .icon-btn.primary:hover {
        opacity: 0.9;
        transform: scale(1.05);
    }

    .icon-btn:disabled {
        opacity: 0.38;
        cursor: not-allowed;
    }

    .icon-btn:disabled:hover {
        transform: none;
    }

    .icon-btn .material-symbols-outlined {
        font-size: 20px;
        line-height: 1;
    }

    /* Labeled Button - Icon with text label */
    .labeled-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 40px;
        padding: 0 16px 0 12px;
        border-radius: 0;
        border: none;
        cursor: pointer;
        font-family: var(--font-sans);
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s, transform 0.15s;
    }

    .labeled-btn.primary {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 12px;
    }

    .labeled-btn.primary:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }

    .labeled-btn .material-symbols-outlined {
        font-size: 18px;
        line-height: 1;
    }

    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        margin-bottom: var(--spacing-lg, 24px);
    }

    /* Header-main inside content (for multi-step prompts) */
    .content > .header-main {
        padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) var(--spacing-lg, 24px);
    }

    .badge {
      display: none; /* Hidden on all screen sizes */
      padding: 4px 0;
      background: transparent;
      color: var(--ink-mute, #6B6B6A);
      border-radius: 0;
      font-family: var(--ff-serif, 'Lora', serif);
      font-style: italic;
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em; /* Wider tracking */
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none; /* Prevent badge from blocking clicks */
    }

    .title-group h2 {
      font-family: var(--ff-serif, 'Lora', serif);
      font-size: 2.5rem; /* Larger Title */
      font-weight: 500;
      letter-spacing: -0.015em;
      margin: 0 0 12px 0;
      color: var(--md-sys-color-text-heading);
      line-height: 1.1;
    }

    .description-text {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 1rem;
      font-weight: 300;
      line-height: 1.6;
      color: var(--md-sys-color-text-muted);
      margin: 0;
    }

    .description-text p { margin: 0 0 0.5em; }
    .description-text p:last-child { margin-bottom: 0; }

    .description-text ol,
    .description-text ul {
      margin: 2px 0 0;
      padding-left: 1.4em;
    }

    .description-text li + li {
      margin-top: 2px;
    }

    .customize-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
        border: none;
        padding: 10px 20px;
        border-radius: 0;
        font-family: var(--ff-sans, 'Inter', sans-serif);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .customize-btn:hover {
        opacity: 0.9;
    }

    /* TABS */
    .tabs-container {
        padding: 0 var(--spacing-xl, 32px);
        display: flex;
        align-items: center;
        gap: var(--spacing-xl, 32px);
        flex-shrink: 0; /* Tabs stay fixed, don't shrink */
    }

    .tabs-container wy-tabs {
        flex: 1;
    }

    .clear-btn {
        background: none;
        border: none;
        color: var(--md-sys-color-text-heading);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 0;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .clear-btn:hover {
        background: var(--md-sys-color-surface-container-high);
    }

    .clear-btn:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .tab-item {
        background: none;
        border: none;
        padding: 12px 0 16px 0;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface-variant);
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
        margin: 0;
        border-bottom: 2px solid transparent;
    }

    .tab-item:hover {
        color: var(--md-sys-color-text-heading);
    }

    .tab-item.active {
        color: var(--md-sys-color-text-heading);
        font-weight: 700;
        border-bottom-color: var(--md-sys-color-text-heading);
    }
    
    /* CONTENT */
    .content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .body {
        padding: var(--spacing-xl, 32px);
        flex: 1;
    }

    .variation-selector-container {
        margin: var(--spacing-xl, 32px) var(--spacing-xl, 32px) 0;
        padding: var(--spacing-lg, 24px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
        background-color: var(--md-sys-color-surface-container-low);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--md-sys-shape-corner-medium, 0);
    }

    .variation-selector-container wy-dropdown {
        width: 100%;
    }

    .body > .variation-selector-container {
        margin: var(--spacing-xl, 32px) 0 0;
    }

    .visual-selector-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
        gap: var(--spacing-lg, 24px);
        padding: 0 var(--spacing-xl, 32px) var(--spacing-xl, 32px);
        align-items: start;
    }

    .visual-selector-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .visual-selector-main .header-main {
        margin-bottom: var(--spacing-md, 16px);
    }

    .visual-selector-main .tabs-container {
        padding-left: 0;
        padding-right: 0;
    }

    .visual-selector-main .body {
        padding: var(--spacing-lg, 24px) 0 0;
    }

    .visual-selected-panel {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
        margin-top: var(--spacing-sm, 8px);
        margin-bottom: var(--spacing-lg, 24px);
    }

    .visual-selector-rail {
        position: sticky;
        top: var(--spacing-md, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm, 12px);
        max-height: calc(90vh - 128px);
        overflow: auto;
        padding: var(--spacing-md, 16px);
        background-color: var(--md-sys-color-surface-container-low);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--md-sys-shape-corner-medium, 0);
    }

    .variation-select-native {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        min-height: 56px;
        padding: 0 calc(var(--spacing-xl, 32px) + 20px) 0 var(--spacing-lg, 24px);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        background-color: var(--md-sys-color-surface-container-lowest, #FDFBF7);
        color: var(--md-sys-color-on-surface, #1D1B20);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
    }

    .variation-select-wrap {
        position: relative;
    }

    .variation-select-wrap .material-symbols-outlined {
        position: absolute;
        right: var(--spacing-md, 16px);
        top: 50%;
        transform: translateY(-50%);
        color: var(--md-sys-color-on-surface-variant, #49454E);
        pointer-events: none;
        font-size: 22px;
    }

    .variation-select-native:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .visual-variation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(138px, 1fr));
        gap: var(--spacing-sm, 12px);
    }

    .visual-selector-rail .visual-variation-grid {
        grid-template-columns: 1fr;
    }

    .visual-variation-tile {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 100%;
        padding: 0;
        background: var(--md-sys-color-surface-container-lowest, #FDFBF7);
        color: var(--md-sys-color-on-surface, #1D1B20);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        text-align: left;
        transition:
            border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
            box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .visual-variation-tile::after {
        content: '';
        position: absolute;
        inset: 0;
        background: currentColor;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .visual-variation-tile:hover::after {
        opacity: var(--md-sys-state-hover-opacity, 0.08);
    }

    .visual-variation-tile:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .visual-variation-tile.selected {
        border-color: var(--md-sys-color-primary, #282828);
        box-shadow: inset 0 0 0 1px var(--md-sys-color-primary, #282828);
    }

    .visual-variation-media {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        background: var(--paper-deep, #EEE8DD);
        border-bottom: 1px solid var(--paper-edge, #DDD6C8);
    }

    .visual-variation-tile.thumbnail-only .visual-variation-media,
    .visual-variation-tile.thumbnail-only .visual-variation-text-tile {
        border-bottom: 0;
    }

    .visual-variation-text-tile {
        display: flex;
        flex: 1;
        min-height: 104px;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md, 16px);
        background:
            linear-gradient(
                135deg,
                color-mix(in srgb, var(--paper-deep, #EEE8DD) 74%, transparent),
                var(--md-sys-color-surface-container-lowest, #FDFBF7)
            );
        border-bottom: 1px solid var(--paper-edge, #DDD6C8);
    }

    .visual-variation-text-tile .material-symbols-outlined {
        color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 46%, transparent);
        font-size: 30px;
    }

    .visual-variation-copy {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs, 4px);
        padding: var(--spacing-sm, 12px);
        min-width: 0;
    }

    .visual-variation-name {
        color: var(--md-sys-color-on-surface, #1D1B20);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.8125rem;
        font-weight: 700;
        line-height: 1.25;
        overflow-wrap: anywhere;
    }

    .visual-variation-description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: var(--md-sys-color-text-muted);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        line-height: 1.35;
    }

    .visual-variation-tile.thumbnail-only.has-image .visual-variation-copy {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .variation-description-panel {
        margin-top: 0;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .variation-image {
        margin: 0;
    }

    .variation-image img {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 10;
        object-fit: cover;
        border: 1px solid var(--paper-edge, #DDD6C8);
    }

    .variation-image figcaption {
        margin: 8px 0 0;
        color: var(--ink-mute, #6B6B6A);
        font-family: var(--ff-serif, 'Lora', serif);
        font-size: 0.8125rem;
        font-style: italic;
        line-height: 1.35;
        text-align: right;
    }

    .reference-images-panel {
        margin: 0;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .reference-images-list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--paper-edge, #DDD6C8);
        background: var(--paper, #F7F4EE);
    }

    .reference-image-row {
        display: grid;
        grid-template-columns: 72px minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--spacing-md, 16px);
        min-height: 96px;
        padding: var(--spacing-md, 16px);
    }

    .reference-image-row + .reference-image-row {
        border-top: 1px solid var(--paper-edge, #DDD6C8);
    }

    .reference-image-thumb {
        display: block;
        width: 72px;
        height: 72px;
        object-fit: cover;
        border: 1px solid var(--paper-edge, #DDD6C8);
        background: var(--white, #FFFFFF);
    }

    .reference-image-meta {
        min-width: 0;
        padding-right: var(--spacing-xs, 8px);
    }

    .reference-image-label {
        color: var(--ink, #1A1A1A);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .reference-image-url {
        display: -webkit-box;
        margin-top: 6px;
        color: var(--ink-mute, #6B6B6A);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        line-height: 1.45;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        white-space: pre-line;
    }

    .reference-variable {
        display: inline-block;
        margin-top: 6px;
        color: var(--ink-soft, #A8A49C);
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 0.6875rem;
        line-height: 1.35;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .reference-image-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 6px;
    }

    .reference-image-copy {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 36px;
        padding: 0 10px;
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        background: transparent;
        color: var(--ink, #1A1A1A);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.6875rem;
        font-weight: 600;
        line-height: 1.1;
        white-space: nowrap;
        cursor: pointer;
        transition: background-color var(--dur-1, 150ms) var(--ease, ease),
          color var(--dur-1, 150ms) var(--ease, ease);
    }

    .reference-image-copy:hover {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
    }

    .reference-image-copy:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .reference-image-copy .material-symbols-outlined {
        font-size: 18px;
        line-height: 1;
    }

    .variation-meta-section + .variation-meta-section {
        margin-top: var(--spacing-md, 16px);
        padding-top: var(--spacing-md, 16px);
        border-top: 1px solid var(--paper-edge, #DDD6C8);
    }

    .prompt-instructions-panel {
        margin-top: 16px;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .prompt-instructions-heading {
        margin: 0 0 var(--spacing-xxs, 4px);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft, #A8A49C);
    }

    .prompt-instructions-copy {
        margin: 0;
    }

    .prompt-instructions-copy p { margin: 0 0 0.5em; }
    .prompt-instructions-copy p:last-child { margin-bottom: 0; }

    .prompt-instructions-copy ol,
    .prompt-instructions-copy ul {
        margin: 2px 0 0;
        padding-left: 1.4em;
    }

    .prompt-instructions-copy li + li {
        margin-top: 2px;
    }

    .variation-description-heading {
        margin: 0 0 var(--spacing-xxs, 4px);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft, #A8A49C);
    }

    .variation-name {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-sm, 8px);
        width: 100%;
        margin: 0;
        padding: 0;
        background: transparent;
        border: 0;
        font-family: var(--ff-serif, 'Lora', serif);
        font-size: 1.125rem;
        font-weight: 500;
        line-height: 1.25;
        color: var(--md-sys-color-text-heading);
        letter-spacing: 0;
        text-align: left;
        cursor: pointer;
    }

    .variation-name:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 4px;
    }

    .variation-name .material-symbols-outlined {
        flex: 0 0 auto;
        font-size: 20px;
        transition: transform 0.2s;
    }

    .variation-name[aria-expanded="true"] .material-symbols-outlined {
        transform: rotate(180deg);
    }

    .variation-details {
        margin-top: var(--spacing-sm, 8px);
    }

    .variation-description-copy {
        margin: 0;
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--md-sys-color-text-muted);
    }

    .variation-description-copy p { margin: 0 0 0.5em; }
    .variation-description-copy p:last-child { margin-bottom: 0; }

    /* Legacy selector styles (kept for backwards compatibility) */
    .variation-selector {
        margin: 0 var(--spacing-xl, 32px) var(--spacing-md, 16px);
        padding: var(--spacing-sm, 12px);
        background: var(--md-sys-color-surface-container-low);
        border-radius: var(--md-sys-shape-corner-small, 8px);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm, 12px);
    }

    .variation-label {
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
    }

    .variation-select {
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        color: var(--md-sys-color-on-surface);
        background: transparent;
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        padding: 6px 12px;
    }

    /* FORMS */
    .variables-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
    }

    .form-group label {
        display: block;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--md-sys-color-text-heading);
        margin-bottom: 8px;
    }

    .form-group input, .form-group textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 16px; /* Increased padding for breathing room */
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 0;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 1rem;
        color: var(--md-sys-color-on-surface);
        background: var(--md-sys-color-surface-container-lowest);
        transition: all 0.2s;
    }

    .form-group input:focus, .form-group textarea:focus {
        outline: none;
        border-color: var(--md-sys-color-primary);
        box-shadow: 0 0 0 2px var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
    }

    .helper-text {
        display: block;
        text-align: right;
        font-size: 0.75rem;
        color: var(--md-sys-color-text-muted);
        margin-top: 4px;
    }

    .form-group wy-option-toggle {
      --md-sys-typescale-body-medium: 500 1rem/1.45 var(--font-sans, 'DM Sans', sans-serif);
    }

    .preview-area {
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 0;
      padding: 24px;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 1rem;
      line-height: 1.7;
      color: var(--md-sys-color-on-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    /* Markdown element styles within preview-area */
    .preview-area p { margin: 0 0 1em; }
    .preview-area p:last-child { margin-bottom: 0; }
    .preview-area h1, .preview-area h2, .preview-area h3,
    .preview-area h4, .preview-area h5, .preview-area h6 {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-weight: 600;
      line-height: 1.3;
      margin: 1.2em 0 0.4em;
      color: var(--md-sys-color-on-surface);
    }
    .preview-area h1:first-child, .preview-area h2:first-child,
    .preview-area h3:first-child { margin-top: 0; }
    .preview-area h1 { font-size: 1.4rem; }
    .preview-area h2 { font-size: 1.2rem; }
    .preview-area h3 { font-size: 1.05rem; }
    .preview-area h4, .preview-area h5, .preview-area h6 { font-size: 1rem; }
    .preview-area ul, .preview-area ol {
      margin: 0 0 1em;
      padding-left: 1.5em;
    }
    .preview-area li + li { margin-top: 0.25em; }
    .preview-area blockquote {
      margin: 0 0 1em;
      padding: 0.5em 1em;
      border-left: 3px solid var(--md-sys-color-outline-variant);
      color: var(--ink-mute, #6B6760);
      font-style: italic;
    }
    .preview-area code {
      font-family: 'DM Mono', 'Fira Code', monospace;
      font-size: 0.875em;
      background: var(--md-sys-color-surface-container);
      padding: 0.1em 0.35em;
      border-radius: 3px;
    }
    .preview-area pre {
      background: var(--md-sys-color-surface-container);
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0 0 1em;
    }
    .preview-area pre code {
      background: none;
      padding: 0;
      font-size: 0.875rem;
    }
    .preview-area hr {
      border: none;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      margin: 1.2em 0;
    }
    .preview-area table {
      border-collapse: collapse;
      width: 100%;
      margin: 0 0 1em;
      font-size: 0.9rem;
    }
    .preview-area th, .preview-area td {
      text-align: left;
      padding: 6px 12px;
      border: 1px solid var(--md-sys-color-outline-variant);
    }
    .preview-area th {
      background: var(--md-sys-color-surface-container);
      font-weight: 600;
    }
    .preview-area a {
      color: var(--md-sys-color-primary);
      text-decoration: underline;
    }
    .preview-area strong { font-weight: 600; }
    .preview-area em { font-style: italic; }

    .overview::after {
      content: '';
      display: block;
      clear: both;
    }

    .overview-eyebrow {
      display: block;
      margin-bottom: 14px;
      color: var(--ink-soft, #A8A49C);
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .overview-figure {
      float: right;
      width: 206px;
      margin: 2px 0 14px 28px;
    }

    .overview-figure img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      border: 1px solid var(--paper-edge, #DDD6C8);
    }

    .overview-figure figcaption {
      margin: 8px 0 0;
      color: var(--ink-mute, #6B6B6A);
      font-family: var(--ff-serif, 'Lora', serif);
      font-size: 0.8125rem;
      font-style: italic;
      line-height: 1.35;
      text-align: right;
    }

    .overview-lead {
      margin: 0;
      color: var(--ink, #1A1A1A);
      font-family: var(--ff-serif, 'Lora', serif);
      font-size: 1.375rem;
      font-weight: 400;
      line-height: 1.5;
    }

    .overview-lead p { margin: 0 0 0.75em; }
    .overview-lead p:last-child { margin-bottom: 0; }

    .overview-lead ol,
    .overview-lead ul {
      margin: 4px 0 0;
      padding-left: 1.25em;
    }

    .editor-area {
        width: 100%;
        height: 100%;
        min-height: 300px;
        border: none;
        background: none;
        resize: none;
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--md-sys-color-on-surface);
    }
    .editor-area:focus { outline: none; }

    /* WY-INFO-PANEL THEMING */
    wy-info-panel {
        --wy-info-panel-padding: var(--spacing-md, 16px);
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    wy-info-panel[variant="compact"],
    wy-info-panel.step-instructions {
        --wy-info-panel-compact-bg: var(--md-sys-color-secondary-container, #E8DDD7);
        --wy-info-panel-compact-border: var(--md-sys-color-outline-variant, #DDD);
        --wy-info-panel-compact-padding: var(--spacing-md, 16px);
    }

    /* STEP NAVIGATION BUTTONS (for multi-step prompts) */
    .secondary-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: transparent;
        border: 1px solid var(--ink, #1A1A1A);
        color: var(--ink, #1A1A1A);
        padding: 12px 24px;
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    .secondary-btn:hover {
        background: var(--md-sys-color-surface-container-high);
        border-color: var(--md-sys-color-outline);
    }

    /* STEPPER STYLES */
    .stepper-container {
      position: sticky;
      top: 0;
      background: var(--wy-prompt-modal-surface, var(--md-sys-color-surface));
      z-index: 10;
      margin-bottom: var(--spacing-md, 16px);
    }

    .stepper-progress {
      height: 4px;
      background: var(--md-sys-color-surface-container-highest);
      border-radius: var(--radius-0);
      overflow: hidden;
      margin-bottom: var(--spacing-md, 16px);
    }

    .stepper-progress-bar {
      height: 100%;
      background: var(--md-sys-color-primary);
      transition: width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    .stepper-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stepper-label {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--md-sys-color-primary);
      font-weight: 500;
    }

    .stepper-nav {
      display: flex;
      gap: var(--spacing-xs, 4px);
    }

    .step-instructions {
      margin-bottom: var(--spacing-lg, 24px);
    }

    .tabs-header {
      display: flex;
      gap: 24px;
      padding-top: var(--spacing-xl, 32px);
      padding-bottom: 0;
      padding-left: 0;
      padding-right: 0;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      margin-bottom: var(--spacing-lg, 24px);
    }

    .tab-item {
      background: none;
      border: none;
      padding: 8px 0;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
      border-bottom: 2px solid transparent;
    }

    .tab-item:hover {
      color: var(--md-sys-color-primary);
    }

    .tab-item.active {
      color: var(--md-sys-color-primary);
      font-weight: 700;
      border-bottom-color: var(--md-sys-color-primary);
    }

    @media (max-width: 600px) {
      .modal-container {
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
      .header { padding: var(--spacing-lg, 24px) var(--spacing-md, 16px) var(--spacing-sm, 8px); }
      .header-top { align-items: flex-start; }
      .header-main { flex-direction: column; align-items: flex-start; gap: var(--spacing-sm, 8px); margin-bottom: var(--spacing-sm, 8px); }
      .header-actions-left { flex-wrap: wrap; }
      .labeled-btn { min-width: 0; }
      .labeled-btn.primary { padding-right: 12px; }
      .reference-image-row {
        grid-template-columns: 56px minmax(0, 1fr);
        min-height: 72px;
        gap: var(--spacing-sm, 12px);
        padding: var(--spacing-sm, 12px);
      }
      .reference-image-thumb {
        width: 56px;
        height: 56px;
      }
      .reference-image-meta {
        padding-right: 0;
      }
      .reference-image-actions {
        grid-column: 1 / -1;
        justify-content: flex-start;
      }
      .title-group h2 { font-size: 1.75rem; }
      .tabs-container { padding: 0; } /* wy-tabs handles its own mobile padding */
      .variation-selector-container {
        margin: var(--spacing-sm, 8px) var(--spacing-md, 16px) 0;
        padding: var(--spacing-sm, 12px);
        gap: var(--spacing-sm, 8px);
      }
      .visual-selector-layout {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
        padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
      }
      .visual-selector-rail {
        position: static;
        order: -1;
        max-height: none;
        overflow: visible;
        padding: var(--spacing-sm, 12px);
      }
      .visual-selector-rail .visual-variation-grid {
        grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
      }
      .visual-selector-main .body {
        padding-top: var(--spacing-md, 16px);
      }
      .visual-variation-grid {
        grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
      }
      .visual-variation-text-tile {
        min-height: 86px;
      }
      .visual-variation-copy {
        padding: var(--spacing-xs, 8px);
      }
      .variation-description-heading {
        font-size: 0.6875rem;
      }
      .body { padding: var(--spacing-md, 16px); }
      
      /* Tighter button spacing on mobile */
      .header-actions-left {
        gap: 4px;
      }

      .overview-figure {
        float: none;
        width: 100%;
        margin: 0 0 var(--spacing-md, 16px);
      }

      .overview-figure img {
        aspect-ratio: 16 / 10;
        max-height: 220px;
      }

      .overview-lead {
        font-size: 1.125rem;
      }

      /* Mobile description toggle */
      .title-group h2 {
        cursor: pointer;
      }
      
      .description-text {
        display: none;
      }
      
      .description-text.expanded {
        display: block;
      }
      
      /* Step navigation styles (for multi-step prompts) */
      .step-navigation {
        flex-direction: row;
        gap: 12px;
      }
      .step-navigation .secondary-btn {
        flex: 1;
        min-width: 0;
      }
    }
    `);
customElements.define("wy-prompt-modal", WyPromptModal);

// components/ui/wy-links-modal.js
var WyLinksModal = class extends i4 {
  constructor() {
    super();
    this.open = false;
    this.title = "AI Tools";
    this.links = [];
    this.showPaletteEntry = false;
    this.openDropdownId = "";
  }
  connectedCallback() {
    super.connectedCallback();
    this._loadFonts();
    this._escKeyHandler = this._handleEscKey.bind(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._escKeyHandler) {
      document.removeEventListener("keydown", this._escKeyHandler);
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("open")) {
      if (this.open) {
        document.addEventListener("keydown", this._escKeyHandler);
        this._focusFirstElement();
      } else {
        document.removeEventListener("keydown", this._escKeyHandler);
      }
    }
  }
  _focusFirstElement() {
    requestAnimationFrame(() => {
      const closeButton = this.shadowRoot?.querySelector(".close-button");
      if (closeButton) {
        closeButton.focus();
      }
    });
  }
  _handleEscKey(e9) {
    if (e9.key === "Escape" && this.open) {
      if (this.openDropdownId) {
        this.openDropdownId = "";
        return;
      }
      this._handleClose();
    }
  }
  _loadFonts() {
    const existingLinks = document.querySelectorAll("link[data-wy-links-modal-fonts]");
    if (existingLinks.length >= 3) {
      return;
    }
    if (!document.querySelector('link[href*="Playfair+Display"][data-wy-links-modal-fonts]')) {
      const playfairLink = document.createElement("link");
      playfairLink.rel = "stylesheet";
      playfairLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";
      playfairLink.setAttribute("data-wy-links-modal-fonts", "playfair");
      document.head.appendChild(playfairLink);
    }
    if (!document.querySelector('link[href*="Material+Symbols"][data-wy-links-modal-fonts]')) {
      const materialLink = document.createElement("link");
      materialLink.rel = "stylesheet";
      materialLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
      materialLink.setAttribute("data-wy-links-modal-fonts", "material");
      document.head.appendChild(materialLink);
    }
    if (!document.querySelector('link[href*="DM+Sans"][data-wy-links-modal-fonts]')) {
      const dmSansLink = document.createElement("link");
      dmSansLink.rel = "stylesheet";
      dmSansLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap";
      dmSansLink.setAttribute("data-wy-links-modal-fonts", "dm-sans");
      document.head.appendChild(dmSansLink);
    }
  }
  render() {
    return b2`
      <div class="modal-overlay" @click="${this._handleOverlayClick}">
        <div class="modal-container" @click="${this._handleContainerClick}">
          <button 
            class="close-button" 
            @click="${this._handleClose}"
            aria-label="Close modal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          
          <div class="modal-content">
            <div class="title-wrapper">
              <h1 class="modal-title">${this.title}</h1>
            </div>
            
            <div class="sections-container">
              ${this.showPaletteEntry ? b2`
                <div class="palette-entry-section">
                  <button class="palette-entry-btn" @click="${this._handlePaletteClick}" aria-label="Open color palettes">
                    <span class="material-symbols-outlined">palette</span>
                    Color Palettes
                  </button>
                </div>
              ` : ""}
              ${!this.links || this.links.length === 0 ? b2`<p style="color: var(--md-sys-color-on-surface-variant); text-align: center; padding: 2rem;">No links available.</p>` : this.links.map((category, categoryIndex) => b2`
                  <section class="section">
                    <h2 class="section-header">${category.category}</h2>
                    <div class="chips-container">
                      ${category.links && category.links.length > 0 ? category.links.map((link, linkIndex) => this._renderLink(link, `link-${categoryIndex}-${linkIndex}`)) : ""}
                    </div>
                  </section>
                `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  _handlePaletteClick() {
    this._handleClose();
    this.dispatchEvent(new CustomEvent("palette-open", {
      bubbles: true,
      composed: true
    }));
  }
  _handleOverlayClick(e9) {
    if (e9.target === e9.currentTarget) {
      this._handleClose();
    }
  }
  _handleContainerClick(e9) {
    if (!e9.composedPath().some((element) => element?.classList?.contains("link-dropdown"))) {
      this.openDropdownId = "";
    }
    e9.stopPropagation();
  }
  _handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", {
      bubbles: true,
      composed: true
    }));
  }
  _handleLinkClick(e9, link) {
    window.open(link.url, "_blank", "noopener,noreferrer");
    this.dispatchEvent(new CustomEvent("link-click", {
      detail: { link },
      bubbles: true,
      composed: true
    }));
  }
  _renderLink(link, dropdownId) {
    if (Array.isArray(link.options) && link.options.length > 0) {
      const isOpen = this.openDropdownId === dropdownId;
      return b2`
        <div class="link-dropdown">
          <button
            class="link-chip link-chip--dropdown"
            @click="${(e9) => this._handleDropdownToggle(e9, dropdownId)}"
            aria-label="Open ${link.name} options"
            aria-haspopup="menu"
            aria-expanded="${isOpen ? "true" : "false"}"
            aria-controls="link-menu-${dropdownId}"
          >
            <span class="link-chip__label">${link.name}</span>
            <span class="material-symbols-outlined link-chip__icon" aria-hidden="true">expand_more</span>
          </button>
          ${isOpen ? b2`
            <div class="link-menu" id="link-menu-${dropdownId}" role="menu">
              ${link.options.map((option) => b2`
                <button
                  class="link-menu__item"
                  role="menuitem"
                  @click="${(e9) => this._handleLinkClick(e9, option)}"
                  aria-label="Open ${option.name}"
                >
                  ${option.name}
                </button>
              `)}
            </div>
          ` : ""}
        </div>
      `;
    }
    return b2`
      <button
        class="link-chip"
        @click="${(e9) => this._handleLinkClick(e9, link)}"
        aria-label="Open ${link.name}"
      >
        ${link.name}
      </button>
    `;
  }
  _handleDropdownToggle(e9, dropdownId) {
    e9.stopPropagation();
    this.openDropdownId = this.openDropdownId === dropdownId ? "" : dropdownId;
  }
  show() {
    this.open = true;
  }
  close() {
    this._handleClose();
  }
};
__publicField(WyLinksModal, "properties", {
  open: { type: Boolean, reflect: true },
  title: { type: String },
  links: { type: Array },
  showPaletteEntry: { type: Boolean, attribute: "show-palette-entry" },
  openDropdownId: { type: String, state: true }
});
__publicField(WyLinksModal, "styles", i`
    :host {
      display: block;
      position: relative;
    }

    /* Material Symbols */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: 'liga';
    }

    /* Modal overlay - matches mockup backdrop */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 9%, transparent);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem; /* p-4 from mockup */
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
                  visibility var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
    }

    :host([open]) .modal-overlay {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    :host([open]) {
      display: block;
    }

    /* Modal container - matches mockup exactly */
    .modal-container {
      position: relative;
      width: 100%;
      max-width: 56rem; /* max-w-4xl = 896px */
      max-height: 90vh; /* Constrain height to enable scrolling */
      background: var(--paper, #F7F4EE);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: 0;
      box-shadow: var(--shadow-modal); /* shadow-2xl */
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 5%, transparent); /* border-black/5 */
      transform: scale(0.95) translateY(20px);
      opacity: 0;
      transition: transform var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-spring),
                  opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
      display: flex;
      flex-direction: column;
    }

    :host([open]) .modal-container {
      transform: scale(1) translateY(0);
      opacity: 1;
    }

    /* Content wrapper with padding - matches mockup p-8 */
    .modal-content {
      padding: var(--spacing-xl, 2rem);
      padding-bottom: calc(var(--spacing-xl, 2rem) + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0; /* Allow shrinking below content size for scroll */
      overflow-y: auto;
      overflow-x: hidden;
    }

    @media (max-width: 600px) {
      .modal-overlay {
        padding: 0;
        align-items: flex-end;
      }

      .modal-container {
        max-width: 100%;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
      }

      .modal-content {
        padding: var(--spacing-lg, 1.5rem);
        /* Extra padding for mobile browser controls (toolbar, home indicator) */
        padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
        height: 100%;
        box-sizing: border-box;
      }

      .close-button {
        top: var(--spacing-lg, 1.5rem);
        right: var(--spacing-lg, 1.5rem);
      }

      .modal-title {
        font-size: 1.75rem;
      }

      .title-wrapper {
        margin-bottom: var(--spacing-xl, 2rem);
      }

      .sections-container {
        gap: 2rem;
      }
    }

    /* Close button - matches mockup exactly */
    .close-button {
      position: absolute;
      top: var(--spacing-xl, 2rem);
      right: var(--spacing-xl, 2rem);
      background: none;
      border: none;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--wy-links-modal-close-color, #A8A29E); /* stone-400 from reference */
      transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
      overflow: hidden;
      z-index: 10;
      border-radius: 50%;
    }

    .close-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: var(--md-sys-color-primary);
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
    }

    .close-button:hover::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .close-button:hover {
      color: var(--md-sys-color-text-heading); /* hover:text-primary */
    }

    .close-button:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .close-button .material-symbols-outlined {
      font-size: 2rem; /* text-2xl */
      position: relative;
      z-index: 1;
    }

    /* Title wrapper with mb-12 */
    .title-wrapper {
      margin-bottom: var(--spacing-2xl, 3rem);
      flex-shrink: 0; /* Title stays fixed, doesn't shrink */
    }

    /* Title - matches mockup exactly */
    .modal-title {
      font-family: var(--font-serif); /* playfair */
      font-size: 2.25rem; /* text-4xl = 36px */
      font-weight: 500; /* font-medium */
      line-height: 1.2;
      color: var(--wy-links-modal-title-color, #1C1917); /* stone-900 from reference */
      margin: 0;
    }

    /* Sections container - matches space-y-10 */
    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 2.5rem; /* 40px = 2.5rem */
    }

    /* Section */
    .section {
      display: flex;
      flex-direction: column;
    }

    /* Section header - matches mockup exactly */
    .section-header {
      font-family: var(--font-serif); /* playfair */
      font-size: 1.25rem; /* text-xl = 20px */
      font-weight: 500; /* font-medium */
      line-height: 1.2;
      color: var(--wy-links-modal-header-color, #292524); /* stone-800 from reference */
      margin: 0 0 1.25rem 0; /* 20px = 1.25rem */
    }

    /* Chips container - matches flex flex-wrap gap-3 */
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: calc(var(--spacing-sm, 0.5rem) * 1.5); /* 12px = 1.5 * 8px */
    }

    /* Link chip button - matches mockup exactly */
    .link-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: calc(var(--spacing-sm, 0.5rem) * 1.25) var(--spacing-lg, 1.5rem); /* 10px 24px = 1.25 * 8px, 24px */
      border-radius: 0;
      font-family: var(--ff-sans, 'Inter', sans-serif);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.875rem; /* text-sm = 14px */
      font-weight: 500; /* font-medium */
      cursor: pointer;
      border: none;
      background-color: var(--md-sys-color-surface-container-lowest);
      color: var(--wy-links-modal-chip-text-color, #44403C); /* stone-700 from reference */
      text-decoration: none;
      transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
      position: relative;
      overflow: hidden;
    }

    /* Chip hover state layer */
    .link-chip::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 15%, transparent);
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
    }

    .link-chip:hover::before {
      opacity: 1;
    }

    /* Chip pressed state */
    .link-chip:active {
      transform: scale(0.97);
    }

    /* Focus state */
    .link-chip:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .link-dropdown {
      position: relative;
      display: inline-flex;
    }

    .link-chip--dropdown {
      gap: var(--spacing-xs, 0.25rem);
      padding-right: var(--spacing-md, 1rem);
    }

    .link-chip__label,
    .link-chip__icon {
      position: relative;
      z-index: 1;
    }

    .link-chip__icon {
      font-size: 1.25rem;
      transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
    }

    .link-chip--dropdown[aria-expanded="true"] .link-chip__icon {
      transform: rotate(180deg);
    }

    .link-menu {
      position: absolute;
      top: calc(100% + var(--spacing-xs, 0.25rem));
      left: 0;
      z-index: 20;
      min-width: 15rem;
      padding: var(--spacing-xs, 0.25rem);
      border: 1px solid var(--paper-edge, #DDD6C8);
      background: var(--paper, #F7F4EE);
      box-shadow: var(--shadow-modal);
    }

    .link-menu__item {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: flex-start;
      min-height: 2.75rem;
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
      border: none;
      border-radius: 0;
      background: transparent;
      color: var(--wy-links-modal-chip-text-color, #44403C);
      cursor: pointer;
      font-family: var(--ff-sans, 'Inter', sans-serif);
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      line-height: 1.2;
      text-align: left;
      text-transform: uppercase;
      transition: background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
    }

    .link-menu__item:hover {
      background: color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 12%, transparent);
    }

    .link-menu__item:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: -3px;
    }

    @media (max-width: 600px) {
      .link-dropdown {
        align-items: flex-start;
        flex-direction: column;
      }

      .link-menu {
        position: static;
        width: max-content;
        min-width: 0;
        max-width: calc(100vw - (var(--spacing-md, 1rem) * 2));
        margin-top: var(--spacing-xs, 0.25rem);
      }
    }

    /* Palette entry */
    .palette-entry-section {
      padding-bottom: var(--spacing-lg, 24px);
      border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
      margin-bottom: var(--spacing-lg, 24px);
    }

    .palette-entry-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      height: 40px;
      padding: 0 var(--spacing-md, 16px) 0 var(--spacing-sm, 8px);
      border: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 14%, transparent);
      border-radius: 20px;
      background: transparent;
      color: var(--md-sys-color-on-surface, #1A1A1A);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 120ms ease;
    }

    .palette-entry-btn:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface) 6%, transparent);
    }

    .palette-entry-btn:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .palette-entry-btn .material-symbols-outlined {
      font-size: 20px;
      opacity: 0.7;
    }

  `);
if (!WyLinksModal) {
  console.error("[wy-links-modal] Component class is undefined");
  throw new Error("WyLinksModal class is undefined");
}
if (!customElements) {
  console.error("[wy-links-modal] customElements API not available");
  throw new Error("customElements API not available");
}
try {
  customElements.define("wy-links-modal", WyLinksModal);
  console.log("[wy-links-modal] Component registered successfully");
} catch (error) {
  console.error("[wy-links-modal] Failed to register component:", error);
  console.error("[wy-links-modal] Error stack:", error.stack);
  console.error("[wy-links-modal] WyLinksModal type:", typeof WyLinksModal);
  console.error("[wy-links-modal] WyLinksModal value:", WyLinksModal);
  throw error;
}

// components/ui/wy-color-palette.js
var WyColorPalette = class extends i4 {
  constructor() {
    super();
    this.open = false;
    this.palettes = [];
    this._loading = false;
    this._error = false;
    this._loaded = false;
    this._copiedChipEl = null;
    this._copiedPaletteId = null;
    this._handleDocKeyDown = this._handleDocKeyDown.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this._handleDocKeyDown);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._handleDocKeyDown);
  }
  updated(changed) {
    if (changed.has("open") && this.open && !this._loaded) {
      this._loadPalettes();
    }
  }
  async _loadPalettes() {
    this._loading = true;
    this._error = false;
    try {
      const res = await fetch("/palettes.json");
      if (!res.ok) throw new Error("fetch failed");
      this.palettes = await res.json();
      this._loaded = true;
    } catch {
      this._error = true;
    } finally {
      this._loading = false;
    }
  }
  async _copyHex(hex, chipEl) {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      this._fallbackCopy(hex);
    }
    this._flashChip(chipEl);
    this._dispatchToast(hex);
  }
  async _copyPalette(palette, btnEl) {
    const text = `Color Palette: ${palette.colors.map((c4) => `${c4.name} (${c4.hex})`).join(", ")}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      this._fallbackCopy(text);
    }
    this._flashCopyBtn(btnEl, palette.paletteId);
    this._dispatchToast(`"${palette.paletteName}" copied`);
  }
  _fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;top:0;left:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
    }
    document.body.removeChild(ta);
  }
  _flashChip(chipEl) {
    if (!chipEl) return;
    chipEl.classList.add("copied");
    setTimeout(() => chipEl.classList.remove("copied"), 900);
  }
  _flashCopyBtn(btnEl, paletteId) {
    if (!btnEl) return;
    this._copiedPaletteId = paletteId;
    btnEl.classList.add("copied");
    setTimeout(() => {
      btnEl.classList.remove("copied");
      this._copiedPaletteId = null;
    }, 1200);
  }
  _dispatchToast(message) {
    this.dispatchEvent(new CustomEvent("palette-toast", {
      detail: { message },
      bubbles: true,
      composed: true
    }));
  }
  close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }
  _handleScrimClick(e9) {
    if (e9.target === e9.currentTarget) this.close();
  }
  _handleDocKeyDown(e9) {
    if (e9.key === "Escape" && this.open) this.close();
  }
  render() {
    return b2`
            <div class="scrim" @click="${this._handleScrimClick}"></div>
            <div
                class="panel"
                role="dialog"
                aria-label="Color Palettes"
                aria-modal="true"
            >
                <div class="panel-header">
                    <h2 class="panel-title">Color Palettes</h2>
                    <button
                        class="close-btn"
                        @click="${this.close}"
                        aria-label="Close palette panel"
                    >
                        <span class="ms">close</span>
                    </button>
                </div>
                <div class="panel-body">
                    ${this._loading ? b2`<p class="state-msg">Loading…</p>` : this._error ? b2`<p class="state-msg">Could not load palettes.</p>` : this.palettes.length === 0 ? b2`<p class="state-msg">No palettes available.</p>` : this.palettes.map((p4) => this._renderRow(p4))}
                </div>
            </div>
        `;
  }
  _renderRow(palette) {
    return b2`
            <div class="palette-row">
                <div class="palette-row-header">
                    <p class="palette-name">${palette.paletteName}</p>
                    <button
                        class="copy-palette-btn"
                        title="Copy palette as text"
                        aria-label="Copy ${palette.paletteName} palette"
                        @click="${(e9) => this._copyPalette(palette, e9.currentTarget)}"
                    >
                        <span class="ms sm">content_copy</span>
                    </button>
                </div>
                <div class="chips-row">
                    ${palette.colors.map((c4) => b2`
                        <button
                            class="chip"
                            style="background-color: ${c4.hex};"
                            title="${c4.name} — ${c4.hex}"
                            aria-label="Copy ${c4.name} (${c4.hex})"
                            @click="${(e9) => this._copyHex(c4.hex, e9.currentTarget)}"
                        ></button>
                    `)}
                </div>
            </div>
        `;
  }
};
__publicField(WyColorPalette, "properties", {
  open: { type: Boolean, reflect: true },
  palettes: { type: Array },
  _loading: { state: true },
  _error: { state: true }
});
__publicField(WyColorPalette, "styles", i`
        :host {
            display: block;
            position: fixed;
            inset: 0;
            width: 100dvw;
            height: 100dvh;
            z-index: var(--wy-color-palette-z-index, 3000);
            pointer-events: none;
            font-family: var(--ff-sans, 'Inter', sans-serif);
        }

        :host([open]) {
            pointer-events: auto;
        }

        .scrim {
            position: fixed;
            inset: 0;
            background: transparent;
            pointer-events: none;
        }

        :host([open]) .scrim {
            pointer-events: auto;
        }

        .panel {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 320px;
            max-width: 100vw;
            background: var(--paper, #F7F4EE);
            border-left: 1px solid var(--paper-edge, #DDD6C8);
            box-shadow: var(--shadow-modal, -4px 0 32px rgba(0,0,0,0.14));
            display: flex;
            flex-direction: column;
            transform: translateX(100%);
            transition: transform var(--dur-2, 350ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            pointer-events: auto;
            overflow: hidden;
        }

        :host([open]) .panel {
            transform: translateX(0);
        }

        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--s-3, 12px) var(--s-4, 16px) var(--s-3, 12px) var(--s-5, 24px);
            border-bottom: 1px solid var(--paper-edge, #DDD6C8);
            flex-shrink: 0;
        }

        .panel-title {
            font-family: var(--ff-serif, 'Lora', serif);
            font-style: italic;
            font-size: var(--fs-body-l, 16px);
            font-weight: 500;
            color: var(--ink, #1A1A1A);
            margin: 0;
        }

        .close-btn {
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-pill, 9999px);
            color: var(--ink-mute, #6B6B6A);
            position: relative;
            overflow: hidden;
            transition: color var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            flex-shrink: 0;
        }

        .close-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--ink, #1A1A1A);
            opacity: 0;
            transition: opacity var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            border-radius: inherit;
            pointer-events: none;
        }

        .close-btn:hover::before { opacity: 0.06; }
        .close-btn:hover { color: var(--ink, #1A1A1A); }

        .close-btn:focus-visible {
            outline: 2px solid var(--ink, #1A1A1A);
            outline-offset: 2px;
        }

        .panel-body {
            flex: 1;
            overflow-y: auto;
            padding: var(--s-4, 16px) var(--s-5, 24px);
            display: flex;
            flex-direction: column;
            gap: var(--s-5, 24px);
        }

        .palette-row {
            display: flex;
            flex-direction: column;
            gap: var(--s-2, 8px);
        }

        .palette-row-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--s-2, 8px);
        }

        .palette-name {
            font-size: var(--fs-body-s, 13px);
            font-weight: 500;
            color: var(--ink, #1A1A1A);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .copy-palette-btn {
            width: 28px;
            height: 28px;
            background: transparent;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-pill, 9999px);
            color: var(--ink-soft, #A8A49C);
            position: relative;
            overflow: hidden;
            transition: color var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            flex-shrink: 0;
        }

        .copy-palette-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--ink, #1A1A1A);
            opacity: 0;
            transition: opacity var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            border-radius: inherit;
            pointer-events: none;
        }

        .copy-palette-btn:hover::before { opacity: 0.06; }
        .copy-palette-btn:hover { color: var(--ink, #1A1A1A); }

        .copy-palette-btn:focus-visible {
            outline: 2px solid var(--ink, #1A1A1A);
            outline-offset: 2px;
        }

        .copy-palette-btn.copied {
            color: var(--ok, #386A20);
        }

        .chips-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--s-1, 4px);
        }

        .chip {
            width: 20px;
            height: 20px;
            border-radius: var(--radius-1, 2px);
            border: 1px solid rgba(26, 26, 26, 0.12);
            cursor: pointer;
            flex-shrink: 0;
            position: relative;
            background: transparent;
            padding: 0;
            transition: transform var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
        }

        .chip:hover {
            transform: scale(1.3);
            z-index: 1;
        }

        .chip:active {
            transform: scale(1.1);
        }

        .chip:focus-visible {
            outline: 2px solid var(--ink, #1A1A1A);
            outline-offset: 2px;
        }

        .chip.copied {
            outline: 2px solid var(--ok, #386A20);
            outline-offset: 2px;
        }

        .ms {
            font-family: 'Material Symbols Outlined';
            font-size: 18px;
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
            line-height: 1;
            display: inline-flex;
            user-select: none;
        }

        .ms.sm {
            font-size: 16px;
        }

        .state-msg {
            text-align: center;
            padding: var(--s-7, 48px) var(--s-4, 16px);
            color: var(--ink-mute, #6B6B6A);
            font-size: var(--fs-body-s, 13px);
        }

        @media (prefers-reduced-motion: reduce) {
            .panel { transition: none; }
            .chip  { transition: none; }
        }

        @media (max-width: 480px) {
            .panel {
                top: auto;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 65vh;
                transform: translateY(100%);
                border-left: none;
                border-top: 1px solid var(--paper-edge, #DDD6C8);
                border-radius: var(--radius-3, 16px) var(--radius-3, 16px) 0 0;
                box-shadow: 0 -4px 32px rgba(0,0,0,0.12);
            }
            :host([open]) .panel {
                transform: translateY(0);
            }
        }
    `);
customElements.define("wy-color-palette", WyColorPalette);

// components/ui/index.js
console.log("[prompts-library] Local web components registered");
/*! Bundled license information:

@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/reactive-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@material/web/icon/internal/icon.js:
@material/web/icon/icon.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   *)

@material/web/icon/internal/icon-styles.js:
@material/web/divider/internal/divider-styles.js:
@material/web/dialog/internal/dialog-styles.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   *)

@material/web/divider/internal/divider.js:
@material/web/divider/divider.js:
@material/web/internal/aria/aria.js:
@material/web/internal/aria/delegate.js:
@material/web/dialog/internal/animations.js:
@material/web/dialog/internal/dialog.js:
@material/web/dialog/dialog.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   *)

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@material/web/internal/events/redispatch-event.js:
@material/web/internal/motion/animation.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   *)

lit-html/directive-helpers.js:
lit-html/directives/live.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
