import {
    formatWithSeparators, parseLocalizedNumber
} from "../helpers/helper.js";

/**
 * Adds metric labels to a given text by converting distances in the first line of the text.
 *
 * This function checks if built-in metric conversions are enabled and, if so, converts any distances
 * found in the first line of the input text from imperial units to metric units:
 * - "ft.", "ft", "feet" -> "m"
 * - "mi.", "mi", "miles" -> "km"
 * The converted values are appended as additional lines to the original text.
 *
 * @param {string} text - The text that contains the distances (e.g. the ruler label)
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @returns {{text: string, usedConversionFactor: number, converted: boolean}} Object containing:
 *   - text: The modified text with metric conversions added
 *   - usedConversionFactor: The conversion factor that was applied (0.3 for feet->meters, 1.61 for miles->km, or 1 if no conversion)
 *   - converted: Whether any conversion was performed
 */
function addMetricLabels(text, useBreakInsteadOfNewline = false) {
    let dontUseMetricConversions = game.settings.get("metric-ruler-labels", "disableBuiltInConversion");
    let separator = useBreakInsteadOfNewline ? "<br>" : "\n";
    let usedConversionFactor = 1;
    const textLines = text ? text.split(separator) : "";
    let converted = false;


    if (dontUseMetricConversions === false && textLines.length > 0) {
        let convertedText = convertDistanceString(textLines[0], ["ft.", "ft", "feet"], "m", 0.3);
        if (convertedText !== textLines[0]) {
            text = appendLine(text, separator, convertedText);
            usedConversionFactor = 0.3;
            converted = true;
        }
        convertedText = convertDistanceString(textLines[0], ["mi.", "mi", "miles"], "km", 1.61);
        if (convertedText !== textLines[0]) {
            text = appendLine(text, separator, convertedText);
            usedConversionFactor = 1.61;
            converted = true;
        }
    }
    return {
        text: text, usedConversionFactor: usedConversionFactor, converted: converted
    }
}

/**
 * Adds custom conversion labels to a given text based on user-defined conversion settings.
 *
 * This function retrieves custom conversion factors and labels from game settings and applies
 * these conversions to the first line of the input text. The converted values are appended
 * as additional lines to the original text.
 *
 * @param {string} text - The text containing the distances (e.g. the ruler label)
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @returns {{text: string, usedConversionFactor: number, converted: boolean}} Object containing:
 *   - text: The modified text with custom conversions added
 *   - usedConversionFactor: The custom conversion factor that was applied, or 1 if no conversion
 *   - converted: Whether any conversion was performed
 */
function addCustomConversionLabels(text, useBreakInsteadOfNewline = false) {
    let conversionFactorSmall = game.settings.get("metric-ruler-labels", "customConversionFactorSmall");
    let conversionFactorBig = game.settings.get("metric-ruler-labels", "customConversionFactorBig");
    let customConversionLabelSmall = game.settings.get("metric-ruler-labels", "customConversionLabelSmall");
    let customConversionLabelBig = game.settings.get("metric-ruler-labels", "customConversionLabelBig");
    let originalLabelsSmall = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsSmall");
    let originalLabelsBig = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsBig");
    let useCustomConversions = game.settings.get("metric-ruler-labels", "useCustomConversions");
    let separator = useBreakInsteadOfNewline ? "<br>" : "\n";
    let usedConversionFactor = 1;
    let converted = false;

    if (useCustomConversions) {
        originalLabelsSmall = originalLabelsSmall === "" ? null : originalLabelsSmall.split(",");
        originalLabelsBig = originalLabelsBig === "" ? null : originalLabelsBig.split(",");

        const textLines = text ? text.split(separator) : "";
        if ((!originalLabelsSmall && !conversionFactorSmall) && (!originalLabelsBig && !conversionFactorBig)) {
            text = appendLine(text, separator, game.i18n.localize("metric-ruler-labels.warnings.customConversionNoValues.text"));
        } else if (textLines.length > 0) {
            if (originalLabelsSmall && conversionFactorSmall) {
                let convertedText = convertDistanceString(textLines[0], originalLabelsSmall, customConversionLabelSmall, conversionFactorSmall);
                if (convertedText !== textLines[0]) {
                    text = appendLine(text, separator, convertedText);
                    usedConversionFactor = conversionFactorSmall;
                    converted = true;
                }
            }
            if (originalLabelsBig && conversionFactorBig) {
                let convertedText = convertDistanceString(textLines[0], originalLabelsBig, customConversionLabelBig, conversionFactorBig);
                if (convertedText !== textLines[0]) {
                    text = appendLine(text, separator, convertedText);
                    usedConversionFactor = conversionFactorBig;
                    converted = true;
                }
            }
        }
    }
    return {
        text: text, usedConversionFactor: usedConversionFactor, converted: converted
    }
}

