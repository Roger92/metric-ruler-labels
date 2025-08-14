import {
    formatWithSeparators,
    parseLocalizedNumber
} from "./helper.js";
/**
 * Adds metric labels to a given text by converting distances in the first line of the text.
 *
 * This function checks if built-in metric conversions are enabled and, if so, converts any distances
 * found in the first line of the input text from imperial units ("ft.","ft","feet" and "ft.","ft","feet") to metric units ("m" and "km").
 * The converted values are appended as additional lines to the original text.
 *
 * @param {string} text -  The text that contains the distances (e.g. the ruler label)
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n
 * @returns {Object} Object containing the modified text and conversion information
 * @returns {string} Object.text - The input text with appended metric conversions, if applicable
 * @returns {number} Object.usedConversionFactor - The conversion factor used (1 if no conversion occurred)
 * @returns {boolean} Object.converted - Signs that a conversion was applied
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
            text += " " + separator + " "
            text += convertedText;
            usedConversionFactor = 0.3;
            converted = true;
        }
        convertedText = convertDistanceString(textLines[0], ["mi.", "mi", "miles"], "km", 1.61);
        if (convertedText !== textLines[0]) {
            text += " " + separator + " "
            text += convertedText;
            usedConversionFactor = 1.61;
            converted = true;
        }
    }
    return {
        text: text,
        usedConversionFactor: usedConversionFactor,
        converted: converted
    }
}

/**
 * Adds custom conversion labels to a given text based on user-defined conversion settings.
 *
 * This function retrieves custom conversion factors and labels from game settings and applies
 * these conversions to the first line of the input text. If conversions are applicable, they
 * are appended as additional lines to the original text.
 *
 * @param {string} text -  The text that contains the distances (e.g. the ruler label)
 * @param {boolean} [useBreakInsteadOfNewline=false] -  Use <br> instead of \n
 * @returns {Object} Object containing the modified text and conversion information
 * @returns {string} Object.text - The input text with appended metric conversions, if applicable
 * @returns {number} Object.usedConversionFactor - The conversion factor used (1 if no conversion occurred)
 * @returns {boolean} Object.converted - Signs that a conversion was applied
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
        if ((!originalLabelsSmall && !conversionFactorSmall)
            && (!originalLabelsBig && !conversionFactorBig)) {
            text += " "+separator+" " + game.i18n.localize("metric-ruler-labels.warnings.customConversionNoValues.text");
        } else if(textLines.length > 0) {
            if(originalLabelsSmall && conversionFactorSmall){
                let convertedText = convertDistanceString(textLines[0],originalLabelsSmall,customConversionLabelSmall,conversionFactorSmall);
                if(convertedText !== textLines[0]){
                    text += " "+separator+" "
                    text += convertedText;
                    usedConversionFactor = conversionFactorSmall;
                    converted = true;
                }
            }
            if(originalLabelsBig && conversionFactorBig){
                let convertedText = convertDistanceString(textLines[0],originalLabelsBig,customConversionLabelBig,conversionFactorBig);
                if(convertedText !== textLines[0]){
                    text += " "+separator+" "
                    text += convertedText;
                    usedConversionFactor = conversionFactorBig;
                    converted = true;
                }
            }
        }
    }
    return {
        text: text,
        usedConversionFactor: usedConversionFactor,
        converted: converted
    }
}

/**
 * Adds travel time calculations to the given text based on the travel distance.
 *
 * This function checks if the travel time feature is enabled in the game settings, and if so,
 * it calculates the travel time for a given distance using different speed factors (slow, normal, fast).
 * The calculated travel times are added to the input text as a new line. The function also handles segment-based travel
 * time calculations, if applicable.
 *
 * @param {string} text - The input text, typically containing a distance with a specific travel time label.
 * @param {boolean} [hasSegments=false] - A flag indicating whether the input text contains segments (optional).
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n
 * @returns {Object} Object containing the modified text and conversion information
 * @returns {string} Object.text - The input text with appended metric conversions, if applicable
 * @returns {boolean} Object.converted - Signs that a conversion was applied
 */
