/**
 * Safely retrieves the CSS rules from a given stylesheet.
 *
 * This function attempts to access the `cssRules` property of the provided
 * stylesheet. If the stylesheet is inaccessible (e.g., due to cross-origin
 * restrictions or Content Security Policy), it catches the error and returns null.
 *
 * @param {CSSStyleSheet} sheet - The stylesheet object from which to retrieve CSS rules.
 * @returns {CSSRuleList | null} The list of CSS rules if accessible, otherwise null.
 */
const safeGetCSSRules = (sheet) => {
    try {
        return sheet?.cssRules ?? null;
    } catch (e) {
        return null; // not accessible
    }
};


export {
    safeGetCSSRules
};