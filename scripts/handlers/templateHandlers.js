import {addCustomConversionLabels, addMetricLabels, hideFoundryLabel, roundFoundryLabel} from "./conversionHandlers.js";

/**
 * Processes and updates pre-version 10 measurement templates.
 *
 * @param {Object} wrappedResult - The object containing measurement template data to be processed. It includes a nested
 * `_object` property with a `ruler` object that holds the measurement text to be updated.
 * @return {Object} The updated `wrappedResult` object with processed measurement template text, including metric labels,
 * custom conversion labels, and potentially hidden Foundry labels.
 */
function handlePreV10MeasurementTemplates(wrappedResult) {
    if (wrappedResult._object && wrappedResult._object.ruler) {
        wrappedResult._object.ruler.text = addMetricLabels(wrappedResult._object.ruler.text).text;
        wrappedResult._object.ruler.text = addCustomConversionLabels(wrappedResult._object.ruler.text).text;
        wrappedResult._object.ruler.text = hideFoundryLabel(wrappedResult._object.ruler.text).text
    }

    return wrappedResult;
}

/**
 * Processes and updates measurement templates on the game canvas by modifying
 * the labels of ruler segments based on specific conditions. This includes
 * adding metric labels, custom conversion labels, and hiding Foundry's label.
 *
 * @return {void} This function does not return a value. It performs updates directly on the game canvas rulers.
 */
function handleV10MeasurementTemplates() {
    let rulers = game.canvas.controls.rulers.children;
    for (let i = 0; i < rulers.length; i++) {
        let rulerSegments = rulers[i].segments
        if (rulerSegments && Array.isArray(rulerSegments) && rulerSegments.length > 0) {
            for (let i = 0; i < rulerSegments.length; i++) {
                if (rulerSegments[i].label.text.split("\n").length === 1) {
                    rulerSegments[i].label.text = addMetricLabels(rulerSegments[i].label.text).text;
                    rulerSegments[i].label.text = addCustomConversionLabels(rulerSegments[i].label.text).text;
                    rulerSegments[i].label.text = hideFoundryLabel(rulerSegments[i].label.text).text
                }
            }
        }

    }
}

/**
 * Processes measurement templates on the canvas (version 13) and updates their labels by adding metric labels,
 * custom conversion labels, and hiding the default Foundry label if applicable.
 * This function iterates through all templates and modifies the text displayed on their ruler property.
 *
 * @return {void} This function does not return a value. It performs in-place updates to the measurement templates.
 */
function handleV13MeasurementTemplates() {
    let templatesArrays = game.canvas.templates.children
    for (let i = templatesArrays.length - 1; i >= 0; i--) {
        for (let j = 0; j < templatesArrays[i].children.length; j++) {
            let template = templatesArrays[i].children[j];
            if (template.ruler && template.ruler.text.split("\n").length === 1) {
                // Optionally round the Foundry label itself before appending other labels
                const applyRounding = game.settings.get("metric-ruler-labels", "applyRoundingToFoundryLabel");
                if (applyRounding) {
                    const roundingMode = game.settings.get("metric-ruler-labels", "distanceRoundingMode");
                    const rounded = roundFoundryLabel(template.ruler.text, roundingMode, false);
                    if (rounded.converted) {
                        template.ruler.text = rounded.text;
                    }
                }
                template.ruler.text = addMetricLabels(template.ruler.text).text;
                template.ruler.text = addCustomConversionLabels(template.ruler.text).text;
                template.ruler.text = hideFoundryLabel(template.ruler.text).text;
            }
        }
    }
}

/**
 * Updates measurement templates on the canvas from version 11 to version 12 by modifying ruler text labels.
 * It processes all child templates, ensuring rulers with a single line of text
 * are updated to include metric labels, custom conversion labels, and properly formatted text.
 *
 * @return {void} This function does not return a value. It modifies the ruler text of measurement templates directly.
 */
function handleV11ToV12MeasurementTemplates() {
    let templatesArrays = game.canvas.templates.children
    for (let i = templatesArrays.length - 1; i >= 0; i--) {
        for (let j = 0; j < templatesArrays[i].children.length; j++) {
            let template = templatesArrays[i].children[j];
            if (template.ruler && template.ruler.text.split("\n").length === 1) {
                template.ruler.text = addMetricLabels(template.ruler.text).text;
                template.ruler.text = addCustomConversionLabels(template.ruler.text).text;
                template.ruler.text = hideFoundryLabel(template.ruler.text).text;
            }
        }
    }
}

/**
 * Adjusts template preview text for Foundry generations prior to version 11 by adding metric labels,
 * custom conversion labels, and hiding Foundry's default labels.
 *
 * @param {number} foundryGeneration - The version of Foundry generation being used.
 * @param {Object} wrappedResult - The wrapped result object containing properties such as hud or ruler to be modified.
 * @return {Object} The modified wrapped result with updated text for the ruler, if applicable.
 */
function handlePreV11TemplatePreview(foundryGeneration, wrappedResult) {
    if (foundryGeneration < 10) {
        if (wrappedResult && wrappedResult.hud.ruler) {
            wrappedResult.hud.ruler.text = addMetricLabels(wrappedResult.hud.ruler.text).text;
            wrappedResult.hud.ruler.text = addCustomConversionLabels(wrappedResult.hud.ruler.text).text;
            wrappedResult.hud.ruler.text = hideFoundryLabel(wrappedResult.hud.ruler.text).text;
        }
    } else if (foundryGeneration === 10) {
        if (wrappedResult && wrappedResult.ruler) {
            wrappedResult.ruler.text = addMetricLabels(wrappedResult.ruler.text).text;
            wrappedResult.ruler.text = addCustomConversionLabels(wrappedResult.ruler.text).text;
            wrappedResult.ruler.text = hideFoundryLabel(wrappedResult.ruler.text).text;
        }
    }
    return wrappedResult;
}

export {
    handlePreV10MeasurementTemplates,
    handleV10MeasurementTemplates,
    handleV13MeasurementTemplates,
    handleV11ToV12MeasurementTemplates,
    handlePreV11TemplatePreview
};
