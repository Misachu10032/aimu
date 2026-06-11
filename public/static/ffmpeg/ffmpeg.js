const workerCode = `!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.FFmpegWASM=t():e.FFmpegWASM=t()}(self,(()=>(()=>{"use strict";const e="https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js";var t;!function(e){e.LOAD="LOAD",e.EXEC="EXEC",e.WRITE_FILE="WRITE_FILE",e.READ_FILE="READ_FILE",e.DELETE_FILE="DELETE_FILE",e.RENAME="RENAME",e.CREATE_DIR="CREATE_DIR",e.LIST_DIR="LIST_DIR",e.DELETE_DIR="DELETE_DIR",e.ERROR="ERROR",e.DOWNLOAD="DOWNLOAD",e.PROGRESS="PROGRESS",e.LOG="LOG",e.MOUNT="MOUNT",e.UNMOUNT="UNMOUNT"}(t||(t={}));const r=new Error("unknown message type"),a=new Error("ffmpeg is not loaded, call await ffmpeg.load() first"),s=(new Error("called FFmpeg.terminate()"),new Error("failed to import ffmpeg-core.js"));let o;return self.onmessage=async({data:{id:n,type:E,data:c}})=>{const i=[];let p;try{if(E!==t.LOAD&&!o)throw a;switch(E){case t.LOAD:p=await(async({coreURL:r,wasmURL:a,workerURL:n})=>{const E=!o;try{r||(r=e),importScripts(r)}catch{if(r||(r=e.replace("/umd/","/esm/")),self.createFFmpegCore=(await import(r)).default,!self.createFFmpegCore)throw s}const c=r,i=a||r.replace(/.js$/g,".wasm"),p=n||r.replace(/.js$/g,".worker.js");return o=await self.createFFmpegCore({mainScriptUrlOrBlob:c + '#' + btoa(JSON.stringify({ wasmURL: i, workerURL: p }))}),o.setLogger((e=>self.postMessage({type:t.LOG,data:e}))),o.setProgress((e=>self.postMessage({type:t.PROGRESS,data:e}))),E})(c);break;case t.EXEC:p=(({args:e,timeout:t=-1})=>{o.setTimeout(t),o.exec(...e);const r=o.ret;return o.reset(),r})(c);break;case t.WRITE_FILE:p=(({path:e,data:t})=>(o.FS.writeFile(e,t),!0))(c);break;case t.READ_FILE:p=(({path:e,encoding:t})=>o.FS.readFile(e,{encoding:t}))(c);break;case t.DELETE_FILE:p=(({path:e})=>(o.FS.unlink(e),!0))(c);break;case t.RENAME:p=(({oldPath:e,newPath:t})=>(o.FS.rename(e,t),!0))(c);break;case t.CREATE_DIR:p=(({path:e})=>(o.FS.mkdir(e),!0))(c);break;case t.LIST_DIR:p=(({path:e})=>{const t=o.FS.readdir(e),r=[];for(const a of t){const t=o.FS.stat(e + '/' + a),s=o.FS.isDir(t.mode);r.push({name:a,isDir:s})}return r})(c);break;case t.DELETE_DIR:p=(({path:e})=>(o.FS.rmdir(e),!0))(c);break;case t.MOUNT:p=(({fsType:e,options:t,mountPoint:r})=>{const a=e,s=o.FS.filesystems[a];return!!s&&(o.FS.mount(s,t,r),!0)})(c);break;case t.UNMOUNT:p=(({mountPoint:e})=>(o.FS.unmount(e),!0))(c);break;default:throw r}}catch(e){return void self.postMessage({id:n,type:t.ERROR,data:e.toString()})}p instanceof Uint8Array&&i.push(p.buffer),self.postMessage({id:n,type:E,data:p},i)},{}})()));`;
const blob = new Blob([workerCode], { type: 'text/javascript' });
const workerUrl = URL.createObjectURL(blob);

