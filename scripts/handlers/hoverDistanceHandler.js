import {
    addMetricLabels,
    addCustomConversionLabels,
    addTravelTimeV13,
    hideFoundryLabel,
    roundFoundryLabel
} from "./conversionHandlers.js";

/**
 * Handles the update for the hover distance label.
 * @param {Object} token - The token object.
 */
export function hoverDistanceHandler(token) {
    if (token.distanceTooltip?.children?.[0]?._text) {
        let text = token.distanceTooltip.children[0]._text;

        // Optionally round the Foundry label itself before appending other labels
        const applyRounding = game.settings.get("metric-ruler-labels", "applyRoundingToFoundryLabel");
        if (applyRounding) {
            const roundingMode = game.settings.get("metric-ruler-labels", "distanceRoundingMode");
            const rounded = roundFoundryLabel(text, roundingMode, false);
            if (rounded.converted) {
                text = rounded.text;
            }
        }

        let conversion;
        // METRIC
        conversion = addMetricLabels(text, false);
        text = conversion.converted ? conversion.text : text;

        // CUSTOM CONVERSION
        conversion = addCustomConversionLabels(text, false);
        text = conversion.converted ? conversion.text : text;

        // TRAVEL TIME
        conversion = addTravelTimeV13(text, true, false);
        text = conversion.converted ? conversion.text : text;

        // HIDE FOUNDRY LABEL
        conversion = hideFoundryLabel(text, false);
        text = conversion.converted ? conversion.text : text;

        token.distanceTooltip.children[0]._text = text;
    }
}
