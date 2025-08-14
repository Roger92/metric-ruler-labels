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
        // No separators
        decimalSep = '.';
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

export {
    safeGetCSSRules,
    parseLocalizedNumber,
    formatWithSeparators
};
