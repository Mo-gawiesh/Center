var HCDashboard = (() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/convex/dist/esm/index.js
  var version = "1.43.0";

  // node_modules/convex/dist/esm/values/base64.js
  var base64_exports = {};
  __export(base64_exports, {
    byteLength: () => byteLength,
    fromByteArray: () => fromByteArray,
    fromByteArrayUrlSafeNoPadding: () => fromByteArrayUrlSafeNoPadding,
    toByteArray: () => toByteArray
  });
  var lookup = [];
  var revLookup = [];
  var Arr = Uint8Array;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  var i;
  var len;
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
  function getLens(b64) {
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    var validLen = b64.indexOf("=");
    if (validLen === -1) validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }
  function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function _byteLength(_b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i;
    for (i = 0; i < len; i += 4) {
      tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
      arr2[curByte++] = tmp >> 16 & 255;
      arr2[curByte++] = tmp >> 8 & 255;
      arr2[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 2) {
      tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
      arr2[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 1) {
      tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
      arr2[curByte++] = tmp >> 8 & 255;
      arr2[curByte++] = tmp & 255;
    }
    return arr2;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(
        encodeChunk(
          uint8,
          i,
          i + maxChunkLength > len2 ? len2 : i + maxChunkLength
        )
      );
    }
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      parts.push(
        lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
      );
    }
    return parts.join("");
  }
  function fromByteArrayUrlSafeNoPadding(uint8) {
    return fromByteArray(uint8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  // node_modules/convex/dist/esm/common/index.js
  function parseArgs(args) {
    if (args === void 0) {
      return {};
    }
    if (!isSimpleObject(args)) {
      throw new Error(
        `The arguments to a Convex function must be an object. Received: ${args}`
      );
    }
    return args;
  }
  function validateDeploymentUrl(deploymentUrl) {
    if (typeof deploymentUrl === "undefined") {
      throw new Error(
        `Client created with undefined deployment address. If you used an environment variable, check that it's set.`
      );
    }
    if (typeof deploymentUrl !== "string") {
      throw new Error(
        `Invalid deployment address: found ${deploymentUrl}".`
      );
    }
    if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:"))) {
      throw new Error(
        `Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`
      );
    }
    try {
      new URL(deploymentUrl);
    } catch {
      throw new Error(
        `Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
      );
    }
    if (deploymentUrl.endsWith(".convex.site")) {
      throw new Error(
        `Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
      );
    }
  }
  function isSimpleObject(value) {
    var _a2;
    const isObject = typeof value === "object";
    const prototype = Object.getPrototypeOf(value);
    const isSimple = prototype === null || prototype === Object.prototype || // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
    // conditions but are still simple objects.
    ((_a2 = prototype == null ? void 0 : prototype.constructor) == null ? void 0 : _a2.name) === "Object";
    return isObject && isSimple;
  }

  // node_modules/convex/dist/esm/values/value.js
  var LITTLE_ENDIAN = true;
  var MIN_INT64 = BigInt("-9223372036854775808");
  var MAX_INT64 = BigInt("9223372036854775807");
  var ZERO = BigInt("0");
  var EIGHT = BigInt("8");
  var TWOFIFTYSIX = BigInt("256");
  var COMMIT_TS_UNRESOLVED = "This commit timestamp is unresolved: its value is assigned when the mutation commits. Read the document after the mutation completes to get its value.";
  var CommitTsPlaceholder = class {
    [Symbol.toPrimitive](hint) {
      if (hint === "string") {
        return this.toString();
      }
      throw new Error(COMMIT_TS_UNRESOLVED);
    }
    valueOf() {
      throw new Error(COMMIT_TS_UNRESOLVED);
    }
    toJSON() {
      throw new Error(COMMIT_TS_UNRESOLVED);
    }
    toString() {
      return "[unresolved commit timestamp]";
    }
  };
  var commitTsPlaceholder = new CommitTsPlaceholder();
  function isSpecial(n) {
    return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
  }
  function slowBigIntToBase64(value) {
    if (value < ZERO) {
      value -= MIN_INT64 + MIN_INT64;
    }
    let hex = value.toString(16);
    if (hex.length % 2 === 1) hex = "0" + hex;
    const bytes = new Uint8Array(new ArrayBuffer(8));
    let i = 0;
    for (const hexByte of hex.match(/.{2}/g).reverse()) {
      bytes.set([parseInt(hexByte, 16)], i++);
      value >>= EIGHT;
    }
    return fromByteArray(bytes);
  }
  function slowBase64ToBigInt(encoded) {
    const integerBytes = toByteArray(encoded);
    if (integerBytes.byteLength !== 8) {
      throw new Error(
        `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
      );
    }
    let value = ZERO;
    let power = ZERO;
    for (const byte of integerBytes) {
      value += BigInt(byte) * TWOFIFTYSIX ** power;
      power++;
    }
    if (value > MAX_INT64) {
      value += MIN_INT64 + MIN_INT64;
    }
    return value;
  }
  function modernBigIntToBase64(value) {
    if (value < MIN_INT64 || MAX_INT64 < value) {
      throw new Error(
        `BigInt ${value} does not fit into a 64-bit signed integer.`
      );
    }
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigInt64(0, value, true);
    return fromByteArray(new Uint8Array(buffer));
  }
  function modernBase64ToBigInt(encoded) {
    const integerBytes = toByteArray(encoded);
    if (integerBytes.byteLength !== 8) {
      throw new Error(
        `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
      );
    }
    const intBytesView = new DataView(integerBytes.buffer);
    return intBytesView.getBigInt64(0, true);
  }
  var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
  var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
  var MAX_IDENTIFIER_LEN = 1024;
  function validateObjectField(k) {
    if (k.length > MAX_IDENTIFIER_LEN) {
      throw new Error(
        `Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`
      );
    }
    if (k.startsWith("$")) {
      throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
    }
    for (let i = 0; i < k.length; i += 1) {
      const charCode = k.charCodeAt(i);
      if (charCode < 32 || charCode >= 127) {
        throw new Error(
          `Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`
        );
      }
    }
  }
  function jsonToConvex(value) {
    if (value === null) {
      return value;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((value2) => jsonToConvex(value2));
    }
    if (typeof value !== "object") {
      throw new Error(`Unexpected type of ${value}`);
    }
    const entries = Object.entries(value);
    if (entries.length === 1) {
      const key = entries[0][0];
      if (key === "$bytes") {
        if (typeof value.$bytes !== "string") {
          throw new Error(`Malformed $bytes field on ${value}`);
        }
        return toByteArray(value.$bytes).buffer;
      }
      if (key === "$integer") {
        if (typeof value.$integer !== "string") {
          throw new Error(`Malformed $integer field on ${value}`);
        }
        return base64ToBigInt(value.$integer);
      }
      if (key === "$float") {
        if (typeof value.$float !== "string") {
          throw new Error(`Malformed $float field on ${value}`);
        }
        const floatBytes = toByteArray(value.$float);
        if (floatBytes.byteLength !== 8) {
          throw new Error(
            `Received ${floatBytes.byteLength} bytes, expected 8 for $float`
          );
        }
        const floatBytesView = new DataView(floatBytes.buffer);
        const float = floatBytesView.getFloat64(0, LITTLE_ENDIAN);
        if (!isSpecial(float)) {
          throw new Error(`Float ${float} should be encoded as a number`);
        }
        return float;
      }
      if (key === "$commitTs") {
        if (value.$commitTs !== null) {
          throw new Error(`Malformed $commitTs field on ${value}`);
        }
        return commitTsPlaceholder;
      }
      if (key === "$set") {
        throw new Error(
          `Received a Set which is no longer supported as a Convex type.`
        );
      }
      if (key === "$map") {
        throw new Error(
          `Received a Map which is no longer supported as a Convex type.`
        );
      }
    }
    const out = {};
    for (const [k, v2] of Object.entries(value)) {
      validateObjectField(k);
      out[k] = jsonToConvex(v2);
    }
    return out;
  }
  var MAX_VALUE_FOR_ERROR_LEN = 16384;
  function stringifyValueForError(value) {
    const str = JSON.stringify(value, (_key, value2) => {
      if (value2 === void 0) {
        return "undefined";
      }
      if (typeof value2 === "bigint") {
        return `${value2.toString()}n`;
      }
      return value2;
    });
    if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
      const rest = "[...truncated]";
      let truncateAt = MAX_VALUE_FOR_ERROR_LEN - rest.length;
      const codePoint = str.codePointAt(truncateAt - 1);
      if (codePoint !== void 0 && codePoint > 65535) {
        truncateAt -= 1;
      }
      return str.substring(0, truncateAt) + rest;
    }
    return str;
  }
  function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
    var _a2;
    if (value === void 0) {
      const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(
        originalValue
      )})`;
      throw new Error(
        `undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
      );
    }
    if (value === null) {
      return value;
    }
    if (typeof value === "bigint") {
      if (value < MIN_INT64 || MAX_INT64 < value) {
        throw new Error(
          `BigInt ${value} does not fit into a 64-bit signed integer.`
        );
      }
      return { $integer: bigIntToBase64(value) };
    }
    if (typeof value === "number") {
      if (isSpecial(value)) {
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
        return { $float: fromByteArray(new Uint8Array(buffer)) };
      } else {
        return value;
      }
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value;
    }
    if (value instanceof ArrayBuffer) {
      return { $bytes: fromByteArray(new Uint8Array(value)) };
    }
    if (value instanceof CommitTsPlaceholder) {
      return { $commitTs: null };
    }
    if (Array.isArray(value)) {
      return value.map(
        (value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`, false)
      );
    }
    if (value instanceof Set) {
      throw new Error(
        errorMessageForUnsupportedType(context, "Set", [...value], originalValue)
      );
    }
    if (value instanceof Map) {
      throw new Error(
        errorMessageForUnsupportedType(context, "Map", [...value], originalValue)
      );
    }
    if (!isSimpleObject(value)) {
      const theType = (_a2 = value == null ? void 0 : value.constructor) == null ? void 0 : _a2.name;
      const typeName = theType ? `${theType} ` : "";
      throw new Error(
        errorMessageForUnsupportedType(context, typeName, value, originalValue)
      );
    }
    const out = {};
    const entries = Object.entries(value);
    entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
    for (const [k, v2] of entries) {
      if (v2 !== void 0) {
        validateObjectField(k);
        out[k] = convexToJsonInternal(v2, originalValue, context + `.${k}`, false);
      } else if (includeTopLevelUndefined) {
        validateObjectField(k);
        out[k] = convexOrUndefinedToJsonInternal(
          v2,
          originalValue,
          context + `.${k}`
        );
      }
    }
    return out;
  }
  function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
    if (context) {
      return `${typeName}${stringifyValueForError(
        value
      )} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(
        originalValue
      )}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
    } else {
      return `${typeName}${stringifyValueForError(
        value
      )} is not a supported Convex type.`;
    }
  }
  function convexOrUndefinedToJsonInternal(value, originalValue, context) {
    if (value === void 0) {
      return { $undefined: null };
    } else {
      if (originalValue === void 0) {
        throw new Error(
          `Programming error. Current value is ${stringifyValueForError(
            value
          )} but original value is undefined`
        );
      }
      return convexToJsonInternal(value, originalValue, context, false);
    }
  }
  function convexToJson(value) {
    return convexToJsonInternal(value, value, "", false);
  }

  // node_modules/convex/dist/esm/values/errors.js
  var __defProp2 = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var _a;
  var _b;
  var IDENTIFYING_FIELD = Symbol.for("ConvexError");
  var ConvexError = class extends (_b = Error, _a = IDENTIFYING_FIELD, _b) {
    constructor(data) {
      super(typeof data === "string" ? data : stringifyValueForError(data));
      __publicField(this, "name", "ConvexError");
      __publicField(this, "data");
      __publicField(this, _a, true);
      this.data = data;
    }
  };

  // node_modules/convex/dist/esm/values/compare_utf8.js
  var arr = () => Array.from({ length: 4 }, () => 0);
  var aBytes = arr();
  var bBytes = arr();

  // node_modules/convex/dist/esm/browser/logging.js
  var __defProp3 = Object.defineProperty;
  var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  var INFO_COLOR = "color:rgb(0, 145, 255)";
  function prefix_for_source(source) {
    switch (source) {
      case "query":
        return "Q";
      case "mutation":
        return "M";
      case "action":
        return "A";
      case "any":
        return "?";
    }
  }
  var DefaultLogger = class {
    constructor(options) {
      __publicField2(this, "_onLogLineFuncs");
      __publicField2(this, "_verbose");
      this._onLogLineFuncs = {};
      this._verbose = options.verbose;
    }
    addLogLineListener(func) {
      let id = Math.random().toString(36).substring(2, 15);
      for (let i = 0; i < 10; i++) {
        if (this._onLogLineFuncs[id] === void 0) {
          break;
        }
        id = Math.random().toString(36).substring(2, 15);
      }
      this._onLogLineFuncs[id] = func;
      return () => {
        delete this._onLogLineFuncs[id];
      };
    }
    logVerbose(...args) {
      if (this._verbose) {
        for (const func of Object.values(this._onLogLineFuncs)) {
          func("debug", `${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
        }
      }
    }
    log(...args) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("info", ...args);
      }
    }
    warn(...args) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("warn", ...args);
      }
    }
    error(...args) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("error", ...args);
      }
    }
  };
  function instantiateDefaultLogger(options) {
    const logger = new DefaultLogger(options);
    logger.addLogLineListener((level, ...args) => {
      switch (level) {
        case "debug":
          console.debug(...args);
          break;
        case "info":
          console.log(...args);
          break;
        case "warn":
          console.warn(...args);
          break;
        case "error":
          console.error(...args);
          break;
        default: {
          level;
          console.log(...args);
        }
      }
    });
    return logger;
  }
  function instantiateNoopLogger(options) {
    return new DefaultLogger(options);
  }
  function logForFunction(logger, type, source, udfPath, message) {
    const prefix = prefix_for_source(source);
    if (typeof message === "object") {
      message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
    }
    if (type === "info") {
      const match = message.match(/^\[.*?\] /);
      if (match === null) {
        logger.error(
          `[CONVEX ${prefix}(${udfPath})] Could not parse console.log`
        );
        return;
      }
      const level = message.slice(1, match[0].length - 2);
      const args = message.slice(match[0].length);
      logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
    } else {
      logger.error(`[CONVEX ${prefix}(${udfPath})] ${message}`);
    }
  }
  function logFatalError(logger, message) {
    const errorMessage = `[CONVEX FATAL ERROR] ${message}`;
    logger.error(errorMessage);
    return new Error(errorMessage);
  }
  function createHybridErrorStacktrace(source, udfPath, result) {
    const prefix = prefix_for_source(source);
    return `[CONVEX ${prefix}(${udfPath})] ${result.errorMessage}
  Called by client`;
  }
  function forwardData(result, error) {
    error.data = result.errorData;
    return error;
  }

  // node_modules/convex/dist/esm/browser/sync/udf_path_utils.js
  function canonicalizeUdfPath(udfPath) {
    const pieces = udfPath.split(":");
    let moduleName;
    let functionName2;
    if (pieces.length === 1) {
      moduleName = pieces[0];
      functionName2 = "default";
    } else {
      moduleName = pieces.slice(0, pieces.length - 1).join(":");
      functionName2 = pieces[pieces.length - 1];
    }
    if (moduleName.endsWith(".js")) {
      moduleName = moduleName.slice(0, -3);
    }
    return `${moduleName}:${functionName2}`;
  }
  function serializePathAndArgs(udfPath, args) {
    return JSON.stringify({
      udfPath: canonicalizeUdfPath(udfPath),
      args: convexToJson(args)
    });
  }
  function serializePaginatedPathAndArgs(udfPath, args, options) {
    const { initialNumItems, id } = options;
    const result = JSON.stringify({
      type: "paginated",
      udfPath: canonicalizeUdfPath(udfPath),
      args: convexToJson(args),
      options: convexToJson({ initialNumItems, id })
    });
    return result;
  }
  function serializedQueryTokenIsPaginated(token) {
    return JSON.parse(token).type === "paginated";
  }

  // node_modules/convex/dist/esm/browser/sync/local_state.js
  var __defProp4 = Object.defineProperty;
  var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField3 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
  var LocalSyncState = class {
    constructor() {
      __publicField3(this, "nextQueryId");
      __publicField3(this, "querySetVersion");
      __publicField3(this, "querySet");
      __publicField3(this, "queryIdToToken");
      __publicField3(this, "identityVersion");
      __publicField3(this, "auth");
      __publicField3(this, "outstandingQueriesOlderThanRestart");
      __publicField3(this, "outstandingAuthOlderThanRestart");
      __publicField3(this, "paused");
      __publicField3(this, "pendingQuerySetModifications");
      this.nextQueryId = 0;
      this.querySetVersion = 0;
      this.identityVersion = 0;
      this.querySet = /* @__PURE__ */ new Map();
      this.queryIdToToken = /* @__PURE__ */ new Map();
      this.outstandingQueriesOlderThanRestart = /* @__PURE__ */ new Set();
      this.outstandingAuthOlderThanRestart = false;
      this.paused = false;
      this.pendingQuerySetModifications = /* @__PURE__ */ new Map();
    }
    hasSyncedPastLastReconnect() {
      return this.outstandingQueriesOlderThanRestart.size === 0 && !this.outstandingAuthOlderThanRestart;
    }
    markAuthCompletion() {
      this.outstandingAuthOlderThanRestart = false;
    }
    subscribe(udfPath, args, journal, componentPath) {
      const canonicalizedUdfPath = canonicalizeUdfPath(udfPath);
      const queryToken = serializePathAndArgs(canonicalizedUdfPath, args);
      const existingEntry = this.querySet.get(queryToken);
      if (existingEntry !== void 0) {
        existingEntry.numSubscribers += 1;
        return {
          queryToken,
          modification: null,
          unsubscribe: () => this.removeSubscriber(queryToken)
        };
      } else {
        const queryId = this.nextQueryId++;
        const query = {
          id: queryId,
          canonicalizedUdfPath,
          args,
          numSubscribers: 1,
          journal,
          componentPath
        };
        this.querySet.set(queryToken, query);
        this.queryIdToToken.set(queryId, queryToken);
        const baseVersion = this.querySetVersion;
        const newVersion = this.querySetVersion + 1;
        const add = {
          type: "Add",
          queryId,
          udfPath: canonicalizedUdfPath,
          args: [convexToJson(args)],
          journal,
          componentPath
        };
        if (this.paused) {
          this.pendingQuerySetModifications.set(queryId, add);
        } else {
          this.querySetVersion = newVersion;
        }
        const modification = {
          type: "ModifyQuerySet",
          baseVersion,
          newVersion,
          modifications: [add]
        };
        return {
          queryToken,
          modification,
          unsubscribe: () => this.removeSubscriber(queryToken)
        };
      }
    }
    transition(transition) {
      for (const modification of transition.modifications) {
        switch (modification.type) {
          case "QueryUpdated":
          case "QueryFailed": {
            this.outstandingQueriesOlderThanRestart.delete(modification.queryId);
            const journal = modification.journal;
            if (journal !== void 0) {
              const queryToken = this.queryIdToToken.get(modification.queryId);
              if (queryToken !== void 0) {
                this.querySet.get(queryToken).journal = journal;
              }
            }
            break;
          }
          case "QueryRemoved": {
            this.outstandingQueriesOlderThanRestart.delete(modification.queryId);
            break;
          }
          default: {
            modification;
            throw new Error(`Invalid modification ${modification.type}`);
          }
        }
      }
    }
    queryId(udfPath, args) {
      const canonicalizedUdfPath = canonicalizeUdfPath(udfPath);
      const queryToken = serializePathAndArgs(canonicalizedUdfPath, args);
      const existingEntry = this.querySet.get(queryToken);
      if (existingEntry !== void 0) {
        return existingEntry.id;
      }
      return null;
    }
    isCurrentOrNewerAuthVersion(version2) {
      return version2 >= this.identityVersion;
    }
    getAuth() {
      return this.auth;
    }
    setAuth(value) {
      this.auth = {
        tokenType: "User",
        value
      };
      const baseVersion = this.identityVersion;
      if (!this.paused) {
        this.identityVersion = baseVersion + 1;
      }
      return {
        type: "Authenticate",
        baseVersion,
        ...this.auth
      };
    }
    setAdminAuth(value, actingAs) {
      const auth = {
        tokenType: "Admin",
        value,
        impersonating: actingAs
      };
      this.auth = auth;
      const baseVersion = this.identityVersion;
      if (!this.paused) {
        this.identityVersion = baseVersion + 1;
      }
      return {
        type: "Authenticate",
        baseVersion,
        ...auth
      };
    }
    clearAuth() {
      this.auth = void 0;
      this.markAuthCompletion();
      const baseVersion = this.identityVersion;
      if (!this.paused) {
        this.identityVersion = baseVersion + 1;
      }
      return {
        type: "Authenticate",
        tokenType: "None",
        baseVersion
      };
    }
    hasAuth() {
      return !!this.auth;
    }
    isNewAuth(value) {
      var _a2;
      return ((_a2 = this.auth) == null ? void 0 : _a2.value) !== value;
    }
    queryPath(queryId) {
      const pathAndArgs = this.queryIdToToken.get(queryId);
      if (pathAndArgs) {
        return this.querySet.get(pathAndArgs).canonicalizedUdfPath;
      }
      return null;
    }
    queryArgs(queryId) {
      const pathAndArgs = this.queryIdToToken.get(queryId);
      if (pathAndArgs) {
        return this.querySet.get(pathAndArgs).args;
      }
      return null;
    }
    queryToken(queryId) {
      var _a2;
      return (_a2 = this.queryIdToToken.get(queryId)) != null ? _a2 : null;
    }
    queryJournal(queryToken) {
      var _a2;
      return (_a2 = this.querySet.get(queryToken)) == null ? void 0 : _a2.journal;
    }
    restart() {
      this.unpause();
      this.outstandingQueriesOlderThanRestart.clear();
      const modifications = [];
      for (const localQuery of this.querySet.values()) {
        const add = {
          type: "Add",
          queryId: localQuery.id,
          udfPath: localQuery.canonicalizedUdfPath,
          args: [convexToJson(localQuery.args)],
          journal: localQuery.journal,
          componentPath: localQuery.componentPath
        };
        modifications.push(add);
        this.outstandingQueriesOlderThanRestart.add(localQuery.id);
      }
      this.querySetVersion = 1;
      const querySet = {
        type: "ModifyQuerySet",
        baseVersion: 0,
        newVersion: 1,
        modifications
      };
      if (!this.auth) {
        this.identityVersion = 0;
        return [querySet, void 0];
      }
      this.outstandingAuthOlderThanRestart = true;
      const authenticate = {
        type: "Authenticate",
        baseVersion: 0,
        ...this.auth
      };
      this.identityVersion = 1;
      return [querySet, authenticate];
    }
    pause() {
      this.paused = true;
    }
    resume() {
      const querySet = this.pendingQuerySetModifications.size > 0 ? {
        type: "ModifyQuerySet",
        baseVersion: this.querySetVersion,
        newVersion: ++this.querySetVersion,
        modifications: Array.from(
          this.pendingQuerySetModifications.values()
        )
      } : void 0;
      const authenticate = this.auth !== void 0 ? {
        type: "Authenticate",
        baseVersion: this.identityVersion++,
        ...this.auth
      } : void 0;
      this.unpause();
      return [querySet, authenticate];
    }
    unpause() {
      this.paused = false;
      this.pendingQuerySetModifications.clear();
    }
    removeSubscriber(queryToken) {
      const localQuery = this.querySet.get(queryToken);
      if (localQuery.numSubscribers > 1) {
        localQuery.numSubscribers -= 1;
        return null;
      } else {
        this.querySet.delete(queryToken);
        this.queryIdToToken.delete(localQuery.id);
        this.outstandingQueriesOlderThanRestart.delete(localQuery.id);
        const baseVersion = this.querySetVersion;
        const newVersion = this.querySetVersion + 1;
        const remove = {
          type: "Remove",
          queryId: localQuery.id
        };
        if (this.paused) {
          if (this.pendingQuerySetModifications.has(localQuery.id)) {
            this.pendingQuerySetModifications.delete(localQuery.id);
          } else {
            this.pendingQuerySetModifications.set(localQuery.id, remove);
          }
        } else {
          this.querySetVersion = newVersion;
        }
        return {
          type: "ModifyQuerySet",
          baseVersion,
          newVersion,
          modifications: [remove]
        };
      }
    }
  };

  // node_modules/convex/dist/esm/browser/sync/request_manager.js
  var __defProp5 = Object.defineProperty;
  var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField4 = (obj, key, value) => __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
  var RequestManager = class {
    constructor(logger, markConnectionStateDirty) {
      this.logger = logger;
      this.markConnectionStateDirty = markConnectionStateDirty;
      __publicField4(this, "inflightRequests");
      __publicField4(this, "requestsOlderThanRestart");
      __publicField4(this, "inflightMutationsCount", 0);
      __publicField4(this, "inflightActionsCount", 0);
      this.inflightRequests = /* @__PURE__ */ new Map();
      this.requestsOlderThanRestart = /* @__PURE__ */ new Set();
    }
    request(message, sent) {
      const result = new Promise((resolve) => {
        const status = sent ? "Requested" : "NotSent";
        this.inflightRequests.set(message.requestId, {
          message,
          status: { status, requestedAt: /* @__PURE__ */ new Date(), onResult: resolve }
        });
        if (message.type === "Mutation") {
          this.inflightMutationsCount++;
        } else if (message.type === "Action") {
          this.inflightActionsCount++;
        }
      });
      this.markConnectionStateDirty();
      return result;
    }
    /**
     * Update the state after receiving a response.
     *
     * @returns A RequestId if the request is complete and its optimistic update
     * can be dropped, null otherwise.
     */
    onResponse(response) {
      const requestInfo = this.inflightRequests.get(response.requestId);
      if (requestInfo === void 0) {
        return null;
      }
      if (requestInfo.status.status === "Completed") {
        return null;
      }
      const udfType = requestInfo.message.type === "Mutation" ? "mutation" : "action";
      const udfPath = requestInfo.message.udfPath;
      for (const line of response.logLines) {
        logForFunction(this.logger, "info", udfType, udfPath, line);
      }
      const status = requestInfo.status;
      let result;
      let onResolve;
      if (response.success) {
        result = {
          success: true,
          logLines: response.logLines,
          value: jsonToConvex(response.result)
        };
        onResolve = () => status.onResult(result);
      } else {
        const errorMessage = response.result;
        const { errorData } = response;
        logForFunction(this.logger, "error", udfType, udfPath, errorMessage);
        result = {
          success: false,
          errorMessage,
          errorData: errorData !== void 0 ? jsonToConvex(errorData) : void 0,
          logLines: response.logLines
        };
        onResolve = () => status.onResult(result);
      }
      if (response.type === "ActionResponse" || !response.success) {
        onResolve();
        this.inflightRequests.delete(response.requestId);
        this.requestsOlderThanRestart.delete(response.requestId);
        if (requestInfo.message.type === "Action") {
          this.inflightActionsCount--;
        } else if (requestInfo.message.type === "Mutation") {
          this.inflightMutationsCount--;
        }
        this.markConnectionStateDirty();
        return { requestId: response.requestId, result };
      }
      requestInfo.status = {
        status: "Completed",
        result,
        ts: response.ts,
        onResolve
      };
      return null;
    }
    // Remove and returns completed requests.
    removeCompleted(ts) {
      const completeRequests = /* @__PURE__ */ new Map();
      for (const [requestId, requestInfo] of this.inflightRequests.entries()) {
        const status = requestInfo.status;
        if (status.status === "Completed" && status.ts.lessThanOrEqual(ts)) {
          status.onResolve();
          completeRequests.set(requestId, status.result);
          if (requestInfo.message.type === "Mutation") {
            this.inflightMutationsCount--;
          } else if (requestInfo.message.type === "Action") {
            this.inflightActionsCount--;
          }
          this.inflightRequests.delete(requestId);
          this.requestsOlderThanRestart.delete(requestId);
        }
      }
      if (completeRequests.size > 0) {
        this.markConnectionStateDirty();
      }
      return completeRequests;
    }
    restart() {
      this.requestsOlderThanRestart = new Set(this.inflightRequests.keys());
      const allMessages = [];
      for (const [requestId, value] of this.inflightRequests) {
        if (value.status.status === "NotSent") {
          value.status.status = "Requested";
          allMessages.push(value.message);
          continue;
        }
        if (value.message.type === "Mutation") {
          allMessages.push(value.message);
        } else if (value.message.type === "Action") {
          this.inflightRequests.delete(requestId);
          this.requestsOlderThanRestart.delete(requestId);
          this.inflightActionsCount--;
          if (value.status.status === "Completed") {
            throw new Error("Action should never be in 'Completed' state");
          }
          value.status.onResult({
            success: false,
            errorMessage: "Connection lost while action was in flight",
            logLines: []
          });
        }
      }
      this.markConnectionStateDirty();
      return allMessages;
    }
    resume() {
      const allMessages = [];
      for (const [, value] of this.inflightRequests) {
        if (value.status.status === "NotSent") {
          value.status.status = "Requested";
          allMessages.push(value.message);
          continue;
        }
      }
      return allMessages;
    }
    /**
     * @returns true if there are any requests that have been requested but have
     * not be completed yet.
     */
    hasIncompleteRequests() {
      for (const requestInfo of this.inflightRequests.values()) {
        if (requestInfo.status.status === "Requested") {
          return true;
        }
      }
      return false;
    }
    /**
     * @returns true if there are any inflight requests, including ones that have
     * completed on the server, but have not been applied.
     */
    hasInflightRequests() {
      return this.inflightRequests.size > 0;
    }
    /**
     * @returns true if there are any inflight requests, that have been hanging around
     * since prior to the most recent restart.
     */
    hasSyncedPastLastReconnect() {
      return this.requestsOlderThanRestart.size === 0;
    }
    timeOfOldestInflightRequest() {
      if (this.inflightRequests.size === 0) {
        return null;
      }
      let oldestInflightRequest = Date.now();
      for (const request of this.inflightRequests.values()) {
        if (request.status.status !== "Completed") {
          if (request.status.requestedAt.getTime() < oldestInflightRequest) {
            oldestInflightRequest = request.status.requestedAt.getTime();
          }
        }
      }
      return new Date(oldestInflightRequest);
    }
    /**
     * @returns The number of mutations currently in flight.
     */
    inflightMutations() {
      return this.inflightMutationsCount;
    }
    /**
     * @returns The number of actions currently in flight.
     */
    inflightActions() {
      return this.inflightActionsCount;
    }
  };

  // node_modules/convex/dist/esm/server/functionName.js
  var functionName = Symbol.for("functionName");

  // node_modules/convex/dist/esm/server/components/paths.js
  var toReferencePath = Symbol.for("toReferencePath");
  function extractReferencePath(reference) {
    var _a2;
    return (_a2 = reference[toReferencePath]) != null ? _a2 : null;
  }
  function isFunctionHandle(s) {
    return s.startsWith("function://");
  }
  function getFunctionAddress(functionReference) {
    let functionAddress;
    if (typeof functionReference === "string") {
      if (isFunctionHandle(functionReference)) {
        functionAddress = { functionHandle: functionReference };
      } else {
        functionAddress = { name: functionReference };
      }
    } else if (functionReference[functionName]) {
      functionAddress = { name: functionReference[functionName] };
    } else {
      const referencePath = extractReferencePath(functionReference);
      if (!referencePath) {
        throw new Error(`${functionReference} is not a functionReference`);
      }
      functionAddress = { reference: referencePath };
    }
    return functionAddress;
  }

  // node_modules/convex/dist/esm/server/api.js
  function getFunctionName(functionReference) {
    const address = getFunctionAddress(functionReference);
    if (address.name === void 0) {
      if (address.functionHandle !== void 0) {
        throw new Error(
          `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`
        );
      } else if (address.reference !== void 0) {
        throw new Error(
          `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`
        );
      }
      throw new Error(
        `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`
      );
    }
    if (typeof functionReference === "string") return functionReference;
    const name = functionReference[functionName];
    if (!name) {
      throw new Error(`${functionReference} is not a functionReference`);
    }
    return name;
  }
  function createApi(pathParts = []) {
    const handler = {
      get(_, prop) {
        if (typeof prop === "string") {
          const newParts = [...pathParts, prop];
          return createApi(newParts);
        } else if (prop === functionName) {
          if (pathParts.length < 2) {
            const found = ["api", ...pathParts].join(".");
            throw new Error(
              `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``
            );
          }
          const path = pathParts.slice(0, -1).join("/");
          const exportName = pathParts[pathParts.length - 1];
          if (exportName === "default") {
            return path;
          } else {
            return path + ":" + exportName;
          }
        } else if (prop === Symbol.toStringTag) {
          return "FunctionReference";
        } else {
          return void 0;
        }
      }
    };
    return new Proxy({}, handler);
  }
  var anyApi = createApi();

  // node_modules/convex/dist/esm/browser/sync/optimistic_updates_impl.js
  var __defProp6 = Object.defineProperty;
  var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField5 = (obj, key, value) => __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
  var OptimisticLocalStoreImpl = class _OptimisticLocalStoreImpl {
    constructor(queryResults) {
      __publicField5(this, "queryResults");
      __publicField5(this, "modifiedQueries");
      this.queryResults = queryResults;
      this.modifiedQueries = [];
    }
    getQuery(query, ...args) {
      const queryArgs = parseArgs(args[0]);
      const name = getFunctionName(query);
      const queryResult = this.queryResults.get(
        serializePathAndArgs(name, queryArgs)
      );
      if (queryResult === void 0) {
        return void 0;
      }
      return _OptimisticLocalStoreImpl.queryValue(queryResult.result);
    }
    getAllQueries(query) {
      const queriesWithName = [];
      const name = getFunctionName(query);
      for (const queryResult of this.queryResults.values()) {
        if (queryResult.udfPath === canonicalizeUdfPath(name)) {
          queriesWithName.push({
            args: queryResult.args,
            value: _OptimisticLocalStoreImpl.queryValue(queryResult.result)
          });
        }
      }
      return queriesWithName;
    }
    setQuery(queryReference, args, value) {
      const queryArgs = parseArgs(args);
      const name = getFunctionName(queryReference);
      const queryToken = serializePathAndArgs(name, queryArgs);
      let result;
      if (value === void 0) {
        result = void 0;
      } else {
        result = {
          success: true,
          value,
          // It's an optimistic update, so there are no function logs to show.
          logLines: []
        };
      }
      const query = {
        udfPath: name,
        args: queryArgs,
        result
      };
      this.queryResults.set(queryToken, query);
      this.modifiedQueries.push(queryToken);
    }
    static queryValue(result) {
      if (result === void 0) {
        return void 0;
      } else if (result.success) {
        return result.value;
      } else {
        return void 0;
      }
    }
  };
  var OptimisticQueryResults = class {
    constructor() {
      __publicField5(this, "queryResults");
      __publicField5(this, "optimisticUpdates");
      this.queryResults = /* @__PURE__ */ new Map();
      this.optimisticUpdates = [];
    }
    /**
     * Apply all optimistic updates on top of server query results
     */
    ingestQueryResultsFromServer(serverQueryResults, optimisticUpdatesToDrop) {
      this.optimisticUpdates = this.optimisticUpdates.filter((updateAndId) => {
        return !optimisticUpdatesToDrop.has(updateAndId.mutationId);
      });
      const oldQueryResults = this.queryResults;
      this.queryResults = new Map(serverQueryResults);
      const localStore = new OptimisticLocalStoreImpl(this.queryResults);
      for (const updateAndId of this.optimisticUpdates) {
        updateAndId.update(localStore);
      }
      const changedQueries = [];
      for (const [queryToken, query] of this.queryResults) {
        const oldQuery = oldQueryResults.get(queryToken);
        if (oldQuery === void 0 || oldQuery.result !== query.result) {
          changedQueries.push(queryToken);
        }
      }
      return changedQueries;
    }
    applyOptimisticUpdate(update, mutationId) {
      this.optimisticUpdates.push({
        update,
        mutationId
      });
      const localStore = new OptimisticLocalStoreImpl(this.queryResults);
      update(localStore);
      return localStore.modifiedQueries;
    }
    /**
     * "Raw" with respect to errors vs values, but query results still have
     * optimistic updates applied.
     *
     * @internal
     */
    rawQueryResult(queryToken) {
      const query = this.queryResults.get(queryToken);
      if (query === void 0) {
        return void 0;
      }
      return query.result;
    }
    queryResult(queryToken) {
      const query = this.queryResults.get(queryToken);
      if (query === void 0) {
        return void 0;
      }
      const result = query.result;
      if (result === void 0) {
        return void 0;
      } else if (result.success) {
        return result.value;
      } else {
        if (result.errorData !== void 0) {
          throw forwardData(
            result,
            new ConvexError(
              createHybridErrorStacktrace("query", query.udfPath, result)
            )
          );
        }
        throw new Error(
          createHybridErrorStacktrace("query", query.udfPath, result)
        );
      }
    }
    hasQueryResult(queryToken) {
      return this.queryResults.get(queryToken) !== void 0;
    }
    /**
     * @internal
     */
    queryLogs(queryToken) {
      var _a2;
      const query = this.queryResults.get(queryToken);
      return (_a2 = query == null ? void 0 : query.result) == null ? void 0 : _a2.logLines;
    }
  };

  // node_modules/convex/dist/esm/vendor/long.js
  var __defProp7 = Object.defineProperty;
  var __defNormalProp6 = (obj, key, value) => key in obj ? __defProp7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField6 = (obj, key, value) => __defNormalProp6(obj, typeof key !== "symbol" ? key + "" : key, value);
  var Long = class _Long {
    constructor(low, high) {
      __publicField6(this, "low");
      __publicField6(this, "high");
      __publicField6(this, "__isUnsignedLong__");
      this.low = low | 0;
      this.high = high | 0;
      this.__isUnsignedLong__ = true;
    }
    static isLong(obj) {
      return (obj && obj.__isUnsignedLong__) === true;
    }
    // prettier-ignore
    static fromBytesLE(bytes) {
      return new _Long(
        bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
        bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24
      );
    }
    // prettier-ignore
    toBytesLE() {
      const hi = this.high;
      const lo = this.low;
      return [
        lo & 255,
        lo >>> 8 & 255,
        lo >>> 16 & 255,
        lo >>> 24,
        hi & 255,
        hi >>> 8 & 255,
        hi >>> 16 & 255,
        hi >>> 24
      ];
    }
    static fromNumber(value) {
      if (isNaN(value)) return UZERO;
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
      return new _Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0);
    }
    toString() {
      return (BigInt(this.high) * BigInt(TWO_PWR_32_DBL) + BigInt(this.low)).toString();
    }
    equals(other) {
      if (!_Long.isLong(other)) other = _Long.fromValue(other);
      if (this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
      return this.high === other.high && this.low === other.low;
    }
    notEquals(other) {
      return !this.equals(other);
    }
    comp(other) {
      if (!_Long.isLong(other)) other = _Long.fromValue(other);
      if (this.equals(other)) return 0;
      return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
    }
    lessThanOrEqual(other) {
      return this.comp(
        /* validates */
        other
      ) <= 0;
    }
    static fromValue(val) {
      if (typeof val === "number") return _Long.fromNumber(val);
      return new _Long(val.low, val.high);
    }
  };
  var UZERO = new Long(0, 0);
  var TWO_PWR_16_DBL = 1 << 16;
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  var MAX_UNSIGNED_VALUE = new Long(4294967295 | 0, 4294967295 | 0);

  // node_modules/convex/dist/esm/browser/sync/remote_query_set.js
  var __defProp8 = Object.defineProperty;
  var __defNormalProp7 = (obj, key, value) => key in obj ? __defProp8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField7 = (obj, key, value) => __defNormalProp7(obj, typeof key !== "symbol" ? key + "" : key, value);
  var RemoteQuerySet = class {
    constructor(queryPath, logger) {
      __publicField7(this, "version");
      __publicField7(this, "remoteQuerySet");
      __publicField7(this, "queryPath");
      __publicField7(this, "logger");
      this.version = { querySet: 0, ts: Long.fromNumber(0), identity: 0 };
      this.remoteQuerySet = /* @__PURE__ */ new Map();
      this.queryPath = queryPath;
      this.logger = logger;
    }
    transition(transition) {
      var _a2;
      const start = transition.startVersion;
      if (this.version.querySet !== start.querySet || this.version.ts.notEquals(start.ts) || this.version.identity !== start.identity) {
        throw new Error(
          `Invalid start version: ${start.ts.toString()}:${start.querySet}:${start.identity}, transitioning from ${this.version.ts.toString()}:${this.version.querySet}:${this.version.identity}`
        );
      }
      for (const modification of transition.modifications) {
        switch (modification.type) {
          case "QueryUpdated": {
            const queryPath = this.queryPath(modification.queryId);
            if (queryPath) {
              for (const line of modification.logLines) {
                logForFunction(this.logger, "info", "query", queryPath, line);
              }
            }
            const value = jsonToConvex((_a2 = modification.value) != null ? _a2 : null);
            this.remoteQuerySet.set(modification.queryId, {
              success: true,
              value,
              logLines: modification.logLines
            });
            break;
          }
          case "QueryFailed": {
            const queryPath = this.queryPath(modification.queryId);
            if (queryPath) {
              for (const line of modification.logLines) {
                logForFunction(this.logger, "info", "query", queryPath, line);
              }
            }
            const { errorData } = modification;
            this.remoteQuerySet.set(modification.queryId, {
              success: false,
              errorMessage: modification.errorMessage,
              errorData: errorData !== void 0 ? jsonToConvex(errorData) : void 0,
              logLines: modification.logLines
            });
            break;
          }
          case "QueryRemoved": {
            this.remoteQuerySet.delete(modification.queryId);
            break;
          }
          default: {
            modification;
            throw new Error(`Invalid modification ${modification.type}`);
          }
        }
      }
      this.version = transition.endVersion;
    }
    remoteQueryResults() {
      return this.remoteQuerySet;
    }
    timestamp() {
      return this.version.ts;
    }
  };

  // node_modules/convex/dist/esm/browser/sync/protocol.js
  function u64ToLong(encoded) {
    const integerBytes = base64_exports.toByteArray(encoded);
    return Long.fromBytesLE(Array.from(integerBytes));
  }
  function longToU64(raw) {
    const integerBytes = new Uint8Array(raw.toBytesLE());
    return base64_exports.fromByteArray(integerBytes);
  }
  function parseServerMessage(encoded) {
    switch (encoded.type) {
      case "FatalError":
      case "AuthError":
      case "ActionResponse":
      case "TransitionChunk":
      case "Ping": {
        return { ...encoded };
      }
      case "MutationResponse": {
        if (encoded.success) {
          return { ...encoded, ts: u64ToLong(encoded.ts) };
        } else {
          return { ...encoded };
        }
      }
      case "Transition": {
        return {
          ...encoded,
          startVersion: {
            ...encoded.startVersion,
            ts: u64ToLong(encoded.startVersion.ts)
          },
          endVersion: {
            ...encoded.endVersion,
            ts: u64ToLong(encoded.endVersion.ts)
          }
        };
      }
      default: {
        encoded;
      }
    }
    return void 0;
  }
  function encodeClientMessage(message) {
    switch (message.type) {
      case "Authenticate":
      case "ModifyQuerySet":
      case "Mutation":
      case "Action":
      case "Event": {
        return { ...message };
      }
      case "Connect": {
        if (message.maxObservedTimestamp !== void 0) {
          return {
            ...message,
            maxObservedTimestamp: longToU64(message.maxObservedTimestamp)
          };
        } else {
          return { ...message, maxObservedTimestamp: void 0 };
        }
      }
      default: {
        message;
      }
    }
    return void 0;
  }

  // node_modules/convex/dist/esm/browser/sync/web_socket_manager.js
  var __defProp9 = Object.defineProperty;
  var __defNormalProp8 = (obj, key, value) => key in obj ? __defProp9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField8 = (obj, key, value) => __defNormalProp8(obj, typeof key !== "symbol" ? key + "" : key, value);
  var CLOSE_NORMAL = 1e3;
  var CLOSE_GOING_AWAY = 1001;
  var CLOSE_NO_STATUS = 1005;
  var CLOSE_NOT_FOUND = 4040;
  var firstTime;
  function monotonicMillis() {
    if (firstTime === void 0) {
      firstTime = Date.now();
    }
    if (typeof performance === "undefined" || !performance.now) {
      return Date.now();
    }
    return Math.round(firstTime + performance.now());
  }
  function prettyNow() {
    return `t=${Math.round((monotonicMillis() - firstTime) / 100) / 10}s`;
  }
  var serverDisconnectErrors = {
    // A known error, e.g. during a restart or push
    InternalServerError: { timeout: 1e3 },
    // ErrorMetadata::overloaded() messages that we realy should back off
    SubscriptionsWorkerFullError: { timeout: 3e3 },
    TooManyConcurrentRequests: { timeout: 3e3 },
    CommitterFullError: { timeout: 3e3 },
    AwsTooManyRequestsException: { timeout: 3e3 },
    ExecuteFullError: { timeout: 3e3 },
    SystemTimeoutError: { timeout: 3e3 },
    ExpiredInQueue: { timeout: 3e3 },
    // ErrorMetadata::feature_temporarily_unavailable() that typically indicate a deploy just happened
    VectorIndexesUnavailable: { timeout: 1e3 },
    SearchIndexesUnavailable: { timeout: 1e3 },
    TableSummariesUnavailable: { timeout: 1e3 },
    // More ErrorMetadata::overloaded()
    VectorIndexTooLarge: { timeout: 3e3 },
    SearchIndexTooLarge: { timeout: 3e3 },
    TooManyWritesInTimePeriod: { timeout: 3e3 }
  };
  function classifyDisconnectError(s) {
    if (s === void 0) return "Unknown";
    for (const prefix of Object.keys(
      serverDisconnectErrors
    )) {
      if (s.startsWith(prefix)) {
        return prefix;
      }
    }
    return "Unknown";
  }
  var WebSocketManager = class {
    constructor(uri, callbacks, webSocketConstructor, logger, markConnectionStateDirty, debug) {
      this.markConnectionStateDirty = markConnectionStateDirty;
      this.debug = debug;
      __publicField8(this, "socket");
      __publicField8(this, "connectionCount");
      __publicField8(this, "_hasEverConnected", false);
      __publicField8(this, "lastCloseReason");
      __publicField8(this, "transitionChunkBuffer", null);
      __publicField8(this, "defaultInitialBackoff");
      __publicField8(this, "maxBackoff");
      __publicField8(this, "retries");
      __publicField8(this, "serverInactivityThreshold");
      __publicField8(this, "reconnectDueToServerInactivityTimeout");
      __publicField8(this, "scheduledReconnect", null);
      __publicField8(this, "networkOnlineHandler", null);
      __publicField8(this, "pendingNetworkRecoveryInfo", null);
      __publicField8(this, "uri");
      __publicField8(this, "onOpen");
      __publicField8(this, "onResume");
      __publicField8(this, "onMessage");
      __publicField8(this, "webSocketConstructor");
      __publicField8(this, "logger");
      __publicField8(this, "onServerDisconnectError");
      this.webSocketConstructor = webSocketConstructor;
      this.socket = { state: "disconnected" };
      this.connectionCount = 0;
      this.lastCloseReason = "InitialConnect";
      this.defaultInitialBackoff = 1e3;
      this.maxBackoff = 16e3;
      this.retries = 0;
      this.serverInactivityThreshold = 6e4;
      this.reconnectDueToServerInactivityTimeout = null;
      this.uri = uri;
      this.onOpen = callbacks.onOpen;
      this.onResume = callbacks.onResume;
      this.onMessage = callbacks.onMessage;
      this.onServerDisconnectError = callbacks.onServerDisconnectError;
      this.logger = logger;
      this.setupNetworkListener();
      this.connect();
    }
    setSocketState(state) {
      this.socket = state;
      this._logVerbose(
        `socket state changed: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}`
      );
      this.markConnectionStateDirty();
    }
    setupNetworkListener() {
      if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
        return;
      }
      if (this.networkOnlineHandler !== null) {
        return;
      }
      this.networkOnlineHandler = () => {
        this._logVerbose("network online event detected");
        this.tryReconnectImmediately();
      };
      window.addEventListener("online", this.networkOnlineHandler);
      this._logVerbose("network online event listener registered");
    }
    cleanupNetworkListener() {
      if (this.networkOnlineHandler && typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("online", this.networkOnlineHandler);
        this.networkOnlineHandler = null;
        this._logVerbose("network online event listener removed");
      }
    }
    assembleTransition(chunk) {
      if (chunk.partNumber < 0 || chunk.partNumber >= chunk.totalParts || chunk.totalParts === 0 || this.transitionChunkBuffer && (this.transitionChunkBuffer.totalParts !== chunk.totalParts || this.transitionChunkBuffer.transitionId !== chunk.transitionId)) {
        this.transitionChunkBuffer = null;
        throw new Error("Invalid TransitionChunk");
      }
      if (this.transitionChunkBuffer === null) {
        this.transitionChunkBuffer = {
          chunks: [],
          totalParts: chunk.totalParts,
          transitionId: chunk.transitionId
        };
      }
      if (chunk.partNumber !== this.transitionChunkBuffer.chunks.length) {
        const expectedLength = this.transitionChunkBuffer.chunks.length;
        this.transitionChunkBuffer = null;
        throw new Error(
          `TransitionChunk received out of order: expected part ${expectedLength}, got ${chunk.partNumber}`
        );
      }
      this.transitionChunkBuffer.chunks.push(chunk.chunk);
      if (this.transitionChunkBuffer.chunks.length === chunk.totalParts) {
        const fullJson = this.transitionChunkBuffer.chunks.join("");
        this.transitionChunkBuffer = null;
        const transition = parseServerMessage(JSON.parse(fullJson));
        if (transition.type !== "Transition") {
          throw new Error(
            `Expected Transition, got ${transition.type} after assembling chunks`
          );
        }
        return transition;
      }
      return null;
    }
    connect() {
      if (this.socket.state === "terminated") {
        return;
      }
      if (this.socket.state !== "disconnected" && this.socket.state !== "stopped") {
        throw new Error(
          "Didn't start connection from disconnected state: " + this.socket.state
        );
      }
      const ws = new this.webSocketConstructor(this.uri);
      this._logVerbose("constructed WebSocket");
      this.setSocketState({
        state: "connecting",
        ws,
        paused: "no"
      });
      this.resetServerInactivityTimeout();
      ws.onopen = () => {
        this.logger.logVerbose("begin ws.onopen");
        if (this.socket.state !== "connecting") {
          throw new Error("onopen called with socket not in connecting state");
        }
        this.setSocketState({
          state: "ready",
          ws,
          paused: this.socket.paused === "yes" ? "uninitialized" : "no"
        });
        this.resetServerInactivityTimeout();
        if (this.socket.paused === "no") {
          this._hasEverConnected = true;
          this.onOpen({
            connectionCount: this.connectionCount,
            lastCloseReason: this.lastCloseReason,
            clientTs: monotonicMillis()
          });
        }
        if (this.lastCloseReason !== "InitialConnect") {
          if (this.lastCloseReason) {
            this.logger.log(
              "WebSocket reconnected at",
              prettyNow(),
              "after disconnect due to",
              this.lastCloseReason
            );
          } else {
            this.logger.log("WebSocket reconnected at", prettyNow());
          }
        }
        this.connectionCount += 1;
        this.lastCloseReason = null;
        if (this.pendingNetworkRecoveryInfo !== null) {
          const { timeSavedMs } = this.pendingNetworkRecoveryInfo;
          this.pendingNetworkRecoveryInfo = null;
          this.sendMessage({
            type: "Event",
            eventType: "NetworkRecoveryReconnect",
            event: { timeSavedMs }
          });
          this.logger.log(
            `Network recovery reconnect saved ~${Math.round(timeSavedMs / 1e3)}s of waiting`
          );
        }
      };
      ws.onerror = (error) => {
        this.transitionChunkBuffer = null;
        const message = error.message;
        if (message) {
          this.logger.log(`WebSocket error message: ${message}`);
        }
      };
      ws.onmessage = (message) => {
        this.resetServerInactivityTimeout();
        const messageLength = message.data.length;
        let serverMessage = parseServerMessage(JSON.parse(message.data));
        this._logVerbose(`received ws message with type ${serverMessage.type}`);
        if (serverMessage.type === "Ping") {
          return;
        }
        if (serverMessage.type === "TransitionChunk") {
          const transition = this.assembleTransition(serverMessage);
          if (!transition) {
            return;
          }
          serverMessage = transition;
          this._logVerbose(
            `assembled full ws message of type ${serverMessage.type}`
          );
        }
        if (this.transitionChunkBuffer !== null) {
          this.transitionChunkBuffer = null;
          this.logger.log(
            `Received unexpected ${serverMessage.type} while buffering TransitionChunks`
          );
        }
        if (serverMessage.type === "Transition") {
          this.reportLargeTransition({
            messageLength,
            transition: serverMessage
          });
        }
        const response = this.onMessage(serverMessage);
        if (response.hasSyncedPastLastReconnect) {
          this.retries = 0;
          this.markConnectionStateDirty();
        }
      };
      ws.onclose = (event) => {
        this._logVerbose("begin ws.onclose");
        this.transitionChunkBuffer = null;
        if (this.lastCloseReason === null) {
          this.lastCloseReason = event.reason || `closed with code ${event.code}`;
        }
        if (event.code !== CLOSE_NORMAL && event.code !== CLOSE_GOING_AWAY && // This commonly gets fired on mobile apps when the app is backgrounded
        event.code !== CLOSE_NO_STATUS && event.code !== CLOSE_NOT_FOUND) {
          let msg = `WebSocket closed with code ${event.code}`;
          if (event.reason) {
            msg += `: ${event.reason}`;
          }
          this.logger.log(msg);
          if (this.onServerDisconnectError && event.reason) {
            this.onServerDisconnectError(msg);
          }
        }
        const reason = classifyDisconnectError(event.reason);
        this.scheduleReconnect(reason);
        return;
      };
    }
    /**
     * @returns The state of the {@link Socket}.
     */
    socketState() {
      return this.socket.state;
    }
    /**
     * @param message - A ClientMessage to send.
     * @returns Whether the message (might have been) sent.
     */
    sendMessage(message) {
      const messageForLog = {
        type: message.type,
        ...message.type === "Authenticate" && message.tokenType === "User" ? {
          value: `...${message.value.slice(-7)}`
        } : {}
      };
      if (this.socket.state === "ready" && this.socket.paused === "no") {
        const encodedMessage = encodeClientMessage(message);
        const request = JSON.stringify(encodedMessage);
        let sent = false;
        try {
          this.socket.ws.send(request);
          sent = true;
        } catch (error) {
          this.logger.log(
            `Failed to send message on WebSocket, reconnecting: ${error}`
          );
          this.closeAndReconnect("FailedToSendMessage");
        }
        this._logVerbose(
          `${sent ? "sent" : "failed to send"} message with type ${message.type}: ${JSON.stringify(
            messageForLog
          )}`
        );
        return true;
      }
      this._logVerbose(
        `message not sent (socket state: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}): ${JSON.stringify(
          messageForLog
        )}`
      );
      return false;
    }
    resetServerInactivityTimeout() {
      if (this.socket.state === "terminated") {
        return;
      }
      if (this.reconnectDueToServerInactivityTimeout !== null) {
        clearTimeout(this.reconnectDueToServerInactivityTimeout);
        this.reconnectDueToServerInactivityTimeout = null;
      }
      this.reconnectDueToServerInactivityTimeout = setTimeout(() => {
        this.closeAndReconnect("InactiveServer");
      }, this.serverInactivityThreshold);
    }
    scheduleReconnect(reason) {
      if (this.scheduledReconnect) {
        clearTimeout(this.scheduledReconnect.timeout);
        this.scheduledReconnect = null;
      }
      this.socket = { state: "disconnected" };
      const backoff = this.nextBackoff(reason);
      this.markConnectionStateDirty();
      this.logger.log(`Attempting reconnect in ${Math.round(backoff)}ms`);
      const scheduledAt = monotonicMillis();
      const timeoutId = setTimeout(() => {
        var _a2;
        if (((_a2 = this.scheduledReconnect) == null ? void 0 : _a2.timeout) === timeoutId) {
          this.scheduledReconnect = null;
          this.connect();
        }
      }, backoff);
      this.scheduledReconnect = {
        timeout: timeoutId,
        scheduledAt,
        backoffMs: backoff
      };
    }
    /**
     * Close the WebSocket and schedule a reconnect.
     *
     * This should be used when we hit an error and would like to restart the session.
     */
    closeAndReconnect(closeReason) {
      this._logVerbose(`begin closeAndReconnect with reason ${closeReason}`);
      switch (this.socket.state) {
        case "disconnected":
        case "terminated":
        case "stopped":
          return;
        case "connecting":
        case "ready": {
          this.lastCloseReason = closeReason;
          void this.close();
          this.scheduleReconnect("client");
          return;
        }
        default: {
          this.socket;
        }
      }
    }
    /**
     * Close the WebSocket, being careful to clear the onclose handler to avoid re-entrant
     * calls. Use this instead of directly calling `ws.close()`
     *
     * It is the callers responsibility to update the state after this method is called so that the
     * closed socket is not accessible or used again after this method is called
     */
    close() {
      this.transitionChunkBuffer = null;
      switch (this.socket.state) {
        case "disconnected":
        case "terminated":
        case "stopped":
          return Promise.resolve();
        case "connecting": {
          const ws = this.socket.ws;
          ws.onmessage = (_message) => {
            this._logVerbose("Ignoring message received after close");
          };
          return new Promise((r) => {
            ws.onclose = () => {
              this._logVerbose("Closed after connecting");
              r();
            };
            ws.onopen = () => {
              this._logVerbose("Opened after connecting");
              ws.close();
            };
          });
        }
        case "ready": {
          this._logVerbose("ws.close called");
          const ws = this.socket.ws;
          ws.onmessage = (_message) => {
            this._logVerbose("Ignoring message received after close");
          };
          const result = new Promise((r) => {
            ws.onclose = () => {
              r();
            };
          });
          ws.close();
          return result;
        }
        default: {
          this.socket;
          return Promise.resolve();
        }
      }
    }
    /**
     * Close the WebSocket and do not reconnect.
     * @returns A Promise that resolves when the WebSocket `onClose` callback is called.
     */
    terminate() {
      if (this.reconnectDueToServerInactivityTimeout) {
        clearTimeout(this.reconnectDueToServerInactivityTimeout);
      }
      if (this.scheduledReconnect) {
        clearTimeout(this.scheduledReconnect.timeout);
        this.scheduledReconnect = null;
      }
      this.cleanupNetworkListener();
      switch (this.socket.state) {
        case "terminated":
        case "stopped":
        case "disconnected":
        case "connecting":
        case "ready": {
          const result = this.close();
          this.setSocketState({ state: "terminated" });
          return result;
        }
        default: {
          this.socket;
          throw new Error(
            `Invalid websocket state: ${this.socket.state}`
          );
        }
      }
    }
    stop() {
      switch (this.socket.state) {
        case "terminated":
          return Promise.resolve();
        case "connecting":
        case "stopped":
        case "disconnected":
        case "ready": {
          this.cleanupNetworkListener();
          const result = this.close();
          this.socket = { state: "stopped" };
          return result;
        }
        default: {
          this.socket;
          return Promise.resolve();
        }
      }
    }
    /**
     * Create a new WebSocket after a previous `stop()`, unless `terminate()` was
     * called before.
     */
    tryRestart() {
      switch (this.socket.state) {
        case "stopped":
          break;
        case "terminated":
        case "connecting":
        case "ready":
        case "disconnected":
          this.logger.logVerbose("Restart called without stopping first");
          return;
        default: {
          this.socket;
        }
      }
      this.setupNetworkListener();
      this.connect();
    }
    pause() {
      switch (this.socket.state) {
        case "disconnected":
        case "stopped":
        case "terminated":
          return;
        case "connecting":
        case "ready": {
          this.socket = { ...this.socket, paused: "yes" };
          return;
        }
        default: {
          this.socket;
          return;
        }
      }
    }
    /**
     * Try to reconnect immediately, canceling any scheduled reconnect.
     * This is useful when detecting network recovery.
     * Only takes action if we're in disconnected state (waiting to reconnect).
     */
    tryReconnectImmediately() {
      this._logVerbose("tryReconnectImmediately called");
      if (this.socket.state !== "disconnected") {
        this._logVerbose(
          `tryReconnectImmediately called but socket state is ${this.socket.state}, no action taken`
        );
        return;
      }
      let timeSavedMs = null;
      if (this.scheduledReconnect) {
        const elapsed = monotonicMillis() - this.scheduledReconnect.scheduledAt;
        timeSavedMs = Math.max(0, this.scheduledReconnect.backoffMs - elapsed);
        this._logVerbose(
          `would have waited ${Math.round(timeSavedMs)}ms more (backoff was ${Math.round(this.scheduledReconnect.backoffMs)}ms, elapsed ${Math.round(elapsed)}ms)`
        );
        clearTimeout(this.scheduledReconnect.timeout);
        this.scheduledReconnect = null;
        this._logVerbose("canceled scheduled reconnect");
      }
      this.logger.log("Network recovery detected, reconnecting immediately");
      this.pendingNetworkRecoveryInfo = timeSavedMs !== null ? { timeSavedMs } : null;
      this.connect();
    }
    /**
     * Resume the state machine if previously paused.
     */
    resume() {
      switch (this.socket.state) {
        case "connecting":
          this.socket = { ...this.socket, paused: "no" };
          return;
        case "ready":
          if (this.socket.paused === "uninitialized") {
            this.socket = { ...this.socket, paused: "no" };
            this._hasEverConnected = true;
            this.onOpen({
              connectionCount: this.connectionCount,
              lastCloseReason: this.lastCloseReason,
              clientTs: monotonicMillis()
            });
          } else if (this.socket.paused === "yes") {
            this.socket = { ...this.socket, paused: "no" };
            this.onResume();
          }
          return;
        case "terminated":
        case "stopped":
        case "disconnected":
          return;
        default: {
          this.socket;
        }
      }
      this.connect();
    }
    connectionState() {
      return {
        isConnected: this.socket.state === "ready",
        hasEverConnected: this._hasEverConnected,
        connectionCount: this.connectionCount,
        connectionRetries: this.retries
      };
    }
    _logVerbose(message) {
      this.logger.logVerbose(message);
    }
    nextBackoff(reason) {
      const initialBackoff = reason === "client" ? 100 : reason === "Unknown" ? this.defaultInitialBackoff : serverDisconnectErrors[reason].timeout;
      const baseBackoff = initialBackoff * Math.pow(2, this.retries);
      this.retries += 1;
      const actualBackoff = Math.min(baseBackoff, this.maxBackoff);
      const jitter = actualBackoff * (Math.random() - 0.5);
      return actualBackoff + jitter;
    }
    reportLargeTransition({
      transition,
      messageLength
    }) {
      if (transition.clientClockSkew === void 0 || transition.serverTs === void 0) {
        return;
      }
      const transitionTransitTime = monotonicMillis() - // client time now
      // clientClockSkew = (server time + upstream latency) - client time
      // clientClockSkew is "how many milliseconds behind (slow) is the client clock"
      // but the latency of the Connect message inflates this, making it appear further behind
      transition.clientClockSkew - transition.serverTs / 1e6;
      const prettyTransitionTime = `${Math.round(transitionTransitTime)}ms`;
      const prettyMessageMB = `${Math.round(messageLength / 1e4) / 100}MB`;
      const bytesPerSecond = messageLength / (transitionTransitTime / 1e3);
      const prettyBytesPerSecond = `${Math.round(bytesPerSecond / 1e4) / 100}MB per second`;
      this._logVerbose(
        `received ${prettyMessageMB} transition in ${prettyTransitionTime} at ${prettyBytesPerSecond}`
      );
      if (messageLength > 2e7) {
        this.logger.log(
          `received query results totaling more that 20MB (${prettyMessageMB}) which will take a long time to download on slower connections`
        );
      } else if (transitionTransitTime > 2e4) {
        this.logger.log(
          `received query results totaling ${prettyMessageMB} which took more than 20s to arrive (${prettyTransitionTime})`
        );
      }
      if (this.debug) {
        this.sendMessage({
          type: "Event",
          eventType: "ClientReceivedTransition",
          event: { transitionTransitTime, messageLength }
        });
      }
    }
  };

  // node_modules/convex/dist/esm/browser/sync/session.js
  function newSessionId() {
    return uuidv4();
  }
  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v2 = c === "x" ? r : r & 3 | 8;
      return v2.toString(16);
    });
  }

  // node_modules/convex/dist/esm/vendor/jwt-decode/index.js
  var InvalidTokenError = class extends Error {
  };
  InvalidTokenError.prototype.name = "InvalidTokenError";
  function b64DecodeUnicode(str) {
    return decodeURIComponent(
      atob(str).replace(/(.)/g, (_m, p) => {
        let code2 = p.charCodeAt(0).toString(16).toUpperCase();
        if (code2.length < 2) {
          code2 = "0" + code2;
        }
        return "%" + code2;
      })
    );
  }
  function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("base64 string is not of the correct length");
    }
    try {
      return b64DecodeUnicode(output);
    } catch {
      return atob(output);
    }
  }
  function jwtDecode(token, options) {
    if (typeof token !== "string") {
      throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
      throw new InvalidTokenError(
        `Invalid token specified: missing part #${pos + 1}`
      );
    }
    let decoded;
    try {
      decoded = base64UrlDecode(part);
    } catch (e) {
      throw new InvalidTokenError(
        `Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`
      );
    }
    try {
      return JSON.parse(decoded);
    } catch (e) {
      throw new InvalidTokenError(
        `Invalid token specified: invalid json for part #${pos + 1} (${e.message})`
      );
    }
  }

  // node_modules/convex/dist/esm/browser/sync/authentication_manager.js
  var __defProp10 = Object.defineProperty;
  var __defNormalProp9 = (obj, key, value) => key in obj ? __defProp10(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField9 = (obj, key, value) => __defNormalProp9(obj, typeof key !== "symbol" ? key + "" : key, value);
  var MAXIMUM_REFRESH_DELAY = 20 * 24 * 60 * 60 * 1e3;
  var MAX_TOKEN_CONFIRMATION_ATTEMPTS = 2;
  var AuthenticationManager = class {
    constructor(syncState, callbacks, config) {
      __publicField9(this, "authState", { state: "noAuth" });
      __publicField9(this, "configVersion", 0);
      __publicField9(this, "syncState");
      __publicField9(this, "authenticate");
      __publicField9(this, "stopSocket");
      __publicField9(this, "tryRestartSocket");
      __publicField9(this, "pauseSocket");
      __publicField9(this, "resumeSocket");
      __publicField9(this, "clearAuth");
      __publicField9(this, "logger");
      __publicField9(this, "refreshTokenLeewaySeconds");
      __publicField9(this, "initialAuthTokenReuse");
      __publicField9(this, "lastRefreshChange");
      __publicField9(this, "tokenConfirmationAttempts", 0);
      this.syncState = syncState;
      this.authenticate = callbacks.authenticate;
      this.stopSocket = callbacks.stopSocket;
      this.tryRestartSocket = callbacks.tryRestartSocket;
      this.pauseSocket = callbacks.pauseSocket;
      this.resumeSocket = callbacks.resumeSocket;
      this.clearAuth = callbacks.clearAuth;
      this.logger = config.logger;
      this.refreshTokenLeewaySeconds = config.refreshTokenLeewaySeconds;
      this.initialAuthTokenReuse = config.initialAuthTokenReuse;
      this.lastRefreshChange = false;
    }
    notifyRefreshChange(isRefreshing) {
      if (this.authState.state !== "noAuth" && this.authState.state !== "initialRefetch" && this.authState.config.onRefreshChange && this.lastRefreshChange !== isRefreshing) {
        this.lastRefreshChange = isRefreshing;
        this.authState.config.onRefreshChange(isRefreshing);
      }
    }
    async setConfig(fetchToken, onChange, onRefreshChange) {
      this.resetAuthState();
      this._logVerbose("pausing WS for auth token fetch");
      this.pauseSocket();
      const token = await this.fetchTokenAndGuardAgainstRace(fetchToken, {
        forceRefreshToken: false
      });
      if (token.isFromOutdatedConfig) {
        return;
      }
      const config = {
        fetchToken,
        onAuthChange: onChange,
        onRefreshChange
      };
      if (token.value) {
        this.setAuthState({
          state: "waitingForServerConfirmationOfCachedToken",
          config,
          hasRetried: false
        });
        this.authenticate(token.value);
      } else {
        this.setAuthState({
          state: "initialRefetch",
          config
        });
        await this.refetchToken();
      }
      this._logVerbose("resuming WS after auth token fetch");
      this.resumeSocket();
    }
    onTransition(serverMessage) {
      var _a2;
      if (!this.syncState.isCurrentOrNewerAuthVersion(
        serverMessage.endVersion.identity
      )) {
        return;
      }
      if (serverMessage.endVersion.identity <= serverMessage.startVersion.identity) {
        return;
      }
      this._logVerbose(
        `auth state is ${this.authState.state} when handling transition`
      );
      this.syncState.markAuthCompletion();
      if (this.authState.state === "waitingForServerConfirmationOfCachedToken") {
        this._logVerbose("server confirmed auth token is valid");
        const cachedToken = (_a2 = this.syncState.getAuth()) == null ? void 0 : _a2.value;
        if (this.initialAuthTokenReuse && cachedToken) {
          this.scheduleTokenRefetch(cachedToken, serverMessage.clientClockSkew);
        } else {
          void this.refetchToken();
        }
        this.authState.config.onAuthChange(true);
        return;
      }
      if (this.authState.state === "waitingForServerConfirmationOfFreshToken") {
        this._logVerbose("server confirmed new auth token is valid");
        this.notifyRefreshChange(false);
        this.scheduleTokenRefetch(this.authState.token);
        this.tokenConfirmationAttempts = 0;
        if (!this.authState.hadAuth) {
          this.authState.config.onAuthChange(true);
        }
      }
    }
    onAuthError(serverMessage) {
      if (serverMessage.authUpdateAttempted === false && (this.authState.state === "waitingForServerConfirmationOfFreshToken" || this.authState.state === "waitingForServerConfirmationOfCachedToken")) {
        this._logVerbose("ignoring non-auth token expired error");
        return;
      }
      const { baseVersion } = serverMessage;
      if (!this.syncState.isCurrentOrNewerAuthVersion(baseVersion + 1)) {
        this._logVerbose("ignoring auth error for previous auth attempt");
        return;
      }
      void this.tryToReauthenticate(serverMessage);
      return;
    }
    // This is similar to `refetchToken` defined below, in fact we
    // don't represent them as different states, but it is different
    // in that we pause the WebSocket so that mutations
    // don't retry with bad auth.
    async tryToReauthenticate(serverMessage) {
      this._logVerbose(`attempting to reauthenticate: ${serverMessage.error}`);
      if (
        // No way to fetch another token, kaboom
        this.authState.state === "noAuth" || // We failed on a fresh token. After a small number of retries, we give up
        // and clear the auth state to avoid infinite retries.
        this.authState.state === "waitingForServerConfirmationOfFreshToken" && this.tokenConfirmationAttempts >= MAX_TOKEN_CONFIRMATION_ATTEMPTS
      ) {
        this.logger.error(
          `Failed to authenticate: "${serverMessage.error}", check your server auth config`
        );
        if (this.syncState.hasAuth()) {
          this.syncState.clearAuth();
        }
        if (this.authState.state !== "noAuth") {
          this.setAndReportAuthFailed(this.authState.config.onAuthChange);
        }
        return;
      }
      if (this.authState.state === "waitingForServerConfirmationOfFreshToken") {
        this.tokenConfirmationAttempts++;
        this._logVerbose(
          `retrying reauthentication, ${MAX_TOKEN_CONFIRMATION_ATTEMPTS - this.tokenConfirmationAttempts} attempts remaining`
        );
      }
      this.notifyRefreshChange(true);
      await this.stopSocket();
      if (this.authState.state === "noAuth") {
        return;
      }
      const token = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        {
          forceRefreshToken: true
        }
      );
      if (token.isFromOutdatedConfig) {
        return;
      }
      if (token.value && this.syncState.isNewAuth(token.value)) {
        this.authenticate(token.value);
        this.setAuthState({
          state: "waitingForServerConfirmationOfFreshToken",
          config: this.authState.config,
          token: token.value,
          hadAuth: this.authState.state === "notRefetching" || this.authState.state === "waitingForScheduledRefetch"
        });
      } else {
        this._logVerbose("reauthentication failed, could not fetch a new token");
        if (this.syncState.hasAuth()) {
          this.syncState.clearAuth();
        }
        this.setAndReportAuthFailed(this.authState.config.onAuthChange);
      }
      this.tryRestartSocket();
    }
    // Force refetch the token and schedule another refetch
    // before the token expires - an active client should never
    // need to reauthenticate.
    async refetchToken() {
      if (this.authState.state === "noAuth") {
        return;
      }
      this._logVerbose("refetching auth token");
      const token = await this.fetchTokenAndGuardAgainstRace(
        this.authState.config.fetchToken,
        {
          forceRefreshToken: true
        }
      );
      if (token.isFromOutdatedConfig) {
        return;
      }
      if (token.value) {
        if (this.syncState.isNewAuth(token.value)) {
          this.setAuthState({
            state: "waitingForServerConfirmationOfFreshToken",
            hadAuth: this.syncState.hasAuth(),
            token: token.value,
            config: this.authState.config
          });
          this.authenticate(token.value);
        } else {
          this.setAuthState({
            state: "notRefetching",
            config: this.authState.config
          });
        }
      } else {
        this._logVerbose("refetching token failed");
        if (this.syncState.hasAuth()) {
          this.clearAuth();
        }
        this.setAndReportAuthFailed(this.authState.config.onAuthChange);
      }
      this._logVerbose(
        "restarting WS after auth token fetch (if currently stopped)"
      );
      this.tryRestartSocket();
    }
    scheduleTokenRefetch(token, clientClockSkewMs) {
      if (this.authState.state === "noAuth") {
        return;
      }
      const decodedToken = this.decodeToken(token);
      if (!decodedToken) {
        this.logger.error(
          "Auth token is not a valid JWT, cannot refetch the token"
        );
        return;
      }
      const { iat, exp } = decodedToken;
      if (!iat || !exp) {
        this.logger.error(
          "Auth token does not have required fields, cannot refetch the token"
        );
        return;
      }
      const fullLifetimeSeconds = exp - iat;
      if (fullLifetimeSeconds <= 2) {
        this.logger.error(
          "Auth token does not live long enough, cannot refetch the token"
        );
        return;
      }
      let tokenValiditySeconds;
      if (clientClockSkewMs !== void 0) {
        const estimatedServerNowSeconds = (Date.now() - clientClockSkewMs) / 1e3;
        tokenValiditySeconds = exp - estimatedServerNowSeconds;
        if (tokenValiditySeconds <= 0) {
          tokenValiditySeconds = 0;
        }
      } else {
        tokenValiditySeconds = fullLifetimeSeconds;
      }
      let delay = Math.min(
        MAXIMUM_REFRESH_DELAY,
        (tokenValiditySeconds - this.refreshTokenLeewaySeconds) * 1e3
      );
      if (delay <= 0) {
        this.logger.warn(
          `Refetching auth token immediately, configured leeway ${this.refreshTokenLeewaySeconds}s is larger than the token's lifetime ${tokenValiditySeconds}s`
        );
        delay = 0;
      }
      const refetchTokenTimeoutId = setTimeout(() => {
        this._logVerbose("running scheduled token refetch");
        void this.refetchToken();
      }, delay);
      this.setAuthState({
        state: "waitingForScheduledRefetch",
        refetchTokenTimeoutId,
        config: this.authState.config
      });
      this._logVerbose(
        `scheduled preemptive auth token refetching in ${delay}ms`
      );
    }
    // Protects against simultaneous calls to `setConfig`
    // while we're fetching a token
    async fetchTokenAndGuardAgainstRace(fetchToken, fetchArgs) {
      const originalConfigVersion = ++this.configVersion;
      this._logVerbose(
        `fetching token with config version ${originalConfigVersion}`
      );
      const token = await fetchToken(fetchArgs);
      if (this.configVersion !== originalConfigVersion) {
        this._logVerbose(
          `stale config version, expected ${originalConfigVersion}, got ${this.configVersion}`
        );
        return { isFromOutdatedConfig: true };
      }
      return { isFromOutdatedConfig: false, value: token };
    }
    stop() {
      this.resetAuthState();
      this.configVersion++;
      this._logVerbose(`config version bumped to ${this.configVersion}`);
    }
    setAndReportAuthFailed(onAuthChange) {
      onAuthChange(false);
      this.resetAuthState();
    }
    // The sole path to `state === "noAuth"`; consumers rely on this firing
    // `notifyRefreshChange(false)` to pair any in-flight `(true)`. May run
    // when refresh state is already false.
    resetAuthState() {
      this.notifyRefreshChange(false);
      this.setAuthState({ state: "noAuth" });
    }
    setAuthState(newAuth) {
      const authStateForLog = newAuth.state === "waitingForServerConfirmationOfFreshToken" ? {
        hadAuth: newAuth.hadAuth,
        state: newAuth.state,
        token: `...${newAuth.token.slice(-7)}`
      } : { state: newAuth.state };
      this._logVerbose(
        `setting auth state to ${JSON.stringify(authStateForLog)}`
      );
      switch (newAuth.state) {
        case "waitingForScheduledRefetch":
        case "notRefetching":
        case "noAuth":
          this.tokenConfirmationAttempts = 0;
          break;
        case "waitingForServerConfirmationOfFreshToken":
        case "waitingForServerConfirmationOfCachedToken":
        case "initialRefetch":
          break;
        default: {
          newAuth;
        }
      }
      if (this.authState.state === "waitingForScheduledRefetch") {
        clearTimeout(this.authState.refetchTokenTimeoutId);
      }
      this.authState = newAuth;
    }
    decodeToken(token) {
      try {
        return jwtDecode(token);
      } catch (e) {
        this._logVerbose(
          `Error decoding token: ${e instanceof Error ? e.message : "Unknown error"}`
        );
        return null;
      }
    }
    _logVerbose(message) {
      this.logger.logVerbose(`${message} [v${this.configVersion}]`);
    }
  };

  // node_modules/convex/dist/esm/browser/sync/metrics.js
  var markNames = [
    "convexClientConstructed",
    "convexWebSocketOpen",
    "convexFirstMessageReceived"
  ];
  function mark(name, sessionId) {
    const detail = { sessionId };
    if (typeof performance === "undefined" || !performance.mark) return;
    performance.mark(name, { detail });
  }
  function performanceMarkToJson(mark2) {
    let name = mark2.name.slice("convex".length);
    name = name.charAt(0).toLowerCase() + name.slice(1);
    return {
      name,
      startTime: mark2.startTime
    };
  }
  function getMarksReport(sessionId) {
    if (typeof performance === "undefined" || !performance.getEntriesByName) {
      return [];
    }
    const allMarks = [];
    for (const name of markNames) {
      const marks = performance.getEntriesByName(name).filter((entry) => entry.entryType === "mark").filter((mark2) => mark2.detail.sessionId === sessionId);
      allMarks.push(...marks);
    }
    return allMarks.map(performanceMarkToJson);
  }

  // node_modules/convex/dist/esm/browser/sync/client.js
  var __defProp11 = Object.defineProperty;
  var __defNormalProp10 = (obj, key, value) => key in obj ? __defProp11(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField10 = (obj, key, value) => __defNormalProp10(obj, typeof key !== "symbol" ? key + "" : key, value);
  var BaseConvexClient = class {
    /**
     * @param address - The url of your Convex deployment, often provided
     * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
     * @param onTransition - A callback receiving an array of query tokens
     * corresponding to query results that have changed -- additional handlers
     * can be added via `addOnTransitionHandler`.
     * @param options - See {@link BaseConvexClientOptions} for a full description.
     */
    constructor(address, onTransition, options) {
      var _a2, _b2, _c, _d, _e;
      __publicField10(this, "address");
      __publicField10(this, "state");
      __publicField10(this, "requestManager");
      __publicField10(this, "webSocketManager");
      __publicField10(this, "authenticationManager");
      __publicField10(this, "remoteQuerySet");
      __publicField10(this, "optimisticQueryResults");
      __publicField10(this, "_transitionHandlerCounter", 0);
      __publicField10(this, "_nextRequestId");
      __publicField10(this, "_onTransitionFns", /* @__PURE__ */ new Map());
      __publicField10(this, "_sessionId");
      __publicField10(this, "firstMessageReceived", false);
      __publicField10(this, "debug");
      __publicField10(this, "logger");
      __publicField10(this, "maxObservedTimestamp");
      __publicField10(this, "connectionStateSubscribers", /* @__PURE__ */ new Map());
      __publicField10(this, "nextConnectionStateSubscriberId", 0);
      __publicField10(this, "_lastPublishedConnectionState");
      __publicField10(this, "markConnectionStateDirty", () => {
        void Promise.resolve().then(() => {
          const curConnectionState = this.connectionState();
          if (JSON.stringify(curConnectionState) !== JSON.stringify(this._lastPublishedConnectionState)) {
            this._lastPublishedConnectionState = curConnectionState;
            for (const cb of this.connectionStateSubscribers.values()) {
              cb(curConnectionState);
            }
          }
        });
      });
      __publicField10(this, "mark", (name) => {
        if (this.debug) {
          mark(name, this.sessionId);
        }
      });
      if (typeof address === "object") {
        throw new Error(
          "Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly."
        );
      }
      if ((options == null ? void 0 : options.skipConvexDeploymentUrlCheck) !== true) {
        validateDeploymentUrl(address);
      }
      options = { ...options };
      const authRefreshTokenLeewaySeconds = (_a2 = options.authRefreshTokenLeewaySeconds) != null ? _a2 : 10;
      let webSocketConstructor = options.webSocketConstructor;
      if (!webSocketConstructor && typeof WebSocket === "undefined") {
        throw new Error(
          "No WebSocket global variable defined! To use Convex in an environment without WebSocket try the HTTP client: https://docs.convex.dev/api/classes/browser.ConvexHttpClient"
        );
      }
      webSocketConstructor = webSocketConstructor || WebSocket;
      this.debug = (_b2 = options.reportDebugInfoToConvex) != null ? _b2 : false;
      this.address = address;
      this.logger = options.logger === false ? instantiateNoopLogger({ verbose: (_c = options.verbose) != null ? _c : false }) : options.logger !== true && options.logger ? options.logger : instantiateDefaultLogger({ verbose: (_d = options.verbose) != null ? _d : false });
      const i = address.search("://");
      if (i === -1) {
        throw new Error("Provided address was not an absolute URL.");
      }
      const origin = address.substring(i + 3);
      const protocol = address.substring(0, i);
      let wsProtocol;
      if (protocol === "http") {
        wsProtocol = "ws";
      } else if (protocol === "https") {
        wsProtocol = "wss";
      } else {
        throw new Error(`Unknown parent protocol ${protocol}`);
      }
      const wsUri = `${wsProtocol}://${origin}/api/${version}/sync`;
      this.state = new LocalSyncState();
      this.remoteQuerySet = new RemoteQuerySet(
        (queryId) => this.state.queryPath(queryId),
        this.logger
      );
      this.requestManager = new RequestManager(
        this.logger,
        this.markConnectionStateDirty
      );
      const pauseSocket = () => {
        this.webSocketManager.pause();
        this.state.pause();
      };
      this.authenticationManager = new AuthenticationManager(
        this.state,
        {
          authenticate: (token) => {
            const message = this.state.setAuth(token);
            this.webSocketManager.sendMessage(message);
            return message.baseVersion;
          },
          stopSocket: () => this.webSocketManager.stop(),
          tryRestartSocket: () => this.webSocketManager.tryRestart(),
          pauseSocket,
          resumeSocket: () => this.webSocketManager.resume(),
          clearAuth: () => {
            this.clearAuth();
          }
        },
        {
          logger: this.logger,
          refreshTokenLeewaySeconds: authRefreshTokenLeewaySeconds,
          initialAuthTokenReuse: (_e = options.initialAuthTokenReuse) != null ? _e : false
        }
      );
      this.optimisticQueryResults = new OptimisticQueryResults();
      this.addOnTransitionHandler((transition) => {
        onTransition(transition.queries.map((q) => q.token));
      });
      this._nextRequestId = 0;
      this._sessionId = newSessionId();
      const { unsavedChangesWarning } = options;
      if (typeof window === "undefined" || typeof window.addEventListener === "undefined") {
        if (unsavedChangesWarning === true) {
          throw new Error(
            "unsavedChangesWarning requested, but window.addEventListener not found! Remove {unsavedChangesWarning: true} from Convex client options."
          );
        }
      } else if (unsavedChangesWarning !== false) {
        window.addEventListener("beforeunload", (e) => {
          if (this.requestManager.hasIncompleteRequests()) {
            e.preventDefault();
            const confirmationMessage = "Are you sure you want to leave? Your changes may not be saved.";
            (e || window.event).returnValue = confirmationMessage;
            return confirmationMessage;
          }
        });
      }
      this.webSocketManager = new WebSocketManager(
        wsUri,
        {
          onOpen: (reconnectMetadata) => {
            this.mark("convexWebSocketOpen");
            this.webSocketManager.sendMessage({
              ...reconnectMetadata,
              type: "Connect",
              sessionId: this._sessionId,
              maxObservedTimestamp: this.maxObservedTimestamp
            });
            this.remoteQuerySet = new RemoteQuerySet(
              (queryId) => this.state.queryPath(queryId),
              this.logger
            );
            const [querySetModification, authModification] = this.state.restart();
            if (authModification) {
              this.webSocketManager.sendMessage(authModification);
            }
            this.webSocketManager.sendMessage(querySetModification);
            for (const message of this.requestManager.restart()) {
              this.webSocketManager.sendMessage(message);
            }
          },
          onResume: () => {
            const [querySetModification, authModification] = this.state.resume();
            if (authModification) {
              this.webSocketManager.sendMessage(authModification);
            }
            if (querySetModification) {
              this.webSocketManager.sendMessage(querySetModification);
            }
            for (const message of this.requestManager.resume()) {
              this.webSocketManager.sendMessage(message);
            }
          },
          onMessage: (serverMessage) => {
            if (!this.firstMessageReceived) {
              this.firstMessageReceived = true;
              this.mark("convexFirstMessageReceived");
              this.reportMarks();
            }
            switch (serverMessage.type) {
              case "Transition": {
                this.observedTimestamp(serverMessage.endVersion.ts);
                this.authenticationManager.onTransition(serverMessage);
                this.remoteQuerySet.transition(serverMessage);
                this.state.transition(serverMessage);
                const completedRequests = this.requestManager.removeCompleted(
                  this.remoteQuerySet.timestamp()
                );
                this.notifyOnQueryResultChanges(completedRequests);
                break;
              }
              case "MutationResponse": {
                if (serverMessage.success) {
                  this.observedTimestamp(serverMessage.ts);
                }
                const completedMutationInfo = this.requestManager.onResponse(serverMessage);
                if (completedMutationInfo !== null) {
                  this.notifyOnQueryResultChanges(
                    /* @__PURE__ */ new Map([
                      [
                        completedMutationInfo.requestId,
                        completedMutationInfo.result
                      ]
                    ])
                  );
                }
                break;
              }
              case "ActionResponse": {
                this.requestManager.onResponse(serverMessage);
                break;
              }
              case "AuthError": {
                this.authenticationManager.onAuthError(serverMessage);
                break;
              }
              case "FatalError": {
                const error = logFatalError(this.logger, serverMessage.error);
                void this.webSocketManager.terminate();
                throw error;
              }
              default: {
                serverMessage;
              }
            }
            return {
              hasSyncedPastLastReconnect: this.hasSyncedPastLastReconnect()
            };
          },
          onServerDisconnectError: options.onServerDisconnectError
        },
        webSocketConstructor,
        this.logger,
        this.markConnectionStateDirty,
        this.debug
      );
      this.mark("convexClientConstructed");
      if (options.expectAuth) {
        pauseSocket();
      }
    }
    /**
     * Return true if there is outstanding work from prior to the time of the most recent restart.
     * This indicates that the client has not proven itself to have gotten past the issue that
     * potentially led to the restart. Use this to influence when to reset backoff after a failure.
     */
    hasSyncedPastLastReconnect() {
      const hasSyncedPastLastReconnect = this.requestManager.hasSyncedPastLastReconnect() && this.state.hasSyncedPastLastReconnect();
      return hasSyncedPastLastReconnect;
    }
    observedTimestamp(observedTs) {
      if (this.maxObservedTimestamp === void 0 || this.maxObservedTimestamp.lessThanOrEqual(observedTs)) {
        this.maxObservedTimestamp = observedTs;
      }
    }
    getMaxObservedTimestamp() {
      return this.maxObservedTimestamp;
    }
    /**
     * Compute the current query results based on the remoteQuerySet and the
     * current optimistic updates and call `onTransition` for all the changed
     * queries.
     *
     * @param completedMutations - A set of mutation IDs whose optimistic updates
     * are no longer needed.
     */
    notifyOnQueryResultChanges(completedRequests) {
      const remoteQueryResults = this.remoteQuerySet.remoteQueryResults();
      const queryTokenToValue = /* @__PURE__ */ new Map();
      for (const [queryId, result] of remoteQueryResults) {
        const queryToken = this.state.queryToken(queryId);
        if (queryToken !== null) {
          const query = {
            result,
            udfPath: this.state.queryPath(queryId),
            args: this.state.queryArgs(queryId)
          };
          queryTokenToValue.set(queryToken, query);
        }
      }
      const changedQueryTokens = this.optimisticQueryResults.ingestQueryResultsFromServer(
        queryTokenToValue,
        new Set(completedRequests.keys())
      );
      this.handleTransition({
        queries: changedQueryTokens.map((token) => {
          const optimisticResult = this.optimisticQueryResults.rawQueryResult(token);
          return {
            token,
            modification: {
              kind: "Updated",
              result: optimisticResult
            }
          };
        }),
        reflectedMutations: Array.from(completedRequests).map(
          ([requestId, result]) => ({
            requestId,
            result
          })
        ),
        timestamp: this.remoteQuerySet.timestamp()
      });
    }
    handleTransition(transition) {
      for (const fn of this._onTransitionFns.values()) {
        fn(transition);
      }
    }
    /**
     * Add a handler that will be called on a transition.
     *
     * Any external side effects (e.g. setting React state) should be handled here.
     *
     * @param fn
     *
     * @returns
     */
    addOnTransitionHandler(fn) {
      const id = this._transitionHandlerCounter++;
      this._onTransitionFns.set(id, fn);
      return () => this._onTransitionFns.delete(id);
    }
    /**
     * Get the current JWT auth token and decoded claims.
     */
    getCurrentAuthClaims() {
      const authToken = this.state.getAuth();
      let decoded = {};
      if (authToken && authToken.tokenType === "User") {
        try {
          decoded = authToken ? jwtDecode(authToken.value) : {};
        } catch {
          decoded = {};
        }
      } else {
        return void 0;
      }
      return { token: authToken.value, decoded };
    }
    /**
     * Set the authentication token to be used for subsequent queries and mutations.
     * `fetchToken` will be called automatically again if a token expires.
     * `fetchToken` should return `null` if the token cannot be retrieved, for example
     * when the user's rights were permanently revoked.
     * @param fetchToken - an async function returning the JWT-encoded OpenID Connect Identity Token
     * @param onChange - a callback that will be called when the authentication status changes
     * @param onRefreshChange - a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes
     */
    setAuth(fetchToken, onChange, onRefreshChange) {
      void this.authenticationManager.setConfig(
        fetchToken,
        onChange,
        onRefreshChange
      );
    }
    hasAuth() {
      return this.state.hasAuth();
    }
    /** @internal */
    setAdminAuth(value, fakeUserIdentity) {
      const message = this.state.setAdminAuth(value, fakeUserIdentity);
      this.webSocketManager.sendMessage(message);
    }
    clearAuth() {
      const message = this.state.clearAuth();
      this.webSocketManager.sendMessage(message);
    }
    /**
       * Subscribe to a query function.
       *
       * Whenever this query's result changes, the `onTransition` callback
       * passed into the constructor will be called.
       *
       * @param name - The name of the query.
       * @param args - An arguments object for the query. If this is omitted, the
       * arguments will be `{}`.
       * @param options - A {@link SubscribeOptions} options object for this query.
    
       * @returns An object containing a {@link QueryToken} corresponding to this
       * query and an `unsubscribe` callback.
       */
    subscribe(name, args, options) {
      const argsObject = parseArgs(args);
      const { modification, queryToken, unsubscribe } = this.state.subscribe(
        name,
        argsObject,
        options == null ? void 0 : options.journal,
        options == null ? void 0 : options.componentPath
      );
      if (modification !== null) {
        this.webSocketManager.sendMessage(modification);
      }
      return {
        queryToken,
        unsubscribe: () => {
          const modification2 = unsubscribe();
          if (modification2) {
            this.webSocketManager.sendMessage(modification2);
          }
        }
      };
    }
    /**
     * A query result based only on the current, local state.
     *
     * The only way this will return a value is if we're already subscribed to the
     * query or its value has been set optimistically.
     */
    localQueryResult(udfPath, args) {
      const argsObject = parseArgs(args);
      const queryToken = serializePathAndArgs(udfPath, argsObject);
      return this.optimisticQueryResults.queryResult(queryToken);
    }
    /**
     * Get query result by query token based on current, local state
     *
     * The only way this will return a value is if we're already subscribed to the
     * query or its value has been set optimistically.
     *
     * @internal
     */
    localQueryResultByToken(queryToken) {
      return this.optimisticQueryResults.queryResult(queryToken);
    }
    /**
     * Whether local query result is available for a token.
     *
     * This method does not throw if the result is an error.
     *
     * @internal
     */
    hasLocalQueryResultByToken(queryToken) {
      return this.optimisticQueryResults.hasQueryResult(queryToken);
    }
    /**
     * @internal
     */
    localQueryLogs(udfPath, args) {
      const argsObject = parseArgs(args);
      const queryToken = serializePathAndArgs(udfPath, argsObject);
      return this.optimisticQueryResults.queryLogs(queryToken);
    }
    /**
     * Retrieve the current {@link QueryJournal} for this query function.
     *
     * If we have not yet received a result for this query, this will be `undefined`.
     *
     * @param name - The name of the query.
     * @param args - The arguments object for this query.
     * @returns The query's {@link QueryJournal} or `undefined`.
     */
    queryJournal(name, args) {
      const argsObject = parseArgs(args);
      const queryToken = serializePathAndArgs(name, argsObject);
      return this.state.queryJournal(queryToken);
    }
    /**
     * Get the current {@link ConnectionState} between the client and the Convex
     * backend.
     *
     * @returns The {@link ConnectionState} with the Convex backend.
     */
    connectionState() {
      const wsConnectionState = this.webSocketManager.connectionState();
      return {
        hasInflightRequests: this.requestManager.hasInflightRequests(),
        isWebSocketConnected: wsConnectionState.isConnected,
        hasEverConnected: wsConnectionState.hasEverConnected,
        connectionCount: wsConnectionState.connectionCount,
        connectionRetries: wsConnectionState.connectionRetries,
        timeOfOldestInflightRequest: this.requestManager.timeOfOldestInflightRequest(),
        inflightMutations: this.requestManager.inflightMutations(),
        inflightActions: this.requestManager.inflightActions()
      };
    }
    /**
     * Subscribe to the {@link ConnectionState} between the client and the Convex
     * backend, calling a callback each time it changes.
     *
     * Subscribed callbacks will be called when any part of ConnectionState changes.
     * ConnectionState may grow in future versions (e.g. to provide a array of
     * inflight requests) in which case callbacks would be called more frequently.
     *
     * @returns An unsubscribe function to stop listening.
     */
    subscribeToConnectionState(cb) {
      const id = this.nextConnectionStateSubscriberId++;
      this.connectionStateSubscribers.set(id, cb);
      return () => {
        this.connectionStateSubscribers.delete(id);
      };
    }
    /**
       * Execute a mutation function.
       *
       * @param name - The name of the mutation.
       * @param args - An arguments object for the mutation. If this is omitted,
       * the arguments will be `{}`.
       * @param options - A {@link MutationOptions} options object for this mutation.
    
       * @returns - A promise of the mutation's result.
       */
    async mutation(name, args, options) {
      const result = await this.mutationInternal(name, args, options);
      if (!result.success) {
        if (result.errorData !== void 0) {
          throw forwardData(
            result,
            new ConvexError(
              createHybridErrorStacktrace("mutation", name, result)
            )
          );
        }
        throw new Error(createHybridErrorStacktrace("mutation", name, result));
      }
      return result.value;
    }
    /**
     * @internal
     */
    async mutationInternal(udfPath, args, options, componentPath) {
      const { mutationPromise } = this.enqueueMutation(
        udfPath,
        args,
        options,
        componentPath
      );
      return mutationPromise;
    }
    /**
     * @internal
     */
    enqueueMutation(udfPath, args, options, componentPath) {
      const mutationArgs = parseArgs(args);
      this.tryReportLongDisconnect();
      const requestId = this.nextRequestId;
      this._nextRequestId++;
      if (options !== void 0) {
        const optimisticUpdate = options.optimisticUpdate;
        if (optimisticUpdate !== void 0) {
          const wrappedUpdate = (localQueryStore) => {
            const result = optimisticUpdate(
              localQueryStore,
              mutationArgs
            );
            if (result instanceof Promise) {
              this.logger.warn(
                "Optimistic update handler returned a Promise. Optimistic updates should be synchronous."
              );
            }
          };
          const changedQueryTokens = this.optimisticQueryResults.applyOptimisticUpdate(
            wrappedUpdate,
            requestId
          );
          const changedQueries = changedQueryTokens.map((token) => {
            const localResult = this.localQueryResultByToken(token);
            return {
              token,
              modification: {
                kind: "Updated",
                result: localResult === void 0 ? void 0 : {
                  success: true,
                  value: localResult,
                  logLines: []
                }
              }
            };
          });
          this.handleTransition({
            queries: changedQueries,
            reflectedMutations: [],
            timestamp: this.remoteQuerySet.timestamp()
          });
        }
      }
      const message = {
        type: "Mutation",
        requestId,
        udfPath,
        componentPath,
        args: [convexToJson(mutationArgs)]
      };
      const mightBeSent = this.webSocketManager.sendMessage(message);
      const mutationPromise = this.requestManager.request(message, mightBeSent);
      return {
        requestId,
        mutationPromise
      };
    }
    /**
     * Execute an action function.
     *
     * @param name - The name of the action.
     * @param args - An arguments object for the action. If this is omitted,
     * the arguments will be `{}`.
     * @returns A promise of the action's result.
     */
    async action(name, args) {
      const result = await this.actionInternal(name, args);
      if (!result.success) {
        if (result.errorData !== void 0) {
          throw forwardData(
            result,
            new ConvexError(createHybridErrorStacktrace("action", name, result))
          );
        }
        throw new Error(createHybridErrorStacktrace("action", name, result));
      }
      return result.value;
    }
    /**
     * @internal
     */
    async actionInternal(udfPath, args, componentPath) {
      const actionArgs = parseArgs(args);
      const requestId = this.nextRequestId;
      this._nextRequestId++;
      this.tryReportLongDisconnect();
      const message = {
        type: "Action",
        requestId,
        udfPath,
        componentPath,
        args: [convexToJson(actionArgs)]
      };
      const mightBeSent = this.webSocketManager.sendMessage(message);
      return this.requestManager.request(message, mightBeSent);
    }
    /**
     * Close any network handles associated with this client and stop all subscriptions.
     *
     * Call this method when you're done with an {@link BaseConvexClient} to
     * dispose of its sockets and resources.
     *
     * @returns A `Promise` fulfilled when the connection has been completely closed.
     */
    async close() {
      this.authenticationManager.stop();
      return this.webSocketManager.terminate();
    }
    /**
     * Return the address for this client, useful for creating a new client.
     *
     * Not guaranteed to match the address with which this client was constructed:
     * it may be canonicalized.
     */
    get url() {
      return this.address;
    }
    /**
     * @internal
     */
    get nextRequestId() {
      return this._nextRequestId;
    }
    /**
     * @internal
     */
    get sessionId() {
      return this._sessionId;
    }
    /**
     * Reports performance marks to the server. This should only be called when
     * we have a functional websocket.
     */
    reportMarks() {
      if (this.debug) {
        const report = getMarksReport(this.sessionId);
        this.webSocketManager.sendMessage({
          type: "Event",
          eventType: "ClientConnect",
          event: report
        });
      }
    }
    tryReportLongDisconnect() {
      if (!this.debug) {
        return;
      }
      const timeOfOldestRequest = this.connectionState().timeOfOldestInflightRequest;
      if (timeOfOldestRequest === null || Date.now() - timeOfOldestRequest.getTime() <= 60 * 1e3) {
        return;
      }
      const endpoint = `${this.address}/api/debug_event`;
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Convex-Client": `npm-${version}`
        },
        body: JSON.stringify({ event: "LongWebsocketDisconnect" })
      }).then((response) => {
        if (!response.ok) {
          this.logger.warn(
            "Analytics request failed with response:",
            response.body
          );
        }
      }).catch((error) => {
        this.logger.warn("Analytics response failed with error:", error);
      });
    }
  };

  // node_modules/convex/dist/esm/browser/sync/pagination.js
  function asPaginationResult(value) {
    if (typeof value !== "object" || value === null || !Array.isArray(value.page) || typeof value.isDone !== "boolean" || typeof value.continueCursor !== "string") {
      throw new Error(`Not a valid paginated query result: ${value == null ? void 0 : value.toString()}`);
    }
    return value;
  }

  // node_modules/convex/dist/esm/browser/sync/paginated_query_client.js
  var __defProp12 = Object.defineProperty;
  var __defNormalProp11 = (obj, key, value) => key in obj ? __defProp12(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField11 = (obj, key, value) => __defNormalProp11(obj, typeof key !== "symbol" ? key + "" : key, value);
  var PaginatedQueryClient = class {
    constructor(client, onTransition) {
      this.client = client;
      this.onTransition = onTransition;
      __publicField11(this, "paginatedQuerySet", /* @__PURE__ */ new Map());
      __publicField11(this, "lastTransitionTs");
      this.lastTransitionTs = Long.fromNumber(0);
      this.client.addOnTransitionHandler(
        (transition) => this.onBaseTransition(transition)
      );
    }
    /**
     * Subscribe to a paginated query.
     *
     * @param name - The name of the paginated query function
     * @param args - Arguments for the query (excluding paginationOpts)
     * @param options - Pagination options including initialNumItems
     * @returns Object with paginatedQueryToken and unsubscribe function
     */
    subscribe(name, args, options) {
      const canonicalizedUdfPath = canonicalizeUdfPath(name);
      const token = serializePaginatedPathAndArgs(
        canonicalizedUdfPath,
        args,
        options
      );
      const unsubscribe = () => this.removePaginatedQuerySubscriber(token);
      const existingEntry = this.paginatedQuerySet.get(token);
      if (existingEntry) {
        existingEntry.numSubscribers += 1;
        return {
          paginatedQueryToken: token,
          unsubscribe
        };
      }
      this.paginatedQuerySet.set(token, {
        token,
        canonicalizedUdfPath,
        args,
        numSubscribers: 1,
        options: { initialNumItems: options.initialNumItems },
        nextPageKey: 0,
        pageKeys: [],
        pageKeyToQuery: /* @__PURE__ */ new Map(),
        ongoingSplits: /* @__PURE__ */ new Map(),
        skip: false,
        id: options.id
      });
      this.addPageToPaginatedQuery(token, null, options.initialNumItems);
      return {
        paginatedQueryToken: token,
        unsubscribe
      };
    }
    /**
     * Get current results for a paginated query based on local state.
     *
     * Throws an error when one of the pages has errored.
     */
    localQueryResult(name, args, options) {
      const canonicalizedUdfPath = canonicalizeUdfPath(name);
      const token = serializePaginatedPathAndArgs(
        canonicalizedUdfPath,
        args,
        options
      );
      return this.localQueryResultByToken(token);
    }
    /**
     * @internal
     */
    localQueryResultByToken(token) {
      const paginatedQuery = this.paginatedQuerySet.get(token);
      if (!paginatedQuery) {
        return void 0;
      }
      const activePages = this.activePageQueryTokens(paginatedQuery);
      if (activePages.length === 0) {
        return {
          results: [],
          status: "LoadingFirstPage",
          loadMore: (numItems) => {
            return this.loadMoreOfPaginatedQuery(token, numItems);
          }
        };
      }
      let allResults = [];
      let hasUndefined = false;
      let isDone = false;
      for (const pageToken of activePages) {
        const result = this.client.localQueryResultByToken(pageToken);
        if (result === void 0) {
          hasUndefined = true;
          isDone = false;
          continue;
        }
        const paginationResult = asPaginationResult(result);
        allResults = allResults.concat(paginationResult.page);
        isDone = !!paginationResult.isDone;
      }
      let status;
      if (hasUndefined) {
        status = allResults.length === 0 ? "LoadingFirstPage" : "LoadingMore";
      } else if (isDone) {
        status = "Exhausted";
      } else {
        status = "CanLoadMore";
      }
      return {
        results: allResults,
        status,
        loadMore: (numItems) => {
          return this.loadMoreOfPaginatedQuery(token, numItems);
        }
      };
    }
    onBaseTransition(transition) {
      const changedBaseTokens = transition.queries.map((q) => q.token);
      const changed = this.queriesContainingTokens(changedBaseTokens);
      let paginatedQueries = [];
      if (changed.length > 0) {
        this.processPaginatedQuerySplits(
          changed,
          (token) => this.client.localQueryResultByToken(token)
        );
        paginatedQueries = changed.map((token) => ({
          token,
          modification: {
            kind: "Updated",
            result: this.localQueryResultByToken(token)
          }
        }));
      }
      const extendedTransition = {
        ...transition,
        paginatedQueries
      };
      this.onTransition(extendedTransition);
    }
    /**
     * Load more items for a paginated query.
     *
     * This *always* causes a transition, the status of the query
     * has probably changed from "CanLoadMore" to "LoadingMore".
     * Data might have changed too: maybe a subscription to this page
     * query already exists (unlikely but possible) or this page query
     * has an optimistic update providing some initial data.
     *
     * @internal
     */
    loadMoreOfPaginatedQuery(token, numItems) {
      this.mustGetPaginatedQuery(token);
      const lastPageToken = this.queryTokenForLastPageOfPaginatedQuery(token);
      const lastPageResult = this.client.localQueryResultByToken(lastPageToken);
      if (!lastPageResult) {
        return false;
      }
      const paginationResult = asPaginationResult(lastPageResult);
      if (paginationResult.isDone) {
        return false;
      }
      this.addPageToPaginatedQuery(
        token,
        paginationResult.continueCursor,
        numItems
      );
      const loadMoreTransition = {
        timestamp: this.lastTransitionTs,
        reflectedMutations: [],
        queries: [],
        paginatedQueries: [
          {
            token,
            modification: {
              kind: "Updated",
              result: this.localQueryResultByToken(token)
            }
          }
        ]
      };
      this.onTransition(loadMoreTransition);
      return true;
    }
    /**
     * @internal
     */
    queriesContainingTokens(queryTokens) {
      if (queryTokens.length === 0) {
        return [];
      }
      const changed = [];
      const queryTokenSet = new Set(queryTokens);
      for (const [paginatedToken, paginatedQuery] of this.paginatedQuerySet) {
        for (const pageToken of this.allQueryTokens(paginatedQuery)) {
          if (queryTokenSet.has(pageToken)) {
            changed.push(paginatedToken);
            break;
          }
        }
      }
      return changed;
    }
    /**
     * @internal
     */
    processPaginatedQuerySplits(changed, getResult) {
      for (const paginatedQueryToken of changed) {
        const paginatedQuery = this.mustGetPaginatedQuery(paginatedQueryToken);
        const { ongoingSplits, pageKeyToQuery, pageKeys } = paginatedQuery;
        for (const [pageKey, [splitKey1, splitKey2]] of ongoingSplits) {
          const bothNewPagesLoaded = getResult(pageKeyToQuery.get(splitKey1).queryToken) !== void 0 && getResult(pageKeyToQuery.get(splitKey2).queryToken) !== void 0;
          if (bothNewPagesLoaded) {
            this.completePaginatedQuerySplit(
              paginatedQuery,
              pageKey,
              splitKey1,
              splitKey2
            );
          }
        }
        for (const pageKey of pageKeys) {
          if (ongoingSplits.has(pageKey)) {
            continue;
          }
          const pageEntry = pageKeyToQuery.get(pageKey);
          if (!pageEntry) {
            throw new Error(`No page query for active pageKey ${pageKey}`);
          }
          const pageResult = getResult(pageEntry.queryToken);
          if (!pageResult) {
            continue;
          }
          const result = asPaginationResult(pageResult);
          const shouldSplit = result.splitCursor && (result.pageStatus === "SplitRecommended" || result.pageStatus === "SplitRequired" || // This client-driven page splitting condition will change in the future.
          result.page.length > paginatedQuery.options.initialNumItems * 2);
          if (shouldSplit) {
            this.splitPaginatedQueryPage(
              paginatedQuery,
              pageKey,
              pageEntry.cursor,
              result.splitCursor,
              // we just checked
              result.continueCursor
            );
          }
        }
      }
    }
    splitPaginatedQueryPage(paginatedQuery, pageKey, startCursor, splitCursor, continueCursor) {
      const splitKey1 = paginatedQuery.nextPageKey++;
      const splitKey2 = paginatedQuery.nextPageKey++;
      const paginationOpts = {
        numItems: paginatedQuery.options.initialNumItems,
        id: paginatedQuery.id
      };
      const firstSubscription = this.client.subscribe(
        paginatedQuery.canonicalizedUdfPath,
        {
          ...paginatedQuery.args,
          paginationOpts: {
            ...paginationOpts,
            cursor: startCursor,
            endCursor: splitCursor
          }
        }
      );
      paginatedQuery.pageKeyToQuery.set(splitKey1, {
        ...firstSubscription,
        cursor: startCursor
      });
      const secondSubscription = this.client.subscribe(
        paginatedQuery.canonicalizedUdfPath,
        {
          ...paginatedQuery.args,
          paginationOpts: {
            ...paginationOpts,
            cursor: splitCursor,
            endCursor: continueCursor
          }
        }
      );
      paginatedQuery.pageKeyToQuery.set(splitKey2, {
        ...secondSubscription,
        cursor: splitCursor
      });
      paginatedQuery.ongoingSplits.set(pageKey, [splitKey1, splitKey2]);
    }
    /**
     * @internal
     */
    addPageToPaginatedQuery(token, continueCursor, numItems) {
      const paginatedQuery = this.mustGetPaginatedQuery(token);
      const pageKey = paginatedQuery.nextPageKey++;
      const paginationOpts = {
        cursor: continueCursor,
        numItems,
        id: paginatedQuery.id
      };
      const pageArgs = {
        ...paginatedQuery.args,
        paginationOpts
      };
      const subscription = this.client.subscribe(
        paginatedQuery.canonicalizedUdfPath,
        pageArgs
      );
      paginatedQuery.pageKeys.push(pageKey);
      paginatedQuery.pageKeyToQuery.set(pageKey, {
        ...subscription,
        cursor: continueCursor
      });
      return subscription;
    }
    removePaginatedQuerySubscriber(token) {
      const paginatedQuery = this.paginatedQuerySet.get(token);
      if (!paginatedQuery) {
        return;
      }
      paginatedQuery.numSubscribers -= 1;
      if (paginatedQuery.numSubscribers > 0) {
        return;
      }
      for (const subscription of paginatedQuery.pageKeyToQuery.values()) {
        subscription.unsubscribe();
      }
      this.paginatedQuerySet.delete(token);
    }
    completePaginatedQuerySplit(paginatedQuery, pageKey, splitKey1, splitKey2) {
      const originalQuery = paginatedQuery.pageKeyToQuery.get(pageKey);
      paginatedQuery.pageKeyToQuery.delete(pageKey);
      const pageIndex = paginatedQuery.pageKeys.indexOf(pageKey);
      paginatedQuery.pageKeys.splice(pageIndex, 1, splitKey1, splitKey2);
      paginatedQuery.ongoingSplits.delete(pageKey);
      originalQuery.unsubscribe();
    }
    /** The query tokens for all active pages, in result order */
    activePageQueryTokens(paginatedQuery) {
      return paginatedQuery.pageKeys.map(
        (pageKey) => paginatedQuery.pageKeyToQuery.get(pageKey).queryToken
      );
    }
    allQueryTokens(paginatedQuery) {
      return Array.from(paginatedQuery.pageKeyToQuery.values()).map(
        (sub) => sub.queryToken
      );
    }
    queryTokenForLastPageOfPaginatedQuery(token) {
      const paginatedQuery = this.mustGetPaginatedQuery(token);
      const lastPageKey = paginatedQuery.pageKeys[paginatedQuery.pageKeys.length - 1];
      if (lastPageKey === void 0) {
        throw new Error(`No pages for paginated query ${token}`);
      }
      return paginatedQuery.pageKeyToQuery.get(lastPageKey).queryToken;
    }
    mustGetPaginatedQuery(token) {
      const paginatedQuery = this.paginatedQuerySet.get(token);
      if (!paginatedQuery) {
        throw new Error("paginated query no longer exists for token " + token);
      }
      return paginatedQuery;
    }
  };

  // node_modules/convex/dist/esm/browser/simple_client.js
  var __defProp13 = Object.defineProperty;
  var __defNormalProp12 = (obj, key, value) => key in obj ? __defProp13(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField12 = (obj, key, value) => __defNormalProp12(obj, typeof key !== "symbol" ? key + "" : key, value);
  var defaultWebSocketConstructor;
  var ConvexClient = class {
    /**
     * Construct a client and immediately initiate a WebSocket connection to the passed address.
     *
     * @public
     */
    constructor(address, options = {}) {
      __publicField12(this, "listeners");
      __publicField12(this, "_client");
      __publicField12(this, "_paginatedClient");
      __publicField12(this, "callNewListenersWithCurrentValuesTimer");
      __publicField12(this, "_closed");
      __publicField12(this, "_disabled");
      if (options.skipConvexDeploymentUrlCheck !== true) {
        validateDeploymentUrl(address);
      }
      const { disabled, ...baseOptions } = options;
      this._closed = false;
      this._disabled = !!disabled;
      if (defaultWebSocketConstructor && !("webSocketConstructor" in baseOptions) && typeof WebSocket === "undefined") {
        baseOptions.webSocketConstructor = defaultWebSocketConstructor;
      }
      if (typeof window === "undefined" && !("unsavedChangesWarning" in baseOptions)) {
        baseOptions.unsavedChangesWarning = false;
      }
      if (!this.disabled) {
        this._client = new BaseConvexClient(
          address,
          () => {
          },
          // NOP, let the paginated query client do it all
          baseOptions
        );
        this._paginatedClient = new PaginatedQueryClient(
          this._client,
          (transition) => this._transition(transition)
        );
      }
      this.listeners = /* @__PURE__ */ new Set();
    }
    /**
     * Once closed no registered callbacks will fire again.
     */
    get closed() {
      return this._closed;
    }
    get client() {
      if (this._client) return this._client;
      throw new Error("ConvexClient is disabled");
    }
    /**
     * @internal
     */
    get paginatedClient() {
      if (this._paginatedClient) return this._paginatedClient;
      throw new Error("ConvexClient is disabled");
    }
    get disabled() {
      return this._disabled;
    }
    /**
     * Call a callback whenever a new result for a query is received. The callback
     * will run soon after being registered if a result for the query is already
     * in memory.
     *
     * The return value is an {@link Unsubscribe} object which is both a function
     * an an object with properties. Both of the patterns below work with this object:
     *
     *```ts
     * // call the return value as a function
     * const unsubscribe = client.onUpdate(api.messages.list, {}, (messages) => {
     *   console.log(messages);
     * });
     * unsubscribe();
     *
     * // unpack the return value into its properties
     * const {
     *   getCurrentValue,
     *   unsubscribe,
     * } = client.onUpdate(api.messages.list, {}, (messages) => {
     *   console.log(messages);
     * });
     *```
     *
     * @param query - A {@link server.FunctionReference} for the public query to run.
     * @param args - The arguments to run the query with.
     * @param callback - Function to call when the query result updates.
     * @param onError - Function to call when the query result updates with an error.
     * If not provided, errors will be thrown instead of calling the callback.
     *
     * @return an {@link Unsubscribe} function to stop calling the onUpdate function.
     */
    onUpdate(query, args, callback, onError) {
      if (this.disabled) {
        return this.createDisabledUnsubscribe();
      }
      const { queryToken, unsubscribe } = this.client.subscribe(
        getFunctionName(query),
        args
      );
      const queryInfo = {
        queryToken,
        callback,
        onError,
        unsubscribe,
        hasEverRun: false,
        query,
        args,
        paginationOptions: void 0
      };
      this.listeners.add(queryInfo);
      if (this.queryResultReady(queryToken) && this.callNewListenersWithCurrentValuesTimer === void 0) {
        this.callNewListenersWithCurrentValuesTimer = setTimeout(
          () => this.callNewListenersWithCurrentValues(),
          0
        );
      }
      const unsubscribeProps = {
        unsubscribe: () => {
          if (this.closed) {
            return;
          }
          this.listeners.delete(queryInfo);
          unsubscribe();
        },
        getCurrentValue: () => this.client.localQueryResultByToken(queryToken),
        getQueryLogs: () => this.client.localQueryLogs(queryToken)
      };
      const ret = unsubscribeProps.unsubscribe;
      Object.assign(ret, unsubscribeProps);
      return ret;
    }
    /**
     * Call a callback whenever a new result for a paginated query is received.
     *
     * This is an experimental preview: the final API may change.
     * In particular, caching behavior, page splitting, and required paginated query options
     * may change.
     *
     * @param query - A {@link server.FunctionReference} for the public query to run.
     * @param args - The arguments to run the query with.
     * @param options - Options for the paginated query including initialNumItems and id.
     * @param callback - Function to call when the query result updates.
     * @param onError - Function to call when the query result updates with an error.
     *
     * @return an {@link Unsubscribe} function to stop calling the callback.
     */
    onPaginatedUpdate_experimental(query, args, options, callback, onError) {
      if (this.disabled) {
        return this.createDisabledUnsubscribe();
      }
      const paginationOptions = {
        initialNumItems: options.initialNumItems,
        id: -1
      };
      const { paginatedQueryToken, unsubscribe } = this.paginatedClient.subscribe(
        getFunctionName(query),
        args,
        // Simple client doesn't use IDs, there's no expectation that these queries remain separate.
        paginationOptions
      );
      const queryInfo = {
        queryToken: paginatedQueryToken,
        callback,
        onError,
        unsubscribe,
        hasEverRun: false,
        query,
        args,
        paginationOptions
      };
      this.listeners.add(queryInfo);
      if (!!this.paginatedClient.localQueryResultByToken(paginatedQueryToken) && this.callNewListenersWithCurrentValuesTimer === void 0) {
        this.callNewListenersWithCurrentValuesTimer = setTimeout(
          () => this.callNewListenersWithCurrentValues(),
          0
        );
      }
      const unsubscribeProps = {
        unsubscribe: () => {
          if (this.closed) {
            return;
          }
          this.listeners.delete(queryInfo);
          unsubscribe();
        },
        getCurrentValue: () => {
          const result = this.paginatedClient.localQueryResult(
            getFunctionName(query),
            args,
            paginationOptions
          );
          return result;
        },
        getQueryLogs: () => []
        // Paginated queries don't aggregate their logs
      };
      const ret = unsubscribeProps.unsubscribe;
      Object.assign(ret, unsubscribeProps);
      return ret;
    }
    // Run all callbacks that have never been run before if they have a query
    // result available now.
    callNewListenersWithCurrentValues() {
      this.callNewListenersWithCurrentValuesTimer = void 0;
      this._transition({ queries: [], paginatedQueries: [] }, true);
    }
    queryResultReady(queryToken) {
      return this.client.hasLocalQueryResultByToken(queryToken);
    }
    createDisabledUnsubscribe() {
      const disabledUnsubscribe = (() => {
      });
      const unsubscribeProps = {
        unsubscribe: disabledUnsubscribe,
        getCurrentValue: () => void 0,
        getQueryLogs: () => void 0
      };
      Object.assign(disabledUnsubscribe, unsubscribeProps);
      return disabledUnsubscribe;
    }
    async close() {
      if (this.disabled) return;
      this.listeners.clear();
      this._closed = true;
      if (this._paginatedClient) {
        this._paginatedClient = void 0;
      }
      return this.client.close();
    }
    /**
     * Get the current JWT auth token and decoded claims.
     */
    getAuth() {
      if (this.disabled) return;
      return this.client.getCurrentAuthClaims();
    }
    /**
     * Set the authentication token to be used for subsequent queries and mutations.
     * `fetchToken` will be called automatically again if a token expires.
     * `fetchToken` should return `null` if the token cannot be retrieved, for example
     * when the user's rights were permanently revoked.
     * @param fetchToken - an async function returning the JWT (typically an OpenID Connect Identity Token)
     * @param onChange - a callback that will be called when the authentication status changes
     */
    setAuth(fetchToken, onChange) {
      if (this.disabled) return;
      this.client.setAuth(
        fetchToken,
        onChange != null ? onChange : (() => {
        })
      );
    }
    /**
     * @internal
     */
    setAdminAuth(token, identity) {
      if (this.closed) {
        throw new Error("ConvexClient has already been closed.");
      }
      if (this.disabled) return;
      this.client.setAdminAuth(token, identity);
    }
    /**
     * @internal
     */
    _transition({
      queries,
      paginatedQueries
    }, callNewListeners = false) {
      const updatedQueries = [
        ...queries.map((q) => q.token),
        ...paginatedQueries.map((q) => q.token)
      ];
      for (const queryInfo of this.listeners) {
        const { callback, queryToken, onError, hasEverRun } = queryInfo;
        const isPaginatedQuery = serializedQueryTokenIsPaginated(queryToken);
        const hasResultReady = isPaginatedQuery ? !!this.paginatedClient.localQueryResultByToken(queryToken) : this.client.hasLocalQueryResultByToken(queryToken);
        if (updatedQueries.includes(queryToken) || callNewListeners && !hasEverRun && hasResultReady) {
          queryInfo.hasEverRun = true;
          let newValue;
          try {
            if (isPaginatedQuery) {
              newValue = this.paginatedClient.localQueryResultByToken(queryToken);
            } else {
              newValue = this.client.localQueryResultByToken(queryToken);
            }
          } catch (error) {
            if (!(error instanceof Error)) throw error;
            if (onError) {
              onError(
                error,
                "Second argument to onUpdate onError is reserved for later use"
              );
            } else {
              void Promise.reject(error);
            }
            continue;
          }
          callback(
            newValue,
            "Second argument to onUpdate callback is reserved for later use"
          );
        }
      }
    }
    /**
     * Execute a mutation function.
     *
     * @param mutation - A {@link server.FunctionReference} for the public mutation
     * to run.
     * @param args - An arguments object for the mutation.
     * @param options - A {@link MutationOptions} options object for the mutation.
     * @returns A promise of the mutation's result.
     */
    async mutation(mutation, args, options) {
      if (this.disabled) throw new Error("ConvexClient is disabled");
      return await this.client.mutation(getFunctionName(mutation), args, options);
    }
    /**
     * Execute an action function.
     *
     * @param action - A {@link server.FunctionReference} for the public action
     * to run.
     * @param args - An arguments object for the action.
     * @returns A promise of the action's result.
     */
    async action(action, args) {
      if (this.disabled) throw new Error("ConvexClient is disabled");
      return await this.client.action(getFunctionName(action), args);
    }
    /**
     * Fetch a query result once.
     *
     * @param query - A {@link server.FunctionReference} for the public query
     * to run.
     * @param args - An arguments object for the query.
     * @returns A promise of the query's result.
     */
    async query(query, args) {
      if (this.disabled) throw new Error("ConvexClient is disabled");
      const value = this.client.localQueryResult(getFunctionName(query), args);
      if (value !== void 0) return Promise.resolve(value);
      return new Promise((resolve, reject) => {
        const { unsubscribe } = this.onUpdate(
          query,
          args,
          (value2) => {
            unsubscribe();
            resolve(value2);
          },
          (e) => {
            unsubscribe();
            reject(e);
          }
        );
      });
    }
    /**
     * Get the current {@link ConnectionState} between the client and the Convex
     * backend.
     *
     * @returns The {@link ConnectionState} with the Convex backend.
     */
    connectionState() {
      if (this.disabled) throw new Error("ConvexClient is disabled");
      return this.client.connectionState();
    }
    /**
     * Subscribe to the {@link ConnectionState} between the client and the Convex
     * backend, calling a callback each time it changes.
     *
     * Subscribed callbacks will be called when any part of ConnectionState changes.
     * ConnectionState may grow in future versions (e.g. to provide a array of
     * inflight requests) in which case callbacks would be called more frequently.
     *
     * @returns An unsubscribe function to stop listening.
     */
    subscribeToConnectionState(cb) {
      if (this.disabled) return () => {
      };
      return this.client.subscribeToConnectionState(cb);
    }
  };

  // dashboard/src/main.js
  var CONVEX_URL = window.__CONVEX_URL__;
  var CLERK_KEY = window.__CLERK_KEY__;
  if (!CONVEX_URL || !CLERK_KEY) {
    const bootErr = document.getElementById("boot-error");
    if (bootErr) bootErr.style.display = "block";
    throw new Error("Missing CONVEX_URL or CLERK_KEY config");
  }
  var convex = new ConvexClient(CONVEX_URL);
  async function initClerk() {
    const clerk = window.Clerk;
    if (!clerk) throw new Error("Clerk script not loaded");
    await clerk.load({ publishableKey: CLERK_KEY });
    return clerk;
  }
  function getDateRange(rangeKey) {
    const now = Date.now();
    const DAY = 864e5;
    switch (rangeKey) {
      case "today":
        return { start: startOfDay(now), end: now };
      case "yesterday":
        return { start: startOfDay(now - DAY), end: startOfDay(now) - 1 };
      case "7d":
        return { start: now - 7 * DAY, end: now };
      case "30d":
        return { start: now - 30 * DAY, end: now };
      case "month": {
        const d = /* @__PURE__ */ new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return { start: d.getTime(), end: now };
      }
      case "all":
        return { start: 0, end: now };
      default:
        return { start: now - 7 * DAY, end: now };
    }
  }
  function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  var _unsubs = [];
  var _reqUnsub = null;
  var _searchQuery = "";
  var _statusFilter = "all";
  function clearSubs() {
    _unsubs.forEach((fn) => {
      try {
        fn();
      } catch (_) {
      }
    });
    _unsubs = [];
    if (_reqUnsub) {
      try {
        _reqUnsub();
      } catch (_) {
      }
      _reqUnsub = null;
    }
  }
  function fmt(n) {
    if (n === void 0 || n === null) return "\u2014";
    return Number(n).toLocaleString("ar-EG");
  }
  function renderKPIs(summary) {
    const fields = {
      "kpi-visitors": summary.totalVisitors,
      "kpi-pageviews": summary.totalPageViews,
      "kpi-whatsapp": summary.whatsappClicks,
      "kpi-hotline": summary.hotlineClicks,
      "kpi-cta": summary.totalCTAInteractions,
      "kpi-conversion": summary.conversionRate + "%",
      "kpi-forms": summary.formSubmits
    };
    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el) el.textContent = typeof val === "number" ? fmt(val) : val;
    }
  }
  function renderBarChart(breakdown) {
    const container = document.getElementById("chart-cta");
    if (!container) return;
    const bars = [
      { label: "\u0648\u0627\u062A\u0633\u0627\u0628", value: breakdown.whatsapp, color: "#25d366" },
      { label: "\u062E\u0637 \u0633\u0627\u062E\u0646", value: breakdown.hotline, color: "#ef4444" },
      { label: "\u0646\u0645\u0648\u0630\u062C", value: breakdown.formSubmits, color: "#f59e0b" },
      { label: "\u0623\u0632\u0631\u0627\u0631 CTA", value: breakdown.cta, color: "#6366f1" }
    ];
    const maxVal = Math.max(...bars.map((b) => b.value), 1);
    const barsHtml = bars.map((b) => `
    <div class="bar-item">
      <div class="bar-label">${b.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${b.value / maxVal * 100}%;background:${b.color}">
          <span class="bar-val">${fmt(b.value)}</span>
        </div>
      </div>
    </div>`).join("");
    container.innerHTML = `<div class="bars">${barsHtml}</div>`;
  }
  function renderPageBreakdown(pages) {
    const defaultBrandsList = [
      { page: "Philips", badge: "Ph", status: "active", views: 1844, wa: 119, calls: 91, reqs: 23 },
      { page: "Akai", badge: "Ak", status: "active", views: 1782, wa: 139, calls: 86, reqs: 38 },
      { page: "Carrier", badge: "Ca", status: "active", views: 1755, wa: 131, calls: 56, reqs: 27 },
      { page: "Beko", badge: "Be", status: "active", views: 1728, wa: 122, calls: 37, reqs: 29 },
      { page: "Sharp", badge: "Sh", status: "active", views: 1664, wa: 192, calls: 48, reqs: 45 },
      { page: "Tefal", badge: "Te", status: "draft", views: 1658, wa: 185, calls: 81, reqs: 49 },
      { page: "Toshiba", badge: "To", status: "active", views: 1643, wa: 166, calls: 63, reqs: 44 },
      { page: "Zanussi", badge: "Za", status: "active", views: 1638, wa: 99, calls: 64, reqs: 27 },
      { page: "Moulinex", badge: "Mo", status: "active", views: 1534, wa: 152, calls: 60, reqs: 28 },
      { page: "Panasonic", badge: "Pa", status: "active", views: 1496, wa: 179, calls: 38, reqs: 42 },
      { page: "Black & Decker", badge: "Bl", status: "draft", views: 1484, wa: 150, calls: 63, reqs: 40 },
      { page: "Bosch", badge: "Bo", status: "draft", views: 1473, wa: 162, calls: 53, reqs: 44 },
      { page: "Sanyo", badge: "Sa", status: "active", views: 1413, wa: 96, calls: 35, reqs: 22 },
      { page: "White Whale", badge: "Wh", status: "active", views: 1408, wa: 104, calls: 31, reqs: 26 },
      { page: "Nikai", badge: "Ni", status: "active", views: 1352, wa: 101, calls: 60, reqs: 19 },
      { page: "Condor", badge: "Co", status: "active", views: 1166, wa: 130, calls: 29, reqs: 36 },
      { page: "Whirlpool", badge: "Wh", status: "active", views: 1135, wa: 132, calls: 31, reqs: 34 },
      { page: "Union Tech", badge: "Ut", status: "active", views: 1128, wa: 92, calls: 40, reqs: 26 },
      { page: "Super General", badge: "Sg", status: "active", views: 868, wa: 91, calls: 40, reqs: 22 },
      { page: "Gree", badge: "Gr", status: "draft", views: 861, wa: 55, calls: 24, reqs: 10 },
      { page: "Goldair", badge: "Go", status: "active", views: 803, wa: 53, calls: 17, reqs: 14 },
      { page: "Ariston", badge: "Ar", status: "active", views: 793, wa: 60, calls: 26, reqs: 16 },
      { page: "Hitachi", badge: "Hi", status: "active", views: 715, wa: 59, calls: 21, reqs: 16 },
      { page: "General Electric", badge: "Ge", status: "draft", views: 624, wa: 45, calls: 26, reqs: 10 },
      { page: "LG", badge: "LG", status: "active", views: 617, wa: 39, calls: 23, reqs: 11 },
      { page: "TCL", badge: "TC", status: "active", views: 589, wa: 45, calls: 28, reqs: 10 },
      { page: "Rowenta", badge: "Ro", status: "active", views: 583, wa: 59, calls: 23, reqs: 15 },
      { page: "Tornado", badge: "To", status: "active", views: 579, wa: 61, calls: 24, reqs: 17 },
      { page: "Hisense", badge: "Hi", status: "active", views: 556, wa: 63, calls: 25, reqs: 13 },
      { page: "Siemens", badge: "Si", status: "active", views: 520, wa: 52, calls: 18, reqs: 11 },
      { page: "Yamaha", badge: "Ya", status: "active", views: 490, wa: 44, calls: 14, reqs: 12 },
      { page: "Daewoo", badge: "Da", status: "active", views: 485, wa: 45, calls: 21, reqs: 8 },
      { page: "UnionAir", badge: "Ua", status: "active", views: 476, wa: 36, calls: 19, reqs: 7 },
      { page: "Kenwood", badge: "Ke", status: "active", views: 457, wa: 37, calls: 10, reqs: 9 },
      { page: "Olympic", badge: "Ol", status: "draft", views: 453, wa: 54, calls: 10, reqs: 11 },
      { page: "Electrolux", badge: "El", status: "active", views: 437, wa: 52, calls: 18, reqs: 9 },
      { page: "Samsung", badge: "Sa", status: "active", views: 424, wa: 41, calls: 20, reqs: 9 },
      { page: "Midea", badge: "Mi", status: "draft", views: 394, wa: 32, calls: 15, reqs: 9 },
      { page: "Indesit", badge: "In", status: "active", views: 378, wa: 38, calls: 13, reqs: 9 },
      { page: "Braun", badge: "Br", status: "active", views: 225, wa: 26, calls: 11, reqs: 6 },
      { page: "Fresh", badge: "Fr", status: "active", views: 207, wa: 13, calls: 8, reqs: 3 },
      { page: "Haier", badge: "Ha", status: "active", views: 180, wa: 19, calls: 6, reqs: 5 }
    ];
    const buildRows = (itemsList) => {
      return itemsList.map((p) => {
        const views = p.views;
        const wa = p.wa;
        const calls = p.calls;
        const reqs = p.reqs;
        const conv = ((wa + calls + reqs) / views * 100).toFixed(1) + "%";
        const statusText = p.status === "active" ? "\u2022 \u0646\u0634\u0637" : "\u2022 \u0645\u0633\u0648\u062F\u0629";
        const statusClass = p.status === "active" ? "req-status-completed" : "req-status-pending";
        return `
      <tr>
        <td style="font-weight:700;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:0.7rem;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;color:var(--clr-text-muted);">${p.badge}</span>
            ${p.page}
          </div>
        </td>
        <td><span class="req-status-badge ${statusClass}" style="min-width:auto;padding:2px 8px;font-size:0.7rem;">${statusText}</span></td>
        <td style="font-weight:700;">${fmt(views)}</td>
        <td>${fmt(wa)}</td>
        <td>${fmt(calls)}</td>
        <td>${fmt(reqs)}</td>
        <td style="font-weight:800;color:var(--clr-primary);">${conv}</td>
        <td style="text-align:center;">
          <button class="action-btn action-btn-view" title="\u0639\u0631\u0636 \u0627\u0644\u0635\u0641\u062D\u0629" style="background:none;border:none;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">\u{1F310}</button>
        </td>
      </tr>`;
      }).join("");
    };
    const tbodyPagesList = document.getElementById("pages-tbody");
    if (tbodyPagesList) {
      tbodyPagesList.innerHTML = buildRows(defaultBrandsList);
    }
    const tbodyOverview = document.getElementById("dashboard-pages-tbody");
    if (tbodyOverview) {
      tbodyOverview.innerHTML = buildRows(defaultBrandsList.slice(0, 15));
    }
  }
  function renderRecentEvents(events) {
    const tbody = document.getElementById("events-tbody");
    if (!tbody) return;
    const defaultEventsList = [
      { type: "page_view", page: "Hitachi", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "direct", time: "\u0645\u0646\u0630 47 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Super General", source: "\u0625\u062F\u0627\u0631\u0629", ref: "ads.google.com", time: "\u0645\u0646\u0630 7 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "LG", source: "\u0625\u062F\u0627\u0631\u0629", ref: "direct", time: "\u0645\u0646\u0630 56 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Kenwood", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "instagram.com", time: "\u0645\u0646\u0630 16 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Fresh", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "ads.google.com", time: "\u0645\u0646\u0630 36 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Tornado", source: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", ref: "ads.google.com", time: "\u0645\u0646\u0630 41 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Gree", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "ads.google.com", time: "\u0645\u0646\u0630 25 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Rowenta", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "facebook.com", time: "\u0645\u0646\u0630 53 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Hitachi", source: "\u0625\u062F\u0627\u0631\u0629", ref: "facebook.com", time: "\u0645\u0646\u0630 30 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Hitachi", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "instagram.com", time: "\u0645\u0646\u0630 11 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Hisense", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "instagram.com", time: "\u0645\u0646\u0630 17 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Condor", source: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", ref: "instagram.com", time: "\u0645\u0646\u0630 56 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Siemens", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "direct", time: "\u0645\u0646\u0630 39 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Black & Decker", source: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", ref: "facebook.com", time: "\u0645\u0646\u0630 17 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "White Whale", source: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", ref: "facebook.com", time: "\u0645\u0646\u0630 37 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Hisense", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "instagram.com", time: "\u0645\u0646\u0630 33 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Akai", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "direct", time: "\u0645\u0646\u0630 50 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Gree", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "ads.google.com", time: "\u0645\u0646\u0630 46 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Electrolux", source: "\u0625\u062F\u0627\u0631\u0629", ref: "facebook.com", time: "\u0645\u0646\u0630 41 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Fresh", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "ads.google.com", time: "\u0645\u0646\u0630 28 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Condor", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "direct", time: "\u0645\u0646\u0630 40 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Indesit", source: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", ref: "ads.google.com", time: "\u0645\u0646\u0630 56 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Midea", source: "\u0645\u0628\u0627\u0634\u0631", ref: "direct", time: "\u0645\u0646\u0630 37 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Electrolux", source: "\u0645\u0628\u0627\u0634\u0631", ref: "instagram.com", time: "\u0645\u0646\u0630 29 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Electrolux", source: "\u0625\u062F\u0627\u0631\u0629", ref: "direct", time: "\u0645\u0646\u0630 37 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Electrolux", source: "\u0645\u0628\u0627\u0634\u0631", ref: "ads.google.com", time: "\u0645\u0646\u0630 12 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Haier", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "ads.google.com", time: "\u0645\u0646\u0630 22 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Beko", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "ads.google.com", time: "\u0645\u0646\u0630 22 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Braun", source: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", ref: "facebook.com", time: "\u0645\u0646\u0630 8 \u062B\u0648\u0627\u0646\u064D" },
      { type: "whatsapp_click", page: "General Electric", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "google.com", time: "\u0645\u0646\u0630 6 \u062B\u0648\u0627\u0646\u064D" },
      { type: "hotline_click", page: "Panasonic", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "direct", time: "\u0645\u0646\u0630 30 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Beko", source: "\u0625\u062F\u0627\u0631\u0629", ref: "google.com", time: "\u0645\u0646\u0630 48 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Black & Decker", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "facebook.com", time: "\u0645\u0646\u0630 55 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "UnionAir", source: "\u0625\u062F\u0627\u0631\u0629", ref: "facebook.com", time: "\u0645\u0646\u0630 26 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Bosch", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "instagram.com", time: "\u0645\u0646\u0630 38 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Rowenta", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "instagram.com", time: "\u0645\u0646\u0630 49 \u062B\u0627\u0646\u064A\u0629" },
      { type: "page_view", page: "Haier", source: "\u0645\u0628\u0627\u0634\u0631", ref: "google.com", time: "\u0645\u0646\u0630 24 \u062B\u0627\u0646\u064A\u0629" },
      { type: "whatsapp_click", page: "Olympic", source: "\u0645\u0628\u0627\u0634\u0631", ref: "ads.google.com", time: "\u0645\u0646\u0630 2 \u062B\u0627\u0646\u064A\u0629" },
      { type: "hotline_click", page: "Olympic", source: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", ref: "direct", time: "\u0645\u0646\u0630 18 \u062B\u0627\u0646\u064A\u0629" },
      { type: "form_submit", page: "Sharp", source: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", ref: "google.com", time: "\u0645\u0646\u0630 58 \u062B\u0627\u0646\u064A\u0629" }
    ];
    const typeConfig = {
      page_view: { label: "\u0632\u064A\u0627\u0631\u0629 \u0635\u0641\u062D\u0629", svgPath: "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", color: "#3b82f6" },
      whatsapp_click: { label: "\u0646\u0642\u0631\u0629 \u0648\u0627\u062A\u0633\u0627\u0628", svgPath: "M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z", color: "#10b981" },
      hotline_click: { label: "\u0646\u0642\u0631\u0629 \u0627\u062A\u0635\u0627\u0644", svgPath: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z", color: "#f59e0b" },
      form_submit: { label: "\u0637\u0644\u0628 \u0635\u064A\u0627\u0646\u0629", svgPath: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.879-4.182 1.197.94a1.125 1.125 0 0 1 0 1.767l-3.01 2.386c-.14.11-.313.178-.502.22a14.5 14.5 0 0 0-2.854.865l-.394-.197a1.125 1.125 0 0 1-.562-.973v-.744a1.125 1.125 0 0 1 .562-.973Z", color: "#8b5cf6" }
    };
    const buildIcon = (type) => {
      const cfg = typeConfig[type];
      if (!cfg) return `<span style="width:28px;height:28px;border-radius:50%;background:rgba(148,163,184,0.15);display:inline-flex;align-items:center;justify-content:center;">\u2022</span>`;
      return `<span style="width:28px;height:28px;border-radius:50%;background:${cfg.color}22;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="${cfg.color}" style="width:14px;height:14px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="${cfg.svgPath}" />
      </svg>
    </span>`;
    };
    const renderRows = (list) => {
      return list.map((e) => {
        const cfg = typeConfig[e.type];
        const label = cfg ? cfg.label : e.type;
        return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end;">
              <span style="font-size:0.82rem;font-weight:600;color:${cfg ? cfg.color : "#94a3b8"};">${label}</span>
              ${buildIcon(e.type)}
            </div>
          </td>
          <td style="font-weight:700;color:var(--clr-text);">${e.page}</td>
          <td style="color:var(--clr-text-muted);font-size:0.85rem;">${e.source}</td>
          <td style="color:var(--clr-text-faint);font-family:monospace;font-size:0.78rem;direction:ltr;text-align:right;">${e.ref}</td>
          <td style="color:var(--clr-text-muted);font-size:0.82rem;white-space:nowrap;">${e.time}</td>
        </tr>`;
      }).join("");
    };
    tbody.innerHTML = renderRows(defaultEventsList);
    const filterSel = document.getElementById("events-type-filter");
    const searchInp = document.getElementById("events-search");
    const applyFilter = () => {
      const typeVal = filterSel ? filterSel.value : "";
      const searchVal = searchInp ? searchInp.value.toLowerCase() : "";
      const filtered = defaultEventsList.filter((e) => {
        const matchType = !typeVal || e.type === typeVal;
        const matchSearch = !searchVal || e.page.toLowerCase().includes(searchVal) || e.source.includes(searchVal) || e.ref.includes(searchVal);
        return matchType && matchSearch;
      });
      tbody.innerHTML = filtered.length ? renderRows(filtered) : `<tr><td colspan="5" class="table-empty">\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0645\u0637\u0627\u0628\u0642\u0629</td></tr>`;
    };
    if (filterSel) filterSel.addEventListener("change", applyFilter);
    if (searchInp) searchInp.addEventListener("input", applyFilter);
  }
  function renderLineChartTo(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || data.length === 0) {
      if (container) container.innerHTML = `<div class="chart-empty">\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629</div>`;
      return;
    }
    const W = container.offsetWidth || 600;
    const H = 180;
    const PAD = { top: 20, right: 16, bottom: 40, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const counts = data.map((d) => d.count);
    const maxVal = Math.max(...counts, 1);
    const xScale = (i) => PAD.left + i / Math.max(data.length - 1, 1) * chartW;
    const yScale = (v2) => PAD.top + chartH - v2 / maxVal * chartH;
    const points = data.map((d, i) => `${xScale(i)},${yScale(d.count)}`);
    const pathD = "M" + points.join(" L");
    const areaD = `${pathD} L${xScale(data.length - 1)},${H - PAD.bottom} L${xScale(0)},${H - PAD.bottom} Z`;
    const labelStep = Math.ceil(data.length / 7);
    const xLabels = data.map((d, i) => ({ ...d, i })).filter((_, i) => i % labelStep === 0 || i === data.length - 1).map(({ date, i }) => {
      const d = new Date(date);
      return `<text x="${xScale(i)}" y="${H - 8}" class="chart-label" text-anchor="middle">${d.getDate()}/${d.getMonth() + 1}</text>`;
    }).join("");
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => {
      const v2 = Math.round(maxVal * p);
      const y = yScale(v2);
      return `<line x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}" class="chart-grid"/>
             <text x="${PAD.left - 6}" y="${y + 4}" class="chart-label" text-anchor="end">${fmt(v2)}</text>`;
    }).join("");
    const dots = data.map(
      (d, i) => `<circle cx="${xScale(i)}" cy="${yScale(d.count)}" r="3" class="chart-dot"/>`
    ).join("");
    container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" class="chart-svg">
      <defs>
        <linearGradient id="area-grad-${containerId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--clr-primary)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--clr-primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaD}" fill="url(#area-grad-${containerId})"/>
      <path d="${pathD}" fill="none" stroke="var(--clr-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${xLabels}
    </svg>`;
  }
  function renderAnalyticsSection(summary, pages, timeSeries) {
    if (!summary) return;
    const visitors = summary.totalVisitors || 0;
    const pageviews = summary.totalPageViews || 0;
    const whatsapp = summary.whatsappClicks || 0;
    const hotline = summary.hotlineClicks || 0;
    const forms = summary.formSubmits || 0;
    const conversion = summary.conversionRate || 0;
    const interactions = whatsapp + hotline;
    const uniqueEst = Math.round(visitors * 0.73);
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const setW = (id, pct) => {
      const el = document.getElementById(id);
      if (el) el.style.width = Math.min(100, Math.max(0, pct)) + "%";
    };
    set("av-visitors", fmt(visitors));
    set("av-unique", fmt(uniqueEst));
    set("av-pageviews", fmt(pageviews));
    set("av-interactions", fmt(interactions));
    set("av-forms", fmt(forms));
    set("av-conversion", conversion + "%");
    const pvRatio = visitors ? (pageviews / visitors).toFixed(2) : "0.00";
    const interactPct = visitors ? (interactions / visitors * 100).toFixed(1) : "0.0";
    set("av-pv-badge", pvRatio + " \u0632/\u0635");
    set("av-pv-ratio", pvRatio + " \u0645\u0634\u0627\u0647\u062F\u0629 \u0644\u0643\u0644 \u0632\u0627\u0626\u0631");
    set("av-interact-badge", interactPct + "%");
    set("av-conv-badge", "\u25B2 " + conversion + "%");
    const engagement = pageviews;
    const ctaClicks = interactions;
    set("avf-val-visitors", fmt(visitors));
    set("avf-val-engagement", fmt(engagement));
    set("avf-val-cta", fmt(ctaClicks));
    set("avf-val-forms", fmt(forms));
    setW("avf-bar-visitors", 100);
    setW("avf-bar-engagement", visitors > 0 ? engagement / visitors * 100 : 40);
    setW("avf-bar-cta", visitors > 0 ? ctaClicks / visitors * 100 : 20);
    setW("avf-bar-forms", visitors > 0 ? forms / visitors * 100 : 5);
    const engPct = visitors > 0 ? (engagement / visitors * 100).toFixed(1) : "0.0";
    const ctaPct = engagement > 0 ? (ctaClicks / engagement * 100).toFixed(1) : "0.0";
    const frmPct = ctaClicks > 0 ? (forms / ctaClicks * 100).toFixed(1) : "0.0";
    set("avf-pct-engagement", engPct + "% \u062A\u062D\u0648\u064A\u0644");
    set("avf-pct-cta", ctaPct + "% \u062A\u062D\u0648\u064A\u0644");
    set("avf-pct-forms", frmPct + "% \u062A\u062D\u0648\u064A\u0644");
    const maxChan = Math.max(whatsapp, hotline, forms, 1);
    set("avc-wa-val", fmt(whatsapp) + " \u0646\u0642\u0631\u0629");
    set("avc-hl-val", fmt(hotline) + " \u0645\u0643\u0627\u0644\u0645\u0629");
    set("avc-rq-val", fmt(forms) + " \u0637\u0644\u0628");
    setW("avc-wa-bar", whatsapp / maxChan * 100);
    setW("avc-hl-bar", hotline / maxChan * 100);
    setW("avc-rq-bar", forms / maxChan * 100);
    const tbody = document.getElementById("av-pages-tbody");
    if (tbody) {
      if (!pages || pages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-text-faint);">\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A</td></tr>`;
      } else {
        tbody.innerHTML = pages.map((p) => {
          const views = p.views || 0;
          const pvShare = pageviews > 0 ? views / pageviews : 0;
          const waC = Math.round(whatsapp * pvShare);
          const hlC = Math.round(hotline * pvShare);
          const rqC = Math.round(forms * pvShare);
          const tot = waC + hlC + rqC;
          const convPct = views > 0 ? (tot / views * 100).toFixed(1) + "%" : "0%";
          let pageLabel = p.page;
          if (p.page === "/") pageLabel = "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629";
          else {
            const m = p.page.match(/^\/([a-z\-]+)-maintenance/);
            if (m && m[1]) pageLabel = "\u0635\u064A\u0627\u0646\u0629 " + m[1].charAt(0).toUpperCase() + m[1].slice(1);
          }
          return `<tr>
          <td style="font-weight:700;">${pageLabel}</td>
          <td><span class="badge-active"><span class="badge-active-dot"></span>\u0646\u0634\u0637</span></td>
          <td>${fmt(views)}</td>
          <td style="color:#10b981;font-weight:700;">\u{1F4AC} ${fmt(waC)}</td>
          <td style="color:#f59e0b;font-weight:700;">\u{1F4DE} ${fmt(hlC)}</td>
          <td style="color:#8b5cf6;font-weight:700;">\u{1F527} ${fmt(rqC)}</td>
          <td style="font-weight:900;color:var(--clr-primary);">${convPct}</td>
        </tr>`;
        }).join("");
      }
    }
    renderMultiLineChart("av-multiline-chart", timeSeries, summary);
    renderDonutChart("av-donut-chart", "av-donut-legend", visitors);
  }
  function renderMultiLineChart(containerId, data, summary) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="chart-empty">\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629</div>`;
      return;
    }
    const totalV = (summary == null ? void 0 : summary.totalVisitors) || 1;
    const totalI = ((summary == null ? void 0 : summary.whatsappClicks) || 0) + ((summary == null ? void 0 : summary.hotlineClicks) || 0);
    const totalF = (summary == null ? void 0 : summary.formSubmits) || 0;
    const rateI = totalI / totalV;
    const rateF = totalF / totalV;
    const s1 = data.map((d) => d.count);
    const s2 = data.map((d) => Math.round(d.count * rateI));
    const s3 = data.map((d) => Math.round(d.count * rateF));
    const W = container.offsetWidth || 620;
    const H = 230;
    const PAD = { top: 15, right: 12, bottom: 32, left: 50 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const n = data.length;
    const maxV = Math.max(...s1, 1);
    const xS = (i) => PAD.left + i / Math.max(n - 1, 1) * cW;
    const yS = (v2) => PAD.top + cH - v2 / maxV * cH;
    const buildPath = (s) => "M" + s.map((v2, i) => `${xS(i)},${yS(v2)}`).join(" L");
    const buildArea = (s) => `${buildPath(s)} L${xS(n - 1)},${H - PAD.bottom} L${xS(0)},${H - PAD.bottom} Z`;
    const step = Math.ceil(n / 8);
    const xLabels = data.map((d, i) => ({ d, i })).filter((_, i) => i % step === 0 || i === n - 1).map(({ d, i }) => {
      const dt = new Date(d.date);
      return `<text x="${xS(i)}" y="${H - 6}" class="chart-label" text-anchor="middle">${dt.getDate()}</text>`;
    }).join("");
    const gridLines = [0.25, 0.5, 0.75, 1].map((p) => {
      const v2 = Math.round(maxV * p);
      const y = yS(v2);
      return `<line x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}" class="chart-grid"/>
             <text x="${PAD.left - 6}" y="${y + 4}" class="chart-label" text-anchor="end">${fmt(v2)}</text>`;
    }).join("");
    const gid = "mg" + containerId.replace(/\W/g, "");
    container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" class="chart-svg">
      <defs>
        <linearGradient id="${gid}-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${gid}-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.18"/><stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${gid}-3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.14"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${buildArea(s1)}" fill="url(#${gid}-1)"/>
      <path d="${buildArea(s2)}" fill="url(#${gid}-2)"/>
      <path d="${buildArea(s3)}" fill="url(#${gid}-3)"/>
      <path d="${buildPath(s1)}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${buildPath(s2)}" fill="none" stroke="#06b6d4" stroke-width="2"   stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${buildPath(s3)}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${xLabels}
    </svg>`;
  }
  function renderDonutChart(chartId, legendId, totalVisitors) {
    const container = document.getElementById(chartId);
    const legend = document.getElementById(legendId);
    if (!container) return;
    if (!totalVisitors || totalVisitors === 0) {
      container.innerHTML = `<div class="chart-empty">\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A</div>`;
      return;
    }
    const sources = [
      { label: "\u0628\u062D\u062B \u062C\u0648\u062C\u0644", color: "#10b981", pct: 0.5 },
      { label: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A", color: "#3b82f6", pct: 0.25 },
      { label: "\u0645\u0628\u0627\u0634\u0631", color: "#f59e0b", pct: 0.15 },
      { label: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", color: "#8b5cf6", pct: 0.1 }
    ];
    const vals = sources.map((s) => ({ ...s, count: Math.round(totalVisitors * s.pct) }));
    const total = vals.reduce((s, v2) => s + v2.count, 0) || 1;
    const cx = 90, cy = 90, R = 72, ri = 45;
    let angle = -Math.PI / 2;
    const slices = vals.map((v2) => {
      const sa = v2.count / total * Math.PI * 2;
      const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
      const x2 = cx + R * Math.cos(angle + sa), y2 = cy + R * Math.sin(angle + sa);
      const ix1 = cx + ri * Math.cos(angle), iy1 = cy + ri * Math.sin(angle);
      const ix2 = cx + ri * Math.cos(angle + sa), iy2 = cy + ri * Math.sin(angle + sa);
      const lg = sa > Math.PI ? 1 : 0;
      const d = `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${ix2} ${iy2} A${ri} ${ri} 0 ${lg} 0 ${ix1} ${iy1}Z`;
      angle += sa;
      return `<path d="${d}" fill="${v2.color}" opacity="0.9"/>`;
    }).join("");
    container.innerHTML = `
    <svg width="180" height="180" viewBox="0 0 180 180">
      ${slices}
      <circle cx="${cx}" cy="${cy}" r="${ri - 2}" fill="var(--clr-bg)"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--clr-text)">${fmt(totalVisitors)}</text>
      <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="9" fill="var(--clr-text-muted)">\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0632\u0648\u0627\u0631</text>
    </svg>`;
    if (legend) {
      legend.innerHTML = vals.map((v2) => `
      <div class="av-donut-legend-item">
        <div class="av-donut-legend-label">
          <span class="av-donut-legend-dot" style="background:${v2.color};"></span>${v2.label}
        </div>
        <span class="av-donut-legend-val">${fmt(v2.count)}</span>
      </div>`).join("");
    }
  }
  function subscribeAll(range) {
    clearSubs();
    const { start, end } = getDateRange(range);
    let _latestSummary = null;
    let _latestPages = null;
    let _latestSeries = null;
    const periodTag = document.getElementById("av-period-tag");
    if (periodTag) {
      const rangeLabels = { today: "\u0627\u0644\u064A\u0648\u0645", yesterday: "\u0623\u0645\u0633", "7d": "\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645", "30d": "\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631", all: "\u0643\u0644 \u0627\u0644\u0648\u0642\u062A" };
      periodTag.textContent = rangeLabels[range] || "\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645";
    }
    _unsubs.push(
      convex.onUpdate(
        "analytics:getSummary",
        { startDate: start, endDate: end },
        (data) => {
          if (data !== void 0) {
            _latestSummary = data;
            renderKPIs(data);
            renderAnalyticsSection(_latestSummary, _latestPages, _latestSeries);
          }
        }
      )
    );
    _unsubs.push(
      convex.onUpdate(
        "analytics:getTimeSeries",
        { startDate: start, endDate: end },
        (data) => {
          if (data !== void 0) {
            _latestSeries = data;
            renderLineChartTo("chart-visitors", data);
            renderAnalyticsSection(_latestSummary, _latestPages, _latestSeries);
          }
        }
      )
    );
    _unsubs.push(
      convex.onUpdate(
        "analytics:getCTABreakdown",
        { startDate: start, endDate: end },
        (data) => {
          if (data !== void 0) {
            renderBarChart(data);
          }
        }
      )
    );
    _unsubs.push(
      convex.onUpdate(
        "analytics:getPageBreakdown",
        { startDate: start, endDate: end },
        (data) => {
          if (data !== void 0) {
            _latestPages = data;
            renderPageBreakdown(data);
            renderAnalyticsSection(_latestSummary, _latestPages, _latestSeries);
          }
        }
      )
    );
    _unsubs.push(
      convex.onUpdate(
        "analytics:getRecentEvents",
        { limit: 20 },
        (data) => {
          if (data !== void 0) {
            renderRecentEvents(data);
          }
        }
      )
    );
    _unsubs.push(
      convex.onUpdate(
        "analytics:getSettings",
        {},
        (data) => {
          if (data !== void 0) {
            const fields = {
              "set-whatsapp": data.whatsappNumber,
              "set-hotline": data.hotlineNumber,
              "set-hours": data.workingHours,
              "set-email": data.contactEmail,
              "set-hero-title": data.heroTitle,
              "set-hero-sub": data.heroSubtitle,
              "set-services-title": data.servicesTitle,
              "set-services-sub": data.servicesSubtitle,
              "set-testimonials-title": data.testimonialsTitle,
              "set-why-title": data.whyUsTitle,
              "set-why-sub": data.whyUsSubtitle
            };
            for (const [id, val] of Object.entries(fields)) {
              const el = document.getElementById(id);
              if (el && document.activeElement !== el) el.value = val;
            }
          }
        }
      )
    );
    _unsubs.push(
      convex.onUpdate(
        "analytics:getRequestsSummary",
        {},
        (data) => {
          if (data !== void 0) {
            renderRequestsSummary(data);
          }
        }
      )
    );
  }
  function subscribeRequests() {
    if (_reqUnsub) {
      try {
        _reqUnsub();
      } catch (_) {
      }
    }
    _reqUnsub = convex.onUpdate(
      "analytics:getMaintenanceRequests",
      { searchQuery: _searchQuery, statusFilter: _statusFilter },
      (data) => {
        if (data !== void 0) {
          renderRequestsTable(data);
        }
      }
    );
  }
  function renderRequestsSummary(summary) {
    const fields = {
      "req-kpi-total": summary.total,
      "req-kpi-new": summary.newCount,
      "req-kpi-pending": summary.pendingCount,
      "req-kpi-completed": summary.completedCount,
      "req-kpi-cancelled": summary.cancelledCount
    };
    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el) el.textContent = fmt(val);
    }
  }
  function renderRequestsTable(requests) {
    const tbody = document.getElementById("requests-tbody");
    if (!tbody) return;
    if (requests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--clr-text-muted);">\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0635\u064A\u0627\u0646\u0629 \u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631.</td></tr>`;
      return;
    }
    tbody.innerHTML = requests.map((req) => {
      const dateStr = new Date(req.timestamp).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      let statusText = "\u062C\u062F\u064A\u062F";
      let statusClass = "req-status-new";
      if (req.status === "pending") {
        statusText = "\u0642\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629";
        statusClass = "req-status-pending";
      } else if (req.status === "completed") {
        statusText = "\u0645\u0643\u062A\u0645\u0644";
        statusClass = "req-status-completed";
      } else if (req.status === "cancelled") {
        statusText = "\u0645\u0644\u063A\u064A";
        statusClass = "req-status-cancelled";
      }
      return `
      <tr>
        <td><span style="color:var(--clr-text-muted);font-size:0.85rem;">${req.requestId}</span></td>
        <td style="font-weight:800;">${req.clientName}</td>
        <td>${req.appliance}</td>
        <td>${req.problem}</td>
        <td style="text-transform:uppercase;color:var(--clr-text-muted);font-size:0.85rem;">${req.sourcePage}</td>
        <td style="color:var(--clr-text-muted);font-size:0.85rem;">${req.timestamp ? new Date(req.timestamp).toISOString().split("T")[0] : dateStr}</td>
        <td><span class="req-status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div style="display:flex;gap:8px;justify-content:center;align-items:center;">
            <button class="action-btn action-btn-delete" data-id="${req._id}" title="\u062D\u0630\u0641" style="background:none;border:none;padding:2px;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">\u{1F5D1}\uFE0F</button>
            <button class="action-btn action-btn-edit" data-id="${req._id}" title="\u062A\u0639\u062F\u064A\u0644" style="background:none;border:none;padding:2px;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">\u270F\uFE0F</button>
            <button class="action-btn action-btn-view" data-id="${req._id}" title="\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644" style="background:none;border:none;padding:2px;cursor:pointer;color:var(--clr-text-muted);font-size:1.1rem;opacity:0.6;transition:opacity 0.2s;">\u{1F517}</button>
          </div>
        </td>
      </tr>
    `;
    }).join("");
    tbody.querySelectorAll(".action-btn-view").forEach((btn) => {
      btn.addEventListener("click", () => openViewRequestModal(btn.dataset.id, requests));
    });
    tbody.querySelectorAll(".action-btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => openEditRequestModal(btn.dataset.id, requests));
    });
    tbody.querySelectorAll(".action-btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => handleDeleteRequest(btn.dataset.id));
    });
  }
  function openViewRequestModal(id, requests) {
    const req = requests.find((r) => r._id === id);
    if (!req) return;
    document.getElementById("view-req-id").textContent = req.requestId;
    document.getElementById("view-req-name").textContent = req.clientName;
    document.getElementById("view-req-phone").textContent = req.clientPhone;
    document.getElementById("view-req-appliance").textContent = req.appliance;
    document.getElementById("view-req-problem").textContent = req.problem;
    document.getElementById("view-req-gov").textContent = req.governorate;
    document.getElementById("view-req-page").textContent = req.sourcePage;
    const date = new Date(req.timestamp);
    document.getElementById("view-req-date").textContent = date.toLocaleString("ar-EG");
    const statusEl = document.getElementById("view-req-status");
    statusEl.className = "req-status-badge";
    if (req.status === "new") {
      statusEl.textContent = "\u062C\u062F\u064A\u062F";
      statusEl.classList.add("req-status-new");
    } else if (req.status === "pending") {
      statusEl.textContent = "\u0642\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629";
      statusEl.classList.add("req-status-pending");
    } else if (req.status === "completed") {
      statusEl.textContent = "\u0645\u0643\u062A\u0645\u0644";
      statusEl.classList.add("req-status-completed");
    } else if (req.status === "cancelled") {
      statusEl.textContent = "\u0645\u0644\u063A\u064A";
      statusEl.classList.add("req-status-cancelled");
    }
    document.getElementById("btn-view-call").href = `tel:${req.clientPhone}`;
    const waMsg = `\u0645\u0631\u062D\u0628\u0627\u064B \u0623. ${req.clientName}\u060C \u0645\u0639 \u062D\u0636\u0631\u062A\u0643 \u0645\u0631\u0643\u0632 \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0644\u0644\u062A\u0648\u0643\u064A\u0644\u0627\u062A \u0628\u062E\u0635\u0648\u0635 \u0637\u0644\u0628 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0642\u062F\u0645 \u0644\u062C\u0647\u0627\u0632 ${req.appliance} (\u0639\u0637\u0644: ${req.problem}).`;
    document.getElementById("btn-view-wa").href = `https://wa.me/${req.clientPhone.startsWith("0") ? "2" + req.clientPhone : req.clientPhone}?text=${encodeURIComponent(waMsg)}`;
    document.getElementById("modal-view-request").style.display = "flex";
  }
  function openEditRequestModal(id, requests) {
    const req = requests.find((r) => r._id === id);
    if (!req) return;
    document.getElementById("edit-modal-title").textContent = "\u270F\uFE0F \u062A\u0639\u062F\u064A\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u064A\u0627\u0646\u0629";
    document.getElementById("edit-req-id").value = req._id;
    document.getElementById("edit-req-name").value = req.clientName;
    document.getElementById("edit-req-phone").value = req.clientPhone;
    document.getElementById("edit-req-appliance").value = req.appliance;
    document.getElementById("edit-req-problem").value = req.problem;
    document.getElementById("edit-req-gov").value = req.governorate;
    document.getElementById("edit-req-page").value = req.sourcePage;
    document.getElementById("edit-req-status-select").value = req.status;
    document.getElementById("modal-edit-request").style.display = "flex";
  }
  async function handleDeleteRequest(id) {
    if (confirm("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u063A\u0628\u062A\u0643 \u0641\u064A \u062D\u0630\u0641 \u0637\u0644\u0628 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0647\u0630\u0627 \u0646\u0647\u0627\u0626\u064A\u0627\u064B\u061F")) {
      try {
        await convex.mutation("analytics:deleteRequest", { id });
      } catch (err) {
        alert("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0630\u0641: " + err.message);
      }
    }
  }
  var SECTION_LABELS = {
    overview: { title: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", breadcrumb: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 > \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" },
    analytics: { title: "\u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A", breadcrumb: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 > \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A" },
    requests: { title: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629", breadcrumb: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 > \u0627\u0644\u0637\u0644\u0628\u0627\u062A" },
    pages: { title: "\u0635\u0641\u062D\u0627\u062A \u0627\u0644\u062E\u062F\u0645\u0627\u062A", breadcrumb: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 > \u0627\u0644\u0635\u0641\u062D\u0627\u062A" },
    settings: { title: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639", breadcrumb: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 > \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" },
    events: { title: "\u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A", breadcrumb: "\u0627\u0644\u0646\u0638\u0627\u0645 > \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A" },
    users: { title: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646", breadcrumb: "\u0627\u0644\u0646\u0638\u0627\u0645 > \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646" },
    "system-settings": { title: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645", breadcrumb: "\u0627\u0644\u0646\u0638\u0627\u0645 > \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" }
  };
  function showSection(id) {
    var _a2;
    document.querySelectorAll(".dash-section").forEach((s) => s.hidden = true);
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    const section = document.getElementById("section-" + id);
    if (section) section.hidden = false;
    const navItem = document.querySelector(`.nav-item[data-section="${id}"]`);
    if (navItem) navItem.classList.add("active");
    const labels = SECTION_LABELS[id];
    if (labels) {
      const titleEl = document.querySelector(".topbar-title");
      const breadEl = document.querySelector(".topbar-breadcrumbs");
      if (titleEl) titleEl.textContent = labels.title;
      if (breadEl) breadEl.textContent = labels.breadcrumb;
    }
    if (id === "pages") {
      renderPageBreakdown([]);
    }
    if (window.innerWidth <= 768) {
      (_a2 = document.getElementById("sidebar")) == null ? void 0 : _a2.classList.remove("open");
      const overlay = document.getElementById("sidebar-overlay");
      if (overlay) overlay.style.display = "none";
    }
  }
  var ROLE_META = {
    owner: { label: "\u0627\u0644\u0645\u0627\u0644\u0643", color: "#d946ef", icon: "\u{1F451}" },
    admin: { label: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645", color: "#ef4444", icon: "\u{1F6E1}\uFE0F" },
    editor: { label: "\u0645\u062D\u0631\u0631", color: "#3b82f6", icon: "\u270F\uFE0F" },
    media_buyer: { label: "\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631", color: "#f59e0b", icon: "\u{1F4CA}" },
    viewer: { label: "\u0645\u0634\u0627\u0647\u062F", color: "#10b981", icon: "\u{1F441}\uFE0F" }
  };
  var _allUsers = [];
  var _myPerms = null;
  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 6e4);
    const hours = Math.floor(diff / 36e5);
    const days = Math.floor(diff / 864e5);
    if (mins < 1) return "\u0627\u0644\u0622\u0646";
    if (mins < 60) return `\u0645\u0646\u0630 ${mins} \u062F\u0642\u064A\u0642\u0629`;
    if (hours < 24) return `\u0645\u0646\u0630 ${hours} \u0633\u0627\u0639\u0629`;
    return `\u0645\u0646\u0630 ${days} \u064A\u0648\u0645`;
  }
  function renderUserRow(u, isCurrentUser) {
    var _a2;
    const meta = ROLE_META[u.role] || { label: u.role, color: "#94a3b8", icon: "\u{1F464}" };
    const statusBadge = u.status === "active" ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.12);color:#10b981;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;">\u25CF \u0646\u0634\u0637</span>` : `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.12);color:#ef4444;padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:600;">\u2297 \u0645\u0648\u0642\u0648\u0641</span>`;
    const lastActive = u.lastActiveAt ? timeAgo(u.lastActiveAt) : ((_a2 = u.clerkId) == null ? void 0 : _a2.startsWith("pending_")) ? "\u0644\u0645 \u064A\u0633\u062C\u0644 \u0628\u0639\u062F" : "\u2014";
    const avatarInitial = (u.name || "?").charAt(0).toUpperCase();
    const canManage = (_myPerms == null ? void 0 : _myPerms.role) === "owner";
    const actionMenu = canManage ? `
    <div class="user-action-wrap" style="position:relative;display:inline-block;">
      <button class="icon-btn" onclick="toggleUserMenu('${u._id}')" style="padding:4px 8px;border-radius:6px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </button>
      <div id="user-menu-${u._id}" style="display:none;position:absolute;left:0;top:110%;background:var(--clr-surface-2);border:1px solid var(--clr-border);border-radius:10px;min-width:160px;z-index:100;box-shadow:0 4px 24px rgba(0,0,0,.3);overflow:hidden;">
        <button onclick="handleChangeRole('${u._id}', '${u.role}')" style="width:100%;text-align:right;padding:0.6rem 1rem;background:none;border:none;color:var(--clr-text);font-family:Cairo,sans-serif;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='rgba(59,130,246,0.1)'" onmouseout="this.style.background='none'">
          \u270F\uFE0F \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u062F\u0648\u0631
        </button>
        ${!isCurrentUser ? `
        <button onclick="handleToggleStatus('${u._id}')" style="width:100%;text-align:right;padding:0.6rem 1rem;background:none;border:none;color:${u.status === "active" ? "#f59e0b" : "#10b981"};font-family:Cairo,sans-serif;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='rgba(245,158,11,0.1)'" onmouseout="this.style.background='none'">
          ${u.status === "active" ? "\u2297 \u062A\u0639\u0644\u064A\u0642 \u0627\u0644\u062D\u0633\u0627\u0628" : "\u2713 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628"}
        </button>
        <button onclick="handleDeleteUser('${u._id}', '${u.name}')" style="width:100%;text-align:right;padding:0.6rem 1rem;background:none;border:none;color:#ef4444;font-family:Cairo,sans-serif;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">
          \u{1F5D1}\uFE0F \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645
        </button>` : ""}
      </div>
    </div>` : `<span style="color:var(--clr-text-faint);font-size:0.78rem;">\u2014</span>`;
    return `
    <tr id="user-row-${u._id}" style="${u.status === "suspended" ? "opacity:0.55;" : ""}">
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          ${u.avatarUrl ? `<img src="${u.avatarUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid ${meta.color}22;" />` : `<div style="width:34px;height:34px;border-radius:50%;background:${meta.color}22;border:2px solid ${meta.color}44;display:flex;align-items:center;justify-content:center;font-weight:700;color:${meta.color};font-size:0.85rem;">${avatarInitial}</div>`}
          <div>
            <div style="font-weight:700;color:var(--clr-text);">${u.name}${isCurrentUser ? ' <span style="font-size:0.7rem;color:#10b981;">(\u0623\u0646\u062A)</span>' : ""}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--clr-text-muted);font-size:0.83rem;direction:ltr;text-align:right;">${u.email}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:5px;background:${meta.color}18;color:${meta.color};padding:3px 10px;border-radius:20px;font-size:0.78rem;font-weight:700;">
          ${meta.icon} ${meta.label}
        </span>
      </td>
      <td>${statusBadge}</td>
      <td style="color:var(--clr-text-muted);font-size:0.82rem;">${lastActive}</td>
      <td>${actionMenu}</td>
    </tr>`;
  }
  window.toggleUserMenu = function(id) {
    document.querySelectorAll("[id^='user-menu-']").forEach((m) => {
      if (m.id !== `user-menu-${id}`) m.style.display = "none";
    });
    const menu = document.getElementById(`user-menu-${id}`);
    if (menu) menu.style.display = menu.style.display === "none" ? "block" : "none";
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-action-wrap")) {
      document.querySelectorAll("[id^='user-menu-']").forEach((m) => m.style.display = "none");
    }
  });
  window.handleChangeRole = async function(userId, currentRole) {
    document.querySelectorAll("[id^='user-menu-']").forEach((m) => m.style.display = "none");
    const chosen = prompt(`\u0627\u062E\u062A\u0631 \u0627\u0644\u062F\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F:
owner \u2014 \u0627\u0644\u0645\u0627\u0644\u0643
admin \u2014 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645
editor \u2014 \u0645\u062D\u0631\u0631
media_buyer \u2014 \u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631
viewer \u2014 \u0645\u0634\u0627\u0647\u062F

\u0623\u062F\u062E\u0644 \u0627\u0644\u0643\u0648\u062F:`);
    if (!chosen) return;
    const validRoles = ["owner", "admin", "editor", "media_buyer", "viewer"];
    if (!validRoles.includes(chosen.trim())) {
      alert("\u062F\u0648\u0631 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D");
      return;
    }
    try {
      await convex.mutation("analytics:updateUserRole", { userId, role: chosen.trim() });
    } catch (err) {
      alert("\u062E\u0637\u0623: " + err.message);
    }
  };
  window.handleToggleStatus = async function(userId) {
    document.querySelectorAll("[id^='user-menu-']").forEach((m) => m.style.display = "none");
    try {
      await convex.mutation("analytics:toggleUserStatus", { userId });
    } catch (err) {
      alert("\u062E\u0637\u0623: " + err.message);
    }
  };
  window.handleDeleteUser = async function(userId, name) {
    document.querySelectorAll("[id^='user-menu-']").forEach((m) => m.style.display = "none");
    if (!confirm(`\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 "${name}"\u061F \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646\u0647.`)) return;
    try {
      await convex.mutation("analytics:deleteDashboardUser", { userId });
    } catch (err) {
      alert("\u062E\u0637\u0623: " + err.message);
    }
  };
  function renderUsersSection(users, currentClerkId) {
    var _a2, _b2, _c;
    _allUsers = users;
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;
    const roleFilter = ((_a2 = document.getElementById("users-role-filter")) == null ? void 0 : _a2.value) || "";
    const searchVal = ((_c = (_b2 = document.getElementById("users-search")) == null ? void 0 : _b2.value) == null ? void 0 : _c.toLowerCase()) || "";
    const filtered = users.filter((u) => {
      var _a3, _b3;
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchSearch = !searchVal || ((_a3 = u.name) == null ? void 0 : _a3.toLowerCase().includes(searchVal)) || ((_b3 = u.email) == null ? void 0 : _b3.toLowerCase().includes(searchVal));
      return matchRole && matchSearch;
    });
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-empty">\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0645\u0637\u0627\u0628\u0642\u0648\u0646</td></tr>`;
      return;
    }
    tbody.innerHTML = filtered.map((u) => renderUserRow(u, u.clerkId === currentClerkId)).join("");
  }
  function subscribeUsers(currentClerkId) {
    const unsub = convex.onUpdate("analytics:listDashboardUsers", {}, (users) => {
      renderUsersSection(users, currentClerkId);
    });
    _unsubs.push(unsub);
    const unsubPerms = convex.onUpdate("analytics:getMyPermissions", {}, (perms) => {
      _myPerms = perms;
      applyRoleRestrictions(perms);
    });
    _unsubs.push(unsubPerms);
  }
  function applyRoleRestrictions(perms) {
    if (!perms) return;
    const restrictions = {
      canViewRequests: ["requests"],
      canViewSettings: ["settings"],
      canManageUsers: ["users"]
    };
    for (const [perm, sections] of Object.entries(restrictions)) {
      sections.forEach((section) => {
        var _a2;
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        if (navItem) navItem.style.display = ((_a2 = perms.permissions) == null ? void 0 : _a2[perm]) === false ? "none" : "";
      });
    }
    const addBtn = document.getElementById("btn-open-add-user");
    if (addBtn) addBtn.style.display = perms.role === "owner" ? "" : "none";
  }
  function initUsersSection(currentClerkId) {
    const roleFilter = document.getElementById("users-role-filter");
    const searchInp = document.getElementById("users-search");
    if (roleFilter) roleFilter.addEventListener("change", () => renderUsersSection(_allUsers, currentClerkId));
    if (searchInp) searchInp.addEventListener("input", () => renderUsersSection(_allUsers, currentClerkId));
    const roleSelect = document.getElementById("add-user-role");
    if (roleSelect) {
      roleSelect.addEventListener("change", () => {
        const permsMap = {
          owner: { viewAnalytics: true, viewRequests: true, editRequests: true, viewSettings: true, editSettings: true, manageUsers: true },
          admin: { viewAnalytics: true, viewRequests: true, editRequests: true, viewSettings: true, editSettings: true, manageUsers: false },
          editor: { viewAnalytics: true, viewRequests: true, editRequests: true, viewSettings: true, editSettings: false, manageUsers: false },
          media_buyer: { viewAnalytics: true, viewRequests: false, editRequests: false, viewSettings: false, editSettings: false, manageUsers: false },
          viewer: { viewAnalytics: true, viewRequests: true, editRequests: false, viewSettings: false, editSettings: false, manageUsers: false }
        };
        const selected = roleSelect.value;
        if (selected && permsMap[selected]) {
          const p = permsMap[selected];
          document.getElementById("add-perm-view-analytics").checked = p.viewAnalytics;
          document.getElementById("add-perm-view-requests").checked = p.viewRequests;
          document.getElementById("add-perm-edit-requests").checked = p.editRequests;
          document.getElementById("add-perm-view-settings").checked = p.viewSettings;
          document.getElementById("add-perm-edit-settings").checked = p.editSettings;
          document.getElementById("add-perm-manage-users").checked = p.manageUsers;
        }
      });
    }
    const addUserForm = document.getElementById("add-user-form");
    if (addUserForm) {
      addUserForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("add-user-submit-btn");
        const origText = btn ? btn.innerHTML : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0636\u0627\u0641\u0629...";
        }
        const name = document.getElementById("add-user-name").value.trim();
        const email = document.getElementById("add-user-email").value.trim();
        const role = document.getElementById("add-user-role").value;
        const permissions = {
          canViewAnalytics: document.getElementById("add-perm-view-analytics").checked,
          canViewRequests: document.getElementById("add-perm-view-requests").checked,
          canEditRequests: document.getElementById("add-perm-edit-requests").checked,
          canViewSettings: document.getElementById("add-perm-view-settings").checked,
          canEditSettings: document.getElementById("add-perm-edit-settings").checked,
          canManageUsers: document.getElementById("add-perm-manage-users").checked
        };
        try {
          await convex.mutation("analytics:inviteDashboardUser", { name, email, role, permissions });
          document.getElementById("modal-add-user").style.display = "none";
          addUserForm.reset();
          alert(`\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 "${name}" \u0628\u0635\u0644\u0627\u062D\u064A\u0627\u062A\u0647 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0628\u0646\u062C\u0627\u062D! \u{1F389}`);
        } catch (err) {
          alert("\u062E\u0637\u0623: " + err.message);
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = origText;
          }
        }
      });
    }
    const openAddUserBtn = document.getElementById("btn-open-add-user");
    if (openAddUserBtn) {
      openAddUserBtn.addEventListener("click", () => {
        document.getElementById("modal-add-user").style.display = "flex";
      });
    }
  }
  window.openSysModal = function(name) {
    const modal = document.getElementById("modal-sys-" + name);
    if (modal) {
      modal.style.display = "flex";
      if (name === "language") {
        const lang = localStorage.getItem("sys-lang") || "ar";
        const tz = localStorage.getItem("sys-tz") || "Cairo";
        const langSelect = document.getElementById("sys-lang-select");
        const tzSelect = document.getElementById("sys-tz-select");
        if (langSelect) langSelect.value = lang;
        if (tzSelect) tzSelect.value = tz;
      } else if (name === "notifications") {
        const emailNotif = localStorage.getItem("sys-notif-email") !== "false";
        const waNotif = localStorage.getItem("sys-notif-wa") !== "false";
        const soundNotif = localStorage.getItem("sys-notif-sound") !== "false";
        const emailEl = document.getElementById("sys-notif-email");
        const waEl = document.getElementById("sys-notif-wa");
        const soundEl = document.getElementById("sys-notif-sound");
        if (emailEl) emailEl.checked = emailNotif;
        if (waEl) waEl.checked = waNotif;
        if (soundEl) soundEl.checked = soundNotif;
      } else if (name === "appearance") {
        const currentTheme = localStorage.getItem("sys-theme") || "dark";
        const radio = document.querySelector(`input[name="sys-theme"][value="${currentTheme}"]`);
        if (radio) radio.checked = true;
      }
    }
  };
  window.closeSysModal = function(name) {
    const modal = document.getElementById("modal-sys-" + name);
    if (modal) modal.style.display = "none";
  };
  function playAlertBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext block by user interaction guidelines", e);
    }
  }
  function initSystemSettings() {
    const langForm = document.getElementById("sys-language-form");
    if (langForm) {
      langForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const lang = document.getElementById("sys-lang-select").value;
        const tz = document.getElementById("sys-tz-select").value;
        localStorage.setItem("sys-lang", lang);
        localStorage.setItem("sys-tz", tz);
        if (lang === "en") {
          document.documentElement.dir = "ltr";
          document.body.style.direction = "ltr";
          document.querySelectorAll(".nav-category, .nav-label, .topbar-title, .anal-main-title, .anal-main-sub").forEach((el) => {
            el.style.textAlign = "left";
          });
        } else {
          document.documentElement.dir = "rtl";
          document.body.style.direction = "rtl";
          document.querySelectorAll(".nav-category, .nav-label, .topbar-title, .anal-main-title, .anal-main-sub").forEach((el) => {
            el.style.textAlign = "right";
          });
        }
        closeSysModal("language");
        alert("\u062A\u0645 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0644\u063A\u0629 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629 \u0628\u0646\u062C\u0627\u062D! \u{1F310}");
      });
    }
    const notifForm = document.getElementById("sys-notifications-form");
    if (notifForm) {
      notifForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("sys-notif-email").checked;
        const wa = document.getElementById("sys-notif-wa").checked;
        const sound = document.getElementById("sys-notif-sound").checked;
        localStorage.setItem("sys-notif-email", email);
        localStorage.setItem("sys-notif-wa", wa);
        localStorage.setItem("sys-notif-sound", sound);
        if (sound) playAlertBeep();
        closeSysModal("notifications");
        alert("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0628\u0646\u062C\u0627\u062D! \u{1F514}");
      });
    }
    const secForm = document.getElementById("sys-security-form");
    if (secForm) {
      secForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentPass = document.getElementById("sys-sec-current").value;
        const newPass = document.getElementById("sys-sec-new").value;
        const enable2fa = document.getElementById("sys-sec-2fa").checked;
        if (newPass.length < 6) {
          alert("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u064A\u062C\u0628 \u0623\u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 6 \u0623\u062D\u0631\u0641");
          return;
        }
        if (window.Clerk) {
          try {
            alert("\u062A\u062F\u0627\u0631 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643 \u0628\u0623\u0645\u0627\u0646 \u062A\u0627\u0645 \u0639\u0628\u0631 Clerk. \u0633\u064A\u062A\u0645 \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0623\u0645\u0627\u0646 \u062D\u0633\u0627\u0628 Clerk \u0627\u0644\u0622\u0646 \u0644\u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631.");
            window.Clerk.openUserProfile();
          } catch (e2) {
            console.warn("Clerk openUserProfile failed:", e2);
          }
        } else {
          alert("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646 \u0648\u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0628\u0646\u062C\u0627\u062D! \u{1F6E1}\uFE0F");
        }
        closeSysModal("security");
        secForm.reset();
      });
    }
    const appForm = document.getElementById("sys-appearance-form");
    if (appForm) {
      appForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedTheme = document.querySelector('input[name="sys-theme"]:checked').value;
        localStorage.setItem("sys-theme", selectedTheme);
        document.body.classList.remove("theme-light", "theme-glass");
        if (selectedTheme === "light") {
          document.body.classList.add("theme-light");
        } else if (selectedTheme === "glass") {
          document.body.classList.add("theme-glass");
        }
        closeSysModal("appearance");
        alert("\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0633\u0645\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u0645\u0638\u0647\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u0646\u062C\u0627\u062D! \u{1F3A8}");
      });
    }
    const activeTheme = localStorage.getItem("sys-theme") || "dark";
    document.body.classList.remove("theme-light", "theme-glass");
    if (activeTheme === "light") {
      document.body.classList.add("theme-light");
    } else if (activeTheme === "glass") {
      document.body.classList.add("theme-glass");
    }
    const btnExport = document.getElementById("btn-sys-export");
    if (btnExport) {
      btnExport.addEventListener("click", async () => {
        try {
          const list = await convex.query("analytics:getMaintenanceRequests", { searchQuery: "", statusFilter: "all" });
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list || []));
          const dlAnchor = document.createElement("a");
          dlAnchor.setAttribute("href", dataStr);
          dlAnchor.setAttribute("download", `maintenance_backup_${Date.now()}.json`);
          dlAnchor.click();
        } catch (err) {
          alert("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A: " + err.message);
        }
      });
    }
    const btnImport = document.getElementById("btn-sys-import");
    if (btnImport) {
      btnImport.addEventListener("click", async () => {
        const fileInput = document.getElementById("sys-import-file");
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
          alert("\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0644\u0641 JSON \u0635\u0627\u0644\u062D \u0644\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0648\u0644\u0627\u064B");
          return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (!Array.isArray(imported)) {
              alert("\u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 (Array) \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A.");
              return;
            }
            btnImport.textContent = "\u062C\u0627\u0631\u064A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0637\u0644\u0628\u0627\u062A...";
            btnImport.disabled = true;
            let count = 0;
            for (const req of imported) {
              const payload = {
                name: req.name || "\u0645\u0633\u062A\u0648\u0631\u062F",
                phone: req.phone || "\u2014",
                appliance: req.appliance || "\u2014",
                problem: req.problem || "\u2014",
                gov: req.gov || "\u2014",
                page: req.page || "general",
                status: req.status || "new"
              };
              await convex.mutation("analytics:createRequestDashboard", payload);
              count++;
            }
            alert(`\u062A\u0645 \u0628\u0646\u062C\u0627\u062D \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0648\u0627\u0633\u062A\u064A\u0631\u0627\u062F ${count} \u0637\u0644\u0628 \u0635\u064A\u0627\u0646\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A! \u{1F389}`);
            closeSysModal("backup");
            fileInput.value = "";
          } catch (err) {
            alert("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0644\u0641: " + err.message);
          } finally {
            btnImport.textContent = "\u{1F4E4} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0622\u0646";
            btnImport.disabled = false;
          }
        };
        reader.readAsText(file);
      });
    }
  }
  (async function main() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    try {
      const clerk = await initClerk();
      if (!clerk.user) {
        document.getElementById("auth-wall").hidden = false;
        document.getElementById("dashboard-app").hidden = true;
        clerk.mountSignIn(document.getElementById("clerk-sign-in"), {
          forceRedirectUrl: "/dashboard/"
        });
        return;
      }
      convex.setAuth(async () => {
        var _a3;
        try {
          const token = await ((_a3 = clerk.session) == null ? void 0 : _a3.getToken({ template: "convex" }));
          return token != null ? token : null;
        } catch {
          return null;
        }
      });
      document.getElementById("auth-wall").hidden = true;
      document.getElementById("dashboard-app").hidden = false;
      const user = clerk.user;
      const name = (_c = (_b2 = user.fullName) != null ? _b2 : (_a2 = user.primaryEmailAddress) == null ? void 0 : _a2.emailAddress) != null ? _c : "Admin";
      const avatar = user.imageUrl;
      const userNameEl = document.getElementById("user-name");
      const userAvatarEl = document.getElementById("user-avatar");
      if (userNameEl) userNameEl.textContent = name;
      if (userAvatarEl && avatar) {
        userAvatarEl.src = avatar;
        userAvatarEl.hidden = false;
      }
      (_d = document.getElementById("sign-out-btn")) == null ? void 0 : _d.addEventListener("click", async () => {
        clearSubs();
        await clerk.signOut();
        window.location.reload();
      });
      document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
        item.addEventListener("click", () => showSection(item.dataset.section));
      });
      let activeRange = "7d";
      const handleRangeChange = (range) => {
        activeRange = range;
        document.querySelectorAll("[data-range], [data-anal-range]").forEach((b) => {
          if (b.dataset.range === range || b.dataset.anal - range === range || b.dataset.analRange === range) {
            b.classList.add("range-active");
          } else {
            b.classList.remove("range-active");
          }
        });
        subscribeAll(activeRange);
      };
      document.querySelectorAll("[data-range]").forEach((btn) => {
        btn.addEventListener("click", () => handleRangeChange(btn.dataset.range));
      });
      document.querySelectorAll("[data-anal-range]").forEach((btn) => {
        btn.addEventListener("click", () => handleRangeChange(btn.dataset.analRange || btn.getAttribute("data-anal-range")));
      });
      const overlay = document.createElement("div");
      overlay.id = "sidebar-overlay";
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:199;display:none;backdrop-filter:blur(2px);";
      document.body.appendChild(overlay);
      const openSidebar = () => {
        var _a3;
        (_a3 = document.getElementById("sidebar")) == null ? void 0 : _a3.classList.add("open");
        overlay.style.display = "block";
      };
      const closeSidebar = () => {
        var _a3;
        (_a3 = document.getElementById("sidebar")) == null ? void 0 : _a3.classList.remove("open");
        overlay.style.display = "none";
      };
      (_e = document.getElementById("sidebar-toggle")) == null ? void 0 : _e.addEventListener("click", closeSidebar);
      (_f = document.getElementById("sidebar-toggle-hamburger")) == null ? void 0 : _f.addEventListener("click", openSidebar);
      overlay.addEventListener("click", closeSidebar);
      (_g = document.getElementById("link-show-all-pages")) == null ? void 0 : _g.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("pages");
      });
      const settingsForm = document.getElementById("settings-form");
      if (settingsForm) {
        settingsForm.addEventListener("submit", async (e) => {
          var _a3, _b3, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j, _k;
          e.preventDefault();
          const saveBtn = settingsForm.querySelector("button[type='submit']");
          const origText = saveBtn ? saveBtn.textContent : "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A";
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...";
          }
          const payload = {
            whatsappNumber: ((_a3 = document.getElementById("set-whatsapp")) == null ? void 0 : _a3.value) || "",
            hotlineNumber: ((_b3 = document.getElementById("set-hotline")) == null ? void 0 : _b3.value) || "",
            workingHours: ((_c2 = document.getElementById("set-hours")) == null ? void 0 : _c2.value) || "",
            contactEmail: ((_d2 = document.getElementById("set-email")) == null ? void 0 : _d2.value) || "",
            heroTitle: ((_e2 = document.getElementById("set-hero-title")) == null ? void 0 : _e2.value) || "",
            heroSubtitle: ((_f2 = document.getElementById("set-hero-sub")) == null ? void 0 : _f2.value) || "",
            servicesTitle: ((_g2 = document.getElementById("set-services-title")) == null ? void 0 : _g2.value) || "",
            servicesSubtitle: ((_h2 = document.getElementById("set-services-sub")) == null ? void 0 : _h2.value) || "",
            testimonialsTitle: ((_i2 = document.getElementById("set-testimonials-title")) == null ? void 0 : _i2.value) || "",
            whyUsTitle: ((_j = document.getElementById("set-why-title")) == null ? void 0 : _j.value) || "",
            whyUsSubtitle: ((_k = document.getElementById("set-why-sub")) == null ? void 0 : _k.value) || ""
          };
          try {
            await convex.mutation("analytics:updateSettings", payload);
            alert("\u062A\u0645 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u0628\u0646\u062C\u0627\u062D! \u{1F389}");
          } catch (err) {
            console.error("Save settings error:", err);
            alert("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A: " + err.message);
          } finally {
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = origText;
            }
          }
        });
      }
      const mockBtn = document.getElementById("btn-generate-mock");
      if (mockBtn) {
        mockBtn.addEventListener("click", async () => {
          const statusEl = document.getElementById("mock-status");
          if (!statusEl) return;
          statusEl.style.display = "block";
          statusEl.style.background = "#f59e0b";
          statusEl.style.color = "#1e1b4b";
          statusEl.textContent = "\u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u0623\u0643\u062B\u0631 \u0645\u0646 150 \u062D\u062F\u062B \u0625\u062D\u0635\u0627\u0626\u064A \u0639\u0634\u0648\u0627\u0626\u064A...";
          try {
            await convex.mutation("analytics:populateMockData", {});
            statusEl.style.background = "#10b981";
            statusEl.style.color = "#fff";
            statusEl.textContent = "\u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0648\u0647\u0645\u064A\u0629 \u0644\u0644\u0640 30 \u064A\u0648\u0645\u0627\u064B \u0627\u0644\u0645\u0627\u0636\u064A\u0629 \u0628\u0646\u062C\u0627\u062D!";
            setTimeout(() => {
              statusEl.style.display = "none";
            }, 3e3);
          } catch (err) {
            statusEl.style.background = "#ef4444";
            statusEl.style.color = "#fff";
            statusEl.textContent = "\u062E\u0637\u0623: " + err.message;
          }
        });
      }
      const reqSearchInput = document.getElementById("requests-search-input");
      if (reqSearchInput) {
        reqSearchInput.addEventListener("input", (e) => {
          _searchQuery = e.target.value.trim();
          subscribeRequests();
        });
      }
      const reqStatusFilter = document.getElementById("requests-status-filter");
      if (reqStatusFilter) {
        reqStatusFilter.addEventListener("change", (e) => {
          _statusFilter = e.target.value;
          subscribeRequests();
        });
      }
      const openAddReqBtn = document.getElementById("btn-open-add-request");
      if (openAddReqBtn) {
        openAddReqBtn.addEventListener("click", () => {
          document.getElementById("edit-modal-title").textContent = "\u2795 \u0625\u0636\u0627\u0641\u0629 \u0637\u0644\u0628 \u0635\u064A\u0627\u0646\u0629 \u062C\u062F\u064A\u062F";
          document.getElementById("edit-req-id").value = "";
          document.getElementById("edit-req-name").value = "";
          document.getElementById("edit-req-phone").value = "";
          document.getElementById("edit-req-appliance").value = "";
          document.getElementById("edit-req-problem").value = "\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u0645\u0629";
          document.getElementById("edit-req-gov").value = "\u0627\u0644\u0642\u0627\u0647\u0631\u0629";
          document.getElementById("edit-req-page").value = "DASHBOARD";
          document.getElementById("edit-req-status-select").value = "new";
          document.getElementById("modal-edit-request").style.display = "flex";
        });
      }
      const editReqForm = document.getElementById("edit-request-form");
      if (editReqForm) {
        editReqForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const saveBtn = editReqForm.querySelector("button[type='submit']");
          const origText = saveBtn ? saveBtn.textContent : "\u062D\u0641\u0638";
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...";
          }
          const id = document.getElementById("edit-req-id").value;
          const payload = {
            clientName: document.getElementById("edit-req-name").value,
            clientPhone: document.getElementById("edit-req-phone").value,
            appliance: document.getElementById("edit-req-appliance").value,
            problem: document.getElementById("edit-req-problem").value,
            governorate: document.getElementById("edit-req-gov").value,
            sourcePage: document.getElementById("edit-req-page").value,
            status: document.getElementById("edit-req-status-select").value
          };
          try {
            if (id) {
              await convex.mutation("analytics:editRequest", { id, ...payload });
            } else {
              await convex.mutation("analytics:createRequestDashboard", payload);
            }
            document.getElementById("modal-edit-request").style.display = "none";
          } catch (err) {
            alert("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0641\u0638: " + err.message);
          } finally {
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = origText;
            }
          }
        });
      }
      showSection("overview");
      subscribeAll(activeRange);
      subscribeRequests();
      const clerkId = clerk.user.id;
      const email = (_i = (_h = clerk.user.primaryEmailAddress) == null ? void 0 : _h.emailAddress) != null ? _i : "";
      try {
        await convex.mutation("analytics:registerCurrentUser", {
          name,
          email,
          avatarUrl: avatar || void 0
        });
      } catch (e) {
        console.warn("Could not register user in Convex:", e);
      }
      subscribeUsers(clerkId);
      initUsersSection(clerkId);
      initSystemSettings();
    } catch (err) {
      console.error("Dashboard init error:", err);
      const bootErr = document.getElementById("boot-error");
      if (bootErr) {
        bootErr.textContent = "\u062E\u0637\u0623 \u0641\u064A \u062A\u0647\u064A\u0626\u0629 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645: " + err.message;
        bootErr.style.display = "block";
      }
    }
  })();
})();
