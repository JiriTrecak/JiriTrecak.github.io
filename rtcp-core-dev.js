/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@codesandbox/sandpack-client/esm/client.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@codesandbox/sandpack-client/esm/client.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SandpackClient": () => (/* binding */ SandpackClient)
/* harmony export */ });
/* harmony import */ var codesandbox_import_utils_lib_create_sandbox_templates__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! codesandbox-import-utils/lib/create-sandbox/templates */ "./node_modules/codesandbox-import-utils/lib/create-sandbox/templates.js");
/* harmony import */ var lodash_isequal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash.isequal */ "./node_modules/lodash.isequal/index.js");
/* harmony import */ var lodash_isequal__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_isequal__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../package.json */ "./node_modules/@codesandbox/sandpack-client/package.json");
/* harmony import */ var _file_resolver_protocol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./file-resolver-protocol */ "./node_modules/@codesandbox/sandpack-client/esm/file-resolver-protocol.js");
/* harmony import */ var _iframe_protocol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./iframe-protocol */ "./node_modules/@codesandbox/sandpack-client/esm/iframe-protocol.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils */ "./node_modules/@codesandbox/sandpack-client/esm/utils.js");
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");


// Muhahaha
// eslint-disable-next-line
// @ts-ignore




const BUNDLER_URL = process.env.CODESANDBOX_ENV === "development"
    ? "http://localhost:3000/"
    : `https://${_package_json__WEBPACK_IMPORTED_MODULE_2__.version.replace(/\./g, "-")}-sandpack.codesandbox.io/`;
class SandpackClient {
    constructor(selector, sandboxInfo, options = {}) {
        this.getTranspilerContext = () => new Promise((resolve) => {
            const unsubscribe = this.listen((message) => {
                if (message.type === "transpiler-context") {
                    resolve(message.data);
                    unsubscribe();
                }
            });
            this.dispatch({ type: "get-transpiler-context" });
        });
        this.options = options;
        this.sandboxInfo = sandboxInfo;
        this.bundlerURL = options.bundlerURL || BUNDLER_URL;
        this.bundlerState = undefined;
        this.errors = [];
        this.status = "initializing";
        if (typeof selector === "string") {
            this.selector = selector;
            const element = document.querySelector(selector);
            if (!element) {
                throw new Error(`No element found for selector '${selector}'`);
            }
            this.element = element;
            this.iframe = document.createElement("iframe");
            this.initializeElement();
        }
        else {
            this.element = selector;
            this.iframe = selector;
        }
        if (!this.iframe.getAttribute("sandbox")) {
            this.iframe.setAttribute("sandbox", "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts");
        }
        this.iframe.src = options.startRoute
            ? new URL(options.startRoute, this.bundlerURL).toString()
            : this.bundlerURL;
        this.iframeProtocol = new _iframe_protocol__WEBPACK_IMPORTED_MODULE_3__.IFrameProtocol(this.iframe, this.bundlerURL);
        this.unsubscribeGlobalListener = this.iframeProtocol.globalListen((mes) => {
            if (mes.type !== "initialized" || !this.iframe.contentWindow) {
                return;
            }
            this.iframeProtocol.register();
            if (this.options.fileResolver) {
                // TODO: Find a common place for the Protocol to be implemented for both sandpack-core and sandpack-client
                this.fileResolverProtocol = new _file_resolver_protocol__WEBPACK_IMPORTED_MODULE_4__.default("file-resolver", async (data) => {
                    if (data.m === "isFile") {
                        return this.options.fileResolver.isFile(data.p);
                    }
                    return this.options.fileResolver.readFile(data.p);
                }, this.iframe.contentWindow);
            }
            this.updatePreview(this.sandboxInfo, true);
        });
        this.unsubscribeChannelListener = this.iframeProtocol.channelListen((mes) => {
            switch (mes.type) {
                case "start": {
                    this.errors = [];
                    break;
                }
                case "status": {
                    this.status = mes.status;
                    break;
                }
                case "action": {
                    if (mes.action === "show-error") {
                        this.errors = [...this.errors, (0,_utils__WEBPACK_IMPORTED_MODULE_5__.extractErrorDetails)(mes)];
                    }
                    break;
                }
                case "state": {
                    this.bundlerState = mes.state;
                    break;
                }
            }
        });
    }
    cleanup() {
        this.unsubscribeChannelListener();
        this.unsubscribeGlobalListener();
        this.iframeProtocol.cleanup();
    }
    updateOptions(options) {
        if (!lodash_isequal__WEBPACK_IMPORTED_MODULE_1___default()(this.options, options)) {
            this.options = options;
            this.updatePreview();
        }
    }
    updatePreview(sandboxInfo = this.sandboxInfo, isInitializationCompile) {
        var _a, _b, _c;
        this.sandboxInfo = sandboxInfo;
        const files = this.getFiles();
        const modules = Object.keys(files).reduce((prev, next) => ({
            ...prev,
            [next]: {
                code: files[next].code,
                path: next,
            },
        }), {});
        let packageJSON = JSON.parse((0,_utils__WEBPACK_IMPORTED_MODULE_5__.createPackageJSON)(this.sandboxInfo.dependencies, this.sandboxInfo.entry));
        try {
            packageJSON = JSON.parse(files["/package.json"].code);
        }
        catch (e) {
            console.error("Could not parse package.json file: " + e.message);
        }
        // TODO move this to a common format
        const normalizedModules = Object.keys(files).reduce((prev, next) => ({
            ...prev,
            [next]: {
                content: files[next].code,
                path: next,
            },
        }), {});
        this.dispatch({
            type: "compile",
            codesandbox: true,
            version: 3,
            isInitializationCompile,
            modules,
            externalResources: [],
            hasFileResolver: Boolean(this.options.fileResolver),
            disableDependencyPreprocessing: this.sandboxInfo
                .disableDependencyPreprocessing,
            template: this.sandboxInfo.template ||
                (0,codesandbox_import_utils_lib_create_sandbox_templates__WEBPACK_IMPORTED_MODULE_0__.getTemplate)(packageJSON, normalizedModules),
            showOpenInCodeSandbox: (_a = this.options.showOpenInCodeSandbox) !== null && _a !== void 0 ? _a : true,
            showErrorScreen: (_b = this.options.showErrorScreen) !== null && _b !== void 0 ? _b : true,
            showLoadingScreen: (_c = this.options.showLoadingScreen) !== null && _c !== void 0 ? _c : true,
            skipEval: this.options.skipEval || false,
            clearConsoleDisabled: !this.options.clearConsoleOnFirstCompile,
        });
    }
    dispatch(message) {
        this.iframeProtocol.dispatch(message);
    }
    listen(listener) {
        return this.iframeProtocol.channelListen(listener);
    }
    /**
     * Get the URL of the contents of the current sandbox
     */
    getCodeSandboxURL() {
        const files = this.getFiles();
        const paramFiles = Object.keys(files).reduce((prev, next) => ({
            ...prev,
            [next.replace("/", "")]: {
                content: files[next].code,
                isBinary: false,
            },
        }), {});
        return fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
            method: "POST",
            body: JSON.stringify({ files: paramFiles }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((x) => x.json())
            .then((res) => ({
            sandboxId: res.sandbox_id,
            editorUrl: `https://codesandbox.io/s/${res.sandbox_id}`,
            embedUrl: `https://codesandbox.io/embed/${res.sandbox_id}`,
        }));
    }
    getFiles() {
        const { sandboxInfo } = this;
        if (sandboxInfo.files["/package.json"] === undefined) {
            return (0,_utils__WEBPACK_IMPORTED_MODULE_5__.addPackageJSONIfNeeded)(sandboxInfo.files, sandboxInfo.dependencies, sandboxInfo.entry);
        }
        return this.sandboxInfo.files;
    }
    initializeElement() {
        this.iframe.style.border = "0";
        this.iframe.style.width = this.options.width || "100%";
        this.iframe.style.height = this.options.height || "100%";
        this.iframe.style.overflow = "hidden";
        if (!this.element.parentNode) {
            // This should never happen
            throw new Error("Given element does not have a parent.");
        }
        this.element.parentNode.replaceChild(this.iframe, this.element);
    }
}
//# sourceMappingURL=client.js.map

/***/ }),