/**
 * Adds travel time calculations to the given text based on the travel distance.
 *
 * This function calculates travel times for a given distance using different speed factors:
 * - Slow speed
 * - Normal speed
 * - Fast speed
 * The calculated times are added as a new line to the text.
 *
 * For multi-segment paths, it can calculate:
 * - Individual segment travel times
 * - Total travel time for the complete path
 *
 * @param {string} text - The input text containing a distance measurement
 * @param {boolean} [hasSegments=false] - Whether the measurement has multiple segments
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @returns {{text: string, converted: boolean}} Object containing:
 *   - text: The modified text with travel times added
 *   - converted: Whether travel times were added
 */
function addTravelTime(text, hasSegments = false, useBreakInsteadOfNewline = false) {
    const conversionFactorSlow = game.settings.get("metric-ruler-labels", "travelTimePerUnitSlow");
    const conversionFactorNormal = game.settings.get("metric-ruler-labels", "travelTimePerUnitNormal");
    const conversionFactorFast = game.settings.get("metric-ruler-labels", "travelTimePerUnitFast");
    const travelTimeActivated = game.settings.get("metric-ruler-labels", "enableTravelTime");
    const timeUnit = game.settings.get("metric-ruler-labels", "travelTime-TimeUnit");
    const travelTimeOnlyTotalTimeLastSegment = game.settings.get("metric-ruler-labels", "travelTimeOnlyTotalTimeLastSegment");
    const travelTimeRoundingMode = game.settings.get("metric-ruler-labels", "travelTimeRoundingMode");
    const separator = useBreakInsteadOfNewline ? "<br>" : "\n";

    let travelTimeLabel = game.settings.get("metric-ruler-labels", "travelTimeDistanceLabel");
    let converted = false;

    if (travelTimeActivated) {
        travelTimeLabel = travelTimeLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        travelTimeLabel = travelTimeLabel.replaceAll(",", "|");

        let regex = new RegExp("(-?[\\d.,]+)\\s?(?:" + travelTimeLabel + ")\\s(?:\\[(-?[\\d.,]+)\\s?(?:" + travelTimeLabel + ")\\])?");
        let regexResult = regex.exec(text.split(separator)[0]);

        if (!travelTimeLabel) {
            text = appendLine(text, separator, game.i18n.localize("metric-ruler-labels.warnings.travelTimeNoValues.text"));
            converted = true;

        } else if (regexResult && regexResult.length === 3 && regexResult[1] && (hasSegments === false || regexResult[2] === undefined)) {
            // One Segment
            text = appendLine(text, separator, buildTravelTimeLine(regexResult[1], conversionFactorSlow, conversionFactorNormal, conversionFactorFast, timeUnit, travelTimeRoundingMode, false, false, false));
            text = text.replaceAll("Infinity", "-");
            converted = true;

        } else if (regexResult && regexResult.length === 3 && regexResult[2] && hasSegments) {
            // Multiple Segments
            if (travelTimeOnlyTotalTimeLastSegment === false) {
                text = appendLine(text, separator, buildTravelTimeLine(regexResult[1], conversionFactorSlow, conversionFactorNormal, conversionFactorFast, timeUnit, travelTimeRoundingMode, false, false, false));
            }
            // Total Time
            text = appendLine(text, separator, buildTravelTimeLine(regexResult[2], conversionFactorSlow, conversionFactorNormal, conversionFactorFast, timeUnit, travelTimeRoundingMode, true, false, false));
            text = text.replaceAll("Infinity", "-");
            converted = true;
        }
    }
    return {text, converted};
}

/**
 * Converts travel time measurements for v13 of Foundry VTT.
 *
 * Extracts distance values from the text and converts them to travel times using the
 * configured speed factors and time units.
 *
 * @param {string} text - The text containing the distance measurement
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @param {boolean} [isDeltaString=false] - Whether this is a delta measurement (e.g. elevation change)
 * @returns {{text: string, converted: boolean}} Object containing:
 *   - text: The converted travel time text
 *   - converted: Whether the conversion was successful
 */