!(function (e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
      ? define([], t)
      : 'object' == typeof exports
        ? (exports.FFmpegWASM = t())
        : (e.FFmpegWASM = t());
})(self, () =>
  (() => {
    'use strict';
    var e = {
      m: {},
      d: (t, s) => {
        for (var r in s)
          e.o(s, r) &&
            !e.o(t, r) &&
            Object.defineProperty(t, r, { enumerable: !0, get: s[r] });
      },
      u: (e) => e + '.ffmpeg.js',
    };
    ((e.g = (function () {
      if ('object' == typeof globalThis) return globalThis;
      try {
        return this || new Function('return this')();
      } catch (e) {
        if ('object' == typeof window) return window;
      }
    })()),
      (e.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
      (e.r = (e) => {
        ('undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(e, '__esModule', { value: !0 }));
      }),
      (() => {
        var t;
        e.g.importScripts && (t = e.g.location + '');
        var s = e.g.document;
        if (!t && s && (s.currentScript && (t = s.currentScript.src), !t)) {
          var r = s.getElementsByTagName('script');
          if (r.length)
            for (var a = r.length - 1; a > -1 && !t; ) t = r[a--].src;
        }
        if (!t)
          throw new Error(
            'Automatic publicPath is not supported in this browser',
          );
        ((t = t
          .replace(/#.*$/, '')
          .replace(/\?.*$/, '')
          .replace(/\/[^\/]+$/, '/')),
          (e.p = t));
      })(),
      (e.b = document.baseURI || self.location.href));
    var t,
      s = {};
    (e.r(s),
      e.d(s, { FFmpeg: () => i }),
      (function (e) {
        ((e.LOAD = 'LOAD'),
          (e.EXEC = 'EXEC'),
          (e.WRITE_FILE = 'WRITE_FILE'),
          (e.READ_FILE = 'READ_FILE'),
          (e.DELETE_FILE = 'DELETE_FILE'),
          (e.RENAME = 'RENAME'),
          (e.CREATE_DIR = 'CREATE_DIR'),
          (e.LIST_DIR = 'LIST_DIR'),
          (e.DELETE_DIR = 'DELETE_DIR'),
          (e.ERROR = 'ERROR'),
          (e.DOWNLOAD = 'DOWNLOAD'),
          (e.PROGRESS = 'PROGRESS'),
          (e.LOG = 'LOG'),
          (e.MOUNT = 'MOUNT'),
          (e.UNMOUNT = 'UNMOUNT'));
      })(t || (t = {})));
    const r = (() => {
        let e = 0;
        return () => e++;
      })(),
      a =
        (new Error('unknown message type'),
        new Error('ffmpeg is not loaded, call `await ffmpeg.load()` first')),
      o = new Error('called FFmpeg.terminate()');
    new Error('failed to import ffmpeg-core.js');
    class i {
      #e = null;
      #t = {};
      #s = {};
      #r = [];
      #a = [];
      loaded = !1;
      #o = () => {
        this.#e &&
          (this.#e.onmessage = ({ data: { id: e, type: s, data: r } }) => {
            switch (s) {
              case t.LOAD:
                ((this.loaded = !0), this.#t[e](r));
                break;
              case t.MOUNT:
              case t.UNMOUNT:
              case t.EXEC:
              case t.WRITE_FILE:
              case t.READ_FILE:
              case t.DELETE_FILE:
              case t.RENAME:
              case t.CREATE_DIR:
              case t.LIST_DIR:
              case t.DELETE_DIR:
                this.#t[e](r);
                break;
              case t.LOG:
                this.#r.forEach((e) => e(r));
                break;
              case t.PROGRESS:
                this.#a.forEach((e) => e(r));
                break;
              case t.ERROR:
                this.#s[e](r);
            }
            (delete this.#t[e], delete this.#s[e]);
          });
      };
      #i = ({ type: e, data: t }, s = [], o) =>
        this.#e
          ? new Promise((a, i) => {
              const n = r();
              (this.#e && this.#e.postMessage({ id: n, type: e, data: t }, s),
                (this.#t[n] = a),
                (this.#s[n] = i),
                o?.addEventListener(
                  'abort',
                  () => {
                    i(
                      new DOMException(
                        `Message # ${n} was aborted`,
                        'AbortError',
                      ),
                    );
                  },
                  { once: !0 },
                ));
            })
          : Promise.reject(a);
      on(e, t) {
        'log' === e ? this.#r.push(t) : 'progress' === e && this.#a.push(t);
      }
      off(e, t) {
        'log' === e
          ? (this.#r = this.#r.filter((e) => e !== t))
          : 'progress' === e && (this.#a = this.#a.filter((e) => e !== t));
      }
      load = ({ classWorkerURL: s, ...r } = {}, { signal: a } = {}) => (
        this.#e ||
          ((this.#e = s
            ? new Worker(
                new URL(
                  s,
                  'file:///home/jeromewu/ffmpeg.wasm/packages/ffmpeg/dist/esm/classes.js',
                ),
                { type: 'module' },
              )
            : new Worker(workerUrl, { type: void 0 })),
          this.#o()),
        this.#i({ type: t.LOAD, data: r }, void 0, a)
      );
      exec = (e, s = -1, { signal: r } = {}) =>
        this.#i({ type: t.EXEC, data: { args: e, timeout: s } }, void 0, r);
      terminate = () => {
        const e = Object.keys(this.#s);
        for (const t of e)
          (this.#s[t](o), delete this.#s[t], delete this.#t[t]);
        this.#e && (this.#e.terminate(), (this.#e = null), (this.loaded = !1));
      };
      writeFile = (e, s, { signal: r } = {}) => {
        const a = [];
        return (
          s instanceof Uint8Array && a.push(s.buffer),
          this.#i({ type: t.WRITE_FILE, data: { path: e, data: s } }, a, r)
        );
      };
      mount = (e, s, r) =>
        this.#i(
          { type: t.MOUNT, data: { fsType: e, options: s, mountPoint: r } },
          [],
        );
      unmount = (e) =>
        this.#i({ type: t.UNMOUNT, data: { mountPoint: e } }, []);
      readFile = (e, s = 'binary', { signal: r } = {}) =>
        this.#i(
          { type: t.READ_FILE, data: { path: e, encoding: s } },
          void 0,
          r,
        );
      deleteFile = (e, { signal: s } = {}) =>
        this.#i({ type: t.DELETE_FILE, data: { path: e } }, void 0, s);
      rename = (e, s, { signal: r } = {}) =>
        this.#i(
          { type: t.RENAME, data: { oldPath: e, newPath: s } },
          void 0,
          r,
        );
      createDir = (e, { signal: s } = {}) =>
        this.#i({ type: t.CREATE_DIR, data: { path: e } }, void 0, s);
      listDir = (e, { signal: s } = {}) =>
        this.#i({ type: t.LIST_DIR, data: { path: e } }, void 0, s);
      deleteDir = (e, { signal: s } = {}) =>
        this.#i({ type: t.DELETE_DIR, data: { path: e } }, void 0, s);
    }
    return s;
  })(),
);