/***/ "./node_modules/@codesandbox/sandpack-client/esm/file-resolver-protocol.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@codesandbox/sandpack-client/esm/file-resolver-protocol.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Protocol)
/* harmony export */ });
/**
 * This file is a copy of the resolver from the `codesandbox-api` package.
 * We wanted to avoid to reference codesandbox-api because of the code that runs on load in the package.
 * The plan is to take some time and refactor codesandbox-api into what it was supposed to be in the first place,
 * an abstraction over the actions that can be dispatched between the bundler and the iframe.
 */
const generateId = () => 
// Such a random ID
Math.floor(Math.random() * 1000000 + Math.random() * 1000000);
const getConstructorName = (x) => {
    try {
        return x.constructor.name;
    }
    catch (e) {
        return "";
    }
};
class Protocol {
    constructor(type, handleMessage, target) {
        this.type = type;
        this.handleMessage = handleMessage;
        this.target = target;
        this.outgoingMessages = new Set();
        this._messageListener = async (e) => {
            const { data } = e;
            if (data.$type !== this.getTypeId()) {
                return;
            }
            // We are getting a response to the message
            if (this.outgoingMessages.has(data.$id)) {
                return;
            }
            const result = await this.handleMessage(data.$data);
            const returnMessage = {
                $originId: this.internalId,
                $type: this.getTypeId(),
                $data: result,
                $id: data.$id,
            };
            if (e.source) {
                // @ts-ignore
                e.source.postMessage(returnMessage, "*");
            }
            else {
                this._postMessage(returnMessage);
            }
        };
        this.createConnection();
        this.internalId = generateId();
        this.isWorker = getConstructorName(target) === "Worker";
    }
    getTypeId() {
        return `p-${this.type}`;
    }
    createConnection() {
        self.addEventListener("message", this._messageListener);
    }
    dispose() {
        self.removeEventListener("message", this._messageListener);
    }
    sendMessage(data) {
        return new Promise((resolve) => {
            const messageId = generateId();
            const message = {
                $originId: this.internalId,
                $type: this.getTypeId(),
                $data: data,
                $id: messageId,
            };
            this.outgoingMessages.add(messageId);
            const listenFunction = (e) => {
                const { data } = e;
                if (data.$type === this.getTypeId() &&
                    data.$id === messageId &&
                    data.$originId !== this.internalId) {
                    resolve(data.$data);
                    self.removeEventListener("message", listenFunction);
                }
            };
            self.addEventListener("message", listenFunction);
            this._postMessage(message);
        });
    }
    _postMessage(m) {
        if (this.isWorker ||
            // @ts-ignore Unknown to TS
            (typeof DedicatedWorkerGlobalScope !== "undefined" &&
                // @ts-ignore Unknown to TS
                this.target instanceof DedicatedWorkerGlobalScope)) {
            // @ts-ignore
            this.target.postMessage(m);
        }
        else {
            this.target.postMessage(m, "*");
        }
    }
}
//# sourceMappingURL=file-resolver-protocol.js.map

/***/ }),

/***/ "./node_modules/@codesandbox/sandpack-client/esm/iframe-protocol.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@codesandbox/sandpack-client/esm/iframe-protocol.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IFrameProtocol": () => (/* binding */ IFrameProtocol)
/* harmony export */ });
class IFrameProtocol {
    constructor(iframe, origin) {
        // React to messages from any iframe
        this.globalListeners = {};
        this.globalListenersCount = 0;
        // React to messages from the iframe owned by this instance
        this.channelListeners = {};
        this.channelListenersCount = 0;
        // Random number to identify this instance of the client when messages are coming from multiple iframes
        this.channelId = Math.floor(Math.random() * 1000000);
        this.frameWindow = iframe.contentWindow;
        this.origin = origin;
        this.globalListeners = [];
        this.channelListeners = [];
        this.eventListener = this.eventListener.bind(this);
        if (typeof window !== "undefined") {
            window.addEventListener("message", this.eventListener);
        }
    }
    cleanup() {
        window.removeEventListener("message", this.eventListener);
        this.globalListeners = {};
        this.channelListeners = {};
        this.globalListenersCount = 0;
        this.channelListenersCount = 0;
    }
    // Sends the channelId and triggers an iframeHandshake promise to resolve,
    // so the iframe can start listening for messages (based on the id)
    register() {
        if (!this.frameWindow) {
            return;
        }
        this.frameWindow.postMessage({
            type: "register-frame",
            origin: document.location.origin,
            id: this.channelId,
        }, this.origin);
    }
    // Messages are dispatched from the client directly to the instance iframe
    dispatch(message) {
        if (!this.frameWindow) {
            return;
        }
        this.frameWindow.postMessage({
            $id: this.channelId,
            codesandbox: true,
            ...message,
        }, this.origin);
    }
    // Add a listener that is called on any message coming from an iframe in the page
    // This is needed for the `initialize` message which comes without a channelId
    globalListen(listener) {
        if (typeof listener !== "function") {
            return () => {
                return;
            };
        }
        const listenerId = this.globalListenersCount;
        this.globalListeners[listenerId] = listener;
        this.globalListenersCount++;
        return () => {
            delete this.globalListeners[listenerId];
        };
    }
    // Add a listener that is called on any message coming from an iframe with the instance channelId
    // All other messages (eg: from other iframes) are ignored
    channelListen(listener) {
        if (typeof listener !== "function") {
            return () => {
                return;
            };
        }
        const listenerId = this.channelListenersCount;
        this.channelListeners[listenerId] = listener;
        this.channelListenersCount++;
        return () => {
            delete this.channelListeners[listenerId];
        };
    }
    // Handles message windows coming from iframes
    eventListener(message) {
        if (!message.data.codesandbox) {
            return;
        }
        Object.values(this.globalListeners).forEach((listener) => listener(message.data));
        if (message.data.$id !== this.channelId) {
            return;
        }
        Object.values(this.channelListeners).forEach((listener) => listener(message.data));
    }
}
//# sourceMappingURL=iframe-protocol.js.map

/***/ }),

/***/ "./node_modules/@codesandbox/sandpack-client/esm/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/@codesandbox/sandpack-client/esm/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SandpackClient": () => (/* reexport safe */ _client__WEBPACK_IMPORTED_MODULE_0__.SandpackClient),
/* harmony export */   "addPackageJSONIfNeeded": () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.addPackageJSONIfNeeded),
/* harmony export */   "createPackageJSON": () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.createPackageJSON),
/* harmony export */   "extractErrorDetails": () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.extractErrorDetails)
/* harmony export */ });
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./client */ "./node_modules/@codesandbox/sandpack-client/esm/client.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./node_modules/@codesandbox/sandpack-client/esm/utils.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@codesandbox/sandpack-client/esm/utils.js":
/*!****************************************************************!*\
  !*** ./node_modules/@codesandbox/sandpack-client/esm/utils.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createPackageJSON": () => (/* binding */ createPackageJSON),