function convertToTravelTimeV13(text, useBreakInsteadOfNewline = false, isDeltaString = false) {
    const conversionFactorSlow = game.settings.get("metric-ruler-labels", "travelTimePerUnitSlow");
    const conversionFactorNormal = game.settings.get("metric-ruler-labels", "travelTimePerUnitNormal");
    const conversionFactorFast = game.settings.get("metric-ruler-labels", "travelTimePerUnitFast");
    const travelTimeActivated = game.settings.get("metric-ruler-labels", "enableTravelTime");
    const timeUnit = game.settings.get("metric-ruler-labels", "travelTime-TimeUnit");
    const travelTimeRoundingMode = game.settings.get("metric-ruler-labels", "travelTimeRoundingMode");
    const separator = useBreakInsteadOfNewline ? "<br>" : "\n";

    let travelTimeLabel = game.settings.get("metric-ruler-labels", "travelTimeDistanceLabel");
    let converted = false;

    if (travelTimeActivated) {
        travelTimeLabel = travelTimeLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        travelTimeLabel = travelTimeLabel.replaceAll(",", "|");

        let regex = "";
        if (isDeltaString) {
            regex = new RegExp("(-?\\+?[\\d.,]+)\\s?");
        } else {
            regex = new RegExp("(-?[\\d.,]+)\\s?(?:" + travelTimeLabel + ")");
        }
        let regexResult = regex.exec(text.split(separator)[0]);

        if (!travelTimeLabel) {
            text = game.i18n.localize("metric-ruler-labels.warnings.travelTimeNoValues.text");
            converted = true;

        } else if (regexResult && regexResult[1]) {
            text = buildTravelTimeLine(regexResult[1], conversionFactorSlow, conversionFactorNormal, conversionFactorFast, timeUnit, travelTimeRoundingMode, false, isDeltaString, isDeltaString);
            text = text.replaceAll("Infinity", "-");
            converted = true;
        }
    }
    return {text, converted};
}

/**
 * Converts travel time measurements for v13 of Foundry VTT and appends them to the given text.
 * The function adds the converted travel time measurements after the original text, separated by the specified separator.
 *
 * @param {string} text - The text containing the distance measurement
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @param {boolean} [isDeltaString=false] - Whether this is a delta measurement
 * @returns {{text: string, converted: boolean}} Object containing:
 *   - text: The text with travel times appended
 *   - converted: Always true since text is always modified
 */
function addTravelTimeV13(text, useBreakInsteadOfNewline = false, isDeltaString = false) {
    let separator = useBreakInsteadOfNewline ? "<br>" : "\n";
    text = appendLine(text, separator, convertToTravelTimeV13(text, useBreakInsteadOfNewline, isDeltaString).text);
    let converted = true;
    return {text, converted};
}

/**
 * Converts a measurement delta (like elevation changes) and appends it to the text.
 *
 * Can either:
 * - Convert the delta using a distance conversion factor, or
 * - Convert it to travel times if useTravelTimeConversion is true
 *
 * @param {string} text - The text containing the delta measurement
 * @param {number} conversionFactor - Factor to multiply the delta value by
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @param {boolean} [useTravelTimeConversion=false] - Convert to travel times instead of using conversionFactor
 * @returns {string} The text with converted delta appended
 */
function convertDeltaStrings(text, conversionFactor, useBreakInsteadOfNewline = false, useTravelTimeConversion = false) {
    let separator = useBreakInsteadOfNewline ? "<br>" : "\n";
    let textSplitted = text.split(separator);
    if (textSplitted.length >= 1) {
        let conversion = "";
        if (useTravelTimeConversion) {
            conversion = convertToTravelTimeV13(textSplitted[0], useBreakInsteadOfNewline, true).text;
        } else {
            conversion = convertDistanceString(textSplitted[0], [""], "", conversionFactor);
        }
        return appendLine(text, separator, conversion);
    } else {
        return text;
    }
}

/**
 * Removes the first line (Foundry measurement label) if enabled in settings.
 *
 * Checks the "hideFoundryMeasurement" setting. If enabled:
 * - Removes the first line unless it starts with "↕" (elevation ruler)
 * - Also removes any empty lines at the start
 *
 * IMPORTANT: Must be called AFTER all other label conversions
 *
 * @param {string} text - The input text containing measurement labels
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n for line breaks
 * @returns {{text: string, converted: boolean}} Object containing:
 *   - text: The text with first line potentially removed
 *   - converted: Whether any lines were removed
 */