function addTravelTime(text, hasSegments = false, useBreakInsteadOfNewline = false) {
    let conversionFactorSlow = game.settings.get("metric-ruler-labels", "travelTimePerUnitSlow");
    let conversionFactorNormal = game.settings.get("metric-ruler-labels", "travelTimePerUnitNormal");
    let conversionFactorFast = game.settings.get("metric-ruler-labels", "travelTimePerUnitFast");
    let travelTimeLabel = game.settings.get("metric-ruler-labels", "travelTimeDistanceLabel");
    let travelTimeActivated = game.settings.get("metric-ruler-labels", "enableTravelTime");
    let timeUnit = game.settings.get("metric-ruler-labels", "travelTime-TimeUnit");
    let travelTimeOnlyTotalTimeLastSegment = game.settings.get("metric-ruler-labels", "travelTimeOnlyTotalTimeLastSegment");
    let separator = useBreakInsteadOfNewline ? "<br>" : "\n";
    let converted = false;
    if (travelTimeActivated) {
        travelTimeLabel = travelTimeLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        travelTimeLabel = travelTimeLabel.replaceAll(",", "|");

        let regex = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + travelTimeLabel + ")\\s(?:\\[(-?\\d*\\.?\\d*)\\s?(?:" + travelTimeLabel + ")\\])?");
        let regexResult = regex.exec(text.split(separator)[0]);

        if (!travelTimeLabel) {
            text += " "+separator+" " + game.i18n.localize("metric-ruler-labels.warnings.travelTimeNoValues.text");
            converted = true;
        } else if (regexResult && regexResult.length === 3 && regexResult[1] && (hasSegments === false || regexResult[2] === undefined)) {
            //The Ruler only has one segment
            text += " "+separator+" "
            //Calculate Traveltimes
            text = text + roundToQuarters(parseFloat((regexResult[1] / conversionFactorSlow).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[1] / conversionFactorNormal).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[1] / conversionFactorFast).toFixed(2))) + " " + timeUnit;
            text = text.replaceAll("Infinity", "-");
            converted = true;
        } else if (regexResult && regexResult.length === 3 && regexResult[2] && hasSegments) {
            //The Ruler has multiple segments
            if (travelTimeOnlyTotalTimeLastSegment === false) {
                //Calculate Traveltime
                text += " "+separator+" "
                text = text + roundToQuarters(parseFloat((regexResult[1] / conversionFactorSlow).toFixed(2))) + " | "
                    + roundToQuarters(parseFloat((regexResult[1] / conversionFactorNormal).toFixed(2))) + " | "
                    + roundToQuarters(parseFloat((regexResult[1] / conversionFactorFast).toFixed(2))) + " " + timeUnit;
            }
            //Total Traveltime
            text += " "+separator+" "
            text = text + "[" + roundToQuarters(parseFloat((regexResult[2] / conversionFactorSlow).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[2] / conversionFactorNormal).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[2] / conversionFactorFast).toFixed(2))) + " " + timeUnit + "]";
            text = text.replaceAll("Infinity", "-");
            converted = true;
        }

    }
    return {text:text,converted:converted};

}
/**
 * Converts the delta of a measurement or elevation to a new string with a given separator.
 *
 * @param {string} text - The input text containing the measurement or elevation delta.
 * @param {number} conversionFactor - The conversion factor to be used for the conversion.
 * @param {boolean} [useBreakInsteadOfNewline=false] -  Use <br> instead of \n
 * @returns {string} The input text with the Foundry label hidden, if applicable.
 */
function convertDeltaStrings(text, conversionFactor, useBreakInsteadOfNewline = false) {
    let separator = useBreakInsteadOfNewline ? "<br><br>" : "\n\n";
    let textSplitted =text.split(separator);
    if(textSplitted.length >= 1){
        let conversion = convertDistanceString(textSplitted[0],[""],"",conversionFactor);
        return text + separator + conversion
    }else{
        return text;
    }
}

/**
 * Removes the first line (which is the Foundry measurement label) from the given text if the corresponding setting is enabled.
 *
 * This function checks if the "hideFoundryMeasurement" setting is enabled. If it is, it removes
 * the first line of the input text, unless it starts with the special "↕" character used by the elevation ruler.
 * IMPORTANT: This function should only be called after all label conversions are done
 *
 * @param {string} text - The input text containing the measurement label to be potentially hidden.
 * @param {boolean} [useBreakInsteadOfNewline=false] - Use <br> instead of \n
 * @returns {Object} Object containing the modified text and conversion information
 * @returns {string} Object.text - The input text with the hidden Foundry label, if applicable.
 * @returns {boolean} Object.converted - Signs that a conversion was applied
 */
//IMPORTANT... ONLY USE AS LAST FUNCTION CALL
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
            }
        }
        converted = true;
        return { text:labelLines.join(separator), converted:converted };
    } else {
        return { text:text, converted:converted };
    }
}

/**
 * Converts distance strings within a text from one unit to another using a conversion factor.
 *
 * @param {string} text - The text that contains the distances (e.g. the ruler label)
 * @param {string[]} searchLabels - An array of units to search for in the text (e.g., ["ft", "ft.", "feet"]).
 * @param {string} newLabel - The new unit label to replace the found units with (e.g., "meter").
 * @param {number} conversionFactor - The factor by which to multiply the numeric distance values for conversion. (e.g. 3 for the conversion from feet to meters)
 * @returns {string} The modified text with the converted distance values and new unit labels.
 *
 * @example
 * // Example usage:
 * const text = "5 ft [5 ft] x 5 ft [5 ft]";
 * const result = convertDistanceString(text, ["ft", "ft.", "feet"], "meter", 3);
 * console.log(result); // "1.50 m [1.50 m] x 1.50 m [1.50 m]"
 */
function convertDistanceString(text,searchLabels,newLabel,conversionFactor){
    //Sort labels so that more specific ones come first
    searchLabels.sort((a, b) => b.length - a.length);

    // Escape labels for regex
    searchLabels = searchLabels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // creates a regex that searches for the label with a number in front of it
    // Support both US (e.g., 1,234.56) and EU (e.g., 1.234,56) formats by capturing digits with optional ',' and '.'
    const regex = new RegExp("(-?[\\d.,]+)(\\s*)(" + searchLabels.join('|') + ")", 'g');

    //Searches for the sections where we have a distance followed by a label and replaces them.
    return text.replace(regex, (match, distance, whiteSpaces) => {
        const { value, decimalSep, thousandSep, hadThousandSep } = parseLocalizedNumber(distance);
        if (isNaN(value)) return match; // fallback: don't change if parsing failed
        const converted = Number(value * conversionFactor);
        const convertedDistance = formatWithSeparators(converted, decimalSep, thousandSep, hadThousandSep);
        //Return the converted string with the same format as the old one
        return convertedDistance + whiteSpaces + newLabel;
    });
}

/**
 * Rounds a number to the nearest quarter (0.25).
 *
 * This function rounds the provided number to the nearest quarter (0.25) by multiplying it by 4,
 * rounding to the nearest integer, and then dividing it by 4. The result is then returned as a
 * string with exactly two decimal places.
 *
 * @param {number} number - The number to be rounded.
 * @returns {string} The rounded number as a string with two decimal places.
 */
function roundToQuarters(number) {
    return (Math.round(number * 4) / 4).toFixed(2);
}

export {
    addMetricLabels,
    addCustomConversionLabels,
    addTravelTime,
    hideFoundryLabel,
    convertDeltaStrings,
    convertDistanceString
};

// Node/CommonJS compatibility for simple test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports.convertDistanceString = convertDistanceString;
}