/* harmony export */   "addPackageJSONIfNeeded": () => (/* binding */ addPackageJSONIfNeeded),
/* harmony export */   "extractErrorDetails": () => (/* binding */ extractErrorDetails)
/* harmony export */ });
function createPackageJSON(dependencies = {}, entry = "/index.js") {
    return JSON.stringify({
        name: "sandpack-project",
        main: entry,
        dependencies,
    }, null, 2);
}
function addPackageJSONIfNeeded(files, dependencies, entry) {
    const newFiles = { ...files };
    if (!newFiles["/package.json"]) {
        if (!dependencies) {
            throw new Error("No dependencies specified, please specify either a package.json or dependencies.");
        }
        if (!entry) {
            throw new Error("Missing 'entry' parameter. Either specify an entry point, or pass in a package.json with the 'main' field set.");
        }
        newFiles["/package.json"] = {
            code: createPackageJSON(dependencies, entry),
        };
    }
    return newFiles;
}
function extractErrorDetails(msg) {
    if (msg.title === "SyntaxError") {
        const { title, path, message, line, column } = msg;
        return { title, path, message, line, column };
    }
    const relevantStackFrame = getRelevantStackFrame(msg.payload.frames);
    if (!relevantStackFrame) {
        return { message: msg.message };
    }
    const errorInCode = getErrorInOriginalCode(relevantStackFrame);
    const errorLocation = getErrorLocation(relevantStackFrame);
    const errorMessage = formatErrorMessage(relevantStackFrame._originalFileName, msg.message, errorLocation, errorInCode);
    return {
        message: errorMessage,
        title: msg.title,
        path: relevantStackFrame._originalFileName,
        line: relevantStackFrame._originalLineNumber,
        column: relevantStackFrame._originalColumnNumber,
    };
}
function getRelevantStackFrame(frames) {
    if (!frames) {
        return;
    }
    return frames.find((frame) => !!frame._originalFileName);
}
function getErrorLocation(errorFrame) {
    return errorFrame
        ? ` (${errorFrame._originalLineNumber}:${errorFrame._originalColumnNumber})`
        : ``;
}
function getErrorInOriginalCode(errorFrame) {
    const lastScriptLine = errorFrame._originalScriptCode[errorFrame._originalScriptCode.length - 1];
    const numberOfLineNumberCharacters = lastScriptLine.lineNumber.toString()
        .length;
    const leadingCharacterOffset = 2;
    const barSeparatorCharacterOffset = 3;
    const extraLineLeadingSpaces = leadingCharacterOffset +
        numberOfLineNumberCharacters +
        barSeparatorCharacterOffset +
        errorFrame._originalColumnNumber;
    return errorFrame._originalScriptCode.reduce((result, scriptLine) => {
        const leadingChar = scriptLine.highlight ? ">" : " ";
        const lineNumber = scriptLine.lineNumber.toString().length === numberOfLineNumberCharacters
            ? `${scriptLine.lineNumber}`
            : ` ${scriptLine.lineNumber}`;
        const extraLine = scriptLine.highlight
            ? "\n" + " ".repeat(extraLineLeadingSpaces) + "^"
            : "";
        return (result + // accumulator
            "\n" +
            leadingChar + // > or " "
            " " +
            lineNumber + // line number on equal number of characters
            " | " +
            scriptLine.content + // code
            extraLine // line under the highlighed line to show the column index
        );
    }, "");
}
function formatErrorMessage(filePath, message, location, errorInCode) {
    return `${filePath}: ${message}${location}
${errorInCode}`;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@codesandbox/sandpack-client/package.json":
/*!****************************************************************!*\
  !*** ./node_modules/@codesandbox/sandpack-client/package.json ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"_from":"@codesandbox/sandpack-client","_id":"@codesandbox/sandpack-client@0.1.6","_inBundle":false,"_integrity":"sha512-p98SZAjg5iZ+1rvVe1FVRPe8y0vFju0PYx7VIpzFNHhc3D2xj22oFEx/Utw3WjZ1rwSNdecw+YKcPkZemdyWiQ==","_location":"/@codesandbox/sandpack-client","_phantomChildren":{},"_requested":{"type":"tag","registry":true,"raw":"@codesandbox/sandpack-client","name":"@codesandbox/sandpack-client","escapedName":"@codesandbox%2fsandpack-client","scope":"@codesandbox","rawSpec":"","saveSpec":null,"fetchSpec":"latest"},"_requiredBy":["#USER","/"],"_resolved":"https://registry.npmjs.org/@codesandbox/sandpack-client/-/sandpack-client-0.1.6.tgz","_shasum":"07016a1fc54e1dd4ae5de9cd1924c897c4dc6554","_spec":"@codesandbox/sandpack-client","_where":"/Users/jiritrecak/Documents/Supernova/Development/Experimental/Live Component Sandbox","author":{"name":"CodeSandbox"},"bugs":{"url":"https://github.com/codesandbox/sandpack/issues"},"bundleDependencies":false,"dependencies":{"codesandbox-import-utils":"^1.2.3","lodash.isequal":"^4.5.0"},"deprecated":false,"description":"A bundler that completely works in the browser and takes advantage of it.","devDependencies":{"@types/lodash.isequal":"^4.5.2","@types/node":"^9.3.0","babel-loader":"^7.1.5","core-js":"^3.7.0","cross-env":"^5.0.1","gulp":"^3.9.1","gulp-remove-sourcemaps":"1.0.1","regenerator-runtime":"^0.13.7","rimraf":"^2.6.2","ts-node":"^4.1.0","tslint":"^5.8.0","tslint-config-prettier":"^1.1.0","tslint-config-standard":"^7.0.0","typescript":"4.0.3"},"files":["dist","esm","sandpack","package.json","README.md"],"homepage":"https://github.com/codesandbox/sandpack#readme","keywords":[],"license":"GPL-2.0","main":"dist/index.js","module":"esm/index.js","name":"@codesandbox/sandpack-client","repository":{"type":"git","url":"git+https://github.com/codesandbox/sandpack.git"},"scripts":{"build":"yarn build:cjs && yarn build:esm","build:cjs":"tsc -p tsconfig.cjs.json","build:esm":"tsc -p tsconfig.esm.json","build:publish":"yarn build && rimraf sandpack && gulp copy-sandbox","lint":"tslint -t codeFrame \'src/**/*.ts\' \'test/**/*.ts\'","prebuild":"rimraf dist && rimraf esm","start":"tsc -p tsconfig.esm.json --watch"},"sideEffects":false,"typings":"dist/index.d.ts","version":"0.1.6"}');