function hideFoundryLabel(text, useBreakInsteadOfNewline = false) {
    let hideFoundry = game.settings.get("metric-ruler-labels", "hideFoundryMeasurement");
    let elevationRulerActive = game.modules.get('elevationruler')?.active;
    let separator = useBreakInsteadOfNewline ? "<br>" : "\n";
    let converted = false;
    if (hideFoundry) {
        let labelLines = text.split(separator);
        if (labelLines[0].startsWith(" ") === false) {
            if (!elevationRulerActive || (elevationRulerActive && !labelLines[0].startsWith("↕"))) {
                labelLines.shift();
                for (let i = 0; i < labelLines.length; i++) {
                    if (labelLines[0] === "") {
                        labelLines.shift();
                    } else {
                        break;
                    }
                }
            }
        }
        converted = true;
        return {text: labelLines.join(separator), converted: converted};
    } else {
        return {text: text, converted: converted};
    }
}

/**
 * Converts distances in text from one unit to another using a conversion factor.
 *
 * The function:
 * - Searches for numbers followed by any of the searchLabels
 * - Multiplies the numbers by the conversionFactor
 * - Replaces the old label with newLabel
 * - Preserves the original number formatting (decimal/thousand separators)
 *
 * @param {string} text - The text containing distance measurements
 * @param {string[]} searchLabels - Unit labels to search for (e.g. ["ft", "ft.", "feet"])
 * @param {string} newLabel - Unit label to replace with (e.g. "m")
 * @param {number} conversionFactor - Factor to multiply values by (e.g. 0.3 for ft to m)
 * @returns {string} Text with converted distances
 *
 * @example
 * convertDistanceString("5 ft [10 ft]", ["ft", "ft."], "m", 0.3)
 * // Returns "1.5 m [3 m]"
 */
function convertDistanceString(text, searchLabels, newLabel, conversionFactor) {
    //Sort labels so that more specific ones come first
    searchLabels.sort((a, b) => b.length - a.length);

    // Escape labels for regex
    searchLabels = searchLabels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // creates a regex that searches for the label with a number in front of it
    // Support both US (e.g., 1,234.56) and EU (e.g., 1.234,56) formats by capturing digits with optional ',' and '.'
    const regex = new RegExp("(-?[\\d.,]+)(\\s*)(" + searchLabels.join('|') + ")", 'g');

    //Searches for the sections where we have a distance followed by a label and replaces them.
    return text.replace(regex, (match, distance, whiteSpaces) => {
        const {value, decimalSep, thousandSep, hadThousandSep} = parseLocalizedNumber(distance);
        if (isNaN(value)) return match; // fallback: don't change if parsing failed
        const converted = Number(value * conversionFactor);
        const convertedDistance = formatWithSeparators(converted, decimalSep, thousandSep, hadThousandSep);
        //Return the converted string with the same format as the old one
        return convertedDistance + whiteSpaces + newLabel;
    });
}

/**
 * Rounds travel time values based on the specified rounding mode.
 *
 * Available rounding modes:
 * - "roundToFullTenths" - Truncates to nearest tenth (e.g. 1.23 -> 1.2)
 * - "roundToFullQuarters" - Rounds down to nearest quarter (e.g. 1.7 -> 1.5)
 * - "roundToFullHalves" - Rounds down to nearest half (e.g. 1.7 -> 1.5)
 * - "roundToFull" - Truncates to whole number (e.g. 1.7 -> 1)
 * - "noSpecialRounding" - Rounds to one decimal place
 *
 * @param {number} value - Travel time value to round
 * @param {string} roundingMode - Rounding mode to use
 * @returns {number} Rounded absolute value
 */
function roundTravelTimes(value, roundingMode) {
    switch (roundingMode) {
        case "roundToFullTenths":
            return Math.abs(truncToTenth(value));
        case "roundToFullQuarters":
            return Math.abs(floorToQuarter(value));
        case "roundToFullHalves":
            return Math.abs(floorToHalf(value));
        case "roundToFull":
            return Math.abs(truncToFull(value));
        case "noSpecialRounding":
            return Math.abs(roundToOneDecimal(value));
        default:
            return Math.abs(value);
    }
}

/**
 * Rounds a number to one decimal place.
 *
 * @param {number} value - Number to round
 * @returns {number} Rounded to one decimal place
 */
function roundToOneDecimal(value) {
    return Math.round((value + Number.EPSILON) * 10) / 10
}

/**
 * Truncates a number to a whole number.
 *
 * @param {number} value - Number to truncate
 * @returns {number} Truncated whole number
 */
