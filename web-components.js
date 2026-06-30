var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t5, e6, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t5, this.t = e6;
  }
  get styleSheet() {
    let t5 = this.o;
    const s4 = this.t;
    if (e && void 0 === t5) {
      const e6 = void 0 !== s4 && 1 === s4.length;
      e6 && (t5 = o.get(s4)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e6 && o.set(s4, t5));
    }
    return t5;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t5) => new n("string" == typeof t5 ? t5 : t5 + "", void 0, s);
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet);
  else for (const e6 of o6) {
    const o7 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o7.setAttribute("nonce", n4), o7.textContent = e6.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
  let e6 = "";
  for (const s4 of t6.cssRules) e6 += s4.cssText;
  return r(e6);
})(t5) : t5;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t5, s4) => t5;
var u = { toAttribute(t5, s4) {
  switch (s4) {
    case Boolean:
      t5 = t5 ? l : null;
      break;
    case Object:
    case Array:
      t5 = null == t5 ? t5 : JSON.stringify(t5);
  }
  return t5;
}, fromAttribute(t5, s4) {
  let i6 = t5;
  switch (s4) {
    case Boolean:
      i6 = null !== t5;
      break;
    case Number:
      i6 = null === t5 ? null : Number(t5);
      break;
    case Object:
    case Array:
      try {
        i6 = JSON.parse(t5);
      } catch (t6) {
        i6 = null;
      }
  }
  return i6;
} };
var f = (t5, s4) => !i2(t5, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t5) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t5);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t5, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t5) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t5, s4), !s4.noAccessor) {
      const i6 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t5, i6, s4);
      void 0 !== h3 && e2(this.prototype, t5, h3);
    }
  }
  static getPropertyDescriptor(t5, s4, i6) {
    const { get: e6, set: r5 } = h(this.prototype, t5) ?? { get() {
      return this[s4];
    }, set(t6) {
      this[s4] = t6;
    } };
    return { get: e6, set(s5) {
      const h3 = e6?.call(this);
      r5?.call(this, s5), this.requestUpdate(t5, h3, i6);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t5) {
    return this.elementProperties.get(t5) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t5 = n2(this);
    t5.finalize(), void 0 !== t5.l && (this.l = [...t5.l]), this.elementProperties = new Map(t5.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t6 = this.properties, s4 = [...r2(t6), ...o2(t6)];
      for (const i6 of s4) this.createProperty(i6, t6[i6]);
    }
    const t5 = this[Symbol.metadata];
    if (null !== t5) {
      const s4 = litPropertyMetadata.get(t5);
      if (void 0 !== s4) for (const [t6, i6] of s4) this.elementProperties.set(t6, i6);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t6, s4] of this.elementProperties) {
      const i6 = this._$Eu(t6, s4);
      void 0 !== i6 && this._$Eh.set(i6, t6);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i6 = [];
    if (Array.isArray(s4)) {
      const e6 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e6) i6.unshift(c(s5));
    } else void 0 !== s4 && i6.push(c(s4));
    return i6;
  }
  static _$Eu(t5, s4) {
    const i6 = s4.attribute;
    return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t5 ? t5.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t5) => this.enableUpdating = t5), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t5) => t5(this));
  }
  addController(t5) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t5), void 0 !== this.renderRoot && this.isConnected && t5.hostConnected?.();
  }
  removeController(t5) {
    this._$EO?.delete(t5);
  }
  _$E_() {
    const t5 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i6 of s4.keys()) this.hasOwnProperty(i6) && (t5.set(i6, this[i6]), delete this[i6]);
    t5.size > 0 && (this._$Ep = t5);
  }
  createRenderRoot() {
    const t5 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t5, this.constructor.elementStyles), t5;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t5) => t5.hostConnected?.());
  }
  enableUpdating(t5) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t5) => t5.hostDisconnected?.());
  }
  attributeChangedCallback(t5, s4, i6) {
    this._$AK(t5, i6);
  }
  _$ET(t5, s4) {
    const i6 = this.constructor.elementProperties.get(t5), e6 = this.constructor._$Eu(t5, i6);
    if (void 0 !== e6 && true === i6.reflect) {
      const h3 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
      this._$Em = t5, null == h3 ? this.removeAttribute(e6) : this.setAttribute(e6, h3), this._$Em = null;
    }
  }
  _$AK(t5, s4) {
    const i6 = this.constructor, e6 = i6._$Eh.get(t5);
    if (void 0 !== e6 && this._$Em !== e6) {
      const t6 = i6.getPropertyOptions(e6), h3 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== t6.converter?.fromAttribute ? t6.converter : u;
      this._$Em = e6;
      const r5 = h3.fromAttribute(s4, t6.type);
      this[e6] = r5 ?? this._$Ej?.get(e6) ?? r5, this._$Em = null;
    }
  }
  requestUpdate(t5, s4, i6, e6 = false, h3) {
    if (void 0 !== t5) {
      const r5 = this.constructor;
      if (false === e6 && (h3 = this[t5]), i6 ?? (i6 = r5.getPropertyOptions(t5)), !((i6.hasChanged ?? f)(h3, s4) || i6.useDefault && i6.reflect && h3 === this._$Ej?.get(t5) && !this.hasAttribute(r5._$Eu(t5, i6)))) return;
      this.C(t5, s4, i6);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t5, s4, { useDefault: i6, reflect: e6, wrapped: h3 }, r5) {
    i6 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t5) && (this._$Ej.set(t5, r5 ?? s4 ?? this[t5]), true !== h3 || void 0 !== r5) || (this._$AL.has(t5) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t5, s4)), true === e6 && this._$Em !== t5 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t5));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t6) {
      Promise.reject(t6);
    }
    const t5 = this.scheduleUpdate();
    return null != t5 && await t5, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t7, s5] of this._$Ep) this[t7] = s5;
        this._$Ep = void 0;
      }
      const t6 = this.constructor.elementProperties;
      if (t6.size > 0) for (const [s5, i6] of t6) {
        const { wrapped: t7 } = i6, e6 = this[s5];
        true !== t7 || this._$AL.has(s5) || void 0 === e6 || this.C(s5, void 0, i6, e6);
      }
    }
    let t5 = false;
    const s4 = this._$AL;
    try {
      t5 = this.shouldUpdate(s4), t5 ? (this.willUpdate(s4), this._$EO?.forEach((t6) => t6.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t5 = false, this._$EM(), s5;
    }
    t5 && this._$AE(s4);
  }
  willUpdate(t5) {
  }
  _$AE(t5) {
    this._$EO?.forEach((t6) => t6.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t5)), this.updated(t5);
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
  shouldUpdate(t5) {
    return true;
  }
  update(t5) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t6) => this._$ET(t6, this[t6]))), this._$EM();
  }
  updated(t5) {
  }
  firstUpdated(t5) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t5) => t5;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t5) => null === t5 || "object" != typeof t5 && "function" != typeof t5;