/***/ }),

/***/ "./node_modules/codesandbox-import-utils/lib/create-sandbox/templates.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/codesandbox-import-utils/lib/create-sandbox/templates.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function getMainFile(template) {
    if (template === "vue-cli") {
        return "src/main.js";
    }
    if (template === "angular-cli") {
        return "src/main.ts";
    }
    if (template === "create-react-app-typescript") {
        return "src/index.tsx";
    }
    if (template === "parcel") {
        return "index.html";
    }
    if (template === "gatsby") {
        return "src/pages/index.js";
    }
    if (template === "nuxt") {
        // Wildcard, because nuxt is not specific on this
        return "package.json";
    }
    if (template === "next") {
        // Wildcard, because next is not specific on this
        return "package.json";
    }
    if (template === "apollo") {
        // Wildcard, because apollo is not specific on this
        return "package.json";
    }
    if (template === "reason") {
        // Wildcard, because reason is not specific on this
        return "package.json";
    }
    if (template === "sapper") {
        // Wildcard, because sapper is not specific on this
        return "package.json";
    }
    if (template === "nest") {
        return "src/main.ts";
    }
    if (template === "static") {
        return "index.html";
    }
    return "src/index.js";
}
exports.getMainFile = getMainFile;
var SANDBOX_CONFIG = "sandbox.config.json";
function getTemplate(packageJSONPackage, modules) {
    var sandboxConfig = modules[SANDBOX_CONFIG] || modules["/" + SANDBOX_CONFIG];
    if (sandboxConfig) {
        try {
            var config = JSON.parse(sandboxConfig.content);
            if (config.template) {
                return config.template;
            }
        }
        catch (e) { }
    }
    var _a = packageJSONPackage.dependencies, dependencies = _a === void 0 ? {} : _a, _b = packageJSONPackage.devDependencies, devDependencies = _b === void 0 ? {} : _b;
    var totalDependencies = Object.keys(dependencies).concat(Object.keys(devDependencies));
    var nuxt = ["nuxt", "nuxt-edge"];
    if (totalDependencies.some(function (dep) { return nuxt.indexOf(dep) > -1; })) {
        return "nuxt";
    }
    if (totalDependencies.indexOf("next") > -1) {
        return "next";
    }
    var apollo = [
        "apollo-server",
        "apollo-server-express",
        "apollo-server-hapi",
        "apollo-server-koa",
        "apollo-server-lambda",
        "apollo-server-micro"
    ];
    if (totalDependencies.some(function (dep) { return apollo.indexOf(dep) > -1; })) {
        return "apollo";
    }
    if (totalDependencies.indexOf("ember-cli") > -1) {
        return "ember";
    }
    if (totalDependencies.indexOf("sapper") > -1) {
        return "sapper";
    }
    var moduleNames = Object.keys(modules);
    if (moduleNames.some(function (m) { return m.endsWith(".vue"); })) {
        return "vue-cli";
    }
    if (moduleNames.some(function (m) { return m.endsWith(".re"); })) {
        return "reason";
    }
    if (totalDependencies.indexOf("gatsby") > -1) {
        return "gatsby";
    }
    if (totalDependencies.indexOf("parcel-bundler") > -1) {
        return "parcel";
    }
    if (totalDependencies.indexOf("react-scripts") > -1) {
        return "create-react-app";
    }
    if (totalDependencies.indexOf("react-scripts-ts") > -1) {
        return "create-react-app-typescript";
    }
    if (totalDependencies.indexOf("@angular/core") > -1) {
        return "angular-cli";
    }
    if (totalDependencies.indexOf("preact-cli") > -1) {
        return "preact-cli";
    }
    if (totalDependencies.indexOf("svelte") > -1) {
        return "svelte";
    }
    if (totalDependencies.indexOf("vue") > -1) {
        return "vue-cli";
    }
    var dojo = ["@dojo/core", "@dojo/framework"];
    if (totalDependencies.some(function (dep) { return dojo.indexOf(dep) > -1; })) {
        return "@dojo/cli-create-app";
    }
    if (totalDependencies.indexOf("cx") > -1) {
        return "cxjs";
    }
    if (totalDependencies.indexOf("@nestjs/core") > -1 ||
        totalDependencies.indexOf("@nestjs/common") > -1) {
        return "nest";
    }
    return undefined;
}
exports.getTemplate = getTemplate;
//# sourceMappingURL=templates.js.map

/***/ }),

/***/ "./node_modules/lodash.isequal/index.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash.isequal/index.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./src/component-renderer.ts":
/*!***********************************!*\
  !*** ./src/component-renderer.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

//
//  ComponentSandboxRenderer.ts
//  Supernova
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Jiri Trecak. All rights reserved.
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SNBComponentSandboxRenderer = void 0;
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports
const sandpack_client_1 = __webpack_require__(/*! @codesandbox/sandpack-client */ "./node_modules/@codesandbox/sandpack-client/esm/index.js");
const sandbox_data_1 = __webpack_require__(/*! ./definitions/sandbox-data */ "./src/definitions/sandbox-data.ts");
const react_bundler_1 = __webpack_require__(/*! ./platform-bundlers/react-bundler */ "./src/platform-bundlers/react-bundler.ts");
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Class
class SNBComponentSandboxRenderer {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor
    constructor() {
        this.trackedSandboxes = new Map();
        this.trackedConfigurations = new Map();
    }
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Sandbox lookup
    buildSandboxForTargetWithID(id) {
        this.buildSandboxWithPageTarget(id);
    }
    buildSandboxesForTargetsWithIDStartingWith(id) {
        this.buildSandboxesForTargetsWithPattern(`[id^="${id}"]`);
    }
    buildSandboxesForTargetsWithIDEndingWith(id) {
        this.buildSandboxesForTargetsWithPattern(`[id$="${id}]`);
    }
    buildSandboxesForTargetsWithPattern(pattern) {
        // Find all sandbox objects on this page
        var nodeList = document.querySelectorAll(pattern);
        nodeList.forEach(node => {
            this.buildSandboxWithPageTarget(node.id);
        });
    }
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Sandbox construction
    buildSandboxWithPageTarget(targetId) {
        var _a, _b;
        // Not possible to create sandbox for already existing sandboxes
        if (this.trackedSandboxes.get(targetId)) {
            throw new Error(`Sandbox for id ${targetId} was already created. You can only create one tracked sandbox per target`);
        }
        // Fetch and test target
        let element = document.querySelector(`#${targetId}`);
        if (!element) {
            throw new Error(`Can't build sandbox with target ${targetId} as there is no such target in the current context`);
        }
        if (element.nodeName.toLowerCase() !== "div" && element.nodeName.toLowerCase() !== "iframe") {
            throw new Error(`Sandbox can only be created on element types of div or iframe (div is preferred)`);
        }
        // Get data tag from it, deconstruct base64 information
        let attribute = element.getAttribute("sn-sandbox-data");
        if (!attribute || attribute.length === 0) {
            throw new Error(`Sandbox doesn't provide any valid data`);
        }
        let decodedSandboxObject;
        try {
            const decodedSandboxData = atob(attribute);
            decodedSandboxObject = JSON.parse(decodedSandboxData);
        }
        catch (error) {
            throw new Error(`Provided sandbox data corrupted`);
        }
        // Build sandbox from the data
        if (!decodedSandboxObject.code || !decodedSandboxObject.dependencies || !decodedSandboxObject.type) {
            throw new Error(`Provided sandbox data incomplete`);
        }
        if (!Object.values(sandbox_data_1.SandboxMode).includes(decodedSandboxObject.type)) {
            throw new Error(`Unsupported sandbox type ${decodedSandboxObject.type}`);
        }
        // Create sandbox with full configuration
        let payload = this.createBundledData(decodedSandboxObject);
        let options = {
            showErrorScreen: true,
            showLoadingScreen: false,
            showOpenInCodeSandbox: (_b = (_a = decodedSandboxObject.visual) === null || _a === void 0 ? void 0 : _a.showSandbox) !== null && _b !== void 0 ? _b : false,
        };
        // Render and store sandbox for the target
        let sandbox = new sandpack_client_1.SandpackClient(`#${targetId}`, payload, options);
        this.trackedSandboxes.set(targetId, sandbox);
        this.trackedConfigurations.set(targetId, decodedSandboxObject);
        // Add sandpack tracker for listening to state changes
        if (this.listener) {
            sandbox.listen((message) => {
                let snstateType = "unknown";
                switch (message.type) {
                    case "start":
                        snstateType = "start";
                        break;
                    case "state": snstateType = `state:${message.state.entry}`;
                    case "success":
                        snstateType = `success`;
                        break;
                    case "initialized":
                        snstateType = `initialized`;
                        break;
                    default: break;
                }
                if (snstateType !== `unknown`) {
                    this.listener({
                        message: message,
                        sandboxId: targetId
                    });
                }
            });
        }
    }
    updateSandboxWithCode(code, id) {
        // Get client and data from previous iteration
        let client = this.trackedSandboxes.get(id);
        let data = this.trackedConfigurations.get(id);
        if (!client || !data) {
            throw new Error(`Sandbox (${id}) was not yet created or not configured properly. Please initialize sandbox fully before trying to update its data`);
        }
        // Create copy of data with modified payload
        let modifiedData = {
            code: code,
            type: data.type,
            dependencies: data.dependencies,
            editable: data.editable,
            visual: data.visual
        };
        // Update client
        client.updatePreview();
        // When you make a change you can just run `updatePreview`, we'll automatically discover
        // which files have changed and hot reload them.
        let payload = this.createBundledData(modifiedData);
        client.updatePreview(payload);
    }
    createBundledData(decodedSandboxObject) {
        var _a;
        // Create sandbox with full configuration
        let bundler;
        switch (decodedSandboxObject.type) {
            case sandbox_data_1.SandboxMode.react:
                bundler = new react_bundler_1.SNBReactBundler(decodedSandboxObject.code, decodedSandboxObject.dependencies, (_a = decodedSandboxObject.visual) !== null && _a !== void 0 ? _a : {});
                break;
            default:
                throw new Error(`Unsupported bundler type ${decodedSandboxObject.type}`);
        }
        let payload = {
            files: bundler.buildSandboxPayload()
        };
        return payload;
    }
    getCodeForSandboxId(targetId) {
        console.log(`tracked sandboxes: ${Array.from(this.trackedConfigurations.keys())}`);
        if (!this.trackedConfigurations.get(targetId)) {
            throw new Error(`Unknown code sandbox for id ${targetId}`);
        }
        let sandbox = this.trackedConfigurations.get(targetId);
        return sandbox.code;
    }
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Sandbox testing
    encodeBlockData(data) {
        let definitionParts = data.split("---");
        // Parse configuration
        let modeString = definitionParts[0];
        let configurations = {};
        for (let configurationLine of modeString.split("\n")) {
            let parts = configurationLine.split(":");
            if (parts.length === 2) {
                let configKey = this.cleanupString(parts[0]);
                let configValue = this.cleanupString(parts[1]);
                configurations[configKey] = configValue;
            }
            {
                // Ignore because configuration always has to be setup
            }
        }
        // Parse dependencies
        let dependencyString = definitionParts[1];
        let dependencies = {};
        for (let dependencyLine of dependencyString.split("\n")) {
            let parts = dependencyLine.split(":");
            if (parts.length === 2) {
                // Cleanup and remove quotes, if any
                let depName = this.cleanupString(parts[0]);
                if (depName.length > 0) {
                    let depVersion = this.cleanupString(parts[1]);
                    dependencies[depName] = depVersion;
                }
                else {
                    // Ignore as it is empty and therefore corrupted
                }
            }
            else if (parts.length === 1) {
                let depName = this.cleanupString(dependencyLine);
                if (depName.length > 0) {
                    let depVersion = "latest";
                    dependencies[depName] = depVersion;
                }
                else {
                    // Ignore as it is empty and therefore corrupted
                }
            }
            else {
                // Ignore as it is unknown or corrupted
            }
        }
        // Parse script
        let codeString = definitionParts[2];
        // Parse visual configuration object
        const visualConfiguration = {};
        if (configurations["Horizontal"]) {
            visualConfiguration["horizontalAlignment"] = configurations["Horizontal"];
        }
        if (configurations["Vertical"]) {
            visualConfiguration["verticalAlignment"] = configurations["Vertical"];
        }
        if (configurations["Background"]) {
            visualConfiguration["backgroundHex"] = configurations["Background"];
        }
        // Create object and encode it
        const sandboxPayload = {
            type: "react",
            code: codeString,
            dependencies: dependencies,
            visual: visualConfiguration
        };
        console.log(sandboxPayload);
        // Encode object
        return btoa(JSON.stringify(sandboxPayload));
    }
    cleanupString(string) {
        return string.trim().replace(/^"(.*)"$/, '$1');
    }
    encodeReactSandboxData(code, dependencies) {
        return this.encodeSandboxData({
            type: sandbox_data_1.SandboxMode.react,
            code: code,
            dependencies: dependencies
        });
    }
    encodeSandboxData(data) {
        return btoa(JSON.stringify(data));
    }
    injectSandboxDataToTarget(target, code) {
        // Inject encoded sandbox data into data tag that sandbox can read
        let element = document.querySelector(`#${target}`);
        if (!element) {
            throw new Error(`Can't inject sandbox data to target`);
        }
        element.setAttribute("sn-sandbox-data", code);
    }
}
exports.SNBComponentSandboxRenderer = SNBComponentSandboxRenderer;


/***/ }),

/***/ "./src/definitions/sandbox-data.ts":
/*!*****************************************!*\
  !*** ./src/definitions/sandbox-data.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

//
//  SandboxData.ts
//  Supernova
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Jiri Trecak. All rights reserved.
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SandboxMode = void 0;
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions
var SandboxMode;
(function (SandboxMode) {
    SandboxMode["react"] = "react";
})(SandboxMode = exports.SandboxMode || (exports.SandboxMode = {}));


/***/ }),

/***/ "./src/platform-bundlers/bundler.ts":
/*!******************************************!*\
  !*** ./src/platform-bundlers/bundler.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

//
//  SNBBundler.ts
//  Supernova
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Jiri Trecak. All rights reserved.
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SNBBundler = exports.SandboxContentAlignment = void 0;
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions
var SandboxContentAlignment;
(function (SandboxContentAlignment) {
    SandboxContentAlignment["start"] = "start";
    SandboxContentAlignment["center"] = "center";
    SandboxContentAlignment["end"] = "end";
})(SandboxContentAlignment = exports.SandboxContentAlignment || (exports.SandboxContentAlignment = {}));
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Class
class SNBBundler {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor
    constructor(code, dependencies, visualSettings) {
        this.code = code;
        this.dependencies = this.toDependencyMap(dependencies);
        this.visualSettings = visualSettings;
    }
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Data construction
    buildSandboxPayload() {
        throw new Error(`Unable to use generic bundler, please provide type-specific implementation`);
    }
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Convenience
    toDependencyMap(object) {
        const output = new Map();
        for (const key of Object.keys(object)) {
            let value = object[key];
            if (typeof key !== "string") {
                throw `Dependency name must be a string`;
            }
            if (typeof value !== "string") {
                throw `Dependency version must be a string`;
            }
            output.set(key, value);
        }
        return output;
    }
}
exports.SNBBundler = SNBBundler;


/***/ }),

/***/ "./src/platform-bundlers/react-bundler.ts":
/*!************************************************!*\
  !*** ./src/platform-bundlers/react-bundler.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

//
//  SNBReactBundler.ts
//  Supernova
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Jiri Trecak. All rights reserved.
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SNBReactBundler = void 0;
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports
const bundler_1 = __webpack_require__(/*! ./bundler */ "./src/platform-bundlers/bundler.ts");
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Class
class SNBReactBundler extends bundler_1.SNBBundler {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Data construction
    buildSandboxPayload() {
        return {
            "/public/index.html": {
                code: this.buildIndexFile(),
            },
            "/src/App.js": {
                code: this.buildAppJS(),
            },
            "/src/index.js": {
                code: this.buildIndexJS(),
            },
            "/package.json": {
                code: this.buildPackageJSON()
            }
        };
    }
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Specific payloads
    buildIndexFile() {
        // This is react wrapper that will show the react component
        const indexFile = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
            <title>Supernova Sandbox App</title>
        </head>
        <div id="root"></div>
        </body>

        </html>`;
        console.log(indexFile);
        return indexFile;
    }
    alignmentToFlexString(alignment) {
        switch (alignment) {
            case bundler_1.SandboxContentAlignment.start: return "flex-start";
            case bundler_1.SandboxContentAlignment.center: return "center";
            case bundler_1.SandboxContentAlignment.end: return "flex-end";
        }
    }
    buildAppJS() {
        // Dynamic user code that they can provide
        return this.code;
    }
    buildIndexJS() {
        var _a, _b;
        return `
        import ReactDOM from "react-dom";
        import App from "./App";

        /* Configure body style */
        document.body.style.margin = "0px";

        ReactDOM.render(
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "${this.alignmentToFlexString((_a = this.visualSettings.horizontalAlignment) !== null && _a !== void 0 ? _a : bundler_1.SandboxContentAlignment.center)}",
                alignItems: "${this.alignmentToFlexString((_b = this.visualSettings.verticalAlignment) !== null && _b !== void 0 ? _b : bundler_1.SandboxContentAlignment.center)}",
                background: "${this.visualSettings.backgroundHex ? `#${this.visualSettings.backgroundHex}` : "transparent"}"
            }}>
                <App />
            </div>,
            document.getElementById("root")
        );`;
    }
    buildPackageJSON() {
        /* Needs dependencies:

        "react": "17.0.2",
        "react-dom": "17.0.2",
        "react-scripts": "4.0.0"

        */
        const dependencies = Array.from(this.dependencies.keys()).map(dependencyName => `"${dependencyName}": "${this.dependencies.get(dependencyName)}"`).join(",\n");
        const packageJSON = `
        {
            "name": "react",
            "version": "1.0.0",
            "description": "Supernova documentation sandbox project (find more at https://supernova.io)",
            "keywords": ["react"],
            "main": "src/index.js",
            "dependencies": {   
                ${dependencies}
            },
            "devDependencies": {
                "@babel/runtime": "7.13.8",
                "typescript": "4.1.3"
            },
            "scripts": {
                "start": "react-scripts start",
                "build": "react-scripts build",
                "test": "react-scripts test --env=jsdom",
                "eject": "react-scripts eject"
            },
            "browserslist": [">0.2%", "not dead", "not ie <= 11", "not op_mini all"]
        }`;
        return packageJSON;
    }
}
exports.SNBReactBundler = SNBReactBundler;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./src/browser-bundle.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const component_renderer_1 = __webpack_require__(/*! ./component-renderer */ "./src/component-renderer.ts");
window.sandboxRenderer = component_renderer_1.SNBComponentSandboxRenderer;

})();

/******/ })()
;
//# sourceMappingURL=rtcp-core-dev.js.map