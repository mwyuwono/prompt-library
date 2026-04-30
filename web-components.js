var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/tslib/tslib.es6.mjs
function __decorate(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
}

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t = (t5) => (e9, o8) => {
  void 0 !== o8 ? o8.addInitializer(() => {
    customElements.define(t5, e9);
  }) : customElements.define(t5, e9);
};

// node_modules/@lit/reactive-element/css-tag.js
var t2 = globalThis;
var e = t2.ShadowRoot && (void 0 === t2.ShadyCSS || t2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t5, e9, o8) {
    if (this._$cssResult$ = true, o8 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t5, this.t = e9;
  }
  get styleSheet() {
    let t5 = this.o;
    const s4 = this.t;
    if (e && void 0 === t5) {
      const e9 = void 0 !== s4 && 1 === s4.length;
      e9 && (t5 = o.get(s4)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e9 && o.set(s4, t5));
    }
    return t5;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t5) => new n("string" == typeof t5 ? t5 : t5 + "", void 0, s);
var i = (t5, ...e9) => {
  const o8 = 1 === t5.length ? t5[0] : e9.reduce((e10, s4, o9) => e10 + ((t6) => {
    if (true === t6._$cssResult$) return t6.cssText;
    if ("number" == typeof t6) return t6;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t6 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t5[o9 + 1], t5[0]);
  return new n(o8, t5, s);
};
var S = (s4, o8) => {
  if (e) s4.adoptedStyleSheets = o8.map((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet);
  else for (const e9 of o8) {
    const o9 = document.createElement("style"), n5 = t2.litNonce;
    void 0 !== n5 && o9.setAttribute("nonce", n5), o9.textContent = e9.cssText, s4.appendChild(o9);
  }
};
var c = e ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
  let e9 = "";
  for (const s4 of t6.cssRules) e9 += s4.cssText;
  return r(e9);
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
    const { get: e9, set: r6 } = h(this.prototype, t5) ?? { get() {
      return this[s4];
    }, set(t6) {
      this[s4] = t6;
    } };
    return { get: e9, set(s5) {
      const h3 = e9?.call(this);
      r6?.call(this, s5), this.requestUpdate(t5, h3, i6);
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
      const e9 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e9) i6.unshift(c(s5));
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
    const i6 = this.constructor.elementProperties.get(t5), e9 = this.constructor._$Eu(t5, i6);
    if (void 0 !== e9 && true === i6.reflect) {
      const h3 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
      this._$Em = t5, null == h3 ? this.removeAttribute(e9) : this.setAttribute(e9, h3), this._$Em = null;
    }
  }
  _$AK(t5, s4) {
    const i6 = this.constructor, e9 = i6._$Eh.get(t5);
    if (void 0 !== e9 && this._$Em !== e9) {
      const t6 = i6.getPropertyOptions(e9), h3 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== t6.converter?.fromAttribute ? t6.converter : u;
      this._$Em = e9;
      const r6 = h3.fromAttribute(s4, t6.type);
      this[e9] = r6 ?? this._$Ej?.get(e9) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t5, s4, i6, e9 = false, h3) {
    if (void 0 !== t5) {
      const r6 = this.constructor;
      if (false === e9 && (h3 = this[t5]), i6 ?? (i6 = r6.getPropertyOptions(t5)), !((i6.hasChanged ?? f)(h3, s4) || i6.useDefault && i6.reflect && h3 === this._$Ej?.get(t5) && !this.hasAttribute(r6._$Eu(t5, i6)))) return;
      this.C(t5, s4, i6);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t5, s4, { useDefault: i6, reflect: e9, wrapped: h3 }, r6) {
    i6 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t5) && (this._$Ej.set(t5, r6 ?? s4 ?? this[t5]), true !== h3 || void 0 !== r6) || (this._$AL.has(t5) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t5, s4)), true === e9 && this._$Em !== t5 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t5));
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
        const { wrapped: t7 } = i6, e9 = this[s5];
        true !== t7 || this._$AL.has(s5) || void 0 === e9 || this.C(s5, void 0, i6, e9);
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

// node_modules/@lit/reactive-element/decorators/property.js
var o3 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r3 = (t5 = o3, e9, r6) => {
  const { kind: n5, metadata: i6 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i6);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i6, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t5 = Object.create(t5)).wrapped = true), s4.set(r6.name, t5), "accessor" === n5) {
    const { name: o8 } = r6;
    return { set(r7) {
      const n6 = e9.get.call(this);
      e9.set.call(this, r7), this.requestUpdate(o8, n6, t5, true, r7);
    }, init(e10) {
      return void 0 !== e10 && this.C(o8, void 0, t5, e10), e10;
    } };
  }
  if ("setter" === n5) {
    const { name: o8 } = r6;
    return function(r7) {
      const n6 = this[o8];
      e9.call(this, r7), this.requestUpdate(o8, n6, t5, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n3(t5) {
  return (e9, o8) => "object" == typeof o8 ? r3(t5, e9, o8) : ((t6, e10, o9) => {
    const r6 = e10.hasOwnProperty(o9);
    return e10.constructor.createProperty(o9, t6), r6 ? Object.getOwnPropertyDescriptor(e10, o9) : void 0;
  })(t5, e9, o8);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r4(r6) {
  return n3({ ...r6, state: true, attribute: false });
}

// node_modules/@lit/reactive-element/decorators/base.js
var e3 = (e9, t5, c4) => (c4.configurable = true, c4.enumerable = true, Reflect.decorate && "object" != typeof t5 && Object.defineProperty(e9, t5, c4), c4);

// node_modules/@lit/reactive-element/decorators/query.js
function e4(e9, r6) {
  return (n5, s4, i6) => {
    const o8 = (t5) => t5.renderRoot?.querySelector(e9) ?? null;
    if (r6) {
      const { get: e10, set: r7 } = "object" == typeof s4 ? n5 : i6 ?? /* @__PURE__ */ (() => {
        const t5 = /* @__PURE__ */ Symbol();
        return { get() {
          return this[t5];
        }, set(e11) {
          this[t5] = e11;
        } };
      })();
      return e3(n5, s4, { get() {
        let t5 = e10.call(this);
        return void 0 === t5 && (t5 = o8(this), (null !== t5 || this.hasUpdated) && r7.call(this, t5)), t5;
      } });
    }
    return e3(n5, s4, { get() {
      return o8(this);
    } });
  };
}

// node_modules/lit-html/lit-html.js
var t3 = globalThis;
var i3 = (t5) => t5;
var s2 = t3.trustedTypes;
var e5 = s2 ? s2.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
var h2 = "$lit$";
var o4 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n4 = "?" + o4;
var r5 = `<${n4}>`;
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
  return void 0 !== e5 ? e5.createHTML(i6) : i6;
}
var N = (t5, i6) => {
  const s4 = t5.length - 1, e9 = [];
  let n5, l3 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c4 = v;
  for (let i7 = 0; i7 < s4; i7++) {
    const s5 = t5[i7];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t5[i7 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r5 : d3 >= 0 ? (e9.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o4 + x2) : s5 + o4 + (-2 === d3 ? i7 : x2);
  }
  return [V(t5, l3 + (t5[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e9];
};
var S2 = class _S {
  constructor({ strings: t5, _$litType$: i6 }, e9) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t5.length - 1, d3 = this.parts, [f3, v2] = N(t5, i6);
    if (this.el = _S.createElement(f3, e9), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t6 of r6.getAttributeNames()) if (t6.endsWith(h2)) {
          const i7 = v2[a3++], s4 = r6.getAttribute(t6).split(o4), e10 = /([.?@])?(.*)/.exec(i7);
          d3.push({ type: 1, index: l3, name: e10[2], strings: s4, ctor: "." === e10[1] ? I : "?" === e10[1] ? L : "@" === e10[1] ? z : H }), r6.removeAttribute(t6);
        } else t6.startsWith(o4) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t6));
        if (y2.test(r6.tagName)) {
          const t6 = r6.textContent.split(o4), i7 = t6.length - 1;
          if (i7 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i7; s4++) r6.append(t6[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t6[i7], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n4) d3.push({ type: 2, index: l3 });
      else {
        let t6 = -1;
        for (; -1 !== (t6 = r6.data.indexOf(o4, t6 + 1)); ) d3.push({ type: 7, index: l3 }), t6 += o4.length - 1;
      }
      l3++;
    }
  }
  static createElement(t5, i6) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t5, s4;
  }
};
function M(t5, i6, s4 = t5, e9) {
  if (i6 === E) return i6;
  let h3 = void 0 !== e9 ? s4._$Co?.[e9] : s4._$Cl;
  const o8 = a2(i6) ? void 0 : i6._$litDirective$;
  return h3?.constructor !== o8 && (h3?._$AO?.(false), void 0 === o8 ? h3 = void 0 : (h3 = new o8(t5), h3._$AT(t5, s4, e9)), void 0 !== e9 ? (s4._$Co ?? (s4._$Co = []))[e9] = h3 : s4._$Cl = h3), void 0 !== h3 && (i6 = M(t5, h3._$AS(t5, i6.values), h3, e9)), i6;
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
    const { el: { content: i6 }, parts: s4 } = this._$AD, e9 = (t5?.creationScope ?? l2).importNode(i6, true);
    P.currentNode = e9;
    let h3 = P.nextNode(), o8 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o8 === r6.index) {
        let i7;
        2 === r6.type ? i7 = new k(h3, h3.nextSibling, this, t5) : 1 === r6.type ? i7 = new r6.ctor(h3, r6.name, r6.strings, this, t5) : 6 === r6.type && (i7 = new Z(h3, this, t5)), this._$AV.push(i7), r6 = s4[++n5];
      }
      o8 !== r6?.index && (h3 = P.nextNode(), o8++);
    }
    return P.currentNode = l2, e9;
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
  constructor(t5, i6, s4, e9) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t5, this._$AB = i6, this._$AM = s4, this.options = e9, this._$Cv = e9?.isConnected ?? true;
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
    const { values: i6, _$litType$: s4 } = t5, e9 = "number" == typeof s4 ? this._$AC(t5) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e9) this._$AH.p(i6);
    else {
      const t6 = new R(e9, this), s5 = t6.u(this.options);
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
    let s4, e9 = 0;
    for (const h3 of t5) e9 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e9], s4._$AI(h3), e9++;
    e9 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e9), i6.length = e9);
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
  constructor(t5, i6, s4, e9, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t5, this.name = i6, this._$AM = e9, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t5, i6 = this, s4, e9) {
    const h3 = this.strings;
    let o8 = false;
    if (void 0 === h3) t5 = M(this, t5, i6, 0), o8 = !a2(t5) || t5 !== this._$AH && t5 !== E, o8 && (this._$AH = t5);
    else {
      const e10 = t5;
      let n5, r6;
      for (t5 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e10[s4 + n5], i6, n5), r6 === E && (r6 = this._$AH[n5]), o8 || (o8 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t5 = A : t5 !== A && (t5 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o8 && !e9 && this.j(t5);
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
  constructor(t5, i6, s4, e9, h3) {
    super(t5, i6, s4, e9, h3), this.type = 5;
  }
  _$AI(t5, i6 = this) {
    if ((t5 = M(this, t5, i6, 0) ?? A) === E) return;
    const s4 = this._$AH, e9 = t5 === A && s4 !== A || t5.capture !== s4.capture || t5.once !== s4.once || t5.passive !== s4.passive, h3 = t5 !== A && (s4 === A || e9);
    e9 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
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
var B = t3.litHtmlPolyfillSupport;
B?.(S2, k), (t3.litHtmlVersions ?? (t3.litHtmlVersions = [])).push("3.3.2");
var D = (t5, i6, s4) => {
  const e9 = s4?.renderBefore ?? i6;
  let h3 = e9._$litPart$;
  if (void 0 === h3) {
    const t6 = s4?.renderBefore ?? null;
    e9._$litPart$ = h3 = new k(i6.insertBefore(c3(), t6), t6, void 0, s4 ?? {});
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
    var _a;
    const t5 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t5.firstChild), t5;
  }
  update(t5) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = D(r6, this.renderRoot, this.renderOptions);
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
var e6 = (t5) => (...e9) => ({ _$litDirective$: t5, values: e9 });
var i5 = class {
  constructor(t5) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t5, e9, i6) {
    this._$Ct = t5, this._$AM = e9, this._$Ci = i6;
  }
  _$AS(t5, e9) {
    return this.update(t5, e9);
  }
  update(t5, e9) {
    return this.render(...e9);
  }
};

// node_modules/lit-html/directives/class-map.js
var e7 = e6(class extends i5 {
  constructor(t5) {
    if (super(t5), t5.type !== t4.ATTRIBUTE || "class" !== t5.name || t5.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t5) {
    return " " + Object.keys(t5).filter((s4) => t5[s4]).join(" ") + " ";
  }
  update(s4, [i6]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter((t5) => "" !== t5)));
      for (const t5 in i6) i6[t5] && !this.nt?.has(t5) && this.st.add(t5);
      return this.render(i6);
    }
    const r6 = s4.element.classList;
    for (const t5 of this.st) t5 in i6 || (r6.remove(t5), this.st.delete(t5));
    for (const t5 in i6) {
      const s5 = !!i6[t5];
      s5 === this.st.has(t5) || this.nt?.has(t5) || (s5 ? (r6.add(t5), this.st.add(t5)) : (r6.remove(t5), this.st.delete(t5)));
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
  var _a;
  if (o6) {
    return base;
  }
  class WithDelegatesAriaElement extends base {
    constructor() {
      super(...arguments);
      this[_a] = /* @__PURE__ */ new Set();
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
  _a = privateIgnoreAttributeChangesFor;
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
    this.showFeaturedOnly = false;
    this.chipVariant = "";
    this.isScrolled = false;
    this.scrollState = "normal";
    this._mobileSearchOpen = false;
    this._scrollEnterThreshold = 64;
    this._scrollExitThreshold = 12;
    this._minScrollableDistance = 96;
    this._returnDuration = 300;
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
        this.scrollState === "returning" ? "var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-8px) scale(0.98))" : "var(--wy-controls-floating-transform, translateX(-50%))"
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
          <div class="chips-track" role="tablist">
            <button
              class="chip chip--featured ${this.showFeaturedOnly ? "active" : ""}"
              aria-pressed="${this.showFeaturedOnly}"
              @click="${this._toggleFeatured}"
            >Featured</button>
            <button
              class="chip ${this.activeCategory === "all" && !this.showFeaturedOnly ? "active" : ""}"
              aria-pressed="${this.activeCategory === "all" && !this.showFeaturedOnly}"
              @click="${() => this._setCategory("all")}"
            >All</button>
            ${this.categories.map((cat) => b2`
              <button
                class="chip ${this.activeCategory === cat && !this.showFeaturedOnly ? "active" : ""}"
                aria-pressed="${this.activeCategory === cat && !this.showFeaturedOnly}"
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
    this._notifyChange();
  }
  _toggleFeatured() {
    this.showFeaturedOnly = !this.showFeaturedOnly;
    this._notifyChange();
  }
  _notifyChange() {
    this.dispatchEvent(new CustomEvent("filter-change", {
      detail: {
        search: this.searchValue,
        viewMode: this.viewMode,
        showDetails: this.showDetails,
        category: this.activeCategory,
        showFeaturedOnly: this.showFeaturedOnly
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
  showFeaturedOnly: { type: Boolean, attribute: "show-featured-only" },
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
      --wy-controls-radius: var(--radius-pill, 999px);
    }

    /* Bottom hairline */
    :host::after {
      content: '';
      position: absolute;
      left: var(--s-7, 32px);
      right: var(--s-7, 32px);
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
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      padding: var(--s-2, 8px) var(--s-5, 24px);
      box-shadow: 0 12px 40px rgba(26, 26, 26, 0.08);
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
      opacity: 0;
      transform: var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-8px) scale(0.98));
      box-shadow: none;
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
    }

    .chips-track {
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

    .chips-track::-webkit-scrollbar {
      display: none;
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
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(calc(100% + 32px)) scale(0.96);
      z-index: 3000;
      pointer-events: none;
      transition:
        transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 220ms ease;
      opacity: 0;
    }

    :host([show]) {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    @supports not (backdrop-filter: blur(1px)) {
      .toast-container {
        background: rgba(26, 26, 26, 0.92);
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
      background: rgba(26, 26, 26, 0.62);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      color: rgba(247, 244, 238, 0.96);
      padding: 12px 20px;
      border-radius: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow:
        0 0 0 1px rgba(247, 244, 238, 0.12),
        inset 0 1px 0 rgba(247, 244, 238, 0.08),
        0 4px 16px rgba(0, 0, 0, 0.32),
        0 1px 4px rgba(0, 0, 0, 0.24);
      max-width: calc(100vw - 32px);
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
      font-family: 'Inter', var(--font-body, sans-serif);
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1.4;
      color: rgba(247, 244, 238, 0.96);
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
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
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
      border-radius: 0;
      border: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface-container-lowest);
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--md-sys-color-on-surface);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    ::slotted(input:focus),
    ::slotted(textarea:focus),
    ::slotted(select:focus) {
      outline: none;
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 1px var(--ink);
    }

    ::slotted([aria-invalid="true"]) {
      border-color: var(--err);
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
    return this._getSelectedValue();
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
    const showSelectedValueText = this.showSelectedValueText && this._getSelectedValue();
    return b2`
            ${this.label ? b2`<p class="label">${this.label}</p>` : ""}
            ${this.description ? b2`<p class="description">${this.description}</p>` : ""}
            ${this.variant === "switch" ? b2`
                <div class="switch-row">
                    <span class="switch-indicator ${!this.checked ? "active" : ""}">${this._getDisplayLabel(0)}</span>
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
                    <span class="switch-indicator ${this.checked ? "active" : ""}">${this._getDisplayLabel(1)}</span>
                </div>
            ` : b2`
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
            display: flex;
            align-items: center;
            gap: var(--spacing-md, 16px);
            min-height: 34px;
        }

        .switch-indicator {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.625rem;
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 40%, transparent);
            transition: color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            user-select: none;
        }

        .switch-indicator.active {
            color: var(--md-sys-color-primary, #282828);
        }

        .switch-button {
            position: relative;
            overflow: hidden;
            border: 0;
            padding: 0;
            width: 64px;
            height: 34px;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--wy-option-toggle-off-bg, #E8E4D8);
            cursor: pointer;
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        :host([size='compact']) .switch-button {
            width: 40px;
            height: 22px;
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
            width: 28px;
            height: 28px;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--md-sys-color-primary, #282828);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        :host([size='compact']) .switch-thumb {
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
        }

        .switch-button.checked .switch-thumb {
            transform: translateX(30px);
            background: var(--md-sys-color-surface, #F5F2EA);
        }

        :host([size='compact']) .switch-button.checked .switch-thumb {
            transform: translateX(18px);
        }

        :host([size='compact']) .switch-indicator {
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
                class="upload-zone ${this._isDragging ? "dragging" : ""} ${hasImage ? "has-image" : ""}"
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
            background-color: var(--md-sys-color-error, #FF0101);
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
            background-color: color-mix(in srgb, var(--md-sys-color-error, #FF0101) 90%, black);
        }

        .remove-button .material-symbols-outlined {
            font-size: 18px;
            color: white;
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
            font-family: var(--font-display, 'Playfair Display', serif);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--md-sys-color-text-heading, #121714);
            margin-bottom: var(--spacing-sm, 8px);
            display: block;
        }

        textarea {
            width: 100%;
            box-sizing: border-box;
            padding: var(--spacing-md, 16px);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            background-color: transparent;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface, #121714);
            resize: vertical;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        textarea:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
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
            border: 1px solid color-mix(in srgb, var(--md-sys-color-primary, #282828) 30%, transparent);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variable-chip:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
            border-color: var(--md-sys-color-primary, #282828);
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
    this.variables = this.variables.filter((_2, i6) => i6 !== index);
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
      alert("Cannot delete the last step. Convert to template mode instead.");
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
      alert("Cannot delete the last variation. Prompts must have at least one variation.");
      return;
    }
    const variation = this.variations[index];
    const confirmMessage = `Delete variation "${variation.name || "Unnamed"}"?

This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      const updatedVariations = this.variations.filter((_2, i6) => i6 !== index);
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
        variables: []
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
  _renderVariation(variation, index) {
    const isExpanded = this._expandedIndex === index;
    const isFirst = index === 0;
    const isLast = index === this.variations.length - 1;
    const hasSteps = variation.steps && variation.steps.length > 0;
    const hasTemplate = variation.template || !hasSteps;
    const variationMode = hasSteps ? "multi" : "single";
    const variableNames = (variation.variables || []).map((v2) => v2.name);
    return b2`
            <div class="variation-card ${isExpanded ? "expanded" : ""}">
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
                            <wy-form-field label="Description">
                                <textarea
                                    rows="3"
                                    .value="${variation.description || ""}"
                                    @input="${(e9) => this._handleFieldChange(index, "description", e9.target.value)}"
                                    placeholder="Description shown in variation selector"
                                    @click="${(e9) => e9.stopPropagation()}"
                                ></textarea>
                            </wy-form-field>

                            <div @click="${(e9) => e9.stopPropagation()}">
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
                                <div class="field-group">
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

                                <!-- Template -->
                                <div class="field-group">
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
                                
                                <div class="field-group">
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
            background-color: var(--md-sys-color-surface-container-low, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variation-card.expanded {
            border-color: var(--md-sys-color-primary, #282828);
        }

        .variation-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px);
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
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .variation-badge {
            flex-shrink: 0;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-tertiary, #6E5C4D) 15%, transparent);
            color: var(--md-sys-color-tertiary, #6E5C4D);
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
            padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
        }

        .mode-toggle {
            display: flex;
            gap: var(--spacing-md, 16px);
            padding: var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-tertiary, #6E5C4D) 5%, transparent);
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
            border: 1px dashed var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
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
            background-color: color-mix(in srgb, var(--md-sys-color-tertiary, #6E5C4D) 5%, transparent);
            border-top: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .control-button {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
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
            border-color: var(--md-sys-color-error, #BA1A1A);
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
            border: 2px dashed var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
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
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
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
    this.readonly = false;
    this._editedPrompt = null;
    this._promptMode = "single";
    this._expandedSteps = [];
    this._showGitInfo = false;
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
    }
  }
  _generateSlug(title) {
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
    this.requestUpdate();
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
      return;
    }
    this._editedPrompt = {
      ...this._editedPrompt,
      image: imagePath
    };
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
    if (!e9.detail?.variations) return;
    this._handleFieldChange("variations", e9.detail.variations);
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
    this.requestUpdate();
  }
  _handleStepChange(e9) {
    const { index, step } = e9.detail;
    this._editedPrompt.steps[index] = step;
    this.requestUpdate();
  }
  _handleStepDelete(e9) {
    const { index } = e9.detail;
    if (this._editedPrompt.steps.length === 1) {
      alert("Cannot delete the last step.\n\nConvert to single-step mode instead.");
      return;
    }
    this._editedPrompt.steps.splice(index, 1);
    this._expandedSteps = this._expandedSteps.map((i6) => i6 > index ? i6 - 1 : i6).filter((i6) => i6 < this._editedPrompt.steps.length);
    this.requestUpdate();
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
    this.requestUpdate();
  }
  render() {
    if (!this._editedPrompt) {
      return b2`<div>No prompt loaded</div>`;
    }
    const categoryOptions = this.categories.map((cat) => ({ value: cat, label: cat }));
    const variableNames = (this._editedPrompt.variables || []).map((v2) => v2.name);
    return b2`
            <div class="editor-layout">
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
                    <div class="card">
                        <h2 class="card-title">Basic Information</h2>
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
                    <div class="card">
                        <h2 class="card-title">Visuals & Metadata</h2>
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
                        <wy-image-upload
                            label="Prompt Image"
                            .value="${this._editedPrompt.image || ""}"
                            @change="${this._handleImageChange}"
                            @remove="${this._handleImageRemove}"
                        ></wy-image-upload>
                    </div>

                    <!-- Section 3: Content Structure -->
                    ${this._editedPrompt.variations && this._editedPrompt.variations.length > 0 ? b2`
                        <!-- Variations Mode -->
                        <div class="card">
                            <div class="card-header-with-action">
                                <div>
                                    <h2 class="card-title">Variations</h2>
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
                            <wy-variation-editor
                                .variations="${this._editedPrompt.variations}"
                                @change="${this._handleVariationsChange}"
                                @image-upload="${this._handleVariationImageChange}"
                                @image-remove="${this._handleVariationImageRemove}"
                            ></wy-variation-editor>
                        </div>
                    ` : b2`
                        <!-- Standard Mode (No Variations) -->
                        <div class="card">
                            <div class="card-header-with-action">
                                <h2 class="card-title">Prompt Type</h2>
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
                            <div class="card">
                                <h2 class="card-title">Variables</h2>
                                <wy-variable-editor
                                    .variables="${this._editedPrompt.variables || []}"
                                    @change="${(e9) => this._handleFieldChange("variables", e9.detail.variables)}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Template -->
                            <div class="card">
                                <h2 class="card-title">Template</h2>
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
                            <div class="card">
                                <h2 class="card-title">Steps</h2>
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
                    <div class="card">
                        <h2 class="card-title">Visibility</h2>
                        <wy-option-toggle
                            label="Featured"
                            description="Featured prompts are highlighted and sorted to the top of the library"
                            .options="${["false", "true"]}"
                            .labels="${["Off", "On"]}"
                            .value="${this._editedPrompt.featured ? "true" : "false"}"
                            @change="${(e9) => this._handleFieldChange("featured", e9.detail.checked)}"
                        ></wy-option-toggle>
                        <wy-option-toggle
                            label="Archive Prompt"
                            description="Archived prompts are hidden from the public site but remain editable here"
                            .options="${["false", "true"]}"
                            .labels="${["Off", "On"]}"
                            .value="${this._editedPrompt.archived ? "true" : "false"}"
                            @change="${(e9) => this._handleFieldChange("archived", e9.detail.checked)}"
                        ></wy-option-toggle>
                    </div>
                </div>

                <!-- Right Column: Preview -->
                <div class="editor-preview">
                    <div class="actions">
                        <button class="button button-secondary" @click="${this._handleCancel}">
                            Discard
                        </button>
                        <button class="button button-primary" @click="${this._handleSave}">
                            Save
                        </button>
                    </div>
                    
                    <div class="preview-header">
                        <h3 class="preview-title">Live Preview</h3>
                        <span class="preview-status">Updating</span>
                    </div>
                    <div class="preview-card">
                        ${this._getPreviewImage() ? b2`
                            <img src="${this._getPreviewImage()}" alt="Preview" class="preview-image">
                        ` : this._editedPrompt.icon ? b2`
                            <div class="preview-icon">
                                <span class="material-symbols-outlined">${this._editedPrompt.icon}</span>
                            </div>
                        ` : ""}
                        ${this._editedPrompt.category ? b2`
                            <div class="preview-badge">${this._editedPrompt.category}</div>
                        ` : ""}
                        <h3 class="preview-title-text">${this._editedPrompt.title || "Untitled Prompt"}</h3>
                        <p class="preview-description">${this._editedPrompt.description || "No description provided."}</p>
                        ${this._editedPrompt.instructions ? b2`
                            <p class="preview-description"><strong>Instructions:</strong> ${this._editedPrompt.instructions}</p>
                        ` : ""}
                    </div>
                </div>
            </div>
        `;
  }
};
__publicField(WyPromptEditor, "properties", {
  prompt: { type: Object },
  categories: { type: Array },
  readonly: { type: Boolean },
  _editedPrompt: { type: Object, state: true },
  _promptMode: { type: String, state: true },
  _expandedSteps: { type: Array, state: true },
  _showGitInfo: { type: Boolean, state: true }
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
            grid-template-columns: 58% 42%;
            gap: var(--spacing-2xl, 48px);
        }

        .editor-form {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
            overflow-y: auto;
            height: fit-content;
            padding-right: var(--spacing-sm, 8px);
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
            display: flex;
            gap: var(--spacing-sm, 8px);
            margin: 0 0 var(--spacing-md, 16px) 0;
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

        .editor-preview {
            position: sticky;
            top: var(--spacing-lg, 24px);
            height: fit-content;
        }

        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-title {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .preview-status {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-primary, #282828);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .preview-card {
            background-color: var(--md-sys-color-surface, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--spacing-lg, 24px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .preview-image {
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            border-radius: var(--md-sys-shape-corner-small, 8px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-badge {
            display: inline-block;
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            color: var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            margin-bottom: var(--spacing-sm, 8px);
        }

        .preview-title-text {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0 0 var(--spacing-sm, 8px) 0;
        }

        .preview-description {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin: 0;
        }

        .preview-icon {
            width: 48px;
            height: 48px;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-icon .material-symbols-outlined {
            font-size: 24px;
            color: var(--md-sys-color-primary, #282828);
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
            background: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
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
            border-color: var(--md-sys-color-primary, #282828);
        }

        .button-small {
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            font-size: 0.8125rem;
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            white-space: nowrap;
        }

        @media (max-width: 1200px) {
            .editor-layout {
                grid-template-columns: 1fr;
            }

            .editor-preview {
                position: static;
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
    const variableNames = (this.step.variables || []).map((v2) => v2.name);
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
            background-color: var(--md-sys-color-surface, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .step-card.expanded {
            border-color: var(--md-sys-color-primary, #282828);
        }

        .step-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px);
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
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFFFFF);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .step-title {
            flex: 1;
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.125rem;
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
            padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .step-controls {
            display: flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
            border-top: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .control-button {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
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
            border-color: var(--md-sys-color-error, #BA1A1A);
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
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
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
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
        }

        textarea {
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
        }
    `);
customElements.define("wy-step-editor", WyStepEditor);

// node_modules/lit-html/directives/unsafe-html.js
var e8 = class extends i5 {
  constructor(i6) {
    if (super(i6), this.it = A, i6.type !== t4.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(r6) {
    if (r6 === A || null == r6) return this._t = void 0, this.it = r6;
    if (r6 === E) return r6;
    if ("string" != typeof r6) throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (r6 === this.it) return this._t;
    this.it = r6;
    const s4 = [r6];
    return s4.raw = s4, this._t = { _$litType$: this.constructor.resultType, strings: s4, values: [] };
  }
};
e8.directiveName = "unsafeHTML", e8.resultType = 1;
var o7 = e6(e8);

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
    this.template = "";
    this.variables = [];
    this.variations = [];
    this.activeVariationIndex = 0;
    this.mode = "locked";
    this.activeTab = "variables";
    this.steps = [];
    this.activeStepIndex = 0;
    this.descriptionExpanded = false;
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
        currentStep.variables.forEach((v2) => {
          newValues[v2.name] = v2.value || "";
        });
        this._values = newValues;
      }
    }
    if (changedProperties.has("variables") && this.variables) {
      const newValues = {};
      this.variables.forEach((v2) => {
        newValues[v2.name] = v2.value || "";
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
  // Render description as lightweight markdown (ordered/unordered lists, bold)
  _renderDescriptionMarkdown(text) {
    if (!text) return "";
    const escapeHTML = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const processInline = (str) => escapeHTML(str).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (!/^(\d+\.|-|\*) /m.test(text)) return processInline(text);
    const lines = text.split("\n");
    const parts = [];
    let listItems = null;
    let listType = null;
    const flushList = () => {
      if (listItems) {
        parts.push(`<${listType}>${listItems.join("")}</${listType}>`);
        listItems = null;
        listType = null;
      }
    };
    lines.forEach((line) => {
      const trimmed = line.trim();
      const ol = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (ol) {
        if (listType === "ul") flushList();
        if (!listItems) {
          listItems = [];
          listType = "ol";
        }
        listItems.push(`<li>${processInline(ol[2])}</li>`);
        return;
      }
      const ul = trimmed.match(/^[-*]\s+(.+)/);
      if (ul) {
        if (listType === "ol") flushList();
        if (!listItems) {
          listItems = [];
          listType = "ul";
        }
        listItems.push(`<li>${processInline(ul[1])}</li>`);
        return;
      }
      flushList();
      if (trimmed) parts.push(processInline(trimmed));
    });
    flushList();
    return parts.join("");
  }
  _renderPromptIntro() {
    return b2`
      <div class="title-group">
          <h2 @click="${this._toggleDescription}">${this.title}</h2>
          <div class="description-text ${this.descriptionExpanded ? "expanded" : ""}">${o7(this._renderDescriptionMarkdown(this.description))}</div>
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
    return b2`
      ${this._renderStepper()}
      
      <!-- Add tabs for Variables/Preview -->
      ${step.variables && step.variables.length > 0 ? b2`
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
            Preview
          </button>
        </div>
      ` : ""}
      
      <wy-info-panel 
        class="step-instructions"
        variant="compact"
        heading="${step.name}">
        ${step.instructions}
      </wy-info-panel>
      
      <!-- Conditionally render variables or preview based on active tab -->
      ${this.activeTab === "variables" ? b2`
        <div class="variables-grid">
          ${step.variables.map((v2) => this._renderVariable(v2))}
        </div>
      ` : b2`
        <div class="preview-area">${compiledPrompt}</div>
      `}
    `;
  }
  render() {
    const currentTemplate = this.variations.length > 0 ? this.variations[this.activeVariationIndex].template : this.template;
    const compiledPrompt = this._compilePrompt(currentTemplate);
    const activeVariation = this.variations[this.activeVariationIndex];
    return b2`
      <div class="scrim" @click="${this._close}"></div>
      <div class="modal-container">
        
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
            
            ${!(this.steps && this.steps.length > 0) ? b2`
              <div class="header-main">
                  ${this._renderPromptIntro()}
                  
                  ${this.mode === "locked" ? b2`` : ""}
              </div>
            ` : ""}
        </header>

        ${this.mode === "locked" && this.variables.length > 0 && !(this.steps && this.steps.length > 0) ? b2`
          <div class="tabs-container">
              <wy-tabs active-tab="${this.activeTab}" @tab-change="${(e9) => this.activeTab = e9.detail.tab}">
                <button class="tab-item ${this.activeTab === "variables" ? "active" : ""}" role="tab" data-tab="variables">Variables</button>
                <button class="tab-item ${this.activeTab === "preview" ? "active" : ""}" role="tab" data-tab="preview">Final Preview</button>
              </wy-tabs>
              ${this.activeTab === "variables" && this._hasValues() ? b2`
                <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
              ` : ""}
          </div>
        ` : ""}

        <div class="content">
          ${this.image ? b2`
            <div class="reference-image">
              <img src="${this.image}" alt="${this.title}">
            </div>
          ` : ""}

          ${this.mode === "locked" ? b2`
            ${this.steps && this.steps.length > 0 ? b2`
              <!-- Multi-step mode -->
              <div class="header-main">
                  ${this._renderPromptIntro()}
              </div>
              <div class="body">
                ${this._renderMultiStepBody()}
              </div>
            ` : b2`
              <!-- Standard mode -->
              ${this.variations.length > 1 ? b2`
                <div class="variation-selector-container">
                  <label class="variation-description-heading" for="variation-select">Style</label>
                  <div class="variation-select-wrap">
                    <select
                      id="variation-select"
                      class="variation-select-native"
                      .value="${activeVariation?.id || ""}"
                      @change="${this._handleVariationSelectChange}"
                    >
                      ${this.variations.map((variation) => b2`
                        <option value="${variation.id}">${variation.name}</option>
                      `)}
                    </select>
                    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                  </div>
                  ${activeVariation?.description ? b2`
                    <wy-info-panel class="variation-description-panel">
                      <p class="variation-description-heading">Variant: ${activeVariation.name}</p>
                      <p class="variation-description-copy">${activeVariation.description}</p>
                    </wy-info-panel>
                  ` : ""}
                </div>
              ` : ""}

              <div class="body">
                ${this.activeTab === "variables" && this.variables.length > 0 ? b2`
                  <div class="variables-grid">
                    ${this.variables.map((v2) => this._renderVariable(v2))}
                  </div>
                ` : b2`
                  <div class="preview-area">${compiledPrompt}</div>
                `}
              </div>
            `}
          ` : b2`
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
  _renderVariable(v2) {
    const inputType = v2.inputType || v2.type || "text";
    if (inputType === "toggle") {
      const options = Array.isArray(v2.options) && v2.options.length >= 2 ? [v2.options[0], v2.options[1]] : ["", "true"];
      const labels = Array.isArray(v2.labels) && v2.labels.length >= 2 ? [v2.labels[0], v2.labels[1]] : null;
      const valueDescriptions = Array.isArray(v2.optionDescriptions) && v2.optionDescriptions.length >= 2 ? [v2.optionDescriptions[0], v2.optionDescriptions[1]] : null;
      const size = v2.size || "default";
      const currentValue = this._values[v2.name];
      const toggleValue = currentValue !== void 0 && currentValue !== null ? currentValue : options[0];
      return b2`
        <div class="form-group">
          <wy-option-toggle
            .label="${v2.label || ""}"
            .options="${options}"
            .labels="${labels}"
            .valueDescriptions="${valueDescriptions}"
            .value="${toggleValue}"
            size="${size}"
            variant="switch"
            show-selected-value-text
            @change="${(e9) => this._handleInput(v2.name, e9.detail.value)}"
          ></wy-option-toggle>
        </div>
      `;
    }
    if (inputType === "textarea") {
      return b2`
        <div class="form-group">
          <label>${v2.label}</label>
          <textarea
            placeholder="${v2.placeholder || ""}"
            @input="${(e9) => this._handleInput(v2.name, e9.target.value)}"
            .value="${this._values[v2.name] || ""}"
            rows="4"
          ></textarea>
          <span class="helper-text">Markdown supported</span>
        </div>
      `;
    }
    return b2`
      <div class="form-group">
        <label>${v2.label}</label>
        <input
          type="text"
          placeholder="${v2.placeholder || ""}"
          @input="${(e9) => this._handleInput(v2.name, e9.target.value)}"
          .value="${this._values[v2.name] || ""}"
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
    return Object.values(this._values).some((v2) => v2 && v2.length > 0);
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
    const index = this.variations.findIndex((v2) => v2.id === selectedId);
    if (index !== -1) {
      this.activeVariationIndex = index;
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
};
__publicField(WyPromptModal, "properties", {
  open: { type: Boolean, reflect: true },
  title: { type: String },
  category: { type: String },
  description: { type: String },
  instructions: { type: String },
  image: { type: String },
  template: { type: String },
  variables: { type: Array },
  variations: { type: Array },
  activeVariationIndex: { type: Number, attribute: "active-variation-index" },
  mode: { type: String },
  // 'locked' or 'edit'
  activeTab: { type: String },
  // 'variables' or 'preview'
  steps: { type: Array },
  // Array of step objects for multi-step prompts
  activeStepIndex: { type: Number, attribute: "active-step-index" },
  // Current step (0-based)
  descriptionExpanded: { type: Boolean, attribute: "description-expanded" }
  // Mobile description toggle
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

    :host([open]) .modal-container {
      transform: translate(-50%, -50%) scale(1);
    }

    /* HEADER STYLES */
    .header {
      padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) 0;
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
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        display: flex;
        align-items: center;
        gap: var(--spacing-xl, 32px);
        flex-shrink: 0; /* Tabs stay fixed, don't shrink */
    }

    .reference-image {
        margin: var(--spacing-lg, 24px) var(--spacing-xl, 32px) 0;
        flex-shrink: 0;
    }

    .reference-image img {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border: 1px solid var(--paper-edge, #DDD6C8);
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
        padding: var(--spacing-md, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
        background-color: var(--md-sys-color-surface-container-low);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--md-sys-shape-corner-medium, 0);
    }

    .variation-selector-container wy-dropdown {
        width: 100%;
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

    .variation-description-panel {
        margin-top: 0;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
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
        font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
    }

    .prompt-instructions-copy {
        margin: 0;
    }

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
        font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
    }

    .variation-description-copy {
        margin: 0;
    }

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
      white-space: pre-wrap;
      border: 1px solid var(--md-sys-color-outline-variant);
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
      .header { padding: var(--spacing-lg, 24px) var(--spacing-md, 16px) var(--spacing-md, 16px); }
      .header-top { align-items: flex-start; }
      .header-main { flex-direction: column; align-items: flex-start; gap: var(--spacing-sm, 8px); margin-bottom: var(--spacing-sm, 8px); }
      .header-actions-left { flex-wrap: wrap; }
      .labeled-btn { min-width: 0; }
      .labeled-btn.primary { padding-right: 12px; }
      .title-group h2 { font-size: 1.75rem; }
      .tabs-container { padding: 0; } /* wy-tabs handles its own mobile padding */
      .reference-image { margin: 0 var(--spacing-md, 16px) var(--spacing-sm, 8px); }
      .reference-image img { aspect-ratio: 4 / 3; max-height: 260px; }
      .variation-selector-container {
        margin: var(--spacing-sm, 8px) var(--spacing-md, 16px) 0;
        padding: var(--spacing-sm, 12px);
        gap: var(--spacing-sm, 8px);
      }
      .variation-description-heading {
        font-size: 0.6875rem;
      }
      .body { padding: var(--spacing-md, 16px); }
      
      /* Tighter button spacing on mobile */
      .header-actions-left {
        gap: 4px;
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
              ${!this.links || this.links.length === 0 ? b2`<p style="color: var(--md-sys-color-on-surface-variant); text-align: center; padding: 2rem;">No links available.</p>` : this.links.map((category) => b2`
                  <section class="section">
                    <h2 class="section-header">${category.category}</h2>
                    <div class="chips-container">
                      ${category.links && category.links.length > 0 ? category.links.map((link) => b2`
                          <button
                            class="link-chip"
                            @click="${(e9) => this._handleLinkClick(e9, link)}"
                            aria-label="Open ${link.name}"
                          >
                            ${link.name}
                          </button>
                        `) : ""}
                    </div>
                  </section>
                `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  _handleOverlayClick(e9) {
    if (e9.target === e9.currentTarget) {
      this._handleClose();
    }
  }
  _handleContainerClick(e9) {
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
  links: { type: Array }
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
*/