var u2 = Array.isArray;
var d2 = (t5) => u2(t5) || "function" == typeof t5?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t5) => (i6, ...s4) => ({ _$litType$: t5, strings: i6, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t5, i6) {
  if (!u2(t5) || !t5.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i6) : i6;
}
var N = (t5, i6) => {
  const s4 = t5.length - 1, e6 = [];
  let n4, l6 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c4 = v;
  for (let i7 = 0; i7 < s4; i7++) {
    const s5 = t5[i7];
    let a3, u3, d4 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d4 = -1) : void 0 === u3[1] ? d4 = -2 : (d4 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x3 = c4 === p2 && t5[i7 + 1].startsWith("/>") ? " " : "";
    l6 += c4 === v ? s5 + r3 : d4 >= 0 ? (e6.push(a3), s5.slice(0, d4) + h2 + s5.slice(d4) + o3 + x3) : s5 + o3 + (-2 === d4 ? i7 : x3);
  }
  return [V(t5, l6 + (t5[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e6];
};
var S2 = class _S {
  constructor({ strings: t5, _$litType$: i6 }, e6) {
    let r5;
    this.parts = [];
    let l6 = 0, a3 = 0;
    const u3 = t5.length - 1, d4 = this.parts, [f3, v3] = N(t5, i6);
    if (this.el = _S.createElement(f3, e6), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (; null !== (r5 = P.nextNode()) && d4.length < u3; ) {
      if (1 === r5.nodeType) {
        if (r5.hasAttributes()) for (const t6 of r5.getAttributeNames()) if (t6.endsWith(h2)) {
          const i7 = v3[a3++], s4 = r5.getAttribute(t6).split(o3), e7 = /([.?@])?(.*)/.exec(i7);
          d4.push({ type: 1, index: l6, name: e7[2], strings: s4, ctor: "." === e7[1] ? I : "?" === e7[1] ? L : "@" === e7[1] ? z : H }), r5.removeAttribute(t6);
        } else t6.startsWith(o3) && (d4.push({ type: 6, index: l6 }), r5.removeAttribute(t6));
        if (y2.test(r5.tagName)) {
          const t6 = r5.textContent.split(o3), i7 = t6.length - 1;
          if (i7 > 0) {
            r5.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i7; s4++) r5.append(t6[s4], c3()), P.nextNode(), d4.push({ type: 2, index: ++l6 });
            r5.append(t6[i7], c3());
          }
        }
      } else if (8 === r5.nodeType) if (r5.data === n3) d4.push({ type: 2, index: l6 });
      else {
        let t6 = -1;
        for (; -1 !== (t6 = r5.data.indexOf(o3, t6 + 1)); ) d4.push({ type: 7, index: l6 }), t6 += o3.length - 1;
      }
      l6++;
    }
  }
  static createElement(t5, i6) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t5, s4;
  }
};
function M(t5, i6, s4 = t5, e6) {
  if (i6 === E) return i6;
  let h3 = void 0 !== e6 ? s4._$Co?.[e6] : s4._$Cl;
  const o6 = a2(i6) ? void 0 : i6._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t5), h3._$AT(t5, s4, e6)), void 0 !== e6 ? (s4._$Co ?? (s4._$Co = []))[e6] = h3 : s4._$Cl = h3), void 0 !== h3 && (i6 = M(t5, h3._$AS(t5, i6.values), h3, e6)), i6;
}
var R = class {
  constructor(t5, i6) {
    this._$AV = [], this._$AN = void 0, this._$AD = t5, this._$AM = i6;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t5) {
    const { el: { content: i6 }, parts: s4 } = this._$AD, e6 = (t5?.creationScope ?? l2).importNode(i6, true);
    P.currentNode = e6;
    let h3 = P.nextNode(), o6 = 0, n4 = 0, r5 = s4[0];
    for (; void 0 !== r5; ) {
      if (o6 === r5.index) {
        let i7;
        2 === r5.type ? i7 = new k(h3, h3.nextSibling, this, t5) : 1 === r5.type ? i7 = new r5.ctor(h3, r5.name, r5.strings, this, t5) : 6 === r5.type && (i7 = new Z(h3, this, t5)), this._$AV.push(i7), r5 = s4[++n4];
      }
      o6 !== r5?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e6;
  }
  p(t5) {
    let i6 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t5, s4, i6), i6 += s4.strings.length - 2) : s4._$AI(t5[i6])), i6++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t5, i6, s4, e6) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t5, this._$AB = i6, this._$AM = s4, this.options = e6, this._$Cv = e6?.isConnected ?? true;
  }
  get parentNode() {
    let t5 = this._$AA.parentNode;
    const i6 = this._$AM;
    return void 0 !== i6 && 11 === t5?.nodeType && (t5 = i6.parentNode), t5;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t5, i6 = this) {
    t5 = M(this, t5, i6), a2(t5) ? t5 === A || null == t5 || "" === t5 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t5 !== this._$AH && t5 !== E && this._(t5) : void 0 !== t5._$litType$ ? this.$(t5) : void 0 !== t5.nodeType ? this.T(t5) : d2(t5) ? this.k(t5) : this._(t5);
  }
  O(t5) {
    return this._$AA.parentNode.insertBefore(t5, this._$AB);
  }
  T(t5) {
    this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
  }
  _(t5) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(l2.createTextNode(t5)), this._$AH = t5;
  }
  $(t5) {
    const { values: i6, _$litType$: s4 } = t5, e6 = "number" == typeof s4 ? this._$AC(t5) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e6) this._$AH.p(i6);
    else {
      const t6 = new R(e6, this), s5 = t6.u(this.options);
      t6.p(i6), this.T(s5), this._$AH = t6;
    }
  }
  _$AC(t5) {
    let i6 = C.get(t5.strings);
    return void 0 === i6 && C.set(t5.strings, i6 = new S2(t5)), i6;
  }
  k(t5) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i6 = this._$AH;
    let s4, e6 = 0;
    for (const h3 of t5) e6 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e6], s4._$AI(h3), e6++;
    e6 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e6), i6.length = e6);
  }
  _$AR(t5 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t5 !== this._$AB; ) {
      const s5 = i3(t5).nextSibling;
      i3(t5).remove(), t5 = s5;
    }
  }
  setConnected(t5) {
    void 0 === this._$AM && (this._$Cv = t5, this._$AP?.(t5));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t5, i6, s4, e6, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t5, this.name = i6, this._$AM = e6, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t5, i6 = this, s4, e6) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t5 = M(this, t5, i6, 0), o6 = !a2(t5) || t5 !== this._$AH && t5 !== E, o6 && (this._$AH = t5);
    else {
      const e7 = t5;
      let n4, r5;
      for (t5 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r5 = M(this, e7[s4 + n4], i6, n4), r5 === E && (r5 = this._$AH[n4]), o6 || (o6 = !a2(r5) || r5 !== this._$AH[n4]), r5 === A ? t5 = A : t5 !== A && (t5 += (r5 ?? "") + h3[n4 + 1]), this._$AH[n4] = r5;
    }
    o6 && !e6 && this.j(t5);
  }
  j(t5) {
    t5 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t5) {
    this.element[this.name] = t5 === A ? void 0 : t5;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t5) {
    this.element.toggleAttribute(this.name, !!t5 && t5 !== A);
  }
};
var z = class extends H {
  constructor(t5, i6, s4, e6, h3) {
    super(t5, i6, s4, e6, h3), this.type = 5;
  }
  _$AI(t5, i6 = this) {
    if ((t5 = M(this, t5, i6, 0) ?? A) === E) return;
    const s4 = this._$AH, e6 = t5 === A && s4 !== A || t5.capture !== s4.capture || t5.once !== s4.once || t5.passive !== s4.passive, h3 = t5 !== A && (s4 === A || e6);
    e6 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
  }
  handleEvent(t5) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t5) : this._$AH.handleEvent(t5);
  }
};
var Z = class {
  constructor(t5, i6, s4) {
    this.element = t5, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t5) {
    M(this, t5);
  }
};
var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.2");
var D = (t5, i6, s4) => {
  const e6 = s4?.renderBefore ?? i6;
  let h3 = e6._$litPart$;
  if (void 0 === h3) {
    const t6 = s4?.renderBefore ?? null;
    e6._$litPart$ = h3 = new k(i6.insertBefore(c3(), t6), t6, void 0, s4 ?? {});
  }
  return h3._$AI(t5), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a2;
    const t5 = super.createRenderRoot();
    return (_a2 = this.renderOptions).renderBefore ?? (_a2.renderBefore = t5.firstChild), t5;
  }
  update(t5) {
    const r5 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = D(r5, this.renderRoot, this.renderOptions);
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
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// components/ui/wy-button.js
var WyButton = class extends i4 {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super();
    this.variant = "primary";
    this.size = "medium";
    this.iconPosition = "trailing";
    this.disabled = false;
    this.fullWidth = false;
    this.label = "";
    this._capturedLabel = false;
  }
  connectedCallback() {
    if (!this._capturedLabel && !this.label) {
      this.label = this.textContent.trim();
      this._capturedLabel = true;
    }
    Array.from(this.childNodes).forEach((node) => node.remove());
    super.connectedCallback();
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
        ?disabled="${this.disabled}"
        @click="${this._handleClick}"
      >
        ${this.iconPosition === "leading" ? iconElement : null}
        <span class="label">${this.label}</span>
        ${this.iconPosition === "trailing" ? iconElement : null}
      </button>
    `;
  }
  _handleClick(e6) {
    if (this.disabled) {
      e6.preventDefault();
      e6.stopPropagation();
    }
  }
};
__publicField(WyButton, "properties", {
  variant: { type: String },
  size: { type: String },
  icon: { type: String },
  iconPosition: { type: String, attribute: "icon-position" },
  disabled: { type: Boolean, reflect: true },
  fullWidth: { type: Boolean, attribute: "full-width" },
  label: { type: String }
});
customElements.define("wy-button", WyButton);

// components/ui/wy-filter-chip.js
var WyFilterChip = class extends i4 {
  createRenderRoot() {
    return this;
  }
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
  _handleKeydown(e6) {
    if (e6.key === "Enter" || e6.key === " ") {
      e6.preventDefault();
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
customElements.define("wy-filter-chip", WyFilterChip);

// components/ui/wy-controls-bar.js
var WyControlsBar = class extends i4 {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super();
    this.viewMode = "grid";
    this.showDetails = false;
    this.activeCategory = "all";
    this.categories = ["Productivity", "Expertise", "Travel & Shopping"];
    this.searchValue = "";
    this.hideViewToggle = false;
    this.hideDetailsToggle = false;
    this.showFeaturedFilter = false;
    this.showHiddenFilter = false;
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
    const track = this.querySelector(".chips-track");
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
          this.querySelector(".search-input")?.focus();
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
      <div class="controls-container">

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
          <div class="chips-track" role="tablist">
            ${this.showFeaturedFilter ? b2`
              <button
                class="chip chip--featured ${this.showFeaturedOnly ? "active" : ""}"
                aria-pressed="${this.showFeaturedOnly}"
                @click="${this._toggleFeatured}"
              >Featured</button>
            ` : ""}
            ${this.showHiddenFilter ? b2`
              <button
                class="chip chip--hidden ${this.showHiddenOnly ? "active" : ""}"
                aria-pressed="${this.showHiddenOnly}"
                @click="${this._toggleHidden}"
              >Hidden</button>
            ` : ""}
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
  _handleSearch(e6) {
    this.searchValue = e6.target.value;
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
    this.querySelector(".search-input")?.focus();
  }
  dismissSearch({ clear = false } = {}) {
    const searchInput = this.querySelector(".search-input");
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
  _toggleDetails(e6) {
    e6.preventDefault();
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
  showFeaturedFilter: { type: Boolean, attribute: "show-featured-filter" },
  showHiddenFilter: { type: Boolean, attribute: "show-hidden-filter" },
  showFeaturedOnly: { type: Boolean, attribute: "show-featured-only" },
  showHiddenOnly: { type: Boolean, attribute: "show-hidden-only" },
  chipVariant: { type: String, attribute: "chip-variant" },
  isScrolled: { type: Boolean, state: true },
  scrollState: { type: String, state: true },
  _mobileSearchOpen: { type: Boolean, state: true }
});
customElements.define("wy-controls-bar", WyControlsBar);

// components/ui/wy-toast.js
var WyToast = class extends i4 {
  createRenderRoot() {
    return this;
  }
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
customElements.define("wy-toast", WyToast);

// components/ui/wy-copy-confirm.js
var WyCopyConfirm = class extends i4 {
  createRenderRoot() {
    return this;
  }
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
customElements.define("wy-copy-confirm", WyCopyConfirm);

// node_modules/lit-html/directive.js
var t3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e4 = (t5) => (...e6) => ({ _$litDirective$: t5, values: e6 });
var i5 = class {
  constructor(t5) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t5, e6, i6) {
    this._$Ct = t5, this._$AM = e6, this._$Ci = i6;
  }
  _$AS(t5, e6) {
    return this.update(t5, e6);
  }
  update(t5, e6) {
    return this.render(...e6);
  }
};

// node_modules/lit-html/directives/unsafe-html.js
var e5 = class extends i5 {
  constructor(i6) {
    if (super(i6), this.it = A, i6.type !== t3.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(r5) {
    if (r5 === A || null == r5) return this._t = void 0, this.it = r5;
    if (r5 === E) return r5;
    if ("string" != typeof r5) throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (r5 === this.it) return this._t;
    this.it = r5;
    const s4 = [r5];
    return s4.raw = s4, this._t = { _$litType$: this.constructor.resultType, strings: s4, values: [] };
  }
};
e5.directiveName = "unsafeHTML", e5.resultType = 1;
var o5 = e4(e5);

// components/ui/wy-modal.js
var WyModal = class extends i4 {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super();
    this.open = false;
    this.heading = "";
    this.maxWidth = "560px";
    this.fullScreen = false;
    this.bodyHtml = "";
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }
  connectedCallback() {
    this._captureModalNodes();
    super.connectedCallback();
    document.addEventListener("keydown", this._handleKeyDown);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._handleKeyDown);
  }
  render() {
    if (!this.open) return b2``;
    return b2`
      <div class="wy-modal-scrim" @click="${this._handleOverlayClick}">
        <div class="wy-modal-box" style="max-width: ${this.maxWidth}">
          <header class="wy-modal-header">
            <h2 class="wy-modal-heading">${this.heading}</h2>
          </header>
          <div class="wy-modal-body">${this.bodyHtml ? o5(this.bodyHtml) : ""}</div>
          <footer class="wy-modal-footer"></footer>
        </div>
      </div>
    `;
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("open") && this.open) {
      this._captureModalNodes();
    }
  }
  firstUpdated() {
    this._projectModalNodes();
  }
  updated() {
    this._projectModalNodes();
  }
  _projectModalNodes() {
    const body = this.querySelector(".wy-modal-body");
    const actions = this.querySelector(".wy-modal-footer");
    if (!this.bodyHtml && body && !body.childNodes.length && this._bodyNodes?.length) body.append(...this._bodyNodes);
    if (actions && !actions.childNodes.length && this._actionNodes?.length) actions.append(...this._actionNodes);
  }
  _captureModalNodes() {
    const children = Array.from(this.childNodes).filter((node) => {
      if (node.nodeType === Node.COMMENT_NODE) return false;
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return false;
      return !(node.nodeType === Node.ELEMENT_NODE && node.classList.contains("wy-modal-scrim"));
    });
    if (!children.length) return;
    this._actionNodes = children.filter(
      (node) => node.nodeType === Node.ELEMENT_NODE && node.getAttribute("slot") === "actions"
    );
    this._bodyNodes = children.filter(
      (node) => !(node.nodeType === Node.ELEMENT_NODE && node.getAttribute("slot") === "actions")
    );
    this._actionNodes.forEach((node) => node.removeAttribute("slot"));
    children.forEach((node) => node.remove());
  }
  show() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  _handleClose(e6) {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", {
      bubbles: true,
      composed: true
    }));
  }
  _handleCancel(e6) {
    this.open = false;
  }
  _handleOverlayClick(e6) {
    if (e6.target === e6.currentTarget) {
      this.close();
    }
  }
  _handleKeyDown(e6) {
    if (e6.key === "Escape" && this.open) this._handleClose(e6);
  }
};
__publicField(WyModal, "properties", {
  open: { type: Boolean, reflect: true },
  heading: { type: String },
  maxWidth: { type: String, attribute: "max-width" },
  fullScreen: { type: Boolean, attribute: "full-screen" },
  bodyHtml: { type: String, attribute: false }
});
customElements.define("wy-modal", WyModal);

// components/ui/wy-tabs.js
var WyTabs = class extends i4 {
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    if (!this._capturedTabNodes) {
      this._tabNodes = Array.from(this.childNodes);
      this._tabNodes.forEach((node) => node.remove());
      this._capturedTabNodes = true;
    }
    super.connectedCallback();
  }
  render() {
    return b2`
      <div class="tabs-list" role="tablist"></div>
    `;
  }
  constructor() {
    super();
    this.addEventListener("click", (e6) => {
      const tabBtn = e6.target.closest('[role="tab"]');
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
    this._projectTabs();
    if (changedProperties.has("activeTab")) {
      this._updateTabs();
    }
  }
  firstUpdated() {
    this._projectTabs();
    this._updateTabs();
  }
  _projectTabs() {
    const target = this.querySelector(".tabs-list");
    if (!target || target.childNodes.length || !this._tabNodes?.length) return;
    target.append(...this._tabNodes);
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
customElements.define("wy-tabs", WyTabs);

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
  // Light DOM: styles live in admin.css (scoped under this element tag).
  createRenderRoot() {
    return this;
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
                                @mousedown="${(e6) => {
      e6.preventDefault();
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
  _handleKeyDown(e6) {
    if (this.disabled) return;
    if (e6.key === "ArrowDown") {
      e6.preventDefault();
      if (!this._showDropdown) {
        this._showDropdown = true;
        this._focusedIndex = this.options.findIndex((opt) => opt.value === this.value);
      } else {
        this._focusedIndex = Math.min(this._focusedIndex + 1, this.options.length - 1);
      }
    } else if (e6.key === "ArrowUp") {
      e6.preventDefault();
      if (this._showDropdown) {
        this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
      }
    } else if (e6.key === "Enter" || e6.key === " ") {
      e6.preventDefault();
      if (!this._showDropdown) {
        this._showDropdown = true;
        this._focusedIndex = this.options.findIndex((opt) => opt.value === this.value);
      } else if (this._focusedIndex >= 0 && this.options[this._focusedIndex]) {
        this._select(this.options[this._focusedIndex].value);
      }
    } else if (e6.key === "Escape") {
      e6.preventDefault();
      this._showDropdown = false;
      this.renderRoot.querySelector(".selector")?.blur();
    } else if (e6.key === "Home") {
      e6.preventDefault();
      if (this._showDropdown) {
        this._focusedIndex = 0;
      }
    } else if (e6.key === "End") {
      e6.preventDefault();
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
customElements.define("wy-dropdown", WyDropdown);

// components/ui/wy-info-panel.js
var WyInfoPanel = class extends i4 {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super();
    this.content = "";
    this.variant = "default";
    this.heading = "";
  }
  connectedCallback() {
    if (!this._capturedContentNodes) {
      this._contentNodes = Array.from(this.childNodes);
      this._contentNodes.forEach((node) => node.remove());
      this._capturedContentNodes = true;
    }
    super.connectedCallback();
  }
  render() {
    const panelClass = this.variant === "compact" ? "panel compact" : "panel";
    return b2`
            <div class="${panelClass}">
                ${this.heading ? b2`<h3 class="panel-heading">${this.heading}</h3>` : ""}
                ${this.content ? b2`<p>${this.content}</p>` : b2`<div class="panel-content"></div>`}
            </div>
        `;
  }
  firstUpdated() {
    this._projectContent();
  }
  updated() {
    this._projectContent();
  }
  _projectContent() {
    if (this.content) return;
    const target = this.querySelector(".panel-content");
    if (!target || target.childNodes.length || !this._contentNodes?.length) return;
    target.append(...this._contentNodes);
  }
};
__publicField(WyInfoPanel, "properties", {
  content: { type: String },
  variant: { type: String },
  heading: { type: String }
});
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
  // Light DOM: styles live in admin.css (scoped under this element tag).
  createRenderRoot() {
    return this;
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
  // Light DOM: styles live in admin.css (scoped under this element tag).
  createRenderRoot() {
    return this;
  }
  _handleDragOver(e6) {
    e6.preventDefault();
    this._isDragging = true;
  }
  _handleDragLeave(e6) {
    e6.preventDefault();
    this._isDragging = false;
  }
  _handleDrop(e6) {
    e6.preventDefault();
    this._isDragging = false;
    const files = e6.dataTransfer?.files;
    if (files && files.length > 0) {
      this._handleFile(files[0]);
    }
  }
  _handleFileSelect(e6) {
    const files = e6.target.files;
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
  _handleRemove(e6) {
    e6.stopPropagation();
    this.value = "";
    this.dispatchEvent(new CustomEvent("remove", {
      detail: {},
      bubbles: true,
      composed: true
    }));
  }
  _handleClick() {
    if (!this.value) {
      this.querySelector('input[type="file"]').click();
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
  // Light DOM: styles live in admin.css (scoped under wy-code-textarea).
  createRenderRoot() {
    return this;
  }
  _handleInput(e6) {
    this.value = e6.target.value;
    this.dispatchEvent(new CustomEvent("value-input", {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
  _handleChange(e6) {
    this.value = e6.target.value;
    this.dispatchEvent(new CustomEvent("value-change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
  updated(changedProperties) {
    if (changedProperties.has("value")) {
      const textarea = this.querySelector("textarea");
      const isFocused = document.activeElement === textarea;
      if (textarea && !isFocused && textarea.value !== this.value) {
        textarea.value = this.value;
      }
    }
  }
  _insertVariable(variableName) {
    const textarea = this.querySelector("textarea");
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
customElements.define("wy-code-textarea", WyCodeTextarea);

// components/ui/wy-variable-editor.js
var WyVariableEditor = class extends i4 {
  constructor() {
    super();
    this.variables = [];
    this.allowReorder = true;
  }
  // Light DOM: styles live in admin.css (scoped under this element tag).
  createRenderRoot() {
    return this;
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
                                    @input="${(e6) => this._updateVariable(index, "name", e6.target.value)}"
                                    placeholder="variable-name"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Label</label>
                                <input
                                    type="text"
                                    .value="${variable.label || ""}"
                                    @input="${(e6) => this._updateVariable(index, "label", e6.target.value)}"
                                    placeholder="Display Label"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Placeholder</label>
                                <input
                                    type="text"
                                    .value="${variable.placeholder || ""}"
                                    @input="${(e6) => this._updateVariable(index, "placeholder", e6.target.value)}"
                                    placeholder="Helper text"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Input Type</label>
                                <select
                                    .value="${variable.inputType || "text"}"
                                    @change="${(e6) => this._updateVariable(index, "inputType", e6.target.value)}"
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
                                            @input="${(e6) => {
      const newOptions = [...variable.options || ["", ""]];
      newOptions[0] = e6.target.value;
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
                                            @input="${(e6) => {
      const newOptions = [...variable.options || ["", ""]];
      newOptions[1] = e6.target.value;
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
customElements.define("wy-variable-editor", WyVariableEditor);

// components/ui/wy-reference-image-editor.js
var WyReferenceImageEditor = class extends i4 {
  constructor() {
    super();
    this.referenceImages = [];
  }
  // Light DOM: styles live in admin.css (scoped under this element tag).
  createRenderRoot() {
    return this;
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
  _handleImageChange(e6, index) {
    e6.stopPropagation();
    const { file } = e6.detail;
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
                                            @input="${(e6) => this._updateItem(index, "variable", e6.target.value)}"
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
                                            @input="${(e6) => this._updateItem(index, "label", e6.target.value)}"
                                            placeholder="Style Reference"
                                        >
                                    </div>
                                    <div class="field full-width">
                                        <span class="placeholder-hint ${ref.variable && this._isValidVariable(ref.variable) ? "has-value" : ""}">
                                            Use ${hint} in your template
                                        </span>
                                    </div>
                                    <div class="field full-width">
                                        <label class="field-label">Copy Instructions</label>
                                        <textarea
                                            .value="${ref.instructions || ""}"
                                            @input="${(e6) => this._updateItem(index, "instructions", e6.target.value)}"
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
                                    @change="${(e6) => this._handleImageChange(e6, index)}"
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
customElements.define("wy-reference-image-editor", WyReferenceImageEditor);

// components/ui/wy-variation-editor.js
var WyVariationEditor = class extends i4 {
  constructor() {
    super();
    this.variations = [];
    this.allowReorder = true;
    this._selectedIndex = 0;
    this._listExpanded = false;
    this._expandedStepsByVariation = {};
    this._dragIndex = null;
  }
  // Light DOM: styles live in admin.css (scoped under wy-variation-editor).
  createRenderRoot() {
    return this;
  }
  _toggleList() {
    this._listExpanded = !this._listExpanded;
  }
  _selectVariation(index) {
    this._selectedIndex = index;
    this._listExpanded = false;
    this._notifyVariationExpand();
  }
  expandVariation(index) {
    if (index < 0 || index >= this.variations.length) return;
    this._selectedIndex = index;
    this._notifyVariationExpand();
    this.requestUpdate();
  }
  getSectionElement(variationIndex, section = "variation") {
    const card = this.querySelector(`.variation-card[data-variation-index="${variationIndex}"]`);
    if (!card || section === "variation") return card;
    return card.querySelector(`[data-vsection="${section}"]`) || card;
  }
  _notifyVariationExpand() {
    this.dispatchEvent(new CustomEvent("variation-expand", {
      detail: { index: this._selectedIndex },
      bubbles: true,
      composed: true
    }));
  }
  // --- Drag reorder (selector list) ---
  _onDragStart(e6, index) {
    this._dragIndex = index;
    e6.dataTransfer.effectAllowed = "move";
  }
  _onDragOver(e6) {
    e6.preventDefault();
    e6.dataTransfer.dropEffect = "move";
  }
  _onDrop(e6, index) {
    e6.preventDefault();
    const from = this._dragIndex;
    this._dragIndex = null;
    if (from === null || from === index) return;
    const selectedVariation = this.variations[this._selectedIndex];
    const updated = [...this.variations];
    const [moved] = updated.splice(from, 1);
    updated.splice(index, 0, moved);
    this._selectedIndex = updated.indexOf(selectedVariation);
    this._notifyChange(updated);
    this._notifyVariationExpand();
  }
  _onDragEnd() {
    this._dragIndex = null;
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
  _handleStepChange(variationIndex, e6) {
    const { index: stepIndex, step } = e6.detail;
    const updatedVariations = [...this.variations];
    const variation = updatedVariations[variationIndex];
    if (variation.steps) {
      variation.steps[stepIndex] = step;
      this._notifyChange(updatedVariations);
    }
  }
  _handleStepDelete(variationIndex, e6) {
    const { index: stepIndex } = e6.detail;
    const updatedVariations = [...this.variations];
    const variation = updatedVariations[variationIndex];
    if (variation.steps && variation.steps.length > 1) {
      variation.steps.splice(stepIndex, 1);
      this._notifyChange(updatedVariations);
    } else {
      this._notifyToast("Cannot delete the last step. Convert to template mode instead.", "warning");
    }
  }
  _handleStepMoveUp(variationIndex, e6) {
    const { index: stepIndex } = e6.detail;
    if (stepIndex === 0) return;
    const updatedVariations = [...this.variations];
    const steps = updatedVariations[variationIndex].steps;
    [steps[stepIndex - 1], steps[stepIndex]] = [steps[stepIndex], steps[stepIndex - 1]];
    this._notifyChange(updatedVariations);
  }
  _handleStepMoveDown(variationIndex, e6) {
    const { index: stepIndex } = e6.detail;
    const updatedVariations = [...this.variations];
    const steps = updatedVariations[variationIndex].steps;
    if (stepIndex === steps.length - 1) return;
    [steps[stepIndex], steps[stepIndex + 1]] = [steps[stepIndex + 1], steps[stepIndex]];
    this._notifyChange(updatedVariations);
  }
  _handleStepToggle(variationIndex, e6) {
    const { index: stepIndex } = e6.detail;
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
  _handleVariableChange(variationIndex, e6) {
    this._handleFieldChange(variationIndex, "variables", e6.detail.variables);
  }
  _handleTemplateChange(variationIndex, e6) {
    this._handleFieldChange(variationIndex, "template", e6.detail.value);
  }
  _handleImageChange(variationIndex, e6) {
    e6.stopPropagation();
    const { file } = e6.detail;
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
  _handleRefImageChange(variationIndex, e6) {
    e6.stopPropagation();
    const { file, index } = e6.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, index, variationIndex, variationId: this.variations[variationIndex]?.id },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageRemove(variationIndex, e6) {
    e6.stopPropagation();
    const { index, path } = e6.detail;
    this.dispatchEvent(new CustomEvent("reference-image-remove", {
      detail: { index, path, variationIndex, variationId: this.variations[variationIndex]?.id },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageListChange(variationIndex, e6) {
    if (!Array.isArray(e6.detail?.referenceImages)) return;
    this._handleFieldChange(variationIndex, "referenceImages", e6.detail.referenceImages);
  }
  _handleMoveUp(index) {
    if (index === 0) return;
    const updatedVariations = [...this.variations];
    [updatedVariations[index - 1], updatedVariations[index]] = [updatedVariations[index], updatedVariations[index - 1]];
    if (this._selectedIndex === index) this._selectedIndex = index - 1;
    else if (this._selectedIndex === index - 1) this._selectedIndex = index;
    this._notifyChange(updatedVariations);
    this._notifyVariationExpand();
  }
  _handleMoveDown(index) {
    if (index === this.variations.length - 1) return;
    const updatedVariations = [...this.variations];
    [updatedVariations[index], updatedVariations[index + 1]] = [updatedVariations[index + 1], updatedVariations[index]];
    if (this._selectedIndex === index) this._selectedIndex = index + 1;
    else if (this._selectedIndex === index + 1) this._selectedIndex = index;
    this._notifyChange(updatedVariations);
    this._notifyVariationExpand();
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
      if (this._selectedIndex >= index && this._selectedIndex > 0) {
        this._selectedIndex--;
      }
      if (this._selectedIndex > updatedVariations.length - 1) {
        this._selectedIndex = updatedVariations.length - 1;
      }
      this._notifyChange(updatedVariations);
      this._notifyVariationExpand();
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
    this._selectedIndex = updatedVariations.length - 1;
    this._listExpanded = false;
    this._notifyChange(updatedVariations);
    this._notifyVariationExpand();
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
    const isFirst = index === 0;
    const isLast = index === this.variations.length - 1;
    const hasSteps = variation.steps && variation.steps.length > 0;
    const hasTemplate = variation.template || !hasSteps;
    const variableNames = (variation.variables || []).map((v3) => v3.name);
    return b2`
            <div class="variation-card expanded" data-variation-index="${index}">
                <!-- Header -->
                <div class="variation-header">
                    <h3 class="variation-title">${variation.name || "Unnamed Variation"}</h3>
                    ${hasSteps ? b2`
                        <span class="variation-badge">Multi-Step</span>
                    ` : ""}
                </div>

                <!-- Fields -->
                <div class="variation-fields">
                    <!-- Variation Name -->
                    <div class="form-field">
                        <label class="field-label" for="variation-name-${index}">Variation Name<span class="req">*</span></label>
                        <input
                            id="variation-name-${index}"
                            type="text"
                            .value="${variation.name || ""}"
                            @input="${(e6) => this._handleFieldChange(index, "name", e6.target.value)}"
                            placeholder="e.g., Tina Barney Style Photo"
                        >
                    </div>

                    <!-- Variation ID -->
                    <div class="form-field">
                        <label class="field-label" for="variation-id-${index}">Variation ID</label>
                        <p class="field-description">Unique identifier (lowercase, no spaces)</p>
                        <input
                            id="variation-id-${index}"
                            type="text"
                            .value="${variation.id || ""}"
                            @input="${(e6) => this._handleFieldChange(index, "id", e6.target.value)}"
                            placeholder="e.g., tina-barney"
                        >
                    </div>

                    <!-- Variation Description -->
                    <div class="form-field" data-vsection="description">
                        <label class="field-label" for="variation-description-${index}">Description</label>
                        <p class="field-description">Optional short differentiator shown in selectors. Do not repeat the parent prompt's shared task or input instructions.</p>
                        <textarea
                            id="variation-description-${index}"
                            rows="3"
                            .value="${variation.description || ""}"
                            @input="${(e6) => this._handleFieldChange(index, "description", e6.target.value)}"
                            placeholder="e.g., 18th Century Hand Colored Plan"
                        ></textarea>
                    </div>

                    <!-- Variation Instructions -->
                    <div class="form-field" data-vsection="instructions">
                        <label class="field-label" for="variation-instructions-${index}">Instructions</label>
                        <p class="field-description">Optional usage notes shown with this variant. Supports lightweight Markdown such as **bold** and lists.</p>
                        <textarea
                            id="variation-instructions-${index}"
                            rows="4"
                            .value="${variation.instructions || ""}"
                            @input="${(e6) => this._handleFieldChange(index, "instructions", e6.target.value)}"
                            placeholder="e.g., Upload with this variant:&#10;1. Your artwork&#10;2. The reference image"
                        ></textarea>
                    </div>

                    <div data-vsection="image">
                        <wy-image-upload
                            label="Variation Image"
                            .value="${variation.image || ""}"
                            @change="${(e6) => this._handleImageChange(index, e6)}"
                            @remove="${() => this._handleImageRemove(index)}"
                        ></wy-image-upload>
                    </div>

                    <!-- Mode Toggle -->
                    <div class="mode-toggle">
                        <label>
                            <input
                                type="radio"
                                name="mode-${index}"
                                value="single"
                                ?checked="${!hasSteps}"
                                @change="${() => this._handleModeChange(index, "single")}"
                            >
                            Template
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="mode-${index}"
                                value="multi"
                                ?checked="${hasSteps}"
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
                                @change="${(e6) => this._handleVariableChange(index, e6)}"
                            ></wy-variable-editor>
                        </div>

                        <!-- Reference Images -->
                        <div class="field-group" data-vsection="reference-images">
                            <label class="field-label">Reference Images</label>
                            <p class="field-description">
                                Upload images and reference them with {{variable_name}}. URLs are substituted when the prompt is copied.
                            </p>
                            <wy-reference-image-editor
                                .referenceImages="${variation.referenceImages || []}"
                                @change="${(e6) => this._handleRefImageListChange(index, e6)}"
                                @reference-image-upload="${(e6) => this._handleRefImageChange(index, e6)}"
                                @reference-image-remove="${(e6) => this._handleRefImageRemove(index, e6)}"
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
                                @value-input="${(e6) => this._handleTemplateChange(index, e6)}"
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
                            <div class="steps-section">
                                ${variation.steps.map((step, stepIndex) => {
      const expandedSteps = this._expandedStepsByVariation[index] || [];
      const isExpanded = expandedSteps.includes(stepIndex);
      return b2`
                                    <wy-step-editor
                                        .step="${step}"
                                        .index="${stepIndex}"
                                        .total="${variation.steps.length}"
                                        .expanded="${isExpanded}"
                                        @step-change="${(e6) => this._handleStepChange(index, e6)}"
                                        @step-delete="${(e6) => this._handleStepDelete(index, e6)}"
                                        @step-move-up="${(e6) => this._handleStepMoveUp(index, e6)}"
                                        @step-move-down="${(e6) => this._handleStepMoveDown(index, e6)}"
                                        @step-toggle="${(e6) => this._handleStepToggle(index, e6)}"
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
                <div class="variation-controls">
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
        `;
  }
  render() {
    const count = this.variations?.length || 0;
    const selectedIndex = Math.min(Math.max(this._selectedIndex, 0), Math.max(0, count - 1));
    const selected = count > 0 ? this.variations[selectedIndex] : null;
    const selectedHasSteps = selected?.steps && selected.steps.length > 0;
    return b2`
            <div class="variation-selector ${this._listExpanded ? "expanded" : ""}">
                <button
                    type="button"
                    class="variation-selector-toggle"
                    @click="${this._toggleList}"
                    aria-expanded="${this._listExpanded ? "true" : "false"}"
                >
                    <span class="variation-selector-eyebrow">Editing variant</span>
                    <span class="variation-selector-current">
                        ${selected?.name || "Unnamed Variation"}
                        ${selectedHasSteps ? b2`<span class="variation-badge">Multi-Step</span>` : ""}
                    </span>
                    <span class="variation-selector-meta">${selectedIndex + 1} / ${count}</span>
                    <span class="material-symbols-outlined variation-selector-chevron">expand_more</span>
                </button>

                ${this._listExpanded ? b2`
                    <div class="variation-selector-list" role="listbox">
                        ${this.variations.map((variation, index) => b2`
                            <div
                                class="variation-row ${index === selectedIndex ? "selected" : ""}"
                                role="option"
                                aria-selected="${index === selectedIndex ? "true" : "false"}"
                                draggable="${this.allowReorder ? "true" : "false"}"
                                @dragstart="${(e6) => this._onDragStart(e6, index)}"
                                @dragover="${this._onDragOver}"
                                @drop="${(e6) => this._onDrop(e6, index)}"
                                @dragend="${this._onDragEnd}"
                                @click="${() => this._selectVariation(index)}"
                            >
                                ${this.allowReorder ? b2`
                                    <span class="material-symbols-outlined variation-row-handle" title="Drag to reorder">drag_indicator</span>
                                ` : ""}
                                <span class="variation-row-title">${variation.name || "Unnamed Variation"}</span>
                                ${variation.steps && variation.steps.length > 0 ? b2`
                                    <span class="variation-badge">Multi-Step</span>
                                ` : ""}
                                ${index === selectedIndex ? b2`
                                    <span class="material-symbols-outlined variation-row-check">check</span>
                                ` : ""}
                            </div>
                        `)}
                        <button class="add-variation-button" @click="${this._handleAddVariation}">
                            <span class="material-symbols-outlined">add</span>
                            Add Variation
                        </button>
                    </div>
                ` : ""}
            </div>

            ${selected ? this._renderVariation(selected, selectedIndex) : ""}
        `;
  }
};
__publicField(WyVariationEditor, "properties", {
  variations: { type: Array },
  allowReorder: { type: Boolean, attribute: "allow-reorder" },
  _selectedIndex: { type: Number, state: true },
  _listExpanded: { type: Boolean, state: true },
  _expandedStepsByVariation: { type: Object, state: true }
});
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
  // Light DOM: styles live in admin.css (scoped under wy-prompt-editor).
  createRenderRoot() {
    return this;
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
    const textarea = codeTextarea?.querySelector("textarea");
    return textarea ? textarea.value : null;
  }
  _syncStandardTemplateForSave() {
    const codeTextarea = this.querySelector("wy-code-textarea");
    const value = this._getTextareaValue(codeTextarea);
    if (value !== null) {
      this._editedPrompt.template = value;
    }
  }
  _syncStepTemplatesForSave(stepEditors, steps) {
    if (!stepEditors || !steps) return;
    stepEditors.forEach((stepEditor, index) => {
      const codeTextarea = stepEditor.querySelector("wy-code-textarea");
      const value = this._getTextareaValue(codeTextarea);
      if (value !== null && steps[index]) {
        steps[index].template = value;
      }
    });
  }
  _syncVariationTemplatesForSave() {
    const variationEditor = this.querySelector("wy-variation-editor");
    const variations = this._editedPrompt?.variations;
    if (!variationEditor || !variations) return;
    const variationCards = variationEditor.querySelectorAll(".variation-card") || [];
    variationCards.forEach((card) => {
      const index = Number(card.dataset.variationIndex);
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
        this.querySelectorAll("wy-step-editor"),
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
  _handleImageChange(e6) {
    const { file } = e6.detail;
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
  _handleRefImageUpload(e6) {
    const { file, index } = e6.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, index },
      bubbles: true,
      composed: true
    }));
  }
  _handleRefImageRemove(e6) {
    const { index, path } = e6.detail;
    this.dispatchEvent(new CustomEvent("reference-image-remove", {
      detail: { promptId: this._editedPrompt?.id, index, path },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationRefImageUpload(e6) {
    e6.stopPropagation();
    const { file, index, variationIndex, variationId } = e6.detail;
    this.dispatchEvent(new CustomEvent("reference-image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, index, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationRefImageRemove(e6) {
    e6.stopPropagation();
    const { index, path, variationIndex, variationId } = e6.detail;
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
  _handleHeroProviderChange(e6) {
    this._heroProvider = e6.target.value;
    this._heroError = "";
  }
  _handleHeroQualityChange(e6) {
    this._heroQuality = e6.target.value;
    this._heroError = "";
  }
  _handleHeroPromptInput(e6) {
    this._heroPrompt = e6.target.value;
    this._heroPromptDirty = true;
    this._heroError = "";
  }
  _handleHeroGeneratorToggle(e6) {
    this._heroGeneratorOpen = e6.currentTarget.open;
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
  _handleVariationImageChange(e6) {
    e6.stopPropagation();
    const { file, target, variationIndex, variationId } = e6.detail;
    this.dispatchEvent(new CustomEvent("image-upload", {
      detail: { file, promptId: this._editedPrompt?.id, target, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationImageRemove(e6) {
    e6.stopPropagation();
    const { target, variationIndex, variationId } = e6.detail;
    this.dispatchEvent(new CustomEvent("image-remove", {
      detail: { promptId: this._editedPrompt?.id, target, variationIndex, variationId },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationsChange(e6) {
    if (!Array.isArray(e6.detail?.variations)) return;
    this._handleFieldChange("variations", e6.detail.variations);
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
  _handleStepChange(e6) {
    const { index, step } = e6.detail;
    this._editedPrompt.steps[index] = step;
    this._markDirty();
    this.requestUpdate();
  }
  _handleStepDelete(e6) {
    const { index } = e6.detail;
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
  _handleStepMoveUp(e6) {
    const { index } = e6.detail;
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
  _handleStepMoveDown(e6) {
    const { index } = e6.detail;
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
  _handleStepToggle(e6) {
    const { index } = e6.detail;
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
      const activeIndex = this._openVariationIndex >= 0 ? this._openVariationIndex : 0;
      const variation = this._editedPrompt.variations[activeIndex];
      if (variation) {
        const index = activeIndex;
        const id = `variation-${index}`;
        items.push({
          id,
          label: variation.name || `Variation ${index + 1}`,
          type: "variant",
          variationIndex: index
        });
        const hasSteps = variation.steps && variation.steps.length > 0;
        items.push({ id: `${id}-description`, label: "Description", type: "subitem", variationIndex: index, vsection: "description" });
        items.push({ id: `${id}-instructions`, label: "Instructions", type: "subitem", variationIndex: index, vsection: "instructions" });
        items.push({ id: `${id}-image`, label: "Image", type: "subitem", variationIndex: index, vsection: "image" });
        items.push({ id: `${id}-${hasSteps ? "steps" : "variables"}`, label: hasSteps ? "Steps" : "Variables", type: "subitem", variationIndex: index, vsection: hasSteps ? "steps" : "variables" });
        if (!hasSteps) {
          items.push({ id: `${id}-template`, label: "Template", type: "subitem", variationIndex: index, vsection: "template" });
        }
      }
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
      const variationEditor = this.querySelector("wy-variation-editor");
      variationEditor?.expandVariation(item.variationIndex);
      this._openVariationIndex = item.variationIndex;
      await this.updateComplete;
      await variationEditor?.updateComplete;
      const target = variationEditor?.getSectionElement(item.variationIndex, item.vsection || "variation");
      this._scrollTargetIntoView(target);
      return;
    }
    this._scrollTargetIntoView(this.querySelector(`[data-section="${item.id}"]`));
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
  _handleVariationExpand(e6) {
    this._openVariationIndex = e6.detail?.index ?? -1;
  }
  _handleWindowScroll() {
    if (!this._editedPrompt) return;
    const sections = [...this.querySelectorAll("[data-section]")].map((element) => ({ id: element.dataset.section, element }));
    const variationEditor = this.querySelector("wy-variation-editor");
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
                            <a href="#" @click="${(e6) => {
      e6.preventDefault();
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
                        <div class="form-field">
                            <label class="field-label" for="title">Prompt Title<span class="req">*</span></label>
                            <input
                                type="text"
                                id="title"
                                .value="${this._editedPrompt.title || ""}"
                                @input="${(e6) => this._handleFieldChange("title", e6.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="slug">Slug</label>
                            <p class="field-description">URL-friendly identifier (auto-generated from title)</p>
                            <input
                                type="text"
                                id="slug"
                                .value="${this._editedPrompt.slug || ""}"
                                @input="${(e6) => this._handleFieldChange("slug", e6.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="id">Prompt ID</label>
                            <p class="field-description">Unique identifier (read-only)</p>
                            <input
                                type="text"
                                id="id"
                                .value="${this._editedPrompt.id || ""}"
                                disabled
                                readonly
                            >
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="description">Description</label>
                            <textarea
                                id="description"
                                rows="3"
                                .value="${this._editedPrompt.description || ""}"
                                @input="${(e6) => this._handleFieldChange("description", e6.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="instructions">Instructions</label>
                            <p class="field-description">Usage notes shown in the prompt modal and only on expanded prompt cards</p>
                            <textarea
                                id="instructions"
                                rows="4"
                                .value="${this._editedPrompt.instructions || ""}"
                                @input="${(e6) => this._handleFieldChange("instructions", e6.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </div>
                    </div>

                    <!-- Section 2: Visuals & Metadata -->
                    <div class="card" data-section="visuals">
                        <h2 class="card-title" data-eyebrow="Section 02">Visuals & Metadata</h2>
                        <div class="form-field">
                            <label class="field-label" for="icon">Icon</label>
                            <p class="field-description">Material Symbol icon name (e.g., 'restaurant', 'code', 'music_note')</p>
                            <input
                                type="text"
                                id="icon"
                                .value="${this._editedPrompt.icon || ""}"
                                @input="${(e6) => this._handleFieldChange("icon", e6.target.value)}"
                                placeholder="icon_name"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                        <wy-dropdown
                            label="Category"
                            .value="${this._editedPrompt.category || ""}"
                            .options="${categoryOptions}"
                            @change="${(e6) => this._handleFieldChange("category", e6.detail.value)}"
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
                                        @change="${(e6) => this._handleVariationSelectorChange(e6.detail.value === "visual")}"
                                    ></wy-option-toggle>
                                    ${this._editedPrompt.variationSelector === "visual" ? b2`
                                        <wy-option-toggle
                                            size="compact"
                                            label="Tile Content"
                                            description="Choose whether visual selector thumbnails include variant text."
                                            .options="${["thumbnail", "details"]}"
                                            .labels="${["Thumbnail only", "Title + description"]}"
                                            .value="${this._editedPrompt.variationSelectorTileMode === "details" ? "details" : "thumbnail"}"
                                            @change="${(e6) => this._handleVariationTileModeChange(e6.detail.value)}"
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
                                        @click="${(e6) => this._handleModeChange(e6, "single")}"
                                    >
                                    Single Step
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="multi" 
                                        ?checked="${this._promptMode === "multi"}"
                                        @click="${(e6) => this._handleModeChange(e6, "multi")}"
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
                                    @change="${(e6) => this._handleFieldChange("variables", e6.detail.variables)}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Reference Images -->
                            <div class="card" data-section="reference-images">
                                <h2 class="card-title" data-eyebrow="Section 05">Reference Images</h2>
                                <p class="card-description">Upload images and reference them in your template with {{variable_name}}. Their public URLs are substituted when the prompt is copied.</p>
                                <wy-reference-image-editor
                                    .referenceImages="${this._editedPrompt.referenceImages || []}"
                                    @change="${(e6) => this._handleFieldChange("referenceImages", e6.detail.referenceImages)}"
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
                                    @value-input="${(e6) => this._handleFieldChange("template", e6.detail.value)}"
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
                                    @change="${(e6) => this._handleFieldChange("featured", e6.detail.checked)}"
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
                                    @change="${(e6) => this._handleFieldChange("archived", e6.detail.checked)}"
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
                                    @change="${(e6) => this._handleFieldChange("showPalette", e6.detail.checked)}"
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
  // Light DOM: styles live in admin.css (scoped under wy-step-editor).
  createRenderRoot() {
    return this;
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
  _handleVariableChange(e6) {
    this._handleFieldChange("variables", e6.detail.variables);
  }
  _handleTemplateChange(e6) {
    this._handleFieldChange("template", e6.detail.value);
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
                                    @input="${(e6) => this._handleFieldChange("name", e6.target.value)}"
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
                                    @input="${(e6) => this._handleFieldChange("id", e6.target.value)}"
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
                                    @input="${(e6) => this._handleFieldChange("instructions", e6.target.value)}"
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
customElements.define("wy-step-editor", WyStepEditor);

// node_modules/lit-html/directive-helpers.js
var { I: t4 } = j;
var r4 = (o6) => void 0 === o6.strings;
var m2 = {};
var p3 = (o6, t5 = m2) => o6._$AH = t5;

// node_modules/lit-html/directives/live.js
var l3 = e4(class extends i5 {
  constructor(r5) {
    if (super(r5), r5.type !== t3.PROPERTY && r5.type !== t3.ATTRIBUTE && r5.type !== t3.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!r4(r5)) throw Error("`live` bindings can only contain a single expression");
  }
  render(r5) {
    return r5;
  }
  update(i6, [t5]) {
    if (t5 === E || t5 === A) return t5;
    const o6 = i6.element, l6 = i6.name;
    if (i6.type === t3.PROPERTY) {
      if (t5 === o6[l6]) return E;
    } else if (i6.type === t3.BOOLEAN_ATTRIBUTE) {
      if (!!t5 === o6.hasAttribute(l6)) return E;
    } else if (i6.type === t3.ATTRIBUTE && o6.getAttribute(l6) === t5 + "") return E;
    return p3(i6), t5;
  }
});

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
  let e6 = [];
  return (t5) => {
    let n4 = Math.max(0, Math.min(3, t5 - 1)), s4 = e6[n4];
    return s4 || (s4 = l6(n4), e6[n4] = s4), s4;
  };
}
function d3(l6, e6 = "") {
  let t5 = typeof l6 == "string" ? l6 : l6.source, n4 = { replace: (s4, r5) => {
    let i6 = typeof r5 == "string" ? r5 : r5.source;
    return i6 = i6.replace(m3.caret, "$1"), t5 = t5.replace(s4, i6), n4;
  }, getRegex: () => new RegExp(t5, e6) };
  return n4;
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
function O(l6, e6) {
  if (e6) {
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
function Y(l6, e6) {
  let t5 = l6.replace(m3.findPipe, (r5, i6, o6) => {
    let u3 = false, a3 = i6;
    for (; --a3 >= 0 && o6[a3] === "\\"; ) u3 = !u3;
    return u3 ? "|" : " |";
  }), n4 = t5.split(m3.splitPipe), s4 = 0;
  if (n4[0].trim() || n4.shift(), n4.length > 0 && !n4.at(-1)?.trim() && n4.pop(), e6) if (n4.length > e6) n4.splice(e6);
  else for (; n4.length < e6; ) n4.push("");
  for (; s4 < n4.length; s4++) n4[s4] = n4[s4].trim().replace(m3.slashPipe, "|");
  return n4;
}
function $2(l6, e6, t5) {
  let n4 = l6.length;
  if (n4 === 0) return "";
  let s4 = 0;
  for (; s4 < n4; ) {
    let r5 = l6.charAt(n4 - s4 - 1);
    if (r5 === e6 && !t5) s4++;
    else if (r5 !== e6 && t5) s4++;
    else break;
  }
  return l6.slice(0, n4 - s4);
}
function ee(l6) {
  let e6 = l6.split(`
`), t5 = e6.length - 1;
  for (; t5 >= 0 && m3.blankLine.test(e6[t5]); ) t5--;
  return e6.length - t5 <= 2 ? l6 : e6.slice(0, t5 + 1).join(`
`);
}
function fe(l6, e6) {
  if (l6.indexOf(e6[1]) === -1) return -1;
  let t5 = 0;
  for (let n4 = 0; n4 < l6.length; n4++) if (l6[n4] === "\\") n4++;
  else if (l6[n4] === e6[0]) t5++;
  else if (l6[n4] === e6[1] && (t5--, t5 < 0)) return n4;
  return t5 > 0 ? -2 : -1;
}
function me(l6, e6 = 0) {
  let t5 = e6, n4 = "";
  for (let s4 of l6) if (s4 === "	") {
    let r5 = 4 - t5 % 4;
    n4 += " ".repeat(r5), t5 += r5;
  } else n4 += s4, t5++;
  return n4;
}
function xe(l6, e6, t5, n4, s4) {
  let r5 = e6.href, i6 = e6.title || null, o6 = l6[1].replace(s4.other.outputLinkReplace, "$1");
  n4.state.inLink = true;
  let u3 = { type: l6[0].charAt(0) === "!" ? "image" : "link", raw: t5, href: r5, title: i6, text: o6, tokens: n4.inlineTokens(o6) };
  return n4.state.inLink = false, u3;
}
function st(l6, e6, t5) {
  let n4 = l6.match(t5.other.indentCodeCompensation);
  if (n4 === null) return e6;
  let s4 = n4[1];
  return e6.split(`
`).map((r5) => {
    let i6 = r5.match(t5.other.beginningSpace);
    if (i6 === null) return r5;
    let [o6] = i6;
    return o6.length >= s4.length ? r5.slice(s4.length) : r5;
  }).join(`
`);
}
var w2 = class {
  constructor(e6) {
    __publicField(this, "options");
    __publicField(this, "rules");
    __publicField(this, "lexer");
    this.options = e6 || T2;
  }
  space(e6) {
    let t5 = this.rules.block.newline.exec(e6);
    if (t5 && t5[0].length > 0) return { type: "space", raw: t5[0] };
  }
  code(e6) {
    let t5 = this.rules.block.code.exec(e6);
    if (t5) {
      let n4 = this.options.pedantic ? t5[0] : ee(t5[0]), s4 = n4.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n4, codeBlockStyle: "indented", text: s4 };
    }
  }
  fences(e6) {
    let t5 = this.rules.block.fences.exec(e6);
    if (t5) {
      let n4 = t5[0], s4 = st(n4, t5[3] || "", this.rules);
      return { type: "code", raw: n4, lang: t5[2] ? t5[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t5[2], text: s4 };
    }
  }
  heading(e6) {
    let t5 = this.rules.block.heading.exec(e6);
    if (t5) {
      let n4 = t5[2].trim();
      if (this.rules.other.endingHash.test(n4)) {
        let s4 = $2(n4, "#");
        (this.options.pedantic || !s4 || this.rules.other.endingSpaceChar.test(s4)) && (n4 = s4.trim());
      }
      return { type: "heading", raw: $2(t5[0], `
`), depth: t5[1].length, text: n4, tokens: this.lexer.inline(n4) };
    }
  }
  hr(e6) {
    let t5 = this.rules.block.hr.exec(e6);
    if (t5) return { type: "hr", raw: $2(t5[0], `
`) };
  }
  blockquote(e6) {
    let t5 = this.rules.block.blockquote.exec(e6);
    if (t5) {
      let n4 = $2(t5[0], `
`).split(`
`), s4 = "", r5 = "", i6 = [];
      for (; n4.length > 0; ) {
        let o6 = false, u3 = [], a3;
        for (a3 = 0; a3 < n4.length; a3++) if (this.rules.other.blockquoteStart.test(n4[a3])) u3.push(n4[a3]), o6 = true;
        else if (!o6) u3.push(n4[a3]);
        else break;
        n4 = n4.slice(a3);
        let c4 = u3.join(`
`), p4 = c4.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s4 = s4 ? `${s4}
${c4}` : c4, r5 = r5 ? `${r5}
${p4}` : p4;
        let k2 = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(p4, i6, true), this.lexer.state.top = k2, n4.length === 0) break;
        let h3 = i6.at(-1);
        if (h3?.type === "code") break;
        if (h3?.type === "blockquote") {
          let R2 = h3, f3 = R2.raw + `
` + n4.join(`
`), S3 = this.blockquote(f3);
          i6[i6.length - 1] = S3, s4 = s4.substring(0, s4.length - R2.raw.length) + S3.raw, r5 = r5.substring(0, r5.length - R2.text.length) + S3.text;
          break;
        } else if (h3?.type === "list") {
          let R2 = h3, f3 = R2.raw + `
` + n4.join(`
`), S3 = this.list(f3);
          i6[i6.length - 1] = S3, s4 = s4.substring(0, s4.length - h3.raw.length) + S3.raw, r5 = r5.substring(0, r5.length - R2.raw.length) + S3.raw, n4 = f3.substring(i6.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s4, tokens: i6, text: r5 };
    }
  }
  list(e6) {
    let t5 = this.rules.block.list.exec(e6);
    if (t5) {
      let n4 = t5[1].trim(), s4 = n4.length > 1, r5 = { type: "list", raw: "", ordered: s4, start: s4 ? +n4.slice(0, -1) : "", loose: false, items: [] };
      n4 = s4 ? `\\d{1,9}\\${n4.slice(-1)}` : `\\${n4}`, this.options.pedantic && (n4 = s4 ? n4 : "[*+-]");
      let i6 = this.rules.other.listItemRegex(n4), o6 = false;
      for (; e6; ) {
        let a3 = false, c4 = "", p4 = "";
        if (!(t5 = i6.exec(e6)) || this.rules.block.hr.test(e6)) break;
        c4 = t5[0], e6 = e6.substring(c4.length);
        let k2 = me(t5[2].split(`
`, 1)[0], t5[1].length), h3 = e6.split(`
`, 1)[0], R2 = !k2.trim(), f3 = 0;
        if (this.options.pedantic ? (f3 = 2, p4 = k2.trimStart()) : R2 ? f3 = t5[1].length + 1 : (f3 = k2.search(this.rules.other.nonSpaceChar), f3 = f3 > 4 ? 1 : f3, p4 = k2.slice(f3), f3 += t5[1].length), R2 && this.rules.other.blankLine.test(h3) && (c4 += h3 + `
`, e6 = e6.substring(h3.length + 1), a3 = true), !a3) {
          let S3 = this.rules.other.nextBulletRegex(f3), te = this.rules.other.hrRegex(f3), ne = this.rules.other.fencesBeginRegex(f3), re = this.rules.other.headingBeginRegex(f3), be = this.rules.other.htmlBeginRegex(f3), Re = this.rules.other.blockquoteBeginRegex(f3);
          for (; e6; ) {
            let G = e6.split(`
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
`, e6 = e6.substring(G.length + 1), k2 = C2.slice(f3);
          }
        }
        r5.loose || (o6 ? r5.loose = true : this.rules.other.doubleBlankLine.test(c4) && (o6 = true)), r5.items.push({ type: "list_item", raw: c4, task: !!this.options.gfm && this.rules.other.listIsTask.test(p4), loose: false, text: p4, tokens: [] }), r5.raw += c4;
      }
      let u3 = r5.items.at(-1);
      if (u3) u3.raw = u3.raw.trimEnd(), u3.text = u3.text.trimEnd();
      else return;
      r5.raw = r5.raw.trimEnd();
      for (let a3 of r5.items) {
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
            a3.checked = k2.checked, r5.loose ? a3.tokens[0] && ["paragraph", "text"].includes(a3.tokens[0].type) && "tokens" in a3.tokens[0] && a3.tokens[0].tokens ? (a3.tokens[0].raw = k2.raw + a3.tokens[0].raw, a3.tokens[0].text = k2.raw + a3.tokens[0].text, a3.tokens[0].tokens.unshift(k2)) : a3.tokens.unshift({ type: "paragraph", raw: k2.raw, text: k2.raw, tokens: [k2] }) : a3.tokens.unshift(k2);
          }
        } else a3.task && (a3.task = false);
        if (!r5.loose) {
          let p4 = a3.tokens.filter((h3) => h3.type === "space"), k2 = p4.length > 0 && p4.some((h3) => this.rules.other.anyLine.test(h3.raw));
          r5.loose = k2;
        }
      }
      if (r5.loose) for (let a3 of r5.items) {
        a3.loose = true;
        for (let c4 of a3.tokens) c4.type === "text" && (c4.type = "paragraph");
      }
      return r5;
    }
  }
  html(e6) {
    let t5 = this.rules.block.html.exec(e6);
    if (t5) {
      let n4 = ee(t5[0]);
      return { type: "html", block: true, raw: n4, pre: t5[1] === "pre" || t5[1] === "script" || t5[1] === "style", text: n4 };
    }
  }
  def(e6) {
    let t5 = this.rules.block.def.exec(e6);
    if (t5) {
      let n4 = t5[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s4 = t5[2] ? t5[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r5 = t5[3] ? t5[3].substring(1, t5[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t5[3];
      return { type: "def", tag: n4, raw: $2(t5[0], `
`), href: s4, title: r5 };
    }
  }
  table(e6) {
    let t5 = this.rules.block.table.exec(e6);
    if (!t5 || !this.rules.other.tableDelimiter.test(t5[2])) return;
    let n4 = Y(t5[1]), s4 = t5[2].replace(this.rules.other.tableAlignChars, "").split("|"), r5 = t5[3]?.trim() ? t5[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i6 = { type: "table", raw: $2(t5[0], `
`), header: [], align: [], rows: [] };
    if (n4.length === s4.length) {
      for (let o6 of s4) this.rules.other.tableAlignRight.test(o6) ? i6.align.push("right") : this.rules.other.tableAlignCenter.test(o6) ? i6.align.push("center") : this.rules.other.tableAlignLeft.test(o6) ? i6.align.push("left") : i6.align.push(null);
      for (let o6 = 0; o6 < n4.length; o6++) i6.header.push({ text: n4[o6], tokens: this.lexer.inline(n4[o6]), header: true, align: i6.align[o6] });
      for (let o6 of r5) i6.rows.push(Y(o6, i6.header.length).map((u3, a3) => ({ text: u3, tokens: this.lexer.inline(u3), header: false, align: i6.align[a3] })));
      return i6;
    }
  }
  lheading(e6) {
    let t5 = this.rules.block.lheading.exec(e6);
    if (t5) {
      let n4 = t5[1].trim();
      return { type: "heading", raw: $2(t5[0], `
`), depth: t5[2].charAt(0) === "=" ? 1 : 2, text: n4, tokens: this.lexer.inline(n4) };
    }
  }
  paragraph(e6) {
    let t5 = this.rules.block.paragraph.exec(e6);
    if (t5) {
      let n4 = t5[1].charAt(t5[1].length - 1) === `
` ? t5[1].slice(0, -1) : t5[1];
      return { type: "paragraph", raw: t5[0], text: n4, tokens: this.lexer.inline(n4) };
    }
  }
  text(e6) {
    let t5 = this.rules.block.text.exec(e6);
    if (t5) return { type: "text", raw: t5[0], text: t5[0], tokens: this.lexer.inline(t5[0]) };
  }
  escape(e6) {
    let t5 = this.rules.inline.escape.exec(e6);
    if (t5) return { type: "escape", raw: t5[0], text: t5[1] };
  }
  tag(e6) {
    let t5 = this.rules.inline.tag.exec(e6);
    if (t5) return !this.lexer.state.inLink && this.rules.other.startATag.test(t5[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t5[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t5[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t5[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t5[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t5[0] };
  }
  link(e6) {
    let t5 = this.rules.inline.link.exec(e6);
    if (t5) {
      let n4 = t5[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n4)) {
        if (!this.rules.other.endAngleBracket.test(n4)) return;
        let i6 = $2(n4.slice(0, -1), "\\");
        if ((n4.length - i6.length) % 2 === 0) return;
      } else {
        let i6 = fe(t5[2], "()");
        if (i6 === -2) return;
        if (i6 > -1) {
          let u3 = (t5[0].indexOf("!") === 0 ? 5 : 4) + t5[1].length + i6;
          t5[2] = t5[2].substring(0, i6), t5[0] = t5[0].substring(0, u3).trim(), t5[3] = "";
        }
      }
      let s4 = t5[2], r5 = "";
      if (this.options.pedantic) {
        let i6 = this.rules.other.pedanticHrefTitle.exec(s4);
        i6 && (s4 = i6[1], r5 = i6[3]);
      } else r5 = t5[3] ? t5[3].slice(1, -1) : "";
      return s4 = s4.trim(), this.rules.other.startAngleBracket.test(s4) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n4) ? s4 = s4.slice(1) : s4 = s4.slice(1, -1)), xe(t5, { href: s4 && s4.replace(this.rules.inline.anyPunctuation, "$1"), title: r5 && r5.replace(this.rules.inline.anyPunctuation, "$1") }, t5[0], this.lexer, this.rules);
    }
  }
  reflink(e6, t5) {
    let n4;
    if ((n4 = this.rules.inline.reflink.exec(e6)) || (n4 = this.rules.inline.nolink.exec(e6))) {
      let s4 = (n4[2] || n4[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r5 = t5[s4.toLowerCase()];
      if (!r5) {
        let i6 = n4[0].charAt(0);
        return { type: "text", raw: i6, text: i6 };
      }
      return xe(n4, r5, n4[0], this.lexer, this.rules);
    }
  }
  emStrong(e6, t5, n4 = "") {
    let s4 = this.rules.inline.emStrongLDelim.exec(e6);
    if (!s4 || !s4[1] && !s4[2] && !s4[3] && !s4[4] || s4[4] && n4.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s4[1] || s4[3] || "") || !n4 || this.rules.inline.punctuation.exec(n4)) {
      let i6 = [...s4[0]].length - 1, o6, u3, a3 = i6, c4 = 0, p4 = s4[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (p4.lastIndex = 0, t5 = t5.slice(-1 * e6.length + i6); (s4 = p4.exec(t5)) !== null; ) {
        if (o6 = s4[1] || s4[2] || s4[3] || s4[4] || s4[5] || s4[6], !o6) continue;
        if (u3 = [...o6].length, s4[3] || s4[4]) {
          a3 += u3;
          continue;
        } else if ((s4[5] || s4[6]) && i6 % 3 && !((i6 + u3) % 3)) {
          c4 += u3;
          continue;
        }
        if (a3 -= u3, a3 > 0) continue;
        u3 = Math.min(u3, u3 + a3 + c4);
        let k2 = [...s4[0]][0].length, h3 = e6.slice(0, i6 + s4.index + k2 + u3);
        if (Math.min(i6, u3) % 2) {
          let f3 = h3.slice(1, -1);
          return { type: "em", raw: h3, text: f3, tokens: this.lexer.inlineTokens(f3) };
        }
        let R2 = h3.slice(2, -2);
        return { type: "strong", raw: h3, text: R2, tokens: this.lexer.inlineTokens(R2) };
      }
    }
  }
  codespan(e6) {
    let t5 = this.rules.inline.code.exec(e6);
    if (t5) {
      let n4 = t5[2].replace(this.rules.other.newLineCharGlobal, " "), s4 = this.rules.other.nonSpaceChar.test(n4), r5 = this.rules.other.startingSpaceChar.test(n4) && this.rules.other.endingSpaceChar.test(n4);
      return s4 && r5 && (n4 = n4.substring(1, n4.length - 1)), { type: "codespan", raw: t5[0], text: n4 };
    }
  }
  br(e6) {
    let t5 = this.rules.inline.br.exec(e6);
    if (t5) return { type: "br", raw: t5[0] };
  }
  del(e6, t5, n4 = "") {
    let s4 = this.rules.inline.delLDelim.exec(e6);
    if (!s4) return;
    if (!(s4[1] || "") || !n4 || this.rules.inline.punctuation.exec(n4)) {
      let i6 = [...s4[0]].length - 1, o6, u3, a3 = i6, c4 = this.rules.inline.delRDelim;
      for (c4.lastIndex = 0, t5 = t5.slice(-1 * e6.length + i6); (s4 = c4.exec(t5)) !== null; ) {
        if (o6 = s4[1] || s4[2] || s4[3] || s4[4] || s4[5] || s4[6], !o6 || (u3 = [...o6].length, u3 !== i6)) continue;
        if (s4[3] || s4[4]) {
          a3 += u3;
          continue;
        }
        if (a3 -= u3, a3 > 0) continue;
        u3 = Math.min(u3, u3 + a3);
        let p4 = [...s4[0]][0].length, k2 = e6.slice(0, i6 + s4.index + p4 + u3), h3 = k2.slice(i6, -i6);
        return { type: "del", raw: k2, text: h3, tokens: this.lexer.inlineTokens(h3) };
      }
    }
  }
  autolink(e6) {
    let t5 = this.rules.inline.autolink.exec(e6);
    if (t5) {
      let n4, s4;
      return t5[2] === "@" ? (n4 = t5[1], s4 = "mailto:" + n4) : (n4 = t5[1], s4 = n4), { type: "link", raw: t5[0], text: n4, href: s4, tokens: [{ type: "text", raw: n4, text: n4 }] };
    }
  }
  url(e6) {
    let t5;
    if (t5 = this.rules.inline.url.exec(e6)) {
      let n4, s4;
      if (t5[2] === "@") n4 = t5[0], s4 = "mailto:" + n4;
      else {
        let r5;
        do
          r5 = t5[0], t5[0] = this.rules.inline._backpedal.exec(t5[0])?.[0] ?? "";
        while (r5 !== t5[0]);
        n4 = t5[0], t5[1] === "www." ? s4 = "http://" + t5[0] : s4 = t5[0];
      }
      return { type: "link", raw: t5[0], text: n4, href: s4, tokens: [{ type: "text", raw: n4, text: n4 }] };
    }
  }
  inlineText(e6) {
    let t5 = this.rules.inline.text.exec(e6);
    if (t5) {
      let n4 = this.lexer.state.inRawBlock;
      return { type: "text", raw: t5[0], text: t5[0], escaped: n4 };
    }
  }
};
var x2 = class l4 {
  constructor(e6) {
    __publicField(this, "tokens");
    __publicField(this, "options");
    __publicField(this, "state");
    __publicField(this, "inlineQueue");
    __publicField(this, "tokenizer");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e6 || T2, this.options.tokenizer = this.options.tokenizer || new w2(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t5 = { other: m3, block: D2.normal, inline: A2.normal };
    this.options.pedantic ? (t5.block = D2.pedantic, t5.inline = A2.pedantic) : this.options.gfm && (t5.block = D2.gfm, this.options.breaks ? t5.inline = A2.breaks : t5.inline = A2.gfm), this.tokenizer.rules = t5;
  }
  static get rules() {
    return { block: D2, inline: A2 };
  }
  static lex(e6, t5) {
    return new l4(t5).lex(e6);
  }
  static lexInline(e6, t5) {
    return new l4(t5).inlineTokens(e6);
  }
  lex(e6) {
    e6 = e6.replace(m3.carriageReturn, `
`), this.blockTokens(e6, this.tokens);
    for (let t5 = 0; t5 < this.inlineQueue.length; t5++) {
      let n4 = this.inlineQueue[t5];
      this.inlineTokens(n4.src, n4.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e6, t5 = [], n4 = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e6 = e6.replace(m3.tabCharGlobal, "    ").replace(m3.spaceLine, ""));
    let s4 = 1 / 0;
    for (; e6; ) {
      if (e6.length < s4) s4 = e6.length;
      else {
        this.infiniteLoopError(e6.charCodeAt(0));
        break;
      }
      let r5;
      if (this.options.extensions?.block?.some((o6) => (r5 = o6.call({ lexer: this }, e6, t5)) ? (e6 = e6.substring(r5.raw.length), t5.push(r5), true) : false)) continue;
      if (r5 = this.tokenizer.space(e6)) {
        e6 = e6.substring(r5.raw.length);
        let o6 = t5.at(-1);
        r5.raw.length === 1 && o6 !== void 0 ? o6.raw += `
` : t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.code(e6)) {
        e6 = e6.substring(r5.raw.length);
        let o6 = t5.at(-1);
        o6?.type === "paragraph" || o6?.type === "text" ? (o6.raw += (o6.raw.endsWith(`
`) ? "" : `
`) + r5.raw, o6.text += `
` + r5.text, this.inlineQueue.at(-1).src = o6.text) : t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.fences(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.heading(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.hr(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.blockquote(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.list(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.html(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.def(e6)) {
        e6 = e6.substring(r5.raw.length);
        let o6 = t5.at(-1);
        o6?.type === "paragraph" || o6?.type === "text" ? (o6.raw += (o6.raw.endsWith(`
`) ? "" : `
`) + r5.raw, o6.text += `
` + r5.raw, this.inlineQueue.at(-1).src = o6.text) : this.tokens.links[r5.tag] || (this.tokens.links[r5.tag] = { href: r5.href, title: r5.title }, t5.push(r5));
        continue;
      }
      if (r5 = this.tokenizer.table(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      if (r5 = this.tokenizer.lheading(e6)) {
        e6 = e6.substring(r5.raw.length), t5.push(r5);
        continue;
      }
      let i6 = e6;
      if (this.options.extensions?.startBlock) {
        let o6 = 1 / 0, u3 = e6.slice(1), a3;
        this.options.extensions.startBlock.forEach((c4) => {
          a3 = c4.call({ lexer: this }, u3), typeof a3 == "number" && a3 >= 0 && (o6 = Math.min(o6, a3));
        }), o6 < 1 / 0 && o6 >= 0 && (i6 = e6.substring(0, o6 + 1));
      }
      if (this.state.top && (r5 = this.tokenizer.paragraph(i6))) {
        let o6 = t5.at(-1);
        n4 && o6?.type === "paragraph" ? (o6.raw += (o6.raw.endsWith(`
`) ? "" : `
`) + r5.raw, o6.text += `
` + r5.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o6.text) : t5.push(r5), n4 = i6.length !== e6.length, e6 = e6.substring(r5.raw.length);
        continue;
      }
      if (r5 = this.tokenizer.text(e6)) {
        e6 = e6.substring(r5.raw.length);
        let o6 = t5.at(-1);
        o6?.type === "text" ? (o6.raw += (o6.raw.endsWith(`
`) ? "" : `
`) + r5.raw, o6.text += `
` + r5.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o6.text) : t5.push(r5);
        continue;
      }
      if (e6) {
        this.infiniteLoopError(e6.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t5;
  }
  inline(e6, t5 = []) {
    return this.inlineQueue.push({ src: e6, tokens: t5 }), t5;
  }
  inlineTokens(e6, t5 = []) {
    this.tokenizer.lexer = this;
    let n4 = e6, s4 = null;
    if (this.tokens.links) {
      let a3 = Object.keys(this.tokens.links);
      if (a3.length > 0) for (; (s4 = this.tokenizer.rules.inline.reflinkSearch.exec(n4)) !== null; ) a3.includes(s4[0].slice(s4[0].lastIndexOf("[") + 1, -1)) && (n4 = n4.slice(0, s4.index) + "[" + "a".repeat(s4[0].length - 2) + "]" + n4.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (s4 = this.tokenizer.rules.inline.anyPunctuation.exec(n4)) !== null; ) n4 = n4.slice(0, s4.index) + "++" + n4.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let r5;
    for (; (s4 = this.tokenizer.rules.inline.blockSkip.exec(n4)) !== null; ) r5 = s4[2] ? s4[2].length : 0, n4 = n4.slice(0, s4.index + r5) + "[" + "a".repeat(s4[0].length - r5 - 2) + "]" + n4.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n4 = this.options.hooks?.emStrongMask?.call({ lexer: this }, n4) ?? n4;
    let i6 = false, o6 = "", u3 = 1 / 0;
    for (; e6; ) {
      if (e6.length < u3) u3 = e6.length;
      else {
        this.infiniteLoopError(e6.charCodeAt(0));
        break;
      }
      i6 || (o6 = ""), i6 = false;
      let a3;
      if (this.options.extensions?.inline?.some((p4) => (a3 = p4.call({ lexer: this }, e6, t5)) ? (e6 = e6.substring(a3.raw.length), t5.push(a3), true) : false)) continue;
      if (a3 = this.tokenizer.escape(e6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.tag(e6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.link(e6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.reflink(e6, this.tokens.links)) {
        e6 = e6.substring(a3.raw.length);
        let p4 = t5.at(-1);
        a3.type === "text" && p4?.type === "text" ? (p4.raw += a3.raw, p4.text += a3.text) : t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.emStrong(e6, n4, o6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.codespan(e6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.br(e6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.del(e6, n4, o6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (a3 = this.tokenizer.autolink(e6)) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      if (!this.state.inLink && (a3 = this.tokenizer.url(e6))) {
        e6 = e6.substring(a3.raw.length), t5.push(a3);
        continue;
      }
      let c4 = e6;
      if (this.options.extensions?.startInline) {
        let p4 = 1 / 0, k2 = e6.slice(1), h3;
        this.options.extensions.startInline.forEach((R2) => {
          h3 = R2.call({ lexer: this }, k2), typeof h3 == "number" && h3 >= 0 && (p4 = Math.min(p4, h3));
        }), p4 < 1 / 0 && p4 >= 0 && (c4 = e6.substring(0, p4 + 1));
      }
      if (a3 = this.tokenizer.inlineText(c4)) {
        e6 = e6.substring(a3.raw.length), a3.raw.slice(-1) !== "_" && (o6 = a3.raw.slice(-1)), i6 = true;
        let p4 = t5.at(-1);
        p4?.type === "text" ? (p4.raw += a3.raw, p4.text += a3.text) : t5.push(a3);
        continue;
      }
      if (e6) {
        this.infiniteLoopError(e6.charCodeAt(0));
        break;
      }
    }
    return t5;
  }
  infiniteLoopError(e6) {
    let t5 = "Infinite loop on byte: " + e6;
    if (this.options.silent) console.error(t5);
    else throw new Error(t5);
  }
};
var y3 = class {
  constructor(e6) {
    __publicField(this, "options");
    __publicField(this, "parser");
    this.options = e6 || T2;
  }
  space(e6) {
    return "";
  }
  code({ text: e6, lang: t5, escaped: n4 }) {
    let s4 = (t5 || "").match(m3.notSpaceStart)?.[0], r5 = e6.replace(m3.endingNewline, "") + `
`;
    return s4 ? '<pre><code class="language-' + O(s4) + '">' + (n4 ? r5 : O(r5, true)) + `</code></pre>
` : "<pre><code>" + (n4 ? r5 : O(r5, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e6 }) {
    return `<blockquote>
${this.parser.parse(e6)}</blockquote>
`;
  }
  html({ text: e6 }) {
    return e6;
  }
  def(e6) {
    return "";
  }
  heading({ tokens: e6, depth: t5 }) {
    return `<h${t5}>${this.parser.parseInline(e6)}</h${t5}>
`;
  }
  hr(e6) {
    return `<hr>
`;
  }
  list(e6) {
    let t5 = e6.ordered, n4 = e6.start, s4 = "";
    for (let o6 = 0; o6 < e6.items.length; o6++) {
      let u3 = e6.items[o6];
      s4 += this.listitem(u3);
    }
    let r5 = t5 ? "ol" : "ul", i6 = t5 && n4 !== 1 ? ' start="' + n4 + '"' : "";
    return "<" + r5 + i6 + `>
` + s4 + "</" + r5 + `>
`;
  }
  listitem(e6) {
    return `<li>${this.parser.parse(e6.tokens)}</li>
`;
  }
  checkbox({ checked: e6 }) {
    return "<input " + (e6 ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e6 }) {
    return `<p>${this.parser.parseInline(e6)}</p>
`;
  }
  table(e6) {
    let t5 = "", n4 = "";
    for (let r5 = 0; r5 < e6.header.length; r5++) n4 += this.tablecell(e6.header[r5]);
    t5 += this.tablerow({ text: n4 });
    let s4 = "";
    for (let r5 = 0; r5 < e6.rows.length; r5++) {
      let i6 = e6.rows[r5];
      n4 = "";
      for (let o6 = 0; o6 < i6.length; o6++) n4 += this.tablecell(i6[o6]);
      s4 += this.tablerow({ text: n4 });
    }
    return s4 && (s4 = `<tbody>${s4}</tbody>`), `<table>
<thead>
` + t5 + `</thead>
` + s4 + `</table>
`;
  }
  tablerow({ text: e6 }) {
    return `<tr>
${e6}</tr>
`;
  }
  tablecell(e6) {
    let t5 = this.parser.parseInline(e6.tokens), n4 = e6.header ? "th" : "td";
    return (e6.align ? `<${n4} align="${e6.align}">` : `<${n4}>`) + t5 + `</${n4}>
`;
  }
  strong({ tokens: e6 }) {
    return `<strong>${this.parser.parseInline(e6)}</strong>`;
  }
  em({ tokens: e6 }) {
    return `<em>${this.parser.parseInline(e6)}</em>`;
  }
  codespan({ text: e6 }) {
    return `<code>${O(e6, true)}</code>`;
  }
  br(e6) {
    return "<br>";
  }
  del({ tokens: e6 }) {
    return `<del>${this.parser.parseInline(e6)}</del>`;
  }
  link({ href: e6, title: t5, tokens: n4 }) {
    let s4 = this.parser.parseInline(n4), r5 = V2(e6);
    if (r5 === null) return s4;
    e6 = r5;
    let i6 = '<a href="' + e6 + '"';
    return t5 && (i6 += ' title="' + O(t5) + '"'), i6 += ">" + s4 + "</a>", i6;
  }
  image({ href: e6, title: t5, text: n4, tokens: s4 }) {
    s4 && (n4 = this.parser.parseInline(s4, this.parser.textRenderer));
    let r5 = V2(e6);
    if (r5 === null) return O(n4);
    e6 = r5;
    let i6 = `<img src="${e6}" alt="${O(n4)}"`;
    return t5 && (i6 += ` title="${O(t5)}"`), i6 += ">", i6;
  }
  text(e6) {
    return "tokens" in e6 && e6.tokens ? this.parser.parseInline(e6.tokens) : "escaped" in e6 && e6.escaped ? e6.text : O(e6.text);
  }
};
var L2 = class {
  strong({ text: e6 }) {
    return e6;
  }
  em({ text: e6 }) {
    return e6;
  }
  codespan({ text: e6 }) {
    return e6;
  }
  del({ text: e6 }) {
    return e6;
  }
  html({ text: e6 }) {
    return e6;
  }
  text({ text: e6 }) {
    return e6;
  }
  link({ text: e6 }) {
    return "" + e6;
  }
  image({ text: e6 }) {
    return "" + e6;
  }
  br() {
    return "";
  }
  checkbox({ raw: e6 }) {
    return e6;
  }
};
var b3 = class l5 {
  constructor(e6) {
    __publicField(this, "options");
    __publicField(this, "renderer");
    __publicField(this, "textRenderer");
    this.options = e6 || T2, this.options.renderer = this.options.renderer || new y3(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L2();
  }
  static parse(e6, t5) {
    return new l5(t5).parse(e6);
  }
  static parseInline(e6, t5) {
    return new l5(t5).parseInline(e6);
  }
  parse(e6) {
    this.renderer.parser = this;
    let t5 = "";
    for (let n4 = 0; n4 < e6.length; n4++) {
      let s4 = e6[n4];
      if (this.options.extensions?.renderers?.[s4.type]) {
        let i6 = s4, o6 = this.options.extensions.renderers[i6.type].call({ parser: this }, i6);
        if (o6 !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(i6.type)) {
          t5 += o6 || "";
          continue;
        }
      }
      let r5 = s4;
      switch (r5.type) {
        case "space": {
          t5 += this.renderer.space(r5);
          break;
        }
        case "hr": {
          t5 += this.renderer.hr(r5);
          break;
        }
        case "heading": {
          t5 += this.renderer.heading(r5);
          break;
        }
        case "code": {
          t5 += this.renderer.code(r5);
          break;
        }
        case "table": {
          t5 += this.renderer.table(r5);
          break;
        }
        case "blockquote": {
          t5 += this.renderer.blockquote(r5);
          break;
        }
        case "list": {
          t5 += this.renderer.list(r5);
          break;
        }
        case "checkbox": {
          t5 += this.renderer.checkbox(r5);
          break;
        }
        case "html": {
          t5 += this.renderer.html(r5);
          break;
        }
        case "def": {
          t5 += this.renderer.def(r5);
          break;
        }
        case "paragraph": {
          t5 += this.renderer.paragraph(r5);
          break;
        }
        case "text": {
          t5 += this.renderer.text(r5);
          break;
        }
        default: {
          let i6 = 'Token with "' + r5.type + '" type was not found.';
          if (this.options.silent) return console.error(i6), "";
          throw new Error(i6);
        }
      }
    }
    return t5;
  }
  parseInline(e6, t5 = this.renderer) {
    this.renderer.parser = this;
    let n4 = "";
    for (let s4 = 0; s4 < e6.length; s4++) {
      let r5 = e6[s4];
      if (this.options.extensions?.renderers?.[r5.type]) {
        let o6 = this.options.extensions.renderers[r5.type].call({ parser: this }, r5);
        if (o6 !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(r5.type)) {
          n4 += o6 || "";
          continue;
        }
      }
      let i6 = r5;
      switch (i6.type) {
        case "escape": {
          n4 += t5.text(i6);
          break;
        }
        case "html": {
          n4 += t5.html(i6);
          break;
        }
        case "link": {
          n4 += t5.link(i6);
          break;
        }
        case "image": {
          n4 += t5.image(i6);
          break;
        }
        case "checkbox": {
          n4 += t5.checkbox(i6);
          break;
        }
        case "strong": {
          n4 += t5.strong(i6);
          break;
        }
        case "em": {
          n4 += t5.em(i6);
          break;
        }
        case "codespan": {
          n4 += t5.codespan(i6);
          break;
        }
        case "br": {
          n4 += t5.br(i6);
          break;
        }
        case "del": {
          n4 += t5.del(i6);
          break;
        }
        case "text": {
          n4 += t5.text(i6);
          break;
        }
        default: {
          let o6 = 'Token with "' + i6.type + '" type was not found.';
          if (this.options.silent) return console.error(o6), "";
          throw new Error(o6);
        }
      }
    }
    return n4;
  }
};
var _a;
var P2 = (_a = class {
  constructor(e6) {
    __publicField(this, "options");
    __publicField(this, "block");
    this.options = e6 || T2;
  }
  preprocess(e6) {
    return e6;
  }
  postprocess(e6) {
    return e6;
  }
  processAllTokens(e6) {
    return e6;
  }
  emStrongMask(e6) {
    return e6;
  }
  provideLexer(e6 = this.block) {
    return e6 ? x2.lex : x2.lexInline;
  }
  provideParser(e6 = this.block) {
    return e6 ? b3.parse : b3.parseInline;
  }
}, __publicField(_a, "passThroughHooks", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"])), __publicField(_a, "passThroughHooksRespectAsync", /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"])), _a);
var q = class {
  constructor(...e6) {
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
    this.use(...e6);
  }
  walkTokens(e6, t5) {
    let n4 = [];
    for (let s4 of e6) switch (n4 = n4.concat(t5.call(this, s4)), s4.type) {
      case "table": {
        let r5 = s4;
        for (let i6 of r5.header) n4 = n4.concat(this.walkTokens(i6.tokens, t5));
        for (let i6 of r5.rows) for (let o6 of i6) n4 = n4.concat(this.walkTokens(o6.tokens, t5));
        break;
      }
      case "list": {
        let r5 = s4;
        n4 = n4.concat(this.walkTokens(r5.items, t5));
        break;
      }
      default: {
        let r5 = s4;
        this.defaults.extensions?.childTokens?.[r5.type] ? this.defaults.extensions.childTokens[r5.type].forEach((i6) => {
          let o6 = r5[i6].flat(1 / 0);
          n4 = n4.concat(this.walkTokens(o6, t5));
        }) : r5.tokens && (n4 = n4.concat(this.walkTokens(r5.tokens, t5)));
      }
    }
    return n4;
  }
  use(...e6) {
    let t5 = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e6.forEach((n4) => {
      let s4 = { ...n4 };
      if (s4.async = this.defaults.async || s4.async || false, n4.extensions && (n4.extensions.forEach((r5) => {
        if (!r5.name) throw new Error("extension name required");
        if ("renderer" in r5) {
          let i6 = t5.renderers[r5.name];
          i6 ? t5.renderers[r5.name] = function(...o6) {
            let u3 = r5.renderer.apply(this, o6);
            return u3 === false && (u3 = i6.apply(this, o6)), u3;
          } : t5.renderers[r5.name] = r5.renderer;
        }
        if ("tokenizer" in r5) {
          if (!r5.level || r5.level !== "block" && r5.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let i6 = t5[r5.level];
          i6 ? i6.unshift(r5.tokenizer) : t5[r5.level] = [r5.tokenizer], r5.start && (r5.level === "block" ? t5.startBlock ? t5.startBlock.push(r5.start) : t5.startBlock = [r5.start] : r5.level === "inline" && (t5.startInline ? t5.startInline.push(r5.start) : t5.startInline = [r5.start]));
        }
        "childTokens" in r5 && r5.childTokens && (t5.childTokens[r5.name] = r5.childTokens);
      }), s4.extensions = t5), n4.renderer) {
        let r5 = this.defaults.renderer || new y3(this.defaults);
        for (let i6 in n4.renderer) {
          if (!(i6 in r5)) throw new Error(`renderer '${i6}' does not exist`);
          if (["options", "parser"].includes(i6)) continue;
          let o6 = i6, u3 = n4.renderer[o6], a3 = r5[o6];
          r5[o6] = (...c4) => {
            let p4 = u3.apply(r5, c4);
            return p4 === false && (p4 = a3.apply(r5, c4)), p4 || "";
          };
        }
        s4.renderer = r5;
      }
      if (n4.tokenizer) {
        let r5 = this.defaults.tokenizer || new w2(this.defaults);
        for (let i6 in n4.tokenizer) {
          if (!(i6 in r5)) throw new Error(`tokenizer '${i6}' does not exist`);
          if (["options", "rules", "lexer"].includes(i6)) continue;
          let o6 = i6, u3 = n4.tokenizer[o6], a3 = r5[o6];
          r5[o6] = (...c4) => {
            let p4 = u3.apply(r5, c4);
            return p4 === false && (p4 = a3.apply(r5, c4)), p4;
          };
        }
        s4.tokenizer = r5;
      }
      if (n4.hooks) {
        let r5 = this.defaults.hooks || new P2();
        for (let i6 in n4.hooks) {
          if (!(i6 in r5)) throw new Error(`hook '${i6}' does not exist`);
          if (["options", "block"].includes(i6)) continue;
          let o6 = i6, u3 = n4.hooks[o6], a3 = r5[o6];
          P2.passThroughHooks.has(i6) ? r5[o6] = (c4) => {
            if (this.defaults.async && P2.passThroughHooksRespectAsync.has(i6)) return (async () => {
              let k2 = await u3.call(r5, c4);
              return a3.call(r5, k2);
            })();
            let p4 = u3.call(r5, c4);
            return a3.call(r5, p4);
          } : r5[o6] = (...c4) => {
            if (this.defaults.async) return (async () => {
              let k2 = await u3.apply(r5, c4);
              return k2 === false && (k2 = await a3.apply(r5, c4)), k2;
            })();
            let p4 = u3.apply(r5, c4);
            return p4 === false && (p4 = a3.apply(r5, c4)), p4;
          };
        }
        s4.hooks = r5;
      }
      if (n4.walkTokens) {
        let r5 = this.defaults.walkTokens, i6 = n4.walkTokens;
        s4.walkTokens = function(o6) {
          let u3 = [];
          return u3.push(i6.call(this, o6)), r5 && (u3 = u3.concat(r5.call(this, o6))), u3;
        };
      }
      this.defaults = { ...this.defaults, ...s4 };
    }), this;
  }
  setOptions(e6) {
    return this.defaults = { ...this.defaults, ...e6 }, this;
  }
  lexer(e6, t5) {
    return x2.lex(e6, t5 ?? this.defaults);
  }
  parser(e6, t5) {
    return b3.parse(e6, t5 ?? this.defaults);
  }
  parseMarkdown(e6) {
    return (n4, s4) => {
      let r5 = { ...s4 }, i6 = { ...this.defaults, ...r5 }, o6 = this.onError(!!i6.silent, !!i6.async);
      if (this.defaults.async === true && r5.async === false) return o6(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n4 > "u" || n4 === null) return o6(new Error("marked(): input parameter is undefined or null"));
      if (typeof n4 != "string") return o6(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n4) + ", string expected"));
      if (i6.hooks && (i6.hooks.options = i6, i6.hooks.block = e6), i6.async) return (async () => {
        let u3 = i6.hooks ? await i6.hooks.preprocess(n4) : n4, c4 = await (i6.hooks ? await i6.hooks.provideLexer(e6) : e6 ? x2.lex : x2.lexInline)(u3, i6), p4 = i6.hooks ? await i6.hooks.processAllTokens(c4) : c4;
        i6.walkTokens && await Promise.all(this.walkTokens(p4, i6.walkTokens));
        let h3 = await (i6.hooks ? await i6.hooks.provideParser(e6) : e6 ? b3.parse : b3.parseInline)(p4, i6);
        return i6.hooks ? await i6.hooks.postprocess(h3) : h3;
      })().catch(o6);
      try {
        i6.hooks && (n4 = i6.hooks.preprocess(n4));
        let a3 = (i6.hooks ? i6.hooks.provideLexer(e6) : e6 ? x2.lex : x2.lexInline)(n4, i6);
        i6.hooks && (a3 = i6.hooks.processAllTokens(a3)), i6.walkTokens && this.walkTokens(a3, i6.walkTokens);
        let p4 = (i6.hooks ? i6.hooks.provideParser(e6) : e6 ? b3.parse : b3.parseInline)(a3, i6);
        return i6.hooks && (p4 = i6.hooks.postprocess(p4)), p4;
      } catch (u3) {
        return o6(u3);
      }
    };
  }
  onError(e6, t5) {
    return (n4) => {
      if (n4.message += `
Please report this to https://github.com/markedjs/marked.`, e6) {
        let s4 = "<p>An error occurred:</p><pre>" + O(n4.message + "", true) + "</pre>";
        return t5 ? Promise.resolve(s4) : s4;
      }
      if (t5) return Promise.reject(n4);
      throw n4;
    };
  }
};
var z2 = new q();
function g2(l6, e6) {
  return z2.parse(l6, e6);
}
g2.options = g2.setOptions = function(l6) {
  return z2.setOptions(l6), g2.defaults = z2.defaults, N2(g2.defaults), g2;
};
g2.getDefaults = M2;
g2.defaults = T2;
g2.use = function(...l6) {
  return z2.use(...l6), g2.defaults = z2.defaults, N2(g2.defaults), g2;
};
g2.walkTokens = function(l6, e6) {
  return z2.walkTokens(l6, e6);
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
  createRenderRoot() {
    return this;
  }
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
               style="--step-progress: ${progressPercent}%">
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
            <div class="description-text ${this.descriptionExpanded ? "expanded" : ""}">${o5(this._renderDescriptionMarkdown(this.description))}</div>
          ` : ""}
          ${this.instructions ? b2`
            <wy-info-panel class="prompt-instructions-panel">
              <p class="prompt-instructions-heading">Instructions</p>
              <div class="prompt-instructions-copy">${o5(this._renderDescriptionMarkdown(this.instructions))}</div>
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
        <div class="preview-area">${o5(g2.parse(compiledPrompt, { breaks: true }))}</div>
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
        <div class="overview-lead">${o5(this._renderDescriptionMarkdown(this.description))}</div>
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
                <div class="variation-description-copy">${o5(this._renderDescriptionMarkdown(activeVariation.description))}</div>
              ` : ""}
              ${activeVariation?.instructions ? b2`
                <div class="variation-meta-section">
                  <p class="variation-description-heading">Instructions</p>
                  <div class="variation-description-copy">${o5(this._renderDescriptionMarkdown(activeVariation.instructions))}</div>
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
                <div class="variation-description-copy">${o5(this._renderDescriptionMarkdown(activeVariation.description))}</div>
              ` : ""}
              ${activeVariation?.instructions ? b2`
                <div class="variation-meta-section">
                  <p class="variation-description-heading">Instructions</p>
                  <div class="variation-description-copy">${o5(this._renderDescriptionMarkdown(activeVariation.instructions))}</div>
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
                <span class="visual-variation-name">${name}${selected ? b2`<span class="visual-variation-mark" aria-hidden="true"></span>` : ""}</span>
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
              <wy-tabs active-tab="${standardActiveTab}" @tab-change="${(e6) => this.activeTab = e6.detail.tab}">
                <button class="tab-item ${standardActiveTab === (hasVariables ? "variables" : "overview") ? "active" : ""}" role="tab" data-tab="${hasVariables ? "variables" : "overview"}">${hasVariables ? "Variables" : "Overview"}</button>
                <button class="tab-item ${standardActiveTab === "preview" ? "active" : ""}" role="tab" data-tab="preview">Full prompt</button>
              </wy-tabs>
              ${standardActiveTab === "variables" && this._hasValues() ? b2`
                <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
              ` : ""}
          </div>

          <div class="body">
            ${standardActiveTab === "preview" ? b2`
              <div class="preview-area">${o5(g2.parse(compiledPrompt, { breaks: true }))}</div>
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
                    <wy-tabs active-tab="${standardActiveTab}" @tab-change="${(e6) => this.activeTab = e6.detail.tab}">
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
                    <div class="preview-area">${o5(g2.parse(compiledPrompt, { breaks: true }))}</div>
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
                @input="${(e6) => this.template = e6.target.value}"
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
            @change="${(e6) => this._handleInput(v3.name, e6.detail.value)}"
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
            @input="${(e6) => this._handleInput(v3.name, e6.target.value)}"
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
          @input="${(e6) => this._handleInput(v3.name, e6.target.value)}"
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
  _handleVariationChange(e6) {
    const index = parseInt(e6.target.value);
    this.activeVariationIndex = index;
    this.dispatchEvent(new CustomEvent("variation-change", {
      detail: { index, variation: this.variations[index] },
      bubbles: true,
      composed: true
    }));
  }
  _handleVariationDropdownChange(e6) {
    const selectedId = e6.detail.value;
    this._setVariationById(selectedId);
  }
  _handleVariationSelectChange(e6) {
    this._setVariationById(e6.target.value);
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
  _setActiveTab(e6) {
    const tab = e6.target.dataset.tab || e6.target.closest("[data-tab]")?.dataset.tab;
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
customElements.define("wy-prompt-modal", WyPromptModal);

// components/ui/wy-links-modal.js
var WyLinksModal = class extends i4 {
  createRenderRoot() {
    return this;
  }
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
      const closeButton = this.querySelector(".close-button");
      if (closeButton) {
        closeButton.focus();
      }
    });
  }
  _handleEscKey(e6) {
    if (e6.key === "Escape" && this.open) {
      if (this.openDropdownId) {
        this.openDropdownId = "";
        return;
      }
      this._handleClose();
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
              ${!this.links || this.links.length === 0 ? b2`<p class="empty-state">No links available.</p>` : this.links.map((category, categoryIndex) => b2`
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
  _handleOverlayClick(e6) {
    if (e6.target === e6.currentTarget) {
      this._handleClose();
    }
  }
  _handleContainerClick(e6) {
    if (!e6.composedPath().some((element) => element?.classList?.contains("link-dropdown"))) {
      this.openDropdownId = "";
    }
    e6.stopPropagation();
  }
  _handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", {
      bubbles: true,
      composed: true
    }));
  }
  _handleLinkClick(e6, link) {
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
            @click="${(e6) => this._handleDropdownToggle(e6, dropdownId)}"
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
                  @click="${(e6) => this._handleLinkClick(e6, option)}"
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
        @click="${(e6) => this._handleLinkClick(e6, link)}"
        aria-label="Open ${link.name}"
      >
        ${link.name}
      </button>
    `;
  }
  _handleDropdownToggle(e6, dropdownId) {
    e6.stopPropagation();
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
  createRenderRoot() {
    return this;
  }
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
  _handleScrimClick(e6) {
    if (e6.target === e6.currentTarget) this.close();
  }
  _handleDocKeyDown(e6) {
    if (e6.key === "Escape" && this.open) this.close();
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
                        @click="${(e6) => this._copyPalette(palette, e6.currentTarget)}"
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
                            @click="${(e6) => this._copyHex(c4.hex, e6.currentTarget)}"
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
customElements.define("wy-color-palette", WyColorPalette);

// components/ui/index.js
console.log("[prompts-library] Local web components registered");
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
lit-html/directives/live.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
