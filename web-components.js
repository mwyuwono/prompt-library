function s(i, e, t, o) {
  var r = arguments.length, a = r < 3 ? e : o === null ? o = Object.getOwnPropertyDescriptor(e, t) : o, n;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(i, e, t, o);
  else for (var c = i.length - 1; c >= 0; c--) (n = i[c]) && (a = (r < 3 ? n(a) : r > 3 ? n(e, t, a) : n(e, t)) || a);
  return r > 3 && a && Object.defineProperty(e, t, a), a;
}
const _ = (i) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(i, e);
  }) : customElements.define(i, e);
};
const Ye = globalThis, Yt = Ye.ShadowRoot && (Ye.ShadyCSS === void 0 || Ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Gt = /* @__PURE__ */ Symbol(), fo = /* @__PURE__ */ new WeakMap();
let Bo = class {
  constructor(e, t, o) {
    if (this._$cssResult$ = !0, o !== Gt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Yt && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (e = fo.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && fo.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const wi = (i) => new Bo(typeof i == "string" ? i : i + "", void 0, Gt), m = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((o, r, a) => o + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[a + 1], i[0]);
  return new Bo(t, i, Gt);
}, ki = (i, e) => {
  if (Yt) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const o = document.createElement("style"), r = Ye.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = t.cssText, i.appendChild(o);
  }
}, go = Yt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const o of e.cssRules) t += o.cssText;
  return wi(t);
})(i) : i;
const { is: Ci, defineProperty: $i, getOwnPropertyDescriptor: Ei, getOwnPropertyNames: Si, getOwnPropertySymbols: Ti, getPrototypeOf: zi } = Object, Je = globalThis, bo = Je.trustedTypes, Ai = bo ? bo.emptyScript : "", Ii = Je.reactiveElementPolyfillSupport, ke = (i, e) => i, Xe = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? Ai : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, Xt = (i, e) => !Ci(i, e), yo = { attribute: !0, type: String, converter: Xe, reflect: !1, useDefault: !1, hasChanged: Xt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Je.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ve = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = yo) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const o = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, o, t);
      r !== void 0 && $i(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: r, set: a } = Ei(this.prototype, e) ?? { get() {
      return this[t];
    }, set(n) {
      this[t] = n;
    } };
    return { get: r, set(n) {
      const c = r?.call(this);
      a?.call(this, n), this.requestUpdate(e, c, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? yo;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ke("elementProperties"))) return;
    const e = zi(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ke("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ke("properties"))) {
      const t = this.properties, o = [...Si(t), ...Ti(t)];
      for (const r of o) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [o, r] of t) this.elementProperties.set(o, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, o] of this.elementProperties) {
      const r = this._$Eu(t, o);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const o = new Set(e.flat(1 / 0).reverse());
      for (const r of o) t.unshift(go(r));
    } else e !== void 0 && t.push(go(e));
    return t;
  }
  static _$Eu(e, t) {
    const o = t.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const o of t.keys()) this.hasOwnProperty(o) && (e.set(o, this[o]), delete this[o]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ki(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, o) {
    this._$AK(e, o);
  }
  _$ET(e, t) {
    const o = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, o);
    if (r !== void 0 && o.reflect === !0) {
      const a = (o.converter?.toAttribute !== void 0 ? o.converter : Xe).toAttribute(t, o.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const o = this.constructor, r = o._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = o.getPropertyOptions(r), n = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : Xe;
      this._$Em = r;
      const c = n.fromAttribute(t, a.type);
      this[r] = c ?? this._$Ej?.get(r) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, o, r = !1, a) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (a = this[e]), o ??= n.getPropertyOptions(e), !((o.hasChanged ?? Xt)(a, t) || o.useDefault && o.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, o)))) return;
      this.C(e, t, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: o, reflect: r, wrapped: a }, n) {
    o && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? t ?? this[e]), a !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || o || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, a] of this._$Ep) this[r] = a;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [r, a] of o) {
        const { wrapped: n } = a, c = this[r];
        n !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, a, c);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((o) => o.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (o) {
      throw e = !1, this._$EM(), o;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
ve.elementStyles = [], ve.shadowRootOptions = { mode: "open" }, ve[ke("elementProperties")] = /* @__PURE__ */ new Map(), ve[ke("finalized")] = /* @__PURE__ */ new Map(), Ii?.({ ReactiveElement: ve }), (Je.reactiveElementVersions ??= []).push("2.1.2");
const Di = { attribute: !0, type: String, converter: Xe, reflect: !1, hasChanged: Xt }, Oi = (i = Di, e, t) => {
  const { kind: o, metadata: r } = t;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), o === "setter" && ((i = Object.create(i)).wrapped = !0), a.set(t.name, i), o === "accessor") {
    const { name: n } = t;
    return { set(c) {
      const p = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(n, p, i, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(n, void 0, i, c), c;
    } };
  }
  if (o === "setter") {
    const { name: n } = t;
    return function(c) {
      const p = this[n];
      e.call(this, c), this.requestUpdate(n, p, i, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + o);
};
function d(i) {
  return (e, t) => typeof t == "object" ? Oi(i, e, t) : ((o, r, a) => {
    const n = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, o), n ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(i, e, t);
}
function z(i) {
  return d({ ...i, state: !0, attribute: !1 });
}
const et = (i, e, t) => (t.configurable = !0, t.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(i, e, t), t);
function w(i, e) {
  return (t, o, r) => {
    const a = (n) => n.renderRoot?.querySelector(i) ?? null;
    return et(t, o, { get() {
      return a(this);
    } });
  };
}
let Ri;
function Pi(i) {
  return (e, t) => et(e, t, { get() {
    return (this.renderRoot ?? (Ri ??= document.createDocumentFragment())).querySelectorAll(i);
  } });
}
function K(i) {
  return (e, t) => {
    const { slot: o, selector: r } = i ?? {}, a = "slot" + (o ? `[name=${o}]` : ":not([name])");
    return et(e, t, { get() {
      const n = this.renderRoot?.querySelector(a), c = n?.assignedElements(i) ?? [];
      return r === void 0 ? c : c.filter((p) => p.matches(r));
    } });
  };
}
function No(i) {
  return (e, t) => {
    const { slot: o } = i ?? {}, r = "slot" + (o ? `[name=${o}]` : ":not([name])");
    return et(e, t, { get() {
      return this.renderRoot?.querySelector(r)?.assignedNodes(i) ?? [];
    } });
  };
}
const Zt = globalThis, xo = (i) => i, Ze = Zt.trustedTypes, _o = Ze ? Ze.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Vo = "$lit$", ie = `lit$${Math.random().toFixed(9).slice(2)}$`, Uo = "?" + ie, Mi = `<${Uo}>`, ce = document, $e = () => ce.createComment(""), Ee = (i) => i === null || typeof i != "object" && typeof i != "function", Qt = Array.isArray, Fi = (i) => Qt(i) || typeof i?.[Symbol.iterator] == "function", at = `[ 	
\f\r]`, _e = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, wo = /-->/g, ko = />/g, le = RegExp(`>|${at}(?:([^\\s"'>=/]+)(${at}*=${at}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Co = /'/g, $o = /"/g, qo = /^(?:script|style|textarea|title)$/i, Li = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), l = Li(1), q = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), Eo = /* @__PURE__ */ new WeakMap(), de = ce.createTreeWalker(ce, 129);
function Ho(i, e) {
  if (!Qt(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _o !== void 0 ? _o.createHTML(e) : e;
}
const Bi = (i, e) => {
  const t = i.length - 1, o = [];
  let r, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = _e;
  for (let c = 0; c < t; c++) {
    const p = i[c];
    let f, u, v = -1, b = 0;
    for (; b < p.length && (n.lastIndex = b, u = n.exec(p), u !== null); ) b = n.lastIndex, n === _e ? u[1] === "!--" ? n = wo : u[1] !== void 0 ? n = ko : u[2] !== void 0 ? (qo.test(u[2]) && (r = RegExp("</" + u[2], "g")), n = le) : u[3] !== void 0 && (n = le) : n === le ? u[0] === ">" ? (n = r ?? _e, v = -1) : u[1] === void 0 ? v = -2 : (v = n.lastIndex - u[2].length, f = u[1], n = u[3] === void 0 ? le : u[3] === '"' ? $o : Co) : n === $o || n === Co ? n = le : n === wo || n === ko ? n = _e : (n = le, r = void 0);
    const x = n === le && i[c + 1].startsWith("/>") ? " " : "";
    a += n === _e ? p + Mi : v >= 0 ? (o.push(f), p.slice(0, v) + Vo + p.slice(v) + ie + x) : p + ie + (v === -2 ? c : x);
  }
  return [Ho(i, a + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
class Se {
  constructor({ strings: e, _$litType$: t }, o) {
    let r;
    this.parts = [];
    let a = 0, n = 0;
    const c = e.length - 1, p = this.parts, [f, u] = Bi(e, t);
    if (this.el = Se.createElement(f, o), de.currentNode = this.el.content, t === 2 || t === 3) {
      const v = this.el.content.firstChild;
      v.replaceWith(...v.childNodes);
    }
    for (; (r = de.nextNode()) !== null && p.length < c; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const v of r.getAttributeNames()) if (v.endsWith(Vo)) {
          const b = u[n++], x = r.getAttribute(v).split(ie), E = /([.?@])?(.*)/.exec(b);
          p.push({ type: 1, index: a, name: E[2], strings: x, ctor: E[1] === "." ? Vi : E[1] === "?" ? Ui : E[1] === "@" ? qi : tt }), r.removeAttribute(v);
        } else v.startsWith(ie) && (p.push({ type: 6, index: a }), r.removeAttribute(v));
        if (qo.test(r.tagName)) {
          const v = r.textContent.split(ie), b = v.length - 1;
          if (b > 0) {
            r.textContent = Ze ? Ze.emptyScript : "";
            for (let x = 0; x < b; x++) r.append(v[x], $e()), de.nextNode(), p.push({ type: 2, index: ++a });
            r.append(v[b], $e());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Uo) p.push({ type: 2, index: a });
      else {
        let v = -1;
        for (; (v = r.data.indexOf(ie, v + 1)) !== -1; ) p.push({ type: 7, index: a }), v += ie.length - 1;
      }
      a++;
    }
  }
  static createElement(e, t) {
    const o = ce.createElement("template");
    return o.innerHTML = e, o;
  }
}
function ge(i, e, t = i, o) {
  if (e === q) return e;
  let r = o !== void 0 ? t._$Co?.[o] : t._$Cl;
  const a = Ee(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(i), r._$AT(i, t, o)), o !== void 0 ? (t._$Co ??= [])[o] = r : t._$Cl = r), r !== void 0 && (e = ge(i, r._$AS(i, e.values), r, o)), e;
}
class Ni {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: o } = this._$AD, r = (e?.creationScope ?? ce).importNode(t, !0);
    de.currentNode = r;
    let a = de.nextNode(), n = 0, c = 0, p = o[0];
    for (; p !== void 0; ) {
      if (n === p.index) {
        let f;
        p.type === 2 ? f = new Ae(a, a.nextSibling, this, e) : p.type === 1 ? f = new p.ctor(a, p.name, p.strings, this, e) : p.type === 6 && (f = new Hi(a, this, e)), this._$AV.push(f), p = o[++c];
      }
      n !== p?.index && (a = de.nextNode(), n++);
    }
    return de.currentNode = ce, r;
  }
  p(e) {
    let t = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(e, o, t), t += o.strings.length - 2) : o._$AI(e[t])), t++;
  }
}
class Ae {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, o, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = o, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = ge(this, e, t), Ee(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== q && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Fi(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && Ee(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ce.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: o } = e, r = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = Se.createElement(Ho(o.h, o.h[0]), this.options)), o);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const a = new Ni(r, this), n = a.u(this.options);
      a.p(t), this.T(n), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = Eo.get(e.strings);
    return t === void 0 && Eo.set(e.strings, t = new Se(e)), t;
  }
  k(e) {
    Qt(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let o, r = 0;
    for (const a of e) r === t.length ? t.push(o = new Ae(this.O($e()), this.O($e()), this, this.options)) : o = t[r], o._$AI(a), r++;
    r < t.length && (this._$AR(o && o._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const o = xo(e).nextSibling;
      xo(e).remove(), e = o;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class tt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, o, r, a) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = a, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = h;
  }
  _$AI(e, t = this, o, r) {
    const a = this.strings;
    let n = !1;
    if (a === void 0) e = ge(this, e, t, 0), n = !Ee(e) || e !== this._$AH && e !== q, n && (this._$AH = e);
    else {
      const c = e;
      let p, f;
      for (e = a[0], p = 0; p < a.length - 1; p++) f = ge(this, c[o + p], t, p), f === q && (f = this._$AH[p]), n ||= !Ee(f) || f !== this._$AH[p], f === h ? e = h : e !== h && (e += (f ?? "") + a[p + 1]), this._$AH[p] = f;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Vi extends tt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class Ui extends tt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class qi extends tt {
  constructor(e, t, o, r, a) {
    super(e, t, o, r, a), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = ge(this, e, t, 0) ?? h) === q) return;
    const o = this._$AH, r = e === h && o !== h || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, a = e !== h && (o === h || r);
    r && this.element.removeEventListener(this.name, this, o), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Hi {
  constructor(e, t, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ge(this, e);
  }
}
const Wi = Zt.litHtmlPolyfillSupport;
Wi?.(Se, Ae), (Zt.litHtmlVersions ??= []).push("3.3.2");
const Jt = (i, e, t) => {
  const o = t?.renderBefore ?? e;
  let r = o._$litPart$;
  if (r === void 0) {
    const a = t?.renderBefore ?? null;
    o._$litPart$ = r = new Ae(e.insertBefore($e(), a), a, void 0, t ?? {});
  }
  return r._$AI(i), r;
};
const eo = globalThis;
let g = class extends ve {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Jt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return q;
  }
};
g._$litElement$ = !0, g.finalized = !0, eo.litElementHydrateSupport?.({ LitElement: g });
const ji = eo.litElementPolyfillSupport;
ji?.({ LitElement: g });
(eo.litElementVersions ??= []).push("4.2.2");
class Ki extends g {
  render() {
    return l`<slot></slot>`;
  }
  connectedCallback() {
    if (super.connectedCallback(), this.getAttribute("aria-hidden") === "false") {
      this.removeAttribute("aria-hidden");
      return;
    }
    this.setAttribute("aria-hidden", "true");
  }
}
const Yi = m`:host{font-size:var(--md-icon-size, 24px);width:var(--md-icon-size, 24px);height:var(--md-icon-size, 24px);color:inherit;font-variation-settings:inherit;font-weight:400;font-family:var(--md-icon-font, Material Symbols Outlined);display:inline-flex;font-style:normal;place-items:center;place-content:center;line-height:1;overflow:hidden;letter-spacing:normal;text-transform:none;user-select:none;white-space:nowrap;word-wrap:normal;flex-shrink:0;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale}::slotted(svg){fill:currentColor}::slotted(*){height:100%;width:100%}
`;
let pt = class extends Ki {
};
pt.styles = [Yi];
pt = s([
  _("md-icon")
], pt);
const Wo = /* @__PURE__ */ Symbol("attachableController");
let jo;
jo = new MutationObserver((i) => {
  for (const e of i)
    e.target[Wo]?.hostConnected();
});
class Ko {
  get htmlFor() {
    return this.host.getAttribute("for");
  }
  set htmlFor(e) {
    e === null ? this.host.removeAttribute("for") : this.host.setAttribute("for", e);
  }
  get control() {
    return this.host.hasAttribute("for") ? !this.htmlFor || !this.host.isConnected ? null : this.host.getRootNode().querySelector(`#${this.htmlFor}`) : this.currentControl || this.host.parentElement;
  }
  set control(e) {
    e ? this.attach(e) : this.detach();
  }
  /**
   * Creates a new controller for an `Attachable` element.
   *
   * @param host The `Attachable` element.
   * @param onControlChange A callback with two parameters for the previous and
   *     next control. An `Attachable` element may perform setup or teardown
   *     logic whenever the control changes.
   */
  constructor(e, t) {
    this.host = e, this.onControlChange = t, this.currentControl = null, e.addController(this), e[Wo] = this, jo?.observe(e, { attributeFilter: ["for"] });
  }
  attach(e) {
    e !== this.currentControl && (this.setCurrentControl(e), this.host.removeAttribute("for"));
  }
  detach() {
    this.setCurrentControl(null), this.host.setAttribute("for", "");
  }
  /** @private */
  hostConnected() {
    this.setCurrentControl(this.control);
  }
  /** @private */
  hostDisconnected() {
    this.setCurrentControl(null);
  }
  setCurrentControl(e) {
    this.onControlChange(this.currentControl, e), this.currentControl = e;
  }
}
const Gi = ["focusin", "focusout", "pointerdown"];
class to extends g {
  constructor() {
    super(...arguments), this.visible = !1, this.inward = !1, this.attachableController = new Ko(this, this.onControlChange.bind(this));
  }
  get htmlFor() {
    return this.attachableController.htmlFor;
  }
  set htmlFor(e) {
    this.attachableController.htmlFor = e;
  }
  get control() {
    return this.attachableController.control;
  }
  set control(e) {
    this.attachableController.control = e;
  }
  attach(e) {
    this.attachableController.attach(e);
  }
  detach() {
    this.attachableController.detach();
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  /** @private */
  handleEvent(e) {
    if (!e[So]) {
      switch (e.type) {
        default:
          return;
        case "focusin":
          this.visible = this.control?.matches(":focus-visible") ?? !1;
          break;
        case "focusout":
        case "pointerdown":
          this.visible = !1;
          break;
      }
      e[So] = !0;
    }
  }
  onControlChange(e, t) {
    for (const o of Gi)
      e?.removeEventListener(o, this), t?.addEventListener(o, this);
  }
  update(e) {
    e.has("visible") && this.dispatchEvent(new Event("visibility-changed")), super.update(e);
  }
}
s([
  d({ type: Boolean, reflect: !0 })
], to.prototype, "visible", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], to.prototype, "inward", void 0);
const So = /* @__PURE__ */ Symbol("handledByFocusRing");
const Xi = m`:host{animation-delay:0s,calc(var(--md-focus-ring-duration, 600ms)*.25);animation-duration:calc(var(--md-focus-ring-duration, 600ms)*.25),calc(var(--md-focus-ring-duration, 600ms)*.75);animation-timing-function:cubic-bezier(0.2, 0, 0, 1);box-sizing:border-box;color:var(--md-focus-ring-color, var(--md-sys-color-secondary, #625b71));display:none;pointer-events:none;position:absolute}:host([visible]){display:flex}:host(:not([inward])){animation-name:outward-grow,outward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));inset:calc(-1*var(--md-focus-ring-outward-offset, 2px));outline:var(--md-focus-ring-width, 3px) solid currentColor}:host([inward]){animation-name:inward-grow,inward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border:var(--md-focus-ring-width, 3px) solid currentColor;inset:var(--md-focus-ring-inward-offset, 0px)}@keyframes outward-grow{from{outline-width:0}to{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes outward-shrink{from{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-grow{from{border-width:0}to{border-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-shrink{from{border-width:var(--md-focus-ring-active-width, 8px)}}@media(prefers-reduced-motion){:host{animation:none}}
`;
let ht = class extends to {
};
ht.styles = [Xi];
ht = s([
  _("md-focus-ring")
], ht);
const oe = { ATTRIBUTE: 1, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4 }, oo = (i) => (...e) => ({ _$litDirective$: i, values: e });
let io = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, o) {
    this._$Ct = e, this._$AM = t, this._$Ci = o;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
};
const V = oo(class extends io {
  constructor(i) {
    if (super(i), i.type !== oe.ATTRIBUTE || i.name !== "class" || i.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return " " + Object.keys(i).filter((e) => i[e]).join(" ") + " ";
  }
  update(i, [e]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), i.strings !== void 0 && (this.nt = new Set(i.strings.join(" ").split(/\s/).filter((o) => o !== "")));
      for (const o in e) e[o] && !this.nt?.has(o) && this.st.add(o);
      return this.render(e);
    }
    const t = i.element.classList;
    for (const o of this.st) o in e || (t.remove(o), this.st.delete(o));
    for (const o in e) {
      const r = !!e[o];
      r === this.st.has(o) || this.nt?.has(o) || (r ? (t.add(o), this.st.add(o)) : (t.remove(o), this.st.delete(o)));
    }
    return q;
  }
});
const j = {
  STANDARD: "cubic-bezier(0.2, 0, 0, 1)",
  EMPHASIZED: "cubic-bezier(.3,0,0,1)",
  EMPHASIZED_ACCELERATE: "cubic-bezier(.3,0,.8,.15)"
};
function Zi() {
  let i = null;
  return {
    start() {
      return i?.abort(), i = new AbortController(), i.signal;
    },
    finish() {
      i = null;
    }
  };
}
const Qi = 450, To = 225, Ji = 0.2, er = 10, tr = 75, or = 0.35, ir = "::after", rr = "forwards";
var B;
(function(i) {
  i[i.INACTIVE = 0] = "INACTIVE", i[i.TOUCH_DELAY = 1] = "TOUCH_DELAY", i[i.HOLDING = 2] = "HOLDING", i[i.WAITING_FOR_CLICK = 3] = "WAITING_FOR_CLICK";
})(B || (B = {}));
const ar = [
  "click",
  "contextmenu",
  "pointercancel",
  "pointerdown",
  "pointerenter",
  "pointerleave",
  "pointerup"
], sr = 150, nr = window.matchMedia("(forced-colors: active)");
class Ie extends g {
  constructor() {
    super(...arguments), this.disabled = !1, this.hovered = !1, this.pressed = !1, this.rippleSize = "", this.rippleScale = "", this.initialSize = 0, this.state = B.INACTIVE, this.attachableController = new Ko(this, this.onControlChange.bind(this));
  }
  get htmlFor() {
    return this.attachableController.htmlFor;
  }
  set htmlFor(e) {
    this.attachableController.htmlFor = e;
  }
  get control() {
    return this.attachableController.control;
  }
  set control(e) {
    this.attachableController.control = e;
  }
  attach(e) {
    this.attachableController.attach(e);
  }
  detach() {
    this.attachableController.detach();
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  render() {
    const e = {
      hovered: this.hovered,
      pressed: this.pressed
    };
    return l`<div class="surface ${V(e)}"></div>`;
  }
  update(e) {
    e.has("disabled") && this.disabled && (this.hovered = !1, this.pressed = !1), super.update(e);
  }
  /**
   * TODO(b/269799771): make private
   * @private only public for slider
   */
  handlePointerenter(e) {
    this.shouldReactToEvent(e) && (this.hovered = !0);
  }
  /**
   * TODO(b/269799771): make private
   * @private only public for slider
   */
  handlePointerleave(e) {
    this.shouldReactToEvent(e) && (this.hovered = !1, this.state !== B.INACTIVE && this.endPressAnimation());
  }
  handlePointerup(e) {
    if (this.shouldReactToEvent(e)) {
      if (this.state === B.HOLDING) {
        this.state = B.WAITING_FOR_CLICK;
        return;
      }
      if (this.state === B.TOUCH_DELAY) {
        this.state = B.WAITING_FOR_CLICK, this.startPressAnimation(this.rippleStartEvent);
        return;
      }
    }
  }
  async handlePointerdown(e) {
    if (this.shouldReactToEvent(e)) {
      if (this.rippleStartEvent = e, !this.isTouch(e)) {
        this.state = B.WAITING_FOR_CLICK, this.startPressAnimation(e);
        return;
      }
      this.state = B.TOUCH_DELAY, await new Promise((t) => {
        setTimeout(t, sr);
      }), this.state === B.TOUCH_DELAY && (this.state = B.HOLDING, this.startPressAnimation(e));
    }
  }
  handleClick() {
    if (!this.disabled) {
      if (this.state === B.WAITING_FOR_CLICK) {
        this.endPressAnimation();
        return;
      }
      this.state === B.INACTIVE && (this.startPressAnimation(), this.endPressAnimation());
    }
  }
  handlePointercancel(e) {
    this.shouldReactToEvent(e) && this.endPressAnimation();
  }
  handleContextmenu() {
    this.disabled || this.endPressAnimation();
  }
  determineRippleSize() {
    const { height: e, width: t } = this.getBoundingClientRect(), o = Math.max(e, t), r = Math.max(or * o, tr), a = this.currentCSSZoom ?? 1, n = Math.floor(o * Ji / a), p = Math.sqrt(t ** 2 + e ** 2) + er;
    this.initialSize = n;
    const f = (p + r) / n;
    this.rippleScale = `${f / a}`, this.rippleSize = `${n}px`;
  }
  getNormalizedPointerEventCoords(e) {
    const { scrollX: t, scrollY: o } = window, { left: r, top: a } = this.getBoundingClientRect(), n = t + r, c = o + a, { pageX: p, pageY: f } = e, u = this.currentCSSZoom ?? 1;
    return {
      x: (p - n) / u,
      y: (f - c) / u
    };
  }
  getTranslationCoordinates(e) {
    const { height: t, width: o } = this.getBoundingClientRect(), r = this.currentCSSZoom ?? 1, a = {
      x: (o / r - this.initialSize) / 2,
      y: (t / r - this.initialSize) / 2
    };
    let n;
    return e instanceof PointerEvent ? n = this.getNormalizedPointerEventCoords(e) : n = {
      x: o / r / 2,
      y: t / r / 2
    }, n = {
      x: n.x - this.initialSize / 2,
      y: n.y - this.initialSize / 2
    }, { startPoint: n, endPoint: a };
  }
  startPressAnimation(e) {
    if (!this.mdRoot)
      return;
    this.pressed = !0, this.growAnimation?.cancel(), this.determineRippleSize();
    const { startPoint: t, endPoint: o } = this.getTranslationCoordinates(e), r = `${t.x}px, ${t.y}px`, a = `${o.x}px, ${o.y}px`;
    this.growAnimation = this.mdRoot.animate({
      top: [0, 0],
      left: [0, 0],
      height: [this.rippleSize, this.rippleSize],
      width: [this.rippleSize, this.rippleSize],
      transform: [
        `translate(${r}) scale(1)`,
        `translate(${a}) scale(${this.rippleScale})`
      ]
    }, {
      pseudoElement: ir,
      duration: Qi,
      easing: j.STANDARD,
      fill: rr
    });
  }
  async endPressAnimation() {
    this.rippleStartEvent = void 0, this.state = B.INACTIVE;
    const e = this.growAnimation;
    let t = 1 / 0;
    if (typeof e?.currentTime == "number" ? t = e.currentTime : e?.currentTime && (t = e.currentTime.to("ms").value), t >= To) {
      this.pressed = !1;
      return;
    }
    await new Promise((o) => {
      setTimeout(o, To - t);
    }), this.growAnimation === e && (this.pressed = !1);
  }
  /**
   * Returns `true` if
   *  - the ripple element is enabled
   *  - the pointer is primary for the input type
   *  - the pointer is the pointer that started the interaction, or will start
   * the interaction
   *  - the pointer is a touch, or the pointer state has the primary button
   * held, or the pointer is hovering
   */
  shouldReactToEvent(e) {
    if (this.disabled || !e.isPrimary || this.rippleStartEvent && this.rippleStartEvent.pointerId !== e.pointerId)
      return !1;
    if (e.type === "pointerenter" || e.type === "pointerleave")
      return !this.isTouch(e);
    const t = e.buttons === 1;
    return this.isTouch(e) || t;
  }
  isTouch({ pointerType: e }) {
    return e === "touch";
  }
  /** @private */
  async handleEvent(e) {
    if (!nr?.matches)
      switch (e.type) {
        case "click":
          this.handleClick();
          break;
        case "contextmenu":
          this.handleContextmenu();
          break;
        case "pointercancel":
          this.handlePointercancel(e);
          break;
        case "pointerdown":
          await this.handlePointerdown(e);
          break;
        case "pointerenter":
          this.handlePointerenter(e);
          break;
        case "pointerleave":
          this.handlePointerleave(e);
          break;
        case "pointerup":
          this.handlePointerup(e);
          break;
      }
  }
  onControlChange(e, t) {
    for (const o of ar)
      e?.removeEventListener(o, this), t?.addEventListener(o, this);
  }
}
s([
  d({ type: Boolean, reflect: !0 })
], Ie.prototype, "disabled", void 0);
s([
  z()
], Ie.prototype, "hovered", void 0);
s([
  z()
], Ie.prototype, "pressed", void 0);
s([
  w(".surface")
], Ie.prototype, "mdRoot", void 0);
const lr = m`:host{display:flex;margin:auto;pointer-events:none}:host([disabled]){display:none}@media(forced-colors: active){:host{display:none}}:host,.surface{border-radius:inherit;position:absolute;inset:0;overflow:hidden}.surface{-webkit-tap-highlight-color:rgba(0,0,0,0)}.surface::before,.surface::after{content:"";opacity:0;position:absolute}.surface::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));inset:0;transition:opacity 15ms linear,background-color 15ms linear}.surface::after{background:radial-gradient(closest-side, var(--md-ripple-pressed-color, var(--md-sys-color-on-surface, #1d1b20)) max(100% - 70px, 65%), transparent 100%);transform-origin:center center;transition:opacity 375ms linear}.hovered::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-ripple-hover-opacity, 0.08)}.pressed::after{opacity:var(--md-ripple-pressed-opacity, 0.12);transition-duration:105ms}
`;
let ut = class extends Ie {
};
ut.styles = [lr];
ut = s([
  _("md-ripple")
], ut);
const Yo = [
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
], dr = Yo.map(Go);
function st(i) {
  return dr.includes(i);
}
function Go(i) {
  return i.replace("aria", "aria-").replace(/Elements?/g, "").toLowerCase();
}
const Me = /* @__PURE__ */ Symbol("privateIgnoreAttributeChangesFor");
function Q(i) {
  var e;
  class t extends i {
    constructor() {
      super(...arguments), this[e] = /* @__PURE__ */ new Set();
    }
    attributeChangedCallback(r, a, n) {
      if (!st(r)) {
        super.attributeChangedCallback(r, a, n);
        return;
      }
      if (this[Me].has(r))
        return;
      this[Me].add(r), this.removeAttribute(r), this[Me].delete(r);
      const c = vt(r);
      n === null ? delete this.dataset[c] : this.dataset[c] = n, this.requestUpdate(vt(r), a);
    }
    getAttribute(r) {
      return st(r) ? super.getAttribute(mt(r)) : super.getAttribute(r);
    }
    removeAttribute(r) {
      super.removeAttribute(r), st(r) && (super.removeAttribute(mt(r)), this.requestUpdate());
    }
  }
  return e = Me, cr(t), t;
}
function cr(i) {
  for (const e of Yo) {
    const t = Go(e), o = mt(t), r = vt(t);
    i.createProperty(e, {
      attribute: t,
      noAccessor: !0
    }), i.createProperty(Symbol(o), {
      attribute: o,
      noAccessor: !0
    }), Object.defineProperty(i.prototype, e, {
      configurable: !0,
      enumerable: !0,
      get() {
        return this.dataset[r] ?? null;
      },
      set(a) {
        const n = this.dataset[r] ?? null;
        a !== n && (a === null ? delete this.dataset[r] : this.dataset[r] = a, this.requestUpdate(e, n));
      }
    });
  }
}
function mt(i) {
  return `data-${i}`;
}
function vt(i) {
  return i.replace(/-\w/, (e) => e[1].toUpperCase());
}
const Xo = /* @__PURE__ */ Symbol("dispatchHooks");
function pr(i, e) {
  const t = i[Xo];
  if (!t)
    throw new Error(`'${i.type}' event needs setupDispatchHooks().`);
  t.addEventListener("after", e);
}
const zo = /* @__PURE__ */ new WeakMap();
function hr(i, ...e) {
  let t = zo.get(i);
  t || (t = /* @__PURE__ */ new Set(), zo.set(i, t));
  for (const o of e) {
    if (t.has(o))
      continue;
    let r = !1;
    i.addEventListener(o, (a) => {
      if (r)
        return;
      a.stopImmediatePropagation();
      const n = Reflect.construct(a.constructor, [
        a.type,
        a
      ]), c = new EventTarget();
      n[Xo] = c, r = !0;
      const p = i.dispatchEvent(n);
      r = !1, p || a.preventDefault(), c.dispatchEvent(new Event("after"));
    }, {
      // Ensure this listener runs before other listeners.
      // `setupDispatchHooks()` should be called in constructors to also
      // ensure they run before any other externally-added capture listeners.
      capture: !0
    }), t.add(o);
  }
}
function Zo(i) {
  const e = new MouseEvent("click", { bubbles: !0 });
  return i.dispatchEvent(e), e;
}
function Qo(i) {
  return i.currentTarget !== i.target || i.composedPath()[0] !== i.target || i.target.disabled ? !1 : !ur(i);
}
function ur(i) {
  const e = ft;
  return e && (i.preventDefault(), i.stopImmediatePropagation()), mr(), e;
}
let ft = !1;
async function mr() {
  ft = !0, await null, ft = !1;
}
function De(i, e) {
  e.bubbles && (!i.shadowRoot || e.composed) && e.stopPropagation();
  const t = Reflect.construct(e.constructor, [e.type, e]), o = i.dispatchEvent(t);
  return o || e.preventDefault(), o;
}
const N = /* @__PURE__ */ Symbol("internals"), nt = /* @__PURE__ */ Symbol("privateInternals");
function Oe(i) {
  class e extends i {
    get [N]() {
      return this[nt] || (this[nt] = this.attachInternals()), this[nt];
    }
  }
  return e;
}
const Te = /* @__PURE__ */ Symbol("createValidator"), ze = /* @__PURE__ */ Symbol("getValidityAnchor"), lt = /* @__PURE__ */ Symbol("privateValidator"), Z = /* @__PURE__ */ Symbol("privateSyncValidity"), Fe = /* @__PURE__ */ Symbol("privateCustomValidationMessage");
function ro(i) {
  var e;
  class t extends i {
    constructor() {
      super(...arguments), this[e] = "";
    }
    get validity() {
      return this[Z](), this[N].validity;
    }
    get validationMessage() {
      return this[Z](), this[N].validationMessage;
    }
    get willValidate() {
      return this[Z](), this[N].willValidate;
    }
    checkValidity() {
      return this[Z](), this[N].checkValidity();
    }
    reportValidity() {
      return this[Z](), this[N].reportValidity();
    }
    setCustomValidity(r) {
      this[Fe] = r, this[Z]();
    }
    requestUpdate(r, a, n) {
      super.requestUpdate(r, a, n), this[Z]();
    }
    firstUpdated(r) {
      super.firstUpdated(r), this[Z]();
    }
    [(e = Fe, Z)]() {
      this[lt] || (this[lt] = this[Te]());
      const { validity: r, validationMessage: a } = this[lt].getValidity(), n = !!this[Fe], c = this[Fe] || a;
      this[N].setValidity({ ...r, customError: n }, c, this[ze]() ?? void 0);
    }
    [Te]() {
      throw new Error("Implement [createValidator]");
    }
    [ze]() {
      throw new Error("Implement [getValidityAnchor]");
    }
  }
  return t;
}
const fe = /* @__PURE__ */ Symbol("getFormValue"), gt = /* @__PURE__ */ Symbol("getFormState");
function ao(i) {
  class e extends i {
    get form() {
      return this[N].form;
    }
    get labels() {
      return this[N].labels;
    }
    // Use @property for the `name` and `disabled` properties to add them to the
    // `observedAttributes` array and trigger `attributeChangedCallback()`.
    //
    // We don't use Lit's default getter/setter (`noAccessor: true`) because
    // the attributes need to be updated synchronously to work with synchronous
    // form APIs, and Lit updates attributes async by default.
    get name() {
      return this.getAttribute("name") ?? "";
    }
    set name(o) {
      this.setAttribute("name", o);
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(o) {
      this.toggleAttribute("disabled", o);
    }
    attributeChangedCallback(o, r, a) {
      if (o === "name" || o === "disabled") {
        const n = o === "disabled" ? r !== null : r;
        this.requestUpdate(o, n);
        return;
      }
      super.attributeChangedCallback(o, r, a);
    }
    requestUpdate(o, r, a) {
      super.requestUpdate(o, r, a), this[N].setFormValue(this[fe](), this[gt]());
    }
    [fe]() {
      throw new Error("Implement [getFormValue]");
    }
    [gt]() {
      return this[fe]();
    }
    formDisabledCallback(o) {
      this.disabled = o;
    }
  }
  return e.formAssociated = !0, s([
    d({ noAccessor: !0 })
  ], e.prototype, "name", null), s([
    d({ type: Boolean, noAccessor: !0 })
  ], e.prototype, "disabled", null), e;
}
class so {
  /**
   * Creates a new validator.
   *
   * @param getCurrentState A callback that returns the current state of
   *     constraint validation-related properties.
   */
  constructor(e) {
    this.getCurrentState = e, this.currentValidity = {
      validity: {},
      validationMessage: ""
    };
  }
  /**
   * Returns the current `ValidityStateFlags` and validation message for the
   * validator.
   *
   * If the constraint validation state has not changed, this will return a
   * cached result. This is important since `getValidity()` can be called
   * frequently in response to synchronous property changes.
   *
   * @return The current validity and validation message.
   */
  getValidity() {
    const e = this.getCurrentState();
    if (!(!this.prevState || !this.equals(this.prevState, e)))
      return this.currentValidity;
    const { validity: o, validationMessage: r } = this.computeValidity(e);
    return this.prevState = this.copy(e), this.currentValidity = {
      validationMessage: r,
      validity: {
        // Change any `ValidityState` instances into `ValidityStateFlags` since
        // `ValidityState` cannot be easily `{...spread}`.
        badInput: o.badInput,
        customError: o.customError,
        patternMismatch: o.patternMismatch,
        rangeOverflow: o.rangeOverflow,
        rangeUnderflow: o.rangeUnderflow,
        stepMismatch: o.stepMismatch,
        tooLong: o.tooLong,
        tooShort: o.tooShort,
        typeMismatch: o.typeMismatch,
        valueMissing: o.valueMissing
      }
    }, this.currentValidity;
  }
}
class vr extends so {
  computeValidity(e) {
    return this.checkboxControl || (this.checkboxControl = document.createElement("input"), this.checkboxControl.type = "checkbox"), this.checkboxControl.checked = e.checked, this.checkboxControl.required = e.required, {
      validity: this.checkboxControl.validity,
      validationMessage: this.checkboxControl.validationMessage
    };
  }
  equals(e, t) {
    return e.checked === t.checked && e.required === t.required;
  }
  copy({ checked: e, required: t }) {
    return { checked: e, required: t };
  }
}
const fr = Q(ro(ao(Oe(g))));
class ae extends fr {
  constructor() {
    super(), this.selected = !1, this.icons = !1, this.showOnlySelectedIcon = !1, this.required = !1, this.value = "on", this.addEventListener("click", (e) => {
      !Qo(e) || !this.input || (this.focus(), Zo(this.input));
    }), hr(this, "keydown"), this.addEventListener("keydown", (e) => {
      pr(e, () => {
        e.defaultPrevented || e.key !== "Enter" || this.disabled || !this.input || this.input.click();
      });
    });
  }
  render() {
    return l`
      <div class="switch ${V(this.getRenderClasses())}">
        <input
          id="switch"
          class="touch"
          type="checkbox"
          role="switch"
          aria-label=${this.ariaLabel || h}
          ?checked=${this.selected}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @input=${this.handleInput}
          @change=${this.handleChange} />

        <md-focus-ring part="focus-ring" for="switch"></md-focus-ring>
        <span class="track"> ${this.renderHandle()} </span>
      </div>
    `;
  }
  getRenderClasses() {
    return {
      selected: this.selected,
      unselected: !this.selected,
      disabled: this.disabled
    };
  }
  renderHandle() {
    const e = {
      "with-icon": this.showOnlySelectedIcon ? this.selected : this.icons
    };
    return l`
      ${this.renderTouchTarget()}
      <span class="handle-container">
        <md-ripple for="switch" ?disabled="${this.disabled}"></md-ripple>
        <span class="handle ${V(e)}">
          ${this.shouldShowIcons() ? this.renderIcons() : l``}
        </span>
      </span>
    `;
  }
  renderIcons() {
    return l`
      <div class="icons">
        ${this.renderOnIcon()}
        ${this.showOnlySelectedIcon ? l`` : this.renderOffIcon()}
      </div>
    `;
  }
  /**
   * https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Acheck%3AFILL%400%3Bwght%40500%3BGRAD%400%3Bopsz%4024
   */
  renderOnIcon() {
    return l`
      <slot class="icon icon--on" name="on-icon">
        <svg viewBox="0 0 24 24">
          <path
            d="M9.55 18.2 3.65 12.3 5.275 10.675 9.55 14.95 18.725 5.775 20.35 7.4Z" />
        </svg>
      </slot>
    `;
  }
  /**
   * https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Aclose%3AFILL%400%3Bwght%40500%3BGRAD%400%3Bopsz%4024
   */
  renderOffIcon() {
    return l`
      <slot class="icon icon--off" name="off-icon">
        <svg viewBox="0 0 24 24">
          <path
            d="M6.4 19.2 4.8 17.6 10.4 12 4.8 6.4 6.4 4.8 12 10.4 17.6 4.8 19.2 6.4 13.6 12 19.2 17.6 17.6 19.2 12 13.6Z" />
        </svg>
      </slot>
    `;
  }
  renderTouchTarget() {
    return l`<span class="touch"></span>`;
  }
  shouldShowIcons() {
    return this.icons || this.showOnlySelectedIcon;
  }
  handleInput(e) {
    const t = e.target;
    this.selected = t.checked;
  }
  handleChange(e) {
    De(this, e);
  }
  [fe]() {
    return this.selected ? this.value : null;
  }
  [gt]() {
    return String(this.selected);
  }
  formResetCallback() {
    this.selected = this.hasAttribute("selected");
  }
  formStateRestoreCallback(e) {
    this.selected = e === "true";
  }
  [Te]() {
    return new vr(() => ({
      checked: this.selected,
      required: this.required
    }));
  }
  [ze]() {
    return this.input;
  }
}
ae.shadowRootOptions = {
  mode: "open",
  delegatesFocus: !0
};
s([
  d({ type: Boolean })
], ae.prototype, "selected", void 0);
s([
  d({ type: Boolean })
], ae.prototype, "icons", void 0);
s([
  d({ type: Boolean, attribute: "show-only-selected-icon" })
], ae.prototype, "showOnlySelectedIcon", void 0);
s([
  d({ type: Boolean })
], ae.prototype, "required", void 0);
s([
  d()
], ae.prototype, "value", void 0);
s([
  w("input")
], ae.prototype, "input", void 0);
const gr = m`@layer styles, hcm;@layer styles{:host{display:inline-flex;outline:none;vertical-align:top;-webkit-tap-highlight-color:rgba(0,0,0,0);cursor:pointer}:host([disabled]){cursor:default}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--md-switch-track-height, 32px))/2) 0px}md-focus-ring{--md-focus-ring-shape-start-start: var(--md-switch-track-shape-start-start, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)));--md-focus-ring-shape-start-end: var(--md-switch-track-shape-start-end, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)));--md-focus-ring-shape-end-end: var(--md-switch-track-shape-end-end, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)));--md-focus-ring-shape-end-start: var(--md-switch-track-shape-end-start, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)))}.switch{align-items:center;display:inline-flex;flex-shrink:0;position:relative;width:var(--md-switch-track-width, 52px);height:var(--md-switch-track-height, 32px);border-start-start-radius:var(--md-switch-track-shape-start-start, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)));border-start-end-radius:var(--md-switch-track-shape-start-end, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)));border-end-end-radius:var(--md-switch-track-shape-end-end, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)));border-end-start-radius:var(--md-switch-track-shape-end-start, var(--md-switch-track-shape, var(--md-sys-shape-corner-full, 9999px)))}input{appearance:none;height:max(100%,var(--md-switch-touch-target-size, 48px));outline:none;margin:0;position:absolute;width:max(100%,var(--md-switch-touch-target-size, 48px));z-index:1;cursor:inherit;top:50%;left:50%;transform:translate(-50%, -50%)}:host([touch-target=none]) input{display:none}}@layer styles{.track{position:absolute;width:100%;height:100%;box-sizing:border-box;border-radius:inherit;display:flex;justify-content:center;align-items:center}.track::before{content:"";display:flex;position:absolute;height:100%;width:100%;border-radius:inherit;box-sizing:border-box;transition-property:opacity,background-color;transition-timing-function:linear;transition-duration:67ms}.disabled .track{background-color:rgba(0,0,0,0);border-color:rgba(0,0,0,0)}.disabled .track::before,.disabled .track::after{transition:none;opacity:var(--md-switch-disabled-track-opacity, 0.12)}.disabled .track::before{background-clip:content-box}.selected .track::before{background-color:var(--md-switch-selected-track-color, var(--md-sys-color-primary, #6750a4))}.selected:hover .track::before{background-color:var(--md-switch-selected-hover-track-color, var(--md-sys-color-primary, #6750a4))}.selected:focus-within .track::before{background-color:var(--md-switch-selected-focus-track-color, var(--md-sys-color-primary, #6750a4))}.selected:active .track::before{background-color:var(--md-switch-selected-pressed-track-color, var(--md-sys-color-primary, #6750a4))}.selected.disabled .track{background-clip:border-box}.selected.disabled .track::before{background-color:var(--md-switch-disabled-selected-track-color, var(--md-sys-color-on-surface, #1d1b20))}.unselected .track::before{background-color:var(--md-switch-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));border-color:var(--md-switch-track-outline-color, var(--md-sys-color-outline, #79747e));border-style:solid;border-width:var(--md-switch-track-outline-width, 2px)}.unselected:hover .track::before{background-color:var(--md-switch-hover-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));border-color:var(--md-switch-hover-track-outline-color, var(--md-sys-color-outline, #79747e))}.unselected:focus-visible .track::before{background-color:var(--md-switch-focus-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));border-color:var(--md-switch-focus-track-outline-color, var(--md-sys-color-outline, #79747e))}.unselected:active .track::before{background-color:var(--md-switch-pressed-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));border-color:var(--md-switch-pressed-track-outline-color, var(--md-sys-color-outline, #79747e))}.unselected.disabled .track::before{background-color:var(--md-switch-disabled-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));border-color:var(--md-switch-disabled-track-outline-color, var(--md-sys-color-on-surface, #1d1b20))}}@layer hcm{@media(forced-colors: active){.selected .track::before{background:ButtonText;border-color:ButtonText}.disabled .track::before{border-color:GrayText;opacity:1}.disabled.selected .track::before{background:GrayText}}}@layer styles{.handle-container{display:flex;place-content:center;place-items:center;position:relative;transition:margin 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)}.selected .handle-container{margin-inline-start:calc(var(--md-switch-track-width, 52px) - var(--md-switch-track-height, 32px))}.unselected .handle-container{margin-inline-end:calc(var(--md-switch-track-width, 52px) - var(--md-switch-track-height, 32px))}.disabled .handle-container{transition:none}.handle{border-start-start-radius:var(--md-switch-handle-shape-start-start, var(--md-switch-handle-shape, var(--md-sys-shape-corner-full, 9999px)));border-start-end-radius:var(--md-switch-handle-shape-start-end, var(--md-switch-handle-shape, var(--md-sys-shape-corner-full, 9999px)));border-end-end-radius:var(--md-switch-handle-shape-end-end, var(--md-switch-handle-shape, var(--md-sys-shape-corner-full, 9999px)));border-end-start-radius:var(--md-switch-handle-shape-end-start, var(--md-switch-handle-shape, var(--md-sys-shape-corner-full, 9999px)));height:var(--md-switch-handle-height, 16px);width:var(--md-switch-handle-width, 16px);transform-origin:center;transition-property:height,width;transition-duration:250ms,250ms;transition-timing-function:cubic-bezier(0.2, 0, 0, 1),cubic-bezier(0.2, 0, 0, 1);z-index:0}.handle::before{content:"";display:flex;inset:0;position:absolute;border-radius:inherit;box-sizing:border-box;transition:background-color 67ms linear}.disabled .handle,.disabled .handle::before{transition:none}.selected .handle{height:var(--md-switch-selected-handle-height, 24px);width:var(--md-switch-selected-handle-width, 24px)}.handle.with-icon{height:var(--md-switch-with-icon-handle-height, 24px);width:var(--md-switch-with-icon-handle-width, 24px)}.selected:not(.disabled):active .handle,.unselected:not(.disabled):active .handle{height:var(--md-switch-pressed-handle-height, 28px);width:var(--md-switch-pressed-handle-width, 28px);transition-timing-function:linear;transition-duration:100ms}.selected .handle::before{background-color:var(--md-switch-selected-handle-color, var(--md-sys-color-on-primary, #fff))}.selected:hover .handle::before{background-color:var(--md-switch-selected-hover-handle-color, var(--md-sys-color-primary-container, #eaddff))}.selected:focus-within .handle::before{background-color:var(--md-switch-selected-focus-handle-color, var(--md-sys-color-primary-container, #eaddff))}.selected:active .handle::before{background-color:var(--md-switch-selected-pressed-handle-color, var(--md-sys-color-primary-container, #eaddff))}.selected.disabled .handle::before{background-color:var(--md-switch-disabled-selected-handle-color, var(--md-sys-color-surface, #fef7ff));opacity:var(--md-switch-disabled-selected-handle-opacity, 1)}.unselected .handle::before{background-color:var(--md-switch-handle-color, var(--md-sys-color-outline, #79747e))}.unselected:hover .handle::before{background-color:var(--md-switch-hover-handle-color, var(--md-sys-color-on-surface-variant, #49454f))}.unselected:focus-within .handle::before{background-color:var(--md-switch-focus-handle-color, var(--md-sys-color-on-surface-variant, #49454f))}.unselected:active .handle::before{background-color:var(--md-switch-pressed-handle-color, var(--md-sys-color-on-surface-variant, #49454f))}.unselected.disabled .handle::before{background-color:var(--md-switch-disabled-handle-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-switch-disabled-handle-opacity, 0.38)}md-ripple{border-radius:var(--md-switch-state-layer-shape, var(--md-sys-shape-corner-full, 9999px));height:var(--md-switch-state-layer-size, 40px);inset:unset;width:var(--md-switch-state-layer-size, 40px)}.selected md-ripple{--md-ripple-hover-color: var(--md-switch-selected-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--md-ripple-pressed-color: var(--md-switch-selected-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--md-ripple-hover-opacity: var(--md-switch-selected-hover-state-layer-opacity, 0.08);--md-ripple-pressed-opacity: var(--md-switch-selected-pressed-state-layer-opacity, 0.12)}.unselected md-ripple{--md-ripple-hover-color: var(--md-switch-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-pressed-color: var(--md-switch-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-hover-opacity: var(--md-switch-hover-state-layer-opacity, 0.08);--md-ripple-pressed-opacity: var(--md-switch-pressed-state-layer-opacity, 0.12)}}@layer hcm{@media(forced-colors: active){.unselected .handle::before{background:ButtonText}.disabled .handle::before{opacity:1}.disabled.unselected .handle::before{background:GrayText}}}@layer styles{.icons{position:relative;height:100%;width:100%}.icon{position:absolute;inset:0;margin:auto;display:flex;align-items:center;justify-content:center;fill:currentColor;transition:fill 67ms linear,opacity 33ms linear,transform 167ms cubic-bezier(0.2, 0, 0, 1);opacity:0}.disabled .icon{transition:none}.selected .icon--on,.unselected .icon--off{opacity:1}.unselected .handle:not(.with-icon) .icon--on{transform:rotate(-45deg)}.icon--off{width:var(--md-switch-icon-size, 16px);height:var(--md-switch-icon-size, 16px);color:var(--md-switch-icon-color, var(--md-sys-color-surface-container-highest, #e6e0e9))}.unselected:hover .icon--off{color:var(--md-switch-hover-icon-color, var(--md-sys-color-surface-container-highest, #e6e0e9))}.unselected:focus-within .icon--off{color:var(--md-switch-focus-icon-color, var(--md-sys-color-surface-container-highest, #e6e0e9))}.unselected:active .icon--off{color:var(--md-switch-pressed-icon-color, var(--md-sys-color-surface-container-highest, #e6e0e9))}.unselected.disabled .icon--off{color:var(--md-switch-disabled-icon-color, var(--md-sys-color-surface-container-highest, #e6e0e9));opacity:var(--md-switch-disabled-icon-opacity, 0.38)}.icon--on{width:var(--md-switch-selected-icon-size, 16px);height:var(--md-switch-selected-icon-size, 16px);color:var(--md-switch-selected-icon-color, var(--md-sys-color-on-primary-container, #21005d))}.selected:hover .icon--on{color:var(--md-switch-selected-hover-icon-color, var(--md-sys-color-on-primary-container, #21005d))}.selected:focus-within .icon--on{color:var(--md-switch-selected-focus-icon-color, var(--md-sys-color-on-primary-container, #21005d))}.selected:active .icon--on{color:var(--md-switch-selected-pressed-icon-color, var(--md-sys-color-on-primary-container, #21005d))}.selected.disabled .icon--on{color:var(--md-switch-disabled-selected-icon-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-switch-disabled-selected-icon-opacity, 0.38)}}@layer hcm{@media(forced-colors: active){.icon--off{fill:Canvas}.icon--on{fill:ButtonText}.disabled.unselected .icon--off,.disabled.selected .icon--on{opacity:1}.disabled .icon--on{fill:GrayText}}}
`;
let bt = class extends ae {
};
bt.styles = [gr];
bt = s([
  _("md-switch")
], bt);
class br extends g {
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  render() {
    return l`<span class="shadow"></span>`;
  }
}
const yr = m`:host,.shadow,.shadow::before,.shadow::after{border-radius:inherit;inset:0;position:absolute;transition-duration:inherit;transition-property:inherit;transition-timing-function:inherit}:host{display:flex;pointer-events:none;transition-property:box-shadow,opacity}.shadow::before,.shadow::after{content:"";transition-property:box-shadow,opacity;--_level: var(--md-elevation-level, 0);--_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000))}.shadow::before{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 3,1) + 2*clamp(0,var(--_level) - 4,1))) calc(1px*(2*clamp(0,var(--_level),1) + clamp(0,var(--_level) - 2,1) + clamp(0,var(--_level) - 4,1))) 0px var(--_shadow-color);opacity:.3}.shadow::after{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 1,1) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(3*clamp(0,var(--_level),2) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(clamp(0,var(--_level),4) + 2*clamp(0,var(--_level) - 4,1))) var(--_shadow-color);opacity:.15}
`;
let yt = class extends br {
};
yt.styles = [yr];
yt = s([
  _("md-elevation")
], yt);
function Jo(i) {
  i.addInitializer((e) => {
    const t = e;
    t.addEventListener("click", async (o) => {
      const { type: r, [N]: a } = t, { form: n } = a;
      if (!(!n || r === "button") && (await new Promise((c) => {
        setTimeout(c);
      }), !o.defaultPrevented)) {
        if (r === "reset") {
          n.reset();
          return;
        }
        n.addEventListener("submit", (c) => {
          Object.defineProperty(c, "submitter", {
            configurable: !0,
            enumerable: !0,
            get: () => t
          });
        }, { capture: !0, once: !0 }), a.setFormValue(t.value), n.requestSubmit();
      }
    });
  });
}
const xr = Q(Oe(g));
class P extends xr {
  get name() {
    return this.getAttribute("name") ?? "";
  }
  set name(e) {
    this.setAttribute("name", e);
  }
  /**
   * The associated form element with which this element's value will submit.
   */
  get form() {
    return this[N].form;
  }
  constructor() {
    super(), this.disabled = !1, this.softDisabled = !1, this.href = "", this.download = "", this.target = "", this.trailingIcon = !1, this.hasIcon = !1, this.type = "submit", this.value = "", this.addEventListener("click", this.handleClick.bind(this));
  }
  focus() {
    this.buttonElement?.focus();
  }
  blur() {
    this.buttonElement?.blur();
  }
  render() {
    const e = this.disabled || this.softDisabled, t = this.href ? this.renderLink() : this.renderButton(), o = this.href ? "link" : "button";
    return l`
      ${this.renderElevationOrOutline?.()}
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${o}></md-focus-ring>
      <md-ripple
        part="ripple"
        for=${o}
        ?disabled="${e}"></md-ripple>
      ${t}
    `;
  }
  renderButton() {
    const { ariaLabel: e, ariaHasPopup: t, ariaExpanded: o } = this;
    return l`<button
      id="button"
      class="button"
      ?disabled=${this.disabled}
      aria-disabled=${this.softDisabled || h}
      aria-label="${e || h}"
      aria-haspopup="${t || h}"
      aria-expanded="${o || h}">
      ${this.renderContent()}
    </button>`;
  }
  renderLink() {
    const { ariaLabel: e, ariaHasPopup: t, ariaExpanded: o } = this;
    return l`<a
      id="link"
      class="button"
      aria-label="${e || h}"
      aria-haspopup="${t || h}"
      aria-expanded="${o || h}"
      aria-disabled=${this.disabled || this.softDisabled || h}
      tabindex="${this.disabled && !this.softDisabled ? -1 : h}"
      href=${this.href}
      download=${this.download || h}
      target=${this.target || h}
      >${this.renderContent()}
    </a>`;
  }
  renderContent() {
    const e = l`<slot
      name="icon"
      @slotchange="${this.handleSlotChange}"></slot>`;
    return l`
      <span class="touch"></span>
      ${this.trailingIcon ? h : e}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon ? e : h}
    `;
  }
  handleClick(e) {
    if (this.softDisabled || this.disabled && this.href) {
      e.stopImmediatePropagation(), e.preventDefault();
      return;
    }
    !Qo(e) || !this.buttonElement || (this.focus(), Zo(this.buttonElement));
  }
  handleSlotChange() {
    this.hasIcon = this.assignedIcons.length > 0;
  }
}
Jo(P);
P.formAssociated = !0;
P.shadowRootOptions = {
  mode: "open",
  delegatesFocus: !0
};
s([
  d({ type: Boolean, reflect: !0 })
], P.prototype, "disabled", void 0);
s([
  d({ type: Boolean, attribute: "soft-disabled", reflect: !0 })
], P.prototype, "softDisabled", void 0);
s([
  d()
], P.prototype, "href", void 0);
s([
  d()
], P.prototype, "download", void 0);
s([
  d()
], P.prototype, "target", void 0);
s([
  d({ type: Boolean, attribute: "trailing-icon", reflect: !0 })
], P.prototype, "trailingIcon", void 0);
s([
  d({ type: Boolean, attribute: "has-icon", reflect: !0 })
], P.prototype, "hasIcon", void 0);
s([
  d()
], P.prototype, "type", void 0);
s([
  d({ reflect: !0 })
], P.prototype, "value", void 0);
s([
  w(".button")
], P.prototype, "buttonElement", void 0);
s([
  K({ slot: "icon", flatten: !0 })
], P.prototype, "assignedIcons", void 0);
class _r extends P {
  renderElevationOrOutline() {
    return l`<md-elevation part="elevation"></md-elevation>`;
  }
}
const wr = m`:host{--_container-color: var(--md-filled-button-container-color, var(--md-sys-color-primary, #6750a4));--_container-elevation: var(--md-filled-button-container-elevation, 0);--_container-height: var(--md-filled-button-container-height, 40px);--_container-shadow-color: var(--md-filled-button-container-shadow-color, var(--md-sys-color-shadow, #000));--_disabled-container-color: var(--md-filled-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-elevation: var(--md-filled-button-disabled-container-elevation, 0);--_disabled-container-opacity: var(--md-filled-button-disabled-container-opacity, 0.12);--_disabled-label-text-color: var(--md-filled-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-button-disabled-label-text-opacity, 0.38);--_focus-container-elevation: var(--md-filled-button-focus-container-elevation, 0);--_focus-label-text-color: var(--md-filled-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-container-elevation: var(--md-filled-button-hover-container-elevation, 1);--_hover-label-text-color: var(--md-filled-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-color: var(--md-filled-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-opacity: var(--md-filled-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-filled-button-label-text-color, var(--md-sys-color-on-primary, #fff));--_label-text-font: var(--md-filled-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-filled-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-filled-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-container-elevation: var(--md-filled-button-pressed-container-elevation, 0);--_pressed-label-text-color: var(--md-filled-button-pressed-label-text-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-color: var(--md-filled-button-pressed-state-layer-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-opacity: var(--md-filled-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-filled-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-filled-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-filled-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));--_hover-icon-color: var(--md-filled-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-color: var(--md-filled-button-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-size: var(--md-filled-button-icon-size, 18px);--_pressed-icon-color: var(--md-filled-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));--_container-shape-start-start: var(--md-filled-button-container-shape-start-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-filled-button-container-shape-start-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-filled-button-container-shape-end-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-filled-button-container-shape-end-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-filled-button-leading-space, 24px);--_trailing-space: var(--md-filled-button-trailing-space, 24px);--_with-leading-icon-leading-space: var(--md-filled-button-with-leading-icon-leading-space, 16px);--_with-leading-icon-trailing-space: var(--md-filled-button-with-leading-icon-trailing-space, 24px);--_with-trailing-icon-leading-space: var(--md-filled-button-with-trailing-icon-leading-space, 24px);--_with-trailing-icon-trailing-space: var(--md-filled-button-with-trailing-icon-trailing-space, 16px)}
`;
const kr = m`md-elevation{transition-duration:280ms}:host(:is([disabled],[soft-disabled])) md-elevation{transition:none}md-elevation{--md-elevation-level: var(--_container-elevation);--md-elevation-shadow-color: var(--_container-shadow-color)}:host(:focus-within) md-elevation{--md-elevation-level: var(--_focus-container-elevation)}:host(:hover) md-elevation{--md-elevation-level: var(--_hover-container-elevation)}:host(:active) md-elevation{--md-elevation-level: var(--_pressed-container-elevation)}:host(:is([disabled],[soft-disabled])) md-elevation{--md-elevation-level: var(--_disabled-container-elevation)}
`;
const no = m`:host{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end);box-sizing:border-box;cursor:pointer;display:inline-flex;gap:8px;min-height:var(--_container-height);outline:none;padding-block:calc((var(--_container-height) - max(var(--_label-text-line-height),var(--_icon-size)))/2);padding-inline-start:var(--_leading-space);padding-inline-end:var(--_trailing-space);place-content:center;place-items:center;position:relative;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);text-overflow:ellipsis;text-wrap:nowrap;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);vertical-align:top;--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host(:is([disabled],[soft-disabled])){cursor:default;pointer-events:none}.button{border-radius:inherit;cursor:inherit;display:inline-flex;align-items:center;justify-content:center;border:none;outline:none;-webkit-appearance:none;vertical-align:middle;background:rgba(0,0,0,0);text-decoration:none;min-width:calc(64px - var(--_leading-space) - var(--_trailing-space));width:100%;z-index:0;height:100%;font:inherit;color:var(--_label-text-color);padding:0;gap:inherit;text-transform:inherit}.button::-moz-focus-inner{padding:0;border:0}:host(:hover) .button{color:var(--_hover-label-text-color)}:host(:focus-within) .button{color:var(--_focus-label-text-color)}:host(:active) .button{color:var(--_pressed-label-text-color)}.background{background:var(--_container-color);border-radius:inherit;inset:0;position:absolute}.label{overflow:hidden}:is(.button,.label,.label slot),.label ::slotted(*){text-overflow:inherit}:host(:is([disabled],[soft-disabled])) .label{color:var(--_disabled-label-text-color);opacity:var(--_disabled-label-text-opacity)}:host(:is([disabled],[soft-disabled])) .background{background:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}@media(forced-colors: active){.background{border:1px solid CanvasText}:host(:is([disabled],[soft-disabled])){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1;--_disabled-container-opacity: 1;--_disabled-label-text-color: GrayText;--_disabled-label-text-opacity: 1}}:host([has-icon]:not([trailing-icon])){padding-inline-start:var(--_with-leading-icon-leading-space);padding-inline-end:var(--_with-leading-icon-trailing-space)}:host([has-icon][trailing-icon]){padding-inline-start:var(--_with-trailing-icon-leading-space);padding-inline-end:var(--_with-trailing-icon-trailing-space)}::slotted([slot=icon]){display:inline-flex;position:relative;writing-mode:horizontal-tb;fill:currentColor;flex-shrink:0;color:var(--_icon-color);font-size:var(--_icon-size);inline-size:var(--_icon-size);block-size:var(--_icon-size)}:host(:hover) ::slotted([slot=icon]){color:var(--_hover-icon-color)}:host(:focus-within) ::slotted([slot=icon]){color:var(--_focus-icon-color)}:host(:active) ::slotted([slot=icon]){color:var(--_pressed-icon-color)}:host(:is([disabled],[soft-disabled])) ::slotted([slot=icon]){color:var(--_disabled-icon-color);opacity:var(--_disabled-icon-opacity)}.touch{position:absolute;top:50%;height:48px;left:0;right:0;transform:translateY(-50%)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) 0}:host([touch-target=none]) .touch{display:none}
`;
let xt = class extends _r {
};
xt.styles = [
  no,
  kr,
  wr
];
xt = s([
  _("md-filled-button")
], xt);
class Cr extends P {
  renderElevationOrOutline() {
    return l`<div class="outline"></div>`;
  }
}
const $r = m`:host{--_container-height: var(--md-outlined-button-container-height, 40px);--_disabled-label-text-color: var(--md-outlined-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-outlined-button-disabled-label-text-opacity, 0.38);--_disabled-outline-color: var(--md-outlined-button-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-outline-opacity: var(--md-outlined-button-disabled-outline-opacity, 0.12);--_focus-label-text-color: var(--md-outlined-button-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_hover-label-text-color: var(--md-outlined-button-hover-label-text-color, var(--md-sys-color-primary, #6750a4));--_hover-state-layer-color: var(--md-outlined-button-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--_hover-state-layer-opacity: var(--md-outlined-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-outlined-button-label-text-color, var(--md-sys-color-primary, #6750a4));--_label-text-font: var(--md-outlined-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-outlined-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-outlined-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-outlined-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_outline-color: var(--md-outlined-button-outline-color, var(--md-sys-color-outline, #79747e));--_outline-width: var(--md-outlined-button-outline-width, 1px);--_pressed-label-text-color: var(--md-outlined-button-pressed-label-text-color, var(--md-sys-color-primary, #6750a4));--_pressed-outline-color: var(--md-outlined-button-pressed-outline-color, var(--md-sys-color-outline, #79747e));--_pressed-state-layer-color: var(--md-outlined-button-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_pressed-state-layer-opacity: var(--md-outlined-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-outlined-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-outlined-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-outlined-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));--_hover-icon-color: var(--md-outlined-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-color: var(--md-outlined-button-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-size: var(--md-outlined-button-icon-size, 18px);--_pressed-icon-color: var(--md-outlined-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));--_container-shape-start-start: var(--md-outlined-button-container-shape-start-start, var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-outlined-button-container-shape-start-end, var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-outlined-button-container-shape-end-end, var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-outlined-button-container-shape-end-start, var(--md-outlined-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-outlined-button-leading-space, 24px);--_trailing-space: var(--md-outlined-button-trailing-space, 24px);--_with-leading-icon-leading-space: var(--md-outlined-button-with-leading-icon-leading-space, 16px);--_with-leading-icon-trailing-space: var(--md-outlined-button-with-leading-icon-trailing-space, 24px);--_with-trailing-icon-leading-space: var(--md-outlined-button-with-trailing-icon-leading-space, 24px);--_with-trailing-icon-trailing-space: var(--md-outlined-button-with-trailing-icon-trailing-space, 16px);--_container-color: none;--_disabled-container-color: none;--_disabled-container-opacity: 0}.outline{inset:0;border-style:solid;position:absolute;box-sizing:border-box;border-color:var(--_outline-color);border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end)}:host(:active) .outline{border-color:var(--_pressed-outline-color)}:host(:is([disabled],[soft-disabled])) .outline{border-color:var(--_disabled-outline-color);opacity:var(--_disabled-outline-opacity)}@media(forced-colors: active){:host(:is([disabled],[soft-disabled])) .background{border-color:GrayText}:host(:is([disabled],[soft-disabled])) .outline{opacity:1}}.outline,md-ripple{border-width:var(--_outline-width)}md-ripple{inline-size:calc(100% - 2*var(--_outline-width));block-size:calc(100% - 2*var(--_outline-width));border-style:solid;border-color:rgba(0,0,0,0)}
`;
let _t = class extends Cr {
};
_t.styles = [no, $r];
_t = s([
  _("md-outlined-button")
], _t);
class Er extends P {
}
const Sr = m`:host{--_container-height: var(--md-text-button-container-height, 40px);--_disabled-label-text-color: var(--md-text-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-text-button-disabled-label-text-opacity, 0.38);--_focus-label-text-color: var(--md-text-button-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_hover-label-text-color: var(--md-text-button-hover-label-text-color, var(--md-sys-color-primary, #6750a4));--_hover-state-layer-color: var(--md-text-button-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--_hover-state-layer-opacity: var(--md-text-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-text-button-label-text-color, var(--md-sys-color-primary, #6750a4));--_label-text-font: var(--md-text-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-text-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-text-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-text-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-label-text-color: var(--md-text-button-pressed-label-text-color, var(--md-sys-color-primary, #6750a4));--_pressed-state-layer-color: var(--md-text-button-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_pressed-state-layer-opacity: var(--md-text-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-text-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-text-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-text-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));--_hover-icon-color: var(--md-text-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-color: var(--md-text-button-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-size: var(--md-text-button-icon-size, 18px);--_pressed-icon-color: var(--md-text-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));--_container-shape-start-start: var(--md-text-button-container-shape-start-start, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-text-button-container-shape-start-end, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-text-button-container-shape-end-end, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-text-button-container-shape-end-start, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-text-button-leading-space, 12px);--_trailing-space: var(--md-text-button-trailing-space, 12px);--_with-leading-icon-leading-space: var(--md-text-button-with-leading-icon-leading-space, 12px);--_with-leading-icon-trailing-space: var(--md-text-button-with-leading-icon-trailing-space, 16px);--_with-trailing-icon-leading-space: var(--md-text-button-with-trailing-icon-leading-space, 16px);--_with-trailing-icon-trailing-space: var(--md-text-button-with-trailing-icon-trailing-space, 12px);--_container-color: none;--_disabled-container-color: none;--_disabled-container-opacity: 0}
`;
let wt = class extends Er {
};
wt.styles = [no, Sr];
wt = s([
  _("md-text-button")
], wt);
const ei = /* @__PURE__ */ Symbol.for(""), Tr = (i) => {
  if (i?.r === ei) return i?._$litStatic$;
}, re = (i, ...e) => ({ _$litStatic$: e.reduce((t, o, r) => t + ((a) => {
  if (a._$litStatic$ !== void 0) return a._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${a}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(o) + i[r + 1], i[0]), r: ei }), Ao = /* @__PURE__ */ new Map(), zr = (i) => (e, ...t) => {
  const o = t.length;
  let r, a;
  const n = [], c = [];
  let p, f = 0, u = !1;
  for (; f < o; ) {
    for (p = e[f]; f < o && (a = t[f], (r = Tr(a)) !== void 0); ) p += r + e[++f], u = !0;
    f !== o && c.push(a), n.push(p), f++;
  }
  if (f === o && n.push(e[o]), u) {
    const v = n.join("$$lit$$");
    (e = Ao.get(v)) === void 0 && (n.raw = n, Ao.set(v, e = n)), t = c;
  }
  return i(e, ...t);
}, lo = zr(l);
function Io(i, e = !0) {
  return e && getComputedStyle(i).getPropertyValue("direction").trim() === "rtl";
}
const Ar = Q(Oe(g));
class L extends Ar {
  get name() {
    return this.getAttribute("name") ?? "";
  }
  set name(e) {
    this.setAttribute("name", e);
  }
  /**
   * The associated form element with which this element's value will submit.
   */
  get form() {
    return this[N].form;
  }
  /**
   * The labels this element is associated with.
   */
  get labels() {
    return this[N].labels;
  }
  constructor() {
    super(), this.disabled = !1, this.softDisabled = !1, this.flipIconInRtl = !1, this.href = "", this.download = "", this.target = "", this.ariaLabelSelected = "", this.toggle = !1, this.selected = !1, this.type = "submit", this.value = "", this.flipIcon = Io(this, this.flipIconInRtl), this.addEventListener("click", this.handleClick.bind(this));
  }
  willUpdate() {
    this.href && (this.disabled = !1, this.softDisabled = !1);
  }
  render() {
    const e = this.href ? re`div` : re`button`, { ariaLabel: t, ariaHasPopup: o, ariaExpanded: r } = this, a = t && this.ariaLabelSelected, n = this.toggle ? this.selected : h;
    let c = h;
    return this.href || (c = a && this.selected ? this.ariaLabelSelected : t), lo`<${e}
        class="icon-button ${V(this.getRenderClasses())}"
        id="button"
        aria-label="${c || h}"
        aria-haspopup="${!this.href && o || h}"
        aria-expanded="${!this.href && r || h}"
        aria-pressed="${n}"
        aria-disabled=${!this.href && this.softDisabled || h}
        ?disabled="${!this.href && this.disabled}"
        @click="${this.handleClickOnChild}">
        ${this.renderFocusRing()}
        ${this.renderRipple()}
        ${this.selected ? h : this.renderIcon()}
        ${this.selected ? this.renderSelectedIcon() : h}
        ${this.href ? this.renderLink() : this.renderTouchTarget()}
  </${e}>`;
  }
  renderLink() {
    const { ariaLabel: e } = this;
    return l`
      <a
        class="link"
        id="link"
        href="${this.href}"
        download="${this.download || h}"
        target="${this.target || h}"
        aria-label="${e || h}">
        ${this.renderTouchTarget()}
      </a>
    `;
  }
  getRenderClasses() {
    return {
      "flip-icon": this.flipIcon,
      selected: this.toggle && this.selected
    };
  }
  renderIcon() {
    return l`<span class="icon"><slot></slot></span>`;
  }
  renderSelectedIcon() {
    return l`<span class="icon icon--selected"
      ><slot name="selected"><slot></slot></slot
    ></span>`;
  }
  renderTouchTarget() {
    return l`<span class="touch"></span>`;
  }
  renderFocusRing() {
    return l`<md-focus-ring
      part="focus-ring"
      for=${this.href ? "link" : "button"}></md-focus-ring>`;
  }
  renderRipple() {
    const e = !this.href && (this.disabled || this.softDisabled);
    return l`<md-ripple
      for=${this.href ? "link" : h}
      ?disabled="${e}"></md-ripple>`;
  }
  connectedCallback() {
    this.flipIcon = Io(this, this.flipIconInRtl), super.connectedCallback();
  }
  /** Handles a click on this element. */
  handleClick(e) {
    if (!this.href && this.softDisabled) {
      e.stopImmediatePropagation(), e.preventDefault();
      return;
    }
  }
  /**
   * Handles a click on the child <div> or <button> element within this
   * element's shadow DOM.
   */
  async handleClickOnChild(e) {
    await 0, !(!this.toggle || this.disabled || this.softDisabled || e.defaultPrevented) && (this.selected = !this.selected, this.dispatchEvent(new InputEvent("input", { bubbles: !0, composed: !0 })), this.dispatchEvent(new Event("change", { bubbles: !0 })));
  }
}
Jo(L);
L.formAssociated = !0;
L.shadowRootOptions = {
  mode: "open",
  delegatesFocus: !0
};
s([
  d({ type: Boolean, reflect: !0 })
], L.prototype, "disabled", void 0);
s([
  d({ type: Boolean, attribute: "soft-disabled", reflect: !0 })
], L.prototype, "softDisabled", void 0);
s([
  d({ type: Boolean, attribute: "flip-icon-in-rtl" })
], L.prototype, "flipIconInRtl", void 0);
s([
  d()
], L.prototype, "href", void 0);
s([
  d()
], L.prototype, "download", void 0);
s([
  d()
], L.prototype, "target", void 0);
s([
  d({ attribute: "aria-label-selected" })
], L.prototype, "ariaLabelSelected", void 0);
s([
  d({ type: Boolean })
], L.prototype, "toggle", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], L.prototype, "selected", void 0);
s([
  d()
], L.prototype, "type", void 0);
s([
  d({ reflect: !0 })
], L.prototype, "value", void 0);
s([
  z()
], L.prototype, "flipIcon", void 0);
const Ir = m`:host{display:inline-flex;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0);height:var(--_container-height);width:var(--_container-width);justify-content:center}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) max(0px,(48px - var(--_container-width))/2)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host(:is([disabled],[soft-disabled])){pointer-events:none}.icon-button{place-items:center;background:none;border:none;box-sizing:border-box;cursor:pointer;display:flex;place-content:center;outline:none;padding:0;position:relative;text-decoration:none;user-select:none;z-index:0;flex:1;border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end)}.icon ::slotted(*){font-size:var(--_icon-size);height:var(--_icon-size);width:var(--_icon-size);font-weight:inherit}md-ripple{z-index:-1;border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end)}.flip-icon .icon{transform:scaleX(-1)}.icon{display:inline-flex}.link{display:grid;height:100%;outline:none;place-items:center;position:absolute;width:100%}.touch{position:absolute;height:max(48px,100%);width:max(48px,100%)}:host([touch-target=none]) .touch{display:none}@media(forced-colors: active){:host(:is([disabled],[soft-disabled])){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1}}
`;
const Dr = m`:host{--_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);--_icon-size: var(--md-icon-button-icon-size, 24px);--_selected-focus-icon-color: var(--md-icon-button-selected-focus-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-icon-color: var(--md-icon-button-selected-hover-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-state-layer-color: var(--md-icon-button-selected-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-state-layer-opacity: var(--md-icon-button-selected-hover-state-layer-opacity, 0.08);--_selected-icon-color: var(--md-icon-button-selected-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-icon-color: var(--md-icon-button-selected-pressed-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-state-layer-color: var(--md-icon-button-selected-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-state-layer-opacity: var(--md-icon-button-selected-pressed-state-layer-opacity, 0.12);--_state-layer-height: var(--md-icon-button-state-layer-height, 40px);--_state-layer-shape: var(--md-icon-button-state-layer-shape, var(--md-sys-shape-corner-full, 9999px));--_state-layer-width: var(--md-icon-button-state-layer-width, 40px);--_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-icon-button-hover-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);--_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-color: var(--md-icon-button-pressed-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);--_container-shape-start-start: 0;--_container-shape-start-end: 0;--_container-shape-end-end: 0;--_container-shape-end-start: 0;--_container-height: 0;--_container-width: 0;height:var(--_state-layer-height);width:var(--_state-layer-width)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_state-layer-height))/2) max(0px,(48px - var(--_state-layer-width))/2)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_state-layer-shape);--md-focus-ring-shape-start-end: var(--_state-layer-shape);--md-focus-ring-shape-end-end: var(--_state-layer-shape);--md-focus-ring-shape-end-start: var(--_state-layer-shape)}.standard{background-color:rgba(0,0,0,0);color:var(--_icon-color);--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}.standard:hover{color:var(--_hover-icon-color)}.standard:focus{color:var(--_focus-icon-color)}.standard:active{color:var(--_pressed-icon-color)}.standard:is(:disabled,[aria-disabled=true]){color:var(--_disabled-icon-color)}md-ripple{border-radius:var(--_state-layer-shape)}.standard:is(:disabled,[aria-disabled=true]){opacity:var(--_disabled-icon-opacity)}.selected:not(:disabled,[aria-disabled=true]){color:var(--_selected-icon-color)}.selected:not(:disabled,[aria-disabled=true]):hover{color:var(--_selected-hover-icon-color)}.selected:not(:disabled,[aria-disabled=true]):focus{color:var(--_selected-focus-icon-color)}.selected:not(:disabled,[aria-disabled=true]):active{color:var(--_selected-pressed-icon-color)}.selected{--md-ripple-hover-color: var(--_selected-hover-state-layer-color);--md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);--md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity)}
`;
let kt = class extends L {
  getRenderClasses() {
    return {
      ...super.getRenderClasses(),
      standard: !0
    };
  }
};
kt.styles = [Ir, Dr];
kt = s([
  _("md-icon-button")
], kt);
class T extends g {
  constructor() {
    super(...arguments), this.disabled = !1, this.error = !1, this.focused = !1, this.label = "", this.noAsterisk = !1, this.populated = !1, this.required = !1, this.resizable = !1, this.supportingText = "", this.errorText = "", this.count = -1, this.max = -1, this.hasStart = !1, this.hasEnd = !1, this.isAnimating = !1, this.refreshErrorAlert = !1, this.disableTransitions = !1;
  }
  get counterText() {
    const e = this.count ?? -1, t = this.max ?? -1;
    return e < 0 || t <= 0 ? "" : `${e} / ${t}`;
  }
  get supportingOrErrorText() {
    return this.error && this.errorText ? this.errorText : this.supportingText;
  }
  /**
   * Re-announces the field's error supporting text to screen readers.
   *
   * Error text announces to screen readers anytime it is visible and changes.
   * Use the method to re-announce the message when the text has not changed,
   * but announcement is still needed (such as for `reportValidity()`).
   */
  reannounceError() {
    this.refreshErrorAlert = !0;
  }
  update(e) {
    e.has("disabled") && e.get("disabled") !== void 0 && (this.disableTransitions = !0), this.disabled && this.focused && (e.set("focused", !0), this.focused = !1), this.animateLabelIfNeeded({
      wasFocused: e.get("focused"),
      wasPopulated: e.get("populated")
    }), super.update(e);
  }
  render() {
    const e = this.renderLabel(
      /*isFloating*/
      !0
    ), t = this.renderLabel(
      /*isFloating*/
      !1
    ), o = this.renderOutline?.(e), r = {
      disabled: this.disabled,
      "disable-transitions": this.disableTransitions,
      error: this.error && !this.disabled,
      focused: this.focused,
      "with-start": this.hasStart,
      "with-end": this.hasEnd,
      populated: this.populated,
      resizable: this.resizable,
      required: this.required,
      "no-label": !this.label
    };
    return l`
      <div class="field ${V(r)}">
        <div class="container-overflow">
          ${this.renderBackground?.()}
          <slot name="container"></slot>
          ${this.renderStateLayer?.()} ${this.renderIndicator?.()} ${o}
          <div class="container">
            <div class="start">
              <slot name="start"></slot>
            </div>
            <div class="middle">
              <div class="label-wrapper">
                ${t} ${o ? h : e}
              </div>
              <div class="content">
                <slot></slot>
              </div>
            </div>
            <div class="end">
              <slot name="end"></slot>
            </div>
          </div>
        </div>
        ${this.renderSupportingText()}
      </div>
    `;
  }
  updated(e) {
    (e.has("supportingText") || e.has("errorText") || e.has("count") || e.has("max")) && this.updateSlottedAriaDescribedBy(), this.refreshErrorAlert && requestAnimationFrame(() => {
      this.refreshErrorAlert = !1;
    }), this.disableTransitions && requestAnimationFrame(() => {
      this.disableTransitions = !1;
    });
  }
  renderSupportingText() {
    const { supportingOrErrorText: e, counterText: t } = this;
    if (!e && !t)
      return h;
    const o = l`<span>${e}</span>`, r = t ? l`<span class="counter">${t}</span>` : h, n = this.error && this.errorText && !this.refreshErrorAlert ? "alert" : h;
    return l`
      <div class="supporting-text" role=${n}>${o}${r}</div>
      <slot
        name="aria-describedby"
        @slotchange=${this.updateSlottedAriaDescribedBy}></slot>
    `;
  }
  updateSlottedAriaDescribedBy() {
    for (const e of this.slottedAriaDescribedBy)
      Jt(l`${this.supportingOrErrorText} ${this.counterText}`, e), e.setAttribute("hidden", "");
  }
  renderLabel(e) {
    if (!this.label)
      return h;
    let t;
    e ? t = this.focused || this.populated || this.isAnimating : t = !this.focused && !this.populated && !this.isAnimating;
    const o = {
      hidden: !t,
      floating: e,
      resting: !e
    }, r = `${this.label}${this.required && !this.noAsterisk ? "*" : ""}`;
    return l`
      <span class="label ${V(o)}" aria-hidden=${!t}
        >${r}</span
      >
    `;
  }
  animateLabelIfNeeded({ wasFocused: e, wasPopulated: t }) {
    if (!this.label)
      return;
    e ??= this.focused, t ??= this.populated;
    const o = e || t, r = this.focused || this.populated;
    o !== r && (this.isAnimating = !0, this.labelAnimation?.cancel(), this.labelAnimation = this.floatingLabelEl?.animate(this.getLabelKeyframes(), { duration: 150, easing: j.STANDARD }), this.labelAnimation?.addEventListener("finish", () => {
      this.isAnimating = !1;
    }));
  }
  getLabelKeyframes() {
    const { floatingLabelEl: e, restingLabelEl: t } = this;
    if (!e || !t)
      return [];
    const { x: o, y: r, height: a } = e.getBoundingClientRect(), { x: n, y: c, height: p } = t.getBoundingClientRect(), f = e.scrollWidth, u = t.scrollWidth, v = u / f, b = n - o, x = c - r + Math.round((p - a * v) / 2), E = `translateX(${b}px) translateY(${x}px) scale(${v})`, k = "translateX(0) translateY(0) scale(1)", S = t.clientWidth, C = u > S ? `${S / v}px` : "";
    return this.focused || this.populated ? [
      { transform: E, width: C },
      { transform: k, width: C }
    ] : [
      { transform: k, width: C },
      { transform: E, width: C }
    ];
  }
  getSurfacePositionClientRect() {
    return this.containerEl.getBoundingClientRect();
  }
}
s([
  d({ type: Boolean })
], T.prototype, "disabled", void 0);
s([
  d({ type: Boolean })
], T.prototype, "error", void 0);
s([
  d({ type: Boolean })
], T.prototype, "focused", void 0);
s([
  d()
], T.prototype, "label", void 0);
s([
  d({ type: Boolean, attribute: "no-asterisk" })
], T.prototype, "noAsterisk", void 0);
s([
  d({ type: Boolean })
], T.prototype, "populated", void 0);
s([
  d({ type: Boolean })
], T.prototype, "required", void 0);
s([
  d({ type: Boolean })
], T.prototype, "resizable", void 0);
s([
  d({ attribute: "supporting-text" })
], T.prototype, "supportingText", void 0);
s([
  d({ attribute: "error-text" })
], T.prototype, "errorText", void 0);
s([
  d({ type: Number })
], T.prototype, "count", void 0);
s([
  d({ type: Number })
], T.prototype, "max", void 0);
s([
  d({ type: Boolean, attribute: "has-start" })
], T.prototype, "hasStart", void 0);
s([
  d({ type: Boolean, attribute: "has-end" })
], T.prototype, "hasEnd", void 0);
s([
  K({ slot: "aria-describedby" })
], T.prototype, "slottedAriaDescribedBy", void 0);
s([
  z()
], T.prototype, "isAnimating", void 0);
s([
  z()
], T.prototype, "refreshErrorAlert", void 0);
s([
  z()
], T.prototype, "disableTransitions", void 0);
s([
  w(".label.floating")
], T.prototype, "floatingLabelEl", void 0);
s([
  w(".label.resting")
], T.prototype, "restingLabelEl", void 0);
s([
  w(".container")
], T.prototype, "containerEl", void 0);
class Or extends T {
  renderBackground() {
    return l` <div class="background"></div> `;
  }
  renderStateLayer() {
    return l` <div class="state-layer"></div> `;
  }
  renderIndicator() {
    return l`<div class="active-indicator"></div>`;
  }
}
const Rr = m`@layer styles{:host{--_active-indicator-color: var(--md-filled-field-active-indicator-color, var(--md-sys-color-on-surface-variant, #49454f));--_active-indicator-height: var(--md-filled-field-active-indicator-height, 1px);--_bottom-space: var(--md-filled-field-bottom-space, 16px);--_container-color: var(--md-filled-field-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_content-color: var(--md-filled-field-content-color, var(--md-sys-color-on-surface, #1d1b20));--_content-font: var(--md-filled-field-content-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_content-line-height: var(--md-filled-field-content-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_content-size: var(--md-filled-field-content-size, var(--md-sys-typescale-body-large-size, 1rem));--_content-space: var(--md-filled-field-content-space, 16px);--_content-weight: var(--md-filled-field-content-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_disabled-active-indicator-color: var(--md-filled-field-disabled-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-active-indicator-height: var(--md-filled-field-disabled-active-indicator-height, 1px);--_disabled-active-indicator-opacity: var(--md-filled-field-disabled-active-indicator-opacity, 0.38);--_disabled-container-color: var(--md-filled-field-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-opacity: var(--md-filled-field-disabled-container-opacity, 0.04);--_disabled-content-color: var(--md-filled-field-disabled-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-content-opacity: var(--md-filled-field-disabled-content-opacity, 0.38);--_disabled-label-text-color: var(--md-filled-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-field-disabled-label-text-opacity, 0.38);--_disabled-leading-content-color: var(--md-filled-field-disabled-leading-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-content-opacity: var(--md-filled-field-disabled-leading-content-opacity, 0.38);--_disabled-supporting-text-color: var(--md-filled-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-supporting-text-opacity: var(--md-filled-field-disabled-supporting-text-opacity, 0.38);--_disabled-trailing-content-color: var(--md-filled-field-disabled-trailing-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-content-opacity: var(--md-filled-field-disabled-trailing-content-opacity, 0.38);--_error-active-indicator-color: var(--md-filled-field-error-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-content-color: var(--md-filled-field-error-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-active-indicator-color: var(--md-filled-field-error-focus-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-focus-content-color: var(--md-filled-field-error-focus-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-label-text-color: var(--md-filled-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-leading-content-color: var(--md-filled-field-error-focus-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-supporting-text-color: var(--md-filled-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-trailing-content-color: var(--md-filled-field-error-focus-trailing-content-color, var(--md-sys-color-error, #b3261e));--_error-hover-active-indicator-color: var(--md-filled-field-error-hover-active-indicator-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-content-color: var(--md-filled-field-error-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-label-text-color: var(--md-filled-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-leading-content-color: var(--md-filled-field-error-hover-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-hover-state-layer-color: var(--md-filled-field-error-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-state-layer-opacity: var(--md-filled-field-error-hover-state-layer-opacity, 0.08);--_error-hover-supporting-text-color: var(--md-filled-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-hover-trailing-content-color: var(--md-filled-field-error-hover-trailing-content-color, var(--md-sys-color-on-error-container, #410e0b));--_error-label-text-color: var(--md-filled-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_error-leading-content-color: var(--md-filled-field-error-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-supporting-text-color: var(--md-filled-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-trailing-content-color: var(--md-filled-field-error-trailing-content-color, var(--md-sys-color-error, #b3261e));--_focus-active-indicator-color: var(--md-filled-field-focus-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_focus-active-indicator-height: var(--md-filled-field-focus-active-indicator-height, 3px);--_focus-content-color: var(--md-filled-field-focus-content-color, var(--md-sys-color-on-surface, #1d1b20));--_focus-label-text-color: var(--md-filled-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-content-color: var(--md-filled-field-focus-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-supporting-text-color: var(--md-filled-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-trailing-content-color: var(--md-filled-field-focus-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-active-indicator-color: var(--md-filled-field-hover-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-active-indicator-height: var(--md-filled-field-hover-active-indicator-height, 1px);--_hover-content-color: var(--md-filled-field-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-filled-field-hover-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-leading-content-color: var(--md-filled-field-hover-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-filled-field-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-opacity: var(--md-filled-field-hover-state-layer-opacity, 0.08);--_hover-supporting-text-color: var(--md-filled-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-content-color: var(--md-filled-field-hover-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-color: var(--md-filled-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-font: var(--md-filled-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_label-text-populated-line-height: var(--md-filled-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_label-text-populated-size: var(--md-filled-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_label-text-size: var(--md-filled-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_label-text-weight: var(--md-filled-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_leading-content-color: var(--md-filled-field-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_leading-space: var(--md-filled-field-leading-space, 16px);--_supporting-text-color: var(--md-filled-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_supporting-text-font: var(--md-filled-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_supporting-text-leading-space: var(--md-filled-field-supporting-text-leading-space, 16px);--_supporting-text-line-height: var(--md-filled-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_supporting-text-size: var(--md-filled-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_supporting-text-top-space: var(--md-filled-field-supporting-text-top-space, 4px);--_supporting-text-trailing-space: var(--md-filled-field-supporting-text-trailing-space, 16px);--_supporting-text-weight: var(--md-filled-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_top-space: var(--md-filled-field-top-space, 16px);--_trailing-content-color: var(--md-filled-field-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-space: var(--md-filled-field-trailing-space, 16px);--_with-label-bottom-space: var(--md-filled-field-with-label-bottom-space, 8px);--_with-label-top-space: var(--md-filled-field-with-label-top-space, 8px);--_with-leading-content-leading-space: var(--md-filled-field-with-leading-content-leading-space, 12px);--_with-trailing-content-trailing-space: var(--md-filled-field-with-trailing-content-trailing-space, 12px);--_container-shape-start-start: var(--md-filled-field-container-shape-start-start, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-start-end: var(--md-filled-field-container-shape-start-end, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-end: var(--md-filled-field-container-shape-end-end, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-start: var(--md-filled-field-container-shape-end-start, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-none, 0px)))}.background,.state-layer{border-radius:inherit;inset:0;pointer-events:none;position:absolute}.background{background:var(--_container-color)}.state-layer{visibility:hidden}.field:not(.disabled):hover .state-layer{visibility:visible}.label.floating{position:absolute;top:var(--_with-label-top-space)}.field:not(.with-start) .label-wrapper{margin-inline-start:var(--_leading-space)}.field:not(.with-end) .label-wrapper{margin-inline-end:var(--_trailing-space)}.active-indicator{inset:auto 0 0 0;pointer-events:none;position:absolute;width:100%;z-index:1}.active-indicator::before,.active-indicator::after{border-bottom:var(--_active-indicator-height) solid var(--_active-indicator-color);inset:auto 0 0 0;content:"";position:absolute;width:100%}.active-indicator::after{opacity:0;transition:opacity 150ms cubic-bezier(0.2, 0, 0, 1)}.focused .active-indicator::after{opacity:1}.field:not(.with-start) .content ::slotted(*){padding-inline-start:var(--_leading-space)}.field:not(.with-end) .content ::slotted(*){padding-inline-end:var(--_trailing-space)}.field:not(.no-label) .content ::slotted(:not(textarea)){padding-bottom:var(--_with-label-bottom-space);padding-top:calc(var(--_with-label-top-space) + var(--_label-text-populated-line-height))}.field:not(.no-label) .content ::slotted(textarea){margin-bottom:var(--_with-label-bottom-space);margin-top:calc(var(--_with-label-top-space) + var(--_label-text-populated-line-height))}:hover .active-indicator::before{border-bottom-color:var(--_hover-active-indicator-color);border-bottom-width:var(--_hover-active-indicator-height)}.active-indicator::after{border-bottom-color:var(--_focus-active-indicator-color);border-bottom-width:var(--_focus-active-indicator-height)}:hover .state-layer{background:var(--_hover-state-layer-color);opacity:var(--_hover-state-layer-opacity)}.disabled .active-indicator::before{border-bottom-color:var(--_disabled-active-indicator-color);border-bottom-width:var(--_disabled-active-indicator-height);opacity:var(--_disabled-active-indicator-opacity)}.disabled .background{background:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}.error .active-indicator::before{border-bottom-color:var(--_error-active-indicator-color)}.error:hover .active-indicator::before{border-bottom-color:var(--_error-hover-active-indicator-color)}.error:hover .state-layer{background:var(--_error-hover-state-layer-color);opacity:var(--_error-hover-state-layer-opacity)}.error .active-indicator::after{border-bottom-color:var(--_error-focus-active-indicator-color)}.resizable .container{bottom:var(--_focus-active-indicator-height);clip-path:inset(var(--_focus-active-indicator-height) 0 0 0)}.resizable .container>*{top:var(--_focus-active-indicator-height)}}@layer hcm{@media(forced-colors: active){.disabled .active-indicator::before{border-color:GrayText;opacity:1}}}
`;
const ti = m`:host{display:inline-flex;resize:both}.field{display:flex;flex:1;flex-direction:column;writing-mode:horizontal-tb;max-width:100%}.container-overflow{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-end-radius:var(--_container-shape-end-end);border-end-start-radius:var(--_container-shape-end-start);display:flex;height:100%;position:relative}.container{align-items:center;border-radius:inherit;display:flex;flex:1;max-height:100%;min-height:100%;min-width:min-content;position:relative}.field,.container-overflow{resize:inherit}.resizable:not(.disabled) .container{resize:inherit;overflow:hidden}.disabled{pointer-events:none}slot[name=container]{border-radius:inherit}slot[name=container]::slotted(*){border-radius:inherit;inset:0;pointer-events:none;position:absolute}@layer styles{.start,.middle,.end{display:flex;box-sizing:border-box;height:100%;position:relative}.start{color:var(--_leading-content-color)}.end{color:var(--_trailing-content-color)}.start,.end{align-items:center;justify-content:center}.with-start .start{margin-inline:var(--_with-leading-content-leading-space) var(--_content-space)}.with-end .end{margin-inline:var(--_content-space) var(--_with-trailing-content-trailing-space)}.middle{align-items:stretch;align-self:baseline;flex:1}.content{color:var(--_content-color);display:flex;flex:1;opacity:0;transition:opacity 83ms cubic-bezier(0.2, 0, 0, 1)}.no-label .content,.focused .content,.populated .content{opacity:1;transition-delay:67ms}:is(.disabled,.disable-transitions) .content{transition:none}.content ::slotted(*){all:unset;color:currentColor;font-family:var(--_content-font);font-size:var(--_content-size);line-height:var(--_content-line-height);font-weight:var(--_content-weight);width:100%;overflow-wrap:revert;white-space:revert}.content ::slotted(:not(textarea)){padding-top:var(--_top-space);padding-bottom:var(--_bottom-space)}.content ::slotted(textarea){margin-top:var(--_top-space);margin-bottom:var(--_bottom-space)}:hover .content{color:var(--_hover-content-color)}:hover .start{color:var(--_hover-leading-content-color)}:hover .end{color:var(--_hover-trailing-content-color)}.focused .content{color:var(--_focus-content-color)}.focused .start{color:var(--_focus-leading-content-color)}.focused .end{color:var(--_focus-trailing-content-color)}.disabled .content{color:var(--_disabled-content-color)}.disabled.no-label .content,.disabled.focused .content,.disabled.populated .content{opacity:var(--_disabled-content-opacity)}.disabled .start{color:var(--_disabled-leading-content-color);opacity:var(--_disabled-leading-content-opacity)}.disabled .end{color:var(--_disabled-trailing-content-color);opacity:var(--_disabled-trailing-content-opacity)}.error .content{color:var(--_error-content-color)}.error .start{color:var(--_error-leading-content-color)}.error .end{color:var(--_error-trailing-content-color)}.error:hover .content{color:var(--_error-hover-content-color)}.error:hover .start{color:var(--_error-hover-leading-content-color)}.error:hover .end{color:var(--_error-hover-trailing-content-color)}.error.focused .content{color:var(--_error-focus-content-color)}.error.focused .start{color:var(--_error-focus-leading-content-color)}.error.focused .end{color:var(--_error-focus-trailing-content-color)}}@layer hcm{@media(forced-colors: active){.disabled :is(.start,.content,.end){color:GrayText;opacity:1}}}@layer styles{.label{box-sizing:border-box;color:var(--_label-text-color);overflow:hidden;max-width:100%;text-overflow:ellipsis;white-space:nowrap;z-index:1;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);width:min-content}.label-wrapper{inset:0;pointer-events:none;position:absolute}.label.resting{position:absolute;top:var(--_top-space)}.label.floating{font-size:var(--_label-text-populated-size);line-height:var(--_label-text-populated-line-height);transform-origin:top left}.label.hidden{opacity:0}.no-label .label{display:none}.label-wrapper{inset:0;position:absolute;text-align:initial}:hover .label{color:var(--_hover-label-text-color)}.focused .label{color:var(--_focus-label-text-color)}.disabled .label{color:var(--_disabled-label-text-color)}.disabled .label:not(.hidden){opacity:var(--_disabled-label-text-opacity)}.error .label{color:var(--_error-label-text-color)}.error:hover .label{color:var(--_error-hover-label-text-color)}.error.focused .label{color:var(--_error-focus-label-text-color)}}@layer hcm{@media(forced-colors: active){.disabled .label:not(.hidden){color:GrayText;opacity:1}}}@layer styles{.supporting-text{color:var(--_supporting-text-color);display:flex;font-family:var(--_supporting-text-font);font-size:var(--_supporting-text-size);line-height:var(--_supporting-text-line-height);font-weight:var(--_supporting-text-weight);gap:16px;justify-content:space-between;padding-inline-start:var(--_supporting-text-leading-space);padding-inline-end:var(--_supporting-text-trailing-space);padding-top:var(--_supporting-text-top-space)}.supporting-text :nth-child(2){flex-shrink:0}:hover .supporting-text{color:var(--_hover-supporting-text-color)}.focus .supporting-text{color:var(--_focus-supporting-text-color)}.disabled .supporting-text{color:var(--_disabled-supporting-text-color);opacity:var(--_disabled-supporting-text-opacity)}.error .supporting-text{color:var(--_error-supporting-text-color)}.error:hover .supporting-text{color:var(--_error-hover-supporting-text-color)}.error.focus .supporting-text{color:var(--_error-focus-supporting-text-color)}}@layer hcm{@media(forced-colors: active){.disabled .supporting-text{color:GrayText;opacity:1}}}
`;
let Ct = class extends Or {
};
Ct.styles = [ti, Rr];
Ct = s([
  _("md-filled-field")
], Ct);
const Pr = m`:host{--_active-indicator-color: var(--md-filled-text-field-active-indicator-color, var(--md-sys-color-on-surface-variant, #49454f));--_active-indicator-height: var(--md-filled-text-field-active-indicator-height, 1px);--_caret-color: var(--md-filled-text-field-caret-color, var(--md-sys-color-primary, #6750a4));--_container-color: var(--md-filled-text-field-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_disabled-active-indicator-color: var(--md-filled-text-field-disabled-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-active-indicator-height: var(--md-filled-text-field-disabled-active-indicator-height, 1px);--_disabled-active-indicator-opacity: var(--md-filled-text-field-disabled-active-indicator-opacity, 0.38);--_disabled-container-color: var(--md-filled-text-field-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-opacity: var(--md-filled-text-field-disabled-container-opacity, 0.04);--_disabled-input-text-color: var(--md-filled-text-field-disabled-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-input-text-opacity: var(--md-filled-text-field-disabled-input-text-opacity, 0.38);--_disabled-label-text-color: var(--md-filled-text-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-text-field-disabled-label-text-opacity, 0.38);--_disabled-leading-icon-color: var(--md-filled-text-field-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-icon-opacity: var(--md-filled-text-field-disabled-leading-icon-opacity, 0.38);--_disabled-supporting-text-color: var(--md-filled-text-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-supporting-text-opacity: var(--md-filled-text-field-disabled-supporting-text-opacity, 0.38);--_disabled-trailing-icon-color: var(--md-filled-text-field-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-icon-opacity: var(--md-filled-text-field-disabled-trailing-icon-opacity, 0.38);--_error-active-indicator-color: var(--md-filled-text-field-error-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-focus-active-indicator-color: var(--md-filled-text-field-error-focus-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-focus-caret-color: var(--md-filled-text-field-error-focus-caret-color, var(--md-sys-color-error, #b3261e));--_error-focus-input-text-color: var(--md-filled-text-field-error-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-label-text-color: var(--md-filled-text-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-leading-icon-color: var(--md-filled-text-field-error-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-supporting-text-color: var(--md-filled-text-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-trailing-icon-color: var(--md-filled-text-field-error-focus-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_error-hover-active-indicator-color: var(--md-filled-text-field-error-hover-active-indicator-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-input-text-color: var(--md-filled-text-field-error-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-label-text-color: var(--md-filled-text-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-leading-icon-color: var(--md-filled-text-field-error-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-hover-state-layer-color: var(--md-filled-text-field-error-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-state-layer-opacity: var(--md-filled-text-field-error-hover-state-layer-opacity, 0.08);--_error-hover-supporting-text-color: var(--md-filled-text-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-hover-trailing-icon-color: var(--md-filled-text-field-error-hover-trailing-icon-color, var(--md-sys-color-on-error-container, #410e0b));--_error-input-text-color: var(--md-filled-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-label-text-color: var(--md-filled-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_error-leading-icon-color: var(--md-filled-text-field-error-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-supporting-text-color: var(--md-filled-text-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-trailing-icon-color: var(--md-filled-text-field-error-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_focus-active-indicator-color: var(--md-filled-text-field-focus-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_focus-active-indicator-height: var(--md-filled-text-field-focus-active-indicator-height, 3px);--_focus-input-text-color: var(--md-filled-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_focus-label-text-color: var(--md-filled-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-icon-color: var(--md-filled-text-field-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-supporting-text-color: var(--md-filled-text-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-trailing-icon-color: var(--md-filled-text-field-focus-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-active-indicator-color: var(--md-filled-text-field-hover-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-active-indicator-height: var(--md-filled-text-field-hover-active-indicator-height, 1px);--_hover-input-text-color: var(--md-filled-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-filled-text-field-hover-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-leading-icon-color: var(--md-filled-text-field-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-filled-text-field-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-opacity: var(--md-filled-text-field-hover-state-layer-opacity, 0.08);--_hover-supporting-text-color: var(--md-filled-text-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-icon-color: var(--md-filled-text-field-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-color: var(--md-filled-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_input-text-font: var(--md-filled-text-field-input-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_input-text-line-height: var(--md-filled-text-field-input-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_input-text-placeholder-color: var(--md-filled-text-field-input-text-placeholder-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-prefix-color: var(--md-filled-text-field-input-text-prefix-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-size: var(--md-filled-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_input-text-suffix-color: var(--md-filled-text-field-input-text-suffix-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-weight: var(--md-filled-text-field-input-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_label-text-color: var(--md-filled-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-font: var(--md-filled-text-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-text-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_label-text-populated-line-height: var(--md-filled-text-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_label-text-populated-size: var(--md-filled-text-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_label-text-size: var(--md-filled-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_label-text-weight: var(--md-filled-text-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_leading-icon-color: var(--md-filled-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_leading-icon-size: var(--md-filled-text-field-leading-icon-size, 24px);--_supporting-text-color: var(--md-filled-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_supporting-text-font: var(--md-filled-text-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_supporting-text-line-height: var(--md-filled-text-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_supporting-text-size: var(--md-filled-text-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_supporting-text-weight: var(--md-filled-text-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_trailing-icon-color: var(--md-filled-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-icon-size: var(--md-filled-text-field-trailing-icon-size, 24px);--_container-shape-start-start: var(--md-filled-text-field-container-shape-start-start, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-start-end: var(--md-filled-text-field-container-shape-start-end, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-end: var(--md-filled-text-field-container-shape-end-end, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-start: var(--md-filled-text-field-container-shape-end-start, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_icon-input-space: var(--md-filled-text-field-icon-input-space, 16px);--_leading-space: var(--md-filled-text-field-leading-space, 16px);--_trailing-space: var(--md-filled-text-field-trailing-space, 16px);--_top-space: var(--md-filled-text-field-top-space, 16px);--_bottom-space: var(--md-filled-text-field-bottom-space, 16px);--_input-text-prefix-trailing-space: var(--md-filled-text-field-input-text-prefix-trailing-space, 2px);--_input-text-suffix-leading-space: var(--md-filled-text-field-input-text-suffix-leading-space, 2px);--_with-label-top-space: var(--md-filled-text-field-with-label-top-space, 8px);--_with-label-bottom-space: var(--md-filled-text-field-with-label-bottom-space, 8px);--_focus-caret-color: var(--md-filled-text-field-focus-caret-color, var(--md-sys-color-primary, #6750a4));--_with-leading-icon-leading-space: var(--md-filled-text-field-with-leading-icon-leading-space, 12px);--_with-trailing-icon-trailing-space: var(--md-filled-text-field-with-trailing-icon-trailing-space, 12px);--md-filled-field-active-indicator-color: var(--_active-indicator-color);--md-filled-field-active-indicator-height: var(--_active-indicator-height);--md-filled-field-bottom-space: var(--_bottom-space);--md-filled-field-container-color: var(--_container-color);--md-filled-field-container-shape-end-end: var(--_container-shape-end-end);--md-filled-field-container-shape-end-start: var(--_container-shape-end-start);--md-filled-field-container-shape-start-end: var(--_container-shape-start-end);--md-filled-field-container-shape-start-start: var(--_container-shape-start-start);--md-filled-field-content-color: var(--_input-text-color);--md-filled-field-content-font: var(--_input-text-font);--md-filled-field-content-line-height: var(--_input-text-line-height);--md-filled-field-content-size: var(--_input-text-size);--md-filled-field-content-space: var(--_icon-input-space);--md-filled-field-content-weight: var(--_input-text-weight);--md-filled-field-disabled-active-indicator-color: var(--_disabled-active-indicator-color);--md-filled-field-disabled-active-indicator-height: var(--_disabled-active-indicator-height);--md-filled-field-disabled-active-indicator-opacity: var(--_disabled-active-indicator-opacity);--md-filled-field-disabled-container-color: var(--_disabled-container-color);--md-filled-field-disabled-container-opacity: var(--_disabled-container-opacity);--md-filled-field-disabled-content-color: var(--_disabled-input-text-color);--md-filled-field-disabled-content-opacity: var(--_disabled-input-text-opacity);--md-filled-field-disabled-label-text-color: var(--_disabled-label-text-color);--md-filled-field-disabled-label-text-opacity: var(--_disabled-label-text-opacity);--md-filled-field-disabled-leading-content-color: var(--_disabled-leading-icon-color);--md-filled-field-disabled-leading-content-opacity: var(--_disabled-leading-icon-opacity);--md-filled-field-disabled-supporting-text-color: var(--_disabled-supporting-text-color);--md-filled-field-disabled-supporting-text-opacity: var(--_disabled-supporting-text-opacity);--md-filled-field-disabled-trailing-content-color: var(--_disabled-trailing-icon-color);--md-filled-field-disabled-trailing-content-opacity: var(--_disabled-trailing-icon-opacity);--md-filled-field-error-active-indicator-color: var(--_error-active-indicator-color);--md-filled-field-error-content-color: var(--_error-input-text-color);--md-filled-field-error-focus-active-indicator-color: var(--_error-focus-active-indicator-color);--md-filled-field-error-focus-content-color: var(--_error-focus-input-text-color);--md-filled-field-error-focus-label-text-color: var(--_error-focus-label-text-color);--md-filled-field-error-focus-leading-content-color: var(--_error-focus-leading-icon-color);--md-filled-field-error-focus-supporting-text-color: var(--_error-focus-supporting-text-color);--md-filled-field-error-focus-trailing-content-color: var(--_error-focus-trailing-icon-color);--md-filled-field-error-hover-active-indicator-color: var(--_error-hover-active-indicator-color);--md-filled-field-error-hover-content-color: var(--_error-hover-input-text-color);--md-filled-field-error-hover-label-text-color: var(--_error-hover-label-text-color);--md-filled-field-error-hover-leading-content-color: var(--_error-hover-leading-icon-color);--md-filled-field-error-hover-state-layer-color: var(--_error-hover-state-layer-color);--md-filled-field-error-hover-state-layer-opacity: var(--_error-hover-state-layer-opacity);--md-filled-field-error-hover-supporting-text-color: var(--_error-hover-supporting-text-color);--md-filled-field-error-hover-trailing-content-color: var(--_error-hover-trailing-icon-color);--md-filled-field-error-label-text-color: var(--_error-label-text-color);--md-filled-field-error-leading-content-color: var(--_error-leading-icon-color);--md-filled-field-error-supporting-text-color: var(--_error-supporting-text-color);--md-filled-field-error-trailing-content-color: var(--_error-trailing-icon-color);--md-filled-field-focus-active-indicator-color: var(--_focus-active-indicator-color);--md-filled-field-focus-active-indicator-height: var(--_focus-active-indicator-height);--md-filled-field-focus-content-color: var(--_focus-input-text-color);--md-filled-field-focus-label-text-color: var(--_focus-label-text-color);--md-filled-field-focus-leading-content-color: var(--_focus-leading-icon-color);--md-filled-field-focus-supporting-text-color: var(--_focus-supporting-text-color);--md-filled-field-focus-trailing-content-color: var(--_focus-trailing-icon-color);--md-filled-field-hover-active-indicator-color: var(--_hover-active-indicator-color);--md-filled-field-hover-active-indicator-height: var(--_hover-active-indicator-height);--md-filled-field-hover-content-color: var(--_hover-input-text-color);--md-filled-field-hover-label-text-color: var(--_hover-label-text-color);--md-filled-field-hover-leading-content-color: var(--_hover-leading-icon-color);--md-filled-field-hover-state-layer-color: var(--_hover-state-layer-color);--md-filled-field-hover-state-layer-opacity: var(--_hover-state-layer-opacity);--md-filled-field-hover-supporting-text-color: var(--_hover-supporting-text-color);--md-filled-field-hover-trailing-content-color: var(--_hover-trailing-icon-color);--md-filled-field-label-text-color: var(--_label-text-color);--md-filled-field-label-text-font: var(--_label-text-font);--md-filled-field-label-text-line-height: var(--_label-text-line-height);--md-filled-field-label-text-populated-line-height: var(--_label-text-populated-line-height);--md-filled-field-label-text-populated-size: var(--_label-text-populated-size);--md-filled-field-label-text-size: var(--_label-text-size);--md-filled-field-label-text-weight: var(--_label-text-weight);--md-filled-field-leading-content-color: var(--_leading-icon-color);--md-filled-field-leading-space: var(--_leading-space);--md-filled-field-supporting-text-color: var(--_supporting-text-color);--md-filled-field-supporting-text-font: var(--_supporting-text-font);--md-filled-field-supporting-text-line-height: var(--_supporting-text-line-height);--md-filled-field-supporting-text-size: var(--_supporting-text-size);--md-filled-field-supporting-text-weight: var(--_supporting-text-weight);--md-filled-field-top-space: var(--_top-space);--md-filled-field-trailing-content-color: var(--_trailing-icon-color);--md-filled-field-trailing-space: var(--_trailing-space);--md-filled-field-with-label-bottom-space: var(--_with-label-bottom-space);--md-filled-field-with-label-top-space: var(--_with-label-top-space);--md-filled-field-with-leading-content-leading-space: var(--_with-leading-icon-leading-space);--md-filled-field-with-trailing-content-trailing-space: var(--_with-trailing-icon-trailing-space)}
`;
const Mr = (i) => i.strings === void 0, Fr = {}, Lr = (i, e = Fr) => i._$AH = e;
const Do = oo(class extends io {
  constructor(i) {
    if (super(i), i.type !== oe.PROPERTY && i.type !== oe.ATTRIBUTE && i.type !== oe.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!Mr(i)) throw Error("`live` bindings can only contain a single expression");
  }
  render(i) {
    return i;
  }
  update(i, [e]) {
    if (e === q || e === h) return e;
    const t = i.element, o = i.name;
    if (i.type === oe.PROPERTY) {
      if (e === t[o]) return q;
    } else if (i.type === oe.BOOLEAN_ATTRIBUTE) {
      if (!!e === t.hasAttribute(o)) return q;
    } else if (i.type === oe.ATTRIBUTE && t.getAttribute(o) === e + "") return q;
    return Lr(i), e;
  }
});
const oi = "important", Br = " !" + oi, be = oo(class extends io {
  constructor(i) {
    if (super(i), i.type !== oe.ATTRIBUTE || i.name !== "style" || i.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return Object.keys(i).reduce((e, t) => {
      const o = i[t];
      return o == null ? e : e + `${t = t.includes("-") ? t : t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${o};`;
    }, "");
  }
  update(i, [e]) {
    const { style: t } = i.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(e)), this.render(e);
    for (const o of this.ft) e[o] == null && (this.ft.delete(o), o.includes("-") ? t.removeProperty(o) : t[o] = null);
    for (const o in e) {
      const r = e[o];
      if (r != null) {
        this.ft.add(o);
        const a = typeof r == "string" && r.endsWith(Br);
        o.includes("-") || a ? t.setProperty(o, a ? r.slice(0, -11) : r, a ? oi : "") : t[o] = r;
      }
    }
    return q;
  }
});
const Nr = {
  fromAttribute(i) {
    return i ?? "";
  },
  toAttribute(i) {
    return i || null;
  }
};
const Qe = /* @__PURE__ */ Symbol("onReportValidity"), Le = /* @__PURE__ */ Symbol("privateCleanupFormListeners"), Be = /* @__PURE__ */ Symbol("privateDoNotReportInvalid"), Ne = /* @__PURE__ */ Symbol("privateIsSelfReportingValidity"), Ve = /* @__PURE__ */ Symbol("privateCallOnReportValidity");
function ii(i) {
  var e, t, o;
  class r extends i {
    // Mixins must have a constructor with `...args: any[]`
    // tslint:disable-next-line:no-any
    constructor(...n) {
      super(...n), this[e] = new AbortController(), this[t] = !1, this[o] = !1, this.addEventListener("invalid", (c) => {
        this[Be] || !c.isTrusted || this.addEventListener("invalid", () => {
          this[Ve](c);
        }, { once: !0 });
      }, {
        // Listen during the capture phase, which will happen before the
        // bubbling phase. That way, we can add a final event listener that
        // will run after other event listeners, and we can check if it was
        // default prevented. This works because invalid does not bubble.
        capture: !0
      });
    }
    checkValidity() {
      this[Be] = !0;
      const n = super.checkValidity();
      return this[Be] = !1, n;
    }
    reportValidity() {
      this[Ne] = !0;
      const n = super.reportValidity();
      return n && this[Ve](null), this[Ne] = !1, n;
    }
    [(e = Le, t = Be, o = Ne, Ve)](n) {
      const c = n?.defaultPrevented;
      c || (this[Qe](n), !(!c && n?.defaultPrevented)) || (this[Ne] || qr(this[N].form, this)) && this.focus();
    }
    [Qe](n) {
      throw new Error("Implement [onReportValidity]");
    }
    formAssociatedCallback(n) {
      super.formAssociatedCallback && super.formAssociatedCallback(n), this[Le].abort(), n && (this[Le] = new AbortController(), Vr(this, n, () => {
        this[Ve](null);
      }, this[Le].signal));
    }
  }
  return r;
}
function Vr(i, e, t, o) {
  const r = Ur(e);
  let a = !1, n, c = !1;
  r.addEventListener("before", () => {
    c = !0, n = new AbortController(), a = !1, i.addEventListener("invalid", () => {
      a = !0;
    }, {
      signal: n.signal
    });
  }, { signal: o }), r.addEventListener("after", () => {
    c = !1, n?.abort(), !a && t();
  }, { signal: o }), e.addEventListener("submit", () => {
    c || t();
  }, {
    signal: o
  });
}
const dt = /* @__PURE__ */ new WeakMap();
function Ur(i) {
  if (!dt.has(i)) {
    const e = new EventTarget();
    dt.set(i, e);
    for (const t of ["reportValidity", "requestSubmit"]) {
      const o = i[t];
      i[t] = function() {
        e.dispatchEvent(new Event("before"));
        const r = Reflect.apply(o, this, arguments);
        return e.dispatchEvent(new Event("after")), r;
      };
    }
  }
  return dt.get(i);
}
function qr(i, e) {
  if (!i)
    return !0;
  let t;
  for (const o of i.elements)
    if (o.matches(":invalid")) {
      t = o;
      break;
    }
  return t === e;
}
class Hr extends so {
  computeValidity({ state: e, renderedControl: t }) {
    let o = t;
    we(e) && !o ? (o = this.inputControl || document.createElement("input"), this.inputControl = o) : o || (o = this.textAreaControl || document.createElement("textarea"), this.textAreaControl = o);
    const r = we(e) ? o : null;
    if (r && (r.type = e.type), o.value !== e.value && (o.value = e.value), o.required = e.required, r) {
      const a = e;
      a.pattern ? r.pattern = a.pattern : r.removeAttribute("pattern"), a.min ? r.min = a.min : r.removeAttribute("min"), a.max ? r.max = a.max : r.removeAttribute("max"), a.step ? r.step = a.step : r.removeAttribute("step");
    }
    return (e.minLength ?? -1) > -1 ? o.setAttribute("minlength", String(e.minLength)) : o.removeAttribute("minlength"), (e.maxLength ?? -1) > -1 ? o.setAttribute("maxlength", String(e.maxLength)) : o.removeAttribute("maxlength"), {
      validity: o.validity,
      validationMessage: o.validationMessage
    };
  }
  equals({ state: e }, { state: t }) {
    const o = e.type === t.type && e.value === t.value && e.required === t.required && e.minLength === t.minLength && e.maxLength === t.maxLength;
    return !we(e) || !we(t) ? o : o && e.pattern === t.pattern && e.min === t.min && e.max === t.max && e.step === t.step;
  }
  copy({ state: e }) {
    return {
      state: we(e) ? this.copyInput(e) : this.copyTextArea(e),
      renderedControl: null
    };
  }
  copyInput(e) {
    const { type: t, pattern: o, min: r, max: a, step: n } = e;
    return {
      ...this.copySharedState(e),
      type: t,
      pattern: o,
      min: r,
      max: a,
      step: n
    };
  }
  copyTextArea(e) {
    return {
      ...this.copySharedState(e),
      type: e.type
    };
  }
  copySharedState({ value: e, required: t, minLength: o, maxLength: r }) {
    return { value: e, required: t, minLength: o, maxLength: r };
  }
}
function we(i) {
  return i.type !== "textarea";
}
const Wr = Q(ii(ro(ao(Oe(g)))));
class y extends Wr {
  constructor() {
    super(...arguments), this.error = !1, this.errorText = "", this.label = "", this.noAsterisk = !1, this.required = !1, this.value = "", this.prefixText = "", this.suffixText = "", this.hasLeadingIcon = !1, this.hasTrailingIcon = !1, this.supportingText = "", this.textDirection = "", this.rows = 2, this.cols = 20, this.inputMode = "", this.max = "", this.maxLength = -1, this.min = "", this.minLength = -1, this.noSpinner = !1, this.pattern = "", this.placeholder = "", this.readOnly = !1, this.multiple = !1, this.step = "", this.type = "text", this.autocomplete = "", this.dirty = !1, this.focused = !1, this.nativeError = !1, this.nativeErrorText = "";
  }
  /**
   * Gets or sets the direction in which selection occurred.
   */
  get selectionDirection() {
    return this.getInputOrTextarea().selectionDirection;
  }
  set selectionDirection(e) {
    this.getInputOrTextarea().selectionDirection = e;
  }
  /**
   * Gets or sets the end position or offset of a text selection.
   */
  get selectionEnd() {
    return this.getInputOrTextarea().selectionEnd;
  }
  set selectionEnd(e) {
    this.getInputOrTextarea().selectionEnd = e;
  }
  /**
   * Gets or sets the starting position or offset of a text selection.
   */
  get selectionStart() {
    return this.getInputOrTextarea().selectionStart;
  }
  set selectionStart(e) {
    this.getInputOrTextarea().selectionStart = e;
  }
  /**
   * The text field's value as a number.
   */
  get valueAsNumber() {
    const e = this.getInput();
    return e ? e.valueAsNumber : NaN;
  }
  set valueAsNumber(e) {
    const t = this.getInput();
    t && (t.valueAsNumber = e, this.value = t.value);
  }
  /**
   * The text field's value as a Date.
   */
  get valueAsDate() {
    const e = this.getInput();
    return e ? e.valueAsDate : null;
  }
  set valueAsDate(e) {
    const t = this.getInput();
    t && (t.valueAsDate = e, this.value = t.value);
  }
  get hasError() {
    return this.error || this.nativeError;
  }
  /**
   * Selects all the text in the text field.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
   */
  select() {
    this.getInputOrTextarea().select();
  }
  setRangeText(...e) {
    this.getInputOrTextarea().setRangeText(...e), this.value = this.getInputOrTextarea().value;
  }
  /**
   * Sets the start and end positions of a selection in the text field.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
   *
   * @param start The offset into the text field for the start of the selection.
   * @param end The offset into the text field for the end of the selection.
   * @param direction The direction in which the selection is performed.
   */
  setSelectionRange(e, t, o) {
    this.getInputOrTextarea().setSelectionRange(e, t, o);
  }
  /**
   * Shows the browser picker for an input element of type "date", "time", etc.
   *
   * For a full list of supported types, see:
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker#browser_compatibility
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker
   */
  showPicker() {
    const e = this.getInput();
    e && e.showPicker();
  }
  /**
   * Decrements the value of a numeric type text field by `step` or `n` `step`
   * number of times.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/stepDown
   *
   * @param stepDecrement The number of steps to decrement, defaults to 1.
   */
  stepDown(e) {
    const t = this.getInput();
    t && (t.stepDown(e), this.value = t.value);
  }
  /**
   * Increments the value of a numeric type text field by `step` or `n` `step`
   * number of times.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/stepUp
   *
   * @param stepIncrement The number of steps to increment, defaults to 1.
   */
  stepUp(e) {
    const t = this.getInput();
    t && (t.stepUp(e), this.value = t.value);
  }
  /**
   * Reset the text field to its default value.
   */
  reset() {
    this.dirty = !1, this.value = this.getAttribute("value") ?? "", this.nativeError = !1, this.nativeErrorText = "";
  }
  attributeChangedCallback(e, t, o) {
    e === "value" && this.dirty || super.attributeChangedCallback(e, t, o);
  }
  render() {
    const e = {
      disabled: this.disabled,
      error: !this.disabled && this.hasError,
      textarea: this.type === "textarea",
      "no-spinner": this.noSpinner
    };
    return l`
      <span class="text-field ${V(e)}">
        ${this.renderField()}
      </span>
    `;
  }
  updated(e) {
    const t = this.getInputOrTextarea().value;
    this.value !== t && (this.value = t);
  }
  renderField() {
    return lo`<${this.fieldTag}
      class="field"
      count=${this.value.length}
      ?disabled=${this.disabled}
      ?error=${this.hasError}
      error-text=${this.getErrorText()}
      ?focused=${this.focused}
      ?has-end=${this.hasTrailingIcon}
      ?has-start=${this.hasLeadingIcon}
      label=${this.label}
      ?no-asterisk=${this.noAsterisk}
      max=${this.maxLength}
      ?populated=${!!this.value}
      ?required=${this.required}
      ?resizable=${this.type === "textarea"}
      supporting-text=${this.supportingText}
    >
      ${this.renderLeadingIcon()}
      ${this.renderInputOrTextarea()}
      ${this.renderTrailingIcon()}
      <div id="description" slot="aria-describedby"></div>
      <slot name="container" slot="container"></slot>
    </${this.fieldTag}>`;
  }
  renderLeadingIcon() {
    return l`
      <span class="icon leading" slot="start">
        <slot name="leading-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `;
  }
  renderTrailingIcon() {
    return l`
      <span class="icon trailing" slot="end">
        <slot name="trailing-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `;
  }
  renderInputOrTextarea() {
    const e = { direction: this.textDirection }, t = this.ariaLabel || this.label || h, o = this.autocomplete, r = (this.maxLength ?? -1) > -1, a = (this.minLength ?? -1) > -1;
    if (this.type === "textarea")
      return l`
        <textarea
          class="input"
          style=${be(e)}
          aria-describedby="description"
          aria-invalid=${this.hasError}
          aria-label=${t}
          autocomplete=${o || h}
          name=${this.name || h}
          ?disabled=${this.disabled}
          maxlength=${r ? this.maxLength : h}
          minlength=${a ? this.minLength : h}
          placeholder=${this.placeholder || h}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          rows=${this.rows}
          cols=${this.cols}
          .value=${Do(this.value)}
          @change=${this.redispatchEvent}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          @input=${this.handleInput}
          @select=${this.redispatchEvent}></textarea>
      `;
    const n = this.renderPrefix(), c = this.renderSuffix(), p = this.inputMode;
    return l`
      <div class="input-wrapper">
        ${n}
        <input
          class="input"
          style=${be(e)}
          aria-describedby="description"
          aria-invalid=${this.hasError}
          aria-label=${t}
          autocomplete=${o || h}
          name=${this.name || h}
          ?disabled=${this.disabled}
          inputmode=${p || h}
          max=${this.max || h}
          maxlength=${r ? this.maxLength : h}
          min=${this.min || h}
          minlength=${a ? this.minLength : h}
          pattern=${this.pattern || h}
          placeholder=${this.placeholder || h}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          ?multiple=${this.multiple}
          step=${this.step || h}
          type=${this.type}
          .value=${Do(this.value)}
          @change=${this.redispatchEvent}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          @input=${this.handleInput}
          @select=${this.redispatchEvent} />
        ${c}
      </div>
    `;
  }
  renderPrefix() {
    return this.renderAffix(
      this.prefixText,
      /* isSuffix */
      !1
    );
  }
  renderSuffix() {
    return this.renderAffix(
      this.suffixText,
      /* isSuffix */
      !0
    );
  }
  renderAffix(e, t) {
    return e ? l`<span class="${V({
      suffix: t,
      prefix: !t
    })}">${e}</span>` : h;
  }
  getErrorText() {
    return this.error ? this.errorText : this.nativeErrorText;
  }
  handleFocusChange() {
    this.focused = this.inputOrTextarea?.matches(":focus") ?? !1;
  }
  handleInput(e) {
    this.dirty = !0, this.value = e.target.value;
  }
  redispatchEvent(e) {
    De(this, e);
  }
  getInputOrTextarea() {
    return this.inputOrTextarea || (this.connectedCallback(), this.scheduleUpdate()), this.isUpdatePending && this.scheduleUpdate(), this.inputOrTextarea;
  }
  getInput() {
    return this.type === "textarea" ? null : this.getInputOrTextarea();
  }
  handleIconChange() {
    this.hasLeadingIcon = this.leadingIcons.length > 0, this.hasTrailingIcon = this.trailingIcons.length > 0;
  }
  [fe]() {
    return this.value;
  }
  formResetCallback() {
    this.reset();
  }
  formStateRestoreCallback(e) {
    this.value = e;
  }
  focus() {
    this.getInputOrTextarea().focus();
  }
  [Te]() {
    return new Hr(() => ({
      state: this,
      renderedControl: this.inputOrTextarea
    }));
  }
  [ze]() {
    return this.inputOrTextarea;
  }
  [Qe](e) {
    e?.preventDefault();
    const t = this.getErrorText();
    this.nativeError = !!e, this.nativeErrorText = this.validationMessage, t === this.getErrorText() && this.field?.reannounceError();
  }
}
y.shadowRootOptions = {
  ...g.shadowRootOptions,
  delegatesFocus: !0
};
s([
  d({ type: Boolean, reflect: !0 })
], y.prototype, "error", void 0);
s([
  d({ attribute: "error-text" })
], y.prototype, "errorText", void 0);
s([
  d()
], y.prototype, "label", void 0);
s([
  d({ type: Boolean, attribute: "no-asterisk" })
], y.prototype, "noAsterisk", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], y.prototype, "required", void 0);
s([
  d()
], y.prototype, "value", void 0);
s([
  d({ attribute: "prefix-text" })
], y.prototype, "prefixText", void 0);
s([
  d({ attribute: "suffix-text" })
], y.prototype, "suffixText", void 0);
s([
  d({ type: Boolean, attribute: "has-leading-icon" })
], y.prototype, "hasLeadingIcon", void 0);
s([
  d({ type: Boolean, attribute: "has-trailing-icon" })
], y.prototype, "hasTrailingIcon", void 0);
s([
  d({ attribute: "supporting-text" })
], y.prototype, "supportingText", void 0);
s([
  d({ attribute: "text-direction" })
], y.prototype, "textDirection", void 0);
s([
  d({ type: Number })
], y.prototype, "rows", void 0);
s([
  d({ type: Number })
], y.prototype, "cols", void 0);
s([
  d({ reflect: !0 })
], y.prototype, "inputMode", void 0);
s([
  d()
], y.prototype, "max", void 0);
s([
  d({ type: Number })
], y.prototype, "maxLength", void 0);
s([
  d()
], y.prototype, "min", void 0);
s([
  d({ type: Number })
], y.prototype, "minLength", void 0);
s([
  d({ type: Boolean, attribute: "no-spinner" })
], y.prototype, "noSpinner", void 0);
s([
  d()
], y.prototype, "pattern", void 0);
s([
  d({ reflect: !0, converter: Nr })
], y.prototype, "placeholder", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], y.prototype, "readOnly", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], y.prototype, "multiple", void 0);
s([
  d()
], y.prototype, "step", void 0);
s([
  d({ reflect: !0 })
], y.prototype, "type", void 0);
s([
  d({ reflect: !0 })
], y.prototype, "autocomplete", void 0);
s([
  z()
], y.prototype, "dirty", void 0);
s([
  z()
], y.prototype, "focused", void 0);
s([
  z()
], y.prototype, "nativeError", void 0);
s([
  z()
], y.prototype, "nativeErrorText", void 0);
s([
  w(".input")
], y.prototype, "inputOrTextarea", void 0);
s([
  w(".field")
], y.prototype, "field", void 0);
s([
  K({ slot: "leading-icon" })
], y.prototype, "leadingIcons", void 0);
s([
  K({ slot: "trailing-icon" })
], y.prototype, "trailingIcons", void 0);
class jr extends y {
  constructor() {
    super(...arguments), this.fieldTag = re`md-filled-field`;
  }
}
const ri = m`:host{display:inline-flex;outline:none;resize:both;text-align:start;-webkit-tap-highlight-color:rgba(0,0,0,0)}.text-field,.field{width:100%}.text-field{display:inline-flex}.field{cursor:text}.disabled .field{cursor:default}.text-field,.textarea .field{resize:inherit}slot[name=container]{border-radius:inherit}.icon{color:currentColor;display:flex;align-items:center;justify-content:center;fill:currentColor;position:relative}.icon ::slotted(*){display:flex;position:absolute}[has-start] .icon.leading{font-size:var(--_leading-icon-size);height:var(--_leading-icon-size);width:var(--_leading-icon-size)}[has-end] .icon.trailing{font-size:var(--_trailing-icon-size);height:var(--_trailing-icon-size);width:var(--_trailing-icon-size)}.input-wrapper{display:flex}.input-wrapper>*{all:inherit;padding:0}.input{caret-color:var(--_caret-color);overflow-x:hidden;text-align:inherit}.input::placeholder{color:currentColor;opacity:1}.input::-webkit-calendar-picker-indicator{display:none}.input::-webkit-search-decoration,.input::-webkit-search-cancel-button{display:none}@media(forced-colors: active){.input{background:none}}.no-spinner .input::-webkit-inner-spin-button,.no-spinner .input::-webkit-outer-spin-button{display:none}.no-spinner .input[type=number]{-moz-appearance:textfield}:focus-within .input{caret-color:var(--_focus-caret-color)}.error:focus-within .input{caret-color:var(--_error-focus-caret-color)}.text-field:not(.disabled) .prefix{color:var(--_input-text-prefix-color)}.text-field:not(.disabled) .suffix{color:var(--_input-text-suffix-color)}.text-field:not(.disabled) .input::placeholder{color:var(--_input-text-placeholder-color)}.prefix,.suffix{text-wrap:nowrap;width:min-content}.prefix{padding-inline-end:var(--_input-text-prefix-trailing-space)}.suffix{padding-inline-start:var(--_input-text-suffix-leading-space)}
`;
let $t = class extends jr {
  constructor() {
    super(...arguments), this.fieldTag = re`md-filled-field`;
  }
};
$t.styles = [ri, Pr];
$t = s([
  _("md-filled-text-field")
], $t);
class Kr extends T {
  renderOutline(e) {
    return l`
      <div class="outline">
        <div class="outline-start"></div>
        <div class="outline-notch">
          <div class="outline-panel-inactive"></div>
          <div class="outline-panel-active"></div>
          <div class="outline-label">${e}</div>
        </div>
        <div class="outline-end"></div>
      </div>
    `;
  }
}
const Yr = m`@layer styles{:host{--_bottom-space: var(--md-outlined-field-bottom-space, 16px);--_content-color: var(--md-outlined-field-content-color, var(--md-sys-color-on-surface, #1d1b20));--_content-font: var(--md-outlined-field-content-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_content-line-height: var(--md-outlined-field-content-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_content-size: var(--md-outlined-field-content-size, var(--md-sys-typescale-body-large-size, 1rem));--_content-space: var(--md-outlined-field-content-space, 16px);--_content-weight: var(--md-outlined-field-content-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_disabled-content-color: var(--md-outlined-field-disabled-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-content-opacity: var(--md-outlined-field-disabled-content-opacity, 0.38);--_disabled-label-text-color: var(--md-outlined-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-outlined-field-disabled-label-text-opacity, 0.38);--_disabled-leading-content-color: var(--md-outlined-field-disabled-leading-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-content-opacity: var(--md-outlined-field-disabled-leading-content-opacity, 0.38);--_disabled-outline-color: var(--md-outlined-field-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-outline-opacity: var(--md-outlined-field-disabled-outline-opacity, 0.12);--_disabled-outline-width: var(--md-outlined-field-disabled-outline-width, 1px);--_disabled-supporting-text-color: var(--md-outlined-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-supporting-text-opacity: var(--md-outlined-field-disabled-supporting-text-opacity, 0.38);--_disabled-trailing-content-color: var(--md-outlined-field-disabled-trailing-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-content-opacity: var(--md-outlined-field-disabled-trailing-content-opacity, 0.38);--_error-content-color: var(--md-outlined-field-error-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-content-color: var(--md-outlined-field-error-focus-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-label-text-color: var(--md-outlined-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-leading-content-color: var(--md-outlined-field-error-focus-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-outline-color: var(--md-outlined-field-error-focus-outline-color, var(--md-sys-color-error, #b3261e));--_error-focus-supporting-text-color: var(--md-outlined-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-trailing-content-color: var(--md-outlined-field-error-focus-trailing-content-color, var(--md-sys-color-error, #b3261e));--_error-hover-content-color: var(--md-outlined-field-error-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-label-text-color: var(--md-outlined-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-leading-content-color: var(--md-outlined-field-error-hover-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-hover-outline-color: var(--md-outlined-field-error-hover-outline-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-supporting-text-color: var(--md-outlined-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-hover-trailing-content-color: var(--md-outlined-field-error-hover-trailing-content-color, var(--md-sys-color-on-error-container, #410e0b));--_error-label-text-color: var(--md-outlined-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_error-leading-content-color: var(--md-outlined-field-error-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-outline-color: var(--md-outlined-field-error-outline-color, var(--md-sys-color-error, #b3261e));--_error-supporting-text-color: var(--md-outlined-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-trailing-content-color: var(--md-outlined-field-error-trailing-content-color, var(--md-sys-color-error, #b3261e));--_focus-content-color: var(--md-outlined-field-focus-content-color, var(--md-sys-color-on-surface, #1d1b20));--_focus-label-text-color: var(--md-outlined-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-content-color: var(--md-outlined-field-focus-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-outline-color: var(--md-outlined-field-focus-outline-color, var(--md-sys-color-primary, #6750a4));--_focus-outline-width: var(--md-outlined-field-focus-outline-width, 3px);--_focus-supporting-text-color: var(--md-outlined-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-trailing-content-color: var(--md-outlined-field-focus-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-content-color: var(--md-outlined-field-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-outlined-field-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-leading-content-color: var(--md-outlined-field-hover-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-outline-color: var(--md-outlined-field-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-outline-width: var(--md-outlined-field-hover-outline-width, 1px);--_hover-supporting-text-color: var(--md-outlined-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-content-color: var(--md-outlined-field-hover-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-color: var(--md-outlined-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-font: var(--md-outlined-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-outlined-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_label-text-padding-bottom: var(--md-outlined-field-label-text-padding-bottom, 8px);--_label-text-populated-line-height: var(--md-outlined-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_label-text-populated-size: var(--md-outlined-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_label-text-size: var(--md-outlined-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_label-text-weight: var(--md-outlined-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_leading-content-color: var(--md-outlined-field-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_leading-space: var(--md-outlined-field-leading-space, 16px);--_outline-color: var(--md-outlined-field-outline-color, var(--md-sys-color-outline, #79747e));--_outline-label-padding: var(--md-outlined-field-outline-label-padding, 4px);--_outline-width: var(--md-outlined-field-outline-width, 1px);--_supporting-text-color: var(--md-outlined-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_supporting-text-font: var(--md-outlined-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_supporting-text-leading-space: var(--md-outlined-field-supporting-text-leading-space, 16px);--_supporting-text-line-height: var(--md-outlined-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_supporting-text-size: var(--md-outlined-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_supporting-text-top-space: var(--md-outlined-field-supporting-text-top-space, 4px);--_supporting-text-trailing-space: var(--md-outlined-field-supporting-text-trailing-space, 16px);--_supporting-text-weight: var(--md-outlined-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_top-space: var(--md-outlined-field-top-space, 16px);--_trailing-content-color: var(--md-outlined-field-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-space: var(--md-outlined-field-trailing-space, 16px);--_with-leading-content-leading-space: var(--md-outlined-field-with-leading-content-leading-space, 12px);--_with-trailing-content-trailing-space: var(--md-outlined-field-with-trailing-content-trailing-space, 12px);--_container-shape-start-start: var(--md-outlined-field-container-shape-start-start, var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-start-end: var(--md-outlined-field-container-shape-start-end, var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-end: var(--md-outlined-field-container-shape-end-end, var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-start: var(--md-outlined-field-container-shape-end-start, var(--md-outlined-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)))}.outline{border-color:var(--_outline-color);border-radius:inherit;display:flex;pointer-events:none;height:100%;position:absolute;width:100%;z-index:1}.outline-start::before,.outline-start::after,.outline-panel-inactive::before,.outline-panel-inactive::after,.outline-panel-active::before,.outline-panel-active::after,.outline-end::before,.outline-end::after{border:inherit;content:"";inset:0;position:absolute}.outline-start,.outline-end{border:inherit;border-radius:inherit;box-sizing:border-box;position:relative}.outline-start::before,.outline-start::after,.outline-end::before,.outline-end::after{border-bottom-style:solid;border-top-style:solid}.outline-start::after,.outline-end::after{opacity:0;transition:opacity 150ms cubic-bezier(0.2, 0, 0, 1)}.focused .outline-start::after,.focused .outline-end::after{opacity:1}.outline-start::before,.outline-start::after{border-inline-start-style:solid;border-inline-end-style:none;border-start-start-radius:inherit;border-start-end-radius:0;border-end-start-radius:inherit;border-end-end-radius:0;margin-inline-end:var(--_outline-label-padding)}.outline-end{flex-grow:1;margin-inline-start:calc(-1*var(--_outline-label-padding))}.outline-end::before,.outline-end::after{border-inline-start-style:none;border-inline-end-style:solid;border-start-start-radius:0;border-start-end-radius:inherit;border-end-start-radius:0;border-end-end-radius:inherit}.outline-notch{align-items:flex-start;border:inherit;display:flex;margin-inline-start:calc(-1*var(--_outline-label-padding));margin-inline-end:var(--_outline-label-padding);max-width:calc(100% - var(--_leading-space) - var(--_trailing-space));padding:0 var(--_outline-label-padding);position:relative}.no-label .outline-notch{display:none}.outline-panel-inactive,.outline-panel-active{border:inherit;border-bottom-style:solid;inset:0;position:absolute}.outline-panel-inactive::before,.outline-panel-inactive::after,.outline-panel-active::before,.outline-panel-active::after{border-top-style:solid;border-bottom:none;bottom:auto;transform:scaleX(1);transition:transform 150ms cubic-bezier(0.2, 0, 0, 1)}.outline-panel-inactive::before,.outline-panel-active::before{right:50%;transform-origin:top left}.outline-panel-inactive::after,.outline-panel-active::after{left:50%;transform-origin:top right}.populated .outline-panel-inactive::before,.populated .outline-panel-inactive::after,.populated .outline-panel-active::before,.populated .outline-panel-active::after,.focused .outline-panel-inactive::before,.focused .outline-panel-inactive::after,.focused .outline-panel-active::before,.focused .outline-panel-active::after{transform:scaleX(0)}.outline-panel-active{opacity:0;transition:opacity 150ms cubic-bezier(0.2, 0, 0, 1)}.focused .outline-panel-active{opacity:1}.outline-label{display:flex;max-width:100%;transform:translateY(calc(-100% + var(--_label-text-padding-bottom)))}.outline-start,.field:not(.with-start) .content ::slotted(*){padding-inline-start:max(var(--_leading-space),max(var(--_container-shape-start-start),var(--_container-shape-end-start)) + var(--_outline-label-padding))}.field:not(.with-start) .label-wrapper{margin-inline-start:max(var(--_leading-space),max(var(--_container-shape-start-start),var(--_container-shape-end-start)) + var(--_outline-label-padding))}.field:not(.with-end) .content ::slotted(*){padding-inline-end:max(var(--_trailing-space),max(var(--_container-shape-start-end),var(--_container-shape-end-end)))}.field:not(.with-end) .label-wrapper{margin-inline-end:max(var(--_trailing-space),max(var(--_container-shape-start-end),var(--_container-shape-end-end)))}.outline-start::before,.outline-end::before,.outline-panel-inactive,.outline-panel-inactive::before,.outline-panel-inactive::after{border-width:var(--_outline-width)}:hover .outline{border-color:var(--_hover-outline-color);color:var(--_hover-outline-color)}:hover .outline-start::before,:hover .outline-end::before,:hover .outline-panel-inactive,:hover .outline-panel-inactive::before,:hover .outline-panel-inactive::after{border-width:var(--_hover-outline-width)}.focused .outline{border-color:var(--_focus-outline-color);color:var(--_focus-outline-color)}.outline-start::after,.outline-end::after,.outline-panel-active,.outline-panel-active::before,.outline-panel-active::after{border-width:var(--_focus-outline-width)}.disabled .outline{border-color:var(--_disabled-outline-color);color:var(--_disabled-outline-color)}.disabled .outline-start,.disabled .outline-end,.disabled .outline-panel-inactive{opacity:var(--_disabled-outline-opacity)}.disabled .outline-start::before,.disabled .outline-end::before,.disabled .outline-panel-inactive,.disabled .outline-panel-inactive::before,.disabled .outline-panel-inactive::after{border-width:var(--_disabled-outline-width)}.error .outline{border-color:var(--_error-outline-color);color:var(--_error-outline-color)}.error:hover .outline{border-color:var(--_error-hover-outline-color);color:var(--_error-hover-outline-color)}.error.focused .outline{border-color:var(--_error-focus-outline-color);color:var(--_error-focus-outline-color)}.resizable .container{bottom:var(--_focus-outline-width);inset-inline-end:var(--_focus-outline-width);clip-path:inset(var(--_focus-outline-width) 0 0 var(--_focus-outline-width))}.resizable .container>*{top:var(--_focus-outline-width);inset-inline-start:var(--_focus-outline-width)}.resizable .container:dir(rtl){clip-path:inset(var(--_focus-outline-width) var(--_focus-outline-width) 0 0)}}@layer hcm{@media(forced-colors: active){.disabled .outline{border-color:GrayText;color:GrayText}.disabled :is(.outline-start,.outline-end,.outline-panel-inactive){opacity:1}}}
`;
let Et = class extends Kr {
};
Et.styles = [ti, Yr];
Et = s([
  _("md-outlined-field")
], Et);
const Gr = m`:host{--_caret-color: var(--md-outlined-text-field-caret-color, var(--md-sys-color-primary, #6750a4));--_disabled-input-text-color: var(--md-outlined-text-field-disabled-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-input-text-opacity: var(--md-outlined-text-field-disabled-input-text-opacity, 0.38);--_disabled-label-text-color: var(--md-outlined-text-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-outlined-text-field-disabled-label-text-opacity, 0.38);--_disabled-leading-icon-color: var(--md-outlined-text-field-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-icon-opacity: var(--md-outlined-text-field-disabled-leading-icon-opacity, 0.38);--_disabled-outline-color: var(--md-outlined-text-field-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-outline-opacity: var(--md-outlined-text-field-disabled-outline-opacity, 0.12);--_disabled-outline-width: var(--md-outlined-text-field-disabled-outline-width, 1px);--_disabled-supporting-text-color: var(--md-outlined-text-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-supporting-text-opacity: var(--md-outlined-text-field-disabled-supporting-text-opacity, 0.38);--_disabled-trailing-icon-color: var(--md-outlined-text-field-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-icon-opacity: var(--md-outlined-text-field-disabled-trailing-icon-opacity, 0.38);--_error-focus-caret-color: var(--md-outlined-text-field-error-focus-caret-color, var(--md-sys-color-error, #b3261e));--_error-focus-input-text-color: var(--md-outlined-text-field-error-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-label-text-color: var(--md-outlined-text-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-leading-icon-color: var(--md-outlined-text-field-error-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-outline-color: var(--md-outlined-text-field-error-focus-outline-color, var(--md-sys-color-error, #b3261e));--_error-focus-supporting-text-color: var(--md-outlined-text-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-trailing-icon-color: var(--md-outlined-text-field-error-focus-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_error-hover-input-text-color: var(--md-outlined-text-field-error-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-label-text-color: var(--md-outlined-text-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-leading-icon-color: var(--md-outlined-text-field-error-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-hover-outline-color: var(--md-outlined-text-field-error-hover-outline-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-supporting-text-color: var(--md-outlined-text-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-hover-trailing-icon-color: var(--md-outlined-text-field-error-hover-trailing-icon-color, var(--md-sys-color-on-error-container, #410e0b));--_error-input-text-color: var(--md-outlined-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-label-text-color: var(--md-outlined-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_error-leading-icon-color: var(--md-outlined-text-field-error-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-outline-color: var(--md-outlined-text-field-error-outline-color, var(--md-sys-color-error, #b3261e));--_error-supporting-text-color: var(--md-outlined-text-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-trailing-icon-color: var(--md-outlined-text-field-error-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_focus-input-text-color: var(--md-outlined-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_focus-label-text-color: var(--md-outlined-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-icon-color: var(--md-outlined-text-field-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-outline-color: var(--md-outlined-text-field-focus-outline-color, var(--md-sys-color-primary, #6750a4));--_focus-outline-width: var(--md-outlined-text-field-focus-outline-width, 3px);--_focus-supporting-text-color: var(--md-outlined-text-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-trailing-icon-color: var(--md-outlined-text-field-focus-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-input-text-color: var(--md-outlined-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-outlined-text-field-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-leading-icon-color: var(--md-outlined-text-field-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-outline-color: var(--md-outlined-text-field-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-outline-width: var(--md-outlined-text-field-hover-outline-width, 1px);--_hover-supporting-text-color: var(--md-outlined-text-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-icon-color: var(--md-outlined-text-field-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-color: var(--md-outlined-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_input-text-font: var(--md-outlined-text-field-input-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_input-text-line-height: var(--md-outlined-text-field-input-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_input-text-placeholder-color: var(--md-outlined-text-field-input-text-placeholder-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-prefix-color: var(--md-outlined-text-field-input-text-prefix-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-size: var(--md-outlined-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_input-text-suffix-color: var(--md-outlined-text-field-input-text-suffix-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-weight: var(--md-outlined-text-field-input-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_label-text-color: var(--md-outlined-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-font: var(--md-outlined-text-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-outlined-text-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_label-text-populated-line-height: var(--md-outlined-text-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_label-text-populated-size: var(--md-outlined-text-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_label-text-size: var(--md-outlined-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_label-text-weight: var(--md-outlined-text-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_leading-icon-color: var(--md-outlined-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_leading-icon-size: var(--md-outlined-text-field-leading-icon-size, 24px);--_outline-color: var(--md-outlined-text-field-outline-color, var(--md-sys-color-outline, #79747e));--_outline-width: var(--md-outlined-text-field-outline-width, 1px);--_supporting-text-color: var(--md-outlined-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_supporting-text-font: var(--md-outlined-text-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_supporting-text-line-height: var(--md-outlined-text-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_supporting-text-size: var(--md-outlined-text-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_supporting-text-weight: var(--md-outlined-text-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_trailing-icon-color: var(--md-outlined-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-icon-size: var(--md-outlined-text-field-trailing-icon-size, 24px);--_container-shape-start-start: var(--md-outlined-text-field-container-shape-start-start, var(--md-outlined-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-start-end: var(--md-outlined-text-field-container-shape-start-end, var(--md-outlined-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-end: var(--md-outlined-text-field-container-shape-end-end, var(--md-outlined-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-start: var(--md-outlined-text-field-container-shape-end-start, var(--md-outlined-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_icon-input-space: var(--md-outlined-text-field-icon-input-space, 16px);--_leading-space: var(--md-outlined-text-field-leading-space, 16px);--_trailing-space: var(--md-outlined-text-field-trailing-space, 16px);--_top-space: var(--md-outlined-text-field-top-space, 16px);--_bottom-space: var(--md-outlined-text-field-bottom-space, 16px);--_input-text-prefix-trailing-space: var(--md-outlined-text-field-input-text-prefix-trailing-space, 2px);--_input-text-suffix-leading-space: var(--md-outlined-text-field-input-text-suffix-leading-space, 2px);--_focus-caret-color: var(--md-outlined-text-field-focus-caret-color, var(--md-sys-color-primary, #6750a4));--_with-leading-icon-leading-space: var(--md-outlined-text-field-with-leading-icon-leading-space, 12px);--_with-trailing-icon-trailing-space: var(--md-outlined-text-field-with-trailing-icon-trailing-space, 12px);--md-outlined-field-bottom-space: var(--_bottom-space);--md-outlined-field-container-shape-end-end: var(--_container-shape-end-end);--md-outlined-field-container-shape-end-start: var(--_container-shape-end-start);--md-outlined-field-container-shape-start-end: var(--_container-shape-start-end);--md-outlined-field-container-shape-start-start: var(--_container-shape-start-start);--md-outlined-field-content-color: var(--_input-text-color);--md-outlined-field-content-font: var(--_input-text-font);--md-outlined-field-content-line-height: var(--_input-text-line-height);--md-outlined-field-content-size: var(--_input-text-size);--md-outlined-field-content-space: var(--_icon-input-space);--md-outlined-field-content-weight: var(--_input-text-weight);--md-outlined-field-disabled-content-color: var(--_disabled-input-text-color);--md-outlined-field-disabled-content-opacity: var(--_disabled-input-text-opacity);--md-outlined-field-disabled-label-text-color: var(--_disabled-label-text-color);--md-outlined-field-disabled-label-text-opacity: var(--_disabled-label-text-opacity);--md-outlined-field-disabled-leading-content-color: var(--_disabled-leading-icon-color);--md-outlined-field-disabled-leading-content-opacity: var(--_disabled-leading-icon-opacity);--md-outlined-field-disabled-outline-color: var(--_disabled-outline-color);--md-outlined-field-disabled-outline-opacity: var(--_disabled-outline-opacity);--md-outlined-field-disabled-outline-width: var(--_disabled-outline-width);--md-outlined-field-disabled-supporting-text-color: var(--_disabled-supporting-text-color);--md-outlined-field-disabled-supporting-text-opacity: var(--_disabled-supporting-text-opacity);--md-outlined-field-disabled-trailing-content-color: var(--_disabled-trailing-icon-color);--md-outlined-field-disabled-trailing-content-opacity: var(--_disabled-trailing-icon-opacity);--md-outlined-field-error-content-color: var(--_error-input-text-color);--md-outlined-field-error-focus-content-color: var(--_error-focus-input-text-color);--md-outlined-field-error-focus-label-text-color: var(--_error-focus-label-text-color);--md-outlined-field-error-focus-leading-content-color: var(--_error-focus-leading-icon-color);--md-outlined-field-error-focus-outline-color: var(--_error-focus-outline-color);--md-outlined-field-error-focus-supporting-text-color: var(--_error-focus-supporting-text-color);--md-outlined-field-error-focus-trailing-content-color: var(--_error-focus-trailing-icon-color);--md-outlined-field-error-hover-content-color: var(--_error-hover-input-text-color);--md-outlined-field-error-hover-label-text-color: var(--_error-hover-label-text-color);--md-outlined-field-error-hover-leading-content-color: var(--_error-hover-leading-icon-color);--md-outlined-field-error-hover-outline-color: var(--_error-hover-outline-color);--md-outlined-field-error-hover-supporting-text-color: var(--_error-hover-supporting-text-color);--md-outlined-field-error-hover-trailing-content-color: var(--_error-hover-trailing-icon-color);--md-outlined-field-error-label-text-color: var(--_error-label-text-color);--md-outlined-field-error-leading-content-color: var(--_error-leading-icon-color);--md-outlined-field-error-outline-color: var(--_error-outline-color);--md-outlined-field-error-supporting-text-color: var(--_error-supporting-text-color);--md-outlined-field-error-trailing-content-color: var(--_error-trailing-icon-color);--md-outlined-field-focus-content-color: var(--_focus-input-text-color);--md-outlined-field-focus-label-text-color: var(--_focus-label-text-color);--md-outlined-field-focus-leading-content-color: var(--_focus-leading-icon-color);--md-outlined-field-focus-outline-color: var(--_focus-outline-color);--md-outlined-field-focus-outline-width: var(--_focus-outline-width);--md-outlined-field-focus-supporting-text-color: var(--_focus-supporting-text-color);--md-outlined-field-focus-trailing-content-color: var(--_focus-trailing-icon-color);--md-outlined-field-hover-content-color: var(--_hover-input-text-color);--md-outlined-field-hover-label-text-color: var(--_hover-label-text-color);--md-outlined-field-hover-leading-content-color: var(--_hover-leading-icon-color);--md-outlined-field-hover-outline-color: var(--_hover-outline-color);--md-outlined-field-hover-outline-width: var(--_hover-outline-width);--md-outlined-field-hover-supporting-text-color: var(--_hover-supporting-text-color);--md-outlined-field-hover-trailing-content-color: var(--_hover-trailing-icon-color);--md-outlined-field-label-text-color: var(--_label-text-color);--md-outlined-field-label-text-font: var(--_label-text-font);--md-outlined-field-label-text-line-height: var(--_label-text-line-height);--md-outlined-field-label-text-populated-line-height: var(--_label-text-populated-line-height);--md-outlined-field-label-text-populated-size: var(--_label-text-populated-size);--md-outlined-field-label-text-size: var(--_label-text-size);--md-outlined-field-label-text-weight: var(--_label-text-weight);--md-outlined-field-leading-content-color: var(--_leading-icon-color);--md-outlined-field-leading-space: var(--_leading-space);--md-outlined-field-outline-color: var(--_outline-color);--md-outlined-field-outline-width: var(--_outline-width);--md-outlined-field-supporting-text-color: var(--_supporting-text-color);--md-outlined-field-supporting-text-font: var(--_supporting-text-font);--md-outlined-field-supporting-text-line-height: var(--_supporting-text-line-height);--md-outlined-field-supporting-text-size: var(--_supporting-text-size);--md-outlined-field-supporting-text-weight: var(--_supporting-text-weight);--md-outlined-field-top-space: var(--_top-space);--md-outlined-field-trailing-content-color: var(--_trailing-icon-color);--md-outlined-field-trailing-space: var(--_trailing-space);--md-outlined-field-with-leading-content-leading-space: var(--_with-leading-icon-leading-space);--md-outlined-field-with-trailing-content-trailing-space: var(--_with-trailing-icon-trailing-space)}
`;
class Xr extends y {
  constructor() {
    super(...arguments), this.fieldTag = re`md-outlined-field`;
  }
}
let St = class extends Xr {
  constructor() {
    super(...arguments), this.fieldTag = re`md-outlined-field`;
  }
};
St.styles = [ri, Gr];
St = s([
  _("md-outlined-text-field")
], St);
function ai(i, e = J) {
  const t = co(i, e);
  return t && (t.tabIndex = 0, t.focus()), t;
}
function si(i, e = J) {
  const t = ni(i, e);
  return t && (t.tabIndex = 0, t.focus()), t;
}
function Ce(i, e = J) {
  for (let t = 0; t < i.length; t++) {
    const o = i[t];
    if (o.tabIndex === 0 && e(o))
      return {
        item: o,
        index: t
      };
  }
  return null;
}
function co(i, e = J) {
  for (const t of i)
    if (e(t))
      return t;
  return null;
}
function ni(i, e = J) {
  for (let t = i.length - 1; t >= 0; t--) {
    const o = i[t];
    if (e(o))
      return o;
  }
  return null;
}
function Zr(i, e, t = J, o = !0) {
  for (let r = 1; r < i.length; r++) {
    const a = (r + e) % i.length;
    if (a < e && !o)
      return null;
    const n = i[a];
    if (t(n))
      return n;
  }
  return i[e] ? i[e] : null;
}
function Qr(i, e, t = J, o = !0) {
  for (let r = 1; r < i.length; r++) {
    const a = (e - r + i.length) % i.length;
    if (a > e && !o)
      return null;
    const n = i[a];
    if (t(n))
      return n;
  }
  return i[e] ? i[e] : null;
}
function Oo(i, e, t = J, o = !0) {
  if (e) {
    const r = Zr(i, e.index, t, o);
    return r && (r.tabIndex = 0, r.focus()), r;
  } else
    return ai(i, t);
}
function Ro(i, e, t = J, o = !0) {
  if (e) {
    const r = Qr(i, e.index, t, o);
    return r && (r.tabIndex = 0, r.focus()), r;
  } else
    return si(i, t);
}
function J(i) {
  return !i.disabled;
}
const F = {
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowUp",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End"
};
class Jr {
  constructor(e) {
    this.handleKeydown = (u) => {
      const v = u.key;
      if (u.defaultPrevented || !this.isNavigableKey(v))
        return;
      const b = this.items;
      if (!b.length)
        return;
      const x = Ce(b, this.isActivatable);
      u.preventDefault();
      const E = this.isRtl(), k = E ? F.ArrowRight : F.ArrowLeft, S = E ? F.ArrowLeft : F.ArrowRight;
      let D = null;
      switch (v) {
        // Activate the next item
        case F.ArrowDown:
        case S:
          D = Oo(b, x, this.isActivatable, this.wrapNavigation());
          break;
        // Activate the previous item
        case F.ArrowUp:
        case k:
          D = Ro(b, x, this.isActivatable, this.wrapNavigation());
          break;
        // Activate the first item
        case F.Home:
          D = ai(b, this.isActivatable);
          break;
        // Activate the last item
        case F.End:
          D = si(b, this.isActivatable);
          break;
      }
      D && x && x.item !== D && (x.item.tabIndex = -1);
    }, this.onDeactivateItems = () => {
      const u = this.items;
      for (const v of u)
        this.deactivateItem(v);
    }, this.onRequestActivation = (u) => {
      this.onDeactivateItems();
      const v = u.target;
      this.activateItem(v), v.focus();
    }, this.onSlotchange = () => {
      const u = this.items;
      let v = !1;
      for (const x of u) {
        if (!x.disabled && x.tabIndex > -1 && !v) {
          v = !0, x.tabIndex = 0;
          continue;
        }
        x.tabIndex = -1;
      }
      if (v)
        return;
      const b = co(u, this.isActivatable);
      b && (b.tabIndex = 0);
    };
    const { isItem: t, getPossibleItems: o, isRtl: r, deactivateItem: a, activateItem: n, isNavigableKey: c, isActivatable: p, wrapNavigation: f } = e;
    this.isItem = t, this.getPossibleItems = o, this.isRtl = r, this.deactivateItem = a, this.activateItem = n, this.isNavigableKey = c, this.isActivatable = p, this.wrapNavigation = f ?? (() => !0);
  }
  /**
   * The items being managed by the list. Additionally, attempts to see if the
   * object has a sub-item in the `.item` property.
   */
  get items() {
    const e = this.getPossibleItems(), t = [];
    for (const o of e) {
      if (this.isItem(o)) {
        t.push(o);
        continue;
      }
      const a = o.item;
      a && this.isItem(a) && t.push(a);
    }
    return t;
  }
  /**
   * Activates the next item in the list. If at the end of the list, the first
   * item will be activated.
   *
   * @return The activated list item or `null` if there are no items.
   */
  activateNextItem() {
    const e = this.items, t = Ce(e, this.isActivatable);
    return t && (t.item.tabIndex = -1), Oo(e, t, this.isActivatable, this.wrapNavigation());
  }
  /**
   * Activates the previous item in the list. If at the start of the list, the
   * last item will be activated.
   *
   * @return The activated list item or `null` if there are no items.
   */
  activatePreviousItem() {
    const e = this.items, t = Ce(e, this.isActivatable);
    return t && (t.item.tabIndex = -1), Ro(e, t, this.isActivatable, this.wrapNavigation());
  }
}
function ea(i, e) {
  return new CustomEvent("close-menu", {
    bubbles: !0,
    composed: !0,
    detail: { initiator: i, reason: e, itemPath: [i] }
  });
}
const Po = ea, Tt = {
  SPACE: "Space",
  ENTER: "Enter"
}, Mo = {
  CLICK_SELECTION: "click-selection",
  KEYDOWN: "keydown"
}, ta = {
  ESCAPE: "Escape",
  SPACE: Tt.SPACE,
  ENTER: Tt.ENTER
};
function li(i) {
  return Object.values(ta).some((e) => e === i);
}
function oa(i) {
  return Object.values(Tt).some((e) => e === i);
}
function zt(i, e) {
  const t = new Event("md-contains", { bubbles: !0, composed: !0 });
  let o = [];
  const r = (n) => {
    o = n.composedPath();
  };
  return e.addEventListener("md-contains", r), i.dispatchEvent(t), e.removeEventListener("md-contains", r), o.length > 0;
}
const W = {
  NONE: "none",
  LIST_ROOT: "list-root",
  FIRST_ITEM: "first-item",
  LAST_ITEM: "last-item"
};
const Fo = {
  END_START: "end-start",
  START_START: "start-start"
};
class ia {
  /**
   * @param host The host to connect the controller to.
   * @param getProperties A function that returns the properties for the
   * controller.
   */
  constructor(e, t) {
    this.host = e, this.getProperties = t, this.surfaceStylesInternal = {
      display: "none"
    }, this.lastValues = {
      isOpen: !1
    }, this.host.addController(this);
  }
  /**
   * The StyleInfo map to apply to the surface via Lit's stylemap
   */
  get surfaceStyles() {
    return this.surfaceStylesInternal;
  }
  /**
   * Calculates the surface's new position required so that the surface's
   * `surfaceCorner` aligns to the anchor's `anchorCorner` while keeping the
   * surface inside the window viewport. This positioning also respects RTL by
   * checking `getComputedStyle()` on the surface element.
   */
  async position() {
    const { surfaceEl: e, anchorEl: t, anchorCorner: o, surfaceCorner: r, positioning: a, xOffset: n, yOffset: c, disableBlockFlip: p, disableInlineFlip: f, repositionStrategy: u } = this.getProperties(), v = o.toLowerCase().trim(), b = r.toLowerCase().trim();
    if (!e || !t)
      return;
    const x = window.innerWidth, E = window.innerHeight, k = document.createElement("div");
    k.style.opacity = "0", k.style.position = "fixed", k.style.display = "block", k.style.inset = "0", document.body.appendChild(k);
    const S = k.getBoundingClientRect();
    k.remove();
    const D = window.innerHeight - S.bottom, C = window.innerWidth - S.right;
    this.surfaceStylesInternal = {
      display: "block",
      opacity: "0"
    }, this.host.requestUpdate(), await this.host.updateComplete, e.popover && e.isConnected && e.showPopover();
    const R = e.getSurfacePositionClientRect ? e.getSurfacePositionClientRect() : e.getBoundingClientRect(), M = t.getSurfacePositionClientRect ? t.getSurfacePositionClientRect() : t.getBoundingClientRect(), [O, ee] = b.split("-"), [te, ne] = v.split("-"), Re = getComputedStyle(e).direction === "ltr";
    let { blockInset: ue, blockOutOfBoundsCorrection: G, surfaceBlockProperty: mo } = this.calculateBlock({
      surfaceRect: R,
      anchorRect: M,
      anchorBlock: te,
      surfaceBlock: O,
      yOffset: c,
      positioning: a,
      windowInnerHeight: E,
      blockScrollbarHeight: D
    });
    if (G && !p) {
      const it = O === "start" ? "end" : "start", rt = te === "start" ? "end" : "start", X = this.calculateBlock({
        surfaceRect: R,
        anchorRect: M,
        anchorBlock: rt,
        surfaceBlock: it,
        yOffset: c,
        positioning: a,
        windowInnerHeight: E,
        blockScrollbarHeight: D
      });
      G > X.blockOutOfBoundsCorrection && (ue = X.blockInset, G = X.blockOutOfBoundsCorrection, mo = X.surfaceBlockProperty);
    }
    let { inlineInset: Pe, inlineOutOfBoundsCorrection: me, surfaceInlineProperty: vo } = this.calculateInline({
      surfaceRect: R,
      anchorRect: M,
      anchorInline: ne,
      surfaceInline: ee,
      xOffset: n,
      positioning: a,
      isLTR: Re,
      windowInnerWidth: x,
      inlineScrollbarWidth: C
    });
    if (me && !f) {
      const it = ee === "start" ? "end" : "start", rt = ne === "start" ? "end" : "start", X = this.calculateInline({
        surfaceRect: R,
        anchorRect: M,
        anchorInline: rt,
        surfaceInline: it,
        xOffset: n,
        positioning: a,
        isLTR: Re,
        windowInnerWidth: x,
        inlineScrollbarWidth: C
      });
      Math.abs(me) > Math.abs(X.inlineOutOfBoundsCorrection) && (Pe = X.inlineInset, me = X.inlineOutOfBoundsCorrection, vo = X.surfaceInlineProperty);
    }
    u === "move" && (ue = ue - G, Pe = Pe - me), this.surfaceStylesInternal = {
      display: "block",
      opacity: "1",
      [mo]: `${ue}px`,
      [vo]: `${Pe}px`
    }, u === "resize" && (G && (this.surfaceStylesInternal.height = `${R.height - G}px`), me && (this.surfaceStylesInternal.width = `${R.width - me}px`)), this.host.requestUpdate();
  }
  /**
   * Calculates the css property, the inset, and the out of bounds correction
   * for the surface in the block direction.
   */
  calculateBlock(e) {
    const { surfaceRect: t, anchorRect: o, anchorBlock: r, surfaceBlock: a, yOffset: n, positioning: c, windowInnerHeight: p, blockScrollbarHeight: f } = e, u = c === "fixed" || c === "document" ? 1 : 0, v = c === "document" ? 1 : 0, b = a === "start" ? 1 : 0, x = a === "end" ? 1 : 0, k = (r !== a ? 1 : 0) * o.height + n, S = b * o.top + x * (p - o.bottom - f), D = b * window.scrollY - x * window.scrollY, C = Math.abs(Math.min(0, p - S - k - t.height));
    return { blockInset: u * S + v * D + k, blockOutOfBoundsCorrection: C, surfaceBlockProperty: a === "start" ? "inset-block-start" : "inset-block-end" };
  }
  /**
   * Calculates the css property, the inset, and the out of bounds correction
   * for the surface in the inline direction.
   */
  calculateInline(e) {
    const { isLTR: t, surfaceInline: o, anchorInline: r, anchorRect: a, surfaceRect: n, xOffset: c, positioning: p, windowInnerWidth: f, inlineScrollbarWidth: u } = e, v = p === "fixed" || p === "document" ? 1 : 0, b = p === "document" ? 1 : 0, x = t ? 1 : 0, E = t ? 0 : 1, k = o === "start" ? 1 : 0, S = o === "end" ? 1 : 0, C = (r !== o ? 1 : 0) * a.width + c, R = k * a.left + S * (f - a.right - u), M = k * (f - a.right - u) + S * a.left, O = x * R + E * M, ee = k * window.scrollX - S * window.scrollX, te = S * window.scrollX - k * window.scrollX, ne = x * ee + E * te, Re = Math.abs(Math.min(0, f - O - C - n.width)), ue = v * O + C + b * ne;
    let G = o === "start" ? "inset-inline-start" : "inset-inline-end";
    return (p === "document" || p === "fixed") && (o === "start" && t || o === "end" && !t ? G = "left" : G = "right"), {
      inlineInset: ue,
      inlineOutOfBoundsCorrection: Re,
      surfaceInlineProperty: G
    };
  }
  hostUpdate() {
    this.onUpdate();
  }
  hostUpdated() {
    this.onUpdate();
  }
  /**
   * Checks whether the properties passed into the controller have changed since
   * the last positioning. If so, it will reposition if the surface is open or
   * close it if the surface should close.
   */
  async onUpdate() {
    const e = this.getProperties();
    let t = !1;
    for (const [n, c] of Object.entries(e))
      if (t = t || c !== this.lastValues[n], t)
        break;
    const o = this.lastValues.isOpen !== e.isOpen, r = !!e.anchorEl, a = !!e.surfaceEl;
    t && r && a && (this.lastValues.isOpen = e.isOpen, e.isOpen ? (this.lastValues = e, await this.position(), e.onOpen()) : o && (await e.beforeClose(), this.close(), e.onClose()));
  }
  /**
   * Hides the surface.
   */
  close() {
    this.surfaceStylesInternal = {
      display: "none"
    }, this.host.requestUpdate();
    const e = this.getProperties().surfaceEl;
    e?.popover && e?.isConnected && e.hidePopover();
  }
}
const U = {
  INDEX: 0,
  ITEM: 1,
  TEXT: 2
};
class ra {
  /**
   * @param getProperties A function that returns the options of the typeahead
   * controller:
   *
   * {
   *   getItems: A function that returns an array of menu items to be searched.
   *   typeaheadBufferTime: The maximum time between each keystroke to keep the
   *       current type buffer alive.
   * }
   */
  constructor(e) {
    this.getProperties = e, this.typeaheadRecords = [], this.typaheadBuffer = "", this.cancelTypeaheadTimeout = 0, this.isTypingAhead = !1, this.lastActiveRecord = null, this.onKeydown = (t) => {
      this.isTypingAhead ? this.typeahead(t) : this.beginTypeahead(t);
    }, this.endTypeahead = () => {
      this.isTypingAhead = !1, this.typaheadBuffer = "", this.typeaheadRecords = [];
    };
  }
  get items() {
    return this.getProperties().getItems();
  }
  get active() {
    return this.getProperties().active;
  }
  /**
   * Sets up typingahead
   */
  beginTypeahead(e) {
    this.active && (e.code === "Space" || e.code === "Enter" || e.code.startsWith("Arrow") || e.code === "Escape" || (this.isTypingAhead = !0, this.typeaheadRecords = this.items.map((t, o) => [
      o,
      t,
      t.typeaheadText.trim().toLowerCase()
    ]), this.lastActiveRecord = this.typeaheadRecords.find((t) => t[U.ITEM].tabIndex === 0) ?? null, this.lastActiveRecord && (this.lastActiveRecord[U.ITEM].tabIndex = -1), this.typeahead(e)));
  }
  /**
   * Performs the typeahead. Based on the normalized items and the current text
   * buffer, finds the _next_ item with matching text and activates it.
   *
   * @example
   *
   * items: Apple, Banana, Olive, Orange, Cucumber
   * buffer: ''
   * user types: o
   *
   * activates Olive
   *
   * @example
   *
   * items: Apple, Banana, Olive (active), Orange, Cucumber
   * buffer: 'o'
   * user types: l
   *
   * activates Olive
   *
   * @example
   *
   * items: Apple, Banana, Olive (active), Orange, Cucumber
   * buffer: ''
   * user types: o
   *
   * activates Orange
   *
   * @example
   *
   * items: Apple, Banana, Olive, Orange (active), Cucumber
   * buffer: ''
   * user types: o
   *
   * activates Olive
   */
  typeahead(e) {
    if (e.defaultPrevented)
      return;
    if (clearTimeout(this.cancelTypeaheadTimeout), e.code === "Enter" || e.code.startsWith("Arrow") || e.code === "Escape") {
      this.endTypeahead(), this.lastActiveRecord && (this.lastActiveRecord[U.ITEM].tabIndex = -1);
      return;
    }
    e.code === "Space" && e.preventDefault(), this.cancelTypeaheadTimeout = setTimeout(this.endTypeahead, this.getProperties().typeaheadBufferTime), this.typaheadBuffer += e.key.toLowerCase();
    const t = this.lastActiveRecord ? this.lastActiveRecord[U.INDEX] : -1, o = this.typeaheadRecords.length, r = (p) => (p[U.INDEX] + o - t) % o, a = this.typeaheadRecords.filter((p) => !p[U.ITEM].disabled && p[U.TEXT].startsWith(this.typaheadBuffer)).sort((p, f) => r(p) - r(f));
    if (a.length === 0) {
      clearTimeout(this.cancelTypeaheadTimeout), this.lastActiveRecord && (this.lastActiveRecord[U.ITEM].tabIndex = -1), this.endTypeahead();
      return;
    }
    const n = this.typaheadBuffer.length === 1;
    let c;
    this.lastActiveRecord === a[0] && n ? c = a[1] ?? a[0] : c = a[0], this.lastActiveRecord && (this.lastActiveRecord[U.ITEM].tabIndex = -1), this.lastActiveRecord = c, c[U.ITEM].tabIndex = 0, c[U.ITEM].focus();
  }
}
const di = 200, ci = /* @__PURE__ */ new Set([
  F.ArrowDown,
  F.ArrowUp,
  F.Home,
  F.End
]), aa = /* @__PURE__ */ new Set([
  F.ArrowLeft,
  F.ArrowRight,
  ...ci
]);
function sa(i = document) {
  let e = i.activeElement;
  for (; e && e?.shadowRoot?.activeElement; )
    e = e.shadowRoot.activeElement;
  return e;
}
class A extends g {
  /**
   * Whether the menu is animating upwards or downwards when opening. This is
   * helpful for calculating some animation calculations.
   */
  get openDirection() {
    return this.menuCorner.split("-")[0] === "start" ? "DOWN" : "UP";
  }
  /**
   * The element which the menu should align to. If `anchor` is set to a
   * non-empty idref string, then `anchorEl` will resolve to the element with
   * the given id in the same root node. Otherwise, `null`.
   */
  get anchorElement() {
    return this.anchor ? this.getRootNode().querySelector(`#${this.anchor}`) : this.currentAnchorElement;
  }
  set anchorElement(e) {
    this.currentAnchorElement = e, this.requestUpdate("anchorElement");
  }
  constructor() {
    super(), this.anchor = "", this.positioning = "absolute", this.quick = !1, this.hasOverflow = !1, this.open = !1, this.xOffset = 0, this.yOffset = 0, this.noHorizontalFlip = !1, this.noVerticalFlip = !1, this.typeaheadDelay = di, this.anchorCorner = Fo.END_START, this.menuCorner = Fo.START_START, this.stayOpenOnOutsideClick = !1, this.stayOpenOnFocusout = !1, this.skipRestoreFocus = !1, this.defaultFocus = W.FIRST_ITEM, this.noNavigationWrap = !1, this.typeaheadActive = !0, this.isSubmenu = !1, this.pointerPath = [], this.isRepositioning = !1, this.openCloseAnimationSignal = Zi(), this.listController = new Jr({
      isItem: (e) => e.hasAttribute("md-menu-item"),
      getPossibleItems: () => this.slotItems,
      isRtl: () => getComputedStyle(this).direction === "rtl",
      deactivateItem: (e) => {
        e.selected = !1, e.tabIndex = -1;
      },
      activateItem: (e) => {
        e.selected = !0, e.tabIndex = 0;
      },
      isNavigableKey: (e) => {
        if (!this.isSubmenu)
          return aa.has(e);
        const o = getComputedStyle(this).direction === "rtl" ? F.ArrowLeft : F.ArrowRight;
        return e === o ? !0 : ci.has(e);
      },
      wrapNavigation: () => !this.noNavigationWrap
    }), this.lastFocusedElement = null, this.typeaheadController = new ra(() => ({
      getItems: () => this.items,
      typeaheadBufferTime: this.typeaheadDelay,
      active: this.typeaheadActive
    })), this.currentAnchorElement = null, this.internals = // Cast needed for closure
    this.attachInternals(), this.menuPositionController = new ia(this, () => ({
      anchorCorner: this.anchorCorner,
      surfaceCorner: this.menuCorner,
      surfaceEl: this.surfaceEl,
      anchorEl: this.anchorElement,
      positioning: this.positioning === "popover" ? "document" : this.positioning,
      isOpen: this.open,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      disableBlockFlip: this.noVerticalFlip,
      disableInlineFlip: this.noHorizontalFlip,
      onOpen: this.onOpened,
      beforeClose: this.beforeClose,
      onClose: this.onClosed,
      // We can't resize components that have overflow like menus with
      // submenus because the overflow-y will show menu items / content
      // outside the bounds of the menu. Popover API fixes this because each
      // submenu is hoisted to the top-layer and are not considered overflow
      // content.
      repositionStrategy: this.hasOverflow && this.positioning !== "popover" ? "move" : "resize"
    })), this.onWindowResize = () => {
      this.isRepositioning || this.positioning !== "document" && this.positioning !== "fixed" && this.positioning !== "popover" || (this.isRepositioning = !0, this.reposition(), this.isRepositioning = !1);
    }, this.handleFocusout = async (e) => {
      const t = this.anchorElement;
      if (this.stayOpenOnFocusout || !this.open || this.pointerPath.includes(t))
        return;
      if (e.relatedTarget) {
        if (zt(e.relatedTarget, this) || this.pointerPath.length !== 0 && zt(e.relatedTarget, t))
          return;
      } else if (this.pointerPath.includes(this))
        return;
      const o = this.skipRestoreFocus;
      this.skipRestoreFocus = !0, this.close(), await this.updateComplete, this.skipRestoreFocus = o;
    }, this.onOpened = async () => {
      this.lastFocusedElement = sa();
      const e = this.items, t = Ce(e);
      t && this.defaultFocus !== W.NONE && (t.item.tabIndex = -1);
      let o = !this.quick;
      switch (this.quick ? this.dispatchEvent(new Event("opening")) : o = !!await this.animateOpen(), this.defaultFocus) {
        case W.FIRST_ITEM:
          const r = co(e);
          r && (r.tabIndex = 0, r.focus(), await r.updateComplete);
          break;
        case W.LAST_ITEM:
          const a = ni(e);
          a && (a.tabIndex = 0, a.focus(), await a.updateComplete);
          break;
        case W.LIST_ROOT:
          this.focus();
          break;
        default:
        case W.NONE:
          break;
      }
      o || this.dispatchEvent(new Event("opened"));
    }, this.beforeClose = async () => {
      this.open = !1, this.skipRestoreFocus || this.lastFocusedElement?.focus?.(), this.quick || await this.animateClose();
    }, this.onClosed = () => {
      this.quick && (this.dispatchEvent(new Event("closing")), this.dispatchEvent(new Event("closed")));
    }, this.onWindowPointerdown = (e) => {
      this.pointerPath = e.composedPath();
    }, this.onDocumentClick = (e) => {
      if (!this.open)
        return;
      const t = e.composedPath();
      !this.stayOpenOnOutsideClick && !t.includes(this) && !t.includes(this.anchorElement) && (this.open = !1);
    }, this.internals.role = "menu", this.addEventListener("keydown", this.handleKeydown), this.addEventListener("keydown", this.captureKeydown, { capture: !0 }), this.addEventListener("focusout", this.handleFocusout);
  }
  /**
   * The menu items associated with this menu. The items must be `MenuItem`s and
   * have both the `md-menu-item` and `md-list-item` attributes.
   */
  get items() {
    return this.listController.items;
  }
  willUpdate(e) {
    if (e.has("open")) {
      if (this.open) {
        this.removeAttribute("aria-hidden");
        return;
      }
      this.setAttribute("aria-hidden", "true");
    }
  }
  update(e) {
    e.has("open") && (this.open ? this.setUpGlobalEventListeners() : this.cleanUpGlobalEventListeners()), e.has("positioning") && this.positioning === "popover" && // type required for Google JS conformance
    !this.showPopover && (this.positioning = "fixed"), super.update(e);
  }
  connectedCallback() {
    super.connectedCallback(), this.open && this.setUpGlobalEventListeners();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.cleanUpGlobalEventListeners();
  }
  getBoundingClientRect() {
    return this.surfaceEl ? this.surfaceEl.getBoundingClientRect() : super.getBoundingClientRect();
  }
  getClientRects() {
    return this.surfaceEl ? this.surfaceEl.getClientRects() : super.getClientRects();
  }
  render() {
    return this.renderSurface();
  }
  /**
   * Renders the positionable surface element and its contents.
   */
  renderSurface() {
    return l`
      <div
        class="menu ${V(this.getSurfaceClasses())}"
        style=${be(this.menuPositionController.surfaceStyles)}
        popover=${this.positioning === "popover" ? "manual" : h}>
        ${this.renderElevation()}
        <div class="items">
          <div class="item-padding"> ${this.renderMenuItems()} </div>
        </div>
      </div>
    `;
  }
  /**
   * Renders the menu items' slot
   */
  renderMenuItems() {
    return l`<slot
      @close-menu=${this.onCloseMenu}
      @deactivate-items=${this.onDeactivateItems}
      @request-activation=${this.onRequestActivation}
      @deactivate-typeahead=${this.handleDeactivateTypeahead}
      @activate-typeahead=${this.handleActivateTypeahead}
      @stay-open-on-focusout=${this.handleStayOpenOnFocusout}
      @close-on-focusout=${this.handleCloseOnFocusout}
      @slotchange=${this.listController.onSlotchange}></slot>`;
  }
  /**
   * Renders the elevation component.
   */
  renderElevation() {
    return l`<md-elevation part="elevation"></md-elevation>`;
  }
  getSurfaceClasses() {
    return {
      open: this.open,
      fixed: this.positioning === "fixed",
      "has-overflow": this.hasOverflow
    };
  }
  captureKeydown(e) {
    e.target === this && !e.defaultPrevented && li(e.code) && (e.preventDefault(), this.close()), this.typeaheadController.onKeydown(e);
  }
  /**
   * Performs the opening animation:
   *
   * https://direct.googleplex.com/#/spec/295000003+271060003
   *
   * @return A promise that resolve to `true` if the animation was aborted,
   *     `false` if it was not aborted.
   */
  async animateOpen() {
    const e = this.surfaceEl, t = this.slotEl;
    if (!e || !t)
      return !0;
    const o = this.openDirection;
    this.dispatchEvent(new Event("opening")), e.classList.toggle("animating", !0);
    const r = this.openCloseAnimationSignal.start(), a = e.offsetHeight, n = o === "UP", c = this.items, p = 500, f = 50, u = 250, v = (p - u) / c.length, b = e.animate([{ height: "0px" }, { height: `${a}px` }], {
      duration: p,
      easing: j.EMPHASIZED
    }), x = t.animate([
      { transform: n ? `translateY(-${a}px)` : "" },
      { transform: "" }
    ], { duration: p, easing: j.EMPHASIZED }), E = e.animate([{ opacity: 0 }, { opacity: 1 }], f), k = [];
    for (let C = 0; C < c.length; C++) {
      const R = n ? c.length - 1 - C : C, M = c[R], O = M.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: u,
        delay: v * C
      });
      M.classList.toggle("md-menu-hidden", !0), O.addEventListener("finish", () => {
        M.classList.toggle("md-menu-hidden", !1);
      }), k.push([M, O]);
    }
    let S = (C) => {
    };
    const D = new Promise((C) => {
      S = C;
    });
    return r.addEventListener("abort", () => {
      b.cancel(), x.cancel(), E.cancel(), k.forEach(([C, R]) => {
        C.classList.toggle("md-menu-hidden", !1), R.cancel();
      }), S(!0);
    }), b.addEventListener("finish", () => {
      e.classList.toggle("animating", !1), this.openCloseAnimationSignal.finish(), S(!1);
    }), await D;
  }
  /**
   * Performs the closing animation:
   *
   * https://direct.googleplex.com/#/spec/295000003+271060003
   */
  animateClose() {
    let e;
    const t = new Promise((O) => {
      e = O;
    }), o = this.surfaceEl, r = this.slotEl;
    if (!o || !r)
      return e(!1), t;
    const n = this.openDirection === "UP";
    this.dispatchEvent(new Event("closing")), o.classList.toggle("animating", !0);
    const c = this.openCloseAnimationSignal.start(), p = o.offsetHeight, f = this.items, u = 150, v = 50, b = u - v, x = 50, E = 50, k = 0.35, S = (u - E - x) / f.length, D = o.animate([
      { height: `${p}px` },
      { height: `${p * k}px` }
    ], {
      duration: u,
      easing: j.EMPHASIZED_ACCELERATE
    }), C = r.animate([
      { transform: "" },
      {
        transform: n ? `translateY(-${p * (1 - k)}px)` : ""
      }
    ], { duration: u, easing: j.EMPHASIZED_ACCELERATE }), R = o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: v, delay: b }), M = [];
    for (let O = 0; O < f.length; O++) {
      const ee = n ? O : f.length - 1 - O, te = f[ee], ne = te.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: x,
        delay: E + S * O
      });
      ne.addEventListener("finish", () => {
        te.classList.toggle("md-menu-hidden", !0);
      }), M.push([te, ne]);
    }
    return c.addEventListener("abort", () => {
      D.cancel(), C.cancel(), R.cancel(), M.forEach(([O, ee]) => {
        ee.cancel(), O.classList.toggle("md-menu-hidden", !1);
      }), e(!1);
    }), D.addEventListener("finish", () => {
      o.classList.toggle("animating", !1), M.forEach(([O]) => {
        O.classList.toggle("md-menu-hidden", !1);
      }), this.openCloseAnimationSignal.finish(), this.dispatchEvent(new Event("closed")), e(!0);
    }), t;
  }
  handleKeydown(e) {
    this.pointerPath = [], this.listController.handleKeydown(e);
  }
  setUpGlobalEventListeners() {
    document.addEventListener("click", this.onDocumentClick, { capture: !0 }), window.addEventListener("pointerdown", this.onWindowPointerdown), document.addEventListener("resize", this.onWindowResize, { passive: !0 }), window.addEventListener("resize", this.onWindowResize, { passive: !0 });
  }
  cleanUpGlobalEventListeners() {
    document.removeEventListener("click", this.onDocumentClick, {
      capture: !0
    }), window.removeEventListener("pointerdown", this.onWindowPointerdown), document.removeEventListener("resize", this.onWindowResize), window.removeEventListener("resize", this.onWindowResize);
  }
  onCloseMenu() {
    this.close();
  }
  onDeactivateItems(e) {
    e.stopPropagation(), this.listController.onDeactivateItems();
  }
  onRequestActivation(e) {
    e.stopPropagation(), this.listController.onRequestActivation(e);
  }
  handleDeactivateTypeahead(e) {
    e.stopPropagation(), this.typeaheadActive = !1;
  }
  handleActivateTypeahead(e) {
    e.stopPropagation(), this.typeaheadActive = !0;
  }
  handleStayOpenOnFocusout(e) {
    e.stopPropagation(), this.stayOpenOnFocusout = !0;
  }
  handleCloseOnFocusout(e) {
    e.stopPropagation(), this.stayOpenOnFocusout = !1;
  }
  close() {
    this.open = !1, this.slotItems.forEach((t) => {
      t.close?.();
    });
  }
  show() {
    this.open = !0;
  }
  /**
   * Activates the next item in the menu. If at the end of the menu, the first
   * item will be activated.
   *
   * @return The activated menu item or `null` if there are no items.
   */
  activateNextItem() {
    return this.listController.activateNextItem() ?? null;
  }
  /**
   * Activates the previous item in the menu. If at the start of the menu, the
   * last item will be activated.
   *
   * @return The activated menu item or `null` if there are no items.
   */
  activatePreviousItem() {
    return this.listController.activatePreviousItem() ?? null;
  }
  /**
   * Repositions the menu if it is open.
   *
   * Useful for the case where document or window-positioned menus have their
   * anchors moved while open.
   */
  reposition() {
    this.open && this.menuPositionController.position();
  }
}
s([
  w(".menu")
], A.prototype, "surfaceEl", void 0);
s([
  w("slot")
], A.prototype, "slotEl", void 0);
s([
  d()
], A.prototype, "anchor", void 0);
s([
  d()
], A.prototype, "positioning", void 0);
s([
  d({ type: Boolean })
], A.prototype, "quick", void 0);
s([
  d({ type: Boolean, attribute: "has-overflow" })
], A.prototype, "hasOverflow", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], A.prototype, "open", void 0);
s([
  d({ type: Number, attribute: "x-offset" })
], A.prototype, "xOffset", void 0);
s([
  d({ type: Number, attribute: "y-offset" })
], A.prototype, "yOffset", void 0);
s([
  d({ type: Boolean, attribute: "no-horizontal-flip" })
], A.prototype, "noHorizontalFlip", void 0);
s([
  d({ type: Boolean, attribute: "no-vertical-flip" })
], A.prototype, "noVerticalFlip", void 0);
s([
  d({ type: Number, attribute: "typeahead-delay" })
], A.prototype, "typeaheadDelay", void 0);
s([
  d({ attribute: "anchor-corner" })
], A.prototype, "anchorCorner", void 0);
s([
  d({ attribute: "menu-corner" })
], A.prototype, "menuCorner", void 0);
s([
  d({ type: Boolean, attribute: "stay-open-on-outside-click" })
], A.prototype, "stayOpenOnOutsideClick", void 0);
s([
  d({ type: Boolean, attribute: "stay-open-on-focusout" })
], A.prototype, "stayOpenOnFocusout", void 0);
s([
  d({ type: Boolean, attribute: "skip-restore-focus" })
], A.prototype, "skipRestoreFocus", void 0);
s([
  d({ attribute: "default-focus" })
], A.prototype, "defaultFocus", void 0);
s([
  d({ type: Boolean, attribute: "no-navigation-wrap" })
], A.prototype, "noNavigationWrap", void 0);
s([
  K({ flatten: !0 })
], A.prototype, "slotItems", void 0);
s([
  z()
], A.prototype, "typeaheadActive", void 0);
const na = m`:host{--md-elevation-level: var(--md-menu-container-elevation, 2);--md-elevation-shadow-color: var(--md-menu-container-shadow-color, var(--md-sys-color-shadow, #000));min-width:112px;color:unset;display:contents}md-focus-ring{--md-focus-ring-shape: var(--md-menu-container-shape, var(--md-sys-shape-corner-extra-small, 4px))}.menu{border-radius:var(--md-menu-container-shape, var(--md-sys-shape-corner-extra-small, 4px));display:none;inset:auto;border:none;padding:0px;overflow:visible;background-color:rgba(0,0,0,0);color:inherit;opacity:0;z-index:20;position:absolute;user-select:none;max-height:inherit;height:inherit;min-width:inherit;max-width:inherit;scrollbar-width:inherit}.menu::backdrop{display:none}.fixed{position:fixed}.items{display:block;list-style-type:none;margin:0;outline:none;box-sizing:border-box;background-color:var(--md-menu-container-color, var(--md-sys-color-surface-container, #f3edf7));height:inherit;max-height:inherit;overflow:auto;min-width:inherit;max-width:inherit;border-radius:inherit;scrollbar-width:inherit}.item-padding{padding-block:var(--md-menu-top-space, 8px) var(--md-menu-bottom-space, 8px)}.has-overflow:not([popover]) .items{overflow:visible}.has-overflow.animating .items,.animating .items{overflow:hidden}.has-overflow.animating .items{pointer-events:none}.animating ::slotted(.md-menu-hidden){opacity:0}slot{display:block;height:inherit;max-height:inherit}::slotted(:is(md-divider,[role=separator])){margin:8px 0}@media(forced-colors: active){.menu{border-style:solid;border-color:CanvasText;border-width:1px}}
`;
let At = class extends A {
};
At.styles = [na];
At = s([
  _("md-menu")
], At);
class la extends so {
  computeValidity(e) {
    return this.selectControl || (this.selectControl = document.createElement("select")), Jt(l`<option value=${e.value}></option>`, this.selectControl), this.selectControl.value = e.value, this.selectControl.required = e.required, {
      validity: this.selectControl.validity,
      validationMessage: this.selectControl.validationMessage
    };
  }
  equals(e, t) {
    return e.value === t.value && e.required === t.required;
  }
  copy({ value: e, required: t }) {
    return { value: e, required: t };
  }
}
function da(i) {
  const e = [];
  for (let t = 0; t < i.length; t++) {
    const o = i[t];
    o.selected && e.push([o, t]);
  }
  return e;
}
var Lo;
const Ue = /* @__PURE__ */ Symbol("value"), ca = Q(ii(ro(ao(Oe(g)))));
class $ extends ca {
  /**
   * The value of the currently selected option.
   *
   * Note: For SSR, set `[selected]` on the requested option and `displayText`
   * rather than setting `value` setting `value` will incur a DOM query.
   */
  get value() {
    return this[Ue];
  }
  set value(e) {
    this.lastUserSetValue = e, this.select(e);
  }
  get options() {
    return this.menu?.items ?? [];
  }
  /**
   * The index of the currently selected option.
   *
   * Note: For SSR, set `[selected]` on the requested option and `displayText`
   * rather than setting `selectedIndex` setting `selectedIndex` will incur a
   * DOM query.
   */
  get selectedIndex() {
    const [e, t] = (this.getSelectedOptions() ?? [])[0] ?? [];
    return t ?? -1;
  }
  set selectedIndex(e) {
    this.lastUserSetSelectedIndex = e, this.selectIndex(e);
  }
  /**
   * Returns an array of selected options.
   *
   * NOTE: md-select only supports single selection.
   */
  get selectedOptions() {
    return (this.getSelectedOptions() ?? []).map(([e]) => e);
  }
  get hasError() {
    return this.error || this.nativeError;
  }
  constructor() {
    super(), this.quick = !1, this.required = !1, this.errorText = "", this.label = "", this.noAsterisk = !1, this.supportingText = "", this.error = !1, this.menuPositioning = "popover", this.clampMenuWidth = !1, this.typeaheadDelay = di, this.hasLeadingIcon = !1, this.displayText = "", this.menuAlign = "start", this[Lo] = "", this.lastUserSetValue = null, this.lastUserSetSelectedIndex = null, this.lastSelectedOption = null, this.lastSelectedOptionRecords = [], this.nativeError = !1, this.nativeErrorText = "", this.focused = !1, this.open = !1, this.defaultFocus = W.NONE, this.prevOpen = this.open, this.selectWidth = 0, this.addEventListener("focus", this.handleFocus.bind(this)), this.addEventListener("blur", this.handleBlur.bind(this));
  }
  /**
   * Selects an option given the value of the option, and updates MdSelect's
   * value.
   */
  select(e) {
    const t = this.options.find((o) => o.value === e);
    t && this.selectItem(t);
  }
  /**
   * Selects an option given the index of the option, and updates MdSelect's
   * value.
   */
  selectIndex(e) {
    const t = this.options[e];
    t && this.selectItem(t);
  }
  /**
   * Reset the select to its default value.
   */
  reset() {
    for (const e of this.options)
      e.selected = e.hasAttribute("selected");
    this.updateValueAndDisplayText(), this.nativeError = !1, this.nativeErrorText = "";
  }
  /** Shows the picker. If it's already open, this is a no-op. */
  showPicker() {
    this.open = !0;
  }
  [(Lo = Ue, Qe)](e) {
    e?.preventDefault();
    const t = this.getErrorText();
    this.nativeError = !!e, this.nativeErrorText = this.validationMessage, t === this.getErrorText() && this.field?.reannounceError();
  }
  update(e) {
    if (this.hasUpdated || this.initUserSelection(), this.prevOpen !== this.open && this.open) {
      const t = this.getBoundingClientRect();
      this.selectWidth = t.width;
    }
    this.prevOpen = this.open, super.update(e);
  }
  render() {
    return l`
      <span
        class="select ${V(this.getRenderClasses())}"
        @focusout=${this.handleFocusout}>
        ${this.renderField()} ${this.renderMenu()}
      </span>
    `;
  }
  async firstUpdated(e) {
    await this.menu?.updateComplete, this.lastSelectedOptionRecords.length || this.initUserSelection(), !this.lastSelectedOptionRecords.length && !this.options.length && setTimeout(() => {
      this.updateValueAndDisplayText();
    }), super.firstUpdated(e);
  }
  getRenderClasses() {
    return {
      disabled: this.disabled,
      error: this.error,
      open: this.open
    };
  }
  renderField() {
    const e = this.ariaLabel || this.label;
    return lo`
      <${this.fieldTag}
          aria-haspopup="listbox"
          role="combobox"
          part="field"
          id="field"
          tabindex=${this.disabled ? "-1" : "0"}
          aria-label=${e || h}
          aria-describedby="description"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls="listbox"
          class="field"
          label=${this.label}
          ?no-asterisk=${this.noAsterisk}
          .focused=${this.focused || this.open}
          .populated=${!!this.displayText}
          .disabled=${this.disabled}
          .required=${this.required}
          .error=${this.hasError}
          ?has-start=${this.hasLeadingIcon}
          has-end
          supporting-text=${this.supportingText}
          error-text=${this.getErrorText()}
          @keydown=${this.handleKeydown}
          @click=${this.handleClick}>
         ${this.renderFieldContent()}
         <div id="description" slot="aria-describedby"></div>
      </${this.fieldTag}>`;
  }
  renderFieldContent() {
    return [
      this.renderLeadingIcon(),
      this.renderLabel(),
      this.renderTrailingIcon()
    ];
  }
  renderLeadingIcon() {
    return l`
      <span class="icon leading" slot="start">
        <slot name="leading-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `;
  }
  renderTrailingIcon() {
    return l`
      <span class="icon trailing" slot="end">
        <slot name="trailing-icon" @slotchange=${this.handleIconChange}>
          <svg height="5" viewBox="7 10 10 5" focusable="false">
            <polygon
              class="down"
              stroke="none"
              fill-rule="evenodd"
              points="7 10 12 15 17 10"></polygon>
            <polygon
              class="up"
              stroke="none"
              fill-rule="evenodd"
              points="7 15 12 10 17 15"></polygon>
          </svg>
        </slot>
      </span>
    `;
  }
  renderLabel() {
    return l`<div id="label">${this.displayText || l`&nbsp;`}</div>`;
  }
  renderMenu() {
    const e = this.label || this.ariaLabel;
    return l`<div class="menu-wrapper">
      <md-menu
        id="listbox"
        .defaultFocus=${this.defaultFocus}
        role="listbox"
        tabindex="-1"
        aria-label=${e || h}
        stay-open-on-focusout
        part="menu"
        exportparts="focus-ring: menu-focus-ring"
        anchor="field"
        style=${be({
      "--__menu-min-width": `${this.selectWidth}px`,
      "--__menu-max-width": this.clampMenuWidth ? `${this.selectWidth}px` : void 0
    })}
        no-navigation-wrap
        .open=${this.open}
        .quick=${this.quick}
        .positioning=${this.menuPositioning}
        .typeaheadDelay=${this.typeaheadDelay}
        .anchorCorner=${this.menuAlign === "start" ? "end-start" : "end-end"}
        .menuCorner=${this.menuAlign === "start" ? "start-start" : "start-end"}
        @opening=${this.handleOpening}
        @opened=${this.redispatchEvent}
        @closing=${this.redispatchEvent}
        @closed=${this.handleClosed}
        @close-menu=${this.handleCloseMenu}
        @request-selection=${this.handleRequestSelection}
        @request-deselection=${this.handleRequestDeselection}>
        ${this.renderMenuContent()}
      </md-menu>
    </div>`;
  }
  renderMenuContent() {
    return l`<slot></slot>`;
  }
  /**
   * Handles opening the select on keydown and typahead selection when the menu
   * is closed.
   */
  handleKeydown(e) {
    if (this.open || this.disabled || !this.menu)
      return;
    const t = this.menu.typeaheadController, o = e.code === "Space" || e.code === "ArrowDown" || e.code === "ArrowUp" || e.code === "End" || e.code === "Home" || e.code === "Enter";
    if (!t.isTypingAhead && o) {
      switch (e.preventDefault(), this.open = !0, e.code) {
        case "Space":
        case "ArrowDown":
        case "Enter":
          this.defaultFocus = W.NONE;
          break;
        case "End":
          this.defaultFocus = W.LAST_ITEM;
          break;
        case "ArrowUp":
        case "Home":
          this.defaultFocus = W.FIRST_ITEM;
          break;
      }
      return;
    }
    if (e.key.length === 1) {
      t.onKeydown(e), e.preventDefault();
      const { lastActiveRecord: a } = t;
      if (!a)
        return;
      this.labelEl?.setAttribute?.("aria-live", "polite"), this.selectItem(a[U.ITEM]) && this.dispatchInteractionEvents();
    }
  }
  handleClick() {
    this.open = !this.open;
  }
  handleFocus() {
    this.focused = !0;
  }
  handleBlur() {
    this.focused = !1;
  }
  /**
   * Handles closing the menu when the focus leaves the select's subtree.
   */
  handleFocusout(e) {
    e.relatedTarget && zt(e.relatedTarget, this) || (this.open = !1);
  }
  /**
   * Gets a list of all selected select options as a list item record array.
   *
   * @return An array of selected list option records.
   */
  getSelectedOptions() {
    if (!this.menu)
      return this.lastSelectedOptionRecords = [], null;
    const e = this.menu.items;
    return this.lastSelectedOptionRecords = da(e), this.lastSelectedOptionRecords;
  }
  async getUpdateComplete() {
    return await this.menu?.updateComplete, super.getUpdateComplete();
  }
  /**
   * Gets the selected options from the DOM, and updates the value and display
   * text to the first selected option's value and headline respectively.
   *
   * @return Whether or not the selected option has changed since last update.
   */
  updateValueAndDisplayText() {
    const e = this.getSelectedOptions() ?? [];
    let t = !1;
    if (e.length) {
      const [o] = e[0];
      t = this.lastSelectedOption !== o, this.lastSelectedOption = o, this[Ue] = o.value, this.displayText = o.displayText;
    } else
      t = this.lastSelectedOption !== null, this.lastSelectedOption = null, this[Ue] = "", this.displayText = "";
    return t;
  }
  /**
   * Focuses and activates the last selected item upon opening, and resets other
   * active items.
   */
  async handleOpening(e) {
    if (this.labelEl?.removeAttribute?.("aria-live"), this.redispatchEvent(e), this.defaultFocus !== W.NONE)
      return;
    const t = this.menu.items, o = Ce(t)?.item;
    let [r] = this.lastSelectedOptionRecords[0] ?? [null];
    o && o !== r && (o.tabIndex = -1), r = r ?? t[0], r && (r.tabIndex = 0, r.focus());
  }
  redispatchEvent(e) {
    De(this, e);
  }
  handleClosed(e) {
    this.open = !1, this.redispatchEvent(e);
  }
  /**
   * Determines the reason for closing, and updates the UI accordingly.
   */
  handleCloseMenu(e) {
    const t = e.detail.reason, o = e.detail.itemPath[0];
    this.open = !1;
    let r = !1;
    t.kind === "click-selection" ? r = this.selectItem(o) : t.kind === "keydown" && oa(t.key) ? r = this.selectItem(o) : (o.tabIndex = -1, o.blur()), r && this.dispatchInteractionEvents();
  }
  /**
   * Selects a given option, deselects other options, and updates the UI.
   *
   * @return Whether the last selected option has changed.
   */
  selectItem(e) {
    return (this.getSelectedOptions() ?? []).forEach(([o]) => {
      e !== o && (o.selected = !1);
    }), e.selected = !0, this.updateValueAndDisplayText();
  }
  /**
   * Handles updating selection when an option element requests selection via
   * property / attribute change.
   */
  handleRequestSelection(e) {
    const t = e.target;
    this.lastSelectedOptionRecords.some(([o]) => o === t) || this.selectItem(t);
  }
  /**
   * Handles updating selection when an option element requests deselection via
   * property / attribute change.
   */
  handleRequestDeselection(e) {
    const t = e.target;
    this.lastSelectedOptionRecords.some(([o]) => o === t) && this.updateValueAndDisplayText();
  }
  /**
   * Attempts to initialize the selected option from user-settable values like
   * SSR, setting `value`, or `selectedIndex` at startup.
   */
  initUserSelection() {
    this.lastUserSetValue && !this.lastSelectedOptionRecords.length ? this.select(this.lastUserSetValue) : this.lastUserSetSelectedIndex !== null && !this.lastSelectedOptionRecords.length ? this.selectIndex(this.lastUserSetSelectedIndex) : this.updateValueAndDisplayText();
  }
  handleIconChange() {
    this.hasLeadingIcon = this.leadingIcons.length > 0;
  }
  /**
   * Dispatches the `input` and `change` events.
   */
  dispatchInteractionEvents() {
    this.dispatchEvent(new Event("input", { bubbles: !0, composed: !0 })), this.dispatchEvent(new Event("change", { bubbles: !0 }));
  }
  getErrorText() {
    return this.error ? this.errorText : this.nativeErrorText;
  }
  [fe]() {
    return this.value;
  }
  formResetCallback() {
    this.reset();
  }
  formStateRestoreCallback(e) {
    this.value = e;
  }
  click() {
    this.field?.click();
  }
  [Te]() {
    return new la(() => this);
  }
  [ze]() {
    return this.field;
  }
}
$.shadowRootOptions = {
  ...g.shadowRootOptions,
  delegatesFocus: !0
};
s([
  d({ type: Boolean })
], $.prototype, "quick", void 0);
s([
  d({ type: Boolean })
], $.prototype, "required", void 0);
s([
  d({ type: String, attribute: "error-text" })
], $.prototype, "errorText", void 0);
s([
  d()
], $.prototype, "label", void 0);
s([
  d({ type: Boolean, attribute: "no-asterisk" })
], $.prototype, "noAsterisk", void 0);
s([
  d({ type: String, attribute: "supporting-text" })
], $.prototype, "supportingText", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], $.prototype, "error", void 0);
s([
  d({ attribute: "menu-positioning" })
], $.prototype, "menuPositioning", void 0);
s([
  d({ type: Boolean, attribute: "clamp-menu-width" })
], $.prototype, "clampMenuWidth", void 0);
s([
  d({ type: Number, attribute: "typeahead-delay" })
], $.prototype, "typeaheadDelay", void 0);
s([
  d({ type: Boolean, attribute: "has-leading-icon" })
], $.prototype, "hasLeadingIcon", void 0);
s([
  d({ attribute: "display-text" })
], $.prototype, "displayText", void 0);
s([
  d({ attribute: "menu-align" })
], $.prototype, "menuAlign", void 0);
s([
  d()
], $.prototype, "value", null);
s([
  d({ type: Number, attribute: "selected-index" })
], $.prototype, "selectedIndex", null);
s([
  z()
], $.prototype, "nativeError", void 0);
s([
  z()
], $.prototype, "nativeErrorText", void 0);
s([
  z()
], $.prototype, "focused", void 0);
s([
  z()
], $.prototype, "open", void 0);
s([
  z()
], $.prototype, "defaultFocus", void 0);
s([
  w(".field")
], $.prototype, "field", void 0);
s([
  w("md-menu")
], $.prototype, "menu", void 0);
s([
  w("#label")
], $.prototype, "labelEl", void 0);
s([
  K({ slot: "leading-icon", flatten: !0 })
], $.prototype, "leadingIcons", void 0);
class pa extends $ {
  constructor() {
    super(...arguments), this.fieldTag = re`md-filled-field`;
  }
}
const ha = m`:host{--_text-field-active-indicator-color: var(--md-filled-select-text-field-active-indicator-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-active-indicator-height: var(--md-filled-select-text-field-active-indicator-height, 1px);--_text-field-container-color: var(--md-filled-select-text-field-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_text-field-disabled-active-indicator-color: var(--md-filled-select-text-field-disabled-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-active-indicator-height: var(--md-filled-select-text-field-disabled-active-indicator-height, 1px);--_text-field-disabled-active-indicator-opacity: var(--md-filled-select-text-field-disabled-active-indicator-opacity, 0.38);--_text-field-disabled-container-color: var(--md-filled-select-text-field-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-container-opacity: var(--md-filled-select-text-field-disabled-container-opacity, 0.04);--_text-field-disabled-input-text-color: var(--md-filled-select-text-field-disabled-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-input-text-opacity: var(--md-filled-select-text-field-disabled-input-text-opacity, 0.38);--_text-field-disabled-label-text-color: var(--md-filled-select-text-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-label-text-opacity: var(--md-filled-select-text-field-disabled-label-text-opacity, 0.38);--_text-field-disabled-leading-icon-color: var(--md-filled-select-text-field-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-leading-icon-opacity: var(--md-filled-select-text-field-disabled-leading-icon-opacity, 0.38);--_text-field-disabled-supporting-text-color: var(--md-filled-select-text-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-supporting-text-opacity: var(--md-filled-select-text-field-disabled-supporting-text-opacity, 0.38);--_text-field-disabled-trailing-icon-color: var(--md-filled-select-text-field-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-trailing-icon-opacity: var(--md-filled-select-text-field-disabled-trailing-icon-opacity, 0.38);--_text-field-error-active-indicator-color: var(--md-filled-select-text-field-error-active-indicator-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-active-indicator-color: var(--md-filled-select-text-field-error-focus-active-indicator-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-input-text-color: var(--md-filled-select-text-field-error-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-focus-label-text-color: var(--md-filled-select-text-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-leading-icon-color: var(--md-filled-select-text-field-error-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-focus-supporting-text-color: var(--md-filled-select-text-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-trailing-icon-color: var(--md-filled-select-text-field-error-focus-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_text-field-error-hover-active-indicator-color: var(--md-filled-select-text-field-error-hover-active-indicator-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-hover-input-text-color: var(--md-filled-select-text-field-error-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-hover-label-text-color: var(--md-filled-select-text-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-hover-leading-icon-color: var(--md-filled-select-text-field-error-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-hover-state-layer-color: var(--md-filled-select-text-field-error-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-hover-state-layer-opacity: var(--md-filled-select-text-field-error-hover-state-layer-opacity, 0.08);--_text-field-error-hover-supporting-text-color: var(--md-filled-select-text-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-hover-trailing-icon-color: var(--md-filled-select-text-field-error-hover-trailing-icon-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-input-text-color: var(--md-filled-select-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-label-text-color: var(--md-filled-select-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-leading-icon-color: var(--md-filled-select-text-field-error-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-supporting-text-color: var(--md-filled-select-text-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-trailing-icon-color: var(--md-filled-select-text-field-error-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_text-field-focus-active-indicator-color: var(--md-filled-select-text-field-focus-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_text-field-focus-active-indicator-height: var(--md-filled-select-text-field-focus-active-indicator-height, 3px);--_text-field-focus-input-text-color: var(--md-filled-select-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-focus-label-text-color: var(--md-filled-select-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_text-field-focus-leading-icon-color: var(--md-filled-select-text-field-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-focus-supporting-text-color: var(--md-filled-select-text-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-focus-trailing-icon-color: var(--md-filled-select-text-field-focus-trailing-icon-color, var(--md-sys-color-primary, #6750a4));--_text-field-hover-active-indicator-color: var(--md-filled-select-text-field-hover-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-active-indicator-height: var(--md-filled-select-text-field-hover-active-indicator-height, 1px);--_text-field-hover-input-text-color: var(--md-filled-select-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-label-text-color: var(--md-filled-select-text-field-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-leading-icon-color: var(--md-filled-select-text-field-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-hover-state-layer-color: var(--md-filled-select-text-field-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-state-layer-opacity: var(--md-filled-select-text-field-hover-state-layer-opacity, 0.08);--_text-field-hover-supporting-text-color: var(--md-filled-select-text-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-hover-trailing-icon-color: var(--md-filled-select-text-field-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-input-text-color: var(--md-filled-select-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-input-text-font: var(--md-filled-select-text-field-input-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-input-text-line-height: var(--md-filled-select-text-field-input-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_text-field-input-text-size: var(--md-filled-select-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_text-field-input-text-weight: var(--md-filled-select-text-field-input-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-label-text-color: var(--md-filled-select-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-label-text-font: var(--md-filled-select-text-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-label-text-line-height: var(--md-filled-select-text-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_text-field-label-text-populated-line-height: var(--md-filled-select-text-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_text-field-label-text-populated-size: var(--md-filled-select-text-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_text-field-label-text-size: var(--md-filled-select-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_text-field-label-text-weight: var(--md-filled-select-text-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-leading-icon-color: var(--md-filled-select-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-leading-icon-size: var(--md-filled-select-text-field-leading-icon-size, 24px);--_text-field-supporting-text-color: var(--md-filled-select-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-supporting-text-font: var(--md-filled-select-text-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-supporting-text-line-height: var(--md-filled-select-text-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_text-field-supporting-text-size: var(--md-filled-select-text-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_text-field-supporting-text-weight: var(--md-filled-select-text-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-trailing-icon-color: var(--md-filled-select-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-trailing-icon-size: var(--md-filled-select-text-field-trailing-icon-size, 24px);--_text-field-container-shape-start-start: var(--md-filled-select-text-field-container-shape-start-start, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-start-end: var(--md-filled-select-text-field-container-shape-start-end, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-end-end: var(--md-filled-select-text-field-container-shape-end-end, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_text-field-container-shape-end-start: var(--md-filled-select-text-field-container-shape-end-start, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--md-filled-field-active-indicator-color: var(--_text-field-active-indicator-color);--md-filled-field-active-indicator-height: var(--_text-field-active-indicator-height);--md-filled-field-container-color: var(--_text-field-container-color);--md-filled-field-container-shape-end-end: var(--_text-field-container-shape-end-end);--md-filled-field-container-shape-end-start: var(--_text-field-container-shape-end-start);--md-filled-field-container-shape-start-end: var(--_text-field-container-shape-start-end);--md-filled-field-container-shape-start-start: var(--_text-field-container-shape-start-start);--md-filled-field-content-color: var(--_text-field-input-text-color);--md-filled-field-content-font: var(--_text-field-input-text-font);--md-filled-field-content-line-height: var(--_text-field-input-text-line-height);--md-filled-field-content-size: var(--_text-field-input-text-size);--md-filled-field-content-weight: var(--_text-field-input-text-weight);--md-filled-field-disabled-active-indicator-color: var(--_text-field-disabled-active-indicator-color);--md-filled-field-disabled-active-indicator-height: var(--_text-field-disabled-active-indicator-height);--md-filled-field-disabled-active-indicator-opacity: var(--_text-field-disabled-active-indicator-opacity);--md-filled-field-disabled-container-color: var(--_text-field-disabled-container-color);--md-filled-field-disabled-container-opacity: var(--_text-field-disabled-container-opacity);--md-filled-field-disabled-content-color: var(--_text-field-disabled-input-text-color);--md-filled-field-disabled-content-opacity: var(--_text-field-disabled-input-text-opacity);--md-filled-field-disabled-label-text-color: var(--_text-field-disabled-label-text-color);--md-filled-field-disabled-label-text-opacity: var(--_text-field-disabled-label-text-opacity);--md-filled-field-disabled-leading-content-color: var(--_text-field-disabled-leading-icon-color);--md-filled-field-disabled-leading-content-opacity: var(--_text-field-disabled-leading-icon-opacity);--md-filled-field-disabled-supporting-text-color: var(--_text-field-disabled-supporting-text-color);--md-filled-field-disabled-supporting-text-opacity: var(--_text-field-disabled-supporting-text-opacity);--md-filled-field-disabled-trailing-content-color: var(--_text-field-disabled-trailing-icon-color);--md-filled-field-disabled-trailing-content-opacity: var(--_text-field-disabled-trailing-icon-opacity);--md-filled-field-error-active-indicator-color: var(--_text-field-error-active-indicator-color);--md-filled-field-error-content-color: var(--_text-field-error-input-text-color);--md-filled-field-error-focus-active-indicator-color: var(--_text-field-error-focus-active-indicator-color);--md-filled-field-error-focus-content-color: var(--_text-field-error-focus-input-text-color);--md-filled-field-error-focus-label-text-color: var(--_text-field-error-focus-label-text-color);--md-filled-field-error-focus-leading-content-color: var(--_text-field-error-focus-leading-icon-color);--md-filled-field-error-focus-supporting-text-color: var(--_text-field-error-focus-supporting-text-color);--md-filled-field-error-focus-trailing-content-color: var(--_text-field-error-focus-trailing-icon-color);--md-filled-field-error-hover-active-indicator-color: var(--_text-field-error-hover-active-indicator-color);--md-filled-field-error-hover-content-color: var(--_text-field-error-hover-input-text-color);--md-filled-field-error-hover-label-text-color: var(--_text-field-error-hover-label-text-color);--md-filled-field-error-hover-leading-content-color: var(--_text-field-error-hover-leading-icon-color);--md-filled-field-error-hover-state-layer-color: var(--_text-field-error-hover-state-layer-color);--md-filled-field-error-hover-state-layer-opacity: var(--_text-field-error-hover-state-layer-opacity);--md-filled-field-error-hover-supporting-text-color: var(--_text-field-error-hover-supporting-text-color);--md-filled-field-error-hover-trailing-content-color: var(--_text-field-error-hover-trailing-icon-color);--md-filled-field-error-label-text-color: var(--_text-field-error-label-text-color);--md-filled-field-error-leading-content-color: var(--_text-field-error-leading-icon-color);--md-filled-field-error-supporting-text-color: var(--_text-field-error-supporting-text-color);--md-filled-field-error-trailing-content-color: var(--_text-field-error-trailing-icon-color);--md-filled-field-focus-active-indicator-color: var(--_text-field-focus-active-indicator-color);--md-filled-field-focus-active-indicator-height: var(--_text-field-focus-active-indicator-height);--md-filled-field-focus-content-color: var(--_text-field-focus-input-text-color);--md-filled-field-focus-label-text-color: var(--_text-field-focus-label-text-color);--md-filled-field-focus-leading-content-color: var(--_text-field-focus-leading-icon-color);--md-filled-field-focus-supporting-text-color: var(--_text-field-focus-supporting-text-color);--md-filled-field-focus-trailing-content-color: var(--_text-field-focus-trailing-icon-color);--md-filled-field-hover-active-indicator-color: var(--_text-field-hover-active-indicator-color);--md-filled-field-hover-active-indicator-height: var(--_text-field-hover-active-indicator-height);--md-filled-field-hover-content-color: var(--_text-field-hover-input-text-color);--md-filled-field-hover-label-text-color: var(--_text-field-hover-label-text-color);--md-filled-field-hover-leading-content-color: var(--_text-field-hover-leading-icon-color);--md-filled-field-hover-state-layer-color: var(--_text-field-hover-state-layer-color);--md-filled-field-hover-state-layer-opacity: var(--_text-field-hover-state-layer-opacity);--md-filled-field-hover-supporting-text-color: var(--_text-field-hover-supporting-text-color);--md-filled-field-hover-trailing-content-color: var(--_text-field-hover-trailing-icon-color);--md-filled-field-label-text-color: var(--_text-field-label-text-color);--md-filled-field-label-text-font: var(--_text-field-label-text-font);--md-filled-field-label-text-line-height: var(--_text-field-label-text-line-height);--md-filled-field-label-text-populated-line-height: var(--_text-field-label-text-populated-line-height);--md-filled-field-label-text-populated-size: var(--_text-field-label-text-populated-size);--md-filled-field-label-text-size: var(--_text-field-label-text-size);--md-filled-field-label-text-weight: var(--_text-field-label-text-weight);--md-filled-field-leading-content-color: var(--_text-field-leading-icon-color);--md-filled-field-supporting-text-color: var(--_text-field-supporting-text-color);--md-filled-field-supporting-text-font: var(--_text-field-supporting-text-font);--md-filled-field-supporting-text-line-height: var(--_text-field-supporting-text-line-height);--md-filled-field-supporting-text-size: var(--_text-field-supporting-text-size);--md-filled-field-supporting-text-weight: var(--_text-field-supporting-text-weight);--md-filled-field-trailing-content-color: var(--_text-field-trailing-icon-color)}[has-start] .icon.leading{font-size:var(--_text-field-leading-icon-size);height:var(--_text-field-leading-icon-size);width:var(--_text-field-leading-icon-size)}.icon.trailing{font-size:var(--_text-field-trailing-icon-size);height:var(--_text-field-trailing-icon-size);width:var(--_text-field-trailing-icon-size)}
`;
const pi = m`:host{color:unset;min-width:210px;display:flex}.field{cursor:default;outline:none}.select{position:relative;flex-direction:column}.icon.trailing svg,.icon ::slotted(*){fill:currentColor}.icon ::slotted(*){width:inherit;height:inherit;font-size:inherit}.icon slot{display:flex;height:100%;width:100%;align-items:center;justify-content:center}.icon.trailing :is(.up,.down){opacity:0;transition:opacity 75ms linear 75ms}.select:not(.open) .down,.select.open .up{opacity:1}.field,.select,md-menu{min-width:inherit;width:inherit;max-width:inherit;display:flex}md-menu{min-width:var(--__menu-min-width);max-width:var(--__menu-max-width, inherit)}.menu-wrapper{width:0px;height:0px;max-width:inherit}md-menu ::slotted(:not[disabled]){cursor:pointer}.field,.select{width:100%}:host{display:inline-flex}:host([disabled]){pointer-events:none}
`;
let It = class extends pa {
};
It.styles = [pi, ha];
It = s([
  _("md-filled-select")
], It);
class ua extends $ {
  constructor() {
    super(...arguments), this.fieldTag = re`md-outlined-field`;
  }
}
const ma = m`:host{--_text-field-disabled-input-text-color: var(--md-outlined-select-text-field-disabled-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-input-text-opacity: var(--md-outlined-select-text-field-disabled-input-text-opacity, 0.38);--_text-field-disabled-label-text-color: var(--md-outlined-select-text-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-label-text-opacity: var(--md-outlined-select-text-field-disabled-label-text-opacity, 0.38);--_text-field-disabled-leading-icon-color: var(--md-outlined-select-text-field-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-leading-icon-opacity: var(--md-outlined-select-text-field-disabled-leading-icon-opacity, 0.38);--_text-field-disabled-outline-color: var(--md-outlined-select-text-field-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-outline-opacity: var(--md-outlined-select-text-field-disabled-outline-opacity, 0.12);--_text-field-disabled-outline-width: var(--md-outlined-select-text-field-disabled-outline-width, 1px);--_text-field-disabled-supporting-text-color: var(--md-outlined-select-text-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-supporting-text-opacity: var(--md-outlined-select-text-field-disabled-supporting-text-opacity, 0.38);--_text-field-disabled-trailing-icon-color: var(--md-outlined-select-text-field-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-trailing-icon-opacity: var(--md-outlined-select-text-field-disabled-trailing-icon-opacity, 0.38);--_text-field-error-focus-input-text-color: var(--md-outlined-select-text-field-error-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-focus-label-text-color: var(--md-outlined-select-text-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-leading-icon-color: var(--md-outlined-select-text-field-error-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-focus-outline-color: var(--md-outlined-select-text-field-error-focus-outline-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-supporting-text-color: var(--md-outlined-select-text-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-trailing-icon-color: var(--md-outlined-select-text-field-error-focus-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_text-field-error-hover-input-text-color: var(--md-outlined-select-text-field-error-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-hover-label-text-color: var(--md-outlined-select-text-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-hover-leading-icon-color: var(--md-outlined-select-text-field-error-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-hover-outline-color: var(--md-outlined-select-text-field-error-hover-outline-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-hover-supporting-text-color: var(--md-outlined-select-text-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-hover-trailing-icon-color: var(--md-outlined-select-text-field-error-hover-trailing-icon-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-input-text-color: var(--md-outlined-select-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-label-text-color: var(--md-outlined-select-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-leading-icon-color: var(--md-outlined-select-text-field-error-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-outline-color: var(--md-outlined-select-text-field-error-outline-color, var(--md-sys-color-error, #b3261e));--_text-field-error-supporting-text-color: var(--md-outlined-select-text-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-trailing-icon-color: var(--md-outlined-select-text-field-error-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_text-field-focus-input-text-color: var(--md-outlined-select-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-focus-label-text-color: var(--md-outlined-select-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_text-field-focus-leading-icon-color: var(--md-outlined-select-text-field-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-focus-outline-color: var(--md-outlined-select-text-field-focus-outline-color, var(--md-sys-color-primary, #6750a4));--_text-field-focus-outline-width: var(--md-outlined-select-text-field-focus-outline-width, 3px);--_text-field-focus-supporting-text-color: var(--md-outlined-select-text-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-focus-trailing-icon-color: var(--md-outlined-select-text-field-focus-trailing-icon-color, var(--md-sys-color-primary, #6750a4));--_text-field-hover-input-text-color: var(--md-outlined-select-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-label-text-color: var(--md-outlined-select-text-field-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-leading-icon-color: var(--md-outlined-select-text-field-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-hover-outline-color: var(--md-outlined-select-text-field-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-outline-width: var(--md-outlined-select-text-field-hover-outline-width, 1px);--_text-field-hover-supporting-text-color: var(--md-outlined-select-text-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-hover-trailing-icon-color: var(--md-outlined-select-text-field-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-input-text-color: var(--md-outlined-select-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-input-text-font: var(--md-outlined-select-text-field-input-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-input-text-line-height: var(--md-outlined-select-text-field-input-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_text-field-input-text-size: var(--md-outlined-select-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_text-field-input-text-weight: var(--md-outlined-select-text-field-input-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-label-text-color: var(--md-outlined-select-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-label-text-font: var(--md-outlined-select-text-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-label-text-line-height: var(--md-outlined-select-text-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_text-field-label-text-populated-line-height: var(--md-outlined-select-text-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_text-field-label-text-populated-size: var(--md-outlined-select-text-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_text-field-label-text-size: var(--md-outlined-select-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_text-field-label-text-weight: var(--md-outlined-select-text-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-leading-icon-color: var(--md-outlined-select-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-leading-icon-size: var(--md-outlined-select-text-field-leading-icon-size, 24px);--_text-field-outline-color: var(--md-outlined-select-text-field-outline-color, var(--md-sys-color-outline, #79747e));--_text-field-outline-width: var(--md-outlined-select-text-field-outline-width, 1px);--_text-field-supporting-text-color: var(--md-outlined-select-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-supporting-text-font: var(--md-outlined-select-text-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-supporting-text-line-height: var(--md-outlined-select-text-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_text-field-supporting-text-size: var(--md-outlined-select-text-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_text-field-supporting-text-weight: var(--md-outlined-select-text-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-trailing-icon-color: var(--md-outlined-select-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-trailing-icon-size: var(--md-outlined-select-text-field-trailing-icon-size, 24px);--_text-field-container-shape-start-start: var(--md-outlined-select-text-field-container-shape-start-start, var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-start-end: var(--md-outlined-select-text-field-container-shape-start-end, var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-end-end: var(--md-outlined-select-text-field-container-shape-end-end, var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-end-start: var(--md-outlined-select-text-field-container-shape-end-start, var(--md-outlined-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--md-outlined-field-container-shape-end-end: var(--_text-field-container-shape-end-end);--md-outlined-field-container-shape-end-start: var(--_text-field-container-shape-end-start);--md-outlined-field-container-shape-start-end: var(--_text-field-container-shape-start-end);--md-outlined-field-container-shape-start-start: var(--_text-field-container-shape-start-start);--md-outlined-field-content-color: var(--_text-field-input-text-color);--md-outlined-field-content-font: var(--_text-field-input-text-font);--md-outlined-field-content-line-height: var(--_text-field-input-text-line-height);--md-outlined-field-content-size: var(--_text-field-input-text-size);--md-outlined-field-content-weight: var(--_text-field-input-text-weight);--md-outlined-field-disabled-content-color: var(--_text-field-disabled-input-text-color);--md-outlined-field-disabled-content-opacity: var(--_text-field-disabled-input-text-opacity);--md-outlined-field-disabled-label-text-color: var(--_text-field-disabled-label-text-color);--md-outlined-field-disabled-label-text-opacity: var(--_text-field-disabled-label-text-opacity);--md-outlined-field-disabled-leading-content-color: var(--_text-field-disabled-leading-icon-color);--md-outlined-field-disabled-leading-content-opacity: var(--_text-field-disabled-leading-icon-opacity);--md-outlined-field-disabled-outline-color: var(--_text-field-disabled-outline-color);--md-outlined-field-disabled-outline-opacity: var(--_text-field-disabled-outline-opacity);--md-outlined-field-disabled-outline-width: var(--_text-field-disabled-outline-width);--md-outlined-field-disabled-supporting-text-color: var(--_text-field-disabled-supporting-text-color);--md-outlined-field-disabled-supporting-text-opacity: var(--_text-field-disabled-supporting-text-opacity);--md-outlined-field-disabled-trailing-content-color: var(--_text-field-disabled-trailing-icon-color);--md-outlined-field-disabled-trailing-content-opacity: var(--_text-field-disabled-trailing-icon-opacity);--md-outlined-field-error-content-color: var(--_text-field-error-input-text-color);--md-outlined-field-error-focus-content-color: var(--_text-field-error-focus-input-text-color);--md-outlined-field-error-focus-label-text-color: var(--_text-field-error-focus-label-text-color);--md-outlined-field-error-focus-leading-content-color: var(--_text-field-error-focus-leading-icon-color);--md-outlined-field-error-focus-outline-color: var(--_text-field-error-focus-outline-color);--md-outlined-field-error-focus-supporting-text-color: var(--_text-field-error-focus-supporting-text-color);--md-outlined-field-error-focus-trailing-content-color: var(--_text-field-error-focus-trailing-icon-color);--md-outlined-field-error-hover-content-color: var(--_text-field-error-hover-input-text-color);--md-outlined-field-error-hover-label-text-color: var(--_text-field-error-hover-label-text-color);--md-outlined-field-error-hover-leading-content-color: var(--_text-field-error-hover-leading-icon-color);--md-outlined-field-error-hover-outline-color: var(--_text-field-error-hover-outline-color);--md-outlined-field-error-hover-supporting-text-color: var(--_text-field-error-hover-supporting-text-color);--md-outlined-field-error-hover-trailing-content-color: var(--_text-field-error-hover-trailing-icon-color);--md-outlined-field-error-label-text-color: var(--_text-field-error-label-text-color);--md-outlined-field-error-leading-content-color: var(--_text-field-error-leading-icon-color);--md-outlined-field-error-outline-color: var(--_text-field-error-outline-color);--md-outlined-field-error-supporting-text-color: var(--_text-field-error-supporting-text-color);--md-outlined-field-error-trailing-content-color: var(--_text-field-error-trailing-icon-color);--md-outlined-field-focus-content-color: var(--_text-field-focus-input-text-color);--md-outlined-field-focus-label-text-color: var(--_text-field-focus-label-text-color);--md-outlined-field-focus-leading-content-color: var(--_text-field-focus-leading-icon-color);--md-outlined-field-focus-outline-color: var(--_text-field-focus-outline-color);--md-outlined-field-focus-outline-width: var(--_text-field-focus-outline-width);--md-outlined-field-focus-supporting-text-color: var(--_text-field-focus-supporting-text-color);--md-outlined-field-focus-trailing-content-color: var(--_text-field-focus-trailing-icon-color);--md-outlined-field-hover-content-color: var(--_text-field-hover-input-text-color);--md-outlined-field-hover-label-text-color: var(--_text-field-hover-label-text-color);--md-outlined-field-hover-leading-content-color: var(--_text-field-hover-leading-icon-color);--md-outlined-field-hover-outline-color: var(--_text-field-hover-outline-color);--md-outlined-field-hover-outline-width: var(--_text-field-hover-outline-width);--md-outlined-field-hover-supporting-text-color: var(--_text-field-hover-supporting-text-color);--md-outlined-field-hover-trailing-content-color: var(--_text-field-hover-trailing-icon-color);--md-outlined-field-label-text-color: var(--_text-field-label-text-color);--md-outlined-field-label-text-font: var(--_text-field-label-text-font);--md-outlined-field-label-text-line-height: var(--_text-field-label-text-line-height);--md-outlined-field-label-text-populated-line-height: var(--_text-field-label-text-populated-line-height);--md-outlined-field-label-text-populated-size: var(--_text-field-label-text-populated-size);--md-outlined-field-label-text-size: var(--_text-field-label-text-size);--md-outlined-field-label-text-weight: var(--_text-field-label-text-weight);--md-outlined-field-leading-content-color: var(--_text-field-leading-icon-color);--md-outlined-field-outline-color: var(--_text-field-outline-color);--md-outlined-field-outline-width: var(--_text-field-outline-width);--md-outlined-field-supporting-text-color: var(--_text-field-supporting-text-color);--md-outlined-field-supporting-text-font: var(--_text-field-supporting-text-font);--md-outlined-field-supporting-text-line-height: var(--_text-field-supporting-text-line-height);--md-outlined-field-supporting-text-size: var(--_text-field-supporting-text-size);--md-outlined-field-supporting-text-weight: var(--_text-field-supporting-text-weight);--md-outlined-field-trailing-content-color: var(--_text-field-trailing-icon-color)}[has-start] .icon.leading{font-size:var(--_text-field-leading-icon-size);height:var(--_text-field-leading-icon-size);width:var(--_text-field-leading-icon-size)}.icon.trailing{font-size:var(--_text-field-trailing-icon-size);height:var(--_text-field-trailing-icon-size);width:var(--_text-field-trailing-icon-size)}
`;
let Dt = class extends ua {
};
Dt.styles = [pi, ma];
Dt = s([
  _("md-outlined-select")
], Dt);
const va = m`:host{display:flex;--md-ripple-hover-color: var(--md-menu-item-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-hover-opacity: var(--md-menu-item-hover-state-layer-opacity, 0.08);--md-ripple-pressed-color: var(--md-menu-item-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-pressed-opacity: var(--md-menu-item-pressed-state-layer-opacity, 0.12)}:host([disabled]){opacity:var(--md-menu-item-disabled-opacity, 0.3);pointer-events:none}md-focus-ring{z-index:1;--md-focus-ring-shape: 8px}a,button,li{background:none;border:none;padding:0;margin:0;text-align:unset;text-decoration:none}.list-item{border-radius:inherit;display:flex;flex:1;max-width:inherit;min-width:inherit;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.list-item:not(.disabled){cursor:pointer}[slot=container]{pointer-events:none}md-ripple{border-radius:inherit}md-item{border-radius:inherit;flex:1;color:var(--md-menu-item-label-text-color, var(--md-sys-color-on-surface, #1d1b20));font-family:var(--md-menu-item-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-menu-item-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));line-height:var(--md-menu-item-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));font-weight:var(--md-menu-item-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));min-height:var(--md-menu-item-one-line-container-height, 56px);padding-top:var(--md-menu-item-top-space, 12px);padding-bottom:var(--md-menu-item-bottom-space, 12px);padding-inline-start:var(--md-menu-item-leading-space, 16px);padding-inline-end:var(--md-menu-item-trailing-space, 16px)}md-item[multiline]{min-height:var(--md-menu-item-two-line-container-height, 72px)}[slot=supporting-text]{color:var(--md-menu-item-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-menu-item-supporting-text-font, var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-menu-item-supporting-text-size, var(--md-sys-typescale-body-medium-size, 0.875rem));line-height:var(--md-menu-item-supporting-text-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));font-weight:var(--md-menu-item-supporting-text-weight, var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400)))}[slot=trailing-supporting-text]{color:var(--md-menu-item-trailing-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-menu-item-trailing-supporting-text-font, var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-menu-item-trailing-supporting-text-size, var(--md-sys-typescale-label-small-size, 0.6875rem));line-height:var(--md-menu-item-trailing-supporting-text-line-height, var(--md-sys-typescale-label-small-line-height, 1rem));font-weight:var(--md-menu-item-trailing-supporting-text-weight, var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500)))}:is([slot=start],[slot=end])::slotted(*){fill:currentColor}[slot=start]{color:var(--md-menu-item-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f))}[slot=end]{color:var(--md-menu-item-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f))}.list-item{background-color:var(--md-menu-item-container-color, transparent)}.list-item.selected{background-color:var(--md-menu-item-selected-container-color, var(--md-sys-color-secondary-container, #e8def8))}.selected:not(.disabled) ::slotted(*){color:var(--md-menu-item-selected-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b))}@media(forced-colors: active){:host([disabled]),:host([disabled]) slot{color:GrayText;opacity:1}.list-item{position:relative}.list-item.selected::before{content:"";position:absolute;inset:0;box-sizing:border-box;border-radius:inherit;pointer-events:none;border:3px double CanvasText}}
`;
class po extends g {
  constructor() {
    super(...arguments), this.multiline = !1;
  }
  render() {
    return l`
      <slot name="container"></slot>
      <slot class="non-text" name="start"></slot>
      <div class="text">
        <slot name="overline" @slotchange=${this.handleTextSlotChange}></slot>
        <slot
          class="default-slot"
          @slotchange=${this.handleTextSlotChange}></slot>
        <slot name="headline" @slotchange=${this.handleTextSlotChange}></slot>
        <slot
          name="supporting-text"
          @slotchange=${this.handleTextSlotChange}></slot>
      </div>
      <slot class="non-text" name="trailing-supporting-text"></slot>
      <slot class="non-text" name="end"></slot>
    `;
  }
  handleTextSlotChange() {
    let e = !1, t = 0;
    for (const o of this.textSlots)
      if (fa(o) && (t += 1), t > 1) {
        e = !0;
        break;
      }
    this.multiline = e;
  }
}
s([
  d({ type: Boolean, reflect: !0 })
], po.prototype, "multiline", void 0);
s([
  Pi(".text slot")
], po.prototype, "textSlots", void 0);
function fa(i) {
  for (const e of i.assignedNodes({ flatten: !0 })) {
    const t = e.nodeType === Node.ELEMENT_NODE, o = e.nodeType === Node.TEXT_NODE && e.textContent?.match(/\S/);
    if (t || o)
      return !0;
  }
  return !1;
}
const ga = m`:host{color:var(--md-sys-color-on-surface, #1d1b20);font-family:var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-body-large-size, 1rem);font-weight:var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400));line-height:var(--md-sys-typescale-body-large-line-height, 1.5rem);align-items:center;box-sizing:border-box;display:flex;gap:16px;min-height:56px;overflow:hidden;padding:12px 16px;position:relative;text-overflow:ellipsis}:host([multiline]){min-height:72px}[name=overline]{color:var(--md-sys-color-on-surface-variant, #49454f);font-family:var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-label-small-size, 0.6875rem);font-weight:var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500));line-height:var(--md-sys-typescale-label-small-line-height, 1rem)}[name=supporting-text]{color:var(--md-sys-color-on-surface-variant, #49454f);font-family:var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-body-medium-size, 0.875rem);font-weight:var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400));line-height:var(--md-sys-typescale-body-medium-line-height, 1.25rem)}[name=trailing-supporting-text]{color:var(--md-sys-color-on-surface-variant, #49454f);font-family:var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-label-small-size, 0.6875rem);font-weight:var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500));line-height:var(--md-sys-typescale-label-small-line-height, 1rem)}[name=container]::slotted(*){inset:0;position:absolute}.default-slot{display:inline}.default-slot,.text ::slotted(*){overflow:hidden;text-overflow:ellipsis}.text{display:flex;flex:1;flex-direction:column;overflow:hidden}
`;
let Ot = class extends po {
};
Ot.styles = [ga];
Ot = s([
  _("md-item")
], Ot);
class ba {
  /**
   * @param host The MenuItem in which to attach this controller to.
   * @param config The object that configures this controller's behavior.
   */
  constructor(e, t) {
    this.host = e, this.internalTypeaheadText = null, this.onClick = () => {
      this.host.keepOpen || this.host.dispatchEvent(Po(this.host, {
        kind: Mo.CLICK_SELECTION
      }));
    }, this.onKeydown = (o) => {
      if (this.host.href && o.code === "Enter") {
        const a = this.getInteractiveElement();
        a instanceof HTMLAnchorElement && a.click();
      }
      if (o.defaultPrevented)
        return;
      const r = o.code;
      this.host.keepOpen && r !== "Escape" || li(r) && (o.preventDefault(), this.host.dispatchEvent(Po(this.host, {
        kind: Mo.KEYDOWN,
        key: r
      })));
    }, this.getHeadlineElements = t.getHeadlineElements, this.getSupportingTextElements = t.getSupportingTextElements, this.getDefaultElements = t.getDefaultElements, this.getInteractiveElement = t.getInteractiveElement, this.host.addController(this);
  }
  /**
   * The text that is selectable via typeahead. If not set, defaults to the
   * innerText of the item slotted into the `"headline"` slot, and if there are
   * no slotted elements into headline, then it checks the _default_ slot, and
   * then the `"supporting-text"` slot if nothing is in _default_.
   */
  get typeaheadText() {
    if (this.internalTypeaheadText !== null)
      return this.internalTypeaheadText;
    const e = this.getHeadlineElements(), t = [];
    return e.forEach((o) => {
      o.textContent && o.textContent.trim() && t.push(o.textContent.trim());
    }), t.length === 0 && this.getDefaultElements().forEach((o) => {
      o.textContent && o.textContent.trim() && t.push(o.textContent.trim());
    }), t.length === 0 && this.getSupportingTextElements().forEach((o) => {
      o.textContent && o.textContent.trim() && t.push(o.textContent.trim());
    }), t.join(" ");
  }
  /**
   * The recommended tag name to render as the list item.
   */
  get tagName() {
    switch (this.host.type) {
      case "link":
        return "a";
      case "button":
        return "button";
      default:
      case "menuitem":
      case "option":
        return "li";
    }
  }
  /**
   * The recommended role of the menu item.
   */
  get role() {
    return this.host.type === "option" ? "option" : "menuitem";
  }
  hostConnected() {
    this.host.toggleAttribute("md-menu-item", !0);
  }
  hostUpdate() {
    this.host.href && (this.host.type = "link");
  }
  /**
   * Use to set the typeaheadText when it changes.
   */
  setTypeaheadText(e) {
    this.internalTypeaheadText = e;
  }
}
function ya() {
  return new Event("request-selection", {
    bubbles: !0,
    composed: !0
  });
}
function xa() {
  return new Event("request-deselection", {
    bubbles: !0,
    composed: !0
  });
}
class _a {
  /**
   * The recommended role of the select option.
   */
  get role() {
    return this.menuItemController.role;
  }
  /**
   * The text that is selectable via typeahead. If not set, defaults to the
   * innerText of the item slotted into the `"headline"` slot, and if there are
   * no slotted elements into headline, then it checks the _default_ slot, and
   * then the `"supporting-text"` slot if nothing is in _default_.
   */
  get typeaheadText() {
    return this.menuItemController.typeaheadText;
  }
  setTypeaheadText(e) {
    this.menuItemController.setTypeaheadText(e);
  }
  /**
   * The text that is displayed in the select field when selected. If not set,
   * defaults to the textContent of the item slotted into the `"headline"` slot,
   * and if there are no slotted elements into headline, then it checks the
   * _default_ slot, and then the `"supporting-text"` slot if nothing is in
   * _default_.
   */
  get displayText() {
    return this.internalDisplayText !== null ? this.internalDisplayText : this.menuItemController.typeaheadText;
  }
  setDisplayText(e) {
    this.internalDisplayText = e;
  }
  /**
   * @param host The SelectOption in which to attach this controller to.
   * @param config The object that configures this controller's behavior.
   */
  constructor(e, t) {
    this.host = e, this.internalDisplayText = null, this.firstUpdate = !0, this.onClick = () => {
      this.menuItemController.onClick();
    }, this.onKeydown = (o) => {
      this.menuItemController.onKeydown(o);
    }, this.lastSelected = this.host.selected, this.menuItemController = new ba(e, t), e.addController(this);
  }
  hostUpdate() {
    this.lastSelected !== this.host.selected && (this.host.ariaSelected = this.host.selected ? "true" : "false");
  }
  hostUpdated() {
    this.lastSelected !== this.host.selected && !this.firstUpdate && (this.host.selected ? this.host.dispatchEvent(ya()) : this.host.dispatchEvent(xa())), this.lastSelected = this.host.selected, this.firstUpdate = !1;
  }
}
const wa = Q(g);
class H extends wa {
  constructor() {
    super(...arguments), this.disabled = !1, this.isMenuItem = !0, this.selected = !1, this.value = "", this.type = "option", this.selectOptionController = new _a(this, {
      getHeadlineElements: () => this.headlineElements,
      getSupportingTextElements: () => this.supportingTextElements,
      getDefaultElements: () => this.defaultElements,
      getInteractiveElement: () => this.listItemRoot
    });
  }
  /**
   * The text that is selectable via typeahead. If not set, defaults to the
   * innerText of the item slotted into the `"headline"` slot.
   */
  get typeaheadText() {
    return this.selectOptionController.typeaheadText;
  }
  set typeaheadText(e) {
    this.selectOptionController.setTypeaheadText(e);
  }
  /**
   * The text that is displayed in the select field when selected. If not set,
   * defaults to the textContent of the item slotted into the `"headline"` slot.
   */
  get displayText() {
    return this.selectOptionController.displayText;
  }
  set displayText(e) {
    this.selectOptionController.setDisplayText(e);
  }
  render() {
    return this.renderListItem(l`
      <md-item>
        <div slot="container">
          ${this.renderRipple()} ${this.renderFocusRing()}
        </div>
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        ${this.renderBody()}
      </md-item>
    `);
  }
  /**
   * Renders the root list item.
   *
   * @param content the child content of the list item.
   */
  renderListItem(e) {
    return l`
      <li
        id="item"
        tabindex=${this.disabled ? -1 : 0}
        role=${this.selectOptionController.role}
        aria-label=${this.ariaLabel || h}
        aria-selected=${this.ariaSelected || h}
        aria-checked=${this.ariaChecked || h}
        aria-expanded=${this.ariaExpanded || h}
        aria-haspopup=${this.ariaHasPopup || h}
        class="list-item ${V(this.getRenderClasses())}"
        @click=${this.selectOptionController.onClick}
        @keydown=${this.selectOptionController.onKeydown}
        >${e}</li
      >
    `;
  }
  /**
   * Handles rendering of the ripple element.
   */
  renderRipple() {
    return l` <md-ripple
      part="ripple"
      for="item"
      ?disabled=${this.disabled}></md-ripple>`;
  }
  /**
   * Handles rendering of the focus ring.
   */
  renderFocusRing() {
    return l` <md-focus-ring
      part="focus-ring"
      for="item"
      inward></md-focus-ring>`;
  }
  /**
   * Classes applied to the list item root.
   */
  getRenderClasses() {
    return {
      disabled: this.disabled,
      selected: this.selected
    };
  }
  /**
   * Handles rendering the headline and supporting text.
   */
  renderBody() {
    return l`
      <slot></slot>
      <slot name="overline" slot="overline"></slot>
      <slot name="headline" slot="headline"></slot>
      <slot name="supporting-text" slot="supporting-text"></slot>
      <slot
        name="trailing-supporting-text"
        slot="trailing-supporting-text"></slot>
    `;
  }
  focus() {
    this.listItemRoot?.focus();
  }
}
H.shadowRootOptions = {
  ...g.shadowRootOptions,
  delegatesFocus: !0
};
s([
  d({ type: Boolean, reflect: !0 })
], H.prototype, "disabled", void 0);
s([
  d({ type: Boolean, attribute: "md-menu-item", reflect: !0 })
], H.prototype, "isMenuItem", void 0);
s([
  d({ type: Boolean })
], H.prototype, "selected", void 0);
s([
  d()
], H.prototype, "value", void 0);
s([
  w(".list-item")
], H.prototype, "listItemRoot", void 0);
s([
  K({ slot: "headline" })
], H.prototype, "headlineElements", void 0);
s([
  K({ slot: "supporting-text" })
], H.prototype, "supportingTextElements", void 0);
s([
  No({ slot: "" })
], H.prototype, "defaultElements", void 0);
s([
  d({ attribute: "typeahead-text" })
], H.prototype, "typeaheadText", null);
s([
  d({ attribute: "display-text" })
], H.prototype, "displayText", null);
let Rt = class extends H {
};
Rt.styles = [va];
Rt = s([
  _("md-select-option")
], Rt);
const ka = Q(g);
class se extends ka {
  /**
   * Whether or not the primary ripple is disabled (defaults to `disabled`).
   * Some chip actions such as links cannot be disabled.
   */
  get rippleDisabled() {
    return this.disabled || this.softDisabled;
  }
  constructor() {
    super(), this.disabled = !1, this.softDisabled = !1, this.alwaysFocusable = !1, this.label = "", this.hasIcon = !1, this.addEventListener("click", this.handleClick.bind(this));
  }
  focus(e) {
    this.disabled && !this.alwaysFocusable || super.focus(e);
  }
  render() {
    return l`
      <div class="container ${V(this.getContainerClasses())}">
        ${this.renderContainerContent()}
      </div>
    `;
  }
  updated(e) {
    e.has("disabled") && e.get("disabled") !== void 0 && this.dispatchEvent(new Event("update-focus", { bubbles: !0 }));
  }
  getContainerClasses() {
    return {
      disabled: this.disabled || this.softDisabled,
      "has-icon": this.hasIcon
    };
  }
  renderContainerContent() {
    return l`
      ${this.renderOutline()}
      <md-focus-ring part="focus-ring" for=${this.primaryId}></md-focus-ring>
      <md-ripple
        for=${this.primaryId}
        ?disabled=${this.rippleDisabled}></md-ripple>
      ${this.renderPrimaryAction(this.renderPrimaryContent())}
    `;
  }
  renderOutline() {
    return l`<span class="outline"></span>`;
  }
  renderLeadingIcon() {
    return l`<slot name="icon" @slotchange=${this.handleIconChange}></slot>`;
  }
  renderPrimaryContent() {
    return l`
      <span class="leading icon" aria-hidden="true">
        ${this.renderLeadingIcon()}
      </span>
      <span class="label">
        <span class="label-text" id="label">
          ${this.label ? this.label : l`<slot></slot>`}
        </span>
      </span>
      <span class="touch"></span>
    `;
  }
  handleIconChange(e) {
    const t = e.target;
    this.hasIcon = t.assignedElements({ flatten: !0 }).length > 0;
  }
  handleClick(e) {
    if (this.softDisabled || this.disabled && this.alwaysFocusable) {
      e.stopImmediatePropagation(), e.preventDefault();
      return;
    }
  }
}
se.shadowRootOptions = {
  ...g.shadowRootOptions,
  delegatesFocus: !0
};
s([
  d({ type: Boolean, reflect: !0 })
], se.prototype, "disabled", void 0);
s([
  d({ type: Boolean, attribute: "soft-disabled", reflect: !0 })
], se.prototype, "softDisabled", void 0);
s([
  d({ type: Boolean, attribute: "always-focusable" })
], se.prototype, "alwaysFocusable", void 0);
s([
  d()
], se.prototype, "label", void 0);
s([
  d({ type: Boolean, reflect: !0, attribute: "has-icon" })
], se.prototype, "hasIcon", void 0);
class hi extends g {
  get chips() {
    return this.childElements.filter((e) => e instanceof se);
  }
  constructor() {
    super(), this.internals = // Cast needed for closure
    this.attachInternals(), this.addEventListener("focusin", this.updateTabIndices.bind(this)), this.addEventListener("update-focus", this.updateTabIndices.bind(this)), this.addEventListener("keydown", this.handleKeyDown.bind(this)), this.internals.role = "toolbar";
  }
  render() {
    return l`<slot @slotchange=${this.updateTabIndices}></slot>`;
  }
  handleKeyDown(e) {
    const t = e.key === "ArrowLeft", o = e.key === "ArrowRight", r = e.key === "Home", a = e.key === "End";
    if (!t && !o && !r && !a)
      return;
    const { chips: n } = this;
    if (n.length < 2)
      return;
    if (e.preventDefault(), r || a) {
      const b = r ? 0 : n.length - 1;
      n[b].focus({ trailing: a }), this.updateTabIndices();
      return;
    }
    const p = getComputedStyle(this).direction === "rtl" ? t : o, f = n.find((b) => b.matches(":focus-within"));
    if (!f) {
      (p ? n[0] : n[n.length - 1]).focus({ trailing: !p }), this.updateTabIndices();
      return;
    }
    const u = n.indexOf(f);
    let v = p ? u + 1 : u - 1;
    for (; v !== u; ) {
      v >= n.length ? v = 0 : v < 0 && (v = n.length - 1);
      const b = n[v];
      if (b.disabled && !b.alwaysFocusable) {
        p ? v++ : v--;
        continue;
      }
      b.focus({ trailing: !p }), this.updateTabIndices();
      break;
    }
  }
  updateTabIndices() {
    const { chips: e } = this;
    let t;
    for (const o of e) {
      const r = o.alwaysFocusable || !o.disabled;
      if (o.matches(":focus-within") && r) {
        t = o;
        continue;
      }
      r && !t && (t = o), o.tabIndex = -1;
    }
    t && (t.tabIndex = 0);
  }
}
s([
  K()
], hi.prototype, "childElements", void 0);
const Ca = m`:host{display:flex;flex-wrap:wrap;gap:8px}
`;
let Pt = class extends hi {
};
Pt.styles = [Ca];
Pt = s([
  _("md-chip-set")
], Pt);
const $a = m`.elevated{--md-elevation-level: var(--_elevated-container-elevation);--md-elevation-shadow-color: var(--_elevated-container-shadow-color)}.elevated::before{background:var(--_elevated-container-color)}.elevated:hover{--md-elevation-level: var(--_elevated-hover-container-elevation)}.elevated:focus-within{--md-elevation-level: var(--_elevated-focus-container-elevation)}.elevated:active{--md-elevation-level: var(--_elevated-pressed-container-elevation)}.elevated.disabled{--md-elevation-level: var(--_elevated-disabled-container-elevation)}.elevated.disabled::before{background:var(--_elevated-disabled-container-color);opacity:var(--_elevated-disabled-container-opacity)}@media(forced-colors: active){.elevated md-elevation{border:1px solid CanvasText}.elevated.disabled md-elevation{border-color:GrayText}}
`;
const qe = "aria-label-remove";
class ui extends se {
  get ariaLabelRemove() {
    if (this.hasAttribute(qe))
      return this.getAttribute(qe);
    const { ariaLabel: e } = this;
    return e || this.label ? `Remove ${e || this.label}` : null;
  }
  set ariaLabelRemove(e) {
    const t = this.ariaLabelRemove;
    e !== t && (e === null ? this.removeAttribute(qe) : this.setAttribute(qe, e), this.requestUpdate());
  }
  constructor() {
    super(), this.handleTrailingActionFocus = this.handleTrailingActionFocus.bind(this), this.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  focus(e) {
    if ((this.alwaysFocusable || !this.disabled) && e?.trailing && this.trailingAction) {
      this.trailingAction.focus(e);
      return;
    }
    super.focus(e);
  }
  renderContainerContent() {
    return l`
      ${super.renderContainerContent()}
      ${this.renderTrailingAction(this.handleTrailingActionFocus)}
    `;
  }
  handleKeyDown(e) {
    const t = e.key === "ArrowLeft", o = e.key === "ArrowRight";
    if (!t && !o || !this.primaryAction || !this.trailingAction)
      return;
    const a = getComputedStyle(this).direction === "rtl" ? t : o, n = this.primaryAction?.matches(":focus-within"), c = this.trailingAction?.matches(":focus-within");
    if (a && c || !a && n)
      return;
    e.preventDefault(), e.stopPropagation(), (a ? this.trailingAction : this.primaryAction).focus();
  }
  handleTrailingActionFocus() {
    const { primaryAction: e, trailingAction: t } = this;
    !e || !t || (e.tabIndex = -1, t.addEventListener("focusout", () => {
      e.tabIndex = 0;
    }, { once: !0 }));
  }
}
function mi({ ariaLabel: i, disabled: e, focusListener: t, tabbable: o = !1 }) {
  return l`
    <span id="remove-label" hidden aria-hidden="true">Remove</span>
    <button
      class="trailing action"
      aria-label=${i || h}
      aria-labelledby=${i ? h : "remove-label label"}
      tabindex=${o ? h : -1}
      @click=${Ea}
      @focus=${t}>
      <md-focus-ring part="trailing-focus-ring"></md-focus-ring>
      <md-ripple ?disabled=${e}></md-ripple>
      <span class="trailing icon" aria-hidden="true">
        <slot name="remove-trailing-icon">
          <svg viewBox="0 96 960 960">
            <path
              d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
          </svg>
        </slot>
      </span>
      <span class="touch"></span>
    </button>
  `;
}
function Ea(i) {
  this.disabled || this.softDisabled || (i.stopPropagation(), !this.dispatchEvent(new Event("remove", { cancelable: !0 }))) || this.remove();
}
class pe extends ui {
  constructor() {
    super(...arguments), this.elevated = !1, this.removable = !1, this.selected = !1, this.hasSelectedIcon = !1;
  }
  get primaryId() {
    return "button";
  }
  getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      elevated: this.elevated,
      selected: this.selected,
      "has-trailing": this.removable,
      "has-icon": this.hasIcon || this.selected
    };
  }
  renderPrimaryAction(e) {
    const { ariaLabel: t } = this;
    return l`
      <button
        class="primary action"
        id="button"
        aria-label=${t || h}
        aria-pressed=${this.selected}
        aria-disabled=${this.softDisabled || h}
        ?disabled=${this.disabled && !this.alwaysFocusable}
        @click=${this.handleClickOnChild}
        >${e}</button
      >
    `;
  }
  renderLeadingIcon() {
    return this.selected ? l`
      <slot name="selected-icon">
        <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M6.75012 12.1274L3.62262 8.99988L2.55762 10.0574L6.75012 14.2499L15.7501 5.24988L14.6926 4.19238L6.75012 12.1274Z" />
        </svg>
      </slot>
    ` : super.renderLeadingIcon();
  }
  renderTrailingAction(e) {
    return this.removable ? mi({
      focusListener: e,
      ariaLabel: this.ariaLabelRemove,
      disabled: this.disabled || this.softDisabled
    }) : h;
  }
  renderOutline() {
    return this.elevated ? l`<md-elevation part="elevation"></md-elevation>` : super.renderOutline();
  }
  handleClickOnChild(e) {
    if (this.disabled || this.softDisabled)
      return;
    const t = this.selected;
    if (this.selected = !this.selected, !De(this, e)) {
      this.selected = t;
      return;
    }
  }
}
s([
  d({ type: Boolean })
], pe.prototype, "elevated", void 0);
s([
  d({ type: Boolean })
], pe.prototype, "removable", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], pe.prototype, "selected", void 0);
s([
  d({ type: Boolean, reflect: !0, attribute: "has-selected-icon" })
], pe.prototype, "hasSelectedIcon", void 0);
s([
  w(".primary.action")
], pe.prototype, "primaryAction", void 0);
s([
  w(".trailing.action")
], pe.prototype, "trailingAction", void 0);
const Sa = m`:host{--_container-height: var(--md-filter-chip-container-height, 32px);--_disabled-label-text-color: var(--md-filter-chip-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filter-chip-disabled-label-text-opacity, 0.38);--_elevated-container-elevation: var(--md-filter-chip-elevated-container-elevation, 1);--_elevated-container-shadow-color: var(--md-filter-chip-elevated-container-shadow-color, var(--md-sys-color-shadow, #000));--_elevated-disabled-container-color: var(--md-filter-chip-elevated-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_elevated-disabled-container-elevation: var(--md-filter-chip-elevated-disabled-container-elevation, 0);--_elevated-disabled-container-opacity: var(--md-filter-chip-elevated-disabled-container-opacity, 0.12);--_elevated-focus-container-elevation: var(--md-filter-chip-elevated-focus-container-elevation, 1);--_elevated-hover-container-elevation: var(--md-filter-chip-elevated-hover-container-elevation, 2);--_elevated-pressed-container-elevation: var(--md-filter-chip-elevated-pressed-container-elevation, 1);--_elevated-selected-container-color: var(--md-filter-chip-elevated-selected-container-color, var(--md-sys-color-secondary-container, #e8def8));--_label-text-font: var(--md-filter-chip-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filter-chip-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-filter-chip-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-filter-chip-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_selected-focus-label-text-color: var(--md-filter-chip-selected-focus-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-label-text-color: var(--md-filter-chip-selected-hover-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-state-layer-color: var(--md-filter-chip-selected-hover-state-layer-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-state-layer-opacity: var(--md-filter-chip-selected-hover-state-layer-opacity, 0.08);--_selected-label-text-color: var(--md-filter-chip-selected-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-label-text-color: var(--md-filter-chip-selected-pressed-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-state-layer-color: var(--md-filter-chip-selected-pressed-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_selected-pressed-state-layer-opacity: var(--md-filter-chip-selected-pressed-state-layer-opacity, 0.12);--_elevated-container-color: var(--md-filter-chip-elevated-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));--_disabled-outline-color: var(--md-filter-chip-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-outline-opacity: var(--md-filter-chip-disabled-outline-opacity, 0.12);--_disabled-selected-container-color: var(--md-filter-chip-disabled-selected-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-selected-container-opacity: var(--md-filter-chip-disabled-selected-container-opacity, 0.12);--_focus-outline-color: var(--md-filter-chip-focus-outline-color, var(--md-sys-color-on-surface-variant, #49454f));--_outline-color: var(--md-filter-chip-outline-color, var(--md-sys-color-outline, #79747e));--_outline-width: var(--md-filter-chip-outline-width, 1px);--_selected-container-color: var(--md-filter-chip-selected-container-color, var(--md-sys-color-secondary-container, #e8def8));--_selected-outline-width: var(--md-filter-chip-selected-outline-width, 0px);--_focus-label-text-color: var(--md-filter-chip-focus-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-label-text-color: var(--md-filter-chip-hover-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-filter-chip-hover-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-opacity: var(--md-filter-chip-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-filter-chip-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-label-text-color: var(--md-filter-chip-pressed-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-color: var(--md-filter-chip-pressed-state-layer-color, var(--md-sys-color-on-secondary-container, #1d192b));--_pressed-state-layer-opacity: var(--md-filter-chip-pressed-state-layer-opacity, 0.12);--_icon-size: var(--md-filter-chip-icon-size, 18px);--_disabled-leading-icon-color: var(--md-filter-chip-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-icon-opacity: var(--md-filter-chip-disabled-leading-icon-opacity, 0.38);--_selected-focus-leading-icon-color: var(--md-filter-chip-selected-focus-leading-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-leading-icon-color: var(--md-filter-chip-selected-hover-leading-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-leading-icon-color: var(--md-filter-chip-selected-leading-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-leading-icon-color: var(--md-filter-chip-selected-pressed-leading-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_focus-leading-icon-color: var(--md-filter-chip-focus-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_hover-leading-icon-color: var(--md-filter-chip-hover-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_leading-icon-color: var(--md-filter-chip-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_pressed-leading-icon-color: var(--md-filter-chip-pressed-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_disabled-trailing-icon-color: var(--md-filter-chip-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-icon-opacity: var(--md-filter-chip-disabled-trailing-icon-opacity, 0.38);--_selected-focus-trailing-icon-color: var(--md-filter-chip-selected-focus-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-trailing-icon-color: var(--md-filter-chip-selected-hover-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-trailing-icon-color: var(--md-filter-chip-selected-pressed-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-trailing-icon-color: var(--md-filter-chip-selected-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_focus-trailing-icon-color: var(--md-filter-chip-focus-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-icon-color: var(--md-filter-chip-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-trailing-icon-color: var(--md-filter-chip-pressed-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-icon-color: var(--md-filter-chip-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_container-shape-start-start: var(--md-filter-chip-container-shape-start-start, var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_container-shape-start-end: var(--md-filter-chip-container-shape-start-end, var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_container-shape-end-end: var(--md-filter-chip-container-shape-end-end, var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_container-shape-end-start: var(--md-filter-chip-container-shape-end-start, var(--md-filter-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_leading-space: var(--md-filter-chip-leading-space, 16px);--_trailing-space: var(--md-filter-chip-trailing-space, 16px);--_icon-label-space: var(--md-filter-chip-icon-label-space, 8px);--_with-leading-icon-leading-space: var(--md-filter-chip-with-leading-icon-leading-space, 8px);--_with-trailing-icon-trailing-space: var(--md-filter-chip-with-trailing-icon-trailing-space, 8px)}.selected.elevated::before{background:var(--_elevated-selected-container-color)}.checkmark{height:var(--_icon-size);width:var(--_icon-size)}.disabled .checkmark{opacity:var(--_disabled-leading-icon-opacity)}@media(forced-colors: active){.disabled .checkmark{opacity:1}}
`;
const vi = m`.selected{--md-ripple-hover-color: var(--_selected-hover-state-layer-color);--md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);--md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity)}:where(.selected)::before{background:var(--_selected-container-color)}:where(.selected) .outline{border-width:var(--_selected-outline-width)}:where(.selected.disabled)::before{background:var(--_disabled-selected-container-color);opacity:var(--_disabled-selected-container-opacity)}:where(.selected) .label{color:var(--_selected-label-text-color)}:where(.selected:hover) .label{color:var(--_selected-hover-label-text-color)}:where(.selected:focus) .label{color:var(--_selected-focus-label-text-color)}:where(.selected:active) .label{color:var(--_selected-pressed-label-text-color)}:where(.selected) .leading.icon{color:var(--_selected-leading-icon-color)}:where(.selected:hover) .leading.icon{color:var(--_selected-hover-leading-icon-color)}:where(.selected:focus) .leading.icon{color:var(--_selected-focus-leading-icon-color)}:where(.selected:active) .leading.icon{color:var(--_selected-pressed-leading-icon-color)}@media(forced-colors: active){:where(.selected:not(.elevated))::before{border:1px solid CanvasText}:where(.selected) .outline{border-width:1px}}
`;
const fi = m`:host{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end);display:inline-flex;height:var(--_container-height);cursor:pointer;-webkit-tap-highlight-color:rgba(0,0,0,0);--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}:host(:is([disabled],[soft-disabled])){pointer-events:none}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) 0}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}.container{border-radius:inherit;box-sizing:border-box;display:flex;height:100%;position:relative;width:100%}.container::before{border-radius:inherit;content:"";inset:0;pointer-events:none;position:absolute}.container:not(.disabled){cursor:pointer}.container.disabled{pointer-events:none}.cell{display:flex}.action{align-items:baseline;appearance:none;background:none;border:none;border-radius:inherit;display:flex;outline:none;padding:0;position:relative;text-decoration:none}.primary.action{min-width:0;padding-inline-start:var(--_leading-space);padding-inline-end:var(--_trailing-space)}.has-icon .primary.action{padding-inline-start:var(--_with-leading-icon-leading-space)}.touch{height:48px;inset:50% 0 0;position:absolute;transform:translateY(-50%);width:100%}:host([touch-target=none]) .touch{display:none}.outline{border:var(--_outline-width) solid var(--_outline-color);border-radius:inherit;inset:0;pointer-events:none;position:absolute}:where(:focus) .outline{border-color:var(--_focus-outline-color)}:where(.disabled) .outline{border-color:var(--_disabled-outline-color);opacity:var(--_disabled-outline-opacity)}md-ripple{border-radius:inherit}.label,.icon,.touch{z-index:1}.label{align-items:center;color:var(--_label-text-color);display:flex;font-family:var(--_label-text-font);font-size:var(--_label-text-size);font-weight:var(--_label-text-weight);height:100%;line-height:var(--_label-text-line-height);overflow:hidden;user-select:none}.label-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:where(:hover) .label{color:var(--_hover-label-text-color)}:where(:focus) .label{color:var(--_focus-label-text-color)}:where(:active) .label{color:var(--_pressed-label-text-color)}:where(.disabled) .label{color:var(--_disabled-label-text-color);opacity:var(--_disabled-label-text-opacity)}.icon{align-self:center;display:flex;fill:currentColor;position:relative}.icon ::slotted(:first-child){font-size:var(--_icon-size);height:var(--_icon-size);width:var(--_icon-size)}.leading.icon{color:var(--_leading-icon-color)}.leading.icon ::slotted(*),.leading.icon svg{margin-inline-end:var(--_icon-label-space)}:where(:hover) .leading.icon{color:var(--_hover-leading-icon-color)}:where(:focus) .leading.icon{color:var(--_focus-leading-icon-color)}:where(:active) .leading.icon{color:var(--_pressed-leading-icon-color)}:where(.disabled) .leading.icon{color:var(--_disabled-leading-icon-color);opacity:var(--_disabled-leading-icon-opacity)}@media(forced-colors: active){:where(.disabled) :is(.label,.outline,.leading.icon){color:GrayText;opacity:1}}a,button{text-transform:inherit}a,button:not(:disabled,[aria-disabled=true]){cursor:inherit}
`;
const gi = m`.trailing.action{align-items:center;justify-content:center;padding-inline-start:var(--_icon-label-space);padding-inline-end:var(--_with-trailing-icon-trailing-space)}.trailing.action :is(md-ripple,md-focus-ring){border-radius:50%;height:calc(1.3333333333*var(--_icon-size));width:calc(1.3333333333*var(--_icon-size))}.trailing.action md-focus-ring{inset:unset}.has-trailing .primary.action{padding-inline-end:0}.trailing.icon{color:var(--_trailing-icon-color);height:var(--_icon-size);width:var(--_icon-size)}:where(:hover) .trailing.icon{color:var(--_hover-trailing-icon-color)}:where(:focus) .trailing.icon{color:var(--_focus-trailing-icon-color)}:where(:active) .trailing.icon{color:var(--_pressed-trailing-icon-color)}:where(.disabled) .trailing.icon{color:var(--_disabled-trailing-icon-color);opacity:var(--_disabled-trailing-icon-opacity)}:where(.selected) .trailing.icon{color:var(--_selected-trailing-icon-color)}:where(.selected:hover) .trailing.icon{color:var(--_selected-hover-trailing-icon-color)}:where(.selected:focus) .trailing.icon{color:var(--_selected-focus-trailing-icon-color)}:where(.selected:active) .trailing.icon{color:var(--_selected-pressed-trailing-icon-color)}@media(forced-colors: active){.trailing.icon{color:ButtonText}:where(.disabled) .trailing.icon{color:GrayText;opacity:1}}
`;
let Mt = class extends pe {
};
Mt.styles = [
  fi,
  $a,
  gi,
  vi,
  Sa
];
Mt = s([
  _("md-filter-chip")
], Mt);
class he extends ui {
  constructor() {
    super(...arguments), this.avatar = !1, this.href = "", this.target = "", this.removeOnly = !1, this.selected = !1;
  }
  get primaryId() {
    return this.href ? "link" : this.removeOnly ? "" : "button";
  }
  get rippleDisabled() {
    return !this.href && (this.disabled || this.softDisabled);
  }
  get primaryAction() {
    return this.removeOnly ? null : this.renderRoot.querySelector(".primary.action");
  }
  getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      avatar: this.avatar,
      // Link chips cannot be disabled
      disabled: !this.href && (this.disabled || this.softDisabled),
      link: !!this.href,
      selected: this.selected,
      "has-trailing": !0
    };
  }
  renderPrimaryAction(e) {
    const { ariaLabel: t } = this;
    return this.href ? l`
        <a
          class="primary action"
          id="link"
          aria-label=${t || h}
          href=${this.href}
          target=${this.target || h}
          >${e}</a
        >
      ` : this.removeOnly ? l`
        <span class="primary action" aria-label=${t || h}>
          ${e}
        </span>
      ` : l`
      <button
        class="primary action"
        id="button"
        aria-label=${t || h}
        aria-disabled=${this.softDisabled || h}
        ?disabled=${this.disabled && !this.alwaysFocusable}
        type="button"
        >${e}</button
      >
    `;
  }
  renderTrailingAction(e) {
    return mi({
      focusListener: e,
      ariaLabel: this.ariaLabelRemove,
      disabled: !this.href && (this.disabled || this.softDisabled),
      tabbable: this.removeOnly
    });
  }
}
s([
  d({ type: Boolean })
], he.prototype, "avatar", void 0);
s([
  d()
], he.prototype, "href", void 0);
s([
  d()
], he.prototype, "target", void 0);
s([
  d({ type: Boolean, attribute: "remove-only" })
], he.prototype, "removeOnly", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], he.prototype, "selected", void 0);
s([
  w(".trailing.action")
], he.prototype, "trailingAction", void 0);
const Ta = m`:host{--_container-height: var(--md-input-chip-container-height, 32px);--_disabled-label-text-color: var(--md-input-chip-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-input-chip-disabled-label-text-opacity, 0.38);--_disabled-selected-container-color: var(--md-input-chip-disabled-selected-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-selected-container-opacity: var(--md-input-chip-disabled-selected-container-opacity, 0.12);--_label-text-font: var(--md-input-chip-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-input-chip-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-input-chip-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-input-chip-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_selected-container-color: var(--md-input-chip-selected-container-color, var(--md-sys-color-secondary-container, #e8def8));--_selected-focus-label-text-color: var(--md-input-chip-selected-focus-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-label-text-color: var(--md-input-chip-selected-hover-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-state-layer-color: var(--md-input-chip-selected-hover-state-layer-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-state-layer-opacity: var(--md-input-chip-selected-hover-state-layer-opacity, 0.08);--_selected-label-text-color: var(--md-input-chip-selected-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-outline-width: var(--md-input-chip-selected-outline-width, 0px);--_selected-pressed-label-text-color: var(--md-input-chip-selected-pressed-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-state-layer-color: var(--md-input-chip-selected-pressed-state-layer-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-state-layer-opacity: var(--md-input-chip-selected-pressed-state-layer-opacity, 0.12);--_disabled-outline-color: var(--md-input-chip-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-outline-opacity: var(--md-input-chip-disabled-outline-opacity, 0.12);--_focus-label-text-color: var(--md-input-chip-focus-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-outline-color: var(--md-input-chip-focus-outline-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-label-text-color: var(--md-input-chip-hover-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-input-chip-hover-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-opacity: var(--md-input-chip-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-input-chip-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_outline-color: var(--md-input-chip-outline-color, var(--md-sys-color-outline, #79747e));--_outline-width: var(--md-input-chip-outline-width, 1px);--_pressed-label-text-color: var(--md-input-chip-pressed-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-color: var(--md-input-chip-pressed-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-opacity: var(--md-input-chip-pressed-state-layer-opacity, 0.12);--_avatar-shape: var(--md-input-chip-avatar-shape, var(--md-sys-shape-corner-full, 9999px));--_avatar-size: var(--md-input-chip-avatar-size, 24px);--_disabled-avatar-opacity: var(--md-input-chip-disabled-avatar-opacity, 0.38);--_disabled-leading-icon-color: var(--md-input-chip-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-icon-opacity: var(--md-input-chip-disabled-leading-icon-opacity, 0.38);--_icon-size: var(--md-input-chip-icon-size, 18px);--_selected-focus-leading-icon-color: var(--md-input-chip-selected-focus-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-leading-icon-color: var(--md-input-chip-selected-hover-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-leading-icon-color: var(--md-input-chip-selected-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-leading-icon-color: var(--md-input-chip-selected-pressed-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-icon-color: var(--md-input-chip-focus-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_hover-leading-icon-color: var(--md-input-chip-hover-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_leading-icon-color: var(--md-input-chip-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_pressed-leading-icon-color: var(--md-input-chip-pressed-leading-icon-color, var(--md-sys-color-primary, #6750a4));--_disabled-trailing-icon-color: var(--md-input-chip-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-icon-opacity: var(--md-input-chip-disabled-trailing-icon-opacity, 0.38);--_selected-focus-trailing-icon-color: var(--md-input-chip-selected-focus-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-hover-trailing-icon-color: var(--md-input-chip-selected-hover-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-pressed-trailing-icon-color: var(--md-input-chip-selected-pressed-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_selected-trailing-icon-color: var(--md-input-chip-selected-trailing-icon-color, var(--md-sys-color-on-secondary-container, #1d192b));--_focus-trailing-icon-color: var(--md-input-chip-focus-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-icon-color: var(--md-input-chip-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-trailing-icon-color: var(--md-input-chip-pressed-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-icon-color: var(--md-input-chip-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_container-shape-start-start: var(--md-input-chip-container-shape-start-start, var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_container-shape-start-end: var(--md-input-chip-container-shape-start-end, var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_container-shape-end-end: var(--md-input-chip-container-shape-end-end, var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_container-shape-end-start: var(--md-input-chip-container-shape-end-start, var(--md-input-chip-container-shape, var(--md-sys-shape-corner-small, 8px)));--_leading-space: var(--md-input-chip-leading-space, 16px);--_trailing-space: var(--md-input-chip-trailing-space, 16px);--_icon-label-space: var(--md-input-chip-icon-label-space, 8px);--_with-leading-icon-leading-space: var(--md-input-chip-with-leading-icon-leading-space, 8px);--_with-trailing-icon-trailing-space: var(--md-input-chip-with-trailing-icon-trailing-space, 8px)}:host([avatar]){--_container-shape-start-start: var( --md-input-chip-container-shape-start-start, var(--md-input-chip-container-shape, calc(var(--_container-height) / 2)) );--_container-shape-start-end: var( --md-input-chip-container-shape-start-end, var(--md-input-chip-container-shape, calc(var(--_container-height) / 2)) );--_container-shape-end-end: var( --md-input-chip-container-shape-end-end, var(--md-input-chip-container-shape, calc(var(--_container-height) / 2)) );--_container-shape-end-start: var( --md-input-chip-container-shape-end-start, var(--md-input-chip-container-shape, calc(var(--_container-height) / 2)) )}.avatar .primary.action{padding-inline-start:4px}.avatar .leading.icon ::slotted(:first-child){border-radius:var(--_avatar-shape);height:var(--_avatar-size);width:var(--_avatar-size)}.disabled.avatar .leading.icon{opacity:var(--_disabled-avatar-opacity)}@media(forced-colors: active){.link .outline{border-color:ActiveText}.disabled.avatar .leading.icon{opacity:1}}
`;
let Ft = class extends he {
};
Ft.styles = [
  fi,
  gi,
  vi,
  Ta
];
Ft = s([
  _("md-input-chip")
], Ft);
class ot extends g {
  constructor() {
    super(...arguments), this.inset = !1, this.insetStart = !1, this.insetEnd = !1;
  }
}
s([
  d({ type: Boolean, reflect: !0 })
], ot.prototype, "inset", void 0);
s([
  d({ type: Boolean, reflect: !0, attribute: "inset-start" })
], ot.prototype, "insetStart", void 0);
s([
  d({ type: Boolean, reflect: !0, attribute: "inset-end" })
], ot.prototype, "insetEnd", void 0);
const za = m`:host{box-sizing:border-box;color:var(--md-divider-color, var(--md-sys-color-outline-variant, #cac4d0));display:flex;height:var(--md-divider-thickness, 1px);width:100%}:host([inset]),:host([inset-start]){padding-inline-start:16px}:host([inset]),:host([inset-end]){padding-inline-end:16px}:host::before{background:currentColor;content:"";height:100%;width:100%}@media(forced-colors: active){:host::before{background:CanvasText}}
`;
let Lt = class extends ot {
};
Lt.styles = [za];
Lt = s([
  _("md-divider")
], Lt);
const He = /* @__PURE__ */ Symbol("isFocusable"), ct = /* @__PURE__ */ Symbol("privateIsFocusable"), We = /* @__PURE__ */ Symbol("externalTabIndex"), je = /* @__PURE__ */ Symbol("isUpdatingTabIndex"), Ke = /* @__PURE__ */ Symbol("updateTabIndex");
function Aa(i) {
  var e, t, o;
  class r extends i {
    constructor() {
      super(...arguments), this[e] = !0, this[t] = null, this[o] = !1;
    }
    get [He]() {
      return this[ct];
    }
    set [He](n) {
      this[He] !== n && (this[ct] = n, this[Ke]());
    }
    connectedCallback() {
      super.connectedCallback(), this[Ke]();
    }
    attributeChangedCallback(n, c, p) {
      if (n !== "tabindex") {
        super.attributeChangedCallback(n, c, p);
        return;
      }
      if (this.requestUpdate("tabIndex", Number(c ?? -1)), !this[je]) {
        if (!this.hasAttribute("tabindex")) {
          this[We] = null, this[Ke]();
          return;
        }
        this[We] = this.tabIndex;
      }
    }
    [(e = ct, t = We, o = je, Ke)]() {
      const n = this[He] ? 0 : -1, c = this[We] ?? n;
      this[je] = !0, this.tabIndex = c, this[je] = !1;
    }
  }
  return s([
    d({ noAccessor: !0 })
  ], r.prototype, "tabIndex", void 0), r;
}
const bi = /* @__PURE__ */ Symbol("animateIndicator"), Ia = Aa(g);
class Y extends Ia {
  /**
   * @deprecated use `active`
   */
  get selected() {
    return this.active;
  }
  set selected(e) {
    this.active = e;
  }
  constructor() {
    super(), this.isTab = !0, this.active = !1, this.hasIcon = !1, this.iconOnly = !1, this.fullWidthIndicator = !1, this.internals = // Cast needed for closure
    this.attachInternals(), this.internals.role = "tab", this.addEventListener("keydown", this.handleKeydown.bind(this));
  }
  render() {
    const e = l`<div class="indicator"></div>`;
    return l`<div
      class="button"
      role="presentation"
      @click=${this.handleContentClick}>
      <md-focus-ring part="focus-ring" inward .control=${this}></md-focus-ring>
      <md-elevation part="elevation"></md-elevation>
      <md-ripple .control=${this}></md-ripple>
      <div
        class="content ${V(this.getContentClasses())}"
        role="presentation">
        <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.fullWidthIndicator ? h : e}
      </div>
      ${this.fullWidthIndicator ? e : h}
    </div>`;
  }
  getContentClasses() {
    return {
      "has-icon": this.hasIcon,
      "has-label": !this.iconOnly
    };
  }
  updated() {
    this.internals.ariaSelected = String(this.active);
  }
  async handleKeydown(e) {
    await 0, !e.defaultPrevented && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.click());
  }
  handleContentClick(e) {
    e.stopPropagation(), this.click();
  }
  [bi](e) {
    if (!this.indicator)
      return;
    this.indicator.getAnimations().forEach((o) => {
      o.cancel();
    });
    const t = this.getKeyframes(e);
    t !== null && this.indicator.animate(t, {
      duration: 250,
      easing: j.EMPHASIZED
    });
  }
  getKeyframes(e) {
    const t = Da();
    if (!this.active)
      return t ? [{ opacity: 1 }, { transform: "none" }] : null;
    const o = {}, r = e.indicator?.getBoundingClientRect() ?? {}, a = r.left, n = r.width, c = this.indicator.getBoundingClientRect(), p = c.left, f = c.width, u = n / f;
    return !t && a !== void 0 && p !== void 0 && !isNaN(u) ? o.transform = `translateX(${(a - p).toFixed(4)}px) scaleX(${u.toFixed(4)})` : o.opacity = 0, [o, { transform: "none" }];
  }
  handleSlotChange() {
    this.iconOnly = !1;
    for (const e of this.assignedDefaultNodes) {
      const t = e.nodeType === Node.TEXT_NODE && !!e.wholeText.match(/\S/);
      if (e.nodeType === Node.ELEMENT_NODE || t)
        return;
    }
    this.iconOnly = !0;
  }
  handleIconSlotChange() {
    this.hasIcon = this.assignedIcons.length > 0;
  }
}
s([
  d({ type: Boolean, reflect: !0, attribute: "md-tab" })
], Y.prototype, "isTab", void 0);
s([
  d({ type: Boolean, reflect: !0 })
], Y.prototype, "active", void 0);
s([
  d({ type: Boolean })
], Y.prototype, "selected", null);
s([
  d({ type: Boolean, attribute: "has-icon" })
], Y.prototype, "hasIcon", void 0);
s([
  d({ type: Boolean, attribute: "icon-only" })
], Y.prototype, "iconOnly", void 0);
s([
  w(".indicator")
], Y.prototype, "indicator", void 0);
s([
  z()
], Y.prototype, "fullWidthIndicator", void 0);
s([
  No({ flatten: !0 })
], Y.prototype, "assignedDefaultNodes", void 0);
s([
  K({ slot: "icon", flatten: !0 })
], Y.prototype, "assignedIcons", void 0);
function Da() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
class ye extends g {
  /**
   * The currently selected tab, `null` only when there are no tab children.
   *
   * @export
   */
  get activeTab() {
    return this.tabs.find((e) => e.active) ?? null;
  }
  set activeTab(e) {
    e && this.activateTab(e);
  }
  /**
   * The index of the currently selected tab.
   *
   * @export
   */
  get activeTabIndex() {
    return this.tabs.findIndex((e) => e.active);
  }
  set activeTabIndex(e) {
    const t = () => {
      const o = this.tabs[e];
      o && this.activateTab(o);
    };
    if (!this.slotElement) {
      this.updateComplete.then(t);
      return;
    }
    t();
  }
  get focusedTab() {
    return this.tabs.find((e) => e.matches(":focus-within"));
  }
  constructor() {
    super(), this.autoActivate = !1, this.internals = // Cast needed for closure
    this.attachInternals(), this.internals.role = "tablist", this.addEventListener("keydown", this.handleKeydown.bind(this)), this.addEventListener("keyup", this.handleKeyup.bind(this)), this.addEventListener("focusout", this.handleFocusout.bind(this));
  }
  /**
   * Scrolls the toolbar, if overflowing, to the active tab, or the provided
   * tab.
   *
   * @param tabToScrollTo The tab that should be scrolled to. Defaults to the
   *     active tab.
   * @return A Promise that resolves after the tab has been scrolled to.
   */
  async scrollToTab(e) {
    await this.updateComplete;
    const { tabs: t } = this;
    if (e ??= this.activeTab, !e || !t.includes(e) || !this.tabsScrollerElement)
      return;
    for (const b of this.tabs)
      await b.updateComplete;
    const o = e.offsetLeft, r = e.offsetWidth, a = this.scrollLeft, n = this.offsetWidth, c = 48, p = o - c, f = o + r - n + c, u = Math.min(p, Math.max(f, a)), v = this.focusedTab ? "auto" : "instant";
    this.tabsScrollerElement.scrollTo({ behavior: v, top: 0, left: u });
  }
  render() {
    return l`
      <div class="tabs">
        <slot
          @slotchange=${this.handleSlotChange}
          @click=${this.handleTabClick}></slot>
      </div>
      <md-divider part="divider"></md-divider>
    `;
  }
  async handleTabClick(e) {
    const t = e.target;
    await 0, !(e.defaultPrevented || !Oa(t) || t.active) && this.activateTab(t);
  }
  activateTab(e) {
    const { tabs: t } = this, o = this.activeTab;
    if (!(!t.includes(e) || o === e)) {
      for (const r of t)
        r.active = r === e;
      if (o) {
        if (!this.dispatchEvent(new Event("change", { bubbles: !0, cancelable: !0 }))) {
          for (const a of t)
            a.active = a === o;
          return;
        }
        e[bi](o);
      }
      this.updateFocusableTab(e), this.scrollToTab(e);
    }
  }
  updateFocusableTab(e) {
    for (const t of this.tabs)
      t.tabIndex = t === e ? 0 : -1;
  }
  // focus item on keydown and optionally select it
  async handleKeydown(e) {
    await 0;
    const t = e.key === "ArrowLeft", o = e.key === "ArrowRight", r = e.key === "Home", a = e.key === "End";
    if (e.defaultPrevented || !t && !o && !r && !a)
      return;
    const { tabs: n } = this;
    if (n.length < 2)
      return;
    e.preventDefault();
    let c;
    if (r || a)
      c = r ? 0 : n.length - 1;
    else {
      const u = getComputedStyle(this).direction === "rtl" ? t : o, { focusedTab: v } = this;
      if (!v)
        c = u ? 0 : n.length - 1;
      else {
        const b = this.tabs.indexOf(v);
        c = u ? b + 1 : b - 1, c >= n.length ? c = 0 : c < 0 && (c = n.length - 1);
      }
    }
    const p = n[c];
    p.focus(), this.autoActivate ? this.activateTab(p) : this.updateFocusableTab(p);
  }
  // scroll to item on keyup.
  handleKeyup() {
    this.scrollToTab(this.focusedTab ?? this.activeTab);
  }
  handleFocusout() {
    if (this.matches(":focus-within"))
      return;
    const { activeTab: e } = this;
    e && this.updateFocusableTab(e);
  }
  handleSlotChange() {
    const e = this.tabs[0];
    !this.activeTab && e && this.activateTab(e), this.scrollToTab(this.activeTab);
  }
}
s([
  K({ flatten: !0, selector: "[md-tab]" })
], ye.prototype, "tabs", void 0);
s([
  d({ type: Number, attribute: "active-tab-index" })
], ye.prototype, "activeTabIndex", null);
s([
  d({ type: Boolean, attribute: "auto-activate" })
], ye.prototype, "autoActivate", void 0);
s([
  w(".tabs")
], ye.prototype, "tabsScrollerElement", void 0);
s([
  w("slot")
], ye.prototype, "slotElement", void 0);
function Oa(i) {
  return i instanceof HTMLElement && i.hasAttribute("md-tab");
}
const Ra = m`:host{box-sizing:border-box;display:flex;flex-direction:column;overflow:auto;scroll-behavior:smooth;scrollbar-width:none;position:relative}:host([hidden]){display:none}:host::-webkit-scrollbar{display:none}.tabs{align-items:end;display:flex;height:100%;overflow:inherit;scroll-behavior:inherit;scrollbar-width:inherit;justify-content:space-between;width:100%}::slotted(*){flex:1}::slotted([active]){z-index:1}
`;
let Bt = class extends ye {
};
Bt.styles = [Ra];
Bt = s([
  _("md-tabs")
], Bt);
class yi extends Y {
  constructor() {
    super(...arguments), this.inlineIcon = !1;
  }
  getContentClasses() {
    return {
      ...super.getContentClasses(),
      stacked: !this.inlineIcon
    };
  }
}
s([
  d({ type: Boolean, attribute: "inline-icon" })
], yi.prototype, "inlineIcon", void 0);
const Pa = m`:host{--_active-indicator-color: var(--md-primary-tab-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_active-indicator-height: var(--md-primary-tab-active-indicator-height, 3px);--_active-indicator-shape: var(--md-primary-tab-active-indicator-shape, 3px 3px 0px 0px);--_active-hover-state-layer-color: var(--md-primary-tab-active-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--_active-hover-state-layer-opacity: var(--md-primary-tab-active-hover-state-layer-opacity, 0.08);--_active-pressed-state-layer-color: var(--md-primary-tab-active-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_active-pressed-state-layer-opacity: var(--md-primary-tab-active-pressed-state-layer-opacity, 0.12);--_container-color: var(--md-primary-tab-container-color, var(--md-sys-color-surface, #fef7ff));--_container-elevation: var(--md-primary-tab-container-elevation, 0);--_container-height: var(--md-primary-tab-container-height, 48px);--_with-icon-and-label-text-container-height: var(--md-primary-tab-with-icon-and-label-text-container-height, 64px);--_hover-state-layer-color: var(--md-primary-tab-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-opacity: var(--md-primary-tab-hover-state-layer-opacity, 0.08);--_pressed-state-layer-color: var(--md-primary-tab-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_pressed-state-layer-opacity: var(--md-primary-tab-pressed-state-layer-opacity, 0.12);--_active-focus-icon-color: var(--md-primary-tab-active-focus-icon-color, var(--md-sys-color-primary, #6750a4));--_active-hover-icon-color: var(--md-primary-tab-active-hover-icon-color, var(--md-sys-color-primary, #6750a4));--_active-icon-color: var(--md-primary-tab-active-icon-color, var(--md-sys-color-primary, #6750a4));--_active-pressed-icon-color: var(--md-primary-tab-active-pressed-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-size: var(--md-primary-tab-icon-size, 24px);--_focus-icon-color: var(--md-primary-tab-focus-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-icon-color: var(--md-primary-tab-hover-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_icon-color: var(--md-primary-tab-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-icon-color: var(--md-primary-tab-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_label-text-font: var(--md-primary-tab-label-text-font, var(--md-sys-typescale-title-small-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-primary-tab-label-text-line-height, var(--md-sys-typescale-title-small-line-height, 1.25rem));--_label-text-size: var(--md-primary-tab-label-text-size, var(--md-sys-typescale-title-small-size, 0.875rem));--_label-text-weight: var(--md-primary-tab-label-text-weight, var(--md-sys-typescale-title-small-weight, var(--md-ref-typeface-weight-medium, 500)));--_active-focus-label-text-color: var(--md-primary-tab-active-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_active-hover-label-text-color: var(--md-primary-tab-active-hover-label-text-color, var(--md-sys-color-primary, #6750a4));--_active-label-text-color: var(--md-primary-tab-active-label-text-color, var(--md-sys-color-primary, #6750a4));--_active-pressed-label-text-color: var(--md-primary-tab-active-pressed-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-label-text-color: var(--md-primary-tab-focus-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-primary-tab-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_label-text-color: var(--md-primary-tab-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-label-text-color: var(--md-primary-tab-pressed-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_container-shape-start-start: var(--md-primary-tab-container-shape-start-start, var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-start-end: var(--md-primary-tab-container-shape-start-end, var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-end: var(--md-primary-tab-container-shape-end-end, var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-start: var(--md-primary-tab-container-shape-end-start, var(--md-primary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)))}.content.stacked{flex-direction:column;gap:2px}.content.stacked.has-icon.has-label{height:var(--_with-icon-and-label-text-container-height)}
`;
const xi = m`:host{display:inline-flex;align-items:center;justify-content:center;outline:none;padding:0 16px;position:relative;-webkit-tap-highlight-color:rgba(0,0,0,0);vertical-align:middle;user-select:none;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);color:var(--_label-text-color);z-index:0;--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity);--md-elevation-level: var(--_container-elevation)}md-focus-ring{--md-focus-ring-shape: 8px}:host([active]) md-focus-ring{margin-bottom:calc(var(--_active-indicator-height) + 1px)}.button::before{background:var(--_container-color);content:"";inset:0;position:absolute;z-index:-1}.button::before,md-ripple,md-elevation{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-end-radius:var(--_container-shape-end-end);border-end-start-radius:var(--_container-shape-end-start)}.content{position:relative;box-sizing:border-box;display:inline-flex;flex-direction:row;align-items:center;justify-content:center;height:var(--_container-height);gap:8px}.indicator{position:absolute;box-sizing:border-box;z-index:-1;transform-origin:bottom left;background:var(--_active-indicator-color);border-radius:var(--_active-indicator-shape);height:var(--_active-indicator-height);inset:auto 0 0 0;opacity:0}::slotted([slot=icon]){display:inline-flex;position:relative;writing-mode:horizontal-tb;fill:currentColor;color:var(--_icon-color);font-size:var(--_icon-size);width:var(--_icon-size);height:var(--_icon-size)}:host(:hover){color:var(--_hover-label-text-color);cursor:pointer}:host(:hover) ::slotted([slot=icon]){color:var(--_hover-icon-color)}:host(:focus){color:var(--_focus-label-text-color)}:host(:focus) ::slotted([slot=icon]){color:var(--_focus-icon-color)}:host(:active){color:var(--_pressed-label-text-color)}:host(:active) ::slotted([slot=icon]){color:var(--_pressed-icon-color)}:host([active]) .indicator{opacity:1}:host([active]){color:var(--_active-label-text-color);--md-ripple-hover-color: var(--_active-hover-state-layer-color);--md-ripple-hover-opacity: var(--_active-hover-state-layer-opacity);--md-ripple-pressed-color: var(--_active-pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_active-pressed-state-layer-opacity)}:host([active]) ::slotted([slot=icon]){color:var(--_active-icon-color)}:host([active]:hover){color:var(--_active-hover-label-text-color)}:host([active]:hover) ::slotted([slot=icon]){color:var(--_active-hover-icon-color)}:host([active]:focus){color:var(--_active-focus-label-text-color)}:host([active]:focus) ::slotted([slot=icon]){color:var(--_active-focus-icon-color)}:host([active]:active){color:var(--_active-pressed-label-text-color)}:host([active]:active) ::slotted([slot=icon]){color:var(--_active-pressed-icon-color)}:host,::slotted(*){white-space:nowrap}@media(forced-colors: active){.indicator{background:CanvasText}}
`;
let Nt = class extends yi {
};
Nt.styles = [xi, Pa];
Nt = s([
  _("md-primary-tab")
], Nt);
class Ma extends Y {
  constructor() {
    super(...arguments), this.fullWidthIndicator = !0;
  }
}
const Fa = m`:host{--_active-indicator-color: var(--md-secondary-tab-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_active-indicator-height: var(--md-secondary-tab-active-indicator-height, 2px);--_active-label-text-color: var(--md-secondary-tab-active-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_container-color: var(--md-secondary-tab-container-color, var(--md-sys-color-surface, #fef7ff));--_container-elevation: var(--md-secondary-tab-container-elevation, 0);--_container-height: var(--md-secondary-tab-container-height, 48px);--_focus-label-text-color: var(--md-secondary-tab-focus-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-secondary-tab-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-color: var(--md-secondary-tab-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-opacity: var(--md-secondary-tab-hover-state-layer-opacity, 0.08);--_label-text-font: var(--md-secondary-tab-label-text-font, var(--md-sys-typescale-title-small-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-secondary-tab-label-text-line-height, var(--md-sys-typescale-title-small-line-height, 1.25rem));--_label-text-size: var(--md-secondary-tab-label-text-size, var(--md-sys-typescale-title-small-size, 0.875rem));--_label-text-weight: var(--md-secondary-tab-label-text-weight, var(--md-sys-typescale-title-small-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-label-text-color: var(--md-secondary-tab-pressed-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_pressed-state-layer-color: var(--md-secondary-tab-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_pressed-state-layer-opacity: var(--md-secondary-tab-pressed-state-layer-opacity, 0.12);--_active-focus-icon-color: var(--md-secondary-tab-active-focus-icon-color, );--_active-focus-label-text-color: var(--md-secondary-tab-active-focus-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_active-hover-icon-color: var(--md-secondary-tab-active-hover-icon-color, );--_active-hover-label-text-color: var(--md-secondary-tab-active-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_active-hover-state-layer-color: var(--md-secondary-tab-active-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_active-hover-state-layer-opacity: var(--md-secondary-tab-active-hover-state-layer-opacity, 0.08);--_active-icon-color: var(--md-secondary-tab-active-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_active-indicator-shape: var(--md-secondary-tab-active-indicator-shape, 0);--_active-pressed-icon-color: var(--md-secondary-tab-active-pressed-icon-color, );--_active-pressed-label-text-color: var(--md-secondary-tab-active-pressed-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_active-pressed-state-layer-color: var(--md-secondary-tab-active-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_active-pressed-state-layer-opacity: var(--md-secondary-tab-active-pressed-state-layer-opacity, 0.12);--_label-text-color: var(--md-secondary-tab-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-icon-color: var(--md-secondary-tab-focus-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-icon-color: var(--md-secondary-tab-hover-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_icon-size: var(--md-secondary-tab-icon-size, 24px);--_icon-color: var(--md-secondary-tab-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-icon-color: var(--md-secondary-tab-pressed-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_container-shape-start-start: var(--md-secondary-tab-container-shape-start-start, var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-start-end: var(--md-secondary-tab-container-shape-start-end, var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-end: var(--md-secondary-tab-container-shape-end-end, var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-start: var(--md-secondary-tab-container-shape-end-start, var(--md-secondary-tab-container-shape, var(--md-sys-shape-corner-none, 0px)))}
`;
let Vt = class extends Ma {
};
Vt.styles = [xi, Fa];
Vt = s([
  _("md-secondary-tab")
], Vt);
const La = {
  dialog: [
    [
      // Dialog slide down
      [{ transform: "translateY(-50px)" }, { transform: "translateY(0)" }],
      { duration: 500, easing: j.EMPHASIZED }
    ]
  ],
  scrim: [
    [
      // Scrim fade in
      [{ opacity: 0 }, { opacity: 0.32 }],
      { duration: 500, easing: "linear" }
    ]
  ],
  container: [
    [
      // Container fade in
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 50, easing: "linear", pseudoElement: "::before" }
    ],
    [
      // Container grow
      // Note: current spec says to grow from 0dp->100% and shrink from
      // 100%->35%. We change this to 35%->100% to simplify the animation that
      // is supposed to clip content as it grows. From 0dp it's possible to see
      // text/actions appear before the container has fully grown.
      [{ height: "35%" }, { height: "100%" }],
      { duration: 500, easing: j.EMPHASIZED, pseudoElement: "::before" }
    ]
  ],
  headline: [
    [
      // Headline fade in
      [{ opacity: 0 }, { opacity: 0, offset: 0.2 }, { opacity: 1 }],
      { duration: 250, easing: "linear", fill: "forwards" }
    ]
  ],
  content: [
    [
      // Content fade in
      [{ opacity: 0 }, { opacity: 0, offset: 0.2 }, { opacity: 1 }],
      { duration: 250, easing: "linear", fill: "forwards" }
    ]
  ],
  actions: [
    [
      // Actions fade in
      [{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }],
      { duration: 300, easing: "linear", fill: "forwards" }
    ]
  ]
}, Ba = {
  dialog: [
    [
      // Dialog slide up
      [{ transform: "translateY(0)" }, { transform: "translateY(-50px)" }],
      { duration: 150, easing: j.EMPHASIZED_ACCELERATE }
    ]
  ],
  scrim: [
    [
      // Scrim fade out
      [{ opacity: 0.32 }, { opacity: 0 }],
      { duration: 150, easing: "linear" }
    ]
  ],
  container: [
    [
      // Container shrink
      [{ height: "100%" }, { height: "35%" }],
      {
        duration: 150,
        easing: j.EMPHASIZED_ACCELERATE,
        pseudoElement: "::before"
      }
    ],
    [
      // Container fade out
      [{ opacity: "1" }, { opacity: "0" }],
      { delay: 100, duration: 50, easing: "linear", pseudoElement: "::before" }
    ]
  ],
  headline: [
    [
      // Headline fade out
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 100, easing: "linear", fill: "forwards" }
    ]
  ],
  content: [
    [
      // Content fade out
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 100, easing: "linear", fill: "forwards" }
    ]
  ],
  actions: [
    [
      // Actions fade out
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 100, easing: "linear", fill: "forwards" }
    ]
  ]
};
const Na = Q(g);
class I extends Na {
  // We do not use `delegatesFocus: true` due to a Chromium bug with
  // selecting text.
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=950357
  /**
   * Opens the dialog when set to `true` and closes it when set to `false`.
   */
  get open() {
    return this.isOpen;
  }
  set open(e) {
    e !== this.isOpen && (this.isOpen = e, e ? (this.setAttribute("open", ""), this.show()) : (this.removeAttribute("open"), this.close()));
  }
  constructor() {
    super(), this.quick = !1, this.returnValue = "", this.noFocusTrap = !1, this.getOpenAnimation = () => La, this.getCloseAnimation = () => Ba, this.isOpen = !1, this.isOpening = !1, this.isConnectedPromise = this.getIsConnectedPromise(), this.isAtScrollTop = !1, this.isAtScrollBottom = !1, this.nextClickIsFromContent = !1, this.hasHeadline = !1, this.hasActions = !1, this.hasIcon = !1, this.escapePressedWithoutCancel = !1, this.treewalker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT), this.addEventListener("submit", this.handleSubmit);
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
    this.isOpening = !0, await this.isConnectedPromise, await this.updateComplete;
    const e = this.dialog;
    if (e.open || !this.isOpening) {
      this.isOpening = !1;
      return;
    }
    if (!this.dispatchEvent(new Event("open", { cancelable: !0 }))) {
      this.open = !1, this.isOpening = !1;
      return;
    }
    e.showModal(), this.open = !0, this.scroller && (this.scroller.scrollTop = 0), this.querySelector("[autofocus]")?.focus(), await this.animateDialog(this.getOpenAnimation()), this.dispatchEvent(new Event("opened")), this.isOpening = !1;
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
  async close(e = this.returnValue) {
    if (this.isOpening = !1, !this.isConnected) {
      this.open = !1;
      return;
    }
    await this.updateComplete;
    const t = this.dialog;
    if (!t.open || this.isOpening) {
      this.open = !1;
      return;
    }
    const o = this.returnValue;
    if (this.returnValue = e, !this.dispatchEvent(new Event("close", { cancelable: !0 }))) {
      this.returnValue = o;
      return;
    }
    await this.animateDialog(this.getCloseAnimation()), t.close(e), this.open = !1, this.dispatchEvent(new Event("closed"));
  }
  connectedCallback() {
    super.connectedCallback(), this.isConnectedPromiseResolve();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.isConnectedPromise = this.getIsConnectedPromise();
  }
  render() {
    const e = this.open && !(this.isAtScrollTop && this.isAtScrollBottom), t = {
      "has-headline": this.hasHeadline,
      "has-actions": this.hasActions,
      "has-icon": this.hasIcon,
      scrollable: e,
      "show-top-divider": e && !this.isAtScrollTop,
      "show-bottom-divider": e && !this.isAtScrollBottom
    }, o = this.open && !this.noFocusTrap, r = l`
      <div
        class="focus-trap"
        tabindex="0"
        aria-hidden="true"
        @focus=${this.handleFocusTrapFocus}></div>
    `, { ariaLabel: a } = this;
    return l`
      <div class="scrim"></div>
      <dialog
        class=${V(t)}
        aria-label=${a || h}
        aria-labelledby=${this.hasHeadline ? "headline" : h}
        role=${this.type === "alert" ? "alertdialog" : h}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleClose}
        @keydown=${this.handleKeydown}
        .returnValue=${this.returnValue || h}>
        ${o ? r : h}
        <div class="container" @click=${this.handleContentClick}>
          <div class="headline">
            <div class="icon" aria-hidden="true">
              <slot name="icon" @slotchange=${this.handleIconChange}></slot>
            </div>
            <h2 id="headline" aria-hidden=${!this.hasHeadline || h}>
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
        ${o ? r : h}
      </dialog>
    `;
  }
  firstUpdated() {
    this.intersectionObserver = new IntersectionObserver((e) => {
      for (const t of e)
        this.handleAnchorIntersection(t);
    }, { root: this.scroller }), this.intersectionObserver.observe(this.topAnchor), this.intersectionObserver.observe(this.bottomAnchor);
  }
  handleDialogClick() {
    if (this.nextClickIsFromContent) {
      this.nextClickIsFromContent = !1;
      return;
    }
    this.dispatchEvent(new Event("cancel", { cancelable: !0 })) && this.close();
  }
  handleContentClick() {
    this.nextClickIsFromContent = !0;
  }
  handleSubmit(e) {
    const t = e.target, { submitter: o } = e;
    t.getAttribute("method") !== "dialog" || !o || this.close(o.getAttribute("value") ?? this.returnValue);
  }
  handleCancel(e) {
    if (e.target !== this.dialog)
      return;
    this.escapePressedWithoutCancel = !1;
    const t = !De(this, e);
    e.preventDefault(), !t && this.close();
  }
  handleClose() {
    this.escapePressedWithoutCancel && (this.escapePressedWithoutCancel = !1, this.dialog?.dispatchEvent(new Event("cancel", { cancelable: !0 })));
  }
  handleKeydown(e) {
    e.key === "Escape" && (this.escapePressedWithoutCancel = !0, setTimeout(() => {
      this.escapePressedWithoutCancel = !1;
    }));
  }
  async animateDialog(e) {
    if (this.cancelAnimations?.abort(), this.cancelAnimations = new AbortController(), this.quick)
      return;
    const { dialog: t, scrim: o, container: r, headline: a, content: n, actions: c } = this;
    if (!t || !o || !r || !a || !n || !c)
      return;
    const { container: p, dialog: f, scrim: u, headline: v, content: b, actions: x } = e, E = [
      [t, f ?? []],
      [o, u ?? []],
      [r, p ?? []],
      [a, v ?? []],
      [n, b ?? []],
      [c, x ?? []]
    ], k = [];
    for (const [S, D] of E)
      for (const C of D) {
        const R = S.animate(...C);
        this.cancelAnimations.signal.addEventListener("abort", () => {
          R.cancel();
        }), k.push(R);
      }
    await Promise.all(k.map((S) => S.finished.catch(() => {
    })));
  }
  handleHeadlineChange(e) {
    const t = e.target;
    this.hasHeadline = t.assignedElements().length > 0;
  }
  handleActionsChange(e) {
    const t = e.target;
    this.hasActions = t.assignedElements().length > 0;
  }
  handleIconChange(e) {
    const t = e.target;
    this.hasIcon = t.assignedElements().length > 0;
  }
  handleAnchorIntersection(e) {
    const { target: t, isIntersecting: o } = e;
    t === this.topAnchor && (this.isAtScrollTop = o), t === this.bottomAnchor && (this.isAtScrollBottom = o);
  }
  getIsConnectedPromise() {
    return new Promise((e) => {
      this.isConnectedPromiseResolve = e;
    });
  }
  handleFocusTrapFocus(e) {
    const [t, o] = this.getFirstAndLastFocusableChildren();
    if (!t || !o) {
      this.dialog?.focus();
      return;
    }
    const r = e.target === this.firstFocusTrap, a = !r, n = e.relatedTarget === t, c = e.relatedTarget === o, p = !n && !c;
    if (a && c || r && p) {
      t.focus();
      return;
    }
    if (r && n || a && p) {
      o.focus();
      return;
    }
  }
  getFirstAndLastFocusableChildren() {
    if (!this.treewalker)
      return [null, null];
    let e = null, t = null;
    for (this.treewalker.currentNode = this.treewalker.root; this.treewalker.nextNode(); ) {
      const o = this.treewalker.currentNode;
      Va(o) && (e || (e = o), t = o);
    }
    return [e, t];
  }
}
s([
  d({ type: Boolean })
], I.prototype, "open", null);
s([
  d({ type: Boolean })
], I.prototype, "quick", void 0);
s([
  d({ attribute: !1 })
], I.prototype, "returnValue", void 0);
s([
  d()
], I.prototype, "type", void 0);
s([
  d({ type: Boolean, attribute: "no-focus-trap" })
], I.prototype, "noFocusTrap", void 0);
s([
  w("dialog")
], I.prototype, "dialog", void 0);
s([
  w(".scrim")
], I.prototype, "scrim", void 0);
s([
  w(".container")
], I.prototype, "container", void 0);
s([
  w(".headline")
], I.prototype, "headline", void 0);
s([
  w(".content")
], I.prototype, "content", void 0);
s([
  w(".actions")
], I.prototype, "actions", void 0);
s([
  z()
], I.prototype, "isAtScrollTop", void 0);
s([
  z()
], I.prototype, "isAtScrollBottom", void 0);
s([
  w(".scroller")
], I.prototype, "scroller", void 0);
s([
  w(".top.anchor")
], I.prototype, "topAnchor", void 0);
s([
  w(".bottom.anchor")
], I.prototype, "bottomAnchor", void 0);
s([
  w(".focus-trap")
], I.prototype, "firstFocusTrap", void 0);
s([
  z()
], I.prototype, "hasHeadline", void 0);
s([
  z()
], I.prototype, "hasActions", void 0);
s([
  z()
], I.prototype, "hasIcon", void 0);
function Va(i) {
  const e = ":is(button,input,select,textarea,object,:is(a,area)[href],[tabindex],[contenteditable=true])", t = ":not(:disabled,[disabled])";
  return i.matches(e + t + ':not([tabindex^="-"])') ? !0 : !i.localName.includes("-") || !i.matches(t) ? !1 : i.shadowRoot?.delegatesFocus ?? !1;
}
const Ua = m`:host{border-start-start-radius:var(--md-dialog-container-shape-start-start, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));border-start-end-radius:var(--md-dialog-container-shape-start-end, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));border-end-end-radius:var(--md-dialog-container-shape-end-end, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));border-end-start-radius:var(--md-dialog-container-shape-end-start, var(--md-dialog-container-shape, var(--md-sys-shape-corner-extra-large, 28px)));display:contents;margin:auto;max-height:min(560px,100% - 48px);max-width:min(560px,100% - 48px);min-height:140px;min-width:280px;position:fixed;height:fit-content;width:fit-content}dialog{background:rgba(0,0,0,0);border:none;border-radius:inherit;flex-direction:column;height:inherit;margin:inherit;max-height:inherit;max-width:inherit;min-height:inherit;min-width:inherit;outline:none;overflow:visible;padding:0;width:inherit}dialog[open]{display:flex}::backdrop{background:none}.scrim{background:var(--md-sys-color-scrim, #000);display:none;inset:0;opacity:32%;pointer-events:none;position:fixed;z-index:1}:host([open]) .scrim{display:flex}h2{all:unset;align-self:stretch}.headline{align-items:center;color:var(--md-dialog-headline-color, var(--md-sys-color-on-surface, #1d1b20));display:flex;flex-direction:column;font-family:var(--md-dialog-headline-font, var(--md-sys-typescale-headline-small-font, var(--md-ref-typeface-brand, Roboto)));font-size:var(--md-dialog-headline-size, var(--md-sys-typescale-headline-small-size, 1.5rem));line-height:var(--md-dialog-headline-line-height, var(--md-sys-typescale-headline-small-line-height, 2rem));font-weight:var(--md-dialog-headline-weight, var(--md-sys-typescale-headline-small-weight, var(--md-ref-typeface-weight-regular, 400)));position:relative}slot[name=headline]::slotted(*){align-items:center;align-self:stretch;box-sizing:border-box;display:flex;gap:8px;padding:24px 24px 0}.icon{display:flex}slot[name=icon]::slotted(*){color:var(--md-dialog-icon-color, var(--md-sys-color-secondary, #625b71));fill:currentColor;font-size:var(--md-dialog-icon-size, 24px);margin-top:24px;height:var(--md-dialog-icon-size, 24px);width:var(--md-dialog-icon-size, 24px)}.has-icon slot[name=headline]::slotted(*){justify-content:center;padding-top:16px}.scrollable slot[name=headline]::slotted(*){padding-bottom:16px}.scrollable.has-headline slot[name=content]::slotted(*){padding-top:8px}.container{border-radius:inherit;display:flex;flex-direction:column;flex-grow:1;overflow:hidden;position:relative;transform-origin:top}.container::before{background:var(--md-dialog-container-color, var(--md-sys-color-surface-container-high, #ece6f0));border-radius:inherit;content:"";inset:0;position:absolute}.scroller{display:flex;flex:1;flex-direction:column;overflow:hidden;z-index:1}.scrollable .scroller{overflow-y:scroll}.content{color:var(--md-dialog-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-dialog-supporting-text-font, var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-dialog-supporting-text-size, var(--md-sys-typescale-body-medium-size, 0.875rem));line-height:var(--md-dialog-supporting-text-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));flex:1;font-weight:var(--md-dialog-supporting-text-weight, var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400)));height:min-content;position:relative}slot[name=content]::slotted(*){box-sizing:border-box;padding:24px}.anchor{position:absolute}.top.anchor{top:0}.bottom.anchor{bottom:0}.actions{position:relative}slot[name=actions]::slotted(*){box-sizing:border-box;display:flex;gap:8px;justify-content:flex-end;padding:16px 24px 24px}.has-actions slot[name=content]::slotted(*){padding-bottom:8px}md-divider{display:none;position:absolute}.has-headline.show-top-divider .headline md-divider,.has-actions.show-bottom-divider .actions md-divider{display:flex}.headline md-divider{bottom:0}.actions md-divider{top:0}@media(forced-colors: active){dialog{outline:2px solid WindowText}}
`;
let Ut = class extends I {
};
Ut.styles = [Ua];
Ut = s([
  _("md-dialog")
], Ut);
const qa = Q(g);
class xe extends qa {
  constructor() {
    super(...arguments), this.value = 0, this.max = 1, this.indeterminate = !1, this.fourColor = !1;
  }
  render() {
    const { ariaLabel: e } = this;
    return l`
      <div
        class="progress ${V(this.getRenderClasses())}"
        role="progressbar"
        aria-label="${e || h}"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? h : this.value}
        >${this.renderIndicator()}</div
      >
    `;
  }
  getRenderClasses() {
    return {
      indeterminate: this.indeterminate,
      "four-color": this.fourColor
    };
  }
}
s([
  d({ type: Number })
], xe.prototype, "value", void 0);
s([
  d({ type: Number })
], xe.prototype, "max", void 0);
s([
  d({ type: Boolean })
], xe.prototype, "indeterminate", void 0);
s([
  d({ type: Boolean, attribute: "four-color" })
], xe.prototype, "fourColor", void 0);
class Ha extends xe {
  renderIndicator() {
    return this.indeterminate ? this.renderIndeterminateContainer() : this.renderDeterminateContainer();
  }
  // Determinate mode is rendered with an svg so the progress arc can be
  // easily animated via stroke-dashoffset.
  renderDeterminateContainer() {
    const e = (1 - this.value / this.max) * 100;
    return l`
      <svg viewBox="0 0 4800 4800">
        <circle class="track" pathLength="100"></circle>
        <circle
          class="active-track"
          pathLength="100"
          stroke-dashoffset=${e}></circle>
      </svg>
    `;
  }
  // Indeterminate mode rendered with 2 bordered-divs. The borders are
  // clipped into half circles by their containers. The divs are then carefully
  // animated to produce changes to the spinner arc size.
  // This approach has 4.5x the FPS of rendering via svg on Chrome 111.
  // See https://lit.dev/playground/#gist=febb773565272f75408ab06a0eb49746.
  renderIndeterminateContainer() {
    return l` <div class="spinner">
      <div class="left">
        <div class="circle"></div>
      </div>
      <div class="right">
        <div class="circle"></div>
      </div>
    </div>`;
  }
}
const Wa = m`:host{--_active-indicator-color: var(--md-circular-progress-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_active-indicator-width: var(--md-circular-progress-active-indicator-width, 10);--_four-color-active-indicator-four-color: var(--md-circular-progress-four-color-active-indicator-four-color, var(--md-sys-color-tertiary-container, #ffd8e4));--_four-color-active-indicator-one-color: var(--md-circular-progress-four-color-active-indicator-one-color, var(--md-sys-color-primary, #6750a4));--_four-color-active-indicator-three-color: var(--md-circular-progress-four-color-active-indicator-three-color, var(--md-sys-color-tertiary, #7d5260));--_four-color-active-indicator-two-color: var(--md-circular-progress-four-color-active-indicator-two-color, var(--md-sys-color-primary-container, #eaddff));--_size: var(--md-circular-progress-size, 48px);display:inline-flex;vertical-align:middle;width:var(--_size);height:var(--_size);position:relative;align-items:center;justify-content:center;contain:strict;content-visibility:auto}.progress{flex:1;align-self:stretch;margin:4px}.progress,.spinner,.left,.right,.circle,svg,.track,.active-track{position:absolute;inset:0}svg{transform:rotate(-90deg)}circle{cx:50%;cy:50%;r:calc(50%*(1 - var(--_active-indicator-width)/100));stroke-width:calc(var(--_active-indicator-width)*1%);stroke-dasharray:100;fill:rgba(0,0,0,0)}.active-track{transition:stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);stroke:var(--_active-indicator-color)}.track{stroke:rgba(0,0,0,0)}.progress.indeterminate{animation:linear infinite linear-rotate;animation-duration:1568.2352941176ms}.spinner{animation:infinite both rotate-arc;animation-duration:5332ms;animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.left{overflow:hidden;inset:0 50% 0 0}.right{overflow:hidden;inset:0 0 0 50%}.circle{box-sizing:border-box;border-radius:50%;border:solid calc(var(--_active-indicator-width)/100*(var(--_size) - 8px));border-color:var(--_active-indicator-color) var(--_active-indicator-color) rgba(0,0,0,0) rgba(0,0,0,0);animation:expand-arc;animation-iteration-count:infinite;animation-fill-mode:both;animation-duration:1333ms,5332ms;animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.four-color .circle{animation-name:expand-arc,four-color}.left .circle{rotate:135deg;inset:0 -100% 0 0}.right .circle{rotate:100deg;inset:0 0 0 -100%;animation-delay:-666.5ms,0ms}@media(forced-colors: active){.active-track{stroke:CanvasText}.circle{border-color:CanvasText CanvasText Canvas Canvas}}@keyframes expand-arc{0%{transform:rotate(265deg)}50%{transform:rotate(130deg)}100%{transform:rotate(265deg)}}@keyframes rotate-arc{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes linear-rotate{to{transform:rotate(360deg)}}@keyframes four-color{0%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}15%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}25%{border-top-color:var(--_four-color-active-indicator-two-color);border-right-color:var(--_four-color-active-indicator-two-color)}40%{border-top-color:var(--_four-color-active-indicator-two-color);border-right-color:var(--_four-color-active-indicator-two-color)}50%{border-top-color:var(--_four-color-active-indicator-three-color);border-right-color:var(--_four-color-active-indicator-three-color)}65%{border-top-color:var(--_four-color-active-indicator-three-color);border-right-color:var(--_four-color-active-indicator-three-color)}75%{border-top-color:var(--_four-color-active-indicator-four-color);border-right-color:var(--_four-color-active-indicator-four-color)}90%{border-top-color:var(--_four-color-active-indicator-four-color);border-right-color:var(--_four-color-active-indicator-four-color)}100%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}}
`;
let qt = class extends Ha {
};
qt.styles = [Wa];
qt = s([
  _("md-circular-progress")
], qt);
class _i extends xe {
  constructor() {
    super(...arguments), this.buffer = 0;
  }
  // Note, the indeterminate animation is rendered with transform %'s
  // Previously, this was optimized to use px calculated with the resizeObserver
  // due to a now fixed Chrome bug: crbug.com/389359.
  renderIndicator() {
    const e = {
      transform: `scaleX(${(this.indeterminate ? 1 : this.value / this.max) * 100}%)`
    }, t = this.buffer ?? 0, o = t > 0, a = {
      transform: `scaleX(${(this.indeterminate || !o ? 1 : t / this.max) * 100}%)`
    }, n = this.indeterminate || !o || t >= this.max || this.value >= this.max;
    return l`
      <div class="dots" ?hidden=${n}></div>
      <div class="inactive-track" style=${be(a)}></div>
      <div class="bar primary-bar" style=${be(e)}>
        <div class="bar-inner"></div>
      </div>
      <div class="bar secondary-bar">
        <div class="bar-inner"></div>
      </div>
    `;
  }
}
s([
  d({ type: Number })
], _i.prototype, "buffer", void 0);
const ja = m`:host{--_active-indicator-color: var(--md-linear-progress-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_active-indicator-height: var(--md-linear-progress-active-indicator-height, 4px);--_four-color-active-indicator-four-color: var(--md-linear-progress-four-color-active-indicator-four-color, var(--md-sys-color-tertiary-container, #ffd8e4));--_four-color-active-indicator-one-color: var(--md-linear-progress-four-color-active-indicator-one-color, var(--md-sys-color-primary, #6750a4));--_four-color-active-indicator-three-color: var(--md-linear-progress-four-color-active-indicator-three-color, var(--md-sys-color-tertiary, #7d5260));--_four-color-active-indicator-two-color: var(--md-linear-progress-four-color-active-indicator-two-color, var(--md-sys-color-primary-container, #eaddff));--_track-color: var(--md-linear-progress-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_track-height: var(--md-linear-progress-track-height, 4px);--_track-shape: var(--md-linear-progress-track-shape, var(--md-sys-shape-corner-none, 0px));border-radius:var(--_track-shape);display:flex;position:relative;min-width:80px;height:var(--_track-height);content-visibility:auto;contain:strict}.progress,.dots,.inactive-track,.bar,.bar-inner{position:absolute}.progress{direction:ltr;inset:0;border-radius:inherit;overflow:hidden;display:flex;align-items:center}.bar{animation:none;width:100%;height:var(--_active-indicator-height);transform-origin:left center;transition:transform 250ms cubic-bezier(0.4, 0, 0.6, 1)}.secondary-bar{display:none}.bar-inner{inset:0;animation:none;background:var(--_active-indicator-color)}.inactive-track{background:var(--_track-color);inset:0;transition:transform 250ms cubic-bezier(0.4, 0, 0.6, 1);transform-origin:left center}.dots{inset:0;animation:linear infinite 250ms;animation-name:buffering;background-color:var(--_track-color);background-repeat:repeat-x;-webkit-mask-image:url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 2' preserveAspectRatio='xMinYMin slice'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 2' preserveAspectRatio='xMinYMin slice'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E");z-index:-1}.dots[hidden]{display:none}.indeterminate .bar{transition:none}.indeterminate .primary-bar{inset-inline-start:-145.167%}.indeterminate .secondary-bar{inset-inline-start:-54.8889%;display:block}.indeterminate .primary-bar{animation:linear infinite 2s;animation-name:primary-indeterminate-translate}.indeterminate .primary-bar>.bar-inner{animation:linear infinite 2s primary-indeterminate-scale}.indeterminate.four-color .primary-bar>.bar-inner{animation-name:primary-indeterminate-scale,four-color;animation-duration:2s,4s}.indeterminate .secondary-bar{animation:linear infinite 2s;animation-name:secondary-indeterminate-translate}.indeterminate .secondary-bar>.bar-inner{animation:linear infinite 2s secondary-indeterminate-scale}.indeterminate.four-color .secondary-bar>.bar-inner{animation-name:secondary-indeterminate-scale,four-color;animation-duration:2s,4s}:host(:dir(rtl)){transform:scale(-1)}@keyframes primary-indeterminate-scale{0%{transform:scaleX(0.08)}36.65%{animation-timing-function:cubic-bezier(0.334731, 0.12482, 0.785844, 1);transform:scaleX(0.08)}69.15%{animation-timing-function:cubic-bezier(0.06, 0.11, 0.6, 1);transform:scaleX(0.661479)}100%{transform:scaleX(0.08)}}@keyframes secondary-indeterminate-scale{0%{animation-timing-function:cubic-bezier(0.205028, 0.057051, 0.57661, 0.453971);transform:scaleX(0.08)}19.15%{animation-timing-function:cubic-bezier(0.152313, 0.196432, 0.648374, 1.00432);transform:scaleX(0.457104)}44.15%{animation-timing-function:cubic-bezier(0.257759, -0.003163, 0.211762, 1.38179);transform:scaleX(0.72796)}100%{transform:scaleX(0.08)}}@keyframes buffering{0%{transform:translateX(calc(var(--_track-height) / 2 * 5))}}@keyframes primary-indeterminate-translate{0%{transform:translateX(0px)}20%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(0px)}59.15%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(83.6714%)}100%{transform:translateX(200.611%)}}@keyframes secondary-indeterminate-translate{0%{animation-timing-function:cubic-bezier(0.15, 0, 0.515058, 0.409685);transform:translateX(0px)}25%{animation-timing-function:cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);transform:translateX(37.6519%)}48.35%{animation-timing-function:cubic-bezier(0.4, 0.627035, 0.6, 0.902026);transform:translateX(84.3862%)}100%{transform:translateX(160.278%)}}@keyframes four-color{0%{background:var(--_four-color-active-indicator-one-color)}15%{background:var(--_four-color-active-indicator-one-color)}25%{background:var(--_four-color-active-indicator-two-color)}40%{background:var(--_four-color-active-indicator-two-color)}50%{background:var(--_four-color-active-indicator-three-color)}65%{background:var(--_four-color-active-indicator-three-color)}75%{background:var(--_four-color-active-indicator-four-color)}90%{background:var(--_four-color-active-indicator-four-color)}100%{background:var(--_four-color-active-indicator-one-color)}}@media(forced-colors: active){:host{outline:1px solid CanvasText}.bar-inner,.dots{background-color:CanvasText}}
`;
let Ht = class extends _i {
};
Ht.styles = [ja];
Ht = s([
  _("md-linear-progress")
], Ht);
class ho extends g {
  render() {
    return l`
      <md-elevation part="elevation"></md-elevation>
      <div class="background"></div>
      <slot></slot>
      <div class="outline"></div>
    `;
  }
}
const Ka = m`:host{--_container-color: var(--md-elevated-card-container-color, var(--md-sys-color-surface-container-low, #f7f2fa));--_container-elevation: var(--md-elevated-card-container-elevation, 1);--_container-shadow-color: var(--md-elevated-card-container-shadow-color, var(--md-sys-color-shadow, #000));--_container-shape: var(--md-elevated-card-container-shape, var(--md-sys-shape-corner-medium, 12px))}
`;
const uo = m`:host{border-radius:var(--_container-shape);box-sizing:border-box;display:flex;flex-direction:column;position:relative;z-index:0}md-elevation,.background,.outline{border-radius:inherit;inset:0;pointer-events:none;position:absolute}.background{background:var(--_container-color);z-index:-1}.outline{border:1px solid rgba(0,0,0,0);z-index:1}md-elevation{z-index:-1;--md-elevation-level: var(--_container-elevation);--md-elevation-shadow-color: var(--_container-shadow-color)}slot{border-radius:inherit}
`;
let Wt = class extends ho {
};
Wt.styles = [uo, Ka];
Wt = s([
  _("md-elevated-card")
], Wt);
const Ya = m`:host{--_container-color: var(--md-filled-card-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_container-elevation: var(--md-filled-card-container-elevation, 0);--_container-shadow-color: var(--md-filled-card-container-shadow-color, var(--md-sys-color-shadow, #000));--_container-shape: var(--md-filled-card-container-shape, var(--md-sys-shape-corner-medium, 12px))}
`;
let jt = class extends ho {
};
jt.styles = [uo, Ya];
jt = s([
  _("md-filled-card")
], jt);
const Ga = m`:host{--_container-color: var(--md-outlined-card-container-color, var(--md-sys-color-surface, #fef7ff));--_container-elevation: var(--md-outlined-card-container-elevation, 0);--_container-shadow-color: var(--md-outlined-card-container-shadow-color, var(--md-sys-color-shadow, #000));--_container-shape: var(--md-outlined-card-container-shape, var(--md-sys-shape-corner-medium, 12px));--_outline-color: var(--md-outlined-card-outline-color, var(--md-sys-color-outline-variant, #cac4d0));--_outline-width: var(--md-outlined-card-outline-width, 1px)}.outline{border-color:var(--_outline-color);border-width:var(--_outline-width)}
`;
let Kt = class extends ho {
};
Kt.styles = [uo, Ga];
Kt = s([
  _("md-outlined-card")
], Kt);
class Xa extends g {
  static properties = {
    label: { type: String },
    active: { type: Boolean, reflect: !0 },
    count: { type: Number }
  };
  static styles = m`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--wy-filter-chip-padding, 4px 12px);
      border-radius: 9999px;
      font-family: var(--wy-filter-chip-font-family, var(--font-sans, 'DM Sans', sans-serif));
      font-size: var(--wy-filter-chip-font-size, 11px);
      font-weight: var(--wy-filter-chip-font-weight, 500);
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid var(--wy-filter-chip-border, var(--md-sys-color-outline-variant, #e5e7eb));
      background-color: transparent;
      color: var(--wy-filter-chip-text, var(--md-sys-color-on-surface-variant, #64748b));
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;
    }

    :host(:hover:not([active])) {
      color: var(--wy-filter-chip-text-hover, var(--md-sys-color-on-surface, #1f2937));
      background-color: var(--wy-filter-chip-hover-bg, var(--md-sys-color-surface-variant, #f9fafb));
      border-color: var(--wy-filter-chip-border-hover, var(--md-sys-color-outline-variant, #e5e7eb));
    }

    :host(:focus-visible) {
      outline: 2px solid var(--wy-filter-chip-focus, var(--md-sys-color-primary, #2C4C3B));
      outline-offset: 2px;
    }

    :host([active]) {
      background-color: var(--wy-filter-chip-active-bg, var(--md-sys-color-primary, #2C4C3B));
      color: var(--wy-filter-chip-active-fg, var(--md-sys-color-on-primary, #FFFFFF));
      border-color: transparent;
      font-weight: var(--wy-filter-chip-font-weight-active, 500);
      box-shadow: var(--wy-filter-chip-shadow, none);
    }

    .count {
      opacity: 0.7;
      font-size: 10px;
    }

    :host([active]) .count {
      opacity: 0.85;
    }
  `;
  render() {
    return l`
      <span>${this.label}</span>
      ${this.count !== void 0 ? l`<span class="count">(${this.count})</span>` : ""}
    `;
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("role", "button"), this.setAttribute("tabindex", "0"), this.addEventListener("keydown", this._handleKeydown);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("keydown", this._handleKeydown);
  }
  _handleKeydown(e) {
    (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.click());
  }
}
customElements.define("wy-filter-chip", Xa);
class Za extends g {
  static properties = {
    viewMode: { type: String, attribute: "view-mode" },
    showDetails: { type: Boolean, attribute: "show-details" },
    activeCategory: { type: String, attribute: "active-category" },
    categories: { type: Array },
    searchValue: { type: String, attribute: "search-value" },
    hideViewToggle: { type: Boolean, attribute: "hide-view-toggle" },
    hideDetailsToggle: { type: Boolean, attribute: "hide-details-toggle" },
    showFeaturedOnly: { type: Boolean, attribute: "show-featured-only" },
    isScrolled: { type: Boolean, state: !0 }
  };
  constructor() {
    super(), this.viewMode = "grid", this.showDetails = !1, this.activeCategory = "all", this.categories = ["Productivity", "Expertise", "Travel & Shopping"], this.searchValue = "", this.hideViewToggle = !1, this.hideDetailsToggle = !1, this.showFeaturedOnly = !1, this.isScrolled = !1, this._scrollThreshold = 50;
  }
  connectedCallback() {
    super.connectedCallback(), this._handleScroll = this._handleScroll.bind(this), setTimeout(() => {
      this._setupScrollListener();
    }, 100);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._removeScrollListener();
  }
  _setupScrollListener() {
    this._removeScrollListener(), this._scrollContainer = this._findScrollableContainer(), this._scrollContainer === window ? window.addEventListener("scroll", this._handleScroll, { passive: !0 }) : this._scrollContainer && this._scrollContainer.addEventListener("scroll", this._handleScroll, { passive: !0 }), this._handleScroll();
  }
  _removeScrollListener() {
    this._scrollContainer === window ? window.removeEventListener("scroll", this._handleScroll) : this._scrollContainer && this._scrollContainer.removeEventListener("scroll", this._handleScroll);
  }
  _findScrollableContainer() {
    const e = document.querySelector(".prompt-area");
    if (e) {
      const n = window.getComputedStyle(e);
      if (n.overflowY === "auto" || n.overflowY === "scroll")
        return e;
    }
    const t = document.querySelector(".main-content");
    if (t) {
      const n = window.getComputedStyle(t);
      if (n.overflowY === "auto" || n.overflowY === "scroll")
        return t;
    }
    const o = this.parentElement?.querySelectorAll('[class*="scroll"], [class*="area"]');
    if (o)
      for (const n of o) {
        const c = window.getComputedStyle(n);
        if (c.overflowY === "auto" || c.overflowY === "scroll")
          return n;
      }
    let r = this.parentElement;
    for (; r && r !== document.body; ) {
      const n = window.getComputedStyle(r);
      if (n.overflowY === "auto" || n.overflowY === "scroll")
        return r;
      r = r.parentElement;
    }
    const a = window.getComputedStyle(document.body);
    return a.overflowY === "auto" || a.overflowY === "scroll" ? document.body : window;
  }
  _handleScroll() {
    let e;
    this._scrollContainer === window ? e = window.scrollY || document.documentElement.scrollTop : e = this._scrollContainer ? this._scrollContainer.scrollTop : 0;
    const t = this.isScrolled;
    this.isScrolled = e > this._scrollThreshold, t !== this.isScrolled && this.requestUpdate();
  }
  static styles = m`
    /* Required fonts - load in page <head>:
       <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    */

    :host {
      display: block;
      background-color: var(--wy-controls-bar-bg, transparent);
      border-bottom: var(--wy-controls-bar-border, none);
      padding: var(--wy-controls-bar-padding, 8px 32px);
      box-sizing: border-box;
    }

    /* Sticky Pill State - when scrolled */
    :host([data-scrolled]) {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      width: auto;
      max-width: 900px;
      background-color: rgba(245, 242, 234, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--md-sys-color-outline-variant, #D7D3C8);
      border-radius: 9999px;
      padding: 8px 24px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
      transition: 
        padding var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        background-color var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings:
        'FILL' var(--wy-controls-icon-fill, 0),
        'wght' var(--wy-controls-icon-weight, 300),
        'GRAD' var(--wy-controls-icon-grad, 0),
        'opsz' var(--wy-controls-icon-opsz, 24);
      font-size: var(--wy-controls-icon-size, 24px);
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    .controls-container {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 12px;
      max-width: 1600px;
      margin: 0 auto;
    }

    :host([data-scrolled]) .controls-container {
      gap: 16px;
      max-width: 100%;
      transition: gap var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    /* Search Section */
    .search-section {
      flex: 0 0 auto;
      width: 192px;
      position: relative;
    }

    :host([data-scrolled]) .search-section {
      width: 280px;
      transition: width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    .search-input {
      width: 100%;
      height: 32px;
      background-color: var(--wy-controls-search-bg, var(--md-sys-color-surface-container-high, #f3f4f6));
      border: 1px solid var(--md-sys-color-outline-variant, transparent);
      border-radius: 9999px;
      padding: 0 12px 0 36px;
      font-family: var(--font-body, 'DM Sans', sans-serif);
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface, #1f2937);
      box-sizing: border-box;
      transition: all 0.2s;
    }

    :host([data-scrolled]) .search-input {
      height: 28px;
      font-size: 0.7rem;
      background-color: rgba(255, 255, 255, 0.6);
      transition: 
        height var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        font-size var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .search-input::placeholder {
      color: var(--md-sys-color-on-surface-variant, #9ca3af);
      opacity: 0.7;
    }

    .search-input:focus {
      outline: none;
      background-color: var(--md-sys-color-surface, #fff);
      border-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--md-sys-color-on-surface-variant, #9ca3af);
      opacity: 0.7;
      pointer-events: none;
    }

    .search-input:focus + .search-icon {
      color: var(--md-sys-color-primary, #2C4C3B);
    }

    /* Divider */
    .divider {
      width: 1px;
      height: 24px;
      background-color: var(--md-sys-color-outline-variant, #e5e7eb);
      flex-shrink: 0;
    }

    /* Toggle Section */
    .toggle-section {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    :host([data-scrolled]) .toggle-section {
      display: none;
    }

    /* View Toggle */
    .view-toggle {
      background-color: var(--wy-controls-toggle-bg, var(--md-sys-color-surface-container-high, #f3f4f6));
      border: 1px solid var(--md-sys-color-outline-variant, transparent);
      border-radius: 8px;
      display: flex;
      padding: 2px;
    }

    .view-btn {
      border: none;
      background: transparent;
      height: 28px;
      width: 28px;
      padding: 0;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface-variant, #9ca3af);
      opacity: 0.7;
      transition: all 0.15s;
    }

    .view-btn:hover:not(.active) {
      color: var(--md-sys-color-on-surface, #1f2937);
      opacity: 1;
    }

    .view-btn.active {
      background-color: var(--md-sys-color-surface, #fff);
      color: var(--md-sys-color-primary, #2C4C3B);
      opacity: 1;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px var(--md-sys-color-outline-variant, #e5e7eb);
    }

    .view-btn .material-symbols-outlined,
    .view-btn md-icon {
      font-size: 16px;
      --md-icon-size: 16px;
    }

    /* Details Toggle */
    .details-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .toggle-switch {
      position: relative;
      width: 32px;
      height: 16px;
      background-color: var(--wy-controls-switch-off, #e5e7eb);
      border-radius: 9999px;
      transition: background-color 0.2s;
    }

    .toggle-switch.on {
      background-color: var(--md-sys-color-primary, #2C4C3B);
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      background-color: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .toggle-switch.on::after {
      transform: translateX(16px);
    }

    .toggle-label {
      font-family: var(--font-body, 'DM Sans', sans-serif);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant, #64748b);
    }

    /* Category Section */
    .category-section {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      flex: 1;
      padding: 2px 0;
      -ms-overflow-style: none;
      scrollbar-width: none;
      mask-image: linear-gradient(to right, black 90%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
    }

    .category-section::-webkit-scrollbar {
      display: none;
    }

    :host([data-scrolled]) .category-section {
      flex: 0 1 auto;
      max-width: 600px;
      transition: max-width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    @media (max-width: 768px) {
      /* Disable sticky pill behavior on mobile */
      :host([data-scrolled]) {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: 100%;
        max-width: 100%;
        border-radius: 0;
        padding: var(--wy-controls-bar-padding, 8px 32px);
        background-color: var(--wy-controls-bar-bg, transparent);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow: none;
      }

      .controls-container {
        flex-wrap: wrap;
        gap: 8px;
      }

      .search-section {
        width: 100%;
        order: -1;
      }

      :host([data-scrolled]) .search-section {
        width: 100%;
      }

      :host([data-scrolled]) .search-input {
        height: 32px;
        font-size: 0.75rem;
        background-color: var(--wy-controls-search-bg, var(--md-sys-color-surface-container-high, #f3f4f6));
      }

      .divider {
        display: none;
      }

      :host([data-scrolled]) .divider {
        display: none;
      }

      .toggle-section {
        gap: 12px;
      }

      :host([data-scrolled]) .toggle-section {
        display: flex;
      }

      .category-section {
        width: 100%;
        order: 1;
      }

      :host([data-scrolled]) .category-section {
        width: 100%;
        max-width: 100%;
      }
    }
  `;
  render() {
    return this.isScrolled ? this.setAttribute("data-scrolled", "") : this.removeAttribute("data-scrolled"), l`
      <div class="controls-container" part="controls-container">
        <div class="search-section">
          <input
            type="search"
            class="search-input"
            placeholder="Search prompts..."
            .value="${this.searchValue}"
            @input="${this._handleSearch}"
          >
          <span class="material-symbols-outlined search-icon">search</span>
        </div>

        ${!this.isScrolled && (!this.hideViewToggle || !this.hideDetailsToggle) ? l`
          <div class="divider"></div>

          <div class="toggle-section">
            ${this.hideViewToggle ? "" : l`
              <div class="view-toggle">
                <button
                  class="view-btn ${this.viewMode === "list" ? "active" : ""}"
                  @click="${() => this._setViewMode("list")}"
                  aria-label="List view"
                >
                  <span class="material-symbols-outlined">format_list_bulleted</span>
                </button>
                <button
                  class="view-btn ${this.viewMode === "grid" ? "active" : ""}"
                  @click="${() => this._setViewMode("grid")}"
                  aria-label="Grid view"
                >
                  <span class="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            `}

            ${this.hideDetailsToggle ? "" : l`
              <label class="details-toggle" @click="${this._toggleDetails}">
                <div class="toggle-switch ${this.showDetails ? "on" : ""}"></div>
                <span class="toggle-label">Descriptions</span>
              </label>
            `}
          </div>

          <div class="divider"></div>
        ` : l`
          ${this.isScrolled ? l`<div class="divider"></div>` : ""}
        `}

        <div class="category-section">
          <wy-filter-chip
            label="Featured"
            ?active="${this.showFeaturedOnly}"
            @click="${this._toggleFeatured}"
          ></wy-filter-chip>
          <wy-filter-chip
            label="All"
            ?active="${this.activeCategory === "all" && !this.showFeaturedOnly}"
            @click="${() => this._setCategory("all")}"
          ></wy-filter-chip>
          ${this.categories.map((e) => l`
            <wy-filter-chip
              label="${e}"
              ?active="${this.activeCategory === e && !this.showFeaturedOnly}"
              @click="${() => this._setCategory(e)}"
            ></wy-filter-chip>
          `)}
        </div>
      </div>
    `;
  }
  _handleSearch(e) {
    this.searchValue = e.target.value, this._notifyChange();
  }
  _setViewMode(e) {
    this.viewMode = e, this._notifyChange();
  }
  _toggleDetails() {
    this.showDetails = !this.showDetails, this._notifyChange();
  }
  _setCategory(e) {
    this.activeCategory = e, this.showFeaturedOnly && (this.showFeaturedOnly = !1), this._notifyChange();
  }
  _toggleFeatured() {
    this.showFeaturedOnly = !this.showFeaturedOnly, this._notifyChange();
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
      bubbles: !0,
      composed: !0
    }));
  }
}
customElements.define("wy-controls-bar", Za);
class Qa extends g {
  static properties = {
    message: { type: String },
    show: { type: Boolean, reflect: !0 },
    duration: { type: Number }
  };
  constructor() {
    super(), this.message = "", this.show = !1, this.duration = 3e3, this._timer = null;
  }
  static styles = m`
    :host {
      display: block;
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      z-index: 3000;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
      opacity: 0;
    }

    :host([show]) {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .toast-container {
      background-color: var(--md-sys-color-inverse-surface);
      color: var(--md-sys-color-inverse-on-surface);
      padding: 12px 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .icon {
      color: var(--md-sys-color-primary-fixed);
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

    .message {
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
    }
  `;
  render() {
    return l`
      <div class="toast-container">
        <span class="icon">check_circle</span>
        <span class="message">${this.message}</span>
      </div>
    `;
  }
  updated(e) {
    e.has("show") && this.show && (this._timer && clearTimeout(this._timer), this._timer = setTimeout(() => {
      this.show = !1, this.dispatchEvent(new CustomEvent("dismiss", { bubbles: !0, composed: !0 }));
    }, this.duration));
  }
}
customElements.define("wy-toast", Qa);
class Ja extends g {
  static properties = {
    open: { type: Boolean, reflect: !0 },
    heading: { type: String },
    maxWidth: { type: String, attribute: "max-width" },
    fullScreen: { type: Boolean, attribute: "full-screen" }
  };
  constructor() {
    super(), this.open = !1, this.heading = "", this.maxWidth = "560px", this.fullScreen = !1;
  }
  static styles = m`
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
  `;
  render() {
    return l`
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
    this.open = !0;
  }
  close() {
    this.open = !1;
  }
  _handleClose(e) {
    this.open = !1, this.dispatchEvent(new CustomEvent("close", {
      detail: e.detail,
      bubbles: !0,
      composed: !0
    }));
  }
  _handleCancel(e) {
    this.open = !1;
  }
}
customElements.define("wy-modal", Ja);
class es extends g {
  static properties = {
    activeTab: { type: String, attribute: "active-tab" }
  };
  static styles = m`
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
  `;
  render() {
    return l`
      <div class="tabs-list" role="tablist">
        <slot></slot>
      </div>
    `;
  }
  constructor() {
    super(), this.addEventListener("click", (e) => {
      const t = e.target.closest('[role="tab"]');
      if (t) {
        const o = t.getAttribute("data-tab");
        this.activeTab = o, this._updateTabs(), this.dispatchEvent(new CustomEvent("tab-change", {
          detail: { tab: o },
          bubbles: !0,
          composed: !0
        }));
      }
    });
  }
  updated(e) {
    e.has("activeTab") && this._updateTabs();
  }
  _updateTabs() {
    this.querySelectorAll('[role="tab"]').forEach((t) => {
      t.getAttribute("data-tab") === this.activeTab ? t.classList.add("active") : t.classList.remove("active");
    });
  }
}
customElements.define("wy-tabs", es);
class ts extends g {
  static properties = {
    label: { type: String },
    variant: { type: String },
    // 'user-entered' | 'ai-generated'
    removable: { type: Boolean }
  };
  static styles = m`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: all 0.2s;
      user-select: none;
    }

    :host([variant="user-entered"]) {
      background-color: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    :host([variant="ai-generated"]) {
      background-color: transparent;
      color: var(--md-sys-color-text-heading);
      border: 1px dashed var(--md-sys-color-primary);
    }

    .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .remove-btn:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.1);
    }

    md-icon {
      font-size: 12px;
      --md-icon-size: 12px;
    }
  `;
  render() {
    return l`
      <span>${this.label}</span>
      ${this.removable ? l`
        <div class="remove-btn" @click="${this._handleRemove}">
          <md-icon>close</md-icon>
        </div>
      ` : ""}
    `;
  }
  _handleRemove(e) {
    e.stopPropagation(), this.dispatchEvent(new CustomEvent("remove", {
      detail: { label: this.label },
      bubbles: !0,
      composed: !0
    }));
  }
}
customElements.define("wy-tag-chip", ts);
class os extends g {
  static properties = {
    tags: { type: Array },
    suggestions: { type: Array },
    placeholder: { type: String },
    disabled: { type: Boolean },
    _inputValue: { type: String, state: !0 },
    _focusedSuggestionIndex: { type: Number, state: !0 },
    _showSuggestions: { type: Boolean, state: !0 }
  };
  constructor() {
    super(), this.tags = [], this.suggestions = [], this.placeholder = "Add tag...", this.disabled = !1, this._inputValue = "", this._focusedSuggestionIndex = -1, this._showSuggestions = !1;
  }
  static styles = m`
    :host {
      display: block;
      width: 100%;
    }

    .container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      background-color: transparent;
      transition: border-color 0.2s, box-shadow 0.2s;
      min-height: 48px;
      box-sizing: border-box;
      position: relative;
    }

    .container:focus-within {
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 3px rgba(45, 78, 60, 0.1);
    }

    .container.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    input {
      flex: 1;
      min-width: 120px;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--md-sys-color-on-surface);
      padding: 4px 0;
    }

    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      z-index: 100;
      overflow: hidden;
      max-height: 240px;
      overflow-y: auto;
    }

    .suggestion-item {
      padding: 10px 16px;
      font-family: var(--font-body);
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.1s;
    }

    .suggestion-item:hover,
    .suggestion-item.focused {
      background-color: var(--md-sys-color-surface-variant);
    }

    .suggestion-count {
      opacity: 0.5;
      font-size: 0.75rem;
    }
  `;
  render() {
    const e = this._getFilteredSuggestions();
    return l`
      <div class="container ${this.disabled ? "disabled" : ""}" @click="${this._focusInput}">
        ${this.tags.map((t, o) => l`
          <wy-tag-chip 
            .label="${t.value}" 
            .variant="${t.source || "user-entered"}" 
            removable
            @remove="${() => this._removeTag(o)}">
          </wy-tag-chip>
        `)}
        <input 
          type="text" 
          .value="${this._inputValue}"
          placeholder="${this.tags.length === 0 ? this.placeholder : ""}"
          @input="${this._handleInput}"
          @keydown="${this._handleKeyDown}"
          @blur="${this._handleBlur}"
          @focus="${() => this._showSuggestions = !0}"
        >
        ${this._showSuggestions && e.length > 0 ? l`
          <div class="suggestions-dropdown">
            ${e.map((t, o) => l`
              <div 
                class="suggestion-item ${o === this._focusedSuggestionIndex ? "focused" : ""}"
                @mousedown="${(r) => {
      r.preventDefault(), this._addTag(t.value);
    }}"
                @mouseenter="${() => this._focusedSuggestionIndex = o}"
              >
                <span>${t.value}</span>
                ${t.count ? l`<span class="suggestion-count">(${t.count})</span>` : h}
              </div>
            `)}
          </div>
        ` : h}
      </div>
    `;
  }
  _getFilteredSuggestions() {
    if (!this._inputValue) return this.suggestions.filter((t) => !this.tags.some((o) => o.value === t.value));
    const e = this._inputValue.toLowerCase();
    return this.suggestions.filter((t) => t.value.toLowerCase().includes(e) && !this.tags.some((o) => o.value === t.value)).slice(0, 8);
  }
  _handleInput(e) {
    this._inputValue = e.target.value, this._focusedSuggestionIndex = -1, this._showSuggestions = !0;
  }
  _handleKeyDown(e) {
    const t = this._getFilteredSuggestions();
    e.key === "Enter" ? (e.preventDefault(), this._focusedSuggestionIndex >= 0 && t[this._focusedSuggestionIndex] ? this._addTag(t[this._focusedSuggestionIndex].value) : this._inputValue.trim() && this._addTag(this._inputValue.trim())) : e.key === "Backspace" && !this._inputValue && this.tags.length > 0 ? this._removeTag(this.tags.length - 1) : e.key === "ArrowDown" ? (e.preventDefault(), this._focusedSuggestionIndex = Math.min(this._focusedSuggestionIndex + 1, t.length - 1)) : e.key === "ArrowUp" ? (e.preventDefault(), this._focusedSuggestionIndex = Math.max(this._focusedSuggestionIndex - 1, -1)) : e.key === "Escape" && (this._showSuggestions = !1);
  }
  _handleBlur() {
    setTimeout(() => {
      this._showSuggestions = !1, this._focusedSuggestionIndex = -1;
    }, 150);
  }
  _addTag(e) {
    this.tags.some((t) => t.value === e) || (this.tags = [...this.tags, { value: e, source: "user-entered" }], this._inputValue = "", this._focusedSuggestionIndex = -1, this.dispatchEvent(new CustomEvent("change", { detail: { tags: this.tags } })));
  }
  _removeTag(e) {
    this.tags = this.tags.filter((t, o) => o !== e), this.dispatchEvent(new CustomEvent("change", { detail: { tags: this.tags } }));
  }
  _focusInput() {
    this.renderRoot.querySelector("input").focus();
  }
}
customElements.define("wy-tag-input", os);
class is extends g {
  static properties = {
    label: { type: String },
    id: { type: String },
    description: { type: String },
    error: { type: String },
    required: { type: Boolean }
  };
  static styles = m`
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
      color: var(--md-sys-color-text-heading);
    }

    .required-mark {
      color: #B3261E;
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
      color: #B3261E;
      margin-top: 4px;
    }

    ::slotted(input),
    ::slotted(textarea),
    ::slotted(select) {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--md-sys-color-outline-variant);
      background-color: transparent;
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
      box-shadow: 0 0 0 3px rgba(45, 78, 60, 0.1);
    }

    ::slotted([aria-invalid="true"]) {
      border-color: #B3261E;
    }
  `;
  render() {
    return l`
      <div class="label-container">
        ${this.label ? l`<label for="${this.id}">${this.label}${this.required ? l`<span class="required-mark">*</span>` : ""}</label>` : ""}
      </div>
      ${this.description ? l`<div class="description">${this.description}</div>` : ""}
      <slot></slot>
      ${this.error ? l`<div class="error" id="${this.id}-error">${this.error}</div>` : ""}
    `;
  }
}
customElements.define("wy-form-field", is);
class rs extends g {
  static properties = {
    label: { type: String },
    value: { type: String },
    options: { type: Array },
    placeholder: { type: String },
    searchable: { type: Boolean },
    disabled: { type: Boolean },
    variant: { type: String },
    _showDropdown: { type: Boolean, state: !0 },
    _focusedIndex: { type: Number, state: !0 }
  };
  constructor() {
    super(), this.label = "", this.value = "", this.options = [], this.placeholder = "Select option...", this.searchable = !1, this.disabled = !1, this.variant = "default", this._showDropdown = !1, this._focusedIndex = -1;
  }
  static styles = m`
        /* Note: Fonts (DM Sans, Material Symbols) should be loaded in consuming page <head> */
        
        :host {
            display: block;
            /* Fallback values for component-specific tokens */
            --wy-dropdown-label-color: #71717A;
            --wy-dropdown-text-color: #52525B;
            --wy-dropdown-icon-color: #52525B;
            --wy-dropdown-bg: var(--md-sys-color-surface, #F5F2EA);
            --wy-dropdown-border: #E5E7EB;
            --wy-dropdown-border-hover: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-menu-bg: var(--md-sys-color-surface-container-high, #EBE5DE);
            --wy-dropdown-item-hover-bg: var(--md-sys-color-surface-container-high, #EBE5DE);
        }
        
        /* Subtle variant - lighter backgrounds for modal integration */
        :host([variant="subtle"]) {
            --wy-dropdown-bg: var(--md-sys-color-surface-container-low, #FDFBF7);  /* Button bg - lighter than modal */
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
            border: 1px solid transparent;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
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
            outline: 3px solid var(--md-sys-color-primary, #2C4C3B);
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
            color: var(--md-sys-color-primary, #2C4C3B);
            font-weight: 600;
            background-color: var(--md-sys-color-primary-container, #E8F5E9);
        }
        
        .item.selected::before {
            background-color: var(--md-sys-color-primary, #2C4C3B);
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
            border-radius: 4px;
        }
        
        .dropdown::-webkit-scrollbar-thumb:hover {
            background: var(--md-sys-color-outline, #2d4e3c);
        }
    `;
  render() {
    const e = this.options.find((r) => r.value === this.value), t = e ? e.label : this.placeholder, o = !e;
    return l`
            <div class="container">
                ${this.label ? l`<div class="label">${this.label}</div>` : h}
                <button 
                    class="selector ${this._showDropdown ? "open" : ""}"
                    @click="${this._toggleDropdown}"
                    @blur="${this._handleBlur}"
                    @keydown="${this._handleKeyDown}"
                    ?disabled="${this.disabled}"
                    aria-haspopup="listbox"
                    aria-expanded="${this._showDropdown}"
                >
                    <span class="value ${o ? "placeholder" : ""}">${t}</span>
                    <span class="material-symbols-outlined icon">expand_more</span>
                </button>
                ${this._showDropdown ? l`
                    <div class="dropdown" role="listbox">
                        ${this.options.length > 0 ? this.options.map((r, a) => l`
                            <div 
                                class="item ${r.value === this.value ? "selected" : ""} ${a === this._focusedIndex ? "focused" : ""}"
                                role="option"
                                aria-selected="${r.value === this.value}"
                                @mousedown="${(n) => {
      n.preventDefault(), this._select(r.value);
    }}"
                                @mouseenter="${() => this._focusedIndex = a}"
                            >
                                ${r.label}
                            </div>
                        `) : l`<div class="no-results">No options available</div>`}
                    </div>
                ` : h}
            </div>
        `;
  }
  _toggleDropdown() {
    this.disabled || (this._showDropdown = !this._showDropdown, this._focusedIndex = this.options.findIndex((e) => e.value === this.value));
  }
  _handleBlur() {
    setTimeout(() => {
      this._showDropdown = !1;
    }, 150);
  }
  _handleKeyDown(e) {
    this.disabled || (e.key === "ArrowDown" ? (e.preventDefault(), this._showDropdown ? this._focusedIndex = Math.min(this._focusedIndex + 1, this.options.length - 1) : (this._showDropdown = !0, this._focusedIndex = this.options.findIndex((t) => t.value === this.value))) : e.key === "ArrowUp" ? (e.preventDefault(), this._showDropdown && (this._focusedIndex = Math.max(this._focusedIndex - 1, 0))) : e.key === "Enter" || e.key === " " ? (e.preventDefault(), this._showDropdown ? this._focusedIndex >= 0 && this.options[this._focusedIndex] && this._select(this.options[this._focusedIndex].value) : (this._showDropdown = !0, this._focusedIndex = this.options.findIndex((t) => t.value === this.value))) : e.key === "Escape" ? (e.preventDefault(), this._showDropdown = !1, this.renderRoot.querySelector(".selector")?.blur()) : e.key === "Home" ? (e.preventDefault(), this._showDropdown && (this._focusedIndex = 0)) : e.key === "End" && (e.preventDefault(), this._showDropdown && (this._focusedIndex = this.options.length - 1)));
  }
  _select(e) {
    this.value !== e && (this.value = e, this.dispatchEvent(new CustomEvent("change", {
      detail: { value: e },
      bubbles: !0,
      composed: !0
    }))), this._showDropdown = !1;
  }
}
customElements.define("wy-dropdown", rs);
class as extends g {
  static properties = {
    content: { type: String },
    variant: { type: String },
    heading: { type: String }
  };
  constructor() {
    super(), this.content = "", this.variant = "default", this.heading = "";
  }
  static styles = m`
        /* Note: DM Sans font should be loaded in consuming page <head> */
        
        :host {
            display: block;
            /* Fallback values for component-specific tokens */
            --wy-info-panel-bg: var(--md-sys-color-background, #FDFBF7);
            --wy-info-panel-border: var(--md-sys-color-surface-container-highest, #D7D3C8);
            --wy-info-panel-text-color: #52525B;
        }
        
        .panel {
            background-color: var(--wy-info-panel-bg);
            border: 1px solid var(--wy-info-panel-border);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--spacing-lg, 24px);
            color: var(--wy-info-panel-text-color);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
            line-height: 1.6;
            transition: background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                        border-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        .panel p {
            margin: 0;
        }
        
        .panel p + p {
            margin-top: var(--spacing-md, 16px);
        }
        
        .panel.compact {
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-secondary-container, #E8DDD7);
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
    
    /* Context-specific styling for prompt modal usage */
    :host-context(wy-prompt-modal) .panel {
        background-color: transparent;
        border: none;
        padding: var(--spacing-md, 16px);
        font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }
    
    /* Compact variant in prompt modal should have background color */
    :host-context(wy-prompt-modal) .panel.compact {
        background-color: var(--md-sys-color-secondary-container, #E8DDD7);
        border: 1px solid var(--md-sys-color-outline-variant, #DDD);
    }
    
    :host-context(wy-prompt-modal) .panel-heading {
        font-size: var(--md-sys-typescale-title-small-size, 1rem);
        margin: 0;
    }
    
    :host-context(wy-prompt-modal) .panel p + p {
        margin-top: var(--spacing-md, 16px);
    }
    `;
  render() {
    const e = this.variant === "compact" ? "panel compact" : "panel";
    return l`
            <div class="${e}">
                ${this.heading ? l`<h3 class="panel-heading">${this.heading}</h3>` : ""}
                ${this.content ? l`<p>${this.content}</p>` : l`<slot></slot>`}
            </div>
        `;
  }
}
customElements.define("wy-info-panel", as);
class ss extends g {
  static properties = {
    checked: { type: Boolean, reflect: !0 },
    label: { type: String },
    description: { type: String },
    disabled: { type: Boolean, reflect: !0 },
    // New properties for options pattern (prompts-library toggle variables)
    options: { type: Array },
    // [offValue, onValue] - string values for OFF and ON states
    value: { type: String }
    // Current string value (empty or options[1])
  };
  constructor() {
    super(), this.checked = !1, this.label = "", this.description = "", this.disabled = !1, this.options = null, this.value = "";
  }
  static styles = m`
        :host {
            display: block;
            width: 100%;
        }

        .toggle-field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-md, 16px);
            padding: var(--spacing-md, 16px) 0;
        }

        .text-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);
        }

        .label {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 1rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
            line-height: 1.5;
        }

        .description {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            line-height: 1.4;
        }

        .toggle-container {
            position: relative;
            flex-shrink: 0;
        }

        .toggle {
            position: relative;
            width: 56px;
            height: 28px;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            cursor: pointer;
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .toggle:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 30%, transparent);
        }

        .toggle.checked {
            background-color: var(--md-sys-color-primary, #2C4C3B);
        }

        .toggle.checked:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 90%, black);
        }

        .toggle.disabled {
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
            cursor: not-allowed;
        }

        .toggle:focus-visible {
            outline: 3px solid var(--md-sys-color-primary, #2C4C3B);
            outline-offset: 2px;
        }

        .toggle-knob {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 24px;
            height: 24px;
            background-color: var(--md-sys-color-surface, #FDFBF7);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toggle.checked .toggle-knob {
            transform: translateX(28px);
        }

        :host([disabled]) .toggle-field {
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
            cursor: not-allowed;
        }

        :host([disabled]) .toggle {
            pointer-events: none;
        }
    `;
  willUpdate(e) {
    this.options && Array.isArray(this.options) && this.options.length >= 2 && (e.has("value") ? this.checked = this.value === this.options[1] : e.has("options") && (this.checked = this.value === this.options[1]));
  }
  _handleToggle() {
    this.disabled || (this.checked = !this.checked, this.options && Array.isArray(this.options) && this.options.length >= 2 ? (this.value = this.checked ? this.options[1] : this.options[0], this.dispatchEvent(new CustomEvent("change", {
      detail: {
        checked: this.checked,
        value: this.value
      },
      bubbles: !0,
      composed: !0
    }))) : this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked },
      bubbles: !0,
      composed: !0
    })));
  }
  render() {
    return l`
            <div class="toggle-field">
                <div class="text-content">
                    ${this.label ? l`<div class="label">${this.label}</div>` : ""}
                    ${this.description ? l`<div class="description">${this.description}</div>` : ""}
                </div>
                <div class="toggle-container">
                    <div 
                        class="toggle ${this.checked ? "checked" : ""} ${this.disabled ? "disabled" : ""}"
                        @click="${this._handleToggle}"
                        role="switch"
                        aria-checked="${this.checked}"
                        aria-disabled="${this.disabled}"
                        tabindex="${this.disabled ? "-1" : "0"}"
                        @keydown="${(e) => {
      (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._handleToggle());
    }}"
                    >
                        <div class="toggle-knob"></div>
                    </div>
                </div>
            </div>
        `;
  }
}
customElements.define("wy-toggle-field", ss);
class ns extends g {
  static properties = {
    value: { type: String },
    accept: { type: String },
    maxSize: { type: Number, attribute: "max-size" },
    label: { type: String },
    _isDragging: { type: Boolean, state: !0 }
  };
  constructor() {
    super(), this.value = "", this.accept = "image/*", this.maxSize = 5242880, this.label = "Background Texture", this._isDragging = !1;
  }
  static styles = m`
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
            border: 2px dashed color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--spacing-2xl, 48px) var(--spacing-xl, 32px);
            text-align: center;
            cursor: pointer;
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            background-color: transparent;
        }

        .upload-zone:hover {
            background-color: var(--md-sys-color-surface, #FDFBF7);
            border-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 40%, transparent);
        }

        .upload-zone.dragging {
            border-color: var(--md-sys-color-primary, #2C4C3B);
            border-style: solid;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 5%, transparent);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 5%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 24px;
            color: var(--md-sys-color-primary, #2C4C3B);
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

        input[type="file"] {
            display: none;
        }
    `;
  _handleDragOver(e) {
    e.preventDefault(), this._isDragging = !0;
  }
  _handleDragLeave(e) {
    e.preventDefault(), this._isDragging = !1;
  }
  _handleDrop(e) {
    e.preventDefault(), this._isDragging = !1;
    const t = e.dataTransfer?.files;
    t && t.length > 0 && this._handleFile(t[0]);
  }
  _handleFileSelect(e) {
    const t = e.target.files;
    t && t.length > 0 && this._handleFile(t[0]);
  }
  _handleFile(e) {
    if (!e.type.startsWith("image/")) {
      this.dispatchEvent(new CustomEvent("error", {
        detail: { message: "Please select an image file" },
        bubbles: !0,
        composed: !0
      }));
      return;
    }
    if (e.size > this.maxSize) {
      const t = (this.maxSize / 1048576).toFixed(1);
      this.dispatchEvent(new CustomEvent("error", {
        detail: { message: `File size must be less than ${t}MB` },
        bubbles: !0,
        composed: !0
      }));
      return;
    }
    this.dispatchEvent(new CustomEvent("change", {
      detail: { file: e },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleRemove(e) {
    e.stopPropagation(), this.value = "", this.dispatchEvent(new CustomEvent("remove", {
      detail: {},
      bubbles: !0,
      composed: !0
    }));
  }
  _handleClick() {
    this.value || this.shadowRoot.querySelector('input[type="file"]').click();
  }
  render() {
    const e = !!this.value;
    return l`
            ${this.label ? l`<div class="label">${this.label}</div>` : ""}
            <div 
                class="upload-zone ${this._isDragging ? "dragging" : ""} ${e ? "has-image" : ""}"
                @dragover="${this._handleDragOver}"
                @dragleave="${this._handleDragLeave}"
                @drop="${this._handleDrop}"
                @click="${this._handleClick}"
            >
                ${e ? l`
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
                ` : l`
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
}
customElements.define("wy-image-upload", ns);
class ls extends g {
  static properties = {
    value: { type: String },
    variables: { type: Array },
    placeholder: { type: String },
    rows: { type: Number },
    label: { type: String },
    maxLength: { type: Number, attribute: "max-length" }
  };
  constructor() {
    super(), this.value = "", this.variables = [], this.placeholder = "", this.rows = 8, this.label = "Template", this.maxLength = 0;
  }
  static styles = m`
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
            border-color: var(--md-sys-color-primary, #2C4C3B);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.75rem;
            color: var(--md-sys-color-primary, #2C4C3B);
            cursor: pointer;
            border: 1px solid color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 30%, transparent);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variable-chip:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent);
            border-color: var(--md-sys-color-primary, #2C4C3B);
        }

        .char-count {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            text-align: right;
            margin-top: var(--spacing-xs, 4px);
        }

        .char-count.over-limit {
            color: var(--md-sys-color-error, #B3261E);
        }
    `;
  _handleInput(e) {
    this.value = e.target.value, this.dispatchEvent(new CustomEvent("input", {
      detail: { value: this.value },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleChange(e) {
    this.value = e.target.value, this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: !0,
      composed: !0
    }));
  }
  updated(e) {
    if (e.has("value")) {
      const t = this.shadowRoot.querySelector("textarea"), o = this.shadowRoot.activeElement === t;
      t && !o && t.value !== this.value && (t.value = this.value);
    }
  }
  _insertVariable(e) {
    const t = this.shadowRoot.querySelector("textarea"), o = t.selectionStart, r = t.selectionEnd, a = this.value.substring(0, o), n = this.value.substring(r), c = `{{${e}}}`;
    this.value = a + c + n, this.dispatchEvent(new CustomEvent("input", {
      detail: { value: this.value },
      bubbles: !0,
      composed: !0
    })), this.updateComplete.then(() => {
      const p = o + c.length;
      t.setSelectionRange(p, p), t.focus();
    });
  }
  render() {
    const e = this.value.length, t = this.maxLength > 0, o = t && e > this.maxLength;
    return l`
            ${this.label ? l`<div class="label">${this.label}</div>` : ""}
            <textarea
                placeholder="${this.placeholder}"
                rows="${this.rows}"
                maxlength="${this.maxLength > 0 ? this.maxLength : ""}"
                @input="${this._handleInput}"
                @change="${this._handleChange}"
            ></textarea>
            ${this.variables && this.variables.length > 0 ? l`
                <div class="variable-chips">
                    ${this.variables.map((r) => l`
                        <button 
                            class="variable-chip"
                            @click="${() => this._insertVariable(r)}"
                            type="button"
                        >
                            {{${r}}}
                        </button>
                    `)}
                </div>
            ` : ""}
            ${t ? l`
                <div class="char-count ${o ? "over-limit" : ""}">
                    ${e}${this.maxLength > 0 ? ` / ${this.maxLength}` : ""} characters
                </div>
            ` : ""}
        `;
  }
}
customElements.define("wy-code-textarea", ls);
class ds extends g {
  static properties = {
    variables: { type: Array },
    allowReorder: { type: Boolean, attribute: "allow-reorder" }
  };
  constructor() {
    super(), this.variables = [], this.allowReorder = !0;
  }
  static styles = m`
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
            border-color: var(--md-sys-color-primary, #2C4C3B);
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
            color: var(--md-sys-color-error, #B3261E);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .icon-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-error, #B3261E) 10%, transparent);
        }

        .add-button {
            margin-top: var(--spacing-md, 16px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: transparent;
            border: 1px solid var(--md-sys-color-primary, #2C4C3B);
            color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
        }
    `;
  _emitChange() {
    this.dispatchEvent(new CustomEvent("change", {
      detail: { variables: [...this.variables] },
      bubbles: !0,
      composed: !0
    }));
  }
  _updateVariable(e, t, o) {
    const r = [...this.variables];
    r[e] = { ...r[e], [t]: o }, this.variables = r, this._emitChange();
  }
  _removeVariable(e) {
    this.variables = this.variables.filter((t, o) => o !== e), this._emitChange();
  }
  _addVariable() {
    this.variables = [
      ...this.variables,
      {
        name: "",
        label: "",
        placeholder: "",
        inputType: "text",
        options: ["", ""]
      }
    ], this._emitChange();
  }
  render() {
    return l`
            <div class="variables-list">
                ${this.variables.map((e, t) => l`
                    <div class="variable-item">
                        ${this.allowReorder ? l`
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
                                    .value="${e.name || ""}"
                                    @input="${(o) => this._updateVariable(t, "name", o.target.value)}"
                                    placeholder="variable-name"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Label</label>
                                <input
                                    type="text"
                                    .value="${e.label || ""}"
                                    @input="${(o) => this._updateVariable(t, "label", o.target.value)}"
                                    placeholder="Display Label"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Placeholder</label>
                                <input
                                    type="text"
                                    .value="${e.placeholder || ""}"
                                    @input="${(o) => this._updateVariable(t, "placeholder", o.target.value)}"
                                    placeholder="Helper text"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Input Type</label>
                                <select
                                    .value="${e.inputType || "text"}"
                                    @change="${(o) => this._updateVariable(t, "inputType", o.target.value)}"
                                >
                                    <option value="text">Text</option>
                                    <option value="toggle">Toggle</option>
                                </select>
                            </div>
                            ${e.inputType === "toggle" ? l`
                                <div class="toggle-options">
                                    <div class="field">
                                        <label class="field-label">Off Value</label>
                                        <input
                                            type="text"
                                            .value="${e.options?.[0] || ""}"
                                            @input="${(o) => {
      const r = [...e.options || ["", ""]];
      r[0] = o.target.value, this._updateVariable(t, "options", r);
    }}"
                                            placeholder="Value when off"
                                        >
                                    </div>
                                    <div class="field">
                                        <label class="field-label">On Value</label>
                                        <input
                                            type="text"
                                            .value="${e.options?.[1] || ""}"
                                            @input="${(o) => {
      const r = [...e.options || ["", ""]];
      r[1] = o.target.value, this._updateVariable(t, "options", r);
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
                                @click="${() => this._removeVariable(t)}"
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
}
customElements.define("wy-variable-editor", ds);
class cs extends g {
  static properties = {
    variations: { type: Array },
    allowReorder: { type: Boolean, attribute: "allow-reorder" },
    _expandedIndex: { type: Number, state: !0 }
  };
  constructor() {
    super(), this.variations = [], this.allowReorder = !0, this._expandedIndex = -1;
  }
  static styles = m`
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
            border-color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: var(--md-sys-color-primary, #2C4C3B);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .add-step-button:hover {
            border-color: var(--md-sys-color-primary, #2C4C3B);
            color: var(--md-sys-color-primary, #2C4C3B);
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
            outline: 3px solid var(--md-sys-color-primary, #2C4C3B);
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
            background-color: var(--md-sys-color-primary, #2C4C3B);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .add-variation-button:hover {
            border-color: var(--md-sys-color-primary, #2C4C3B);
            color: var(--md-sys-color-primary, #2C4C3B);
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
    `;
  _handleToggle(e) {
    this._expandedIndex = this._expandedIndex === e ? -1 : e;
  }
  _handleFieldChange(e, t, o) {
    const r = [...this.variations];
    r[e] = {
      ...r[e],
      [t]: o
    }, this._notifyChange(r);
  }
  _handleModeChange(e, t) {
    const o = this.variations[e], r = [...this.variations];
    if (t === "multi")
      r[e] = {
        ...o,
        steps: o.steps || [{
          id: "step-1",
          name: "Step 1",
          instructions: "",
          template: o.template || "",
          variables: o.variables || []
        }]
      };
    else {
      const a = o.steps?.[0];
      r[e] = {
        ...o,
        template: a?.template || o.template || "",
        variables: a?.variables || o.variables || [],
        steps: void 0
      };
    }
    this._notifyChange(r);
  }
  _handleStepChange(e, t) {
    const { index: o, step: r } = t.detail, a = [...this.variations], n = a[e];
    n.steps && (n.steps[o] = r, this._notifyChange(a));
  }
  _handleStepDelete(e, t) {
    const { index: o } = t.detail, r = [...this.variations], a = r[e];
    a.steps && a.steps.length > 1 ? (a.steps.splice(o, 1), this._notifyChange(r)) : alert("Cannot delete the last step. Convert to template mode instead.");
  }
  _handleStepMoveUp(e, t) {
    const { index: o } = t.detail;
    if (o === 0) return;
    const r = [...this.variations], a = r[e].steps;
    [a[o - 1], a[o]] = [a[o], a[o - 1]], this._notifyChange(r);
  }
  _handleStepMoveDown(e, t) {
    const { index: o } = t.detail, r = [...this.variations], a = r[e].steps;
    o !== a.length - 1 && ([a[o], a[o + 1]] = [a[o + 1], a[o]], this._notifyChange(r));
  }
  _handleStepToggle(e, t) {
  }
  _handleAddStep(e) {
    const t = [...this.variations], o = t[e];
    o.steps || (o.steps = []);
    const r = o.steps.length + 1;
    o.steps.push({
      id: `step-${r}`,
      name: `Step ${r}`,
      instructions: "",
      template: "",
      variables: []
    }), this._notifyChange(t);
  }
  _handleVariableChange(e, t) {
    this._handleFieldChange(e, "variables", t.detail.variables);
  }
  _handleTemplateChange(e, t) {
    this._handleFieldChange(e, "template", t.detail.value);
  }
  _handleMoveUp(e) {
    if (e === 0) return;
    const t = [...this.variations];
    [t[e - 1], t[e]] = [t[e], t[e - 1]], this._notifyChange(t);
  }
  _handleMoveDown(e) {
    if (e === this.variations.length - 1) return;
    const t = [...this.variations];
    [t[e], t[e + 1]] = [t[e + 1], t[e]], this._notifyChange(t);
  }
  _handleDelete(e) {
    if (this.variations.length === 1) {
      alert("Cannot delete the last variation. Prompts must have at least one variation.");
      return;
    }
    const o = `Delete variation "${this.variations[e].name || "Unnamed"}"?

This action cannot be undone.`;
    if (confirm(o)) {
      const r = this.variations.filter((a, n) => n !== e);
      this._notifyChange(r), this._expandedIndex === e ? this._expandedIndex = -1 : this._expandedIndex > e && this._expandedIndex--;
    }
  }
  _handleAddVariation() {
    const e = this.variations.length + 1, t = [
      ...this.variations,
      {
        id: `variation-${e}`,
        name: `Variation ${e}`,
        description: "",
        template: "",
        variables: []
      }
    ];
    this._notifyChange(t), this._expandedIndex = t.length - 1;
  }
  _notifyChange(e) {
    this.dispatchEvent(new CustomEvent("change", {
      detail: { variations: e },
      bubbles: !0,
      composed: !0
    }));
  }
  _renderVariation(e, t) {
    const o = this._expandedIndex === t, r = t === 0, a = t === this.variations.length - 1, n = e.steps && e.steps.length > 0, c = e.template || !n, p = n ? "multi" : "single", f = (e.variables || []).map((u) => u.name);
    return l`
            <div class="variation-card ${o ? "expanded" : ""}">
                <!-- Header -->
                <div class="variation-header" @click="${() => this._handleToggle(t)}">
                    ${this.allowReorder ? l`
                        <span class="material-symbols-outlined drag-handle">drag_indicator</span>
                    ` : ""}
                    <h3 class="variation-title">${e.name || "Unnamed Variation"}</h3>
                    ${n ? l`
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
                                    .value="${e.name || ""}"
                                    @input="${(u) => this._handleFieldChange(t, "name", u.target.value)}"
                                    placeholder="e.g., Tina Barney Style Photo"
                                    @click="${(u) => u.stopPropagation()}"
                                >
                            </wy-form-field>

                            <!-- Variation ID -->
                            <wy-form-field 
                                label="Variation ID" 
                                description="Unique identifier (lowercase, no spaces)"
                            >
                                <input
                                    type="text"
                                    .value="${e.id || ""}"
                                    @input="${(u) => this._handleFieldChange(t, "id", u.target.value)}"
                                    placeholder="e.g., tina-barney"
                                    @click="${(u) => u.stopPropagation()}"
                                >
                            </wy-form-field>

                            <!-- Variation Description -->
                            <wy-form-field label="Description">
                                <textarea
                                    rows="3"
                                    .value="${e.description || ""}"
                                    @input="${(u) => this._handleFieldChange(t, "description", u.target.value)}"
                                    placeholder="Description shown in variation selector"
                                    @click="${(u) => u.stopPropagation()}"
                                ></textarea>
                            </wy-form-field>

                            <!-- Mode Toggle -->
                            <div class="mode-toggle" @click="${(u) => u.stopPropagation()}">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode-${t}" 
                                        value="single" 
                                        ?checked="${p === "single"}"
                                        @change="${() => this._handleModeChange(t, "single")}"
                                    >
                                    Template
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode-${t}" 
                                        value="multi" 
                                        ?checked="${p === "multi"}"
                                        @change="${() => this._handleModeChange(t, "multi")}"
                                    >
                                    Multi-Step
                                </label>
                            </div>

                            ${c && !n ? l`
                                <!-- Template Mode -->
                                <div class="section-divider"></div>
                                
                                <!-- Variables -->
                                <div class="field-group">
                                    <label class="field-label">Variables</label>
                                    <p class="field-description">
                                        Define input fields for this variation
                                    </p>
                                    <wy-variable-editor
                                        .variables="${e.variables || []}"
                                        @change="${(u) => this._handleVariableChange(t, u)}"
                                        @click="${(u) => u.stopPropagation()}"
                                    ></wy-variable-editor>
                                </div>

                                <!-- Template -->
                                <div class="field-group">
                                    <label class="field-label">Template</label>
                                    <p class="field-description">
                                        Prompt template for this variation. Use {{variable-name}} for substitutions.
                                    </p>
                                    <wy-code-textarea
                                        .value="${e.template || ""}"
                                        .variables="${f}"
                                        placeholder="Enter your prompt template here..."
                                        rows="12"
                                        @input="${(u) => this._handleTemplateChange(t, u)}"
                                        @click="${(u) => u.stopPropagation()}"
                                    ></wy-code-textarea>
                                </div>
                            ` : ""}

                            ${n ? l`
                                <!-- Multi-Step Mode -->
                                <div class="section-divider"></div>
                                
                                <div class="field-group">
                                    <label class="field-label">Steps</label>
                                    <p class="field-description">
                                        Define the sequence of prompts for this variation
                                    </p>
                                    <div class="steps-section" @click="${(u) => u.stopPropagation()}">
                                        ${e.steps.map((u, v) => l`
                                            <wy-step-editor
                                                .step="${u}"
                                                .index="${v}"
                                                .total="${e.steps.length}"
                                                .expanded="${v === 0}"
                                                @step-change="${(b) => this._handleStepChange(t, b)}"
                                                @step-delete="${(b) => this._handleStepDelete(t, b)}"
                                                @step-move-up="${(b) => this._handleStepMoveUp(t, b)}"
                                                @step-move-down="${(b) => this._handleStepMoveDown(t, b)}"
                                                @step-toggle="${(b) => this._handleStepToggle(t, b)}"
                                            ></wy-step-editor>
                                        `)}
                                        <button 
                                            class="add-step-button" 
                                            @click="${() => this._handleAddStep(t)}"
                                        >
                                            <span class="material-symbols-outlined">add</span>
                                            Add Step
                                        </button>
                                    </div>
                                </div>
                            ` : ""}
                        </div>

                        <!-- Variation Controls -->
                        <div class="variation-controls" @click="${(u) => u.stopPropagation()}">
                            ${this.allowReorder ? l`
                                <button
                                    class="control-button"
                                    @click="${() => this._handleMoveUp(t)}"
                                    ?disabled="${r}"
                                    title="Move variation up"
                                >
                                    <span class="material-symbols-outlined">arrow_upward</span>
                                    Move Up
                                </button>
                                <button
                                    class="control-button"
                                    @click="${() => this._handleMoveDown(t)}"
                                    ?disabled="${a}"
                                    title="Move variation down"
                                >
                                    <span class="material-symbols-outlined">arrow_downward</span>
                                    Move Down
                                </button>
                            ` : ""}
                            <button
                                class="control-button delete"
                                @click="${() => this._handleDelete(t)}"
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
    return l`
            <div class="variations-list">
                ${this.variations.map(
      (e, t) => this._renderVariation(e, t)
    )}
            </div>
            <button class="add-variation-button" @click="${this._handleAddVariation}">
                <span class="material-symbols-outlined">add</span>
                Add Variation
            </button>
        `;
  }
}
customElements.define("wy-variation-editor", cs);
class ps extends g {
  static properties = {
    prompt: { type: Object },
    categories: { type: Array },
    readonly: { type: Boolean },
    _editedPrompt: { type: Object, state: !0 },
    _promptMode: { type: String, state: !0 },
    _expandedSteps: { type: Array, state: !0 },
    _showGitInfo: { type: Boolean, state: !0 }
  };
  constructor() {
    super(), this.prompt = null, this.categories = [], this.readonly = !1, this._editedPrompt = null, this._promptMode = "single", this._expandedSteps = [], this._showGitInfo = !1;
  }
  updated(e) {
    e.has("prompt") && this.prompt && (this._editedPrompt = JSON.parse(JSON.stringify(this.prompt)), !this._editedPrompt.slug && this._editedPrompt.title && (this._editedPrompt.slug = this._generateSlug(this._editedPrompt.title)), this._promptMode = this._editedPrompt.steps && this._editedPrompt.steps.length > 0 ? "multi" : "single", this._expandedSteps = this._promptMode === "multi" ? [0] : []);
  }
  static styles = m`
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
            min-height: 100vh;
        }

        .editor-form {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
        }

        .editor-header {
            padding-bottom: var(--spacing-md, 16px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .actions {
            position: sticky;
            top: 0;
            background-color: var(--md-sys-color-background, #FDFBF7);
            padding: var(--spacing-md, 16px);
            margin: 0 calc(-1 * var(--spacing-lg, 24px)) var(--spacing-lg, 24px);
            border-bottom: 1px solid var(--md-sys-color-outline-variant, #DDD);
            z-index: 100;
            backdrop-filter: blur(8px);
        }

        .breadcrumbs {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-bottom: var(--spacing-sm, 8px);
        }

        .breadcrumbs a {
            color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 5%, transparent);
            border-left: 4px solid var(--md-sys-color-primary, #2C4C3B);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
        }

        .actions {
            display: flex;
            gap: var(--spacing-sm, 8px);
            justify-content: flex-end;
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
            background-color: var(--md-sys-color-primary, #2C4C3B);
            color: var(--md-sys-color-on-primary, #FFFFFF);
        }

        .button-primary:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 90%, black);
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
            color: var(--md-sys-color-primary, #2C4C3B);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
            color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-icon .material-symbols-outlined {
            font-size: 24px;
            color: var(--md-sys-color-primary, #2C4C3B);
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

        @media (max-width: 1200px) {
            .editor-layout {
                grid-template-columns: 1fr;
            }

            .editor-preview {
                position: static;
            }
        }
    `;
  _generateSlug(e) {
    return e.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  _handleFieldChange(e, t) {
    this._editedPrompt && (this._editedPrompt = {
      ...this._editedPrompt,
      [e]: t
    }, e === "title" && (this._editedPrompt.slug = this._generateSlug(t)), this.requestUpdate());
  }
  _handleSave() {
    if (this._promptMode === "multi")
      this.shadowRoot.querySelectorAll("wy-step-editor").forEach((t, o) => {
        const r = t.shadowRoot?.querySelector("wy-code-textarea");
        if (r) {
          const a = r.shadowRoot?.querySelector("textarea");
          a && this._editedPrompt.steps[o] && (this._editedPrompt.steps[o].template = a.value);
        }
      });
    else {
      const e = this.shadowRoot.querySelector("wy-code-textarea");
      if (e) {
        const t = e.shadowRoot?.querySelector("textarea");
        t && (this._editedPrompt.template = t.value);
      }
    }
    this._showGitInfo = !0, this.dispatchEvent(new CustomEvent("save", {
      detail: { prompt: this._editedPrompt },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel", {
      detail: {},
      bubbles: !0,
      composed: !0
    }));
  }
  _handleImageChange(e) {
    const { file: t } = e.detail;
    this.dispatchEvent(new CustomEvent("image-upload", {
      detail: { file: t, promptId: this._editedPrompt?.id },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleImageRemove() {
    this._handleFieldChange("image", ""), this.dispatchEvent(new CustomEvent("image-remove", {
      detail: { promptId: this._editedPrompt?.id },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleModeChange(e, t) {
    if (t === this._promptMode) return;
    if (!confirm(t === "multi" ? `Convert to multi-step prompt?

This will move your template and variables into a single step.` : `Convert to single-step prompt?

This will use Step 1 as the template and discard other steps.`)) {
      e.preventDefault(), this.requestUpdate();
      return;
    }
    this._convertPromptMode(t);
  }
  _convertPromptMode(e) {
    if (e === "multi")
      this._editedPrompt.steps = [{
        id: "step-1",
        name: "Step 1",
        instructions: "",
        template: this._editedPrompt.template || "",
        variables: this._editedPrompt.variables || []
      }], this._editedPrompt.template = "", this._editedPrompt.variables = [], this._expandedSteps = [0];
    else {
      const t = this._editedPrompt.steps?.[0];
      this._editedPrompt.template = t?.template || "", this._editedPrompt.variables = t?.variables || [], delete this._editedPrompt.steps, this._expandedSteps = [];
    }
    this._promptMode = e, this.requestUpdate();
  }
  _handleStepChange(e) {
    const { index: t, step: o } = e.detail;
    this._editedPrompt.steps[t] = o, this.requestUpdate();
  }
  _handleStepDelete(e) {
    const { index: t } = e.detail;
    if (this._editedPrompt.steps.length === 1) {
      alert(`Cannot delete the last step.

Convert to single-step mode instead.`);
      return;
    }
    this._editedPrompt.steps.splice(t, 1), this._expandedSteps = this._expandedSteps.map((o) => o > t ? o - 1 : o).filter((o) => o < this._editedPrompt.steps.length), this.requestUpdate();
  }
  _handleStepMoveUp(e) {
    const { index: t } = e.detail;
    if (t === 0) return;
    const o = this._editedPrompt.steps;
    [o[t - 1], o[t]] = [o[t], o[t - 1]], this._expandedSteps.includes(t) ? (this._expandedSteps = this._expandedSteps.filter((r) => r !== t), this._expandedSteps.push(t - 1)) : this._expandedSteps.includes(t - 1) && (this._expandedSteps = this._expandedSteps.filter((r) => r !== t - 1), this._expandedSteps.push(t)), this.requestUpdate();
  }
  _handleStepMoveDown(e) {
    const { index: t } = e.detail;
    if (t === this._editedPrompt.steps.length - 1) return;
    const o = this._editedPrompt.steps;
    [o[t], o[t + 1]] = [o[t + 1], o[t]], this._expandedSteps.includes(t) ? (this._expandedSteps = this._expandedSteps.filter((r) => r !== t), this._expandedSteps.push(t + 1)) : this._expandedSteps.includes(t + 1) && (this._expandedSteps = this._expandedSteps.filter((r) => r !== t + 1), this._expandedSteps.push(t)), this.requestUpdate();
  }
  _handleStepToggle(e) {
    const { index: t } = e.detail, o = this._expandedSteps.indexOf(t);
    o > -1 ? this._expandedSteps.splice(o, 1) : this._expandedSteps.push(t), this.requestUpdate();
  }
  _handleAddStep() {
    const e = this._editedPrompt.steps.length + 1, t = {
      id: `step-${e}`,
      name: `Step ${e}`,
      instructions: "",
      template: "",
      variables: []
    };
    this._editedPrompt.steps.push(t), this._expandedSteps.push(this._editedPrompt.steps.length - 1), this.requestUpdate();
  }
  render() {
    if (!this._editedPrompt)
      return l`<div>No prompt loaded</div>`;
    const e = this.categories.map((o) => ({ value: o, label: o })), t = (this._editedPrompt.variables || []).map((o) => o.name);
    return l`
            <div class="editor-layout">
                <!-- Left Column: Form -->
                <div class="editor-form">
                    <!-- Header -->
                    <div class="editor-header">
                        <nav class="breadcrumbs">
                            <a href="#" @click="${(o) => {
      o.preventDefault(), window.location.hash = "";
    }}">← Back to prompts list</a>
                        </nav>
                        <h1>Prompt Editor</h1>
                        <p class="subtitle">Edit prompt details and template</p>
                    </div>
                    
                    ${this._showGitInfo ? l`
                        <div class="info-banner">
                            <p><strong>Changes saved to prompts.json.</strong> Run <code>git add prompts.json && git commit -m "Update prompts" && git push</code> to publish. To undo: <code>git checkout -- prompts.json</code></p>
                        </div>
                    ` : ""}
                    
                    <div class="actions">
                        <button class="button button-secondary" @click="${this._handleCancel}">
                            Discard Changes
                        </button>
                        <button class="button button-primary" @click="${this._handleSave}">
                            Save Changes
                        </button>
                    </div>

                    <!-- Section 1: Basic Information -->
                    <div class="card">
                        <h2 class="card-title">Basic Information</h2>
                        <wy-form-field label="Prompt Title" id="title" required>
                            <input
                                type="text"
                                id="title"
                                .value="${this._editedPrompt.title || ""}"
                                @input="${(o) => this._handleFieldChange("title", o.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-form-field label="Slug" id="slug" description="URL-friendly identifier (auto-generated from title)">
                            <input
                                type="text"
                                id="slug"
                                .value="${this._editedPrompt.slug || ""}"
                                @input="${(o) => this._handleFieldChange("slug", o.target.value)}"
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
                                @input="${(o) => this._handleFieldChange("description", o.target.value)}"
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
                                @input="${(o) => this._handleFieldChange("icon", o.target.value)}"
                                placeholder="icon_name"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-dropdown
                            label="Category"
                            .value="${this._editedPrompt.category || ""}"
                            .options="${e}"
                            @change="${(o) => this._handleFieldChange("category", o.detail.value)}"
                        ></wy-dropdown>
                        <wy-image-upload
                            label="Background Image"
                            .value="${this._editedPrompt.image || ""}"
                            @change="${this._handleImageChange}"
                            @remove="${this._handleImageRemove}"
                        ></wy-image-upload>
                    </div>

                    <!-- Section 3: Content Structure -->
                    ${this._editedPrompt.variations && this._editedPrompt.variations.length > 0 ? l`
                        <!-- Variations Mode -->
                        <div class="card">
                            <h2 class="card-title">Variations</h2>
                            <p class="card-description">
                                This prompt has multiple variations. Each variation can be a simple template or multi-step workflow.
                            </p>
                            <wy-variation-editor
                                .variations="${this._editedPrompt.variations}"
                                @change="${(o) => this._handleFieldChange("variations", o.detail.variations)}"
                            ></wy-variation-editor>
                        </div>
                    ` : l`
                        <!-- Standard Mode (No Variations) -->
                        <div class="card">
                            <h2 class="card-title">Prompt Type</h2>
                            <div class="mode-toggle">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="single" 
                                        ?checked="${this._promptMode === "single"}"
                                        @click="${(o) => this._handleModeChange(o, "single")}"
                                    >
                                    Single Step
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="multi" 
                                        ?checked="${this._promptMode === "multi"}"
                                        @click="${(o) => this._handleModeChange(o, "multi")}"
                                    >
                                    Multi-Step
                                </label>
                            </div>
                        </div>

                        <!-- Single-Step Content -->
                        ${this._promptMode === "single" ? l`
                            <!-- Variables -->
                            <div class="card">
                                <h2 class="card-title">Variables</h2>
                                <wy-variable-editor
                                    .variables="${this._editedPrompt.variables || []}"
                                    @change="${(o) => this._handleFieldChange("variables", o.detail.variables)}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Template -->
                            <div class="card">
                                <h2 class="card-title">Template</h2>
                                <wy-code-textarea
                                    label="Prompt Template"
                                    .value="${this._editedPrompt.template || ""}"
                                    .variables="${t}"
                                    placeholder="Enter your prompt template here. Use {{variable-name}} for substitutions."
                                    rows="12"
                                    @input="${(o) => this._handleFieldChange("template", o.detail.value)}"
                                ></wy-code-textarea>
                            </div>
                        ` : ""}

                        <!-- Multi-Step Content -->
                        ${this._promptMode === "multi" ? l`
                            <div class="card">
                                <h2 class="card-title">Steps</h2>
                                <p class="card-description">
                                    Define the sequence of prompts. Users will follow these steps in order.
                                </p>
                                
                                ${(this._editedPrompt.steps || []).map((o, r) => l`
                                    <wy-step-editor
                                        .step="${o}"
                                        .index="${r}"
                                        .total="${this._editedPrompt.steps.length}"
                                        .expanded="${this._expandedSteps.includes(r)}"
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
                        <wy-toggle-field
                            label="Featured"
                            description="Featured prompts are highlighted and sorted to the top of the library"
                            .checked="${this._editedPrompt.featured || !1}"
                            @change="${(o) => this._handleFieldChange("featured", o.detail.checked)}"
                        ></wy-toggle-field>
                        <wy-toggle-field
                            label="Archive Prompt"
                            description="Archived prompts are hidden from the public site but remain editable here"
                            .checked="${this._editedPrompt.archived || !1}"
                            @change="${(o) => this._handleFieldChange("archived", o.detail.checked)}"
                        ></wy-toggle-field>
                    </div>
                </div>

                <!-- Right Column: Preview -->
                <div class="editor-preview">
                    <div class="preview-header">
                        <h3 class="preview-title">Live Preview</h3>
                        <span class="preview-status">Updating</span>
                    </div>
                    <div class="preview-card">
                        ${this._editedPrompt.image ? l`
                            <img src="${this._editedPrompt.image}" alt="Preview" class="preview-image">
                        ` : this._editedPrompt.icon ? l`
                            <div class="preview-icon">
                                <span class="material-symbols-outlined">${this._editedPrompt.icon}</span>
                            </div>
                        ` : ""}
                        ${this._editedPrompt.category ? l`
                            <div class="preview-badge">${this._editedPrompt.category}</div>
                        ` : ""}
                        <h3 class="preview-title-text">${this._editedPrompt.title || "Untitled Prompt"}</h3>
                        <p class="preview-description">${this._editedPrompt.description || "No description provided."}</p>
                    </div>
                </div>
            </div>
        `;
  }
}
customElements.define("wy-prompt-editor", ps);
class hs extends g {
  static properties = {
    step: { type: Object },
    index: { type: Number },
    total: { type: Number },
    expanded: { type: Boolean }
  };
  constructor() {
    super(), this.step = null, this.index = 0, this.total = 1, this.expanded = !1;
  }
  static styles = m`
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
            border-color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: var(--md-sys-color-primary, #2C4C3B);
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
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 5%, transparent);
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
            outline: 3px solid var(--md-sys-color-primary, #2C4C3B);
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
            border-color: var(--md-sys-color-primary, #2C4C3B);
        }

        textarea {
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
        }
    `;
  _handleToggle() {
    this.dispatchEvent(new CustomEvent("step-toggle", {
      detail: { index: this.index, expanded: !this.expanded },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleFieldChange(e, t) {
    if (!this.step) return;
    const o = {
      ...this.step,
      [e]: t
    };
    this.dispatchEvent(new CustomEvent("step-change", {
      detail: { index: this.index, step: o },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleVariableChange(e) {
    this._handleFieldChange("variables", e.detail.variables);
  }
  _handleTemplateChange(e) {
    this._handleFieldChange("template", e.detail.value);
  }
  _handleMoveUp() {
    this.dispatchEvent(new CustomEvent("step-move-up", {
      detail: { index: this.index },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleMoveDown() {
    this.dispatchEvent(new CustomEvent("step-move-down", {
      detail: { index: this.index },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleDelete() {
    const e = `Delete "${this.step?.name || "this step"}"?

This action cannot be undone.`;
    confirm(e) && this.dispatchEvent(new CustomEvent("step-delete", {
      detail: { index: this.index },
      bubbles: !0,
      composed: !0
    }));
  }
  render() {
    if (!this.step)
      return l`<div>No step data</div>`;
    const e = (this.step.variables || []).map((r) => r.name), t = this.index === 0, o = this.index === this.total - 1;
    return l`
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
                                    @input="${(r) => this._handleFieldChange("name", r.target.value)}"
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
                                    @input="${(r) => this._handleFieldChange("id", r.target.value)}"
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
                                    @input="${(r) => this._handleFieldChange("instructions", r.target.value)}"
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
                                    .variables="${e}"
                                    placeholder="Enter your prompt template here..."
                                    rows="12"
                                    @input="${this._handleTemplateChange}"
                                ></wy-code-textarea>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="step-controls">
                            <button
                                class="control-button"
                                @click="${this._handleMoveUp}"
                                ?disabled="${t}"
                                title="Move step up"
                            >
                                <span class="material-symbols-outlined">arrow_upward</span>
                                Move Up
                            </button>
                            <button
                                class="control-button"
                                @click="${this._handleMoveDown}"
                                ?disabled="${o}"
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
}
customElements.define("wy-step-editor", hs);
class us extends g {
  static properties = {
    label: { type: String },
    description: { type: String },
    icon: { type: String },
    value: { type: String },
    name: { type: String },
    checked: { type: Boolean, reflect: !0 },
    disabled: { type: Boolean }
  };
  static styles = m`
    :host {
      display: block;
      cursor: pointer;
    }

    .card {
      padding: 16px 20px;
      border-radius: 16px;
      border: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface);
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 16px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      height: 100%;
      box-sizing: border-box;
    }

    :host([checked]) .card {
      border-color: var(--md-sys-color-primary);
      background-color: rgba(45, 78, 60, 0.04);
      box-shadow: 0 0 0 1px var(--md-sys-color-primary);
    }

    .card:hover {
      border-color: var(--md-sys-color-primary);
      background-color: var(--md-sys-color-surface-variant);
    }

    .icon-container {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background-color: var(--md-sys-color-surface-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-text-heading);
      margin-top: 2px; /* Slight alignment adjust */
    }

    @media (max-width: 600px) {
      .icon-container {
        display: none;
      }
      .card {
        padding: 16px;
      }
    }

    :host([checked]) .icon-container {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    .content-stack {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .label {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .description {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.4;
    }

    .radio-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    /* Accessibility focus */
    .card:focus-within {
      outline: none;
      box-shadow: 0 0 0 3px rgba(45, 78, 60, 0.2);
    }
  `;
  render() {
    return l`
      <div 
        class="card" 
        @click="${this._toggleChecked}"
        tabindex="${this.disabled ? -1 : 0}"
      >
        <input 
          type="checkbox" 
          class="radio-input"
          name="${this.name}"
          .value="${this.value}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          tabindex="-1"
        >
        ${this.icon ? l`
          <div class="icon-container">
            <md-icon>${this.icon}</md-icon>
          </div>
        ` : ""}
        <div class="content-stack">
          <div class="label">${this.label}</div>
          ${this.description ? l`<div class="description">${this.description}</div>` : ""}
        </div>
      </div>
    `;
  }
  _toggleChecked(e) {
    if (this.disabled) return;
    const t = !this.checked;
    this.checked = t, this.dispatchEvent(new CustomEvent("change", {
      detail: {
        checked: this.checked,
        value: this.value
      },
      bubbles: !0,
      composed: !0
    }));
  }
}
customElements.define("wy-selection-card", us);
class ms extends g {
  static properties = {
    title: { type: String },
    category: { type: String },
    variables: { type: Number },
    description: { type: String },
    showDetails: { type: Boolean, attribute: "show-details" }
  };
  constructor() {
    super(), this.title = "Untitled Prompt", this.category = "General", this.variables = 0, this.description = "", this.showDetails = !1;
  }
  static styles = m`
    :host {
      display: block;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid var(--md-sys-color-outline-variant);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host(:hover) {
      background-color: var(--md-sys-color-surface-container-high);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: var(--md-sys-color-primary);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .badge-group {
      display: flex;
      gap: 6px;
    }

    .badge {
      font-family: var(--font-body);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .category-badge {
      background-color: var(--badge-bg, var(--md-sys-color-secondary-container));
      color: var(--badge-color, var(--md-sys-color-on-secondary-container));
    }

    .variable-badge {
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
    }

    .card-title {
      font-family: var(--font-serif);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
      line-height: 1.3;
    }

    .card-description {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      color: var(--md-sys-color-on-surface-variant);
      margin: 12px 0 0 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :host([data-category="Productivity"]) { 
      --badge-bg: var(--wy-color-productivity-container); 
      --badge-color: var(--wy-color-on-productivity-container); 
    }
    :host([data-category="Expertise"]) { 
      --badge-bg: var(--wy-color-expertise-container); 
      --badge-color: var(--wy-color-on-expertise-container); 
    }
    :host([data-category="Travel & Shopping"]) { 
      --badge-bg: var(--wy-color-travel-container); 
      --badge-color: var(--wy-color-on-travel-container); 
    }
  `;
  render() {
    return l`
      <div class="card-header">
        <div class="badge-group">
          <span class="badge category-badge">${this.category}</span>
          <span class="badge variable-badge">${this.variables} variables</span>
        </div>
        <md-icon style="font-size: 18px; color: var(--md-sys-color-outline);">arrow_forward</md-icon>
      </div>
      <h3 class="card-title">${this.title}</h3>
      ${this.showDetails && this.description ? l`
        <p class="card-description">${this.description}</p>
      ` : ""}
    `;
  }
}
class vs extends g {
  static properties = {
    title: { type: String },
    category: { type: String },
    variables: { type: Number },
    description: { type: String },
    showDetails: { type: Boolean, attribute: "show-details" }
  };
  static styles = m`
    :host {
      display: block;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    :host(:hover) {
      background-color: var(--md-sys-color-surface-container-low);
    }

    .row-content {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .row-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .row-title {
      font-family: var(--font-body);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }

    .row-description {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-group {
      display: flex;
      gap: 8px;
      min-width: 200px;
      justify-content: flex-end;
    }

    .badge {
      font-family: var(--font-body);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .category-badge {
      background-color: var(--badge-bg, var(--md-sys-color-secondary-container));
      color: var(--badge-color, var(--md-sys-color-on-secondary-container));
    }

    .variable-badge {
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
    }

    :host([data-category="Productivity"]) { 
      --badge-bg: var(--wy-color-productivity-container); 
      --badge-color: var(--wy-color-on-productivity-container); 
    }
    :host([data-category="Expertise"]) { 
      --badge-bg: var(--wy-color-expertise-container); 
      --badge-color: var(--wy-color-on-expertise-container); 
    }
    :host([data-category="Travel & Shopping"]) { 
      --badge-bg: var(--wy-color-travel-container); 
      --badge-color: var(--wy-color-on-travel-container); 
    }

    @media (max-width: 600px) {
      .badge-group {
        display: none;
      }
    }
  `;
  render() {
    return l`
      <div class="row-content">
        <div class="row-main">
          <h3 class="row-title">${this.title}</h3>
          ${this.showDetails && this.description ? l`
            <p class="row-description">${this.description}</p>
          ` : ""}
        </div>
        <div class="badge-group">
          <span class="badge category-badge">${this.category}</span>
          <span class="badge variable-badge">${this.variables} v</span>
          <md-icon style="font-size: 18px; color: var(--md-sys-color-outline);">chevron_right</md-icon>
        </div>
      </div>
    `;
  }
}
customElements.define("wy-prompt-card", ms);
customElements.define("wy-prompt-row", vs);
class fs extends g {
  static properties = {
    open: { type: Boolean, reflect: !0 },
    title: { type: String },
    category: { type: String },
    description: { type: String },
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
  };
  constructor() {
    super(), this.open = !1, this.title = "", this.category = "", this.description = "", this.template = "", this.variables = [], this.variations = [], this.activeVariationIndex = 0, this.mode = "locked", this.activeTab = "variables", this.steps = [], this.activeStepIndex = 0, this.descriptionExpanded = !1, this._values = {};
  }
  willUpdate(e) {
    e.has("steps") && (this.steps || (this.steps = []), this.activeStepIndex >= this.steps.length && (this.activeStepIndex = 0)), this.activeTab || (this.activeTab = "variables");
  }
  updated(e) {
    if (e.has("steps") && this.steps && this.steps.length > 0 && this.activeStepIndex >= this.steps.length && (this.activeStepIndex = 0), (e.has("steps") || e.has("activeStepIndex")) && this.steps && this.steps.length > 0) {
      const t = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1)), o = this.steps[t];
      if (o && o.variables) {
        const r = {};
        o.variables.forEach((a) => {
          r[a.name] = a.value || "";
        }), this._values = r;
      }
    }
    if (e.has("variables") && this.variables && this.variables.length > 0) {
      const t = {};
      this.variables.forEach((o) => {
        t[o.name] = o.value || "";
      }), this._values = t;
    }
  }
  static styles = m`
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
      --wy-color-surface-light: #F5F2EA;
      --wy-color-text-primary: #2C4C3B;
      --wy-color-badge-bg: #E8E4D9;
      --wy-color-focus-ring: rgba(44, 76, 59, 0.12);
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
      background: var(--wy-color-surface-light);
      border-radius: 16px; /* 16px radius as per ref */
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      transform: translate(-50%, -50%) scale(0.95);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden; /* Clip content to border-radius */
      border: 1px solid var(--md-sys-color-outline-variant);
      font-family: var(--font-sans, 'DM Sans', sans-serif);
    }

    :host([open]) .modal-container {
      transform: translate(-50%, -50%) scale(1);
    }

    /* HEADER STYLES */
    .header {
      padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) var(--spacing-lg, 24px);
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
        background: var(--md-sys-color-surface-container-high);
        color: var(--md-sys-color-on-surface);
    }

    .icon-btn.filled:hover {
        background: var(--md-sys-color-surface-container-highest);
        transform: scale(1.05);
    }

    .icon-btn.primary {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
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

    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
    }

    /* Header-main inside content (for multi-step prompts) */
    .content > .header-main {
        padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) var(--spacing-lg, 24px);
    }

    .badge {
      display: none; /* Hidden on all screen sizes */
      padding: 4px 12px;
      background: var(--wy-color-badge-bg);
      color: var(--wy-color-text-primary);
      border-radius: 999px;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em; /* Wider tracking */
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none; /* Prevent badge from blocking clicks */
    }

    @media (prefers-color-scheme: dark) {
        :host {
          --wy-color-surface-light: var(--md-sys-color-surface);
          --wy-color-text-primary: var(--md-sys-color-text-heading, #8DE0B0); /* High-contrast mint for dark mode */
          --wy-color-badge-bg: rgba(255, 255, 255, 0.12);
          --wy-color-focus-ring: rgba(141, 224, 176, 0.2);
        }
        .badge {
          color: var(--md-sys-color-on-surface);
        }
    }

    .title-group h2 {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 2.5rem; /* Larger Title */
      font-weight: 500;
      margin: 0 0 12px 0;
      color: var(--wy-color-text-primary);
      line-height: 1.1;
    }

    .description-text {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 1rem;
      font-weight: 300;
      line-height: 1.6;
      color: var(--md-sys-color-text-muted);
      margin: 0;
      max-width: 500px;
    }

    .customize-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        border: none;
        padding: 10px 20px;
        border-radius: 999px;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
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
        border-radius: 8px;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .clear-btn:hover {
        background: var(--md-sys-color-surface-container-high);
    }

    .clear-btn:focus-visible {
        outline: 3px solid var(--wy-color-focus-ring);
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
        color: var(--wy-color-text-primary);
    }

    .tab-item.active {
        color: var(--wy-color-text-primary);
        font-weight: 700;
        border-bottom-color: var(--wy-color-text-primary);
    }
    
    /* CONTENT */
    .content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .body {
        padding: var(--spacing-xl, 32px);
        flex: 1;
    }

    .variation-selector-container {
        padding: 0 var(--spacing-xl, 32px) var(--spacing-md, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
    }

    .variation-selector-container wy-dropdown {
        width: 100%;
    }

    .variation-description-panel {
        margin-top: 0;
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
        background: var(--md-sys-color-surface-container-lowest);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 999px;
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
        color: var(--wy-color-text-primary);
        margin-bottom: 8px;
    }

    .form-group input, .form-group textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 16px; /* Increased padding for breathing room */
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 1rem;
        color: var(--md-sys-color-on-surface);
        background: var(--md-sys-color-surface-container-lowest);
        transition: all 0.2s;
    }

    .form-group input:focus, .form-group textarea:focus {
        outline: none;
        border-color: var(--md-sys-color-primary);
        box-shadow: 0 0 0 2px var(--wy-color-focus-ring);
    }

    .helper-text {
        display: block;
        text-align: right;
        font-size: 0.75rem;
        color: var(--md-sys-color-text-muted);
        margin-top: 4px;
    }

    /* TOGGLE SWITCH */
    .toggle-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .toggle-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        user-select: none;
    }

    .toggle-track {
        position: relative;
        width: 52px;
        height: 32px;
        background: var(--md-sys-color-surface-container-highest);
        border: 2px solid var(--md-sys-color-outline);
        border-radius: 16px;
        transition: all 0.2s ease;
    }

    .toggle-track::after {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        width: 20px;
        height: 20px;
        background: var(--md-sys-color-outline);
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .toggle-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-input:checked + .toggle-track {
        background: var(--md-sys-color-primary);
        border-color: var(--md-sys-color-primary);
    }

    .toggle-input:checked + .toggle-track::after {
        left: 24px;
        background: var(--md-sys-color-on-primary);
    }

    .toggle-input:focus-visible + .toggle-track {
        outline: 3px solid var(--wy-color-focus-ring);
        outline-offset: 2px;
    }

    .toggle-status {
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface-variant);
        min-width: 60px;
    }

    .toggle-status.active {
        color: var(--md-sys-color-text-heading);
    }

    .preview-area {
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 8px;
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

    /* STEP NAVIGATION BUTTONS (for multi-step prompts) */
    .secondary-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: transparent;
        border: 1px solid var(--md-sys-color-outline);
        color: var(--md-sys-color-on-surface);
        padding: 12px 24px;
        border-radius: 999px;
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
      background: var(--wy-color-surface-light);
      z-index: 10;
      margin-bottom: var(--spacing-xl, 32px);
      padding-top: var(--spacing-lg, 24px);
    }

    .stepper-progress {
      height: 4px;
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 9999px;
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
      padding: 0;
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
      .header-main { flex-direction: column; align-items: flex-start; gap: var(--spacing-md, 16px); }
      .title-group h2 { font-size: 1.75rem; }
      .tabs-container { padding: 0; } /* wy-tabs handles its own mobile padding */
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
    `;
  // Multi-step navigation methods
  nextStep() {
    this.activeStepIndex < this.steps.length - 1 && (this.activeStepIndex++, this.dispatchEvent(new CustomEvent("step-change", {
      detail: { stepIndex: this.activeStepIndex, step: this.steps[this.activeStepIndex] },
      bubbles: !0,
      composed: !0
    })));
  }
  previousStep() {
    this.activeStepIndex > 0 && (this.activeStepIndex--, this.dispatchEvent(new CustomEvent("step-change", {
      detail: { stepIndex: this.activeStepIndex, step: this.steps[this.activeStepIndex] },
      bubbles: !0,
      composed: !0
    })));
  }
  // Render stepper UI for multi-step prompts
  _renderStepper() {
    if (!this.steps || this.steps.length === 0) return "";
    const e = (this.activeStepIndex + 1) / this.steps.length * 100, t = this.activeStepIndex === 0, o = this.activeStepIndex === this.steps.length - 1;
    return l`
      <div class="stepper-container">
        <div class="stepper-progress">
          <div class="stepper-progress-bar" 
               style="width: ${e}%">
          </div>
        </div>
        <div class="stepper-header">
          <span class="stepper-label">
            Step ${this.activeStepIndex + 1} of ${this.steps.length}
          </span>
          <div class="stepper-nav">
            <button 
              class="icon-btn filled"
              ?disabled=${t}
              @click=${() => this.previousStep()}
              aria-label="Previous step"
              title="Previous step">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <button 
              class="icon-btn filled"
              ?disabled=${o}
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
  // Render multi-step body content
  _renderMultiStepBody() {
    if (!this.steps || this.steps.length === 0)
      return l`<div class="empty-message">No steps available</div>`;
    const e = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1)), t = this.steps[e];
    if (!t)
      return l`<div class="empty-message">Step not found</div>`;
    const o = this._compilePrompt(t.template || "");
    return l`
      ${this._renderStepper()}
      
      <!-- Add tabs for Variables/Preview -->
      ${t.variables && t.variables.length > 0 ? l`
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
        heading="${t.name}">
        ${t.instructions}
      </wy-info-panel>
      
      <!-- Conditionally render variables or preview based on active tab -->
      ${this.activeTab === "variables" ? l`
        <div class="variables-grid">
          ${t.variables.map((r) => this._renderVariable(r))}
        </div>
      ` : l`
        <div class="preview-area">${o}</div>
      `}
    `;
  }
  render() {
    const e = this.variations.length > 0 ? this.variations[this.activeVariationIndex].template : this.template, t = this._compilePrompt(e);
    return l`
      <div class="scrim" @click="${this._close}"></div>
      <div class="modal-container">
        
        <!-- HEADER -->
        <header class="header">
            <div class="header-top">
                ${this.mode === "locked" ? l`
                    <div class="header-actions-left">
                        <button class="icon-btn primary" @click="${this._handleCopy}" aria-label="Copy to clipboard" title="Copy">
                            <span class="material-symbols-outlined">content_copy</span>
                        </button>
                        <button class="icon-btn filled" @click="${() => this.mode = "edit"}" aria-label="Edit prompt" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-btn filled" @click="${this._handleDownload}" aria-label="Download" title="Download">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                    </div>
                ` : l`
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
            
            ${this.steps && this.steps.length > 0 ? "" : l`
              <div class="header-main">
                  <div class="title-group">
                      <h2 @click="${this._toggleDescription}">${this.title}</h2>
                      <p class="description-text ${this.descriptionExpanded ? "expanded" : ""}">${this.description}</p>
                  </div>
                  
                  ${this.mode === "locked" ? l`` : ""}
              </div>
            `}
        </header>

        ${this.mode === "locked" && this.variables.length > 0 && !(this.steps && this.steps.length > 0) ? l`
          <div class="tabs-container">
              <wy-tabs active-tab="${this.activeTab}" @tab-change="${(o) => this.activeTab = o.detail.tab}">
                <button class="tab-item ${this.activeTab === "variables" ? "active" : ""}" role="tab" data-tab="variables">Variables</button>
                <button class="tab-item ${this.activeTab === "preview" ? "active" : ""}" role="tab" data-tab="preview">Final Preview</button>
              </wy-tabs>
              ${this.activeTab === "variables" && this._hasValues() ? l`
                <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
              ` : ""}
          </div>
        ` : ""}

        <div class="content">
          ${this.mode === "locked" ? l`
            ${this.steps && this.steps.length > 0 ? l`
              <!-- Multi-step mode -->
              <div class="header-main">
                  <div class="title-group">
                      <h2 @click="${this._toggleDescription}">${this.title}</h2>
                      <p class="description-text ${this.descriptionExpanded ? "expanded" : ""}">${this.description}</p>
                  </div>
              </div>
              <div class="body">
                ${this._renderMultiStepBody()}
              </div>
            ` : l`
              <!-- Standard mode -->
              ${this.variations.length > 1 ? l`
                <div class="variation-selector-container">
                  <wy-dropdown
                    label="STYLE"
                    .value="${this.variations[this.activeVariationIndex]?.id || ""}"
                    .options="${this.variations.map((o) => ({ value: o.id, label: o.name }))}"
                    variant="subtle"
                    @change="${this._handleVariationDropdownChange}"
                  ></wy-dropdown>
                  ${this.variations[this.activeVariationIndex]?.description ? l`
                    <wy-info-panel class="variation-description-panel">
                      ${this.variations[this.activeVariationIndex].description}
                    </wy-info-panel>
                  ` : ""}
                </div>
              ` : ""}

              <div class="body">
                ${this.activeTab === "variables" && this.variables.length > 0 ? l`
                  <div class="variables-grid">
                    ${this.variables.map((o) => this._renderVariable(o))}
                  </div>
                ` : l`
                  <div class="preview-area">${t}</div>
                `}
              </div>
            `}
          ` : l`
            <div class="body">
              <textarea 
                class="editor-area" 
                .value="${this.template}"
                @input="${(o) => this.template = o.target.value}"
              ></textarea>
            </div>
          `}
        </div>
      </div>
    `;
  }
  _renderVariable(e) {
    const t = e.inputType || e.type || "text";
    if (t === "toggle") {
      const o = this._values[e.name] === e.options?.[1] || this._values[e.name] === "true" || this._values[e.name] === !0, r = o ? "Enabled" : "Disabled";
      return l`
        <div class="form-group">
          <label>${e.label}</label>
          <div class="toggle-wrapper">
            <label class="toggle-label">
              <input
                type="checkbox"
                class="toggle-input"
                .checked="${o}"
                @change="${(a) => this._handleToggle(e, a.target.checked)}"
              >
              <span class="toggle-track"></span>
            </label>
            <span class="toggle-status ${o ? "active" : ""}">${r}</span>
          </div>
        </div>
      `;
    }
    return t === "textarea" ? l`
        <div class="form-group">
          <label>${e.label}</label>
          <textarea
            placeholder="${e.placeholder || ""}"
            @input="${(o) => this._handleInput(e.name, o.target.value)}"
            .value="${this._values[e.name] || ""}"
            rows="4"
          ></textarea>
          <span class="helper-text">Markdown supported</span>
        </div>
      ` : l`
      <div class="form-group">
        <label>${e.label}</label>
        <input
          type="text"
          placeholder="${e.placeholder || ""}"
          @input="${(o) => this._handleInput(e.name, o.target.value)}"
          .value="${this._values[e.name] || ""}"
        >
      </div>
    `;
  }
  _handleToggle(e, t) {
    const o = t ? e.options?.[1] || "true" : e.options?.[0] || "";
    this._handleInput(e.name, o);
  }
  _handleInput(e, t) {
    this._values = { ...this._values, [e]: t }, this.dispatchEvent(new CustomEvent("variable-change", {
      detail: { name: e, value: t, values: this._values },
      bubbles: !0,
      composed: !0
    })), this.requestUpdate();
  }
  _hasValues() {
    return Object.values(this._values).some((e) => e && e.length > 0);
  }
  _clearAllVariables() {
    this._values = {}, this.dispatchEvent(new CustomEvent("variables-cleared", {
      detail: { values: this._values },
      bubbles: !0,
      composed: !0
    })), this.requestUpdate();
  }
  _handleVariationChange(e) {
    const t = parseInt(e.target.value);
    this.activeVariationIndex = t, this.dispatchEvent(new CustomEvent("variation-change", {
      detail: { index: t, variation: this.variations[t] },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleVariationDropdownChange(e) {
    const t = e.detail.value, o = this.variations.findIndex((r) => r.id === t);
    o !== -1 && (this.activeVariationIndex = o, this.dispatchEvent(new CustomEvent("variation-change", {
      detail: { index: o, variation: this.variations[o] },
      bubbles: !0,
      composed: !0
    })));
  }
  _compilePrompt(e) {
    if (!e || typeof e != "string")
      return "";
    let t = e;
    return Object.keys(this._values || {}).forEach((o) => {
      const r = new RegExp(`{{${o}}}`, "g");
      t = t.replace(r, this._values[o] || `[${o}]`);
    }), t;
  }
  _setActiveTab(e) {
    const t = e.target.dataset.tab || e.target.closest("[data-tab]")?.dataset.tab;
    t && (this.activeTab = t);
  }
  _close() {
    this.open = !1, this.dispatchEvent(new CustomEvent("close", { bubbles: !0, composed: !0 }));
  }
  _handleCopy() {
    let e;
    if (this.steps && this.steps.length > 0) {
      const t = this.steps[this.activeStepIndex];
      e = this._compilePrompt(t.template);
    } else
      e = this._compilePrompt(
        this.variations.length > 0 ? this.variations[this.activeVariationIndex].template : this.template
      );
    navigator.clipboard.writeText(e), this.dispatchEvent(new CustomEvent("copy", {
      detail: { text: e },
      bubbles: !0,
      composed: !0
    })), this.dispatchEvent(new CustomEvent("toast", {
      detail: { message: "Copied to clipboard!" },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleSave() {
    this.mode = "locked", this.dispatchEvent(new CustomEvent("save", {
      detail: { template: this.template },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleDownload() {
    let e;
    if (this.steps && this.steps.length > 0) {
      const t = this.steps[this.activeStepIndex];
      e = this._compilePrompt(t.template);
    } else
      e = this._compilePrompt(
        this.variations.length > 0 ? this.variations[this.activeVariationIndex].template : this.template
      );
    this.dispatchEvent(new CustomEvent("download", {
      detail: { text: e, title: this.title },
      bubbles: !0,
      composed: !0
    }));
  }
}
customElements.define("wy-prompt-modal", fs);
class gs extends g {
  static properties = {
    open: { type: Boolean, reflect: !0 },
    workTitle: { type: String, attribute: "work-title" },
    previewImage: { type: String, attribute: "preview-image" }
  };
  constructor() {
    super(), this.open = !1, this.workTitle = "Untitled Work", this.previewImage = "";
  }
  static styles = m`
    /* Required fonts - load in page <head>:
       <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    */

    :host {
      display: block;
    }

    .export-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      min-height: 400px;
      padding: 0 16px 24px; /* Add breathing room */
    }

    .preview-pane {
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    .preview-pane img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .controls-pane {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 8px 0;
    }

    .section-title {
      font-family: var(--font-serif, 'Playfair Display', serif);
      font-size: 1.125rem;
      color: var(--md-sys-color-text-heading);
      margin-bottom: 12px;
    }

    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 800px) {
      .export-container {
        grid-template-columns: 1fr;
      }
      .preview-pane {
        aspect-ratio: 16 / 9;
        min-height: auto;
      }
    }
  `;
  render() {
    return l`
      <wy-modal 
        ?open="${this.open}" 
        heading="Export Plot: ${this.workTitle}"
        max-width="900px"
        @close="${this._handleClose}"
      >
        <div class="export-container">
          <div class="preview-pane">
            ${this.previewImage ? l`<img src="${this.previewImage}" alt="Preview">` : l`<md-icon style="font-size: 48px; opacity: 0.2;">image</md-icon>`}
          </div>

          <div class="controls-pane">
            <div>
              <div class="section-title">Paper Configuration</div>
              <div class="grid-2col">
                <wy-selection-card name="paper" label="A3" value="a3" checked icon="description"></wy-selection-card>
                <wy-selection-card name="paper" label="A4" value="a4" icon="description"></wy-selection-card>
              </div>
            </div>

            <wy-form-field label="Bucket Orientation">
              <select style="width: 100%;">
                <option>Portrait (Standard)</option>
                <option>Landscape (Rotated)</option>
              </select>
            </wy-form-field>

            <wy-form-field label="Export Intensity">
              <div style="display: flex; gap: 8px;">
                <wy-filter-chip label="Draft" active></wy-filter-chip>
                <wy-filter-chip label="Production"></wy-filter-chip>
                <wy-filter-chip label="Archival"></wy-filter-chip>
              </div>
            </wy-form-field>
          </div>
        </div>

        <div slot="actions">
          <md-text-button @click="${this.close}">Cancel</md-text-button>
          <md-filled-button @click="${this._handleExport}">Generate SVG</md-filled-button>
        </div>
      </wy-modal>
    `;
  }
  show() {
    this.open = !0;
  }
  close() {
    this.open = !1;
  }
  _handleClose() {
    this.open = !1;
  }
  _handleExport() {
    this.dispatchEvent(new CustomEvent("export", {
      detail: { status: "success" },
      bubbles: !0,
      composed: !0
    })), this.close();
  }
}
customElements.define("wy-export-modal", gs);
class Ge extends g {
  static properties = {
    open: { type: Boolean, reflect: !0 },
    title: { type: String },
    links: { type: Array }
  };
  constructor() {
    super(), this.open = !1, this.title = "AI Tools", this.links = [];
  }
  connectedCallback() {
    super.connectedCallback(), this._loadFonts(), this._escKeyHandler = this._handleEscKey.bind(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._escKeyHandler && document.removeEventListener("keydown", this._escKeyHandler);
  }
  updated(e) {
    super.updated(e), e.has("open") && (this.open ? (document.addEventListener("keydown", this._escKeyHandler), this._focusFirstElement()) : document.removeEventListener("keydown", this._escKeyHandler));
  }
  _focusFirstElement() {
    requestAnimationFrame(() => {
      const e = this.shadowRoot?.querySelector(".close-button");
      e && e.focus();
    });
  }
  _handleEscKey(e) {
    e.key === "Escape" && this.open && this._handleClose();
  }
  _loadFonts() {
    if (!(document.querySelectorAll("link[data-wy-links-modal-fonts]").length >= 3)) {
      if (!document.querySelector('link[href*="Playfair+Display"][data-wy-links-modal-fonts]')) {
        const t = document.createElement("link");
        t.rel = "stylesheet", t.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap", t.setAttribute("data-wy-links-modal-fonts", "playfair"), document.head.appendChild(t);
      }
      if (!document.querySelector('link[href*="Material+Symbols"][data-wy-links-modal-fonts]')) {
        const t = document.createElement("link");
        t.rel = "stylesheet", t.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap", t.setAttribute("data-wy-links-modal-fonts", "material"), document.head.appendChild(t);
      }
      if (!document.querySelector('link[href*="DM+Sans"][data-wy-links-modal-fonts]')) {
        const t = document.createElement("link");
        t.rel = "stylesheet", t.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap", t.setAttribute("data-wy-links-modal-fonts", "dm-sans"), document.head.appendChild(t);
      }
    }
  }
  static styles = m`
    :host {
      display: block;
      position: relative;
      
      /* Spacing scale variables - provide fallbacks if root variables aren't available */
      /* CSS will use root values if they cascade, otherwise use these fallbacks */
      --spacing-sm: 0.5rem;   /* 8px fallback */
      --spacing-lg: 1.5rem;   /* 24px fallback */
      --spacing-xl: 2rem;     /* 32px fallback */
      --spacing-2xl: 3rem;   /* 48px fallback */
      
      /* Component-specific color tokens matching Tailwind stone palette from reference design */
      /* These exact colors are required for visual fidelity - not using generic semantic tokens */
      --wy-links-modal-title-color: #1C1917;        /* stone-900: rgb(28, 25, 23) */
      --wy-links-modal-header-color: #292524;       /* stone-800: rgb(41, 37, 36) */
      --wy-links-modal-chip-text-color: #44403C;    /* stone-700: rgb(68, 64, 60) */
      --wy-links-modal-close-color: #A8A29E;        /* stone-400: rgb(168, 162, 158) */
      --wy-links-modal-chip-border: #D9D4C7;        /* accent-taupe: rgb(217, 212, 199) */
    }
    
    /* Override with root values if they cascade (they should, but :host shadows them) */
    /* So we need to explicitly reference root in the styles that use these variables */

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
      background: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-medium);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
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

    @media (prefers-color-scheme: dark) {
      .modal-container {
        background: var(--md-sys-color-background); /* background-dark */
        border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent); /* border-white/10 */
      }
    }

    /* Content wrapper with padding - matches mockup p-8 */
    .modal-content {
      padding: var(--spacing-xl);
      padding-bottom: calc(var(--spacing-xl) + env(safe-area-inset-bottom, 0px));
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
        padding: var(--spacing-lg);
        /* Extra padding for mobile browser controls (toolbar, home indicator) */
        padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
        height: 100%;
        box-sizing: border-box;
      }

      .close-button {
        top: var(--spacing-lg);
        right: var(--spacing-lg);
      }

      .modal-title {
        font-size: 1.75rem;
      }

      .title-wrapper {
        margin-bottom: var(--spacing-xl);
      }

      .sections-container {
        gap: 2rem;
      }
    }

    /* Close button - matches mockup exactly */
    .close-button {
      position: absolute;
      top: var(--spacing-xl);
      right: var(--spacing-xl);
      background: none;
      border: none;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--wy-links-modal-close-color); /* stone-400 from reference */
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

    @media (prefers-color-scheme: dark) {
      .close-button:hover {
        color: var(--md-sys-color-on-surface); /* dark:hover:text-stone-100 */
      }
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
      margin-bottom: var(--spacing-2xl);
      flex-shrink: 0; /* Title stays fixed, doesn't shrink */
    }

    /* Title - matches mockup exactly */
    .modal-title {
      font-family: var(--font-serif); /* playfair */
      font-size: 2.25rem; /* text-4xl = 36px */
      font-weight: 500; /* font-medium */
      line-height: 1.2;
      color: var(--wy-links-modal-title-color); /* stone-900 from reference */
      margin: 0;
    }

    @media (prefers-color-scheme: dark) {
      .modal-title {
        color: var(--md-sys-color-on-surface); /* dark:text-stone-100 */
      }
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
      color: var(--wy-links-modal-header-color); /* stone-800 from reference */
      margin: 0 0 1.25rem 0; /* 20px = 1.25rem */
    }

    @media (prefers-color-scheme: dark) {
      .section-header {
        color: var(--md-sys-color-on-surface-variant); /* dark:text-stone-200 */
      }
    }

    /* Chips container - matches flex flex-wrap gap-3 */
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: calc(var(--spacing-sm) * 1.5); /* 12px = 1.5 * 8px */
    }

    /* Link chip button - matches mockup exactly */
    .link-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: calc(var(--spacing-sm) * 1.25) var(--spacing-lg); /* 10px 24px = 1.25 * 8px, 24px */
      border-radius: var(--md-sys-shape-corner-full);
      font-family: var(--font-sans); /* DM Sans */
      font-size: 0.875rem; /* text-sm = 14px */
      font-weight: 500; /* font-medium */
      cursor: pointer;
      border: 1px solid var(--wy-links-modal-chip-border);
      background-color: var(--md-sys-color-surface-container-lowest);
      color: var(--wy-links-modal-chip-text-color); /* stone-700 from reference */
      text-decoration: none;
      transition: border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
                  transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
      position: relative;
      overflow: hidden;
    }

    /* Chip hover - matches mockup hover:border-primary */
    .link-chip:hover {
      border-color: var(--md-sys-color-primary); /* hover:border-primary */
    }

    /* Chip hover state layer */
    .link-chip::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: var(--md-sys-color-primary);
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
    }

    .link-chip:hover::before {
      opacity: var(--md-sys-state-hover-opacity);
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

    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      .link-chip {
        background-color: var(--md-sys-color-surface-container);
        border-color: var(--md-sys-color-outline-variant); /* dark:border-stone-700 */
        color: var(--md-sys-color-on-surface-variant); /* dark:text-stone-300 */
      }

      .link-chip:hover {
        border-color: var(--md-sys-color-outline); /* dark:hover:border-stone-400 */
      }
    }
  `;
  render() {
    return l`
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
              ${!this.links || this.links.length === 0 ? l`<p style="color: var(--md-sys-color-on-surface-variant); text-align: center; padding: 2rem;">No links available.</p>` : this.links.map((e) => l`
                  <section class="section">
                    <h2 class="section-header">${e.category}</h2>
                    <div class="chips-container">
                      ${e.links && e.links.length > 0 ? e.links.map((t) => l`
                          <button
                            class="link-chip"
                            @click="${(o) => this._handleLinkClick(o, t)}"
                            aria-label="Open ${t.name}"
                          >
                            ${t.name}
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
  _handleOverlayClick(e) {
    e.target === e.currentTarget && this._handleClose();
  }
  _handleContainerClick(e) {
    e.stopPropagation();
  }
  _handleClose() {
    this.open = !1, this.dispatchEvent(new CustomEvent("close", {
      bubbles: !0,
      composed: !0
    }));
  }
  _handleLinkClick(e, t) {
    window.open(t.url, "_blank", "noopener,noreferrer"), this.dispatchEvent(new CustomEvent("link-click", {
      detail: { link: t },
      bubbles: !0,
      composed: !0
    }));
  }
  show() {
    this.open = !0;
  }
  close() {
    this._handleClose();
  }
}
if (!Ge)
  throw console.error("[wy-links-modal] Component class is undefined"), new Error("WyLinksModal class is undefined");
if (!customElements)
  throw console.error("[wy-links-modal] customElements API not available"), new Error("customElements API not available");
try {
  customElements.define("wy-links-modal", Ge), console.log("[wy-links-modal] Component registered successfully");
} catch (i) {
  throw console.error("[wy-links-modal] Failed to register component:", i), console.error("[wy-links-modal] Error stack:", i.stack), console.error("[wy-links-modal] WyLinksModal type:", typeof Ge), console.error("[wy-links-modal] WyLinksModal value:", Ge), i;
}
class bs extends g {
  static properties = {
    size: { type: Number }
  };
  constructor() {
    super(), this.size = 32;
  }
  static styles = m`
        :host {
            display: inline-block;
            line-height: 0;
        }

        .logo-svg {
            display: block;
            width: var(--wy-logo-size, 32px);
            height: auto;
        }

        .logo-svg path {
            fill: var(--wy-logo-color, #073429);
            transition: fill var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
        }
    `;
  render() {
    const e = Math.round(this.size / 1.56);
    return l`
            <svg 
                class="logo-svg"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 212.43 136.2"
                width="${this.size}"
                height="${e}"
                aria-label="Weaver-Yuwono"
                role="img"
            >
                <path d="m71.29,135.7c-10.76,0-22.41-2.38-31.96-6.54C16.03,119.02,1.54,98.13.56,73.26-.43,47.84,10.55,30.86,19.94,21.09,31.97,8.58,48.76.5,62.72.5c6.73,0,11.94,1.92,15.07,5.54,2.41,2.79,2.88,6.45,1.08,8.51-.73.84-1.87,1.32-3.14,1.32-.43,0-.87-.06-1.31-.17-.78-.2-1.89-.81-2.44-1.89-.46-.89-.46-1.91-.02-3.04.25-.65.62-1.08.92-1.43.26-.31.45-.53.5-.79.17-1.06-.77-2.21-2.45-2.99-2.65-1.24-5.95-1.9-9.52-1.9-13.8,0-32.85,9.63-42.04,30.76-10.55,24.23-11.68,47.99-3.18,66.9,6.17,13.73,17.24,23.8,31.17,28.36,6.27,2.05,12.8,3.09,19.41,3.09,15.05,0,26.43-5.35,30.63-7.64,6.83-3.74,14.83-12.54,21.39-23.53,3.24-5.42,6.28-11.92,7.61-14.89-.78.48-1.66.92-2.66,1.34-.97.41-2.28.64-3.6.64-3.88,0-8.15-1.99-8.49-7.58-.35-5.78,2.33-11.02,4.48-15.24l.59-1.16,6.96-11.96.11-.21c1.33-2.5,2.58-4.86,3.23-7.65l.07-.31c.32-1.34.68-2.87-.01-3.9-.76-1.14-1.65-1.74-2.57-1.74-.68,0-1.15.33-1.27.43-.8.64-.99,1.27-.91,1.62.04.19.16.3.34.35.7.16,1.21.49,1.51.99.41.69.29,1.46.17,1.86-.36,1.3-1.37,2.07-2.69,2.07-1.72,0-3.7-1.33-3.9-3.3-.2-1.94,1.02-4.57,4.18-5.79.84-.32,1.7-.49,2.55-.49,1.93,0,3.66.83,4.86,2.33,1.61,2,2.09,4.97,1.35,8.35-1.34,4.73-4,9.84-6.58,14.78-2.65,5.08-5.16,9.88-6.08,13.93-.99,4.31-.84,7.03.43,8.09.46.38,1.71.79,3.39.79s3.17-.39,4.38-1.1c1.85-.85,2.72-3.02,3.49-4.94.19-.48.37-.94.56-1.36l12.12-26.71c2.53-5.56,5.16-10.91,9.56-15.26,1.99-1.97,3.97-3.26,6.04-3.94.83-.27,2.55-.84,4.38-.84,1.55,0,2.8.41,3.74,1.22.9.79,1.37,1.98,1.29,3.27-.08,1.18-.62,2.21-1.44,2.76-.65.43-1.38.65-2.12.65-1.79,0-3.42-1.31-3.63-2.92-.1-.75-.42-1.66-1.35-1.68-2.46,0-5.38,6.18-6.79,9.15l-.27.56c-1.71,3.59-4.47,9.83-7.66,17.06-6.63,15.03-14.88,33.74-19.72,42.15-.06.11-7,13.39-17.87,21.69-9.58,7.31-21.45,11.02-35.28,11.02Z"/>
                <path d="m62.72,1c6.33,0,11.58,1.77,14.69,5.37,2.34,2.7,2.63,6.08,1.08,7.86-.58.67-1.57,1.15-2.76,1.15-.38,0-.77-.05-1.19-.15-.99-.25-3.2-1.51-2.12-4.26.45-1.15,1.32-1.52,1.44-2.32.22-1.34-.92-2.68-2.73-3.53-2.76-1.29-6.09-1.95-9.73-1.95-14.23,0-33.32,9.96-42.5,31.06C-.88,79.7,14.33,119.41,47.19,130.16c6.79,2.22,13.39,3.11,19.56,3.11,12.89,0,23.9-3.89,30.87-7.71,7.84-4.29,15.85-14.11,21.58-23.71,4.38-7.33,8.38-16.58,8.35-16.59,0,0,0,0,0,0-.05,0-1.1,1.1-4.02,2.32-.85.36-2.08.6-3.41.6-3.46,0-7.66-1.63-7.99-7.11-.37-6.19,2.89-11.92,5.02-16.14l6.95-11.94c1.4-2.64,2.72-5.06,3.4-8,.34-1.46.87-3.29-.01-4.6-1-1.49-2.08-1.96-2.98-1.96-.67,0-1.23.26-1.59.54-1.52,1.21-1.33,2.63-.37,2.85,1.66.38,1.44,1.76,1.31,2.23-.33,1.2-1.23,1.7-2.21,1.7-1.51,0-3.23-1.19-3.4-2.86-.17-1.63.85-4.11,3.87-5.27.79-.3,1.59-.45,2.37-.45,3.87,0,7.12,3.69,5.72,10.07-2.67,9.43-10.81,20.59-12.67,28.7-1.24,5.42-.55,7.63.6,8.58.61.51,2.05.91,3.71.91,1.5,0,3.19-.32,4.63-1.17,2.46-1.12,3.27-4.34,4.25-6.53l12.12-26.71c2.48-5.45,5.1-10.8,9.46-15.11,1.71-1.7,3.64-3.1,5.85-3.82.62-.2,2.39-.82,4.23-.82,1.21,0,2.45.27,3.41,1.1,1.66,1.44,1.37,4.26-.1,5.23-.6.4-1.24.57-1.85.57-1.57,0-2.96-1.13-3.14-2.49-.22-1.67-1.12-2.09-1.84-2.11-.01,0-.02,0-.04,0-2.91,0-5.97,6.83-7.48,9.99-5.23,10.97-20.18,46.7-27.36,59.18,0,0-6.83,13.21-17.74,21.54-10.57,8.07-23.1,10.92-34.97,10.92s-23.79-3.03-31.77-6.5C20.28,120.33,2.19,102.02,1.06,73.24-.78,26.32,38.75,1,62.72,1m0-1c-14.09,0-31.02,8.14-43.14,20.74C10.12,30.58-.94,47.68.06,73.28c.53,13.61,4.79,25.71,12.64,35.95,6.69,8.73,15.82,15.77,26.41,20.38,9.62,4.18,21.34,6.58,32.17,6.58,13.94,0,25.91-3.74,35.58-11.12,10.94-8.35,17.74-21.33,18.02-21.88,4.83-8.4,13.09-27.12,19.72-42.17,3.19-7.23,5.94-13.47,7.65-17.05l.27-.57c1.15-2.42,4.19-8.86,6.31-8.86.19,0,.72.01.88,1.24.25,1.88,2.07,3.36,4.13,3.36.84,0,1.67-.25,2.4-.73.96-.63,1.58-1.81,1.67-3.14.1-1.45-.44-2.79-1.46-3.68-1.03-.89-2.4-1.35-4.07-1.35-1.92,0-3.69.59-4.45.84l-.09.03c-2.15.7-4.19,2.03-6.24,4.06-4.45,4.41-7.11,9.8-9.66,15.41l-12.12,26.71c-.19.43-.38.9-.58,1.39-.73,1.83-1.56,3.91-3.18,4.65-.03.01-.06.03-.09.05-1.13.67-2.6,1.03-4.13,1.03-1.65,0-2.76-.41-3.07-.68-.77-.64-1.43-2.47-.26-7.59.91-3.98,3.4-8.75,6.04-13.81,2.59-4.96,5.27-10.09,6.61-14.85,0-.02.01-.04.01-.06.77-3.53.26-6.64-1.45-8.77-1.3-1.62-3.17-2.51-5.25-2.51-.91,0-1.83.17-2.73.52-3.41,1.31-4.72,4.19-4.5,6.31.23,2.25,2.46,3.75,4.4,3.75,1.56,0,2.75-.91,3.17-2.44.13-.48.28-1.4-.23-2.25-.25-.42-.77-.98-1.8-1.22-.02-.15.11-.6.74-1.1.19-.15.55-.32.96-.32.74,0,1.48.52,2.15,1.51.58.86.24,2.27-.06,3.51l-.07.31c-.63,2.73-1.87,5.06-3.19,7.53l-.12.23-6.93,11.9s-.02.04-.03.05c-.19.37-.38.76-.59,1.15-2.07,4.04-4.89,9.58-4.54,15.5.36,5.94,4.88,8.05,8.99,8.05,1.39,0,2.77-.25,3.8-.68.49-.2.95-.41,1.38-.63-1.53,3.32-4.18,8.82-6.96,13.47-6.52,10.92-14.45,19.64-21.2,23.34-4.16,2.28-15.45,7.58-30.39,7.58-6.56,0-13.04-1.03-19.25-3.06-13.8-4.51-24.76-14.49-30.87-28.09-8.43-18.78-7.3-42.39,3.19-66.5C28.93,13.69,47.76,4.16,61.41,4.16c3.5,0,6.72.64,9.31,1.85,1.43.67,2.3,1.66,2.17,2.46-.02.12-.19.32-.38.54-.31.35-.72.84-1.01,1.57-.62,1.58-.32,2.75.05,3.45.63,1.23,1.88,1.92,2.76,2.15.48.12.96.18,1.43.18,1.41,0,2.69-.54,3.52-1.49,1.96-2.25,1.49-6.19-1.08-9.17-3.23-3.74-8.58-5.71-15.45-5.71h0Z"/>
                <path d="m163.82,132.4c-.8,0-1.6-.04-2.38-.1-7.49-.66-13.75-3.38-18.08-7.88-3.68-3.81-5.78-8.77-5.77-13.61.03-11.25,8.99-21.5,18.79-21.5,3.29,0,6.43,1.2,9.08,3.47,2.86,2.45,3.03,6.14,1.71,8.52-1.13,2.05-2.58,2.48-3.59,2.48-2.29,0-4.3-2.13-4.5-3.96-.15-1.39.43-2.13.94-2.79.58-.73,1.07-1.37.55-3.08-.61-2.01-2.59-2.31-3.71-2.31-4.91,0-13.77,5.78-13.96,17.29-.15,9.14,8.1,20.6,18.57,21.12.45.02.9.03,1.35.03h0c7.54,0,14.41-3.07,20.43-9.13,11.75-11.83,18.66-33.87,18.49-58.97-.24-34.66-24.64-52.11-48.73-54.03-1.67-.13-3.33-.2-4.95-.2-26.77,0-41.19,17.51-50.75,32.77-10.78,17.2-15.7,44.81-17.32,53.88-.17.98-.81,2.18-2.87,2.33-.05,0-.11,0-.16,0-.9,0-1.53-.49-1.56-1.23-.83-20.02-2-26.92-5.14-35.75-1.56,8.56-5.32,27.17-14.66,43.77-.12.21-.2.44-.29.69-.31.83-.69,1.87-2.47,2.55-.37.14-.69.21-.99.21-.42,0-.78-.15-1.03-.43-.54-.61-.51-1.68-.39-2.75,3.39-30.46-.5-41.99-4.36-46.3-1.68-1.88-3.72-2.84-6.06-2.84-3.67,0-7.05,2.37-7.84,3.36-1.31,1.64-1.75,3.44-1.49,4.36.09.33.26.54.51.64,2.98,1.12,3.94,2.72,4.21,3.87.31,1.28-.06,2.66-.99,3.69-.77.85-1.89,1.36-2.98,1.36-.86,0-2.96-.35-3.94-3.54-1.11-3.62-.44-7.34,1.88-10.48,2.59-3.5,6.9-5.67,11.26-5.67,2.06,0,4.06.47,5.94,1.38,10.67,5.21,10.76,24.06,10.79,31.15,0,.35,0,.7,0,1.02,7.29-12.49,10.51-30.73,10.81-32.47-.53-1.38-4.47-12.12.09-15.02.31-.2.68-.3,1.07-.3.81,0,1.6.44,2.23,1.24,1.04,1.32,2.49,4.77.52,12.99.06.16.19.46.37.88,1.23,2.9,4.79,11.26,6.26,19.09C89.82,28.99,115.4,5.19,150.75,5.19c.86,0,1.74.01,2.62.04,26.2.83,51.75,22.04,56.97,47.26,4.56,22.06-.86,45.22-14.49,61.95-9.29,11.41-20.97,17.96-32.04,17.96ZM69.68,41.7s-.08.01-.12.03c-.06.06-.42.53.01,3.63.09.68.24,1.35.39,1.92.22-1.06.39-2.21.41-3.09.03-1.01-.22-2.07-.55-2.42-.08-.08-.12-.08-.14-.08Z"/>
                <path d="m150.75,5.69c.86,0,1.73.01,2.61.04,25.83.82,51.36,22,56.49,46.86,8.73,42.25-20.09,79.31-46.03,79.31-.78,0-1.56-.03-2.34-.1-16.17-1.42-23.42-12.18-23.39-20.99.03-11.55,9.13-21,18.29-21,3.02,0,6.05,1.03,8.76,3.35,2.68,2.29,2.81,5.72,1.6,7.9-.89,1.61-2.04,2.22-3.15,2.22-1.96,0-3.82-1.89-4-3.51-.29-2.68,2.54-2.44,1.48-5.96-.54-1.8-2.14-2.66-4.19-2.66-5.51,0-14.27,6.3-14.46,17.78-.19,11.35,9.98,21.18,19.04,21.62.46.02.92.03,1.38.03,23.67,0,39.68-30.38,39.42-68.6-.18-26.72-16.91-51.95-49.19-54.53-1.71-.14-3.37-.2-4.99-.2-28.82,0-43.52,20.81-51.17,33.01-10.05,16.04-14.99,40.62-17.39,54.06-.29,1.65-1.72,1.87-2.41,1.92-.04,0-.08,0-.13,0-.44,0-1.04-.17-1.06-.75-.87-20.95-2.11-27.71-5.8-37.64-1.26,7.07-4.89,27.6-14.93,45.43-.56.99-.42,2.23-2.51,3.02-.32.12-.59.18-.81.18-1.06,0-1.07-1.28-.92-2.63,4.59-41.28-3.79-49.7-10.92-49.7-3.88,0-7.4,2.5-8.23,3.55-1.88,2.35-2.23,5.22-.77,5.77,4.92,1.85,4.46,5.17,3.03,6.76-.66.73-1.63,1.2-2.61,1.2-1.36,0-2.76-.89-3.46-3.19-2.46-8.07,4.64-15.5,12.66-15.5,1.89,0,3.84.41,5.72,1.33,12.8,6.25,9.97,33.25,10.65,33.25.02,0,.04-.02.06-.05,8.3-13.27,11.63-34,11.63-34,0,0-4.64-11.7-.16-14.54.23-.15.51-.23.8-.23,1.93,0,4.75,3.38,2.24,13.74-.12.03,5.57,11.97,6.99,22.04,0,.06.02.09.04.09.79,0,11.5-68.72,72.16-68.71m-80.71,43.39c.37-1.3.8-3.42.83-4.86.03-1.2-.31-3.01-1.19-3.01-.1,0-.21.02-.33.08-.75.34-.46,2.8-.28,4.16.25,1.83.87,3.55.97,3.64M150.75,4.69c-35.04,0-60.54,23.18-71.97,65.36-1.66-7.23-4.73-14.45-5.86-17.11-.12-.28-.23-.55-.31-.73,1.96-8.31.44-11.87-.65-13.25-.73-.92-1.66-1.43-2.63-1.43-.48,0-.94.13-1.34.38-4.78,3.03-1.14,13.37-.34,15.49-.39,2.26-3.35,18.49-9.8,30.52-.05-7.75-.54-25.58-11.07-30.72-1.95-.95-4.02-1.43-6.16-1.43-4.51,0-8.98,2.25-11.66,5.87-2.42,3.26-3.11,7.14-1.96,10.92.74,2.44,2.4,3.9,4.42,3.9,1.23,0,2.49-.57,3.35-1.53,1.04-1.15,1.45-2.7,1.11-4.14-.31-1.26-1.34-3.02-4.52-4.22-.04-.01-.14-.05-.21-.3-.21-.78.2-2.41,1.4-3.91.72-.9,4-3.18,7.45-3.18,2.19,0,4.1.9,5.69,2.67,3.79,4.24,7.6,15.64,4.24,45.91-.13,1.19-.16,2.39.51,3.14.24.27.69.6,1.4.6.35,0,.73-.08,1.16-.24,2-.76,2.44-1.97,2.76-2.85.09-.24.16-.45.26-.62,8.75-15.55,12.62-32.83,14.37-42.06,2.66,7.99,3.72,15.23,4.49,33.81.04,1,.89,1.7,2.06,1.7.07,0,.14,0,.2,0,2.5-.19,3.15-1.8,3.32-2.74,1.61-9.05,6.52-36.59,17.25-53.7,3.94-6.29,9.49-14.35,17.43-20.84,9.51-7.77,20.57-11.7,32.89-11.7,1.61,0,3.26.07,4.91.2,23.86,1.91,48.03,19.2,48.27,53.54.17,24.96-6.69,46.88-18.35,58.61-5.92,5.96-12.67,8.98-20.07,8.98-.44,0-.89-.01-1.33-.03-8.34-.41-18.27-9.7-18.09-20.61.18-11.19,8.73-16.8,13.46-16.8,1.2,0,2.74.34,3.23,1.95.44,1.46.08,1.93-.47,2.63-.51.66-1.22,1.56-1.04,3.15.22,2.04,2.45,4.4,4.99,4.4.94,0,2.71-.36,4.03-2.74,1.41-2.56,1.24-6.52-1.83-9.15-2.74-2.35-5.99-3.59-9.41-3.59-10.07,0-19.26,10.49-19.29,22-.01,4.97,2.14,10.06,5.91,13.96,4.42,4.58,10.78,7.36,18.4,8.03.8.07,1.62.11,2.43.11,11.21,0,23.03-6.61,32.42-18.14,13.72-16.85,19.18-40.17,14.59-62.37-2.53-12.25-9.93-23.97-20.83-33.01-10.9-9.04-23.9-14.24-36.61-14.65-.88-.03-1.77-.04-2.64-.04h0Z"/>
            </svg>
        `;
  }
  updated(e) {
    e.has("size") && this.style.setProperty("--wy-logo-size", `${this.size}px`);
  }
}
customElements.define("wy-logo", bs);
class ys extends g {
  static properties = {
    title: { type: String },
    hideMenu: { type: Boolean, attribute: "hide-menu" }
  };
  constructor() {
    super(), this.title = "Prompt Library", this.hideMenu = !1;
  }
  static styles = m`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      background-color: var(--md-sys-color-surface-container-high);
      height: 64px;
      padding: 0 32px;
    }

    .app-bar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }

    .left-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .logo {
      display: flex;
      align-items: center;
    }

    .app-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
      white-space: nowrap;
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-tools-link {
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-text-heading);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 20px;
      transition: background-color 0.2s;
    }

    .ai-tools-link:hover {
      background-color: var(--md-sys-color-primary-container);
    }

    .menu-button {
      display: none;
    }

    @media (max-width: 600px) {
      .menu-button {
        display: block;
      }
      .ai-tools-link {
        display: none;
      }
      .app-title {
        font-size: 1.1rem;
      }
    }
  `;
  render() {
    return l`
      <div class="app-bar-container">
        <div class="left-section">
          ${this.hideMenu ? "" : l`
            <md-icon-button class="menu-button">
              <md-icon>menu</md-icon>
            </md-icon-button>
          `}
          <a href="/" class="logo-container">
            <slot name="logo">
              <wy-logo class="logo" size="32"></wy-logo>
            </slot>
            <h1 class="app-title">${this.title}</h1>
          </a>
        </div>

        <div class="right-section">
          <slot name="actions">
            <a href="#" class="ai-tools-link" @click="${this._handleAiToolsClick}">AI Tools</a>
          </slot>
          <md-icon-button>
            <md-icon>settings</md-icon>
          </md-icon-button>
        </div>
      </div>
    `;
  }
  _handleAiToolsClick(e) {
    e.preventDefault(), this.dispatchEvent(new CustomEvent("ai-tools-click", {
      bubbles: !0,
      composed: !0
    }));
  }
}
customElements.define("wy-app-bar", ys);
class xs extends g {
  static properties = {
    showFilters: { type: Boolean, attribute: "show-filters" },
    activeFilterCount: { type: Number, attribute: "active-filter-count" },
    searchQuery: { type: String, attribute: "search-query" },
    isScrolled: { type: Boolean, attribute: "is-scrolled" },
    scrollingUp: { type: Boolean, attribute: "scrolling-up" },
    searchSize: { type: String, attribute: "search-size" },
    showSearch: { type: Boolean, attribute: "show-search" }
  };
  constructor() {
    super(), this.showFilters = !1, this.activeFilterCount = 0, this.searchQuery = "", this.isScrolled = !1, this.scrollingUp = !1, this.searchSize = "large", this.showSearch = !1, this._searchTimeout = null;
  }
  static styles = m`
    /* Note: Fonts loaded in light DOM (globals.css) and cascade into Shadow DOM */
    
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: transparent;
      min-height: 100px;
      transition: min-height 0.3s ease-in-out;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
    }

    .container.headerScrolledContainer {
      /* Container stays full-width; leftSection handles visual compaction */
    }

    .header {
      padding: var(--spacing-lg) 0 var(--spacing-xl) 0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-lg);
      background-color: transparent;
      min-height: 100px;
      will-change: padding, gap;
      transition: padding 0.3s ease-in-out,
        gap 0.3s ease-in-out,
        justify-content 0.3s ease-in-out,
        min-height 0.3s ease-in-out;
    }

    .headerScrolled {
      padding: 1rem 0;
      justify-content: flex-start;
      min-height: 80px;
    }

    .header h1 {
      margin: 0;
      font-family: var(--font-serif);
      font-weight: 500;
      font-size: 2rem;
      line-height: 1.1;
      letter-spacing: 0.02em;
      color: var(--md-sys-color-on-surface);
      transition: opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),
        visibility var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),
        transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),
        max-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),
        margin var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),
        padding var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
    }

    .header h1.h1Hidden {
      opacity: 0;
      visibility: hidden;
      max-width: 0;
      overflow: hidden;
      transform: scale(0.95);
      margin: 0;
      padding: 0;
    }

    /* LEFT SECTION */
    .leftSection {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      flex-wrap: nowrap;
      min-width: 0;
      padding: 0;
      background-color: transparent;
      backdrop-filter: none;
      border-radius: var(--md-sys-shape-corner-full);
      will-change: padding, background-color, backdrop-filter;
      transition: flex-basis 0.3s ease-in-out,
        padding 0.3s ease-in-out,
        background-color 0.3s ease-in-out,
        backdrop-filter 0.3s ease-in-out,
        flex 0.3s ease-in-out;
    }

    .leftSectionScrolled {
      padding: 0.7rem 1.5rem;
      background-color: var(--wy-library-header-scrolled-bg);
      backdrop-filter: blur(var(--wy-library-header-scrolled-blur));
      -webkit-backdrop-filter: blur(var(--wy-library-header-scrolled-blur));
      margin-left: auto;
      margin-right: auto;
      max-width: 700px;
      flex: 0 1 auto;
    }

    /* FILTER BUTTON WRAPPER */
    .filterButtonWrapper {
      position: relative;
      display: inline-block;
    }

    .filterBadge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--md-sys-color-primary);
      color: white;
      border-radius: var(--md-sys-shape-corner-full);
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      border: 2px solid var(--md-sys-color-background);
      pointer-events: none;
      font-family: var(--font-sans);
      z-index: 10;
    }

    .leftSectionScrolled .filterBadge {
      border-color: var(--wy-library-header-scrolled-bg);
    }

    /* SEARCH CONTAINER */
    .searchContainer {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 672px;
      min-width: 200px;
      margin-right: auto;
      transform-origin: left center;
      overflow: hidden;
      opacity: 1; /* Explicit starting value required for CSS transitions to work */
      transform: scaleX(1); /* Explicit starting value for transform transition */
      transition: opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        max-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        min-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        margin var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
    }

    .searchContainer:not(.searchContainerHidden) {
      overflow: visible;
    }

    .searchContainerHidden {
      opacity: 0;
      max-width: 0;
      min-width: 0;
      transform: scaleX(0.8);
      margin: 0;
      overflow: hidden;
      pointer-events: none;
      transition: opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        max-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        min-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
        margin var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
    }

    .searchContainer:not(.searchContainerHidden) {
      animation: searchExpand 0.3s ease-in-out;
      overflow: visible;
    }

    @keyframes searchExpand {
      from {
        opacity: 0;
        transform: scaleX(0.8);
      }
      to {
        opacity: 1;
        transform: scaleX(1);
      }
    }

    .searchIcon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      color: var(--md-sys-color-on-surface-variant);
      pointer-events: none;
      transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      z-index: 1;
    }

    .searchInputWrapper {
      position: relative;
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      max-width: 100%;
    }

    .searchInput {
      position: relative;
      width: 100%;
      height: 56px;
      padding: 0 2.75rem 0 2.5rem;
      border-radius: var(--md-sys-shape-corner-full);
      border: 1px solid var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-background);
      color: var(--md-sys-color-on-surface);
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      line-height: 1.5;
      box-shadow: 0 1px 2px rgba(26, 22, 20, 0.02);
      transition: border-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
        box-shadow var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      box-sizing: border-box;
    }

    /* Medium search size (44px height) */
    .searchInput.size-medium {
      height: 44px;
      padding: 0 2.25rem 0 2rem;
    }

    .searchContainer.size-medium .searchClear {
      right: 0.75rem;
      width: 24px;
      height: 24px;
    }

    .searchContainer.size-medium .searchIcon {
      font-size: 1rem;
    }

    .searchContainer.size-medium .searchClear .material-symbols-outlined {
      font-size: 18px;
    }

    /* Hide native browser clear button on type="search" inputs */
    .searchInput::-webkit-search-cancel-button,
    .searchInput::-webkit-search-decoration {
      -webkit-appearance: none;
      appearance: none;
      display: none;
    }

    .searchInput::placeholder {
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.6;
    }

    .searchInput:focus,
    .searchInput:focus-visible {
      outline: 3px solid var(--md-sys-color-primary, #2C4C3B);
      outline-offset: 2px;
      border-color: var(--md-sys-color-primary, #2C4C3B);
      box-shadow: 0 0 0 3px rgba(44, 76, 59, 0.12);
    }

    .searchInputWrapper:has(.searchInput.focused) .searchIcon,
    .searchInputWrapper:has(.searchInput:focus) .searchIcon,
    .searchInputWrapper:has(.searchInput:focus-visible) .searchIcon {
      color: var(--md-sys-color-primary, #2C4C3B);
    }

    .searchClear {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      overflow: hidden;
      pointer-events: auto;
    }

    .searchClear::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: var(--md-sys-color-on-surface);
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
      border-radius: 50%;
      z-index: -1;
    }

    .searchClear:hover {
      color: var(--md-sys-color-on-surface);
    }

    .searchClear:hover::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .searchClear:focus-visible {
      outline: 2px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .searchClear .material-symbols-outlined {
      font-size: 20px;
    }


    /* RIGHT SECTION */
    .rightSection {
      display: flex;
      padding-top: 4px;
      padding-bottom: 4px;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: nowrap;
      flex-shrink: 0;
      position: relative;
      opacity: 1;
      transform: translateX(0);
      max-width: 100%;
      transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized),
        transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),
        max-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
    }

    .rightSectionHidden {
      opacity: 0;
      transform: translateX(2rem);
      pointer-events: none;
      max-width: 0;
      overflow: hidden;
    }

    .rightSectionReturning {
      transition: opacity 0.5s var(--md-sys-motion-easing-emphasized-decelerate),
        transform 0.5s var(--md-sys-motion-easing-emphasized-decelerate),
        max-width 0.5s var(--md-sys-motion-easing-emphasized-decelerate);
    }

    /* MATERIAL SYMBOLS OUTLINED */
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

    /* RESPONSIVE */
    @media (max-width: 767px) {
      :host {
        min-height: auto;
      }

      .container {
        padding: 0 var(--spacing-md);
      }

      .header {
        align-items: center;
        min-height: auto;
        padding: var(--spacing-sm) 0;
      }

      .header h1 {
        display: none;
      }

      .headerScrolled {
        padding: var(--spacing-sm) 0;
      }

      .leftSection {
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        min-width: 0;
      }

      .leftSectionScrolled {
        padding: 0.5rem 1rem;
      }

      .searchContainerHidden {
        display: none;
      }

      .searchContainer {
        flex: 1;
        min-width: 0;
        max-width: 100%;
      }

      .rightSection {
        position: static;
        padding: 0;
      }

      .rightSectionHidden {
        opacity: 0;
        transform: translateY(-1rem);
        max-width: 0;
        overflow: hidden;
      }

      ::slotted([slot="backup-status"]) {
        display: none;
      }
    }
  `;
  render() {
    return l`
      <div class="container ${this.isScrolled ? "headerScrolledContainer" : ""}">
        <header class="header ${this.isScrolled ? "headerScrolled" : ""}">
          <div class="leftSection ${this.isScrolled ? "leftSectionScrolled" : ""}">
            <h1 class="${this.showSearch ? "h1Hidden" : ""}">Artworks</h1>
          
          <div class="filterButtonWrapper">
            <wy-icon-button
              variant="${this.showFilters || this.activeFilterCount > 0 ? "filled" : "outlined"}"
              size="small"
              icon="tune"
              label="${this.showFilters ? "Hide" : "Show"} filters${this.activeFilterCount > 0 ? ` (${this.activeFilterCount} active)` : ""}"
              @click="${this._handleFilterToggle}">
            </wy-icon-button>
            ${this.activeFilterCount > 0 ? l`
              <span class="filterBadge">${this.activeFilterCount}</span>
            ` : ""}
          </div>

          <div class="searchContainer ${this.searchSize === "medium" ? "size-medium" : ""} ${this.showSearch ? "" : "searchContainerHidden"}">
            <div class="searchInputWrapper">
              <span class="material-symbols-outlined searchIcon">search</span>
              <input
                type="search"
                class="searchInput ${this.searchSize === "medium" ? "size-medium" : ""}"
                placeholder="Search works..."
                .value="${this.searchQuery}"
                @input="${this._handleSearchInput}"
                @focus="${this._handleSearchFocus}"
                @blur="${this._handleSearchBlur}"
                aria-label="Search works by title, description, or source"
              />
              ${this.searchQuery ? l`
                <button
                  type="button"
                  class="searchClear"
                  @click="${this._handleSearchClear}"
                  aria-label="Clear search">
                  <span class="material-symbols-outlined">close</span>
                </button>
              ` : ""}
            </div>
          </div>

          <wy-icon-button
            variant="outlined"
            size="small"
            icon="${this.showSearch ? "close" : "search"}"
            label="${this.showSearch ? "Hide search" : "Show search"}"
            @click="${this._handleSearchToggle}">
          </wy-icon-button>

          <wy-icon-button
            variant="filled"
            size="small"
            icon="add"
            @click="${this._handleAddWork}">
          </wy-icon-button>
          </div>

          <div class="rightSection 
          ${this.isScrolled ? "rightSectionHidden" : ""}
          ${this.scrollingUp && !this.isScrolled ? "rightSectionReturning" : ""}">
            <slot name="view-controls"></slot>
            <slot name="backup-status"></slot>
          </div>
        </header>
      </div>
    `;
  }
  _handleFilterToggle() {
    this.showFilters = !this.showFilters, this.dispatchEvent(new CustomEvent("toggle-filters", {
      detail: { showing: this.showFilters },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleSearchInput(e) {
    this.searchQuery = e.target.value, this._searchTimeout && clearTimeout(this._searchTimeout), this._searchTimeout = setTimeout(() => {
      this.dispatchEvent(new CustomEvent("search-change", {
        detail: { value: this.searchQuery },
        bubbles: !0,
        composed: !0
      }));
    }, 300);
  }
  _handleSearchFocus(e) {
    const t = e.target;
    t && t.classList?.add("focused");
  }
  _handleSearchBlur(e) {
    const t = e.target;
    t && t.classList?.remove("focused");
  }
  _handleSearchClear() {
    this.searchQuery = "", this._searchTimeout && clearTimeout(this._searchTimeout), this.dispatchEvent(new CustomEvent("search-change", {
      detail: { value: "" },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleSearchToggle() {
    this.showSearch ? requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.showSearch = !1, this.dispatchEvent(new CustomEvent("toggle-search", {
          detail: { showing: this.showSearch },
          bubbles: !0,
          composed: !0
        }));
      });
    }) : (this.showSearch = !0, this.dispatchEvent(new CustomEvent("toggle-search", {
      detail: { showing: this.showSearch },
      bubbles: !0,
      composed: !0
    })));
  }
  _handleAddWork() {
    this.dispatchEvent(new CustomEvent("add-work", {
      detail: {},
      bubbles: !0,
      composed: !0
    }));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._searchTimeout && clearTimeout(this._searchTimeout);
  }
}
customElements.define("wy-library-header", xs);
class _s extends g {
  static properties = {
    name: { type: String },
    role: { type: String },
    photo: { type: String },
    profileId: { type: String }
  };
  static styles = m`
    :host {
      display: block;
    }
    
    md-elevated-card {
      width: 100%;
      height: 100%;
      --md-elevated-card-container-color: var(--md-sys-color-surface);
      --md-elevated-card-container-shape: var(--md-sys-shape-corner-large);
      border: 1px solid var(--md-sys-color-outline-variant); 
    }

    .card-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 8px;
      background-color: var(--md-sys-color-surface-variant);
    }

    h2 {
      font-family: var(--font-serif);
      font-size: 1.75rem;
      font-weight: 400;
      margin: 0;
      color: var(--md-sys-color-on-surface);
    }

    .role {
      font-family: var(--font-body);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--md-sys-color-secondary);
      font-weight: 500;
      margin: 0;
    }

    .actions {
      margin-top: 16px;
    }
    
    a { text-decoration: none; }
  `;
  render() {
    return l`
      <md-elevated-card>
        <div class="card-content">
          <img class="avatar" src="${this.photo}" alt="${this.name}" />
          <p class="role">${this.role}</p>
          <h2>${this.name}</h2>
          
          <div class="actions">
            <a href="/profile.html?id=${this.profileId}">
              <md-filled-button>View Profile</md-filled-button>
            </a>
          </div>
        </div>
      </md-elevated-card>
    `;
  }
}
customElements.define("wy-profile-card", _s);
class ws extends g {
  static properties = {
    name: { type: String },
    role: { type: String },
    photo: { type: String },
    bio: { type: String }
    // Richer bio from module data
  };
  static styles = m`
    :host { display: block; margin-bottom: 64px; }
    
    .bio-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: start;
    }

    img {
      width: 100%;
      border-radius: var(--md-sys-shape-corner-large);
      aspect-ratio: 4/5;
      object-fit: cover;
    }

    .content {
      padding-top: 24px;
    }

    h1 {
      font-family: var(--font-serif);
      font-size: 3.5rem;
      margin: 0 0 16px 0;
      color: var(--md-sys-color-on-background);
      line-height: 1.1;
    }

    .role {
      font-family: var(--font-body);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--md-sys-color-secondary);
      display: block;
      margin-bottom: 32px;
    }

    .bio-text {
      font-size: 1.25rem;
      color: var(--md-sys-color-on-surface-variant);
      max-width: 50ch;
      line-height: 1.6;
    }

    @media(max-width: 900px) {
      .bio-container { grid-template-columns: 1fr; gap: 32px; }
      h1 { font-size: 2.5rem; }
    }
  `;
  render() {
    return l`
      <div class="bio-container">
        <img src="${this.photo}" alt="${this.name}" />
        <div class="content">
          <span class="role">${this.role}</span>
          <h1>${this.name}</h1>
          <p class="bio-text">${this.bio}</p>
          
          <div style="margin-top: 32px;">
             <md-icon-button href="#"><md-icon>link</md-icon></md-icon-button>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("wy-bio-card", ws);
const ks = [
  {
    id: "p1",
    title: "Hudson Yards Development",
    category: "real-estate",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    summary: "A mixed-use development project redefining the skyline."
  },
  {
    id: "p2",
    title: "Alpha BioTech Fund",
    category: "tech",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800",
    summary: "Early-stage investment in longevity and synthetic biology."
  },
  {
    id: "p3",
    title: "5th Avenue Restoration",
    category: "real-estate",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
    summary: "Historical preservation of a landmark commercial property."
  },
  {
    id: "p4",
    title: "Quantum Computing Seed",
    category: "tech",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    summary: "Strategic stake in next-gen computing infrastructure."
  }
];
class Cs extends g {
  static properties = {
    filter: { type: String },
    title: { type: String }
  };
  static styles = m`
    :host { display: block; margin-bottom: 80px; }
    
    h2 {
      font-family: var(--font-serif);
      font-size: 2rem;
      margin-bottom: 40px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 32px;
    }

    md-elevated-card {
      --md-elevated-card-container-color: var(--md-sys-color-surface);
      --md-elevated-card-container-shape: var(--md-sys-shape-corner-large);
      width: 100%;
      height: 100%;
    }

    .card-content {
      padding: 0;
    }
    
    .card-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0;
    }

    .text-content {
        padding: 24px;
    }

    h3 {
        font-family: var(--font-serif);
        font-size: 1.25rem;
        margin: 0 0 8px 0;
    }
    
    p {
        font-size: 0.875rem;
        color: var(--md-sys-color-on-surface-variant);
        margin: 0 0 16px 0;
    }
  `;
  render() {
    const e = ks.filter((t) => t.category === this.filter);
    return l`
      <div>
        <h2>${this.title || "Projects"}</h2>
        <div class="grid">
          ${e.map((t) => l`
            <md-elevated-card href="/project.html?id=${t.id}" clickable>
               <div class="card-content">
                  <img class="card-image" src="${t.image}" alt="${t.title}" />
                  <div class="text-content">
                    <h3>${t.title}</h3>
                    <p>${t.summary}</p>
                    <md-text-button>View Details</md-text-button>
                  </div>
               </div>
            </md-elevated-card>
          `)}
        </div>
      </div>
    `;
  }
}
customElements.define("wy-project-list", Cs);
class $s extends g {
  static properties = {
    title: { type: String },
    value: { type: String },
    trend: { type: String },
    icon: { type: String }
  };
  static styles = m`
    :host {
      display: block;
    }
    
    .card {
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-border-variant);
      border-radius: var(--md-sys-shape-corner-medium);
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: transform 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .icon-container {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-text-heading);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content {
      display: flex;
      flex-direction: column;
    }

    .title {
      font-family: var(--font-display);
      text-transform: uppercase;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--md-sys-color-text-muted);
      margin-bottom: 4px;
    }

    .value {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      color: var(--md-sys-color-on-surface);
      margin-bottom: 4px;
    }

    .trend {
      font-family: var(--font-display);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-text-heading);
    }

    md-icon {
      font-size: 24px;
    }
  `;
  render() {
    return l`
      <div class="card">
        <div class="icon-container">
          <md-icon>${this.icon}</md-icon>
        </div>
        <div class="content">
          <span class="title">${this.title}</span>
          <span class="value">${this.value}</span>
          ${this.trend ? l`<span class="trend">${this.trend}</span>` : ""}
        </div>
      </div>
    `;
  }
}
customElements.define("wy-metric-card", $s);
class Es extends g {
  static properties = {
    title: { type: String },
    items: { type: Array }
    // [{ label: String, value: Number, color: String }]
  };
  static styles = m`
    :host {
      display: block;
    }
    
    .card {
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-border-variant);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 32px;
      height: 100%;
      box-sizing: border-box;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h3 {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      margin: 0;
      color: var(--md-sys-color-on-surface);
    }

    .allocation-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .item {
      cursor: pointer;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 8px;
    }

    .label-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .label {
      font-family: var(--font-display);
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      font-size: 0.875rem;
    }

    .percentage {
      font-family: var(--font-serif);
      font-weight: 500;
      font-size: 1.125rem;
      color: var(--md-sys-color-on-surface);
    }

    .bar-container {
      width: 100%;
      height: 4px;
      background-color: var(--md-sys-color-surface-variant);
      border-radius: 2px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--md-sys-color-outline-variant);
        font-family: var(--font-display);
        font-size: 0.75rem;
        line-height: 1.6;
        color: var(--md-sys-color-text-muted);
    }

    .footer strong {
        color: var(--md-sys-color-text-heading);
    }
  `;
  render() {
    return l`
      <div class="card">
        <div class="header">
          <h3>${this.title || "Allocation"}</h3>
          <md-icon-button><md-icon>more_horiz</md-icon></md-icon-button>
        </div>
        <div class="allocation-list">
          ${(this.items || []).map((e) => l`
            <div class="item">
              <div class="item-header">
                <div class="label-group">
                  <div class="dot" style="background-color: ${e.color || "var(--md-sys-color-primary)"}"></div>
                  <span class="label">${e.label}</span>
                </div>
                <span class="percentage">${e.value}%</span>
              </div>
              <div class="bar-container">
                <div class="bar" style="width: ${e.value}%; background-color: ${e.color || "var(--md-sys-color-primary)"}"></div>
              </div>
            </div>
          `)}
        </div>
        <div class="footer">
            <slot name="analysis">
                <strong>Analysis:</strong> Portfolio remains within target variance.
            </slot>
        </div>
      </div>
    `;
  }
}
customElements.define("wy-allocation-card", Es);
class Ss extends g {
  static properties = {
    image: { type: String },
    category: { type: String },
    title: { type: String },
    icon: { type: String }
  };
  static styles = m`
    :host {
      display: block;
    }
    
    .card {
      position: relative;
      width: 100%;
      height: 200px;
      border-radius: var(--md-sys-shape-corner-medium);
      overflow: hidden;
      cursor: pointer;
    }

    .image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.7s ease;
    }

    .card:hover .image {
      transform: scale(1.05);
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(45, 78, 60, 0.9) 0%, transparent 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 24px;
      box-sizing: border-box;
      color: white;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .category {
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }

    .title {
      font-family: var(--font-serif);
      font-size: 1.125rem;
      line-height: 1.3;
      margin: 0;
    }

    md-icon {
      font-size: 16px;
    }
  `;
  render() {
    return l`
      <div class="card">
        <div class="image" style="background-image: url('${this.image}')"></div>
        <div class="overlay">
          <div class="header">
            ${this.icon ? l`<md-icon>${this.icon}</md-icon>` : ""}
            <span class="category">${this.category}</span>
          </div>
          <h4 class="title">${this.title}</h4>
        </div>
      </div>
    `;
  }
}
customElements.define("wy-insight-card", Ss);
class Ts extends g {
  static properties = {
    title: { type: String },
    artist: { type: String },
    date: { type: String },
    image: { type: String },
    selected: { type: Boolean, reflect: !0 },
    favorite: { type: Boolean },
    status: { type: String }
    // 'draft', 'ready', 'exported'
  };
  constructor() {
    super(), this.title = "Untitled", this.artist = "Unknown", this.date = "", this.image = "", this.selected = !1, this.favorite = !1, this.status = "";
  }
  static styles = m`
    :host {
      display: block;
      cursor: pointer;
    }

    .card {
      border-radius: 20px;
      overflow: hidden;
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .card:hover {
      border-color: var(--md-sys-color-primary);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(45, 78, 60, 0.08);
    }

    :host([selected]) .card {
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 2px var(--md-sys-color-primary);
    }

    .media-container {
      aspect-ratio: 16 / 9;
      background-color: var(--md-sys-color-surface-container-high);
      overflow: hidden;
      position: relative;
    }

    .media-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .card:hover .media-container img {
      transform: scale(1.05);
    }

    .info-container {
      padding: 16px;
    }

    .title {
      font-family: var(--font-serif);
      font-size: 1.125rem;
      color: var(--md-sys-color-text-heading);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metadata {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      color: var(--md-sys-color-on-surface-variant);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .badges {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
    }

    .badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-text-heading);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(4px);
    }

    .status-indicator {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-family: var(--font-body);
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .favorite-toggle {
      color: ${m`var(--md-sys-color-text-heading)`};
    }

    .favorite-toggle[active] {
      color: #E91E63; /* Accent color for favorites */
    }
  `;
  render() {
    return l`
      <div class="card" @click="${this._toggleSelect}">
        <div class="media-container">
          ${this.image ? l`<img src="${this.image}" alt="${this.title}">` : ""}
          
          <div class="badges">
            <div class="badge" @click="${this._toggleFavorite}">
              <md-icon>${this.favorite ? "favorite" : "favorite_border"}</md-icon>
            </div>
          </div>

          ${this.status ? l`
            <div class="status-indicator">${this.status}</div>
          ` : ""}
        </div>

        <div class="info-container">
          <div class="title">${this.title}</div>
          <div class="metadata">
            <span>${this.artist}</span>
            <span>${this.date}</span>
          </div>
        </div>
      </div>
    `;
  }
  _toggleSelect(e) {
    e.target.closest(".badge") || (this.selected = !this.selected, this.dispatchEvent(new CustomEvent("selection-change", {
      detail: { selected: this.selected, title: this.title },
      bubbles: !0,
      composed: !0
    })));
  }
  _toggleFavorite(e) {
    e.stopPropagation(), this.favorite = !this.favorite, this.requestUpdate();
  }
}
customElements.define("wy-work-card", Ts);
class zs extends g {
  static properties = {
    density: { type: String },
    // 'spacious', 'compact'
    empty: { type: Boolean }
  };
  constructor() {
    super(), this.density = "spacious", this.empty = !1;
  }
  static styles = m`
    :host {
      display: block;
      width: 100%;
    }

    .grid-container {
      display: grid;
      gap: 32px;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      transition: all 0.3s ease;
    }

    :host([density="compact"]) .grid-container {
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      background-color: var(--md-sys-color-surface-container-low);
      border: 2px dashed var(--md-sys-color-outline-variant);
      border-radius: 24px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .empty-state md-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    .empty-text {
      font-family: var(--font-body);
      font-size: 0.875rem;
      max-width: 400px;
    }

    @media (max-width: 600px) {
      .grid-container {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `;
  render() {
    return this.empty ? l`
        <div class="empty-state">
          <md-icon>hourglass_empty</md-icon>
          <div class="empty-title">No Artwork Found</div>
          <div class="empty-text">Your plotter library is currently empty. Start by importing new plot files or generating configurations.</div>
        </div>
      ` : l`
      <div class="grid-container">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define("wy-works-grid", zs);
class As extends g {
  static properties = {
    title: { type: String },
    paperSize: { type: String, attribute: "paper-size" },
    bucket: { type: String },
    status: { type: String },
    // 'pending', 'success', 'error'
    timestamp: { type: String }
  };
  constructor() {
    super(), this.title = "Plot Configuration", this.paperSize = "Letter (8.5x11)", this.bucket = "Portrait", this.status = "success", this.timestamp = (/* @__PURE__ */ new Date()).toLocaleDateString();
  }
  static styles = m`
    :host {
      display: block;
    }

    .card {
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .card:hover {
      background-color: var(--md-sys-color-surface-container-low);
      border-color: var(--md-sys-color-primary);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .title {
      font-family: var(--font-serif);
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--md-sys-color-text-heading);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-pending { color: var(--md-sys-color-secondary); }
    .status-success { color: #4CAF50; }
    .status-error { color: #D32F2F; }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      padding-top: 12px;
    }

    .metric-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .metric-icon {
      color: var(--md-sys-color-on-surface-variant);
      font-size: 18px;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-family: var(--font-body);
      font-size: 0.625rem;
      color: var(--md-sys-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .timestamp {
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.7;
    }
  `;
  render() {
    const e = {
      pending: { icon: "sync", label: "Processing" },
      success: { icon: "check_circle", label: "Complete" },
      error: { icon: "error", label: "Failed" }
    }, t = e[this.status] || e.success;
    return l`
      <div class="card">
        <div class="header">
          <div class="title">${this.title}</div>
          <div class="status-badge status-${this.status}">
            <md-icon style="font-size: 14px;">${t.icon}</md-icon>
            <span>${t.label}</span>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-item">
            <md-icon class="metric-icon">description</md-icon>
            <div class="metric-content">
              <span class="metric-label">Format</span>
              <span class="metric-value">${this.paperSize}</span>
            </div>
          </div>
          <div class="metric-item">
            <md-icon class="metric-icon">layers</md-icon>
            <div class="metric-content">
              <span class="metric-label">Orientation</span>
              <span class="metric-value">${this.bucket}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <span class="timestamp">${this.timestamp}</span>
          <md-icon-button>
            <md-icon>more_vert</md-icon>
          </md-icon-button>
        </div>
      </div>
    `;
  }
}
customElements.define("wy-plot-card", As);
class Is extends g {
  static properties = {
    status: { type: String },
    // 'synced', 'syncing', 'error'
    lastSync: { type: String, attribute: "last-sync" }
  };
  constructor() {
    super(), this.status = "synced", this.lastSync = "2 mins ago";
  }
  static styles = m`
    :host {
      display: inline-block;
    }

    .pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 16px;
      border-radius: 9999px;
      background-color: var(--md-sys-color-surface-container-high);
      border: 1px solid var(--md-sys-color-outline-variant);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .pill:hover {
      background-color: var(--md-sys-color-surface-container-highest);
      border-color: var(--md-sys-color-primary);
    }

    .status-icon {
      font-size: 18px;
    }

    .text-container {
      display: flex;
      flex-direction: column;
    }

    .status-text {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .hint-text {
      font-family: var(--font-body);
      font-size: 0.625rem;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.2;
      margin-top: 2px;
    }

    .status-synced { color: #4CAF50; }
    .status-syncing { color: var(--md-sys-color-text-heading); }
    .status-error { color: #D32F2F; }

    .syncing-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      animation: spin 2s linear infinite;
    }

    .syncing-icon {
      font-size: 18px;
    }
  `;
  render() {
    const e = {
      synced: { icon: "cloud_done", label: "Synced", class: "status-synced" },
      syncing: { icon: "sync", label: "Syncing...", class: "status-syncing" },
      error: { icon: "cloud_off", label: "Offline", class: "status-error" }
    }, t = e[this.status] || e.synced;
    return l`
      <div class="pill" title="Last backup: ${this.lastSync}">
        ${this.status === "syncing" ? l`
          <div class="syncing-container">
            <md-icon class="status-icon ${t.class}">${t.icon}</md-icon>
          </div>
        ` : l`
          <md-icon class="status-icon ${t.class}">${t.icon}</md-icon>
        `}
        <div class="text-container">
          <span class="status-text ${t.class}">${t.label}</span>
          <span class="hint-text">${this.lastSync}</span>
        </div>
      </div>
    `;
  }
}
customElements.define("wy-backup-status", Is);
console.log("[m3-design-v2] Web components registered");
//# sourceMappingURL=web-components.js.map
