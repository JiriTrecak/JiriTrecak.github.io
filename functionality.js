// Encode sandbox data from textareas providing content
function getEncodedSandboxData(renderer) {
    // Get code and package data, and encode the sandbox information
    const code = document.getElementById("field-code").value
    const package = document.getElementById("field-package").value
    const style = document.getElementById("field-styling").value

    const background = document.getElementById("sb-config-background").value
    const alignment = document.getElementById("sb-config-alignment").value
    const padding = document.getElementById("sb-config-padding").value

    const registry = {
        enabledScopes: ['@supernova-studio/*'],
        limitToScopes: false,
        registryUrl: 'https://notusedonfe.io/',
        proxyUrl: 'https://npm-proxy-dev.supernova.io/'
    }

    // Note: This creates base64-encoded string that contains all neccessary information to render the iframe
    // Only allowed option is "react" for now, we'll add more later (angular, vue)
    return renderer.encodeSandboxData("react", code, package, style, alignment, background, padding, registry)
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
            color = "d7ffe0";
            break
        case "error":
            color = "ffd7e0";
            break
        default:
            color = "fbfbfb";
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
// const tokenUrl = "https://supernova.dev.docs-dev.supernova.io/dark-matter/sandbox.json"
// engine.buildSandboxesSessionAuthorized(["sb-target"], tokenUrl)
engine.buildSandboxesAnonymous(["sb-target"])
updateHeight()

// You can also use search function to find all ids:
// let targets = engine.getSandboxTargetsStartingWith("sb-")
// engine.buildSandboxesSessionAuthorized(targets, tokenUrl)

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
document.getElementById("field-code").addEventListener('input', function() {
    codeUpdate()
}, false);
document.getElementById("field-package").addEventListener('input', function() {
    codeUpdate()
}, false);
document.getElementById("field-styling").addEventListener('input', function() {
    codeUpdate()
}, false);
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