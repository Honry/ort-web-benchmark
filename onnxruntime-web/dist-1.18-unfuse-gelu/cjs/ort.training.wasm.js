/*!
 * ONNX Runtime Web v1.18.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, tryResolveAndInitializeBackend, resolveBackendAndExecutionProviders;
var init_backend_impl = __esm({
  "common/dist/esm/backend-impl.js"() {
    "use strict";
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    tryResolveAndInitializeBackend = async (backendName) => {
      const backendInfo = backends.get(backendName);
      if (!backendInfo) {
        return "backend not found.";
      }
      if (backendInfo.initialized) {
        return backendInfo.backend;
      } else if (backendInfo.aborted) {
        return backendInfo.error;
      } else {
        const isInitializing = !!backendInfo.initPromise;
        try {
          if (!isInitializing) {
            backendInfo.initPromise = backendInfo.backend.init(backendName);
          }
          await backendInfo.initPromise;
          backendInfo.initialized = true;
          return backendInfo.backend;
        } catch (e) {
          if (!isInitializing) {
            backendInfo.error = `${e}`;
            backendInfo.aborted = true;
          }
          return backendInfo.error;
        } finally {
          delete backendInfo.initPromise;
        }
      }
    };
    resolveBackendAndExecutionProviders = async (options) => {
      const eps = options.executionProviders || [];
      const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      let backend;
      const errors = [];
      const availableBackendNames = /* @__PURE__ */ new Set();
      for (const backendName of backendNames) {
        const resolveResult = await tryResolveAndInitializeBackend(backendName);
        if (typeof resolveResult === "string") {
          errors.push({ name: backendName, err: resolveResult });
        } else {
          if (!backend) {
            backend = resolveResult;
          }
          if (backend === resolveResult) {
            availableBackendNames.add(backendName);
          }
        }
      }
      if (!backend) {
        throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
      }
      for (const { name, err } of errors) {
        if (backendHints.includes(name)) {
          console.warn(`removing requested execution provider "${name}" from session options because it is not available: ${err}`);
        }
      }
      const filteredEps = eps.filter((i) => availableBackendNames.has(typeof i === "string" ? i : i.name));
      return [
        backend,
        new Proxy(options, {
          get: (target, prop) => {
            if (prop === "executionProviders") {
              return filteredEps;
            }
            return Reflect.get(target, prop);
          }
        })
      ];
    };
  }
});

// common/dist/esm/backend.js
var init_backend = __esm({
  "common/dist/esm/backend.js"() {
    "use strict";
    init_backend_impl();
  }
});

// common/dist/esm/version.js
var version;
var init_version = __esm({
  "common/dist/esm/version.js"() {
    "use strict";
    version = "1.18.0";
  }
});

// common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "common/dist/esm/env-impl.js"() {
    "use strict";
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// common/dist/esm/env.js
var env2;
var init_env = __esm({
  "common/dist/esm/env.js"() {
    "use strict";
    init_env_impl();
    env2 = env;
  }
});

// common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "common/dist/esm/tensor-conversion-impl.js"() {
    "use strict";
    tensorToDataURL = (tensor, options) => {
      const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        if ("toDataURL" in canvas) {
          return canvas.toDataURL();
        } else {
          throw new Error("toDataURL is not supported");
        }
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "common/dist/esm/tensor-factory-impl.js"() {
    "use strict";
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      const createCanvas = () => {
        if (typeof document !== "undefined") {
          return document.createElement("canvas");
        } else if (typeof OffscreenCanvas !== "undefined") {
          return new OffscreenCanvas(1, 1);
        } else {
          throw new Error("Canvas is not supported");
        }
      };
      const createCanvasContext = (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
          return canvas.getContext("2d");
        } else if (canvas instanceof OffscreenCanvas) {
          return canvas.getContext("2d");
        } else {
          return null;
        }
      };
      if (isHTMLImageEle) {
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = createCanvas();
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = createCanvasContext(tempCanvas);
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = createCanvas();
          const context = createCanvasContext(canvas);
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isTypedArrayChecked, checkTypedArray;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isTypedArrayChecked = false;
    checkTypedArray = () => {
      if (!isTypedArrayChecked) {
        isTypedArrayChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && BigInt64Array.from;
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && BigUint64Array.from;
        const isFloat16ArrayAvailable = typeof Float16Array !== "undefined" && Float16Array.from;
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
        if (isFloat16ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Float16Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(Float16Array, "float16");
        } else {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Uint16Array);
        }
      }
    };
  }
});

// common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "common/dist/esm/tensor-utils-impl.js"() {
    "use strict";
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "common/dist/esm/tensor-impl.js"() {
    "use strict";
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkTypedArray();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "uint8" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16" && typedArrayConstructor === Uint16Array) {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "common/dist/esm/tensor.js"() {
    "use strict";
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// common/dist/esm/trace.js
var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
var init_trace = __esm({
  "common/dist/esm/trace.js"() {
    "use strict";
    init_env_impl();
    TRACE = (deviceType, label) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      console.timeStamp(`${deviceType}::ORT::${label}`);
    };
    TRACE_FUNC = (msg, extraMsg) => {
      const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
      let hasTraceFunc = false;
      for (let i = 0; i < stack.length; i++) {
        if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
          let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
          if (extraMsg) {
            label += `::${extraMsg}`;
          }
          TRACE("CPU", label);
          return;
        }
        if (stack[i].includes("TRACE_FUNC")) {
          hasTraceFunc = true;
        }
      }
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("END", extraMsg);
    };
  }
});

// common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "common/dist/esm/inference-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    init_trace();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        TRACE_FUNC_BEGIN();
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        TRACE_FUNC_END();
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        TRACE_FUNC_BEGIN();
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, optionsWithValidatedEPs);
        TRACE_FUNC_END();
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  }
});

// common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "common/dist/esm/inference-session.js"() {
    "use strict";
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// common/dist/esm/tensor-conversion.js
var init_tensor_conversion = __esm({
  "common/dist/esm/tensor-conversion.js"() {
    "use strict";
  }
});

// common/dist/esm/tensor-factory.js
var init_tensor_factory = __esm({
  "common/dist/esm/tensor-factory.js"() {
    "use strict";
  }
});

// common/dist/esm/onnx-model.js
var init_onnx_model = __esm({
  "common/dist/esm/onnx-model.js"() {
    "use strict";
  }
});

// common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "common/dist/esm/onnx-value.js"() {
    "use strict";
  }
});

// common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "common/dist/esm/training-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
      }
      get trainingInputNames() {
        return this.handler.inputNames;
      }
      get trainingOutputNames() {
        return this.handler.outputNames;
      }
      get evalInputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalInputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      get evalOutputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalOutputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, optionsWithValidatedEPs);
          return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
       * names.
       * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
       * names.
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async lazyResetGrad() {
        await this.handler.lazyResetGrad();
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
          await this.handler.runOptimizerStep(options || {});
        } else {
          throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
      }
      async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runEvalStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        } else {
          throw new Error("This TrainingSession has no EvalModel loaded.");
        }
      }
      async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        if (array.length !== 4 * paramsSize) {
          throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "common/dist/esm/training-session.js"() {
    "use strict";
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "common/dist/esm/index.js"() {
    "use strict";
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_tensor_conversion();
    init_tensor_factory();
    init_trace();
    init_onnx_model();
    init_onnx_value();
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:node:path
var join;
var init_node_path = __esm({
  "nodejs-ignore:node:path"() {
    join = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  createReadStream: () => createReadStream,
  readFile: () => readFile,
  readFileSync: () => readFileSync
});
var readFile, readFileSync, createReadStream;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
    readFileSync = void 0;
    createReadStream = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join2
});
var join2;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join2 = void 0;
  }
});

// web/lib/wasm/binding/ort-training-wasm-simd.js
var require_ort_training_wasm_simd = __commonJS({
  "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var e = moduleArg, k, l;
        e.ready = new Promise((a, b) => {
          k = a;
          l = b;
        });
        var aa = Object.assign({}, e), ba = "./this.program", ca = "object" == typeof window, q = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, v = "", x, z, A;
        if (da) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));
          v = q ? B.dirname(v) + "/" : __dirname + "/";
          x = (a, b) => {
            a = C(a) ? new URL(a) : B.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          A = (a) => {
            a = x(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          z = (a, b, c, d = true) => {
            a = C(a) ? new URL(a) : B.normalize(a);
            fs.readFile(a, d ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(d ? h.buffer : h);
            });
          };
          !e.thisProgram && 1 < process.argv.length && (ba = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          e.inspect = () => "[Emscripten Module object]";
        } else if (ca || q)
          q ? v = self.location.href : "undefined" != typeof document && document.currentScript && (v = document.currentScript.src), _scriptDir && (v = _scriptDir), 0 !== v.indexOf("blob:") ? v = v.substr(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1) : v = "", x = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, q && (A = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), z = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        var ea = console.log.bind(console), D = console.error.bind(console);
        Object.assign(e, aa);
        aa = null;
        "object" != typeof WebAssembly && E("no native wasm support detected");
        var F, fa = false, G, H, I, J, ha;
        function ia() {
          var a = F.buffer;
          e.HEAP8 = G = new Int8Array(a);
          e.HEAP16 = new Int16Array(a);
          e.HEAPU8 = H = new Uint8Array(a);
          e.HEAPU16 = new Uint16Array(a);
          e.HEAP32 = I = new Int32Array(a);
          e.HEAPU32 = J = new Uint32Array(a);
          e.HEAPF32 = new Float32Array(a);
          e.HEAPF64 = ha = new Float64Array(a);
        }
        var K = [], L = [], ja = [], M = 0, N = null, O = null;
        function E(a) {
          a = "Aborted(" + a + ")";
          D(a);
          fa = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        var ka = (a) => a.startsWith("data:application/octet-stream;base64,"), C = (a) => a.startsWith("file://"), P;
        P = "ort-training-wasm-simd.wasm";
        if (!ka(P)) {
          var la = P;
          P = e.locateFile ? e.locateFile(la, v) : v + la;
        }
        function ma(a) {
          if (A)
            return A(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function na(a) {
          if (ca || q) {
            if ("function" == typeof fetch && !C(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => ma(a));
            if (z)
              return new Promise((b, c) => {
                z(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => ma(a));
        }
        function oa(a, b, c) {
          return na(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            D(`failed to asynchronously prepare wasm: ${d}`);
            E(d);
          });
        }
        function pa(a, b) {
          var c = P;
          return "function" != typeof WebAssembly.instantiateStreaming || ka(c) || C(c) || da || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {
            D(`wasm streaming compile failed: ${g}`);
            D("falling back to ArrayBuffer instantiation");
            return oa(c, a, b);
          }));
        }
        var Q, qa = { 862704: (a, b, c, d) => {
          if ("undefined" == typeof e || !e.Qa)
            return 1;
          a = R(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = e.Qa.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return H.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function ra(a) {
          this.Ka = a - 24;
          this.Pa = function(b) {
            J[this.Ka + 4 >>> 2 >>> 0] = b;
          };
          this.Oa = function(b) {
            J[this.Ka + 8 >>> 2 >>> 0] = b;
          };
          this.Ma = function(b, c) {
            this.Na();
            this.Pa(b);
            this.Oa(c);
          };
          this.Na = function() {
            J[this.Ka + 16 >>> 2 >>> 0] = 0;
          };
        }
        var sa = 0, ta = 0, ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, va = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && ua)
            return ua.decode(a.subarray(b, c));
          for (d = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                d += String.fromCharCode((g & 31) << 6 | h);
              else {
                var m = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              d += String.fromCharCode(g);
          }
          return d;
        }, R = (a, b) => (a >>>= 0) ? va(H, a, b) : "", S = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, T = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var g = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var m = a.charCodeAt(h);
            if (55296 <= m && 57343 >= m) {
              var r = a.charCodeAt(++h);
              m = 65536 + ((m & 1023) << 10) | r & 1023;
            }
            if (127 >= m) {
              if (c >= d)
                break;
              b[c++ >>> 0] = m;
            } else {
              if (2047 >= m) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | m >> 6;
              } else {
                if (65535 >= m) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | m >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | m >> 18;
                  b[c++ >>> 0] = 128 | m >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | m >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | m & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, U = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ca = (a) => {
          var b = S(a) + 1, c = Ba(b);
          c && T(a, H, c, b);
          return c;
        }, V = [], W = {}, Da = () => {
          if (!X) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
              "-",
              "_"
            ) + ".UTF-8", _: ba || "./this.program" }, b;
            for (b in W)
              void 0 === W[b] ? delete a[b] : a[b] = W[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            X = c;
          }
          return X;
        }, X, Ea = [null, [], []], Fa = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ga = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ha(a) {
          var b = Array(S(a) + 1);
          T(a, b, 0, b.length);
          return b;
        }
        function Ia(a, b, c, d) {
          function g(f, n, p) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = p[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function m(f, n) {
            function p(ya) {
              return 0 > ya ? -1 : 0 < ya ? 1 : 0;
            }
            var y;
            0 === (y = p(f.getFullYear() - n.getFullYear())) && 0 === (y = p(f.getMonth() - n.getMonth())) && (y = p(f.getDate() - n.getDate()));
            return y;
          }
          function r(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function w(f) {
            var n = f.Ga;
            for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {
              var p = f.getMonth(), y = (U(f.getFullYear()) ? Fa : Ga)[p];
              if (n > y - f.getDate())
                n -= y - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            p = new Date(f.getFullYear() + 1, 0, 4);
            n = r(new Date(
              f.getFullYear(),
              0,
              4
            ));
            p = r(p);
            return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var t = J[d + 40 >>> 2 >>> 0];
          d = { Ta: I[d >>> 2 >>> 0], Sa: I[d + 4 >>> 2 >>> 0], Ia: I[d + 8 >>> 2 >>> 0], La: I[d + 12 >>> 2 >>> 0], Ja: I[d + 16 >>> 2 >>> 0], Ha: I[d + 20 >>> 2 >>> 0], Ba: I[d + 24 >>> 2 >>> 0], Ga: I[d + 28 >>> 2 >>> 0], Va: I[d + 32 >>> 2 >>> 0], Ra: I[d + 36 >>> 2 >>> 0], Ua: t ? R(t) : "" };
          c = R(c);
          t = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var u in t)
            c = c.replace(new RegExp(u, "g"), t[u]);
          var za = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Aa = "January February March April May June July August September October November December".split(" ");
          t = {
            "%a": (f) => za[f.Ba].substring(0, 3),
            "%A": (f) => za[f.Ba],
            "%b": (f) => Aa[f.Ja].substring(0, 3),
            "%B": (f) => Aa[f.Ja],
            "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2),
            "%d": (f) => h(f.La, 2),
            "%e": (f) => g(f.La, 2, " "),
            "%g": (f) => w(f).toString().substring(2),
            "%G": (f) => w(f),
            "%H": (f) => h(f.Ia, 2),
            "%I": (f) => {
              f = f.Ia;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return h(f, 2);
            },
            "%j": (f) => {
              for (var n = 0, p = 0; p <= f.Ja - 1; n += (U(f.Ha + 1900) ? Fa : Ga)[p++])
                ;
              return h(f.La + n, 3);
            },
            "%m": (f) => h(f.Ja + 1, 2),
            "%M": (f) => h(f.Sa, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM",
            "%S": (f) => h(f.Ta, 2),
            "%t": () => "	",
            "%u": (f) => f.Ba || 7,
            "%U": (f) => h(
              Math.floor((f.Ga + 7 - f.Ba) / 7),
              2
            ),
            "%V": (f) => {
              var n = Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7);
              2 >= (f.Ba + 371 - f.Ga - 2) % 7 && n++;
              if (n)
                53 == n && (p = (f.Ba + 371 - f.Ga) % 7, 4 == p || 3 == p && U(f.Ha) || (n = 1));
              else {
                n = 52;
                var p = (f.Ba + 7 - f.Ga - 1) % 7;
                (4 == p || 5 == p && U(f.Ha % 400 - 1)) && n++;
              }
              return h(n, 2);
            },
            "%w": (f) => f.Ba,
            "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7), 2),
            "%y": (f) => (f.Ha + 1900).toString().substring(2),
            "%Y": (f) => f.Ha + 1900,
            "%z": (f) => {
              f = f.Ra;
              var n = 0 <= f;
              f = Math.abs(f) / 60;
              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.Ua,
            "%%": () => "%"
          };
          c = c.replace(/%%/g, "\0\0");
          for (u in t)
            c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](d)));
          c = c.replace(/\0\0/g, "%");
          u = Ha(c);
          if (u.length > b)
            return 0;
          G.set(u, a >>> 0);
          return u.length - 1;
        }
        var La = { a: function(a, b, c) {
          a >>>= 0;
          new ra(a).Ma(b >>> 0, c >>> 0);
          sa = a;
          ta++;
          throw sa;
        }, e: function() {
          return 0;
        }, H: function() {
        }, x: function() {
        }, z: function() {
        }, J: function() {
          return 0;
        }, F: function() {
        }, A: function() {
        }, E: function() {
        }, g: function() {
        }, y: function() {
        }, v: function() {
        }, G: function() {
        }, w: function() {
        }, k: () => 1, n: function(a, b, c) {
          a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
          c >>>= 0;
          a = new Date(1e3 * a);
          I[c >>> 2 >>> 0] = a.getUTCSeconds();
          I[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();
          I[c + 8 >>> 2 >>> 0] = a.getUTCHours();
          I[c + 12 >>> 2 >>> 0] = a.getUTCDate();
          I[c + 16 >>> 2 >>> 0] = a.getUTCMonth();
          I[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
          I[c + 24 >>> 2 >>> 0] = a.getUTCDay();
          I[c + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
        }, o: function(a, b, c) {
          a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
          c >>>= 0;
          a = new Date(1e3 * a);
          I[c >>> 2 >>> 0] = a.getSeconds();
          I[c + 4 >>> 2 >>> 0] = a.getMinutes();
          I[c + 8 >>> 2 >>> 0] = a.getHours();
          I[c + 12 >>> 2 >>> 0] = a.getDate();
          I[c + 16 >>> 2 >>> 0] = a.getMonth();
          I[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
          I[c + 24 >>> 2 >>> 0] = a.getDay();
          I[c + 28 >>> 2 >>> 0] = (U(a.getFullYear()) ? wa : xa)[a.getMonth()] + a.getDate() - 1 | 0;
          I[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
          b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
          var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
          I[c + 32 >>> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
        }, p: function(a) {
          a >>>= 0;
          var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
          0 > c ? I[a + 32 >>> 2 >>> 0] = Number(g != h && m == d) : 0 < c != (m == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));
          I[a + 24 >>> 2 >>> 0] = b.getDay();
          I[a + 28 >>> 2 >>> 0] = (U(b.getFullYear()) ? wa : xa)[b.getMonth()] + b.getDate() - 1 | 0;
          I[a >>> 2 >>> 0] = b.getSeconds();
          I[a + 4 >>> 2 >>> 0] = b.getMinutes();
          I[a + 8 >>> 2 >>> 0] = b.getHours();
          I[a + 12 >>> 2 >>> 0] = b.getDate();
          I[a + 16 >>> 2 >>> 0] = b.getMonth();
          I[a + 20 >>> 2 >>> 0] = b.getYear();
          a = b.getTime();
          isNaN(a) ? (I[Ja() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
          return Ka((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
        }, l: function() {
          return -52;
        }, m: function() {
        }, t: function(a, b, c) {
          function d(w) {
            return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
          }
          c >>>= 0;
          var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
          g = h.getTimezoneOffset();
          var r = m.getTimezoneOffset();
          J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(g, r);
          I[b >>> 0 >>> 2 >>> 0] = Number(g != r);
          a = d(h);
          b = d(m);
          a = Ca(a);
          b = Ca(b);
          r < g ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);
        }, d: () => {
          E("");
        }, B: function(a, b, c) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          V.length = 0;
          for (var d; d = H[b++ >>> 0]; ) {
            var g = 105 != d;
            g &= 112 != d;
            c += g && c % 8 ? 4 : 0;
            V.push(112 == d ? J[c >>> 2 >>> 0] : 105 == d ? I[c >>> 2 >>> 0] : ha[c >>> 3 >>> 0]);
            c += g ? 8 : 4;
          }
          return qa[a].apply(null, V);
        }, h: () => Date.now(), u: function() {
          return 4294901760;
        }, b: () => performance.now(), I: function(a, b, c) {
          b >>>= 0;
          return H.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
        }, s: function(a) {
          a >>>= 0;
          var b = H.length;
          if (4294901760 < a)
            return false;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            var g = Math;
            d = Math.max(a, d);
            a: {
              g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - F.buffer.byteLength + 65535) / 65536;
              try {
                F.grow(g);
                ia();
                var h = 1;
                break a;
              } catch (m) {
              }
              h = void 0;
            }
            if (h)
              return true;
          }
          return false;
        }, C: function(a, b) {
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Da().forEach((d, g) => {
            var h = b + c;
            g = J[a + 4 * g >>> 2 >>> 0] = h;
            for (h = 0; h < d.length; ++h)
              G[g++ >>> 0 >>> 0] = d.charCodeAt(h);
            G[g >>> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }, D: function(a, b) {
          a >>>= 0;
          b >>>= 0;
          var c = Da();
          J[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((g) => d += g.length + 1);
          J[b >>> 2 >>> 0] = d;
          return 0;
        }, f: () => 52, j: function() {
          return 52;
        }, q: function() {
          return 70;
        }, i: function(a, b, c, d) {
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var g = 0, h = 0; h < c; h++) {
            var m = J[b >>> 2 >>> 0], r = J[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var w = 0; w < r; w++) {
              var t = H[m + w >>> 0], u = Ea[a];
              0 === t || 10 === t ? ((1 === a ? ea : D)(va(u, 0)), u.length = 0) : u.push(t);
            }
            g += r;
          }
          J[d >>> 2 >>> 0] = g;
          return 0;
        }, r: Ia, c: function(a, b, c, d) {
          return Ia(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
        } }, Y = function() {
          function a(c) {
            Y = c.exports;
            Y = Ma();
            F = Y.K;
            ia();
            L.unshift(Y.L);
            M--;
            0 == M && (null !== N && (clearInterval(N), N = null), O && (c = O, O = null, c()));
            return Y;
          }
          var b = { a: La };
          M++;
          if (e.instantiateWasm)
            try {
              return e.instantiateWasm(b, a);
            } catch (c) {
              D(`Module.instantiateWasm callback failed with error: ${c}`), l(c);
            }
          pa(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        }();
        e._OrtInit = (a, b) => (e._OrtInit = Y.M)(a, b);
        e._OrtGetLastError = (a, b) => (e._OrtGetLastError = Y.N)(a, b);
        e._OrtCreateSessionOptions = (a, b, c, d, g, h, m, r, w, t) => (e._OrtCreateSessionOptions = Y.O)(a, b, c, d, g, h, m, r, w, t);
        e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = Y.P)(a, b);
        e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = Y.Q)(a, b, c);
        e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = Y.R)(a, b, c);
        e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = Y.S)(a);
        e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = Y.T)(a, b, c);
        e._OrtReleaseSession = (a) => (e._OrtReleaseSession = Y.U)(a);
        e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = Y.V)(a, b, c);
        e._OrtGetInputName = (a, b) => (e._OrtGetInputName = Y.W)(a, b);
        e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = Y.X)(a, b);
        e._OrtFree = (a) => (e._OrtFree = Y.Y)(a);
        e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = Y.Z)(a, b, c, d, g, h);
        e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = Y._)(a, b, c, d, g);
        e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = Y.$)(a);
        e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = Y.aa)(a, b, c, d);
        e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = Y.ba)(a, b, c);
        e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = Y.ca)(a);
        e._OrtCreateBinding = (a) => (e._OrtCreateBinding = Y.da)(a);
        e._OrtBindInput = (a, b, c) => (e._OrtBindInput = Y.ea)(a, b, c);
        e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = Y.fa)(a, b, c, d);
        e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = Y.ga)(a);
        e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = Y.ha)(a);
        e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = Y.ia)(a, b, c, d, g);
        e._OrtRun = (a, b, c, d, g, h, m, r) => (e._OrtRun = Y.ja)(a, b, c, d, g, h, m, r);
        e._OrtEndProfiling = (a) => (e._OrtEndProfiling = Y.ka)(a);
        e._OrtTrainingLoadCheckpoint = (a, b) => (e._OrtTrainingLoadCheckpoint = Y.la)(a, b);
        e._OrtTrainingReleaseCheckpoint = (a) => (e._OrtTrainingReleaseCheckpoint = Y.ma)(a);
        e._OrtTrainingCreateSession = (a, b, c, d, g, h, m, r) => (e._OrtTrainingCreateSession = Y.na)(a, b, c, d, g, h, m, r);
        e._OrtTrainingLazyResetGrad = (a) => (e._OrtTrainingLazyResetGrad = Y.oa)(a);
        e._OrtTrainingRunTrainStep = (a, b, c, d, g, h) => (e._OrtTrainingRunTrainStep = Y.pa)(a, b, c, d, g, h);
        e._OrtTrainingOptimizerStep = (a, b) => (e._OrtTrainingOptimizerStep = Y.qa)(a, b);
        e._OrtTrainingEvalStep = (a, b, c, d, g, h) => (e._OrtTrainingEvalStep = Y.ra)(a, b, c, d, g, h);
        e._OrtTrainingGetParametersSize = (a, b, c) => (e._OrtTrainingGetParametersSize = Y.sa)(a, b, c);
        e._OrtTrainingCopyParametersToBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersToBuffer = Y.ta)(a, b, c, d);
        e._OrtTrainingCopyParametersFromBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersFromBuffer = Y.ua)(a, b, c, d);
        e._OrtTrainingGetModelInputOutputCount = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputCount = Y.va)(a, b, c, d);
        e._OrtTrainingGetModelInputOutputName = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputName = Y.wa)(a, b, c, d);
        e._OrtTrainingReleaseSession = (a) => (e._OrtTrainingReleaseSession = Y.xa)(a);
        var Ja = () => (Ja = Y.ya)(), Ba = e._malloc = (a) => (Ba = e._malloc = Y.za)(a);
        e._free = (a) => (e._free = Y.Aa)(a);
        var Ka = (a) => (Ka = Y.Ca)(a), Na = () => (Na = Y.Da)(), Oa = (a) => (Oa = Y.Ea)(a), Pa = (a) => (Pa = Y.Fa)(a);
        function Ma() {
          var a = Y;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;
          a.ya = b(a.ya);
          a.za = c(a.za);
          a.Da = b(a.Da);
          a.Fa = c(a.Fa);
          return a;
        }
        e.stackAlloc = Pa;
        e.stackSave = Na;
        e.stackRestore = Oa;
        e.UTF8ToString = R;
        e.stringToUTF8 = (a, b, c) => T(a, H, b, c);
        e.lengthBytesUTF8 = S;
        var Z;
        O = function Qa() {
          Z || Ra();
          Z || (O = Qa);
        };
        function Ra() {
          if (!(0 < M)) {
            if (e.preRun)
              for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; ) {
                var a = e.preRun.shift();
                K.unshift(a);
              }
            for (; 0 < K.length; )
              K.shift()(e);
            if (!(0 < M || Z || (Z = true, e.calledRun = true, fa))) {
              for (; 0 < L.length; )
                L.shift()(e);
              for (k(e); 0 < ja.length; )
                ja.shift()(e);
            }
          }
        }
        Ra();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// nodejs-ignore:worker_threads
var require_worker_threads = __commonJS({
  "nodejs-ignore:worker_threads"() {
  }
});

// nodejs-ignore:perf_hooks
var require_perf_hooks = __commonJS({
  "nodejs-ignore:perf_hooks"() {
  }
});

