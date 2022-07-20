var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/svelte/internal/index.mjs
function noop() {
}
var identity = (x) => x;
function assign(tar, src) {
  for (const k in src)
    tar[k] = src[k];
  return tar;
}
function add_location(element2, file37, line, column, char) {
  element2.__svelte_meta = {
    loc: { file: file37, line, column, char }
  };
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var src_url_equal_anchor;
function src_url_equal(element_src, url) {
  if (!src_url_equal_anchor) {
    src_url_equal_anchor = document.createElement("a");
  }
  src_url_equal_anchor.href = url;
  return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function validate_store(store, name) {
  if (store != null && typeof store.subscribe !== "function") {
    throw new Error(`'${name}' is not a store with a 'subscribe' method`);
  }
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
  let value;
  subscribe(store, (_) => value = _)();
  return value;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
  if (definition) {
    const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
    return definition[0](slot_ctx);
  }
}
function get_slot_context(definition, ctx, $$scope, fn) {
  return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
  if (definition[2] && fn) {
    const lets = definition[2](fn(dirty));
    if ($$scope.dirty === void 0) {
      return lets;
    }
    if (typeof lets === "object") {
      const merged = [];
      const len = Math.max($$scope.dirty.length, lets.length);
      for (let i = 0; i < len; i += 1) {
        merged[i] = $$scope.dirty[i] | lets[i];
      }
      return merged;
    }
    return $$scope.dirty | lets;
  }
  return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
  if (slot_changes) {
    const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}
function get_all_dirty_from_scope($$scope) {
  if ($$scope.ctx.length > 32) {
    const dirty = [];
    const length = $$scope.ctx.length / 32;
    for (let i = 0; i < length; i++) {
      dirty[i] = -1;
    }
    return dirty;
  }
  return -1;
}
function exclude_internal_props(props) {
  const result = {};
  for (const k in props)
    if (k[0] !== "$")
      result[k] = props[k];
  return result;
}
function compute_slots(slots) {
  const result = {};
  for (const key in slots) {
    result[key] = true;
  }
  return result;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function action_destroyer(action_result) {
  return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}
var is_client = typeof window !== "undefined";
var now = is_client ? () => window.performance.now() : () => Date.now();
var raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
var tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
var is_hydrating = false;
function start_hydrating() {
  is_hydrating = true;
}
function end_hydrating() {
  is_hydrating = false;
}
function append(target, node) {
  target.appendChild(node);
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
function append_stylesheet(node, style) {
  append(node.head || node, style);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
  return function(event) {
    event.preventDefault();
    return fn.call(this, event);
  };
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
  const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
  for (const key in attributes) {
    if (attributes[key] == null) {
      node.removeAttribute(key);
    } else if (key === "style") {
      node.style.cssText = attributes[key];
    } else if (key === "__value") {
      node.value = node[key] = attributes[key];
    } else if (descriptors[key] && descriptors[key].set) {
      node[key] = attributes[key];
    } else {
      attr(node, key, attributes[key]);
    }
  }
}
function to_number(value) {
  return value === "" ? null : +value;
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_input_value(input, value) {
  input.value = value == null ? "" : value;
}
function set_style(node, key, value, important) {
  if (value === null) {
    node.style.removeProperty(key);
  } else {
    node.style.setProperty(key, value, important ? "important" : "");
  }
}
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
  select.selectedIndex = -1;
}
function select_options(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    option.selected = ~value.indexOf(option.__value);
  }
}
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
function select_multiple_value(select) {
  return [].map.call(select.querySelectorAll(":checked"), (option) => option.__value);
}
function toggle_class(element2, name, toggle) {
  element2.classList[toggle ? "add" : "remove"](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
}
var HtmlTag = class {
  constructor(is_svg = false) {
    this.is_svg = false;
    this.is_svg = is_svg;
    this.e = this.n = null;
  }
  c(html) {
    this.h(html);
  }
  m(html, target, anchor = null) {
    if (!this.e) {
      if (this.is_svg)
        this.e = svg_element(target.nodeName);
      else
        this.e = element(target.nodeName);
      this.t = target;
      this.c(html);
    }
    this.i(anchor);
  }
  h(html) {
    this.e.innerHTML = html;
    this.n = Array.from(this.e.childNodes);
  }
  i(anchor) {
    for (let i = 0; i < this.n.length; i += 1) {
      insert(this.t, this.n[i], anchor);
    }
  }
  p(html) {
    this.d();
    this.h(html);
    this.i(this.a);
  }
  d() {
    this.n.forEach(detach);
  }
};
var managed_styles = /* @__PURE__ */ new Map();
var active = 0;
function hash(str) {
  let hash3 = 5381;
  let i = str.length;
  while (i--)
    hash3 = (hash3 << 5) - hash3 ^ str.charCodeAt(i);
  return hash3 >>> 0;
}
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info);
  return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1);
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    managed_styles.forEach((info) => {
      const { stylesheet } = info;
      let i = stylesheet.cssRules.length;
      while (i--)
        stylesheet.deleteRule(i);
      info.rules = {};
    });
    managed_styles.clear();
  });
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail, { cancelable });
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
  return context;
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
function bubble(component, event) {
  const callbacks = component.$$.callbacks[event.type];
  if (callbacks) {
    callbacks.slice().forEach((fn) => fn.call(this, event));
  }
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}
var seen_callbacks = /* @__PURE__ */ new Set();
var flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
var outroing = /* @__PURE__ */ new Set();
var outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
var null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
  let config = fn(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick: tick2 = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick2(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick2(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick2(t, 1 - t);
        }
      }
      return running;
    });
  }
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
function create_out_transition(node, fn, params) {
  let config = fn(node, params);
  let running = true;
  let animation_name;
  const group = outros;
  group.r += 1;
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick: tick2 = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    add_render_callback(() => dispatch(node, false, "start"));
    loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick2(0, 1);
          dispatch(node, false, "end");
          if (!--group.r) {
            run_all(group.c);
          }
          return false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick2(1 - t, t);
        }
      }
      return running;
    });
  }
  if (is_function(config)) {
    wait().then(() => {
      config = config();
      go();
    });
  } else {
    go();
  }
  return {
    end(reset) {
      if (reset && config.tick) {
        config.tick(1, 0);
      }
      if (running) {
        if (animation_name)
          delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}
function create_bidirectional_transition(node, fn, params, intro) {
  let config = fn(node, params);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init2(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b) {
    const { delay = 0, duration = 300, easing = identity, tick: tick2 = noop, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick2(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick2(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick2(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
function destroy_block(block, lookup) {
  block.d(1);
  lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
  transition_out(block, 1, 1, () => {
    lookup.delete(block.key);
  });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block12, next, get_context) {
  let o = old_blocks.length;
  let n = list.length;
  let i = o;
  const old_indexes = {};
  while (i--)
    old_indexes[old_blocks[i].key] = i;
  const new_blocks = [];
  const new_lookup = /* @__PURE__ */ new Map();
  const deltas = /* @__PURE__ */ new Map();
  i = n;
  while (i--) {
    const child_ctx = get_context(ctx, list, i);
    const key = get_key(child_ctx);
    let block = lookup.get(key);
    if (!block) {
      block = create_each_block12(key, child_ctx);
      block.c();
    } else if (dynamic) {
      block.p(child_ctx, dirty);
    }
    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes)
      deltas.set(key, Math.abs(i - old_indexes[key]));
  }
  const will_move = /* @__PURE__ */ new Set();
  const did_move = /* @__PURE__ */ new Set();
  function insert2(block) {
    transition_in(block, 1);
    block.m(node, next);
    lookup.set(block.key, block);
    next = block.first;
    n--;
  }
  while (o && n) {
    const new_block = new_blocks[n - 1];
    const old_block = old_blocks[o - 1];
    const new_key = new_block.key;
    const old_key = old_block.key;
    if (new_block === old_block) {
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert2(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert2(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }
  while (o--) {
    const old_block = old_blocks[o];
    if (!new_lookup.has(old_block.key))
      destroy(old_block, lookup);
  }
  while (n)
    insert2(new_blocks[n - 1]);
  return new_blocks;
}
function validate_each_keys(ctx, list, get_context, get_key) {
  const keys = /* @__PURE__ */ new Set();
  for (let i = 0; i < list.length; i++) {
    const key = get_key(get_context(ctx, list, i));
    if (keys.has(key)) {
      throw new Error("Cannot have duplicate keys in a keyed each");
    }
    keys.add(key);
  }
}
function get_spread_update(levels, updates) {
  const update3 = {};
  const to_null_out = {};
  const accounted_for = { $$scope: 1 };
  let i = levels.length;
  while (i--) {
    const o = levels[i];
    const n = updates[i];
    if (n) {
      for (const key in o) {
        if (!(key in n))
          to_null_out[key] = 1;
      }
      for (const key in n) {
        if (!accounted_for[key]) {
          update3[key] = n[key];
          accounted_for[key] = 1;
        }
      }
      levels[i] = n;
    } else {
      for (const key in o) {
        accounted_for[key] = 1;
      }
    }
  }
  for (const key in to_null_out) {
    if (!(key in update3))
      update3[key] = void 0;
  }
  return update3;
}
function get_spread_object(spread_props) {
  return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
}
function bind(component, name, callback) {
  const index = component.$$.props[name];
  if (index !== void 0) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance38, create_fragment38, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance38 ? instance38(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment38 ? create_fragment38($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      start_hydrating();
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    end_hydrating();
    flush();
  }
  set_current_component(parent_component);
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};
function dispatch_dev(type, detail) {
  document.dispatchEvent(custom_event(type, Object.assign({ version: "3.48.0" }, detail), { bubbles: true }));
}
function append_dev(target, node) {
  dispatch_dev("SvelteDOMInsert", { target, node });
  append(target, node);
}
function insert_dev(target, node, anchor) {
  dispatch_dev("SvelteDOMInsert", { target, node, anchor });
  insert(target, node, anchor);
}
function detach_dev(node) {
  dispatch_dev("SvelteDOMRemove", { node });
  detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
  const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
  if (has_prevent_default)
    modifiers.push("preventDefault");
  if (has_stop_propagation)
    modifiers.push("stopPropagation");
  dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
  const dispose = listen(node, event, handler, options);
  return () => {
    dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
    dispose();
  };
}
function attr_dev(node, attribute, value) {
  attr(node, attribute, value);
  if (value == null)
    dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
  else
    dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function prop_dev(node, property, value) {
  node[property] = value;
  dispatch_dev("SvelteDOMSetProperty", { node, property, value });
}
function set_data_dev(text2, data) {
  data = "" + data;
  if (text2.wholeText === data)
    return;
  dispatch_dev("SvelteDOMSetData", { node: text2, data });
  text2.data = data;
}
function validate_each_argument(arg) {
  if (typeof arg !== "string" && !(arg && typeof arg === "object" && "length" in arg)) {
    let msg = "{#each} only iterates over array-like objects.";
    if (typeof Symbol === "function" && arg && Symbol.iterator in arg) {
      msg += " You can use a spread to convert this iterable into an array.";
    }
    throw new Error(msg);
  }
}
function validate_slots(name, slot, keys) {
  for (const slot_key of Object.keys(slot)) {
    if (!~keys.indexOf(slot_key)) {
      console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
    }
  }
}
var SvelteComponentDev = class extends SvelteComponent {
  constructor(options) {
    if (!options || !options.target && !options.$$inline) {
      throw new Error("'target' is a required option");
    }
    super();
  }
  $destroy() {
    super.$destroy();
    this.$destroy = () => {
      console.warn("Component was already destroyed");
    };
  }
  $capture_state() {
  }
  $inject_state() {
  }
};

// node_modules/svelte/store/index.mjs
var subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update3(fn) {
    set2(fn(value));
  }
  function subscribe3(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update: update3, subscribe: subscribe3 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set2) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set2);
      if (auto) {
        set2(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
    };
  });
}

// src/services/article.ts
var Article = class {
  idPair;
  idPairStr;
  text;
  textHtml;
  author;
  creationTime;
  url;
  medias;
  markedAsRead;
  hidden;
  actualArticleRef;
  replyRef;
  fetched;
  json;
  constructor(params) {
    this.text = params.text;
    this.textHtml = params.textHtml;
    this.url = params.url;
    this.medias = params.medias || [];
    this.markedAsRead = params.markedAsRead || params.markedAsReadStorage.includes(params.id.toString());
    this.hidden = params.hidden || params.hiddenStorage.includes(params.id.toString());
    this.actualArticleRef = params.actualArticleRef;
    this.replyRef = params.replyRef;
    this.fetched = params.fetched || false;
    this.json = params.json;
    this.idPair = {
      service: this.constructor.service,
      id: params.id
    };
    this.idPairStr = `${this.idPair.service}/${params.id}`;
  }
  getLikeCount() {
    return 0;
  }
  getLiked() {
    return false;
  }
  getRepostCount() {
    return 0;
  }
  getReposted() {
    return false;
  }
};
__publicField(Article, "service");
function getRatio(width, height) {
  if (isNaN(width))
    throw "Width is NaN";
  if (isNaN(height))
    throw "Height is NaN";
  if (width <= 0)
    throw "Width isn't positive";
  if (height <= 0)
    throw "Height isn't positive";
  return height / width;
}
var MediaType = /* @__PURE__ */ ((MediaType2) => {
  MediaType2[MediaType2["Image"] = 0] = "Image";
  MediaType2[MediaType2["Video"] = 1] = "Video";
  MediaType2[MediaType2["VideoGif"] = 2] = "VideoGif";
  MediaType2[MediaType2["Gif"] = 3] = "Gif";
  return MediaType2;
})(MediaType || {});
var MediaQueueInfo = /* @__PURE__ */ ((MediaQueueInfo2) => {
  MediaQueueInfo2[MediaQueueInfo2["DirectLoad"] = 0] = "DirectLoad";
  MediaQueueInfo2[MediaQueueInfo2["Thumbnail"] = 1] = "Thumbnail";
  MediaQueueInfo2[MediaQueueInfo2["LazyLoad"] = 2] = "LazyLoad";
  return MediaQueueInfo2;
})(MediaQueueInfo || {});
function articleRefToIdPair(ref) {
  switch (ref.type) {
    case 0 /* Repost */:
      return {
        type: ref.type,
        reposted: ref.reposted.idPair
      };
    case 1 /* Quote */:
      return {
        type: ref.type,
        quoted: ref.quoted.idPair
      };
    case 2 /* QuoteRepost */:
      return {
        type: ref.type,
        reposted: ref.reposted.idPair,
        quoted: ref.quoted.idPair
      };
  }
}
function getRefed(ref) {
  switch (ref.type) {
    case 0 /* Repost */:
      return [ref.reposted];
    case 1 /* Quote */:
      return [ref.quoted];
    case 2 /* QuoteRepost */:
      return [ref.reposted, ref.quoted];
  }
}
function getActualArticle({ article, actualArticleRef }) {
  switch (actualArticleRef?.type) {
    case 0 /* Repost */:
      return actualArticleRef.reposted;
    case 1 /* Quote */:
      return article;
    case 2 /* QuoteRepost */:
      return actualArticleRef.reposted;
    default:
      return article;
  }
}
function articleRefIdPairToRef(articleRef) {
  switch (articleRef.type) {
    case 0 /* Repost */:
      return derived(getWritable(articleRef.reposted), (reposted) => ({
        type: articleRef.type,
        reposted
      }));
    case 1 /* Quote */:
      return derived(getWritable(articleRef.quoted), (quoted) => ({
        type: articleRef.type,
        quoted
      }));
    case 2 /* QuoteRepost */:
      return derived([
        getWritable(articleRef.reposted),
        getWritable(articleRef.quoted)
      ], ([reposted, quoted]) => ({
        type: articleRef.type,
        reposted,
        quoted
      }));
  }
}

// src/filters/index.ts
function getFilterName(filterType, inverted) {
  if (inverted) {
    switch (filterType) {
      case "media":
        return "Without Media";
      case "animated":
        return "Not Animated";
      case "notMarkedAsRead":
        return "Marked as read";
      case "notHidden":
        return "Hidden";
      case "liked":
        return "Not liked";
      case "reposted":
        return "Not reposted";
      case "noRef":
        return "References other articles";
      case "repost":
        return "Not a repost";
      case "quote":
        return "Not a quote";
    }
  } else {
    switch (filterType) {
      case "media":
        return "Has media";
      case "animated":
        return "Animated";
      case "notMarkedAsRead":
        return "Not marked as read";
      case "notHidden":
        return "Not hidden";
      case "liked":
        return "Liked";
      case "reposted":
        return "Reposted";
      case "noRef":
        return "Doesn't references other articles";
      case "repost":
        return "Repost";
      case "quote":
        return "Quote";
    }
  }
}
var filterTypes = [
  "media",
  "animated",
  "notMarkedAsRead",
  "notHidden",
  "liked",
  "reposted",
  "noRef",
  "repost",
  "quote"
];
function defaultFilter(filterType) {
  return { type: filterType };
}
var defaultFilterInstances = [
  {
    filter: { type: "notMarkedAsRead" },
    enabled: true,
    inverted: false
  },
  {
    filter: { type: "notHidden" },
    enabled: true,
    inverted: false
  }
];
function keepArticle(articleWithRefs, filter) {
  switch (filter.type) {
    case "media":
      return !!articleWithRefs.article.medias.length || articleWithRefs.actualArticleRef !== void 0 && getRefed(articleWithRefs.actualArticleRef).some((ref) => !!ref.medias.length);
    case "animated":
      return articleWithRefs.article.medias.some(isAnimated) || articleWithRefs.actualArticleRef !== void 0 && getRefed(articleWithRefs.actualArticleRef).some((ref) => ref.medias.some(isAnimated));
    case "notMarkedAsRead":
      return !articleWithRefs.article.markedAsRead && (articleWithRefs.actualArticleRef?.type !== 0 /* Repost */ && articleWithRefs.actualArticleRef?.type !== 2 /* QuoteRepost */ || !articleWithRefs.actualArticleRef.reposted.markedAsRead);
    case "notHidden":
      return !articleWithRefs.article.hidden && (articleWithRefs.actualArticleRef?.type !== 0 /* Repost */ && articleWithRefs.actualArticleRef?.type !== 2 /* QuoteRepost */ || !articleWithRefs.actualArticleRef.reposted.hidden);
    case "liked":
      return getActualArticle(articleWithRefs).getLiked();
    case "reposted":
      return getActualArticle(articleWithRefs).getReposted();
    case "noRef":
      return articleWithRefs.actualArticleRef === void 0;
    case "repost":
      if (articleWithRefs.actualArticleRef?.type === 0 /* Repost */ || articleWithRefs.actualArticleRef?.type === 2 /* QuoteRepost */) {
        if (filter.byUsername)
          return articleWithRefs.article.author?.username === filter.byUsername;
        else
          return true;
      }
      return false;
    case "quote":
      if (articleWithRefs.actualArticleRef?.type === 1 /* Quote */ || articleWithRefs.actualArticleRef?.type === 2 /* QuoteRepost */) {
        if (filter.byUsername) {
          if (articleWithRefs.actualArticleRef.type === 2 /* QuoteRepost */)
            return articleWithRefs.actualArticleRef.reposted.author?.username === filter.byUsername;
          else
            return articleWithRefs.article.author?.username === filter.byUsername;
        } else
          return true;
      }
      return false;
  }
}
function isAnimated(media) {
  switch (media.mediaType) {
    case 1 /* Video */:
    case 2 /* VideoGif */:
    case 3 /* Gif */:
      return true;
    case 0 /* Image */:
      return false;
  }
}

// node_modules/svelma/src/components/Icon.svelte
var file = "node_modules/svelma/src/components/Icon.svelte";
function create_fragment(ctx) {
  let span;
  let i;
  let i_class_value;
  let span_class_value;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      span = element("span");
      i = element("i");
      attr_dev(i, "class", i_class_value = ctx[8] + " fa-" + ctx[0] + " " + ctx[2] + " " + ctx[6]);
      add_location(i, file, 53, 2, 1189);
      attr_dev(span, "class", span_class_value = "icon " + ctx[1] + " " + ctx[7] + " " + (ctx[4] && "is-left" || "") + " " + (ctx[5] && "is-right" || ""));
      toggle_class(span, "is-clickable", ctx[3]);
      add_location(span, file, 52, 0, 1046);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      append_dev(span, i);
      if (!mounted) {
        dispose = listen_dev(span, "click", ctx[12], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 325 && i_class_value !== (i_class_value = ctx2[8] + " fa-" + ctx2[0] + " " + ctx2[2] + " " + ctx2[6])) {
        attr_dev(i, "class", i_class_value);
      }
      if (dirty & 178 && span_class_value !== (span_class_value = "icon " + ctx2[1] + " " + ctx2[7] + " " + (ctx2[4] && "is-left" || "") + " " + (ctx2[5] && "is-right" || ""))) {
        attr_dev(span, "class", span_class_value);
      }
      if (dirty & 186) {
        toggle_class(span, "is-clickable", ctx2[3]);
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance($$self, $$props, $$invalidate) {
  let newPack;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Icon", slots, []);
  let { type = "" } = $$props;
  let { pack = "fas" } = $$props;
  let { icon } = $$props;
  let { size = "" } = $$props;
  let { customClass = "" } = $$props;
  let { customSize = "" } = $$props;
  let { isClickable = false } = $$props;
  let { isLeft = false } = $$props;
  let { isRight = false } = $$props;
  let newCustomSize = "";
  let newType = "";
  const writable_props = [
    "type",
    "pack",
    "icon",
    "size",
    "customClass",
    "customSize",
    "isClickable",
    "isLeft",
    "isRight"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Icon> was created with unknown prop '${key}'`);
  });
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("type" in $$props2)
      $$invalidate(9, type = $$props2.type);
    if ("pack" in $$props2)
      $$invalidate(10, pack = $$props2.pack);
    if ("icon" in $$props2)
      $$invalidate(0, icon = $$props2.icon);
    if ("size" in $$props2)
      $$invalidate(1, size = $$props2.size);
    if ("customClass" in $$props2)
      $$invalidate(2, customClass = $$props2.customClass);
    if ("customSize" in $$props2)
      $$invalidate(11, customSize = $$props2.customSize);
    if ("isClickable" in $$props2)
      $$invalidate(3, isClickable = $$props2.isClickable);
    if ("isLeft" in $$props2)
      $$invalidate(4, isLeft = $$props2.isLeft);
    if ("isRight" in $$props2)
      $$invalidate(5, isRight = $$props2.isRight);
  };
  $$self.$capture_state = () => ({
    type,
    pack,
    icon,
    size,
    customClass,
    customSize,
    isClickable,
    isLeft,
    isRight,
    newCustomSize,
    newType,
    newPack
  });
  $$self.$inject_state = ($$props2) => {
    if ("type" in $$props2)
      $$invalidate(9, type = $$props2.type);
    if ("pack" in $$props2)
      $$invalidate(10, pack = $$props2.pack);
    if ("icon" in $$props2)
      $$invalidate(0, icon = $$props2.icon);
    if ("size" in $$props2)
      $$invalidate(1, size = $$props2.size);
    if ("customClass" in $$props2)
      $$invalidate(2, customClass = $$props2.customClass);
    if ("customSize" in $$props2)
      $$invalidate(11, customSize = $$props2.customSize);
    if ("isClickable" in $$props2)
      $$invalidate(3, isClickable = $$props2.isClickable);
    if ("isLeft" in $$props2)
      $$invalidate(4, isLeft = $$props2.isLeft);
    if ("isRight" in $$props2)
      $$invalidate(5, isRight = $$props2.isRight);
    if ("newCustomSize" in $$props2)
      $$invalidate(6, newCustomSize = $$props2.newCustomSize);
    if ("newType" in $$props2)
      $$invalidate(7, newType = $$props2.newType);
    if ("newPack" in $$props2)
      $$invalidate(8, newPack = $$props2.newPack);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1024) {
      $:
        $$invalidate(8, newPack = pack || "fas");
    }
    if ($$self.$$.dirty & 2050) {
      $: {
        if (customSize)
          $$invalidate(6, newCustomSize = customSize);
        else {
          switch (size) {
            case "is-small":
              break;
            case "is-medium":
              $$invalidate(6, newCustomSize = "fa-lg");
              break;
            case "is-large":
              $$invalidate(6, newCustomSize = "fa-3x");
              break;
            default:
              $$invalidate(6, newCustomSize = "");
          }
        }
      }
    }
    if ($$self.$$.dirty & 512) {
      $: {
        if (!type)
          $$invalidate(7, newType = "");
        let splitType = [];
        if (typeof type === "string") {
          splitType = type.split("-");
        } else {
          for (let key in type) {
            if (type[key]) {
              splitType = key.split("-");
              break;
            }
          }
        }
        if (splitType.length <= 1)
          $$invalidate(7, newType = "");
        else
          $$invalidate(7, newType = `has-text-${splitType[1]}`);
      }
    }
  };
  return [
    icon,
    size,
    customClass,
    isClickable,
    isLeft,
    isRight,
    newCustomSize,
    newType,
    newPack,
    type,
    pack,
    customSize,
    click_handler
  ];
}
var Icon = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance, create_fragment, safe_not_equal, {
      type: 9,
      pack: 10,
      icon: 0,
      size: 1,
      customClass: 2,
      customSize: 11,
      isClickable: 3,
      isLeft: 4,
      isRight: 5
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Icon",
      options,
      id: create_fragment.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("icon" in props)) {
      console.warn("<Icon> was created without expected prop 'icon'");
    }
  }
  get type() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get pack() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set pack(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get icon() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set icon(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get customClass() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set customClass(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get customSize() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set customSize(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get isClickable() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isClickable(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get isLeft() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isLeft(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get isRight() {
    throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isRight(value) {
    throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Icon_default = Icon;

// node_modules/svelte/transition/index.mjs
var transition_exports = {};
__export(transition_exports, {
  blur: () => blur,
  crossfade: () => crossfade,
  draw: () => draw,
  fade: () => fade,
  fly: () => fly,
  scale: () => scale,
  slide: () => slide
});

// node_modules/svelte/easing/index.mjs
function cubicInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 0.5 * Math.pow(2 * t - 2, 3) + 1;
}
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}

// node_modules/svelte/transition/index.mjs
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const f = style.filter === "none" ? "" : style.filter;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `opacity: ${target_opacity - od * u}; filter: ${f} blur(${u * amount}px);`
  };
}
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - od * u}`
  };
}
function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const height = parseFloat(style.height);
  const padding_top = parseFloat(style.paddingTop);
  const padding_bottom = parseFloat(style.paddingBottom);
  const margin_top = parseFloat(style.marginTop);
  const margin_bottom = parseFloat(style.marginBottom);
  const border_top_width = parseFloat(style.borderTopWidth);
  const border_bottom_width = parseFloat(style.borderBottomWidth);
  return {
    delay,
    duration,
    easing,
    css: (t) => `overflow: hidden;opacity: ${Math.min(t * 20, 1) * opacity};height: ${t * height}px;padding-top: ${t * padding_top}px;padding-bottom: ${t * padding_bottom}px;margin-top: ${t * margin_top}px;margin-bottom: ${t * margin_bottom}px;border-top-width: ${t * border_top_width}px;border-bottom-width: ${t * border_bottom_width}px;`
  };
}
function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
  };
}
function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
  let len = node.getTotalLength();
  const style = getComputedStyle(node);
  if (style.strokeLinecap !== "butt") {
    len += parseInt(style.strokeWidth);
  }
  if (duration === void 0) {
    if (speed === void 0) {
      duration = 800;
    } else {
      duration = len / speed;
    }
  } else if (typeof duration === "function") {
    duration = duration(len);
  }
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
  };
}
function crossfade(_a) {
  var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
  const to_receive = /* @__PURE__ */ new Map();
  const to_send = /* @__PURE__ */ new Map();
  function crossfade2(from, node, params) {
    const { delay = 0, duration = (d2) => Math.sqrt(d2) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
    const to = node.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const dw = from.width / to.width;
    const dh = from.height / to.height;
    const d = Math.sqrt(dx * dx + dy * dy);
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    const opacity = +style.opacity;
    return {
      delay,
      duration: is_function(duration) ? duration(d) : duration,
      easing,
      css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
    };
  }
  function transition(items, counterparts, intro) {
    return (node, params) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect()
      });
      return () => {
        if (counterparts.has(params.key)) {
          const { rect } = counterparts.get(params.key);
          counterparts.delete(params.key);
          return crossfade2(rect, node, params);
        }
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }
  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true)
  ];
}

// node_modules/svelma/src/utils/index.js
function chooseAnimation(animation) {
  return typeof animation === "function" ? animation : transition_exports[animation];
}
function isEnterKey(e) {
  return e.keyCode && e.keyCode === 13;
}
function isEscKey(e) {
  return e.keyCode && e.keyCode === 27;
}
function omit(obj, ...keysToOmit) {
  return Object.keys(obj).reduce((acc, key) => {
    if (keysToOmit.indexOf(key) === -1)
      acc[key] = obj[key];
    return acc;
  }, {});
}
function typeToIcon(type) {
  switch (type) {
    case "is-info":
      return "info-circle";
    case "is-success":
      return "check-circle";
    case "is-warning":
      return "exclamation-triangle";
    case "is-danger":
      return "exclamation-circle";
    default:
      return null;
  }
}
function getEventsAction(component) {
  return (node) => {
    const events = Object.keys(component.$$.callbacks);
    const listeners = [];
    events.forEach((event) => listeners.push(listen(node, event, (e) => bubble(component, e))));
    return {
      destroy: () => {
        listeners.forEach((listener) => listener());
      }
    };
  };
}

// node_modules/svelma/src/components/Button.svelte
var { Error: Error_1 } = globals;
var file2 = "node_modules/svelma/src/components/Button.svelte";
function create_if_block_3(ctx) {
  let a;
  let t0;
  let span;
  let t1;
  let current;
  let mounted;
  let dispose;
  let if_block0 = ctx[7] && create_if_block_5(ctx);
  const default_slot_template = ctx[15].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[14], null);
  let if_block1 = ctx[8] && create_if_block_4(ctx);
  let a_levels = [{ href: ctx[1] }, ctx[11]];
  let a_data = {};
  for (let i = 0; i < a_levels.length; i += 1) {
    a_data = assign(a_data, a_levels[i]);
  }
  const block = {
    c: function create4() {
      a = element("a");
      if (if_block0)
        if_block0.c();
      t0 = space();
      span = element("span");
      if (default_slot)
        default_slot.c();
      t1 = space();
      if (if_block1)
        if_block1.c();
      add_location(span, file2, 96, 4, 2314);
      set_attributes(a, a_data);
      toggle_class(a, "is-inverted", ctx[4]);
      toggle_class(a, "is-loading", ctx[3]);
      toggle_class(a, "is-outlined", ctx[5]);
      toggle_class(a, "is-rounded", ctx[6]);
      add_location(a, file2, 85, 2, 2047);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      if (if_block0)
        if_block0.m(a, null);
      append_dev(a, t0);
      append_dev(a, span);
      if (default_slot) {
        default_slot.m(span, null);
      }
      append_dev(a, t1);
      if (if_block1)
        if_block1.m(a, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(a, "click", ctx[17], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (ctx2[7]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 128) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_5(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(a, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 16384)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[14], !current ? get_all_dirty_from_scope(ctx2[14]) : get_slot_changes(default_slot_template, ctx2[14], dirty, null), null);
        }
      }
      if (ctx2[8]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 256) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_4(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(a, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      set_attributes(a, a_data = get_spread_update(a_levels, [
        (!current || dirty & 2) && { href: ctx2[1] },
        dirty & 2048 && ctx2[11]
      ]));
      toggle_class(a, "is-inverted", ctx2[4]);
      toggle_class(a, "is-loading", ctx2[3]);
      toggle_class(a, "is-outlined", ctx2[5]);
      toggle_class(a, "is-rounded", ctx2[6]);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(default_slot, local);
      transition_in(if_block1);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(default_slot, local);
      transition_out(if_block1);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      if (if_block0)
        if_block0.d();
      if (default_slot)
        default_slot.d(detaching);
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_3.name,
    type: "if",
    source: "(85:22) ",
    ctx
  });
  return block;
}
function create_if_block(ctx) {
  let button;
  let t0;
  let span;
  let t1;
  let current;
  let mounted;
  let dispose;
  let if_block0 = ctx[7] && create_if_block_2(ctx);
  const default_slot_template = ctx[15].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[14], null);
  let if_block1 = ctx[8] && create_if_block_1(ctx);
  let button_levels = [ctx[11], { type: ctx[2] }];
  let button_data = {};
  for (let i = 0; i < button_levels.length; i += 1) {
    button_data = assign(button_data, button_levels[i]);
  }
  const block = {
    c: function create4() {
      button = element("button");
      if (if_block0)
        if_block0.c();
      t0 = space();
      span = element("span");
      if (default_slot)
        default_slot.c();
      t1 = space();
      if (if_block1)
        if_block1.c();
      add_location(span, file2, 77, 4, 1882);
      set_attributes(button, button_data);
      toggle_class(button, "is-inverted", ctx[4]);
      toggle_class(button, "is-loading", ctx[3]);
      toggle_class(button, "is-outlined", ctx[5]);
      toggle_class(button, "is-rounded", ctx[6]);
      add_location(button, file2, 66, 2, 1599);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      if (if_block0)
        if_block0.m(button, null);
      append_dev(button, t0);
      append_dev(button, span);
      if (default_slot) {
        default_slot.m(span, null);
      }
      append_dev(button, t1);
      if (if_block1)
        if_block1.m(button, null);
      if (button.autofocus)
        button.focus();
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[16], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (ctx2[7]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 128) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(button, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 16384)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[14], !current ? get_all_dirty_from_scope(ctx2[14]) : get_slot_changes(default_slot_template, ctx2[14], dirty, null), null);
        }
      }
      if (ctx2[8]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 256) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_1(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(button, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      set_attributes(button, button_data = get_spread_update(button_levels, [
        dirty & 2048 && ctx2[11],
        (!current || dirty & 4) && { type: ctx2[2] }
      ]));
      toggle_class(button, "is-inverted", ctx2[4]);
      toggle_class(button, "is-loading", ctx2[3]);
      toggle_class(button, "is-outlined", ctx2[5]);
      toggle_class(button, "is-rounded", ctx2[6]);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(default_slot, local);
      transition_in(if_block1);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(default_slot, local);
      transition_out(if_block1);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      if (if_block0)
        if_block0.d();
      if (default_slot)
        default_slot.d(detaching);
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block.name,
    type: "if",
    source: "(66:0) {#if tag === 'button'}",
    ctx
  });
  return block;
}
function create_if_block_5(ctx) {
  let icon;
  let current;
  icon = new Icon_default({
    props: {
      pack: ctx[9],
      icon: ctx[7],
      size: ctx[10]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(icon.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_changes = {};
      if (dirty & 512)
        icon_changes.pack = ctx2[9];
      if (dirty & 128)
        icon_changes.icon = ctx2[7];
      if (dirty & 1024)
        icon_changes.size = ctx2[10];
      icon.$set(icon_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_5.name,
    type: "if",
    source: "(94:4) {#if iconLeft}",
    ctx
  });
  return block;
}
function create_if_block_4(ctx) {
  let icon;
  let current;
  icon = new Icon_default({
    props: {
      pack: ctx[9],
      icon: ctx[8],
      size: ctx[10]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(icon.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_changes = {};
      if (dirty & 512)
        icon_changes.pack = ctx2[9];
      if (dirty & 256)
        icon_changes.icon = ctx2[8];
      if (dirty & 1024)
        icon_changes.size = ctx2[10];
      icon.$set(icon_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_4.name,
    type: "if",
    source: "(100:4) {#if iconRight}",
    ctx
  });
  return block;
}
function create_if_block_2(ctx) {
  let icon;
  let current;
  icon = new Icon_default({
    props: {
      pack: ctx[9],
      icon: ctx[7],
      size: ctx[10]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(icon.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_changes = {};
      if (dirty & 512)
        icon_changes.pack = ctx2[9];
      if (dirty & 128)
        icon_changes.icon = ctx2[7];
      if (dirty & 1024)
        icon_changes.size = ctx2[10];
      icon.$set(icon_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_2.name,
    type: "if",
    source: "(75:4) {#if iconLeft}",
    ctx
  });
  return block;
}
function create_if_block_1(ctx) {
  let icon;
  let current;
  icon = new Icon_default({
    props: {
      pack: ctx[9],
      icon: ctx[8],
      size: ctx[10]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(icon.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_changes = {};
      if (dirty & 512)
        icon_changes.pack = ctx2[9];
      if (dirty & 256)
        icon_changes.icon = ctx2[8];
      if (dirty & 1024)
        icon_changes.size = ctx2[10];
      icon.$set(icon_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_1.name,
    type: "if",
    source: "(81:4) {#if iconRight}",
    ctx
  });
  return block;
}
function create_fragment2(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block, create_if_block_3];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0] === "button")
      return 0;
    if (ctx2[0] === "a")
      return 1;
    return -1;
  }
  if (~(current_block_type_index = select_block_type(ctx, -1))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l: function claim(nodes) {
      throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(target, anchor);
      }
      insert_dev(target, if_block_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
        if (if_block) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        } else {
          if_block = null;
        }
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d(detaching);
      }
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment2.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance2($$self, $$props, $$invalidate) {
  let props;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Button", slots, ["default"]);
  let { tag = "button" } = $$props;
  let { type = "" } = $$props;
  let { size = "" } = $$props;
  let { href = "" } = $$props;
  let { nativeType = "button" } = $$props;
  let { loading = false } = $$props;
  let { inverted = false } = $$props;
  let { outlined = false } = $$props;
  let { rounded = false } = $$props;
  let { iconLeft = null } = $$props;
  let { iconRight = null } = $$props;
  let { iconPack = null } = $$props;
  let iconSize = "";
  onMount(() => {
    if (!["button", "a"].includes(tag))
      throw new Error(`'${tag}' cannot be used as a tag for a Bulma button`);
  });
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  function click_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$new_props) => {
    $$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    if ("tag" in $$new_props)
      $$invalidate(0, tag = $$new_props.tag);
    if ("type" in $$new_props)
      $$invalidate(12, type = $$new_props.type);
    if ("size" in $$new_props)
      $$invalidate(13, size = $$new_props.size);
    if ("href" in $$new_props)
      $$invalidate(1, href = $$new_props.href);
    if ("nativeType" in $$new_props)
      $$invalidate(2, nativeType = $$new_props.nativeType);
    if ("loading" in $$new_props)
      $$invalidate(3, loading = $$new_props.loading);
    if ("inverted" in $$new_props)
      $$invalidate(4, inverted = $$new_props.inverted);
    if ("outlined" in $$new_props)
      $$invalidate(5, outlined = $$new_props.outlined);
    if ("rounded" in $$new_props)
      $$invalidate(6, rounded = $$new_props.rounded);
    if ("iconLeft" in $$new_props)
      $$invalidate(7, iconLeft = $$new_props.iconLeft);
    if ("iconRight" in $$new_props)
      $$invalidate(8, iconRight = $$new_props.iconRight);
    if ("iconPack" in $$new_props)
      $$invalidate(9, iconPack = $$new_props.iconPack);
    if ("$$scope" in $$new_props)
      $$invalidate(14, $$scope = $$new_props.$$scope);
  };
  $$self.$capture_state = () => ({
    onMount,
    Icon: Icon_default,
    omit,
    tag,
    type,
    size,
    href,
    nativeType,
    loading,
    inverted,
    outlined,
    rounded,
    iconLeft,
    iconRight,
    iconPack,
    iconSize,
    props
  });
  $$self.$inject_state = ($$new_props) => {
    $$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    if ("tag" in $$props)
      $$invalidate(0, tag = $$new_props.tag);
    if ("type" in $$props)
      $$invalidate(12, type = $$new_props.type);
    if ("size" in $$props)
      $$invalidate(13, size = $$new_props.size);
    if ("href" in $$props)
      $$invalidate(1, href = $$new_props.href);
    if ("nativeType" in $$props)
      $$invalidate(2, nativeType = $$new_props.nativeType);
    if ("loading" in $$props)
      $$invalidate(3, loading = $$new_props.loading);
    if ("inverted" in $$props)
      $$invalidate(4, inverted = $$new_props.inverted);
    if ("outlined" in $$props)
      $$invalidate(5, outlined = $$new_props.outlined);
    if ("rounded" in $$props)
      $$invalidate(6, rounded = $$new_props.rounded);
    if ("iconLeft" in $$props)
      $$invalidate(7, iconLeft = $$new_props.iconLeft);
    if ("iconRight" in $$props)
      $$invalidate(8, iconRight = $$new_props.iconRight);
    if ("iconPack" in $$props)
      $$invalidate(9, iconPack = $$new_props.iconPack);
    if ("iconSize" in $$props)
      $$invalidate(10, iconSize = $$new_props.iconSize);
    if ("props" in $$props)
      $$invalidate(11, props = $$new_props.props);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    $:
      $$invalidate(11, props = {
        ...omit($$props, "loading", "inverted", "nativeType", "outlined", "rounded", "type"),
        class: `button ${type} ${size} ${$$props.class || ""}`
      });
    if ($$self.$$.dirty & 8192) {
      $: {
        if (!size || size === "is-medium") {
          $$invalidate(10, iconSize = "is-small");
        } else if (size === "is-large") {
          $$invalidate(10, iconSize = "is-medium");
        } else {
          $$invalidate(10, iconSize = size);
        }
      }
    }
  };
  $$props = exclude_internal_props($$props);
  return [
    tag,
    href,
    nativeType,
    loading,
    inverted,
    outlined,
    rounded,
    iconLeft,
    iconRight,
    iconPack,
    iconSize,
    props,
    type,
    size,
    $$scope,
    slots,
    click_handler,
    click_handler_1
  ];
}
var Button = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance2, create_fragment2, safe_not_equal, {
      tag: 0,
      type: 12,
      size: 13,
      href: 1,
      nativeType: 2,
      loading: 3,
      inverted: 4,
      outlined: 5,
      rounded: 6,
      iconLeft: 7,
      iconRight: 8,
      iconPack: 9
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Button",
      options,
      id: create_fragment2.name
    });
  }
  get tag() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set tag(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get type() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get href() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set href(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get nativeType() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set nativeType(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get loading() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set loading(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get inverted() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set inverted(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get outlined() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set outlined(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get rounded() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set rounded(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get iconLeft() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set iconLeft(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get iconRight() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set iconRight(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get iconPack() {
    throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set iconPack(value) {
    throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Button_default = Button;

// node_modules/svelma/src/components/Dialog/Dialog.svelte
var file3 = "node_modules/svelma/src/components/Dialog/Dialog.svelte";
function create_if_block2(ctx) {
  let div4;
  let div0;
  let t0;
  let div3;
  let t1;
  let section;
  let div2;
  let t2;
  let div1;
  let p;
  let t3;
  let t4;
  let footer;
  let t5;
  let button;
  let t6;
  let button_class_value;
  let div3_transition;
  let div4_class_value;
  let current;
  let mounted;
  let dispose;
  let if_block0 = ctx[2] && create_if_block_42(ctx);
  let if_block1 = ctx[6] && create_if_block_32(ctx);
  let if_block2 = ctx[8] && create_if_block_22(ctx);
  let if_block3 = ctx[9] && create_if_block_12(ctx);
  const block = {
    c: function create4() {
      div4 = element("div");
      div0 = element("div");
      t0 = space();
      div3 = element("div");
      if (if_block0)
        if_block0.c();
      t1 = space();
      section = element("section");
      div2 = element("div");
      if (if_block1)
        if_block1.c();
      t2 = space();
      div1 = element("div");
      p = element("p");
      t3 = space();
      if (if_block2)
        if_block2.c();
      t4 = space();
      footer = element("footer");
      if (if_block3)
        if_block3.c();
      t5 = space();
      button = element("button");
      t6 = text(ctx[4]);
      attr_dev(div0, "class", "modal-background");
      add_location(div0, file3, 207, 4, 4884);
      add_location(p, file3, 226, 12, 5659);
      attr_dev(div1, "class", "media-content");
      add_location(div1, file3, 225, 10, 5619);
      attr_dev(div2, "class", "media");
      add_location(div2, file3, 219, 8, 5422);
      attr_dev(section, "class", "modal-card-body svelte-1fsuju2");
      toggle_class(section, "is-titleless", !ctx[2]);
      toggle_class(section, "is-flex", ctx[6]);
      add_location(section, file3, 218, 6, 5331);
      attr_dev(button, "class", button_class_value = "button " + ctx[11] + " svelte-1fsuju2");
      add_location(button, file3, 254, 8, 6464);
      attr_dev(footer, "class", "modal-card-foot svelte-1fsuju2");
      add_location(footer, file3, 245, 6, 6218);
      attr_dev(div3, "class", "modal-card svelte-1fsuju2");
      add_location(div3, file3, 208, 4, 4942);
      attr_dev(div4, "class", div4_class_value = "modal dialog " + ctx[10] + " is-active svelte-1fsuju2");
      add_location(div4, file3, 206, 2, 4818);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div4, anchor);
      append_dev(div4, div0);
      append_dev(div4, t0);
      append_dev(div4, div3);
      if (if_block0)
        if_block0.m(div3, null);
      append_dev(div3, t1);
      append_dev(div3, section);
      append_dev(section, div2);
      if (if_block1)
        if_block1.m(div2, null);
      append_dev(div2, t2);
      append_dev(div2, div1);
      append_dev(div1, p);
      p.innerHTML = ctx[3];
      append_dev(div1, t3);
      if (if_block2)
        if_block2.m(div1, null);
      append_dev(div3, t4);
      append_dev(div3, footer);
      if (if_block3)
        if_block3.m(footer, null);
      append_dev(footer, t5);
      append_dev(footer, button);
      append_dev(button, t6);
      ctx[32](button);
      ctx[33](div4);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(div0, "click", ctx[21], false, false, false),
          listen_dev(button, "click", ctx[22], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (ctx[2]) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_42(ctx);
          if_block0.c();
          if_block0.m(div3, t1);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx[6]) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
          if (dirty[0] & 64) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_32(ctx);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div2, t2);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (!current || dirty[0] & 8)
        p.innerHTML = ctx[3];
      ;
      if (ctx[8]) {
        if (if_block2) {
          if_block2.p(ctx, dirty);
        } else {
          if_block2 = create_if_block_22(ctx);
          if_block2.c();
          if_block2.m(div1, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty[0] & 4) {
        toggle_class(section, "is-titleless", !ctx[2]);
      }
      if (dirty[0] & 64) {
        toggle_class(section, "is-flex", ctx[6]);
      }
      if (ctx[9]) {
        if (if_block3) {
          if_block3.p(ctx, dirty);
        } else {
          if_block3 = create_if_block_12(ctx);
          if_block3.c();
          if_block3.m(footer, t5);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (!current || dirty[0] & 16)
        set_data_dev(t6, ctx[4]);
      if (!current || dirty[0] & 2048 && button_class_value !== (button_class_value = "button " + ctx[11] + " svelte-1fsuju2")) {
        attr_dev(button, "class", button_class_value);
      }
      if (!current || dirty[0] & 1024 && div4_class_value !== (div4_class_value = "modal dialog " + ctx[10] + " is-active svelte-1fsuju2")) {
        attr_dev(div4, "class", div4_class_value);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block1);
      add_render_callback(() => {
        if (!div3_transition)
          div3_transition = create_bidirectional_transition(div3, ctx[19], ctx[12], true);
        div3_transition.run(1);
      });
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block1);
      if (!div3_transition)
        div3_transition = create_bidirectional_transition(div3, ctx[19], ctx[12], false);
      div3_transition.run(0);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div4);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      ctx[32](null);
      if (detaching && div3_transition)
        div3_transition.end();
      ctx[33](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block2.name,
    type: "if",
    source: "(206:0) {#if active}",
    ctx
  });
  return block;
}
function create_if_block_42(ctx) {
  let header;
  let p;
  let t;
  const block = {
    c: function create4() {
      header = element("header");
      p = element("p");
      t = text(ctx[2]);
      attr_dev(p, "class", "modal-card-title");
      add_location(p, file3, 211, 10, 5070);
      attr_dev(header, "class", "modal-card-head svelte-1fsuju2");
      add_location(header, file3, 210, 8, 5027);
    },
    m: function mount(target, anchor) {
      insert_dev(target, header, anchor);
      append_dev(header, p);
      append_dev(p, t);
    },
    p: function update3(ctx2, dirty) {
      if (dirty[0] & 4)
        set_data_dev(t, ctx2[2]);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(header);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_42.name,
    type: "if",
    source: "(210:6) {#if title}",
    ctx
  });
  return block;
}
function create_if_block_32(ctx) {
  let div;
  let icon_1;
  let current;
  icon_1 = new Icon_default({
    props: {
      pack: ctx[7],
      icon: ctx[6],
      type: ctx[11],
      size: "is-large"
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      div = element("div");
      create_component(icon_1.$$.fragment);
      attr_dev(div, "class", "media-left");
      add_location(div, file3, 221, 12, 5475);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      mount_component(icon_1, div, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_1_changes = {};
      if (dirty[0] & 128)
        icon_1_changes.pack = ctx2[7];
      if (dirty[0] & 64)
        icon_1_changes.icon = ctx2[6];
      if (dirty[0] & 2048)
        icon_1_changes.type = ctx2[11];
      icon_1.$set(icon_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      destroy_component(icon_1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_32.name,
    type: "if",
    source: "(221:10) {#if icon}",
    ctx
  });
  return block;
}
function create_if_block_22(ctx) {
  let div1;
  let div0;
  let input_1;
  let t0;
  let p;
  let t1;
  let mounted;
  let dispose;
  let input_1_levels = [{ class: "input" }, ctx[18]];
  let input_1_data = {};
  for (let i = 0; i < input_1_levels.length; i += 1) {
    input_1_data = assign(input_1_data, input_1_levels[i]);
  }
  const block = {
    c: function create4() {
      div1 = element("div");
      div0 = element("div");
      input_1 = element("input");
      t0 = space();
      p = element("p");
      t1 = text(ctx[17]);
      set_attributes(input_1, input_1_data);
      toggle_class(input_1, "svelte-1fsuju2", true);
      add_location(input_1, file3, 231, 18, 5800);
      attr_dev(p, "class", "help is-danger");
      add_location(p, file3, 237, 18, 6050);
      attr_dev(div0, "class", "control");
      add_location(div0, file3, 230, 16, 5760);
      attr_dev(div1, "class", "field svelte-1fsuju2");
      add_location(div1, file3, 229, 14, 5724);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, div0);
      append_dev(div0, input_1);
      if (input_1.autofocus)
        input_1.focus();
      set_input_value(input_1, ctx[1]);
      ctx[29](input_1);
      append_dev(div0, t0);
      append_dev(div0, p);
      append_dev(p, t1);
      if (!mounted) {
        dispose = [
          listen_dev(input_1, "input", ctx[28]),
          listen_dev(input_1, "keyup", ctx[30], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
        { class: "input" },
        dirty[0] & 262144 && ctx2[18]
      ]));
      if (dirty[0] & 2 && input_1.value !== ctx2[1]) {
        set_input_value(input_1, ctx2[1]);
      }
      toggle_class(input_1, "svelte-1fsuju2", true);
      if (dirty[0] & 131072)
        set_data_dev(t1, ctx2[17]);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      ctx[29](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_22.name,
    type: "if",
    source: "(229:12) {#if hasInput}",
    ctx
  });
  return block;
}
function create_if_block_12(ctx) {
  let button;
  let t;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      button = element("button");
      t = text(ctx[5]);
      attr_dev(button, "class", "button svelte-1fsuju2");
      add_location(button, file3, 247, 10, 6286);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, t);
      ctx[31](button);
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[20], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty[0] & 32)
        set_data_dev(t, ctx2[5]);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      ctx[31](null);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_12.name,
    type: "if",
    source: "(247:8) {#if showCancel}",
    ctx
  });
  return block;
}
function create_fragment3(ctx) {
  let if_block_anchor;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[0] && create_if_block2(ctx);
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      current = true;
      if (!mounted) {
        dispose = listen_dev(window, "keydown", ctx[23], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block2(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment3.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance3($$self, $$props, $$invalidate) {
  let _animation;
  let newInputProps;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Dialog", slots, []);
  let { title = "" } = $$props;
  let { message } = $$props;
  let { confirmText = "OK" } = $$props;
  let { cancelText = "Cancel" } = $$props;
  let { focusOn = "confirm" } = $$props;
  let { icon = "" } = $$props;
  let { iconPack = "" } = $$props;
  let { hasInput = false } = $$props;
  let { prompt: prompt2 = null } = $$props;
  let { showCancel = false } = $$props;
  let { size = "" } = $$props;
  let { type = "is-primary" } = $$props;
  let { active: active2 = true } = $$props;
  let { animation = "scale" } = $$props;
  let { animProps = { start: 1.2 } } = $$props;
  let { inputProps = {} } = $$props;
  let resolve;
  let { appendToBody = true } = $$props;
  let modal;
  let cancelButton;
  let confirmButton;
  let input;
  let validationMessage = "";
  const dispatch2 = createEventDispatcher();
  onMount(async () => {
    await tick();
    if (hasInput) {
      input.focus();
    } else if (focusOn === "cancel" && showCancel) {
      cancelButton.focus();
    } else {
      confirmButton.focus();
    }
  });
  function cancel() {
    resolve(hasInput ? null : false);
    close();
  }
  function close() {
    resolve(hasInput ? null : false);
    $$invalidate(0, active2 = false);
    dispatch2("destroy");
  }
  async function confirm2() {
    if (input && !input.checkValidity()) {
      $$invalidate(17, validationMessage = input.validationMessage);
      await tick();
      input.select();
      return;
    }
    $$invalidate(17, validationMessage = "");
    resolve(hasInput ? prompt2 : true);
    close();
  }
  function keydown(e) {
    if (active2 && isEscKey(e)) {
      close();
    }
  }
  const writable_props = [
    "title",
    "message",
    "confirmText",
    "cancelText",
    "focusOn",
    "icon",
    "iconPack",
    "hasInput",
    "prompt",
    "showCancel",
    "size",
    "type",
    "active",
    "animation",
    "animProps",
    "inputProps",
    "appendToBody"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Dialog> was created with unknown prop '${key}'`);
  });
  function input_1_input_handler() {
    prompt2 = this.value;
    $$invalidate(1, prompt2);
  }
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(16, input);
    });
  }
  const keyup_handler = (e) => isEnterKey(e) && confirm2();
  function button_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      cancelButton = $$value;
      $$invalidate(14, cancelButton);
    });
  }
  function button_binding_1($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      confirmButton = $$value;
      $$invalidate(15, confirmButton);
    });
  }
  function div4_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      modal = $$value;
      $$invalidate(13, modal);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("title" in $$props2)
      $$invalidate(2, title = $$props2.title);
    if ("message" in $$props2)
      $$invalidate(3, message = $$props2.message);
    if ("confirmText" in $$props2)
      $$invalidate(4, confirmText = $$props2.confirmText);
    if ("cancelText" in $$props2)
      $$invalidate(5, cancelText = $$props2.cancelText);
    if ("focusOn" in $$props2)
      $$invalidate(24, focusOn = $$props2.focusOn);
    if ("icon" in $$props2)
      $$invalidate(6, icon = $$props2.icon);
    if ("iconPack" in $$props2)
      $$invalidate(7, iconPack = $$props2.iconPack);
    if ("hasInput" in $$props2)
      $$invalidate(8, hasInput = $$props2.hasInput);
    if ("prompt" in $$props2)
      $$invalidate(1, prompt2 = $$props2.prompt);
    if ("showCancel" in $$props2)
      $$invalidate(9, showCancel = $$props2.showCancel);
    if ("size" in $$props2)
      $$invalidate(10, size = $$props2.size);
    if ("type" in $$props2)
      $$invalidate(11, type = $$props2.type);
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("animation" in $$props2)
      $$invalidate(25, animation = $$props2.animation);
    if ("animProps" in $$props2)
      $$invalidate(12, animProps = $$props2.animProps);
    if ("inputProps" in $$props2)
      $$invalidate(26, inputProps = $$props2.inputProps);
    if ("appendToBody" in $$props2)
      $$invalidate(27, appendToBody = $$props2.appendToBody);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    onDestroy,
    onMount,
    tick,
    Icon: Icon_default,
    chooseAnimation,
    isEnterKey,
    isEscKey,
    title,
    message,
    confirmText,
    cancelText,
    focusOn,
    icon,
    iconPack,
    hasInput,
    prompt: prompt2,
    showCancel,
    size,
    type,
    active: active2,
    animation,
    animProps,
    inputProps,
    resolve,
    appendToBody,
    modal,
    cancelButton,
    confirmButton,
    input,
    validationMessage,
    dispatch: dispatch2,
    cancel,
    close,
    confirm: confirm2,
    keydown,
    newInputProps,
    _animation
  });
  $$self.$inject_state = ($$props2) => {
    if ("title" in $$props2)
      $$invalidate(2, title = $$props2.title);
    if ("message" in $$props2)
      $$invalidate(3, message = $$props2.message);
    if ("confirmText" in $$props2)
      $$invalidate(4, confirmText = $$props2.confirmText);
    if ("cancelText" in $$props2)
      $$invalidate(5, cancelText = $$props2.cancelText);
    if ("focusOn" in $$props2)
      $$invalidate(24, focusOn = $$props2.focusOn);
    if ("icon" in $$props2)
      $$invalidate(6, icon = $$props2.icon);
    if ("iconPack" in $$props2)
      $$invalidate(7, iconPack = $$props2.iconPack);
    if ("hasInput" in $$props2)
      $$invalidate(8, hasInput = $$props2.hasInput);
    if ("prompt" in $$props2)
      $$invalidate(1, prompt2 = $$props2.prompt);
    if ("showCancel" in $$props2)
      $$invalidate(9, showCancel = $$props2.showCancel);
    if ("size" in $$props2)
      $$invalidate(10, size = $$props2.size);
    if ("type" in $$props2)
      $$invalidate(11, type = $$props2.type);
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("animation" in $$props2)
      $$invalidate(25, animation = $$props2.animation);
    if ("animProps" in $$props2)
      $$invalidate(12, animProps = $$props2.animProps);
    if ("inputProps" in $$props2)
      $$invalidate(26, inputProps = $$props2.inputProps);
    if ("resolve" in $$props2)
      resolve = $$props2.resolve;
    if ("appendToBody" in $$props2)
      $$invalidate(27, appendToBody = $$props2.appendToBody);
    if ("modal" in $$props2)
      $$invalidate(13, modal = $$props2.modal);
    if ("cancelButton" in $$props2)
      $$invalidate(14, cancelButton = $$props2.cancelButton);
    if ("confirmButton" in $$props2)
      $$invalidate(15, confirmButton = $$props2.confirmButton);
    if ("input" in $$props2)
      $$invalidate(16, input = $$props2.input);
    if ("validationMessage" in $$props2)
      $$invalidate(17, validationMessage = $$props2.validationMessage);
    if ("newInputProps" in $$props2)
      $$invalidate(18, newInputProps = $$props2.newInputProps);
    if ("_animation" in $$props2)
      $$invalidate(19, _animation = $$props2._animation);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & 33554432) {
      $:
        $$invalidate(19, _animation = chooseAnimation(animation));
    }
    if ($$self.$$.dirty[0] & 134225921) {
      $: {
        if (modal && active2 && appendToBody) {
          modal.parentNode?.removeChild(modal);
          document.body.appendChild(modal);
        }
      }
    }
    if ($$self.$$.dirty[0] & 67108864) {
      $:
        $$invalidate(18, newInputProps = { required: true, ...inputProps });
    }
  };
  return [
    active2,
    prompt2,
    title,
    message,
    confirmText,
    cancelText,
    icon,
    iconPack,
    hasInput,
    showCancel,
    size,
    type,
    animProps,
    modal,
    cancelButton,
    confirmButton,
    input,
    validationMessage,
    newInputProps,
    _animation,
    cancel,
    close,
    confirm2,
    keydown,
    focusOn,
    animation,
    inputProps,
    appendToBody,
    input_1_input_handler,
    input_1_binding,
    keyup_handler,
    button_binding,
    button_binding_1,
    div4_binding
  ];
}
var Dialog = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance3, create_fragment3, safe_not_equal, {
      title: 2,
      message: 3,
      confirmText: 4,
      cancelText: 5,
      focusOn: 24,
      icon: 6,
      iconPack: 7,
      hasInput: 8,
      prompt: 1,
      showCancel: 9,
      size: 10,
      type: 11,
      active: 0,
      animation: 25,
      animProps: 12,
      inputProps: 26,
      appendToBody: 27
    }, null, [-1, -1]);
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Dialog",
      options,
      id: create_fragment3.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[3] === void 0 && !("message" in props)) {
      console.warn("<Dialog> was created without expected prop 'message'");
    }
  }
  get title() {
    return this.$$.ctx[2];
  }
  set title(title) {
    this.$$set({ title });
    flush();
  }
  get message() {
    return this.$$.ctx[3];
  }
  set message(message) {
    this.$$set({ message });
    flush();
  }
  get confirmText() {
    return this.$$.ctx[4];
  }
  set confirmText(confirmText) {
    this.$$set({ confirmText });
    flush();
  }
  get cancelText() {
    return this.$$.ctx[5];
  }
  set cancelText(cancelText) {
    this.$$set({ cancelText });
    flush();
  }
  get focusOn() {
    return this.$$.ctx[24];
  }
  set focusOn(focusOn) {
    this.$$set({ focusOn });
    flush();
  }
  get icon() {
    return this.$$.ctx[6];
  }
  set icon(icon) {
    this.$$set({ icon });
    flush();
  }
  get iconPack() {
    return this.$$.ctx[7];
  }
  set iconPack(iconPack) {
    this.$$set({ iconPack });
    flush();
  }
  get hasInput() {
    return this.$$.ctx[8];
  }
  set hasInput(hasInput) {
    this.$$set({ hasInput });
    flush();
  }
  get prompt() {
    return this.$$.ctx[1];
  }
  set prompt(prompt2) {
    this.$$set({ prompt: prompt2 });
    flush();
  }
  get showCancel() {
    return this.$$.ctx[9];
  }
  set showCancel(showCancel) {
    this.$$set({ showCancel });
    flush();
  }
  get size() {
    return this.$$.ctx[10];
  }
  set size(size) {
    this.$$set({ size });
    flush();
  }
  get type() {
    return this.$$.ctx[11];
  }
  set type(type) {
    this.$$set({ type });
    flush();
  }
  get active() {
    return this.$$.ctx[0];
  }
  set active(active2) {
    this.$$set({ active: active2 });
    flush();
  }
  get animation() {
    return this.$$.ctx[25];
  }
  set animation(animation) {
    this.$$set({ animation });
    flush();
  }
  get animProps() {
    return this.$$.ctx[12];
  }
  set animProps(animProps) {
    this.$$set({ animProps });
    flush();
  }
  get inputProps() {
    return this.$$.ctx[26];
  }
  set inputProps(inputProps) {
    this.$$set({ inputProps });
    flush();
  }
  get appendToBody() {
    return this.$$.ctx[27];
  }
  set appendToBody(appendToBody) {
    this.$$set({ appendToBody });
    flush();
  }
};
var Dialog_default = Dialog;

// node_modules/svelma/src/components/Dialog/index.js
function createDialog(props) {
  if (typeof props === "string")
    props = { message: props };
  const dialog = new Dialog_default({
    target: document.body,
    props,
    intro: true
  });
  dialog.$on("destroy", () => {
    dialog.$destroy();
  });
  return dialog.promise;
}
function alert(props) {
  return createDialog(props);
}
function confirm(props) {
  if (typeof props === "string")
    props = { message: props };
  return createDialog({ showCancel: true, ...props });
}
function prompt(props) {
  if (typeof props === "string")
    props = { message: props };
  return createDialog({ hasInput: true, confirmText: "Done", ...props });
}
Dialog_default.alert = alert;
Dialog_default.confirm = confirm;
Dialog_default.prompt = prompt;

// node_modules/svelma/src/components/Field.svelte
var file4 = "node_modules/svelma/src/components/Field.svelte";
var get_default_slot_changes = (dirty) => ({ statusType: dirty & 1 });
var get_default_slot_context = (ctx) => ({ statusType: ctx[0] });
function create_if_block_13(ctx) {
  let label_1;
  let t;
  const block = {
    c: function create4() {
      label_1 = element("label");
      t = text(ctx[1]);
      attr_dev(label_1, "for", ctx[2]);
      attr_dev(label_1, "class", "label");
      add_location(label_1, file4, 107, 4, 2643);
    },
    m: function mount(target, anchor) {
      insert_dev(target, label_1, anchor);
      append_dev(label_1, t);
      ctx[19](label_1);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 2)
        set_data_dev(t, ctx2[1]);
      if (dirty & 4) {
        attr_dev(label_1, "for", ctx2[2]);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(label_1);
      ctx[19](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_13.name,
    type: "if",
    source: "(107:2) {#if label}",
    ctx
  });
  return block;
}
function create_if_block3(ctx) {
  let p;
  let t;
  let p_class_value;
  const block = {
    c: function create4() {
      p = element("p");
      t = text(ctx[3]);
      attr_dev(p, "class", p_class_value = "help " + ctx[0] + " svelte-zc3i6x");
      add_location(p, file4, 111, 4, 2772);
    },
    m: function mount(target, anchor) {
      insert_dev(target, p, anchor);
      append_dev(p, t);
      ctx[20](p);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 8)
        set_data_dev(t, ctx2[3]);
      if (dirty & 1 && p_class_value !== (p_class_value = "help " + ctx2[0] + " svelte-zc3i6x")) {
        attr_dev(p, "class", p_class_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(p);
      ctx[20](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block3.name,
    type: "if",
    source: "(111:2) {#if message}",
    ctx
  });
  return block;
}
function create_fragment4(ctx) {
  let div;
  let t0;
  let t1;
  let div_class_value;
  let current;
  let if_block0 = ctx[1] && create_if_block_13(ctx);
  const default_slot_template = ctx[18].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[17], get_default_slot_context);
  let if_block1 = ctx[3] && create_if_block3(ctx);
  let div_levels = [
    ctx[11],
    {
      class: div_class_value = "field " + ctx[0] + " " + ctx[9] + " " + ctx[10] + " " + (ctx[12].class || "")
    }
  ];
  let div_data = {};
  for (let i = 0; i < div_levels.length; i += 1) {
    div_data = assign(div_data, div_levels[i]);
  }
  const block = {
    c: function create4() {
      div = element("div");
      if (if_block0)
        if_block0.c();
      t0 = space();
      if (default_slot)
        default_slot.c();
      t1 = space();
      if (if_block1)
        if_block1.c();
      set_attributes(div, div_data);
      toggle_class(div, "is-expanded", ctx[5]);
      toggle_class(div, "is-grouped-multiline", ctx[4]);
      toggle_class(div, "svelte-zc3i6x", true);
      add_location(div, file4, 105, 0, 2451);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      if (if_block0)
        if_block0.m(div, null);
      append_dev(div, t0);
      if (default_slot) {
        default_slot.m(div, null);
      }
      append_dev(div, t1);
      if (if_block1)
        if_block1.m(div, null);
      ctx[21](div);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[1]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_13(ctx2);
          if_block0.c();
          if_block0.m(div, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 131073)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[17], !current ? get_all_dirty_from_scope(ctx2[17]) : get_slot_changes(default_slot_template, ctx2[17], dirty, get_default_slot_changes), get_default_slot_context);
        }
      }
      if (ctx2[3]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block3(ctx2);
          if_block1.c();
          if_block1.m(div, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      set_attributes(div, div_data = get_spread_update(div_levels, [
        dirty & 2048 && ctx2[11],
        (!current || dirty & 5633 && div_class_value !== (div_class_value = "field " + ctx2[0] + " " + ctx2[9] + " " + ctx2[10] + " " + (ctx2[12].class || ""))) && { class: div_class_value }
      ]));
      toggle_class(div, "is-expanded", ctx2[5]);
      toggle_class(div, "is-grouped-multiline", ctx2[4]);
      toggle_class(div, "svelte-zc3i6x", true);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      if (if_block0)
        if_block0.d();
      if (default_slot)
        default_slot.d(detaching);
      if (if_block1)
        if_block1.d();
      ctx[21](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment4.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance4($$self, $$props, $$invalidate) {
  let props;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Field", slots, ["default"]);
  let { type = "" } = $$props;
  let { label = null } = $$props;
  let { labelFor = "" } = $$props;
  let { message = "" } = $$props;
  let { grouped = false } = $$props;
  let { groupMultiline = false } = $$props;
  let { position = "" } = $$props;
  let { addons = true } = $$props;
  let { expanded = false } = $$props;
  setContext("type", () => type);
  let el;
  let labelEl;
  let messageEl;
  let fieldType = "";
  let hasIcons = false;
  let iconType = "";
  let mounted = false;
  let newPosition = "";
  onMount(() => {
    $$invalidate(16, mounted = true);
  });
  function label_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      labelEl = $$value;
      $$invalidate(7, labelEl);
    });
  }
  function p_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      messageEl = $$value;
      $$invalidate(8, messageEl);
    });
  }
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      el = $$value;
      $$invalidate(6, el);
    });
  }
  $$self.$$set = ($$new_props) => {
    $$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    if ("type" in $$new_props)
      $$invalidate(0, type = $$new_props.type);
    if ("label" in $$new_props)
      $$invalidate(1, label = $$new_props.label);
    if ("labelFor" in $$new_props)
      $$invalidate(2, labelFor = $$new_props.labelFor);
    if ("message" in $$new_props)
      $$invalidate(3, message = $$new_props.message);
    if ("grouped" in $$new_props)
      $$invalidate(13, grouped = $$new_props.grouped);
    if ("groupMultiline" in $$new_props)
      $$invalidate(4, groupMultiline = $$new_props.groupMultiline);
    if ("position" in $$new_props)
      $$invalidate(14, position = $$new_props.position);
    if ("addons" in $$new_props)
      $$invalidate(15, addons = $$new_props.addons);
    if ("expanded" in $$new_props)
      $$invalidate(5, expanded = $$new_props.expanded);
    if ("$$scope" in $$new_props)
      $$invalidate(17, $$scope = $$new_props.$$scope);
  };
  $$self.$capture_state = () => ({
    onMount,
    setContext,
    omit,
    type,
    label,
    labelFor,
    message,
    grouped,
    groupMultiline,
    position,
    addons,
    expanded,
    el,
    labelEl,
    messageEl,
    fieldType,
    hasIcons,
    iconType,
    mounted,
    newPosition,
    props
  });
  $$self.$inject_state = ($$new_props) => {
    $$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    if ("type" in $$props)
      $$invalidate(0, type = $$new_props.type);
    if ("label" in $$props)
      $$invalidate(1, label = $$new_props.label);
    if ("labelFor" in $$props)
      $$invalidate(2, labelFor = $$new_props.labelFor);
    if ("message" in $$props)
      $$invalidate(3, message = $$new_props.message);
    if ("grouped" in $$props)
      $$invalidate(13, grouped = $$new_props.grouped);
    if ("groupMultiline" in $$props)
      $$invalidate(4, groupMultiline = $$new_props.groupMultiline);
    if ("position" in $$props)
      $$invalidate(14, position = $$new_props.position);
    if ("addons" in $$props)
      $$invalidate(15, addons = $$new_props.addons);
    if ("expanded" in $$props)
      $$invalidate(5, expanded = $$new_props.expanded);
    if ("el" in $$props)
      $$invalidate(6, el = $$new_props.el);
    if ("labelEl" in $$props)
      $$invalidate(7, labelEl = $$new_props.labelEl);
    if ("messageEl" in $$props)
      $$invalidate(8, messageEl = $$new_props.messageEl);
    if ("fieldType" in $$props)
      $$invalidate(9, fieldType = $$new_props.fieldType);
    if ("hasIcons" in $$props)
      hasIcons = $$new_props.hasIcons;
    if ("iconType" in $$props)
      iconType = $$new_props.iconType;
    if ("mounted" in $$props)
      $$invalidate(16, mounted = $$new_props.mounted);
    if ("newPosition" in $$props)
      $$invalidate(10, newPosition = $$new_props.newPosition);
    if ("props" in $$props)
      $$invalidate(11, props = $$new_props.props);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      $: {
        if (["is-danger", "is-success"].includes(type)) {
          iconType = type;
        }
      }
    }
    if ($$self.$$.dirty & 106944) {
      $: {
        if (grouped)
          $$invalidate(9, fieldType = "is-grouped");
        else if (mounted) {
          const childNodes = Array.prototype.filter.call(el.children, (c) => ![labelEl, messageEl].includes(c));
          if (childNodes.length > 1 && addons) {
            $$invalidate(9, fieldType = "has-addons");
          }
        }
      }
    }
    if ($$self.$$.dirty & 24576) {
      $: {
        if (position) {
          const pos = position.split("-");
          if (pos.length >= 1) {
            const prefix = grouped ? "is-grouped-" : "has-addons-";
            $$invalidate(10, newPosition = prefix + pos[1]);
          }
        }
      }
    }
    $:
      $$invalidate(11, props = {
        ...omit($$props, "addons", "class", "expanded", "grouped", "label", "labelFor", "position", "type")
      });
  };
  $$props = exclude_internal_props($$props);
  return [
    type,
    label,
    labelFor,
    message,
    groupMultiline,
    expanded,
    el,
    labelEl,
    messageEl,
    fieldType,
    newPosition,
    props,
    $$props,
    grouped,
    position,
    addons,
    mounted,
    $$scope,
    slots,
    label_1_binding,
    p_binding,
    div_binding
  ];
}
var Field = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance4, create_fragment4, safe_not_equal, {
      type: 0,
      label: 1,
      labelFor: 2,
      message: 3,
      grouped: 13,
      groupMultiline: 4,
      position: 14,
      addons: 15,
      expanded: 5
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Field",
      options,
      id: create_fragment4.name
    });
  }
  get type() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get label() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set label(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get labelFor() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set labelFor(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get message() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set message(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get grouped() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set grouped(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get groupMultiline() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set groupMultiline(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get position() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set position(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get addons() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set addons(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get expanded() {
    throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set expanded(value) {
    throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Field_default = Field;

// node_modules/svelma/src/components/Input.svelte
var file5 = "node_modules/svelma/src/components/Input.svelte";
function create_else_block(ctx) {
  let textarea;
  let textarea_class_value;
  let events_action;
  let mounted;
  let dispose;
  let textarea_levels = [
    ctx[20],
    { value: ctx[0] },
    {
      class: textarea_class_value = "textarea " + ctx[11] + " " + ctx[2]
    },
    { disabled: ctx[10] }
  ];
  let textarea_data = {};
  for (let i = 0; i < textarea_levels.length; i += 1) {
    textarea_data = assign(textarea_data, textarea_levels[i]);
  }
  const block = {
    c: function create4() {
      textarea = element("textarea");
      set_attributes(textarea, textarea_data);
      toggle_class(textarea, "svelte-1v5s752", true);
      add_location(textarea, file5, 156, 4, 3907);
    },
    m: function mount(target, anchor) {
      insert_dev(target, textarea, anchor);
      if (textarea.autofocus)
        textarea.focus();
      ctx[31](textarea);
      if (!mounted) {
        dispose = [
          action_destroyer(events_action = ctx[25].call(null, textarea)),
          listen_dev(textarea, "input", ctx[22], false, false, false),
          listen_dev(textarea, "focus", ctx[23], false, false, false),
          listen_dev(textarea, "blur", ctx[24], false, false, false),
          listen_dev(textarea, "change", ctx[29], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
        dirty[0] & 1048576 && ctx2[20],
        dirty[0] & 1 && { value: ctx2[0] },
        dirty[0] & 2052 && textarea_class_value !== (textarea_class_value = "textarea " + ctx2[11] + " " + ctx2[2]) && { class: textarea_class_value },
        dirty[0] & 1024 && { disabled: ctx2[10] }
      ]));
      toggle_class(textarea, "svelte-1v5s752", true);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(textarea);
      ctx[31](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block.name,
    type: "else",
    source: "(156:2) {:else}",
    ctx
  });
  return block;
}
function create_if_block_33(ctx) {
  let input_1;
  let input_1_class_value;
  let events_action;
  let mounted;
  let dispose;
  let input_1_levels = [
    ctx[20],
    { type: ctx[14] },
    { value: ctx[0] },
    {
      class: input_1_class_value = "input " + ctx[11] + " " + ctx[2] + " " + (ctx[26].class || "")
    },
    { disabled: ctx[10] }
  ];
  let input_1_data = {};
  for (let i = 0; i < input_1_levels.length; i += 1) {
    input_1_data = assign(input_1_data, input_1_levels[i]);
  }
  const block = {
    c: function create4() {
      input_1 = element("input");
      set_attributes(input_1, input_1_data);
      toggle_class(input_1, "svelte-1v5s752", true);
      add_location(input_1, file5, 143, 4, 3622);
    },
    m: function mount(target, anchor) {
      insert_dev(target, input_1, anchor);
      input_1.value = input_1_data.value;
      if (input_1.autofocus)
        input_1.focus();
      ctx[30](input_1);
      if (!mounted) {
        dispose = [
          action_destroyer(events_action = ctx[25].call(null, input_1)),
          listen_dev(input_1, "input", ctx[22], false, false, false),
          listen_dev(input_1, "focus", ctx[23], false, false, false),
          listen_dev(input_1, "blur", ctx[24], false, false, false),
          listen_dev(input_1, "change", ctx[28], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
        dirty[0] & 1048576 && ctx2[20],
        dirty[0] & 16384 && { type: ctx2[14] },
        dirty[0] & 1 && input_1.value !== ctx2[0] && { value: ctx2[0] },
        dirty[0] & 67110916 && input_1_class_value !== (input_1_class_value = "input " + ctx2[11] + " " + ctx2[2] + " " + (ctx2[26].class || "")) && { class: input_1_class_value },
        dirty[0] & 1024 && { disabled: ctx2[10] }
      ]));
      if ("value" in input_1_data) {
        input_1.value = input_1_data.value;
      }
      toggle_class(input_1, "svelte-1v5s752", true);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(input_1);
      ctx[30](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_33.name,
    type: "if",
    source: "(143:2) {#if type !== 'textarea'}",
    ctx
  });
  return block;
}
function create_if_block_23(ctx) {
  let icon_1;
  let current;
  icon_1 = new Icon_default({
    props: {
      pack: ctx[9],
      isLeft: true,
      icon: ctx[8]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(icon_1.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon_1, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_1_changes = {};
      if (dirty[0] & 512)
        icon_1_changes.pack = ctx2[9];
      if (dirty[0] & 256)
        icon_1_changes.icon = ctx2[8];
      icon_1.$set(icon_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon_1, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_23.name,
    type: "if",
    source: "(171:2) {#if icon}",
    ctx
  });
  return block;
}
function create_if_block_14(ctx) {
  let icon_1;
  let current;
  icon_1 = new Icon_default({
    props: {
      pack: "fas",
      isRight: true,
      isClickable: ctx[4],
      icon: ctx[4] ? ctx[17] : ctx[15],
      type: !ctx[4] ? ctx[11] : "is-primary"
    },
    $$inline: true
  });
  icon_1.$on("click", ctx[21]);
  const block = {
    c: function create4() {
      create_component(icon_1.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon_1, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_1_changes = {};
      if (dirty[0] & 16)
        icon_1_changes.isClickable = ctx2[4];
      if (dirty[0] & 163856)
        icon_1_changes.icon = ctx2[4] ? ctx2[17] : ctx2[15];
      if (dirty[0] & 2064)
        icon_1_changes.type = !ctx2[4] ? ctx2[11] : "is-primary";
      icon_1.$set(icon_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon_1, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_14.name,
    type: "if",
    source: "(178:2) {#if !loading && (passwordReveal || statusType)}",
    ctx
  });
  return block;
}
function create_if_block4(ctx) {
  let small;
  let t0;
  let t1;
  let t2;
  const block = {
    c: function create4() {
      small = element("small");
      t0 = text(ctx[16]);
      t1 = text(" / ");
      t2 = text(ctx[5]);
      attr_dev(small, "class", "help counter svelte-1v5s752");
      toggle_class(small, "is-invisible", !ctx[13]);
      add_location(small, file5, 190, 4, 4664);
    },
    m: function mount(target, anchor) {
      insert_dev(target, small, anchor);
      append_dev(small, t0);
      append_dev(small, t1);
      append_dev(small, t2);
    },
    p: function update3(ctx2, dirty) {
      if (dirty[0] & 65536)
        set_data_dev(t0, ctx2[16]);
      if (dirty[0] & 32)
        set_data_dev(t2, ctx2[5]);
      if (dirty[0] & 8192) {
        toggle_class(small, "is-invisible", !ctx2[13]);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(small);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block4.name,
    type: "if",
    source: "(190:2) {#if maxlength && hasCounter && type !== 'number'}",
    ctx
  });
  return block;
}
function create_fragment5(ctx) {
  let div;
  let t0;
  let t1;
  let t2;
  let current;
  function select_block_type(ctx2, dirty) {
    if (ctx2[1] !== "textarea")
      return create_if_block_33;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx, [-1, -1]);
  let if_block0 = current_block_type(ctx);
  let if_block1 = ctx[8] && create_if_block_23(ctx);
  let if_block2 = !ctx[7] && (ctx[4] || ctx[11]) && create_if_block_14(ctx);
  let if_block3 = ctx[5] && ctx[6] && ctx[1] !== "number" && create_if_block4(ctx);
  const block = {
    c: function create4() {
      div = element("div");
      if_block0.c();
      t0 = space();
      if (if_block1)
        if_block1.c();
      t1 = space();
      if (if_block2)
        if_block2.c();
      t2 = space();
      if (if_block3)
        if_block3.c();
      attr_dev(div, "class", "control svelte-1v5s752");
      toggle_class(div, "has-icons-left", ctx[19]);
      toggle_class(div, "has-icons-right", ctx[18]);
      toggle_class(div, "is-loading", ctx[7]);
      toggle_class(div, "is-expanded", ctx[3]);
      add_location(div, file5, 140, 0, 3439);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      if_block0.m(div, null);
      append_dev(div, t0);
      if (if_block1)
        if_block1.m(div, null);
      append_dev(div, t1);
      if (if_block2)
        if_block2.m(div, null);
      append_dev(div, t2);
      if (if_block3)
        if_block3.m(div, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div, t0);
        }
      }
      if (ctx2[8]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & 256) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_23(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div, t1);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (!ctx2[7] && (ctx2[4] || ctx2[11])) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & 2192) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_14(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div, t2);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (ctx2[5] && ctx2[6] && ctx2[1] !== "number") {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block4(ctx2);
          if_block3.c();
          if_block3.m(div, null);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (dirty[0] & 524288) {
        toggle_class(div, "has-icons-left", ctx2[19]);
      }
      if (dirty[0] & 262144) {
        toggle_class(div, "has-icons-right", ctx2[18]);
      }
      if (dirty[0] & 128) {
        toggle_class(div, "is-loading", ctx2[7]);
      }
      if (dirty[0] & 8) {
        toggle_class(div, "is-expanded", ctx2[3]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment5.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance5($$self, $$props, $$invalidate) {
  let props;
  let hasIconLeft;
  let hasIconRight;
  let passwordVisibleIcon;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Input", slots, []);
  let { value = "" } = $$props;
  let { type = "text" } = $$props;
  let { size = "" } = $$props;
  let { expanded = false } = $$props;
  let { passwordReveal = false } = $$props;
  let { maxlength = null } = $$props;
  let { hasCounter = true } = $$props;
  let { loading = false } = $$props;
  let { icon = "" } = $$props;
  let { iconPack = "" } = $$props;
  let { disabled = false } = $$props;
  let input;
  let isFocused;
  let isPasswordVisible = false;
  let newType = "text";
  let statusType = "";
  let statusTypeIcon = "";
  let valueLength = null;
  const dispatch2 = createEventDispatcher();
  const getType = getContext("type");
  if (getType)
    statusType = getType() || "";
  onMount(() => {
    $$invalidate(14, newType = type);
  });
  async function togglePasswordVisibility() {
    $$invalidate(27, isPasswordVisible = !isPasswordVisible);
    $$invalidate(14, newType = isPasswordVisible ? "text" : "password");
    await tick();
    input.focus();
  }
  const onInput = (e) => {
    $$invalidate(0, value = e.target.value);
    $$invalidate(26, $$props.value = value, $$props);
    dispatch2("input", e);
  };
  const onFocus = () => $$invalidate(13, isFocused = true);
  const onBlur = () => $$invalidate(13, isFocused = false);
  const events = getEventsAction(current_component);
  function change_handler(event) {
    bubble.call(this, $$self, event);
  }
  function change_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(12, input);
    });
  }
  function textarea_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(12, input);
    });
  }
  $$self.$$set = ($$new_props) => {
    $$invalidate(26, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    if ("value" in $$new_props)
      $$invalidate(0, value = $$new_props.value);
    if ("type" in $$new_props)
      $$invalidate(1, type = $$new_props.type);
    if ("size" in $$new_props)
      $$invalidate(2, size = $$new_props.size);
    if ("expanded" in $$new_props)
      $$invalidate(3, expanded = $$new_props.expanded);
    if ("passwordReveal" in $$new_props)
      $$invalidate(4, passwordReveal = $$new_props.passwordReveal);
    if ("maxlength" in $$new_props)
      $$invalidate(5, maxlength = $$new_props.maxlength);
    if ("hasCounter" in $$new_props)
      $$invalidate(6, hasCounter = $$new_props.hasCounter);
    if ("loading" in $$new_props)
      $$invalidate(7, loading = $$new_props.loading);
    if ("icon" in $$new_props)
      $$invalidate(8, icon = $$new_props.icon);
    if ("iconPack" in $$new_props)
      $$invalidate(9, iconPack = $$new_props.iconPack);
    if ("disabled" in $$new_props)
      $$invalidate(10, disabled = $$new_props.disabled);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    onMount,
    getContext,
    tick,
    omit,
    getEventsAction,
    current_component,
    Icon: Icon_default,
    value,
    type,
    size,
    expanded,
    passwordReveal,
    maxlength,
    hasCounter,
    loading,
    icon,
    iconPack,
    disabled,
    input,
    isFocused,
    isPasswordVisible,
    newType,
    statusType,
    statusTypeIcon,
    valueLength,
    dispatch: dispatch2,
    getType,
    togglePasswordVisibility,
    onInput,
    onFocus,
    onBlur,
    events,
    passwordVisibleIcon,
    hasIconRight,
    hasIconLeft,
    props
  });
  $$self.$inject_state = ($$new_props) => {
    $$invalidate(26, $$props = assign(assign({}, $$props), $$new_props));
    if ("value" in $$props)
      $$invalidate(0, value = $$new_props.value);
    if ("type" in $$props)
      $$invalidate(1, type = $$new_props.type);
    if ("size" in $$props)
      $$invalidate(2, size = $$new_props.size);
    if ("expanded" in $$props)
      $$invalidate(3, expanded = $$new_props.expanded);
    if ("passwordReveal" in $$props)
      $$invalidate(4, passwordReveal = $$new_props.passwordReveal);
    if ("maxlength" in $$props)
      $$invalidate(5, maxlength = $$new_props.maxlength);
    if ("hasCounter" in $$props)
      $$invalidate(6, hasCounter = $$new_props.hasCounter);
    if ("loading" in $$props)
      $$invalidate(7, loading = $$new_props.loading);
    if ("icon" in $$props)
      $$invalidate(8, icon = $$new_props.icon);
    if ("iconPack" in $$props)
      $$invalidate(9, iconPack = $$new_props.iconPack);
    if ("disabled" in $$props)
      $$invalidate(10, disabled = $$new_props.disabled);
    if ("input" in $$props)
      $$invalidate(12, input = $$new_props.input);
    if ("isFocused" in $$props)
      $$invalidate(13, isFocused = $$new_props.isFocused);
    if ("isPasswordVisible" in $$props)
      $$invalidate(27, isPasswordVisible = $$new_props.isPasswordVisible);
    if ("newType" in $$props)
      $$invalidate(14, newType = $$new_props.newType);
    if ("statusType" in $$props)
      $$invalidate(11, statusType = $$new_props.statusType);
    if ("statusTypeIcon" in $$props)
      $$invalidate(15, statusTypeIcon = $$new_props.statusTypeIcon);
    if ("valueLength" in $$props)
      $$invalidate(16, valueLength = $$new_props.valueLength);
    if ("passwordVisibleIcon" in $$props)
      $$invalidate(17, passwordVisibleIcon = $$new_props.passwordVisibleIcon);
    if ("hasIconRight" in $$props)
      $$invalidate(18, hasIconRight = $$new_props.hasIconRight);
    if ("hasIconLeft" in $$props)
      $$invalidate(19, hasIconLeft = $$new_props.hasIconLeft);
    if ("props" in $$props)
      $$invalidate(20, props = $$new_props.props);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    $:
      $$invalidate(20, props = {
        ...omit($$props, "class", "value", "type", "size", "passwordReveal", "hasCounter", "loading", "disabled")
      });
    if ($$self.$$.dirty[0] & 256) {
      $:
        $$invalidate(19, hasIconLeft = !!icon);
    }
    if ($$self.$$.dirty[0] & 2192) {
      $:
        $$invalidate(18, hasIconRight = passwordReveal || loading || statusType);
    }
    if ($$self.$$.dirty[0] & 134217728) {
      $:
        $$invalidate(17, passwordVisibleIcon = isPasswordVisible ? "eye-slash" : "eye");
    }
    if ($$self.$$.dirty[0] & 2048) {
      $: {
        switch (statusType) {
          case "is-success":
            $$invalidate(15, statusTypeIcon = "check");
            break;
          case "is-danger":
            $$invalidate(15, statusTypeIcon = "exclamation-circle");
            break;
          case "is-info":
            $$invalidate(15, statusTypeIcon = "info-circle");
            break;
          case "is-warning":
            $$invalidate(15, statusTypeIcon = "exclamation-triangle");
            break;
        }
      }
    }
    if ($$self.$$.dirty[0] & 1) {
      $: {
        if (typeof value === "string") {
          $$invalidate(16, valueLength = value.length);
        } else if (typeof value === "number") {
          $$invalidate(16, valueLength = value.toString().length);
        } else {
          $$invalidate(16, valueLength = 0);
        }
      }
    }
  };
  $$props = exclude_internal_props($$props);
  return [
    value,
    type,
    size,
    expanded,
    passwordReveal,
    maxlength,
    hasCounter,
    loading,
    icon,
    iconPack,
    disabled,
    statusType,
    input,
    isFocused,
    newType,
    statusTypeIcon,
    valueLength,
    passwordVisibleIcon,
    hasIconRight,
    hasIconLeft,
    props,
    togglePasswordVisibility,
    onInput,
    onFocus,
    onBlur,
    events,
    $$props,
    isPasswordVisible,
    change_handler,
    change_handler_1,
    input_1_binding,
    textarea_binding
  ];
}
var Input = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance5, create_fragment5, safe_not_equal, {
      value: 0,
      type: 1,
      size: 2,
      expanded: 3,
      passwordReveal: 4,
      maxlength: 5,
      hasCounter: 6,
      loading: 7,
      icon: 8,
      iconPack: 9,
      disabled: 10
    }, null, [-1, -1]);
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Input",
      options,
      id: create_fragment5.name
    });
  }
  get value() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set value(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get type() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get expanded() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set expanded(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get passwordReveal() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set passwordReveal(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get maxlength() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set maxlength(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get hasCounter() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set hasCounter(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get loading() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set loading(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get icon() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set icon(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get iconPack() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set iconPack(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get disabled() {
    throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set disabled(value) {
    throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Input_default = Input;

// node_modules/svelma/src/components/Modal/Modal.svelte
var file6 = "node_modules/svelma/src/components/Modal/Modal.svelte";
function create_if_block5(ctx) {
  let button;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      button = element("button");
      attr_dev(button, "class", "modal-close is-large");
      attr_dev(button, "aria-label", "close");
      add_location(button, file6, 44, 4, 990);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[6], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block5.name,
    type: "if",
    source: "(44:2) {#if showClose}",
    ctx
  });
  return block;
}
function create_fragment6(ctx) {
  let div2;
  let div0;
  let t0;
  let div1;
  let div1_transition;
  let t1;
  let div2_class_value;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = ctx[11].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[10], null);
  let if_block = ctx[3] && create_if_block5(ctx);
  const block = {
    c: function create4() {
      div2 = element("div");
      div0 = element("div");
      t0 = space();
      div1 = element("div");
      if (default_slot)
        default_slot.c();
      t1 = space();
      if (if_block)
        if_block.c();
      attr_dev(div0, "class", "modal-background");
      add_location(div0, file6, 39, 2, 785);
      attr_dev(div1, "class", "modal-content");
      add_location(div1, file6, 40, 2, 841);
      attr_dev(div2, "class", div2_class_value = "modal " + ctx[2]);
      toggle_class(div2, "is-active", ctx[0]);
      add_location(div2, file6, 38, 0, 713);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div2, anchor);
      append_dev(div2, div0);
      append_dev(div2, t0);
      append_dev(div2, div1);
      if (default_slot) {
        default_slot.m(div1, null);
      }
      append_dev(div2, t1);
      if (if_block)
        if_block.m(div2, null);
      ctx[12](div2);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(window, "keydown", ctx[7], false, false, false),
          listen_dev(div0, "click", ctx[6], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, [dirty]) {
      ctx = new_ctx;
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 1024)) {
          update_slot_base(default_slot, default_slot_template, ctx, ctx[10], !current ? get_all_dirty_from_scope(ctx[10]) : get_slot_changes(default_slot_template, ctx[10], dirty, null), null);
        }
      }
      if (ctx[3]) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block5(ctx);
          if_block.c();
          if_block.m(div2, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (!current || dirty & 4 && div2_class_value !== (div2_class_value = "modal " + ctx[2])) {
        attr_dev(div2, "class", div2_class_value);
      }
      if (dirty & 5) {
        toggle_class(div2, "is-active", ctx[0]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      if (local) {
        add_render_callback(() => {
          if (!div1_transition)
            div1_transition = create_bidirectional_transition(div1, ctx[5], ctx[1], true);
          div1_transition.run(1);
        });
      }
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      if (local) {
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, ctx[5], ctx[1], false);
        div1_transition.run(0);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div2);
      if (default_slot)
        default_slot.d(detaching);
      if (detaching && div1_transition)
        div1_transition.end();
      if (if_block)
        if_block.d();
      ctx[12](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment6.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance6($$self, $$props, $$invalidate) {
  let _animation;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Modal", slots, ["default"]);
  let { active: active2 = true } = $$props;
  let { animation = "scale" } = $$props;
  let { animProps = { start: 1.2 } } = $$props;
  let { size = "" } = $$props;
  let { showClose = true } = $$props;
  let { onBody = true } = $$props;
  let modal;
  onMount(() => {
  });
  function close() {
    $$invalidate(0, active2 = false);
  }
  function keydown(e) {
    if (active2 && isEscKey(e)) {
      close();
    }
  }
  const writable_props = ["active", "animation", "animProps", "size", "showClose", "onBody"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Modal> was created with unknown prop '${key}'`);
  });
  function div2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      modal = $$value;
      $$invalidate(4, modal);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("animation" in $$props2)
      $$invalidate(8, animation = $$props2.animation);
    if ("animProps" in $$props2)
      $$invalidate(1, animProps = $$props2.animProps);
    if ("size" in $$props2)
      $$invalidate(2, size = $$props2.size);
    if ("showClose" in $$props2)
      $$invalidate(3, showClose = $$props2.showClose);
    if ("onBody" in $$props2)
      $$invalidate(9, onBody = $$props2.onBody);
    if ("$$scope" in $$props2)
      $$invalidate(10, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    onDestroy,
    onMount,
    chooseAnimation,
    isEscKey,
    active: active2,
    animation,
    animProps,
    size,
    showClose,
    onBody,
    modal,
    close,
    keydown,
    _animation
  });
  $$self.$inject_state = ($$props2) => {
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("animation" in $$props2)
      $$invalidate(8, animation = $$props2.animation);
    if ("animProps" in $$props2)
      $$invalidate(1, animProps = $$props2.animProps);
    if ("size" in $$props2)
      $$invalidate(2, size = $$props2.size);
    if ("showClose" in $$props2)
      $$invalidate(3, showClose = $$props2.showClose);
    if ("onBody" in $$props2)
      $$invalidate(9, onBody = $$props2.onBody);
    if ("modal" in $$props2)
      $$invalidate(4, modal = $$props2.modal);
    if ("_animation" in $$props2)
      $$invalidate(5, _animation = $$props2._animation);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 256) {
      $:
        $$invalidate(5, _animation = chooseAnimation(animation));
    }
    if ($$self.$$.dirty & 529) {
      $: {
        if (modal && active2 && onBody) {
          document.body.appendChild(modal);
        }
      }
    }
  };
  return [
    active2,
    animProps,
    size,
    showClose,
    modal,
    _animation,
    close,
    keydown,
    animation,
    onBody,
    $$scope,
    slots,
    div2_binding
  ];
}
var Modal = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance6, create_fragment6, safe_not_equal, {
      active: 0,
      animation: 8,
      animProps: 1,
      size: 2,
      showClose: 3,
      onBody: 9
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Modal",
      options,
      id: create_fragment6.name
    });
  }
  get active() {
    throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set active(value) {
    throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get animation() {
    throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set animation(value) {
    throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get animProps() {
    throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set animProps(value) {
    throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get showClose() {
    throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set showClose(value) {
    throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onBody() {
    throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onBody(value) {
    throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Modal_default = Modal;

// node_modules/svelma/src/components/Modal/ModalCard.svelte
var file7 = "node_modules/svelma/src/components/Modal/ModalCard.svelte";
function create_fragment7(ctx) {
  let div2;
  let div0;
  let t0;
  let div1;
  let header;
  let p;
  let t1;
  let t2;
  let button0;
  let t3;
  let section;
  let t4;
  let footer;
  let button1;
  let t6;
  let button2;
  let div1_transition;
  let div2_class_value;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = ctx[13].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[12], null);
  const block = {
    c: function create4() {
      div2 = element("div");
      div0 = element("div");
      t0 = space();
      div1 = element("div");
      header = element("header");
      p = element("p");
      t1 = text(ctx[1]);
      t2 = space();
      button0 = element("button");
      t3 = space();
      section = element("section");
      if (default_slot)
        default_slot.c();
      t4 = space();
      footer = element("footer");
      button1 = element("button");
      button1.textContent = "Save changes";
      t6 = space();
      button2 = element("button");
      button2.textContent = "Cancel";
      attr_dev(div0, "class", "modal-background");
      add_location(div0, file7, 48, 2, 969);
      attr_dev(p, "class", "modal-card-title");
      add_location(p, file7, 51, 6, 1133);
      attr_dev(button0, "class", "delete");
      attr_dev(button0, "aria-label", "close");
      add_location(button0, file7, 52, 6, 1179);
      attr_dev(header, "class", "modal-card-head");
      add_location(header, file7, 50, 4, 1094);
      attr_dev(section, "class", "modal-card-body");
      add_location(section, file7, 54, 4, 1259);
      attr_dev(button1, "class", "button is-success");
      add_location(button1, file7, 58, 6, 1366);
      attr_dev(button2, "class", "button");
      add_location(button2, file7, 59, 6, 1452);
      attr_dev(footer, "class", "modal-card-foot");
      add_location(footer, file7, 57, 4, 1327);
      attr_dev(div1, "class", "modal-card");
      add_location(div1, file7, 49, 2, 1025);
      attr_dev(div2, "class", div2_class_value = "modal " + ctx[3]);
      toggle_class(div2, "is-active", ctx[0]);
      add_location(div2, file7, 47, 0, 896);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div2, anchor);
      append_dev(div2, div0);
      append_dev(div2, t0);
      append_dev(div2, div1);
      append_dev(div1, header);
      append_dev(header, p);
      append_dev(p, t1);
      append_dev(header, t2);
      append_dev(header, button0);
      append_dev(div1, t3);
      append_dev(div1, section);
      if (default_slot) {
        default_slot.m(section, null);
      }
      append_dev(div1, t4);
      append_dev(div1, footer);
      append_dev(footer, button1);
      append_dev(footer, t6);
      append_dev(footer, button2);
      ctx[14](div2);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(window, "keydown", ctx[7], false, false, false),
          listen_dev(div0, "click", ctx[6], false, false, false),
          listen_dev(button0, "click", ctx[6], false, false, false),
          listen_dev(button1, "click", ctx[8], false, false, false),
          listen_dev(button2, "click", ctx[9], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, [dirty]) {
      ctx = new_ctx;
      if (!current || dirty & 2)
        set_data_dev(t1, ctx[1]);
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 4096)) {
          update_slot_base(default_slot, default_slot_template, ctx, ctx[12], !current ? get_all_dirty_from_scope(ctx[12]) : get_slot_changes(default_slot_template, ctx[12], dirty, null), null);
        }
      }
      if (!current || dirty & 8 && div2_class_value !== (div2_class_value = "modal " + ctx[3])) {
        attr_dev(div2, "class", div2_class_value);
      }
      if (dirty & 9) {
        toggle_class(div2, "is-active", ctx[0]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      if (local) {
        add_render_callback(() => {
          if (!div1_transition)
            div1_transition = create_bidirectional_transition(div1, ctx[5], ctx[2], true);
          div1_transition.run(1);
        });
      }
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      if (local) {
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, ctx[5], ctx[2], false);
        div1_transition.run(0);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div2);
      if (default_slot)
        default_slot.d(detaching);
      if (detaching && div1_transition)
        div1_transition.end();
      ctx[14](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment7.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance7($$self, $$props, $$invalidate) {
  let _animation;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("ModalCard", slots, ["default"]);
  let { active: active2 = true } = $$props;
  let { title = "Modal Title" } = $$props;
  let { animation = "scale" } = $$props;
  let { animProps = { start: 1.2 } } = $$props;
  let { size = "" } = $$props;
  let { onBody = true } = $$props;
  const dispatch2 = createEventDispatcher();
  let modal;
  onMount(() => {
  });
  function close() {
    $$invalidate(0, active2 = false);
  }
  function keydown(e) {
    if (active2 && isEscKey(e)) {
      close();
    }
  }
  function closeSuccess() {
    dispatch2("success");
    close();
  }
  function closeFailure() {
    dispatch2("failure");
    close();
  }
  const writable_props = ["active", "title", "animation", "animProps", "size", "onBody"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<ModalCard> was created with unknown prop '${key}'`);
  });
  function div2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      modal = $$value;
      $$invalidate(4, modal);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("title" in $$props2)
      $$invalidate(1, title = $$props2.title);
    if ("animation" in $$props2)
      $$invalidate(10, animation = $$props2.animation);
    if ("animProps" in $$props2)
      $$invalidate(2, animProps = $$props2.animProps);
    if ("size" in $$props2)
      $$invalidate(3, size = $$props2.size);
    if ("onBody" in $$props2)
      $$invalidate(11, onBody = $$props2.onBody);
    if ("$$scope" in $$props2)
      $$invalidate(12, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    onDestroy,
    onMount,
    createEventDispatcher,
    chooseAnimation,
    isEscKey,
    active: active2,
    title,
    animation,
    animProps,
    size,
    onBody,
    dispatch: dispatch2,
    modal,
    close,
    keydown,
    closeSuccess,
    closeFailure,
    _animation
  });
  $$self.$inject_state = ($$props2) => {
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("title" in $$props2)
      $$invalidate(1, title = $$props2.title);
    if ("animation" in $$props2)
      $$invalidate(10, animation = $$props2.animation);
    if ("animProps" in $$props2)
      $$invalidate(2, animProps = $$props2.animProps);
    if ("size" in $$props2)
      $$invalidate(3, size = $$props2.size);
    if ("onBody" in $$props2)
      $$invalidate(11, onBody = $$props2.onBody);
    if ("modal" in $$props2)
      $$invalidate(4, modal = $$props2.modal);
    if ("_animation" in $$props2)
      $$invalidate(5, _animation = $$props2._animation);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1024) {
      $:
        $$invalidate(5, _animation = chooseAnimation(animation));
    }
    if ($$self.$$.dirty & 2065) {
      $: {
        if (modal && active2 && onBody) {
          document.body.appendChild(modal);
        }
      }
    }
  };
  return [
    active2,
    title,
    animProps,
    size,
    modal,
    _animation,
    close,
    keydown,
    closeSuccess,
    closeFailure,
    animation,
    onBody,
    $$scope,
    slots,
    div2_binding
  ];
}
var ModalCard = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance7, create_fragment7, safe_not_equal, {
      active: 0,
      title: 1,
      animation: 10,
      animProps: 2,
      size: 3,
      onBody: 11
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "ModalCard",
      options,
      id: create_fragment7.name
    });
  }
  get active() {
    throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set active(value) {
    throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get title() {
    throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set title(value) {
    throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get animation() {
    throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set animation(value) {
    throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get animProps() {
    throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set animProps(value) {
    throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onBody() {
    throw new Error("<ModalCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onBody(value) {
    throw new Error("<ModalCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var ModalCard_default = ModalCard;

// node_modules/svelma/src/components/Modal/index.js
Modal_default.open = open;
ModalCard_default.open = open;
var Modal_default2 = Modal_default;
function open(props) {
  const modal = new Modal_default({
    target: document.body,
    props,
    intro: true
  });
  modal.close = () => modal.$destroy();
  return modal;
}

// node_modules/svelma/src/components/Notices.svelte
var file8 = "node_modules/svelma/src/components/Notices.svelte";
function create_fragment8(ctx) {
  let div;
  let div_class_value;
  const block = {
    c: function create4() {
      div = element("div");
      attr_dev(div, "class", div_class_value = "notices " + ctx[1] + " svelte-1mcog5q");
      add_location(div, file8, 42, 0, 863);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      ctx[4](div);
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 2 && div_class_value !== (div_class_value = "notices " + ctx2[1] + " svelte-1mcog5q")) {
        attr_dev(div, "class", div_class_value);
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      ctx[4](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment8.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
var notices = {};
function instance8($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Notices", slots, []);
  let { position = "top" } = $$props;
  let container;
  let positionClass;
  function insert2(el) {
    container.insertAdjacentElement("afterbegin", el);
  }
  const writable_props = ["position"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Notices> was created with unknown prop '${key}'`);
  });
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      container = $$value;
      $$invalidate(0, container);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("position" in $$props2)
      $$invalidate(2, position = $$props2.position);
  };
  $$self.$capture_state = () => ({
    notices,
    position,
    container,
    positionClass,
    insert: insert2
  });
  $$self.$inject_state = ($$props2) => {
    if ("position" in $$props2)
      $$invalidate(2, position = $$props2.position);
    if ("container" in $$props2)
      $$invalidate(0, container = $$props2.container);
    if ("positionClass" in $$props2)
      $$invalidate(1, positionClass = $$props2.positionClass);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 4) {
      $:
        $$invalidate(1, positionClass = position === "top" ? "is-top" : "is-bottom");
    }
  };
  return [container, positionClass, position, insert2, div_binding];
}
var Notices = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance8, create_fragment8, safe_not_equal, { position: 2, insert: 3 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Notices",
      options,
      id: create_fragment8.name
    });
  }
  get position() {
    throw new Error("<Notices>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set position(value) {
    throw new Error("<Notices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get insert() {
    return this.$$.ctx[3];
  }
  set insert(value) {
    throw new Error("<Notices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Notices_default = Notices;

// node_modules/svelma/src/components/Notice.svelte
var { Object: Object_1 } = globals;
var file9 = "node_modules/svelma/src/components/Notice.svelte";
function create_if_block6(ctx) {
  let div;
  let div_class_value;
  let div_aria_hidden_value;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = ctx[9].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[8], null);
  const block = {
    c: function create4() {
      div = element("div");
      if (default_slot)
        default_slot.c();
      attr_dev(div, "class", div_class_value = "notice " + ctx[1] + " svelte-1ik1n9x");
      attr_dev(div, "aria-hidden", div_aria_hidden_value = !ctx[0]);
      add_location(div, file9, 99, 2, 1933);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      if (default_slot) {
        default_slot.m(div, null);
      }
      ctx[10](div);
      current = true;
      if (!mounted) {
        dispose = listen_dev(div, "outroend", ctx[5], false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 256)) {
          update_slot_base(default_slot, default_slot_template, ctx, ctx[8], !current ? get_all_dirty_from_scope(ctx[8]) : get_slot_changes(default_slot_template, ctx[8], dirty, null), null);
        }
      }
      if (!current || dirty & 2 && div_class_value !== (div_class_value = "notice " + ctx[1] + " svelte-1ik1n9x")) {
        attr_dev(div, "class", div_class_value);
      }
      if (!current || dirty & 1 && div_aria_hidden_value !== (div_aria_hidden_value = !ctx[0])) {
        attr_dev(div, "aria-hidden", div_aria_hidden_value);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, { y: ctx[4] });
        div_intro.start();
      });
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fade, {
        duration: ctx[2] ? 400 : 0
      });
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      if (default_slot)
        default_slot.d(detaching);
      ctx[10](null);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block6.name,
    type: "if",
    source: "(99:0) {#if active}",
    ctx
  });
  return block;
}
function create_fragment9(ctx) {
  let if_block_anchor;
  let current;
  let if_block = ctx[0] && create_if_block6(ctx);
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block6(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment9.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
var allowedProps = ["active", "position", "duration"];
function filterProps(props) {
  const newProps = {};
  Object.keys(props).forEach((key) => {
    if (allowedProps.includes(key))
      newProps[key] = props[key];
  });
  return newProps;
}
function instance9($$self, $$props, $$invalidate) {
  let transitionY;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Notice", slots, ["default"]);
  const dispatch2 = createEventDispatcher();
  let { active: active2 = true } = $$props;
  let { position = "is-top" } = $$props;
  let { duration = 2e3 } = $$props;
  let { transitionOut = true } = $$props;
  let el;
  let parent;
  let timer;
  function close() {
    $$invalidate(0, active2 = false);
  }
  function remove() {
    clearTimeout(timer);
    $$invalidate(0, active2 = false);
    dispatch2("destroyed");
  }
  async function setupContainers() {
    await tick;
    if (!notices.top) {
      notices.top = new Notices_default({
        target: document.body,
        props: { position: "top" }
      });
    }
    if (!notices.bottom) {
      notices.bottom = new Notices_default({
        target: document.body,
        props: { position: "bottom" }
      });
    }
  }
  function chooseParent() {
    parent = notices.top;
    if (position && position.indexOf("is-bottom") === 0)
      parent = notices.bottom;
    parent.insert(el);
  }
  onMount(async () => {
    await setupContainers();
    chooseParent();
    timer = setTimeout(() => {
      close();
    }, duration);
  });
  const writable_props = ["active", "position", "duration", "transitionOut"];
  Object_1.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Notice> was created with unknown prop '${key}'`);
  });
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      el = $$value;
      $$invalidate(3, el);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("position" in $$props2)
      $$invalidate(1, position = $$props2.position);
    if ("duration" in $$props2)
      $$invalidate(6, duration = $$props2.duration);
    if ("transitionOut" in $$props2)
      $$invalidate(2, transitionOut = $$props2.transitionOut);
    if ("$$scope" in $$props2)
      $$invalidate(8, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    allowedProps,
    filterProps,
    createEventDispatcher,
    onDestroy,
    onMount,
    tick,
    fly,
    fade,
    Notices: Notices_default,
    notices,
    dispatch: dispatch2,
    active: active2,
    position,
    duration,
    transitionOut,
    el,
    parent,
    timer,
    close,
    remove,
    setupContainers,
    chooseParent,
    transitionY
  });
  $$self.$inject_state = ($$props2) => {
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("position" in $$props2)
      $$invalidate(1, position = $$props2.position);
    if ("duration" in $$props2)
      $$invalidate(6, duration = $$props2.duration);
    if ("transitionOut" in $$props2)
      $$invalidate(2, transitionOut = $$props2.transitionOut);
    if ("el" in $$props2)
      $$invalidate(3, el = $$props2.el);
    if ("parent" in $$props2)
      parent = $$props2.parent;
    if ("timer" in $$props2)
      timer = $$props2.timer;
    if ("transitionY" in $$props2)
      $$invalidate(4, transitionY = $$props2.transitionY);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 2) {
      $:
        $$invalidate(4, transitionY = ~position.indexOf("is-top") ? -200 : 200);
    }
  };
  return [
    active2,
    position,
    transitionOut,
    el,
    transitionY,
    remove,
    duration,
    close,
    $$scope,
    slots,
    div_binding
  ];
}
var Notice = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance9, create_fragment9, safe_not_equal, {
      active: 0,
      position: 1,
      duration: 6,
      transitionOut: 2,
      close: 7
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Notice",
      options,
      id: create_fragment9.name
    });
  }
  get active() {
    throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set active(value) {
    throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get position() {
    throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set position(value) {
    throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get duration() {
    throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set duration(value) {
    throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get transitionOut() {
    throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set transitionOut(value) {
    throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get close() {
    return this.$$.ctx[7];
  }
  set close(value) {
    throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Notice_default = Notice;

// node_modules/svelma/src/components/Notification/Notification.svelte
var file10 = "node_modules/svelma/src/components/Notification/Notification.svelte";
function create_if_block7(ctx) {
  let article;
  let t0;
  let div1;
  let t1;
  let div0;
  let article_class_value;
  let article_transition;
  let current;
  let if_block0 = ctx[2] && create_if_block_24(ctx);
  let if_block1 = ctx[3] && create_if_block_15(ctx);
  const default_slot_template = ctx[11].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[10], null);
  const block = {
    c: function create4() {
      article = element("article");
      if (if_block0)
        if_block0.c();
      t0 = space();
      div1 = element("div");
      if (if_block1)
        if_block1.c();
      t1 = space();
      div0 = element("div");
      if (default_slot)
        default_slot.c();
      attr_dev(div0, "class", "media-content");
      add_location(div0, file10, 102, 6, 2846);
      attr_dev(div1, "class", "media svelte-87qcq1");
      add_location(div1, file10, 96, 4, 2677);
      attr_dev(article, "class", article_class_value = "notification " + ctx[1] + " svelte-87qcq1");
      add_location(article, file10, 92, 2, 2506);
    },
    m: function mount(target, anchor) {
      insert_dev(target, article, anchor);
      if (if_block0)
        if_block0.m(article, null);
      append_dev(article, t0);
      append_dev(article, div1);
      if (if_block1)
        if_block1.m(div1, null);
      append_dev(div1, t1);
      append_dev(div1, div0);
      if (default_slot) {
        default_slot.m(div0, null);
      }
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (ctx2[2]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_24(ctx2);
          if_block0.c();
          if_block0.m(article, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[3]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 8) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_15(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, t1);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 1024)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[10], !current ? get_all_dirty_from_scope(ctx2[10]) : get_slot_changes(default_slot_template, ctx2[10], dirty, null), null);
        }
      }
      if (!current || dirty & 2 && article_class_value !== (article_class_value = "notification " + ctx2[1] + " svelte-87qcq1")) {
        attr_dev(article, "class", article_class_value);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block1);
      transition_in(default_slot, local);
      if (local) {
        add_render_callback(() => {
          if (!article_transition)
            article_transition = create_bidirectional_transition(article, fade, {}, true);
          article_transition.run(1);
        });
      }
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block1);
      transition_out(default_slot, local);
      if (local) {
        if (!article_transition)
          article_transition = create_bidirectional_transition(article, fade, {}, false);
        article_transition.run(0);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(article);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (default_slot)
        default_slot.d(detaching);
      if (detaching && article_transition)
        article_transition.end();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block7.name,
    type: "if",
    source: "(92:0) {#if active}",
    ctx
  });
  return block;
}
function create_if_block_24(ctx) {
  let button;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      button = element("button");
      attr_dev(button, "class", "delete");
      attr_dev(button, "aria-label", ctx[5]);
      add_location(button, file10, 94, 6, 2592);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[7], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 32) {
        attr_dev(button, "aria-label", ctx2[5]);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_24.name,
    type: "if",
    source: "(94:4) {#if showClose}",
    ctx
  });
  return block;
}
function create_if_block_15(ctx) {
  let div;
  let icon_1;
  let current;
  icon_1 = new Icon_default({
    props: {
      pack: ctx[4],
      icon: ctx[6],
      size: "is-large"
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      div = element("div");
      create_component(icon_1.$$.fragment);
      attr_dev(div, "class", "media-left");
      add_location(div, file10, 98, 8, 2722);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      mount_component(icon_1, div, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_1_changes = {};
      if (dirty & 16)
        icon_1_changes.pack = ctx2[4];
      if (dirty & 64)
        icon_1_changes.icon = ctx2[6];
      icon_1.$set(icon_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      destroy_component(icon_1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_15.name,
    type: "if",
    source: "(98:6) {#if icon}",
    ctx
  });
  return block;
}
function create_fragment10(ctx) {
  let if_block_anchor;
  let current;
  let if_block = ctx[0] && create_if_block7(ctx);
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block7(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment10.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance10($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Notification", slots, ["default"]);
  let { type = "" } = $$props;
  let { active: active2 = true } = $$props;
  let { showClose = true } = $$props;
  let { autoClose = false } = $$props;
  let { duration = 2e3 } = $$props;
  let { icon = "" } = $$props;
  let { iconPack = "" } = $$props;
  let { ariaCloseLabel = "" } = $$props;
  const dispatch2 = createEventDispatcher();
  let newIcon = "";
  let timer;
  function close() {
    $$invalidate(0, active2 = false);
    if (timer)
      clearTimeout(timer);
    dispatch2("close", active2);
  }
  const writable_props = [
    "type",
    "active",
    "showClose",
    "autoClose",
    "duration",
    "icon",
    "iconPack",
    "ariaCloseLabel"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Notification> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("type" in $$props2)
      $$invalidate(1, type = $$props2.type);
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("showClose" in $$props2)
      $$invalidate(2, showClose = $$props2.showClose);
    if ("autoClose" in $$props2)
      $$invalidate(8, autoClose = $$props2.autoClose);
    if ("duration" in $$props2)
      $$invalidate(9, duration = $$props2.duration);
    if ("icon" in $$props2)
      $$invalidate(3, icon = $$props2.icon);
    if ("iconPack" in $$props2)
      $$invalidate(4, iconPack = $$props2.iconPack);
    if ("ariaCloseLabel" in $$props2)
      $$invalidate(5, ariaCloseLabel = $$props2.ariaCloseLabel);
    if ("$$scope" in $$props2)
      $$invalidate(10, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    onDestroy,
    onMount,
    fly,
    fade,
    Icon: Icon_default,
    Notice: Notice_default,
    filterProps,
    typeToIcon,
    type,
    active: active2,
    showClose,
    autoClose,
    duration,
    icon,
    iconPack,
    ariaCloseLabel,
    dispatch: dispatch2,
    newIcon,
    timer,
    close
  });
  $$self.$inject_state = ($$props2) => {
    if ("type" in $$props2)
      $$invalidate(1, type = $$props2.type);
    if ("active" in $$props2)
      $$invalidate(0, active2 = $$props2.active);
    if ("showClose" in $$props2)
      $$invalidate(2, showClose = $$props2.showClose);
    if ("autoClose" in $$props2)
      $$invalidate(8, autoClose = $$props2.autoClose);
    if ("duration" in $$props2)
      $$invalidate(9, duration = $$props2.duration);
    if ("icon" in $$props2)
      $$invalidate(3, icon = $$props2.icon);
    if ("iconPack" in $$props2)
      $$invalidate(4, iconPack = $$props2.iconPack);
    if ("ariaCloseLabel" in $$props2)
      $$invalidate(5, ariaCloseLabel = $$props2.ariaCloseLabel);
    if ("newIcon" in $$props2)
      $$invalidate(6, newIcon = $$props2.newIcon);
    if ("timer" in $$props2)
      timer = $$props2.timer;
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 10) {
      $: {
        if (icon === true) {
          $$invalidate(6, newIcon = typeToIcon(type));
        } else {
          $$invalidate(6, newIcon = icon);
        }
      }
    }
    if ($$self.$$.dirty & 769) {
      $: {
        if (active2 && autoClose) {
          timer = setTimeout(() => {
            if (active2)
              close();
          }, duration);
        }
      }
    }
  };
  return [
    active2,
    type,
    showClose,
    icon,
    iconPack,
    ariaCloseLabel,
    newIcon,
    close,
    autoClose,
    duration,
    $$scope,
    slots
  ];
}
var Notification = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance10, create_fragment10, safe_not_equal, {
      type: 1,
      active: 0,
      showClose: 2,
      autoClose: 8,
      duration: 9,
      icon: 3,
      iconPack: 4,
      ariaCloseLabel: 5
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Notification",
      options,
      id: create_fragment10.name
    });
  }
  get type() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get active() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set active(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get showClose() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set showClose(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get autoClose() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set autoClose(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get duration() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set duration(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get icon() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set icon(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get iconPack() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set iconPack(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get ariaCloseLabel() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set ariaCloseLabel(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Notification_default = Notification;

// node_modules/svelma/src/components/Notification/NotificationNotice.svelte
function create_default_slot_1(ctx) {
  let html_tag;
  let html_anchor;
  const block = {
    c: function create4() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m: function mount(target, anchor) {
      html_tag.m(ctx[0], target, anchor);
      insert_dev(target, html_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1)
        html_tag.p(ctx2[0]);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(html_anchor);
      if (detaching)
        html_tag.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_1.name,
    type: "slot",
    source: "(34:2) <Notification {...notificationProps}>",
    ctx
  });
  return block;
}
function create_default_slot(ctx) {
  let notification;
  let current;
  const notification_spread_levels = [ctx[1]];
  let notification_props = {
    $$slots: { default: [create_default_slot_1] },
    $$scope: { ctx }
  };
  for (let i = 0; i < notification_spread_levels.length; i += 1) {
    notification_props = assign(notification_props, notification_spread_levels[i]);
  }
  notification = new Notification_default({
    props: notification_props,
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(notification.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(notification, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const notification_changes = dirty & 2 ? get_spread_update(notification_spread_levels, [get_spread_object(ctx2[1])]) : {};
      if (dirty & 129) {
        notification_changes.$$scope = { dirty, ctx: ctx2 };
      }
      notification.$set(notification_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(notification.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(notification.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(notification, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot.name,
    type: "slot",
    source: "(33:0) <Notice {...props} transitionOut={true}>",
    ctx
  });
  return block;
}
function create_fragment11(ctx) {
  let notice;
  let current;
  const notice_spread_levels = [ctx[2], { transitionOut: true }];
  let notice_props = {
    $$slots: { default: [create_default_slot] },
    $$scope: { ctx }
  };
  for (let i = 0; i < notice_spread_levels.length; i += 1) {
    notice_props = assign(notice_props, notice_spread_levels[i]);
  }
  notice = new Notice_default({ props: notice_props, $$inline: true });
  const block = {
    c: function create4() {
      create_component(notice.$$.fragment);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      mount_component(notice, target, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      const notice_changes = dirty & 4 ? get_spread_update(notice_spread_levels, [get_spread_object(ctx2[2]), notice_spread_levels[1]]) : {};
      if (dirty & 131) {
        notice_changes.$$scope = { dirty, ctx: ctx2 };
      }
      notice.$set(notice_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(notice.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(notice.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(notice, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment11.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance11($$self, $$props, $$invalidate) {
  let props;
  let notificationProps;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("NotificationNotice", slots, []);
  let { message } = $$props;
  let { duration = 2e3 } = $$props;
  let { position = "is-top-right" } = $$props;
  function removeNonNoficationProps(props2) {
    const newProps = {};
    const blacklist = ["duration", "message", "position"];
    Object.keys(props2).forEach((key) => {
      if (!blacklist.includes(key))
        newProps[key] = props2[key];
    });
    return newProps;
  }
  $$self.$$set = ($$new_props) => {
    $$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    if ("message" in $$new_props)
      $$invalidate(0, message = $$new_props.message);
    if ("duration" in $$new_props)
      $$invalidate(3, duration = $$new_props.duration);
    if ("position" in $$new_props)
      $$invalidate(4, position = $$new_props.position);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    onDestroy,
    onMount,
    fly,
    fade,
    Notice: Notice_default,
    filterProps,
    Notification: Notification_default,
    message,
    duration,
    position,
    removeNonNoficationProps,
    notificationProps,
    props
  });
  $$self.$inject_state = ($$new_props) => {
    $$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    if ("message" in $$props)
      $$invalidate(0, message = $$new_props.message);
    if ("duration" in $$props)
      $$invalidate(3, duration = $$new_props.duration);
    if ("position" in $$props)
      $$invalidate(4, position = $$new_props.position);
    if ("notificationProps" in $$props)
      $$invalidate(1, notificationProps = $$new_props.notificationProps);
    if ("props" in $$props)
      $$invalidate(2, props = $$new_props.props);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    $:
      $$invalidate(2, props = {
        ...filterProps($$props),
        duration,
        position
      });
    $:
      $$invalidate(1, notificationProps = { ...removeNonNoficationProps($$props) });
  };
  $$props = exclude_internal_props($$props);
  return [message, notificationProps, props, duration, position];
}
var NotificationNotice = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance11, create_fragment11, safe_not_equal, { message: 0, duration: 3, position: 4 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "NotificationNotice",
      options,
      id: create_fragment11.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("message" in props)) {
      console.warn("<NotificationNotice> was created without expected prop 'message'");
    }
  }
  get message() {
    throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set message(value) {
    throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get duration() {
    throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set duration(value) {
    throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get position() {
    throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set position(value) {
    throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var NotificationNotice_default = NotificationNotice;

// node_modules/svelma/src/components/Notification/index.js
Notification_default.create = create;
function create(props) {
  if (typeof props === "string")
    props = { message: props };
  const notification = new NotificationNotice_default({
    target: document.body,
    props,
    intro: true
  });
  notification.$on("destroyed", notification.$destroy);
  return notification;
}

// node_modules/svelma/src/components/Select.svelte
var file11 = "node_modules/svelma/src/components/Select.svelte";
function create_else_block2(ctx) {
  let select;
  let if_block_anchor;
  let select_disabled_value;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[2] && ctx[0] === "" && create_if_block_34(ctx);
  const default_slot_template = ctx[20].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[19], null);
  const block = {
    c: function create4() {
      select = element("select");
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      if (default_slot)
        default_slot.c();
      select.multiple = true;
      attr_dev(select, "size", ctx[5]);
      select.disabled = select_disabled_value = ctx[12] ? "disabled" : "";
      if (ctx[0] === void 0)
        add_render_callback(() => ctx[22].call(select));
      add_location(select, file11, 134, 12, 3615);
    },
    m: function mount(target, anchor) {
      insert_dev(target, select, anchor);
      if (if_block)
        if_block.m(select, null);
      append_dev(select, if_block_anchor);
      if (default_slot) {
        default_slot.m(select, null);
      }
      select_options(select, ctx[0]);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(select, "change", ctx[22]),
          listen_dev(select, "change", ctx[15], false, false, false),
          listen_dev(select, "blur", ctx[16], false, false, false),
          listen_dev(select, "hover", ctx[17], false, false, false),
          listen_dev(select, "focus", ctx[18], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (ctx2[2] && ctx2[0] === "") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_34(ctx2);
          if_block.c();
          if_block.m(select, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 524288)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[19], !current ? get_all_dirty_from_scope(ctx2[19]) : get_slot_changes(default_slot_template, ctx2[19], dirty, null), null);
        }
      }
      if (!current || dirty & 32) {
        attr_dev(select, "size", ctx2[5]);
      }
      if (!current || dirty & 4096 && select_disabled_value !== (select_disabled_value = ctx2[12] ? "disabled" : "")) {
        prop_dev(select, "disabled", select_disabled_value);
      }
      if (dirty & 1) {
        select_options(select, ctx2[0]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(select);
      if (if_block)
        if_block.d();
      if (default_slot)
        default_slot.d(detaching);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block2.name,
    type: "else",
    source: "(134:8) {:else}",
    ctx
  });
  return block;
}
function create_if_block_16(ctx) {
  let select;
  let if_block_anchor;
  let select_disabled_value;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[2] && ctx[0] === "" && create_if_block_25(ctx);
  const default_slot_template = ctx[20].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[19], null);
  const block = {
    c: function create4() {
      select = element("select");
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      if (default_slot)
        default_slot.c();
      attr_dev(select, "size", ctx[5]);
      select.disabled = select_disabled_value = ctx[12] ? "disabled" : "";
      if (ctx[0] === void 0)
        add_render_callback(() => ctx[21].call(select));
      add_location(select, file11, 114, 12, 2996);
    },
    m: function mount(target, anchor) {
      insert_dev(target, select, anchor);
      if (if_block)
        if_block.m(select, null);
      append_dev(select, if_block_anchor);
      if (default_slot) {
        default_slot.m(select, null);
      }
      select_option(select, ctx[0]);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(select, "change", ctx[21]),
          listen_dev(select, "change", ctx[15], false, false, false),
          listen_dev(select, "blur", ctx[16], false, false, false),
          listen_dev(select, "hover", ctx[17], false, false, false),
          listen_dev(select, "focus", ctx[18], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (ctx2[2] && ctx2[0] === "") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_25(ctx2);
          if_block.c();
          if_block.m(select, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 524288)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[19], !current ? get_all_dirty_from_scope(ctx2[19]) : get_slot_changes(default_slot_template, ctx2[19], dirty, null), null);
        }
      }
      if (!current || dirty & 32) {
        attr_dev(select, "size", ctx2[5]);
      }
      if (!current || dirty & 4096 && select_disabled_value !== (select_disabled_value = ctx2[12] ? "disabled" : "")) {
        prop_dev(select, "disabled", select_disabled_value);
      }
      if (dirty & 1) {
        select_option(select, ctx2[0]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(select);
      if (if_block)
        if_block.d();
      if (default_slot)
        default_slot.d(detaching);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_16.name,
    type: "if",
    source: "(114:8) {#if !multiple}",
    ctx
  });
  return block;
}
function create_if_block_34(ctx) {
  let option;
  let t0;
  let t1;
  const block = {
    c: function create4() {
      option = element("option");
      t0 = text(ctx[2]);
      t1 = space();
      option.__value = "";
      option.value = option.__value;
      option.disabled = true;
      option.hidden = true;
      add_location(option, file11, 145, 20, 3989);
    },
    m: function mount(target, anchor) {
      insert_dev(target, option, anchor);
      append_dev(option, t0);
      append_dev(option, t1);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4)
        set_data_dev(t0, ctx2[2]);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(option);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_34.name,
    type: "if",
    source: "(145:16) {#if placeholder && selected === ''}",
    ctx
  });
  return block;
}
function create_if_block_25(ctx) {
  let option;
  let t0;
  let t1;
  const block = {
    c: function create4() {
      option = element("option");
      t0 = text(ctx[2]);
      t1 = space();
      option.__value = "";
      option.value = option.__value;
      option.disabled = true;
      option.hidden = true;
      add_location(option, file11, 124, 20, 3345);
    },
    m: function mount(target, anchor) {
      insert_dev(target, option, anchor);
      append_dev(option, t0);
      append_dev(option, t1);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4)
        set_data_dev(t0, ctx2[2]);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(option);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_25.name,
    type: "if",
    source: "(124:16) {#if placeholder && selected === ''}",
    ctx
  });
  return block;
}
function create_if_block8(ctx) {
  let icon_1;
  let current;
  icon_1 = new Icon_default({
    props: {
      isLeft: true,
      icon: ctx[10],
      pack: ctx[11],
      size: ctx[4]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(icon_1.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(icon_1, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const icon_1_changes = {};
      if (dirty & 1024)
        icon_1_changes.icon = ctx2[10];
      if (dirty & 2048)
        icon_1_changes.pack = ctx2[11];
      if (dirty & 16)
        icon_1_changes.size = ctx2[4];
      icon_1.$set(icon_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(icon_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(icon_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(icon_1, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block8.name,
    type: "if",
    source: "(158:4) {#if icon}",
    ctx
  });
  return block;
}
function create_fragment12(ctx) {
  let div;
  let span;
  let current_block_type_index;
  let if_block0;
  let span_class_value;
  let t;
  let current;
  const if_block_creators = [create_if_block_16, create_else_block2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (!ctx2[3])
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx, -1);
  if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  let if_block1 = ctx[10] && create_if_block8(ctx);
  const block = {
    c: function create4() {
      div = element("div");
      span = element("span");
      if_block0.c();
      t = space();
      if (if_block1)
        if_block1.c();
      attr_dev(span, "class", span_class_value = "select " + ctx[4] + " " + ctx[1]);
      toggle_class(span, "is-fullwidth", ctx[6]);
      toggle_class(span, "is-loading", ctx[9]);
      toggle_class(span, "is-multiple", ctx[3]);
      toggle_class(span, "is-rounded", ctx[7]);
      toggle_class(span, "is-empty", ctx[0] === "");
      toggle_class(span, "is-focused", ctx[13]);
      toggle_class(span, "is-hovered", ctx[14]);
      toggle_class(span, "is-required", ctx[8]);
      add_location(span, file11, 103, 4, 2621);
      attr_dev(div, "class", "control");
      toggle_class(div, "is-expanded", ctx[6]);
      toggle_class(div, "has-icons-left", ctx[10]);
      add_location(div, file11, 99, 0, 2526);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      append_dev(div, span);
      if_blocks[current_block_type_index].m(span, null);
      append_dev(div, t);
      if (if_block1)
        if_block1.m(div, null);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block0 = if_blocks[current_block_type_index];
        if (!if_block0) {
          if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block0.c();
        } else {
          if_block0.p(ctx2, dirty);
        }
        transition_in(if_block0, 1);
        if_block0.m(span, null);
      }
      if (!current || dirty & 18 && span_class_value !== (span_class_value = "select " + ctx2[4] + " " + ctx2[1])) {
        attr_dev(span, "class", span_class_value);
      }
      if (dirty & 82) {
        toggle_class(span, "is-fullwidth", ctx2[6]);
      }
      if (dirty & 530) {
        toggle_class(span, "is-loading", ctx2[9]);
      }
      if (dirty & 26) {
        toggle_class(span, "is-multiple", ctx2[3]);
      }
      if (dirty & 146) {
        toggle_class(span, "is-rounded", ctx2[7]);
      }
      if (dirty & 19) {
        toggle_class(span, "is-empty", ctx2[0] === "");
      }
      if (dirty & 8210) {
        toggle_class(span, "is-focused", ctx2[13]);
      }
      if (dirty & 16402) {
        toggle_class(span, "is-hovered", ctx2[14]);
      }
      if (dirty & 274) {
        toggle_class(span, "is-required", ctx2[8]);
      }
      if (ctx2[10]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 1024) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block8(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (dirty & 64) {
        toggle_class(div, "is-expanded", ctx2[6]);
      }
      if (dirty & 1024) {
        toggle_class(div, "has-icons-left", ctx2[10]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      if_blocks[current_block_type_index].d();
      if (if_block1)
        if_block1.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment12.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance12($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Select", slots, ["default"]);
  let { selected = "" } = $$props;
  let { type = "" } = $$props;
  let { placeholder = "" } = $$props;
  let { multiple = false } = $$props;
  let { size = "" } = $$props;
  let { nativeSize } = $$props;
  let { expanded = false } = $$props;
  let { rounded = false } = $$props;
  let { required = false } = $$props;
  let { loading = false } = $$props;
  let { icon = "" } = $$props;
  let { iconPack = "mdi" } = $$props;
  let { disabled = false } = $$props;
  const dispatch2 = createEventDispatcher();
  let focused = false;
  let hovered = false;
  function onChange() {
    dispatch2("input", selected);
  }
  function onBlur() {
    $$invalidate(13, focused = false);
    dispatch2("blur");
  }
  function onHover() {
    $$invalidate(14, hovered = true);
    dispatch2("hover");
  }
  function onFocus() {
    $$invalidate(13, focused = true);
    dispatch2("focus");
  }
  const writable_props = [
    "selected",
    "type",
    "placeholder",
    "multiple",
    "size",
    "nativeSize",
    "expanded",
    "rounded",
    "required",
    "loading",
    "icon",
    "iconPack",
    "disabled"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Select> was created with unknown prop '${key}'`);
  });
  function select_change_handler() {
    selected = select_value(this);
    $$invalidate(0, selected);
  }
  function select_change_handler_1() {
    selected = select_multiple_value(this);
    $$invalidate(0, selected);
  }
  $$self.$$set = ($$props2) => {
    if ("selected" in $$props2)
      $$invalidate(0, selected = $$props2.selected);
    if ("type" in $$props2)
      $$invalidate(1, type = $$props2.type);
    if ("placeholder" in $$props2)
      $$invalidate(2, placeholder = $$props2.placeholder);
    if ("multiple" in $$props2)
      $$invalidate(3, multiple = $$props2.multiple);
    if ("size" in $$props2)
      $$invalidate(4, size = $$props2.size);
    if ("nativeSize" in $$props2)
      $$invalidate(5, nativeSize = $$props2.nativeSize);
    if ("expanded" in $$props2)
      $$invalidate(6, expanded = $$props2.expanded);
    if ("rounded" in $$props2)
      $$invalidate(7, rounded = $$props2.rounded);
    if ("required" in $$props2)
      $$invalidate(8, required = $$props2.required);
    if ("loading" in $$props2)
      $$invalidate(9, loading = $$props2.loading);
    if ("icon" in $$props2)
      $$invalidate(10, icon = $$props2.icon);
    if ("iconPack" in $$props2)
      $$invalidate(11, iconPack = $$props2.iconPack);
    if ("disabled" in $$props2)
      $$invalidate(12, disabled = $$props2.disabled);
    if ("$$scope" in $$props2)
      $$invalidate(19, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    Icon: Icon_default,
    selected,
    type,
    placeholder,
    multiple,
    size,
    nativeSize,
    expanded,
    rounded,
    required,
    loading,
    icon,
    iconPack,
    disabled,
    dispatch: dispatch2,
    focused,
    hovered,
    onChange,
    onBlur,
    onHover,
    onFocus
  });
  $$self.$inject_state = ($$props2) => {
    if ("selected" in $$props2)
      $$invalidate(0, selected = $$props2.selected);
    if ("type" in $$props2)
      $$invalidate(1, type = $$props2.type);
    if ("placeholder" in $$props2)
      $$invalidate(2, placeholder = $$props2.placeholder);
    if ("multiple" in $$props2)
      $$invalidate(3, multiple = $$props2.multiple);
    if ("size" in $$props2)
      $$invalidate(4, size = $$props2.size);
    if ("nativeSize" in $$props2)
      $$invalidate(5, nativeSize = $$props2.nativeSize);
    if ("expanded" in $$props2)
      $$invalidate(6, expanded = $$props2.expanded);
    if ("rounded" in $$props2)
      $$invalidate(7, rounded = $$props2.rounded);
    if ("required" in $$props2)
      $$invalidate(8, required = $$props2.required);
    if ("loading" in $$props2)
      $$invalidate(9, loading = $$props2.loading);
    if ("icon" in $$props2)
      $$invalidate(10, icon = $$props2.icon);
    if ("iconPack" in $$props2)
      $$invalidate(11, iconPack = $$props2.iconPack);
    if ("disabled" in $$props2)
      $$invalidate(12, disabled = $$props2.disabled);
    if ("focused" in $$props2)
      $$invalidate(13, focused = $$props2.focused);
    if ("hovered" in $$props2)
      $$invalidate(14, hovered = $$props2.hovered);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    selected,
    type,
    placeholder,
    multiple,
    size,
    nativeSize,
    expanded,
    rounded,
    required,
    loading,
    icon,
    iconPack,
    disabled,
    focused,
    hovered,
    onChange,
    onBlur,
    onHover,
    onFocus,
    $$scope,
    slots,
    select_change_handler,
    select_change_handler_1
  ];
}
var Select = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance12, create_fragment12, safe_not_equal, {
      selected: 0,
      type: 1,
      placeholder: 2,
      multiple: 3,
      size: 4,
      nativeSize: 5,
      expanded: 6,
      rounded: 7,
      required: 8,
      loading: 9,
      icon: 10,
      iconPack: 11,
      disabled: 12
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Select",
      options,
      id: create_fragment12.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[5] === void 0 && !("nativeSize" in props)) {
      console.warn("<Select> was created without expected prop 'nativeSize'");
    }
  }
  get selected() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set selected(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get type() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get placeholder() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set placeholder(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get multiple() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set multiple(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get nativeSize() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set nativeSize(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get expanded() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set expanded(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get rounded() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set rounded(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get required() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set required(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get loading() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set loading(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get icon() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set icon(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get iconPack() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set iconPack(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get disabled() {
    throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set disabled(value) {
    throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Select_default = Select;

// node_modules/svelma/src/components/Snackbar/Snackbar.svelte
var { Error: Error_12 } = globals;
var file12 = "node_modules/svelma/src/components/Snackbar/Snackbar.svelte";
function create_if_block9(ctx) {
  let div;
  let button;
  let t;
  let button_class_value;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      div = element("div");
      button = element("button");
      t = text(ctx[2]);
      attr_dev(button, "class", button_class_value = "button " + ctx[5] + " svelte-okuiox");
      add_location(button, file12, 96, 8, 2635);
      attr_dev(div, "class", "action svelte-okuiox");
      add_location(div, file12, 95, 6, 2588);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      append_dev(div, button);
      append_dev(button, t);
      if (!mounted) {
        dispose = listen_dev(div, "click", ctx[6], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4)
        set_data_dev(t, ctx2[2]);
      if (dirty & 32 && button_class_value !== (button_class_value = "button " + ctx2[5] + " svelte-okuiox")) {
        attr_dev(button, "class", button_class_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block9.name,
    type: "if",
    source: "(95:4) {#if actionText}",
    ctx
  });
  return block;
}
function create_default_slot2(ctx) {
  let div1;
  let div0;
  let t;
  let div1_class_value;
  let if_block = ctx[2] && create_if_block9(ctx);
  const block = {
    c: function create4() {
      div1 = element("div");
      div0 = element("div");
      t = space();
      if (if_block)
        if_block.c();
      attr_dev(div0, "class", "text svelte-okuiox");
      add_location(div0, file12, 90, 4, 2429);
      attr_dev(div1, "class", div1_class_value = "snackbar " + ctx[1] + " svelte-okuiox");
      attr_dev(div1, "role", "alert");
      toggle_class(div1, "has-background-dark", !ctx[1]);
      add_location(div1, file12, 89, 2, 2336);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, div0);
      div0.innerHTML = ctx[0];
      append_dev(div1, t);
      if (if_block)
        if_block.m(div1, null);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1)
        div0.innerHTML = ctx2[0];
      ;
      if (ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block9(ctx2);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & 2 && div1_class_value !== (div1_class_value = "snackbar " + ctx2[1] + " svelte-okuiox")) {
        attr_dev(div1, "class", div1_class_value);
      }
      if (dirty & 2) {
        toggle_class(div1, "has-background-dark", !ctx2[1]);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      if (if_block)
        if_block.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot2.name,
    type: "slot",
    source: "(89:0) <Notice {...props} bind:this={notice} transitionOut={true}>",
    ctx
  });
  return block;
}
function create_fragment13(ctx) {
  let notice_1;
  let current;
  const notice_1_spread_levels = [ctx[4], { transitionOut: true }];
  let notice_1_props = {
    $$slots: { default: [create_default_slot2] },
    $$scope: { ctx }
  };
  for (let i = 0; i < notice_1_spread_levels.length; i += 1) {
    notice_1_props = assign(notice_1_props, notice_1_spread_levels[i]);
  }
  notice_1 = new Notice_default({ props: notice_1_props, $$inline: true });
  ctx[11](notice_1);
  const block = {
    c: function create4() {
      create_component(notice_1.$$.fragment);
    },
    l: function claim(nodes) {
      throw new Error_12("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      mount_component(notice_1, target, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      const notice_1_changes = dirty & 16 ? get_spread_update(notice_1_spread_levels, [get_spread_object(ctx2[4]), notice_1_spread_levels[1]]) : {};
      if (dirty & 8231) {
        notice_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      notice_1.$set(notice_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(notice_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(notice_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      ctx[11](null);
      destroy_component(notice_1, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment13.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance13($$self, $$props, $$invalidate) {
  let newType;
  let props;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Snackbar", slots, []);
  let { message } = $$props;
  let { duration = 3500 } = $$props;
  let { position = "is-bottom-right" } = $$props;
  let { type = "is-primary" } = $$props;
  let { background = "" } = $$props;
  let { actionText = "OK" } = $$props;
  let { onAction = () => {
  } } = $$props;
  let notice;
  function action() {
    Promise.resolve(onAction()).then(() => notice.close());
  }
  onMount(() => {
    if (typeof onAction !== "function")
      throw new Error(`onAction ${onAction} is not a function`);
  });
  function notice_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      notice = $$value;
      $$invalidate(3, notice);
    });
  }
  $$self.$$set = ($$new_props) => {
    $$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    if ("message" in $$new_props)
      $$invalidate(0, message = $$new_props.message);
    if ("duration" in $$new_props)
      $$invalidate(7, duration = $$new_props.duration);
    if ("position" in $$new_props)
      $$invalidate(8, position = $$new_props.position);
    if ("type" in $$new_props)
      $$invalidate(9, type = $$new_props.type);
    if ("background" in $$new_props)
      $$invalidate(1, background = $$new_props.background);
    if ("actionText" in $$new_props)
      $$invalidate(2, actionText = $$new_props.actionText);
    if ("onAction" in $$new_props)
      $$invalidate(10, onAction = $$new_props.onAction);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    onDestroy,
    onMount,
    fly,
    fade,
    Notice: Notice_default,
    filterProps,
    message,
    duration,
    position,
    type,
    background,
    actionText,
    onAction,
    notice,
    action,
    props,
    newType
  });
  $$self.$inject_state = ($$new_props) => {
    $$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    if ("message" in $$props)
      $$invalidate(0, message = $$new_props.message);
    if ("duration" in $$props)
      $$invalidate(7, duration = $$new_props.duration);
    if ("position" in $$props)
      $$invalidate(8, position = $$new_props.position);
    if ("type" in $$props)
      $$invalidate(9, type = $$new_props.type);
    if ("background" in $$props)
      $$invalidate(1, background = $$new_props.background);
    if ("actionText" in $$props)
      $$invalidate(2, actionText = $$new_props.actionText);
    if ("onAction" in $$props)
      $$invalidate(10, onAction = $$new_props.onAction);
    if ("notice" in $$props)
      $$invalidate(3, notice = $$new_props.notice);
    if ("props" in $$props)
      $$invalidate(4, props = $$new_props.props);
    if ("newType" in $$props)
      $$invalidate(5, newType = $$new_props.newType);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 512) {
      $:
        $$invalidate(5, newType = type && type.replace(/^is-(.*)/, "has-text-$1"));
    }
    $:
      $$invalidate(4, props = {
        ...filterProps($$props),
        position,
        duration
      });
  };
  $$props = exclude_internal_props($$props);
  return [
    message,
    background,
    actionText,
    notice,
    props,
    newType,
    action,
    duration,
    position,
    type,
    onAction,
    notice_1_binding
  ];
}
var Snackbar = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance13, create_fragment13, safe_not_equal, {
      message: 0,
      duration: 7,
      position: 8,
      type: 9,
      background: 1,
      actionText: 2,
      onAction: 10
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Snackbar",
      options,
      id: create_fragment13.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("message" in props)) {
      console.warn("<Snackbar> was created without expected prop 'message'");
    }
  }
  get message() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set message(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get duration() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set duration(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get position() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set position(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get type() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get background() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set background(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get actionText() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set actionText(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onAction() {
    throw new Error_12("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onAction(value) {
    throw new Error_12("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Snackbar_default = Snackbar;

// node_modules/svelma/src/components/Snackbar/index.js
Snackbar_default.create = create2;
function create2(props) {
  if (typeof props === "string")
    props = { message: props };
  const snackbar = new Snackbar_default({
    target: document.body,
    props,
    intro: true
  });
  snackbar.$on("destroyed", snackbar.$destroy);
  return snackbar;
}

// node_modules/svelma/src/components/Switch.svelte
var file13 = "node_modules/svelma/src/components/Switch.svelte";
function create_fragment14(ctx) {
  let label_1;
  let input_1;
  let t0;
  let div;
  let div_class_value;
  let t1;
  let span;
  let label_1_class_value;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = ctx[8].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[7], null);
  const block = {
    c: function create4() {
      label_1 = element("label");
      input_1 = element("input");
      t0 = space();
      div = element("div");
      t1 = space();
      span = element("span");
      if (default_slot)
        default_slot.c();
      attr_dev(input_1, "type", "checkbox");
      attr_dev(input_1, "class", "svelte-r18266");
      add_location(input_1, file13, 104, 2, 2261);
      attr_dev(div, "class", div_class_value = "check " + ctx[4] + " svelte-r18266");
      add_location(div, file13, 106, 2, 2339);
      attr_dev(span, "class", "control-label svelte-r18266");
      add_location(span, file13, 108, 2, 2384);
      attr_dev(label_1, "ref", "label");
      attr_dev(label_1, "class", label_1_class_value = "switch " + ctx[1] + " svelte-r18266");
      add_location(label_1, file13, 103, 0, 2199);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, label_1, anchor);
      append_dev(label_1, input_1);
      input_1.checked = ctx[0];
      ctx[12](input_1);
      append_dev(label_1, t0);
      append_dev(label_1, div);
      append_dev(label_1, t1);
      append_dev(label_1, span);
      if (default_slot) {
        default_slot.m(span, null);
      }
      ctx[13](label_1);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(input_1, "change", ctx[11]),
          listen_dev(input_1, "input", ctx[9], false, false, false),
          listen_dev(input_1, "click", ctx[10], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 1) {
        input_1.checked = ctx2[0];
      }
      if (!current || dirty & 16 && div_class_value !== (div_class_value = "check " + ctx2[4] + " svelte-r18266")) {
        attr_dev(div, "class", div_class_value);
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 128)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[7], !current ? get_all_dirty_from_scope(ctx2[7]) : get_slot_changes(default_slot_template, ctx2[7], dirty, null), null);
        }
      }
      if (!current || dirty & 2 && label_1_class_value !== (label_1_class_value = "switch " + ctx2[1] + " svelte-r18266")) {
        attr_dev(label_1, "class", label_1_class_value);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(label_1);
      ctx[12](null);
      if (default_slot)
        default_slot.d(detaching);
      ctx[13](null);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment14.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance14($$self, $$props, $$invalidate) {
  let newBackground;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Switch", slots, ["default"]);
  let { checked = false } = $$props;
  let { type = "is-primary" } = $$props;
  let { size = "" } = $$props;
  let { disabled = false } = $$props;
  let label;
  let input;
  const writable_props = ["checked", "type", "size", "disabled"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Switch> was created with unknown prop '${key}'`);
  });
  function input_handler(event) {
    bubble.call(this, $$self, event);
  }
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  function input_1_change_handler() {
    checked = this.checked;
    $$invalidate(0, checked);
  }
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(3, input);
    });
  }
  function label_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      label = $$value;
      $$invalidate(2, label);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("checked" in $$props2)
      $$invalidate(0, checked = $$props2.checked);
    if ("type" in $$props2)
      $$invalidate(5, type = $$props2.type);
    if ("size" in $$props2)
      $$invalidate(1, size = $$props2.size);
    if ("disabled" in $$props2)
      $$invalidate(6, disabled = $$props2.disabled);
    if ("$$scope" in $$props2)
      $$invalidate(7, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    checked,
    type,
    size,
    disabled,
    label,
    input,
    newBackground
  });
  $$self.$inject_state = ($$props2) => {
    if ("checked" in $$props2)
      $$invalidate(0, checked = $$props2.checked);
    if ("type" in $$props2)
      $$invalidate(5, type = $$props2.type);
    if ("size" in $$props2)
      $$invalidate(1, size = $$props2.size);
    if ("disabled" in $$props2)
      $$invalidate(6, disabled = $$props2.disabled);
    if ("label" in $$props2)
      $$invalidate(2, label = $$props2.label);
    if ("input" in $$props2)
      $$invalidate(3, input = $$props2.input);
    if ("newBackground" in $$props2)
      $$invalidate(4, newBackground = $$props2.newBackground);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 32) {
      $:
        $$invalidate(4, newBackground = type && type.replace(/^is-(.*)/, "has-background-$1") || "");
    }
    if ($$self.$$.dirty & 76) {
      $: {
        if (input) {
          if (disabled) {
            label.setAttribute("disabled", "disabled");
            input.setAttribute("disabled", "disabled");
          } else {
            label.removeAttribute("disabled");
            input.removeAttribute("disabled");
          }
        }
      }
    }
  };
  return [
    checked,
    size,
    label,
    input,
    newBackground,
    type,
    disabled,
    $$scope,
    slots,
    input_handler,
    click_handler,
    input_1_change_handler,
    input_1_binding,
    label_1_binding
  ];
}
var Switch = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance14, create_fragment14, safe_not_equal, {
      checked: 0,
      type: 5,
      size: 1,
      disabled: 6
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Switch",
      options,
      id: create_fragment14.name
    });
  }
  get checked() {
    throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set checked(value) {
    throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get type() {
    throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get disabled() {
    throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set disabled(value) {
    throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Switch_default = Switch;

// node_modules/svelma/src/components/Toast/Toast.svelte
var file14 = "node_modules/svelma/src/components/Toast/Toast.svelte";
function create_default_slot3(ctx) {
  let div1;
  let div0;
  let div1_class_value;
  const block = {
    c: function create4() {
      div1 = element("div");
      div0 = element("div");
      attr_dev(div0, "class", "text");
      add_location(div0, file14, 49, 4, 1495);
      attr_dev(div1, "class", div1_class_value = "toast " + ctx[1] + " " + ctx[2] + " svelte-1x5tk23");
      attr_dev(div1, "role", "alert");
      add_location(div1, file14, 48, 2, 1435);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, div0);
      div0.innerHTML = ctx[0];
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1)
        div0.innerHTML = ctx2[0];
      ;
      if (dirty & 6 && div1_class_value !== (div1_class_value = "toast " + ctx2[1] + " " + ctx2[2] + " svelte-1x5tk23")) {
        attr_dev(div1, "class", div1_class_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot3.name,
    type: "slot",
    source: "(48:0) <Notice {...filterProps($$props)}>",
    ctx
  });
  return block;
}
function create_fragment15(ctx) {
  let notice;
  let current;
  const notice_spread_levels = [filterProps(ctx[3])];
  let notice_props = {
    $$slots: { default: [create_default_slot3] },
    $$scope: { ctx }
  };
  for (let i = 0; i < notice_spread_levels.length; i += 1) {
    notice_props = assign(notice_props, notice_spread_levels[i]);
  }
  notice = new Notice_default({ props: notice_props, $$inline: true });
  const block = {
    c: function create4() {
      create_component(notice.$$.fragment);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      mount_component(notice, target, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      const notice_changes = dirty & 8 ? get_spread_update(notice_spread_levels, [get_spread_object(filterProps(ctx2[3]))]) : {};
      if (dirty & 39) {
        notice_changes.$$scope = { dirty, ctx: ctx2 };
      }
      notice.$set(notice_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(notice.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(notice.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(notice, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment15.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance15($$self, $$props, $$invalidate) {
  let newBackground;
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Toast", slots, []);
  let { message } = $$props;
  let { type = "is-dark" } = $$props;
  let { background = "" } = $$props;
  $$self.$$set = ($$new_props) => {
    $$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    if ("message" in $$new_props)
      $$invalidate(0, message = $$new_props.message);
    if ("type" in $$new_props)
      $$invalidate(1, type = $$new_props.type);
    if ("background" in $$new_props)
      $$invalidate(4, background = $$new_props.background);
  };
  $$self.$capture_state = () => ({
    createEventDispatcher,
    onDestroy,
    onMount,
    fly,
    fade,
    Notice: Notice_default,
    filterProps,
    message,
    type,
    background,
    newBackground
  });
  $$self.$inject_state = ($$new_props) => {
    $$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    if ("message" in $$props)
      $$invalidate(0, message = $$new_props.message);
    if ("type" in $$props)
      $$invalidate(1, type = $$new_props.type);
    if ("background" in $$props)
      $$invalidate(4, background = $$new_props.background);
    if ("newBackground" in $$props)
      $$invalidate(2, newBackground = $$new_props.newBackground);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 18) {
      $:
        $$invalidate(2, newBackground = background || type.replace(/^is-(.*)/, "has-background-$1"));
    }
  };
  $$props = exclude_internal_props($$props);
  return [message, type, newBackground, $$props, background];
}
var Toast = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance15, create_fragment15, safe_not_equal, { message: 0, type: 1, background: 4 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Toast",
      options,
      id: create_fragment15.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("message" in props)) {
      console.warn("<Toast> was created without expected prop 'message'");
    }
  }
  get message() {
    throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set message(value) {
    throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get type() {
    throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set type(value) {
    throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get background() {
    throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set background(value) {
    throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Toast_default = Toast;

// node_modules/svelma/src/components/Toast/index.js
Toast_default.create = create3;
function create3(props) {
  if (typeof props === "string")
    props = { message: props };
  const toast = new Toast_default({
    target: document.body,
    props,
    intro: true
  });
  toast.$on("destroyed", toast.$destroy);
  return toast;
}

// src/articles/ArticleComponent.svelte
var { console: console_1 } = globals;
var file15 = "src/articles/ArticleComponent.svelte";
function create_if_block10(ctx) {
  let modal_1;
  let updating_active;
  let current;
  function modal_1_active_binding(value) {
    ctx[10](value);
  }
  let modal_1_props = {
    $$slots: { default: [create_default_slot4] },
    $$scope: { ctx }
  };
  if (ctx[0] !== void 0) {
    modal_1_props.active = ctx[0];
  }
  modal_1 = new Modal_default2({ props: modal_1_props, $$inline: true });
  binding_callbacks.push(() => bind(modal_1, "active", modal_1_active_binding));
  const block = {
    c: function create4() {
      create_component(modal_1.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(modal_1, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const modal_1_changes = {};
      if (dirty & 4143) {
        modal_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_active && dirty & 1) {
        updating_active = true;
        modal_1_changes.active = ctx2[0];
        add_flush_callback(() => updating_active = false);
      }
      modal_1.$set(modal_1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(modal_1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(modal_1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(modal_1, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block10.name,
    type: "if",
    source: "(48:0) {#if modal}",
    ctx
  });
  return block;
}
function create_default_slot4(ctx) {
  let article;
  let switch_instance;
  let updating_modal;
  let current;
  function switch_instance_modal_binding(value) {
    ctx[9](value);
  }
  var switch_value = ctx[3];
  function switch_props(ctx2) {
    let switch_instance_props = {
      timelineProps: ctx2[2],
      articleProps: ctx2[1],
      actualArticle: ctx2[5],
      onLogData: ctx2[6],
      onLogJSON: ctx2[7],
      onMediaClick: ctx2[8]
    };
    if (ctx2[0] !== void 0) {
      switch_instance_props.modal = ctx2[0];
    }
    return {
      props: switch_instance_props,
      $$inline: true
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
    binding_callbacks.push(() => bind(switch_instance, "modal", switch_instance_modal_binding));
  }
  const block = {
    c: function create4() {
      article = element("article");
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      attr_dev(article, "class", "svelte-glgzpd");
      toggle_class(article, "transparent", ctx[1].filteredOut);
      add_location(article, file15, 49, 2, 1172);
    },
    m: function mount(target, anchor) {
      insert_dev(target, article, anchor);
      if (switch_instance) {
        mount_component(switch_instance, article, null);
      }
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const switch_instance_changes = {};
      if (dirty & 4)
        switch_instance_changes.timelineProps = ctx2[2];
      if (dirty & 2)
        switch_instance_changes.articleProps = ctx2[1];
      if (dirty & 32)
        switch_instance_changes.actualArticle = ctx2[5];
      if (!updating_modal && dirty & 1) {
        updating_modal = true;
        switch_instance_changes.modal = ctx2[0];
        add_flush_callback(() => updating_modal = false);
      }
      if (switch_value !== (switch_value = ctx2[3])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          binding_callbacks.push(() => bind(switch_instance, "modal", switch_instance_modal_binding));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, article, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
      if (dirty & 2) {
        toggle_class(article, "transparent", ctx2[1].filteredOut);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(article);
      if (switch_instance)
        destroy_component(switch_instance);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot4.name,
    type: "slot",
    source: "(49:1) <Modal bind:active={modal}>",
    ctx
  });
  return block;
}
function create_fragment16(ctx) {
  let t;
  let article;
  let switch_instance;
  let updating_modal;
  let article_class_value;
  let current;
  let if_block = ctx[0] && create_if_block10(ctx);
  function switch_instance_modal_binding_1(value) {
    ctx[11](value);
  }
  var switch_value = ctx[3];
  function switch_props(ctx2) {
    let switch_instance_props = {
      timelineProps: ctx2[2],
      articleProps: ctx2[1],
      actualArticle: ctx2[5],
      onLogData: ctx2[6],
      onLogJSON: ctx2[7],
      onMediaClick: ctx2[8]
    };
    if (ctx2[0] !== void 0) {
      switch_instance_props.modal = ctx2[0];
    }
    return {
      props: switch_instance_props,
      $$inline: true
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
    binding_callbacks.push(() => bind(switch_instance, "modal", switch_instance_modal_binding_1));
  }
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      t = space();
      article = element("article");
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      attr_dev(article, "class", article_class_value = null_to_empty(ctx[1].filteredOut ? "transparent" : "") + " svelte-glgzpd");
      attr_dev(article, "style", ctx[4]);
      add_location(article, file15, 64, 0, 1425);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, t, anchor);
      insert_dev(target, article, anchor);
      if (switch_instance) {
        mount_component(switch_instance, article, null);
      }
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block10(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(t.parentNode, t);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const switch_instance_changes = {};
      if (dirty & 4)
        switch_instance_changes.timelineProps = ctx2[2];
      if (dirty & 2)
        switch_instance_changes.articleProps = ctx2[1];
      if (dirty & 32)
        switch_instance_changes.actualArticle = ctx2[5];
      if (!updating_modal && dirty & 1) {
        updating_modal = true;
        switch_instance_changes.modal = ctx2[0];
        add_flush_callback(() => updating_modal = false);
      }
      if (switch_value !== (switch_value = ctx2[3])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          binding_callbacks.push(() => bind(switch_instance, "modal", switch_instance_modal_binding_1));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, article, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty & 2 && article_class_value !== (article_class_value = null_to_empty(ctx2[1].filteredOut ? "transparent" : "") + " svelte-glgzpd")) {
        attr_dev(article, "class", article_class_value);
      }
      if (!current || dirty & 16) {
        attr_dev(article, "style", ctx2[4]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(t);
      if (detaching)
        detach_dev(article);
      if (switch_instance)
        destroy_component(switch_instance);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment16.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance16($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("ArticleComponent", slots, []);
  let { articleProps } = $$props;
  let { timelineProps } = $$props;
  let { view } = $$props;
  let { modal = false } = $$props;
  let { style = "" } = $$props;
  style;
  let actualArticle;
  function onLogData() {
    console.dir(articleProps);
  }
  function onLogJSON() {
    console.dir({
      article: articleProps.article.json,
      actualArticleRef: {
        reposted: articleProps.actualArticleRef?.reposted?.json,
        quoted: articleProps.actualArticleRef?.quoted?.json
      },
      replyRef: articleProps.replyRef?.json
    });
  }
  function onMediaClick(idPair, index) {
    toggleMarkAsRead(idPair);
  }
  const writable_props = ["articleProps", "timelineProps", "view", "modal", "style"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console_1.warn(`<ArticleComponent> was created with unknown prop '${key}'`);
  });
  function switch_instance_modal_binding(value) {
    modal = value;
    $$invalidate(0, modal);
  }
  function modal_1_active_binding(value) {
    modal = value;
    $$invalidate(0, modal);
  }
  function switch_instance_modal_binding_1(value) {
    modal = value;
    $$invalidate(0, modal);
  }
  $$self.$$set = ($$props2) => {
    if ("articleProps" in $$props2)
      $$invalidate(1, articleProps = $$props2.articleProps);
    if ("timelineProps" in $$props2)
      $$invalidate(2, timelineProps = $$props2.timelineProps);
    if ("view" in $$props2)
      $$invalidate(3, view = $$props2.view);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("style" in $$props2)
      $$invalidate(4, style = $$props2.style);
  };
  $$self.$capture_state = () => ({
    toggleMarkAsRead,
    fetchArticle,
    Article,
    getActualArticle,
    Modal: Modal_default2,
    articleProps,
    timelineProps,
    view,
    modal,
    style,
    actualArticle,
    onLogData,
    onLogJSON,
    onMediaClick
  });
  $$self.$inject_state = ($$props2) => {
    if ("articleProps" in $$props2)
      $$invalidate(1, articleProps = $$props2.articleProps);
    if ("timelineProps" in $$props2)
      $$invalidate(2, timelineProps = $$props2.timelineProps);
    if ("view" in $$props2)
      $$invalidate(3, view = $$props2.view);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("style" in $$props2)
      $$invalidate(4, style = $$props2.style);
    if ("actualArticle" in $$props2)
      $$invalidate(5, actualArticle = $$props2.actualArticle);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 34) {
      $: {
        $$invalidate(5, actualArticle = getActualArticle(articleProps));
        if (!actualArticle.fetched)
          fetchArticle(actualArticle.idPair);
      }
    }
  };
  return [
    modal,
    articleProps,
    timelineProps,
    view,
    style,
    actualArticle,
    onLogData,
    onLogJSON,
    onMediaClick,
    switch_instance_modal_binding,
    modal_1_active_binding,
    switch_instance_modal_binding_1
  ];
}
var ArticleComponent = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance16, create_fragment16, safe_not_equal, {
      articleProps: 1,
      timelineProps: 2,
      view: 3,
      modal: 0,
      style: 4
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "ArticleComponent",
      options,
      id: create_fragment16.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("articleProps" in props)) {
      console_1.warn("<ArticleComponent> was created without expected prop 'articleProps'");
    }
    if (ctx[2] === void 0 && !("timelineProps" in props)) {
      console_1.warn("<ArticleComponent> was created without expected prop 'timelineProps'");
    }
    if (ctx[3] === void 0 && !("view" in props)) {
      console_1.warn("<ArticleComponent> was created without expected prop 'view'");
    }
  }
  get articleProps() {
    throw new Error("<ArticleComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set articleProps(value) {
    throw new Error("<ArticleComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get timelineProps() {
    throw new Error("<ArticleComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set timelineProps(value) {
    throw new Error("<ArticleComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get view() {
    throw new Error("<ArticleComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set view(value) {
    throw new Error("<ArticleComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get modal() {
    throw new Error("<ArticleComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set modal(value) {
    throw new Error("<ArticleComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get style() {
    throw new Error("<ArticleComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set style(value) {
    throw new Error("<ArticleComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var ArticleComponent_default = ArticleComponent;

// src/containers/index.ts
function articlesWithUniqueKeys(articles) {
  const idPairs = /* @__PURE__ */ new Set();
  return articles.map((a) => {
    let i = 0;
    let key = `${a.article.idPairStr}/${i}`;
    while (idPairs.has(key)) {
      key = `${a.article.idPairStr}/${++i}`;
    }
    idPairs.add(key);
    return [a, key];
  });
}

// src/containers/ColumnContainer.svelte
var file16 = "src/containers/ColumnContainer.svelte";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[3] = list[i][0];
  child_ctx[4] = list[i][1];
  return child_ctx;
}
function create_each_block(key_1, ctx) {
  let first;
  let articlecomponent;
  let current;
  articlecomponent = new ArticleComponent_default({
    props: {
      view: ctx[1].articleView,
      articleProps: ctx[3],
      timelineProps: ctx[1].timelineArticleProps
    },
    $$inline: true
  });
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      create_component(articlecomponent.$$.fragment);
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      mount_component(articlecomponent, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const articlecomponent_changes = {};
      if (dirty & 2)
        articlecomponent_changes.view = ctx[1].articleView;
      if (dirty & 2)
        articlecomponent_changes.articleProps = ctx[3];
      if (dirty & 2)
        articlecomponent_changes.timelineProps = ctx[1].timelineArticleProps;
      articlecomponent.$set(articlecomponent_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(articlecomponent.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(articlecomponent.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      destroy_component(articlecomponent, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block.name,
    type: "each",
    source: "(8:1) {#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}",
    ctx
  });
  return block;
}
function create_fragment17(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let current;
  let each_value = articlesWithUniqueKeys(ctx[1].articles);
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[4];
  validate_each_keys(ctx, each_value, get_each_context, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  }
  const block = {
    c: function create4() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr_dev(div, "class", "articlesContainer columnContainer");
      add_location(div, file16, 6, 0, 205);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      ctx[2](div);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 2) {
        each_value = articlesWithUniqueKeys(ctx2[1].articles);
        validate_each_argument(each_value);
        group_outros();
        validate_each_keys(ctx2, each_value, get_each_context, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      ctx[2](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment17.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance17($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("ColumnContainer", slots, []);
  let { props } = $$props;
  let { containerRef = void 0 } = $$props;
  const writable_props = ["props", "containerRef"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<ColumnContainer> was created with unknown prop '${key}'`);
  });
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      containerRef = $$value;
      $$invalidate(0, containerRef);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
    if ("containerRef" in $$props2)
      $$invalidate(0, containerRef = $$props2.containerRef);
  };
  $$self.$capture_state = () => ({
    ArticleComponent: ArticleComponent_default,
    articlesWithUniqueKeys,
    props,
    containerRef
  });
  $$self.$inject_state = ($$props2) => {
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
    if ("containerRef" in $$props2)
      $$invalidate(0, containerRef = $$props2.containerRef);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [containerRef, props, div_binding];
}
var ColumnContainer = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance17, create_fragment17, safe_not_equal, { props: 1, containerRef: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "ColumnContainer",
      options,
      id: create_fragment17.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("props" in props)) {
      console.warn("<ColumnContainer> was created without expected prop 'props'");
    }
  }
  get props() {
    throw new Error("<ColumnContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set props(value) {
    throw new Error("<ColumnContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get containerRef() {
    throw new Error("<ColumnContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set containerRef(value) {
    throw new Error("<ColumnContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var ColumnContainer_default = ColumnContainer;

// src/containers/RowContainer.svelte
var file17 = "src/containers/RowContainer.svelte";
function get_each_context2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[3] = list[i][0];
  child_ctx[4] = list[i][1];
  return child_ctx;
}
function create_each_block2(key_1, ctx) {
  let first;
  let articlecomponent;
  let current;
  articlecomponent = new ArticleComponent_default({
    props: {
      view: ctx[1].articleView,
      articleProps: ctx[3],
      timelineProps: ctx[1].timelineArticleProps,
      style: `width: calc(100% / ${ctx[1].columnCount})`
    },
    $$inline: true
  });
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      create_component(articlecomponent.$$.fragment);
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      mount_component(articlecomponent, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const articlecomponent_changes = {};
      if (dirty & 2)
        articlecomponent_changes.view = ctx[1].articleView;
      if (dirty & 2)
        articlecomponent_changes.articleProps = ctx[3];
      if (dirty & 2)
        articlecomponent_changes.timelineProps = ctx[1].timelineArticleProps;
      if (dirty & 2)
        articlecomponent_changes.style = `width: calc(100% / ${ctx[1].columnCount})`;
      articlecomponent.$set(articlecomponent_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(articlecomponent.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(articlecomponent.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      destroy_component(articlecomponent, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block2.name,
    type: "each",
    source: "(15:1) {#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}",
    ctx
  });
  return block;
}
function create_fragment18(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let current;
  let each_value = articlesWithUniqueKeys(ctx[1].articles);
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[4];
  validate_each_keys(ctx, each_value, get_each_context2, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block2(key, child_ctx));
  }
  const block = {
    c: function create4() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr_dev(div, "class", "articlesContainer rowContainer svelte-gs8u63");
      add_location(div, file17, 13, 0, 354);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      ctx[2](div);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 2) {
        each_value = articlesWithUniqueKeys(ctx2[1].articles);
        validate_each_argument(each_value);
        group_outros();
        validate_each_keys(ctx2, each_value, get_each_context2, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block2, null, get_each_context2);
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      ctx[2](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment18.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance18($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("RowContainer", slots, []);
  let { containerRef = void 0 } = $$props;
  let { props } = $$props;
  const writable_props = ["containerRef", "props"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<RowContainer> was created with unknown prop '${key}'`);
  });
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      containerRef = $$value;
      $$invalidate(0, containerRef);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("containerRef" in $$props2)
      $$invalidate(0, containerRef = $$props2.containerRef);
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
  };
  $$self.$capture_state = () => ({
    ArticleComponent: ArticleComponent_default,
    articlesWithUniqueKeys,
    containerRef,
    props
  });
  $$self.$inject_state = ($$props2) => {
    if ("containerRef" in $$props2)
      $$invalidate(0, containerRef = $$props2.containerRef);
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [containerRef, props, div_binding];
}
var RowContainer = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance18, create_fragment18, safe_not_equal, { containerRef: 0, props: 1 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "RowContainer",
      options,
      id: create_fragment18.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("props" in props)) {
      console.warn("<RowContainer> was created without expected prop 'props'");
    }
  }
  get containerRef() {
    throw new Error("<RowContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set containerRef(value) {
    throw new Error("<RowContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get props() {
    throw new Error("<RowContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set props(value) {
    throw new Error("<RowContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var RowContainer_default = RowContainer;

// src/containers/MasonryContainer.svelte
var { Object: Object_12 } = globals;
var file18 = "src/containers/MasonryContainer.svelte";
function get_each_context3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  child_ctx[12] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[15] = i;
  return child_ctx;
}
function create_each_block_1(key_1, ctx) {
  let first;
  let articlecomponent;
  let current;
  articlecomponent = new ArticleComponent_default({
    props: {
      view: ctx[1].articleView,
      articleProps: ctx[2][ctx[13]].articleProps,
      timelineProps: ctx[1].timelineArticleProps
    },
    $$inline: true
  });
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      create_component(articlecomponent.$$.fragment);
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      mount_component(articlecomponent, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const articlecomponent_changes = {};
      if (dirty & 2)
        articlecomponent_changes.view = ctx[1].articleView;
      if (dirty & 12)
        articlecomponent_changes.articleProps = ctx[2][ctx[13]].articleProps;
      if (dirty & 2)
        articlecomponent_changes.timelineProps = ctx[1].timelineArticleProps;
      articlecomponent.$set(articlecomponent_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(articlecomponent.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(articlecomponent.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      destroy_component(articlecomponent, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block_1.name,
    type: "each",
    source: "(99:3) {#each column.articles as idPairStr, index (idPairStr)}",
    ctx
  });
  return block;
}
function create_each_block3(key_1, ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t;
  let current;
  let each_value_1 = ctx[10].articles;
  validate_each_argument(each_value_1);
  const get_key = (ctx2) => ctx2[13];
  validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t = space();
      attr_dev(div, "class", "masonryColumn svelte-kjyw6u");
      add_location(div, file18, 95, 2, 3441);
      this.first = div;
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      append_dev(div, t);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 14) {
        each_value_1 = ctx[10].articles;
        validate_each_argument(each_value_1);
        group_outros();
        validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, t, get_each_context_1);
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block3.name,
    type: "each",
    source: "(95:1) {#each columns as column, i (i)}",
    ctx
  });
  return block;
}
function create_fragment19(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let current;
  let each_value = ctx[3];
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[12];
  validate_each_keys(ctx, each_value, get_each_context3, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block3(key, child_ctx));
  }
  const block = {
    c: function create4() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr_dev(div, "class", "articlesContainer masonryContainer svelte-kjyw6u");
      add_location(div, file18, 93, 0, 3331);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      ctx[6](div);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 14) {
        each_value = ctx2[3];
        validate_each_argument(each_value);
        group_outros();
        validate_each_keys(ctx2, each_value, get_each_context3, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block3, null, get_each_context3);
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      ctx[6](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment19.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance19($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("MasonryContainer", slots, []);
  let { containerRef = void 0 } = $$props;
  let { props } = $$props;
  let lastRebalanceTrigger = false;
  let lastColumnCount = props.columnCount;
  let uniqueArticles;
  let columns = [];
  function makeColumns() {
    $$invalidate(3, columns = []);
    for (let i = 0; i < props.columnCount; ++i)
      columns.push({ articles: [], ratio: 0 });
    const sortedArticles = Object.values(uniqueArticles);
    sortedArticles.sort((a, b) => a.index - b.index);
    for (const { articleProps } of sortedArticles)
      addArticle(articleProps.article.idPairStr);
    return columns;
  }
  function addArticle(idPairStr) {
    const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc].ratio ? currIndex : acc, 0);
    columns[smallestIndex].articles.push(idPairStr);
    $$invalidate(3, columns[smallestIndex].ratio += getRatio2(uniqueArticles[idPairStr].articleProps), columns);
    return smallestIndex;
  }
  function getRatio2(article) {
    return 1 + getActualArticle(article).medias.reduce((acc, curr) => acc + curr.ratio, 0);
  }
  const writable_props = ["containerRef", "props"];
  Object_12.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<MasonryContainer> was created with unknown prop '${key}'`);
  });
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      containerRef = $$value;
      $$invalidate(0, containerRef);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("containerRef" in $$props2)
      $$invalidate(0, containerRef = $$props2.containerRef);
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
  };
  $$self.$capture_state = () => ({
    ArticleComponent: ArticleComponent_default,
    getActualArticle,
    containerRef,
    props,
    lastRebalanceTrigger,
    lastColumnCount,
    uniqueArticles,
    columns,
    makeColumns,
    addArticle,
    getRatio: getRatio2
  });
  $$self.$inject_state = ($$props2) => {
    if ("containerRef" in $$props2)
      $$invalidate(0, containerRef = $$props2.containerRef);
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
    if ("lastRebalanceTrigger" in $$props2)
      $$invalidate(4, lastRebalanceTrigger = $$props2.lastRebalanceTrigger);
    if ("lastColumnCount" in $$props2)
      $$invalidate(5, lastColumnCount = $$props2.lastColumnCount);
    if ("uniqueArticles" in $$props2)
      $$invalidate(2, uniqueArticles = $$props2.uniqueArticles);
    if ("columns" in $$props2)
      $$invalidate(3, columns = $$props2.columns);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 2) {
      $: {
        $$invalidate(2, uniqueArticles = {});
        const idPairs = /* @__PURE__ */ new Set();
        for (const a of props.articles) {
          let lastSize = idPairs.size;
          idPairs.add(a.article.idPairStr);
          if (idPairs.size > lastSize) {
            $$invalidate(2, uniqueArticles[a.article.idPairStr] = { articleProps: a, index: lastSize }, uniqueArticles);
          }
        }
      }
    }
    if ($$self.$$.dirty & 50) {
      $:
        if (props.rebalanceTrigger !== lastRebalanceTrigger || props.columnCount !== lastColumnCount) {
          $$invalidate(3, columns = []);
          $$invalidate(4, lastRebalanceTrigger = props.rebalanceTrigger);
          $$invalidate(5, lastColumnCount = props.columnCount);
        }
    }
    if ($$self.$$.dirty & 12) {
      $: {
        if (!columns.length) {
          $$invalidate(3, columns = makeColumns());
        } else {
          const columnsChanged = /* @__PURE__ */ new Set();
          const addedArticles = [];
          for (let i = 0; i < columns.length; ++i) {
            for (let j = 0; j < columns[i].articles.length; ) {
              if (!uniqueArticles[columns[i].articles[j]]) {
                columns[i].articles.splice(j, 1);
                columnsChanged.add(i);
              } else
                ++j;
            }
          }
          for (const { articleProps, index } of Object.values(uniqueArticles)) {
            if (!columns.some((c) => c.articles.some((idPair) => uniqueArticles[idPair].articleProps.article.idPairStr === articleProps.article.idPairStr))) {
              addedArticles.push({
                idPairStr: articleProps.article.idPairStr,
                index
              });
            }
          }
          addedArticles.sort((a, b) => a.index - b.index);
          for (const { idPairStr } of addedArticles)
            columnsChanged.add(addArticle(idPairStr));
          for (let i = 0; i < columns.length; ++i)
            columns[i].articles.sort((a, b) => uniqueArticles[a].index - uniqueArticles[b].index);
          for (const i of columnsChanged.values())
            $$invalidate(3, columns[i].ratio = columns[i].articles.reduce((acc, curr) => acc + getRatio2(uniqueArticles[curr].articleProps), 0), columns);
        }
      }
    }
  };
  return [
    containerRef,
    props,
    uniqueArticles,
    columns,
    lastRebalanceTrigger,
    lastColumnCount,
    div_binding
  ];
}
var MasonryContainer = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance19, create_fragment19, safe_not_equal, { containerRef: 0, props: 1 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "MasonryContainer",
      options,
      id: create_fragment19.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("props" in props)) {
      console.warn("<MasonryContainer> was created without expected prop 'props'");
    }
  }
  get containerRef() {
    throw new Error("<MasonryContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set containerRef(value) {
    throw new Error("<MasonryContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get props() {
    throw new Error("<MasonryContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set props(value) {
    throw new Error("<MasonryContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var MasonryContainer_default = MasonryContainer;

// src/articles/index.ts
var MONTH_ABBREVS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function shortTimestamp(date) {
  const timeSince = Date.now() - date.getTime();
  if (timeSince < 1e3)
    return "just now";
  else if (timeSince < 6e4)
    return `${Math.floor(timeSince / 1e3)}s`;
  else if (timeSince < 36e5)
    return `${Math.floor(timeSince / 6e4)}m`;
  else if (timeSince < 864e5)
    return `${Math.floor(timeSince / 36e5)}h`;
  else if (timeSince < 6048e5)
    return `${Math.floor(timeSince / 864e5)}d`;
  else
    return `${MONTH_ABBREVS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

// src/articles/social/SocialMedia.svelte
var file19 = "src/articles/social/SocialMedia.svelte";
function get_each_context4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i];
  child_ctx[8] = i;
  return child_ctx;
}
function create_if_block_26(ctx) {
  let div;
  let video;
  let source;
  let source_src_value;
  let t;
  let mounted;
  let dispose;
  function click_handler_2() {
    return ctx[5](ctx[8]);
  }
  const block = {
    c: function create4() {
      div = element("div");
      video = element("video");
      source = element("source");
      t = space();
      if (!src_url_equal(source.src, source_src_value = ctx[6].src))
        attr_dev(source, "src", source_src_value);
      attr_dev(source, "type", "video/mp4");
      add_location(source, file19, 52, 5, 1572);
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      attr_dev(video, "class", "svelte-xc0k1m");
      add_location(video, file19, 51, 4, 1478);
      attr_dev(div, "class", "postMedia postVideo svelte-xc0k1m");
      add_location(div, file19, 49, 3, 1390);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      append_dev(div, video);
      append_dev(video, source);
      append_dev(div, t);
      if (!mounted) {
        dispose = listen_dev(video, "click", prevent_default(click_handler_2), false, true, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && !src_url_equal(source.src, source_src_value = ctx[6].src)) {
        attr_dev(source, "src", source_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_26.name,
    type: "if",
    source: "(49:122) ",
    ctx
  });
  return block;
}
function create_if_block_17(ctx) {
  let div;
  let video;
  let source;
  let source_src_value;
  let t;
  let mounted;
  let dispose;
  function click_handler_1() {
    return ctx[4](ctx[8]);
  }
  const block = {
    c: function create4() {
      div = element("div");
      video = element("video");
      source = element("source");
      t = space();
      if (!src_url_equal(source.src, source_src_value = ctx[6].src))
        attr_dev(source, "src", source_src_value);
      attr_dev(source, "type", "video/mp4");
      add_location(source, file19, 45, 5, 1198);
      video.controls = true;
      attr_dev(video, "class", "svelte-xc0k1m");
      add_location(video, file19, 44, 4, 1124);
      attr_dev(div, "class", "postMedia postVideo svelte-xc0k1m");
      add_location(div, file19, 42, 3, 1036);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      append_dev(div, video);
      append_dev(video, source);
      append_dev(div, t);
      if (!mounted) {
        dispose = listen_dev(video, "click", prevent_default(click_handler_1), false, true, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && !src_url_equal(source.src, source_src_value = ctx[6].src)) {
        attr_dev(source, "src", source_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_17.name,
    type: "if",
    source: "(42:81) ",
    ctx
  });
  return block;
}
function create_if_block11(ctx) {
  let div1;
  let div0;
  let t0;
  let img;
  let img_alt_value;
  let img_src_value;
  let t1;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[3](ctx[8]);
  }
  const block = {
    c: function create4() {
      div1 = element("div");
      div0 = element("div");
      t0 = space();
      img = element("img");
      t1 = space();
      attr_dev(div0, "class", "is-hidden imgPlaceHolder svelte-xc0k1m");
      set_style(div0, "aspect-ratio", 1 / ctx[6].ratio, false);
      add_location(div0, file19, 38, 4, 778);
      attr_dev(img, "alt", img_alt_value = ctx[0].id);
      if (!src_url_equal(img.src, img_src_value = ctx[6].src))
        attr_dev(img, "src", img_src_value);
      attr_dev(img, "class", "svelte-xc0k1m");
      add_location(img, file19, 39, 4, 864);
      attr_dev(div1, "class", "mediaHolder svelte-xc0k1m");
      add_location(div1, file19, 37, 3, 748);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, div0);
      append_dev(div1, t0);
      append_dev(div1, img);
      append_dev(div1, t1);
      if (!mounted) {
        dispose = listen_dev(img, "click", click_handler, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1) {
        set_style(div0, "aspect-ratio", 1 / ctx[6].ratio, false);
      }
      if (dirty & 1 && img_alt_value !== (img_alt_value = ctx[0].id)) {
        attr_dev(img, "alt", img_alt_value);
      }
      if (dirty & 1 && !src_url_equal(img.src, img_src_value = ctx[6].src)) {
        attr_dev(img, "src", img_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block11.name,
    type: "if",
    source: "(37:2) {#if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}",
    ctx
  });
  return block;
}
function create_each_block4(key_1, ctx) {
  let first;
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (ctx2[6].mediaType === 0 /* Image */ || ctx2[6].mediaType === 3 /* Gif */)
      return create_if_block11;
    if (!ctx2[1].animatedAsGifs && ctx2[6].mediaType === 1 /* Video */)
      return create_if_block_17;
    if (ctx2[6].mediaType === 2 /* VideoGif */ || ctx2[1].animatedAsGifs && ctx2[6].mediaType === 1 /* Video */)
      return create_if_block_26;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block = current_block_type && current_block_type(ctx);
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
        if_block.p(ctx, dirty);
      } else {
        if (if_block)
          if_block.d(1);
        if_block = current_block_type && current_block_type(ctx);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      if (if_block) {
        if_block.d(detaching);
      }
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block4.name,
    type: "each",
    source: "(36:1) {#each article.medias as media, index (index)}",
    ctx
  });
  return block;
}
function create_fragment20(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value = ctx[0].medias;
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[8];
  validate_each_keys(ctx, each_value, get_each_context4, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context4(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block4(key, child_ctx));
  }
  const block = {
    c: function create4() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr_dev(div, "class", "postMedia postImages svelte-xc0k1m");
      add_location(div, file19, 34, 0, 581);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 7) {
        each_value = ctx2[0].medias;
        validate_each_argument(each_value);
        validate_each_keys(ctx2, each_value, get_each_context4, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, destroy_block, create_each_block4, null, get_each_context4);
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment20.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance20($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("SocialMedia", slots, []);
  let { article } = $$props;
  let { timelineProps } = $$props;
  let { onMediaClick } = $$props;
  const writable_props = ["article", "timelineProps", "onMediaClick"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<SocialMedia> was created with unknown prop '${key}'`);
  });
  const click_handler = (index) => onMediaClick(index);
  const click_handler_1 = (index) => onMediaClick(index);
  const click_handler_2 = (index) => onMediaClick(index);
  $$self.$$set = ($$props2) => {
    if ("article" in $$props2)
      $$invalidate(0, article = $$props2.article);
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("onMediaClick" in $$props2)
      $$invalidate(2, onMediaClick = $$props2.onMediaClick);
  };
  $$self.$capture_state = () => ({
    Article,
    MediaType,
    article,
    timelineProps,
    onMediaClick
  });
  $$self.$inject_state = ($$props2) => {
    if ("article" in $$props2)
      $$invalidate(0, article = $$props2.article);
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("onMediaClick" in $$props2)
      $$invalidate(2, onMediaClick = $$props2.onMediaClick);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    article,
    timelineProps,
    onMediaClick,
    click_handler,
    click_handler_1,
    click_handler_2
  ];
}
var SocialMedia = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance20, create_fragment20, safe_not_equal, {
      article: 0,
      timelineProps: 1,
      onMediaClick: 2
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "SocialMedia",
      options,
      id: create_fragment20.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("article" in props)) {
      console.warn("<SocialMedia> was created without expected prop 'article'");
    }
    if (ctx[1] === void 0 && !("timelineProps" in props)) {
      console.warn("<SocialMedia> was created without expected prop 'timelineProps'");
    }
    if (ctx[2] === void 0 && !("onMediaClick" in props)) {
      console.warn("<SocialMedia> was created without expected prop 'onMediaClick'");
    }
  }
  get article() {
    throw new Error("<SocialMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set article(value) {
    throw new Error("<SocialMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get timelineProps() {
    throw new Error("<SocialMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set timelineProps(value) {
    throw new Error("<SocialMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onMediaClick() {
    throw new Error("<SocialMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onMediaClick(value) {
    throw new Error("<SocialMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var SocialMedia_default = SocialMedia;

// node_modules/svelte-fa/src/utils.js
var parseNumber = parseFloat;
function joinCss(obj, separator = ";") {
  let texts;
  if (Array.isArray(obj)) {
    texts = obj.filter((text2) => text2);
  } else {
    texts = [];
    for (const prop in obj) {
      if (obj[prop]) {
        texts.push(`${prop}:${obj[prop]}`);
      }
    }
  }
  return texts.join(separator);
}
function getStyles(style, size, pull, fw) {
  let float;
  let width;
  const height = "1em";
  let lineHeight;
  let fontSize;
  let textAlign;
  let verticalAlign = "-.125em";
  const overflow = "visible";
  if (fw) {
    textAlign = "center";
    width = "1.25em";
  }
  if (pull) {
    float = pull;
  }
  if (size) {
    if (size == "lg") {
      fontSize = "1.33333em";
      lineHeight = ".75em";
      verticalAlign = "-.225em";
    } else if (size == "xs") {
      fontSize = ".75em";
    } else if (size == "sm") {
      fontSize = ".875em";
    } else {
      fontSize = size.replace("x", "em");
    }
  }
  return joinCss([
    joinCss({
      float,
      width,
      height,
      "line-height": lineHeight,
      "font-size": fontSize,
      "text-align": textAlign,
      "vertical-align": verticalAlign,
      "transform-origin": "center",
      overflow
    }),
    style
  ]);
}
function getTransform(scale2, translateX, translateY, rotate, flip, translateTimes = 1, translateUnit = "", rotateUnit = "") {
  let flipX = 1;
  let flipY = 1;
  if (flip) {
    if (flip == "horizontal") {
      flipX = -1;
    } else if (flip == "vertical") {
      flipY = -1;
    } else {
      flipX = flipY = -1;
    }
  }
  return joinCss([
    `translate(${parseNumber(translateX) * translateTimes}${translateUnit},${parseNumber(translateY) * translateTimes}${translateUnit})`,
    `scale(${flipX * parseNumber(scale2)},${flipY * parseNumber(scale2)})`,
    rotate && `rotate(${rotate}${rotateUnit})`
  ], " ");
}

// node_modules/svelte-fa/src/fa.svelte
var file20 = "node_modules/svelte-fa/src/fa.svelte";
function create_if_block12(ctx) {
  let svg;
  let g1;
  let g0;
  let g1_transform_value;
  let g1_transform_origin_value;
  let svg_class_value;
  let svg_viewBox_value;
  function select_block_type(ctx2, dirty) {
    if (typeof ctx2[10][4] == "string")
      return create_if_block_18;
    return create_else_block3;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block = current_block_type(ctx);
  const block = {
    c: function create4() {
      svg = svg_element("svg");
      g1 = svg_element("g");
      g0 = svg_element("g");
      if_block.c();
      attr_dev(g0, "transform", ctx[12]);
      add_location(g0, file20, 81, 6, 1381);
      attr_dev(g1, "transform", g1_transform_value = "translate(" + ctx[10][0] / 2 + " " + ctx[10][1] / 2 + ")");
      attr_dev(g1, "transform-origin", g1_transform_origin_value = ctx[10][0] / 4 + " 0");
      add_location(g1, file20, 77, 4, 1277);
      attr_dev(svg, "id", ctx[1]);
      attr_dev(svg, "class", svg_class_value = "svelte-fa " + ctx[0] + " svelte-1cj2gr0");
      attr_dev(svg, "style", ctx[11]);
      attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + ctx[10][0] + " " + ctx[10][1]);
      attr_dev(svg, "aria-hidden", "true");
      attr_dev(svg, "role", "img");
      attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
      toggle_class(svg, "pulse", ctx[4]);
      toggle_class(svg, "spin", ctx[3]);
      add_location(svg, file20, 66, 2, 1071);
    },
    m: function mount(target, anchor) {
      insert_dev(target, svg, anchor);
      append_dev(svg, g1);
      append_dev(g1, g0);
      if_block.m(g0, null);
    },
    p: function update3(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(g0, null);
        }
      }
      if (dirty & 4096) {
        attr_dev(g0, "transform", ctx2[12]);
      }
      if (dirty & 1024 && g1_transform_value !== (g1_transform_value = "translate(" + ctx2[10][0] / 2 + " " + ctx2[10][1] / 2 + ")")) {
        attr_dev(g1, "transform", g1_transform_value);
      }
      if (dirty & 1024 && g1_transform_origin_value !== (g1_transform_origin_value = ctx2[10][0] / 4 + " 0")) {
        attr_dev(g1, "transform-origin", g1_transform_origin_value);
      }
      if (dirty & 2) {
        attr_dev(svg, "id", ctx2[1]);
      }
      if (dirty & 1 && svg_class_value !== (svg_class_value = "svelte-fa " + ctx2[0] + " svelte-1cj2gr0")) {
        attr_dev(svg, "class", svg_class_value);
      }
      if (dirty & 2048) {
        attr_dev(svg, "style", ctx2[11]);
      }
      if (dirty & 1024 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + ctx2[10][0] + " " + ctx2[10][1])) {
        attr_dev(svg, "viewBox", svg_viewBox_value);
      }
      if (dirty & 17) {
        toggle_class(svg, "pulse", ctx2[4]);
      }
      if (dirty & 9) {
        toggle_class(svg, "spin", ctx2[3]);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(svg);
      if_block.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block12.name,
    type: "if",
    source: "(66:0) {#if i[4]}",
    ctx
  });
  return block;
}
function create_else_block3(ctx) {
  let path0;
  let path0_d_value;
  let path0_fill_value;
  let path0_fill_opacity_value;
  let path0_transform_value;
  let path1;
  let path1_d_value;
  let path1_fill_value;
  let path1_fill_opacity_value;
  let path1_transform_value;
  const block = {
    c: function create4() {
      path0 = svg_element("path");
      path1 = svg_element("path");
      attr_dev(path0, "d", path0_d_value = ctx[10][4][0]);
      attr_dev(path0, "fill", path0_fill_value = ctx[6] || ctx[2] || "currentColor");
      attr_dev(path0, "fill-opacity", path0_fill_opacity_value = ctx[9] != false ? ctx[7] : ctx[8]);
      attr_dev(path0, "transform", path0_transform_value = "translate(" + ctx[10][0] / -2 + " " + ctx[10][1] / -2 + ")");
      add_location(path0, file20, 90, 10, 1662);
      attr_dev(path1, "d", path1_d_value = ctx[10][4][1]);
      attr_dev(path1, "fill", path1_fill_value = ctx[5] || ctx[2] || "currentColor");
      attr_dev(path1, "fill-opacity", path1_fill_opacity_value = ctx[9] != false ? ctx[8] : ctx[7]);
      attr_dev(path1, "transform", path1_transform_value = "translate(" + ctx[10][0] / -2 + " " + ctx[10][1] / -2 + ")");
      add_location(path1, file20, 96, 10, 1919);
    },
    m: function mount(target, anchor) {
      insert_dev(target, path0, anchor);
      insert_dev(target, path1, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1024 && path0_d_value !== (path0_d_value = ctx2[10][4][0])) {
        attr_dev(path0, "d", path0_d_value);
      }
      if (dirty & 68 && path0_fill_value !== (path0_fill_value = ctx2[6] || ctx2[2] || "currentColor")) {
        attr_dev(path0, "fill", path0_fill_value);
      }
      if (dirty & 896 && path0_fill_opacity_value !== (path0_fill_opacity_value = ctx2[9] != false ? ctx2[7] : ctx2[8])) {
        attr_dev(path0, "fill-opacity", path0_fill_opacity_value);
      }
      if (dirty & 1024 && path0_transform_value !== (path0_transform_value = "translate(" + ctx2[10][0] / -2 + " " + ctx2[10][1] / -2 + ")")) {
        attr_dev(path0, "transform", path0_transform_value);
      }
      if (dirty & 1024 && path1_d_value !== (path1_d_value = ctx2[10][4][1])) {
        attr_dev(path1, "d", path1_d_value);
      }
      if (dirty & 36 && path1_fill_value !== (path1_fill_value = ctx2[5] || ctx2[2] || "currentColor")) {
        attr_dev(path1, "fill", path1_fill_value);
      }
      if (dirty & 896 && path1_fill_opacity_value !== (path1_fill_opacity_value = ctx2[9] != false ? ctx2[8] : ctx2[7])) {
        attr_dev(path1, "fill-opacity", path1_fill_opacity_value);
      }
      if (dirty & 1024 && path1_transform_value !== (path1_transform_value = "translate(" + ctx2[10][0] / -2 + " " + ctx2[10][1] / -2 + ")")) {
        attr_dev(path1, "transform", path1_transform_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(path0);
      if (detaching)
        detach_dev(path1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block3.name,
    type: "else",
    source: "(89:8) {:else}",
    ctx
  });
  return block;
}
function create_if_block_18(ctx) {
  let path;
  let path_d_value;
  let path_fill_value;
  let path_transform_value;
  const block = {
    c: function create4() {
      path = svg_element("path");
      attr_dev(path, "d", path_d_value = ctx[10][4]);
      attr_dev(path, "fill", path_fill_value = ctx[2] || ctx[5] || "currentColor");
      attr_dev(path, "transform", path_transform_value = "translate(" + ctx[10][0] / -2 + " " + ctx[10][1] / -2 + ")");
      add_location(path, file20, 83, 10, 1445);
    },
    m: function mount(target, anchor) {
      insert_dev(target, path, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1024 && path_d_value !== (path_d_value = ctx2[10][4])) {
        attr_dev(path, "d", path_d_value);
      }
      if (dirty & 36 && path_fill_value !== (path_fill_value = ctx2[2] || ctx2[5] || "currentColor")) {
        attr_dev(path, "fill", path_fill_value);
      }
      if (dirty & 1024 && path_transform_value !== (path_transform_value = "translate(" + ctx2[10][0] / -2 + " " + ctx2[10][1] / -2 + ")")) {
        attr_dev(path, "transform", path_transform_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(path);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_18.name,
    type: "if",
    source: "(83:8) {#if typeof i[4] == 'string'}",
    ctx
  });
  return block;
}
function create_fragment21(ctx) {
  let if_block_anchor;
  let if_block = ctx[10][4] && create_if_block12(ctx);
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[10][4]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block12(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment21.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance21($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Fa", slots, []);
  let { class: clazz = "" } = $$props;
  let { id = "" } = $$props;
  let { style = "" } = $$props;
  let { icon } = $$props;
  let { size = "" } = $$props;
  let { color = "" } = $$props;
  let { fw = false } = $$props;
  let { pull = "" } = $$props;
  let { scale: scale2 = 1 } = $$props;
  let { translateX = 0 } = $$props;
  let { translateY = 0 } = $$props;
  let { rotate = "" } = $$props;
  let { flip = false } = $$props;
  let { spin = false } = $$props;
  let { pulse = false } = $$props;
  let { primaryColor = "" } = $$props;
  let { secondaryColor = "" } = $$props;
  let { primaryOpacity = 1 } = $$props;
  let { secondaryOpacity = 0.4 } = $$props;
  let { swapOpacity = false } = $$props;
  let i;
  let s;
  let transform;
  const writable_props = [
    "class",
    "id",
    "style",
    "icon",
    "size",
    "color",
    "fw",
    "pull",
    "scale",
    "translateX",
    "translateY",
    "rotate",
    "flip",
    "spin",
    "pulse",
    "primaryColor",
    "secondaryColor",
    "primaryOpacity",
    "secondaryOpacity",
    "swapOpacity"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Fa> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("class" in $$props2)
      $$invalidate(0, clazz = $$props2.class);
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
    if ("style" in $$props2)
      $$invalidate(13, style = $$props2.style);
    if ("icon" in $$props2)
      $$invalidate(14, icon = $$props2.icon);
    if ("size" in $$props2)
      $$invalidate(15, size = $$props2.size);
    if ("color" in $$props2)
      $$invalidate(2, color = $$props2.color);
    if ("fw" in $$props2)
      $$invalidate(16, fw = $$props2.fw);
    if ("pull" in $$props2)
      $$invalidate(17, pull = $$props2.pull);
    if ("scale" in $$props2)
      $$invalidate(18, scale2 = $$props2.scale);
    if ("translateX" in $$props2)
      $$invalidate(19, translateX = $$props2.translateX);
    if ("translateY" in $$props2)
      $$invalidate(20, translateY = $$props2.translateY);
    if ("rotate" in $$props2)
      $$invalidate(21, rotate = $$props2.rotate);
    if ("flip" in $$props2)
      $$invalidate(22, flip = $$props2.flip);
    if ("spin" in $$props2)
      $$invalidate(3, spin = $$props2.spin);
    if ("pulse" in $$props2)
      $$invalidate(4, pulse = $$props2.pulse);
    if ("primaryColor" in $$props2)
      $$invalidate(5, primaryColor = $$props2.primaryColor);
    if ("secondaryColor" in $$props2)
      $$invalidate(6, secondaryColor = $$props2.secondaryColor);
    if ("primaryOpacity" in $$props2)
      $$invalidate(7, primaryOpacity = $$props2.primaryOpacity);
    if ("secondaryOpacity" in $$props2)
      $$invalidate(8, secondaryOpacity = $$props2.secondaryOpacity);
    if ("swapOpacity" in $$props2)
      $$invalidate(9, swapOpacity = $$props2.swapOpacity);
  };
  $$self.$capture_state = () => ({
    getStyles,
    getTransform,
    clazz,
    id,
    style,
    icon,
    size,
    color,
    fw,
    pull,
    scale: scale2,
    translateX,
    translateY,
    rotate,
    flip,
    spin,
    pulse,
    primaryColor,
    secondaryColor,
    primaryOpacity,
    secondaryOpacity,
    swapOpacity,
    i,
    s,
    transform
  });
  $$self.$inject_state = ($$props2) => {
    if ("clazz" in $$props2)
      $$invalidate(0, clazz = $$props2.clazz);
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
    if ("style" in $$props2)
      $$invalidate(13, style = $$props2.style);
    if ("icon" in $$props2)
      $$invalidate(14, icon = $$props2.icon);
    if ("size" in $$props2)
      $$invalidate(15, size = $$props2.size);
    if ("color" in $$props2)
      $$invalidate(2, color = $$props2.color);
    if ("fw" in $$props2)
      $$invalidate(16, fw = $$props2.fw);
    if ("pull" in $$props2)
      $$invalidate(17, pull = $$props2.pull);
    if ("scale" in $$props2)
      $$invalidate(18, scale2 = $$props2.scale);
    if ("translateX" in $$props2)
      $$invalidate(19, translateX = $$props2.translateX);
    if ("translateY" in $$props2)
      $$invalidate(20, translateY = $$props2.translateY);
    if ("rotate" in $$props2)
      $$invalidate(21, rotate = $$props2.rotate);
    if ("flip" in $$props2)
      $$invalidate(22, flip = $$props2.flip);
    if ("spin" in $$props2)
      $$invalidate(3, spin = $$props2.spin);
    if ("pulse" in $$props2)
      $$invalidate(4, pulse = $$props2.pulse);
    if ("primaryColor" in $$props2)
      $$invalidate(5, primaryColor = $$props2.primaryColor);
    if ("secondaryColor" in $$props2)
      $$invalidate(6, secondaryColor = $$props2.secondaryColor);
    if ("primaryOpacity" in $$props2)
      $$invalidate(7, primaryOpacity = $$props2.primaryOpacity);
    if ("secondaryOpacity" in $$props2)
      $$invalidate(8, secondaryOpacity = $$props2.secondaryOpacity);
    if ("swapOpacity" in $$props2)
      $$invalidate(9, swapOpacity = $$props2.swapOpacity);
    if ("i" in $$props2)
      $$invalidate(10, i = $$props2.i);
    if ("s" in $$props2)
      $$invalidate(11, s = $$props2.s);
    if ("transform" in $$props2)
      $$invalidate(12, transform = $$props2.transform);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 16384) {
      $:
        $$invalidate(10, i = icon && icon.icon || [0, 0, "", [], ""]);
    }
    if ($$self.$$.dirty & 237568) {
      $:
        $$invalidate(11, s = getStyles(style, size, pull, fw));
    }
    if ($$self.$$.dirty & 8126464) {
      $:
        $$invalidate(12, transform = getTransform(scale2, translateX, translateY, rotate, flip, 512));
    }
  };
  return [
    clazz,
    id,
    color,
    spin,
    pulse,
    primaryColor,
    secondaryColor,
    primaryOpacity,
    secondaryOpacity,
    swapOpacity,
    i,
    s,
    transform,
    style,
    icon,
    size,
    fw,
    pull,
    scale2,
    translateX,
    translateY,
    rotate,
    flip
  ];
}
var Fa = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance21, create_fragment21, safe_not_equal, {
      class: 0,
      id: 1,
      style: 13,
      icon: 14,
      size: 15,
      color: 2,
      fw: 16,
      pull: 17,
      scale: 18,
      translateX: 19,
      translateY: 20,
      rotate: 21,
      flip: 22,
      spin: 3,
      pulse: 4,
      primaryColor: 5,
      secondaryColor: 6,
      primaryOpacity: 7,
      secondaryOpacity: 8,
      swapOpacity: 9
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Fa",
      options,
      id: create_fragment21.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[14] === void 0 && !("icon" in props)) {
      console.warn("<Fa> was created without expected prop 'icon'");
    }
  }
  get class() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set class(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get id() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set id(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get style() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set style(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get icon() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set icon(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get size() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set size(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get color() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set color(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get fw() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set fw(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get pull() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set pull(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get scale() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set scale(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get translateX() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set translateX(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get translateY() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set translateY(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get rotate() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set rotate(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get flip() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set flip(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get spin() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set spin(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get pulse() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set pulse(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get primaryColor() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set primaryColor(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get secondaryColor() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set secondaryColor(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get primaryOpacity() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set primaryOpacity(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get secondaryOpacity() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set secondaryOpacity(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get swapOpacity() {
    throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set swapOpacity(value) {
    throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var fa_default = Fa;

// node_modules/@fortawesome/free-regular-svg-icons/index.es.js
var faHeart = {
  prefix: "far",
  iconName: "heart",
  icon: [512, 512, [128153, 128154, 128155, 128156, 128420, 129293, 129294, 129505, 10084, 61578, 9829], "f004", "M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"]
};

// node_modules/@fortawesome/free-solid-svg-icons/index.es.js
var faAngleDown = {
  prefix: "fas",
  iconName: "angle-down",
  icon: [384, 512, [8964], "f107", "M192 384c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L192 306.8l137.4-137.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-160 160C208.4 380.9 200.2 384 192 384z"]
};
var faAnglesLeft = {
  prefix: "fas",
  iconName: "angles-left",
  icon: [448, 512, [171, "angle-double-left"], "f100", "M77.25 256l137.4-137.4c12.5-12.5 12.5-32.75 0-45.25s-32.75-12.5-45.25 0l-160 160c-12.5 12.5-12.5 32.75 0 45.25l160 160C175.6 444.9 183.8 448 192 448s16.38-3.125 22.62-9.375c12.5-12.5 12.5-32.75 0-45.25L77.25 256zM269.3 256l137.4-137.4c12.5-12.5 12.5-32.75 0-45.25s-32.75-12.5-45.25 0l-160 160c-12.5 12.5-12.5 32.75 0 45.25l160 160C367.6 444.9 375.8 448 384 448s16.38-3.125 22.62-9.375c12.5-12.5 12.5-32.75 0-45.25L269.3 256z"]
};
var faAngleDoubleLeft = faAnglesLeft;
var faArrowDown = {
  prefix: "fas",
  iconName: "arrow-down",
  icon: [384, 512, [8595], "f063", "M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0S387.1 298.1 374.6 310.6z"]
};
var faArrowUp = {
  prefix: "fas",
  iconName: "arrow-up",
  icon: [384, 512, [8593], "f062", "M374.6 246.6C368.4 252.9 360.2 256 352 256s-16.38-3.125-22.62-9.375L224 141.3V448c0 17.69-14.33 31.1-31.1 31.1S160 465.7 160 448V141.3L54.63 246.6c-12.5 12.5-32.75 12.5-45.25 0s-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0l160 160C387.1 213.9 387.1 234.1 374.6 246.6z"]
};
var faBarsProgress = {
  prefix: "fas",
  iconName: "bars-progress",
  icon: [512, 512, ["tasks-alt"], "f828", "M464 64C490.5 64 512 85.49 512 112V176C512 202.5 490.5 224 464 224H48C21.49 224 0 202.5 0 176V112C0 85.49 21.49 64 48 64H464zM448 128H320V160H448V128zM464 288C490.5 288 512 309.5 512 336V400C512 426.5 490.5 448 464 448H48C21.49 448 0 426.5 0 400V336C0 309.5 21.49 288 48 288H464zM192 352V384H448V352H192z"]
};
var faEllipsis = {
  prefix: "fas",
  iconName: "ellipsis",
  icon: [448, 512, ["ellipsis-h"], "f141", "M120 256C120 286.9 94.93 312 64 312C33.07 312 8 286.9 8 256C8 225.1 33.07 200 64 200C94.93 200 120 225.1 120 256zM280 256C280 286.9 254.9 312 224 312C193.1 312 168 286.9 168 256C168 225.1 193.1 200 224 200C254.9 200 280 225.1 280 256zM328 256C328 225.1 353.1 200 384 200C414.9 200 440 225.1 440 256C440 286.9 414.9 312 384 312C353.1 312 328 286.9 328 256z"]
};
var faEllipsisH = faEllipsis;
var faEllipsisVertical = {
  prefix: "fas",
  iconName: "ellipsis-vertical",
  icon: [128, 512, ["ellipsis-v"], "f142", "M64 360C94.93 360 120 385.1 120 416C120 446.9 94.93 472 64 472C33.07 472 8 446.9 8 416C8 385.1 33.07 360 64 360zM64 200C94.93 200 120 225.1 120 256C120 286.9 94.93 312 64 312C33.07 312 8 286.9 8 256C8 225.1 33.07 200 64 200zM64 152C33.07 152 8 126.9 8 96C8 65.07 33.07 40 64 40C94.93 40 120 65.07 120 96C120 126.9 94.93 152 64 152z"]
};
var faEllipsisV = faEllipsisVertical;
var faEye = {
  prefix: "fas",
  iconName: "eye",
  icon: [576, 512, [128065], "f06e", "M279.6 160.4C282.4 160.1 285.2 160 288 160C341 160 384 202.1 384 256C384 309 341 352 288 352C234.1 352 192 309 192 256C192 253.2 192.1 250.4 192.4 247.6C201.7 252.1 212.5 256 224 256C259.3 256 288 227.3 288 192C288 180.5 284.1 169.7 279.6 160.4zM480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6V112.6zM288 112C208.5 112 144 176.5 144 256C144 335.5 208.5 400 288 400C367.5 400 432 335.5 432 256C432 176.5 367.5 112 288 112z"]
};
var faEyeSlash = {
  prefix: "fas",
  iconName: "eye-slash",
  icon: [640, 512, [], "f070", "M150.7 92.77C195 58.27 251.8 32 320 32C400.8 32 465.5 68.84 512.6 112.6C559.4 156 590.7 207.1 605.5 243.7C608.8 251.6 608.8 260.4 605.5 268.3C592.1 300.6 565.2 346.1 525.6 386.7L630.8 469.1C641.2 477.3 643.1 492.4 634.9 502.8C626.7 513.2 611.6 515.1 601.2 506.9L9.196 42.89C-1.236 34.71-3.065 19.63 5.112 9.196C13.29-1.236 28.37-3.065 38.81 5.112L150.7 92.77zM223.1 149.5L313.4 220.3C317.6 211.8 320 202.2 320 191.1C320 180.5 316.1 169.7 311.6 160.4C314.4 160.1 317.2 159.1 320 159.1C373 159.1 416 202.1 416 255.1C416 269.7 413.1 282.7 407.1 294.5L446.6 324.7C457.7 304.3 464 280.9 464 255.1C464 176.5 399.5 111.1 320 111.1C282.7 111.1 248.6 126.2 223.1 149.5zM320 480C239.2 480 174.5 443.2 127.4 399.4C80.62 355.1 49.34 304 34.46 268.3C31.18 260.4 31.18 251.6 34.46 243.7C44 220.8 60.29 191.2 83.09 161.5L177.4 235.8C176.5 242.4 176 249.1 176 255.1C176 335.5 240.5 400 320 400C338.7 400 356.6 396.4 373 389.9L446.2 447.5C409.9 467.1 367.8 480 320 480H320z"]
};
var faGear = {
  prefix: "fas",
  iconName: "gear",
  icon: [512, 512, [9881, "cog"], "f013", "M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z"]
};
var faCog = faGear;
var faHeart2 = {
  prefix: "fas",
  iconName: "heart",
  icon: [512, 512, [128153, 128154, 128155, 128156, 128420, 129293, 129294, 129505, 10084, 61578, 9829], "f004", "M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"]
};
var faMaximize = {
  prefix: "fas",
  iconName: "maximize",
  icon: [448, 512, ["expand-arrows-alt"], "f31e", "M447.1 319.1v135.1c0 13.26-10.75 23.1-23.1 23.1h-135.1c-12.94 0-24.61-7.781-29.56-19.75c-4.906-11.1-2.203-25.72 6.937-34.87l30.06-30.06L224 323.9l-71.43 71.44l30.06 30.06c9.156 9.156 11.91 22.91 6.937 34.87C184.6 472.2 172.9 479.1 160 479.1H24c-13.25 0-23.1-10.74-23.1-23.1v-135.1c0-12.94 7.781-24.61 19.75-29.56C23.72 288.8 27.88 288 32 288c8.312 0 16.5 3.242 22.63 9.367l30.06 30.06l71.44-71.44L84.69 184.6L54.63 214.6c-9.156 9.156-22.91 11.91-34.87 6.937C7.798 216.6 .0013 204.9 .0013 191.1v-135.1c0-13.26 10.75-23.1 23.1-23.1h135.1c12.94 0 24.61 7.781 29.56 19.75C191.2 55.72 191.1 59.87 191.1 63.1c0 8.312-3.237 16.5-9.362 22.63L152.6 116.7l71.44 71.44l71.43-71.44l-30.06-30.06c-9.156-9.156-11.91-22.91-6.937-34.87c4.937-11.95 16.62-19.75 29.56-19.75h135.1c13.26 0 23.1 10.75 23.1 23.1v135.1c0 12.94-7.781 24.61-19.75 29.56c-11.1 4.906-25.72 2.203-34.87-6.937l-30.06-30.06l-71.43 71.43l71.44 71.44l30.06-30.06c9.156-9.156 22.91-11.91 34.87-6.937C440.2 295.4 447.1 307.1 447.1 319.1z"]
};
var faExpandArrowsAlt = faMaximize;
var faPlus = {
  prefix: "fas",
  iconName: "plus",
  icon: [448, 512, [10133, 61543, "add"], "2b", "M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"]
};
var faRetweet = {
  prefix: "fas",
  iconName: "retweet",
  icon: [640, 512, [], "f079", "M614.2 334.8C610.5 325.8 601.7 319.1 592 319.1H544V176C544 131.9 508.1 96 464 96h-128c-17.67 0-32 14.31-32 32s14.33 32 32 32h128C472.8 160 480 167.2 480 176v143.1h-48c-9.703 0-18.45 5.844-22.17 14.82s-1.656 19.29 5.203 26.16l80 80.02C499.7 445.7 505.9 448 512 448s12.28-2.344 16.97-7.031l80-80.02C615.8 354.1 617.9 343.8 614.2 334.8zM304 352h-128C167.2 352 160 344.8 160 336V192h48c9.703 0 18.45-5.844 22.17-14.82s1.656-19.29-5.203-26.16l-80-80.02C140.3 66.34 134.1 64 128 64S115.7 66.34 111 71.03l-80 80.02C24.17 157.9 22.11 168.2 25.83 177.2S38.3 192 48 192H96V336C96 380.1 131.9 416 176 416h128c17.67 0 32-14.31 32-32S321.7 352 304 352z"]
};
var faRotate = {
  prefix: "fas",
  iconName: "rotate",
  icon: [512, 512, [128260, "sync-alt"], "f2f1", "M449.9 39.96l-48.5 48.53C362.5 53.19 311.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.97 5.5 34.86-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c37.96 0 73 14.18 100.2 37.8L311.1 178C295.1 194.8 306.8 223.4 330.4 224h146.9C487.7 223.7 496 215.3 496 204.9V59.04C496 34.99 466.9 22.95 449.9 39.96zM441.8 289.6c-16.94-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-37.96 0-73-14.18-100.2-37.8L200 334C216.9 317.2 205.2 288.6 181.6 288H34.66C24.32 288.3 16 296.7 16 307.1v145.9c0 24.04 29.07 36.08 46.07 19.07l48.5-48.53C149.5 458.8 200.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"]
};
var faSyncAlt = faRotate;
var faScaleBalanced = {
  prefix: "fas",
  iconName: "scale-balanced",
  icon: [640, 512, [9878, "balance-scale"], "f24e", "M554.9 154.5c-17.62-35.25-68.12-35.38-85.87 0c-87 174.3-84.1 165.9-84.1 181.5c0 44.13 57.25 80 128 80s127.1-35.88 127.1-80C639.1 319.9 641.4 327.3 554.9 154.5zM439.1 320l71.96-144l72.17 144H439.1zM256 336c0-16.12 1.375-8.75-85.12-181.5c-17.62-35.25-68.12-35.38-85.87 0c-87 174.3-84.1 165.9-84.1 181.5c0 44.13 57.25 80 127.1 80S256 380.1 256 336zM127.9 176L200.1 320H55.96L127.9 176zM495.1 448h-143.1V153.3C375.5 143 393.1 121.8 398.4 96h113.6c17.67 0 31.1-14.33 31.1-32s-14.33-32-31.1-32h-128.4c-14.62-19.38-37.5-32-63.62-32S270.1 12.62 256.4 32H128C110.3 32 96 46.33 96 64S110.3 96 127.1 96h113.6c5.25 25.75 22.87 47 46.37 57.25V448H144c-26.51 0-48.01 21.49-48.01 48c0 8.836 7.165 16 16 16h416c8.836 0 16-7.164 16-16C544 469.5 522.5 448 495.1 448z"]
};
var faScroll = {
  prefix: "fas",
  iconName: "scroll",
  icon: [576, 512, [128220], "f70e", "M48 32C21.5 32 0 53.5 0 80v64C0 152.9 7.125 160 16 160H96V80C96 53.5 74.5 32 48 32zM256 380.6V320h224V128c0-53-43-96-96-96H111.6C121.8 45.38 128 61.88 128 80V384c0 38.88 34.62 69.63 74.75 63.13C234.3 442 256 412.5 256 380.6zM288 352v32c0 52.88-43 96-96 96h272c61.88 0 112-50.13 112-112c0-8.875-7.125-16-16-16H288z"]
};
var faShuffle = {
  prefix: "fas",
  iconName: "shuffle",
  icon: [512, 512, [128256, "random"], "f074", "M424.1 287c-15.13-15.12-40.1-4.426-40.1 16.97V352H336L153.6 108.8C147.6 100.8 138.1 96 128 96H32C14.31 96 0 110.3 0 128s14.31 32 32 32h80l182.4 243.2C300.4 411.3 309.9 416 320 416h63.97v47.94c0 21.39 25.86 32.12 40.99 17l79.1-79.98c9.387-9.387 9.387-24.59 0-33.97L424.1 287zM336 160h47.97v48.03c0 21.39 25.87 32.09 40.1 16.97l79.1-79.98c9.387-9.391 9.385-24.59-.0013-33.97l-79.1-79.98c-15.13-15.12-40.99-4.391-40.99 17V96H320c-10.06 0-19.56 4.75-25.59 12.81L254 162.7L293.1 216L336 160zM112 352H32c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c10.06 0 19.56-4.75 25.59-12.81l40.4-53.87L154 296L112 352z"]
};
var faRandom = faShuffle;
var faSpinner = {
  prefix: "fas",
  iconName: "spinner",
  icon: [512, 512, [], "f110", "M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z"]
};
var faTableColumns = {
  prefix: "fas",
  iconName: "table-columns",
  icon: [512, 512, ["columns"], "f0db", "M0 96C0 60.65 28.65 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96zM64 416H224V160H64V416zM448 160H288V416H448V160z"]
};
var faColumns = faTableColumns;
var faUpRightAndDownLeftFromCenter = {
  prefix: "fas",
  iconName: "up-right-and-down-left-from-center",
  icon: [512, 512, ["expand-alt"], "f424", "M208 281.4c-12.5-12.5-32.76-12.5-45.26-.002l-78.06 78.07l-30.06-30.06c-6.125-6.125-14.31-9.367-22.63-9.367c-4.125 0-8.279 .7891-12.25 2.43c-11.97 4.953-19.75 16.62-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-30.06-30.06l78.06-78.07c12.5-12.49 12.5-32.75 .002-45.25L208 281.4zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l30.06 30.06l-78.06 78.07c-12.5 12.5-12.5 32.76 0 45.26l22.62 22.62c12.5 12.5 32.76 12.5 45.26 0l78.06-78.07l30.06 30.06c9.156 9.141 22.87 11.84 34.87 6.937C504.2 184.6 512 172.9 512 159.1V23.1C512 10.74 501.3 0 487.1 0z"]
};
var faExpandAlt = faUpRightAndDownLeftFromCenter;
var faUpRightFromSquare = {
  prefix: "fas",
  iconName: "up-right-from-square",
  icon: [512, 512, ["external-link-alt"], "f35d", "M384 320c-17.67 0-32 14.33-32 32v96H64V160h96c17.67 0 32-14.32 32-32s-14.33-32-32-32L64 96c-35.35 0-64 28.65-64 64V448c0 35.34 28.65 64 64 64h288c35.35 0 64-28.66 64-64v-96C416 334.3 401.7 320 384 320zM488 0H352c-12.94 0-24.62 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.88L370.8 96L169.4 297.4c-12.5 12.5-12.5 32.75 0 45.25C175.6 348.9 183.8 352 192 352s16.38-3.125 22.62-9.375L416 141.3l41.38 41.38c9.156 9.141 22.88 11.84 34.88 6.938C504.2 184.6 512 172.9 512 160V24C512 10.74 501.3 0 488 0z"]
};
var faExternalLinkAlt = faUpRightFromSquare;

// src/Dropdown.svelte
var file21 = "src/Dropdown.svelte";
var get_triggerIcon_slot_changes = (dirty) => ({});
var get_triggerIcon_slot_context = (ctx) => ({});
function create_else_block4(ctx) {
  let span;
  let t0;
  let t1;
  let fa;
  let current;
  fa = new fa_default({
    props: { icon: faAngleDown, class: "is-small" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      span = element("span");
      t0 = text(ctx[4]);
      t1 = space();
      create_component(fa.$$.fragment);
      add_location(span, file21, 18, 4, 575);
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      append_dev(span, t0);
      insert_dev(target, t1, anchor);
      mount_component(fa, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (!current || dirty & 16)
        set_data_dev(t0, ctx2[4]);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
      if (detaching)
        detach_dev(t1);
      destroy_component(fa, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block4.name,
    type: "else",
    source: "(18:3) {:else}",
    ctx
  });
  return block;
}
function create_if_block13(ctx) {
  let current;
  const triggerIcon_slot_template = ctx[7].triggerIcon;
  const triggerIcon_slot = create_slot(triggerIcon_slot_template, ctx, ctx[6], get_triggerIcon_slot_context);
  const block = {
    c: function create4() {
      if (triggerIcon_slot)
        triggerIcon_slot.c();
    },
    m: function mount(target, anchor) {
      if (triggerIcon_slot) {
        triggerIcon_slot.m(target, anchor);
      }
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (triggerIcon_slot) {
        if (triggerIcon_slot.p && (!current || dirty & 64)) {
          update_slot_base(triggerIcon_slot, triggerIcon_slot_template, ctx2, ctx2[6], !current ? get_all_dirty_from_scope(ctx2[6]) : get_slot_changes(triggerIcon_slot_template, ctx2[6], dirty, get_triggerIcon_slot_changes), get_triggerIcon_slot_context);
        }
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(triggerIcon_slot, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(triggerIcon_slot, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (triggerIcon_slot)
        triggerIcon_slot.d(detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block13.name,
    type: "if",
    source: "(16:3) {#if $$slots.triggerIcon}",
    ctx
  });
  return block;
}
function create_fragment22(ctx) {
  let div3;
  let div0;
  let button;
  let current_block_type_index;
  let if_block;
  let button_class_value;
  let div0_class_value;
  let t;
  let div2;
  let div1;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block13, create_else_block4];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[5].triggerIcon)
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const default_slot_template = ctx[7].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[6], null);
  const block = {
    c: function create4() {
      div3 = element("div");
      div0 = element("div");
      button = element("button");
      if_block.c();
      t = space();
      div2 = element("div");
      div1 = element("div");
      if (default_slot)
        default_slot.c();
      attr_dev(button, "class", button_class_value = `button ${ctx[3]}`);
      add_location(button, file21, 14, 2, 414);
      attr_dev(div0, "class", div0_class_value = `dropdown-trigger ${ctx[2]}`);
      add_location(div0, file21, 13, 1, 361);
      attr_dev(div1, "class", "dropdown-content");
      add_location(div1, file21, 24, 2, 706);
      attr_dev(div2, "class", "dropdown-menu");
      add_location(div2, file21, 23, 1, 676);
      attr_dev(div3, "class", "dropdown");
      toggle_class(div3, "is-active", ctx[0]);
      toggle_class(div3, "is-right", ctx[1]);
      add_location(div3, file21, 8, 0, 281);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div3, anchor);
      append_dev(div3, div0);
      append_dev(div0, button);
      if_blocks[current_block_type_index].m(button, null);
      append_dev(div3, t);
      append_dev(div3, div2);
      append_dev(div2, div1);
      if (default_slot) {
        default_slot.m(div1, null);
      }
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[8], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(button, null);
      }
      if (!current || dirty & 8 && button_class_value !== (button_class_value = `button ${ctx2[3]}`)) {
        attr_dev(button, "class", button_class_value);
      }
      if (!current || dirty & 4 && div0_class_value !== (div0_class_value = `dropdown-trigger ${ctx2[2]}`)) {
        attr_dev(div0, "class", div0_class_value);
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 64)) {
          update_slot_base(default_slot, default_slot_template, ctx2, ctx2[6], !current ? get_all_dirty_from_scope(ctx2[6]) : get_slot_changes(default_slot_template, ctx2[6], dirty, null), null);
        }
      }
      if (dirty & 1) {
        toggle_class(div3, "is-active", ctx2[0]);
      }
      if (dirty & 2) {
        toggle_class(div3, "is-right", ctx2[1]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      transition_in(default_slot, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      transition_out(default_slot, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div3);
      if_blocks[current_block_type_index].d();
      if (default_slot)
        default_slot.d(detaching);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment22.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance22($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Dropdown", slots, ["triggerIcon", "default"]);
  const $$slots = compute_slots(slots);
  let { isActive = false } = $$props;
  let { isRight = false } = $$props;
  let { triggerClasses = "" } = $$props;
  let { labelClasses = "" } = $$props;
  let { labelText = "" } = $$props;
  const writable_props = ["isActive", "isRight", "triggerClasses", "labelClasses", "labelText"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Dropdown> was created with unknown prop '${key}'`);
  });
  const click_handler = () => $$invalidate(0, isActive = !isActive);
  $$self.$$set = ($$props2) => {
    if ("isActive" in $$props2)
      $$invalidate(0, isActive = $$props2.isActive);
    if ("isRight" in $$props2)
      $$invalidate(1, isRight = $$props2.isRight);
    if ("triggerClasses" in $$props2)
      $$invalidate(2, triggerClasses = $$props2.triggerClasses);
    if ("labelClasses" in $$props2)
      $$invalidate(3, labelClasses = $$props2.labelClasses);
    if ("labelText" in $$props2)
      $$invalidate(4, labelText = $$props2.labelText);
    if ("$$scope" in $$props2)
      $$invalidate(6, $$scope = $$props2.$$scope);
  };
  $$self.$capture_state = () => ({
    Fa: fa_default,
    faAngleDown,
    isActive,
    isRight,
    triggerClasses,
    labelClasses,
    labelText
  });
  $$self.$inject_state = ($$props2) => {
    if ("isActive" in $$props2)
      $$invalidate(0, isActive = $$props2.isActive);
    if ("isRight" in $$props2)
      $$invalidate(1, isRight = $$props2.isRight);
    if ("triggerClasses" in $$props2)
      $$invalidate(2, triggerClasses = $$props2.triggerClasses);
    if ("labelClasses" in $$props2)
      $$invalidate(3, labelClasses = $$props2.labelClasses);
    if ("labelText" in $$props2)
      $$invalidate(4, labelText = $$props2.labelText);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    isActive,
    isRight,
    triggerClasses,
    labelClasses,
    labelText,
    $$slots,
    $$scope,
    slots,
    click_handler
  ];
}
var Dropdown = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance22, create_fragment22, safe_not_equal, {
      isActive: 0,
      isRight: 1,
      triggerClasses: 2,
      labelClasses: 3,
      labelText: 4
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Dropdown",
      options,
      id: create_fragment22.name
    });
  }
  get isActive() {
    throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isActive(value) {
    throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get isRight() {
    throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isRight(value) {
    throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get triggerClasses() {
    throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set triggerClasses(value) {
    throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get labelClasses() {
    throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set labelClasses(value) {
    throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get labelText() {
    throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set labelText(value) {
    throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Dropdown_default = Dropdown;

// src/articles/social/SocialNav.svelte
var file22 = "src/articles/social/SocialNav.svelte";
function create_if_block_52(ctx) {
  let button;
  let span;
  let fa;
  let t;
  let show_if = ctx[2].getRepostCount();
  let button_disabled_value;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faRetweet },
    $$inline: true
  });
  let if_block = show_if && create_if_block_6(ctx);
  const block = {
    c: function create4() {
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      t = space();
      if (if_block)
        if_block.c();
      attr_dev(span, "class", "icon svelte-n4lll1");
      add_location(span, file22, 55, 7, 1899);
      attr_dev(button, "class", "level-item articleButton repostButton borderless-button svelte-n4lll1");
      attr_dev(button, "title", "Repost");
      button.disabled = button_disabled_value = ctx[2].getReposted() && !getArticleAction(STANDARD_ACTIONS.repost, ctx[2].idPair.service).togglable;
      toggle_class(button, "repostedPostButton", ctx[2].getReposted());
      add_location(button, file22, 48, 3, 1546);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, span);
      mount_component(fa, span, null);
      append_dev(button, t);
      if (if_block)
        if_block.m(button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[7], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4)
        show_if = ctx2[2].getRepostCount();
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_6(ctx2);
          if_block.c();
          if_block.m(button, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (!current || dirty & 4 && button_disabled_value !== (button_disabled_value = ctx2[2].getReposted() && !getArticleAction(STANDARD_ACTIONS.repost, ctx2[2].idPair.service).togglable)) {
        prop_dev(button, "disabled", button_disabled_value);
      }
      if (dirty & 4) {
        toggle_class(button, "repostedPostButton", ctx2[2].getReposted());
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_52.name,
    type: "if",
    source: "(48:2) {#if getArticleAction(STANDARD_ACTIONS.repost, article.idPair.service)}",
    ctx
  });
  return block;
}
function create_if_block_6(ctx) {
  let span;
  let t_value = ctx[2].getRepostCount() + "";
  let t;
  const block = {
    c: function create4() {
      span = element("span");
      t = text(t_value);
      attr_dev(span, "class", "svelte-n4lll1");
      add_location(span, file22, 59, 5, 2005);
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      append_dev(span, t);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4 && t_value !== (t_value = ctx2[2].getRepostCount() + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_6.name,
    type: "if",
    source: "(59:4) {#if article.getRepostCount()}",
    ctx
  });
  return block;
}
function create_if_block_35(ctx) {
  let button;
  let span;
  let fa;
  let t;
  let show_if = ctx[2].getLikeCount();
  let button_disabled_value;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: {
      icon: ctx[2].getLiked() ? faHeart2 : faHeart
    },
    $$inline: true
  });
  let if_block = show_if && create_if_block_43(ctx);
  const block = {
    c: function create4() {
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      t = space();
      if (if_block)
        if_block.c();
      attr_dev(span, "class", "icon svelte-n4lll1");
      add_location(span, file22, 71, 4, 2484);
      attr_dev(button, "class", "level-item articleButton likeButton borderless-button svelte-n4lll1");
      attr_dev(button, "title", "Like");
      button.disabled = button_disabled_value = ctx[2].getLiked() && !getArticleAction(STANDARD_ACTIONS.like, ctx[2].idPair.service).togglable;
      toggle_class(button, "likedPostButton", ctx[2].getLiked());
      add_location(button, file22, 64, 3, 2151);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, span);
      mount_component(fa, span, null);
      append_dev(button, t);
      if (if_block)
        if_block.m(button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[8], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      const fa_changes = {};
      if (dirty & 4)
        fa_changes.icon = ctx2[2].getLiked() ? faHeart2 : faHeart;
      fa.$set(fa_changes);
      if (dirty & 4)
        show_if = ctx2[2].getLikeCount();
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_43(ctx2);
          if_block.c();
          if_block.m(button, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (!current || dirty & 4 && button_disabled_value !== (button_disabled_value = ctx2[2].getLiked() && !getArticleAction(STANDARD_ACTIONS.like, ctx2[2].idPair.service).togglable)) {
        prop_dev(button, "disabled", button_disabled_value);
      }
      if (dirty & 4) {
        toggle_class(button, "likedPostButton", ctx2[2].getLiked());
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_35.name,
    type: "if",
    source: "(64:2) {#if getArticleAction(STANDARD_ACTIONS.like, article.idPair.service)}",
    ctx
  });
  return block;
}
function create_if_block_43(ctx) {
  let span;
  let t_value = ctx[2].getLikeCount() + "";
  let t;
  const block = {
    c: function create4() {
      span = element("span");
      t = text(t_value);
      attr_dev(span, "class", "svelte-n4lll1");
      add_location(span, file22, 75, 5, 2617);
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      append_dev(span, t);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4 && t_value !== (t_value = ctx2[2].getLikeCount() + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_43.name,
    type: "if",
    source: "(75:4) {#if article.getLikeCount()}",
    ctx
  });
  return block;
}
function create_if_block_27(ctx) {
  let button;
  let span;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faExpandAlt },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      attr_dev(span, "class", "icon svelte-n4lll1");
      add_location(span, file22, 94, 4, 3109);
      attr_dev(button, "class", "level-item articleButton borderless-button svelte-n4lll1");
      attr_dev(button, "title", "Expand article as modal");
      add_location(button, file22, 89, 3, 2967);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, span);
      mount_component(fa, span, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[10], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_27.name,
    type: "if",
    source: "(89:2) {#if !isQuoted && !modal}",
    ctx
  });
  return block;
}
function create_if_block_19(ctx) {
  let a;
  let t;
  let a_href_value;
  const block = {
    c: function create4() {
      a = element("a");
      t = text("Repost's external Link");
      attr_dev(a, "class", "dropdown-item");
      attr_dev(a, "href", a_href_value = ctx[3].url);
      attr_dev(a, "target", "_blank");
      add_location(a, file22, 120, 4, 3982);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      append_dev(a, t);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 8 && a_href_value !== (a_href_value = ctx2[3].url)) {
        attr_dev(a, "href", a_href_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_19.name,
    type: "if",
    source: "(120:3) {#if repost}",
    ctx
  });
  return block;
}
function create_if_block14(ctx) {
  let a0;
  let t1;
  let a1;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      a0 = element("a");
      a0.textContent = "Log Data";
      t1 = space();
      a1 = element("a");
      a1.textContent = "Log Json Data";
      attr_dev(a0, "class", "dropdown-item");
      add_location(a0, file22, 126, 4, 4163);
      attr_dev(a1, "class", "dropdown-item");
      add_location(a1, file22, 130, 4, 4287);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a0, anchor);
      insert_dev(target, t1, anchor);
      insert_dev(target, a1, anchor);
      if (!mounted) {
        dispose = [
          listen_dev(a0, "click", function() {
            if (is_function(ctx[5]))
              ctx[5].apply(this, arguments);
          }, false, false, false),
          listen_dev(a1, "click", function() {
            if (is_function(ctx[6]))
              ctx[6].apply(this, arguments);
          }, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(a1);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block14.name,
    type: "if",
    source: "(125:3) {#if !isQuoted}",
    ctx
  });
  return block;
}
function create_default_slot5(ctx) {
  let a0;
  let t1;
  let a1;
  let t3;
  let a2;
  let t4_value = ctx[1].compact ? "Show expanded" : "Show compact";
  let t4;
  let t5;
  let a3;
  let t6;
  let a3_href_value;
  let t7;
  let t8;
  let if_block1_anchor;
  let mounted;
  let dispose;
  let if_block0 = ctx[3] && create_if_block_19(ctx);
  let if_block1 = !ctx[4] && create_if_block14(ctx);
  const block = {
    c: function create4() {
      a0 = element("a");
      a0.textContent = "Mark as read";
      t1 = space();
      a1 = element("a");
      a1.textContent = "Hide";
      t3 = space();
      a2 = element("a");
      t4 = text(t4_value);
      t5 = space();
      a3 = element("a");
      t6 = text("External Link");
      t7 = space();
      if (if_block0)
        if_block0.c();
      t8 = space();
      if (if_block1)
        if_block1.c();
      if_block1_anchor = empty();
      attr_dev(a0, "class", "dropdown-item");
      add_location(a0, file22, 105, 3, 3415);
      attr_dev(a1, "class", "dropdown-item");
      add_location(a1, file22, 109, 3, 3568);
      attr_dev(a2, "class", "dropdown-item");
      add_location(a2, file22, 113, 3, 3707);
      attr_dev(a3, "class", "dropdown-item");
      attr_dev(a3, "href", a3_href_value = ctx[2].url);
      attr_dev(a3, "target", "_blank");
      add_location(a3, file22, 116, 3, 3873);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a0, anchor);
      insert_dev(target, t1, anchor);
      insert_dev(target, a1, anchor);
      insert_dev(target, t3, anchor);
      insert_dev(target, a2, anchor);
      append_dev(a2, t4);
      insert_dev(target, t5, anchor);
      insert_dev(target, a3, anchor);
      append_dev(a3, t6);
      insert_dev(target, t7, anchor);
      if (if_block0)
        if_block0.m(target, anchor);
      insert_dev(target, t8, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert_dev(target, if_block1_anchor, anchor);
      if (!mounted) {
        dispose = [
          listen_dev(a0, "click", ctx[11], false, false, false),
          listen_dev(a1, "click", ctx[12], false, false, false),
          listen_dev(a2, "click", ctx[13], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 2 && t4_value !== (t4_value = ctx2[1].compact ? "Show expanded" : "Show compact"))
        set_data_dev(t4, t4_value);
      if (dirty & 4 && a3_href_value !== (a3_href_value = ctx2[2].url)) {
        attr_dev(a3, "href", a3_href_value);
      }
      if (ctx2[3]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_19(ctx2);
          if_block0.c();
          if_block0.m(t8.parentNode, t8);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!ctx2[4]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block14(ctx2);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(a1);
      if (detaching)
        detach_dev(t3);
      if (detaching)
        detach_dev(a2);
      if (detaching)
        detach_dev(t5);
      if (detaching)
        detach_dev(a3);
      if (detaching)
        detach_dev(t7);
      if (if_block0)
        if_block0.d(detaching);
      if (detaching)
        detach_dev(t8);
      if (if_block1)
        if_block1.d(detaching);
      if (detaching)
        detach_dev(if_block1_anchor);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot5.name,
    type: "slot",
    source: "(100:2) <Dropdown labelClasses='articleButton borderless-button'>",
    ctx
  });
  return block;
}
function create_triggerIcon_slot(ctx) {
  let span;
  let fa;
  let current;
  fa = new fa_default({
    props: { icon: faEllipsisH, class: "level-item" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      span = element("span");
      create_component(fa.$$.fragment);
      attr_dev(span, "slot", "triggerIcon");
      attr_dev(span, "class", "icon");
      add_location(span, file22, 100, 6, 3258);
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      mount_component(fa, span, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
      destroy_component(fa);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_triggerIcon_slot.name,
    type: "slot",
    source: "(101:6) ",
    ctx
  });
  return block;
}
function create_fragment23(ctx) {
  let nav;
  let div;
  let show_if_1 = getArticleAction(STANDARD_ACTIONS.repost, ctx[2].idPair.service);
  let t0;
  let show_if = getArticleAction(STANDARD_ACTIONS.like, ctx[2].idPair.service);
  let t1;
  let button;
  let span;
  let fa;
  let t2;
  let t3;
  let dropdown;
  let current;
  let mounted;
  let dispose;
  let if_block0 = show_if_1 && create_if_block_52(ctx);
  let if_block1 = show_if && create_if_block_35(ctx);
  fa = new fa_default({
    props: {
      icon: ctx[2].markedAsRead ? faEye : faEyeSlash
    },
    $$inline: true
  });
  let if_block2 = !ctx[4] && !ctx[0] && create_if_block_27(ctx);
  dropdown = new Dropdown_default({
    props: {
      labelClasses: "articleButton borderless-button",
      $$slots: {
        triggerIcon: [create_triggerIcon_slot],
        default: [create_default_slot5]
      },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      nav = element("nav");
      div = element("div");
      if (if_block0)
        if_block0.c();
      t0 = space();
      if (if_block1)
        if_block1.c();
      t1 = space();
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      t2 = space();
      if (if_block2)
        if_block2.c();
      t3 = space();
      create_component(dropdown.$$.fragment);
      attr_dev(span, "class", "icon svelte-n4lll1");
      add_location(span, file22, 84, 3, 2834);
      attr_dev(button, "class", "level-item articleButton borderless-button svelte-n4lll1");
      attr_dev(button, "title", "Mark as read");
      add_location(button, file22, 79, 2, 2688);
      attr_dev(div, "class", "level-left");
      add_location(div, file22, 46, 1, 1444);
      attr_dev(nav, "class", "level is-mobile");
      add_location(nav, file22, 45, 0, 1413);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, nav, anchor);
      append_dev(nav, div);
      if (if_block0)
        if_block0.m(div, null);
      append_dev(div, t0);
      if (if_block1)
        if_block1.m(div, null);
      append_dev(div, t1);
      append_dev(div, button);
      append_dev(button, span);
      mount_component(fa, span, null);
      append_dev(div, t2);
      if (if_block2)
        if_block2.m(div, null);
      append_dev(div, t3);
      mount_component(dropdown, div, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[9], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 4)
        show_if_1 = getArticleAction(STANDARD_ACTIONS.repost, ctx2[2].idPair.service);
      if (show_if_1) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_52(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (dirty & 4)
        show_if = getArticleAction(STANDARD_ACTIONS.like, ctx2[2].idPair.service);
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_35(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div, t1);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      const fa_changes = {};
      if (dirty & 4)
        fa_changes.icon = ctx2[2].markedAsRead ? faEye : faEyeSlash;
      fa.$set(fa_changes);
      if (!ctx2[4] && !ctx2[0]) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & 17) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_27(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div, t3);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      const dropdown_changes = {};
      if (dirty & 16510) {
        dropdown_changes.$$scope = { dirty, ctx: ctx2 };
      }
      dropdown.$set(dropdown_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(fa.$$.fragment, local);
      transition_in(if_block2);
      transition_in(dropdown.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(fa.$$.fragment, local);
      transition_out(if_block2);
      transition_out(dropdown.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(nav);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      destroy_component(fa);
      if (if_block2)
        if_block2.d();
      destroy_component(dropdown);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment23.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance23($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("SocialNav", slots, []);
  let { article } = $$props;
  let { repost: repost2 = void 0 } = $$props;
  let { isQuoted = false } = $$props;
  let { modal } = $$props;
  let { timelineProps } = $$props;
  let { onLogData } = $$props;
  let { onLogJSON } = $$props;
  const writable_props = [
    "article",
    "repost",
    "isQuoted",
    "modal",
    "timelineProps",
    "onLogData",
    "onLogJSON"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<SocialNav> was created with unknown prop '${key}'`);
  });
  const click_handler = () => articleAction(STANDARD_ACTIONS.repost, article.idPair);
  const click_handler_1 = () => articleAction(STANDARD_ACTIONS.like, article.idPair);
  const click_handler_2 = () => toggleMarkAsRead(article.idPair);
  const click_handler_3 = () => $$invalidate(0, modal = true);
  const click_handler_4 = () => toggleMarkAsRead(article.idPair);
  const click_handler_5 = () => toggleHide(article.idPair);
  const click_handler_6 = () => $$invalidate(1, timelineProps.compact = !timelineProps.compact, timelineProps);
  $$self.$$set = ($$props2) => {
    if ("article" in $$props2)
      $$invalidate(2, article = $$props2.article);
    if ("repost" in $$props2)
      $$invalidate(3, repost2 = $$props2.repost);
    if ("isQuoted" in $$props2)
      $$invalidate(4, isQuoted = $$props2.isQuoted);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("onLogData" in $$props2)
      $$invalidate(5, onLogData = $$props2.onLogData);
    if ("onLogJSON" in $$props2)
      $$invalidate(6, onLogJSON = $$props2.onLogJSON);
  };
  $$self.$capture_state = () => ({
    Fa: fa_default,
    faHeart,
    faRetweet,
    faHeartFilled: faHeart2,
    faEyeSlash,
    faEllipsisH,
    faExpandAlt,
    faEye,
    Dropdown: Dropdown_default,
    toggleMarkAsRead,
    toggleHide,
    articleAction,
    getArticleAction,
    STANDARD_ACTIONS,
    Article,
    article,
    repost: repost2,
    isQuoted,
    modal,
    timelineProps,
    onLogData,
    onLogJSON
  });
  $$self.$inject_state = ($$props2) => {
    if ("article" in $$props2)
      $$invalidate(2, article = $$props2.article);
    if ("repost" in $$props2)
      $$invalidate(3, repost2 = $$props2.repost);
    if ("isQuoted" in $$props2)
      $$invalidate(4, isQuoted = $$props2.isQuoted);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("onLogData" in $$props2)
      $$invalidate(5, onLogData = $$props2.onLogData);
    if ("onLogJSON" in $$props2)
      $$invalidate(6, onLogJSON = $$props2.onLogJSON);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    modal,
    timelineProps,
    article,
    repost2,
    isQuoted,
    onLogData,
    onLogJSON,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3,
    click_handler_4,
    click_handler_5,
    click_handler_6
  ];
}
var SocialNav = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance23, create_fragment23, safe_not_equal, {
      article: 2,
      repost: 3,
      isQuoted: 4,
      modal: 0,
      timelineProps: 1,
      onLogData: 5,
      onLogJSON: 6
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "SocialNav",
      options,
      id: create_fragment23.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[2] === void 0 && !("article" in props)) {
      console.warn("<SocialNav> was created without expected prop 'article'");
    }
    if (ctx[0] === void 0 && !("modal" in props)) {
      console.warn("<SocialNav> was created without expected prop 'modal'");
    }
    if (ctx[1] === void 0 && !("timelineProps" in props)) {
      console.warn("<SocialNav> was created without expected prop 'timelineProps'");
    }
    if (ctx[5] === void 0 && !("onLogData" in props)) {
      console.warn("<SocialNav> was created without expected prop 'onLogData'");
    }
    if (ctx[6] === void 0 && !("onLogJSON" in props)) {
      console.warn("<SocialNav> was created without expected prop 'onLogJSON'");
    }
  }
  get article() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set article(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get repost() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set repost(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get isQuoted() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isQuoted(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get modal() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set modal(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get timelineProps() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set timelineProps(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onLogData() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onLogData(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onLogJSON() {
    throw new Error("<SocialNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onLogJSON(value) {
    throw new Error("<SocialNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var SocialNav_default = SocialNav;

// src/articles/social/Timestamp.svelte
var file23 = "src/articles/social/Timestamp.svelte";
function create_fragment24(ctx) {
  let span;
  let small;
  let t_value = shortTimestamp(ctx[0]) + "";
  let t;
  let small_title_value;
  const block = {
    c: function create4() {
      span = element("span");
      small = element("small");
      t = text(t_value);
      attr_dev(small, "title", small_title_value = ctx[0].toString());
      add_location(small, file23, 9, 1, 177);
      attr_dev(span, "class", "timestamp svelte-dilmse");
      add_location(span, file23, 8, 0, 151);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      append_dev(span, small);
      append_dev(small, t);
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 1 && t_value !== (t_value = shortTimestamp(ctx2[0]) + ""))
        set_data_dev(t, t_value);
      if (dirty & 1 && small_title_value !== (small_title_value = ctx2[0].toString())) {
        attr_dev(small, "title", small_title_value);
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment24.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance24($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Timestamp", slots, []);
  let { date } = $$props;
  const writable_props = ["date"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Timestamp> was created with unknown prop '${key}'`);
  });
  $$self.$$set = ($$props2) => {
    if ("date" in $$props2)
      $$invalidate(0, date = $$props2.date);
  };
  $$self.$capture_state = () => ({ shortTimestamp, date });
  $$self.$inject_state = ($$props2) => {
    if ("date" in $$props2)
      $$invalidate(0, date = $$props2.date);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [date];
}
var Timestamp = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance24, create_fragment24, safe_not_equal, { date: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Timestamp",
      options,
      id: create_fragment24.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("date" in props)) {
      console.warn("<Timestamp> was created without expected prop 'date'");
    }
  }
  get date() {
    throw new Error("<Timestamp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set date(value) {
    throw new Error("<Timestamp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Timestamp_default = Timestamp;

// src/articles/social/SocialArticleView.svelte
var file24 = "src/articles/social/SocialArticleView.svelte";
function get_if_ctx(ctx) {
  const child_ctx = ctx.slice();
  const constants_0 = child_ctx[2].actualArticleRef.quoted;
  child_ctx[15] = constants_0;
  return child_ctx;
}
function create_if_block_10(ctx) {
  let a;
  let t0_value = ctx[2].article.author.name + "";
  let t0;
  let t1;
  let t2_value = shortTimestamp(ctx[2].article.creationTime) + "";
  let t2;
  let a_href_value;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      a = element("a");
      t0 = text(t0_value);
      t1 = text(" reposted - ");
      t2 = text(t2_value);
      attr_dev(a, "href", a_href_value = ctx[2].article.author.url);
      attr_dev(a, "target", "_blank");
      attr_dev(a, "class", "svelte-lur1z5");
      add_location(a, file24, 148, 3, 3409);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      append_dev(a, t0);
      append_dev(a, t1);
      append_dev(a, t2);
      if (!mounted) {
        dispose = listen_dev(a, "click", prevent_default(ctx[10]), false, true, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4 && t0_value !== (t0_value = ctx2[2].article.author.name + ""))
        set_data_dev(t0, t0_value);
      if (dirty & 4 && t2_value !== (t2_value = shortTimestamp(ctx2[2].article.creationTime) + ""))
        set_data_dev(t2, t2_value);
      if (dirty & 4 && a_href_value !== (a_href_value = ctx2[2].article.author.url)) {
        attr_dev(a, "href", a_href_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_10.name,
    type: "if",
    source: "(148:2) {#if isArticleRepost && articleProps.article.author}",
    ctx
  });
  return block;
}
function create_if_block_8(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (ctx2[8])
      return create_if_block_9;
    return create_else_block_2;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block = current_block_type(ctx);
  const block = {
    c: function create4() {
      if_block.c();
      if_block_anchor = empty();
    },
    m: function mount(target, anchor) {
      if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if_block.p(ctx2, dirty);
    },
    d: function destroy(detaching) {
      if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_8.name,
    type: "if",
    source: "(158:4) {#if actualArticle.author?.url}",
    ctx
  });
  return block;
}
function create_else_block_2(ctx) {
  let img;
  let img_src_value;
  let img_alt_value;
  const block = {
    c: function create4() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = ctx[3].author.avatarUrl))
        attr_dev(img, "src", img_src_value);
      attr_dev(img, "alt", img_alt_value = `${ctx[3].author.username}'s avatar`);
      attr_dev(img, "class", "svelte-lur1z5");
      add_location(img, file24, 162, 6, 4119);
    },
    m: function mount(target, anchor) {
      insert_dev(target, img, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 8 && !src_url_equal(img.src, img_src_value = ctx2[3].author.avatarUrl)) {
        attr_dev(img, "src", img_src_value);
      }
      if (dirty & 8 && img_alt_value !== (img_alt_value = `${ctx2[3].author.username}'s avatar`)) {
        attr_dev(img, "alt", img_alt_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(img);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block_2.name,
    type: "else",
    source: "(162:5) {:else}",
    ctx
  });
  return block;
}
function create_if_block_9(ctx) {
  let img0;
  let img0_src_value;
  let img0_alt_value;
  let t;
  let img1;
  let img1_src_value;
  let img1_alt_value;
  const block = {
    c: function create4() {
      img0 = element("img");
      t = space();
      img1 = element("img");
      if (!src_url_equal(img0.src, img0_src_value = ctx[3].author.avatarUrl))
        attr_dev(img0, "src", img0_src_value);
      attr_dev(img0, "alt", img0_alt_value = `${ctx[3].author.username}'s avatar`);
      attr_dev(img0, "class", "svelte-lur1z5");
      add_location(img0, file24, 159, 6, 3892);
      if (!src_url_equal(img1.src, img1_src_value = ctx[2].article.author.avatarUrl))
        attr_dev(img1, "src", img1_src_value);
      attr_dev(img1, "alt", img1_alt_value = `${ctx[2].article.author.username}'s avatar`);
      attr_dev(img1, "class", "svelte-lur1z5");
      add_location(img1, file24, 160, 6, 3992);
    },
    m: function mount(target, anchor) {
      insert_dev(target, img0, anchor);
      insert_dev(target, t, anchor);
      insert_dev(target, img1, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 8 && !src_url_equal(img0.src, img0_src_value = ctx2[3].author.avatarUrl)) {
        attr_dev(img0, "src", img0_src_value);
      }
      if (dirty & 8 && img0_alt_value !== (img0_alt_value = `${ctx2[3].author.username}'s avatar`)) {
        attr_dev(img0, "alt", img0_alt_value);
      }
      if (dirty & 4 && !src_url_equal(img1.src, img1_src_value = ctx2[2].article.author.avatarUrl)) {
        attr_dev(img1, "src", img1_src_value);
      }
      if (dirty & 4 && img1_alt_value !== (img1_alt_value = `${ctx2[2].article.author.username}'s avatar`)) {
        attr_dev(img1, "alt", img1_alt_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(img0);
      if (detaching)
        detach_dev(t);
      if (detaching)
        detach_dev(img1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_9.name,
    type: "if",
    source: "(159:5) {#if isArticleRepost}",
    ctx
  });
  return block;
}
function create_if_block_7(ctx) {
  let timestamp;
  let current;
  timestamp = new Timestamp_default({
    props: {
      date: ctx[3].creationTime
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(timestamp.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timestamp, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const timestamp_changes = {};
      if (dirty & 8)
        timestamp_changes.date = ctx2[3].creationTime;
      timestamp.$set(timestamp_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timestamp.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timestamp.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timestamp, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_7.name,
    type: "if",
    source: "(180:5) {#if actualArticle.creationTime !== undefined}",
    ctx
  });
  return block;
}
function create_if_block_53(ctx) {
  let p;
  function select_block_type_1(ctx2, dirty) {
    if (ctx2[3].textHtml)
      return create_if_block_62;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_1(ctx, -1);
  let if_block = current_block_type(ctx);
  const block = {
    c: function create4() {
      p = element("p");
      if_block.c();
      attr_dev(p, "class", "articleParagraph svelte-lur1z5");
      add_location(p, file24, 184, 5, 4809);
    },
    m: function mount(target, anchor) {
      insert_dev(target, p, anchor);
      if_block.m(p, null);
    },
    p: function update3(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_1(ctx2, dirty)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(p, null);
        }
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(p);
      if_block.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_53.name,
    type: "if",
    source: "(184:4) {#if !timelineProps.hideText && !minimized}",
    ctx
  });
  return block;
}
function create_else_block_1(ctx) {
  let t_value = ctx[3].text + "";
  let t;
  const block = {
    c: function create4() {
      t = text(t_value);
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 8 && t_value !== (t_value = ctx2[3].text + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block_1.name,
    type: "else",
    source: "(188:6) {:else}",
    ctx
  });
  return block;
}
function create_if_block_62(ctx) {
  let html_tag;
  let raw_value = ctx[3].textHtml + "";
  let html_anchor;
  const block = {
    c: function create4() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m: function mount(target, anchor) {
      html_tag.m(raw_value, target, anchor);
      insert_dev(target, html_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 8 && raw_value !== (raw_value = ctx2[3].textHtml + ""))
        html_tag.p(raw_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(html_anchor);
      if (detaching)
        html_tag.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_62.name,
    type: "if",
    source: "(186:6) {#if actualArticle.textHtml}",
    ctx
  });
  return block;
}
function create_if_block_110(ctx) {
  let div1;
  let div0;
  let a;
  let strong;
  let t0_value = ctx[15].author.name + "";
  let t0;
  let t1;
  let small;
  let t2_value = `@${ctx[15].author.username}`;
  let t2;
  let a_href_value;
  let t3;
  let timestamp;
  let t4;
  let t5;
  let socialnav;
  let current;
  timestamp = new Timestamp_default({
    props: { date: ctx[15].creationTime },
    $$inline: true
  });
  let if_block = !(ctx[7] || ctx[15].markedAsRead || ctx[15].hidden) && create_if_block_28(ctx);
  socialnav = new SocialNav_default({
    props: {
      article: ctx[15],
      isQuoted: true,
      timelineProps: ctx[1],
      modal: ctx[0],
      onLogData: ctx[5],
      onLogJSON: ctx[6]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      div1 = element("div");
      div0 = element("div");
      a = element("a");
      strong = element("strong");
      t0 = text(t0_value);
      t1 = space();
      small = element("small");
      t2 = text(t2_value);
      t3 = space();
      create_component(timestamp.$$.fragment);
      t4 = space();
      if (if_block)
        if_block.c();
      t5 = space();
      create_component(socialnav.$$.fragment);
      attr_dev(strong, "class", "svelte-lur1z5");
      add_location(strong, file24, 198, 7, 5235);
      attr_dev(small, "class", "svelte-lur1z5");
      add_location(small, file24, 199, 7, 5282);
      attr_dev(a, "class", "names svelte-lur1z5");
      attr_dev(a, "href", a_href_value = ctx[15].author.url);
      attr_dev(a, "target", "_blank");
      add_location(a, file24, 197, 6, 5169);
      attr_dev(div0, "class", "articleHeader svelte-lur1z5");
      add_location(div0, file24, 196, 5, 5135);
      attr_dev(div1, "class", "quotedPost svelte-lur1z5");
      add_location(div1, file24, 195, 4, 5105);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, div0);
      append_dev(div0, a);
      append_dev(a, strong);
      append_dev(strong, t0);
      append_dev(a, t1);
      append_dev(a, small);
      append_dev(small, t2);
      append_dev(div0, t3);
      mount_component(timestamp, div0, null);
      append_dev(div1, t4);
      if (if_block)
        if_block.m(div1, null);
      append_dev(div1, t5);
      mount_component(socialnav, div1, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if ((!current || dirty & 4) && t0_value !== (t0_value = ctx2[15].author.name + ""))
        set_data_dev(t0, t0_value);
      if ((!current || dirty & 4) && t2_value !== (t2_value = `@${ctx2[15].author.username}`))
        set_data_dev(t2, t2_value);
      if (!current || dirty & 4 && a_href_value !== (a_href_value = ctx2[15].author.url)) {
        attr_dev(a, "href", a_href_value);
      }
      const timestamp_changes = {};
      if (dirty & 4)
        timestamp_changes.date = ctx2[15].creationTime;
      timestamp.$set(timestamp_changes);
      if (!(ctx2[7] || ctx2[15].markedAsRead || ctx2[15].hidden)) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_28(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div1, t5);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const socialnav_changes = {};
      if (dirty & 4)
        socialnav_changes.article = ctx2[15];
      if (dirty & 2)
        socialnav_changes.timelineProps = ctx2[1];
      if (dirty & 1)
        socialnav_changes.modal = ctx2[0];
      if (dirty & 32)
        socialnav_changes.onLogData = ctx2[5];
      if (dirty & 64)
        socialnav_changes.onLogJSON = ctx2[6];
      socialnav.$set(socialnav_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timestamp.$$.fragment, local);
      transition_in(if_block);
      transition_in(socialnav.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timestamp.$$.fragment, local);
      transition_out(if_block);
      transition_out(socialnav.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      destroy_component(timestamp);
      if (if_block)
        if_block.d();
      destroy_component(socialnav);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_110.name,
    type: "if",
    source: "(194:3) {#if articleProps.actualArticleRef?.quoted}",
    ctx
  });
  return block;
}
function create_if_block_28(ctx) {
  let t;
  let socialmedia;
  let current;
  let if_block = !ctx[1].hideText && create_if_block_36(ctx);
  socialmedia = new SocialMedia_default({
    props: {
      article: ctx[15],
      timelineProps: ctx[1],
      onMediaClick: ctx[12]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      if (if_block)
        if_block.c();
      t = space();
      create_component(socialmedia.$$.fragment);
    },
    m: function mount(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, t, anchor);
      mount_component(socialmedia, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (!ctx2[1].hideText) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_36(ctx2);
          if_block.c();
          if_block.m(t.parentNode, t);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      const socialmedia_changes = {};
      if (dirty & 4)
        socialmedia_changes.article = ctx2[15];
      if (dirty & 2)
        socialmedia_changes.timelineProps = ctx2[1];
      if (dirty & 24)
        socialmedia_changes.onMediaClick = ctx2[12];
      socialmedia.$set(socialmedia_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(socialmedia.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(socialmedia.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(t);
      destroy_component(socialmedia, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_28.name,
    type: "if",
    source: "(204:5) {#if !(minimized || quoted.markedAsRead || quoted.hidden)}",
    ctx
  });
  return block;
}
function create_if_block_36(ctx) {
  let p;
  function select_block_type_2(ctx2, dirty) {
    if (ctx2[15].textHtml)
      return create_if_block_44;
    return create_else_block5;
  }
  let current_block_type = select_block_type_2(ctx, -1);
  let if_block = current_block_type(ctx);
  const block = {
    c: function create4() {
      p = element("p");
      if_block.c();
      attr_dev(p, "class", "refArticleParagraph svelte-lur1z5");
      add_location(p, file24, 205, 7, 5540);
    },
    m: function mount(target, anchor) {
      insert_dev(target, p, anchor);
      if_block.m(p, null);
    },
    p: function update3(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_2(ctx2, dirty)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(p, null);
        }
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(p);
      if_block.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_36.name,
    type: "if",
    source: "(205:6) {#if !timelineProps.hideText}",
    ctx
  });
  return block;
}
function create_else_block5(ctx) {
  let t_value = ctx[15].text + "";
  let t;
  const block = {
    c: function create4() {
      t = text(t_value);
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4 && t_value !== (t_value = ctx2[15].text + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block5.name,
    type: "else",
    source: "(209:8) {:else}",
    ctx
  });
  return block;
}
function create_if_block_44(ctx) {
  let html_tag;
  let raw_value = ctx[15].textHtml + "";
  let html_anchor;
  const block = {
    c: function create4() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m: function mount(target, anchor) {
      html_tag.m(raw_value, target, anchor);
      insert_dev(target, html_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4 && raw_value !== (raw_value = ctx2[15].textHtml + ""))
        html_tag.p(raw_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(html_anchor);
      if (detaching)
        html_tag.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_44.name,
    type: "if",
    source: "(207:8) {#if quoted.textHtml}",
    ctx
  });
  return block;
}
function create_if_block15(ctx) {
  let socialmedia;
  let current;
  socialmedia = new SocialMedia_default({
    props: {
      article: ctx[3],
      timelineProps: ctx[1],
      onMediaClick: ctx[14]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(socialmedia.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(socialmedia, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const socialmedia_changes = {};
      if (dirty & 8)
        socialmedia_changes.article = ctx2[3];
      if (dirty & 2)
        socialmedia_changes.timelineProps = ctx2[1];
      if (dirty & 24)
        socialmedia_changes.onMediaClick = ctx2[14];
      socialmedia.$set(socialmedia_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(socialmedia.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(socialmedia.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(socialmedia, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block15.name,
    type: "if",
    source: "(240:1) {#if actualArticle.medias.length && !minimized}",
    ctx
  });
  return block;
}
function create_fragment25(ctx) {
  let div6;
  let div0;
  let t0;
  let div5;
  let div1;
  let figure;
  let t1;
  let div4;
  let div3;
  let div2;
  let a;
  let strong;
  let t2_value = ctx[3].author?.name + "";
  let t2;
  let t3;
  let small;
  let t4;
  let t5_value = ctx[3].author?.username + "";
  let t5;
  let a_href_value;
  let t6;
  let t7;
  let t8;
  let t9;
  let socialnav;
  let updating_modal;
  let t10;
  let current;
  let mounted;
  let dispose;
  let if_block0 = ctx[8] && ctx[2].article.author && create_if_block_10(ctx);
  let if_block1 = ctx[3].author?.url && create_if_block_8(ctx);
  let if_block2 = ctx[3].creationTime !== void 0 && create_if_block_7(ctx);
  let if_block3 = !ctx[1].hideText && !ctx[7] && create_if_block_53(ctx);
  let if_block4 = ctx[2].actualArticleRef?.quoted && create_if_block_110(get_if_ctx(ctx));
  function socialnav_modal_binding(value) {
    ctx[13](value);
  }
  let socialnav_props = {
    article: ctx[3],
    timelineProps: ctx[1],
    repost: ctx[8] ? ctx[2].article : void 0,
    onLogData: ctx[5],
    onLogJSON: ctx[6]
  };
  if (ctx[0] !== void 0) {
    socialnav_props.modal = ctx[0];
  }
  socialnav = new SocialNav_default({ props: socialnav_props, $$inline: true });
  binding_callbacks.push(() => bind(socialnav, "modal", socialnav_modal_binding));
  let if_block5 = ctx[3].medias.length && !ctx[7] && create_if_block15(ctx);
  const block = {
    c: function create4() {
      div6 = element("div");
      div0 = element("div");
      if (if_block0)
        if_block0.c();
      t0 = space();
      div5 = element("div");
      div1 = element("div");
      figure = element("figure");
      if (if_block1)
        if_block1.c();
      t1 = space();
      div4 = element("div");
      div3 = element("div");
      div2 = element("div");
      a = element("a");
      strong = element("strong");
      t2 = text(t2_value);
      t3 = space();
      small = element("small");
      t4 = text("@");
      t5 = text(t5_value);
      t6 = space();
      if (if_block2)
        if_block2.c();
      t7 = space();
      if (if_block3)
        if_block3.c();
      t8 = space();
      if (if_block4)
        if_block4.c();
      t9 = space();
      create_component(socialnav.$$.fragment);
      t10 = space();
      if (if_block5)
        if_block5.c();
      attr_dev(div0, "class", "repostLabel svelte-lur1z5");
      add_location(div0, file24, 146, 1, 3325);
      attr_dev(figure, "class", "image is-64x64 svelte-lur1z5");
      toggle_class(figure, "sharedAvatar", ctx[8]);
      add_location(figure, file24, 156, 3, 3754);
      attr_dev(div1, "class", "media-left");
      add_location(div1, file24, 155, 2, 3726);
      attr_dev(strong, "class", "svelte-lur1z5");
      add_location(strong, file24, 176, 6, 4514);
      attr_dev(small, "class", "svelte-lur1z5");
      add_location(small, file24, 177, 6, 4568);
      attr_dev(a, "class", "names svelte-lur1z5");
      attr_dev(a, "href", a_href_value = ctx[3].author?.url);
      attr_dev(a, "target", "_blank");
      add_location(a, file24, 170, 5, 4348);
      attr_dev(div2, "class", "articleHeader svelte-lur1z5");
      add_location(div2, file24, 169, 4, 4315);
      attr_dev(div3, "class", "content");
      add_location(div3, file24, 168, 3, 4289);
      attr_dev(div4, "class", "media-content");
      add_location(div4, file24, 167, 2, 4258);
      attr_dev(div5, "class", "media");
      add_location(div5, file24, 154, 1, 3704);
      attr_dev(div6, "class", "socialArticle svelte-lur1z5");
      add_location(div6, file24, 145, 0, 3296);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div6, anchor);
      append_dev(div6, div0);
      if (if_block0)
        if_block0.m(div0, null);
      append_dev(div6, t0);
      append_dev(div6, div5);
      append_dev(div5, div1);
      append_dev(div1, figure);
      if (if_block1)
        if_block1.m(figure, null);
      append_dev(div5, t1);
      append_dev(div5, div4);
      append_dev(div4, div3);
      append_dev(div3, div2);
      append_dev(div2, a);
      append_dev(a, strong);
      append_dev(strong, t2);
      append_dev(a, t3);
      append_dev(a, small);
      append_dev(small, t4);
      append_dev(small, t5);
      append_dev(div2, t6);
      if (if_block2)
        if_block2.m(div2, null);
      append_dev(div3, t7);
      if (if_block3)
        if_block3.m(div3, null);
      append_dev(div4, t8);
      if (if_block4)
        if_block4.m(div4, null);
      append_dev(div4, t9);
      mount_component(socialnav, div4, null);
      append_dev(div6, t10);
      if (if_block5)
        if_block5.m(div6, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(a, "click", prevent_default(ctx[11]), false, true, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[8] && ctx2[2].article.author) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_10(ctx2);
          if_block0.c();
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[3].author?.url) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_8(ctx2);
          if_block1.c();
          if_block1.m(figure, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if ((!current || dirty & 8) && t2_value !== (t2_value = ctx2[3].author?.name + ""))
        set_data_dev(t2, t2_value);
      if ((!current || dirty & 8) && t5_value !== (t5_value = ctx2[3].author?.username + ""))
        set_data_dev(t5, t5_value);
      if (!current || dirty & 8 && a_href_value !== (a_href_value = ctx2[3].author?.url)) {
        attr_dev(a, "href", a_href_value);
      }
      if (ctx2[3].creationTime !== void 0) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & 8) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_7(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div2, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (!ctx2[1].hideText && !ctx2[7]) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block_53(ctx2);
          if_block3.c();
          if_block3.m(div3, null);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (ctx2[2].actualArticleRef?.quoted) {
        if (if_block4) {
          if_block4.p(get_if_ctx(ctx2), dirty);
          if (dirty & 4) {
            transition_in(if_block4, 1);
          }
        } else {
          if_block4 = create_if_block_110(get_if_ctx(ctx2));
          if_block4.c();
          transition_in(if_block4, 1);
          if_block4.m(div4, t9);
        }
      } else if (if_block4) {
        group_outros();
        transition_out(if_block4, 1, 1, () => {
          if_block4 = null;
        });
        check_outros();
      }
      const socialnav_changes = {};
      if (dirty & 8)
        socialnav_changes.article = ctx2[3];
      if (dirty & 2)
        socialnav_changes.timelineProps = ctx2[1];
      if (dirty & 4)
        socialnav_changes.repost = ctx2[8] ? ctx2[2].article : void 0;
      if (dirty & 32)
        socialnav_changes.onLogData = ctx2[5];
      if (dirty & 64)
        socialnav_changes.onLogJSON = ctx2[6];
      if (!updating_modal && dirty & 1) {
        updating_modal = true;
        socialnav_changes.modal = ctx2[0];
        add_flush_callback(() => updating_modal = false);
      }
      socialnav.$set(socialnav_changes);
      if (ctx2[3].medias.length && !ctx2[7]) {
        if (if_block5) {
          if_block5.p(ctx2, dirty);
          if (dirty & 8) {
            transition_in(if_block5, 1);
          }
        } else {
          if_block5 = create_if_block15(ctx2);
          if_block5.c();
          transition_in(if_block5, 1);
          if_block5.m(div6, null);
        }
      } else if (if_block5) {
        group_outros();
        transition_out(if_block5, 1, 1, () => {
          if_block5 = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block2);
      transition_in(if_block4);
      transition_in(socialnav.$$.fragment, local);
      transition_in(if_block5);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block2);
      transition_out(if_block4);
      transition_out(socialnav.$$.fragment, local);
      transition_out(if_block5);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div6);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
      destroy_component(socialnav);
      if (if_block5)
        if_block5.d();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment25.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance25($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("SocialArticleView", slots, []);
  let { timelineProps } = $$props;
  let { articleProps } = $$props;
  let { modal } = $$props;
  modal;
  let { actualArticle } = $$props;
  let { onMediaClick } = $$props;
  let { onLogData } = $$props;
  let { onLogJSON } = $$props;
  let minimized = false;
  const isArticleRepost = articleProps.actualArticleRef && "reposted" in articleProps.actualArticleRef;
  function onUsernameClick(clickedArticle) {
    const username = clickedArticle.author?.username;
    const endpointConstructor = getServices()[clickedArticle.idPair.service].userEndpoint;
    if (!username || !endpointConstructor)
      return;
    timelineProps.setModalTimeline({
      title: username,
      endpoints: [
        {
          endpoint: endpointConstructor(username),
          refreshTypes: everyRefreshType,
          filters: []
        }
      ],
      filters: [
        ...defaultFilterInstances,
        {
          filter: { type: "media" },
          enabled: true,
          inverted: false
        },
        {
          filter: { type: "noRef" },
          enabled: true,
          inverted: false
        }
      ],
      container: MasonryContainer_default,
      columnCount: 3
    });
  }
  const writable_props = [
    "timelineProps",
    "articleProps",
    "modal",
    "actualArticle",
    "onMediaClick",
    "onLogData",
    "onLogJSON"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<SocialArticleView> was created with unknown prop '${key}'`);
  });
  const click_handler = () => onUsernameClick(articleProps.article);
  const click_handler_1 = () => onUsernameClick(actualArticle);
  const func2 = (index) => onMediaClick(actualArticle.idPair, index);
  function socialnav_modal_binding(value) {
    modal = value;
    $$invalidate(0, modal);
  }
  const func_1 = (index) => onMediaClick(actualArticle.idPair, index);
  $$self.$$set = ($$props2) => {
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("articleProps" in $$props2)
      $$invalidate(2, articleProps = $$props2.articleProps);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("actualArticle" in $$props2)
      $$invalidate(3, actualArticle = $$props2.actualArticle);
    if ("onMediaClick" in $$props2)
      $$invalidate(4, onMediaClick = $$props2.onMediaClick);
    if ("onLogData" in $$props2)
      $$invalidate(5, onLogData = $$props2.onLogData);
    if ("onLogJSON" in $$props2)
      $$invalidate(6, onLogJSON = $$props2.onLogJSON);
  };
  $$self.$capture_state = () => ({
    Article,
    shortTimestamp,
    SocialMedia: SocialMedia_default,
    SocialNav: SocialNav_default,
    Timestamp: Timestamp_default,
    defaultFilterInstances,
    everyRefreshType,
    getServices,
    MasonryContainer: MasonryContainer_default,
    timelineProps,
    articleProps,
    modal,
    actualArticle,
    onMediaClick,
    onLogData,
    onLogJSON,
    minimized,
    isArticleRepost,
    onUsernameClick
  });
  $$self.$inject_state = ($$props2) => {
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("articleProps" in $$props2)
      $$invalidate(2, articleProps = $$props2.articleProps);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("actualArticle" in $$props2)
      $$invalidate(3, actualArticle = $$props2.actualArticle);
    if ("onMediaClick" in $$props2)
      $$invalidate(4, onMediaClick = $$props2.onMediaClick);
    if ("onLogData" in $$props2)
      $$invalidate(5, onLogData = $$props2.onLogData);
    if ("onLogJSON" in $$props2)
      $$invalidate(6, onLogJSON = $$props2.onLogJSON);
    if ("minimized" in $$props2)
      $$invalidate(7, minimized = $$props2.minimized);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    modal,
    timelineProps,
    articleProps,
    actualArticle,
    onMediaClick,
    onLogData,
    onLogJSON,
    minimized,
    isArticleRepost,
    onUsernameClick,
    click_handler,
    click_handler_1,
    func2,
    socialnav_modal_binding,
    func_1
  ];
}
var SocialArticleView = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance25, create_fragment25, safe_not_equal, {
      timelineProps: 1,
      articleProps: 2,
      modal: 0,
      actualArticle: 3,
      onMediaClick: 4,
      onLogData: 5,
      onLogJSON: 6
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "SocialArticleView",
      options,
      id: create_fragment25.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("timelineProps" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'timelineProps'");
    }
    if (ctx[2] === void 0 && !("articleProps" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'articleProps'");
    }
    if (ctx[0] === void 0 && !("modal" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'modal'");
    }
    if (ctx[3] === void 0 && !("actualArticle" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'actualArticle'");
    }
    if (ctx[4] === void 0 && !("onMediaClick" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'onMediaClick'");
    }
    if (ctx[5] === void 0 && !("onLogData" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'onLogData'");
    }
    if (ctx[6] === void 0 && !("onLogJSON" in props)) {
      console.warn("<SocialArticleView> was created without expected prop 'onLogJSON'");
    }
  }
  get timelineProps() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set timelineProps(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get articleProps() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set articleProps(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get modal() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set modal(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get actualArticle() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set actualArticle(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onMediaClick() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onMediaClick(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onLogData() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onLogData(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onLogJSON() {
    throw new Error("<SocialArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onLogJSON(value) {
    throw new Error("<SocialArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var SocialArticleView_default = SocialArticleView;

// src/bufferedMediaLoading.ts
function hash2(idPair, mediaIndex) {
  return JSON.stringify({ ...idPair, mediaIndex });
}
function createStore() {
  const { subscribe: subscribe3, update: update3 } = writable(/* @__PURE__ */ new Set());
  let local = /* @__PURE__ */ new Set();
  return {
    subscribe: subscribe3,
    getLoadingState(idPair, mediaIndex, request = false) {
      if (local.has(hash2(idPair, mediaIndex)))
        return LoadingState.Loading;
      const loaded = get_store_value(getWritable(idPair)).medias[mediaIndex].loaded;
      if (loaded === void 0)
        return LoadingState.Loaded;
      else if (loaded)
        return LoadingState.Loaded;
      else if (request) {
        if (local.size >= maxLoading)
          return LoadingState.NotLoaded;
        update3((l) => {
          l.add(hash2(idPair, mediaIndex));
          local = l;
          return l;
        });
        return LoadingState.Loading;
      } else
        return LoadingState.NotLoaded;
    },
    mediaLoaded(idPair, mediaIndex) {
      update3((l) => {
        getWritable(idPair).update((a) => {
          a.medias[mediaIndex].loaded = true;
          return a;
        });
        l.delete(hash2(idPair, mediaIndex));
        local = l;
        return l;
      });
    },
    forceLoading(article, mediaIndex) {
      if (article.medias[mediaIndex].loaded === void 0 || article.medias[mediaIndex].loaded)
        return;
      update3((l) => {
        l.add(hash2(article.idPair, mediaIndex));
        local = l;
        return l;
      });
    }
  };
}
var loadingStore = createStore();
var maxLoading = 5;
var LoadingState = /* @__PURE__ */ ((LoadingState2) => {
  LoadingState2[LoadingState2["NotLoaded"] = 0] = "NotLoaded";
  LoadingState2[LoadingState2["Loading"] = 1] = "Loading";
  LoadingState2[LoadingState2["Loaded"] = 2] = "Loaded";
  return LoadingState2;
})(LoadingState || {});

// src/articles/GalleryArticleView.svelte
var file25 = "src/articles/GalleryArticleView.svelte";
function get_each_context5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[30] = list[i];
  child_ctx[32] = list;
  child_ctx[33] = i;
  const constants_0 = child_ctx[6][child_ctx[33]] === 1 /* Loading */;
  child_ctx[31] = constants_0;
  return child_ctx;
}
function create_else_block6(ctx) {
  let video;
  let source;
  let source_src_value;
  let mounted;
  let dispose;
  function click_handler_4() {
    return ctx[20](ctx[33]);
  }
  function loadeddata_handler_1() {
    return ctx[21](ctx[31], ctx[33]);
  }
  function load_handler_2() {
    return ctx[22](ctx[31], ctx[33]);
  }
  const block = {
    c: function create4() {
      video = element("video");
      source = element("source");
      if (!src_url_equal(source.src, source_src_value = ctx[30].src))
        attr_dev(source, "src", source_src_value);
      attr_dev(source, "type", "video/mp4");
      add_location(source, file25, 145, 5, 4296);
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      attr_dev(video, "class", "svelte-1csbvsm");
      add_location(video, file25, 136, 4, 3958);
    },
    m: function mount(target, anchor) {
      insert_dev(target, video, anchor);
      append_dev(video, source);
      if (!mounted) {
        dispose = [
          listen_dev(video, "click", prevent_default(click_handler_4), false, true, false),
          listen_dev(video, "loadeddata", loadeddata_handler_1, false, false, false),
          listen_dev(video, "load", load_handler_2, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 4 && !src_url_equal(source.src, source_src_value = ctx[30].src)) {
        attr_dev(source, "src", source_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(video);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block6.name,
    type: "else",
    source: "(136:3) {:else}",
    ctx
  });
  return block;
}
function create_if_block_82(ctx) {
  let video;
  let source;
  let source_src_value;
  let mounted;
  let dispose;
  function click_handler_3() {
    return ctx[17](ctx[33]);
  }
  function loadeddata_handler() {
    return ctx[18](ctx[31], ctx[33]);
  }
  function load_handler_1() {
    return ctx[19](ctx[31], ctx[33]);
  }
  const block = {
    c: function create4() {
      video = element("video");
      source = element("source");
      if (!src_url_equal(source.src, source_src_value = ctx[30].src))
        attr_dev(source, "src", source_src_value);
      attr_dev(source, "type", "video/mp4");
      add_location(source, file25, 133, 5, 3887);
      video.controls = true;
      attr_dev(video, "class", "svelte-1csbvsm");
      add_location(video, file25, 127, 4, 3584);
    },
    m: function mount(target, anchor) {
      insert_dev(target, video, anchor);
      append_dev(video, source);
      if (!mounted) {
        dispose = [
          listen_dev(video, "click", prevent_default(click_handler_3), false, true, false),
          listen_dev(video, "loadeddata", loadeddata_handler, false, false, false),
          listen_dev(video, "load", load_handler_1, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 4 && !src_url_equal(source.src, source_src_value = ctx[30].src)) {
        attr_dev(source, "src", source_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(video);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_82.name,
    type: "if",
    source: "(126:82) ",
    ctx
  });
  return block;
}
function create_if_block_63(ctx) {
  let img;
  let img_alt_value;
  let img_src_value;
  let i = ctx[33];
  let t;
  let if_block_anchor;
  let mounted;
  let dispose;
  function click_handler_1() {
    return ctx[13](ctx[33]);
  }
  function load_handler() {
    return ctx[14](ctx[31], ctx[33]);
  }
  const assign_img = () => ctx[15](img, i);
  const unassign_img = () => ctx[15](null, i);
  let if_block = ctx[31] && create_if_block_72(ctx);
  const block = {
    c: function create4() {
      img = element("img");
      t = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      attr_dev(img, "alt", img_alt_value = ctx[2].idPair.id);
      if (!src_url_equal(img.src, img_src_value = ctx[30].src))
        attr_dev(img, "src", img_src_value);
      attr_dev(img, "class", "svelte-1csbvsm");
      toggle_class(img, "articleMediaLoading", ctx[31]);
      add_location(img, file25, 109, 4, 2936);
    },
    m: function mount(target, anchor) {
      insert_dev(target, img, anchor);
      assign_img();
      insert_dev(target, t, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      if (!mounted) {
        dispose = [
          listen_dev(img, "click", click_handler_1, false, false, false),
          listen_dev(img, "load", load_handler, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 4 && img_alt_value !== (img_alt_value = ctx[2].idPair.id)) {
        attr_dev(img, "alt", img_alt_value);
      }
      if (dirty[0] & 4 && !src_url_equal(img.src, img_src_value = ctx[30].src)) {
        attr_dev(img, "src", img_src_value);
      }
      if (i !== ctx[33]) {
        unassign_img();
        i = ctx[33];
        assign_img();
      }
      if (dirty[0] & 68) {
        toggle_class(img, "articleMediaLoading", ctx[31]);
      }
      if (ctx[31]) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_72(ctx);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(img);
      unassign_img();
      if (detaching)
        detach_dev(t);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_63.name,
    type: "if",
    source: "(109:86) ",
    ctx
  });
  return block;
}
function create_if_block_54(ctx) {
  let img;
  let img_alt_value;
  let img_src_value;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[12](ctx[33]);
  }
  const block = {
    c: function create4() {
      img = element("img");
      attr_dev(img, "alt", img_alt_value = `${ctx[2].idPair.id} thumbnail`);
      attr_dev(img, "class", "articleThumb svelte-1csbvsm");
      if (!src_url_equal(img.src, img_src_value = ctx[30].thumbnail))
        attr_dev(img, "src", img_src_value);
      add_location(img, file25, 102, 4, 2670);
    },
    m: function mount(target, anchor) {
      insert_dev(target, img, anchor);
      if (!mounted) {
        dispose = listen_dev(img, "click", click_handler, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 4 && img_alt_value !== (img_alt_value = `${ctx[2].idPair.id} thumbnail`)) {
        attr_dev(img, "alt", img_alt_value);
      }
      if (dirty[0] & 4 && !src_url_equal(img.src, img_src_value = ctx[30].thumbnail)) {
        attr_dev(img, "src", img_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(img);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_54.name,
    type: "if",
    source: "(102:3) {#if loadingStates[i] === LoadingState.NotLoaded}",
    ctx
  });
  return block;
}
function create_if_block_72(ctx) {
  let img;
  let img_alt_value;
  let img_src_value;
  let mounted;
  let dispose;
  function click_handler_2() {
    return ctx[16](ctx[33]);
  }
  const block = {
    c: function create4() {
      img = element("img");
      attr_dev(img, "alt", img_alt_value = `${ctx[2].idPair.id} thumbnail`);
      attr_dev(img, "class", "articleThumb svelte-1csbvsm");
      if (!src_url_equal(img.src, img_src_value = ctx[30].thumbnail))
        attr_dev(img, "src", img_src_value);
      add_location(img, file25, 118, 5, 3257);
    },
    m: function mount(target, anchor) {
      insert_dev(target, img, anchor);
      if (!mounted) {
        dispose = listen_dev(img, "click", click_handler_2, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 4 && img_alt_value !== (img_alt_value = `${ctx[2].idPair.id} thumbnail`)) {
        attr_dev(img, "alt", img_alt_value);
      }
      if (dirty[0] & 4 && !src_url_equal(img.src, img_src_value = ctx[30].thumbnail)) {
        attr_dev(img, "src", img_src_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(img);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_72.name,
    type: "if",
    source: "(118:4) {#if isLoading}",
    ctx
  });
  return block;
}
function create_each_block5(key_1, ctx) {
  let first;
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (ctx2[6][ctx2[33]] === 0 /* NotLoaded */)
      return create_if_block_54;
    if (ctx2[30].mediaType === 0 /* Image */ || ctx2[30].mediaType === 3 /* Gif */)
      return create_if_block_63;
    if (!ctx2[1].animatedAsGifs && ctx2[30].mediaType === 1 /* Video */)
      return create_if_block_82;
    return create_else_block6;
  }
  let current_block_type = select_block_type(ctx, [-1, -1]);
  let if_block = current_block_type(ctx);
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      if_block.c();
      if_block_anchor = empty();
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      if_block.m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
        if_block.p(ctx, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      if_block.d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block5.name,
    type: "each",
    source: "(100:2) {#each actualArticle.medias as media, i (i)}",
    ctx
  });
  return block;
}
function create_if_block_45(ctx) {
  let button;
  let span;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: {
      icon: faExpandArrowsAlt,
      class: "is-small"
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      attr_dev(span, "class", "icon darkIcon");
      add_location(span, file25, 157, 5, 4650);
      attr_dev(button, "class", "button svelte-1csbvsm");
      add_location(button, file25, 156, 4, 4621);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, span);
      mount_component(fa, span, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(span, "click", ctx[23], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_45.name,
    type: "if",
    source: "(156:3) {#if !modal}",
    ctx
  });
  return block;
}
function create_if_block_37(ctx) {
  let a;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      a = element("a");
      a.textContent = "Load Media";
      attr_dev(a, "class", "dropdown-item svelte-1csbvsm");
      add_location(a, file25, 178, 5, 5465);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      if (!mounted) {
        dispose = listen_dev(a, "click", ctx[26], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_37.name,
    type: "if",
    source: "(177:4) {#if actualArticle.medias.some(m => !m.loaded) }",
    ctx
  });
  return block;
}
function create_if_block_29(ctx) {
  let a;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      a = element("a");
      a.textContent = "Fetch Article";
      attr_dev(a, "class", "dropdown-item svelte-1csbvsm");
      add_location(a, file25, 199, 5, 6109);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      if (!mounted) {
        dispose = listen_dev(a, "click", ctx[27], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_29.name,
    type: "if",
    source: "(198:4) {#if !actualArticle.fetched }",
    ctx
  });
  return block;
}
function create_default_slot6(ctx) {
  let a0;
  let t1;
  let a1;
  let t3;
  let show_if = ctx[2].medias.some(func);
  let t4;
  let a2;
  let t5;
  let a2_href_value;
  let t6;
  let a3;
  let t8;
  let a4;
  let t10;
  let if_block1_anchor;
  let mounted;
  let dispose;
  let if_block0 = show_if && create_if_block_37(ctx);
  let if_block1 = !ctx[2].fetched && create_if_block_29(ctx);
  const block = {
    c: function create4() {
      a0 = element("a");
      a0.textContent = "Mark as read";
      t1 = space();
      a1 = element("a");
      a1.textContent = "Hide";
      t3 = space();
      if (if_block0)
        if_block0.c();
      t4 = space();
      a2 = element("a");
      t5 = text("External Link");
      t6 = space();
      a3 = element("a");
      a3.textContent = "Log Data";
      t8 = space();
      a4 = element("a");
      a4.textContent = "Log JSON Data";
      t10 = space();
      if (if_block1)
        if_block1.c();
      if_block1_anchor = empty();
      attr_dev(a0, "class", "dropdown-item svelte-1csbvsm");
      add_location(a0, file25, 169, 4, 5098);
      attr_dev(a1, "class", "dropdown-item svelte-1csbvsm");
      add_location(a1, file25, 173, 4, 5261);
      attr_dev(a2, "class", "dropdown-item svelte-1csbvsm");
      attr_dev(a2, "href", a2_href_value = ctx[2].url);
      attr_dev(a2, "target", "_blank");
      add_location(a2, file25, 182, 4, 5649);
      attr_dev(a3, "class", "dropdown-item svelte-1csbvsm");
      add_location(a3, file25, 190, 4, 5820);
      attr_dev(a4, "class", "dropdown-item svelte-1csbvsm");
      add_location(a4, file25, 194, 4, 5944);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a0, anchor);
      insert_dev(target, t1, anchor);
      insert_dev(target, a1, anchor);
      insert_dev(target, t3, anchor);
      if (if_block0)
        if_block0.m(target, anchor);
      insert_dev(target, t4, anchor);
      insert_dev(target, a2, anchor);
      append_dev(a2, t5);
      insert_dev(target, t6, anchor);
      insert_dev(target, a3, anchor);
      insert_dev(target, t8, anchor);
      insert_dev(target, a4, anchor);
      insert_dev(target, t10, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert_dev(target, if_block1_anchor, anchor);
      if (!mounted) {
        dispose = [
          listen_dev(a0, "click", ctx[24], false, false, false),
          listen_dev(a1, "click", ctx[25], false, false, false),
          listen_dev(a3, "click", function() {
            if (is_function(ctx[4]))
              ctx[4].apply(this, arguments);
          }, false, false, false),
          listen_dev(a4, "click", function() {
            if (is_function(ctx[5]))
              ctx[5].apply(this, arguments);
          }, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 4)
        show_if = ctx[2].medias.some(func);
      if (show_if) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_37(ctx);
          if_block0.c();
          if_block0.m(t4.parentNode, t4);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & 4 && a2_href_value !== (a2_href_value = ctx[2].url)) {
        attr_dev(a2, "href", a2_href_value);
      }
      if (!ctx[2].fetched) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_29(ctx);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(a1);
      if (detaching)
        detach_dev(t3);
      if (if_block0)
        if_block0.d(detaching);
      if (detaching)
        detach_dev(t4);
      if (detaching)
        detach_dev(a2);
      if (detaching)
        detach_dev(t6);
      if (detaching)
        detach_dev(a3);
      if (detaching)
        detach_dev(t8);
      if (detaching)
        detach_dev(a4);
      if (detaching)
        detach_dev(t10);
      if (if_block1)
        if_block1.d(detaching);
      if (detaching)
        detach_dev(if_block1_anchor);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot6.name,
    type: "slot",
    source: "(164:3) <Dropdown isRight={true} labelClasses='articleButton'>",
    ctx
  });
  return block;
}
function create_triggerIcon_slot2(ctx) {
  let span;
  let fa;
  let current;
  fa = new fa_default({
    props: { icon: faEllipsisH, class: "level-item" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      span = element("span");
      create_component(fa.$$.fragment);
      attr_dev(span, "slot", "triggerIcon");
      attr_dev(span, "class", "icon darkIcon svelte-1csbvsm");
      add_location(span, file25, 165, 4, 4935);
    },
    m: function mount(target, anchor) {
      insert_dev(target, span, anchor);
      mount_component(fa, span, null);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(span);
      destroy_component(fa);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_triggerIcon_slot2.name,
    type: "slot",
    source: "(166:4) ",
    ctx
  });
  return block;
}
function create_if_block_111(ctx) {
  let button;
  let span;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faHeart2, class: "is-small" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      attr_dev(span, "class", "icon darkIcon");
      add_location(span, file25, 211, 5, 6493);
      attr_dev(button, "class", "button svelte-1csbvsm");
      add_location(button, file25, 207, 4, 6373);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, span);
      mount_component(fa, span, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[28], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_111.name,
    type: "if",
    source: "(207:3) {#if likeAction && !(actualArticle.getLiked() && !likeAction.togglable)}",
    ctx
  });
  return block;
}
function create_if_block16(ctx) {
  let button;
  let span;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faRetweet, class: "is-small" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      span = element("span");
      create_component(fa.$$.fragment);
      attr_dev(span, "class", "icon darkIcon");
      add_location(span, file25, 221, 5, 6811);
      attr_dev(button, "class", "button svelte-1csbvsm");
      add_location(button, file25, 217, 4, 6689);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      append_dev(button, span);
      mount_component(fa, span, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[29], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block16.name,
    type: "if",
    source: "(217:3) {#if repostAction && !(actualArticle.getReposted() && !repostAction.togglable)}",
    ctx
  });
  return block;
}
function create_fragment26(ctx) {
  let div3;
  let div2;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let div0;
  let a;
  let span;
  let fa;
  let a_href_value;
  let t1;
  let t2;
  let dropdown;
  let t3;
  let div1;
  let show_if_1 = ctx[8] && !(ctx[2].getLiked() && !ctx[8].togglable);
  let t4;
  let show_if = ctx[9] && !(ctx[2].getReposted() && !ctx[9].togglable);
  let current;
  let each_value = ctx[2].medias;
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[33];
  validate_each_keys(ctx, each_value, get_each_context5, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context5(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block5(key, child_ctx));
  }
  fa = new fa_default({
    props: {
      icon: faExternalLinkAlt,
      class: "is-small"
    },
    $$inline: true
  });
  let if_block0 = !ctx[0] && create_if_block_45(ctx);
  dropdown = new Dropdown_default({
    props: {
      isRight: true,
      labelClasses: "articleButton",
      $$slots: {
        triggerIcon: [create_triggerIcon_slot2],
        default: [create_default_slot6]
      },
      $$scope: { ctx }
    },
    $$inline: true
  });
  let if_block1 = show_if_1 && create_if_block_111(ctx);
  let if_block2 = show_if && create_if_block16(ctx);
  const block = {
    c: function create4() {
      div3 = element("div");
      div2 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      div0 = element("div");
      a = element("a");
      span = element("span");
      create_component(fa.$$.fragment);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      create_component(dropdown.$$.fragment);
      t3 = space();
      div1 = element("div");
      if (if_block1)
        if_block1.c();
      t4 = space();
      if (if_block2)
        if_block2.c();
      attr_dev(span, "class", "icon darkIcon");
      add_location(span, file25, 151, 4, 4499);
      attr_dev(a, "class", "button svelte-1csbvsm");
      attr_dev(a, "title", "External Link");
      attr_dev(a, "href", a_href_value = ctx[2].url);
      attr_dev(a, "target", "_blank");
      add_location(a, file25, 150, 3, 4413);
      attr_dev(div0, "class", "holderBox holderBoxTop svelte-1csbvsm");
      add_location(div0, file25, 149, 2, 4373);
      attr_dev(div1, "class", "holderBox holderBoxBottom svelte-1csbvsm");
      add_location(div1, file25, 205, 2, 6253);
      attr_dev(div2, "class", "svelte-1csbvsm");
      add_location(div2, file25, 98, 1, 2494);
      attr_dev(div3, "class", "galleryArticle svelte-1csbvsm");
      add_location(div3, file25, 97, 0, 2464);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div3, anchor);
      append_dev(div3, div2);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div2, null);
      }
      append_dev(div2, t0);
      append_dev(div2, div0);
      append_dev(div0, a);
      append_dev(a, span);
      mount_component(fa, span, null);
      append_dev(div0, t1);
      if (if_block0)
        if_block0.m(div0, null);
      append_dev(div0, t2);
      mount_component(dropdown, div0, null);
      append_dev(div2, t3);
      append_dev(div2, div1);
      if (if_block1)
        if_block1.m(div1, null);
      append_dev(div1, t4);
      if (if_block2)
        if_block2.m(div1, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (dirty[0] & 206) {
        each_value = ctx2[2].medias;
        validate_each_argument(each_value);
        validate_each_keys(ctx2, each_value, get_each_context5, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div2, destroy_block, create_each_block5, t0, get_each_context5);
      }
      if (!current || dirty[0] & 4 && a_href_value !== (a_href_value = ctx2[2].url)) {
        attr_dev(a, "href", a_href_value);
      }
      if (!ctx2[0]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & 1) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_45(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div0, t2);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      const dropdown_changes = {};
      if (dirty[0] & 52 | dirty[1] & 8) {
        dropdown_changes.$$scope = { dirty, ctx: ctx2 };
      }
      dropdown.$set(dropdown_changes);
      if (dirty[0] & 4)
        show_if_1 = ctx2[8] && !(ctx2[2].getLiked() && !ctx2[8].togglable);
      if (show_if_1) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & 4) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_111(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, t4);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (dirty[0] & 4)
        show_if = ctx2[9] && !(ctx2[2].getReposted() && !ctx2[9].togglable);
      if (show_if) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & 4) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block16(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div1, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      transition_in(if_block0);
      transition_in(dropdown.$$.fragment, local);
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      transition_out(if_block0);
      transition_out(dropdown.$$.fragment, local);
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div3);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      destroy_component(fa);
      if (if_block0)
        if_block0.d();
      destroy_component(dropdown);
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment26.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
var func = (m) => !m.loaded;
function instance26($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("GalleryArticleView", slots, []);
  let { timelineProps } = $$props;
  let { articleProps } = $$props;
  articleProps;
  let { style = "" } = $$props;
  style;
  let { modal } = $$props;
  modal;
  let { actualArticle } = $$props;
  let { onMediaClick } = $$props;
  let { onLogData } = $$props;
  let { onLogJSON } = $$props;
  const mediaRefs = [];
  let loadingStates;
  afterUpdate(() => {
    const count = actualArticle.medias.length;
    for (let i = 0; i < count; ++i) {
      if (actualArticle.medias[i].queueLoadInfo === 2 /* LazyLoad */ && !actualArticle.medias[i].loaded) {
        if (mediaRefs[i]?.complete)
          loadingStore.mediaLoaded(actualArticle.idPair, i);
      }
    }
  });
  const likeAction = getArticleAction(STANDARD_ACTIONS.like, actualArticle.idPair.service);
  const repostAction = getArticleAction(STANDARD_ACTIONS.repost, actualArticle.idPair.service);
  const writable_props = [
    "timelineProps",
    "articleProps",
    "style",
    "modal",
    "actualArticle",
    "onMediaClick",
    "onLogData",
    "onLogJSON"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<GalleryArticleView> was created with unknown prop '${key}'`);
  });
  const click_handler = (i) => onMediaClick(actualArticle.idPair, i);
  const click_handler_1 = (i) => onMediaClick(actualArticle.idPair, i);
  const load_handler = (isLoading, i) => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : void 0;
  function img_binding($$value, i) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      mediaRefs[i] = $$value;
      $$invalidate(7, mediaRefs);
    });
  }
  const click_handler_2 = (i) => onMediaClick(actualArticle.idPair, i);
  const click_handler_3 = (i) => onMediaClick(actualArticle.idPair, i);
  const loadeddata_handler = (isLoading, i) => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : void 0;
  const load_handler_1 = (isLoading, i) => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : void 0;
  const click_handler_4 = (i) => onMediaClick(actualArticle.idPair, i);
  const loadeddata_handler_1 = (isLoading, i) => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : void 0;
  const load_handler_2 = (isLoading, i) => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : void 0;
  const click_handler_5 = () => $$invalidate(0, modal = !modal);
  const click_handler_6 = () => toggleMarkAsRead(actualArticle.idPair);
  const click_handler_7 = () => toggleHide(actualArticle.idPair);
  const click_handler_8 = () => {
    for (let i = 0; i < actualArticle.medias.length; ++i)
      loadingStore.forceLoading(actualArticle, i);
  };
  const click_handler_9 = () => fetchArticle(actualArticle.idPair);
  const click_handler_10 = () => articleAction(STANDARD_ACTIONS.like, actualArticle.idPair);
  const click_handler_11 = () => articleAction(STANDARD_ACTIONS.repost, actualArticle.idPair);
  $$self.$$set = ($$props2) => {
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("articleProps" in $$props2)
      $$invalidate(10, articleProps = $$props2.articleProps);
    if ("style" in $$props2)
      $$invalidate(11, style = $$props2.style);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("actualArticle" in $$props2)
      $$invalidate(2, actualArticle = $$props2.actualArticle);
    if ("onMediaClick" in $$props2)
      $$invalidate(3, onMediaClick = $$props2.onMediaClick);
    if ("onLogData" in $$props2)
      $$invalidate(4, onLogData = $$props2.onLogData);
    if ("onLogJSON" in $$props2)
      $$invalidate(5, onLogJSON = $$props2.onLogJSON);
  };
  $$self.$capture_state = () => ({
    Article,
    MediaQueueInfo,
    MediaType,
    Fa: fa_default,
    faExpandArrowsAlt,
    faExternalLinkAlt,
    faHeart: faHeart2,
    faRetweet,
    faEllipsisH,
    afterUpdate,
    LoadingState,
    loadingStore,
    Dropdown: Dropdown_default,
    fetchArticle,
    toggleHide,
    toggleMarkAsRead,
    articleAction,
    getArticleAction,
    STANDARD_ACTIONS,
    timelineProps,
    articleProps,
    style,
    modal,
    actualArticle,
    onMediaClick,
    onLogData,
    onLogJSON,
    mediaRefs,
    loadingStates,
    likeAction,
    repostAction
  });
  $$self.$inject_state = ($$props2) => {
    if ("timelineProps" in $$props2)
      $$invalidate(1, timelineProps = $$props2.timelineProps);
    if ("articleProps" in $$props2)
      $$invalidate(10, articleProps = $$props2.articleProps);
    if ("style" in $$props2)
      $$invalidate(11, style = $$props2.style);
    if ("modal" in $$props2)
      $$invalidate(0, modal = $$props2.modal);
    if ("actualArticle" in $$props2)
      $$invalidate(2, actualArticle = $$props2.actualArticle);
    if ("onMediaClick" in $$props2)
      $$invalidate(3, onMediaClick = $$props2.onMediaClick);
    if ("onLogData" in $$props2)
      $$invalidate(4, onLogData = $$props2.onLogData);
    if ("onLogJSON" in $$props2)
      $$invalidate(5, onLogJSON = $$props2.onLogJSON);
    if ("loadingStates" in $$props2)
      $$invalidate(6, loadingStates = $$props2.loadingStates);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & 70) {
      $: {
        $$invalidate(6, loadingStates = []);
        for (let mediaIndex = 0; mediaIndex < actualArticle.medias.length; ++mediaIndex)
          loadingStates.push(loadingStore.getLoadingState(actualArticle.idPair, mediaIndex, timelineProps.shouldLoadMedia));
      }
    }
  };
  return [
    modal,
    timelineProps,
    actualArticle,
    onMediaClick,
    onLogData,
    onLogJSON,
    loadingStates,
    mediaRefs,
    likeAction,
    repostAction,
    articleProps,
    style,
    click_handler,
    click_handler_1,
    load_handler,
    img_binding,
    click_handler_2,
    click_handler_3,
    loadeddata_handler,
    load_handler_1,
    click_handler_4,
    loadeddata_handler_1,
    load_handler_2,
    click_handler_5,
    click_handler_6,
    click_handler_7,
    click_handler_8,
    click_handler_9,
    click_handler_10,
    click_handler_11
  ];
}
var GalleryArticleView = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance26, create_fragment26, safe_not_equal, {
      timelineProps: 1,
      articleProps: 10,
      style: 11,
      modal: 0,
      actualArticle: 2,
      onMediaClick: 3,
      onLogData: 4,
      onLogJSON: 5
    }, null, [-1, -1]);
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "GalleryArticleView",
      options,
      id: create_fragment26.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("timelineProps" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'timelineProps'");
    }
    if (ctx[10] === void 0 && !("articleProps" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'articleProps'");
    }
    if (ctx[0] === void 0 && !("modal" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'modal'");
    }
    if (ctx[2] === void 0 && !("actualArticle" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'actualArticle'");
    }
    if (ctx[3] === void 0 && !("onMediaClick" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'onMediaClick'");
    }
    if (ctx[4] === void 0 && !("onLogData" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'onLogData'");
    }
    if (ctx[5] === void 0 && !("onLogJSON" in props)) {
      console.warn("<GalleryArticleView> was created without expected prop 'onLogJSON'");
    }
  }
  get timelineProps() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set timelineProps(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get articleProps() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set articleProps(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get style() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set style(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get modal() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set modal(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get actualArticle() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set actualArticle(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onMediaClick() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onMediaClick(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onLogData() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onLogData(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get onLogJSON() {
    throw new Error("<GalleryArticleView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set onLogJSON(value) {
    throw new Error("<GalleryArticleView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var GalleryArticleView_default = GalleryArticleView;

// src/sorting/index.ts
var SortMethod = /* @__PURE__ */ ((SortMethod2) => {
  SortMethod2[SortMethod2["Id"] = 0] = "Id";
  SortMethod2[SortMethod2["Date"] = 1] = "Date";
  SortMethod2[SortMethod2["Likes"] = 2] = "Likes";
  SortMethod2[SortMethod2["Reposts"] = 3] = "Reposts";
  return SortMethod2;
})(SortMethod || {});
var allSortMethods = [
  0 /* Id */,
  1 /* Date */,
  2 /* Likes */,
  3 /* Reposts */
];
function compare(method) {
  return (a, b) => {
    switch (method) {
      case 0 /* Id */:
        return a.article.numberId > b.article.numberId ? 1 : a.article.numberId < b.article.numberId ? -1 : 0;
      case 1 /* Date */:
        return (a.article.creationTime?.getTime() || 0) - (b.article.creationTime?.getTime() || 0);
      case 2 /* Likes */:
        return getActualArticle(a).getLikeCount() - getActualArticle(b).getLikeCount();
      case 3 /* Reposts */:
        return getActualArticle(a).getRepostCount() - getActualArticle(b).getRepostCount();
    }
  };
}
function directionLabel(method, reversed) {
  switch (method) {
    case 1 /* Date */:
      return reversed ? "Reverse chronological" : "Chronological";
    default:
      return reversed ? "Descending" : "Ascending";
  }
}
function methodName(method) {
  switch (method) {
    case 0 /* Id */:
      return "Id";
    case 1 /* Date */:
      return "Date";
    case 2 /* Likes */:
      return "Likes";
    case 3 /* Reposts */:
      return "Reposts";
  }
}

// src/timelines/index.ts
function defaultTimeline() {
  return {
    title: "Timeline",
    endpoints: [],
    articles: [],
    container: ColumnContainer_default,
    articleView: SocialArticleView_default,
    columnCount: 1,
    width: 1,
    filters: defaultFilterInstances,
    sortInfo: {
      method: 1 /* Date */,
      reversed: true
    },
    animatedAsGifs: false,
    scrollSpeed: 3,
    hideText: false,
    compact: false,
    shouldLoadMedia: true,
    hideFilteredOutArticles: true
  };
}

// src/storages/index.ts
var MAIN_STORAGE_KEY = "SoshalThingSvelte";
var TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + " Timelines";
function loadMainStorage() {
  const item = localStorage.getItem(MAIN_STORAGE_KEY);
  const mainStorage = item ? JSON.parse(item) : {};
  if (mainStorage.fullscreen === false)
    delete mainStorage.fullscreen;
  else if (mainStorage.fullscreen === true)
    mainStorage.fullscreen = 0;
  return mainStorage;
}
function loadTimelines() {
  const item = localStorage.getItem(TIMELINE_STORAGE_KEY);
  let storage = item ? JSON.parse(item) : [];
  return storage.map((t) => {
    const defaulted = {
      ...DEFAULT_TIMELINE_STORAGE,
      ...t
    };
    const endpoints2 = [];
    for (const endpointStorage of defaulted.endpoints) {
      const endpoint = parseAndLoadEndpoint(endpointStorage);
      if (endpoint !== void 0 && !endpoints2.find((e) => e.name === endpoint.name))
        endpoints2.push(endpoint);
    }
    return {
      ...defaultTimeline(),
      title: defaulted.title,
      endpoints: endpoints2,
      container: parseContainer(defaulted.container),
      articleView: parseArticleView(defaulted.articleView),
      columnCount: defaulted.columnCount,
      width: defaulted.width,
      filters: defaulted.filters,
      sortInfo: parseSortInfo(defaulted.sortInfo)
    };
  });
}
function parseContainer(container) {
  switch (container) {
    case "Row":
    case "RowContainer":
      return RowContainer_default;
    case "Masonry":
    case "MasonryContainer":
      return MasonryContainer_default;
    case "Column":
    case "ColumnContainer":
    default:
      return ColumnContainer_default;
  }
}
function parseArticleView(articleView) {
  switch (articleView) {
    case "Gallery":
    case "GalleryArticle":
    case "GalleryArticleView":
      return GalleryArticleView_default;
    case "Social":
    case "SocialArticle":
    case "SocialArticleView":
    default:
      return SocialArticleView_default;
  }
}
function parseAndLoadEndpoint(storage) {
  const endpoints2 = getEndpoints();
  const services2 = getServices();
  if (!services2.hasOwnProperty(storage.service)) {
    console.error(`"${storage.service}" isn't a registered service`);
    return void 0;
  } else if (services2[storage.service].endpointConstructors.length <= storage.endpointType) {
    console.error(`"${storage.service}" doesn't have endpointType "${storage.endpointType}"`);
    return void 0;
  }
  const constructorInfo = services2[storage.service].endpointConstructors[storage.endpointType];
  let endpoint = Object.values(endpoints2).find((endpoint2) => constructorInfo.name === endpoint2.constructor.constructorInfo.name && endpoint2.matchParams(storage.params));
  if (endpoint === void 0) {
    endpoint = constructorInfo.constructor(storage.params);
    addEndpoint(endpoint);
  }
  const refreshTypes = /* @__PURE__ */ new Set();
  if (storage.onStart === void 0 ? true : storage.onStart)
    refreshTypes.add(0 /* RefreshStart */);
  if (storage.onRefresh === void 0 ? true : storage.onRefresh)
    refreshTypes.add(1 /* Refresh */);
  if (storage.loadTop === void 0 ? true : storage.loadTop)
    refreshTypes.add(2 /* LoadTop */);
  if (storage.loadBottom === void 0 ? true : storage.loadBottom)
    refreshTypes.add(3 /* LoadBottom */);
  return {
    name: endpoint.name,
    refreshTypes,
    filters: storage.filters || []
  };
}
function parseSortInfo({ method, reversed }) {
  let sortMethod;
  switch (method?.toLowerCase()) {
    case "id":
      sortMethod = 0 /* Id */;
      break;
    case "date":
      sortMethod = 1 /* Date */;
      break;
    case "likes":
      sortMethod = 2 /* Likes */;
      break;
    case "reposts":
      sortMethod = 3 /* Reposts */;
      break;
  }
  return {
    method: sortMethod,
    reversed: reversed || false
  };
}
var DEFAULT_TIMELINE_STORAGE = {
  title: "Timeline",
  endpoints: [],
  columnCount: 1,
  width: 1,
  compact: false,
  animatedAsGifs: false,
  hideText: false,
  filters: defaultFilterInstances,
  sortInfo: {
    method: void 0,
    reversed: false
  }
};

// src/storages/serviceCache.ts
var LOCAL_CACHE_STORAGE_KEY = MAIN_STORAGE_KEY + " Cache";
function updateMarkAsReadStorage() {
  const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
  let storage = item !== null ? JSON.parse(item) : null;
  if (storage === null)
    storage = { services: {} };
  for (const service of Object.values(getServices())) {
    const articlesMarkedAsRead = new Set(storage.services[service.name]?.articlesMarkedAsRead);
    for (const article of getServiceArticles(service)) {
      if (article.markedAsRead)
        articlesMarkedAsRead.add(article.idPair.id.toString());
      else
        articlesMarkedAsRead.delete(article.idPair.id.toString());
    }
    if (storage.services.hasOwnProperty(service.name))
      storage.services[service.name].articlesMarkedAsRead = [...articlesMarkedAsRead];
    else
      storage.services[service.name] = {
        articlesMarkedAsRead: [...articlesMarkedAsRead],
        cachedArticles: {}
      };
  }
  sessionStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage));
}
function updateHiddenStorage() {
  const item = localStorage.getItem(LOCAL_CACHE_STORAGE_KEY);
  let storage = item !== null ? JSON.parse(item) : null;
  if (storage === null)
    storage = { services: {} };
  for (const service of Object.values(getServices())) {
    const hiddenArticles = new Set(storage.services[service.name]?.hiddenArticles || []);
    for (const article of getServiceArticles(service)) {
      if (article.hidden)
        hiddenArticles.add(article.idPair.id.toString());
      else
        hiddenArticles.delete(article.idPair.id.toString());
    }
    if (storage.services.hasOwnProperty(service.name))
      storage.services[service.name].hiddenArticles = [...hiddenArticles];
    else
      storage.services[service.name] = {
        hiddenArticles: [...hiddenArticles]
      };
  }
  localStorage.setItem(LOCAL_CACHE_STORAGE_KEY, JSON.stringify(storage));
}
function updateCachedArticlesStorage() {
  const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
  let storage = item !== null ? JSON.parse(item) : null;
  if (storage === null)
    storage = { services: {} };
  for (const service of Object.values(getServices())) {
    const getCachedArticles = service.getCachedArticles;
    if (getCachedArticles !== void 0) {
      const cachedArticles = getCachedArticles();
      if (storage.services.hasOwnProperty(service.name))
        storage.services[service.name].cachedArticles = {
          ...storage.services[service.name].cachedArticles,
          ...cachedArticles
        };
      else
        storage.services[service.name] = {
          articlesMarkedAsRead: [],
          cachedArticles
        };
    }
  }
  sessionStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage));
}
function getMarkedAsReadStorage(service) {
  const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
  const parsed = item !== null ? JSON.parse(item) : null;
  return parsed?.services[service.name]?.articlesMarkedAsRead || [];
}
function getHiddenStorage(service) {
  const item = localStorage.getItem(LOCAL_CACHE_STORAGE_KEY);
  const parsed = item !== null ? JSON.parse(item) : null;
  return parsed?.services[service.name]?.hiddenArticles || [];
}
function getServiceArticles(service) {
  return get_store_value(derived(Object.values(service.articles), (a) => a));
}

// src/services/service.ts
var endpoints = {};
var services = {};
var STANDARD_ACTIONS = {
  like: "like",
  repost: "repost"
};
function articleAction(action, idPair) {
  if (services[idPair.service].articleActions.hasOwnProperty(action))
    services[idPair.service].articleActions[action].action(idPair);
  else
    console.warn(`${idPair.service} doesn't have action ${action}.`);
}
function getArticleAction(action, service) {
  const actions = services[service].articleActions;
  if (actions.hasOwnProperty(action))
    return actions[action];
}
function addArticles(service, ignoreRefs, ...articles) {
  for (const { article, actualArticleRef, replyRef } of articles) {
    service.articles[article.idPair.id] = writable(article);
    if (!ignoreRefs && actualArticleRef)
      for (const ref of getRefed(actualArticleRef)) {
        if (!service.articles.hasOwnProperty(ref.idPair.id))
          service.articles[ref.idPair.id] = writable(ref);
      }
    if (replyRef && (!ignoreRefs || !service.articles.hasOwnProperty(replyRef.idPair.id)))
      service.articles[replyRef.idPair.id.toString()] = writable(replyRef);
  }
  updateCachedArticlesStorage();
}
var Endpoint2 = class {
  constructor(refreshTypes = /* @__PURE__ */ new Set([
    RefreshType.RefreshStart,
    RefreshType.Refresh
  ])) {
    this.refreshTypes = refreshTypes;
  }
  articleIdPairs = [];
  rateLimitInfo = null;
  isAutoRefreshing = false;
  autoRefreshInterval = 9e4;
  isRateLimited() {
    if (this.rateLimitInfo === null)
      return false;
    else
      return this.rateLimitInfo.remaining <= 0;
  }
};
__publicField(Endpoint2, "constructorInfo");
var RefreshType = /* @__PURE__ */ ((RefreshType3) => {
  RefreshType3[RefreshType3["RefreshStart"] = 0] = "RefreshStart";
  RefreshType3[RefreshType3["Refresh"] = 1] = "Refresh";
  RefreshType3[RefreshType3["LoadTop"] = 2] = "LoadTop";
  RefreshType3[RefreshType3["LoadBottom"] = 3] = "LoadBottom";
  return RefreshType3;
})(RefreshType || {});
var everyRefreshType = /* @__PURE__ */ new Set([
  0 /* RefreshStart */,
  1 /* Refresh */,
  3 /* LoadBottom */,
  2 /* LoadTop */
]);
function registerService(service) {
  services[service.name] = service;
}
function addEndpoint(endpoint) {
  if (endpoints.hasOwnProperty(endpoint.name))
    console.warn(`Endpoint ${endpoint.name} already exists`);
  else
    endpoints[endpoint.name] = endpoint;
}
function getServices() {
  return services;
}
function getEndpoints() {
  return endpoints;
}
function toggleMarkAsRead(idPair) {
  getWritable(idPair).update((a) => {
    a.markedAsRead = !a.markedAsRead;
    return a;
  });
  updateMarkAsReadStorage();
}
function toggleHide(idPair) {
  getWritable(idPair).update((a) => {
    a.hidden = !a.hidden;
    return a;
  });
  updateHiddenStorage();
}
function getWritable(idPair) {
  return services[idPair.service].articles[idPair.id];
}
async function refreshEndpoints(timelineEndpoints, refreshType) {
  const articleIdPairs = [];
  for (const timelineEndpoint of timelineEndpoints) {
    const endpoint = timelineEndpoint.name !== void 0 ? endpoints[timelineEndpoint.name] : timelineEndpoint.endpoint;
    if (timelineEndpoint.refreshTypes.has(refreshType) && endpoint.refreshTypes.has(refreshType)) {
      if (endpoint.isRateLimited()) {
        const secondsLeft = Math.ceil((endpoint.rateLimitInfo.reset * 1e3 - Date.now()) / 1e3);
        console.log(`${timelineEndpoint.name} is rate limited, and resets in ${secondsLeft} seconds.`, endpoint.rateLimitInfo);
      } else
        articleIdPairs.push(...endpointRefreshed(timelineEndpoint, await endpoint.refresh(refreshType)));
    }
  }
  return articleIdPairs;
}
function endpointRefreshed(timelineEndpoint, articles) {
  if (!articles.length)
    return [];
  const service = articles[0].article.constructor.service;
  const endpoint = timelineEndpoint.name !== void 0 ? endpoints[timelineEndpoint.name] : timelineEndpoint.endpoint;
  endpoint.articleIdPairs.push(...articles.filter((a) => !endpoint.articleIdPairs.some((pair) => pair.service === a.article.idPair.service && pair.id === a.article.idPair.id)).map((a) => a.article.idPair));
  addArticles(services[service], false, ...articles);
  const addedArticles = articles.filter((articleWithRefs) => timelineEndpoint.filters.every((f) => !f.enabled || keepArticle(articleWithRefs, f.filter) !== f.inverted));
  return addedArticles.map((a) => a.article.idPair);
}
function fetchArticle(idPair) {
  const service = services[idPair.service];
  const fetchArticle2 = service.fetchArticle;
  if (fetchArticle2 !== void 0)
    fetchArticle2(idPair.id);
}

// src/services/twitter/article.ts
var TwitterArticle = class extends Article {
  constructor(id, text2, textHtml, author, creationTime, markedAsReadStorage, hiddenStorage, actualArticleRef, replyRef, medias, liked, likeCount, retweeted, retweetCount, json) {
    super({
      id,
      url: `https://twitter.com/${author.username}/status/${id}`,
      text: text2,
      textHtml,
      medias,
      markedAsRead: false,
      hidden: false,
      markedAsReadStorage,
      hiddenStorage,
      actualArticleRef,
      replyRef,
      json
    });
    this.id = id;
    this.author = author;
    this.creationTime = creationTime;
    this.liked = liked;
    this.likeCount = likeCount;
    this.retweeted = retweeted;
    this.retweetCount = retweetCount;
  }
  get numberId() {
    return BigInt(this.id);
  }
  getLikeCount() {
    return this.likeCount;
  }
  getLiked() {
    return this.liked;
  }
  getRepostCount() {
    return this.retweetCount;
  }
  getReposted() {
    return this.retweeted;
  }
};
__publicField(TwitterArticle, "service");

// src/services/extension.ts
var EXTENSION_ID_STORAGE_KEY = `${MAIN_STORAGE_KEY} Extension Id`;
var extensionContext = {
  id: localStorage.getItem(EXTENSION_ID_STORAGE_KEY),
  available: false,
  hasAccessToken: false
};
var extensionContextStore = writable(extensionContext);
extensionContextStore.subscribe((value) => {
  extensionContext = value;
});
async function fetchExtension(service, request, url, method = "GET", body) {
  if (extensionContext.id === null)
    throw new Error("No extension id");
  try {
    return await new Promise((resolve, reject) => {
      const timeout = 5e3;
      const timeoutId = setTimeout(() => reject(new Error(`Extension didn't respond in ${timeout} ms.`)), timeout);
      chrome.runtime.sendMessage(extensionContext.id, {
        soshalthing: true,
        service,
        request,
        url,
        method,
        body
      }, (response) => {
        clearTimeout(timeoutId);
        extensionContextStore.update((ctx) => {
          ctx.available = true;
          return ctx;
        });
        resolve({
          json: response.json,
          headers: new Headers(response.headers)
        });
      });
    });
  } catch (cause) {
    throw new Error(`Failed to fetch from extension
${JSON.stringify(cause, null, "	")}`);
  }
}
async function extensionCheck() {
  if (extensionContext.id === null)
    throw new Error("No extension id");
  try {
    return await new Promise((resolve, reject) => {
      const timeout = 3e3;
      const timeoutId = setTimeout(() => reject(new Error(`Extension didn't respond in ${timeout} ms.`)), timeout);
      chrome.runtime.sendMessage(extensionContext.id, {
        soshalthing: true,
        request: "extensionCheck"
      }, (response) => {
        clearTimeout(timeoutId);
        if (!response?.id) {
          extensionContextStore.set({
            id: extensionContext.id,
            available: false,
            hasAccessToken: false
          });
          console.error(response);
          reject(response);
        } else {
          extensionContextStore.set(response);
          localStorage.setItem(EXTENSION_ID_STORAGE_KEY, response.id);
          console.log("Extension available!");
          resolve(response);
        }
      });
    });
  } catch (cause) {
    console.dir(cause);
    extensionContextStore.set({
      id: extensionContext.id,
      available: false,
      hasAccessToken: false
    });
    return extensionContext;
  }
}

// src/services/twitter/apiV1.ts
function getV1APIURL(resource) {
  return `https://api.twitter.com/1.1/${resource}.json`;
}
function articleFromV1(json) {
  const rawText = json.full_text ?? json.text;
  const { text: text2, textHtml } = parseText(rawText, json.entities, json.extended_entities);
  let actualArticleRef;
  let replyRef;
  let actualArticleIndex;
  {
    if (json.retweeted_status !== void 0) {
      const retweet2 = articleFromV1(json.retweeted_status);
      if (retweet2.actualArticleRef?.type === 1 /* Quote */) {
        actualArticleRef = {
          type: 2 /* QuoteRepost */,
          reposted: retweet2.article,
          quoted: retweet2.actualArticleRef.quoted
        };
      } else {
        actualArticleRef = {
          type: 0 /* Repost */,
          reposted: retweet2.article
        };
      }
      actualArticleIndex = 0;
    } else if (json.is_quote_status) {
      if (json.quoted_status) {
        const quote = articleFromV1(json.quoted_status);
        if (quote.actualArticleRef?.type === 1 /* Quote */)
          console.warn(`Quote(${json.id_str}) of a quote(${quote.actualArticleRef.quoted.idPair.id})?`);
        actualArticleRef = {
          type: 1 /* Quote */,
          quoted: quote.article
        };
      } else if (json.quoted_status_id_str) {
        console.warn("Quote tweet doesn't include quoted tweet, need to get the tweet from service", json);
      } else {
        console.error("is_quote_status true, but no quote info", json);
      }
    }
  }
  return {
    article: new TwitterArticle(BigInt(json.id_str), text2, textHtml, {
      id: json.user.id_str,
      name: json.user.name,
      username: json.user.screen_name,
      url: "https://twitter.com/" + json.user.screen_name,
      avatarUrl: json.user.profile_image_url_https
    }, new Date(json.created_at), getMarkedAsReadStorage(TwitterService), getHiddenStorage(TwitterService), actualArticleRef ? articleRefToIdPair(actualArticleRef) : void 0, replyRef?.idPair, parseMedia(json.extended_entities), json.favorited, json.favorite_count, json.retweeted, json.retweet_count, json),
    actualArticleRef,
    replyRef
  };
}
async function toggleFavorite(idPair) {
  const writable2 = getWritable(idPair);
  const action = get_store_value(writable2).liked ? "destroy" : "create";
  try {
    const response = await fetchExtensionV1(`${getV1APIURL("favorites/" + action)}?id=${idPair.id}`, "POST");
    updateAPIResponse(response.json);
  } catch (cause) {
    let shouldThrow = true;
    if (cause.json?.errors !== void 0 && cause.json.errors.some((e) => e.code === 139)) {
      console.warn(cause);
      writable2.update((a) => {
        a.liked = true;
        return a;
      });
      if (cause.json.errors.length === 1)
        shouldThrow = false;
    }
    if (shouldThrow)
      throw new Error(JSON.stringify(cause, null, "	"));
  }
}
async function retweet(idPair) {
  const writable2 = TwitterService.articles[idPair.id];
  if (get_store_value(writable2).retweeted)
    return;
  const response = await fetchExtensionV1(`${getV1APIURL("statuses/retweet")}?id=${idPair.id}`, "POST");
  updateAPIResponse(response.json);
}
async function fetchExtensionV1(url, method = "GET", body) {
  const response = await fetchExtension(TwitterService.name, "fetchV1", url, method, body);
  if (response.json.errors !== void 0)
    return Promise.reject(response.json);
  return response;
}
function updateAPIResponse(response) {
  if (TwitterService.articles[response.id_str] === void 0)
    addArticles(TwitterService, true, articleFromV1(response));
  const writable2 = getWritable({ service: TwitterService.name, id: BigInt(response.id_str) });
  writable2.update((a) => {
    a.liked = response.favorited;
    a.likeCount = response.favorite_count;
    a.retweeted = response.retweeted;
    a.retweetCount = response.retweet_count;
    return a;
  });
  if (response.retweeted_status) {
    if (TwitterService.articles[response.retweeted_status.id_str])
      updateAPIResponse(response.retweeted_status);
    else
      addArticles(TwitterService, false, articleFromV1(response.retweeted_status));
  }
  if (response.quoted_status)
    if (TwitterService.articles[response.quoted_status.id_str])
      updateAPIResponse(response.quoted_status);
    else
      addArticles(TwitterService, false, articleFromV1(response.quoted_status));
}
function parseText(rawText, entities, extendedEntities) {
  let trimmedText = rawText;
  const mediaUrls = extendedEntities?.media.map((media) => media.url) || [];
  for (const url of mediaUrls) {
    trimmedText = trimmedText.replace(url, "");
  }
  let finalText = trimmedText;
  let htmlParts = [];
  for (const { display_url, expanded_url, indices, url } of entities.urls) {
    finalText = finalText.replace(url, display_url);
    htmlParts.push([indices, `<a href='${expanded_url}'>${display_url}</a>`]);
  }
  for (const { indices, text: text2 } of entities.hashtags) {
    htmlParts.push([indices, `<a href='https://twitter.com/hashtag/${text2}'>#${text2}</a>`]);
  }
  for (const { indices, screen_name } of entities.user_mentions) {
    htmlParts.push([indices, `<a href='https://twitter.com/${screen_name}'>@${screen_name}</a>`]);
  }
  finalText = finalText.trim();
  if (htmlParts.length) {
    htmlParts.sort(([[a]], [[b]]) => a - b);
    let i = 0;
    let length = trimmedText.length;
    let newHtmlParts = "";
    let lastIndex = htmlParts.at(-1)[0][1];
    for (const [[first, last], html] of htmlParts) {
      if (i < first)
        newHtmlParts += [...rawText].slice(i, first).join("");
      newHtmlParts += html;
      i = last;
    }
    if (i < length - 1)
      newHtmlParts += [...trimmedText].slice(lastIndex).join("");
    return {
      text: finalText,
      textHtml: newHtmlParts
    };
  } else {
    return {
      text: finalText,
      textHtml: finalText
    };
  }
}
function parseMedia(extendedEntities) {
  return extendedEntities?.media.map((media) => {
    switch (media.type) {
      case "photo":
        return {
          mediaType: 0 /* Image */,
          src: media.media_url_https,
          ratio: getRatio(media.sizes.large.w, media.sizes.large.h),
          queueLoadInfo: 0 /* DirectLoad */
        };
      case "video":
        return getMP4(media.video_info, 1 /* Video */);
      case "animated_gif":
        return getMP4(media.video_info, 2 /* VideoGif */);
    }
  }) || [];
}
function getMP4(videoInfo, mediaType) {
  const variant = videoInfo.variants.find((v) => v.content_type === "video/mp4");
  if (variant === void 0)
    throw Error("Couldn't find video/mp4 variant.");
  return {
    mediaType,
    src: variant.url,
    ratio: getRatio(videoInfo.aspect_ratio[0], videoInfo.aspect_ratio[1]),
    queueLoadInfo: 0 /* DirectLoad */
  };
}
function parseRateLimitInfo(headers) {
  const limit = headers.get("x-rate-limit-limit");
  if (limit === null)
    throw new Error("Missing x-rate-limit-limit header.\n" + JSON.stringify(Object.fromEntries(headers.entries()), null, "	"));
  const remaining = headers.get("x-rate-limit-remaining");
  if (remaining === null)
    throw new Error("Missing x-rate-limit-remaining header.\n" + JSON.stringify(Object.fromEntries(headers.entries()), null, "	"));
  const reset = headers.get("x-rate-limit-reset");
  if (reset === null)
    throw new Error("Missing x-rate-limit-reset header.\n" + JSON.stringify(Object.fromEntries(headers.entries()), null, "	"));
  return {
    limit: parseInt(limit),
    remaining: parseInt(remaining),
    reset: parseInt(reset)
  };
}

// src/services/twitter/service.ts
var TwitterService = {
  name: "Twitter",
  articles: {},
  endpointConstructors: [],
  userEndpoint: void 0,
  articleActions: {
    [STANDARD_ACTIONS.like]: {
      action: toggleFavorite,
      togglable: true
    },
    [STANDARD_ACTIONS.repost]: {
      action: retweet,
      togglable: false
    }
  }
};
TwitterArticle.service = TwitterService.name;
registerService(TwitterService);

// src/services/twitter/endpoints.ts
var V1Endpoint = class extends Endpoint2 {
  constructor() {
    super(/* @__PURE__ */ new Set([
      0 /* RefreshStart */,
      1 /* Refresh */,
      3 /* LoadBottom */
    ]));
  }
  async refresh(refreshType) {
    const url = new URL(getV1APIURL(this.resource));
    this.setSearchParams(url, refreshType);
    try {
      return await this.fetchTweets(url);
    } catch (errorResponse) {
      console.error("Error fetching", errorResponse);
      return [];
    }
  }
  setSearchParams(url, refreshType) {
    url.searchParams.set("include_entities", "true");
    url.searchParams.set("tweet_mode", "extended");
    if (this.articleIdPairs.length && refreshType === 3 /* LoadBottom */)
      url.searchParams.set("max_id", this.articleIdPairs.reduce((acc, curr) => curr.id < acc.id ? curr : acc).id.toString());
    if (this.articleIdPairs.length && refreshType === 2 /* LoadTop */)
      url.searchParams.set("since_id", this.articleIdPairs.reduce((acc, curr) => curr.id > acc.id ? curr : acc).id.toString());
    if (this.articleIdPairs.length)
      url.searchParams.set("count", this.maxCount.toString());
  }
  async fetchTweets(url) {
    const { json, headers } = await fetchExtensionV1(url.toString());
    this.rateLimitInfo = parseRateLimitInfo(headers);
    return json.map(articleFromV1);
  }
};
var _HomeTimelineEndpoint = class extends V1Endpoint {
  name = "Home Timeline";
  resource = "statuses/home_timeline";
  maxCount = 200;
  autoRefreshInterval = 9e4;
  matchParams(params) {
    return true;
  }
};
var HomeTimelineEndpoint = _HomeTimelineEndpoint;
__publicField(HomeTimelineEndpoint, "constructorInfo", {
  name: "HomeTimelineEndpoint",
  paramTemplate: [],
  constructor: () => new _HomeTimelineEndpoint()
});
var _UserTimelineEndpoint = class extends V1Endpoint {
  constructor(username) {
    super();
    this.username = username;
    this.name = `User Timeline ${this.username}`;
  }
  name;
  resource = "statuses/user_timeline";
  maxCount = 200;
  autoRefreshInterval = 6e4;
  setSearchParams(url, refreshType) {
    super.setSearchParams(url, refreshType);
    url.searchParams.set("screen_name", this.username);
  }
  matchParams(params) {
    return params.username === this.username;
  }
};
var UserTimelineEndpoint = _UserTimelineEndpoint;
__publicField(UserTimelineEndpoint, "constructorInfo", {
  name: "UserTimelineEndpoint",
  paramTemplate: [["username", ""]],
  constructor: (params) => new _UserTimelineEndpoint(params.username)
});
var _ListEndpoint = class extends V1Endpoint {
  constructor(username, slug) {
    super();
    this.username = username;
    this.slug = slug;
    this.name = `List Endpoint ${this.username}/${this.slug}`;
  }
  name;
  resource = "lists/statuses";
  maxCount = 200;
  autoRefreshInterval = 6e4;
  setSearchParams(url, refreshType) {
    super.setSearchParams(url, refreshType);
    url.searchParams.set("owner_screen_name", this.username);
    url.searchParams.set("slug", this.slug);
  }
  matchParams(params) {
    return params.username === this.username && params.slug === this.slug;
  }
};
var ListEndpoint = _ListEndpoint;
__publicField(ListEndpoint, "constructorInfo", {
  name: "ListEndpoint",
  paramTemplate: [["username", ""], ["slug", ""]],
  constructor: (params) => new _ListEndpoint(params.username, params.slug)
});
var _LikesEndpoint = class extends V1Endpoint {
  constructor(username) {
    super();
    this.username = username;
    this.name = `Likes ${this.username}`;
  }
  name;
  resource = "favorites/list";
  maxCount = 200;
  autoRefreshInterval = 6e4;
  setSearchParams(url, refreshType) {
    super.setSearchParams(url, refreshType);
    url.searchParams.set("screen_name", this.username);
  }
  matchParams(params) {
    return params.username === this.username;
  }
};
var LikesEndpoint = _LikesEndpoint;
__publicField(LikesEndpoint, "constructorInfo", {
  name: "LikesEndpoint",
  paramTemplate: [["username", ""]],
  constructor: (params) => new _LikesEndpoint(params.username)
});
var _SearchEndpoint = class extends V1Endpoint {
  constructor(query) {
    super();
    this.query = query;
    this.name = `Search ${this.query}`;
  }
  name;
  resource = "search/tweets";
  maxCount = 100;
  autoRefreshInterval = 6e4;
  setSearchParams(url, refreshType) {
    super.setSearchParams(url, refreshType);
    url.searchParams.set("q", this.query);
    url.searchParams.set("result_type", "recent");
    url.searchParams.set("include_entities", "true");
  }
  async fetchTweets(url) {
    const { json, headers } = await fetchExtensionV1(url.toString());
    this.rateLimitInfo = parseRateLimitInfo(headers);
    return json.statuses.map(articleFromV1);
  }
  matchParams(params) {
    return params.query === this.query;
  }
};
var SearchEndpoint = _SearchEndpoint;
__publicField(SearchEndpoint, "constructorInfo", {
  name: "SearchEndpoint",
  paramTemplate: [["query", ""]],
  constructor: (params) => new _SearchEndpoint(params.query)
});
TwitterService.endpointConstructors.push(HomeTimelineEndpoint.constructorInfo, UserTimelineEndpoint.constructorInfo, ListEndpoint.constructorInfo, LikesEndpoint.constructorInfo, SearchEndpoint.constructorInfo);
TwitterService.userEndpoint = (username) => new UserTimelineEndpoint(username);

// src/services/dummy/article.ts
var DummyArticle = class extends Article {
  constructor(id, text2, liked, reposted, markedAsReadStorage, hiddenStorage) {
    super({
      id,
      text: text2,
      url: "https://github.com/misabiko/SoshalThingSvelte",
      medias: [],
      markedAsRead: false,
      hidden: false,
      markedAsReadStorage,
      hiddenStorage
    });
    this.id = id;
    this.liked = liked;
    this.reposted = reposted;
  }
  get numberId() {
    return this.id;
  }
  getLikeCount() {
    return this.liked ? 1 : 0;
  }
  getLiked() {
    return this.liked;
  }
  getRepostCount() {
    return this.reposted ? 1 : 0;
  }
  getReposted() {
    return this.reposted;
  }
};
__publicField(DummyArticle, "service");

// src/services/dummy/service.ts
var DummyService = {
  name: "Dummy",
  articles: {},
  endpointConstructors: [],
  userEndpoint: void 0,
  articleActions: {
    [STANDARD_ACTIONS.like]: {
      action: toggleLike,
      togglable: true
    },
    [STANDARD_ACTIONS.repost]: {
      action: repost,
      togglable: false
    }
  }
};
DummyArticle.service = DummyService.name;
registerService(DummyService);
async function toggleLike(idPair) {
  const writable2 = getWritable(idPair);
  const oldValue = get_store_value(writable2).liked;
  writable2.update((a) => {
    a.liked = !oldValue;
    return a;
  });
}
async function repost(idPair) {
  const writable2 = getWritable(idPair);
  if (get_store_value(writable2).reposted)
    return;
  writable2.update((a) => {
    a.reposted = true;
    return a;
  });
}

// src/services/dummy/endpoints.ts
var _DummyEndpoint = class extends Endpoint2 {
  name = "DummyEndpoint";
  async refresh(refreshType) {
    const markAsReadStorage = getMarkedAsReadStorage(DummyService);
    const hiddenStorage = getHiddenStorage(DummyService);
    return [...Array(10).keys()].map((i) => ({
      article: new DummyArticle(i, "bleh" + i, false, false, markAsReadStorage, hiddenStorage)
    }));
  }
  matchParams(params) {
    return true;
  }
};
var DummyEndpoint = _DummyEndpoint;
__publicField(DummyEndpoint, "constructorInfo", {
  name: "DummyEndpoint",
  paramTemplate: [],
  constructor: () => new _DummyEndpoint()
});
var _DummyEndpointWithParam = class extends Endpoint2 {
  constructor(query) {
    super();
    this.query = query;
    this.name = `Dummy Endpoint ${query}`;
  }
  name;
  async refresh(refreshType) {
    return [];
  }
  matchParams(params) {
    return params.query === this.query;
  }
};
var DummyEndpointWithParam = _DummyEndpointWithParam;
__publicField(DummyEndpointWithParam, "constructorInfo", {
  name: "DummyEndpointWithParam",
  paramTemplate: [["query", ""]],
  constructor: (params) => new _DummyEndpointWithParam(params.query)
});
DummyService.endpointConstructors.push(DummyEndpoint.constructorInfo, DummyEndpointWithParam.constructorInfo);

// node_modules/@fortawesome/free-brands-svg-icons/index.es.js
var faGithub = {
  prefix: "fab",
  iconName: "github",
  icon: [496, 512, [], "f09b", "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"]
};

// src/sidebar/EndpointOptions.svelte
var file26 = "src/sidebar/EndpointOptions.svelte";
function get_if_ctx2(ctx) {
  const child_ctx = ctx.slice();
  const constants_0 = Math.ceil((child_ctx[0].rateLimitInfo.reset * 1e3 - Date.now()) / 6e4);
  child_ctx[2] = constants_0;
  return child_ctx;
}
function create_if_block_112(ctx) {
  let progress;
  let t0_value = `${Math.fround(ctx[0].rateLimitInfo.remaining / ctx[0].rateLimitInfo.limit * 1e3) / 10}%`;
  let t0;
  let progress_value_value;
  let progress_max_value;
  let t1;
  let t2_value = `${ctx[2]} minutes until reset`;
  let t2;
  const block = {
    c: function create4() {
      progress = element("progress");
      t0 = text(t0_value);
      t1 = space();
      t2 = text(t2_value);
      attr_dev(progress, "class", "progress");
      progress.value = progress_value_value = ctx[0].rateLimitInfo.remaining;
      attr_dev(progress, "max", progress_max_value = ctx[0].rateLimitInfo.limit);
      add_location(progress, file26, 11, 2, 360);
    },
    m: function mount(target, anchor) {
      insert_dev(target, progress, anchor);
      append_dev(progress, t0);
      insert_dev(target, t1, anchor);
      insert_dev(target, t2, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && t0_value !== (t0_value = `${Math.fround(ctx2[0].rateLimitInfo.remaining / ctx2[0].rateLimitInfo.limit * 1e3) / 10}%`))
        set_data_dev(t0, t0_value);
      if (dirty & 1 && progress_value_value !== (progress_value_value = ctx2[0].rateLimitInfo.remaining)) {
        prop_dev(progress, "value", progress_value_value);
      }
      if (dirty & 1 && progress_max_value !== (progress_max_value = ctx2[0].rateLimitInfo.limit)) {
        attr_dev(progress, "max", progress_max_value);
      }
      if (dirty & 1 && t2_value !== (t2_value = `${ctx2[2]} minutes until reset`))
        set_data_dev(t2, t2_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(progress);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(t2);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_112.name,
    type: "if",
    source: "(10:1) {#if endpoint.rateLimitInfo !== null}",
    ctx
  });
  return block;
}
function create_else_block7(ctx) {
  let div0;
  let button0;
  let t1;
  let div1;
  let input;
  let t2;
  let div2;
  let button1;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      div0 = element("div");
      button0 = element("button");
      button0.textContent = "Auto refresh";
      t1 = space();
      div1 = element("div");
      input = element("input");
      t2 = space();
      div2 = element("div");
      button1 = element("button");
      button1.textContent = "ms";
      attr_dev(button0, "class", "button");
      add_location(button0, file26, 31, 4, 1061);
      attr_dev(div0, "class", "control");
      add_location(div0, file26, 30, 3, 1035);
      attr_dev(input, "class", "input");
      attr_dev(input, "type", "number");
      add_location(input, file26, 36, 4, 1184);
      attr_dev(div1, "class", "control");
      add_location(div1, file26, 35, 3, 1158);
      attr_dev(button1, "class", "button is-static");
      add_location(button1, file26, 39, 4, 1302);
      attr_dev(div2, "class", "control");
      add_location(div2, file26, 38, 3, 1276);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div0, anchor);
      append_dev(div0, button0);
      insert_dev(target, t1, anchor);
      insert_dev(target, div1, anchor);
      append_dev(div1, input);
      set_input_value(input, ctx[0].autoRefreshInterval);
      insert_dev(target, t2, anchor);
      insert_dev(target, div2, anchor);
      append_dev(div2, button1);
      if (!mounted) {
        dispose = [
          listen_dev(button0, "click", startAutoRefresh, false, false, false),
          listen_dev(input, "input", ctx[1])
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && to_number(input.value) !== ctx2[0].autoRefreshInterval) {
        set_input_value(input, ctx2[0].autoRefreshInterval);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(div1);
      if (detaching)
        detach_dev(t2);
      if (detaching)
        detach_dev(div2);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block7.name,
    type: "else",
    source: "(30:2) {:else}",
    ctx
  });
  return block;
}
function create_if_block17(ctx) {
  let div0;
  let button0;
  let t1;
  let div1;
  let input;
  let input_value_value;
  let t2;
  let div2;
  let button1;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      div0 = element("div");
      button0 = element("button");
      button0.textContent = "Stop refreshing";
      t1 = space();
      div1 = element("div");
      input = element("input");
      t2 = space();
      div2 = element("div");
      button1 = element("button");
      button1.textContent = "ms";
      attr_dev(button0, "class", "button");
      add_location(button0, file26, 19, 4, 721);
      attr_dev(div0, "class", "control");
      add_location(div0, file26, 18, 3, 695);
      attr_dev(input, "class", "input");
      attr_dev(input, "type", "number");
      input.value = input_value_value = ctx[0].autoRefreshInterval;
      input.disabled = true;
      add_location(input, file26, 24, 4, 846);
      attr_dev(div1, "class", "control");
      add_location(div1, file26, 23, 3, 820);
      attr_dev(button1, "class", "button is-static");
      add_location(button1, file26, 27, 4, 967);
      attr_dev(div2, "class", "control");
      add_location(div2, file26, 26, 3, 941);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div0, anchor);
      append_dev(div0, button0);
      insert_dev(target, t1, anchor);
      insert_dev(target, div1, anchor);
      append_dev(div1, input);
      insert_dev(target, t2, anchor);
      insert_dev(target, div2, anchor);
      append_dev(div2, button1);
      if (!mounted) {
        dispose = listen_dev(button0, "click", stopAutoRefresh, false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && input_value_value !== (input_value_value = ctx2[0].autoRefreshInterval) && input.value !== input_value_value) {
        prop_dev(input, "value", input_value_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(div1);
      if (detaching)
        detach_dev(t2);
      if (detaching)
        detach_dev(div2);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block17.name,
    type: "if",
    source: "(18:2) {#if endpoint.isAutoRefreshing}",
    ctx
  });
  return block;
}
function create_fragment27(ctx) {
  let div1;
  let t0_value = ctx[0].name + "";
  let t0;
  let t1;
  let t2;
  let div0;
  let if_block0 = ctx[0].rateLimitInfo !== null && create_if_block_112(get_if_ctx2(ctx));
  function select_block_type(ctx2, dirty) {
    if (ctx2[0].isAutoRefreshing)
      return create_if_block17;
    return create_else_block7;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block1 = current_block_type(ctx);
  const block = {
    c: function create4() {
      div1 = element("div");
      t0 = text(t0_value);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      div0 = element("div");
      if_block1.c();
      attr_dev(div0, "class", "field has-addons");
      add_location(div0, file26, 16, 1, 627);
      attr_dev(div1, "class", "block");
      add_location(div1, file26, 7, 0, 188);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, t0);
      append_dev(div1, t1);
      if (if_block0)
        if_block0.m(div1, null);
      append_dev(div1, t2);
      append_dev(div1, div0);
      if_block1.m(div0, null);
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 1 && t0_value !== (t0_value = ctx2[0].name + ""))
        set_data_dev(t0, t0_value);
      if (ctx2[0].rateLimitInfo !== null) {
        if (if_block0) {
          if_block0.p(get_if_ctx2(ctx2), dirty);
        } else {
          if_block0 = create_if_block_112(get_if_ctx2(ctx2));
          if_block0.c();
          if_block0.m(div1, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div0, null);
        }
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      if (if_block0)
        if_block0.d();
      if_block1.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment27.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function startAutoRefresh() {
}
function stopAutoRefresh() {
}
function instance27($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("EndpointOptions", slots, []);
  let { endpoint } = $$props;
  const writable_props = ["endpoint"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<EndpointOptions> was created with unknown prop '${key}'`);
  });
  function input_input_handler() {
    endpoint.autoRefreshInterval = to_number(this.value);
    $$invalidate(0, endpoint);
  }
  $$self.$$set = ($$props2) => {
    if ("endpoint" in $$props2)
      $$invalidate(0, endpoint = $$props2.endpoint);
  };
  $$self.$capture_state = () => ({
    Endpoint: Endpoint2,
    endpoint,
    startAutoRefresh,
    stopAutoRefresh
  });
  $$self.$inject_state = ($$props2) => {
    if ("endpoint" in $$props2)
      $$invalidate(0, endpoint = $$props2.endpoint);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [endpoint, input_input_handler];
}
var EndpointOptions = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance27, create_fragment27, safe_not_equal, { endpoint: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "EndpointOptions",
      options,
      id: create_fragment27.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("endpoint" in props)) {
      console.warn("<EndpointOptions> was created without expected prop 'endpoint'");
    }
  }
  get endpoint() {
    throw new Error("<EndpointOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set endpoint(value) {
    throw new Error("<EndpointOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var EndpointOptions_default = EndpointOptions;

// src/sidebar/SettingsMenu.svelte
var { Error: Error_13 } = globals;
var file27 = "src/sidebar/SettingsMenu.svelte";
function create_default_slot_4(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Check Extension");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_4.name,
    type: "slot",
    source: "(22:1) <Button on:click={extensionCheck}>",
    ctx
  });
  return block;
}
function create_default_slot_3(ctx) {
  let input;
  let updating_value;
  let t;
  let button;
  let current;
  function input_value_binding(value) {
    ctx[5](value);
  }
  let input_props = {
    type: "text",
    placeholder: "Extension Id"
  };
  if (ctx[2].id !== void 0) {
    input_props.value = ctx[2].id;
  }
  input = new Input_default({ props: input_props, $$inline: true });
  binding_callbacks.push(() => bind(input, "value", input_value_binding));
  button = new Button_default({
    props: {
      $$slots: { default: [create_default_slot_4] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  button.$on("click", extensionCheck);
  const block = {
    c: function create4() {
      create_component(input.$$.fragment);
      t = space();
      create_component(button.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(input, target, anchor);
      insert_dev(target, t, anchor);
      mount_component(button, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const input_changes = {};
      if (!updating_value && dirty & 4) {
        updating_value = true;
        input_changes.value = ctx2[2].id;
        add_flush_callback(() => updating_value = false);
      }
      input.$set(input_changes);
      const button_changes = {};
      if (dirty & 128) {
        button_changes.$$scope = { dirty, ctx: ctx2 };
      }
      button.$set(button_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(input.$$.fragment, local);
      transition_in(button.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(input.$$.fragment, local);
      transition_out(button.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(input, detaching);
      if (detaching)
        detach_dev(t);
      destroy_component(button, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_3.name,
    type: "slot",
    source: "(20:0) <Field label='Extension Id' addons={false}>",
    ctx
  });
  return block;
}
function create_else_block8(ctx) {
  let field;
  let current;
  field = new Field_default({
    props: {
      label: "Twitter",
      addons: false,
      $$slots: { default: [create_default_slot7] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(field.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(field, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const field_changes = {};
      if (dirty & 131) {
        field_changes.$$scope = { dirty, ctx: ctx2 };
      }
      field.$set(field_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(field.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(field.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(field, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block8.name,
    type: "else",
    source: "(28:0) {:else}",
    ctx
  });
  return block;
}
function create_if_block18(ctx) {
  let field;
  let current;
  field = new Field_default({
    props: { label: "Twitter logged in" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(field.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(field, target, anchor);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(field.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(field.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(field, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block18.name,
    type: "if",
    source: "(26:0) {#if $extensionContextStore.hasAccessToken}",
    ctx
  });
  return block;
}
function create_default_slot_2(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Request Token");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_2.name,
    type: "slot",
    source: "(30:2) <Button on:click={twitterRequestToken}>",
    ctx
  });
  return block;
}
function create_if_block_210(ctx) {
  let a;
  let t;
  let a_href_value;
  const block = {
    c: function create4() {
      a = element("a");
      t = text("Authenticate");
      attr_dev(a, "class", "button");
      attr_dev(a, "href", a_href_value = `https://api.twitter.com/oauth/authenticate?oauth_token=${ctx[0]}`);
      attr_dev(a, "target", "_blank");
      add_location(a, file27, 31, 3, 1327);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      append_dev(a, t);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && a_href_value !== (a_href_value = `https://api.twitter.com/oauth/authenticate?oauth_token=${ctx2[0]}`)) {
        attr_dev(a, "href", a_href_value);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_210.name,
    type: "if",
    source: "(31:2) {#if oauthToken}",
    ctx
  });
  return block;
}
function create_if_block_113(ctx) {
  let button;
  let current;
  button = new Button_default({
    props: {
      $$slots: { default: [create_default_slot_12] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  button.$on("click", ctx[4]);
  const block = {
    c: function create4() {
      create_component(button.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(button, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const button_changes = {};
      if (dirty & 128) {
        button_changes.$$scope = { dirty, ctx: ctx2 };
      }
      button.$set(button_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(button.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(button.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(button, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_113.name,
    type: "if",
    source: "(37:2) {#if oobPIN?.length}",
    ctx
  });
  return block;
}
function create_default_slot_12(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Get Access Token");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_12.name,
    type: "slot",
    source: "(38:3) <Button on:click={twitterAccessToken}>",
    ctx
  });
  return block;
}
function create_default_slot7(ctx) {
  let button;
  let t0;
  let t1;
  let input;
  let updating_value;
  let t2;
  let if_block1_anchor;
  let current;
  button = new Button_default({
    props: {
      $$slots: { default: [create_default_slot_2] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  button.$on("click", ctx[3]);
  let if_block0 = ctx[0] && create_if_block_210(ctx);
  function input_value_binding_1(value) {
    ctx[6](value);
  }
  let input_props = { type: "text" };
  if (ctx[1] !== void 0) {
    input_props.value = ctx[1];
  }
  input = new Input_default({ props: input_props, $$inline: true });
  binding_callbacks.push(() => bind(input, "value", input_value_binding_1));
  let if_block1 = ctx[1]?.length && create_if_block_113(ctx);
  const block = {
    c: function create4() {
      create_component(button.$$.fragment);
      t0 = space();
      if (if_block0)
        if_block0.c();
      t1 = space();
      create_component(input.$$.fragment);
      t2 = space();
      if (if_block1)
        if_block1.c();
      if_block1_anchor = empty();
    },
    m: function mount(target, anchor) {
      mount_component(button, target, anchor);
      insert_dev(target, t0, anchor);
      if (if_block0)
        if_block0.m(target, anchor);
      insert_dev(target, t1, anchor);
      mount_component(input, target, anchor);
      insert_dev(target, t2, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert_dev(target, if_block1_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const button_changes = {};
      if (dirty & 128) {
        button_changes.$$scope = { dirty, ctx: ctx2 };
      }
      button.$set(button_changes);
      if (ctx2[0]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_210(ctx2);
          if_block0.c();
          if_block0.m(t1.parentNode, t1);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      const input_changes = {};
      if (!updating_value && dirty & 2) {
        updating_value = true;
        input_changes.value = ctx2[1];
        add_flush_callback(() => updating_value = false);
      }
      input.$set(input_changes);
      if (ctx2[1]?.length) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 2) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_113(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(button.$$.fragment, local);
      transition_in(input.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o: function outro(local) {
      transition_out(button.$$.fragment, local);
      transition_out(input.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(button, detaching);
      if (detaching)
        detach_dev(t0);
      if (if_block0)
        if_block0.d(detaching);
      if (detaching)
        detach_dev(t1);
      destroy_component(input, detaching);
      if (detaching)
        detach_dev(t2);
      if (if_block1)
        if_block1.d(detaching);
      if (detaching)
        detach_dev(if_block1_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot7.name,
    type: "slot",
    source: "(29:1) <Field label='Twitter' addons={false}>",
    ctx
  });
  return block;
}
function create_fragment28(ctx) {
  let field0;
  let t0;
  let field1;
  let t1;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  field0 = new Field_default({
    props: {
      label: "Extension Id",
      addons: false,
      $$slots: { default: [create_default_slot_3] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  field1 = new Field_default({
    props: {
      label: `Available: ${ctx[2].available}`
    },
    $$inline: true
  });
  const if_block_creators = [create_if_block18, create_else_block8];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[2].hasAccessToken)
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const block = {
    c: function create4() {
      create_component(field0.$$.fragment);
      t0 = space();
      create_component(field1.$$.fragment);
      t1 = space();
      if_block.c();
      if_block_anchor = empty();
    },
    l: function claim(nodes) {
      throw new Error_13("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      mount_component(field0, target, anchor);
      insert_dev(target, t0, anchor);
      mount_component(field1, target, anchor);
      insert_dev(target, t1, anchor);
      if_blocks[current_block_type_index].m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      const field0_changes = {};
      if (dirty & 132) {
        field0_changes.$$scope = { dirty, ctx: ctx2 };
      }
      field0.$set(field0_changes);
      const field1_changes = {};
      if (dirty & 4)
        field1_changes.label = `Available: ${ctx2[2].available}`;
      field1.$set(field1_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(field0.$$.fragment, local);
      transition_in(field1.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(field0.$$.fragment, local);
      transition_out(field1.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(field0, detaching);
      if (detaching)
        detach_dev(t0);
      destroy_component(field1, detaching);
      if (detaching)
        detach_dev(t1);
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment28.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance28($$self, $$props, $$invalidate) {
  let $extensionContextStore;
  validate_store(extensionContextStore, "extensionContextStore");
  component_subscribe($$self, extensionContextStore, ($$value) => $$invalidate(2, $extensionContextStore = $$value));
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("SettingsMenu", slots, []);
  let oauthToken;
  let oobPIN;
  async function twitterRequestToken() {
    const response = await fetchExtension(TwitterService.name, "oauth1.0aRequestToken", void 0);
    $$invalidate(0, oauthToken = response.json.oauth_token);
  }
  async function twitterAccessToken() {
    const response = await fetchExtension(TwitterService.name, "oauth1.0aAccessToken", void 0, "GET", { oauthVerifier: oobPIN });
    if (!response?.json.soshalthing)
      throw new Error(JSON.stringify(response, null, "	"));
    $$invalidate(0, oauthToken = void 0);
    await extensionCheck();
  }
  const writable_props = [];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<SettingsMenu> was created with unknown prop '${key}'`);
  });
  function input_value_binding(value) {
    if ($$self.$$.not_equal($extensionContextStore.id, value)) {
      $extensionContextStore.id = value;
      extensionContextStore.set($extensionContextStore);
    }
  }
  function input_value_binding_1(value) {
    oobPIN = value;
    $$invalidate(1, oobPIN);
  }
  $$self.$capture_state = () => ({
    Field: Field_default,
    Input: Input_default,
    Button: Button_default,
    extensionCheck,
    extensionContextStore,
    fetchExtension,
    TwitterService,
    oauthToken,
    oobPIN,
    twitterRequestToken,
    twitterAccessToken,
    $extensionContextStore
  });
  $$self.$inject_state = ($$props2) => {
    if ("oauthToken" in $$props2)
      $$invalidate(0, oauthToken = $$props2.oauthToken);
    if ("oobPIN" in $$props2)
      $$invalidate(1, oobPIN = $$props2.oobPIN);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    oauthToken,
    oobPIN,
    $extensionContextStore,
    twitterRequestToken,
    twitterAccessToken,
    input_value_binding,
    input_value_binding_1
  ];
}
var SettingsMenu = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance28, create_fragment28, safe_not_equal, {});
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "SettingsMenu",
      options,
      id: create_fragment28.name
    });
  }
};
var SettingsMenu_default = SettingsMenu;

// src/sidebar/Sidebar.svelte
var { Object: Object_13 } = globals;
var file28 = "src/sidebar/Sidebar.svelte";
function get_each_context_12(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  return child_ctx;
}
function get_each_context6(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i][0];
  child_ctx[10] = list[i][1];
  return child_ctx;
}
function create_if_block_114(ctx) {
  let div;
  let current_block_type_index;
  let if_block;
  let current;
  const if_block_creators = [create_if_block_211, create_if_block_38, create_if_block_46];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0] === ctx2[1].Endpoints)
      return 0;
    if (ctx2[0] === ctx2[1].MediaLoader)
      return 1;
    if (ctx2[0] === ctx2[1].Settings)
      return 2;
    return -1;
  }
  if (~(current_block_type_index = select_block_type(ctx, -1))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  const block = {
    c: function create4() {
      div = element("div");
      if (if_block)
        if_block.c();
      attr_dev(div, "class", "sidebarMenu svelte-1qznuw2");
      add_location(div, file28, 59, 2, 1585);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(div, null);
      }
      current = true;
    },
    p: function update3(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
        if (if_block) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(div, null);
        } else {
          if_block = null;
        }
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_114.name,
    type: "if",
    source: "(59:1) {#if menu !== null}",
    ctx
  });
  return block;
}
function create_if_block_46(ctx) {
  let settingsmenu;
  let current;
  settingsmenu = new SettingsMenu_default({ $$inline: true });
  const block = {
    c: function create4() {
      create_component(settingsmenu.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(settingsmenu, target, anchor);
      current = true;
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(settingsmenu.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(settingsmenu.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(settingsmenu, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_46.name,
    type: "if",
    source: "(77:43) ",
    ctx
  });
  return block;
}
function create_if_block_38(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let each_value_1 = [...ctx[2]];
  validate_each_argument(each_value_1);
  const get_key = (ctx2) => ctx2[13];
  validate_each_keys(ctx, each_value_1, get_each_context_12, get_key);
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_12(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_12(key, child_ctx));
  }
  let each_1_else_1 = null;
  if (!each_value_1.length) {
    each_1_else_1 = create_else_block_12(ctx);
  }
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (each_1_else_1) {
        each_1_else_1.c();
      }
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, each_1_anchor, anchor);
      if (each_1_else_1) {
        each_1_else_1.m(target, anchor);
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 4) {
        each_value_1 = [...ctx2[2]];
        validate_each_argument(each_value_1);
        validate_each_keys(ctx2, each_value_1, get_each_context_12, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_12, each_1_anchor, get_each_context_12);
        if (!each_value_1.length && each_1_else_1) {
          each_1_else_1.p(ctx2, dirty);
        } else if (!each_value_1.length) {
          each_1_else_1 = create_else_block_12(ctx2);
          each_1_else_1.c();
          each_1_else_1.m(each_1_anchor.parentNode, each_1_anchor);
        } else if (each_1_else_1) {
          each_1_else_1.d(1);
          each_1_else_1 = null;
        }
      }
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach_dev(each_1_anchor);
      if (each_1_else_1)
        each_1_else_1.d(detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_38.name,
    type: "if",
    source: "(69:46) ",
    ctx
  });
  return block;
}
function create_if_block_211(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let current;
  let each_value = Object.entries(getEndpoints());
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[9];
  validate_each_keys(ctx, each_value, get_each_context6, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context6(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block6(key, child_ctx));
  }
  let each_1_else = null;
  if (!each_value.length) {
    each_1_else = create_else_block9(ctx);
  }
  const block = {
    c: function create4() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      if (each_1_else) {
        each_1_else.c();
      }
      attr_dev(div, "class", "box");
      add_location(div, file28, 61, 4, 1655);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      if (each_1_else) {
        each_1_else.m(div, null);
      }
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 0) {
        each_value = Object.entries(getEndpoints());
        validate_each_argument(each_value);
        group_outros();
        validate_each_keys(ctx2, each_value, get_each_context6, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block6, null, get_each_context6);
        check_outros();
        if (each_value.length) {
          if (each_1_else) {
            each_1_else.d(1);
            each_1_else = null;
          }
        } else if (!each_1_else) {
          each_1_else = create_else_block9(ctx2);
          each_1_else.c();
          each_1_else.m(div, null);
        }
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      if (each_1_else)
        each_1_else.d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_211.name,
    type: "if",
    source: "(61:3) {#if menu === SidebarMenu.Endpoints}",
    ctx
  });
  return block;
}
function create_else_block_12(ctx) {
  let div;
  const block = {
    c: function create4() {
      div = element("div");
      div.textContent = "No media currently loading\n					";
      attr_dev(div, "class", "box");
      add_location(div, file28, 72, 5, 1974);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block_12.name,
    type: "else",
    source: "(72:4) {:else}",
    ctx
  });
  return block;
}
function create_each_block_12(key_1, ctx) {
  let t_value = ctx[13] + "";
  let t;
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      t = text(t_value);
      this.first = t;
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && t_value !== (t_value = ctx[13] + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block_12.name,
    type: "each",
    source: "(70:4) {#each [...$loadingStore] as idPair (idPair)}",
    ctx
  });
  return block;
}
function create_else_block9(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("No endpoints currently");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block9.name,
    type: "else",
    source: "(65:5) {:else}",
    ctx
  });
  return block;
}
function create_each_block6(key_1, ctx) {
  let first;
  let endpointoptions;
  let current;
  endpointoptions = new EndpointOptions_default({
    props: { endpoint: ctx[10] },
    $$inline: true
  });
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      create_component(endpointoptions.$$.fragment);
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      mount_component(endpointoptions, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(endpointoptions.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(endpointoptions.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      destroy_component(endpointoptions, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block6.name,
    type: "each",
    source: "(63:5) {#each Object.entries(getEndpoints()) as [name, endpoint] (name)}",
    ctx
  });
  return block;
}
function create_if_block19(ctx) {
  let button;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faAngleDoubleLeft, size: "2x" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      create_component(fa.$$.fragment);
      attr_dev(button, "class", "borderless-button svelte-1qznuw2");
      attr_dev(button, "title", "Expand sidebar");
      add_location(button, file28, 84, 4, 2200);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      mount_component(fa, button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[4], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block19.name,
    type: "if",
    source: "(84:3) {#if menu !== null}",
    ctx
  });
  return block;
}
function create_fragment29(ctx) {
  let nav;
  let t0;
  let div2;
  let div0;
  let t1;
  let button0;
  let fa0;
  let t2;
  let button1;
  let fa1;
  let t3;
  let button2;
  let fa2;
  let t4;
  let div1;
  let button3;
  let fa3;
  let t5;
  let a;
  let button4;
  let fa4;
  let current;
  let mounted;
  let dispose;
  let if_block0 = ctx[0] !== null && create_if_block_114(ctx);
  let if_block1 = ctx[0] !== null && create_if_block19(ctx);
  fa0 = new fa_default({
    props: { icon: faPlus, size: "2x" },
    $$inline: true
  });
  fa1 = new fa_default({
    props: { icon: faBarsProgress, size: "2x" },
    $$inline: true
  });
  fa2 = new fa_default({
    props: { icon: faSpinner, size: "2x" },
    $$inline: true
  });
  fa3 = new fa_default({
    props: { icon: faCog, size: "2x" },
    $$inline: true
  });
  fa4 = new fa_default({
    props: { icon: faGithub, size: "2x" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      nav = element("nav");
      if (if_block0)
        if_block0.c();
      t0 = space();
      div2 = element("div");
      div0 = element("div");
      if (if_block1)
        if_block1.c();
      t1 = space();
      button0 = element("button");
      create_component(fa0.$$.fragment);
      t2 = space();
      button1 = element("button");
      create_component(fa1.$$.fragment);
      t3 = space();
      button2 = element("button");
      create_component(fa2.$$.fragment);
      t4 = space();
      div1 = element("div");
      button3 = element("button");
      create_component(fa3.$$.fragment);
      t5 = space();
      a = element("a");
      button4 = element("button");
      create_component(fa4.$$.fragment);
      attr_dev(button0, "class", "borderless-button svelte-1qznuw2");
      attr_dev(button0, "title", "Add new timeline");
      add_location(button0, file28, 88, 3, 2361);
      attr_dev(button1, "class", "borderless-button svelte-1qznuw2");
      attr_dev(button1, "title", "Endpoints");
      add_location(button1, file28, 91, 3, 2531);
      attr_dev(button2, "class", "borderless-button svelte-1qznuw2");
      attr_dev(button2, "title", "Loading medias");
      add_location(button2, file28, 94, 3, 2700);
      attr_dev(div0, "class", "svelte-1qznuw2");
      add_location(div0, file28, 82, 2, 2167);
      attr_dev(button3, "class", "borderless-button svelte-1qznuw2");
      attr_dev(button3, "title", "Settings");
      add_location(button3, file28, 99, 3, 2888);
      attr_dev(button4, "class", "borderless-button svelte-1qznuw2");
      add_location(button4, file28, 103, 4, 3122);
      attr_dev(a, "href", "https://github.com/misabiko/SoshalThingSvelte");
      attr_dev(a, "title", "Github");
      add_location(a, file28, 102, 3, 3046);
      attr_dev(div1, "class", "svelte-1qznuw2");
      add_location(div1, file28, 98, 2, 2879);
      attr_dev(div2, "id", "sidebarButtons");
      attr_dev(div2, "class", "svelte-1qznuw2");
      add_location(div2, file28, 81, 1, 2139);
      attr_dev(nav, "id", "sidebar");
      attr_dev(nav, "class", "svelte-1qznuw2");
      add_location(nav, file28, 57, 0, 1543);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, nav, anchor);
      if (if_block0)
        if_block0.m(nav, null);
      append_dev(nav, t0);
      append_dev(nav, div2);
      append_dev(div2, div0);
      if (if_block1)
        if_block1.m(div0, null);
      append_dev(div0, t1);
      append_dev(div0, button0);
      mount_component(fa0, button0, null);
      append_dev(div0, t2);
      append_dev(div0, button1);
      mount_component(fa1, button1, null);
      append_dev(div0, t3);
      append_dev(div0, button2);
      mount_component(fa2, button2, null);
      append_dev(div2, t4);
      append_dev(div2, div1);
      append_dev(div1, button3);
      mount_component(fa3, button3, null);
      append_dev(div1, t5);
      append_dev(div1, a);
      append_dev(a, button4);
      mount_component(fa4, button4, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(button0, "click", ctx[5], false, false, false),
          listen_dev(button1, "click", ctx[6], false, false, false),
          listen_dev(button2, "click", ctx[7], false, false, false),
          listen_dev(button3, "click", ctx[8], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[0] !== null) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_114(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(nav, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (ctx2[0] !== null) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block19(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div0, t1);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(fa0.$$.fragment, local);
      transition_in(fa1.$$.fragment, local);
      transition_in(fa2.$$.fragment, local);
      transition_in(fa3.$$.fragment, local);
      transition_in(fa4.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(fa0.$$.fragment, local);
      transition_out(fa1.$$.fragment, local);
      transition_out(fa2.$$.fragment, local);
      transition_out(fa3.$$.fragment, local);
      transition_out(fa4.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(nav);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      destroy_component(fa0);
      destroy_component(fa1);
      destroy_component(fa2);
      destroy_component(fa3);
      destroy_component(fa4);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment29.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance29($$self, $$props, $$invalidate) {
  let $loadingStore;
  validate_store(loadingStore, "loadingStore");
  component_subscribe($$self, loadingStore, ($$value) => $$invalidate(2, $loadingStore = $$value));
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Sidebar", slots, []);
  let menu = null;
  var SidebarMenu;
  (function(SidebarMenu2) {
    SidebarMenu2[SidebarMenu2["Endpoints"] = 0] = "Endpoints";
    SidebarMenu2[SidebarMenu2["NewTimeline"] = 1] = "NewTimeline";
    SidebarMenu2[SidebarMenu2["MediaLoader"] = 2] = "MediaLoader";
    SidebarMenu2[SidebarMenu2["Settings"] = 3] = "Settings";
  })(SidebarMenu || (SidebarMenu = {}));
  function toggleSidebarMenu(newMenu) {
    $$invalidate(0, menu = menu === newMenu ? null : newMenu);
  }
  const writable_props = [];
  Object_13.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Sidebar> was created with unknown prop '${key}'`);
  });
  const click_handler = () => $$invalidate(0, menu = null);
  const click_handler_1 = () => toggleSidebarMenu(SidebarMenu.NewTimeline);
  const click_handler_2 = () => toggleSidebarMenu(SidebarMenu.Endpoints);
  const click_handler_3 = () => toggleSidebarMenu(SidebarMenu.MediaLoader);
  const click_handler_4 = () => toggleSidebarMenu(SidebarMenu.Settings);
  $$self.$capture_state = () => ({
    Fa: fa_default,
    faAngleDoubleLeft,
    faPlus,
    faCog,
    faSpinner,
    faBarsProgress,
    faGithub,
    EndpointOptions: EndpointOptions_default,
    loadingStore,
    SettingsMenu: SettingsMenu_default,
    getEndpoints,
    menu,
    SidebarMenu,
    toggleSidebarMenu,
    $loadingStore
  });
  $$self.$inject_state = ($$props2) => {
    if ("menu" in $$props2)
      $$invalidate(0, menu = $$props2.menu);
    if ("SidebarMenu" in $$props2)
      $$invalidate(1, SidebarMenu = $$props2.SidebarMenu);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    menu,
    SidebarMenu,
    $loadingStore,
    toggleSidebarMenu,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3,
    click_handler_4
  ];
}
var Sidebar = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance29, create_fragment29, safe_not_equal, {});
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Sidebar",
      options,
      id: create_fragment29.name
    });
  }
};
var Sidebar_default = Sidebar;

// src/timelines/TimelineHeader.svelte
var file29 = "src/timelines/TimelineHeader.svelte";
function create_if_block_55(ctx) {
  let div;
  let button0;
  let fa0;
  let t;
  let button1;
  let fa1;
  let current;
  let mounted;
  let dispose;
  fa0 = new fa_default({
    props: { icon: faEyeSlash, size: "large" },
    $$inline: true
  });
  fa1 = new fa_default({
    props: { icon: faEllipsisV, size: "large" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      div = element("div");
      button0 = element("button");
      create_component(fa0.$$.fragment);
      t = space();
      button1 = element("button");
      create_component(fa1.$$.fragment);
      attr_dev(button0, "class", "borderless-button svelte-kovd0x");
      attr_dev(button0, "title", "Toggle SoshalThing");
      add_location(button0, file29, 51, 4, 1285);
      attr_dev(button1, "class", "borderless-button svelte-kovd0x");
      attr_dev(button1, "title", "Show Sidebar");
      add_location(button1, file29, 54, 4, 1459);
      attr_dev(div, "class", "timelineButtons svelte-kovd0x");
      add_location(div, file29, 50, 3, 1251);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      append_dev(div, button0);
      mount_component(fa0, button0, null);
      append_dev(div, t);
      append_dev(div, button1);
      mount_component(fa1, button1, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(button0, "click", ctx[12], false, false, false),
          listen_dev(button1, "click", ctx[13], false, false, false)
        ];
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa0.$$.fragment, local);
      transition_in(fa1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa0.$$.fragment, local);
      transition_out(fa1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      destroy_component(fa0);
      destroy_component(fa1);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_55.name,
    type: "if",
    source: "(50:2) {#if favviewerButtons}",
    ctx
  });
  return block;
}
function create_if_block_47(ctx) {
  let button;
  let fa;
  let button_title_value;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: {
      icon: ctx[6] ? faColumns : faExpandAlt,
      size: "large"
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      create_component(fa.$$.fragment);
      attr_dev(button, "class", "borderless-button svelte-kovd0x");
      attr_dev(button, "title", button_title_value = ctx[6] ? "Disable fullscreen" : "Make timeline fullscreen");
      add_location(button, file29, 62, 3, 1701);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      mount_component(fa, button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", function() {
          if (is_function(ctx[8]))
            ctx[8].apply(this, arguments);
        }, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const fa_changes = {};
      if (dirty & 64)
        fa_changes.icon = ctx[6] ? faColumns : faExpandAlt;
      fa.$set(fa_changes);
      if (!current || dirty & 64 && button_title_value !== (button_title_value = ctx[6] ? "Disable fullscreen" : "Make timeline fullscreen")) {
        attr_dev(button, "title", button_title_value);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_47.name,
    type: "if",
    source: "(62:2) {#if toggleFullscreen}",
    ctx
  });
  return block;
}
function create_if_block_39(ctx) {
  let button;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faScaleBalanced, size: "large" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      create_component(fa.$$.fragment);
      attr_dev(button, "class", "borderless-button svelte-kovd0x");
      attr_dev(button, "title", "Organize Container");
      add_location(button, file29, 71, 3, 1985);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      mount_component(fa, button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[14], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_39.name,
    type: "if",
    source: "(71:2) {#if data.container === MasonryContainer}",
    ctx
  });
  return block;
}
function create_if_block_212(ctx) {
  let button;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faSyncAlt, size: "large" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      create_component(fa.$$.fragment);
      attr_dev(button, "class", "borderless-button svelte-kovd0x");
      attr_dev(button, "title", "Refresh");
      add_location(button, file29, 83, 3, 2504);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      mount_component(fa, button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[15], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_212.name,
    type: "if",
    source: "(83:2) {#if availableRefreshTypes.has(RefreshType.Refresh)}",
    ctx
  });
  return block;
}
function create_if_block_115(ctx) {
  let button;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faArrowDown, size: "large" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      create_component(fa.$$.fragment);
      attr_dev(button, "class", "borderless-button svelte-kovd0x");
      attr_dev(button, "title", "Load Bottom");
      add_location(button, file29, 88, 3, 2723);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      mount_component(fa, button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[16], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_115.name,
    type: "if",
    source: "(88:2) {#if availableRefreshTypes.has(RefreshType.LoadBottom)}",
    ctx
  });
  return block;
}
function create_if_block20(ctx) {
  let button;
  let fa;
  let current;
  let mounted;
  let dispose;
  fa = new fa_default({
    props: { icon: faArrowUp, size: "large" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      button = element("button");
      create_component(fa.$$.fragment);
      attr_dev(button, "class", "borderless-button svelte-kovd0x");
      attr_dev(button, "title", "Load Top");
      add_location(button, file29, 94, 3, 2953);
    },
    m: function mount(target, anchor) {
      insert_dev(target, button, anchor);
      mount_component(fa, button, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[17], false, false, false);
        mounted = true;
      }
    },
    p: noop,
    i: function intro(local) {
      if (current)
        return;
      transition_in(fa.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(fa.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(button);
      destroy_component(fa);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block20.name,
    type: "if",
    source: "(94:2) {#if availableRefreshTypes.has(RefreshType.LoadTop)}",
    ctx
  });
  return block;
}
function create_fragment30(ctx) {
  let div2;
  let div0;
  let strong;
  let t0_value = ctx[4].title + "";
  let t0;
  let t1;
  let t2;
  let div1;
  let t3;
  let t4;
  let button0;
  let fa0;
  let t5;
  let button1;
  let fa1;
  let t6;
  let show_if_2 = ctx[7].has(1 /* Refresh */);
  let t7;
  let show_if_1 = ctx[7].has(3 /* LoadBottom */);
  let t8;
  let show_if = ctx[7].has(2 /* LoadTop */);
  let t9;
  let button2;
  let fa2;
  let current;
  let mounted;
  let dispose;
  let if_block0 = ctx[5] && create_if_block_55(ctx);
  let if_block1 = ctx[8] && create_if_block_47(ctx);
  let if_block2 = ctx[4].container === MasonryContainer_default && create_if_block_39(ctx);
  fa0 = new fa_default({
    props: { icon: faRandom, size: "large" },
    $$inline: true
  });
  fa1 = new fa_default({
    props: { icon: faScroll, size: "large" },
    $$inline: true
  });
  let if_block3 = show_if_2 && create_if_block_212(ctx);
  let if_block4 = show_if_1 && create_if_block_115(ctx);
  let if_block5 = show_if && create_if_block20(ctx);
  fa2 = new fa_default({
    props: { icon: faEllipsisV, size: "large" },
    $$inline: true
  });
  const block = {
    c: function create4() {
      div2 = element("div");
      div0 = element("div");
      strong = element("strong");
      t0 = text(t0_value);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      div1 = element("div");
      if (if_block1)
        if_block1.c();
      t3 = space();
      if (if_block2)
        if_block2.c();
      t4 = space();
      button0 = element("button");
      create_component(fa0.$$.fragment);
      t5 = space();
      button1 = element("button");
      create_component(fa1.$$.fragment);
      t6 = space();
      if (if_block3)
        if_block3.c();
      t7 = space();
      if (if_block4)
        if_block4.c();
      t8 = space();
      if (if_block5)
        if_block5.c();
      t9 = space();
      button2 = element("button");
      create_component(fa2.$$.fragment);
      attr_dev(strong, "class", "svelte-kovd0x");
      add_location(strong, file29, 48, 2, 1193);
      attr_dev(div0, "class", "timelineLeftHeader svelte-kovd0x");
      add_location(div0, file29, 47, 1, 1158);
      attr_dev(button0, "class", "borderless-button svelte-kovd0x");
      attr_dev(button0, "title", "Shuffle");
      add_location(button0, file29, 76, 2, 2179);
      attr_dev(button1, "class", "borderless-button timelineAutoscroll svelte-kovd0x");
      attr_dev(button1, "title", "Autoscroll");
      add_location(button1, file29, 79, 2, 2301);
      attr_dev(button2, "class", "borderless-button svelte-kovd0x");
      attr_dev(button2, "title", "Expand options");
      add_location(button2, file29, 99, 2, 3119);
      attr_dev(div1, "class", "timelineButtons svelte-kovd0x");
      add_location(div1, file29, 60, 1, 1643);
      attr_dev(div2, "class", "timelineHeader svelte-kovd0x");
      add_location(div2, file29, 46, 0, 1128);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div2, anchor);
      append_dev(div2, div0);
      append_dev(div0, strong);
      append_dev(strong, t0);
      append_dev(div0, t1);
      if (if_block0)
        if_block0.m(div0, null);
      append_dev(div2, t2);
      append_dev(div2, div1);
      if (if_block1)
        if_block1.m(div1, null);
      append_dev(div1, t3);
      if (if_block2)
        if_block2.m(div1, null);
      append_dev(div1, t4);
      append_dev(div1, button0);
      mount_component(fa0, button0, null);
      append_dev(div1, t5);
      append_dev(div1, button1);
      mount_component(fa1, button1, null);
      append_dev(div1, t6);
      if (if_block3)
        if_block3.m(div1, null);
      append_dev(div1, t7);
      if (if_block4)
        if_block4.m(div1, null);
      append_dev(div1, t8);
      if (if_block5)
        if_block5.m(div1, null);
      append_dev(div1, t9);
      append_dev(div1, button2);
      mount_component(fa2, button2, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen_dev(button0, "click", function() {
            if (is_function(ctx[9]))
              ctx[9].apply(this, arguments);
          }, false, false, false),
          listen_dev(button1, "click", function() {
            if (is_function(ctx[10]))
              ctx[10].apply(this, arguments);
          }, false, false, false),
          listen_dev(button2, "click", ctx[18], false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, [dirty]) {
      ctx = new_ctx;
      if ((!current || dirty & 16) && t0_value !== (t0_value = ctx[4].title + ""))
        set_data_dev(t0, t0_value);
      if (ctx[5]) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
          if (dirty & 32) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_55(ctx);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (ctx[8]) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
          if (dirty & 256) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_47(ctx);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, t3);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (ctx[4].container === MasonryContainer_default) {
        if (if_block2) {
          if_block2.p(ctx, dirty);
          if (dirty & 16) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_39(ctx);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div1, t4);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (dirty & 128)
        show_if_2 = ctx[7].has(1 /* Refresh */);
      if (show_if_2) {
        if (if_block3) {
          if_block3.p(ctx, dirty);
          if (dirty & 128) {
            transition_in(if_block3, 1);
          }
        } else {
          if_block3 = create_if_block_212(ctx);
          if_block3.c();
          transition_in(if_block3, 1);
          if_block3.m(div1, t7);
        }
      } else if (if_block3) {
        group_outros();
        transition_out(if_block3, 1, 1, () => {
          if_block3 = null;
        });
        check_outros();
      }
      if (dirty & 128)
        show_if_1 = ctx[7].has(3 /* LoadBottom */);
      if (show_if_1) {
        if (if_block4) {
          if_block4.p(ctx, dirty);
          if (dirty & 128) {
            transition_in(if_block4, 1);
          }
        } else {
          if_block4 = create_if_block_115(ctx);
          if_block4.c();
          transition_in(if_block4, 1);
          if_block4.m(div1, t8);
        }
      } else if (if_block4) {
        group_outros();
        transition_out(if_block4, 1, 1, () => {
          if_block4 = null;
        });
        check_outros();
      }
      if (dirty & 128)
        show_if = ctx[7].has(2 /* LoadTop */);
      if (show_if) {
        if (if_block5) {
          if_block5.p(ctx, dirty);
          if (dirty & 128) {
            transition_in(if_block5, 1);
          }
        } else {
          if_block5 = create_if_block20(ctx);
          if_block5.c();
          transition_in(if_block5, 1);
          if_block5.m(div1, t9);
        }
      } else if (if_block5) {
        group_outros();
        transition_out(if_block5, 1, 1, () => {
          if_block5 = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      transition_in(fa0.$$.fragment, local);
      transition_in(fa1.$$.fragment, local);
      transition_in(if_block3);
      transition_in(if_block4);
      transition_in(if_block5);
      transition_in(fa2.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      transition_out(fa0.$$.fragment, local);
      transition_out(fa1.$$.fragment, local);
      transition_out(if_block3);
      transition_out(if_block4);
      transition_out(if_block5);
      transition_out(fa2.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div2);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      destroy_component(fa0);
      destroy_component(fa1);
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
      if (if_block5)
        if_block5.d();
      destroy_component(fa2);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment30.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance30($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("TimelineHeader", slots, []);
  let { data } = $$props;
  let { favviewerButtons } = $$props;
  let { favviewerHidden } = $$props;
  let { fullscreen: fullscreen2 } = $$props;
  let { availableRefreshTypes } = $$props;
  let { containerRebalance } = $$props;
  let { showSidebar } = $$props;
  let { showOptions } = $$props;
  let { toggleFullscreen = void 0 } = $$props;
  let { shuffle } = $$props;
  let { autoscroll } = $$props;
  let { refresh } = $$props;
  const writable_props = [
    "data",
    "favviewerButtons",
    "favviewerHidden",
    "fullscreen",
    "availableRefreshTypes",
    "containerRebalance",
    "showSidebar",
    "showOptions",
    "toggleFullscreen",
    "shuffle",
    "autoscroll",
    "refresh"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<TimelineHeader> was created with unknown prop '${key}'`);
  });
  const click_handler = () => $$invalidate(0, favviewerHidden = !favviewerHidden);
  const click_handler_1 = () => $$invalidate(2, showSidebar = !showSidebar);
  const click_handler_2 = () => $$invalidate(1, containerRebalance = !containerRebalance);
  const click_handler_3 = () => refresh(1 /* Refresh */);
  const click_handler_4 = () => refresh(3 /* LoadBottom */);
  const click_handler_5 = () => refresh(2 /* LoadTop */);
  const click_handler_6 = () => $$invalidate(3, showOptions = !showOptions);
  $$self.$$set = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(4, data = $$props2.data);
    if ("favviewerButtons" in $$props2)
      $$invalidate(5, favviewerButtons = $$props2.favviewerButtons);
    if ("favviewerHidden" in $$props2)
      $$invalidate(0, favviewerHidden = $$props2.favviewerHidden);
    if ("fullscreen" in $$props2)
      $$invalidate(6, fullscreen2 = $$props2.fullscreen);
    if ("availableRefreshTypes" in $$props2)
      $$invalidate(7, availableRefreshTypes = $$props2.availableRefreshTypes);
    if ("containerRebalance" in $$props2)
      $$invalidate(1, containerRebalance = $$props2.containerRebalance);
    if ("showSidebar" in $$props2)
      $$invalidate(2, showSidebar = $$props2.showSidebar);
    if ("showOptions" in $$props2)
      $$invalidate(3, showOptions = $$props2.showOptions);
    if ("toggleFullscreen" in $$props2)
      $$invalidate(8, toggleFullscreen = $$props2.toggleFullscreen);
    if ("shuffle" in $$props2)
      $$invalidate(9, shuffle = $$props2.shuffle);
    if ("autoscroll" in $$props2)
      $$invalidate(10, autoscroll = $$props2.autoscroll);
    if ("refresh" in $$props2)
      $$invalidate(11, refresh = $$props2.refresh);
  };
  $$self.$capture_state = () => ({
    RefreshType,
    Fa: fa_default,
    faArrowDown,
    faArrowUp,
    faColumns,
    faEllipsisV,
    faExpandAlt,
    faEyeSlash,
    faRandom,
    faScaleBalanced,
    faScroll,
    faSyncAlt,
    MasonryContainer: MasonryContainer_default,
    data,
    favviewerButtons,
    favviewerHidden,
    fullscreen: fullscreen2,
    availableRefreshTypes,
    containerRebalance,
    showSidebar,
    showOptions,
    toggleFullscreen,
    shuffle,
    autoscroll,
    refresh
  });
  $$self.$inject_state = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(4, data = $$props2.data);
    if ("favviewerButtons" in $$props2)
      $$invalidate(5, favviewerButtons = $$props2.favviewerButtons);
    if ("favviewerHidden" in $$props2)
      $$invalidate(0, favviewerHidden = $$props2.favviewerHidden);
    if ("fullscreen" in $$props2)
      $$invalidate(6, fullscreen2 = $$props2.fullscreen);
    if ("availableRefreshTypes" in $$props2)
      $$invalidate(7, availableRefreshTypes = $$props2.availableRefreshTypes);
    if ("containerRebalance" in $$props2)
      $$invalidate(1, containerRebalance = $$props2.containerRebalance);
    if ("showSidebar" in $$props2)
      $$invalidate(2, showSidebar = $$props2.showSidebar);
    if ("showOptions" in $$props2)
      $$invalidate(3, showOptions = $$props2.showOptions);
    if ("toggleFullscreen" in $$props2)
      $$invalidate(8, toggleFullscreen = $$props2.toggleFullscreen);
    if ("shuffle" in $$props2)
      $$invalidate(9, shuffle = $$props2.shuffle);
    if ("autoscroll" in $$props2)
      $$invalidate(10, autoscroll = $$props2.autoscroll);
    if ("refresh" in $$props2)
      $$invalidate(11, refresh = $$props2.refresh);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    favviewerHidden,
    containerRebalance,
    showSidebar,
    showOptions,
    data,
    favviewerButtons,
    fullscreen2,
    availableRefreshTypes,
    toggleFullscreen,
    shuffle,
    autoscroll,
    refresh,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3,
    click_handler_4,
    click_handler_5,
    click_handler_6
  ];
}
var TimelineHeader = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance30, create_fragment30, safe_not_equal, {
      data: 4,
      favviewerButtons: 5,
      favviewerHidden: 0,
      fullscreen: 6,
      availableRefreshTypes: 7,
      containerRebalance: 1,
      showSidebar: 2,
      showOptions: 3,
      toggleFullscreen: 8,
      shuffle: 9,
      autoscroll: 10,
      refresh: 11
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "TimelineHeader",
      options,
      id: create_fragment30.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[4] === void 0 && !("data" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'data'");
    }
    if (ctx[5] === void 0 && !("favviewerButtons" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'favviewerButtons'");
    }
    if (ctx[0] === void 0 && !("favviewerHidden" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'favviewerHidden'");
    }
    if (ctx[6] === void 0 && !("fullscreen" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'fullscreen'");
    }
    if (ctx[7] === void 0 && !("availableRefreshTypes" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'availableRefreshTypes'");
    }
    if (ctx[1] === void 0 && !("containerRebalance" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'containerRebalance'");
    }
    if (ctx[2] === void 0 && !("showSidebar" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'showSidebar'");
    }
    if (ctx[3] === void 0 && !("showOptions" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'showOptions'");
    }
    if (ctx[9] === void 0 && !("shuffle" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'shuffle'");
    }
    if (ctx[10] === void 0 && !("autoscroll" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'autoscroll'");
    }
    if (ctx[11] === void 0 && !("refresh" in props)) {
      console.warn("<TimelineHeader> was created without expected prop 'refresh'");
    }
  }
  get data() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set data(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get favviewerButtons() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set favviewerButtons(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get favviewerHidden() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set favviewerHidden(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get fullscreen() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set fullscreen(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get availableRefreshTypes() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set availableRefreshTypes(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get containerRebalance() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set containerRebalance(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get showSidebar() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set showSidebar(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get showOptions() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set showOptions(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get toggleFullscreen() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set toggleFullscreen(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get shuffle() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set shuffle(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get autoscroll() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set autoscroll(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get refresh() {
    throw new Error("<TimelineHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set refresh(value) {
    throw new Error("<TimelineHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var TimelineHeader_default = TimelineHeader;

// src/filters/FiltersOptions.svelte
var file30 = "src/filters/FiltersOptions.svelte";
function get_each_context7(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
function get_each_context_13(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[14] = list;
  child_ctx[15] = i;
  return child_ctx;
}
function create_each_block_2(key_1, ctx) {
  let div5;
  let div0;
  let label;
  let t0_value = getFilterName(ctx[13].filter.type, ctx[13].inverted) + "";
  let t0;
  let t1;
  let div4;
  let div1;
  let button0;
  let t2_value = ctx[13].enabled ? "Enabled" : "Disabled";
  let t2;
  let t3;
  let div2;
  let button1;
  let t4_value = ctx[13].inverted ? "Inverted" : "Normal";
  let t4;
  let t5;
  let div3;
  let button2;
  let t7;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[3](ctx[13], ctx[14], ctx[15]);
  }
  function click_handler_1() {
    return ctx[4](ctx[13], ctx[14], ctx[15]);
  }
  function click_handler_2() {
    return ctx[5](ctx[15]);
  }
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      div5 = element("div");
      div0 = element("div");
      label = element("label");
      t0 = text(t0_value);
      t1 = space();
      div4 = element("div");
      div1 = element("div");
      button0 = element("button");
      t2 = text(t2_value);
      t3 = space();
      div2 = element("div");
      button1 = element("button");
      t4 = text(t4_value);
      t5 = space();
      div3 = element("div");
      button2 = element("button");
      button2.textContent = "Remove";
      t7 = space();
      attr_dev(label, "class", "label");
      add_location(label, file30, 22, 3, 679);
      attr_dev(div0, "class", "field-label is-normal");
      add_location(div0, file30, 20, 2, 580);
      attr_dev(button0, "class", "button");
      toggle_class(button0, "is-success", ctx[13].enabled);
      add_location(button0, file30, 26, 4, 832);
      attr_dev(div1, "class", "control");
      add_location(div1, file30, 25, 3, 806);
      attr_dev(button1, "class", "button");
      toggle_class(button1, "is-info", ctx[13].inverted);
      add_location(button1, file30, 31, 4, 1048);
      attr_dev(div2, "class", "control");
      add_location(div2, file30, 30, 3, 1022);
      attr_dev(button2, "class", "button");
      add_location(button2, file30, 36, 4, 1264);
      attr_dev(div3, "class", "control");
      add_location(div3, file30, 35, 3, 1238);
      attr_dev(div4, "class", "field-body");
      add_location(div4, file30, 24, 2, 778);
      attr_dev(div5, "class", "field has-addons");
      add_location(div5, file30, 19, 1, 547);
      this.first = div5;
    },
    m: function mount(target, anchor) {
      insert_dev(target, div5, anchor);
      append_dev(div5, div0);
      append_dev(div0, label);
      append_dev(label, t0);
      append_dev(div5, t1);
      append_dev(div5, div4);
      append_dev(div4, div1);
      append_dev(div1, button0);
      append_dev(button0, t2);
      append_dev(div4, t3);
      append_dev(div4, div2);
      append_dev(div2, button1);
      append_dev(button1, t4);
      append_dev(div4, t5);
      append_dev(div4, div3);
      append_dev(div3, button2);
      insert_dev(target, t7, anchor);
      if (!mounted) {
        dispose = [
          listen_dev(button0, "click", click_handler, false, false, false),
          listen_dev(button1, "click", click_handler_1, false, false, false),
          listen_dev(button2, "click", click_handler_2, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && t0_value !== (t0_value = getFilterName(ctx[13].filter.type, ctx[13].inverted) + ""))
        set_data_dev(t0, t0_value);
      if (dirty & 1 && t2_value !== (t2_value = ctx[13].enabled ? "Enabled" : "Disabled"))
        set_data_dev(t2, t2_value);
      if (dirty & 1) {
        toggle_class(button0, "is-success", ctx[13].enabled);
      }
      if (dirty & 1 && t4_value !== (t4_value = ctx[13].inverted ? "Inverted" : "Normal"))
        set_data_dev(t4, t4_value);
      if (dirty & 1) {
        toggle_class(button1, "is-info", ctx[13].inverted);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div5);
      if (detaching)
        detach_dev(t7);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block_2.name,
    type: "each",
    source: "(19:0) {#each instances as instance, index (`${JSON.stringify(instance)}",
    ctx
  });
  return block;
}
function create_each_block_13(ctx) {
  let a;
  let t0_value = getFilterName(ctx[8], false) + "";
  let t0;
  let t1;
  let mounted;
  let dispose;
  function click_handler_3() {
    return ctx[6](ctx[8]);
  }
  const block = {
    c: function create4() {
      a = element("a");
      t0 = text(t0_value);
      t1 = space();
      attr_dev(a, "class", "dropdown-item");
      add_location(a, file30, 50, 2, 1587);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      append_dev(a, t0);
      append_dev(a, t1);
      if (!mounted) {
        dispose = listen_dev(a, "click", click_handler_3, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block_13.name,
    type: "each",
    source: "(49:1) {#each filterTypes as filterType}",
    ctx
  });
  return block;
}
function create_default_slot_13(ctx) {
  let each_1_anchor;
  let each_value_1 = filterTypes;
  validate_each_argument(each_value_1);
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_1, i));
  }
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, each_1_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 2) {
        each_value_1 = filterTypes;
        validate_each_argument(each_value_1);
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_13(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_13(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d: function destroy(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach_dev(each_1_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_13.name,
    type: "slot",
    source: "(48:0) <Dropdown labelText='New Filter'>",
    ctx
  });
  return block;
}
function create_each_block7(ctx) {
  let a;
  let t0_value = getFilterName(ctx[8], true) + "";
  let t0;
  let t1;
  let mounted;
  let dispose;
  function click_handler_4() {
    return ctx[7](ctx[8]);
  }
  const block = {
    c: function create4() {
      a = element("a");
      t0 = text(t0_value);
      t1 = space();
      attr_dev(a, "class", "dropdown-item");
      add_location(a, file30, 58, 2, 1855);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      append_dev(a, t0);
      append_dev(a, t1);
      if (!mounted) {
        dispose = listen_dev(a, "click", click_handler_4, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block7.name,
    type: "each",
    source: "(57:1) {#each filterTypes as filterType}",
    ctx
  });
  return block;
}
function create_default_slot8(ctx) {
  let each_1_anchor;
  let each_value = filterTypes;
  validate_each_argument(each_value);
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block7(get_each_context7(ctx, each_value, i));
  }
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, each_1_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 2) {
        each_value = filterTypes;
        validate_each_argument(each_value);
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context7(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block7(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    d: function destroy(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach_dev(each_1_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot8.name,
    type: "slot",
    source: "(56:0) <Dropdown labelText='New Inverted Filter'>",
    ctx
  });
  return block;
}
function create_fragment31(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let dropdown0;
  let t1;
  let dropdown1;
  let current;
  let each_value_2 = ctx[0];
  validate_each_argument(each_value_2);
  const get_key = (ctx2) => `${JSON.stringify(ctx2[13])}/${ctx2[15]}`;
  validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
  for (let i = 0; i < each_value_2.length; i += 1) {
    let child_ctx = get_each_context_2(ctx, each_value_2, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
  }
  dropdown0 = new Dropdown_default({
    props: {
      labelText: "New Filter",
      $$slots: { default: [create_default_slot_13] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  dropdown1 = new Dropdown_default({
    props: {
      labelText: "New Inverted Filter",
      $$slots: { default: [create_default_slot8] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      create_component(dropdown0.$$.fragment);
      t1 = space();
      create_component(dropdown1.$$.fragment);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, t0, anchor);
      mount_component(dropdown0, target, anchor);
      insert_dev(target, t1, anchor);
      mount_component(dropdown1, target, anchor);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 5) {
        each_value_2 = ctx2[0];
        validate_each_argument(each_value_2);
        validate_each_keys(ctx2, each_value_2, get_each_context_2, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_2, each_1_lookup, t0.parentNode, destroy_block, create_each_block_2, t0, get_each_context_2);
      }
      const dropdown0_changes = {};
      if (dirty & 65536) {
        dropdown0_changes.$$scope = { dirty, ctx: ctx2 };
      }
      dropdown0.$set(dropdown0_changes);
      const dropdown1_changes = {};
      if (dirty & 65536) {
        dropdown1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      dropdown1.$set(dropdown1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(dropdown0.$$.fragment, local);
      transition_in(dropdown1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(dropdown0.$$.fragment, local);
      transition_out(dropdown1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach_dev(t0);
      destroy_component(dropdown0, detaching);
      if (detaching)
        detach_dev(t1);
      destroy_component(dropdown1, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment31.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance31($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("FiltersOptions", slots, []);
  let { instances } = $$props;
  function addFilter(filterType, inverted) {
    instances.push({
      filter: defaultFilter(filterType),
      enabled: true,
      inverted
    });
    $$invalidate(0, instances);
  }
  function removeFilter(index) {
    instances.splice(index, 1);
    $$invalidate(0, instances);
  }
  const writable_props = ["instances"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<FiltersOptions> was created with unknown prop '${key}'`);
  });
  const click_handler = (instance38, each_value_2, index) => $$invalidate(0, each_value_2[index].enabled = !instance38.enabled, instances);
  const click_handler_1 = (instance38, each_value_2, index) => $$invalidate(0, each_value_2[index].inverted = !instance38.inverted, instances);
  const click_handler_2 = (index) => removeFilter(index);
  const click_handler_3 = (filterType) => addFilter(filterType, false);
  const click_handler_4 = (filterType) => addFilter(filterType, true);
  $$self.$$set = ($$props2) => {
    if ("instances" in $$props2)
      $$invalidate(0, instances = $$props2.instances);
  };
  $$self.$capture_state = () => ({
    Dropdown: Dropdown_default,
    filterTypes,
    getFilterName,
    defaultFilter,
    instances,
    addFilter,
    removeFilter
  });
  $$self.$inject_state = ($$props2) => {
    if ("instances" in $$props2)
      $$invalidate(0, instances = $$props2.instances);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    instances,
    addFilter,
    removeFilter,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3,
    click_handler_4
  ];
}
var FiltersOptions = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance31, create_fragment31, safe_not_equal, { instances: 0 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "FiltersOptions",
      options,
      id: create_fragment31.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("instances" in props)) {
      console.warn("<FiltersOptions> was created without expected prop 'instances'");
    }
  }
  get instances() {
    throw new Error("<FiltersOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set instances(value) {
    throw new Error("<FiltersOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var FiltersOptions_default = FiltersOptions;

// src/sorting/SortOptions.svelte
var file31 = "src/sorting/SortOptions.svelte";
function get_each_context8(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
function get_each_context_14(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
function create_each_block_14(ctx) {
  let a;
  let t0_value = `${methodName(ctx[8])} - ${directionLabel(ctx[8], ctx[0].reversed || false)}`;
  let t0;
  let t1;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[3](ctx[8]);
  }
  const block = {
    c: function create4() {
      a = element("a");
      t0 = text(t0_value);
      t1 = space();
      attr_dev(a, "class", "dropdown-item");
      add_location(a, file31, 21, 5, 723);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a, anchor);
      append_dev(a, t0);
      append_dev(a, t1);
      if (!mounted) {
        dispose = listen_dev(a, "click", click_handler, false, false, false);
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && t0_value !== (t0_value = `${methodName(ctx[8])} - ${directionLabel(ctx[8], ctx[0].reversed || false)}`))
        set_data_dev(t0, t0_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block_14.name,
    type: "each",
    source: "(20:4) {#each allSortMethods as method}",
    ctx
  });
  return block;
}
function create_default_slot_14(ctx) {
  let t0;
  let a;
  let mounted;
  let dispose;
  let each_value_1 = allSortMethods;
  validate_each_argument(each_value_1);
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_14(get_each_context_14(ctx, each_value_1, i));
  }
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      a = element("a");
      a.textContent = "Unsorted";
      attr_dev(a, "class", "dropdown-item");
      add_location(a, file31, 26, 4, 957);
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, t0, anchor);
      insert_dev(target, a, anchor);
      if (!mounted) {
        dispose = listen_dev(a, "click", ctx[4], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1) {
        each_value_1 = allSortMethods;
        validate_each_argument(each_value_1);
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_14(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_14(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(t0.parentNode, t0);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d: function destroy(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach_dev(t0);
      if (detaching)
        detach_dev(a);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_14.name,
    type: "slot",
    source: "(19:3) <Dropdown labelText={currentMethodName}>",
    ctx
  });
  return block;
}
function create_else_block10(ctx) {
  let t_value = ctx[0].reversed ? "Reversed" : "Normal";
  let t;
  const block = {
    c: function create4() {
      t = text(t_value);
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && t_value !== (t_value = ctx2[0].reversed ? "Reversed" : "Normal"))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block10.name,
    type: "else",
    source: "(36:4) {:else}",
    ctx
  });
  return block;
}
function create_if_block_116(ctx) {
  let t_value = directionLabel(ctx[0].method, ctx[0].reversed) + "";
  let t;
  const block = {
    c: function create4() {
      t = text(t_value);
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && t_value !== (t_value = directionLabel(ctx2[0].method, ctx2[0].reversed) + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_116.name,
    type: "if",
    source: "(34:4) {#if sortInfo.method !== undefined}",
    ctx
  });
  return block;
}
function create_if_block21(ctx) {
  let div;
  let dropdown;
  let current;
  dropdown = new Dropdown_default({
    props: {
      labelText: "Sort once",
      $$slots: { default: [create_default_slot9] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      div = element("div");
      create_component(dropdown.$$.fragment);
      attr_dev(div, "class", "control");
      add_location(div, file31, 41, 3, 1414);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      mount_component(dropdown, div, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const dropdown_changes = {};
      if (dirty & 8194) {
        dropdown_changes.$$scope = { dirty, ctx: ctx2 };
      }
      dropdown.$set(dropdown_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(dropdown.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(dropdown.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      destroy_component(dropdown);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block21.name,
    type: "if",
    source: "(41:2) {#if sortInfo.method === undefined}",
    ctx
  });
  return block;
}
function create_each_block8(ctx) {
  let a0;
  let t0_value = `${methodName(ctx[8])} - ${directionLabel(ctx[8], false)}`;
  let t0;
  let t1;
  let a1;
  let t2_value = `${methodName(ctx[8])} - ${directionLabel(ctx[8], true)}`;
  let t2;
  let t3;
  let mounted;
  let dispose;
  function click_handler_3() {
    return ctx[6](ctx[8]);
  }
  function click_handler_4() {
    return ctx[7](ctx[8]);
  }
  const block = {
    c: function create4() {
      a0 = element("a");
      t0 = text(t0_value);
      t1 = space();
      a1 = element("a");
      t2 = text(t2_value);
      t3 = space();
      attr_dev(a0, "class", "dropdown-item");
      add_location(a0, file31, 45, 6, 1569);
      attr_dev(a1, "class", "dropdown-item");
      add_location(a1, file31, 49, 6, 1775);
    },
    m: function mount(target, anchor) {
      insert_dev(target, a0, anchor);
      append_dev(a0, t0);
      insert_dev(target, t1, anchor);
      insert_dev(target, a1, anchor);
      append_dev(a1, t2);
      append_dev(a1, t3);
      if (!mounted) {
        dispose = [
          listen_dev(a0, "click", click_handler_3, false, false, false),
          listen_dev(a1, "click", click_handler_4, false, false, false)
        ];
        mounted = true;
      }
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(a0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(a1);
      mounted = false;
      run_all(dispose);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block8.name,
    type: "each",
    source: "(44:5) {#each allSortMethods as method}",
    ctx
  });
  return block;
}
function create_default_slot9(ctx) {
  let each_1_anchor;
  let each_value = allSortMethods;
  validate_each_argument(each_value);
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block8(get_each_context8(ctx, each_value, i));
  }
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, each_1_anchor, anchor);
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 2) {
        each_value = allSortMethods;
        validate_each_argument(each_value);
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context8(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block8(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    d: function destroy(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach_dev(each_1_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot9.name,
    type: "slot",
    source: "(43:4) <Dropdown labelText='Sort once'>",
    ctx
  });
  return block;
}
function create_fragment32(ctx) {
  let div4;
  let div0;
  let label;
  let t1;
  let div3;
  let div1;
  let dropdown;
  let t2;
  let div2;
  let button;
  let t3;
  let current;
  let mounted;
  let dispose;
  dropdown = new Dropdown_default({
    props: {
      labelText: ctx[2],
      $$slots: { default: [create_default_slot_14] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  function select_block_type(ctx2, dirty) {
    if (ctx2[0].method !== void 0)
      return create_if_block_116;
    return create_else_block10;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block0 = current_block_type(ctx);
  let if_block1 = ctx[0].method === void 0 && create_if_block21(ctx);
  const block = {
    c: function create4() {
      div4 = element("div");
      div0 = element("div");
      label = element("label");
      label.textContent = "Sort Method";
      t1 = space();
      div3 = element("div");
      div1 = element("div");
      create_component(dropdown.$$.fragment);
      t2 = space();
      div2 = element("div");
      button = element("button");
      if_block0.c();
      t3 = space();
      if (if_block1)
        if_block1.c();
      attr_dev(label, "class", "label");
      add_location(label, file31, 12, 2, 480);
      attr_dev(div0, "class", "field-label is-normal");
      add_location(div0, file31, 10, 1, 383);
      attr_dev(div1, "class", "control");
      add_location(div1, file31, 17, 2, 564);
      attr_dev(button, "class", "button");
      add_location(button, file31, 32, 3, 1102);
      attr_dev(div2, "class", "control");
      add_location(div2, file31, 31, 2, 1077);
      attr_dev(div3, "class", "field-body");
      add_location(div3, file31, 16, 1, 537);
      attr_dev(div4, "class", "block field has-addons");
      add_location(div4, file31, 9, 0, 345);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div4, anchor);
      append_dev(div4, div0);
      append_dev(div0, label);
      append_dev(div4, t1);
      append_dev(div4, div3);
      append_dev(div3, div1);
      mount_component(dropdown, div1, null);
      append_dev(div3, t2);
      append_dev(div3, div2);
      append_dev(div2, button);
      if_block0.m(button, null);
      append_dev(div3, t3);
      if (if_block1)
        if_block1.m(div3, null);
      current = true;
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[5], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      const dropdown_changes = {};
      if (dirty & 4)
        dropdown_changes.labelText = ctx2[2];
      if (dirty & 8193) {
        dropdown_changes.$$scope = { dirty, ctx: ctx2 };
      }
      dropdown.$set(dropdown_changes);
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(button, null);
        }
      }
      if (ctx2[0].method === void 0) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block21(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div3, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(dropdown.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o: function outro(local) {
      transition_out(dropdown.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div4);
      destroy_component(dropdown);
      if_block0.d();
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment32.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance32($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("SortOptions", slots, []);
  let { sortInfo } = $$props;
  let { sortOnce } = $$props;
  let currentMethodName;
  const writable_props = ["sortInfo", "sortOnce"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<SortOptions> was created with unknown prop '${key}'`);
  });
  const click_handler = (method) => $$invalidate(0, sortInfo.method = method, sortInfo);
  const click_handler_1 = () => $$invalidate(0, sortInfo.method = void 0, sortInfo);
  const click_handler_2 = () => $$invalidate(0, sortInfo.reversed = !sortInfo.reversed, sortInfo);
  const click_handler_3 = (method) => sortOnce(method, false);
  const click_handler_4 = (method) => sortOnce(method, true);
  $$self.$$set = ($$props2) => {
    if ("sortInfo" in $$props2)
      $$invalidate(0, sortInfo = $$props2.sortInfo);
    if ("sortOnce" in $$props2)
      $$invalidate(1, sortOnce = $$props2.sortOnce);
  };
  $$self.$capture_state = () => ({
    methodName,
    SortMethod,
    Dropdown: Dropdown_default,
    allSortMethods,
    directionLabel,
    sortInfo,
    sortOnce,
    currentMethodName
  });
  $$self.$inject_state = ($$props2) => {
    if ("sortInfo" in $$props2)
      $$invalidate(0, sortInfo = $$props2.sortInfo);
    if ("sortOnce" in $$props2)
      $$invalidate(1, sortOnce = $$props2.sortOnce);
    if ("currentMethodName" in $$props2)
      $$invalidate(2, currentMethodName = $$props2.currentMethodName);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      $:
        $$invalidate(2, currentMethodName = sortInfo.method !== void 0 ? methodName(sortInfo.method) : "Unsorted");
    }
  };
  return [
    sortInfo,
    sortOnce,
    currentMethodName,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3,
    click_handler_4
  ];
}
var SortOptions = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance32, create_fragment32, safe_not_equal, { sortInfo: 0, sortOnce: 1 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "SortOptions",
      options,
      id: create_fragment32.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("sortInfo" in props)) {
      console.warn("<SortOptions> was created without expected prop 'sortInfo'");
    }
    if (ctx[1] === void 0 && !("sortOnce" in props)) {
      console.warn("<SortOptions> was created without expected prop 'sortOnce'");
    }
  }
  get sortInfo() {
    throw new Error("<SortOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set sortInfo(value) {
    throw new Error("<SortOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get sortOnce() {
    throw new Error("<SortOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set sortOnce(value) {
    throw new Error("<SortOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var SortOptions_default = SortOptions;

// src/timelines/TimelineOptions.svelte
var file32 = "src/timelines/TimelineOptions.svelte";
function get_each_context9(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  return child_ctx;
}
function create_default_slot_122(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Remove timeline");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_122.name,
    type: "slot",
    source: "(38:2) <Button type='is-danger' on:click={removeTimeline}>",
    ctx
  });
  return block;
}
function create_default_slot_11(ctx) {
  let option0;
  let t0;
  let t1;
  let option1;
  let t2;
  let t3;
  let option2;
  let t4;
  const block = {
    c: function create4() {
      option0 = element("option");
      t0 = text("Column");
      t1 = space();
      option1 = element("option");
      t2 = text("Row");
      t3 = space();
      option2 = element("option");
      t4 = text("Masonry");
      option0.__value = ColumnContainer_default;
      option0.value = option0.__value;
      add_location(option0, file32, 44, 4, 1357);
      option1.__value = RowContainer_default;
      option1.value = option1.__value;
      add_location(option1, file32, 45, 4, 1409);
      option2.__value = MasonryContainer_default;
      option2.value = option2.__value;
      add_location(option2, file32, 46, 4, 1455);
    },
    m: function mount(target, anchor) {
      insert_dev(target, option0, anchor);
      append_dev(option0, t0);
      insert_dev(target, t1, anchor);
      insert_dev(target, option1, anchor);
      append_dev(option1, t2);
      insert_dev(target, t3, anchor);
      insert_dev(target, option2, anchor);
      append_dev(option2, t4);
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(option0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(option1);
      if (detaching)
        detach_dev(t3);
      if (detaching)
        detach_dev(option2);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_11.name,
    type: "slot",
    source: "(44:3) <Select bind:selected={data.container} nativeSize={0}>",
    ctx
  });
  return block;
}
function create_default_slot_10(ctx) {
  let select;
  let updating_selected;
  let current;
  function select_selected_binding(value) {
    ctx[4](value);
  }
  let select_props = {
    nativeSize: 0,
    $$slots: { default: [create_default_slot_11] },
    $$scope: { ctx }
  };
  if (ctx[0].container !== void 0) {
    select_props.selected = ctx[0].container;
  }
  select = new Select_default({ props: select_props, $$inline: true });
  binding_callbacks.push(() => bind(select, "selected", select_selected_binding));
  const block = {
    c: function create4() {
      create_component(select.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(select, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const select_changes = {};
      if (dirty & 262144) {
        select_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_selected && dirty & 1) {
        updating_selected = true;
        select_changes.selected = ctx2[0].container;
        add_flush_callback(() => updating_selected = false);
      }
      select.$set(select_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(select.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(select.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(select, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_10.name,
    type: "slot",
    source: "(43:2) <Field label='Container'>",
    ctx
  });
  return block;
}
function create_if_block_213(ctx) {
  let field;
  let current;
  field = new Field_default({
    props: {
      label: "Column Count",
      $$slots: { default: [create_default_slot_9] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(field.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(field, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const field_changes = {};
      if (dirty & 262145) {
        field_changes.$$scope = { dirty, ctx: ctx2 };
      }
      field.$set(field_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(field.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(field.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(field, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_213.name,
    type: "if",
    source: "(50:2) {#if data.container !== ColumnContainer}",
    ctx
  });
  return block;
}
function create_default_slot_9(ctx) {
  let input;
  let input_min_value;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      input = element("input");
      attr_dev(input, "class", "input");
      attr_dev(input, "type", "number");
      attr_dev(input, "min", input_min_value = 1);
      add_location(input, file32, 52, 4, 1678);
    },
    m: function mount(target, anchor) {
      insert_dev(target, input, anchor);
      set_input_value(input, ctx[0].columnCount);
      if (!mounted) {
        dispose = listen_dev(input, "input", ctx[5]);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && to_number(input.value) !== ctx2[0].columnCount) {
        set_input_value(input, ctx2[0].columnCount);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(input);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_9.name,
    type: "slot",
    source: "(51:3) <Field label='Column Count'>",
    ctx
  });
  return block;
}
function create_if_block_117(ctx) {
  let field;
  let current;
  field = new Field_default({
    props: {
      label: "Timeline Width",
      $$slots: { default: [create_default_slot_8] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(field.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(field, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const field_changes = {};
      if (dirty & 262145) {
        field_changes.$$scope = { dirty, ctx: ctx2 };
      }
      field.$set(field_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(field.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(field.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(field, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_117.name,
    type: "if",
    source: "(56:2) {#if !fullscreen}",
    ctx
  });
  return block;
}
function create_default_slot_8(ctx) {
  let input;
  let input_min_value;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      input = element("input");
      attr_dev(input, "class", "input");
      attr_dev(input, "type", "number");
      attr_dev(input, "min", input_min_value = 1);
      add_location(input, file32, 57, 4, 1831);
    },
    m: function mount(target, anchor) {
      insert_dev(target, input, anchor);
      set_input_value(input, ctx[0].width);
      if (!mounted) {
        dispose = listen_dev(input, "input", ctx[6]);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && to_number(input.value) !== ctx2[0].width) {
        set_input_value(input, ctx2[0].width);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(input);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_8.name,
    type: "slot",
    source: "(57:3) <Field label='Timeline Width'>",
    ctx
  });
  return block;
}
function create_default_slot_7(ctx) {
  let input;
  let input_min_value;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      input = element("input");
      attr_dev(input, "class", "input");
      attr_dev(input, "type", "number");
      attr_dev(input, "min", input_min_value = 0);
      add_location(input, file32, 61, 3, 1958);
    },
    m: function mount(target, anchor) {
      insert_dev(target, input, anchor);
      set_input_value(input, ctx[0].scrollSpeed);
      if (!mounted) {
        dispose = listen_dev(input, "input", ctx[7]);
        mounted = true;
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1 && to_number(input.value) !== ctx2[0].scrollSpeed) {
        set_input_value(input, ctx2[0].scrollSpeed);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(input);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_7.name,
    type: "slot",
    source: "(61:2) <Field label='AutoScroll Speed'>",
    ctx
  });
  return block;
}
function create_default_slot_6(ctx) {
  let option0;
  let t0;
  let t1;
  let option1;
  let t2;
  const block = {
    c: function create4() {
      option0 = element("option");
      t0 = text("Social");
      t1 = space();
      option1 = element("option");
      t2 = text("Gallery");
      option0.__value = SocialArticleView_default;
      option0.value = option0.__value;
      add_location(option0, file32, 67, 4, 2166);
      option1.__value = GalleryArticleView_default;
      option1.value = option1.__value;
      add_location(option1, file32, 68, 4, 2220);
    },
    m: function mount(target, anchor) {
      insert_dev(target, option0, anchor);
      append_dev(option0, t0);
      insert_dev(target, t1, anchor);
      insert_dev(target, option1, anchor);
      append_dev(option1, t2);
    },
    p: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(option0);
      if (detaching)
        detach_dev(t1);
      if (detaching)
        detach_dev(option1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_6.name,
    type: "slot",
    source: "(67:3) <Select bind:selected={data.articleView} nativeSize={0}>",
    ctx
  });
  return block;
}
function create_default_slot_5(ctx) {
  let select;
  let updating_selected;
  let current;
  function select_selected_binding_1(value) {
    ctx[8](value);
  }
  let select_props = {
    nativeSize: 0,
    $$slots: { default: [create_default_slot_6] },
    $$scope: { ctx }
  };
  if (ctx[0].articleView !== void 0) {
    select_props.selected = ctx[0].articleView;
  }
  select = new Select_default({ props: select_props, $$inline: true });
  binding_callbacks.push(() => bind(select, "selected", select_selected_binding_1));
  const block = {
    c: function create4() {
      create_component(select.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(select, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const select_changes = {};
      if (dirty & 262144) {
        select_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_selected && dirty & 1) {
        updating_selected = true;
        select_changes.selected = ctx2[0].articleView;
        add_flush_callback(() => updating_selected = false);
      }
      select.$set(select_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(select.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(select.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(select, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_5.name,
    type: "slot",
    source: "(66:2) <Field label='Article View'>",
    ctx
  });
  return block;
}
function create_default_slot_42(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Show all animated as gifs");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_42.name,
    type: "slot",
    source: "(73:3) <Switch bind:checked={data.animatedAsGifs}>",
    ctx
  });
  return block;
}
function create_default_slot_32(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Hide filtered out articles");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_32.name,
    type: "slot",
    source: "(76:3) <Switch bind:checked={data.hideFilteredOutArticles}>",
    ctx
  });
  return block;
}
function create_if_block22(ctx) {
  let div0;
  let switch0;
  let updating_checked;
  let t;
  let div1;
  let switch1;
  let updating_checked_1;
  let current;
  function switch0_checked_binding_1(value) {
    ctx[11](value);
  }
  let switch0_props = {
    $$slots: { default: [create_default_slot_22] },
    $$scope: { ctx }
  };
  if (ctx[0].compact !== void 0) {
    switch0_props.checked = ctx[0].compact;
  }
  switch0 = new Switch_default({ props: switch0_props, $$inline: true });
  binding_callbacks.push(() => bind(switch0, "checked", switch0_checked_binding_1));
  function switch1_checked_binding_1(value) {
    ctx[12](value);
  }
  let switch1_props = {
    $$slots: { default: [create_default_slot_15] },
    $$scope: { ctx }
  };
  if (ctx[0].hideText !== void 0) {
    switch1_props.checked = ctx[0].hideText;
  }
  switch1 = new Switch_default({ props: switch1_props, $$inline: true });
  binding_callbacks.push(() => bind(switch1, "checked", switch1_checked_binding_1));
  const block = {
    c: function create4() {
      div0 = element("div");
      create_component(switch0.$$.fragment);
      t = space();
      div1 = element("div");
      create_component(switch1.$$.fragment);
      attr_dev(div0, "class", "field");
      add_location(div0, file32, 81, 3, 2710);
      attr_dev(div1, "class", "field");
      add_location(div1, file32, 84, 3, 2809);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div0, anchor);
      mount_component(switch0, div0, null);
      insert_dev(target, t, anchor);
      insert_dev(target, div1, anchor);
      mount_component(switch1, div1, null);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const switch0_changes = {};
      if (dirty & 262144) {
        switch0_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_checked && dirty & 1) {
        updating_checked = true;
        switch0_changes.checked = ctx2[0].compact;
        add_flush_callback(() => updating_checked = false);
      }
      switch0.$set(switch0_changes);
      const switch1_changes = {};
      if (dirty & 262144) {
        switch1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_checked_1 && dirty & 1) {
        updating_checked_1 = true;
        switch1_changes.checked = ctx2[0].hideText;
        add_flush_callback(() => updating_checked_1 = false);
      }
      switch1.$set(switch1_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(switch0.$$.fragment, local);
      transition_in(switch1.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(switch0.$$.fragment, local);
      transition_out(switch1.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div0);
      destroy_component(switch0);
      if (detaching)
        detach_dev(t);
      if (detaching)
        detach_dev(div1);
      destroy_component(switch1);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block22.name,
    type: "if",
    source: "(81:2) {#if data.articleView === SocialArticleView}",
    ctx
  });
  return block;
}
function create_default_slot_22(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Compact articles");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_22.name,
    type: "slot",
    source: "(83:4) <Switch bind:checked={data.compact}>",
    ctx
  });
  return block;
}
function create_default_slot_15(ctx) {
  let t;
  const block = {
    c: function create4() {
      t = text("Hide text");
    },
    m: function mount(target, anchor) {
      insert_dev(target, t, anchor);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(t);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot_15.name,
    type: "slot",
    source: "(86:4) <Switch bind:checked={data.hideText}>",
    ctx
  });
  return block;
}
function create_each_block9(key_1, ctx) {
  let li;
  let t_value = (ctx[15].name || ctx[15].endpoint.name) + "";
  let t;
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      li = element("li");
      t = text(t_value);
      add_location(li, file32, 93, 5, 3025);
      this.first = li;
    },
    m: function mount(target, anchor) {
      insert_dev(target, li, anchor);
      append_dev(li, t);
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && t_value !== (t_value = (ctx[15].name || ctx[15].endpoint.name) + ""))
        set_data_dev(t, t_value);
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(li);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block9.name,
    type: "each",
    source: "(93:4) {#each data.endpoints as endpoint (endpoint)}",
    ctx
  });
  return block;
}
function create_default_slot10(ctx) {
  let ul;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value = ctx[0].endpoints;
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[15];
  validate_each_keys(ctx, each_value, get_each_context9, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context9(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block9(key, child_ctx));
  }
  const block = {
    c: function create4() {
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      add_location(ul, file32, 91, 3, 2965);
    },
    m: function mount(target, anchor) {
      insert_dev(target, ul, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(ul, null);
      }
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 1) {
        each_value = ctx2[0].endpoints;
        validate_each_argument(each_value);
        validate_each_keys(ctx2, each_value, get_each_context9, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, ul, destroy_block, create_each_block9, null, get_each_context9);
      }
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(ul);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot10.name,
    type: "slot",
    source: "(91:2) <Field label='Endpoints'>",
    ctx
  });
  return block;
}
function create_fragment33(ctx) {
  let div8;
  let div0;
  let button;
  let t0;
  let div1;
  let field0;
  let t1;
  let t2;
  let t3;
  let field1;
  let t4;
  let div4;
  let field2;
  let t5;
  let div2;
  let switch0;
  let updating_checked;
  let t6;
  let div3;
  let switch1;
  let updating_checked_1;
  let t7;
  let t8;
  let div5;
  let field3;
  let t9;
  let div6;
  let filtersoptions;
  let updating_instances;
  let t10;
  let div7;
  let sortoptions;
  let updating_sortInfo;
  let current;
  button = new Button_default({
    props: {
      type: "is-danger",
      $$slots: { default: [create_default_slot_122] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  button.$on("click", function() {
    if (is_function(ctx[2]))
      ctx[2].apply(this, arguments);
  });
  field0 = new Field_default({
    props: {
      label: "Container",
      $$slots: { default: [create_default_slot_10] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  let if_block0 = ctx[0].container !== ColumnContainer_default && create_if_block_213(ctx);
  let if_block1 = !ctx[1] && create_if_block_117(ctx);
  field1 = new Field_default({
    props: {
      label: "AutoScroll Speed",
      $$slots: { default: [create_default_slot_7] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  field2 = new Field_default({
    props: {
      label: "Article View",
      $$slots: { default: [create_default_slot_5] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  function switch0_checked_binding(value) {
    ctx[9](value);
  }
  let switch0_props = {
    $$slots: { default: [create_default_slot_42] },
    $$scope: { ctx }
  };
  if (ctx[0].animatedAsGifs !== void 0) {
    switch0_props.checked = ctx[0].animatedAsGifs;
  }
  switch0 = new Switch_default({ props: switch0_props, $$inline: true });
  binding_callbacks.push(() => bind(switch0, "checked", switch0_checked_binding));
  function switch1_checked_binding(value) {
    ctx[10](value);
  }
  let switch1_props = {
    $$slots: { default: [create_default_slot_32] },
    $$scope: { ctx }
  };
  if (ctx[0].hideFilteredOutArticles !== void 0) {
    switch1_props.checked = ctx[0].hideFilteredOutArticles;
  }
  switch1 = new Switch_default({ props: switch1_props, $$inline: true });
  binding_callbacks.push(() => bind(switch1, "checked", switch1_checked_binding));
  let if_block2 = ctx[0].articleView === SocialArticleView_default && create_if_block22(ctx);
  field3 = new Field_default({
    props: {
      label: "Endpoints",
      $$slots: { default: [create_default_slot10] },
      $$scope: { ctx }
    },
    $$inline: true
  });
  function filtersoptions_instances_binding(value) {
    ctx[13](value);
  }
  let filtersoptions_props = {};
  if (ctx[0].filters !== void 0) {
    filtersoptions_props.instances = ctx[0].filters;
  }
  filtersoptions = new FiltersOptions_default({
    props: filtersoptions_props,
    $$inline: true
  });
  binding_callbacks.push(() => bind(filtersoptions, "instances", filtersoptions_instances_binding));
  function sortoptions_sortInfo_binding(value) {
    ctx[14](value);
  }
  let sortoptions_props = { sortOnce: ctx[3] };
  if (ctx[0].sortInfo !== void 0) {
    sortoptions_props.sortInfo = ctx[0].sortInfo;
  }
  sortoptions = new SortOptions_default({ props: sortoptions_props, $$inline: true });
  binding_callbacks.push(() => bind(sortoptions, "sortInfo", sortoptions_sortInfo_binding));
  const block = {
    c: function create4() {
      div8 = element("div");
      div0 = element("div");
      create_component(button.$$.fragment);
      t0 = space();
      div1 = element("div");
      create_component(field0.$$.fragment);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      if (if_block1)
        if_block1.c();
      t3 = space();
      create_component(field1.$$.fragment);
      t4 = space();
      div4 = element("div");
      create_component(field2.$$.fragment);
      t5 = space();
      div2 = element("div");
      create_component(switch0.$$.fragment);
      t6 = space();
      div3 = element("div");
      create_component(switch1.$$.fragment);
      t7 = space();
      if (if_block2)
        if_block2.c();
      t8 = space();
      div5 = element("div");
      create_component(field3.$$.fragment);
      t9 = space();
      div6 = element("div");
      create_component(filtersoptions.$$.fragment);
      t10 = space();
      div7 = element("div");
      create_component(sortoptions.$$.fragment);
      attr_dev(div0, "class", "box svelte-4hp0iz");
      add_location(div0, file32, 36, 1, 1137);
      attr_dev(div1, "class", "box svelte-4hp0iz");
      add_location(div1, file32, 41, 1, 1249);
      attr_dev(div2, "class", "field");
      add_location(div2, file32, 71, 2, 2298);
      attr_dev(div3, "class", "field");
      add_location(div3, file32, 74, 2, 2410);
      attr_dev(div4, "class", "box svelte-4hp0iz");
      add_location(div4, file32, 64, 1, 2053);
      attr_dev(div5, "class", "box svelte-4hp0iz");
      add_location(div5, file32, 89, 1, 2916);
      attr_dev(div6, "class", "box svelte-4hp0iz");
      add_location(div6, file32, 98, 1, 3117);
      attr_dev(div7, "class", "box svelte-4hp0iz");
      add_location(div7, file32, 101, 1, 3194);
      attr_dev(div8, "class", "timelineOptions svelte-4hp0iz");
      add_location(div8, file32, 35, 0, 1106);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div8, anchor);
      append_dev(div8, div0);
      mount_component(button, div0, null);
      append_dev(div8, t0);
      append_dev(div8, div1);
      mount_component(field0, div1, null);
      append_dev(div1, t1);
      if (if_block0)
        if_block0.m(div1, null);
      append_dev(div1, t2);
      if (if_block1)
        if_block1.m(div1, null);
      append_dev(div1, t3);
      mount_component(field1, div1, null);
      append_dev(div8, t4);
      append_dev(div8, div4);
      mount_component(field2, div4, null);
      append_dev(div4, t5);
      append_dev(div4, div2);
      mount_component(switch0, div2, null);
      append_dev(div4, t6);
      append_dev(div4, div3);
      mount_component(switch1, div3, null);
      append_dev(div4, t7);
      if (if_block2)
        if_block2.m(div4, null);
      append_dev(div8, t8);
      append_dev(div8, div5);
      mount_component(field3, div5, null);
      append_dev(div8, t9);
      append_dev(div8, div6);
      mount_component(filtersoptions, div6, null);
      append_dev(div8, t10);
      append_dev(div8, div7);
      mount_component(sortoptions, div7, null);
      current = true;
    },
    p: function update3(new_ctx, [dirty]) {
      ctx = new_ctx;
      const button_changes = {};
      if (dirty & 262144) {
        button_changes.$$scope = { dirty, ctx };
      }
      button.$set(button_changes);
      const field0_changes = {};
      if (dirty & 262145) {
        field0_changes.$$scope = { dirty, ctx };
      }
      field0.$set(field0_changes);
      if (ctx[0].container !== ColumnContainer_default) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
          if (dirty & 1) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_213(ctx);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div1, t2);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (!ctx[1]) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
          if (dirty & 2) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_117(ctx);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, t3);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      const field1_changes = {};
      if (dirty & 262145) {
        field1_changes.$$scope = { dirty, ctx };
      }
      field1.$set(field1_changes);
      const field2_changes = {};
      if (dirty & 262145) {
        field2_changes.$$scope = { dirty, ctx };
      }
      field2.$set(field2_changes);
      const switch0_changes = {};
      if (dirty & 262144) {
        switch0_changes.$$scope = { dirty, ctx };
      }
      if (!updating_checked && dirty & 1) {
        updating_checked = true;
        switch0_changes.checked = ctx[0].animatedAsGifs;
        add_flush_callback(() => updating_checked = false);
      }
      switch0.$set(switch0_changes);
      const switch1_changes = {};
      if (dirty & 262144) {
        switch1_changes.$$scope = { dirty, ctx };
      }
      if (!updating_checked_1 && dirty & 1) {
        updating_checked_1 = true;
        switch1_changes.checked = ctx[0].hideFilteredOutArticles;
        add_flush_callback(() => updating_checked_1 = false);
      }
      switch1.$set(switch1_changes);
      if (ctx[0].articleView === SocialArticleView_default) {
        if (if_block2) {
          if_block2.p(ctx, dirty);
          if (dirty & 1) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block22(ctx);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div4, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      const field3_changes = {};
      if (dirty & 262145) {
        field3_changes.$$scope = { dirty, ctx };
      }
      field3.$set(field3_changes);
      const filtersoptions_changes = {};
      if (!updating_instances && dirty & 1) {
        updating_instances = true;
        filtersoptions_changes.instances = ctx[0].filters;
        add_flush_callback(() => updating_instances = false);
      }
      filtersoptions.$set(filtersoptions_changes);
      const sortoptions_changes = {};
      if (dirty & 8)
        sortoptions_changes.sortOnce = ctx[3];
      if (!updating_sortInfo && dirty & 1) {
        updating_sortInfo = true;
        sortoptions_changes.sortInfo = ctx[0].sortInfo;
        add_flush_callback(() => updating_sortInfo = false);
      }
      sortoptions.$set(sortoptions_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(button.$$.fragment, local);
      transition_in(field0.$$.fragment, local);
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(field1.$$.fragment, local);
      transition_in(field2.$$.fragment, local);
      transition_in(switch0.$$.fragment, local);
      transition_in(switch1.$$.fragment, local);
      transition_in(if_block2);
      transition_in(field3.$$.fragment, local);
      transition_in(filtersoptions.$$.fragment, local);
      transition_in(sortoptions.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(button.$$.fragment, local);
      transition_out(field0.$$.fragment, local);
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(field1.$$.fragment, local);
      transition_out(field2.$$.fragment, local);
      transition_out(switch0.$$.fragment, local);
      transition_out(switch1.$$.fragment, local);
      transition_out(if_block2);
      transition_out(field3.$$.fragment, local);
      transition_out(filtersoptions.$$.fragment, local);
      transition_out(sortoptions.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div8);
      destroy_component(button);
      destroy_component(field0);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      destroy_component(field1);
      destroy_component(field2);
      destroy_component(switch0);
      destroy_component(switch1);
      if (if_block2)
        if_block2.d();
      destroy_component(field3);
      destroy_component(filtersoptions);
      destroy_component(sortoptions);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment33.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance33($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("TimelineOptions", slots, []);
  let { data } = $$props;
  let { fullscreen: fullscreen2 } = $$props;
  let { removeTimeline } = $$props;
  let { sortOnce } = $$props;
  const writable_props = ["data", "fullscreen", "removeTimeline", "sortOnce"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<TimelineOptions> was created with unknown prop '${key}'`);
  });
  function select_selected_binding(value) {
    if ($$self.$$.not_equal(data.container, value)) {
      data.container = value;
      $$invalidate(0, data);
    }
  }
  function input_input_handler() {
    data.columnCount = to_number(this.value);
    $$invalidate(0, data);
  }
  function input_input_handler_1() {
    data.width = to_number(this.value);
    $$invalidate(0, data);
  }
  function input_input_handler_2() {
    data.scrollSpeed = to_number(this.value);
    $$invalidate(0, data);
  }
  function select_selected_binding_1(value) {
    if ($$self.$$.not_equal(data.articleView, value)) {
      data.articleView = value;
      $$invalidate(0, data);
    }
  }
  function switch0_checked_binding(value) {
    if ($$self.$$.not_equal(data.animatedAsGifs, value)) {
      data.animatedAsGifs = value;
      $$invalidate(0, data);
    }
  }
  function switch1_checked_binding(value) {
    if ($$self.$$.not_equal(data.hideFilteredOutArticles, value)) {
      data.hideFilteredOutArticles = value;
      $$invalidate(0, data);
    }
  }
  function switch0_checked_binding_1(value) {
    if ($$self.$$.not_equal(data.compact, value)) {
      data.compact = value;
      $$invalidate(0, data);
    }
  }
  function switch1_checked_binding_1(value) {
    if ($$self.$$.not_equal(data.hideText, value)) {
      data.hideText = value;
      $$invalidate(0, data);
    }
  }
  function filtersoptions_instances_binding(value) {
    if ($$self.$$.not_equal(data.filters, value)) {
      data.filters = value;
      $$invalidate(0, data);
    }
  }
  function sortoptions_sortInfo_binding(value) {
    if ($$self.$$.not_equal(data.sortInfo, value)) {
      data.sortInfo = value;
      $$invalidate(0, data);
    }
  }
  $$self.$$set = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(0, data = $$props2.data);
    if ("fullscreen" in $$props2)
      $$invalidate(1, fullscreen2 = $$props2.fullscreen);
    if ("removeTimeline" in $$props2)
      $$invalidate(2, removeTimeline = $$props2.removeTimeline);
    if ("sortOnce" in $$props2)
      $$invalidate(3, sortOnce = $$props2.sortOnce);
  };
  $$self.$capture_state = () => ({
    Field: Field_default,
    Button: Button_default,
    Input: Input_default,
    Select: Select_default,
    Switch: Switch_default,
    ColumnContainer: ColumnContainer_default,
    RowContainer: RowContainer_default,
    MasonryContainer: MasonryContainer_default,
    SocialArticleView: SocialArticleView_default,
    GalleryArticleView: GalleryArticleView_default,
    FiltersOptions: FiltersOptions_default,
    SortOptions: SortOptions_default,
    SortMethod,
    data,
    fullscreen: fullscreen2,
    removeTimeline,
    sortOnce
  });
  $$self.$inject_state = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(0, data = $$props2.data);
    if ("fullscreen" in $$props2)
      $$invalidate(1, fullscreen2 = $$props2.fullscreen);
    if ("removeTimeline" in $$props2)
      $$invalidate(2, removeTimeline = $$props2.removeTimeline);
    if ("sortOnce" in $$props2)
      $$invalidate(3, sortOnce = $$props2.sortOnce);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    data,
    fullscreen2,
    removeTimeline,
    sortOnce,
    select_selected_binding,
    input_input_handler,
    input_input_handler_1,
    input_input_handler_2,
    select_selected_binding_1,
    switch0_checked_binding,
    switch1_checked_binding,
    switch0_checked_binding_1,
    switch1_checked_binding_1,
    filtersoptions_instances_binding,
    sortoptions_sortInfo_binding
  ];
}
var TimelineOptions = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance33, create_fragment33, safe_not_equal, {
      data: 0,
      fullscreen: 1,
      removeTimeline: 2,
      sortOnce: 3
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "TimelineOptions",
      options,
      id: create_fragment33.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("data" in props)) {
      console.warn("<TimelineOptions> was created without expected prop 'data'");
    }
    if (ctx[1] === void 0 && !("fullscreen" in props)) {
      console.warn("<TimelineOptions> was created without expected prop 'fullscreen'");
    }
    if (ctx[2] === void 0 && !("removeTimeline" in props)) {
      console.warn("<TimelineOptions> was created without expected prop 'removeTimeline'");
    }
    if (ctx[3] === void 0 && !("sortOnce" in props)) {
      console.warn("<TimelineOptions> was created without expected prop 'sortOnce'");
    }
  }
  get data() {
    throw new Error("<TimelineOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set data(value) {
    throw new Error("<TimelineOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get fullscreen() {
    throw new Error("<TimelineOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set fullscreen(value) {
    throw new Error("<TimelineOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get removeTimeline() {
    throw new Error("<TimelineOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set removeTimeline(value) {
    throw new Error("<TimelineOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get sortOnce() {
    throw new Error("<TimelineOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set sortOnce(value) {
    throw new Error("<TimelineOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var TimelineOptions_default = TimelineOptions;

// src/timelines/Timeline.svelte
var { console: console_12 } = globals;
var file33 = "src/timelines/Timeline.svelte";
function create_if_block23(ctx) {
  let timelineoptions;
  let updating_data;
  let current;
  function timelineoptions_data_binding(value) {
    ctx[29](value);
  }
  let timelineoptions_props = {
    fullscreen: ctx[4],
    sortOnce: ctx[17],
    removeTimeline: ctx[6]
  };
  if (ctx[0] !== void 0) {
    timelineoptions_props.data = ctx[0];
  }
  timelineoptions = new TimelineOptions_default({
    props: timelineoptions_props,
    $$inline: true
  });
  binding_callbacks.push(() => bind(timelineoptions, "data", timelineoptions_data_binding));
  const block = {
    c: function create4() {
      create_component(timelineoptions.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timelineoptions, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const timelineoptions_changes = {};
      if (dirty[0] & 16)
        timelineoptions_changes.fullscreen = ctx2[4];
      if (dirty[0] & 64)
        timelineoptions_changes.removeTimeline = ctx2[6];
      if (!updating_data && dirty[0] & 1) {
        updating_data = true;
        timelineoptions_changes.data = ctx2[0];
        add_flush_callback(() => updating_data = false);
      }
      timelineoptions.$set(timelineoptions_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timelineoptions.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timelineoptions.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timelineoptions, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block23.name,
    type: "if",
    source: "(190:1) {#if showOptions}",
    ctx
  });
  return block;
}
function create_fragment34(ctx) {
  let div;
  let timelineheader;
  let updating_data;
  let updating_availableRefreshTypes;
  let updating_containerRebalance;
  let updating_showSidebar;
  let updating_showOptions;
  let updating_favviewerButtons;
  let updating_favviewerHidden;
  let t0;
  let t1;
  let switch_instance;
  let updating_containerRef;
  let div_style_value;
  let current;
  function timelineheader_data_binding(value) {
    ctx[22](value);
  }
  function timelineheader_availableRefreshTypes_binding(value) {
    ctx[23](value);
  }
  function timelineheader_containerRebalance_binding(value) {
    ctx[24](value);
  }
  function timelineheader_showSidebar_binding(value) {
    ctx[25](value);
  }
  function timelineheader_showOptions_binding(value) {
    ctx[26](value);
  }
  function timelineheader_favviewerButtons_binding(value) {
    ctx[27](value);
  }
  function timelineheader_favviewerHidden_binding(value) {
    ctx[28](value);
  }
  let timelineheader_props = {
    fullscreen: ctx[4],
    shuffle: ctx[14],
    autoscroll: ctx[15],
    refresh: ctx[16],
    toggleFullscreen: ctx[5]
  };
  if (ctx[0] !== void 0) {
    timelineheader_props.data = ctx[0];
  }
  if (ctx[12] !== void 0) {
    timelineheader_props.availableRefreshTypes = ctx[12];
  }
  if (ctx[7] !== void 0) {
    timelineheader_props.containerRebalance = ctx[7];
  }
  if (ctx[3] !== void 0) {
    timelineheader_props.showSidebar = ctx[3];
  }
  if (ctx[8] !== void 0) {
    timelineheader_props.showOptions = ctx[8];
  }
  if (ctx[1] !== void 0) {
    timelineheader_props.favviewerButtons = ctx[1];
  }
  if (ctx[2] !== void 0) {
    timelineheader_props.favviewerHidden = ctx[2];
  }
  timelineheader = new TimelineHeader_default({
    props: timelineheader_props,
    $$inline: true
  });
  binding_callbacks.push(() => bind(timelineheader, "data", timelineheader_data_binding));
  binding_callbacks.push(() => bind(timelineheader, "availableRefreshTypes", timelineheader_availableRefreshTypes_binding));
  binding_callbacks.push(() => bind(timelineheader, "containerRebalance", timelineheader_containerRebalance_binding));
  binding_callbacks.push(() => bind(timelineheader, "showSidebar", timelineheader_showSidebar_binding));
  binding_callbacks.push(() => bind(timelineheader, "showOptions", timelineheader_showOptions_binding));
  binding_callbacks.push(() => bind(timelineheader, "favviewerButtons", timelineheader_favviewerButtons_binding));
  binding_callbacks.push(() => bind(timelineheader, "favviewerHidden", timelineheader_favviewerHidden_binding));
  let if_block = ctx[8] && create_if_block23(ctx);
  function switch_instance_containerRef_binding(value) {
    ctx[30](value);
  }
  var switch_value = ctx[0].container;
  function switch_props(ctx2) {
    let switch_instance_props = { props: ctx2[13] };
    if (ctx2[9] !== void 0) {
      switch_instance_props.containerRef = ctx2[9];
    }
    return {
      props: switch_instance_props,
      $$inline: true
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
    binding_callbacks.push(() => bind(switch_instance, "containerRef", switch_instance_containerRef_binding));
  }
  const block = {
    c: function create4() {
      div = element("div");
      create_component(timelineheader.$$.fragment);
      t0 = space();
      if (if_block)
        if_block.c();
      t1 = space();
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      attr_dev(div, "class", "timeline svelte-11ye5wl");
      attr_dev(div, "style", div_style_value = ctx[0].width > 1 ? `width: ${ctx[0].width * 500}px` : "");
      toggle_class(div, "fullscreenTimeline", ctx[4]);
      add_location(div, file33, 173, 0, 6123);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      mount_component(timelineheader, div, null);
      append_dev(div, t0);
      if (if_block)
        if_block.m(div, null);
      append_dev(div, t1);
      if (switch_instance) {
        mount_component(switch_instance, div, null);
      }
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const timelineheader_changes = {};
      if (dirty[0] & 16)
        timelineheader_changes.fullscreen = ctx2[4];
      if (dirty[0] & 32)
        timelineheader_changes.toggleFullscreen = ctx2[5];
      if (!updating_data && dirty[0] & 1) {
        updating_data = true;
        timelineheader_changes.data = ctx2[0];
        add_flush_callback(() => updating_data = false);
      }
      if (!updating_availableRefreshTypes && dirty[0] & 4096) {
        updating_availableRefreshTypes = true;
        timelineheader_changes.availableRefreshTypes = ctx2[12];
        add_flush_callback(() => updating_availableRefreshTypes = false);
      }
      if (!updating_containerRebalance && dirty[0] & 128) {
        updating_containerRebalance = true;
        timelineheader_changes.containerRebalance = ctx2[7];
        add_flush_callback(() => updating_containerRebalance = false);
      }
      if (!updating_showSidebar && dirty[0] & 8) {
        updating_showSidebar = true;
        timelineheader_changes.showSidebar = ctx2[3];
        add_flush_callback(() => updating_showSidebar = false);
      }
      if (!updating_showOptions && dirty[0] & 256) {
        updating_showOptions = true;
        timelineheader_changes.showOptions = ctx2[8];
        add_flush_callback(() => updating_showOptions = false);
      }
      if (!updating_favviewerButtons && dirty[0] & 2) {
        updating_favviewerButtons = true;
        timelineheader_changes.favviewerButtons = ctx2[1];
        add_flush_callback(() => updating_favviewerButtons = false);
      }
      if (!updating_favviewerHidden && dirty[0] & 4) {
        updating_favviewerHidden = true;
        timelineheader_changes.favviewerHidden = ctx2[2];
        add_flush_callback(() => updating_favviewerHidden = false);
      }
      timelineheader.$set(timelineheader_changes);
      if (ctx2[8]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 256) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block23(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, t1);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const switch_instance_changes = {};
      if (dirty[0] & 8192)
        switch_instance_changes.props = ctx2[13];
      if (!updating_containerRef && dirty[0] & 512) {
        updating_containerRef = true;
        switch_instance_changes.containerRef = ctx2[9];
        add_flush_callback(() => updating_containerRef = false);
      }
      if (switch_value !== (switch_value = ctx2[0].container)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          binding_callbacks.push(() => bind(switch_instance, "containerRef", switch_instance_containerRef_binding));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & 1 && div_style_value !== (div_style_value = ctx2[0].width > 1 ? `width: ${ctx2[0].width * 500}px` : "")) {
        attr_dev(div, "style", div_style_value);
      }
      if (dirty[0] & 16) {
        toggle_class(div, "fullscreenTimeline", ctx2[4]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timelineheader.$$.fragment, local);
      transition_in(if_block);
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timelineheader.$$.fragment, local);
      transition_out(if_block);
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      destroy_component(timelineheader);
      if (if_block)
        if_block.d();
      if (switch_instance)
        destroy_component(switch_instance);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment34.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance34($$self, $$props, $$invalidate) {
  let $filteredArticles, $$unsubscribe_filteredArticles = noop, $$subscribe_filteredArticles = () => ($$unsubscribe_filteredArticles(), $$unsubscribe_filteredArticles = subscribe(filteredArticles, ($$value) => $$invalidate(20, $filteredArticles = $$value)), filteredArticles);
  let $articles, $$unsubscribe_articles = noop, $$subscribe_articles = () => ($$unsubscribe_articles(), $$unsubscribe_articles = subscribe(articles, ($$value) => $$invalidate(21, $articles = $$value)), articles);
  $$self.$$.on_destroy.push(() => $$unsubscribe_filteredArticles());
  $$self.$$.on_destroy.push(() => $$unsubscribe_articles());
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Timeline", slots, []);
  let { data } = $$props;
  let { fullscreen: fullscreen2 } = $$props;
  let { toggleFullscreen = void 0 } = $$props;
  let { removeTimeline } = $$props;
  let { setModalTimeline } = $$props;
  let { favviewerButtons = false } = $$props;
  let { favviewerHidden = false } = $$props;
  let { showSidebar = true } = $$props;
  let showOptions = false;
  let containerRef = void 0;
  let containerRebalance = false;
  let articles;
  let articlesWithRefs;
  let filteredArticles;
  let availableRefreshTypes;
  let containerProps;
  var ScrollDirection;
  (function(ScrollDirection2) {
    ScrollDirection2[ScrollDirection2["Up"] = 0] = "Up";
    ScrollDirection2[ScrollDirection2["Down"] = 1] = "Down";
  })(ScrollDirection || (ScrollDirection = {}));
  let autoscrollInfo = { direction: ScrollDirection.Down };
  function shuffle() {
    let currentIndex = data.articles.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      $$invalidate(0, [data.articles[currentIndex], data.articles[randomIndex]] = [data.articles[randomIndex], data.articles[currentIndex]], data);
    }
    $$invalidate(0, data);
    $$invalidate(0, data.sortInfo.method = void 0, data);
    $$invalidate(7, containerRebalance = !containerRebalance);
  }
  function autoscroll() {
    const scrollStep = () => {
      if (autoscrollInfo.direction && containerRef.scrollTop > 0 || !autoscrollInfo.direction && containerRef.scrollTop < containerRef.scrollHeight - containerRef.clientHeight)
        containerRef.scrollBy(0, autoscrollInfo.direction ? data.scrollSpeed : -data.scrollSpeed);
      else
        autoscrollInfo.direction = autoscrollInfo.direction === ScrollDirection.Down ? ScrollDirection.Up : ScrollDirection.Down;
      autoscrollInfo.scrollRequestId = window.requestAnimationFrame(scrollStep);
    };
    autoscrollInfo.scrollRequestId = window.requestAnimationFrame(scrollStep);
    window.addEventListener("mousedown", stopScroll, { once: true });
  }
  function stopScroll(e) {
    if (autoscrollInfo.scrollRequestId === void 0)
      return;
    window.cancelAnimationFrame(autoscrollInfo.scrollRequestId);
    autoscrollInfo.scrollRequestId = void 0;
    if (e.target.matches(".timelineAutoscroll, .timelineAutoscroll *"))
      autoscrollInfo.direction = autoscrollInfo.direction === ScrollDirection.Down ? ScrollDirection.Up : ScrollDirection.Down;
    else
      autoscrollInfo.direction = ScrollDirection.Down;
  }
  async function refresh(refreshType) {
    const newArticles = await refreshEndpoints(data.endpoints, refreshType);
    data.articles.push(...newArticles);
    $$invalidate(0, data);
  }
  function sortOnce(method, reversed) {
    const sorted = get_store_value(articlesWithRefs).sort(compare(method));
    if (reversed)
      sorted.reverse();
    $$invalidate(0, data.articles = sorted.map((a) => a.article.idPair), data);
  }
  onMount(async () => {
    if (!data.endpoints.length)
      return;
    const newArticles = await refreshEndpoints(data.endpoints, 0 /* RefreshStart */);
    data.articles.push(...newArticles);
    $$invalidate(0, data);
    return () => console.log("Destroying timeline " + data.title);
  });
  const writable_props = [
    "data",
    "fullscreen",
    "toggleFullscreen",
    "removeTimeline",
    "setModalTimeline",
    "favviewerButtons",
    "favviewerHidden",
    "showSidebar"
  ];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console_12.warn(`<Timeline> was created with unknown prop '${key}'`);
  });
  function timelineheader_data_binding(value) {
    data = value;
    $$invalidate(0, data);
  }
  function timelineheader_availableRefreshTypes_binding(value) {
    availableRefreshTypes = value;
    $$invalidate(12, availableRefreshTypes), $$invalidate(0, data);
  }
  function timelineheader_containerRebalance_binding(value) {
    containerRebalance = value;
    $$invalidate(7, containerRebalance);
  }
  function timelineheader_showSidebar_binding(value) {
    showSidebar = value;
    $$invalidate(3, showSidebar);
  }
  function timelineheader_showOptions_binding(value) {
    showOptions = value;
    $$invalidate(8, showOptions);
  }
  function timelineheader_favviewerButtons_binding(value) {
    favviewerButtons = value;
    $$invalidate(1, favviewerButtons);
  }
  function timelineheader_favviewerHidden_binding(value) {
    favviewerHidden = value;
    $$invalidate(2, favviewerHidden);
  }
  function timelineoptions_data_binding(value) {
    data = value;
    $$invalidate(0, data);
  }
  function switch_instance_containerRef_binding(value) {
    containerRef = value;
    $$invalidate(9, containerRef);
  }
  $$self.$$set = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(0, data = $$props2.data);
    if ("fullscreen" in $$props2)
      $$invalidate(4, fullscreen2 = $$props2.fullscreen);
    if ("toggleFullscreen" in $$props2)
      $$invalidate(5, toggleFullscreen = $$props2.toggleFullscreen);
    if ("removeTimeline" in $$props2)
      $$invalidate(6, removeTimeline = $$props2.removeTimeline);
    if ("setModalTimeline" in $$props2)
      $$invalidate(18, setModalTimeline = $$props2.setModalTimeline);
    if ("favviewerButtons" in $$props2)
      $$invalidate(1, favviewerButtons = $$props2.favviewerButtons);
    if ("favviewerHidden" in $$props2)
      $$invalidate(2, favviewerHidden = $$props2.favviewerHidden);
    if ("showSidebar" in $$props2)
      $$invalidate(3, showSidebar = $$props2.showSidebar);
  };
  $$self.$capture_state = () => ({
    derived,
    get: get_store_value,
    Article,
    articleRefIdPairToRef,
    getEndpoints,
    getWritable,
    refreshEndpoints,
    RefreshType,
    onMount,
    keepArticle,
    compare,
    SortMethod,
    TimelineHeader: TimelineHeader_default,
    TimelineOptions: TimelineOptions_default,
    data,
    fullscreen: fullscreen2,
    toggleFullscreen,
    removeTimeline,
    setModalTimeline,
    favviewerButtons,
    favviewerHidden,
    showSidebar,
    showOptions,
    containerRef,
    containerRebalance,
    articles,
    articlesWithRefs,
    filteredArticles,
    availableRefreshTypes,
    containerProps,
    ScrollDirection,
    autoscrollInfo,
    shuffle,
    autoscroll,
    stopScroll,
    refresh,
    sortOnce,
    $filteredArticles,
    $articles
  });
  $$self.$inject_state = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(0, data = $$props2.data);
    if ("fullscreen" in $$props2)
      $$invalidate(4, fullscreen2 = $$props2.fullscreen);
    if ("toggleFullscreen" in $$props2)
      $$invalidate(5, toggleFullscreen = $$props2.toggleFullscreen);
    if ("removeTimeline" in $$props2)
      $$invalidate(6, removeTimeline = $$props2.removeTimeline);
    if ("setModalTimeline" in $$props2)
      $$invalidate(18, setModalTimeline = $$props2.setModalTimeline);
    if ("favviewerButtons" in $$props2)
      $$invalidate(1, favviewerButtons = $$props2.favviewerButtons);
    if ("favviewerHidden" in $$props2)
      $$invalidate(2, favviewerHidden = $$props2.favviewerHidden);
    if ("showSidebar" in $$props2)
      $$invalidate(3, showSidebar = $$props2.showSidebar);
    if ("showOptions" in $$props2)
      $$invalidate(8, showOptions = $$props2.showOptions);
    if ("containerRef" in $$props2)
      $$invalidate(9, containerRef = $$props2.containerRef);
    if ("containerRebalance" in $$props2)
      $$invalidate(7, containerRebalance = $$props2.containerRebalance);
    if ("articles" in $$props2)
      $$subscribe_articles($$invalidate(10, articles = $$props2.articles));
    if ("articlesWithRefs" in $$props2)
      $$invalidate(19, articlesWithRefs = $$props2.articlesWithRefs);
    if ("filteredArticles" in $$props2)
      $$subscribe_filteredArticles($$invalidate(11, filteredArticles = $$props2.filteredArticles));
    if ("availableRefreshTypes" in $$props2)
      $$invalidate(12, availableRefreshTypes = $$props2.availableRefreshTypes);
    if ("containerProps" in $$props2)
      $$invalidate(13, containerProps = $$props2.containerProps);
    if ("ScrollDirection" in $$props2)
      ScrollDirection = $$props2.ScrollDirection;
    if ("autoscrollInfo" in $$props2)
      autoscrollInfo = $$props2.autoscrollInfo;
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & 1) {
      $:
        $$subscribe_articles($$invalidate(10, articles = derived(data.articles.map(getWritable), (a) => a)));
    }
    if ($$self.$$.dirty[0] & 2097152) {
      $:
        $$invalidate(19, articlesWithRefs = derived($articles.map((article) => {
          const stores = [];
          if (article.actualArticleRef)
            stores.push(articleRefIdPairToRef(article.actualArticleRef));
          if (article.replyRef)
            stores.push(getWritable(article.replyRef));
          return derived(stores, (refs) => ({
            article,
            actualArticleRef: article.actualArticleRef ? refs[0] : void 0,
            replyRef: article.replyRef ? article.actualArticleRef ? refs[1] : refs[0] : void 0
          }));
        }), (a) => a));
    }
    if ($$self.$$.dirty[0] & 524289) {
      $:
        $$subscribe_filteredArticles($$invalidate(11, filteredArticles = derived(articlesWithRefs, (stores) => {
          let articleProps = stores.map((articleWithRefs) => ({
            ...articleWithRefs,
            filteredOut: !data.filters.every((f) => !f.enabled || keepArticle(articleWithRefs, f.filter) !== f.inverted)
          }));
          if (data.hideFilteredOutArticles)
            articleProps = articleProps.filter((a) => !a.filteredOut);
          if (data.sortInfo.method)
            articleProps.sort(compare(data.sortInfo.method));
          if (data.sortInfo.reversed)
            articleProps.reverse();
          return articleProps;
        })));
    }
    if ($$self.$$.dirty[0] & 1) {
      $:
        $$invalidate(12, availableRefreshTypes = new Set(data.endpoints.flatMap((e) => {
          const endpoint = e.name !== void 0 ? getEndpoints()[e.name] : e.endpoint;
          return [...endpoint.refreshTypes.values()];
        })));
    }
    if ($$self.$$.dirty[0] & 1310849) {
      $:
        $$invalidate(13, containerProps = {
          articles: $filteredArticles,
          timelineArticleProps: {
            animatedAsGifs: data.animatedAsGifs,
            compact: data.compact,
            hideText: data.hideText,
            shouldLoadMedia: data.shouldLoadMedia,
            setModalTimeline
          },
          articleView: data.articleView,
          columnCount: data.columnCount,
          rebalanceTrigger: containerRebalance
        });
    }
  };
  return [
    data,
    favviewerButtons,
    favviewerHidden,
    showSidebar,
    fullscreen2,
    toggleFullscreen,
    removeTimeline,
    containerRebalance,
    showOptions,
    containerRef,
    articles,
    filteredArticles,
    availableRefreshTypes,
    containerProps,
    shuffle,
    autoscroll,
    refresh,
    sortOnce,
    setModalTimeline,
    articlesWithRefs,
    $filteredArticles,
    $articles,
    timelineheader_data_binding,
    timelineheader_availableRefreshTypes_binding,
    timelineheader_containerRebalance_binding,
    timelineheader_showSidebar_binding,
    timelineheader_showOptions_binding,
    timelineheader_favviewerButtons_binding,
    timelineheader_favviewerHidden_binding,
    timelineoptions_data_binding,
    switch_instance_containerRef_binding
  ];
}
var Timeline = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance34, create_fragment34, safe_not_equal, {
      data: 0,
      fullscreen: 4,
      toggleFullscreen: 5,
      removeTimeline: 6,
      setModalTimeline: 18,
      favviewerButtons: 1,
      favviewerHidden: 2,
      showSidebar: 3
    }, null, [-1, -1]);
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Timeline",
      options,
      id: create_fragment34.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("data" in props)) {
      console_12.warn("<Timeline> was created without expected prop 'data'");
    }
    if (ctx[4] === void 0 && !("fullscreen" in props)) {
      console_12.warn("<Timeline> was created without expected prop 'fullscreen'");
    }
    if (ctx[6] === void 0 && !("removeTimeline" in props)) {
      console_12.warn("<Timeline> was created without expected prop 'removeTimeline'");
    }
    if (ctx[18] === void 0 && !("setModalTimeline" in props)) {
      console_12.warn("<Timeline> was created without expected prop 'setModalTimeline'");
    }
  }
  get data() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set data(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get fullscreen() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set fullscreen(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get toggleFullscreen() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set toggleFullscreen(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get removeTimeline() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set removeTimeline(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get setModalTimeline() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set setModalTimeline(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get favviewerButtons() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set favviewerButtons(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get favviewerHidden() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set favviewerHidden(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get showSidebar() {
    throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set showSidebar(value) {
    throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Timeline_default = Timeline;

// src/timelines/TimelineContainer.svelte
var file34 = "src/timelines/TimelineContainer.svelte";
function get_each_context10(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[24] = list[i];
  child_ctx[26] = i;
  return child_ctx;
}
function create_if_block_310(ctx) {
  let modal;
  let updating_active;
  let current;
  function modal_active_binding(value) {
    ctx[11](value);
  }
  let modal_props = {
    $$slots: { default: [create_default_slot11] },
    $$scope: { ctx }
  };
  if (ctx[4] !== void 0) {
    modal_props.active = ctx[4];
  }
  modal = new Modal_default2({ props: modal_props, $$inline: true });
  binding_callbacks.push(() => bind(modal, "active", modal_active_binding));
  const block = {
    c: function create4() {
      create_component(modal.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(modal, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const modal_changes = {};
      if (dirty & 134217736) {
        modal_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_active && dirty & 16) {
        updating_active = true;
        modal_changes.active = ctx2[4];
        add_flush_callback(() => updating_active = false);
      }
      modal.$set(modal_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(modal.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(modal.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(modal, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_310.name,
    type: "if",
    source: "(40:1) {#if modalTimeline !== null}",
    ctx
  });
  return block;
}
function create_default_slot11(ctx) {
  let timeline;
  let current;
  timeline = new Timeline_default({
    props: {
      data: ctx[3],
      setModalTimeline: ctx[8],
      fullscreen: false,
      removeTimeline: ctx[10]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(timeline.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timeline, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const timeline_changes = {};
      if (dirty & 8)
        timeline_changes.data = ctx2[3];
      if (dirty & 8)
        timeline_changes.removeTimeline = ctx2[10];
      timeline.$set(timeline_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timeline.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timeline.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timeline, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_default_slot11.name,
    type: "slot",
    source: "(41:2) <Modal bind:active={modalTimelineActive}>",
    ctx
  });
  return block;
}
function create_else_block_13(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let current;
  let each_value = ctx[6];
  validate_each_argument(each_value);
  const get_key = (ctx2) => `${ctx2[24].name}/${ctx2[26]}`;
  validate_each_keys(ctx, each_value, get_each_context10, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context10(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block10(key, child_ctx));
  }
  const block = {
    c: function create4() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m: function mount(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert_dev(target, each_1_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if (dirty & 487) {
        each_value = ctx2[6];
        validate_each_argument(each_value);
        group_outros();
        validate_each_keys(ctx2, each_value, get_each_context10, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block10, each_1_anchor, get_each_context10);
        check_outros();
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d: function destroy(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach_dev(each_1_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block_13.name,
    type: "else",
    source: "(71:1) {:else}",
    ctx
  });
  return block;
}
function create_if_block24(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_118, create_else_block11];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (ctx2[5])
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type_1(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const block = {
    c: function create4() {
      if_block.c();
      if_block_anchor = empty();
    },
    m: function mount(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      if_block.p(ctx2, dirty);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block24.name,
    type: "if",
    source: "(50:1) {#if fullscreen !== undefined}",
    ctx
  });
  return block;
}
function create_else_block_22(ctx) {
  let timeline;
  let current;
  function func_7() {
    return ctx[22](ctx[26]);
  }
  function func_8() {
    return ctx[23](ctx[26]);
  }
  timeline = new Timeline_default({
    props: {
      data: ctx[24],
      setModalTimeline: ctx[8],
      fullscreen: false,
      removeTimeline: func_7,
      toggleFullscreen: func_8
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(timeline.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timeline, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const timeline_changes = {};
      if (dirty & 1)
        timeline_changes.toggleFullscreen = func_8;
      timeline.$set(timeline_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timeline.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timeline.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timeline, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block_22.name,
    type: "else",
    source: "(85:3) {:else}",
    ctx
  });
  return block;
}
function create_if_block_214(ctx) {
  let timeline;
  let updating_favviewerHidden;
  let updating_showSidebar;
  let current;
  function func_5() {
    return ctx[18](ctx[26]);
  }
  function func_6() {
    return ctx[19](ctx[26]);
  }
  function timeline_favviewerHidden_binding_1(value) {
    ctx[20](value);
  }
  function timeline_showSidebar_binding_1(value) {
    ctx[21](value);
  }
  let timeline_props = {
    favviewerButtons: "true",
    data: ctx[24],
    setModalTimeline: ctx[8],
    fullscreen: false,
    removeTimeline: func_5,
    toggleFullscreen: func_6
  };
  if (ctx[1] !== void 0) {
    timeline_props.favviewerHidden = ctx[1];
  }
  if (ctx[2] !== void 0) {
    timeline_props.showSidebar = ctx[2];
  }
  timeline = new Timeline_default({ props: timeline_props, $$inline: true });
  binding_callbacks.push(() => bind(timeline, "favviewerHidden", timeline_favviewerHidden_binding_1));
  binding_callbacks.push(() => bind(timeline, "showSidebar", timeline_showSidebar_binding_1));
  const block = {
    c: function create4() {
      create_component(timeline.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timeline, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const timeline_changes = {};
      if (dirty & 1)
        timeline_changes.toggleFullscreen = func_6;
      if (!updating_favviewerHidden && dirty & 2) {
        updating_favviewerHidden = true;
        timeline_changes.favviewerHidden = ctx[1];
        add_flush_callback(() => updating_favviewerHidden = false);
      }
      if (!updating_showSidebar && dirty & 4) {
        updating_showSidebar = true;
        timeline_changes.showSidebar = ctx[2];
        add_flush_callback(() => updating_showSidebar = false);
      }
      timeline.$set(timeline_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timeline.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timeline.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timeline, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_214.name,
    type: "if",
    source: "(74:3) {#if isInjected && i === 0}",
    ctx
  });
  return block;
}
function create_each_block10(key_1, ctx) {
  let first;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_214, create_else_block_22];
  const if_blocks = [];
  function select_block_type_2(ctx2, dirty) {
    if (ctx2[5] && ctx2[26] === 0)
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type_2(ctx, -1);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      if_block.c();
      if_block_anchor = empty();
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      if_blocks[current_block_type_index].m(target, anchor);
      insert_dev(target, if_block_anchor, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      if_block.p(ctx, dirty);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach_dev(if_block_anchor);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block10.name,
    type: "each",
    source: "(73:2) {#each timelines as data, i (`${data.name}",
    ctx
  });
  return block;
}
function create_else_block11(ctx) {
  let timeline;
  let current;
  timeline = new Timeline_default({
    props: {
      data: ctx[6][ctx[0]],
      setModalTimeline: ctx[8],
      fullscreen: true,
      removeTimeline: ctx[16],
      toggleFullscreen: ctx[17]
    },
    $$inline: true
  });
  const block = {
    c: function create4() {
      create_component(timeline.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timeline, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const timeline_changes = {};
      if (dirty & 1)
        timeline_changes.data = ctx2[6][ctx2[0]];
      if (dirty & 1)
        timeline_changes.removeTimeline = ctx2[16];
      if (dirty & 1)
        timeline_changes.toggleFullscreen = ctx2[17];
      timeline.$set(timeline_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timeline.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timeline.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timeline, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_else_block11.name,
    type: "else",
    source: "(62:2) {:else}",
    ctx
  });
  return block;
}
function create_if_block_118(ctx) {
  let timeline;
  let updating_favviewerHidden;
  let updating_showSidebar;
  let current;
  function timeline_favviewerHidden_binding(value) {
    ctx[14](value);
  }
  function timeline_showSidebar_binding(value) {
    ctx[15](value);
  }
  let timeline_props = {
    favviewerButtons: "true",
    data: ctx[6][ctx[0]],
    setModalTimeline: ctx[8],
    fullscreen: true,
    removeTimeline: ctx[12],
    toggleFullscreen: ctx[13]
  };
  if (ctx[1] !== void 0) {
    timeline_props.favviewerHidden = ctx[1];
  }
  if (ctx[2] !== void 0) {
    timeline_props.showSidebar = ctx[2];
  }
  timeline = new Timeline_default({ props: timeline_props, $$inline: true });
  binding_callbacks.push(() => bind(timeline, "favviewerHidden", timeline_favviewerHidden_binding));
  binding_callbacks.push(() => bind(timeline, "showSidebar", timeline_showSidebar_binding));
  const block = {
    c: function create4() {
      create_component(timeline.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(timeline, target, anchor);
      current = true;
    },
    p: function update3(ctx2, dirty) {
      const timeline_changes = {};
      if (dirty & 1)
        timeline_changes.data = ctx2[6][ctx2[0]];
      if (dirty & 1)
        timeline_changes.removeTimeline = ctx2[12];
      if (dirty & 1)
        timeline_changes.toggleFullscreen = ctx2[13];
      if (!updating_favviewerHidden && dirty & 2) {
        updating_favviewerHidden = true;
        timeline_changes.favviewerHidden = ctx2[1];
        add_flush_callback(() => updating_favviewerHidden = false);
      }
      if (!updating_showSidebar && dirty & 4) {
        updating_showSidebar = true;
        timeline_changes.showSidebar = ctx2[2];
        add_flush_callback(() => updating_showSidebar = false);
      }
      timeline.$set(timeline_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(timeline.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(timeline.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(timeline, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block_118.name,
    type: "if",
    source: "(51:2) {#if isInjected}",
    ctx
  });
  return block;
}
function create_fragment35(ctx) {
  let div;
  let t;
  let current_block_type_index;
  let if_block1;
  let current;
  let if_block0 = ctx[3] !== null && create_if_block_310(ctx);
  const if_block_creators = [create_if_block24, create_else_block_13];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0] !== void 0)
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx, -1);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const block = {
    c: function create4() {
      div = element("div");
      if (if_block0)
        if_block0.c();
      t = space();
      if_block1.c();
      attr_dev(div, "id", "timelineContainer");
      attr_dev(div, "class", "svelte-jai1i");
      add_location(div, file34, 38, 0, 1070);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      if (if_block0)
        if_block0.m(div, null);
      append_dev(div, t);
      if_blocks[current_block_type_index].m(div, null);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (ctx2[3] !== null) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 8) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_310(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div, t);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        } else {
          if_block1.p(ctx2, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(div, null);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o: function outro(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div);
      if (if_block0)
        if_block0.d();
      if_blocks[current_block_type_index].d();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment35.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance35($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("TimelineContainer", slots, []);
  let { initTimelines: initTimelines2 = [] } = $$props;
  let { fullscreen: fullscreen2 } = $$props;
  let { favviewerHidden } = $$props;
  let { showSidebar } = $$props;
  let modalTimeline = null;
  let modalTimelineActive = false;
  const isInjected = getContext("isInjected");
  let timelines = initTimelines2;
  function removeTimeline(index) {
    timelines.splice(index, 1);
  }
  function setModalTimeline(data) {
    $$invalidate(3, modalTimeline = { ...defaultTimeline(), ...data });
    $$invalidate(4, modalTimelineActive = true);
  }
  afterUpdate(() => {
    if (!modalTimelineActive)
      $$invalidate(3, modalTimeline = null);
  });
  const writable_props = ["initTimelines", "fullscreen", "favviewerHidden", "showSidebar"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<TimelineContainer> was created with unknown prop '${key}'`);
  });
  const func2 = () => $$invalidate(3, modalTimeline = null);
  function modal_active_binding(value) {
    modalTimelineActive = value;
    $$invalidate(4, modalTimelineActive);
  }
  const func_1 = () => removeTimeline(fullscreen2);
  const func_2 = () => $$invalidate(0, fullscreen2 = void 0);
  function timeline_favviewerHidden_binding(value) {
    favviewerHidden = value;
    $$invalidate(1, favviewerHidden);
  }
  function timeline_showSidebar_binding(value) {
    showSidebar = value;
    $$invalidate(2, showSidebar);
  }
  const func_3 = () => removeTimeline(fullscreen2);
  const func_4 = () => $$invalidate(0, fullscreen2 = void 0);
  const func_5 = (i) => removeTimeline(i);
  const func_6 = (i) => $$invalidate(0, fullscreen2 = i);
  function timeline_favviewerHidden_binding_1(value) {
    favviewerHidden = value;
    $$invalidate(1, favviewerHidden);
  }
  function timeline_showSidebar_binding_1(value) {
    showSidebar = value;
    $$invalidate(2, showSidebar);
  }
  const func_7 = (i) => removeTimeline(i);
  const func_8 = (i) => $$invalidate(0, fullscreen2 = i);
  $$self.$$set = ($$props2) => {
    if ("initTimelines" in $$props2)
      $$invalidate(9, initTimelines2 = $$props2.initTimelines);
    if ("fullscreen" in $$props2)
      $$invalidate(0, fullscreen2 = $$props2.fullscreen);
    if ("favviewerHidden" in $$props2)
      $$invalidate(1, favviewerHidden = $$props2.favviewerHidden);
    if ("showSidebar" in $$props2)
      $$invalidate(2, showSidebar = $$props2.showSidebar);
  };
  $$self.$capture_state = () => ({
    Timeline: Timeline_default,
    afterUpdate,
    getContext,
    Modal: Modal_default2,
    defaultTimeline,
    initTimelines: initTimelines2,
    fullscreen: fullscreen2,
    favviewerHidden,
    showSidebar,
    modalTimeline,
    modalTimelineActive,
    isInjected,
    timelines,
    removeTimeline,
    setModalTimeline
  });
  $$self.$inject_state = ($$props2) => {
    if ("initTimelines" in $$props2)
      $$invalidate(9, initTimelines2 = $$props2.initTimelines);
    if ("fullscreen" in $$props2)
      $$invalidate(0, fullscreen2 = $$props2.fullscreen);
    if ("favviewerHidden" in $$props2)
      $$invalidate(1, favviewerHidden = $$props2.favviewerHidden);
    if ("showSidebar" in $$props2)
      $$invalidate(2, showSidebar = $$props2.showSidebar);
    if ("modalTimeline" in $$props2)
      $$invalidate(3, modalTimeline = $$props2.modalTimeline);
    if ("modalTimelineActive" in $$props2)
      $$invalidate(4, modalTimelineActive = $$props2.modalTimelineActive);
    if ("timelines" in $$props2)
      $$invalidate(6, timelines = $$props2.timelines);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    fullscreen2,
    favviewerHidden,
    showSidebar,
    modalTimeline,
    modalTimelineActive,
    isInjected,
    timelines,
    removeTimeline,
    setModalTimeline,
    initTimelines2,
    func2,
    modal_active_binding,
    func_1,
    func_2,
    timeline_favviewerHidden_binding,
    timeline_showSidebar_binding,
    func_3,
    func_4,
    func_5,
    func_6,
    timeline_favviewerHidden_binding_1,
    timeline_showSidebar_binding_1,
    func_7,
    func_8
  ];
}
var TimelineContainer = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance35, create_fragment35, safe_not_equal, {
      initTimelines: 9,
      fullscreen: 0,
      favviewerHidden: 1,
      showSidebar: 2
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "TimelineContainer",
      options,
      id: create_fragment35.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("fullscreen" in props)) {
      console.warn("<TimelineContainer> was created without expected prop 'fullscreen'");
    }
    if (ctx[1] === void 0 && !("favviewerHidden" in props)) {
      console.warn("<TimelineContainer> was created without expected prop 'favviewerHidden'");
    }
    if (ctx[2] === void 0 && !("showSidebar" in props)) {
      console.warn("<TimelineContainer> was created without expected prop 'showSidebar'");
    }
  }
  get initTimelines() {
    throw new Error("<TimelineContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set initTimelines(value) {
    throw new Error("<TimelineContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get fullscreen() {
    throw new Error("<TimelineContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set fullscreen(value) {
    throw new Error("<TimelineContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get favviewerHidden() {
    throw new Error("<TimelineContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set favviewerHidden(value) {
    throw new Error("<TimelineContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get showSidebar() {
    throw new Error("<TimelineContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set showSidebar(value) {
    throw new Error("<TimelineContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var TimelineContainer_default = TimelineContainer;

// src/notifications/store.ts
var { subscribe: subscribe2, set, update: update2 } = writable({});
var ids;
var localUnsubscribe = subscribe2((value) => ids = Object.keys(value));
var notifications = {
  subscribe: subscribe2,
  notify(notif, id) {
    const actualId = id ?? generateId();
    update2((prev) => {
      prev[actualId] = notif;
      return prev;
    });
  },
  delete(id) {
    update2((prev) => {
      delete prev[id];
      return prev;
    });
  }
};
function generateId() {
  let i = 0;
  let id = "Generated0";
  for (let i2 = 1; ids.includes(id); ++i2)
    id = "Generated" + i2;
  return id;
}

// src/notifications/Notification.svelte
var file35 = "src/notifications/Notification.svelte";
function create_fragment36(ctx) {
  let div1;
  let button;
  let t0;
  let div0;
  let span;
  let t1_value = ctx[0].text + "";
  let t1;
  let mounted;
  let dispose;
  const block = {
    c: function create4() {
      div1 = element("div");
      button = element("button");
      t0 = space();
      div0 = element("div");
      span = element("span");
      t1 = text(t1_value);
      attr_dev(button, "class", "delete");
      add_location(button, file35, 6, 1, 130);
      add_location(span, file35, 8, 2, 228);
      attr_dev(div0, "class", "block");
      add_location(div0, file35, 7, 1, 206);
      attr_dev(div1, "class", "notification");
      add_location(div1, file35, 5, 0, 102);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, button);
      append_dev(div1, t0);
      append_dev(div1, div0);
      append_dev(div0, span);
      append_dev(span, t1);
      if (!mounted) {
        dispose = listen_dev(button, "click", ctx[2], false, false, false);
        mounted = true;
      }
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].text + ""))
        set_data_dev(t1, t1_value);
    },
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      mounted = false;
      dispose();
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment36.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance36($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("Notification", slots, []);
  let { data } = $$props;
  let { id } = $$props;
  const writable_props = ["data", "id"];
  Object.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<Notification> was created with unknown prop '${key}'`);
  });
  const click_handler = () => notifications.delete(id);
  $$self.$$set = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(0, data = $$props2.data);
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
  };
  $$self.$capture_state = () => ({ notifications, data, id });
  $$self.$inject_state = ($$props2) => {
    if ("data" in $$props2)
      $$invalidate(0, data = $$props2.data);
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [data, id, click_handler];
}
var Notification2 = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance36, create_fragment36, safe_not_equal, { data: 0, id: 1 });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "Notification",
      options,
      id: create_fragment36.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[0] === void 0 && !("data" in props)) {
      console.warn("<Notification> was created without expected prop 'data'");
    }
    if (ctx[1] === void 0 && !("id" in props)) {
      console.warn("<Notification> was created without expected prop 'id'");
    }
  }
  get data() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set data(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get id() {
    throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set id(value) {
    throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var Notification_default3 = Notification2;

// src/SoshalThing.svelte
var { Object: Object_14 } = globals;
var file36 = "src/SoshalThing.svelte";
function get_each_context11(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i][0];
  child_ctx[9] = list[i][1];
  return child_ctx;
}
function create_each_block11(key_1, ctx) {
  let first;
  let notification;
  let current;
  notification = new Notification_default3({
    props: {
      data: ctx[9],
      id: ctx[8]
    },
    $$inline: true
  });
  const block = {
    key: key_1,
    first: null,
    c: function create4() {
      first = empty();
      create_component(notification.$$.fragment);
      this.first = first;
    },
    m: function mount(target, anchor) {
      insert_dev(target, first, anchor);
      mount_component(notification, target, anchor);
      current = true;
    },
    p: function update3(new_ctx, dirty) {
      ctx = new_ctx;
      const notification_changes = {};
      if (dirty & 32)
        notification_changes.data = ctx[9];
      if (dirty & 32)
        notification_changes.id = ctx[8];
      notification.$set(notification_changes);
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(notification.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(notification.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(first);
      destroy_component(notification, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_each_block11.name,
    type: "each",
    source: "(32:2) {#each Object.entries($notifications) as [id, notif] (id)}",
    ctx
  });
  return block;
}
function create_if_block25(ctx) {
  let sidebar;
  let current;
  sidebar = new Sidebar_default({ $$inline: true });
  const block = {
    c: function create4() {
      create_component(sidebar.$$.fragment);
    },
    m: function mount(target, anchor) {
      mount_component(sidebar, target, anchor);
      current = true;
    },
    i: function intro(local) {
      if (current)
        return;
      transition_in(sidebar.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      transition_out(sidebar.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      destroy_component(sidebar, detaching);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_if_block25.name,
    type: "if",
    source: "(36:1) {#if showSidebar}",
    ctx
  });
  return block;
}
function create_fragment37(ctx) {
  let div1;
  let div0;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let t1;
  let timelinecontainer;
  let updating_favviewerHidden;
  let updating_showSidebar;
  let current;
  let each_value = Object.entries(ctx[5]);
  validate_each_argument(each_value);
  const get_key = (ctx2) => ctx2[8];
  validate_each_keys(ctx, each_value, get_each_context11, get_key);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context11(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block11(key, child_ctx));
  }
  let if_block = ctx[4] && create_if_block25(ctx);
  function timelinecontainer_favviewerHidden_binding(value) {
    ctx[6](value);
  }
  function timelinecontainer_showSidebar_binding(value) {
    ctx[7](value);
  }
  let timelinecontainer_props = {
    initTimelines: ctx[1],
    fullscreen: ctx[2]
  };
  if (ctx[0] !== void 0) {
    timelinecontainer_props.favviewerHidden = ctx[0];
  }
  if (ctx[4] !== void 0) {
    timelinecontainer_props.showSidebar = ctx[4];
  }
  timelinecontainer = new TimelineContainer_default({
    props: timelinecontainer_props,
    $$inline: true
  });
  binding_callbacks.push(() => bind(timelinecontainer, "favviewerHidden", timelinecontainer_favviewerHidden_binding));
  binding_callbacks.push(() => bind(timelinecontainer, "showSidebar", timelinecontainer_showSidebar_binding));
  const block = {
    c: function create4() {
      div1 = element("div");
      div0 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      if (if_block)
        if_block.c();
      t1 = space();
      create_component(timelinecontainer.$$.fragment);
      attr_dev(div0, "id", "soshalNotifications");
      attr_dev(div0, "class", "svelte-1to0gk8");
      add_location(div0, file36, 30, 1, 794);
      attr_dev(div1, "class", "soshalthing svelte-1to0gk8");
      toggle_class(div1, "injected", ctx[3]);
      add_location(div1, file36, 29, 0, 739);
    },
    l: function claim(nodes) {
      throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    },
    m: function mount(target, anchor) {
      insert_dev(target, div1, anchor);
      append_dev(div1, div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div0, null);
      }
      append_dev(div1, t0);
      if (if_block)
        if_block.m(div1, null);
      append_dev(div1, t1);
      mount_component(timelinecontainer, div1, null);
      current = true;
    },
    p: function update3(ctx2, [dirty]) {
      if (dirty & 32) {
        each_value = Object.entries(ctx2[5]);
        validate_each_argument(each_value);
        group_outros();
        validate_each_keys(ctx2, each_value, get_each_context11, get_key);
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block11, null, get_each_context11);
        check_outros();
      }
      if (ctx2[4]) {
        if (if_block) {
          if (dirty & 16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block25(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div1, t1);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const timelinecontainer_changes = {};
      if (dirty & 2)
        timelinecontainer_changes.initTimelines = ctx2[1];
      if (dirty & 4)
        timelinecontainer_changes.fullscreen = ctx2[2];
      if (!updating_favviewerHidden && dirty & 1) {
        updating_favviewerHidden = true;
        timelinecontainer_changes.favviewerHidden = ctx2[0];
        add_flush_callback(() => updating_favviewerHidden = false);
      }
      if (!updating_showSidebar && dirty & 16) {
        updating_showSidebar = true;
        timelinecontainer_changes.showSidebar = ctx2[4];
        add_flush_callback(() => updating_showSidebar = false);
      }
      timelinecontainer.$set(timelinecontainer_changes);
      if (dirty & 8) {
        toggle_class(div1, "injected", ctx2[3]);
      }
    },
    i: function intro(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(if_block);
      transition_in(timelinecontainer.$$.fragment, local);
      current = true;
    },
    o: function outro(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(if_block);
      transition_out(timelinecontainer.$$.fragment, local);
      current = false;
    },
    d: function destroy(detaching) {
      if (detaching)
        detach_dev(div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      if (if_block)
        if_block.d();
      destroy_component(timelinecontainer);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block,
    id: create_fragment37.name,
    type: "component",
    source: "",
    ctx
  });
  return block;
}
function instance37($$self, $$props, $$invalidate) {
  let $notifications;
  validate_store(notifications, "notifications");
  component_subscribe($$self, notifications, ($$value) => $$invalidate(5, $notifications = $$value));
  let { $$slots: slots = {}, $$scope } = $$props;
  validate_slots("SoshalThing", slots, []);
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
  let { initTimelines: initTimelines2 } = $$props;
  let { fullscreen: fullscreen2 } = $$props;
  let { isInjected = true } = $$props;
  let { favviewerHidden = false } = $$props;
  setContext("isInjected", isInjected);
  let showSidebar = !isInjected;
  const writable_props = ["initTimelines", "fullscreen", "isInjected", "favviewerHidden"];
  Object_14.keys($$props).forEach((key) => {
    if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
      console.warn(`<SoshalThing> was created with unknown prop '${key}'`);
  });
  function timelinecontainer_favviewerHidden_binding(value) {
    favviewerHidden = value;
    $$invalidate(0, favviewerHidden);
  }
  function timelinecontainer_showSidebar_binding(value) {
    showSidebar = value;
    $$invalidate(4, showSidebar);
  }
  $$self.$$set = ($$props2) => {
    if ("initTimelines" in $$props2)
      $$invalidate(1, initTimelines2 = $$props2.initTimelines);
    if ("fullscreen" in $$props2)
      $$invalidate(2, fullscreen2 = $$props2.fullscreen);
    if ("isInjected" in $$props2)
      $$invalidate(3, isInjected = $$props2.isInjected);
    if ("favviewerHidden" in $$props2)
      $$invalidate(0, favviewerHidden = $$props2.favviewerHidden);
  };
  $$self.$capture_state = () => ({
    setContext,
    Sidebar: Sidebar_default,
    TimelineContainer: TimelineContainer_default,
    notifications,
    Notification: Notification_default3,
    initTimelines: initTimelines2,
    fullscreen: fullscreen2,
    isInjected,
    favviewerHidden,
    showSidebar,
    $notifications
  });
  $$self.$inject_state = ($$props2) => {
    if ("initTimelines" in $$props2)
      $$invalidate(1, initTimelines2 = $$props2.initTimelines);
    if ("fullscreen" in $$props2)
      $$invalidate(2, fullscreen2 = $$props2.fullscreen);
    if ("isInjected" in $$props2)
      $$invalidate(3, isInjected = $$props2.isInjected);
    if ("favviewerHidden" in $$props2)
      $$invalidate(0, favviewerHidden = $$props2.favviewerHidden);
    if ("showSidebar" in $$props2)
      $$invalidate(4, showSidebar = $$props2.showSidebar);
  };
  if ($$props && "$$inject" in $$props) {
    $$self.$inject_state($$props.$$inject);
  }
  return [
    favviewerHidden,
    initTimelines2,
    fullscreen2,
    isInjected,
    showSidebar,
    $notifications,
    timelinecontainer_favviewerHidden_binding,
    timelinecontainer_showSidebar_binding
  ];
}
var SoshalThing = class extends SvelteComponentDev {
  constructor(options) {
    super(options);
    init(this, options, instance37, create_fragment37, safe_not_equal, {
      initTimelines: 1,
      fullscreen: 2,
      isInjected: 3,
      favviewerHidden: 0
    });
    dispatch_dev("SvelteRegisterComponent", {
      component: this,
      tagName: "SoshalThing",
      options,
      id: create_fragment37.name
    });
    const { ctx } = this.$$;
    const props = options.props || {};
    if (ctx[1] === void 0 && !("initTimelines" in props)) {
      console.warn("<SoshalThing> was created without expected prop 'initTimelines'");
    }
    if (ctx[2] === void 0 && !("fullscreen" in props)) {
      console.warn("<SoshalThing> was created without expected prop 'fullscreen'");
    }
  }
  get initTimelines() {
    throw new Error("<SoshalThing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set initTimelines(value) {
    throw new Error("<SoshalThing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get fullscreen() {
    throw new Error("<SoshalThing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set fullscreen(value) {
    throw new Error("<SoshalThing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get isInjected() {
    throw new Error("<SoshalThing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set isInjected(value) {
    throw new Error("<SoshalThing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  get favviewerHidden() {
    throw new Error("<SoshalThing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
  set favviewerHidden(value) {
    throw new Error("<SoshalThing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  }
};
var SoshalThing_default = SoshalThing;

// src/entry.ts
var { fullscreen: storageFullscreen } = loadMainStorage();
var initTimelines = loadTimelines();
var searchParams = new URLSearchParams(location.search);
var fullscreen = parseFullscreen(searchParams) ?? storageFullscreen;
new SoshalThing_default({
  target: document.body,
  props: {
    isInjected: false,
    initTimelines,
    fullscreen
  }
});
function parseFullscreen(search) {
  const param = search.get("fullscreen_timeline");
  switch (param) {
    case null:
    case "false":
      return void 0;
    case "":
    case "true":
    case "0":
      return 0;
  }
  const num = parseInt(param);
  if (isNaN(num))
    return void 0;
  return num;
}
/*!
 * Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2022 Fonticons, Inc.
 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */