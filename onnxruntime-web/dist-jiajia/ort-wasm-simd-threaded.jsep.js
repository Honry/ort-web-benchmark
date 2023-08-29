/*!
 * ONNX Runtime Web v1.16.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var _scriptDir,e=(_scriptDir="undefined"!=typeof document&&document.currentScript?document.currentScript.src:void 0,"undefined"!=typeof __filename&&(_scriptDir=_scriptDir||__filename),function(e={}){function r(){return R.buffer!=D.buffer&&U(),D}function t(){return R.buffer!=D.buffer&&U(),H}function a(){return R.buffer!=D.buffer&&U(),N}function n(){return R.buffer!=D.buffer&&U(),P}function o(){return R.buffer!=D.buffer&&U(),F}var i,s,u=e;u.ready=new Promise(((e,r)=>{i=e,s=r})),u.jsepInit=function(e,r,t,a,n,o,i,s){u.Ib=e,u.ob=r,u.qb=t,u.ab=a,u.pb=n,u.xa=o,u.rb=i,u.sb=s};var f,l,c,d=Object.assign({},u),p="./this.program",m=(e,r)=>{throw r},h="object"==typeof window,b="function"==typeof importScripts,y="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,g=u.ENVIRONMENT_IS_PTHREAD||!1,v="";function _(e){return u.locateFile?u.locateFile(e,v):v+e}if(y){var x=require("fs"),w=require("path");let e;v=b?w.dirname(v)+"/":__dirname+"/",f=(e,r)=>(e=e.startsWith("file://")?new URL(e):w.normalize(e),x.readFileSync(e,r?void 0:"utf8")),c=e=>((e=f(e,!0)).buffer||(e=new Uint8Array(e)),e),l=(e,r,t,a=!0)=>{e=e.startsWith("file://")?new URL(e):w.normalize(e),x.readFile(e,a?void 0:"utf8",((e,n)=>{e?t(e):r(a?n.buffer:n)}))},!u.thisProgram&&1<process.argv.length&&(p=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),m=(e,r)=>{throw process.exitCode=e,r},u.inspect=()=>"[Emscripten Module object]";try{e=require("worker_threads")}catch(e){throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'),e}global.Worker=e.Worker}else(h||b)&&(b?v=self.location.href:"undefined"!=typeof document&&document.currentScript&&(v=document.currentScript.src),_scriptDir&&(v=_scriptDir),v=0!==v.indexOf("blob:")?v.substr(0,v.replace(/[?#].*/,"").lastIndexOf("/")+1):"",y||(f=e=>{var r=new XMLHttpRequest;return r.open("GET",e,!1),r.send(null),r.responseText},b&&(c=e=>{var r=new XMLHttpRequest;return r.open("GET",e,!1),r.responseType="arraybuffer",r.send(null),new Uint8Array(r.response)}),l=(e,r,t)=>{var a=new XMLHttpRequest;a.open("GET",e,!0),a.responseType="arraybuffer",a.onload=()=>{200==a.status||0==a.status&&a.response?r(a.response):t()},a.onerror=t,a.send(null)}));y&&"undefined"==typeof performance&&(global.performance=require("perf_hooks").performance);var A=console.log.bind(console),C=console.error.bind(console);y&&(A=(...e)=>x.writeSync(1,e.join(" ")+"\n"),C=(...e)=>x.writeSync(2,e.join(" ")+"\n"));var S,O=u.print||A,T=u.printErr||C;Object.assign(u,d),d=null,u.thisProgram&&(p=u.thisProgram),u.quit&&(m=u.quit),u.wasmBinary&&(S=u.wasmBinary);var M=u.noExitRuntime||!0;"object"!=typeof WebAssembly&&Z("no native wasm support detected");var R,W,E,k,D,H,N,P,F,I=!1;function U(){var e=R.buffer;u.HEAP8=D=new Int8Array(e),u.HEAP16=new Int16Array(e),u.HEAP32=N=new Int32Array(e),u.HEAPU8=H=new Uint8Array(e),u.HEAPU16=new Uint16Array(e),u.HEAPU32=P=new Uint32Array(e),u.HEAPF32=new Float32Array(e),u.HEAPF64=F=new Float64Array(e)}var Y=u.INITIAL_MEMORY||16777216;if(5242880<=Y||Z("INITIAL_MEMORY should be larger than STACK_SIZE, was "+Y+"! (STACK_SIZE=5242880)"),g)R=u.wasmMemory;else if(u.wasmMemory)R=u.wasmMemory;else if(!((R=new WebAssembly.Memory({initial:Y/65536,maximum:65536,shared:!0})).buffer instanceof SharedArrayBuffer))throw T("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),y&&T("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"),Error("bad memory");U(),Y=R.buffer.byteLength;var L=[],j=[],B=[],G=0;function z(){return M||0<G}var q,J=0,V=null,$=null;function X(){J++,u.monitorRunDependencies&&u.monitorRunDependencies(J)}function Q(){if(J--,u.monitorRunDependencies&&u.monitorRunDependencies(J),0==J&&(null!==V&&(clearInterval(V),V=null),$)){var e=$;$=null,e()}}function Z(e){throw u.onAbort&&u.onAbort(e),T(e="Aborted("+e+")"),I=!0,k=1,e=new WebAssembly.RuntimeError(e+". Build with -sASSERTIONS for more info."),s(e),e}function K(e){return e.startsWith("data:application/octet-stream;base64,")}function ee(e){if(e==q&&S)return new Uint8Array(S);if(c)return c(e);throw"both async and sync fetching of the wasm failed"}function re(e,r,t){return function(e){if(!S&&(h||b)){if("function"==typeof fetch&&!e.startsWith("file://"))return fetch(e,{credentials:"same-origin"}).then((r=>{if(!r.ok)throw"failed to load wasm binary file at '"+e+"'";return r.arrayBuffer()})).catch((()=>ee(e)));if(l)return new Promise(((r,t)=>{l(e,(e=>r(new Uint8Array(e))),t)}))}return Promise.resolve().then((()=>ee(e)))}(e).then((e=>WebAssembly.instantiate(e,r))).then((e=>e)).then(t,(e=>{T("failed to asynchronously prepare wasm: "+e),Z(e)}))}K(q="ort-wasm-simd-threaded.wasm")||(q=_(q));var te,ae={893084:()=>{u.jsepRunPromise=new Promise((function(e){u.tb=e}))},893179:e=>{u.tb(e)},893217:e=>u.ob(e),893250:e=>u.qb(e),893282:(e,r,t)=>{u.ab(e,r,t,!0)},893321:(e,r,t)=>{u.ab(e,r,t)},893354:e=>{u.xa("Abs",e,void 0)},893405:e=>{u.xa("Neg",e,void 0)},893456:e=>{u.xa("Floor",e,void 0)},893509:e=>{u.xa("Ceil",e,void 0)},893561:e=>{u.xa("Reciprocal",e,void 0)},893619:e=>{u.xa("Sqrt",e,void 0)},893671:e=>{u.xa("Exp",e,void 0)},893722:e=>{u.xa("Erf",e,void 0)},893773:e=>{u.xa("Sigmoid",e,void 0)},893828:e=>{u.xa("Log",e,void 0)},893879:e=>{u.xa("Sin",e,void 0)},893930:e=>{u.xa("Cos",e,void 0)},893981:e=>{u.xa("Tan",e,void 0)},894032:e=>{u.xa("Asin",e,void 0)},894084:e=>{u.xa("Acos",e,void 0)},894136:e=>{u.xa("Atan",e,void 0)},894188:e=>{u.xa("Sinh",e,void 0)},894240:e=>{u.xa("Cosh",e,void 0)},894292:e=>{u.xa("Asinh",e,void 0)},894345:e=>{u.xa("Acosh",e,void 0)},894398:e=>{u.xa("Atanh",e,void 0)},894451:e=>{u.xa("Tanh",e,void 0)},894503:(e,r,t)=>{u.xa("ClipV10",e,{min:r,max:t})},894575:e=>{u.xa("Clip",e,void 0)},894627:(e,r)=>{u.xa("Elu",e,{alpha:r})},894685:e=>{u.xa("Relu",e,void 0)},894737:(e,r)=>{u.xa("LeakyRelu",e,{alpha:r})},894801:(e,r)=>{u.xa("ThresholdedRelu",e,{alpha:r})},894871:(e,r)=>{u.xa("Cast",e,{to:r})},894929:e=>{u.xa("Add",e,void 0)},894980:e=>{u.xa("Sub",e,void 0)},895031:e=>{u.xa("Mul",e,void 0)},895082:e=>{u.xa("Div",e,void 0)},895133:e=>{u.xa("Pow",e,void 0)},895184:(e,r,t,n,o)=>{u.xa("ReduceMean",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},895348:(e,r,t,n,o)=>{u.xa("ReduceMax",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},895511:(e,r,t,n,o)=>{u.xa("ReduceMin",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},895674:(e,r,t,n,o)=>{u.xa("ReduceProd",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},895838:(e,r,t,n,o)=>{u.xa("ReduceSum",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},896001:(e,r,t,n,o)=>{u.xa("ReduceL1",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},896163:(e,r,t,n,o)=>{u.xa("ReduceL2",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},896325:(e,r,t,n,o)=>{u.xa("ReduceLogSum",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},896491:(e,r,t,n,o)=>{u.xa("ReduceSumSquare",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},896660:(e,r,t,n,o)=>{u.xa("ReduceLogSumExp",e,{keepDims:!!r,noopWithEmptyAxes:!!t,axes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},896829:(e,r,t)=>{u.xa("Transpose",e,{perm:r?Array.from(a().subarray(t>>>0,t+r>>>0)):[]})},896942:(e,t,a,n,o,i,s,f,l,c)=>{u.xa("Conv",e,{format:l?"NHWC":"NCHW",auto_pad:t,dilations:[a],group:n,kernel_shape:[o],pads:[i,s],strides:[f],w_is_const:()=>!!r()[c>>>0]})},897170:(e,t,a,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("Conv",e,{format:h?"NHWC":"NCHW",auto_pad:t,dilations:[a,n],group:o,kernel_shape:[i,s],pads:[f,l,c,d],strides:[p,m],w_is_const:()=>!!r()[b>>>0]})},897429:(e,t,a,n,o,i,s,f,l,c)=>{u.xa("Conv",e,{format:l?"NHWC":"NCHW",auto_pad:t,dilations:[a],group:n,kernel_shape:[o],pads:[i,s],strides:[f],w_is_const:()=>!!r()[c>>>0]})},897657:(e,t,a,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("Conv",e,{format:h?"NHWC":"NCHW",auto_pad:t,dilations:[a,n],group:o,kernel_shape:[i,s],pads:[f,l,c,d],strides:[p,m],w_is_const:()=>!!r()[b>>>0]})},897916:(e,t,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("ConvTranspose",e,{format:c?"NHWC":"NCHW",autoPad:t,dilations:[n],group:o,kernel_shape:[i],pads:[s,f],strides:[l],wIsConst:()=>!!r()[d>>>0],outputPadding:p?Array.from(a().subarray(m>>>0,m+p>>>0)):[],outputShape:h?Array.from(a().subarray(b>>>0,b+h>>>0)):[]})},898296:(e,t,n,o,i,s,f,l,c,d,p,m,h)=>{u.xa("ConvTranspose",e,{format:l?"NHWC":"NCHW",autoPad:t,dilations:Array.from(a().subarray(n>>>0,n+2>>>0)),group:o,kernelShape:Array.from(a().subarray(i>>>0,i+2>>>0)),pads:Array.from(a().subarray(s>>>0,s+4>>>0)),strides:Array.from(a().subarray(f>>>0,f+2>>>0)),wIsConst:()=>!!r()[c>>>0],outputPadding:0<d?Array.from(a().subarray(p>>>0,p+d>>>0)):[],outputShape:0<m?Array.from(a().subarray(h>>>0,h+m>>>0)):[]})},898819:(e,t,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("ConvTranspose",e,{format:c?"NHWC":"NCHW",autoPad:t,dilations:[n],group:o,kernel_shape:[i],pads:[s,f],strides:[l],wIsConst:()=>!!r()[d>>>0],outputPadding:p?Array.from(a().subarray(m>>>0,m+p>>>0)):[],outputShape:h?Array.from(a().subarray(b>>>0,b+h>>>0)):[]})},899199:(e,t,n,o,i,s,f,l,c,d,p,m,h)=>{u.xa("ConvTranspose",e,{format:l?"NHWC":"NCHW",autoPad:t,dilations:Array.from(a().subarray(n>>>0,n+2>>>0)),group:o,kernelShape:Array.from(a().subarray(i>>>0,i+2>>>0)),pads:Array.from(a().subarray(s>>>0,s+4>>>0)),strides:Array.from(a().subarray(f>>>0,f+2>>>0)),wIsConst:()=>!!r()[c>>>0],outputPadding:0<d?Array.from(a().subarray(p>>>0,p+d>>>0)):[],outputShape:0<m?Array.from(a().subarray(h>>>0,h+m>>>0)):[]})},899722:(e,r)=>{u.xa("GlobalAveragePool",e,{format:r?"NHWC":"NCHW"})},899813:(e,r,t,a,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("AveragePool",e,{format:b?"NHWC":"NCHW",auto_pad:r,ceil_mode:t,count_include_pad:a,storage_order:n,dilations:[o,i],kernel_shape:[s,f],pads:[l,c,d,p],strides:[m,h]})},900097:(e,r)=>{u.xa("GlobalAveragePool",e,{format:r?"NHWC":"NCHW"})},900188:(e,r,t,a,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("AveragePool",e,{format:b?"NHWC":"NCHW",auto_pad:r,ceil_mode:t,count_include_pad:a,storage_order:n,dilations:[o,i],kernel_shape:[s,f],pads:[l,c,d,p],strides:[m,h]})},900472:(e,r)=>{u.xa("GlobalMaxPool",e,{format:r?"NHWC":"NCHW"})},900559:(e,r,t,a,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("MaxPool",e,{format:b?"NHWC":"NCHW",auto_pad:r,ceil_mode:t,count_include_pad:a,storage_order:n,dilations:[o,i],kernel_shape:[s,f],pads:[l,c,d,p],strides:[m,h]})},900839:(e,r)=>{u.xa("GlobalMaxPool",e,{format:r?"NHWC":"NCHW"})},900926:(e,r,t,a,n,o,i,s,f,l,c,d,p,m,h,b)=>{u.xa("MaxPool",e,{format:b?"NHWC":"NCHW",auto_pad:r,ceil_mode:t,count_include_pad:a,storage_order:n,dilations:[o,i],kernel_shape:[s,f],pads:[l,c,d,p],strides:[m,h]})},901206:(e,r,t,a,n)=>{u.xa("Gemm",e,{alpha:r,beta:t,transA:a,transB:n})},901310:e=>{u.xa("MatMul",e,void 0)},901364:(e,r,t,a)=>{u.xa("ArgMax",e,{keepDims:!!r,selectLastIndex:!!t,axis:a})},901472:(e,r,t,a)=>{u.xa("ArgMin",e,{keepDims:!!r,selectLastIndex:!!t,axis:a})},901580:(e,r)=>{u.xa("Softmax",e,{axis:r})},901643:(e,r)=>{u.xa("Concat",e,{axis:r})},901703:(e,r,t,n,o)=>{u.xa("Split",e,{axis:r,numOutputs:t,splitSizes:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[]})},901848:e=>{u.xa("Expand",e,void 0)},901902:(e,r)=>{u.xa("Gather",e,{axis:Number(r)})},901973:(e,r,t,n,o,i,s,f,l,c,d)=>{u.xa("Resize",e,{antialias:r,axes:t?Array.from(a().subarray(n>>>0,n+t>>>0)):[],coordinateTransformMode:le(o),cubicCoeffA:i,excludeOutside:s,extrapolationValue:f,keepAspectRatioPolicy:le(l),mode:le(c),nearestMode:le(d)})},902324:(e,r,t,n,o,i,s)=>{u.xa("Slice",e,{starts:r?Array.from(a().subarray(t>>>0,t+r>>>0)):[],ends:n?Array.from(a().subarray(o>>>0,o+n>>>0)):[],axes:i?Array.from(a().subarray(s>>>0,s+i>>>0)):[]})},902555:e=>{u.xa("Tile",e,void 0)},902607:(e,r,t)=>{u.xa("LayerNormalization",e,{axis:Number(r),epsilon:Number(t)})},902714:(e,r,t)=>{u.xa("InstanceNormalization",e,{epsilon:r,format:t?"NHWC":"NCHW"})},902828:(e,r,t)=>{u.xa("InstanceNormalization",e,{epsilon:r,format:t?"NHWC":"NCHW"})},902942:e=>{u.xa("Gelu",e,void 0)},902994:(e,r)=>{u.xa("SkipLayerNormalization",e,{epsilon:r})},903075:e=>{u.rb(e)},903109:(e,r)=>u.sb(e,r)};function ne(e){this.name="ExitStatus",this.message=`Program terminated with exit(${e})`,this.status=e}function oe(e){e.terminate(),e.onmessage=()=>{}}function ie(e){(e=pe.Ja[e])||Z(),pe.xb(e)}function se(e){var r=pe.lb();if(!r)return 6;pe.Ra.push(r),pe.Ja[e.Qa]=r,r.Qa=e.Qa;var t={cmd:"run",start_routine:e.yb,arg:e.jb,pthread_ptr:e.Qa};return y&&r.unref(),r.postMessage(t,e.Eb),0}var ue="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,fe=(e,r,t)=>{var a=(r>>>=0)+t;for(t=r;e[t]&&!(t>=a);)++t;if(16<t-r&&e.buffer&&ue)return ue.decode(e.buffer instanceof SharedArrayBuffer?e.slice(r,t):e.subarray(r,t));for(a="";r<t;){var n=e[r++];if(128&n){var o=63&e[r++];if(192==(224&n))a+=String.fromCharCode((31&n)<<6|o);else{var i=63&e[r++];65536>(n=224==(240&n)?(15&n)<<12|o<<6|i:(7&n)<<18|o<<12|i<<6|63&e[r++])?a+=String.fromCharCode(n):(n-=65536,a+=String.fromCharCode(55296|n>>10,56320|1023&n))}}else a+=String.fromCharCode(n)}return a},le=(e,r)=>(e>>>=0)?fe(t(),e,r):"";function ce(e){if(g)return Je(1,1,e);k=e,z()||(pe.zb(),u.onExit&&u.onExit(e),I=!0),m(e,new ne(e))}var de=e=>{if(k=e,g)throw he(e),"unwind";ce(e)},pe={Ua:[],Ra:[],eb:[],Ja:{},Xa:function(){g?pe.nb():pe.mb()},mb:function(){L.unshift((()=>{X(),pe.ub((()=>Q()))}))},nb:function(){pe.receiveObjectTransfer=pe.wb,pe.threadInitTLS=pe.cb,pe.setExitStatus=pe.bb,M=!1},bb:function(e){k=e},Kb:["$terminateWorker"],zb:function(){for(var e of pe.Ra)oe(e);for(e of pe.Ua)oe(e);pe.Ua=[],pe.Ra=[],pe.Ja=[]},xb:function(e){var r=e.Qa;delete pe.Ja[r],pe.Ua.push(e),pe.Ra.splice(pe.Ra.indexOf(e),1),e.Qa=0,Mr(r)},wb:function(){},cb:function(){pe.eb.forEach((e=>e()))},vb:e=>new Promise((r=>{e.onmessage=t=>{var a=(t=t.data).cmd;if(t.targetThread&&t.targetThread!=wr()){var n=pe.Ja[t.Jb];n?n.postMessage(t,t.transferList):T('Internal error! Worker sent a message "'+a+'" to target pthread '+t.targetThread+", but that thread no longer exists!")}else"checkMailbox"===a?Fe():"spawnThread"===a?se(t):"cleanupThread"===a?ie(t.thread):"killThread"===a?(t=t.thread,a=pe.Ja[t],delete pe.Ja[t],oe(a),Mr(t),pe.Ra.splice(pe.Ra.indexOf(a),1),a.Qa=0):"cancelThread"===a?pe.Ja[t.thread].postMessage({cmd:"cancel"}):"loaded"===a?(e.loaded=!0,r(e)):"alert"===a?alert("Thread "+t.threadId+": "+t.text):"setimmediate"===t.target?e.postMessage(t):"callHandler"===a?u[t.handler](...t.args):a&&T("worker sent an unknown command "+a)},e.onerror=e=>{throw T("worker sent an error! "+e.filename+":"+e.lineno+": "+e.message),e},y&&(e.on("message",(function(r){e.onmessage({data:r})})),e.on("error",(function(r){e.onerror(r)})));var t,a=[];for(t of["onExit","onAbort","print","printErr"])u.hasOwnProperty(t)&&a.push(t);e.postMessage({cmd:"load",handlers:a,urlOrBlob:u.mainScriptUrlOrBlob||_scriptDir,wasmMemory:R,wasmModule:E})})),ub:function(e){e()},ib:function(){var e=_("ort-wasm-simd-threaded.worker.js");e=new Worker(e),pe.Ua.push(e)},lb:function(){return 0==pe.Ua.length&&(pe.ib(),pe.vb(pe.Ua[0])),pe.Ua.pop()}};u.PThread=pe;var me=e=>{for(;0<e.length;)e.shift()(u)};function he(e){if(g)return Je(2,0,e);de(e)}function be(e){this.$a=e-24,this.hb=function(e){n()[this.$a+4>>2>>>0]=e},this.gb=function(e){n()[this.$a+8>>2>>>0]=e},this.Xa=function(e,r){this.fb(),this.hb(e),this.gb(r)},this.fb=function(){n()[this.$a+16>>2>>>0]=0}}function ye(e,r,t,a){return g?Je(3,1,e,r,t,a):ge(e,r,t,a)}function ge(e,r,t,a){if(e>>>=0,r>>>=0,t>>>=0,a>>>=0,"undefined"==typeof SharedArrayBuffer)return T("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;var n=[];return g&&0===n.length?ye(e,r,t,a):(e={yb:t,Qa:e,jb:a,Eb:n},g?(e.Gb="spawnThread",postMessage(e,n),0):se(e))}function ve(e,r,t){return g?Je(4,1,e,r,t):0}function _e(e,r){if(g)return Je(5,1,e,r)}u.establishStackSpace=function(){var e=wr(),r=a()[e+52>>2>>>0];e=a()[e+56>>2>>>0],kr(r,r-e),Hr(r)},u.invokeEntryPoint=function(e,r){e=Pr.apply(null,[e,r]),z()?pe.bb(e):Rr(e)};var xe=e=>{for(var r=0,t=0;t<e.length;++t){var a=e.charCodeAt(t);127>=a?r++:2047>=a?r+=2:55296<=a&&57343>=a?(r+=4,++t):r+=3}return r},we=(e,r,t,a)=>{if(!(0<a))return 0;var n=t>>>=0;a=t+a-1;for(var o=0;o<e.length;++o){var i=e.charCodeAt(o);if(55296<=i&&57343>=i&&(i=65536+((1023&i)<<10)|1023&e.charCodeAt(++o)),127>=i){if(t>=a)break;r[t++>>>0]=i}else{if(2047>=i){if(t+1>=a)break;r[t++>>>0]=192|i>>6}else{if(65535>=i){if(t+2>=a)break;r[t++>>>0]=224|i>>12}else{if(t+3>=a)break;r[t++>>>0]=240|i>>18,r[t++>>>0]=128|i>>12&63}r[t++>>>0]=128|i>>6&63}r[t++>>>0]=128|63&i}}return r[t>>>0]=0,t-n},Ae=(e,r,a)=>we(e,t(),r,a);function Ce(e,r){if(g)return Je(6,1,e,r)}function Se(e,r,t){if(g)return Je(7,1,e,r,t)}function Oe(e,r,t){return g?Je(8,1,e,r,t):0}function Te(e,r){if(g)return Je(9,1,e,r)}function Me(e,r,t){if(g)return Je(10,1,e,r,t)}function Re(e,r,t,a){if(g)return Je(11,1,e,r,t,a)}function We(e,r,t,a){if(g)return Je(12,1,e,r,t,a)}function Ee(e,r,t,a){if(g)return Je(13,1,e,r,t,a)}function ke(e){if(g)return Je(14,1,e)}function De(e,r){if(g)return Je(15,1,e,r)}function He(e,r,t){if(g)return Je(16,1,e,r,t)}var Ne=e=>{if(!I)try{if(e(),!z())try{g?Rr(k):de(k)}catch(e){e instanceof ne||"unwind"==e||m(1,e)}}catch(e){e instanceof ne||"unwind"==e||m(1,e)}};function Pe(e){e>>>=0,"function"==typeof Atomics.Fb&&(Atomics.Fb(a(),e>>2,e).value.then(Fe),e+=128,Atomics.store(a(),e>>2,1))}function Fe(){var e=wr();e&&(Pe(e),Ne((()=>Wr())))}u.__emscripten_thread_mailbox_await=Pe,u.checkMailbox=Fe;var Ie=e=>0==e%4&&(0!=e%100||0==e%400),Ue=[0,31,60,91,121,152,182,213,244,274,305,335],Ye=[0,31,59,90,120,151,181,212,243,273,304,334];function Le(e,r,t,a,n,o,i,s){return g?Je(17,1,e,r,t,a,n,o,i,s):-52}function je(e,r,t,a,n,o,i){if(g)return Je(18,1,e,r,t,a,n,o,i)}var Be=e=>{var r=xe(e)+1,t=Ar(r);return t&&Ae(e,t,r),t},Ge=[],ze=(e,r)=>{var n;for(Ge.length=0,r>>=2;n=t()[e++>>>0];)r+=105!=n&r,Ge.push(105==n?a()[r>>>0]:o()[r++>>>1]),++r;return Ge},qe=e=>{var r=Dr();return e=e(),Hr(r),e};function Je(e,r){var t=arguments.length-2,a=arguments;return qe((()=>{for(var n=Nr(8*t),i=n>>3,s=0;s<t;s++){var u=a[2+s];o()[i+s>>>0]=u}return Tr(e,t,n,r)}))}var Ve,$e=[],Xe={},Qe=()=>{if(!Ve){var e,r={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:p||"./this.program"};for(e in Xe)void 0===Xe[e]?delete r[e]:r[e]=Xe[e];var t=[];for(e in r)t.push(`${e}=${r[e]}`);Ve=t}return Ve};function Ze(e,t){if(g)return Je(19,1,e,t);e>>>=0,t>>>=0;var a=0;return Qe().forEach((function(o,i){var s=t+a;for(i=n()[e+4*i>>2>>>0]=s,s=0;s<o.length;++s)r()[i++>>0>>>0]=o.charCodeAt(s);r()[i>>0>>>0]=0,a+=o.length+1})),0}function Ke(e,r){if(g)return Je(20,1,e,r);e>>>=0,r>>>=0;var t=Qe();n()[e>>2>>>0]=t.length;var a=0;return t.forEach((function(e){a+=e.length+1})),n()[r>>2>>>0]=a,0}function er(e){return g?Je(21,1,e):52}function rr(e,r,t,a){return g?Je(22,1,e,r,t,a):52}function tr(e,r,t,a,n){return g?Je(23,1,e,r,t,a,n):70}var ar=[null,[],[]];function nr(e,r,a,o){if(g)return Je(24,1,e,r,a,o);r>>>=0,a>>>=0,o>>>=0;for(var i=0,s=0;s<a;s++){var u=n()[r>>2>>>0],f=n()[r+4>>2>>>0];r+=8;for(var l=0;l<f;l++){var c=t()[u+l>>>0],d=ar[e];0===c||10===c?((1===e?O:T)(fe(d,0)),d.length=0):d.push(c)}i+=f}return n()[o>>2>>>0]=i,0}var or=e=>(or=(()=>{if("object"==typeof crypto&&"function"==typeof crypto.getRandomValues)return e=>(e.set(crypto.getRandomValues(new Uint8Array(e.byteLength))),e);if(y)try{var e=require("crypto");if(e.randomFillSync)return r=>e.randomFillSync(r);var r=e.randomBytes;return e=>(e.set(r(e.byteLength)),e)}catch(e){}Z("initRandomDevice")})())(e),ir=[31,29,31,30,31,30,31,31,30,31,30,31],sr=[31,28,31,30,31,30,31,31,30,31,30,31],ur=(e,t)=>{r().set(e,t>>>0)};function fr(e,r,t,n){function o(e,r,t){for(e="number"==typeof e?e.toString():e||"";e.length<r;)e=t[0]+e;return e}function i(e,r){return o(e,r,"0")}function s(e,r){function t(e){return 0>e?-1:0<e?1:0}var a;return 0===(a=t(e.getFullYear()-r.getFullYear()))&&0===(a=t(e.getMonth()-r.getMonth()))&&(a=t(e.getDate()-r.getDate())),a}function u(e){switch(e.getDay()){case 0:return new Date(e.getFullYear()-1,11,29);case 1:return e;case 2:return new Date(e.getFullYear(),0,3);case 3:return new Date(e.getFullYear(),0,2);case 4:return new Date(e.getFullYear(),0,1);case 5:return new Date(e.getFullYear()-1,11,31);case 6:return new Date(e.getFullYear()-1,11,30)}}function f(e){var r=e.Sa;for(e=new Date(new Date(e.Ta+1900,0,1).getTime());0<r;){var t=e.getMonth(),a=(Ie(e.getFullYear())?ir:sr)[t];if(!(r>a-e.getDate())){e.setDate(e.getDate()+r);break}r-=a-e.getDate()+1,e.setDate(1),11>t?e.setMonth(t+1):(e.setMonth(0),e.setFullYear(e.getFullYear()+1))}return t=new Date(e.getFullYear()+1,0,4),r=u(new Date(e.getFullYear(),0,4)),t=u(t),0>=s(r,e)?0>=s(t,e)?e.getFullYear()+1:e.getFullYear():e.getFullYear()-1}e>>>=0,r>>>=0,t>>>=0,n>>>=0;var l=a()[n+40>>2>>>0];for(var c in n={Cb:a()[n>>2>>>0],Bb:a()[n+4>>2>>>0],Va:a()[n+8>>2>>>0],Za:a()[n+12>>2>>>0],Wa:a()[n+16>>2>>>0],Ta:a()[n+20>>2>>>0],Pa:a()[n+24>>2>>>0],Sa:a()[n+28>>2>>>0],Lb:a()[n+32>>2>>>0],Ab:a()[n+36>>2>>>0],Db:l?le(l):""},t=le(t),l={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"})t=t.replace(new RegExp(c,"g"),l[c]);var d="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),p="January February March April May June July August September October November December".split(" ");for(c in l={"%a":e=>d[e.Pa].substring(0,3),"%A":e=>d[e.Pa],"%b":e=>p[e.Wa].substring(0,3),"%B":e=>p[e.Wa],"%C":e=>i((e.Ta+1900)/100|0,2),"%d":e=>i(e.Za,2),"%e":e=>o(e.Za,2," "),"%g":e=>f(e).toString().substring(2),"%G":e=>f(e),"%H":e=>i(e.Va,2),"%I":e=>(0==(e=e.Va)?e=12:12<e&&(e-=12),i(e,2)),"%j":e=>{for(var r=0,t=0;t<=e.Wa-1;r+=(Ie(e.Ta+1900)?ir:sr)[t++]);return i(e.Za+r,3)},"%m":e=>i(e.Wa+1,2),"%M":e=>i(e.Bb,2),"%n":()=>"\n","%p":e=>0<=e.Va&&12>e.Va?"AM":"PM","%S":e=>i(e.Cb,2),"%t":()=>"\t","%u":e=>e.Pa||7,"%U":e=>i(Math.floor((e.Sa+7-e.Pa)/7),2),"%V":e=>{var r=Math.floor((e.Sa+7-(e.Pa+6)%7)/7);if(2>=(e.Pa+371-e.Sa-2)%7&&r++,r)53==r&&(4==(t=(e.Pa+371-e.Sa)%7)||3==t&&Ie(e.Ta)||(r=1));else{r=52;var t=(e.Pa+7-e.Sa-1)%7;(4==t||5==t&&Ie(e.Ta%400-1))&&r++}return i(r,2)},"%w":e=>e.Pa,"%W":e=>i(Math.floor((e.Sa+7-(e.Pa+6)%7)/7),2),"%y":e=>(e.Ta+1900).toString().substring(2),"%Y":e=>e.Ta+1900,"%z":e=>{var r=0<=(e=e.Ab);return e=Math.abs(e)/60,(r?"+":"-")+String("0000"+(e/60*100+e%60)).slice(-4)},"%Z":e=>e.Db,"%%":()=>"%"},t=t.replace(/%%/g,"\0\0"),l)t.includes(c)&&(t=t.replace(new RegExp(c,"g"),l[c](n)));return c=function(e){var r=Array(xe(e)+1);return we(e,r,0,r.length),r}(t=t.replace(/\0\0/g,"%")),c.length>r?0:(ur(c,e),c.length-1)}function lr(e){try{e()}catch(e){Z(e)}}var cr=0,dr=null,pr=0,mr=[],hr={},br={},yr=0,gr=null,vr=[];pe.Xa();var _r=[null,ce,he,ye,ve,_e,Ce,Se,Oe,Te,Me,Re,We,Ee,ke,De,He,Le,je,Ze,Ke,er,rr,tr,nr],xr={r:function(e,r,t){return function(e){return function(e){if(!I){if(0===cr){var r=!1,t=!1;e(((e=0)=>{if(!I&&(pr=e,r=!0,t)){cr=2,lr((()=>Ur(dr))),"undefined"!=typeof Browser&&Browser.Ya.kb&&Browser.Ya.resume(),e=!1;try{var n=function(){var e=a()[dr+8>>2>>>0];return e=W[br[e]],--G,e()}()}catch(r){n=r,e=!0}var o=!1;if(!dr){var i=gr;i&&(gr=null,(e?i.reject:i.resolve)(n),o=!0)}if(e&&!o)throw n}})),t=!0,r||(cr=1,dr=function(){var e=Ar(65548),r=e+12;n()[e>>2>>>0]=r,n()[e+4>>2>>>0]=r+65536,r=mr[0];var t=hr[r];return void 0===t&&(t=yr++,hr[r]=t,br[t]=r),r=t,a()[e+8>>2>>>0]=r,e}(),"undefined"!=typeof Browser&&Browser.Ya.kb&&Browser.Ya.pause(),lr((()=>Fr(dr))))}else 2===cr?(cr=0,lr(Yr),Cr(dr),dr=null,vr.forEach((e=>Ne(e)))):Z(`invalid state: ${cr}`);return pr}}((r=>{e().then(r)}))}((async()=>{await u.pb(e,r,t)}))},b:function(e,r,t){throw new be(e>>>=0).Xa(r>>>0,t>>>0),e},O:function(e){Sr(e>>>0,!b,1,!h,131072,!1),pe.cb()},m:function(e){e>>>=0,g?postMessage({cmd:"cleanupThread",thread:e}):ie(e)},J:ge,i:ve,U:_e,G:Ce,I:Se,V:Oe,S:Te,K:Me,R:Re,q:We,H:Ee,E:ke,T:De,F:He,Y:()=>!0,C:function(e,r){(e>>>=0)==r>>>0?setTimeout((()=>Fe())):g?postMessage({targetThread:e,cmd:"checkMailbox"}):(e=pe.Ja[e])&&e.postMessage({cmd:"checkMailbox"})},M:function(){return-1},N:Pe,X:function(e){y&&pe.Ja[e>>>0].ref()},u:function(e,r,t){e=r+2097152>>>0<4194305-!!e?(e>>>0)+4294967296*r:NaN,t>>>=0,e=new Date(1e3*e),a()[t>>2>>>0]=e.getUTCSeconds(),a()[t+4>>2>>>0]=e.getUTCMinutes(),a()[t+8>>2>>>0]=e.getUTCHours(),a()[t+12>>2>>>0]=e.getUTCDate(),a()[t+16>>2>>>0]=e.getUTCMonth(),a()[t+20>>2>>>0]=e.getUTCFullYear()-1900,a()[t+24>>2>>>0]=e.getUTCDay(),e=(e.getTime()-Date.UTC(e.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,a()[t+28>>2>>>0]=e},v:function(e,r,t){e=r+2097152>>>0<4194305-!!e?(e>>>0)+4294967296*r:NaN,t>>>=0,e=new Date(1e3*e),a()[t>>2>>>0]=e.getSeconds(),a()[t+4>>2>>>0]=e.getMinutes(),a()[t+8>>2>>>0]=e.getHours(),a()[t+12>>2>>>0]=e.getDate(),a()[t+16>>2>>>0]=e.getMonth(),a()[t+20>>2>>>0]=e.getFullYear()-1900,a()[t+24>>2>>>0]=e.getDay(),r=(Ie(e.getFullYear())?Ue:Ye)[e.getMonth()]+e.getDate()-1|0,a()[t+28>>2>>>0]=r,a()[t+36>>2>>>0]=-60*e.getTimezoneOffset(),r=new Date(e.getFullYear(),6,1).getTimezoneOffset();var n=new Date(e.getFullYear(),0,1).getTimezoneOffset();e=0|(r!=n&&e.getTimezoneOffset()==Math.min(n,r)),a()[t+32>>2>>>0]=e},w:function(e){e>>>=0;var r=new Date(a()[e+20>>2>>>0]+1900,a()[e+16>>2>>>0],a()[e+12>>2>>>0],a()[e+8>>2>>>0],a()[e+4>>2>>>0],a()[e>>2>>>0],0),t=a()[e+32>>2>>>0],n=r.getTimezoneOffset(),o=new Date(r.getFullYear(),6,1).getTimezoneOffset(),i=new Date(r.getFullYear(),0,1).getTimezoneOffset(),s=Math.min(i,o);return 0>t?a()[e+32>>2>>>0]=Number(o!=i&&s==n):0<t!=(s==n)&&(o=Math.max(i,o),r.setTime(r.getTime()+6e4*((0<t?s:o)-n))),a()[e+24>>2>>>0]=r.getDay(),t=(Ie(r.getFullYear())?Ue:Ye)[r.getMonth()]+r.getDate()-1|0,a()[e+28>>2>>>0]=t,a()[e>>2>>>0]=r.getSeconds(),a()[e+4>>2>>>0]=r.getMinutes(),a()[e+8>>2>>>0]=r.getHours(),a()[e+12>>2>>>0]=r.getDate(),a()[e+16>>2>>>0]=r.getMonth(),a()[e+20>>2>>>0]=r.getYear(),e=r.getTime()/1e3,Er((te=e,1<=+Math.abs(te)?0<te?+Math.floor(te/4294967296)>>>0:~~+Math.ceil((te-+(~~te>>>0))/4294967296)>>>0:0)),e>>>0},s:Le,t:je,A:function(e,r,t){function o(e){return(e=e.toTimeString().match(/\(([A-Za-z ]+)\)$/))?e[1]:"GMT"}e>>>=0,r>>>=0,t>>>=0;var i=(new Date).getFullYear(),s=new Date(i,0,1),u=new Date(i,6,1);i=s.getTimezoneOffset();var f=u.getTimezoneOffset(),l=Math.max(i,f);n()[e>>2>>>0]=60*l,a()[r>>2>>>0]=Number(i!=f),e=o(s),r=o(u),e=Be(e),r=Be(r),f<i?(n()[t>>2>>>0]=e,n()[t+4>>2>>>0]=r):(n()[t>>2>>>0]=r,n()[t+4>>2>>>0]=e)},d:()=>{Z("")},c:function(e,r,t){return e>>>=0,r=ze(r>>>0,t>>>0),ae[e].apply(null,r)},l:function(e,r,t){return e>>>=0,r=ze(r>>>0,t>>>0),ae[e].apply(null,r)},n:function(){},j:function(){return Date.now()},W:()=>{throw G+=1,"unwind"},D:function(){return 4294901760},f:()=>performance.timeOrigin+performance.now(),g:function(){return y?require("os").cpus().length:navigator.hardwareConcurrency},L:function(e,r,t,a){for(pe.Hb=r>>>0,$e.length=t,r=a>>>0>>3,a=0;a<t;a++)$e[a]=o()[r+a>>>0];return(0>e?ae[-e-1]:_r[e]).apply(null,$e)},z:function(e){e>>>=0;var r=t().length;if(e<=r||4294901760<e)return!1;for(var a=1;4>=a;a*=2){var n=r*(1+.2/a);n=Math.min(n,e+100663296);var o=Math;n=Math.max(e,n);e:{o=o.min.call(o,4294901760,n+(65536-n%65536)%65536)-R.buffer.byteLength+65535>>>16;try{R.grow(o),U();var i=1;break e}catch(e){}i=void 0}if(i)return!0}return!1},P:Ze,Q:Ke,k:de,h:er,p:rr,x:tr,o:nr,y:function(e,r){return e>>>=0,r>>>=0,or(t().subarray(e>>>0,e+r>>>0)),0},a:R||u.wasmMemory,B:fr,e:function(e,r,t,a){return fr(e>>>0,r>>>0,t>>>0,a>>>0)}};!function(){function e(e,r){return e=function(e){var r,t={};for(r in e)!function(r){var a=e[r];t[r]="function"==typeof a?function(){mr.push(r);try{return a.apply(null,arguments)}finally{I||(mr.pop()===r||Z(),dr&&1===cr&&0===mr.length&&(cr=0,G+=1,lr(Ir),"undefined"!=typeof Fibers&&Fibers.Mb()))}}:a}(r);return t}(e=e.exports),W=e=function(e){var r=e=>()=>e()>>>0,t=e=>r=>e(r)>>>0;return(e=Object.assign({},e)).__errno_location=r(e.__errno_location),e.pthread_self=r(e.pthread_self),e.malloc=t(e.malloc),e.stackSave=r(e.stackSave),e.stackAlloc=t(e.stackAlloc),e}(e),pe.eb.push(W.wa),j.unshift(W.Z),E=r,Q(),e}var r={a:xr};if(X(),u.instantiateWasm)try{return u.instantiateWasm(r,e)}catch(e){T("Module.instantiateWasm callback failed with error: "+e),s(e)}(function(e,r){var t=q;return S||"function"!=typeof WebAssembly.instantiateStreaming||K(t)||t.startsWith("file://")||y||"function"!=typeof fetch?re(t,e,r):fetch(t,{credentials:"same-origin"}).then((a=>WebAssembly.instantiateStreaming(a,e).then(r,(function(a){return T("wasm streaming compile failed: "+a),T("falling back to ArrayBuffer instantiation"),re(t,e,r)}))))})(r,(function(r){e(r.instance,r.module)})).catch(s)}(),u._OrtInit=(e,r)=>(u._OrtInit=W._)(e,r),u._OrtGetLastError=(e,r)=>(u._OrtGetLastError=W.$)(e,r),u._OrtCreateSessionOptions=(e,r,t,a,n,o,i,s,f,l)=>(u._OrtCreateSessionOptions=W.aa)(e,r,t,a,n,o,i,s,f,l),u._OrtAppendExecutionProvider=(e,r)=>(u._OrtAppendExecutionProvider=W.ba)(e,r),u._OrtAddSessionConfigEntry=(e,r,t)=>(u._OrtAddSessionConfigEntry=W.ca)(e,r,t),u._OrtReleaseSessionOptions=e=>(u._OrtReleaseSessionOptions=W.da)(e),u._OrtCreateSession=(e,r,t)=>(u._OrtCreateSession=W.ea)(e,r,t),u._OrtReleaseSession=e=>(u._OrtReleaseSession=W.fa)(e),u._OrtGetInputOutputCount=(e,r,t)=>(u._OrtGetInputOutputCount=W.ga)(e,r,t),u._OrtGetInputName=(e,r)=>(u._OrtGetInputName=W.ha)(e,r),u._OrtGetOutputName=(e,r)=>(u._OrtGetOutputName=W.ia)(e,r),u._OrtFree=e=>(u._OrtFree=W.ja)(e),u._OrtCreateTensor=(e,r,t,a,n)=>(u._OrtCreateTensor=W.ka)(e,r,t,a,n),u._OrtGetTensorData=(e,r,t,a,n)=>(u._OrtGetTensorData=W.la)(e,r,t,a,n),u._OrtReleaseTensor=e=>(u._OrtReleaseTensor=W.ma)(e),u._OrtCreateRunOptions=(e,r,t,a)=>(u._OrtCreateRunOptions=W.na)(e,r,t,a),u._OrtAddRunConfigEntry=(e,r,t)=>(u._OrtAddRunConfigEntry=W.oa)(e,r,t),u._OrtReleaseRunOptions=e=>(u._OrtReleaseRunOptions=W.pa)(e),u._OrtRun=(e,r,t,a,n,o,i,s)=>(u._OrtRun=W.qa)(e,r,t,a,n,o,i,s),u._OrtEndProfiling=e=>(u._OrtEndProfiling=W.ra)(e),u._JsepOutput=(e,r,t)=>(u._JsepOutput=W.sa)(e,r,t);var wr=u._pthread_self=()=>(wr=u._pthread_self=W.ta)(),Ar=u._malloc=e=>(Ar=u._malloc=W.ua)(e),Cr=u._free=e=>(Cr=u._free=W.va)(e);u.__emscripten_tls_init=()=>(u.__emscripten_tls_init=W.wa)();var Sr=u.__emscripten_thread_init=(e,r,t,a,n,o)=>(Sr=u.__emscripten_thread_init=W.ya)(e,r,t,a,n,o);u.__emscripten_thread_crashed=()=>(u.__emscripten_thread_crashed=W.za)();var Or,Tr=(e,r,t,a)=>(Tr=W.Aa)(e,r,t,a),Mr=e=>(Mr=W.Ba)(e),Rr=u.__emscripten_thread_exit=e=>(Rr=u.__emscripten_thread_exit=W.Ca)(e),Wr=u.__emscripten_check_mailbox=()=>(Wr=u.__emscripten_check_mailbox=W.Da)(),Er=e=>(Er=W.Ea)(e),kr=(e,r)=>(kr=W.Fa)(e,r),Dr=()=>(Dr=W.Ga)(),Hr=e=>(Hr=W.Ha)(e),Nr=e=>(Nr=W.Ia)(e),Pr=u.dynCall_ii=(e,r)=>(Pr=u.dynCall_ii=W.Ka)(e,r),Fr=e=>(Fr=W.La)(e),Ir=()=>(Ir=W.Ma)(),Ur=e=>(Ur=W.Na)(e),Yr=()=>(Yr=W.Oa)();function Lr(){function e(){if(!Or&&(Or=!0,u.calledRun=!0,!I)&&(g||me(j),i(u),u.onRuntimeInitialized&&u.onRuntimeInitialized(),!g)){if(u.postRun)for("function"==typeof u.postRun&&(u.postRun=[u.postRun]);u.postRun.length;){var e=u.postRun.shift();B.unshift(e)}me(B)}}if(!(0<J))if(g)i(u),g||me(j),startWorker(u);else{if(u.preRun)for("function"==typeof u.preRun&&(u.preRun=[u.preRun]);u.preRun.length;)L.unshift(u.preRun.shift());me(L),0<J||(u.setStatus?(u.setStatus("Running..."),setTimeout((function(){setTimeout((function(){u.setStatus("")}),1),e()}),1)):e())}}if(u.___start_em_js=903144,u.___stop_em_js=903305,u.keepRuntimeAlive=z,u.wasmMemory=R,u.stackAlloc=Nr,u.stackSave=Dr,u.stackRestore=Hr,u.UTF8ToString=le,u.stringToUTF8=Ae,u.lengthBytesUTF8=xe,u.ExitStatus=ne,u.PThread=pe,$=function e(){Or||Lr(),Or||($=e)},u.preInit)for("function"==typeof u.preInit&&(u.preInit=[u.preInit]);0<u.preInit.length;)u.preInit.pop()();return Lr(),e.ready});"object"==typeof exports&&"object"==typeof module?module.exports=e:"function"==typeof define&&define.amd&&define([],(()=>e));