// nodejs-ignore:os
var os_exports = {};
__export(os_exports, {
  cpus: () => cpus2
});
var cpus2;
var init_os = __esm({
  "nodejs-ignore:os"() {
    cpus2 = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.js
var require_ort_wasm_threaded = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module2) {
    "use strict";
    var ortWasmThreaded = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        function aa() {
          e.buffer != l.buffer && m();
          return l;
        }
        function n() {
          e.buffer != l.buffer && m();
          return ba;
        }
        function p() {
          e.buffer != l.buffer && m();
          return ca;
        }
        function r() {
          e.buffer != l.buffer && m();
          return da;
        }
        function ea() {
          e.buffer != l.buffer && m();
          return fa;
        }
        var v = moduleArg, ha, x;
        v.ready = new Promise((a, b) => {
          ha = a;
          x = b;
        });
        var ia = Object.assign({}, v), ja = "./this.program", z = (a, b) => {
          throw b;
        }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = v.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function la(a) {
          return v.locateFile ? v.locateFile(a, E) : E + a;
        }
        var ma, G, H;
        if (B) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));
          E = A ? na.dirname(E) + "/" : __dirname + "/";
          ma = (b, c) => {
            b = I(b) ? new URL(b) : na.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          H = (b) => {
            b = ma(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          G = (b, c, d, g = true) => {
            b = I(b) ? new URL(b) : na.normalize(b);
            fs.readFile(b, g ? void 0 : "utf8", (h, k) => {
              h ? d(h) : c(g ? k.buffer : k);
            });
          };
          !v.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          z = (b, c) => {
            process.exitCode = b;
            throw c;
          };
          v.inspect = () => "[Emscripten Module object]";
          let a;
          try {
            a = require_worker_threads();
          } catch (b) {
            throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
          }
          global.Worker = a.Worker;
        } else if (ka || A)
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, A && (H = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), G = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          });
        B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var oa = console.log.bind(console), pa = console.error.bind(console);
        B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var qa = oa, J = pa;
        Object.assign(v, ia);
        ia = null;
        "object" != typeof WebAssembly && ra("no native wasm support detected");
        var e, sa, K = false, L, l, ba, ca, da, fa;
        function m() {
          var a = e.buffer;
          v.HEAP8 = l = new Int8Array(a);
          v.HEAP16 = new Int16Array(a);
          v.HEAPU8 = ba = new Uint8Array(a);
          v.HEAPU16 = new Uint16Array(a);
          v.HEAP32 = ca = new Int32Array(a);
          v.HEAPU32 = da = new Uint32Array(a);
          v.HEAPF32 = new Float32Array(a);
          v.HEAPF64 = fa = new Float64Array(a);
        }
        var ta = 16777216;
        if (D)
          e = v.wasmMemory;
        else if (v.wasmMemory)
          e = v.wasmMemory;
        else if (e = new WebAssembly.Memory({ initial: ta / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))
          throw J("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && J("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        m();
        ta = e.buffer.byteLength;
        var ua = [], va = [], wa = [], M = 0, xa = null, N = null;
        function ya() {
          M--;
          if (0 == M && (null !== xa && (clearInterval(xa), xa = null), N)) {
            var a = N;
            N = null;
            a();
          }
        }
        function ra(a) {
          a = "Aborted(" + a + ")";
          J(a);
          K = true;
          L = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          x(a);
          throw a;
        }
        var za = (a) => a.startsWith("data:application/octet-stream;base64,"), I = (a) => a.startsWith("file://"), O;
        O = "ort-wasm-threaded.wasm";
        za(O) || (O = la(O));
        function Aa(a) {
          if (H)
            return H(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ba(a) {
          if (ka || A) {
            if ("function" == typeof fetch && !I(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => Aa(a));
            if (G)
              return new Promise((b, c) => {
                G(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => Aa(a));
        }
        function Ca(a, b, c) {
          return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            J(`failed to asynchronously prepare wasm: ${d}`);
            ra(d);
          });
        }
        function Da(a, b) {
          var c = O;
          return "function" != typeof WebAssembly.instantiateStreaming || za(c) || I(c) || B || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {
            J(`wasm streaming compile failed: ${g}`);
            J("falling back to ArrayBuffer instantiation");
            return Ca(c, a, b);
          }));
        }
        var P, Ea = { 793116: (a, b, c, d) => {
          if ("undefined" == typeof v || !v.cb)
            return 1;
          a = Q(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = v.cb.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return n().set(a.subarray(b, b + c), d >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function R(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        var Fa = (a) => {
          a.terminate();
          a.onmessage = () => {
          };
        }, Ha = (a) => {
          0 == S.Pa.length && (Ga(), S.Ya(S.Pa[0]));
          var b = S.Pa.pop();
          if (!b)
            return 6;
          S.Qa.push(b);
          S.Ma[a.Oa] = b;
          b.Oa = a.Oa;
          var c = { cmd: "run", start_routine: a.kb, arg: a.hb, pthread_ptr: a.Oa };
          B && b.unref();
          b.postMessage(c, a.qb);
          return 0;
        }, T = 0, Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && Ia)
            return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (d = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                d += String.fromCharCode((g & 31) << 6 | h);
              else {
                var k = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              d += String.fromCharCode(g);
          }
          return d;
        }, Q = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "", La = (a) => {
          var b = Ka();
          a = a();
          U(b);
          return a;
        };
        function V(a, b) {
          var c = arguments.length - 2, d = arguments;
          return La(() => {
            for (var g = Ma(8 * c), h = g >>> 3, k = 0; k < c; k++) {
              var t = d[2 + k];
              ea()[h + k >>> 0] = t;
            }
            return Na(a, c, g, b);
          });
        }
        function Oa(a) {
          if (D)
            return V(0, 1, a);
          L = a;
          0 < T || (S.lb(), v.onExit?.(a), K = true);
          z(a, new R(a));
        }
        var Qa = (a) => {
          L = a;
          if (D)
            throw Pa(a), "unwind";
          Oa(a);
        };
        function Ra() {
          for (var a = v.numThreads; a--; )
            Ga();
          ua.unshift(() => {
            M++;
            Sa(() => ya());
          });
        }
        function Ga() {
          var a = la("ort-wasm-threaded.worker.js");
          a = new Worker(a);
          S.Pa.push(a);
        }
        function Sa(a) {
          D ? a() : Promise.all(S.Pa.map(S.Ya)).then(a);
        }
        var S = { Pa: [], Qa: [], bb: [], Ma: {}, Wa() {
          D ? (S.receiveObjectTransfer = S.jb, S.threadInitTLS = S.ab, S.setExitStatus = S.$a) : Ra();
        }, $a: (a) => L = a, tb: ["$terminateWorker"], lb: () => {
          for (var a of S.Qa)
            Fa(a);
          for (a of S.Pa)
            Fa(a);
          S.Pa = [];
          S.Qa = [];
          S.Ma = [];
        }, Za: (a) => {
          var b = a.Oa;
          delete S.Ma[b];
          S.Pa.push(a);
          S.Qa.splice(S.Qa.indexOf(a), 1);
          a.Oa = 0;
          Ta(b);
        }, jb() {
        }, ab() {
          S.bb.forEach((a) => a());
        }, Ya: (a) => new Promise((b) => {
          a.onmessage = (h) => {
            h = h.data;
            var k = h.cmd;
            if (h.targetThread && h.targetThread != W()) {
              var t = S.Ma[h.targetThread];
              t ? t.postMessage(h, h.transferList) : J(`Internal error! Worker sent a message "${k}" to target pthread ${h.targetThread}, but that thread no longer exists!`);
            } else if ("checkMailbox" === k)
              X();
            else if ("spawnThread" === k)
              Ha(h);
            else if ("cleanupThread" === k)
              S.Za(S.Ma[h.thread]);
            else if ("killThread" === k)
              h = h.thread, k = S.Ma[h], delete S.Ma[h], Fa(k), Ta(h), S.Qa.splice(S.Qa.indexOf(k), 1), k.Oa = 0;
            else if ("cancelThread" === k)
              S.Ma[h.thread].postMessage({ cmd: "cancel" });
            else if ("loaded" === k)
              a.loaded = true, B && !a.Oa && a.unref(), b(a);
            else if ("alert" === k)
              alert(`Thread ${h.threadId}: ${h.text}`);
            else if ("setimmediate" === h.target)
              a.postMessage(h);
            else if ("callHandler" === k)
              v[h.handler](...h.args);
            else
              k && J(`worker sent an unknown command ${k}`);
          };
          a.onerror = (h) => {
            J(`${"worker sent an error!"} ${h.filename}:${h.lineno}: ${h.message}`);
            throw h;
          };
          B && (a.on("message", (h) => a.onmessage({ data: h })), a.on("error", (h) => a.onerror(h)));
          var c = [], d = ["onExit"], g;
          for (g of d)
            v.hasOwnProperty(g) && c.push(g);
          a.postMessage({ cmd: "load", handlers: c, urlOrBlob: v.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: sa });
        }) };
        v.PThread = S;
        var Ua = (a) => {
          for (; 0 < a.length; )
            a.shift()(v);
        };
        v.establishStackSpace = () => {
          var a = W(), b = r()[a + 52 >>> 2 >>> 0];
          a = r()[a + 56 >>> 2 >>> 0];
          Va(b, b - a);
          U(b);
        };
        function Pa(a) {
          if (D)
            return V(1, 0, a);
          Qa(a);
        }
        var Wa = [], Xa;
        v.invokeEntryPoint = (a, b) => {
          var c = Wa[a];
          c || (a >= Wa.length && (Wa.length = a + 1), Wa[a] = c = Xa.get(a));
          a = c(b);
          0 < T ? S.$a(a) : Ya(a);
        };
        function Za(a) {
          this.Va = a - 24;
          this.gb = function(b) {
            r()[this.Va + 4 >>> 2 >>> 0] = b;
          };
          this.fb = function(b) {
            r()[this.Va + 8 >>> 2 >>> 0] = b;
          };
          this.Wa = function(b, c) {
            this.eb();
            this.gb(b);
            this.fb(c);
          };
          this.eb = function() {
            r()[this.Va + 16 >>> 2 >>> 0] = 0;
          };
        }
        var $a = 0, ab = 0;
        function bb(a, b, c, d) {
          return D ? V(2, 1, a, b, c, d) : cb(a, b, c, d);
        }
        function cb(a, b, c, d) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return J("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var g = [];
          if (D && 0 === g.length)
            return bb(a, b, c, d);
          a = { kb: c, Oa: a, hb: d, qb: g };
          return D ? (a.sb = "spawnThread", postMessage(a, g), 0) : Ha(a);
        }
        function db(a, b, c) {
          return D ? V(3, 1, a, b, c) : 0;
        }
        function eb(a, b) {
          if (D)
            return V(4, 1, a, b);
        }
        var fb = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, gb = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var g = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var k = a.charCodeAt(h);
            if (55296 <= k && 57343 >= k) {
              var t = a.charCodeAt(++h);
              k = 65536 + ((k & 1023) << 10) | t & 1023;
            }
            if (127 >= k) {
              if (c >= d)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, hb = (a, b, c) => gb(a, n(), b, c);
        function ib(a, b) {
          if (D)
            return V(5, 1, a, b);
        }
        function jb(a, b, c) {
          if (D)
            return V(6, 1, a, b, c);
        }
        function kb(a, b, c) {
          return D ? V(7, 1, a, b, c) : 0;
        }
        function lb(a, b) {
          if (D)
            return V(8, 1, a, b);
        }
        function mb(a, b, c) {
          if (D)
            return V(9, 1, a, b, c);
        }
        function nb(a, b, c, d) {
          if (D)
            return V(10, 1, a, b, c, d);
        }
        function ob(a, b, c, d) {
          if (D)
            return V(11, 1, a, b, c, d);
        }
        function pb(a, b, c, d) {
          if (D)
            return V(12, 1, a, b, c, d);
        }
        function qb(a) {
          if (D)
            return V(13, 1, a);
        }
        function rb(a, b) {
          if (D)
            return V(14, 1, a, b);
        }
        function sb(a, b, c) {
          if (D)
            return V(15, 1, a, b, c);
        }
        function tb(a) {
          a >>>= 0;
          "function" === typeof Atomics.rb && (Atomics.rb(p(), a >>> 2, a).value.then(X), a += 128, Atomics.store(p(), a >>> 2, 1));
        }
        v.__emscripten_thread_mailbox_await = tb;
        var X = () => {
          var a = W();
          if (a && (tb(a), a = ub, !K))
            try {
              if (a(), !(0 < T))
                try {
                  D ? Ya(L) : Qa(L);
                } catch (b) {
                  b instanceof R || "unwind" == b || z(1, b);
                }
            } catch (b) {
              b instanceof R || "unwind" == b || z(1, b);
            }
        };
        v.checkMailbox = X;
        var vb = [], Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function yb(a, b, c, d, g, h, k, t) {
          return D ? V(16, 1, a, b, c, d, g, h, k, t) : -52;
        }
        function zb(a, b, c, d, g, h, k) {
          if (D)
            return V(17, 1, a, b, c, d, g, h, k);
        }
        var Bb = (a) => {
          var b = fb(a) + 1, c = Ab(b);
          c && hb(a, c, b);
          return c;
        }, Cb = [], Db = {}, Fb = () => {
          if (!Eb) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;
            for (b in Db)
              void 0 === Db[b] ? delete a[b] : a[b] = Db[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Eb = c;
          }
          return Eb;
        }, Eb;
        function Gb(a, b) {
          if (D)
            return V(18, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Fb().forEach((d, g) => {
            var h = b + c;
            g = r()[a + 4 * g >>> 2 >>> 0] = h;
            for (h = 0; h < d.length; ++h)
              aa()[g++ >>> 0 >>> 0] = d.charCodeAt(h);
            aa()[g >>> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }
        function Kb(a, b) {
          if (D)
            return V(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = Fb();
          r()[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((g) => d += g.length + 1);
          r()[b >>> 2 >>> 0] = d;
          return 0;
        }
        function Lb(a) {
          return D ? V(20, 1, a) : 52;
        }
        function Mb(a, b, c, d) {
          return D ? V(21, 1, a, b, c, d) : 52;
        }
        function Nb(a, b, c, d, g) {
          return D ? V(22, 1, a, b, c, d, g) : 70;
        }
        var Ob = [null, [], []];
        function Pb(a, b, c, d) {
          if (D)
            return V(23, 1, a, b, c, d);
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var g = 0, h = 0; h < c; h++) {
            var k = r()[b >>> 2 >>> 0], t = r()[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var C = 0; C < t; C++) {
              var w = n()[k + C >>> 0], y = Ob[a];
              0 === w || 10 === w ? ((1 === a ? qa : J)(Ja(y, 0)), y.length = 0) : y.push(w);
            }
            g += t;
          }
          r()[d >>> 2 >>> 0] = g;
          return 0;
        }
        var Qb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Rb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Sb(a) {
          var b = Array(fb(a) + 1);
          gb(a, b, 0, b.length);
          return b;
        }
        var Tb = (a, b) => {
          aa().set(a, b >>> 0);
        };
        function Ub(a, b, c, d) {
          function g(f, q, u) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )
              f = u[0] + f;
            return f;
          }
          function h(f, q) {
            return g(f, q, "0");
          }
          function k(f, q) {
            function u(Hb) {
              return 0 > Hb ? -1 : 0 < Hb ? 1 : 0;
            }
            var F;
            0 === (F = u(f.getFullYear() - q.getFullYear())) && 0 === (F = u(f.getMonth() - q.getMonth())) && (F = u(f.getDate() - q.getDate()));
            return F;
          }
          function t(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function C(f) {
            var q = f.Ra;
            for (f = new Date(new Date(f.Sa + 1900, 0, 1).getTime()); 0 < q; ) {
              var u = f.getMonth(), F = (Y(f.getFullYear()) ? Qb : Rb)[u];
              if (q > F - f.getDate())
                q -= F - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + q);
                break;
              }
            }
            u = new Date(f.getFullYear() + 1, 0, 4);
            q = t(new Date(
              f.getFullYear(),
              0,
              4
            ));
            u = t(u);
            return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var w = r()[d + 40 >>> 2 >>> 0];
          d = { ob: p()[d >>> 2 >>> 0], nb: p()[d + 4 >>> 2 >>> 0], Ta: p()[d + 8 >>> 2 >>> 0], Xa: p()[d + 12 >>> 2 >>> 0], Ua: p()[d + 16 >>> 2 >>> 0], Sa: p()[d + 20 >>> 2 >>> 0], Na: p()[d + 24 >>> 2 >>> 0], Ra: p()[d + 28 >>> 2 >>> 0], ub: p()[d + 32 >>> 2 >>> 0], mb: p()[d + 36 >>> 2 >>> 0], pb: w ? Q(w) : "" };
          c = Q(c);
          w = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var y in w)
            c = c.replace(new RegExp(y, "g"), w[y]);
          var Ib = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Jb = "January February March April May June July August September October November December".split(" ");
          w = {
            "%a": (f) => Ib[f.Na].substring(0, 3),
            "%A": (f) => Ib[f.Na],
            "%b": (f) => Jb[f.Ua].substring(0, 3),
            "%B": (f) => Jb[f.Ua],
            "%C": (f) => h((f.Sa + 1900) / 100 | 0, 2),
            "%d": (f) => h(f.Xa, 2),
            "%e": (f) => g(f.Xa, 2, " "),
            "%g": (f) => C(f).toString().substring(2),
            "%G": (f) => C(f),
            "%H": (f) => h(f.Ta, 2),
            "%I": (f) => {
              f = f.Ta;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return h(f, 2);
            },
            "%j": (f) => {
              for (var q = 0, u = 0; u <= f.Ua - 1; q += (Y(f.Sa + 1900) ? Qb : Rb)[u++])
                ;
              return h(f.Xa + q, 3);
            },
            "%m": (f) => h(f.Ua + 1, 2),
            "%M": (f) => h(f.nb, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Ta && 12 > f.Ta ? "AM" : "PM",
            "%S": (f) => h(f.ob, 2),
            "%t": () => "	",
            "%u": (f) => f.Na || 7,
            "%U": (f) => h(Math.floor((f.Ra + 7 - f.Na) / 7), 2),
            "%V": (f) => {
              var q = Math.floor((f.Ra + 7 - (f.Na + 6) % 7) / 7);
              2 >= (f.Na + 371 - f.Ra - 2) % 7 && q++;
              if (q)
                53 == q && (u = (f.Na + 371 - f.Ra) % 7, 4 == u || 3 == u && Y(f.Sa) || (q = 1));
              else {
                q = 52;
                var u = (f.Na + 7 - f.Ra - 1) % 7;
                (4 == u || 5 == u && Y(f.Sa % 400 - 1)) && q++;
              }
              return h(q, 2);
            },
            "%w": (f) => f.Na,
            "%W": (f) => h(Math.floor((f.Ra + 7 - (f.Na + 6) % 7) / 7), 2),
            "%y": (f) => (f.Sa + 1900).toString().substring(2),
            "%Y": (f) => f.Sa + 1900,
            "%z": (f) => {
              f = f.mb;
              var q = 0 <= f;
              f = Math.abs(f) / 60;
              return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.pb,
            "%%": () => "%"
          };
          c = c.replace(
            /%%/g,
            "\0\0"
          );
          for (y in w)
            c.includes(y) && (c = c.replace(new RegExp(y, "g"), w[y](d)));
          c = c.replace(/\0\0/g, "%");
          y = Sb(c);
          if (y.length > b)
            return 0;
          Tb(y, a);
          return y.length - 1;
        }
        S.Wa();
        var Vb = [Oa, Pa, bb, db, eb, ib, jb, kb, lb, mb, nb, ob, pb, qb, rb, sb, yb, zb, Gb, Kb, Lb, Mb, Nb, Pb], Zb = {
          b: function(a, b, c) {
            a >>>= 0;
            new Za(a).Wa(b >>> 0, c >>> 0);
            $a = a;
            ab++;
            throw $a;
          },
          L: function(a) {
            Wb(a >>> 0, !A, 1, !ka, 131072, false);
            S.ab();
          },
          j: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : S.Za(S.Ma[a]);
          },
          H: cb,
          h: db,
          S: eb,
          D: ib,
          F: jb,
          T: kb,
          Q: lb,
          J: mb,
          P: nb,
          n: ob,
          E: pb,
          B: qb,
          R: rb,
          C: sb,
          p: () => 1,
          z: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => X()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = S.Ma[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          I: function(a, b, c, d) {
            b >>>= 0;
            vb.length = c;
            d = d >>> 0 >>> 3;
            for (var g = 0; g < c; g++)
              vb[g] = ea()[d + g >>> 0];
            a = 0 > a ? Ea[-a - 1] : Vb[a];
            S.ib = b;
            b = a.apply(null, vb);
            S.ib = 0;
            return b;
          },
          K: tb,
          o: function(a) {
            B && S.Ma[a >>> 0].ref();
          },
          s: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >>> 2 >>> 0] = a.getUTCSeconds();
            p()[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            p()[c + 8 >>> 2 >>> 0] = a.getUTCHours();
            p()[c + 12 >>> 2 >>> 0] = a.getUTCDate();
            p()[c + 16 >>> 2 >>> 0] = a.getUTCMonth();
            p()[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            p()[c + 24 >>> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            p()[c + 28 >>> 2 >>> 0] = a;
          },
          t: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >>> 2 >>> 0] = a.getSeconds();
            p()[c + 4 >>> 2 >>> 0] = a.getMinutes();
            p()[c + 8 >>> 2 >>> 0] = a.getHours();
            p()[c + 12 >>> 2 >>> 0] = a.getDate();
            p()[c + 16 >>> 2 >>> 0] = a.getMonth();
            p()[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            p()[c + 24 >>> 2 >>> 0] = a.getDay();
            b = (Y(a.getFullYear()) ? wb : xb)[a.getMonth()] + a.getDate() - 1 | 0;
            p()[c + 28 >>> 2 >>> 0] = b;
            p()[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
            p()[c + 32 >>> 2 >>> 0] = a;
          },
          u: function(a) {
            a >>>= 0;
            var b = new Date(p()[a + 20 >>> 2 >>> 0] + 1900, p()[a + 16 >>> 2 >>> 0], p()[a + 12 >>> 2 >>> 0], p()[a + 8 >>> 2 >>> 0], p()[a + 4 >>> 2 >>> 0], p()[a >>> 2 >>> 0], 0), c = p()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(
              b.getFullYear(),
              0,
              1
            ).getTimezoneOffset(), k = Math.min(h, g);
            0 > c ? p()[a + 32 >>> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));
            p()[a + 24 >>> 2 >>> 0] = b.getDay();
            c = (Y(b.getFullYear()) ? wb : xb)[b.getMonth()] + b.getDate() - 1 | 0;
            p()[a + 28 >>> 2 >>> 0] = c;
            p()[a >>> 2 >>> 0] = b.getSeconds();
            p()[a + 4 >>> 2 >>> 0] = b.getMinutes();
            p()[a + 8 >>> 2 >>> 0] = b.getHours();
            p()[a + 12 >>> 2 >>> 0] = b.getDate();
            p()[a + 16 >>> 2 >>> 0] = b.getMonth();
            p()[a + 20 >>> 2 >>> 0] = b.getYear();
            a = b.getTime();
            isNaN(a) ? (p()[Xb() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
            return Yb((P = a, 1 <= +Math.abs(P) ? 0 < P ? +Math.floor(P / 4294967296) >>> 0 : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          q: yb,
          r: zb,
          y: function(a, b, c) {
            function d(w) {
              return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var t = k.getTimezoneOffset(), C = Math.max(g, t);
            r()[a >>> 2 >>> 0] = 60 * C;
            p()[b >>> 2 >>> 0] = Number(g != t);
            a = d(h);
            b = d(k);
            a = Bb(a);
            b = Bb(b);
            t < g ? (r()[c >>> 2 >>> 0] = a, r()[c + 4 >>> 2 >>> 0] = b) : (r()[c >>> 2 >>> 0] = b, r()[c + 4 >>> 2 >>> 0] = a);
          },
          c: () => {
            ra("");
          },
          O: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            Cb.length = 0;
            for (var d; d = n()[b++ >>> 0]; ) {
              var g = 105 != d;
              g &= 112 != d;
              c += g && c % 8 ? 4 : 0;
              Cb.push(112 == d ? r()[c >>> 2 >>> 0] : 105 == d ? p()[c >>> 2 >>> 0] : ea()[c >>> 3 >>> 0]);
              c += g ? 8 : 4;
            }
            return Ea[a].apply(null, Cb);
          },
          k: () => {
          },
          i: () => Date.now(),
          U: () => {
            T += 1;
            throw "unwind";
          },
          A: function() {
            return 4294901760;
          },
          e: () => performance.timeOrigin + performance.now(),
          f: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
          x: function(a) {
            a >>>= 0;
            var b = n().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var g = Math;
              d = Math.max(a, d);
              a: {
                g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535) / 65536;
                try {
                  e.grow(g);
                  m();
                  var h = 1;
                  break a;
                } catch (k) {
                }
                h = void 0;
              }
              if (h)
                return true;
            }
            return false;
          },
          M: Gb,
          N: Kb,
          G: Qa,
          g: Lb,
          m: Mb,
          v: Nb,
          l: Pb,
          a: e || v.wasmMemory,
          w: Ub,
          d: function(a, b, c, d) {
            return Ub(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          }
        }, Z = function() {
          function a(c, d) {
            Z = c.exports;
            Z = $b();
            S.bb.push(Z.za);
            Xa = Z.Aa;
            va.unshift(Z.V);
            sa = d;
            ya();
            return Z;
          }
          var b = { a: Zb };
          M++;
          if (v.instantiateWasm)
            try {
              return v.instantiateWasm(b, a);
            } catch (c) {
              J(`Module.instantiateWasm callback failed with error: ${c}`), x(c);
            }
          Da(b, function(c) {
            a(c.instance, c.module);
          }).catch(x);
          return {};
        }();
        v._OrtInit = (a, b) => (v._OrtInit = Z.W)(a, b);
        v._OrtGetLastError = (a, b) => (v._OrtGetLastError = Z.X)(a, b);
        v._OrtCreateSessionOptions = (a, b, c, d, g, h, k, t, C, w) => (v._OrtCreateSessionOptions = Z.Y)(a, b, c, d, g, h, k, t, C, w);
        v._OrtAppendExecutionProvider = (a, b) => (v._OrtAppendExecutionProvider = Z.Z)(a, b);
        v._OrtAddFreeDimensionOverride = (a, b, c) => (v._OrtAddFreeDimensionOverride = Z._)(a, b, c);
        v._OrtAddSessionConfigEntry = (a, b, c) => (v._OrtAddSessionConfigEntry = Z.$)(a, b, c);
        v._OrtReleaseSessionOptions = (a) => (v._OrtReleaseSessionOptions = Z.aa)(a);
        v._OrtCreateSession = (a, b, c) => (v._OrtCreateSession = Z.ba)(a, b, c);
        v._OrtReleaseSession = (a) => (v._OrtReleaseSession = Z.ca)(a);
        v._OrtGetInputOutputCount = (a, b, c) => (v._OrtGetInputOutputCount = Z.da)(a, b, c);
        v._OrtGetInputName = (a, b) => (v._OrtGetInputName = Z.ea)(a, b);
        v._OrtGetOutputName = (a, b) => (v._OrtGetOutputName = Z.fa)(a, b);
        v._OrtFree = (a) => (v._OrtFree = Z.ga)(a);
        v._OrtCreateTensor = (a, b, c, d, g, h) => (v._OrtCreateTensor = Z.ha)(a, b, c, d, g, h);
        v._OrtGetTensorData = (a, b, c, d, g) => (v._OrtGetTensorData = Z.ia)(a, b, c, d, g);
        v._OrtReleaseTensor = (a) => (v._OrtReleaseTensor = Z.ja)(a);
        v._OrtCreateRunOptions = (a, b, c, d) => (v._OrtCreateRunOptions = Z.ka)(a, b, c, d);
        v._OrtAddRunConfigEntry = (a, b, c) => (v._OrtAddRunConfigEntry = Z.la)(a, b, c);
        v._OrtReleaseRunOptions = (a) => (v._OrtReleaseRunOptions = Z.ma)(a);
        v._OrtCreateBinding = (a) => (v._OrtCreateBinding = Z.na)(a);
        v._OrtBindInput = (a, b, c) => (v._OrtBindInput = Z.oa)(a, b, c);
        v._OrtBindOutput = (a, b, c, d) => (v._OrtBindOutput = Z.pa)(a, b, c, d);
        v._OrtClearBoundOutputs = (a) => (v._OrtClearBoundOutputs = Z.qa)(a);
        v._OrtReleaseBinding = (a) => (v._OrtReleaseBinding = Z.ra)(a);
        v._OrtRunWithBinding = (a, b, c, d, g) => (v._OrtRunWithBinding = Z.sa)(a, b, c, d, g);
        v._OrtRun = (a, b, c, d, g, h, k, t) => (v._OrtRun = Z.ta)(a, b, c, d, g, h, k, t);
        v._OrtEndProfiling = (a) => (v._OrtEndProfiling = Z.ua)(a);
        var Xb = () => (Xb = Z.va)(), W = v._pthread_self = () => (W = v._pthread_self = Z.wa)(), Ab = v._malloc = (a) => (Ab = v._malloc = Z.xa)(a);
        v._free = (a) => (v._free = Z.ya)(a);
        v.__emscripten_tls_init = () => (v.__emscripten_tls_init = Z.za)();
        var Wb = v.__emscripten_thread_init = (a, b, c, d, g, h) => (Wb = v.__emscripten_thread_init = Z.Ba)(a, b, c, d, g, h);
        v.__emscripten_thread_crashed = () => (v.__emscripten_thread_crashed = Z.Ca)();
        var Na = (a, b, c, d) => (Na = Z.Da)(a, b, c, d), Ta = (a) => (Ta = Z.Ea)(a), Ya = v.__emscripten_thread_exit = (a) => (Ya = v.__emscripten_thread_exit = Z.Fa)(a), ub = () => (ub = Z.Ga)(), Yb = (a) => (Yb = Z.Ha)(a), Va = (a, b) => (Va = Z.Ia)(a, b), Ka = () => (Ka = Z.Ja)(), U = (a) => (U = Z.Ka)(a), Ma = (a) => (Ma = Z.La)(a);
        function $b() {
          var a = Z;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;
          a.va = b(a.va);
          a.wa = b(a.wa);
          a.xa = c(a.xa);
          a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);
          a.Ja = b(a.Ja);
          a.La = c(a.La);
          return a;
        }
        v.wasmMemory = e;
        v.stackAlloc = Ma;
        v.stackSave = Ka;
        v.stackRestore = U;
        v.keepRuntimeAlive = () => 0 < T;
        v.UTF8ToString = Q;
        v.stringToUTF8 = hb;
        v.lengthBytesUTF8 = fb;
        v.ExitStatus = R;
        v.PThread = S;
        var ac;
        N = function bc() {
          ac || cc();
          ac || (N = bc);
        };
        function cc() {
          if (!(0 < M))
            if (D)
              ha(v), D || Ua(va), startWorker(v);
            else {
              if (v.preRun)
                for ("function" == typeof v.preRun && (v.preRun = [v.preRun]); v.preRun.length; )
                  ua.unshift(v.preRun.shift());
              Ua(ua);
              0 < M || ac || (ac = true, v.calledRun = true, K || (D || Ua(va), ha(v), D || Ua(wa)));
            }
        }
        cc();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module2) {
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (true) {
      ortWasmFactory = require_ort_training_wasm_simd();
    } else {
      ortWasmFactory = true ? null : null;
    }
    ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = (numThreads) => {
      if (numThreads === 1) {
        return false;
      }
      if (typeof SharedArrayBuffer === "undefined") {
        if (typeof self !== "undefined" && !self.crossOriginIsolated) {
          console.warn(
            "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."
          );
        }
        return false;
      }
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        console.warn(
          "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."
        );
      }
      try {
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          5,
          4,
          1,
          3,
          1,
          1,
          10,
          11,
          1,
          9,
          0,
          65,
          0,
          254,
          16,
          2,
          0,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          10,
          30,
          1,
          28,
          0,
          65,
          0,
          253,
          15,
          253,
          12,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          253,
          186,
          1,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (true) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = isMultiThreadSupported(numThreads);
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  require_ort_wasm_threaded_worker()
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (useThreads) {
          config.numThreads = numThreads;
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        factory(config).then(
          // wasm module initialized successfully
          (module2) => {
            initializing = false;
            initialized = true;
            wasm = module2;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.enableGraphCapture !== void 0) {
          if (typeof sessionOptions.enableGraphCapture !== "boolean") {
            throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);
          }
          const keyDataOffset = allocWasmString("enableGraphCapture", allocs);
          const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);
          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
            checkLastError(
              `Can't set a session config entry: 'enableGraphCapture' - ${sessionOptions.enableGraphCapture}.`
            );
          }
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";
    dataLocationStringToEnum = (location) => {
      switch (location) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_fs();
    init_promises();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          try {
            return new Uint8Array(await readFile2(file));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e;
          }
        } else {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`failed to load external data file: ${file}`);
          }
          const contentLengthHeader = response.headers.get("Content-Length");
          const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
          if (fileSize < 1073741824) {
            return new Uint8Array(await response.arrayBuffer());
          } else {
            if (!response.body) {
              throw new Error(`failed to load external data file: ${file}, no response body.`);
            }
            const reader = response.body.getReader();
            let buffer;
            try {
              buffer = new ArrayBuffer(fileSize);
            } catch (e) {
              if (e instanceof RangeError) {
                const pages = Math.ceil(fileSize / 65536);
                buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
              } else {
                throw e;
              }
            }
            let offset = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              const chunkSize = value.byteLength;
              const chunk = new Uint8Array(buffer, offset, chunkSize);
              chunk.set(value);
              offset += chunkSize;
            }
            return new Uint8Array(buffer, 0, fileSize);
          }
        }
      } else if (file instanceof Blob) {
        return new Uint8Array(await file.arrayBuffer());
      } else if (file instanceof Uint8Array) {
        return file;
      } else {
        return new Uint8Array(file);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    init_wasm_utils_load_file();
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
    };
    initEp = async (env3, epName) => {
      if (false) {
        const initJsep = null.init;
        if (epName === "webgpu") {
          if (typeof navigator === "undefined" || !navigator.gpu) {
            throw new Error("WebGPU is not supported in current environment");
          }
          let adapter = env3.webgpu.adapter;
          if (!adapter) {
            const powerPreference = env3.webgpu.powerPreference;
            if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {
              throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);
            }
            const forceFallbackAdapter = env3.webgpu.forceFallbackAdapter;
            if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {
              throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);
            }
            adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });
            if (!adapter) {
              throw new Error(
                'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
              );
            }
          } else {
            if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {
              throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
            }
          }
          if (!env3.wasm.simd) {
            throw new Error(
              "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
            );
          }
          await initJsep("webgpu", getInstance(), env3, adapter);
        }
        if (epName === "webnn") {
          if (typeof navigator === "undefined" || !navigator.ml) {
            throw new Error("WebNN is not supported in current environment");
          }
          await initJsep("webnn", getInstance(), env3);
        }
      }
    };
    activeSessions = /* @__PURE__ */ new Map();
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    copyFromExternalBuffer = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSession = async (modelData, options) => {
      let modelDataOffset, modelDataLength;
      const wasm2 = getInstance();
      if (Array.isArray(modelData)) {
        [modelDataOffset, modelDataLength] = modelData;
      } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
        [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
      } else {
        [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
      }
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
              wasm2.mountExternalData(path, data);
            }));
          }
          await Promise.all(loadingPromises);
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const enableGraphCapture = !!options?.enableGraphCapture;
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            if (enableGraphCapture && options?.preferredOutputLocation === void 0) {
              outputPreferredLocations.push("gpu-buffer");
              continue;
            }
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            if (enableGraphCapture && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
            }
            outputPreferredLocations.push(location);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(
          sessionHandle,
          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]
        );
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        wasm2.unmountExternalData?.();
      }
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;
      if (ioBindingState) {
        if (enableGraphCapture) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepOnReleaseSession?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (enableGraphCapture && location !== "gpu-buffer") {
        throw new Error(
          `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`
        );
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        const registerBuffer = wasm2.jsepRegisterBuffer;
        if (!registerBuffer) {
          throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        }
        rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const sessionHandle = session[0];
      const inputNamesUTF8Encoded = session[1];
      const outputNamesUTF8Encoded = session[2];
      const ioBindingState = session[3];
      const enableGraphCapture = session[4];
      const inputOutputBound = session[5];
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(
            inputTensors[i],
            inputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputIndices[i],
            enableGraphCapture
          );
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i],
            enableGraphCapture
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]
          );
        }
        wasm2.jsepOnRunStart?.(sessionHandle);
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const getBuffer = wasm2.jsepGetBuffer;
                if (!getBuffer) {
                  throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                }
                const gpuBuffer = getBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState && !enableGraphCapture) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]
          );
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
    extractTransferableBuffers = (tensors) => {
      const buffers = [];
      for (const tensor of tensors) {
        const data = tensor[2];
        if (!Array.isArray(data) && "buffer" in data) {
          buffers.push(data.buffer);
        }
      }
      return buffers;
    };
  }
});

