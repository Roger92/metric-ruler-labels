let commaUsedAsDecimalSeparator = false;
let waypointLabelsStyle = null;
let runtimeRules = new Map();

/**
 * Gets whether comma is used as decimal separator
 * @returns {boolean} True if comma is used as decimal separator, false otherwise
 */
function getCommaUsedAsDecimalSeparator() {
    return commaUsedAsDecimalSeparator;
}

/**
 * Sets whether comma should be used as decimal separator
 * @param {boolean} useComma - True to use comma as decimal separator, false to use period
 */
function setCommaUsedAsDecimalSeparator(useComma) {
    commaUsedAsDecimalSeparator = useComma;
}

/**
 * Parses a localized number string into a JS number and returns separator info.
 * Determines decimal vs thousand separators using rules:
 * - If both ',' and '.' exist, the rightmost is the decimal separator.
 * - If only one exists, it is decimal only if it appears exactly two digits from the right (third position from the right);
 *   otherwise it is treated as a thousands separator.
 * - If none exist, '.' is used as decimal for normalization.
 *
 * @param {string} numStr
 * @returns {{value:number, decimalSep:string, thousandSep:(string|null), hadThousandSep:boolean}}
 */
function parseLocalizedNumber(numStr){
    const countChar = (s, ch) => (s.match(new RegExp('\\' + ch, 'g')) || []).length;
    const hasComma = numStr.includes(',');
    const hasDot = numStr.includes('.');
    let decimalSep = null;
    let thousandSep = null;

    if (hasComma && hasDot) {
        // When both are present, rightmost is decimal separator
        decimalSep = (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) ? ',' : '.';
        thousandSep = decimalSep === ',' ? '.' : ',';
    } else if (hasComma) {
        const commaCount = countChar(numStr, ',');
        const pos = numStr.lastIndexOf(',');
        const digitsAfter = (numStr.length - pos - 1);
        // Treat as decimal if there is only one occurrence and 1 or 2 digits follow (e.g., 10,2 or 10,25)
        if (commaCount === 1 && (digitsAfter === 1 || digitsAfter === 2)) {
            decimalSep = ',';
            setCommaUsedAsDecimalSeparator(true);
        } else {
            thousandSep = ',';
            decimalSep = '.'; // default for parsing
        }
    } else if (hasDot) {
        const dotCount = countChar(numStr, '.');
        const pos = numStr.lastIndexOf('.');
        const digitsAfter = (numStr.length - pos - 1);
        // Treat as decimal if there is only one occurrence and 1 or 2 digits follow (e.g., 10.2 or 10.25)
        if (dotCount === 1 && (digitsAfter === 1 || digitsAfter === 2)) {
            decimalSep = '.';
        } else {
            thousandSep = '.';
            decimalSep = '.'; // no decimal, but keep '.' for JS parsing
        }
    } else {
        // No separators, but use comma if it was used as a decimal separator before
        if(getCommaUsedAsDecimalSeparator() === true){
            decimalSep = ',';
        }else{
            decimalSep = '.';
        }
    }

    const hadThousandSep = thousandSep ? numStr.includes(thousandSep) : false;

    // Normalize for parsing: remove thousand separators and ensure '.' as decimal
    let normalized = numStr;
    if (thousandSep) normalized = normalized.replace(new RegExp('\\' + thousandSep, 'g'), '');
    if (decimalSep === ',') normalized = normalized.replace(/,/g, '.');
    const value = parseFloat(normalized);
    return { value, decimalSep, thousandSep, hadThousandSep };
}

/**
 * Formats a number using the provided decimal and thousand separators.
 * Keeps up to 2 decimals and trims trailing zeros. Optionally adds thousand grouping.
 *
 * @param {number} num
 * @param {string} decimalSep
 * @param {string|null} thousandSep
 * @param {boolean} addThousands
 * @returns {string}
 */
function formatWithSeparators(num, decimalSep, thousandSep, addThousands){
    // format with up to 2 decimals and trim trailing zeros
    let s = Number(num).toFixed(2).replace(/\.?0+$/, '');
    let [intPart, fracPart] = s.split('.');
    if (addThousands && thousandSep) {
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
    }
    if (fracPart && fracPart.length > 0) {
        const dec = decimalSep === ',' ? ',' : '.';
        return intPart + dec + fracPart;
    }
    return intPart;
}

/**
 * Initializes a style element for dynamic runtime CSS rules.
 * Creates a new style element with ID 'metric-ruler-labels-style' and adds it to the document head.
 */
function initializeRuntimeStyle() {
    waypointLabelsStyle = document.createElement("style");
    waypointLabelsStyle.setAttribute("id", "metric-ruler-labels-style");
    document.head.appendChild(waypointLabelsStyle);
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
    waypointLabelsStyle.textContent = "";
    runtimeRules.forEach((props, selector) => {
        let cssString = Object.entries(props)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ");
        waypointLabelsStyle.textContent += `${selector} { ${cssString} }\n`;
    });
}

export {
    parseLocalizedNumber,
    formatWithSeparators,
    initializeRuntimeStyle,
    updateRuntimeRule,
    removeRuntimeRule
};
