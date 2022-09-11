const componentHTMLEditor = CodeMirror.fromTextArea(document.getElementById("field-componenthtml"), {
    lineNumbers: true,
    mode: 'text/javascript',
    theme: 'supernova',
    styleActiveLine: { nonEmpty: true }
});

const componentTSEditor = CodeMirror.fromTextArea(document.getElementById("field-componentts"), {
    lineNumbers: true,
    mode: 'text/javascript',
    theme: 'supernova',
    styleActiveLine: { nonEmpty: true }
});

const componentCSSEditor = CodeMirror.fromTextArea(document.getElementById("field-componentcss"), {
    lineNumbers: true,
    mode: 'text/javascript',
    theme: 'supernova',
    styleActiveLine: { nonEmpty: true }
});

const moduleTSEditor = CodeMirror.fromTextArea(document.getElementById("field-modulets"), {
    lineNumbers: true,
    mode: 'text/javascript',
    theme: 'supernova',
    styleActiveLine: { nonEmpty: true }
});

const packageEditor = CodeMirror.fromTextArea(document.getElementById("field-package"), {
    lineNumbers: true,
    mode: 'text/javascript',
    theme: 'supernova',
    styleActiveLine: { nonEmpty: true }
});

componentHTMLEditor.on('change', editor => { codeUpdate(); });
componentTSEditor.on('change', editor => { codeUpdate(); });
componentCSSEditor.on('change', editor => { codeUpdate(); });
moduleTSEditor.on('change', editor => { codeUpdate(); });
packageEditor.on('change', editor => { codeUpdate(); });

$(document).on('shown.bs.tab', null, function() {
    componentHTMLEditor.refresh();
    componentTSEditor.refresh();
    componentCSSEditor.refresh();
    moduleTSEditor.refresh();
    packageEditor.refresh();
})

// Encode sandbox data from textareas providing content
function getEncodedSandboxData(renderer) {
    // Get code and package data, and encode the sandbox information
    const componentHTML = componentHTMLEditor.doc.getValue()
    const componentTS = componentTSEditor.doc.getValue()
    const componentCSS = componentCSSEditor.doc.getValue()
    const moduleTS = moduleTSEditor.doc.getValue()
    const package = packageEditor.doc.getValue()

    const background = document.getElementById("sb-config-background").value
    const alignment = document.getElementById("sb-config-alignment").value
    const padding = document.getElementById("sb-config-padding").value

    // NPM registry configuration
    const registry = {
        enabledScopes: ['@supernova-studio/*'],
        limitToScopes: false,
        registryUrl: 'https://notusedonfe.io/',
        proxyUrl: 'https://npm-proxy-dev.supernova.io/'
    }

    // Sandbox code setup
    const files = {
        componentCSS: componentCSS,
        componentHTML: componentHTML,
        componentTS: componentTS,
        moduleTS: moduleTS,
        package: package
    }

    // Visual configuration of the sandbox
    const visual = {
        visual: alignment,
        backgroundColor: background,
        padding: padding
    }

    // Note: This creates base64-encoded string that contains all neccessary information to render the iframe
    // Only allowed option is "react" for now, we'll add more later (angular, vue)
    return renderer.encodeSandboxData("angular", files, visual, registry)
}

function updateHeight() {
    // This is only for this demo, so we know that sandbox properly centers content vertically
    const height = document.getElementById("sb-config-height").value
    if (height.length > 0 && parseInt(height)) {
        document.getElementById("sb-container").style.height = `${parseInt(height)}px`
    }
}

// Simple debounce so we are not trashing compiler
const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ---- Access rendering engine. I made it so it is prepared for you by default without anything, just access new property
const engine = window.sandboxEngine;

// ---- Handling observer and notifications coming from renderer - must be setup before setting the sandboxes
engine.setObserver((message) => {
    let element = document.getElementById("status")
    let userMessage = `Status: ${message.status}`
    if (message.error) {
        userMessage += `, error message: ${message.error}`
    }
    element.innerText = userMessage
    let color = "fbfbfb";

    switch (message.status) {
        case "done":
            color = "rgb(208 239 255)";
            break
        case "error":
            color = "rgb(255 219 238)";
            break
        default:
            color = "rgb(242 255 219)";
            break
    }
    element.style.backgroundColor = `#${color}`

    // It is possible to know to which target the message belongs by accessing `.sandboxId` property
    // const id = message.sandboxId
})

// ---- Handling initial load of sandbox(es) ----

// Current target equal to unique element, iframe or div (use iframe)
const renderingTarget = "sb-target"

// Inject encoded data to the iframe tag. This should be called for every iframe that was spawned
const encodedInitialData = getEncodedSandboxData(engine)
engine.setSandboxDataBeforeLoad(renderingTarget, encodedInitialData)

// Build sandboxesthat are authorized for private proxy
engine.buildSandboxesAnonymous(["sb-target"])
updateHeight()

// ---- Updating sandbox(es) ----

// Hook update events
const codeUpdate = debounce(function() {
    // Update sandbox on every content change, debounced
    // We get encoded data again
    const encodedData = getEncodedSandboxData(engine)

    // And we update sandbox, using the ID we provided when constructing the iframe
    engine.updateSandbox(renderingTarget, encodedData)
    updateHeight()
}, 1000)

// Observers for all fields
document.getElementById("sb-config-background").addEventListener('input', function() {
    codeUpdate()
}, false);
document.getElementById("sb-config-alignment").addEventListener('input', function() {
    codeUpdate()
}, false);
document.getElementById("sb-config-height").addEventListener('input', function() {
    codeUpdate()
}, false);
document.getElementById("sb-config-padding").addEventListener('input', function() {
    codeUpdate()
}, false);