// proxy-worker:./proxy-worker/main
var require_main = __commonJS({
  "proxy-worker:./proxy-worker/main"(exports, module2) {
    module2.exports = '/*!\n * ONNX Runtime Web v1.18.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    createReadStream: () => createReadStream,\n    readFile: () => readFile,\n    readFileSync: () => readFileSync\n  });\n  var readFile, readFileSync, createReadStream;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n      readFileSync = void 0;\n      createReadStream = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var e = moduleArg, k, l;\n          e.ready = new Promise((a, b) => {\n            k = a;\n            l = b;\n          });\n          var aa = Object.assign({}, e), ba = "./this.program", ca = "object" == typeof window, q = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, v = "", x, z, A;\n          if (da) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));\n            v = q ? B.dirname(v) + "/" : __dirname + "/";\n            x = (a, b) => {\n              a = C(a) ? new URL(a) : B.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            A = (a) => {\n              a = x(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            z = (a, b, c, d = true) => {\n              a = C(a) ? new URL(a) : B.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(d ? h.buffer : h);\n              });\n            };\n            !e.thisProgram && 1 < process.argv.length && (ba = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            e.inspect = () => "[Emscripten Module object]";\n          } else if (ca || q)\n            q ? v = self.location.href : "undefined" != typeof document && document.currentScript && (v = document.currentScript.src), _scriptDir && (v = _scriptDir), 0 !== v.indexOf("blob:") ? v = v.substr(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1) : v = "", x = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, q && (A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), z = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            };\n          var ea = console.log.bind(console), D = console.error.bind(console);\n          Object.assign(e, aa);\n          aa = null;\n          "object" != typeof WebAssembly && E("no native wasm support detected");\n          var F, fa = false, G, H, I, J, ha;\n          function ia() {\n            var a = F.buffer;\n            e.HEAP8 = G = new Int8Array(a);\n            e.HEAP16 = new Int16Array(a);\n            e.HEAPU8 = H = new Uint8Array(a);\n            e.HEAPU16 = new Uint16Array(a);\n            e.HEAP32 = I = new Int32Array(a);\n            e.HEAPU32 = J = new Uint32Array(a);\n            e.HEAPF32 = new Float32Array(a);\n            e.HEAPF64 = ha = new Float64Array(a);\n          }\n          var K = [], L = [], ja = [], M = 0, N = null, O = null;\n          function E(a) {\n            a = "Aborted(" + a + ")";\n            D(a);\n            fa = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          var ka = (a) => a.startsWith("data:application/octet-stream;base64,"), C = (a) => a.startsWith("file://"), P;\n          P = "ort-training-wasm-simd.wasm";\n          if (!ka(P)) {\n            var la = P;\n            P = e.locateFile ? e.locateFile(la, v) : v + la;\n          }\n          function ma(a) {\n            if (A)\n              return A(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function na(a) {\n            if (ca || q) {\n              if ("function" == typeof fetch && !C(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => ma(a));\n              if (z)\n                return new Promise((b, c) => {\n                  z(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => ma(a));\n          }\n          function oa(a, b, c) {\n            return na(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              D(`failed to asynchronously prepare wasm: ${d}`);\n              E(d);\n            });\n          }\n          function pa(a, b) {\n            var c = P;\n            return "function" != typeof WebAssembly.instantiateStreaming || ka(c) || C(c) || da || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              D(`wasm streaming compile failed: ${g}`);\n              D("falling back to ArrayBuffer instantiation");\n              return oa(c, a, b);\n            }));\n          }\n          var Q, qa = { 862704: (a, b, c, d) => {\n            if ("undefined" == typeof e || !e.Qa)\n              return 1;\n            a = R(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = e.Qa.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return H.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function ra(a) {\n            this.Ka = a - 24;\n            this.Pa = function(b) {\n              J[this.Ka + 4 >>> 2 >>> 0] = b;\n            };\n            this.Oa = function(b) {\n              J[this.Ka + 8 >>> 2 >>> 0] = b;\n            };\n            this.Ma = function(b, c) {\n              this.Na();\n              this.Pa(b);\n              this.Oa(c);\n            };\n            this.Na = function() {\n              J[this.Ka + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var sa = 0, ta = 0, ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, va = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && ua)\n              return ua.decode(a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, R = (a, b) => (a >>>= 0) ? va(H, a, b) : "", S = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, T = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var r = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | r & 1023;\n              }\n              if (127 >= m) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, U = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ca = (a) => {\n            var b = S(a) + 1, c = Ba(b);\n            c && T(a, H, c, b);\n            return c;\n          }, V = [], W = {}, Da = () => {\n            if (!X) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: ba || "./this.program" }, b;\n              for (b in W)\n                void 0 === W[b] ? delete a[b] : a[b] = W[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              X = c;\n            }\n            return X;\n          }, X, Ea = [null, [], []], Fa = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ga = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ha(a) {\n            var b = Array(S(a) + 1);\n            T(a, b, 0, b.length);\n            return b;\n          }\n          function Ia(a, b, c, d) {\n            function g(f, n, p) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = p[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function m(f, n) {\n              function p(ya) {\n                return 0 > ya ? -1 : 0 < ya ? 1 : 0;\n              }\n              var y;\n              0 === (y = p(f.getFullYear() - n.getFullYear())) && 0 === (y = p(f.getMonth() - n.getMonth())) && (y = p(f.getDate() - n.getDate()));\n              return y;\n            }\n            function r(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function w(f) {\n              var n = f.Ga;\n              for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = f.getMonth(), y = (U(f.getFullYear()) ? Fa : Ga)[p];\n                if (n > y - f.getDate())\n                  n -= y - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(f.getFullYear() + 1, 0, 4);\n              n = r(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              p = r(p);\n              return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var t = J[d + 40 >>> 2 >>> 0];\n            d = { Ta: I[d >>> 2 >>> 0], Sa: I[d + 4 >>> 2 >>> 0], Ia: I[d + 8 >>> 2 >>> 0], La: I[d + 12 >>> 2 >>> 0], Ja: I[d + 16 >>> 2 >>> 0], Ha: I[d + 20 >>> 2 >>> 0], Ba: I[d + 24 >>> 2 >>> 0], Ga: I[d + 28 >>> 2 >>> 0], Va: I[d + 32 >>> 2 >>> 0], Ra: I[d + 36 >>> 2 >>> 0], Ua: t ? R(t) : "" };\n            c = R(c);\n            t = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var u in t)\n              c = c.replace(new RegExp(u, "g"), t[u]);\n            var za = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Aa = "January February March April May June July August September October November December".split(" ");\n            t = {\n              "%a": (f) => za[f.Ba].substring(0, 3),\n              "%A": (f) => za[f.Ba],\n              "%b": (f) => Aa[f.Ja].substring(0, 3),\n              "%B": (f) => Aa[f.Ja],\n              "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2),\n              "%d": (f) => h(f.La, 2),\n              "%e": (f) => g(f.La, 2, " "),\n              "%g": (f) => w(f).toString().substring(2),\n              "%G": (f) => w(f),\n              "%H": (f) => h(f.Ia, 2),\n              "%I": (f) => {\n                f = f.Ia;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return h(f, 2);\n              },\n              "%j": (f) => {\n                for (var n = 0, p = 0; p <= f.Ja - 1; n += (U(f.Ha + 1900) ? Fa : Ga)[p++])\n                  ;\n                return h(f.La + n, 3);\n              },\n              "%m": (f) => h(f.Ja + 1, 2),\n              "%M": (f) => h(f.Sa, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM",\n              "%S": (f) => h(f.Ta, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Ba || 7,\n              "%U": (f) => h(\n                Math.floor((f.Ga + 7 - f.Ba) / 7),\n                2\n              ),\n              "%V": (f) => {\n                var n = Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7);\n                2 >= (f.Ba + 371 - f.Ga - 2) % 7 && n++;\n                if (n)\n                  53 == n && (p = (f.Ba + 371 - f.Ga) % 7, 4 == p || 3 == p && U(f.Ha) || (n = 1));\n                else {\n                  n = 52;\n                  var p = (f.Ba + 7 - f.Ga - 1) % 7;\n                  (4 == p || 5 == p && U(f.Ha % 400 - 1)) && n++;\n                }\n                return h(n, 2);\n              },\n              "%w": (f) => f.Ba,\n              "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Ba + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Ha + 1900).toString().substring(2),\n              "%Y": (f) => f.Ha + 1900,\n              "%z": (f) => {\n                f = f.Ra;\n                var n = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.Ua,\n              "%%": () => "%"\n            };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (u in t)\n              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            u = Ha(c);\n            if (u.length > b)\n              return 0;\n            G.set(u, a >>> 0);\n            return u.length - 1;\n          }\n          var La = { a: function(a, b, c) {\n            a >>>= 0;\n            new ra(a).Ma(b >>> 0, c >>> 0);\n            sa = a;\n            ta++;\n            throw sa;\n          }, e: function() {\n            return 0;\n          }, H: function() {\n          }, x: function() {\n          }, z: function() {\n          }, J: function() {\n            return 0;\n          }, F: function() {\n          }, A: function() {\n          }, E: function() {\n          }, g: function() {\n          }, y: function() {\n          }, v: function() {\n          }, G: function() {\n          }, w: function() {\n          }, k: () => 1, n: function(a, b, c) {\n            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n            c >>>= 0;\n            a = new Date(1e3 * a);\n            I[c >>> 2 >>> 0] = a.getUTCSeconds();\n            I[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n            I[c + 8 >>> 2 >>> 0] = a.getUTCHours();\n            I[c + 12 >>> 2 >>> 0] = a.getUTCDate();\n            I[c + 16 >>> 2 >>> 0] = a.getUTCMonth();\n            I[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n            I[c + 24 >>> 2 >>> 0] = a.getUTCDay();\n            I[c + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n          }, o: function(a, b, c) {\n            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n            c >>>= 0;\n            a = new Date(1e3 * a);\n            I[c >>> 2 >>> 0] = a.getSeconds();\n            I[c + 4 >>> 2 >>> 0] = a.getMinutes();\n            I[c + 8 >>> 2 >>> 0] = a.getHours();\n            I[c + 12 >>> 2 >>> 0] = a.getDate();\n            I[c + 16 >>> 2 >>> 0] = a.getMonth();\n            I[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n            I[c + 24 >>> 2 >>> 0] = a.getDay();\n            I[c + 28 >>> 2 >>> 0] = (U(a.getFullYear()) ? wa : xa)[a.getMonth()] + a.getDate() - 1 | 0;\n            I[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n            I[c + 32 >>> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n          }, p: function(a) {\n            a >>>= 0;\n            var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n            0 > c ? I[a + 32 >>> 2 >>> 0] = Number(g != h && m == d) : 0 < c != (m == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));\n            I[a + 24 >>> 2 >>> 0] = b.getDay();\n            I[a + 28 >>> 2 >>> 0] = (U(b.getFullYear()) ? wa : xa)[b.getMonth()] + b.getDate() - 1 | 0;\n            I[a >>> 2 >>> 0] = b.getSeconds();\n            I[a + 4 >>> 2 >>> 0] = b.getMinutes();\n            I[a + 8 >>> 2 >>> 0] = b.getHours();\n            I[a + 12 >>> 2 >>> 0] = b.getDate();\n            I[a + 16 >>> 2 >>> 0] = b.getMonth();\n            I[a + 20 >>> 2 >>> 0] = b.getYear();\n            a = b.getTime();\n            isNaN(a) ? (I[Ja() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;\n            return Ka((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n          }, l: function() {\n            return -52;\n          }, m: function() {\n          }, t: function(a, b, c) {\n            function d(w) {\n              return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n            }\n            c >>>= 0;\n            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n            g = h.getTimezoneOffset();\n            var r = m.getTimezoneOffset();\n            J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(g, r);\n            I[b >>> 0 >>> 2 >>> 0] = Number(g != r);\n            a = d(h);\n            b = d(m);\n            a = Ca(a);\n            b = Ca(b);\n            r < g ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);\n          }, d: () => {\n            E("");\n          }, B: function(a, b, c) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            V.length = 0;\n            for (var d; d = H[b++ >>> 0]; ) {\n              var g = 105 != d;\n              g &= 112 != d;\n              c += g && c % 8 ? 4 : 0;\n              V.push(112 == d ? J[c >>> 2 >>> 0] : 105 == d ? I[c >>> 2 >>> 0] : ha[c >>> 3 >>> 0]);\n              c += g ? 8 : 4;\n            }\n            return qa[a].apply(null, V);\n          }, h: () => Date.now(), u: function() {\n            return 4294901760;\n          }, b: () => performance.now(), I: function(a, b, c) {\n            b >>>= 0;\n            return H.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n          }, s: function(a) {\n            a >>>= 0;\n            var b = H.length;\n            if (4294901760 < a)\n              return false;\n            for (var c = 1; 4 >= c; c *= 2) {\n              var d = b * (1 + 0.2 / c);\n              d = Math.min(d, a + 100663296);\n              var g = Math;\n              d = Math.max(a, d);\n              a: {\n                g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - F.buffer.byteLength + 65535) / 65536;\n                try {\n                  F.grow(g);\n                  ia();\n                  var h = 1;\n                  break a;\n                } catch (m) {\n                }\n                h = void 0;\n              }\n              if (h)\n                return true;\n            }\n            return false;\n          }, C: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Da().forEach((d, g) => {\n              var h = b + c;\n              g = J[a + 4 * g >>> 2 >>> 0] = h;\n              for (h = 0; h < d.length; ++h)\n                G[g++ >>> 0 >>> 0] = d.charCodeAt(h);\n              G[g >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }, D: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = Da();\n            J[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((g) => d += g.length + 1);\n            J[b >>> 2 >>> 0] = d;\n            return 0;\n          }, f: () => 52, j: function() {\n            return 52;\n          }, q: function() {\n            return 70;\n          }, i: function(a, b, c, d) {\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var g = 0, h = 0; h < c; h++) {\n              var m = J[b >>> 2 >>> 0], r = J[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var w = 0; w < r; w++) {\n                var t = H[m + w >>> 0], u = Ea[a];\n                0 === t || 10 === t ? ((1 === a ? ea : D)(va(u, 0)), u.length = 0) : u.push(t);\n              }\n              g += r;\n            }\n            J[d >>> 2 >>> 0] = g;\n            return 0;\n          }, r: Ia, c: function(a, b, c, d) {\n            return Ia(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n          } }, Y = function() {\n            function a(c) {\n              Y = c.exports;\n              Y = Ma();\n              F = Y.K;\n              ia();\n              L.unshift(Y.L);\n              M--;\n              0 == M && (null !== N && (clearInterval(N), N = null), O && (c = O, O = null, c()));\n              return Y;\n            }\n            var b = { a: La };\n            M++;\n            if (e.instantiateWasm)\n              try {\n                return e.instantiateWasm(b, a);\n              } catch (c) {\n                D(`Module.instantiateWasm callback failed with error: ${c}`), l(c);\n              }\n            pa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          }();\n          e._OrtInit = (a, b) => (e._OrtInit = Y.M)(a, b);\n          e._OrtGetLastError = (a, b) => (e._OrtGetLastError = Y.N)(a, b);\n          e._OrtCreateSessionOptions = (a, b, c, d, g, h, m, r, w, t) => (e._OrtCreateSessionOptions = Y.O)(a, b, c, d, g, h, m, r, w, t);\n          e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = Y.P)(a, b);\n          e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = Y.Q)(a, b, c);\n          e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = Y.R)(a, b, c);\n          e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = Y.S)(a);\n          e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = Y.T)(a, b, c);\n          e._OrtReleaseSession = (a) => (e._OrtReleaseSession = Y.U)(a);\n          e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = Y.V)(a, b, c);\n          e._OrtGetInputName = (a, b) => (e._OrtGetInputName = Y.W)(a, b);\n          e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = Y.X)(a, b);\n          e._OrtFree = (a) => (e._OrtFree = Y.Y)(a);\n          e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = Y.Z)(a, b, c, d, g, h);\n          e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = Y._)(a, b, c, d, g);\n          e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = Y.$)(a);\n          e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = Y.aa)(a, b, c, d);\n          e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = Y.ba)(a, b, c);\n          e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = Y.ca)(a);\n          e._OrtCreateBinding = (a) => (e._OrtCreateBinding = Y.da)(a);\n          e._OrtBindInput = (a, b, c) => (e._OrtBindInput = Y.ea)(a, b, c);\n          e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = Y.fa)(a, b, c, d);\n          e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = Y.ga)(a);\n          e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = Y.ha)(a);\n          e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = Y.ia)(a, b, c, d, g);\n          e._OrtRun = (a, b, c, d, g, h, m, r) => (e._OrtRun = Y.ja)(a, b, c, d, g, h, m, r);\n          e._OrtEndProfiling = (a) => (e._OrtEndProfiling = Y.ka)(a);\n          e._OrtTrainingLoadCheckpoint = (a, b) => (e._OrtTrainingLoadCheckpoint = Y.la)(a, b);\n          e._OrtTrainingReleaseCheckpoint = (a) => (e._OrtTrainingReleaseCheckpoint = Y.ma)(a);\n          e._OrtTrainingCreateSession = (a, b, c, d, g, h, m, r) => (e._OrtTrainingCreateSession = Y.na)(a, b, c, d, g, h, m, r);\n          e._OrtTrainingLazyResetGrad = (a) => (e._OrtTrainingLazyResetGrad = Y.oa)(a);\n          e._OrtTrainingRunTrainStep = (a, b, c, d, g, h) => (e._OrtTrainingRunTrainStep = Y.pa)(a, b, c, d, g, h);\n          e._OrtTrainingOptimizerStep = (a, b) => (e._OrtTrainingOptimizerStep = Y.qa)(a, b);\n          e._OrtTrainingEvalStep = (a, b, c, d, g, h) => (e._OrtTrainingEvalStep = Y.ra)(a, b, c, d, g, h);\n          e._OrtTrainingGetParametersSize = (a, b, c) => (e._OrtTrainingGetParametersSize = Y.sa)(a, b, c);\n          e._OrtTrainingCopyParametersToBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersToBuffer = Y.ta)(a, b, c, d);\n          e._OrtTrainingCopyParametersFromBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersFromBuffer = Y.ua)(a, b, c, d);\n          e._OrtTrainingGetModelInputOutputCount = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputCount = Y.va)(a, b, c, d);\n          e._OrtTrainingGetModelInputOutputName = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputName = Y.wa)(a, b, c, d);\n          e._OrtTrainingReleaseSession = (a) => (e._OrtTrainingReleaseSession = Y.xa)(a);\n          var Ja = () => (Ja = Y.ya)(), Ba = e._malloc = (a) => (Ba = e._malloc = Y.za)(a);\n          e._free = (a) => (e._free = Y.Aa)(a);\n          var Ka = (a) => (Ka = Y.Ca)(a), Na = () => (Na = Y.Da)(), Oa = (a) => (Oa = Y.Ea)(a), Pa = (a) => (Pa = Y.Fa)(a);\n          function Ma() {\n            var a = Y;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;\n            a.ya = b(a.ya);\n            a.za = c(a.za);\n            a.Da = b(a.Da);\n            a.Fa = c(a.Fa);\n            return a;\n          }\n          e.stackAlloc = Pa;\n          e.stackSave = Na;\n          e.stackRestore = Oa;\n          e.UTF8ToString = R;\n          e.stringToUTF8 = (a, b, c) => T(a, H, b, c);\n          e.lengthBytesUTF8 = S;\n          var Z;\n          O = function Qa() {\n            Z || Ra();\n            Z || (O = Qa);\n          };\n          function Ra() {\n            if (!(0 < M)) {\n              if (e.preRun)\n                for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; ) {\n                  var a = e.preRun.shift();\n                  K.unshift(a);\n                }\n              for (; 0 < K.length; )\n                K.shift()(e);\n              if (!(0 < M || Z || (Z = true, e.calledRun = true, fa))) {\n                for (; 0 < L.length; )\n                  L.shift()(e);\n                for (k(e); 0 < ja.length; )\n                  ja.shift()(e);\n              }\n            }\n          }\n          Ra();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            e.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            e.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            e.buffer != l.buffer && m();\n            return ca;\n          }\n          function r() {\n            e.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            e.buffer != l.buffer && m();\n            return fa;\n          }\n          var v = moduleArg, ha, x;\n          v.ready = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          });\n          var ia = Object.assign({}, v), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = v.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return v.locateFile ? v.locateFile(a, E) : E + a;\n          }\n          var ma, G, H;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (b, c) => {\n              b = I(b) ? new URL(b) : na.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            H = (b) => {\n              b = ma(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            G = (b, c, d, g = true) => {\n              b = I(b) ? new URL(b) : na.normalize(b);\n              fs.readFile(b, g ? void 0 : "utf8", (h, k) => {\n                h ? d(h) : c(g ? k.buffer : k);\n              });\n            };\n            !v.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            v.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (H = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), G = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = oa, J = pa;\n          Object.assign(v, ia);\n          ia = null;\n          "object" != typeof WebAssembly && ra("no native wasm support detected");\n          var e, sa, K = false, L, l, ba, ca, da, fa;\n          function m() {\n            var a = e.buffer;\n            v.HEAP8 = l = new Int8Array(a);\n            v.HEAP16 = new Int16Array(a);\n            v.HEAPU8 = ba = new Uint8Array(a);\n            v.HEAPU16 = new Uint16Array(a);\n            v.HEAP32 = ca = new Int32Array(a);\n            v.HEAPU32 = da = new Uint32Array(a);\n            v.HEAPF32 = new Float32Array(a);\n            v.HEAPF64 = fa = new Float64Array(a);\n          }\n          var ta = 16777216;\n          if (D)\n            e = v.wasmMemory;\n          else if (v.wasmMemory)\n            e = v.wasmMemory;\n          else if (e = new WebAssembly.Memory({ initial: ta / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))\n            throw J("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && J("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          ta = e.buffer.byteLength;\n          var ua = [], va = [], wa = [], M = 0, xa = null, N = null;\n          function ya() {\n            M--;\n            if (0 == M && (null !== xa && (clearInterval(xa), xa = null), N)) {\n              var a = N;\n              N = null;\n              a();\n            }\n          }\n          function ra(a) {\n            a = "Aborted(" + a + ")";\n            J(a);\n            K = true;\n            L = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          var za = (a) => a.startsWith("data:application/octet-stream;base64,"), I = (a) => a.startsWith("file://"), O;\n          O = "ort-wasm-threaded.wasm";\n          za(O) || (O = la(O));\n          function Aa(a) {\n            if (H)\n              return H(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ba(a) {\n            if (ka || A) {\n              if ("function" == typeof fetch && !I(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Aa(a));\n              if (G)\n                return new Promise((b, c) => {\n                  G(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Aa(a));\n          }\n          function Ca(a, b, c) {\n            return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              J(`failed to asynchronously prepare wasm: ${d}`);\n              ra(d);\n            });\n          }\n          function Da(a, b) {\n            var c = O;\n            return "function" != typeof WebAssembly.instantiateStreaming || za(c) || I(c) || B || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              J(`wasm streaming compile failed: ${g}`);\n              J("falling back to ArrayBuffer instantiation");\n              return Ca(c, a, b);\n            }));\n          }\n          var P, Ea = { 793116: (a, b, c, d) => {\n            if ("undefined" == typeof v || !v.cb)\n              return 1;\n            a = Q(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = v.cb.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return n().set(a.subarray(b, b + c), d >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function R(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Fa = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Ha = (a) => {\n            0 == S.Pa.length && (Ga(), S.Ya(S.Pa[0]));\n            var b = S.Pa.pop();\n            if (!b)\n              return 6;\n            S.Qa.push(b);\n            S.Ma[a.Oa] = b;\n            b.Oa = a.Oa;\n            var c = { cmd: "run", start_routine: a.kb, arg: a.hb, pthread_ptr: a.Oa };\n            B && b.unref();\n            b.postMessage(c, a.qb);\n            return 0;\n          }, T = 0, Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ia)\n              return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, Q = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "", La = (a) => {\n            var b = Ka();\n            a = a();\n            U(b);\n            return a;\n          };\n          function V(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return La(() => {\n              for (var g = Ma(8 * c), h = g >>> 3, k = 0; k < c; k++) {\n                var t = d[2 + k];\n                ea()[h + k >>> 0] = t;\n              }\n              return Na(a, c, g, b);\n            });\n          }\n          function Oa(a) {\n            if (D)\n              return V(0, 1, a);\n            L = a;\n            0 < T || (S.lb(), v.onExit?.(a), K = true);\n            z(a, new R(a));\n          }\n          var Qa = (a) => {\n            L = a;\n            if (D)\n              throw Pa(a), "unwind";\n            Oa(a);\n          };\n          function Ra() {\n            for (var a = v.numThreads; a--; )\n              Ga();\n            ua.unshift(() => {\n              M++;\n              Sa(() => ya());\n            });\n          }\n          function Ga() {\n            var a = la("ort-wasm-threaded.worker.js");\n            a = new Worker(a);\n            S.Pa.push(a);\n          }\n          function Sa(a) {\n            D ? a() : Promise.all(S.Pa.map(S.Ya)).then(a);\n          }\n          var S = { Pa: [], Qa: [], bb: [], Ma: {}, Wa() {\n            D ? (S.receiveObjectTransfer = S.jb, S.threadInitTLS = S.ab, S.setExitStatus = S.$a) : Ra();\n          }, $a: (a) => L = a, tb: ["$terminateWorker"], lb: () => {\n            for (var a of S.Qa)\n              Fa(a);\n            for (a of S.Pa)\n              Fa(a);\n            S.Pa = [];\n            S.Qa = [];\n            S.Ma = [];\n          }, Za: (a) => {\n            var b = a.Oa;\n            delete S.Ma[b];\n            S.Pa.push(a);\n            S.Qa.splice(S.Qa.indexOf(a), 1);\n            a.Oa = 0;\n            Ta(b);\n          }, jb() {\n          }, ab() {\n            S.bb.forEach((a) => a());\n          }, Ya: (a) => new Promise((b) => {\n            a.onmessage = (h) => {\n              h = h.data;\n              var k = h.cmd;\n              if (h.targetThread && h.targetThread != W()) {\n                var t = S.Ma[h.targetThread];\n                t ? t.postMessage(h, h.transferList) : J(`Internal error! Worker sent a message "${k}" to target pthread ${h.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === k)\n                X();\n              else if ("spawnThread" === k)\n                Ha(h);\n              else if ("cleanupThread" === k)\n                S.Za(S.Ma[h.thread]);\n              else if ("killThread" === k)\n                h = h.thread, k = S.Ma[h], delete S.Ma[h], Fa(k), Ta(h), S.Qa.splice(S.Qa.indexOf(k), 1), k.Oa = 0;\n              else if ("cancelThread" === k)\n                S.Ma[h.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === k)\n                a.loaded = true, B && !a.Oa && a.unref(), b(a);\n              else if ("alert" === k)\n                alert(`Thread ${h.threadId}: ${h.text}`);\n              else if ("setimmediate" === h.target)\n                a.postMessage(h);\n              else if ("callHandler" === k)\n                v[h.handler](...h.args);\n              else\n                k && J(`worker sent an unknown command ${k}`);\n            };\n            a.onerror = (h) => {\n              J(`${"worker sent an error!"} ${h.filename}:${h.lineno}: ${h.message}`);\n              throw h;\n            };\n            B && (a.on("message", (h) => a.onmessage({ data: h })), a.on("error", (h) => a.onerror(h)));\n            var c = [], d = ["onExit"], g;\n            for (g of d)\n              v.hasOwnProperty(g) && c.push(g);\n            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: v.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: sa });\n          }) };\n          v.PThread = S;\n          var Ua = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(v);\n          };\n          v.establishStackSpace = () => {\n            var a = W(), b = r()[a + 52 >>> 2 >>> 0];\n            a = r()[a + 56 >>> 2 >>> 0];\n            Va(b, b - a);\n            U(b);\n          };\n          function Pa(a) {\n            if (D)\n              return V(1, 0, a);\n            Qa(a);\n          }\n          var Wa = [], Xa;\n          v.invokeEntryPoint = (a, b) => {\n            var c = Wa[a];\n            c || (a >= Wa.length && (Wa.length = a + 1), Wa[a] = c = Xa.get(a));\n            a = c(b);\n            0 < T ? S.$a(a) : Ya(a);\n          };\n          function Za(a) {\n            this.Va = a - 24;\n            this.gb = function(b) {\n              r()[this.Va + 4 >>> 2 >>> 0] = b;\n            };\n            this.fb = function(b) {\n              r()[this.Va + 8 >>> 2 >>> 0] = b;\n            };\n            this.Wa = function(b, c) {\n              this.eb();\n              this.gb(b);\n              this.fb(c);\n            };\n            this.eb = function() {\n              r()[this.Va + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var $a = 0, ab = 0;\n          function bb(a, b, c, d) {\n            return D ? V(2, 1, a, b, c, d) : cb(a, b, c, d);\n          }\n          function cb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return J("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var g = [];\n            if (D && 0 === g.length)\n              return bb(a, b, c, d);\n            a = { kb: c, Oa: a, hb: d, qb: g };\n            return D ? (a.sb = "spawnThread", postMessage(a, g), 0) : Ha(a);\n          }\n          function db(a, b, c) {\n            return D ? V(3, 1, a, b, c) : 0;\n          }\n          function eb(a, b) {\n            if (D)\n              return V(4, 1, a, b);\n          }\n          var fb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, gb = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var t = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | t & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, hb = (a, b, c) => gb(a, n(), b, c);\n          function ib(a, b) {\n            if (D)\n              return V(5, 1, a, b);\n          }\n          function jb(a, b, c) {\n            if (D)\n              return V(6, 1, a, b, c);\n          }\n          function kb(a, b, c) {\n            return D ? V(7, 1, a, b, c) : 0;\n          }\n          function lb(a, b) {\n            if (D)\n              return V(8, 1, a, b);\n          }\n          function mb(a, b, c) {\n            if (D)\n              return V(9, 1, a, b, c);\n          }\n          function nb(a, b, c, d) {\n            if (D)\n              return V(10, 1, a, b, c, d);\n          }\n          function ob(a, b, c, d) {\n            if (D)\n              return V(11, 1, a, b, c, d);\n          }\n          function pb(a, b, c, d) {\n            if (D)\n              return V(12, 1, a, b, c, d);\n          }\n          function qb(a) {\n            if (D)\n              return V(13, 1, a);\n          }\n          function rb(a, b) {\n            if (D)\n              return V(14, 1, a, b);\n          }\n          function sb(a, b, c) {\n            if (D)\n              return V(15, 1, a, b, c);\n          }\n          function tb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.rb && (Atomics.rb(p(), a >>> 2, a).value.then(X), a += 128, Atomics.store(p(), a >>> 2, 1));\n          }\n          v.__emscripten_thread_mailbox_await = tb;\n          var X = () => {\n            var a = W();\n            if (a && (tb(a), a = ub, !K))\n              try {\n                if (a(), !(0 < T))\n                  try {\n                    D ? Ya(L) : Qa(L);\n                  } catch (b) {\n                    b instanceof R || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof R || "unwind" == b || z(1, b);\n              }\n          };\n          v.checkMailbox = X;\n          var vb = [], Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function yb(a, b, c, d, g, h, k, t) {\n            return D ? V(16, 1, a, b, c, d, g, h, k, t) : -52;\n          }\n          function zb(a, b, c, d, g, h, k) {\n            if (D)\n              return V(17, 1, a, b, c, d, g, h, k);\n          }\n          var Bb = (a) => {\n            var b = fb(a) + 1, c = Ab(b);\n            c && hb(a, c, b);\n            return c;\n          }, Cb = [], Db = {}, Fb = () => {\n            if (!Eb) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Db)\n                void 0 === Db[b] ? delete a[b] : a[b] = Db[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Eb = c;\n            }\n            return Eb;\n          }, Eb;\n          function Gb(a, b) {\n            if (D)\n              return V(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Fb().forEach((d, g) => {\n              var h = b + c;\n              g = r()[a + 4 * g >>> 2 >>> 0] = h;\n              for (h = 0; h < d.length; ++h)\n                aa()[g++ >>> 0 >>> 0] = d.charCodeAt(h);\n              aa()[g >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Kb(a, b) {\n            if (D)\n              return V(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Fb();\n            r()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((g) => d += g.length + 1);\n            r()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Lb(a) {\n            return D ? V(20, 1, a) : 52;\n          }\n          function Mb(a, b, c, d) {\n            return D ? V(21, 1, a, b, c, d) : 52;\n          }\n          function Nb(a, b, c, d, g) {\n            return D ? V(22, 1, a, b, c, d, g) : 70;\n          }\n          var Ob = [null, [], []];\n          function Pb(a, b, c, d) {\n            if (D)\n              return V(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var g = 0, h = 0; h < c; h++) {\n              var k = r()[b >>> 2 >>> 0], t = r()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var C = 0; C < t; C++) {\n                var w = n()[k + C >>> 0], y = Ob[a];\n                0 === w || 10 === w ? ((1 === a ? qa : J)(Ja(y, 0)), y.length = 0) : y.push(w);\n              }\n              g += t;\n            }\n            r()[d >>> 2 >>> 0] = g;\n            return 0;\n          }\n          var Qb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Rb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Sb(a) {\n            var b = Array(fb(a) + 1);\n            gb(a, b, 0, b.length);\n            return b;\n          }\n          var Tb = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Ub(a, b, c, d) {\n            function g(f, q, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )\n                f = u[0] + f;\n              return f;\n            }\n            function h(f, q) {\n              return g(f, q, "0");\n            }\n            function k(f, q) {\n              function u(Hb) {\n                return 0 > Hb ? -1 : 0 < Hb ? 1 : 0;\n              }\n              var F;\n              0 === (F = u(f.getFullYear() - q.getFullYear())) && 0 === (F = u(f.getMonth() - q.getMonth())) && (F = u(f.getDate() - q.getDate()));\n              return F;\n            }\n            function t(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function C(f) {\n              var q = f.Ra;\n              for (f = new Date(new Date(f.Sa + 1900, 0, 1).getTime()); 0 < q; ) {\n                var u = f.getMonth(), F = (Y(f.getFullYear()) ? Qb : Rb)[u];\n                if (q > F - f.getDate())\n                  q -= F - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + q);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              q = t(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = t(u);\n              return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var w = r()[d + 40 >>> 2 >>> 0];\n            d = { ob: p()[d >>> 2 >>> 0], nb: p()[d + 4 >>> 2 >>> 0], Ta: p()[d + 8 >>> 2 >>> 0], Xa: p()[d + 12 >>> 2 >>> 0], Ua: p()[d + 16 >>> 2 >>> 0], Sa: p()[d + 20 >>> 2 >>> 0], Na: p()[d + 24 >>> 2 >>> 0], Ra: p()[d + 28 >>> 2 >>> 0], ub: p()[d + 32 >>> 2 >>> 0], mb: p()[d + 36 >>> 2 >>> 0], pb: w ? Q(w) : "" };\n            c = Q(c);\n            w = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in w)\n              c = c.replace(new RegExp(y, "g"), w[y]);\n            var Ib = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Jb = "January February March April May June July August September October November December".split(" ");\n            w = {\n              "%a": (f) => Ib[f.Na].substring(0, 3),\n              "%A": (f) => Ib[f.Na],\n              "%b": (f) => Jb[f.Ua].substring(0, 3),\n              "%B": (f) => Jb[f.Ua],\n              "%C": (f) => h((f.Sa + 1900) / 100 | 0, 2),\n              "%d": (f) => h(f.Xa, 2),\n              "%e": (f) => g(f.Xa, 2, " "),\n              "%g": (f) => C(f).toString().substring(2),\n              "%G": (f) => C(f),\n              "%H": (f) => h(f.Ta, 2),\n              "%I": (f) => {\n                f = f.Ta;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return h(f, 2);\n              },\n              "%j": (f) => {\n                for (var q = 0, u = 0; u <= f.Ua - 1; q += (Y(f.Sa + 1900) ? Qb : Rb)[u++])\n                  ;\n                return h(f.Xa + q, 3);\n              },\n              "%m": (f) => h(f.Ua + 1, 2),\n              "%M": (f) => h(f.nb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Ta && 12 > f.Ta ? "AM" : "PM",\n              "%S": (f) => h(f.ob, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Na || 7,\n              "%U": (f) => h(Math.floor((f.Ra + 7 - f.Na) / 7), 2),\n              "%V": (f) => {\n                var q = Math.floor((f.Ra + 7 - (f.Na + 6) % 7) / 7);\n                2 >= (f.Na + 371 - f.Ra - 2) % 7 && q++;\n                if (q)\n                  53 == q && (u = (f.Na + 371 - f.Ra) % 7, 4 == u || 3 == u && Y(f.Sa) || (q = 1));\n                else {\n                  q = 52;\n                  var u = (f.Na + 7 - f.Ra - 1) % 7;\n                  (4 == u || 5 == u && Y(f.Sa % 400 - 1)) && q++;\n                }\n                return h(q, 2);\n              },\n              "%w": (f) => f.Na,\n              "%W": (f) => h(Math.floor((f.Ra + 7 - (f.Na + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Sa + 1900).toString().substring(2),\n              "%Y": (f) => f.Sa + 1900,\n              "%z": (f) => {\n                f = f.mb;\n                var q = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.pb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in w)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), w[y](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Sb(c);\n            if (y.length > b)\n              return 0;\n            Tb(y, a);\n            return y.length - 1;\n          }\n          S.Wa();\n          var Vb = [Oa, Pa, bb, db, eb, ib, jb, kb, lb, mb, nb, ob, pb, qb, rb, sb, yb, zb, Gb, Kb, Lb, Mb, Nb, Pb], Zb = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Za(a).Wa(b >>> 0, c >>> 0);\n              $a = a;\n              ab++;\n              throw $a;\n            },\n            L: function(a) {\n              Wb(a >>> 0, !A, 1, !ka, 131072, false);\n              S.ab();\n            },\n            j: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : S.Za(S.Ma[a]);\n            },\n            H: cb,\n            h: db,\n            S: eb,\n            D: ib,\n            F: jb,\n            T: kb,\n            Q: lb,\n            J: mb,\n            P: nb,\n            n: ob,\n            E: pb,\n            B: qb,\n            R: rb,\n            C: sb,\n            p: () => 1,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => X()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = S.Ma[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            I: function(a, b, c, d) {\n              b >>>= 0;\n              vb.length = c;\n              d = d >>> 0 >>> 3;\n              for (var g = 0; g < c; g++)\n                vb[g] = ea()[d + g >>> 0];\n              a = 0 > a ? Ea[-a - 1] : Vb[a];\n              S.ib = b;\n              b = a.apply(null, vb);\n              S.ib = 0;\n              return b;\n            },\n            K: tb,\n            o: function(a) {\n              B && S.Ma[a >>> 0].ref();\n            },\n            s: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >>> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >>> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >>> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >>> 2 >>> 0] = a;\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >>> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >>> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >>> 2 >>> 0] = a.getHours();\n              p()[c + 12 >>> 2 >>> 0] = a.getDate();\n              p()[c + 16 >>> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >>> 2 >>> 0] = a.getDay();\n              b = (Y(a.getFullYear()) ? wb : xb)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >>> 2 >>> 0] = b;\n              p()[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n              p()[c + 32 >>> 2 >>> 0] = a;\n            },\n            u: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >>> 2 >>> 0] + 1900, p()[a + 16 >>> 2 >>> 0], p()[a + 12 >>> 2 >>> 0], p()[a + 8 >>> 2 >>> 0], p()[a + 4 >>> 2 >>> 0], p()[a >>> 2 >>> 0], 0), c = p()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(\n                b.getFullYear(),\n                0,\n                1\n              ).getTimezoneOffset(), k = Math.min(h, g);\n              0 > c ? p()[a + 32 >>> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));\n              p()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? wb : xb)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >>> 2 >>> 0] = c;\n              p()[a >>> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >>> 2 >>> 0] = b.getHours();\n              p()[a + 12 >>> 2 >>> 0] = b.getDate();\n              p()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >>> 2 >>> 0] = b.getYear();\n              a = b.getTime();\n              isNaN(a) ? (p()[Xb() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;\n              return Yb((P = a, 1 <= +Math.abs(P) ? 0 < P ? +Math.floor(P / 4294967296) >>> 0 : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            q: yb,\n            r: zb,\n            y: function(a, b, c) {\n              function d(w) {\n                return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var t = k.getTimezoneOffset(), C = Math.max(g, t);\n              r()[a >>> 2 >>> 0] = 60 * C;\n              p()[b >>> 2 >>> 0] = Number(g != t);\n              a = d(h);\n              b = d(k);\n              a = Bb(a);\n              b = Bb(b);\n              t < g ? (r()[c >>> 2 >>> 0] = a, r()[c + 4 >>> 2 >>> 0] = b) : (r()[c >>> 2 >>> 0] = b, r()[c + 4 >>> 2 >>> 0] = a);\n            },\n            c: () => {\n              ra("");\n            },\n            O: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              Cb.length = 0;\n              for (var d; d = n()[b++ >>> 0]; ) {\n                var g = 105 != d;\n                g &= 112 != d;\n                c += g && c % 8 ? 4 : 0;\n                Cb.push(112 == d ? r()[c >>> 2 >>> 0] : 105 == d ? p()[c >>> 2 >>> 0] : ea()[c >>> 3 >>> 0]);\n                c += g ? 8 : 4;\n              }\n              return Ea[a].apply(null, Cb);\n            },\n            k: () => {\n            },\n            i: () => Date.now(),\n            U: () => {\n              T += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var g = Math;\n                d = Math.max(a, d);\n                a: {\n                  g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535) / 65536;\n                  try {\n                    e.grow(g);\n                    m();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            M: Gb,\n            N: Kb,\n            G: Qa,\n            g: Lb,\n            m: Mb,\n            v: Nb,\n            l: Pb,\n            a: e || v.wasmMemory,\n            w: Ub,\n            d: function(a, b, c, d) {\n              return Ub(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            function a(c, d) {\n              Z = c.exports;\n              Z = $b();\n              S.bb.push(Z.za);\n              Xa = Z.Aa;\n              va.unshift(Z.V);\n              sa = d;\n              ya();\n              return Z;\n            }\n            var b = { a: Zb };\n            M++;\n            if (v.instantiateWasm)\n              try {\n                return v.instantiateWasm(b, a);\n              } catch (c) {\n                J(`Module.instantiateWasm callback failed with error: ${c}`), x(c);\n              }\n            Da(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          }();\n          v._OrtInit = (a, b) => (v._OrtInit = Z.W)(a, b);\n          v._OrtGetLastError = (a, b) => (v._OrtGetLastError = Z.X)(a, b);\n          v._OrtCreateSessionOptions = (a, b, c, d, g, h, k, t, C, w) => (v._OrtCreateSessionOptions = Z.Y)(a, b, c, d, g, h, k, t, C, w);\n          v._OrtAppendExecutionProvider = (a, b) => (v._OrtAppendExecutionProvider = Z.Z)(a, b);\n          v._OrtAddFreeDimensionOverride = (a, b, c) => (v._OrtAddFreeDimensionOverride = Z._)(a, b, c);\n          v._OrtAddSessionConfigEntry = (a, b, c) => (v._OrtAddSessionConfigEntry = Z.$)(a, b, c);\n          v._OrtReleaseSessionOptions = (a) => (v._OrtReleaseSessionOptions = Z.aa)(a);\n          v._OrtCreateSession = (a, b, c) => (v._OrtCreateSession = Z.ba)(a, b, c);\n          v._OrtReleaseSession = (a) => (v._OrtReleaseSession = Z.ca)(a);\n          v._OrtGetInputOutputCount = (a, b, c) => (v._OrtGetInputOutputCount = Z.da)(a, b, c);\n          v._OrtGetInputName = (a, b) => (v._OrtGetInputName = Z.ea)(a, b);\n          v._OrtGetOutputName = (a, b) => (v._OrtGetOutputName = Z.fa)(a, b);\n          v._OrtFree = (a) => (v._OrtFree = Z.ga)(a);\n          v._OrtCreateTensor = (a, b, c, d, g, h) => (v._OrtCreateTensor = Z.ha)(a, b, c, d, g, h);\n          v._OrtGetTensorData = (a, b, c, d, g) => (v._OrtGetTensorData = Z.ia)(a, b, c, d, g);\n          v._OrtReleaseTensor = (a) => (v._OrtReleaseTensor = Z.ja)(a);\n          v._OrtCreateRunOptions = (a, b, c, d) => (v._OrtCreateRunOptions = Z.ka)(a, b, c, d);\n          v._OrtAddRunConfigEntry = (a, b, c) => (v._OrtAddRunConfigEntry = Z.la)(a, b, c);\n          v._OrtReleaseRunOptions = (a) => (v._OrtReleaseRunOptions = Z.ma)(a);\n          v._OrtCreateBinding = (a) => (v._OrtCreateBinding = Z.na)(a);\n          v._OrtBindInput = (a, b, c) => (v._OrtBindInput = Z.oa)(a, b, c);\n          v._OrtBindOutput = (a, b, c, d) => (v._OrtBindOutput = Z.pa)(a, b, c, d);\n          v._OrtClearBoundOutputs = (a) => (v._OrtClearBoundOutputs = Z.qa)(a);\n          v._OrtReleaseBinding = (a) => (v._OrtReleaseBinding = Z.ra)(a);\n          v._OrtRunWithBinding = (a, b, c, d, g) => (v._OrtRunWithBinding = Z.sa)(a, b, c, d, g);\n          v._OrtRun = (a, b, c, d, g, h, k, t) => (v._OrtRun = Z.ta)(a, b, c, d, g, h, k, t);\n          v._OrtEndProfiling = (a) => (v._OrtEndProfiling = Z.ua)(a);\n          var Xb = () => (Xb = Z.va)(), W = v._pthread_self = () => (W = v._pthread_self = Z.wa)(), Ab = v._malloc = (a) => (Ab = v._malloc = Z.xa)(a);\n          v._free = (a) => (v._free = Z.ya)(a);\n          v.__emscripten_tls_init = () => (v.__emscripten_tls_init = Z.za)();\n          var Wb = v.__emscripten_thread_init = (a, b, c, d, g, h) => (Wb = v.__emscripten_thread_init = Z.Ba)(a, b, c, d, g, h);\n          v.__emscripten_thread_crashed = () => (v.__emscripten_thread_crashed = Z.Ca)();\n          var Na = (a, b, c, d) => (Na = Z.Da)(a, b, c, d), Ta = (a) => (Ta = Z.Ea)(a), Ya = v.__emscripten_thread_exit = (a) => (Ya = v.__emscripten_thread_exit = Z.Fa)(a), ub = () => (ub = Z.Ga)(), Yb = (a) => (Yb = Z.Ha)(a), Va = (a, b) => (Va = Z.Ia)(a, b), Ka = () => (Ka = Z.Ja)(), U = (a) => (U = Z.Ka)(a), Ma = (a) => (Ma = Z.La)(a);\n          function $b() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;\n            a.va = b(a.va);\n            a.wa = b(a.wa);\n            a.xa = c(a.xa);\n            a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);\n            a.Ja = b(a.Ja);\n            a.La = c(a.La);\n            return a;\n          }\n          v.wasmMemory = e;\n          v.stackAlloc = Ma;\n          v.stackSave = Ka;\n          v.stackRestore = U;\n          v.keepRuntimeAlive = () => 0 < T;\n          v.UTF8ToString = Q;\n          v.stringToUTF8 = hb;\n          v.lengthBytesUTF8 = fb;\n          v.ExitStatus = R;\n          v.PThread = S;\n          var ac;\n          N = function bc() {\n            ac || cc();\n            ac || (N = bc);\n          };\n          function cc() {\n            if (!(0 < M))\n              if (D)\n                ha(v), D || Ua(va), startWorker(v);\n              else {\n                if (v.preRun)\n                  for ("function" == typeof v.preRun && (v.preRun = [v.preRun]); v.preRun.length; )\n                    ua.unshift(v.preRun.shift());\n                Ua(ua);\n                0 < M || ac || (ac = true, v.calledRun = true, K || (D || Ua(va), ha(v), D || Ua(wa)));\n              }\n          }\n          cc();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = (numThreads) => {\n    if (numThreads === 1) {\n      return false;\n    }\n    if (typeof SharedArrayBuffer === "undefined") {\n      if (typeof self !== "undefined" && !self.crossOriginIsolated) {\n        console.warn(\n          "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."\n        );\n      }\n      return false;\n    }\n    if (typeof process !== "undefined" && process.versions && process.versions.node) {\n      console.warn(\n        "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."\n      );\n    }\n    try {\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = isMultiThreadSupported(numThreads);\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        config.numThreads = numThreads;\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.enableGraphCapture !== void 0) {\n        if (typeof sessionOptions.enableGraphCapture !== "boolean") {\n          throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);\n        }\n        const keyDataOffset = allocWasmString("enableGraphCapture", allocs);\n        const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);\n        if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n          checkLastError(\n            `Can\'t set a session config entry: \'enableGraphCapture\' - ${sessionOptions.enableGraphCapture}.`\n          );\n        }\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  init_fs();\n\n  // nodejs-ignore:node:fs/promises\n  var readFile2 = void 0;\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  var loadFile = async (file) => {\n    if (typeof file === "string") {\n      if (typeof process !== "undefined" && process.versions && process.versions.node) {\n        try {\n          return new Uint8Array(await readFile2(file));\n        } catch (e) {\n          if (e.code === "ERR_FS_FILE_TOO_LARGE") {\n            const stream = createReadStream(file);\n            const chunks = [];\n            for await (const chunk of stream) {\n              chunks.push(chunk);\n            }\n            return new Uint8Array(Buffer.concat(chunks));\n          }\n          throw e;\n        }\n      } else {\n        const response = await fetch(file);\n        if (!response.ok) {\n          throw new Error(`failed to load external data file: ${file}`);\n        }\n        const contentLengthHeader = response.headers.get("Content-Length");\n        const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;\n        if (fileSize < 1073741824) {\n          return new Uint8Array(await response.arrayBuffer());\n        } else {\n          if (!response.body) {\n            throw new Error(`failed to load external data file: ${file}, no response body.`);\n          }\n          const reader = response.body.getReader();\n          let buffer;\n          try {\n            buffer = new ArrayBuffer(fileSize);\n          } catch (e) {\n            if (e instanceof RangeError) {\n              const pages = Math.ceil(fileSize / 65536);\n              buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;\n            } else {\n              throw e;\n            }\n          }\n          let offset = 0;\n          while (true) {\n            const { done, value } = await reader.read();\n            if (done) {\n              break;\n            }\n            const chunkSize = value.byteLength;\n            const chunk = new Uint8Array(buffer, offset, chunkSize);\n            chunk.set(value);\n            offset += chunkSize;\n          }\n          return new Uint8Array(buffer, 0, fileSize);\n        }\n      }\n    } else if (file instanceof Blob) {\n      return new Uint8Array(await file.arrayBuffer());\n    } else if (file instanceof Uint8Array) {\n      return file;\n    } else {\n      return new Uint8Array(file);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n  };\n  var initEp = async (env, epName) => {\n    if (false) {\n      const initJsep = null.init;\n      if (epName === "webgpu") {\n        if (typeof navigator === "undefined" || !navigator.gpu) {\n          throw new Error("WebGPU is not supported in current environment");\n        }\n        let adapter = env.webgpu.adapter;\n        if (!adapter) {\n          const powerPreference = env.webgpu.powerPreference;\n          if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {\n            throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);\n          }\n          const forceFallbackAdapter = env.webgpu.forceFallbackAdapter;\n          if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {\n            throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);\n          }\n          adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });\n          if (!adapter) {\n            throw new Error(\n              \'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.\'\n            );\n          }\n        } else {\n          if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {\n            throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");\n          }\n        }\n        if (!env.wasm.simd) {\n          throw new Error(\n            "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"\n          );\n        }\n        await initJsep("webgpu", getInstance(), env, adapter);\n      }\n      if (epName === "webnn") {\n        if (typeof navigator === "undefined" || !navigator.ml) {\n          throw new Error("WebNN is not supported in current environment");\n        }\n        await initJsep("webnn", getInstance(), env);\n      }\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var copyFromExternalBuffer = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSession = async (modelData, options) => {\n    let modelDataOffset, modelDataLength;\n    const wasm2 = getInstance();\n    if (Array.isArray(modelData)) {\n      [modelDataOffset, modelDataLength] = modelData;\n    } else if (modelData.buffer === wasm2.HEAPU8.buffer) {\n      [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];\n    } else {\n      [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);\n    }\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      if (options?.externalData && wasm2.mountExternalData) {\n        const loadingPromises = [];\n        for (const file of options.externalData) {\n          const path = typeof file === "string" ? file : file.path;\n          loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {\n            wasm2.mountExternalData(path, data);\n          }));\n        }\n        await Promise.all(loadingPromises);\n      }\n      sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const enableGraphCapture = !!options?.enableGraphCapture;\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          if (enableGraphCapture && options?.preferredOutputLocation === void 0) {\n            outputPreferredLocations.push("gpu-buffer");\n            continue;\n          }\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          if (enableGraphCapture && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}. Only \'gpu-buffer\' location is supported when enableGraphCapture is true.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(\n        sessionHandle,\n        [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]\n      );\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelDataOffset);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      wasm2.unmountExternalData?.();\n    }\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;\n    if (ioBindingState) {\n      if (enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepOnReleaseSession?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (enableGraphCapture && location !== "gpu-buffer") {\n      throw new Error(\n        `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`\n      );\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      const registerBuffer = wasm2.jsepRegisterBuffer;\n      if (!registerBuffer) {\n        throw new Error(\'Tensor location "gpu-buffer" is not supported without using WebGPU.\');\n      }\n      rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const sessionHandle = session[0];\n    const inputNamesUTF8Encoded = session[1];\n    const outputNamesUTF8Encoded = session[2];\n    const ioBindingState = session[3];\n    const enableGraphCapture = session[4];\n    const inputOutputBound = session[5];\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(\n          inputTensors[i],\n          inputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputIndices[i],\n          enableGraphCapture\n        );\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i],\n          enableGraphCapture\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]\n        );\n      }\n      wasm2.jsepOnRunStart?.(sessionHandle);\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const getBuffer = wasm2.jsepGetBuffer;\n              if (!getBuffer) {\n                throw new Error(\'preferredLocation "gpu-buffer" is not supported without using WebGPU.\');\n              }\n              const gpuBuffer = getBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState && !enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]\n        );\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    const { type, in: message } = ev.data;\n    try {\n      switch (type) {\n        case "init-wasm":\n          initializeWebAssembly(message.wasm).then(\n            () => {\n              initRuntime(message).then(\n                () => {\n                  postMessage({ type });\n                },\n                (err) => {\n                  postMessage({ type, err });\n                }\n              );\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        case "init-ep": {\n          const { epName, env } = message;\n          initEp(env, epName).then(\n            () => {\n              postMessage({ type });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "copy-from": {\n          const { buffer } = message;\n          const bufferData = copyFromExternalBuffer(buffer);\n          postMessage({ type, out: bufferData });\n          break;\n        }\n        case "create": {\n          const { model, options } = message;\n          createSession(model, options).then(\n            (sessionMetadata) => {\n              postMessage({ type, out: sessionMetadata });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "release":\n          releaseSession(message);\n          postMessage({ type });\n          break;\n        case "run": {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = message;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type, err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type, out: outputs },\n                  extractTransferableBuffers([...inputs, ...outputs])\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "end-profiling":\n          endProfiling(message);\n          postMessage({ type });\n          break;\n        default:\n      }\n    } catch (err) {\n      postMessage({ type, err });\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy1sb2FkLWZpbGUudHMiLCAibm9kZWpzLWlnbm9yZTpub2RlOmZzL3Byb21pc2VzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGU9bW9kdWxlQXJnLGssbDtlLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57az1hO2w9Yn0pO3ZhciBhYT1PYmplY3QuYXNzaWduKHt9LGUpLGJhPVwiLi90aGlzLnByb2dyYW1cIixjYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LHE9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxkYT1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsdj1cIlwiLHgseixBO1xuaWYoZGEpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksQj1yZXF1aXJlKFwicGF0aFwiKTt2PXE/Qi5kaXJuYW1lKHYpK1wiL1wiOl9fZGlybmFtZStcIi9cIjt4PShhLGIpPT57YT1DKGEpP25ldyBVUkwoYSk6Qi5ub3JtYWxpemUoYSk7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhhLGI/dm9pZCAwOlwidXRmOFwiKX07QT1hPT57YT14KGEsITApO2EuYnVmZmVyfHwoYT1uZXcgVWludDhBcnJheShhKSk7cmV0dXJuIGF9O3o9KGEsYixjLGQ9ITApPT57YT1DKGEpP25ldyBVUkwoYSk6Qi5ub3JtYWxpemUoYSk7ZnMucmVhZEZpbGUoYSxkP3ZvaWQgMDpcInV0ZjhcIiwoZyxoKT0+e2c/YyhnKTpiKGQ/aC5idWZmZXI6aCl9KX07IWUudGhpc1Byb2dyYW0mJjE8cHJvY2Vzcy5hcmd2Lmxlbmd0aCYmKGJhPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZS5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihjYXx8cSlxP3Y9XG5zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYodj1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHY9X3NjcmlwdERpciksMCE9PXYuaW5kZXhPZihcImJsb2I6XCIpP3Y9di5zdWJzdHIoMCx2LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnY9XCJcIix4PWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0scSYmKEE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLHo9KGEsYixjKT0+e3ZhciBkPW5ldyBYTUxIdHRwUmVxdWVzdDtkLm9wZW4oXCJHRVRcIixhLCEwKTtkLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtkLm9ubG9hZD0oKT0+ezIwMD09ZC5zdGF0dXN8fDA9PWQuc3RhdHVzJiZkLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9O3ZhciBlYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEQ9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZSxhYSk7YWE9bnVsbDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJkUoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBGLGZhPSExLEcsSCxJLEosaGE7XG5mdW5jdGlvbiBpYSgpe3ZhciBhPUYuYnVmZmVyO2UuSEVBUDg9Rz1uZXcgSW50OEFycmF5KGEpO2UuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2UuSEVBUFU4PUg9bmV3IFVpbnQ4QXJyYXkoYSk7ZS5IRUFQVTE2PW5ldyBVaW50MTZBcnJheShhKTtlLkhFQVAzMj1JPW5ldyBJbnQzMkFycmF5KGEpO2UuSEVBUFUzMj1KPW5ldyBVaW50MzJBcnJheShhKTtlLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtlLkhFQVBGNjQ9aGE9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgSz1bXSxMPVtdLGphPVtdLE09MCxOPW51bGwsTz1udWxsO2Z1bmN0aW9uIEUoYSl7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtEKGEpO2ZhPSEwO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtsKGEpO3Rocm93IGE7fVxudmFyIGthPWE9PmEuc3RhcnRzV2l0aChcImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxcIiksQz1hPT5hLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpLFA7UD1cIm9ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbVwiO2lmKCFrYShQKSl7dmFyIGxhPVA7UD1lLmxvY2F0ZUZpbGU/ZS5sb2NhdGVGaWxlKGxhLHYpOnYrbGF9ZnVuY3Rpb24gbWEoYSl7aWYoQSlyZXR1cm4gQShhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBuYShhKXtpZihjYXx8cSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFDKGEpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9Pm1hKGEpKTtpZih6KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3ooYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5tYShhKSl9ZnVuY3Rpb24gb2EoYSxiLGMpe3JldHVybiBuYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntEKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7RShkKX0pfVxuZnVuY3Rpb24gcGEoYSxiKXt2YXIgYz1QO3JldHVyblwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxrYShjKXx8QyhjKXx8ZGF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP29hKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGQsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0QoYHdhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiAke2d9YCk7RChcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBvYShjLGEsYil9KSl9XG52YXIgUSxxYT17ODYyNzA0OihhLGIsYyxkKT0+e2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBlfHwhZS5RYSlyZXR1cm4gMTthPVIoYT4+PjApO2Euc3RhcnRzV2l0aChcIi4vXCIpJiYoYT1hLnN1YnN0cmluZygyKSk7YT1lLlFhLmdldChhKTtpZighYSlyZXR1cm4gMjtiPj4+PTA7Yz4+Pj0wO2lmKGIrYz5hLmJ5dGVMZW5ndGgpcmV0dXJuIDM7dHJ5e3JldHVybiBILnNldChhLnN1YmFycmF5KGIsYitjKSxkPj4+MD4+PjApLDB9Y2F0Y2h7cmV0dXJuIDR9fX07ZnVuY3Rpb24gcmEoYSl7dGhpcy5LYT1hLTI0O3RoaXMuUGE9ZnVuY3Rpb24oYil7Slt0aGlzLkthKzQ+Pj4yPj4+MF09Yn07dGhpcy5PYT1mdW5jdGlvbihiKXtKW3RoaXMuS2ErOD4+PjI+Pj4wXT1ifTt0aGlzLk1hPWZ1bmN0aW9uKGIsYyl7dGhpcy5OYSgpO3RoaXMuUGEoYik7dGhpcy5PYShjKX07dGhpcy5OYT1mdW5jdGlvbigpe0pbdGhpcy5LYSsxNj4+PjI+Pj4wXT0wfX1cbnZhciBzYT0wLHRhPTAsdWE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHZhPShhLGIsYyk9PntiPj4+PTA7dmFyIGQ9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1kKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnVhKXJldHVybiB1YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZD1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBtPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8bTooZyY3KTw8MTh8aDw8MTJ8bTw8NnxhW2IrK10mNjM7NjU1MzY+Zz9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGR9LFxuUj0oYSxiKT0+KGE+Pj49MCk/dmEoSCxhLGIpOlwiXCIsUz1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVD0oYSxiLGMsZCk9PntjPj4+PTA7aWYoISgwPGQpKXJldHVybiAwO3ZhciBnPWM7ZD1jK2QtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIG09YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1tJiY1NzM0Mz49bSl7dmFyIHI9YS5jaGFyQ29kZUF0KCsraCk7bT02NTUzNisoKG0mMTAyMyk8PDEwKXxyJjEwMjN9aWYoMTI3Pj1tKXtpZihjPj1kKWJyZWFrO2JbYysrPj4+MF09bX1lbHNle2lmKDIwNDc+PW0pe2lmKGMrMT49ZClicmVhaztiW2MrKz4+PjBdPTE5MnxtPj42fWVsc2V7aWYoNjU1MzU+PW0pe2lmKGMrMj49ZClicmVhaztiW2MrKz4+PjBdPTIyNHxtPj4xMn1lbHNle2lmKGMrMz49XG5kKWJyZWFrO2JbYysrPj4+MF09MjQwfG0+PjE4O2JbYysrPj4+MF09MTI4fG0+PjEyJjYzfWJbYysrPj4+MF09MTI4fG0+PjYmNjN9YltjKys+Pj4wXT0xMjh8bSY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxVPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksd2E9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0seGE9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sQ2E9YT0+e3ZhciBiPVMoYSkrMSxjPUJhKGIpO2MmJlQoYSxILGMsYik7cmV0dXJuIGN9LFY9W10sVz17fSxEYT0oKT0+e2lmKCFYKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXG5cIl9cIikrXCIuVVRGLThcIixfOmJhfHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gVyl2b2lkIDA9PT1XW2JdP2RlbGV0ZSBhW2JdOmFbYl09V1tiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WD1jfXJldHVybiBYfSxYLEVhPVtudWxsLFtdLFtdXSxGYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEdhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gSGEoYSl7dmFyIGI9QXJyYXkoUyhhKSsxKTtUKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIElhKGEsYixjLGQpe2Z1bmN0aW9uIGcoZixuLHApe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPG47KWY9cFswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixuKXtyZXR1cm4gZyhmLG4sXCIwXCIpfWZ1bmN0aW9uIG0oZixuKXtmdW5jdGlvbiBwKHlhKXtyZXR1cm4gMD55YT8tMTowPHlhPzE6MH12YXIgeTswPT09KHk9cChmLmdldEZ1bGxZZWFyKCktbi5nZXRGdWxsWWVhcigpKSkmJjA9PT0oeT1wKGYuZ2V0TW9udGgoKS1uLmdldE1vbnRoKCkpKSYmKHk9cChmLmdldERhdGUoKS1uLmdldERhdGUoKSkpO3JldHVybiB5fWZ1bmN0aW9uIHIoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiB3KGYpe3ZhciBuPWYuR2E7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuSGErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8bjspe3ZhciBwPWYuZ2V0TW9udGgoKSx5PShVKGYuZ2V0RnVsbFllYXIoKSk/RmE6R2EpW3BdO2lmKG4+eS1mLmdldERhdGUoKSluLT15LWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnA/Zi5zZXRNb250aChwKzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStuKTticmVha319cD1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO249cihuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTtwPXIocCk7cmV0dXJuIDA+PW0obixmKT8wPj1tKHAsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgdD1KW2QrNDA+Pj4yPj4+MF07ZD17VGE6SVtkPj4+Mj4+PjBdLFNhOklbZCs0Pj4+Mj4+PjBdLElhOklbZCs4Pj4+Mj4+PjBdLExhOklbZCsxMj4+PjI+Pj4wXSxKYTpJW2QrMTY+Pj4yPj4+MF0sSGE6SVtkKzIwPj4+Mj4+PjBdLEJhOklbZCsyND4+PjI+Pj4wXSxHYTpJW2QrMjg+Pj4yPj4+MF0sVmE6SVtkKzMyPj4+Mj4+PjBdLFJhOklbZCszNj4+PjI+Pj4wXSxVYTp0P1IodCk6XCJcIn07Yz1SKGMpO3Q9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFxuXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdSBpbiB0KWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodSxcImdcIiksdFt1XSk7dmFyIHphPVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksQWE9XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3Q9e1wiJWFcIjpmPT56YVtmLkJhXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+emFbZi5CYV0sXG5cIiViXCI6Zj0+QWFbZi5KYV0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmY9PkFhW2YuSmFdLFwiJUNcIjpmPT5oKChmLkhhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5oKGYuTGEsMiksXCIlZVwiOmY9PmcoZi5MYSwyLFwiIFwiKSxcIiVnXCI6Zj0+dyhmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+dyhmKSxcIiVIXCI6Zj0+aChmLklhLDIpLFwiJUlcIjpmPT57Zj1mLklhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBoKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciBuPTAscD0wO3A8PWYuSmEtMTtuKz0oVShmLkhhKzE5MDApP0ZhOkdhKVtwKytdKTtyZXR1cm4gaChmLkxhK24sMyl9LFwiJW1cIjpmPT5oKGYuSmErMSwyKSxcIiVNXCI6Zj0+aChmLlNhLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5JYSYmMTI+Zi5JYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5oKGYuVGEsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLkJhfHw3LFwiJVVcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy1mLkJhKS83KSxcbjIpLFwiJVZcIjpmPT57dmFyIG49TWF0aC5mbG9vcigoZi5HYSs3LShmLkJhKzYpJTcpLzcpOzI+PShmLkJhKzM3MS1mLkdhLTIpJTcmJm4rKztpZihuKTUzPT1uJiYocD0oZi5CYSszNzEtZi5HYSklNyw0PT1wfHwzPT1wJiZVKGYuSGEpfHwobj0xKSk7ZWxzZXtuPTUyO3ZhciBwPShmLkJhKzctZi5HYS0xKSU3Oyg0PT1wfHw1PT1wJiZVKGYuSGElNDAwLTEpKSYmbisrfXJldHVybiBoKG4sMil9LFwiJXdcIjpmPT5mLkJhLFwiJVdcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy0oZi5CYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuSGErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuSGErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5SYTt2YXIgbj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKG4/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYuVWEsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO1xuZm9yKHUgaW4gdCljLmluY2x1ZGVzKHUpJiYoYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh1LFwiZ1wiKSx0W3VdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt1PUhhKGMpO2lmKHUubGVuZ3RoPmIpcmV0dXJuIDA7Ry5zZXQodSxhPj4+MCk7cmV0dXJuIHUubGVuZ3RoLTF9XG52YXIgTGE9e2E6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IHJhKGEpKS5NYShiPj4+MCxjPj4+MCk7c2E9YTt0YSsrO3Rocm93IHNhO30sZTpmdW5jdGlvbigpe3JldHVybiAwfSxIOmZ1bmN0aW9uKCl7fSx4OmZ1bmN0aW9uKCl7fSx6OmZ1bmN0aW9uKCl7fSxKOmZ1bmN0aW9uKCl7cmV0dXJuIDB9LEY6ZnVuY3Rpb24oKXt9LEE6ZnVuY3Rpb24oKXt9LEU6ZnVuY3Rpb24oKXt9LGc6ZnVuY3Rpb24oKXt9LHk6ZnVuY3Rpb24oKXt9LHY6ZnVuY3Rpb24oKXt9LEc6ZnVuY3Rpb24oKXt9LHc6ZnVuY3Rpb24oKXt9LGs6KCk9PjEsbjpmdW5jdGlvbihhLGIsYyl7YT1iKzIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOk5hTjtjPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7SVtjPj4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO0lbYys0Pj4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0lbYys4Pj4+Mj4+PjBdPWEuZ2V0VVRDSG91cnMoKTtJW2MrMTI+Pj5cbjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTtJW2MrMTY+Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0lbYysyMD4+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDtJW2MrMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTtJW2MrMjg+Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LG86ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0lbYz4+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTtJW2MrND4+PjI+Pj4wXT1hLmdldE1pbnV0ZXMoKTtJW2MrOD4+PjI+Pj4wXT1hLmdldEhvdXJzKCk7SVtjKzEyPj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO0lbYysxNj4+PjI+Pj4wXT1hLmdldE1vbnRoKCk7SVtjKzIwPj4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0lbYysyND4+PjI+Pj4wXT1hLmdldERheSgpO1xuSVtjKzI4Pj4+Mj4+PjBdPShVKGEuZ2V0RnVsbFllYXIoKSk/d2E6eGEpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0lbYyszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0lbYyszMj4+PjI+Pj4wXT0oYiE9ZCYmYS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihkLGIpKXwwfSxwOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uZXcgRGF0ZShJW2ErMjA+Pj4yPj4+MF0rMTkwMCxJW2ErMTY+Pj4yPj4+MF0sSVthKzEyPj4+Mj4+PjBdLElbYSs4Pj4+Mj4+PjBdLElbYSs0Pj4+Mj4+PjBdLElbYT4+PjI+Pj4wXSwwKSxjPUlbYSszMj4+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbmg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLG09TWF0aC5taW4oaCxnKTswPmM/SVthKzMyPj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1kKTowPGMhPShtPT1kKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZCkpKTtJW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtJW2ErMjg+Pj4yPj4+MF09KFUoYi5nZXRGdWxsWWVhcigpKT93YTp4YSlbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7SVthPj4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0lbYSs0Pj4+Mj4+PjBdPWIuZ2V0TWludXRlcygpO0lbYSs4Pj4+Mj4+PjBdPWIuZ2V0SG91cnMoKTtJW2ErMTI+Pj4yPj4+MF09Yi5nZXREYXRlKCk7SVthKzE2Pj4+Mj4+PjBdPWIuZ2V0TW9udGgoKTtJW2ErMjA+Pj4yPj4+MF09Yi5nZXRZZWFyKCk7YT1iLmdldFRpbWUoKTtpc05hTihhKT8oSVtKYSgpPj4+Mj4+PjBdPTYxLGE9LTEpOlxuYS89MUUzO3JldHVybiBLYSgoUT1hLDE8PStNYXRoLmFicyhRKT8wPFE/K01hdGguZmxvb3IoUS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKChRLSsofn5RPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKSksYT4+PjB9LGw6ZnVuY3Rpb24oKXtyZXR1cm4tNTJ9LG06ZnVuY3Rpb24oKXt9LHQ6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQodyl7cmV0dXJuKHc9dy50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT93WzFdOlwiR01UXCJ9Yz4+Pj0wO3ZhciBnPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxoPW5ldyBEYXRlKGcsMCwxKSxtPW5ldyBEYXRlKGcsNiwxKTtnPWguZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgcj1tLmdldFRpbWV6b25lT2Zmc2V0KCk7SlthPj4+MD4+PjI+Pj4wXT02MCpNYXRoLm1heChnLHIpO0lbYj4+PjA+Pj4yPj4+MF09TnVtYmVyKGchPXIpO2E9ZChoKTtiPWQobSk7YT1DYShhKTtiPUNhKGIpO3I8Zz8oSltjPj4+Mj4+PjBdPVxuYSxKW2MrND4+PjI+Pj4wXT1iKTooSltjPj4+Mj4+PjBdPWIsSltjKzQ+Pj4yPj4+MF09YSl9LGQ6KCk9PntFKFwiXCIpfSxCOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtWLmxlbmd0aD0wO2Zvcih2YXIgZDtkPUhbYisrPj4+MF07KXt2YXIgZz0xMDUhPWQ7ZyY9MTEyIT1kO2MrPWcmJmMlOD80OjA7Vi5wdXNoKDExMj09ZD9KW2M+Pj4yPj4+MF06MTA1PT1kP0lbYz4+PjI+Pj4wXTpoYVtjPj4+Mz4+PjBdKTtjKz1nPzg6NH1yZXR1cm4gcWFbYV0uYXBwbHkobnVsbCxWKX0saDooKT0+RGF0ZS5ub3coKSx1OmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LGI6KCk9PnBlcmZvcm1hbmNlLm5vdygpLEk6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtyZXR1cm4gSC5jb3B5V2l0aGluKGE+Pj4wPj4+MCxiPj4+MCxiKyhjPj4+MCk+Pj4wKX0sczpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9SC5sZW5ndGg7aWYoNDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz1cbjE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGc9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7Zz0oZy5taW4uY2FsbChnLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLUYuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXtGLmdyb3coZyk7aWEoKTt2YXIgaD0xO2JyZWFrIGF9Y2F0Y2gobSl7fWg9dm9pZCAwfWlmKGgpcmV0dXJuITB9cmV0dXJuITF9LEM6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPTA7RGEoKS5mb3JFYWNoKChkLGcpPT57dmFyIGg9YitjO2c9SlthKzQqZz4+PjI+Pj4wXT1oO2ZvcihoPTA7aDxkLmxlbmd0aDsrK2gpR1tnKys+Pj4wPj4+MF09ZC5jaGFyQ29kZUF0KGgpO0dbZz4+PjA+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH0sRDpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9RGEoKTtKW2E+Pj4yPj4+MF09Yy5sZW5ndGg7dmFyIGQ9XG4wO2MuZm9yRWFjaChnPT5kKz1nLmxlbmd0aCsxKTtKW2I+Pj4yPj4+MF09ZDtyZXR1cm4gMH0sZjooKT0+NTIsajpmdW5jdGlvbigpe3JldHVybiA1Mn0scTpmdW5jdGlvbigpe3JldHVybiA3MH0saTpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGc9MCxoPTA7aDxjO2grKyl7dmFyIG09SltiPj4+Mj4+PjBdLHI9SltiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIHc9MDt3PHI7dysrKXt2YXIgdD1IW20rdz4+PjBdLHU9RWFbYV07MD09PXR8fDEwPT09dD8oKDE9PT1hP2VhOkQpKHZhKHUsMCkpLHUubGVuZ3RoPTApOnUucHVzaCh0KX1nKz1yfUpbZD4+PjI+Pj4wXT1nO3JldHVybiAwfSxyOklhLGM6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIElhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGMpe1k9Yy5leHBvcnRzO1k9TWEoKTtGPVkuSztpYSgpO0wudW5zaGlmdChZLkwpO00tLTswPT1NJiYobnVsbCE9PVxuTiYmKGNsZWFySW50ZXJ2YWwoTiksTj1udWxsKSxPJiYoYz1PLE89bnVsbCxjKCkpKTtyZXR1cm4gWX12YXIgYj17YTpMYX07TSsrO2lmKGUuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZS5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtEKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCksbChjKX1wYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSl9KS5jYXRjaChsKTtyZXR1cm57fX0oKTtlLl9PcnRJbml0PShhLGIpPT4oZS5fT3J0SW5pdD1ZLk0pKGEsYik7ZS5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4oZS5fT3J0R2V0TGFzdEVycm9yPVkuTikoYSxiKTtlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsbSxyLHcsdCk9PihlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1ZLk8pKGEsYixjLGQsZyxoLG0scix3LHQpO1xuZS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihlLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1ZLlApKGEsYik7ZS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihlLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9WS5RKShhLGIsYyk7ZS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihlLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9WS5SKShhLGIsYyk7ZS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9WS5TKShhKTtlLl9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9PihlLl9PcnRDcmVhdGVTZXNzaW9uPVkuVCkoYSxiLGMpO2UuX09ydFJlbGVhc2VTZXNzaW9uPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbj1ZLlUpKGEpO2UuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KGUuX09ydEdldElucHV0T3V0cHV0Q291bnQ9WS5WKShhLGIsYyk7XG5lLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihlLl9PcnRHZXRJbnB1dE5hbWU9WS5XKShhLGIpO2UuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihlLl9PcnRHZXRPdXRwdXROYW1lPVkuWCkoYSxiKTtlLl9PcnRGcmVlPWE9PihlLl9PcnRGcmVlPVkuWSkoYSk7ZS5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxkLGcsaCk9PihlLl9PcnRDcmVhdGVUZW5zb3I9WS5aKShhLGIsYyxkLGcsaCk7ZS5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZCxnKT0+KGUuX09ydEdldFRlbnNvckRhdGE9WS5fKShhLGIsYyxkLGcpO2UuX09ydFJlbGVhc2VUZW5zb3I9YT0+KGUuX09ydFJlbGVhc2VUZW5zb3I9WS4kKShhKTtlLl9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KGUuX09ydENyZWF0ZVJ1bk9wdGlvbnM9WS5hYSkoYSxiLGMsZCk7ZS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KGUuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVkuYmEpKGEsYixjKTtcbmUuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9PihlLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1ZLmNhKShhKTtlLl9PcnRDcmVhdGVCaW5kaW5nPWE9PihlLl9PcnRDcmVhdGVCaW5kaW5nPVkuZGEpKGEpO2UuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4oZS5fT3J0QmluZElucHV0PVkuZWEpKGEsYixjKTtlLl9PcnRCaW5kT3V0cHV0PShhLGIsYyxkKT0+KGUuX09ydEJpbmRPdXRwdXQ9WS5mYSkoYSxiLGMsZCk7ZS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KGUuX09ydENsZWFyQm91bmRPdXRwdXRzPVkuZ2EpKGEpO2UuX09ydFJlbGVhc2VCaW5kaW5nPWE9PihlLl9PcnRSZWxlYXNlQmluZGluZz1ZLmhhKShhKTtlLl9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxnKT0+KGUuX09ydFJ1bldpdGhCaW5kaW5nPVkuaWEpKGEsYixjLGQsZyk7ZS5fT3J0UnVuPShhLGIsYyxkLGcsaCxtLHIpPT4oZS5fT3J0UnVuPVkuamEpKGEsYixjLGQsZyxoLG0scik7XG5lLl9PcnRFbmRQcm9maWxpbmc9YT0+KGUuX09ydEVuZFByb2ZpbGluZz1ZLmthKShhKTtlLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PShhLGIpPT4oZS5fT3J0VHJhaW5pbmdMb2FkQ2hlY2twb2ludD1ZLmxhKShhLGIpO2UuX09ydFRyYWluaW5nUmVsZWFzZUNoZWNrcG9pbnQ9YT0+KGUuX09ydFRyYWluaW5nUmVsZWFzZUNoZWNrcG9pbnQ9WS5tYSkoYSk7ZS5fT3J0VHJhaW5pbmdDcmVhdGVTZXNzaW9uPShhLGIsYyxkLGcsaCxtLHIpPT4oZS5fT3J0VHJhaW5pbmdDcmVhdGVTZXNzaW9uPVkubmEpKGEsYixjLGQsZyxoLG0scik7ZS5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPWE9PihlLl9PcnRUcmFpbmluZ0xhenlSZXNldEdyYWQ9WS5vYSkoYSk7ZS5fT3J0VHJhaW5pbmdSdW5UcmFpblN0ZXA9KGEsYixjLGQsZyxoKT0+KGUuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPVkucGEpKGEsYixjLGQsZyxoKTtcbmUuX09ydFRyYWluaW5nT3B0aW1pemVyU3RlcD0oYSxiKT0+KGUuX09ydFRyYWluaW5nT3B0aW1pemVyU3RlcD1ZLnFhKShhLGIpO2UuX09ydFRyYWluaW5nRXZhbFN0ZXA9KGEsYixjLGQsZyxoKT0+KGUuX09ydFRyYWluaW5nRXZhbFN0ZXA9WS5yYSkoYSxiLGMsZCxnLGgpO2UuX09ydFRyYWluaW5nR2V0UGFyYW1ldGVyc1NpemU9KGEsYixjKT0+KGUuX09ydFRyYWluaW5nR2V0UGFyYW1ldGVyc1NpemU9WS5zYSkoYSxiLGMpO2UuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj0oYSxiLGMsZCk9PihlLl9PcnRUcmFpbmluZ0NvcHlQYXJhbWV0ZXJzVG9CdWZmZXI9WS50YSkoYSxiLGMsZCk7ZS5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc0Zyb21CdWZmZXI9KGEsYixjLGQpPT4oZS5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc0Zyb21CdWZmZXI9WS51YSkoYSxiLGMsZCk7XG5lLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXRDb3VudD0oYSxiLGMsZCk9PihlLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXRDb3VudD1ZLnZhKShhLGIsYyxkKTtlLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXROYW1lPShhLGIsYyxkKT0+KGUuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9WS53YSkoYSxiLGMsZCk7ZS5fT3J0VHJhaW5pbmdSZWxlYXNlU2Vzc2lvbj1hPT4oZS5fT3J0VHJhaW5pbmdSZWxlYXNlU2Vzc2lvbj1ZLnhhKShhKTt2YXIgSmE9KCk9PihKYT1ZLnlhKSgpLEJhPWUuX21hbGxvYz1hPT4oQmE9ZS5fbWFsbG9jPVkuemEpKGEpO2UuX2ZyZWU9YT0+KGUuX2ZyZWU9WS5BYSkoYSk7dmFyIEthPWE9PihLYT1ZLkNhKShhKSxOYT0oKT0+KE5hPVkuRGEpKCksT2E9YT0+KE9hPVkuRWEpKGEpLFBhPWE9PihQYT1ZLkZhKShhKTtcbmZ1bmN0aW9uIE1hKCl7dmFyIGE9WTthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5nPT5kKGcpPj4+MDthLnlhPWIoYS55YSk7YS56YT1jKGEuemEpO2EuRGE9YihhLkRhKTthLkZhPWMoYS5GYSk7cmV0dXJuIGF9ZS5zdGFja0FsbG9jPVBhO2Uuc3RhY2tTYXZlPU5hO2Uuc3RhY2tSZXN0b3JlPU9hO2UuVVRGOFRvU3RyaW5nPVI7ZS5zdHJpbmdUb1VURjg9KGEsYixjKT0+VChhLEgsYixjKTtlLmxlbmd0aEJ5dGVzVVRGOD1TO3ZhciBaO089ZnVuY3Rpb24gUWEoKXtafHxSYSgpO1p8fChPPVFhKX07XG5mdW5jdGlvbiBSYSgpe2lmKCEoMDxNKSl7aWYoZS5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGUucHJlUnVuJiYoZS5wcmVSdW49W2UucHJlUnVuXSk7ZS5wcmVSdW4ubGVuZ3RoOyl7dmFyIGE9ZS5wcmVSdW4uc2hpZnQoKTtLLnVuc2hpZnQoYSl9Zm9yKDswPEsubGVuZ3RoOylLLnNoaWZ0KCkoZSk7aWYoISgwPE18fFp8fChaPSEwLGUuY2FsbGVkUnVuPSEwLGZhKSkpe2Zvcig7MDxMLmxlbmd0aDspTC5zaGlmdCgpKGUpO2ZvcihrKGUpOzA8amEubGVuZ3RoOylqYS5zaGlmdCgpKGUpfX19UmEoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cbik7XG59KSgpO1xuO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc20pO1xuIiwgIiIsICIiLCAiZXhwb3J0IGNvbnN0IGNwdXMgPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc21UaHJlYWRlZCA9ICgoKSA9PiB7XG4gIHZhciBfc2NyaXB0RGlyID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5jdXJyZW50U2NyaXB0ID8gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMgOiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgX19maWxlbmFtZSAhPT0gJ3VuZGVmaW5lZCcpIF9zY3JpcHREaXIgPSBfc2NyaXB0RGlyIHx8IF9fZmlsZW5hbWU7XG4gIHJldHVybiAoXG5mdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkge1xuXG5mdW5jdGlvbiBhYSgpe2UuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBsfWZ1bmN0aW9uIG4oKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gYmF9ZnVuY3Rpb24gcCgpe2UuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBjYX1mdW5jdGlvbiByKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGRhfWZ1bmN0aW9uIGVhKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGZhfXZhciB2PW1vZHVsZUFyZyxoYSx4O3YucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PntoYT1hO3g9Yn0pO1xudmFyIGlhPU9iamVjdC5hc3NpZ24oe30sdiksamE9XCIuL3RoaXMucHJvZ3JhbVwiLHo9KGEsYik9Pnt0aHJvdyBiO30sa2E9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyxBPVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsQj1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsRD12LkVOVklST05NRU5UX0lTX1BUSFJFQUR8fCExLEU9XCJcIjtmdW5jdGlvbiBsYShhKXtyZXR1cm4gdi5sb2NhdGVGaWxlP3YubG9jYXRlRmlsZShhLEUpOkUrYX12YXIgbWEsRyxIO1xuaWYoQil7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKSxuYT1yZXF1aXJlKFwicGF0aFwiKTtFPUE/bmEuZGlybmFtZShFKStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7bWE9KGIsYyk9PntiPUkoYik/bmV3IFVSTChiKTpuYS5ub3JtYWxpemUoYik7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhiLGM/dm9pZCAwOlwidXRmOFwiKX07SD1iPT57Yj1tYShiLCEwKTtiLmJ1ZmZlcnx8KGI9bmV3IFVpbnQ4QXJyYXkoYikpO3JldHVybiBifTtHPShiLGMsZCxnPSEwKT0+e2I9SShiKT9uZXcgVVJMKGIpOm5hLm5vcm1hbGl6ZShiKTtmcy5yZWFkRmlsZShiLGc/dm9pZCAwOlwidXRmOFwiLChoLGspPT57aD9kKGgpOmMoZz9rLmJ1ZmZlcjprKX0pfTshdi50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYoamE9cHJvY2Vzcy5hcmd2WzFdLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikpO3Byb2Nlc3MuYXJndi5zbGljZSgyKTt6PShiLGMpPT57cHJvY2Vzcy5leGl0Q29kZT1iO3Rocm93IGM7fTt2Lmluc3BlY3Q9KCk9PlwiW0Vtc2NyaXB0ZW4gTW9kdWxlIG9iamVjdF1cIjtcbmxldCBhO3RyeXthPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKX1jYXRjaChiKXt0aHJvdyBjb25zb2xlLmVycm9yKCdUaGUgXCJ3b3JrZXJfdGhyZWFkc1wiIG1vZHVsZSBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgbm9kZS5qcyBidWlsZCAtIHBlcmhhcHMgYSBuZXdlciB2ZXJzaW9uIGlzIG5lZWRlZD8nKSxiO31nbG9iYWwuV29ya2VyPWEuV29ya2VyfWVsc2UgaWYoa2F8fEEpQT9FPXNlbGYubG9jYXRpb24uaHJlZjpcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQmJihFPWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjKSwodHlwZW9mIF9zY3JpcHREaXIgIT09IFwidW5kZWZpbmVkXCIgJiYgX3NjcmlwdERpcikmJihFPV9zY3JpcHREaXIpLDAhPT1FLmluZGV4T2YoXCJibG9iOlwiKT9FPUUuc3Vic3RyKDAsRS5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTpFPVwiXCIsQnx8KG1hPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO1xucmV0dXJuIGIucmVzcG9uc2VUZXh0fSxBJiYoSD1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2IucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtiLnNlbmQobnVsbCk7cmV0dXJuIG5ldyBVaW50OEFycmF5KGIucmVzcG9uc2UpfSksRz0oYSxiLGMpPT57dmFyIGQ9bmV3IFhNTEh0dHBSZXF1ZXN0O2Qub3BlbihcIkdFVFwiLGEsITApO2QucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtkLm9ubG9hZD0oKT0+ezIwMD09ZC5zdGF0dXN8fDA9PWQuc3RhdHVzJiZkLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9KTtCJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgcGVyZm9ybWFuY2UmJihnbG9iYWwucGVyZm9ybWFuY2U9cmVxdWlyZShcInBlcmZfaG9va3NcIikucGVyZm9ybWFuY2UpO3ZhciBvYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHBhPWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtcbkImJihvYT0oLi4uYSk9PmZzLndyaXRlU3luYygxLGEuam9pbihcIiBcIikrXCJcXG5cIikscGE9KC4uLmEpPT5mcy53cml0ZVN5bmMoMixhLmpvaW4oXCIgXCIpK1wiXFxuXCIpKTt2YXIgcWE9b2EsSj1wYTtPYmplY3QuYXNzaWduKHYsaWEpO2lhPW51bGw7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZyYShcIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWRcIik7dmFyIGUsc2EsSz0hMSxMLGwsYmEsY2EsZGEsZmE7ZnVuY3Rpb24gbSgpe3ZhciBhPWUuYnVmZmVyO3YuSEVBUDg9bD1uZXcgSW50OEFycmF5KGEpO3YuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO3YuSEVBUFU4PWJhPW5ldyBVaW50OEFycmF5KGEpO3YuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYSk7di5IRUFQMzI9Y2E9bmV3IEludDMyQXJyYXkoYSk7di5IRUFQVTMyPWRhPW5ldyBVaW50MzJBcnJheShhKTt2LkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTt2LkhFQVBGNjQ9ZmE9bmV3IEZsb2F0NjRBcnJheShhKX1cbnZhciB0YT0xNjc3NzIxNjtcbmlmKEQpZT12Lndhc21NZW1vcnk7ZWxzZSBpZih2Lndhc21NZW1vcnkpZT12Lndhc21NZW1vcnk7ZWxzZSBpZihlPW5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6dGEvNjU1MzYsbWF4aW11bTo2NTUzNixzaGFyZWQ6ITB9KSwhKGUuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKXRocm93IEooXCJyZXF1ZXN0ZWQgYSBzaGFyZWQgV2ViQXNzZW1ibHkuTWVtb3J5IGJ1dCB0aGUgcmV0dXJuZWQgYnVmZmVyIGlzIG5vdCBhIFNoYXJlZEFycmF5QnVmZmVyLCBpbmRpY2F0aW5nIHRoYXQgd2hpbGUgdGhlIGJyb3dzZXIgaGFzIFNoYXJlZEFycmF5QnVmZmVyIGl0IGRvZXMgbm90IGhhdmUgV2ViQXNzZW1ibHkgdGhyZWFkcyBzdXBwb3J0IC0geW91IG1heSBuZWVkIHRvIHNldCBhIGZsYWdcIiksQiYmSihcIihvbiBub2RlIHlvdSBtYXkgbmVlZDogLS1leHBlcmltZW50YWwtd2FzbS10aHJlYWRzIC0tZXhwZXJpbWVudGFsLXdhc20tYnVsay1tZW1vcnkgYW5kL29yIHJlY2VudCB2ZXJzaW9uKVwiKSxFcnJvcihcImJhZCBtZW1vcnlcIik7XG5tKCk7dGE9ZS5idWZmZXIuYnl0ZUxlbmd0aDt2YXIgdWE9W10sdmE9W10sd2E9W10sTT0wLHhhPW51bGwsTj1udWxsO2Z1bmN0aW9uIHlhKCl7TS0tO2lmKDA9PU0mJihudWxsIT09eGEmJihjbGVhckludGVydmFsKHhhKSx4YT1udWxsKSxOKSl7dmFyIGE9TjtOPW51bGw7YSgpfX1mdW5jdGlvbiByYShhKXthPVwiQWJvcnRlZChcIithK1wiKVwiO0ooYSk7Sz0hMDtMPTE7YT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKGErXCIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uXCIpO3goYSk7dGhyb3cgYTt9dmFyIHphPWE9PmEuc3RhcnRzV2l0aChcImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxcIiksST1hPT5hLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpLE87Tz1cIm9ydC13YXNtLXRocmVhZGVkLndhc21cIjt6YShPKXx8KE89bGEoTykpO1xuZnVuY3Rpb24gQWEoYSl7aWYoSClyZXR1cm4gSChhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9ZnVuY3Rpb24gQmEoYSl7aWYoa2F8fEEpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGZldGNoJiYhSShhKSlyZXR1cm4gZmV0Y2goYSx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihiPT57aWYoIWIub2spdGhyb3dcImZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJ1wiK2ErXCInXCI7cmV0dXJuIGIuYXJyYXlCdWZmZXIoKX0pLmNhdGNoKCgpPT5BYShhKSk7aWYoRylyZXR1cm4gbmV3IFByb21pc2UoKGIsYyk9PntHKGEsZD0+YihuZXcgVWludDhBcnJheShkKSksYyl9KX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+QWEoYSkpfVxuZnVuY3Rpb24gQ2EoYSxiLGMpe3JldHVybiBCYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntKKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7cmEoZCl9KX1mdW5jdGlvbiBEYShhLGIpe3ZhciBjPU87cmV0dXJuXCJmdW5jdGlvblwiIT10eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmd8fHphKGMpfHxJKGMpfHxCfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9DYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihnKXtKKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtnfWApO0ooXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gQ2EoYyxhLGIpfSkpfVxudmFyIFAsRWE9ezc5MzExNjooYSxiLGMsZCk9PntpZihcInVuZGVmaW5lZFwiPT10eXBlb2Ygdnx8IXYuY2IpcmV0dXJuIDE7YT1RKGE+Pj4wKTthLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKGE9YS5zdWJzdHJpbmcoMikpO2E9di5jYi5nZXQoYSk7aWYoIWEpcmV0dXJuIDI7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7aWYoYitjPmEuYnl0ZUxlbmd0aClyZXR1cm4gMzt0cnl7cmV0dXJuIG4oKS5zZXQoYS5zdWJhcnJheShiLGIrYyksZD4+PjApLDB9Y2F0Y2h7cmV0dXJuIDR9fX07ZnVuY3Rpb24gUihhKXt0aGlzLm5hbWU9XCJFeGl0U3RhdHVzXCI7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7YX0pYDt0aGlzLnN0YXR1cz1hfVxudmFyIEZhPWE9PnthLnRlcm1pbmF0ZSgpO2Eub25tZXNzYWdlPSgpPT57fX0sSGE9YT0+ezA9PVMuUGEubGVuZ3RoJiYoR2EoKSxTLllhKFMuUGFbMF0pKTt2YXIgYj1TLlBhLnBvcCgpO2lmKCFiKXJldHVybiA2O1MuUWEucHVzaChiKTtTLk1hW2EuT2FdPWI7Yi5PYT1hLk9hO3ZhciBjPXtjbWQ6XCJydW5cIixzdGFydF9yb3V0aW5lOmEua2IsYXJnOmEuaGIscHRocmVhZF9wdHI6YS5PYX07QiYmYi51bnJlZigpO2IucG9zdE1lc3NhZ2UoYyxhLnFiKTtyZXR1cm4gMH0sVD0wLElhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCxKYT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBkPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZCk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZJYSlyZXR1cm4gSWEuZGVjb2RlKGEuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXI/YS5zbGljZShiLGMpOmEuc3ViYXJyYXkoYixjKSk7XG5mb3IoZD1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBrPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8azooZyY3KTw8MTh8aDw8MTJ8azw8NnxhW2IrK10mNjM7NjU1MzY+Zz9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGR9LFE9KGEsYik9PihhPj4+PTApP0phKG4oKSxhLGIpOlwiXCIsTGE9YT0+e3ZhciBiPUthKCk7YT1hKCk7VShiKTtyZXR1cm4gYX07XG5mdW5jdGlvbiBWKGEsYil7dmFyIGM9YXJndW1lbnRzLmxlbmd0aC0yLGQ9YXJndW1lbnRzO3JldHVybiBMYSgoKT0+e2Zvcih2YXIgZz1NYSg4KmMpLGg9Zz4+PjMsaz0wO2s8YztrKyspe3ZhciB0PWRbMitrXTtlYSgpW2graz4+PjBdPXR9cmV0dXJuIE5hKGEsYyxnLGIpfSl9ZnVuY3Rpb24gT2EoYSl7aWYoRClyZXR1cm4gVigwLDEsYSk7TD1hOzA8VHx8KFMubGIoKSx2Lm9uRXhpdD8uKGEpLEs9ITApO3ooYSxuZXcgUihhKSl9dmFyIFFhPWE9PntMPWE7aWYoRCl0aHJvdyBQYShhKSxcInVud2luZFwiO09hKGEpfTtmdW5jdGlvbiBSYSgpe2Zvcih2YXIgYT12Lm51bVRocmVhZHM7YS0tOylHYSgpO3VhLnVuc2hpZnQoKCk9PntNKys7U2EoKCk9PnlhKCkpfSl9ZnVuY3Rpb24gR2EoKXt2YXIgYT1sYShcIm9ydC13YXNtLXRocmVhZGVkLndvcmtlci5qc1wiKTthPW5ldyBXb3JrZXIoYSk7Uy5QYS5wdXNoKGEpfVxuZnVuY3Rpb24gU2EoYSl7RD9hKCk6UHJvbWlzZS5hbGwoUy5QYS5tYXAoUy5ZYSkpLnRoZW4oYSl9XG52YXIgUz17UGE6W10sUWE6W10sYmI6W10sTWE6e30sV2EoKXtEPyhTLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1TLmpiLFMudGhyZWFkSW5pdFRMUz1TLmFiLFMuc2V0RXhpdFN0YXR1cz1TLiRhKTpSYSgpfSwkYTphPT5MPWEsdGI6W1wiJHRlcm1pbmF0ZVdvcmtlclwiXSxsYjooKT0+e2Zvcih2YXIgYSBvZiBTLlFhKUZhKGEpO2ZvcihhIG9mIFMuUGEpRmEoYSk7Uy5QYT1bXTtTLlFhPVtdO1MuTWE9W119LFphOmE9Pnt2YXIgYj1hLk9hO2RlbGV0ZSBTLk1hW2JdO1MuUGEucHVzaChhKTtTLlFhLnNwbGljZShTLlFhLmluZGV4T2YoYSksMSk7YS5PYT0wO1RhKGIpfSxqYigpe30sYWIoKXtTLmJiLmZvckVhY2goYT0+YSgpKX0sWWE6YT0+bmV3IFByb21pc2UoYj0+e2Eub25tZXNzYWdlPWg9PntoPWguZGF0YTt2YXIgaz1oLmNtZDtpZihoLnRhcmdldFRocmVhZCYmaC50YXJnZXRUaHJlYWQhPVcoKSl7dmFyIHQ9Uy5NYVtoLnRhcmdldFRocmVhZF07dD90LnBvc3RNZXNzYWdlKGgsaC50cmFuc2Zlckxpc3QpOlxuSihgSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSBcIiR7a31cIiB0byB0YXJnZXQgcHRocmVhZCAke2gudGFyZ2V0VGhyZWFkfSwgYnV0IHRoYXQgdGhyZWFkIG5vIGxvbmdlciBleGlzdHMhYCl9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09aylYKCk7ZWxzZSBpZihcInNwYXduVGhyZWFkXCI9PT1rKUhhKGgpO2Vsc2UgaWYoXCJjbGVhbnVwVGhyZWFkXCI9PT1rKVMuWmEoUy5NYVtoLnRocmVhZF0pO2Vsc2UgaWYoXCJraWxsVGhyZWFkXCI9PT1rKWg9aC50aHJlYWQsaz1TLk1hW2hdLGRlbGV0ZSBTLk1hW2hdLEZhKGspLFRhKGgpLFMuUWEuc3BsaWNlKFMuUWEuaW5kZXhPZihrKSwxKSxrLk9hPTA7ZWxzZSBpZihcImNhbmNlbFRocmVhZFwiPT09aylTLk1hW2gudGhyZWFkXS5wb3N0TWVzc2FnZSh7Y21kOlwiY2FuY2VsXCJ9KTtlbHNlIGlmKFwibG9hZGVkXCI9PT1rKWEubG9hZGVkPSEwLEImJiFhLk9hJiZhLnVucmVmKCksYihhKTtlbHNlIGlmKFwiYWxlcnRcIj09PWspYWxlcnQoYFRocmVhZCAke2gudGhyZWFkSWR9OiAke2gudGV4dH1gKTtcbmVsc2UgaWYoXCJzZXRpbW1lZGlhdGVcIj09PWgudGFyZ2V0KWEucG9zdE1lc3NhZ2UoaCk7ZWxzZSBpZihcImNhbGxIYW5kbGVyXCI9PT1rKXZbaC5oYW5kbGVyXSguLi5oLmFyZ3MpO2Vsc2UgayYmSihgd29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kICR7a31gKX07YS5vbmVycm9yPWg9PntKKGAke1wid29ya2VyIHNlbnQgYW4gZXJyb3IhXCJ9ICR7aC5maWxlbmFtZX06JHtoLmxpbmVub306ICR7aC5tZXNzYWdlfWApO3Rocm93IGg7fTtCJiYoYS5vbihcIm1lc3NhZ2VcIixoPT5hLm9ubWVzc2FnZSh7ZGF0YTpofSkpLGEub24oXCJlcnJvclwiLGg9PmEub25lcnJvcihoKSkpO3ZhciBjPVtdLGQ9W1wib25FeGl0XCJdLGc7Zm9yKGcgb2YgZCl2Lmhhc093blByb3BlcnR5KGcpJiZjLnB1c2goZyk7YS5wb3N0TWVzc2FnZSh7Y21kOlwibG9hZFwiLGhhbmRsZXJzOmMsdXJsT3JCbG9iOnYubWFpblNjcmlwdFVybE9yQmxvYnx8X3NjcmlwdERpcix3YXNtTWVtb3J5OmUsd2FzbU1vZHVsZTpzYX0pfSl9O1xudi5QVGhyZWFkPVM7dmFyIFVhPWE9Pntmb3IoOzA8YS5sZW5ndGg7KWEuc2hpZnQoKSh2KX07di5lc3RhYmxpc2hTdGFja1NwYWNlPSgpPT57dmFyIGE9VygpLGI9cigpW2ErNTI+Pj4yPj4+MF07YT1yKClbYSs1Nj4+PjI+Pj4wXTtWYShiLGItYSk7VShiKX07ZnVuY3Rpb24gUGEoYSl7aWYoRClyZXR1cm4gVigxLDAsYSk7UWEoYSl9dmFyIFdhPVtdLFhhO3YuaW52b2tlRW50cnlQb2ludD0oYSxiKT0+e3ZhciBjPVdhW2FdO2N8fChhPj1XYS5sZW5ndGgmJihXYS5sZW5ndGg9YSsxKSxXYVthXT1jPVhhLmdldChhKSk7YT1jKGIpOzA8VD9TLiRhKGEpOllhKGEpfTtcbmZ1bmN0aW9uIFphKGEpe3RoaXMuVmE9YS0yNDt0aGlzLmdiPWZ1bmN0aW9uKGIpe3IoKVt0aGlzLlZhKzQ+Pj4yPj4+MF09Yn07dGhpcy5mYj1mdW5jdGlvbihiKXtyKClbdGhpcy5WYSs4Pj4+Mj4+PjBdPWJ9O3RoaXMuV2E9ZnVuY3Rpb24oYixjKXt0aGlzLmViKCk7dGhpcy5nYihiKTt0aGlzLmZiKGMpfTt0aGlzLmViPWZ1bmN0aW9uKCl7cigpW3RoaXMuVmErMTY+Pj4yPj4+MF09MH19dmFyICRhPTAsYWI9MDtmdW5jdGlvbiBiYihhLGIsYyxkKXtyZXR1cm4gRD9WKDIsMSxhLGIsYyxkKTpjYihhLGIsYyxkKX1cbmZ1bmN0aW9uIGNiKGEsYixjLGQpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIpcmV0dXJuIEooXCJDdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgU2hhcmVkQXJyYXlCdWZmZXIsIHB0aHJlYWRzIGFyZSBub3QgYXZhaWxhYmxlIVwiKSw2O3ZhciBnPVtdO2lmKEQmJjA9PT1nLmxlbmd0aClyZXR1cm4gYmIoYSxiLGMsZCk7YT17a2I6YyxPYTphLGhiOmQscWI6Z307cmV0dXJuIEQ/KGEuc2I9XCJzcGF3blRocmVhZFwiLHBvc3RNZXNzYWdlKGEsZyksMCk6SGEoYSl9ZnVuY3Rpb24gZGIoYSxiLGMpe3JldHVybiBEP1YoMywxLGEsYixjKTowfWZ1bmN0aW9uIGViKGEsYil7aWYoRClyZXR1cm4gVig0LDEsYSxiKX1cbnZhciBmYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sZ2I9KGEsYixjLGQpPT57Yz4+Pj0wO2lmKCEoMDxkKSlyZXR1cm4gMDt2YXIgZz1jO2Q9YytkLTE7Zm9yKHZhciBoPTA7aDxhLmxlbmd0aDsrK2gpe3ZhciBrPWEuY2hhckNvZGVBdChoKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciB0PWEuY2hhckNvZGVBdCgrK2gpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8dCYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZClicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWQpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWQpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PWQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+XG4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtZ30saGI9KGEsYixjKT0+Z2IoYSxuKCksYixjKTtmdW5jdGlvbiBpYihhLGIpe2lmKEQpcmV0dXJuIFYoNSwxLGEsYil9ZnVuY3Rpb24gamIoYSxiLGMpe2lmKEQpcmV0dXJuIFYoNiwxLGEsYixjKX1mdW5jdGlvbiBrYihhLGIsYyl7cmV0dXJuIEQ/Vig3LDEsYSxiLGMpOjB9ZnVuY3Rpb24gbGIoYSxiKXtpZihEKXJldHVybiBWKDgsMSxhLGIpfWZ1bmN0aW9uIG1iKGEsYixjKXtpZihEKXJldHVybiBWKDksMSxhLGIsYyl9ZnVuY3Rpb24gbmIoYSxiLGMsZCl7aWYoRClyZXR1cm4gVigxMCwxLGEsYixjLGQpfWZ1bmN0aW9uIG9iKGEsYixjLGQpe2lmKEQpcmV0dXJuIFYoMTEsMSxhLGIsYyxkKX1mdW5jdGlvbiBwYihhLGIsYyxkKXtpZihEKXJldHVybiBWKDEyLDEsYSxiLGMsZCl9XG5mdW5jdGlvbiBxYihhKXtpZihEKXJldHVybiBWKDEzLDEsYSl9ZnVuY3Rpb24gcmIoYSxiKXtpZihEKXJldHVybiBWKDE0LDEsYSxiKX1mdW5jdGlvbiBzYihhLGIsYyl7aWYoRClyZXR1cm4gVigxNSwxLGEsYixjKX1mdW5jdGlvbiB0YihhKXthPj4+PTA7XCJmdW5jdGlvblwiPT09dHlwZW9mIEF0b21pY3MucmImJihBdG9taWNzLnJiKHAoKSxhPj4+MixhKS52YWx1ZS50aGVuKFgpLGErPTEyOCxBdG9taWNzLnN0b3JlKHAoKSxhPj4+MiwxKSl9di5fX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9dGI7dmFyIFg9KCk9Pnt2YXIgYT1XKCk7aWYoYSYmKHRiKGEpLGE9dWIsIUspKXRyeXtpZihhKCksISgwPFQpKXRyeXtEP1lhKEwpOlFhKEwpfWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBSfHxcInVud2luZFwiPT1ifHx6KDEsYil9fWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBSfHxcInVud2luZFwiPT1ifHx6KDEsYil9fTt2LmNoZWNrTWFpbGJveD1YO1xudmFyIHZiPVtdLFk9YT0+MD09PWElNCYmKDAhPT1hJTEwMHx8MD09PWElNDAwKSx3Yj1bMCwzMSw2MCw5MSwxMjEsMTUyLDE4MiwyMTMsMjQ0LDI3NCwzMDUsMzM1XSx4Yj1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XTtmdW5jdGlvbiB5YihhLGIsYyxkLGcsaCxrLHQpe3JldHVybiBEP1YoMTYsMSxhLGIsYyxkLGcsaCxrLHQpOi01Mn1mdW5jdGlvbiB6YihhLGIsYyxkLGcsaCxrKXtpZihEKXJldHVybiBWKDE3LDEsYSxiLGMsZCxnLGgsayl9XG52YXIgQmI9YT0+e3ZhciBiPWZiKGEpKzEsYz1BYihiKTtjJiZoYihhLGMsYik7cmV0dXJuIGN9LENiPVtdLERiPXt9LEZiPSgpPT57aWYoIUViKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpqYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIERiKXZvaWQgMD09PURiW2JdP2RlbGV0ZSBhW2JdOmFbYl09RGJbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO0ViPWN9cmV0dXJuIEVifSxFYjtcbmZ1bmN0aW9uIEdiKGEsYil7aWYoRClyZXR1cm4gVigxOCwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz0wO0ZiKCkuZm9yRWFjaCgoZCxnKT0+e3ZhciBoPWIrYztnPXIoKVthKzQqZz4+PjI+Pj4wXT1oO2ZvcihoPTA7aDxkLmxlbmd0aDsrK2gpYWEoKVtnKys+Pj4wPj4+MF09ZC5jaGFyQ29kZUF0KGgpO2FhKClbZz4+PjA+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH1mdW5jdGlvbiBLYihhLGIpe2lmKEQpcmV0dXJuIFYoMTksMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9RmIoKTtyKClbYT4+PjI+Pj4wXT1jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChnPT5kKz1nLmxlbmd0aCsxKTtyKClbYj4+PjI+Pj4wXT1kO3JldHVybiAwfWZ1bmN0aW9uIExiKGEpe3JldHVybiBEP1YoMjAsMSxhKTo1Mn1mdW5jdGlvbiBNYihhLGIsYyxkKXtyZXR1cm4gRD9WKDIxLDEsYSxiLGMsZCk6NTJ9XG5mdW5jdGlvbiBOYihhLGIsYyxkLGcpe3JldHVybiBEP1YoMjIsMSxhLGIsYyxkLGcpOjcwfXZhciBPYj1bbnVsbCxbXSxbXV07ZnVuY3Rpb24gUGIoYSxiLGMsZCl7aWYoRClyZXR1cm4gVigyMywxLGEsYixjLGQpO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZz0wLGg9MDtoPGM7aCsrKXt2YXIgaz1yKClbYj4+PjI+Pj4wXSx0PXIoKVtiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIEM9MDtDPHQ7QysrKXt2YXIgdz1uKClbaytDPj4+MF0seT1PYlthXTswPT09d3x8MTA9PT13PygoMT09PWE/cWE6SikoSmEoeSwwKSkseS5sZW5ndGg9MCk6eS5wdXNoKHcpfWcrPXR9cigpW2Q+Pj4yPj4+MF09ZztyZXR1cm4gMH12YXIgUWI9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXSxSYj1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO1xuZnVuY3Rpb24gU2IoYSl7dmFyIGI9QXJyYXkoZmIoYSkrMSk7Z2IoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifXZhciBUYj0oYSxiKT0+e2FhKCkuc2V0KGEsYj4+PjApfTtcbmZ1bmN0aW9uIFViKGEsYixjLGQpe2Z1bmN0aW9uIGcoZixxLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHE7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixxKXtyZXR1cm4gZyhmLHEsXCIwXCIpfWZ1bmN0aW9uIGsoZixxKXtmdW5jdGlvbiB1KEhiKXtyZXR1cm4gMD5IYj8tMTowPEhiPzE6MH12YXIgRjswPT09KEY9dShmLmdldEZ1bGxZZWFyKCktcS5nZXRGdWxsWWVhcigpKSkmJjA9PT0oRj11KGYuZ2V0TW9udGgoKS1xLmdldE1vbnRoKCkpKSYmKEY9dShmLmdldERhdGUoKS1xLmdldERhdGUoKSkpO3JldHVybiBGfWZ1bmN0aW9uIHQoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBDKGYpe3ZhciBxPWYuUmE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuU2ErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cTspe3ZhciB1PWYuZ2V0TW9udGgoKSxGPShZKGYuZ2V0RnVsbFllYXIoKSk/UWI6UmIpW3VdO2lmKHE+Ri1mLmdldERhdGUoKSlxLT1GLWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStxKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3E9dChuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PXQodSk7cmV0dXJuIDA+PWsocSxmKT8wPj1rKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgdz1yKClbZCs0MD4+PjI+Pj4wXTtkPXtvYjpwKClbZD4+PjI+Pj4wXSxuYjpwKClbZCs0Pj4+Mj4+PjBdLFRhOnAoKVtkKzg+Pj4yPj4+MF0sWGE6cCgpW2QrMTI+Pj4yPj4+MF0sVWE6cCgpW2QrMTY+Pj4yPj4+MF0sU2E6cCgpW2QrMjA+Pj4yPj4+MF0sTmE6cCgpW2QrMjQ+Pj4yPj4+MF0sUmE6cCgpW2QrMjg+Pj4yPj4+MF0sdWI6cCgpW2QrMzI+Pj4yPj4+MF0sbWI6cCgpW2QrMzY+Pj4yPj4+MF0scGI6dz9RKHcpOlwiXCJ9O2M9UShjKTt3PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXG5cIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHkgaW4gdyljPWMucmVwbGFjZShuZXcgUmVnRXhwKHksXCJnXCIpLHdbeV0pO3ZhciBJYj1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLEpiPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt3PXtcIiVhXCI6Zj0+SWJbZi5OYV0uc3Vic3RyaW5nKDAsMyksXG5cIiVBXCI6Zj0+SWJbZi5OYV0sXCIlYlwiOmY9PkpiW2YuVWFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5KYltmLlVhXSxcIiVDXCI6Zj0+aCgoZi5TYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+aChmLlhhLDIpLFwiJWVcIjpmPT5nKGYuWGEsMixcIiBcIiksXCIlZ1wiOmY9PkMoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmY9PkMoZiksXCIlSFwiOmY9PmgoZi5UYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5UYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gaChmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgcT0wLHU9MDt1PD1mLlVhLTE7cSs9KFkoZi5TYSsxOTAwKT9RYjpSYilbdSsrXSk7cmV0dXJuIGgoZi5YYStxLDMpfSxcIiVtXCI6Zj0+aChmLlVhKzEsMiksXCIlTVwiOmY9PmgoZi5uYiwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuVGEmJjEyPmYuVGE/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+aChmLm9iLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi5OYXx8NyxcIiVVXCI6Zj0+aChNYXRoLmZsb29yKChmLlJhK1xuNy1mLk5hKS83KSwyKSxcIiVWXCI6Zj0+e3ZhciBxPU1hdGguZmxvb3IoKGYuUmErNy0oZi5OYSs2KSU3KS83KTsyPj0oZi5OYSszNzEtZi5SYS0yKSU3JiZxKys7aWYocSk1Mz09cSYmKHU9KGYuTmErMzcxLWYuUmEpJTcsND09dXx8Mz09dSYmWShmLlNhKXx8KHE9MSkpO2Vsc2V7cT01Mjt2YXIgdT0oZi5OYSs3LWYuUmEtMSklNzsoND09dXx8NT09dSYmWShmLlNhJTQwMC0xKSkmJnErK31yZXR1cm4gaChxLDIpfSxcIiV3XCI6Zj0+Zi5OYSxcIiVXXCI6Zj0+aChNYXRoLmZsb29yKChmLlJhKzctKGYuTmErNiklNykvNyksMiksXCIleVwiOmY9PihmLlNhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLlNhKzE5MDAsXCIlelwiOmY9PntmPWYubWI7dmFyIHE9MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihxP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLnBiLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFxuXCJcXHgwMFxceDAwXCIpO2Zvcih5IGluIHcpYy5pbmNsdWRlcyh5KSYmKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeSxcImdcIiksd1t5XShkKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7eT1TYihjKTtpZih5Lmxlbmd0aD5iKXJldHVybiAwO1RiKHksYSk7cmV0dXJuIHkubGVuZ3RoLTF9Uy5XYSgpO1xudmFyIFZiPVtPYSxQYSxiYixkYixlYixpYixqYixrYixsYixtYixuYixvYixwYixxYixyYixzYix5Yix6YixHYixLYixMYixNYixOYixQYl0sWmI9e2I6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IFphKGEpKS5XYShiPj4+MCxjPj4+MCk7JGE9YTthYisrO3Rocm93ICRhO30sTDpmdW5jdGlvbihhKXtXYihhPj4+MCwhQSwxLCFrYSwxMzEwNzIsITEpO1MuYWIoKX0sajpmdW5jdGlvbihhKXthPj4+PTA7RD9wb3N0TWVzc2FnZSh7Y21kOlwiY2xlYW51cFRocmVhZFwiLHRocmVhZDphfSk6Uy5aYShTLk1hW2FdKX0sSDpjYixoOmRiLFM6ZWIsRDppYixGOmpiLFQ6a2IsUTpsYixKOm1iLFA6bmIsbjpvYixFOnBiLEI6cWIsUjpyYixDOnNiLHA6KCk9PjEsejpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KCgpPT5YKCkpOkQ/cG9zdE1lc3NhZ2Uoe3RhcmdldFRocmVhZDphLGNtZDpcImNoZWNrTWFpbGJveFwifSk6KGE9Uy5NYVthXSkmJmEucG9zdE1lc3NhZ2Uoe2NtZDpcImNoZWNrTWFpbGJveFwifSl9LFxuSTpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7dmIubGVuZ3RoPWM7ZD1kPj4+MD4+PjM7Zm9yKHZhciBnPTA7ZzxjO2crKyl2YltnXT1lYSgpW2QrZz4+PjBdO2E9MD5hP0VhWy1hLTFdOlZiW2FdO1MuaWI9YjtiPWEuYXBwbHkobnVsbCx2Yik7Uy5pYj0wO3JldHVybiBifSxLOnRiLG86ZnVuY3Rpb24oYSl7QiYmUy5NYVthPj4+MF0ucmVmKCl9LHM6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO3AoKVtjKzQ+Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7cCgpW2MrOD4+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7cCgpW2MrMTI+Pj4yPj4+MF09YS5nZXRVVENEYXRlKCk7cCgpW2MrMTY+Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO3AoKVtjKzIwPj4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO1xucCgpW2MrMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTthPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwO3AoKVtjKzI4Pj4+Mj4+PjBdPWF9LHQ6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO3AoKVtjKzQ+Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7cCgpW2MrOD4+PjI+Pj4wXT1hLmdldEhvdXJzKCk7cCgpW2MrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7cCgpW2MrMTY+Pj4yPj4+MF09YS5nZXRNb250aCgpO3AoKVtjKzIwPj4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO3AoKVtjKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7Yj0oWShhLmdldEZ1bGxZZWFyKCkpP3diOnhiKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtwKClbYysyOD4+PlxuMj4+PjBdPWI7cCgpW2MrMzY+Pj4yPj4+MF09LSg2MCphLmdldFRpbWV6b25lT2Zmc2V0KCkpO2I9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBkPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTthPShiIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGQsYikpfDA7cCgpW2MrMzI+Pj4yPj4+MF09YX0sdTpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bmV3IERhdGUocCgpW2ErMjA+Pj4yPj4+MF0rMTkwMCxwKClbYSsxNj4+PjI+Pj4wXSxwKClbYSsxMj4+PjI+Pj4wXSxwKClbYSs4Pj4+Mj4+PjBdLHAoKVthKzQ+Pj4yPj4+MF0scCgpW2E+Pj4yPj4+MF0sMCksYz1wKClbYSszMj4+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxoPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksXG4wLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oaCxnKTswPmM/cCgpW2ErMzI+Pj4yPj4+MF09TnVtYmVyKGchPWgmJms9PWQpOjA8YyE9KGs9PWQpJiYoZz1NYXRoLm1heChoLGcpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azpnKS1kKSkpO3AoKVthKzI0Pj4+Mj4+PjBdPWIuZ2V0RGF5KCk7Yz0oWShiLmdldEZ1bGxZZWFyKCkpP3diOnhiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtwKClbYSsyOD4+PjI+Pj4wXT1jO3AoKVthPj4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO3AoKVthKzQ+Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7cCgpW2ErOD4+PjI+Pj4wXT1iLmdldEhvdXJzKCk7cCgpW2ErMTI+Pj4yPj4+MF09Yi5nZXREYXRlKCk7cCgpW2ErMTY+Pj4yPj4+MF09Yi5nZXRNb250aCgpO3AoKVthKzIwPj4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCk7aXNOYU4oYSk/KHAoKVtYYigpPj4+Mj4+PjBdPTYxLGE9LTEpOmEvPTFFMztcbnJldHVybiBZYigoUD1hLDE8PStNYXRoLmFicyhQKT8wPFA/K01hdGguZmxvb3IoUC80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKChQLSsofn5QPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKSksYT4+PjB9LHE6eWIscjp6Yix5OmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKHcpe3JldHVybih3PXcudG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/d1sxXTpcIkdNVFwifWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO3ZhciBnPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxoPW5ldyBEYXRlKGcsMCwxKSxrPW5ldyBEYXRlKGcsNiwxKTtnPWguZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgdD1rLmdldFRpbWV6b25lT2Zmc2V0KCksQz1NYXRoLm1heChnLHQpO3IoKVthPj4+Mj4+PjBdPTYwKkM7cCgpW2I+Pj4yPj4+MF09TnVtYmVyKGchPXQpO2E9ZChoKTtiPWQoayk7YT1CYihhKTtiPUJiKGIpO3Q8Zz8ocigpW2M+Pj4yPj4+MF09YSxyKClbYys0Pj4+Mj4+PjBdPWIpOlxuKHIoKVtjPj4+Mj4+PjBdPWIscigpW2MrND4+PjI+Pj4wXT1hKX0sYzooKT0+e3JhKFwiXCIpfSxPOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtDYi5sZW5ndGg9MDtmb3IodmFyIGQ7ZD1uKClbYisrPj4+MF07KXt2YXIgZz0xMDUhPWQ7ZyY9MTEyIT1kO2MrPWcmJmMlOD80OjA7Q2IucHVzaCgxMTI9PWQ/cigpW2M+Pj4yPj4+MF06MTA1PT1kP3AoKVtjPj4+Mj4+PjBdOmVhKClbYz4+PjM+Pj4wXSk7Yys9Zz84OjR9cmV0dXJuIEVhW2FdLmFwcGx5KG51bGwsQ2IpfSxrOigpPT57fSxpOigpPT5EYXRlLm5vdygpLFU6KCk9PntUKz0xO3Rocm93XCJ1bndpbmRcIjt9LEE6ZnVuY3Rpb24oKXtyZXR1cm4gNDI5NDkwMTc2MH0sZTooKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKSxmOigpPT5CP3JlcXVpcmUoXCJvc1wiKS5jcHVzKCkubGVuZ3RoOm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5LHg6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPVxubigpLmxlbmd0aDtpZihhPD1ifHw0Mjk0OTAxNzYwPGEpcmV0dXJuITE7Zm9yKHZhciBjPTE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGc9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7Zz0oZy5taW4uY2FsbChnLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLWUuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXtlLmdyb3coZyk7bSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChrKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sTTpHYixOOktiLEc6UWEsZzpMYixtOk1iLHY6TmIsbDpQYixhOmV8fHYud2FzbU1lbW9yeSx3OlViLGQ6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIFViKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFo9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGMsZCl7Wj1jLmV4cG9ydHM7Wj0kYigpO1MuYmIucHVzaChaLnphKTtYYT1aLkFhO3ZhLnVuc2hpZnQoWi5WKTtcbnNhPWQ7eWEoKTtyZXR1cm4gWn12YXIgYj17YTpaYn07TSsrO2lmKHYuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gdi5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtKKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCkseChjKX1EYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSxjLm1vZHVsZSl9KS5jYXRjaCh4KTtyZXR1cm57fX0oKTt2Ll9PcnRJbml0PShhLGIpPT4odi5fT3J0SW5pdD1aLlcpKGEsYik7di5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4odi5fT3J0R2V0TGFzdEVycm9yPVouWCkoYSxiKTt2Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsayx0LEMsdyk9Pih2Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1aLlkpKGEsYixjLGQsZyxoLGssdCxDLHcpO1xudi5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9Pih2Ll9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1aLlopKGEsYik7di5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9Pih2Ll9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9Wi5fKShhLGIsYyk7di5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih2Ll9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9Wi4kKShhLGIsYyk7di5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9Pih2Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi5hYSkoYSk7di5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4odi5fT3J0Q3JlYXRlU2Vzc2lvbj1aLmJhKShhLGIsYyk7di5fT3J0UmVsZWFzZVNlc3Npb249YT0+KHYuX09ydFJlbGVhc2VTZXNzaW9uPVouY2EpKGEpO3YuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KHYuX09ydEdldElucHV0T3V0cHV0Q291bnQ9Wi5kYSkoYSxiLGMpO1xudi5fT3J0R2V0SW5wdXROYW1lPShhLGIpPT4odi5fT3J0R2V0SW5wdXROYW1lPVouZWEpKGEsYik7di5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KHYuX09ydEdldE91dHB1dE5hbWU9Wi5mYSkoYSxiKTt2Ll9PcnRGcmVlPWE9Pih2Ll9PcnRGcmVlPVouZ2EpKGEpO3YuX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxnLGgpPT4odi5fT3J0Q3JlYXRlVGVuc29yPVouaGEpKGEsYixjLGQsZyxoKTt2Ll9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGcpPT4odi5fT3J0R2V0VGVuc29yRGF0YT1aLmlhKShhLGIsYyxkLGcpO3YuX09ydFJlbGVhc2VUZW5zb3I9YT0+KHYuX09ydFJlbGVhc2VUZW5zb3I9Wi5qYSkoYSk7di5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZCk9Pih2Ll9PcnRDcmVhdGVSdW5PcHRpb25zPVoua2EpKGEsYixjLGQpO3YuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih2Ll9PcnRBZGRSdW5Db25maWdFbnRyeT1aLmxhKShhLGIsYyk7XG52Ll9PcnRSZWxlYXNlUnVuT3B0aW9ucz1hPT4odi5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Wi5tYSkoYSk7di5fT3J0Q3JlYXRlQmluZGluZz1hPT4odi5fT3J0Q3JlYXRlQmluZGluZz1aLm5hKShhKTt2Ll9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KHYuX09ydEJpbmRJbnB1dD1aLm9hKShhLGIsYyk7di5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9Pih2Ll9PcnRCaW5kT3V0cHV0PVoucGEpKGEsYixjLGQpO3YuX09ydENsZWFyQm91bmRPdXRwdXRzPWE9Pih2Ll9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLnFhKShhKTt2Ll9PcnRSZWxlYXNlQmluZGluZz1hPT4odi5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5yYSkoYSk7di5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGQsZyk9Pih2Ll9PcnRSdW5XaXRoQmluZGluZz1aLnNhKShhLGIsYyxkLGcpO3YuX09ydFJ1bj0oYSxiLGMsZCxnLGgsayx0KT0+KHYuX09ydFJ1bj1aLnRhKShhLGIsYyxkLGcsaCxrLHQpO1xudi5fT3J0RW5kUHJvZmlsaW5nPWE9Pih2Ll9PcnRFbmRQcm9maWxpbmc9Wi51YSkoYSk7dmFyIFhiPSgpPT4oWGI9Wi52YSkoKSxXPXYuX3B0aHJlYWRfc2VsZj0oKT0+KFc9di5fcHRocmVhZF9zZWxmPVoud2EpKCksQWI9di5fbWFsbG9jPWE9PihBYj12Ll9tYWxsb2M9Wi54YSkoYSk7di5fZnJlZT1hPT4odi5fZnJlZT1aLnlhKShhKTt2Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD0oKT0+KHYuX19lbXNjcmlwdGVuX3Rsc19pbml0PVouemEpKCk7dmFyIFdiPXYuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PShhLGIsYyxkLGcsaCk9PihXYj12Ll9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD1aLkJhKShhLGIsYyxkLGcsaCk7di5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9KCk9Pih2Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD1aLkNhKSgpO1xudmFyIE5hPShhLGIsYyxkKT0+KE5hPVouRGEpKGEsYixjLGQpLFRhPWE9PihUYT1aLkVhKShhKSxZYT12Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4oWWE9di5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9Wi5GYSkoYSksdWI9KCk9Pih1Yj1aLkdhKSgpLFliPWE9PihZYj1aLkhhKShhKSxWYT0oYSxiKT0+KFZhPVouSWEpKGEsYiksS2E9KCk9PihLYT1aLkphKSgpLFU9YT0+KFU9Wi5LYSkoYSksTWE9YT0+KE1hPVouTGEpKGEpO2Z1bmN0aW9uICRiKCl7dmFyIGE9WjthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5nPT5kKGcpPj4+MDthLnZhPWIoYS52YSk7YS53YT1iKGEud2EpO2EueGE9YyhhLnhhKTthLmVtc2NyaXB0ZW5fbWFpbl9ydW50aW1lX3RocmVhZF9pZD1iKGEuZW1zY3JpcHRlbl9tYWluX3J1bnRpbWVfdGhyZWFkX2lkKTthLkphPWIoYS5KYSk7YS5MYT1jKGEuTGEpO3JldHVybiBhfXYud2FzbU1lbW9yeT1lO1xudi5zdGFja0FsbG9jPU1hO3Yuc3RhY2tTYXZlPUthO3Yuc3RhY2tSZXN0b3JlPVU7di5rZWVwUnVudGltZUFsaXZlPSgpPT4wPFQ7di5VVEY4VG9TdHJpbmc9UTt2LnN0cmluZ1RvVVRGOD1oYjt2Lmxlbmd0aEJ5dGVzVVRGOD1mYjt2LkV4aXRTdGF0dXM9Ujt2LlBUaHJlYWQ9Uzt2YXIgYWM7Tj1mdW5jdGlvbiBiYygpe2FjfHxjYygpO2FjfHwoTj1iYyl9O2Z1bmN0aW9uIGNjKCl7aWYoISgwPE0pKWlmKEQpaGEodiksRHx8VWEodmEpLHN0YXJ0V29ya2VyKHYpO2Vsc2V7aWYodi5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHYucHJlUnVuJiYodi5wcmVSdW49W3YucHJlUnVuXSk7di5wcmVSdW4ubGVuZ3RoOyl1YS51bnNoaWZ0KHYucHJlUnVuLnNoaWZ0KCkpO1VhKHVhKTswPE18fGFjfHwoYWM9ITAsdi5jYWxsZWRSdW49ITAsS3x8KER8fFVhKHZhKSxoYSh2KSxEfHxVYSh3YSkpKX19Y2MoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cbik7XG59KSgpO1xuO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtVGhyZWFkZWQ7XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbVRocmVhZGVkKTtcbiIsICJcInVzZSBzdHJpY3RcIjt2YXIgTW9kdWxlPXt9O3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09XCJzdHJpbmdcIjtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgbm9kZVdvcmtlclRocmVhZHM9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO3ZhciBwYXJlbnRQb3J0PW5vZGVXb3JrZXJUaHJlYWRzLnBhcmVudFBvcnQ7cGFyZW50UG9ydC5vbihcIm1lc3NhZ2VcIixkYXRhPT5vbm1lc3NhZ2Uoe2RhdGE6ZGF0YX0pKTt2YXIgZnM9cmVxdWlyZShcImZzXCIpO3ZhciB2bT1yZXF1aXJlKFwidm1cIik7T2JqZWN0LmFzc2lnbihnbG9iYWwse3NlbGY6Z2xvYmFsLHJlcXVpcmU6cmVxdWlyZSxNb2R1bGU6TW9kdWxlLGxvY2F0aW9uOntocmVmOl9fZmlsZW5hbWV9LFdvcmtlcjpub2RlV29ya2VyVGhyZWFkcy5Xb3JrZXIsaW1wb3J0U2NyaXB0czpmPT52bS5ydW5JblRoaXNDb250ZXh0KGZzLnJlYWRGaWxlU3luYyhmLFwidXRmOFwiKSx7ZmlsZW5hbWU6Zn0pLHBvc3RNZXNzYWdlOm1zZz0+cGFyZW50UG9ydC5wb3N0TWVzc2FnZShtc2cpLHBlcmZvcm1hbmNlOmdsb2JhbC5wZXJmb3JtYW5jZXx8e25vdzpEYXRlLm5vd319KX12YXIgaW5pdGlhbGl6ZWRKUz1mYWxzZTtmdW5jdGlvbiB0aHJlYWRQcmludEVycigpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7ZnMud3JpdGVTeW5jKDIsdGV4dCtcIlxcblwiKTtyZXR1cm59Y29uc29sZS5lcnJvcih0ZXh0KX1mdW5jdGlvbiB0aHJlYWRBbGVydCgpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7cG9zdE1lc3NhZ2Uoe2NtZDpcImFsZXJ0XCIsdGV4dDp0ZXh0LHRocmVhZElkOk1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKX0pfXZhciBlcnI9dGhyZWFkUHJpbnRFcnI7c2VsZi5hbGVydD10aHJlYWRBbGVydDtNb2R1bGVbXCJpbnN0YW50aWF0ZVdhc21cIl09KGluZm8scmVjZWl2ZUluc3RhbmNlKT0+e3ZhciBtb2R1bGU9TW9kdWxlW1wid2FzbU1vZHVsZVwiXTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPW51bGw7dmFyIGluc3RhbmNlPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShtb2R1bGUsaW5mbyk7cmV0dXJuIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSl9O3NlbGYub251bmhhbmRsZWRyZWplY3Rpb249ZT0+e3Rocm93IGUucmVhc29ufHxlfTtmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGUpe3RyeXtpZihlLmRhdGEuY21kPT09XCJsb2FkXCIpe2xldCBtZXNzYWdlUXVldWU9W107c2VsZi5vbm1lc3NhZ2U9ZT0+bWVzc2FnZVF1ZXVlLnB1c2goZSk7c2VsZi5zdGFydFdvcmtlcj1pbnN0YW5jZT0+e01vZHVsZT1pbnN0YW5jZTtwb3N0TWVzc2FnZSh7XCJjbWRcIjpcImxvYWRlZFwifSk7Zm9yKGxldCBtc2cgb2YgbWVzc2FnZVF1ZXVlKXtoYW5kbGVNZXNzYWdlKG1zZyl9c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZX07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1lLmRhdGEud2FzbU1vZHVsZTtmb3IoY29uc3QgaGFuZGxlciBvZiBlLmRhdGEuaGFuZGxlcnMpe01vZHVsZVtoYW5kbGVyXT0oLi4uYXJncyk9Pntwb3N0TWVzc2FnZSh7Y21kOlwiY2FsbEhhbmRsZXJcIixoYW5kbGVyOmhhbmRsZXIsYXJnczphcmdzfSl9fU1vZHVsZVtcIndhc21NZW1vcnlcIl09ZS5kYXRhLndhc21NZW1vcnk7TW9kdWxlW1wiYnVmZmVyXCJdPU1vZHVsZVtcIndhc21NZW1vcnlcIl0uYnVmZmVyO01vZHVsZVtcIkVOVklST05NRU5UX0lTX1BUSFJFQURcIl09dHJ1ZTtpZih0eXBlb2YgZS5kYXRhLnVybE9yQmxvYj09XCJzdHJpbmdcIil7aW1wb3J0U2NyaXB0cyhlLmRhdGEudXJsT3JCbG9iKX1lbHNle3ZhciBvYmplY3RVcmw9VVJMLmNyZWF0ZU9iamVjdFVSTChlLmRhdGEudXJsT3JCbG9iKTtpbXBvcnRTY3JpcHRzKG9iamVjdFVybCk7VVJMLnJldm9rZU9iamVjdFVSTChvYmplY3RVcmwpfW9ydFdhc21UaHJlYWRlZChNb2R1bGUpfWVsc2UgaWYoZS5kYXRhLmNtZD09PVwicnVuXCIpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdFwiXShlLmRhdGEucHRocmVhZF9wdHIsLyppc19tYWluPSovMCwvKmlzX3J1bnRpbWU9Ki8wLC8qY2FuX2Jsb2NrPSovMSk7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0XCJdKGUuZGF0YS5wdGhyZWFkX3B0cik7TW9kdWxlW1wiZXN0YWJsaXNoU3RhY2tTcGFjZVwiXSgpO01vZHVsZVtcIlBUaHJlYWRcIl0ucmVjZWl2ZU9iamVjdFRyYW5zZmVyKGUuZGF0YSk7TW9kdWxlW1wiUFRocmVhZFwiXS50aHJlYWRJbml0VExTKCk7aWYoIWluaXRpYWxpemVkSlMpe2luaXRpYWxpemVkSlM9dHJ1ZX10cnl7TW9kdWxlW1wiaW52b2tlRW50cnlQb2ludFwiXShlLmRhdGEuc3RhcnRfcm91dGluZSxlLmRhdGEuYXJnKX1jYXRjaChleCl7aWYoZXghPVwidW53aW5kXCIpe3Rocm93IGV4fX19ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjYW5jZWxcIil7aWYoTW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXRcIl0oLTEpfX1lbHNlIGlmKGUuZGF0YS50YXJnZXQ9PT1cInNldGltbWVkaWF0ZVwiKXt9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjaGVja01haWxib3hcIil7aWYoaW5pdGlhbGl6ZWRKUyl7TW9kdWxlW1wiY2hlY2tNYWlsYm94XCJdKCl9fWVsc2UgaWYoZS5kYXRhLmNtZCl7ZXJyKGB3b3JrZXIuanMgcmVjZWl2ZWQgdW5rbm93biBjb21tYW5kICR7ZS5kYXRhLmNtZH1gKTtlcnIoZS5kYXRhKX19Y2F0Y2goZXgpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZFwiXT8uKCk7dGhyb3cgZXh9fXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2U7XG4iLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQge0Vudn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtPcnRXYXNtTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20nO1xuaW1wb3J0IHtPcnRXYXNtVGhyZWFkZWRNb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cbmxldCBvcnRXYXNtRmFjdG9yeTogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT47XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gIG9ydFdhc21GYWN0b3J5ID0gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC10cmFpbmluZy13YXNtLXNpbWQuanMnKTtcbn0gZWxzZSB7XG4gIG9ydFdhc21GYWN0b3J5ID1cbiAgICAgIEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20uanMnKSA6IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLmpzZXAuanMnKTtcbn1cblxuY29uc3Qgb3J0V2FzbUZhY3RvcnlUaHJlYWRlZDogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT4gPSAhQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEID9cbiAgICAoQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcycpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAuanMnKSkgOlxuICAgIG9ydFdhc21GYWN0b3J5O1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5cbmxldCB3YXNtOiBPcnRXYXNtTW9kdWxlfHVuZGVmaW5lZDtcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGFib3J0ZWQgPSBmYWxzZTtcblxuY29uc3QgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCA9IChudW1UaHJlYWRzOiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgLy8gV2ViQXNzZW1ibHkgdGhyZWFkcyBhcmUgc2V0IHRvIDEgKHNpbmdsZSB0aHJlYWQpLlxuICBpZiAobnVtVGhyZWFkcyA9PT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgIXNlbGYuY3Jvc3NPcmlnaW5Jc29sYXRlZCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnZW52Lndhc20ubnVtVGhyZWFkcyBpcyBzZXQgdG8gJyArIG51bVRocmVhZHMgK1xuICAgICAgICAgICcsIGJ1dCB0aGlzIHdpbGwgbm90IHdvcmsgdW5sZXNzIHlvdSBlbmFibGUgY3Jvc3NPcmlnaW5Jc29sYXRlZCBtb2RlLiAnICtcbiAgICAgICAgICAnU2VlIGh0dHBzOi8vd2ViLmRldi9jcm9zcy1vcmlnaW4taXNvbGF0aW9uLWd1aWRlLyBmb3IgbW9yZSBpbmZvLicpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBvbm54cnVudGltZS13ZWIgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aS10aHJlYWRzIGluIE5vZGUuanMuXG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ2Vudi53YXNtLm51bVRocmVhZHMgaXMgc2V0IHRvICcgKyBudW1UaHJlYWRzICtcbiAgICAgICAgJywgaG93ZXZlciwgY3VycmVudGx5IG9ubnhydW50aW1lLXdlYiBkb2VzIG5vdCBzdXBwb3J0IG11bHRpLXRocmVhZHMgaW4gTm9kZS5qcy4gJyArXG4gICAgICAgICdQbGVhc2UgY29uc2lkZXIgdXNpbmcgb25ueHJ1bnRpbWUtbm9kZSBmb3IgcGVyZm9ybWFuY2UgY3JpdGljYWwgc2NlbmFyaW9zLicpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciB0cmFuc2ZlcmFiaWxpdHkgb2YgU0FCcyAoZm9yIGJyb3dzZXJzLiBuZWVkZWQgZm9yIEZpcmVmb3gpXG4gICAgLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIW1zZy9tb3ppbGxhLmRldi5wbGF0Zm9ybS9JSGtCWmxIRVRwQS9kd3NNTmNoV0VRQUpcbiAgICBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbmV3IE1lc3NhZ2VDaGFubmVsKCkucG9ydDEucG9zdE1lc3NhZ2UobmV3IFNoYXJlZEFycmF5QnVmZmVyKDEpKTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSB0aHJlYWRzIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgdGhyZWFkZWQgaW5zdHJ1Y3Rpb25zLlxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCA5NywgMTE1LCAxMDksIDEsIDAsICAwLCAgMCwgMSwgNCwgMSwgIDk2LCAwLCAgIDAsICAzLCAyLCAxLCAgMCwgNSxcbiAgICAgIDQsIDEsICAzLCAgIDEsICAgMSwgMTAsIDExLCAxLCA5LCAwLCA2NSwgMCwgIDI1NCwgMTYsIDIsIDAsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgaXNTaW1kU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IFNJTUQgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyBTSU1EIGluc3RydWN0aW9ucy5cblxuICAgIC8vIFRoZSBiaW5hcnkgZGF0YSBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZm9sbG93aW5nIGNvZGUgYnkgd2F0Mndhc206XG4gICAgLy9cbiAgICAvLyAobW9kdWxlXG4gICAgLy8gICAodHlwZSAkdDAgKGZ1bmMpKVxuICAgIC8vICAgKGZ1bmMgJGYwICh0eXBlICR0MClcbiAgICAvLyAgICAgKGRyb3BcbiAgICAvLyAgICAgICAoaTMyeDQuZG90X2kxNng4X3NcbiAgICAvLyAgICAgICAgIChpOHgxNi5zcGxhdFxuICAgIC8vICAgICAgICAgICAoaTMyLmNvbnN0IDApKVxuICAgIC8vICAgICAgICAgKHYxMjguY29uc3QgaTMyeDQgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCkpKSkpXG5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgICA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCAxMCwgMzAsIDEsICAgMjgsICAwLCA2NSwgMCxcbiAgICAgIDI1MywgMTUsIDI1MywgMTIsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsICAyNTMsIDE4NiwgMSwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBnZXRXYXNtRmlsZU5hbWUgPSAodXNlU2ltZDogYm9vbGVhbiwgdXNlVGhyZWFkczogYm9vbGVhbikgPT4ge1xuICBpZiAodXNlU2ltZCkge1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gICAgICByZXR1cm4gJ29ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbSc7XG4gICAgfVxuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20tc2ltZC53YXNtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS53YXNtJztcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVXZWJBc3NlbWJseSA9IGFzeW5jKGZsYWdzOiBFbnYuV2ViQXNzZW1ibHlGbGFncyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgaWYgKGluaXRpYWxpemluZykge1xuICAgIHRocm93IG5ldyBFcnJvcignbXVsdGlwbGUgY2FsbHMgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZGV0ZWN0ZWQuJyk7XG4gIH1cbiAgaWYgKGFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZmFpbGVkLicpO1xuICB9XG5cbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAvLyB3YXNtIGZsYWdzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkXG4gIGNvbnN0IHRpbWVvdXQgPSBmbGFncy5pbml0VGltZW91dCE7XG4gIGNvbnN0IG51bVRocmVhZHMgPSBmbGFncy5udW1UaHJlYWRzITtcbiAgY29uc3Qgc2ltZCA9IGZsYWdzLnNpbWQhO1xuXG4gIGNvbnN0IHVzZVRocmVhZHMgPSBpc011bHRpVGhyZWFkU3VwcG9ydGVkKG51bVRocmVhZHMpO1xuICBjb25zdCB1c2VTaW1kID0gc2ltZCAmJiBpc1NpbWRTdXBwb3J0ZWQoKTtcblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XG4gIGNvbnN0IHdhc21QYXRoT3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnb2JqZWN0JyA/IHdhc21QYXRoc1t3YXNtRmlsZU5hbWVdIDogdW5kZWZpbmVkO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KSk7XG4gIH1cblxuICAvLyBwcm9taXNlIGZvciBtb2R1bGUgaW5pdGlhbGl6YXRpb25cbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHVzZVRocmVhZHMgPyBvcnRXYXNtRmFjdG9yeVRocmVhZGVkIDogb3J0V2FzbUZhY3Rvcnk7XG4gICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy53b3JrZXIuanMnKSAmJlxuICAgICAgICAgICAgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHJlcXVpcmUoKSBmdW5jdGlvbiBpcyBoYW5kbGVkIGJ5IGVzYnVpbGQgcGx1Z2luIHRvIGxvYWQgZmlsZSBjb250ZW50IGFzIHN0cmluZy5cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMnKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcbiAgICAgICAgICBpZiAod2FzbVBhdGhPdmVycmlkZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhc21QYXRoT3ZlcnJpZGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJlZml4ID0gd2FzbVByZWZpeE92ZXJyaWRlID8/IHNjcmlwdERpcmVjdG9yeTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcykge1xuICAgICAgY29uZmlnLm51bVRocmVhZHMgPSBudW1UaHJlYWRzO1xuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdvcnQtd2FzbS10aHJlYWRlZC5qcycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IG5ldyBCbG9iKFtzY3JpcHRTb3VyY2VDb2RlXSwge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBtb2R1bGUgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgZmFpbGVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgKHdoYXQpID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICByZWplY3Qod2hhdCk7XG4gICAgICAgIH0pO1xuICB9KSk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgKHdhc20gYXMgT3J0V2FzbVRocmVhZGVkTW9kdWxlKS5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcblxuZXhwb3J0IGNvbnN0IGFsbG9jV2FzbVN0cmluZyA9IChkYXRhOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiBudW1iZXIgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBkYXRhTGVuZ3RoID0gd2FzbS5sZW5ndGhCeXRlc1VURjgoZGF0YSkgKyAxO1xuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xuICB3YXNtLnN0cmluZ1RvVVRGOChkYXRhLCBkYXRhT2Zmc2V0LCBkYXRhTGVuZ3RoKTtcbiAgYWxsb2NzLnB1c2goZGF0YU9mZnNldCk7XG5cbiAgcmV0dXJuIGRhdGFPZmZzZXQ7XG59O1xuXG5pbnRlcmZhY2UgRXh0cmFPcHRpb25zSGFuZGxlciB7XG4gIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZUV4dHJhT3B0aW9ucyA9XG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gICAgIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcmVmaXgpID8gcHJlZml4ICsga2V5IDoga2V5O1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsICh2YWx1ZSkgPyAnMScgOiAnMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIHdhc20uX09ydEdldExhc3RFcnJvcihwYXJhbXNPZmZzZXQsIHBhcmFtc09mZnNldCArIDQpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uSEVBUDMyW3BhcmFtc09mZnNldCAvIDRdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZVBvaW50ZXIgPyB3YXNtLlVURjhUb1N0cmluZyhlcnJvck1lc3NhZ2VQb2ludGVyKSA6ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSBFUlJPUl9DT0RFOiAke2Vycm9yQ29kZX0sIEVSUk9SX01FU1NBR0U6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBydW5PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnM/LmxvZ1NldmVyaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8ubG9nVmVyYm9zaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA9IDA7ICAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwhLCBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISwgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsIHRhZ0RhdGFPZmZzZXQpO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgcnVuIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZ3x1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCd8J3BhcmFsbGVsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xuICAgIGNhc2UgJ3NlcXVlbnRpYWwnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcbiAgfVxufTtcblxuY29uc3QgYXBwZW5kRGVmYXVsdE9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBpZiAoIW9wdGlvbnMuZXh0cmEpIHtcbiAgICBvcHRpb25zLmV4dHJhID0ge307XG4gIH1cbiAgaWYgKCFvcHRpb25zLmV4dHJhLnNlc3Npb24pIHtcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcbiAgfVxuICBjb25zdCBzZXNzaW9uID0gb3B0aW9ucy5leHRyYS5zZXNzaW9uIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSA9ICcxJztcbiAgfVxuXG4gIC8vIGlmIHVzaW5nIEpTRVAgd2l0aCBXZWJHUFUsIGFsd2F5cyBkaXNhYmxlIG1lbW9yeSBwYXR0ZXJuXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxuICAgICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZShlcCA9PiAodHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZSkgPT09ICd3ZWJncHUnKSkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxuICAgIChzZXNzaW9uT3B0aW9uc0hhbmRsZTogbnVtYmVyLCBleGVjdXRpb25Qcm92aWRlcnM6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXSxcbiAgICAgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG5cbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgICAgICBzd2l0Y2ggKGVwTmFtZSkge1xuICAgICAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdkZXZpY2VUeXBlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLmRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZGV2aWNlVHlwZScgLSAke3dlYm5uT3B0aW9ucy5kZXZpY2VUeXBlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ubnVtVGhyZWFkcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1UaHJlYWRzID0gd2Vibm5PcHRpb25zLm51bVRocmVhZHM7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBpZ25vcmUgaW52YWxpZCB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcy5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bVRocmVhZHMgIT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIobnVtVGhyZWFkcykgfHwgbnVtVGhyZWFkcyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIG51bVRocmVhZHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdudW1UaHJlYWRzJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobnVtVGhyZWFkcy50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ251bVRocmVhZHMnIC0gJHt3ZWJubk9wdGlvbnMubnVtVGhyZWFkc30uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LnBvd2VyUHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ3Bvd2VyUHJlZmVyZW5jZScsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5wb3dlclByZWZlcmVuY2UsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncG93ZXJQcmVmZXJlbmNlJyAtICR7d2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZX0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3ZWJncHUnOlxuICAgICAgICAgICAgZXBOYW1lID0gJ0pTJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYmdwdU9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkNIVycgJiYgd2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOSFdDJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmVmZXJyZWRMYXlvdXQgbXVzdCBiZSBlaXRoZXIgJ05DSFcnIG9yICdOSFdDJzogJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncHJlZmVycmVkTGF5b3V0JywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncHJlZmVycmVkTGF5b3V0JyAtICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2FzbSc6XG4gICAgICAgICAgY2FzZSAnY3B1JzpcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGVwTmFtZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFwcGVuZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uT3B0aW9ucyA9IChvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBhcHBlbmREZWZhdWx0T3B0aW9ucyhzZXNzaW9uT3B0aW9ucyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBncmFwaE9wdGltaXphdGlvbkxldmVsID0gZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsKHNlc3Npb25PcHRpb25zLmdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPz8gJ2FsbCcpO1xuICAgIGNvbnN0IGV4ZWN1dGlvbk1vZGUgPSBnZXRFeGVjdXRpb25Nb2RlKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvbk1vZGUgPz8gJ3NlcXVlbnRpYWwnKTtcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxuICAgICAgICB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMubG9nSWQgPT09ICdzdHJpbmcnID8gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmxvZ0lkLCBhbGxvY3MpIDogMDtcblxuICAgIGNvbnN0IGxvZ1NldmVyaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID8/IDI7ICAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1NldmVyaXR5TGV2ZWwpIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nVmVyYm9zaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA/PyAwOyAgLy8gRGVmYXVsdCB0byAwIC0gdmVyYm9zZVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0ID0gdHlwZW9mIHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGggPT09ICdzdHJpbmcnID9cbiAgICAgICAgYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGgsIGFsbG9jcykgOlxuICAgICAgICAwO1xuXG4gICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucyhcbiAgICAgICAgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLCBleGVjdXRpb25Nb2RlLFxuICAgICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZVByb2ZpbGluZywgMCwgbG9nSWREYXRhT2Zmc2V0LCBsb2dTZXZlcml0eUxldmVsLCBsb2dWZXJib3NpdHlMZXZlbCxcbiAgICAgICAgb3B0aW1pemVkTW9kZWxGaWxlUGF0aE9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgc2Vzc2lvbiBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgIHNldEV4ZWN1dGlvblByb3ZpZGVycyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGVuYWJsZUdyYXBoQ2FwdHVyZSBtdXN0IGJlIGEgYm9vbGVhbiB2YWx1ZTogJHtzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdlbmFibGVHcmFwaENhcHR1cmUnLCBhbGxvY3MpO1xuICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZS50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgIGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ2VuYWJsZUdyYXBoQ2FwdHVyZScgLSAke3Nlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZX0uYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gYSBkdW1teSB0eXBlIGRlY2xhcmF0aW9uIGZvciBGbG9hdDE2QXJyYXkgaW4gY2FzZSBhbnkgcG9seWZpbGwgaXMgYXZhaWxhYmxlLlxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIGNvbnN0IEZsb2F0MTZBcnJheTogYW55O1xufVxuXG4vLyBUaGlzIGZpbGUgaW5jbHVkZXMgY29tbW9uIGRlZmluaXRpb25zLiBUaGV5IGRvIE5PVCBoYXZlIGRlcGVuZGVuY3kgb24gdGhlIFdlYkFzc2VtYmx5IGluc3RhbmNlLlxuXG4vKipcbiAqIENvcGllZCBmcm9tIE9OTlggZGVmaW5pdGlvbi4gVXNlIHRoaXMgdG8gZHJvcCBkZXBlbmRlbmN5ICdvbm54X3Byb3RvJyB0byBkZWNyZWFzZSBjb21waWxlZCAuanMgZmlsZSBzaXplLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBEYXRhVHlwZSB7XG4gIHVuZGVmaW5lZCA9IDAsXG4gIGZsb2F0ID0gMSxcbiAgdWludDggPSAyLFxuICBpbnQ4ID0gMyxcbiAgdWludDE2ID0gNCxcbiAgaW50MTYgPSA1LFxuICBpbnQzMiA9IDYsXG4gIGludDY0ID0gNyxcbiAgc3RyaW5nID0gOCxcbiAgYm9vbCA9IDksXG4gIGZsb2F0MTYgPSAxMCxcbiAgZG91YmxlID0gMTEsXG4gIHVpbnQzMiA9IDEyLFxuICB1aW50NjQgPSAxMyxcbiAgY29tcGxleDY0ID0gMTQsXG4gIGNvbXBsZXgxMjggPSAxNSxcbiAgYmZsb2F0MTYgPSAxNlxufVxuXG4vKipcbiAqIE1hcCBzdHJpbmcgdGVuc29yIGRhdGEgdG8gZW51bSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0gPSAodHlwZTogc3RyaW5nKTogRGF0YVR5cGUgPT4ge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdpbnQ4JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ4O1xuICAgIGNhc2UgJ3VpbnQ4JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50ODtcbiAgICBjYXNlICdib29sJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5ib29sO1xuICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQxNjtcbiAgICBjYXNlICd1aW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQxNjtcbiAgICBjYXNlICdpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MzI7XG4gICAgY2FzZSAndWludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MzI7XG4gICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQxNjtcbiAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDtcbiAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5kb3VibGU7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5zdHJpbmc7XG4gICAgY2FzZSAnaW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDY0O1xuICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDY0O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIGVudW0gdmFsdWUgdG8gc3RyaW5nIHRlbnNvciBkYXRhXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyA9ICh0eXBlUHJvdG86IERhdGFUeXBlKTogVGVuc29yLlR5cGUgPT4ge1xuICBzd2l0Y2ggKHR5cGVQcm90bykge1xuICAgIGNhc2UgRGF0YVR5cGUuaW50ODpcbiAgICAgIHJldHVybiAnaW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50ODpcbiAgICAgIHJldHVybiAndWludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUuYm9vbDpcbiAgICAgIHJldHVybiAnYm9vbCc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQxNjpcbiAgICAgIHJldHVybiAnaW50MTYnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDE2OlxuICAgICAgcmV0dXJuICd1aW50MTYnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MzI6XG4gICAgICByZXR1cm4gJ2ludDMyJztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQzMjpcbiAgICAgIHJldHVybiAndWludDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0MTY6XG4gICAgICByZXR1cm4gJ2Zsb2F0MTYnO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQ6XG4gICAgICByZXR1cm4gJ2Zsb2F0MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZG91YmxlOlxuICAgICAgcmV0dXJuICdmbG9hdDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnN0cmluZzpcbiAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICBjYXNlIERhdGFUeXBlLmludDY0OlxuICAgICAgcmV0dXJuICdpbnQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50NjQ6XG4gICAgICByZXR1cm4gJ3VpbnQ2NCc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZVByb3RvfWApO1xuICB9XG59O1xuXG4vKipcbiAqIGdldCB0ZW5zb3IgZWxlbWVudCBzaXplIGluIGJ5dGVzIGJ5IHRoZSBnaXZlbiBkYXRhIHR5cGVcbiAqIEByZXR1cm5zIHNpemUgaW4gaW50ZWdlciBvciB1bmRlZmluZWQgaWYgdGhlIGRhdGEgdHlwZSBpcyBub3Qgc3VwcG9ydGVkXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUZW5zb3JFbGVtZW50U2l6ZSA9IChkYXRlVHlwZTogbnVtYmVyKTogbnVtYmVyfFxuICAgIHVuZGVmaW5lZCA9PiBbdW5kZWZpbmVkLCA0LCAxLCAxLCAyLCAyLCA0LCA4LCB1bmRlZmluZWQsIDEsIDIsIDgsIDQsIDgsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWRdW2RhdGVUeXBlXTtcblxuLyoqXG4gKiBnZXQgdHlwZWQgYXJyYXkgY29uc3RydWN0b3IgYnkgdGhlIGdpdmVuIHRlbnNvciB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3IgPSAodHlwZTogVGVuc29yLlR5cGUpOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvcnxVaW50OEFycmF5Q29uc3RydWN0b3J8XG4gICAgSW50OEFycmF5Q29uc3RydWN0b3J8VWludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBVaW50OEFycmF5Q29uc3RydWN0b3J8RmxvYXQ2NEFycmF5Q29uc3RydWN0b3J8VWludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yID0+IHtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgICAgICAvLyBhbGxvdyBGbG9hdDE2QXJyYXkgcG9seWZpbGwuXG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiBGbG9hdDE2QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEZsb2F0MTZBcnJheS5mcm9tID8gRmxvYXQxNkFycmF5IDogVWludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgICAgIHJldHVybiBGbG9hdDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gVWludDhBcnJheTtcbiAgICAgICAgY2FzZSAnaW50OCc6XG4gICAgICAgICAgcmV0dXJuIEludDhBcnJheTtcbiAgICAgICAgY2FzZSAndWludDE2JzpcbiAgICAgICAgICByZXR1cm4gVWludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgICAgICByZXR1cm4gSW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MzInOlxuICAgICAgICAgIHJldHVybiBJbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdib29sJzpcbiAgICAgICAgICByZXR1cm4gVWludDhBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0NjRBcnJheTtcbiAgICAgICAgY2FzZSAndWludDMyJzpcbiAgICAgICAgICByZXR1cm4gVWludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgICAgICByZXR1cm4gQmlnSW50NjRBcnJheTtcbiAgICAgICAgY2FzZSAndWludDY0JzpcbiAgICAgICAgICByZXR1cm4gQmlnVWludDY0QXJyYXk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCB0eXBlOiAke3R5cGV9YCk7XG4gICAgICB9XG4gICAgfTtcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGxvZyBsZXZlbCB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBsb2dMZXZlbFN0cmluZ1RvRW51bSA9IChsb2dMZXZlbD86ICd2ZXJib3NlJ3wnaW5mbyd8J3dhcm5pbmcnfCdlcnJvcid8J2ZhdGFsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAobG9nTGV2ZWwpIHtcbiAgICBjYXNlICd2ZXJib3NlJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2luZm8nOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdmYXRhbCc6XG4gICAgICByZXR1cm4gNDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBsb2dnaW5nIGxldmVsOiAke2xvZ0xldmVsfWApO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHRlbnNvciB0eXBlIGlzIHN1cHBvcnRlZCBieSBHUFUgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUgPSAodHlwZTogVGVuc29yLlR5cGUpOiB0eXBlIGlzIFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXMgPT4gdHlwZSA9PT0gJ2Zsb2F0MzInIHx8XG4gICAgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAndWludDMyJyB8fCB0eXBlID09PSAndWludDgnIHx8XG4gICAgdHlwZSA9PT0gJ2Jvb2wnO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIFVpbnQ4QXJyYXkuXG4gKlxuICogQHBhcmFtIGZpbGUgLSB0aGUgZmlsZSB0byBsb2FkLiBDYW4gYmUgYSBVUkwvcGF0aCwgYSBCbG9iLCBhbiBBcnJheUJ1ZmZlciwgb3IgYSBVaW50OEFycmF5LlxuICogQHJldHVybnMgYSBVaW50OEFycmF5IGNvbnRhaW5pbmcgdGhlIGZpbGUgZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRGaWxlID0gYXN5bmMoZmlsZTogc3RyaW5nfEJsb2J8QXJyYXlCdWZmZXJMaWtlfFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+ID0+IHtcbiAgaWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIE5vZGUuanNcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZWFkRmlsZShmaWxlKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFUlJfRlNfRklMRV9UT09fTEFSR0UnKSB7XG4gICAgICAgICAgLy8gZmlsZSBpcyB0b28gbGFyZ2UsIHVzZSBmcy5jcmVhdGVSZWFkU3RyZWFtIGluc3RlYWRcbiAgICAgICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KEJ1ZmZlci5jb25jYXQoY2h1bmtzKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gYnJvd3NlcnNcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjb250ZW50TGVuZ3RoSGVhZGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtTGVuZ3RoJyk7XG4gICAgICBjb25zdCBmaWxlU2l6ZSA9IGNvbnRlbnRMZW5ndGhIZWFkZXIgPyBwYXJzZUludChjb250ZW50TGVuZ3RoSGVhZGVyLCAxMCkgOiAwO1xuICAgICAgaWYgKGZpbGVTaXplIDwgMTA3Mzc0MTgyNCAvKiAxR0IgKi8pIHtcbiAgICAgICAgLy8gd2hlbiBDb250ZW50LUxlbmd0aCBoZWFkZXIgaXMgbm90IHNldCwgd2UgY2Fubm90IGRldGVybWluZSB0aGUgZmlsZSBzaXplLiBXZSBhc3N1bWUgaXQgaXMgc21hbGwgZW5vdWdoIHRvXG4gICAgICAgIC8vIGxvYWQgaW50byBtZW1vcnkuXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2Ugc3RyZWFtIGluc3RlYWRcbiAgICAgICAgaWYgKCFyZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gbG9hZCBleHRlcm5hbCBkYXRhIGZpbGU6ICR7ZmlsZX0sIG5vIHJlc3BvbnNlIGJvZHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcblxuICAgICAgICBsZXQgYnVmZmVyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIHRyeSB0byBjcmVhdGUgQXJyYXlCdWZmZXIgZGlyZWN0bHlcbiAgICAgICAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoZmlsZVNpemUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBSYW5nZUVycm9yKSB7XG4gICAgICAgICAgICAvLyB1c2UgV2ViQXNzZW1ibHkgTWVtb3J5IHRvIGFsbG9jYXRlIGxhcmdlciBBcnJheUJ1ZmZlclxuICAgICAgICAgICAgY29uc3QgcGFnZXMgPSBNYXRoLmNlaWwoZmlsZVNpemUgLyA2NTUzNik7XG4gICAgICAgICAgICBidWZmZXIgPSBuZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOiBwYWdlcywgbWF4aW11bTogcGFnZXN9KS5idWZmZXI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCB7ZG9uZSwgdmFsdWV9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IHZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBuZXcgVWludDhBcnJheShidWZmZXIsIG9mZnNldCwgY2h1bmtTaXplKTtcbiAgICAgICAgICBjaHVuay5zZXQodmFsdWUpO1xuICAgICAgICAgIG9mZnNldCArPSBjaHVua1NpemU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgZmlsZVNpemUpO1xuICAgICAgfVxuICAgIH1cblxuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKSk7XG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gZmlsZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZmlsZSk7XG4gIH1cbn07XG4iLCAiZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gdW5kZWZpbmVkO2V4cG9ydCBjb25zdCByZWFkRmlsZVN5bmMgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IGNyZWF0ZVJlYWRTdHJlYW0gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0VudiwgSW5mZXJlbmNlU2Vzc2lvbiwgVGVuc29yfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge1NlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLCBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhLCBUZW5zb3JNZXRhZGF0YX0gZnJvbSAnLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge3NldFJ1bk9wdGlvbnN9IGZyb20gJy4vcnVuLW9wdGlvbnMnO1xuaW1wb3J0IHtzZXRTZXNzaW9uT3B0aW9uc30gZnJvbSAnLi9zZXNzaW9uLW9wdGlvbnMnO1xuaW1wb3J0IHtkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0sIGdldFRlbnNvckVsZW1lbnRTaXplLCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUsIGxvZ0xldmVsU3RyaW5nVG9FbnVtLCB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZywgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0sIHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcn0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3J9IGZyb20gJy4vd2FzbS11dGlscyc7XG5pbXBvcnQge2xvYWRGaWxlfSBmcm9tICcuL3dhc20tdXRpbHMtbG9hZC1maWxlJztcblxuLy8gI3JlZ2lvbiBJbml0aWFsaXphdGlvbnNcblxuLyoqXG4gKiBUaGVyZSBhcmUgNCBkaWZmZXJlbnQgXCJpbml0aWFsaXphdGlvblwiIHN0ZXBzIGZvciBPUlQuIFRoZXkgaGFwcGVuIGluIGRpZmZlcmVudCBwbGFjZXMgYW5kIGRpZmZlcmVudCB0aW1lLlxuICpcbiAqIDEuIEphdmFTY3JpcHQgaW5pdGlhbGl6YXRpb24gZm9yIG9ubnhydW50aW1lLWNvbW1vbiBhbmQgb25ueHJ1bnRpbWUtd2ViLlxuICogICAgVGhpcyBpcyB0aGUgZmlyc3QgaW5pdGlhbGl6YXRpb24gc3RlcC4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgY2FsbHMgb25ueHJ1bnRpbWUtY29tbW9uJ3MgcmVnaXN0ZXJCYWNrZW5kKClcbiAqIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzIHRvIHJlZ2lzdGVyIGFsbCB0aGUgYXZhaWxhYmxlIGJhY2tlbmRzLiBUaGUgYmFja2VuZCByZWdpc3RyYXRpb24gaXMgdmVyeSBmYXN0LiBJdCBvbmx5XG4gKiByZWdpc3RlcnMgdGhlIGJhY2tlbmQgbmFtZSB3aXRoIHRoZSB1bmluaXRpYWxpemVkIGJhY2tlbmQgb2JqZWN0LiBObyBoZWF2eSBpbml0aWFsaXphdGlvbiBpcyBkb25lIGluIHRoaXMgc3RlcC5cbiAqICAgIFJlZmVyIHRvIHdlYi9saWIvaW5kZXgudHMgZm9yIHRoZSBiYWNrZW5kIHJlZ2lzdHJhdGlvbi5cbiAqXG4gKiAyLiBXZWJBc3NlbWJseSBhcnRpZmFjdCBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyB3aGVuIGFueSByZWdpc3RlcmVkIHdhc20gYmFja2VuZCBpcyB1c2VkIGZvciB0aGUgZmlyc3QgdGltZSAoaWUuIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgb3JcbiAqIGBvcnQuVHJhaW5pbmdTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQpLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBkb2VzIHRoZSBmb2xsb3dpbmdzOlxuICogICAgIC0gY3JlYXRlIGEgcHJveHkgd29ya2VyIGFuZCBtYWtlIHN1cmUgdGhlIHByb3h5IHdvcmtlciBpcyByZWFkeSB0byByZWNlaXZlIG1lc3NhZ2VzLCBpZiBwcm94eSBpcyBlbmFibGVkLlxuICogICAgIC0gcGVyZm9ybSBmZWF0dXJlIGRldGVjdGlvbiwgbG9jYXRlIGNvcnJlY3QgV2ViQXNzZW1ibHkgYXJ0aWZhY3QgcGF0aCBhbmQgY2FsbCB0aGUgRW1zY3JpcHRlbiBnZW5lcmF0ZWRcbiAqIEphdmFTY3JpcHQgY29kZSB0byBpbml0aWFsaXplIHRoZSBXZWJBc3NlbWJseSBydW50aW1lLlxuICogICAgICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC13YXNtJy5cbiAqICAgICAgICAgLSBkb3dubG9hZGluZyB0aGUgJ29ydC13YXNtey4uLn0ud2FzbScgZmlsZSBpcyBkb25lIGluIHRoaXMgc3RlcC5cbiAqICAgICAgICAgLSBpZiBtdWx0aS10aHJlYWQgaXMgZW5hYmxlZCwgb25lIG9yIG1vcmUgd2Vid29ya2VyIHdpbGwgYmUgY3JlYXRlZCB0byBpbml0aWFsaXplIHRoZSBQVGhyZWFkIHRocmVhZHBvb2wuXG4gKlxuICogMy4gT1JUIGVudmlyb25tZW50IGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIGFmdGVyIHN0ZXAgMi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgcGVyZm9ybXMgT05OWCBSdW50aW1lIGVudmlyb25tZW50IGluaXRpYWxpemF0aW9uLlxuICogRnVuY3Rpb24gYF9PcnRJbml0KClgIGlzIGNhbGxlZCBpbiB0aGlzIHN0ZXAuXG4gKiAgICAgLSBpZiBwcm94eSBpcyBlbmFibGVkLCB0aGlzIHN0ZXAgaGFwcGVucyBpbiB0aGUgcHJveHkgd29ya2VyIHVzaW5nIG1lc3NhZ2UgJ2luaXQtb3J0Jy5cbiAqICAgICAtIGxvZ2dpbmcgbGV2ZWwgKG9ydC5lbnYubG9nTGV2ZWwpIGFuZCB0aHJlYWQgbnVtYmVyIChvcnQuZW52Lndhc20ubnVtVGhyZWFkcykgYXJlIHNldCBpbiB0aGlzIHN0ZXAuXG4gKlxuICogNC4gU2Vzc2lvbiBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyB3aGVuIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgb3IgYG9ydC5UcmFpbmluZ1Nlc3Npb24uY3JlYXRlKClgIGlzIGNhbGxlZC4gVW5saWtlIHRoZSBmaXJzdCAzXG4gKiBzdGVwcyAodGhleSBvbmx5IGNhbGxlZCBvbmNlKSwgdGhpcyBzdGVwIHdpbGwgYmUgZG9uZSBmb3IgZWFjaCBzZXNzaW9uLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBkb2VzIHRoZVxuICogZm9sbG93aW5nczpcbiAqICAgIElmIHRoZSBwYXJhbWV0ZXIgaXMgYSBVUkw6XG4gKiAgICAtIGRvd25sb2FkIHRoZSBtb2RlbCBkYXRhIGZyb20gdGhlIFVSTC5cbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxuICogICAgLSBkZXJlZmVyZW5jZSB0aGUgbW9kZWwgYnVmZmVyLiBUaGlzIHN0ZXAgYWxsb3dzIHRoZSBvcmlnaW5hbCBBcnJheUJ1ZmZlciB0byBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqICAgIElmIHRoZSBwYXJhbWV0ZXIgaXMgYSBVaW50OEFycmF5IG9iamVjdDpcbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxuICogICAgLSBjYWxsIGBfT3J0Q3JlYXRlU2Vzc2lvbigpYCB0byBjcmVhdGUgdGhlIHNlc3Npb24uIChwcm94eTogJ2NyZWF0ZScpXG4gKlxuICpcbiAqL1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICpcbiAqIEBwYXJhbSBudW1UaHJlYWRzIFNldEdsb2JhbEludHJhT3BOdW1UaHJlYWRzKG51bVRocmVhZHMpXG4gKiBAcGFyYW0gbG9nZ2luZ0xldmVsIENyZWF0ZUVudihzdGF0aWNfY2FzdDxPcnRMb2dnaW5nTGV2ZWw+KGxvZ2dpbmdfbGV2ZWwpKVxuICovXG5jb25zdCBpbml0T3J0ID0gKG51bVRocmVhZHM6IG51bWJlciwgbG9nZ2luZ0xldmVsOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3QgZXJyb3JDb2RlID0gZ2V0SW5zdGFuY2UoKS5fT3J0SW5pdChudW1UaHJlYWRzLCBsb2dnaW5nTGV2ZWwpO1xuICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgaW5pdGlhbGl6ZSBvbm54cnVudGltZS4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbnRpYWxpemUgcnVudGltZSBlbnZpcm9ubWVudC5cbiAqIEBwYXJhbSBlbnYgcGFzc2VkIGluIHRoZSBlbnZpcm9ubWVudCBjb25maWcgb2JqZWN0LlxuICovXG5leHBvcnQgY29uc3QgaW5pdFJ1bnRpbWUgPSBhc3luYyhlbnY6IEVudik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAvLyBpbml0IE9SVFxuICBpbml0T3J0KGVudi53YXNtLm51bVRocmVhZHMhLCBsb2dMZXZlbFN0cmluZ1RvRW51bShlbnYubG9nTGV2ZWwpKTtcbn07XG5cbi8qKlxuICogcGVyZm9ybSBFUCBzcGVjaWZpYyBpbml0aWFsaXphdGlvbi5cbiAqXG4gKiBAcGFyYW0gZW52XG4gKiBAcGFyYW0gZXBOYW1lXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0RXAgPSBhc3luYyhlbnY6IEVudiwgZXBOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMsIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgICBjb25zdCBpbml0SnNlcCA9IHJlcXVpcmUoJy4vanNlcC9pbml0JykuaW5pdDtcblxuICAgIGlmIChlcE5hbWUgPT09ICd3ZWJncHUnKSB7XG4gICAgICAvLyBwZXJmb3JtIFdlYkdQVSBhdmFpbGFiaWxpdHkgY2hlY2tcbiAgICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhbmF2aWdhdG9yLmdwdSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGFkYXB0ZXIgPSBlbnYud2ViZ3B1LmFkYXB0ZXIgYXMgR1BVQWRhcHRlciB8IG51bGw7XG4gICAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgLy8gaWYgYWRhcHRlciBpcyBub3Qgc2V0LCByZXF1ZXN0IGEgbmV3IGFkYXB0ZXIuXG4gICAgICAgIGNvbnN0IHBvd2VyUHJlZmVyZW5jZSA9IGVudi53ZWJncHUucG93ZXJQcmVmZXJlbmNlO1xuICAgICAgICBpZiAocG93ZXJQcmVmZXJlbmNlICE9PSB1bmRlZmluZWQgJiYgcG93ZXJQcmVmZXJlbmNlICE9PSAnbG93LXBvd2VyJyAmJlxuICAgICAgICAgICAgcG93ZXJQcmVmZXJlbmNlICE9PSAnaGlnaC1wZXJmb3JtYW5jZScpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcG93ZXJQcmVmZXJlbmNlIHNldHRpbmc6IFwiJHtwb3dlclByZWZlcmVuY2V9XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb3JjZUZhbGxiYWNrQWRhcHRlciA9IGVudi53ZWJncHUuZm9yY2VGYWxsYmFja0FkYXB0ZXI7XG4gICAgICAgIGlmIChmb3JjZUZhbGxiYWNrQWRhcHRlciAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmb3JjZUZhbGxiYWNrQWRhcHRlciAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGZvcmNlRmFsbGJhY2tBZGFwdGVyIHNldHRpbmc6IFwiJHtmb3JjZUZhbGxiYWNrQWRhcHRlcn1cImApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKHtwb3dlclByZWZlcmVuY2UsIGZvcmNlRmFsbGJhY2tBZGFwdGVyfSk7XG4gICAgICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBnZXQgR1BVIGFkYXB0ZXIuICcgK1xuICAgICAgICAgICAgICAnWW91IG1heSBuZWVkIHRvIGVuYWJsZSBmbGFnIFwiLS1lbmFibGUtdW5zYWZlLXdlYmdwdVwiIGlmIHlvdSBhcmUgdXNpbmcgQ2hyb21lLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBhZGFwdGVyIGlzIHNldCwgdmFsaWRhdGUgaXQuXG4gICAgICAgIGlmICh0eXBlb2YgYWRhcHRlci5saW1pdHMgIT09ICdvYmplY3QnIHx8IHR5cGVvZiBhZGFwdGVyLmZlYXR1cmVzICE9PSAnb2JqZWN0JyB8fFxuICAgICAgICAgICAgdHlwZW9mIGFkYXB0ZXIucmVxdWVzdERldmljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBHUFUgYWRhcHRlciBzZXQgaW4gYGVudi53ZWJncHUuYWRhcHRlcmAuIEl0IG11c3QgYmUgYSBHUFVBZGFwdGVyIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWVudi53YXNtLnNpbWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ05vdCBzdXBwb3J0ZWQgZm9yIFdlYkdQVT1PTiBhbmQgU0lNRD1PRkYuIFBsZWFzZSBzZXQgYGVudi53YXNtLnNpbWRgIHRvIHRydWUgd2hlbiB1c2luZyBgd2ViZ3B1YCBFUCcpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBpbml0SnNlcCgnd2ViZ3B1JywgZ2V0SW5zdGFuY2UoKSwgZW52LCBhZGFwdGVyKTtcbiAgICB9XG4gICAgaWYgKGVwTmFtZSA9PT0gJ3dlYm5uJykge1xuICAgICAgLy8gcGVyZm9ybSBXZWJOTiBhdmFpbGFiaWxpdHkgY2hlY2tcbiAgICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhKG5hdmlnYXRvciBhcyB1bmtub3duIGFzIHttbDogdW5rbm93bn0pLm1sKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViTk4gaXMgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50Jyk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGluaXRKc2VwKCd3ZWJubicsIGdldEluc3RhbmNlKCksIGVudik7XG4gICAgfVxuICB9XG59O1xuXG4vLyAjZW5kcmVnaW9uIEluaXRpYWxpemF0aW9uc1xuXG4vKipcbiAqIHZhbGlkIGRhdGEgbG9jYXRpb25zIGZvciBpbnB1dC9vdXRwdXQgdGVuc29ycy5cbiAqL1xudHlwZSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dCA9ICdjcHUnfCdjcHUtcGlubmVkJ3wnZ3B1LWJ1ZmZlcic7XG5cbnR5cGUgSU9CaW5kaW5nU3RhdGUgPSB7XG4gIC8qKlxuICAgKiB0aGUgaGFuZGxlIG9mIElPIGJpbmRpbmcuXG4gICAqL1xuICByZWFkb25seSBoYW5kbGU6IG51bWJlcjtcblxuICAvKipcbiAgICogdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKlxuICAgKiB2YWx1ZSBpcyBvbmUgb2YgJ2NwdScsICdjcHUtcGlubmVkJywgJ2dwdS1idWZmZXInLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiByZWFkb25seSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdO1xuXG4gIC8qKlxuICAgKiBlbnVtIHZhbHVlIG9mIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuLyoqXG4gKiAgdHVwbGUgZWxlbWVudHMgYXJlOiBJbmZlcmVuY2VTZXNzaW9uIElEOyBpbnB1dE5hbWVzVVRGOEVuY29kZWQ7IG91dHB1dE5hbWVzVVRGOEVuY29kZWQ7IGJpbmRpbmdTdGF0ZVxuICovXG50eXBlIFNlc3Npb25NZXRhZGF0YSA9IFtcbiAgaW5mZXJlbmNlU2Vzc2lvbklkOiBudW1iZXIsIGlucHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sIG91dHB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLFxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwsIGVuYWJsZUdyYXBoQ2FwdHVyZTogYm9vbGVhbiwgaW5wdXRPdXRwdXRCb3VuZDogYm9vbGVhblxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG4vKipcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxuICogQHBhcmFtIHNlc3Npb25IYW5kbGUgdGhlIGhhbmRsZSByZXByZXNlbnRpbmcgdGhlIHNlc3Npb24uIHNob3VsZCBiZSBub24temVyby5cbiAqIEByZXR1cm5zIGEgdHVwbGUgaW5jbHVkaW5nIDIgbnVtYmVycywgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCBjb3VudCBhbmQgb3V0cHV0IGNvdW50LlxuICovXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudCA9IChzZXNzaW9uSGFuZGxlOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIDQpO1xuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBjb3VudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIFt3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNF0sIHdhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0ICsgMV1dO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIGV4dGVybmFsIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWwgLSB0aGUgZXh0ZXJuYWwgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuIE11c3Qgbm90IGJlIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLlxuICogQHJldHVybnMgYSAyLWVsZW1lbnRzIHR1cGxlIC0gdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIGZyb20gYSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWxEYXRhIC0gZWl0aGVyIGEgVWludDhBcnJheSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCBkYXRhLCBvciBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGVcbiAqICAgICBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gYXN5bmMoXG4gICAgbW9kZWxEYXRhOiBVaW50OEFycmF5fFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLFxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcbiAgbGV0IG1vZGVsRGF0YU9mZnNldDogbnVtYmVyLCBtb2RlbERhdGFMZW5ndGg6IG51bWJlcjtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxEYXRhKSkge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgaXMgYW4gYXJyYXksIGl0IG11c3QgYmUgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGFcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gbW9kZWxEYXRhO1xuICB9IGVsc2UgaWYgKG1vZGVsRGF0YS5idWZmZXIgPT09IHdhc20uSEVBUFU4LmJ1ZmZlcikge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgdXNlcyB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcCwgd2UgZG9uJ3QgbmVlZCB0byBjb3B5IGl0LlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBbbW9kZWxEYXRhLmJ5dGVPZmZzZXQsIG1vZGVsRGF0YS5ieXRlTGVuZ3RoXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBvdGhlcndpc2UsIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC5cbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihtb2RlbERhdGEpO1xuICB9XG5cbiAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gW107XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICB0cnkge1xuICAgIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXSA9IHNldFNlc3Npb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnM/LmV4dGVybmFsRGF0YSAmJiB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhKSB7XG4gICAgICBjb25zdCBsb2FkaW5nUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLmV4dGVybmFsRGF0YSkge1xuICAgICAgICBjb25zdCBwYXRoID0gdHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUucGF0aDtcbiAgICAgICAgbG9hZGluZ1Byb21pc2VzLnB1c2gobG9hZEZpbGUodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUuZGF0YSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhIShwYXRoLCBkYXRhKTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICAvLyB3YWl0IGZvciBhbGwgZXh0ZXJuYWwgZGF0YSBmaWxlcyB0byBiZSBsb2FkZWRcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGxvYWRpbmdQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgc2Vzc2lvbkhhbmRsZSA9IGF3YWl0IHdhc20uX09ydENyZWF0ZVNlc3Npb24obW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGgsIHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIGEgc2Vzc2lvbi4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICBjb25zdCBlbmFibGVHcmFwaENhcHR1cmUgPSAhIW9wdGlvbnM/LmVuYWJsZUdyYXBoQ2FwdHVyZTtcblxuICAgIGNvbnN0IGlucHV0TmFtZXMgPSBbXTtcbiAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xuICAgIGNvbnN0IG91dHB1dFByZWZlcnJlZExvY2F0aW9uczogU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXRbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0SW5wdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIGlucHV0IG5hbWUuJyk7XG4gICAgICB9XG4gICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgIGlucHV0TmFtZXMucHVzaCh3YXNtLlVURjhUb1N0cmluZyhuYW1lKSk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldE91dHB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gb3V0cHV0IG5hbWUuJyk7XG4gICAgICB9XG4gICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICBjb25zdCBuYW1lU3RyaW5nID0gd2FzbS5VVEY4VG9TdHJpbmcobmFtZSk7XG4gICAgICBvdXRwdXROYW1lcy5wdXNoKG5hbWVTdHJpbmcpO1xuXG4gICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgaWYgKGVuYWJsZUdyYXBoQ2FwdHVyZSAmJiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnB1c2goJ2dwdS1idWZmZXInKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA6XG4gICAgICAgICAgICBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj8uW25hbWVTdHJpbmddID8/ICdjcHUnO1xuICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBzdXBwb3J0ZWQgcHJlZmVycmVkIG91dHB1dCBsb2NhdGlvbjogJHtcbiAgICAgICAgICAgICAgbG9jYXRpb259LiBPbmx5ICdncHUtYnVmZmVyJyBsb2NhdGlvbiBpcyBzdXBwb3J0ZWQgd2hlbiBlbmFibGVHcmFwaENhcHR1cmUgaXMgdHJ1ZS5gKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdXNlIElPIGJpbmRpbmcgb25seSB3aGVuIGF0IGxlYXN0IG9uZSBvdXRwdXQgaXMgcHJlZmZlcmVkIHRvIGJlIG9uIEdQVS5cbiAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnNvbWUobCA9PiBsID09PSAnZ3B1LWJ1ZmZlcicpKSB7XG4gICAgICBpb0JpbmRpbmdIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVCaW5kaW5nKHNlc3Npb25IYW5kbGUpO1xuICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgSU8gYmluZGluZy4nKTtcbiAgICAgIH1cblxuICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICBoYW5kbGU6IGlvQmluZGluZ0hhbmRsZSxcbiAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMubWFwKGwgPT4gZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGwpKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYWN0aXZlU2Vzc2lvbnMuc2V0KFxuICAgICAgICBzZXNzaW9uSGFuZGxlLFxuICAgICAgICBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBiaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZSwgZmFsc2VdKTtcbiAgICByZXR1cm4gW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXMsIG91dHB1dE5hbWVzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcblxuICAgIGlmIChpb0JpbmRpbmdIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25IYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uX2ZyZWUobW9kZWxEYXRhT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcblxuICAgIC8vIHVubW91bnQgZXh0ZXJuYWwgZGF0YSBpZiBuZWNlc3NhcnlcbiAgICB3YXNtLnVubW91bnRFeHRlcm5hbERhdGE/LigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVsZWFzZVNlc3Npb24gPSAoc2Vzc2lvbklkOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVsZWFzZSBzZXNzaW9uLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmVdID0gc2Vzc2lvbjtcblxuICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlKSB7XG4gICAgICB3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICAgIH1cbiAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICB9XG5cbiAgd2FzbS5qc2VwT25SZWxlYXNlU2Vzc2lvbj8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyLFxuICAgICBlbmFibGVHcmFwaENhcHR1cmUgPSBmYWxzZSk6IHZvaWQgPT4ge1xuICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKDApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IHRlbnNvclszXTtcblxuICAgICAgbGV0IHJhd0RhdGE6IG51bWJlcjtcbiAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICBpZiAoZGF0YVR5cGUgPT09ICdzdHJpbmcnICYmIGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEV4dGVybmFsIGJ1ZmZlciBtdXN0IGJlIHByb3ZpZGVkIGZvciBpbnB1dC9vdXRwdXQgaW5kZXggJHtpbmRleH0gd2hlbiBlbmFibGVHcmFwaENhcHR1cmUgaXMgdHJ1ZS5gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gdGVuc29yWzJdLmdwdUJ1ZmZlciBhcyBHUFVCdWZmZXI7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRTaXplSW5CeXRlcyA9IGdldFRlbnNvckVsZW1lbnRTaXplKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSkhO1xuICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG5cbiAgICAgICAgY29uc3QgcmVnaXN0ZXJCdWZmZXIgPSB3YXNtLmpzZXBSZWdpc3RlckJ1ZmZlcjtcbiAgICAgICAgaWYgKCFyZWdpc3RlckJ1ZmZlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVuc29yIGxvY2F0aW9uIFwiZ3B1LWJ1ZmZlclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJHUFUuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmF3RGF0YSA9IHJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IDQgKiBkYXRhLmxlbmd0aDtcbiAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gcmF3RGF0YSAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHRlbnNvciBkYXRhIGF0IGluZGV4ICR7aX0gaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoNCAqIGRpbXMubGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICBkaW1zLmZvckVhY2goZCA9PiB3YXNtLkhFQVAzMltkaW1JbmRleCsrXSA9IGQpO1xuICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgIGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bShsb2NhdGlvbikpO1xuICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICB9XG4gICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG4gIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMV07XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBzZXNzaW9uWzJdO1xuICBjb25zdCBpb0JpbmRpbmdTdGF0ZSA9IHNlc3Npb25bM107XG4gIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9IHNlc3Npb25bNF07XG4gIGNvbnN0IGlucHV0T3V0cHV0Qm91bmQgPSBzZXNzaW9uWzVdO1xuXG4gIGNvbnN0IGlucHV0Q291bnQgPSBpbnB1dEluZGljZXMubGVuZ3RoO1xuICBjb25zdCBvdXRwdXRDb3VudCA9IG91dHB1dEluZGljZXMubGVuZ3RoO1xuXG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgbGV0IHJ1bk9wdGlvbnNBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgaW5wdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBvdXRwdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE91dHB1dEFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBiZWZvcmVSdW5TdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIGNvbnN0IGlucHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3QgaW5wdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIDQpO1xuXG4gIHRyeSB7XG4gICAgW3J1bk9wdGlvbnNIYW5kbGUsIHJ1bk9wdGlvbnNBbGxvY3NdID0gc2V0UnVuT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIGNyZWF0ZSBpbnB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIHByZXBhcmVJbnB1dE91dHB1dFRlbnNvcihcbiAgICAgICAgICBpbnB1dFRlbnNvcnNbaV0sIGlucHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzW2ldLCBlbmFibGVHcmFwaENhcHR1cmUpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIG91dHB1dFRlbnNvcnNbaV0sIG91dHB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldLFxuICAgICAgICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSk7XG4gICAgfVxuXG4gICAgbGV0IGlucHV0VmFsdWVzSW5kZXggPSBpbnB1dFZhbHVlc09mZnNldCAvIDQ7XG4gICAgbGV0IGlucHV0TmFtZXNJbmRleCA9IGlucHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXRWYWx1ZXNJbmRleCA9IG91dHB1dFZhbHVlc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dE5hbWVzSW5kZXggPSBvdXRwdXROYW1lc09mZnNldCAvIDQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dFZhbHVlc0luZGV4KytdID0gaW5wdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0TmFtZXNJbmRleCsrXSA9IGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbnB1dEluZGljZXNbaV1dO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXRWYWx1ZXNJbmRleCsrXSA9IG91dHB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0TmFtZXNJbmRleCsrXSA9IG91dHB1dE5hbWVzVVRGOEVuY29kZWRbb3V0cHV0SW5kaWNlc1tpXV07XG4gICAgfVxuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlICYmICFpbnB1dE91dHB1dEJvdW5kKSB7XG4gICAgICBjb25zdCB7aGFuZGxlLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWR9ID0gaW9CaW5kaW5nU3RhdGU7XG5cbiAgICAgIGlmIChpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RoICE9PSBpbnB1dENvdW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW5wdXQgY291bnQgZnJvbSBmZWVkcyAoJHtcbiAgICAgICAgICAgIGlucHV0Q291bnR9KSBpcyBleHBlY3RlZCB0byBiZSBhbHdheXMgZXF1YWwgdG8gbW9kZWwncyBpbnB1dCBjb3VudCAoJHtpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RofSkuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgaW5wdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IGlucHV0SW5kaWNlc1tpXTtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0QmluZElucHV0KGhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgaW5wdXRUZW5zb3JIYW5kbGVzW2ldKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIGlucHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIHByZS1hbGxvY2F0ZWQgb3V0cHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gb3V0cHV0SW5kaWNlc1tpXTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBvdXRwdXRUZW5zb3JzW2ldPy5bM107ICAvLyB1bmRlZmluZWQgbWVhbnMgb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLlxuXG4gICAgICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBwcmUtYWxsb2NhdGVkLiBiaW5kIHRoZSB0ZW5zb3IuXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldLCAwKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBwcmUtYWxsb2NhdGVkIG91dHB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC4gcmVzZXQgcHJlZmVycmVkIGxvY2F0aW9uLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9XG4gICAgICAgICAgICAgIHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgMCwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZFtpbmRleF0pO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIG91dHB1dFske2l9XSB0byAke291dHB1dFByZWZlcnJlZExvY2F0aW9uc1tpXX0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KFxuICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCB0cnVlXSk7XG4gICAgfVxuXG4gICAgd2FzbS5qc2VwT25SdW5TdGFydD8uKHNlc3Npb25IYW5kbGUpO1xuICAgIGxldCBlcnJvckNvZGU6IG51bWJlcjtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ2V0QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyO1xuICAgICAgICAgICAgaWYgKCFnZXRCdWZmZXIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwcmVmZXJyZWRMb2NhdGlvbiBcImdwdS1idWZmZXJcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViR1BVLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gZ2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlciEoZ3B1QnVmZmVyLCBzaXplICogZWxlbWVudFNpemUsIHR5cGUpLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdncHUtYnVmZmVyJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcih0eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgdHlwZWRBcnJheUNvbnN0cnVjdG9yKHNpemUpO1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKVxuICAgICAgICAgICAgICAgIC5zZXQod2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIGRhdGEsICdjcHUnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2spO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xuICAgICAgICAgIHdhc20uX2ZyZWUoZGF0YU9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlICYmICFlbmFibGVHcmFwaENhcHR1cmUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgICBhY3RpdmVTZXNzaW9ucy5zZXQoXG4gICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmUsIGZhbHNlXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlUnVuU3RhY2spO1xuXG4gICAgaW5wdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBvdXRwdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG5cbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIHJ1bk9wdGlvbnNBbGxvY3MuZm9yRWFjaChwID0+IHdhc20uX2ZyZWUocCkpO1xuICB9XG59O1xuXG4vKipcbiAqIGVuZCBwcm9maWxpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2Vzc2lvbiBpZCcpO1xuICB9XG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xuXG4gIC8vIHByb2ZpbGUgZmlsZSBuYW1lIGlzIG5vdCB1c2VkIHlldCwgYnV0IGl0IG11c3QgYmUgZnJlZWQuXG4gIGNvbnN0IHByb2ZpbGVGaWxlTmFtZSA9IHdhc20uX09ydEVuZFByb2ZpbGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgaWYgKHByb2ZpbGVGaWxlTmFtZSA9PT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBwcm9maWxlIGZpbGUgbmFtZS4nKTtcbiAgfVxuICB3YXNtLl9PcnRGcmVlKHByb2ZpbGVGaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMgPSAodGVuc29yczogcmVhZG9ubHkgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSk6IEFycmF5QnVmZmVyTGlrZVtdID0+IHtcbiAgY29uc3QgYnVmZmVyczogQXJyYXlCdWZmZXJMaWtlW10gPSBbXTtcbiAgZm9yIChjb25zdCB0ZW5zb3Igb2YgdGVuc29ycykge1xuICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpICYmICdidWZmZXInIGluIGRhdGEpIHtcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJ1ZmZlcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBidWZmZXJzO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgbGliPVwid2Vid29ya2VyXCIgLz5cblxuLy9cbi8vICogdHlwZSBoYWNrIGZvciBcIkhUTUxJbWFnZUVsZW1lbnRcIlxuLy9cbi8vIGluIHR5cGVzY3JpcHQsIHRoZSB0eXBlIG9mIFwiSFRNTEltYWdlRWxlbWVudFwiIGlzIGRlZmluZWQgaW4gbGliLmRvbS5kLnRzLCB3aGljaCBpcyBjb25mbGljdCB3aXRoIGxpYi53ZWJ3b3JrZXIuZC50cy5cbi8vIHdoZW4gd2UgdXNlIHdlYndvcmtlciwgdGhlIGxpYi53ZWJ3b3JrZXIuZC50cyB3aWxsIGJlIHVzZWQsIHdoaWNoIGRvZXMgbm90IGhhdmUgSFRNTEltYWdlRWxlbWVudCBkZWZpbmVkLlxuLy9cbi8vIHdlIHdpbGwgZ2V0IHRoZSBmb2xsb3dpbmcgZXJyb3JzIGNvbXBsYWluaW5nIHRoYXQgSFRNTEltYWdlRWxlbWVudCBpcyBub3QgZGVmaW5lZDpcbi8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy9cbi8vIC4uL2NvbW1vbi9kaXN0L2Nqcy90ZW5zb3ItZmFjdG9yeS5kLnRzOjE4NzoyOSAtIGVycm9yIFRTMjU1MjogQ2Fubm90IGZpbmQgbmFtZSAnSFRNTEltYWdlRWxlbWVudCcuIERpZCB5b3UgbWVhblxuLy8gJ0hUTUxMSUVsZW1lbnQnP1xuLy9cbi8vIDE4NyAgICAgZnJvbUltYWdlKGltYWdlRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCwgb3B0aW9ucz86IFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zKTpcbi8vIFByb21pc2U8VHlwZWRUZW5zb3I8J2Zsb2F0MzInPiB8IFR5cGVkVGVuc29yPCd1aW50OCc+Pjtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfn5+fn5+fn5+fn5+fn5+flxuLy9cbi8vIG5vZGVfbW9kdWxlcy9Ad2ViZ3B1L3R5cGVzL2Rpc3QvaW5kZXguZC50czo4Mzo3IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gODMgICAgIHwgSFRNTEltYWdlRWxlbWVudFxuLy8gICAgICAgICAgfn5+fn5+fn5+fn5+fn5+flxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gYEhUTUxJbWFnZUVsZW1lbnRgIGlzIG9ubHkgdXNlZCBpbiB0eXBlIGRlY2xhcmF0aW9uIGFuZCBub3QgaW4gcmVhbCBjb2RlLiBTbyB3ZSBkZWZpbmUgaXQgYXMgYHVua25vd25gIGhlcmUgdG9cbi8vIGJ5cGFzcyB0aGUgdHlwZSBjaGVjay5cbi8vXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHR5cGUgSFRNTEltYWdlRWxlbWVudCA9IHVua25vd247XG59XG5cbmltcG9ydCB7T3J0V2FzbU1lc3NhZ2UsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhfSBmcm9tICcuLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge2NyZWF0ZVNlc3Npb24sIGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIsIGVuZFByb2ZpbGluZywgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMsIGluaXRFcCwgaW5pdFJ1bnRpbWUsIHJlbGVhc2VTZXNzaW9uLCBydW59IGZyb20gJy4uL3dhc20tY29yZS1pbXBsJztcbmltcG9ydCB7aW5pdGlhbGl6ZVdlYkFzc2VtYmx5fSBmcm9tICcuLi93YXNtLWZhY3RvcnknO1xuXG5zZWxmLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xuICBjb25zdCB7dHlwZSwgaW4gOiBtZXNzYWdlfSA9IGV2LmRhdGE7XG4gIHRyeSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdpbml0LXdhc20nOlxuICAgICAgICBpbml0aWFsaXplV2ViQXNzZW1ibHkobWVzc2FnZSEud2FzbSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGluaXRSdW50aW1lKG1lc3NhZ2UhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbml0LWVwJzoge1xuICAgICAgICBjb25zdCB7ZXBOYW1lLCBlbnZ9ID0gbWVzc2FnZSE7XG4gICAgICAgIGluaXRFcChlbnYsIGVwTmFtZSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NvcHktZnJvbSc6IHtcbiAgICAgICAgY29uc3Qge2J1ZmZlcn0gPSBtZXNzYWdlITtcbiAgICAgICAgY29uc3QgYnVmZmVyRGF0YSA9IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIoYnVmZmVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIG91dDogYnVmZmVyRGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NyZWF0ZSc6IHtcbiAgICAgICAgY29uc3Qge21vZGVsLCBvcHRpb25zfSA9IG1lc3NhZ2UhO1xuICAgICAgICBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgc2Vzc2lvbk1ldGFkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdyZWxlYXNlJzpcbiAgICAgICAgcmVsZWFzZVNlc3Npb24obWVzc2FnZSEpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZX0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3J1bic6IHtcbiAgICAgICAgY29uc3Qge3Nlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnN9ID0gbWVzc2FnZSE7XG4gICAgICAgIHJ1bihzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBuZXcgQXJyYXkob3V0cHV0SW5kaWNlcy5sZW5ndGgpLmZpbGwobnVsbCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBvdXRwdXRzID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXRzLnNvbWUobyA9PiBvWzNdICE9PSAnY3B1JykpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycjogJ1Byb3h5IGRvZXMgbm90IHN1cHBvcnQgbm9uLWNwdSB0ZW5zb3IgbG9jYXRpb24uJ30pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB7dHlwZSwgb3V0OiBvdXRwdXRzfSBhcyBPcnRXYXNtTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzKFsuLi5pbnB1dHMsIC4uLm91dHB1dHNdIGFzIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhW10pKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnZW5kLXByb2ZpbGluZyc6XG4gICAgICAgIGVuZFByb2ZpbGluZyhtZXNzYWdlISk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBYSxVQUFrQyxjQUFzQztBQUFyRjtBQUFBO0FBQU8sTUFBTSxX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SSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsSUFBRSxFQUFFLENBQUMsSUFBRSxHQUFFO0FBQUUsZ0JBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUs7QUFBQSxjQUF1QixNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBSyxNQUFLO0FBQUEsY0FBYyxNQUFLO0FBQUEsY0FBUSxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FDN2UsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLFlBQUk7QUFBRSxxQkFBUSxLQUFLO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFFLGdCQUFJLEtBQUcsMkRBQTJELE1BQU0sR0FBRyxHQUFFLEtBQUcsd0ZBQXdGLE1BQU0sR0FBRztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFO0FBQUEsY0FDdGYsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRTtBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFFLEVBQUU7QUFBRyxxQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHVCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMseUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyx1QkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxNQUFJO0FBQUEsY0FBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSztBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssTUFBSTtBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsTUFBSTtBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUEsZ0JBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxJQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUEsZ0JBQ25mO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMsb0JBQUksSUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLEtBQUcsRUFBRSxLQUFHLEtBQUcsS0FBRyxDQUFDO0FBQUUsc0JBQUksRUFBRSxLQUFHLE1BQUksRUFBRSxLQUFHLEtBQUcsS0FBRztBQUFJLG9CQUFHO0FBQUUsd0JBQUksTUFBSSxLQUFHLEVBQUUsS0FBRyxNQUFJLEVBQUUsTUFBSSxHQUFFLEtBQUcsS0FBRyxLQUFHLEtBQUcsRUFBRSxFQUFFLEVBQUUsTUFBSSxJQUFFO0FBQUEscUJBQVE7QUFBQyxzQkFBRTtBQUFHLHNCQUFJLEtBQUcsRUFBRSxLQUFHLElBQUUsRUFBRSxLQUFHLEtBQUc7QUFBRSxtQkFBQyxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxNQUFJO0FBQUEsZ0JBQUc7QUFBQyx1QkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLGNBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFO0FBQUEsY0FBRyxNQUFLLE9BQUcsRUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLEtBQUcsRUFBRSxLQUFHLEtBQUcsS0FBRyxDQUFDLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxRQUFJLEVBQUUsS0FBRyxNQUFNLFNBQVMsRUFBRSxVQUFVLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEtBQUc7QUFBQSxjQUFLLE1BQUssT0FBRztBQUFDLG9CQUFFLEVBQUU7QUFBRyxvQkFBSSxJQUFFLEtBQUc7QUFBRSxvQkFBRSxLQUFLLElBQUksQ0FBQyxJQUFFO0FBQUcsd0JBQU8sSUFBRSxNQUFJLE9BQUssT0FBTyxVQUFRLElBQUUsS0FBRyxNQUFJLElBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRTtBQUFBLGNBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFO0FBQUEsY0FBRyxNQUFLLE1BQUk7QUFBQSxZQUFHO0FBQUUsZ0JBQUUsRUFBRSxRQUFRLE9BQU0sTUFBVTtBQUN4ZixpQkFBSSxLQUFLO0FBQUUsZ0JBQUUsU0FBUyxDQUFDLE1BQUksSUFBRSxFQUFFLFFBQVEsSUFBSSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFHLGdCQUFFLEVBQUUsUUFBUSxTQUFRLEdBQUc7QUFBRSxnQkFBRSxHQUFHLENBQUM7QUFBRSxnQkFBRyxFQUFFLFNBQU87QUFBRSxxQkFBTztBQUFFLGNBQUUsSUFBSSxHQUFFLE1BQUksQ0FBQztBQUFFLG1CQUFPLEVBQUUsU0FBTztBQUFBLFVBQUM7QUFDM0osY0FBSSxLQUFHLEVBQUMsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQUs7QUFBRSxZQUFDLElBQUksR0FBRyxDQUFDLEVBQUcsR0FBRyxNQUFJLEdBQUUsTUFBSSxDQUFDO0FBQUUsaUJBQUc7QUFBRTtBQUFLLGtCQUFNO0FBQUEsVUFBRyxHQUFFLEdBQUUsV0FBVTtBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxNQUFJLEdBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUUsSUFBRSxZQUFVLElBQUUsVUFBUSxDQUFDLENBQUMsS0FBRyxNQUFJLEtBQUcsYUFBVyxJQUFFO0FBQUksbUJBQUs7QUFBRSxnQkFBRSxJQUFJLEtBQUssTUFBSSxDQUFDO0FBQUUsY0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsY0FBYztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsY0FBYztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWTtBQUFFLGNBQUUsSUFBRSxPQUNoZixNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsVUFBVTtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEVBQUUsUUFBUSxJQUFFLEtBQUssSUFBSSxFQUFFLGVBQWUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxLQUFHLFFBQU07QUFBQSxVQUFDLEdBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUUsSUFBRSxZQUFVLElBQUUsVUFBUSxDQUFDLENBQUMsS0FBRyxNQUFJLEtBQUcsYUFBVyxJQUFFO0FBQUksbUJBQUs7QUFBRSxnQkFBRSxJQUFJLEtBQUssTUFBSSxDQUFDO0FBQUUsY0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWSxJQUFFO0FBQUssY0FBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxPQUFPO0FBQ3pmLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsY0FBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxLQUFHLEVBQUUsa0JBQWtCO0FBQUcsZ0JBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGdCQUFJLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEtBQUcsS0FBRyxFQUFFLGtCQUFrQixLQUFHLEtBQUssSUFBSSxHQUFFLENBQUMsS0FBRztBQUFBLFVBQUMsR0FBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxJQUFJLEtBQUssRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsTUFBSyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLGtCQUFrQixHQUFFLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQixHQUMxZ0IsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsZ0JBQUUsSUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxPQUFPLEtBQUcsS0FBRyxLQUFHLENBQUMsSUFBRSxJQUFFLE1BQUksS0FBRyxPQUFLLElBQUUsS0FBSyxJQUFJLEdBQUUsQ0FBQyxHQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxRQUFNLElBQUUsSUFBRSxJQUFFLEtBQUcsRUFBRTtBQUFHLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsY0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGdCQUFFLEVBQUUsUUFBUTtBQUFFLGtCQUFNLENBQUMsS0FBRyxFQUFFLEdBQUcsTUFBSSxNQUFJLENBQUMsSUFBRSxJQUFHLElBQUUsTUFDamYsS0FBRztBQUFJLG1CQUFPLElBQUksSUFBRSxHQUFFLEtBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFFLElBQUUsSUFBRSxDQUFDLEtBQUssTUFBTSxJQUFFLFVBQVUsTUFBSSxJQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQUksTUFBSSxVQUFVLE1BQUksSUFBRSxFQUFFLEdBQUUsTUFBSTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQyxtQkFBTTtBQUFBLFVBQUcsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQVMsRUFBRSxHQUFFO0FBQUMsc0JB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QU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM3ZCxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUU7QUFBQyxtQkFB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SSxDQUFDLElBQUU7QUFBRSxtQkFBSSxJQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sRUFBRTtBQUFFLG1CQUFHLEVBQUUsUUFBTSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVcsQ0FBQztBQUFFLGlCQUFHLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFHLEVBQUUsU0FBTztBQUFBLFlBQUMsQ0FBQztBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxHQUFHO0FBQUUsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRTtBQUFPLGdCQUFJLElBQUU7QUFBRSxjQUFFLFFBQVEsT0FBRyxLQUFHLEVBQUUsU0FBTyxDQUFDO0FBQUUsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFDdGMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLGNBQUksS0FBRyxDQUFDLE1BQUssQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFL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LFlBQ3pCO0FBQUEsVUFBQztBQUNUO0FBQUEsUUFDRjtBQUFBLFFBQ0EsS0FBSyxhQUFhO0FBQ2hCLGdCQUFNLEVBQUMsT0FBTSxJQUFJO0FBQ2pCLGdCQUFNLGFBQWEsdUJBQXVCLE1BQU07QUFDaEQsc0JBQVksRUFBQyxNQUFNLEtBQUssV0FBVSxDQUFtQjtBQUNyRDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUssVUFBVTtBQUNiLGdCQUFNLEVBQUMsT0FBTyxRQUFPLElBQUk7QUFDekIsd0JBQWMsT0FBTyxPQUFPLEVBQ3ZCO0FBQUEsWUFDRyxxQkFBbUI7QUFDakIsMEJBQVksRUFBQyxNQUFNLEtBQUssZ0JBQWUsQ0FBbUI7QUFBQSxZQUM1RDtBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxJQUFHLENBQUM7QUFBQSxZQUN6QjtBQUFBLFVBQUM7QUFDVDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUs7QUFDSCx5QkFBZSxPQUFRO0FBQ3ZCLHNCQUFZLEVBQUMsS0FBSSxDQUFDO0FBQ2xCO0FBQUEsUUFDRixLQUFLLE9BQU87QUFDVixnQkFBTSxFQUFDLFdBQVcsY0FBYyxRQUFRLGVBQWUsUUFBTyxJQUFJO0FBQ2xFLGNBQUksV0FBVyxjQUFjLFFBQVEsZUFBZSxJQUFJLE1BQU0sY0FBYyxNQUFNLEVBQUUsS0FBSyxJQUFJLEdBQUcsT0FBTyxFQUNsRztBQUFBLFlBQ0csYUFBVztBQUNULGtCQUFJLFFBQVEsS0FBSyxPQUFLLEVBQUUsQ0FBQyxNQUFNLEtBQUssR0FBRztBQUNyQyw0QkFBWSxFQUFDLE1BQU0sS0FBSyxrREFBaUQsQ0FBQztBQUFBLGNBQzVFLE9BQU87QUFDTDtBQUFBLGtCQUNJLEVBQUMsTUFBTSxLQUFLLFFBQU87QUFBQSxrQkFDbkIsMkJBQTJCLENBQUMsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFpQztBQUFBLGdCQUFDO0FBQUEsY0FDekY7QUFBQSxZQUNGO0FBQUEsWUFDQSxTQUFPO0FBQ0wsMEJBQVksRUFBQyxNQUFNLElBQUcsQ0FBQztBQUFBLFlBQ3pCO0FBQUEsVUFBQztBQUNUO0FBQUEsUUFDRjtBQUFBLFFBQ0EsS0FBSztBQUNILHVCQUFhLE9BQVE7QUFDckIsc0JBQVksRUFBQyxLQUFJLENBQUM7QUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsU0FBUyxLQUFLO0FBQ1osa0JBQVksRUFBQyxNQUFNLElBQUcsQ0FBbUI7QUFBQSxJQUMzQztBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbImpvaW4iLCAid2FzbSIsICJ3YXNtIiwgIndhc20iLCAicmVhZEZpbGUiLCAicmVhZEZpbGUiLCAid2FzbSIsICJ0ZW5zb3IiLCAiZXJyb3JDb2RlIiwgImkiXQp9Cg==\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, queuedCallbacks, enqueueCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    isProxy = () => !!env2.wasm.proxy && typeof document !== "undefined";
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    queuedCallbacks = /* @__PURE__ */ new Map();
    enqueueCallbacks = (type, callbacks) => {
      const queue = queuedCallbacks.get(type);
      if (queue) {
        queue.push(callbacks);
      } else {
        queuedCallbacks.set(type, [callbacks]);
      }
    };
    ensureWorker = () => {
      if (initializing2 || !initialized2 || aborted2 || !proxyWorker) {
        throw new Error("worker not ready");
      }
    };
    onProxyWorkerMessage = (ev) => {
      switch (ev.data.type) {
        case "init-wasm":
          initializing2 = false;
          if (ev.data.err) {
            aborted2 = true;
            initWasmCallbacks[1](ev.data.err);
          } else {
            initialized2 = true;
            initWasmCallbacks[0]();
          }
          break;
        case "init-ep":
        case "copy-from":
        case "create":
        case "release":
        case "run":
        case "end-profiling": {
          const callbacks = queuedCallbacks.get(ev.data.type);
          if (ev.data.err) {
            callbacks.shift()[1](ev.data.err);
          } else {
            callbacks.shift()[0](ev.data.out);
          }
          break;
        }
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyAndOrtRuntime = async () => {
      if (initialized2) {
        return;
      }
      if (initializing2) {
        throw new Error("multiple calls to 'initWasm()' detected.");
      }
      if (aborted2) {
        throw new Error("previous call to 'initWasm()' failed.");
      }
      initializing2 = true;
      if (isProxy()) {
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require_main()
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2 };
          proxyWorker.postMessage(message);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e) {
          aborted2 = true;
          throw e;
        } finally {
          initializing2 = false;
        }
      }
    };
    initializeOrtEp = async (epName) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("init-ep", [resolve, reject]);
          const message = { type: "init-ep", in: { epName, env: env2 } };
          proxyWorker.postMessage(message);
        });
      } else {
        await initEp(env2, epName);
      }
    };
    copyFromExternalBuffer2 = async (buffer) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("copy-from", [resolve, reject]);
          const message = { type: "copy-from", in: { buffer } };
          proxyWorker.postMessage(message, [buffer.buffer]);
        });
      } else {
        return copyFromExternalBuffer(buffer);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("create", [resolve, reject]);
          const message = { type: "create", in: { model, options: { ...options } } };
          const transferable = [];
          if (model instanceof Uint8Array) {
            transferable.push(model.buffer);
          }
          proxyWorker.postMessage(message, transferable);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("release", [resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (isProxy()) {
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("run", [resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("end-profiling", [resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
  }
});

// web/lib/wasm/session-handler-inference.ts
var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    init_wasm_utils_load_file();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async fetchModelAndCopyToWasmMemory(path) {
        return copyFromExternalBuffer2(await loadFile(path));
      }
      async loadModel(pathOrBuffer, options) {
        TRACE_FUNC_BEGIN();
        let model;
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
        TRACE_FUNC_END();
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        TRACE_FUNC_BEGIN();
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        TRACE_FUNC_END();
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        if (typeof self !== "undefined" && !self.crossOriginIsolated || typeof process !== "undefined" && process.versions && process.versions.node) {
          env2.wasm.numThreads = 1;
        }
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      /**
       * This function initializes the WebAssembly backend.
       *
       * This function will be called only once for each backend name. It will be called the first time when
       * `ort.InferenceSession.create()` is called with a registered backend name.
       *
       * @param backendName - the registered backend name.
       */
      async init(backendName) {
        initializeFlags();
        await initializeWebAssemblyAndOrtRuntime();
        await initializeOrtEp(backendName);
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/wasm/wasm-training-core-impl.ts
var NO_TRAIN_FUNCS_MSG, ifErrCodeCheckLastError, createCheckpointHandle, getModelInputOutputCount, getModelInputOutputNamesLoop, getModelInputOutputNames, createTrainingSessionHandle, createAndAllocateTensors, moveOutputToTensorMetadataArr, lazyResetGrad, runTrainStep, runOptimizerStep, runEvalStep, getParametersSize, getContiguousParameters, loadParametersBuffer, releaseTrainingSessionAndCheckpoint;
var init_wasm_training_core_impl = __esm({
  "web/lib/wasm/wasm-training-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils();
    NO_TRAIN_FUNCS_MSG = "Built without training API's enabled. Use the onnxruntime-web/training import for training functionality, and make sure that all the correct artifacts are built & moved to the correct folder if using a custom build. Check https://onnxruntime.ai/docs/build/web.html for more information.";
    ifErrCodeCheckLastError = (errCode, message, checkNeqZero = true) => {
      if (checkNeqZero && errCode !== 0) {
        checkLastError(message);
      } else if (!checkNeqZero && errCode === 0) {
        checkLastError(message);
      }
    };
    createCheckpointHandle = (checkpointData) => {
      const wasm2 = getInstance();
      const [checkpointDataOffset, checkpointDataLength] = checkpointData;
      let checkpointHandle = 0;
      try {
        if (wasm2._OrtTrainingLoadCheckpoint) {
          checkpointHandle = wasm2._OrtTrainingLoadCheckpoint(checkpointDataOffset, checkpointDataLength);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(checkpointHandle, "Error occurred when trying to create a CheckpointState", false);
        return checkpointHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseCheckpoint && checkpointHandle !== 0) {
          wasm2._OrtTrainingReleaseCheckpoint(checkpointHandle);
        }
        throw e;
      } finally {
        wasm2._OrtFree(checkpointData[0]);
      }
    };
    getModelInputOutputCount = (trainingSessionId, isEvalModel) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        if (wasm2._OrtTrainingGetModelInputOutputCount) {
          const errorCode = wasm2._OrtTrainingGetModelInputOutputCount(trainingSessionId, dataOffset, dataOffset + 4, isEvalModel);
          ifErrCodeCheckLastError(errorCode, "Can't get session input/output count.");
          return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getModelInputOutputNamesLoop = (trainingSessionId, count, isInput, isEvalModel) => {
      const names = [];
      const wasm2 = getInstance();
      for (let i = 0; i < count; i++) {
        if (wasm2._OrtTrainingGetModelInputOutputName) {
          const name = wasm2._OrtTrainingGetModelInputOutputName(trainingSessionId, i, isInput, isEvalModel);
          ifErrCodeCheckLastError(name, `Can't get input or output name -- is input: ${isInput}, index ${i}`, false);
          names.push(wasm2.UTF8ToString(name));
          wasm2._free(name);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      }
      return names;
    };
    getModelInputOutputNames = (trainingSessionId, isEvalModel) => {
      let inputNames = [];
      let outputNames = [];
      const [inputCount, outputCount] = getModelInputOutputCount(trainingSessionId, isEvalModel);
      inputNames = getModelInputOutputNamesLoop(trainingSessionId, inputCount, true, isEvalModel);
      outputNames = getModelInputOutputNamesLoop(trainingSessionId, outputCount, false, isEvalModel);
      return [inputNames, outputNames];
    };
    createTrainingSessionHandle = (checkpointHandle, trainModelData, evalModelData, optimizerModelData, options) => {
      const wasm2 = getInstance();
      let trainingSessionHandle = 0;
      let sessionOptionsHandle = 0;
      let allocs = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (wasm2._OrtTrainingCreateSession) {
          trainingSessionHandle = wasm2._OrtTrainingCreateSession(
            sessionOptionsHandle,
            checkpointHandle,
            trainModelData[0],
            trainModelData[1],
            evalModelData[0],
            evalModelData[1],
            optimizerModelData[0],
            optimizerModelData[1]
          );
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(trainingSessionHandle, "Error occurred when trying to create a TrainingSession", false);
        return trainingSessionHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseSession && trainingSessionHandle !== 0) {
          wasm2._OrtTrainingReleaseSession(trainingSessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(trainModelData[0]);
        wasm2._free(evalModelData[0]);
        wasm2._free(optimizerModelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
      }
    };
    createAndAllocateTensors = (trainingSessionId, indices, tensors, tensorHandles, inputOutputAllocs, indexAdd) => {
      const count = indices.length;
      for (let i = 0; i < count; i++) {
        prepareInputOutputTensor(
          tensors[i],
          tensorHandles,
          inputOutputAllocs,
          trainingSessionId,
          indexAdd + indices[i]
        );
      }
      const wasm2 = getInstance();
      const valuesOffset = wasm2.stackAlloc(count * 4);
      let valuesIndex = valuesOffset / 4;
      for (let i = 0; i < count; i++) {
        wasm2.HEAPU32[valuesIndex++] = tensorHandles[i];
      }
      return valuesOffset;
    };
    moveOutputToTensorMetadataArr = (outputValuesOffset, outputCount, outputTensorHandles, outputTensors) => {
      const wasm2 = getInstance();
      const output = [];
      for (let i = 0; i < outputCount; i++) {
        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
        if (tensor === outputTensorHandles[i]) {
          output.push(outputTensors[i]);
          continue;
        }
        const beforeGetTensorDataStack = wasm2.stackSave();
        const tensorDataOffset = wasm2.stackAlloc(4 * 4);
        let type, dataOffset = 0;
        try {
          const errorCode = wasm2._OrtGetTensorData(
            tensor,
            tensorDataOffset,
            tensorDataOffset + 4,
            tensorDataOffset + 8,
            tensorDataOffset + 12
          );
          ifErrCodeCheckLastError(errorCode, `Can't access output tensor data on index ${i}.`);
          let tensorDataIndex = tensorDataOffset / 4;
          const dataType = wasm2.HEAPU32[tensorDataIndex++];
          dataOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
          const dims = [];
          for (let i2 = 0; i2 < dimsLength; i2++) {
            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
          }
          wasm2._OrtFree(dimsOffset);
          const size = dims.reduce((a, b) => a * b, 1);
          type = tensorDataTypeEnumToString(dataType);
          if (type === "string") {
            const stringData = [];
            let dataIndex = dataOffset / 4;
            for (let i2 = 0; i2 < size; i2++) {
              const offset = wasm2.HEAPU32[dataIndex++];
              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
            }
            output.push([type, dims, stringData, "cpu"]);
          } else {
            const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
            const data = new typedArrayConstructor(size);
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
            output.push([type, dims, data, "cpu"]);
          }
        } finally {
          wasm2.stackRestore(beforeGetTensorDataStack);
          if (type === "string" && dataOffset) {
            wasm2._free(dataOffset);
          }
          wasm2._OrtReleaseTensor(tensor);
        }
      }
      return output;
    };
    lazyResetGrad = async (trainingSessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingLazyResetGrad) {
        const errorCode = wasm2._OrtTrainingLazyResetGrad(trainingSessionId);
        ifErrCodeCheckLastError(errorCode, "Can't call lazyResetGrad.");
      } else {
        throw new Error(NO_TRAIN_FUNCS_MSG);
      }
    };
    runTrainStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingRunTrainStep) {
          const errorCode = wasm2._OrtTrainingRunTrainStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingRunTrainStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runOptimizerStep = async (trainingSessionId, options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        if (wasm2._OrtTrainingOptimizerStep) {
          const errCode = wasm2._OrtTrainingOptimizerStep(trainingSessionId, runOptionsHandle);
          ifErrCodeCheckLastError(errCode, "Failed to call OrtTrainingOptimizerStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runEvalStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingEvalStep) {
          const errorCode = wasm2._OrtTrainingEvalStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingEvalStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    getParametersSize = (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const sizeOffset = wasm2.stackAlloc(4);
        if (wasm2._OrtTrainingGetParametersSize) {
          const errorCode = wasm2._OrtTrainingGetParametersSize(trainingSessionId, sizeOffset, trainableOnly);
          ifErrCodeCheckLastError(errorCode, "Can't get parameters size");
          return wasm2.HEAP32[sizeOffset / 4];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getContiguousParameters = async (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const parametersSize = getParametersSize(trainingSessionId, trainableOnly);
      let tensor = 0;
      const paramsByteLength = 4 * parametersSize;
      const paramsOffset = wasm2._malloc(paramsByteLength);
      const dims = [parametersSize];
      const dimsOffset = wasm2.stackAlloc(4);
      const dimsIndex = dimsOffset / 4;
      wasm2.HEAP32[dimsIndex] = parametersSize;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          paramsOffset,
          paramsByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(
          tensor,
          `Can't create tensor for getContiguousParameters. session=${trainingSessionId}.`,
          false
        );
        if (wasm2._OrtTrainingCopyParametersToBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersToBuffer(trainingSessionId, tensor, parametersSize, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't get contiguous parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        const typedArrayConstructor = tensorTypeToTypedArrayConstructor(tensorTypeAsString);
        const data = new typedArrayConstructor(parametersSize);
        const output = [];
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(paramsOffset, paramsOffset + paramsByteLength));
        output.push([tensorTypeAsString, dims, data, locationAsString]);
        if (output.length !== 1) {
          throw new Error(`something unexpected happened in the getContiguousParameters function. Expected output length of
     one, got ${output.length}`);
        } else {
          return output[0];
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2._free(paramsOffset);
        wasm2._free(dimsOffset);
        wasm2.stackRestore(stack);
      }
    };
    loadParametersBuffer = async (trainingSessionId, buffer, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const bufferByteLength = buffer.length;
      const bufferCount = bufferByteLength / 4;
      const bufferOffset = wasm2._malloc(bufferByteLength);
      wasm2.HEAPU8.set(buffer, bufferOffset);
      const dimsOffset = wasm2.stackAlloc(4);
      wasm2.HEAP32[dimsOffset / 4] = bufferCount;
      const dimsLength = 1;
      let tensor = 0;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          bufferOffset,
          bufferByteLength,
          dimsOffset,
          dimsLength,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(tensor, `Can't create tensor for input/output. session=${trainingSessionId}`, false);
        if (wasm2._OrtTrainingCopyParametersFromBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersFromBuffer(trainingSessionId, tensor, bufferCount, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't copy buffer to parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2.stackRestore(stack);
        wasm2._free(bufferOffset);
        wasm2._free(dimsOffset);
      }
    };
    releaseTrainingSessionAndCheckpoint = (checkpointId, sessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingReleaseSession) {
        wasm2._OrtTrainingReleaseSession(sessionId);
      }
      if (wasm2._OrtTrainingReleaseCheckpoint) {
        wasm2._OrtTrainingReleaseCheckpoint(checkpointId);
      }
    };
  }
});

// web/lib/wasm/session-handler-training.ts
var OnnxruntimeWebAssemblyTrainingSessionHandler;
var init_session_handler_training = __esm({
  "web/lib/wasm/session-handler-training.ts"() {
    "use strict";
    init_session_handler_inference();
    init_wasm_core_impl();
    init_wasm_training_core_impl();
    OnnxruntimeWebAssemblyTrainingSessionHandler = class {
      constructor() {
        this.evalInputNames = [];
        this.evalOutputNames = [];
      }
      async uriOrBufferToHeap(uriOrBuffer) {
        let buffer;
        if (typeof uriOrBuffer === "string") {
          const response = await fetch(uriOrBuffer);
          const arrayBuffer = await response.arrayBuffer();
          buffer = new Uint8Array(arrayBuffer);
        } else {
          buffer = uriOrBuffer;
        }
        return copyFromExternalBuffer(buffer);
      }
      async createTrainingSession(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const checkpointData = await this.uriOrBufferToHeap(checkpointStateUriOrBuffer);
        const trainModelData = await this.uriOrBufferToHeap(trainModelUriOrBuffer);
        let evalModelData = [0, 0];
        let optimizerModelData = [0, 0];
        if (evalModelUriOrBuffer !== "") {
          evalModelData = await this.uriOrBufferToHeap(evalModelUriOrBuffer);
        }
        if (optimizerModelUriOrBuffer !== "") {
          optimizerModelData = await this.uriOrBufferToHeap(optimizerModelUriOrBuffer);
        }
        this.checkpointId = createCheckpointHandle(checkpointData);
        this.sessionId = createTrainingSessionHandle(this.checkpointId, trainModelData, evalModelData, optimizerModelData, options);
        [this.inputNames, this.outputNames] = getModelInputOutputNames(this.sessionId, false);
        if (evalModelUriOrBuffer !== "") {
          [this.evalInputNames, this.evalOutputNames] = getModelInputOutputNames(this.sessionId, true);
        }
      }
      /**
       * Helper method that converts a feeds or fetches datatype to two arrays, one of values and one that stores the
       * corresponding name as a number referring to the index in the list of names provided.
       *
       * @param feeds meant to match either SessionHandler.FeedsType or SessionHandler.FetchesType
       * @param names either inputNames or outputNames
       * @returns a tuple of a list of values and a list of indices.
       */
      convertMapIntoValuesArrayAndIndicesArray(feeds, names, mapFunc) {
        const values = [];
        const indices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = names.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}`);
          }
          values.push(tensor);
          indices.push(index);
        });
        const uList = values.map(mapFunc);
        return [values, indices, uList];
      }
      /**
       * Helper method that converts the TensorMetadata that the wasm-core functions return to the
       * SessionHandler.ReturnType. Any outputs in the provided outputArray that are falsy will be populated with the
       * corresponding result.
       *
       * @param results used to populate the resultMap if there is no value for that outputName already
       * @param outputArray used to populate the resultMap. If null or undefined, use the corresponding result from results
       * @param outputIndices specifies which outputName the corresponding value for outputArray refers to.
       * @returns a map of output names and OnnxValues.
       */
      convertTensorMetadataToReturnType(results, outputArray, outputIndices) {
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      async lazyResetGrad() {
        await lazyResetGrad(this.sessionId);
      }
      async runTrainStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.inputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.outputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await runTrainStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async runOptimizerStep(options) {
        await runOptimizerStep(this.sessionId, options);
      }
      async runEvalStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.evalInputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.evalInputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.evalOutputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.evalOutputNames[outputIndices[i]]}"`) : null
        );
        const results = await runEvalStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async getParametersSize(trainableOnly) {
        return getParametersSize(this.sessionId, trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly) {
        await loadParametersBuffer(this.sessionId, array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly) {
        const tensorResult = await getContiguousParameters(this.sessionId, trainableOnly);
        return decodeTensorMetadata(tensorResult);
      }
      async dispose() {
        return releaseTrainingSessionAndCheckpoint(this.checkpointId, this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm-training.ts
var backend_wasm_training_exports = {};
__export(backend_wasm_training_exports, {
  wasmBackend: () => wasmBackend
});
var OnnxruntimeTrainingWebAssemblyBackend, wasmBackend;
var init_backend_wasm_training = __esm({
  "web/lib/backend-wasm-training.ts"() {
    "use strict";
    init_backend_wasm();
    init_session_handler_training();
    OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
      async createTrainingSessionHandler(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblyTrainingSessionHandler();
        await handler.createTrainingSession(
          checkpointStateUriOrBuffer,
          trainModelUriOrBuffer,
          evalModelUriOrBuffer,
          optimizerModelUriOrBuffer,
          options
        );
        return Promise.resolve(handler);
      }
    };
    wasmBackend = new OnnxruntimeTrainingWebAssemblyBackend();
  }
});

// web/lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  default: () => lib_default,
  env: () => env2,
  registerBackend: () => registerBackend
});
module.exports = __toCommonJS(lib_exports);
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.18.0";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = false ? null.wasmBackend : (init_backend_wasm_training(), __toCommonJS(backend_wasm_training_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
    registerBackend("webnn", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });