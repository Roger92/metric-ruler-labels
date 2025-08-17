// State for runtime CSS rules
let waypointLabelsStyle = null;
let runtimeRules = new Map();

// Internal map to track minimum widths per element ID
const minWidthMap = new Map();

/**
 * Initializes a style element for dynamic runtime CSS rules.
 * Creates a new style element with ID 'metric-ruler-labels-style' and adds it to the document head.
 */
function initializeRuntimeStyle() {
    if (document.getElementById("metric-ruler-labels-style") === null) {
        waypointLabelsStyle = document.createElement("style");
        waypointLabelsStyle.setAttribute("id", "metric-ruler-labels-style");
        document.head.appendChild(waypointLabelsStyle);
    }
}

/**
 * Updates or adds a CSS rule at runtime.
 * Stores the rule in the runtimeRules map and regenerates all rules in the style element.
 *
 * @param {string} selector - The CSS selector for the rule
 * @param {string} ruleBody - The CSS declarations for the rule
 */
function updateRuntimeRule(selector, ruleBody) {
    mergeRule(selector, ruleBody);
    rebuildStyle();
}

/**
 * Removes a CSS rule or specific property from a rule at runtime.
 *
 * @param {string} selector - The CSS selector for the rule to remove
 * @param {string} [property] - Optional specific CSS property to remove from the rule
 */
function removeRuntimeRule(selector, property) {
    if (!runtimeRules.has(selector)) return;

    if (property) {
        // Remove only the given property
        let currentProps = runtimeRules.get(selector);
        delete currentProps[property];
        // If no props left, remove the selector entirely
        if (Object.keys(currentProps).length === 0) {
            runtimeRules.delete(selector);
        } else {
            runtimeRules.set(selector, currentProps);
        }
    } else {
        // Remove the entire selector
        runtimeRules.delete(selector);
    }
    rebuildStyle();
}

/**
 * Merges new CSS properties into an existing rule or creates a new rule.
 *
 * @param {string} selector - The CSS selector to merge properties for
 * @param {string} newStyles - CSS style string in format "property: value; property2: value2;"
 */
function mergeRule(selector, newStyles) {
    // Convert "color: red; height: 50px;" into key-value pairs
    let newProps = parseCSSString(newStyles);

    // Get existing properties (if any)
    let currentProps = runtimeRules.has(selector)
        ? runtimeRules.get(selector)
        : {};

    // Merge: overwrite or add new properties
    Object.assign(currentProps, newProps);

    runtimeRules.set(selector, currentProps);
}

/**
 * Parses a CSS string into an object of property-value pairs.
 *
 * @param {string} css - CSS string in format "property: value; property2: value2;"
 * @returns {Object} Object with CSS properties as keys and values
 */
function parseCSSString(css) {
    let obj = {};
    css.split(";").forEach(part => {
        let [prop, value] = part.split(":").map(s => s && s.trim());
        if (prop && value) {
            obj[prop] = value;
        }
    });
    return obj;
}

/**
 * Rebuilds the runtime style element content from the stored rules.
 */
function rebuildStyle() {
    if (!waypointLabelsStyle) return;
    waypointLabelsStyle.textContent = "";
    runtimeRules.forEach((props, selector) => {
        let cssString = Object.entries(props)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ");
        waypointLabelsStyle.textContent += `${selector} { ${cssString} }\n`;
    });
}

/**
 * Sets a CSS variable in the inline style of an element by ID.
 *
 * @param {string} elementId - The ID of the target element.
 * @param {string} varName - The name of the CSS variable (with or without leading "--").
 * @param {string} value - The value to set (e.g. "#f00", "12px", "1rem").
 * @returns {boolean} true on success, false otherwise.
 */
function setCssVarById(elementId, varName, value) {
    if (!elementId || !varName) return false;

    // Ensure variable name starts with "--"
    const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;

    const el = document.getElementById(elementId);
    if (!el) return false;

    el.style.setProperty(normalizedName, value);
    return true;
}

/**
 * Removes a CSS variable from the inline style of an element by ID.
 * @param {string} elementId
 * @param {string} varName
 * @returns {boolean}
 */
function removeCssVarById(elementId, varName) {
    if (!elementId || !varName) return false;
    const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;
    const el = document.getElementById(elementId);
    if (!el) return false;

    el.style.removeProperty(normalizedName);
    return true;
}

/**
 * Gets the current minimum width value for the given ID.
 * @param {string} id - The ID to get the minimum width for.
 * @returns {number} The current minimum width value, or 0 if not found.
 */
function getCurrentMinWidth(id) {
    return minWidthMap.get(id) || 0;
}

/**
 * Sets the current minimum width value for the given ID.
 * @param {string} id - The ID to set the minimum width for.
 * @param {number} value - The new minimum width value to set.
 */
function setCurrentMinWidth(id, value) {
    minWidthMap.set(id, value);
}

/**
 * Cleans up the minWidthMap by removing entries for ruler labels that no longer have child nodes.
 * Also removes the associated CSS variable for those rulers.
 *
 * @returns {void} This function does not return a value. It directly modifies the minWidthMap and CSS variables.
 */
function cleanUpMinWidths() {
    let rulers = document.getElementsByClassName("ruler-labels");
    for (let i = 0; i < rulers.length; i++) {
        if (!rulers[i].hasChildNodes()) {
            minWidthMap.delete(rulers[i].id);
            removeCssVarById(rulers[i].id, "--waypoint-label-min-width");
        }
    }
}

export {
    // runtime CSS helpers
    initializeRuntimeStyle,
    updateRuntimeRule,
    removeRuntimeRule,
    mergeRule,
    parseCSSString,
    rebuildStyle,
    setCssVarById,
    removeCssVarById,
    // min-width helpers
    getCurrentMinWidth,
    setCurrentMinWidth,
    cleanUpMinWidths
};