function truncToFull(value) {
    return Math.trunc(value);
}

/**
 * Rounds a number down to the nearest half.
 *
 * Examples:
 * - 1.7 -> 1.5
 * - 1.2 -> 1.0
 *
 * @param {number} value - Number to round down
 * @param {number} [fractionDigits=2] - Decimal places in output
 * @returns {number} Value rounded down to nearest half
 */
function floorToHalf(value, fractionDigits = 2) {
    // Small EPSILON to handle floating-point inaccuracies
    return Number((Math.floor((value + Number.EPSILON) * 2) / 2).toFixed(fractionDigits));
}

/**
 * Rounds a number down to the nearest quarter.
 *
 * Examples:
 * - 1.7 -> 1.5
 * - 1.3 -> 1.25
 *
 * @param {number} value - Number to round down
 * @param {number} [fractionDigits=2] - Decimal places in output
 * @returns {number} Value rounded down to nearest quarter
 */
function floorToQuarter(value, fractionDigits = 2) {
    // Small EPSILON to handle floating-point inaccuracies
    return Number((Math.floor((value + Number.EPSILON) * 4) / 4).toFixed(fractionDigits));
}

/**
 * Truncates a number to one decimal place.
 *
 * Examples:
 * - 1.23 -> 1.2
 * - 1.78 -> 1.7
 *
 * @param {number} value - Number to truncate
 * @returns {number} Value truncated to one decimal
 */
function truncToTenth(value) {
    return Number(Math.trunc(value * 10) / 10);
}

/**
 * Builds a travel time line showing slow, normal and fast speeds.
 *
 * Creates a formatted string like: "1.5 | 1.0 | 0.75 h"
 * Can optionally:
 * - Wrap in brackets: "[1.5 | 1.0 | 0.75 h]"
 * - Wrap in parentheses: "(1.5 | 1.0 | 0.75 h)"
 * - Omit the time unit: "1.5 | 1.0 | 0.75"
 *
 * @param {string} distanceString - Distance to calculate times for
 * @param {number} conversionFactorSlow - Factor for slow speed
 * @param {number} conversionFactorNormal - Factor for normal speed
 * @param {number} conversionFactorFast - Factor for fast speed
 * @param {string} timeUnit - Time unit label (e.g. "h")
 * @param {string} [roundingMode="roundToFullQuarters"] - How to round the times
 * @param {boolean} [wrapInSquareBrackets=false] - Wrap in square brackets
 * @param {boolean} [wrapInRoundBrackets=false] - Wrap in round brackets
 * @param {boolean} [dontAddTimeUnit=false] - Omit the time unit
 * @returns {string} Formatted travel time line
 */
function buildTravelTimeLine(distanceString, conversionFactorSlow, conversionFactorNormal, conversionFactorFast, timeUnit, roundingMode = "roundToFullQuarters", wrapInSquareBrackets = false, wrapInRoundBrackets = false, dontAddTimeUnit = false) {

    const {value, decimalSep, thousandSep, hadThousandSep} = parseLocalizedNumber(distanceString);

    const slowNum = roundTravelTimes(Number(value / conversionFactorSlow), roundingMode);
    const normalNum = roundTravelTimes(Number(value / conversionFactorNormal), roundingMode);
    const fastNum = roundTravelTimes(Number(value / conversionFactorFast), roundingMode);

    const slow = formatWithSeparators(slowNum, decimalSep, thousandSep, true);
    const normal = formatWithSeparators(normalNum, decimalSep, thousandSep, true);
    const fast = formatWithSeparators(fastNum, decimalSep, thousandSep, true);

    const line = `${slow} | ${normal} | ${fast}${dontAddTimeUnit ? '' : ' ' + timeUnit}`;
    if (wrapInSquareBrackets) return `[${line}]`;
    else if (wrapInRoundBrackets) return `(${line})`;
    else return line;

}

/**
 * Appends a line to text with the specified separator.
 *
 * Adds a space before and after the separator when joining lines.
 *
 * @param {string} text - Original text
 * @param {string} separator - Separator between lines
 * @param {string} line - Line to append
 * @returns {string} Text with line appended
 */
function appendLine(text, separator, line) {
    return text + " " + separator + " " + line;
}


export {
    addMetricLabels,
    addCustomConversionLabels,
    addTravelTime,
    addTravelTimeV13,
    hideFoundryLabel,
    convertDeltaStrings,
    convertDistanceString
};

// Node/CommonJS compatibility for simple test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports.convertDistanceString = convertDistanceString;
}