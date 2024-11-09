/*
This package converts measurements of the ruler tool from feet to meters and from miles to kilometers.
5 ft -> 1.5 meter
1  mile -> 1,61 kilometers
In case there is an unknown unit nothing happens.
 */

Hooks.on("init", () => {
    registerSettings();
    window.metricRuler = {
        getRulerData: getRulerData
    }
});


Hooks.once('ready', () => {
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        new Dialog({
            title: `Roger's Additional Metric Ruler Labels`,
            content: "<h2>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.title") + "</h2>" +
                "<p>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.infotext") + "</p> <br>",
            buttons: {
                dismiss: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Got it!"
                }
            }
        }, {width: 600}).render(true);
    } else {

        //Check foundry generation
        let foundryGeneration = game.release.generation;
        if (foundryGeneration < 9 || foundryGeneration > 12) {
            showIncompatibilityDialog(foundryGeneration);
        }

        if (foundryGeneration < 10) {
            //Handling of MeasureTemplate Drop (Only needed before V10)
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftDrop", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");

                if (measureTemplateSupport && wrappedResult._object && wrappedResult._object.ruler) {
                    wrappedResult._object.ruler.text = addMetricLabels(wrappedResult._object.ruler.text);
                    wrappedResult._object.ruler.text = addCustomConversionLabels(wrappedResult._object.ruler.text);
                    wrappedResult._object.ruler.text = hideFoundryLabel(wrappedResult._object.ruler.text)
                }

                return wrappedResult;
            }, 'MIXED');

        } else if (foundryGeneration === 10) {
            //Handling of MeasureTemplate Drag (V10)
            libWrapper.register("metric-ruler-labels", "CONFIG.MeasuredTemplate.layerClass.prototype._onDragLeftDrop", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                let rulers = game.canvas.controls.rulers.children;
                for (let i = 0; i < rulers.length; i++) {
                    let rulerSegments = rulers[i].segments
                    if (measureTemplateSupport && rulerSegments && Array.isArray(rulerSegments) && rulerSegments.length > 0) {
                        for (let i = 0; i < rulerSegments.length; i++) {
                            if (rulerSegments[i].label.text.split("\n").length === 1) {
                                rulerSegments[i].label.text = addMetricLabels(rulerSegments[i].label.text);
                                rulerSegments[i].label.text = addCustomConversionLabels(rulerSegments[i].label.text);
                                rulerSegments[i].label.text = hideFoundryLabel(rulerSegments[i].label.text)
                            }
                        }
                    }

                }

                return wrappedResult;
            }, 'MIXED');
        } else if (foundryGeneration > 10) {
            //Handling of MeasureTemplate Drag and Drop (V11)
            libWrapper.register("metric-ruler-labels", "MeasuredTemplate.prototype._refreshRulerText", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                let templates = game.canvas.templates.children[0].children;
                for (let i = 0; i < templates.length; i++) {
                    if (measureTemplateSupport && templates[i].ruler && templates[i].ruler.text.split("\n").length === 1) {
                        templates[i].ruler.text = addMetricLabels(templates[i].ruler.text);
                        templates[i].ruler.text = addCustomConversionLabels(templates[i].ruler.text);
                        templates[i].ruler.text = hideFoundryLabel(templates[i].ruler.text);
                    }
                }
                templates = game.canvas.templates.children[1].children;
                for (let i = 0; i < templates.length; i++) {
                    if (measureTemplateSupport && templates[i].ruler && templates[i].ruler.text.split("\n").length === 1) {
                        templates[i].ruler.text = addMetricLabels(templates[i].ruler.text);
                        templates[i].ruler.text = addCustomConversionLabels(templates[i].ruler.text);
                        templates[i].ruler.text = hideFoundryLabel(templates[i].ruler.text);
                    }
                }
                return wrappedResult;
            }, 'MIXED');
        }


        if (foundryGeneration <= 10) {
            //Handling of MeasureTemplate Preview
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftMove", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (foundryGeneration < 10) {
                    if (measureTemplateSupport && wrappedResult && wrappedResult.hud.ruler) {
                        wrappedResult.hud.ruler.text = addMetricLabels(wrappedResult.hud.ruler.text);
                        wrappedResult.hud.ruler.text = addCustomConversionLabels(wrappedResult.hud.ruler.text);
                        wrappedResult.hud.ruler.text = hideFoundryLabel(wrappedResult.hud.ruler.text)
                    }
                } else if (foundryGeneration === 10) {
                    if (measureTemplateSupport && wrappedResult && wrappedResult.ruler) {
                        wrappedResult.ruler.text = addMetricLabels(wrappedResult.ruler.text);
                        wrappedResult.ruler.text = addCustomConversionLabels(wrappedResult.ruler.text);
                        wrappedResult.ruler.text = hideFoundryLabel(wrappedResult.ruler.text)
                    }
                }
                return wrappedResult;
            }, 'WRAPPER');
        }

        //Handling of Ruler
        libWrapper.register("metric-ruler-labels", "Ruler.prototype.measure", function (wrapped, ...args) {
            let wrappedResult = wrapped(...args);
            let dragRulerSupport = game.settings.get("metric-ruler-labels", "dragRulerSupport");
            let foundryGeneration = game.release.generation;

            if (foundryGeneration < 10) {
                if (wrappedResult.label) {
                    let segment = wrappedResult;
                    //Loop over all prior segments of the ruler
                    do {
                        segment.label.text = addMetricLabels(segment.label.text);
                        segment.label.text = addCustomConversionLabels(segment.label.text);
                        segment.label.text = addTravelTime(segment.label.text);
                        segment.label.text = hideFoundryLabel(segment.label.text)

                        // Go to prior segment and convert label -> For the case that the ruler has waypoints
                        segment = segment.prior_segment;
                    } while (segment !== undefined && Object.keys(segment).length > 0);

                } else if ((dragRulerSupport === "dragRulerSupport") && Array.isArray(wrappedResult) && wrappedResult.length > 0) { //Handling for Dragruler Support
                    for (let i = 0; i < wrappedResult.length; i++) {
                        wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addCustomConversionLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addTravelTime(wrappedResult[i].label.text, wrappedResult.length > 1);
                        wrappedResult[i].label.text = hideFoundryLabel(wrappedResult[i].label.text)
                    }
                }
            } else {
                if (Array.isArray(wrappedResult) && wrappedResult.length > 0) {
                    for (let i = 0; i < wrappedResult.length; i++) {
                        wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addCustomConversionLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addTravelTime(wrappedResult[i].label.text, wrappedResult.length > 1);
                        wrappedResult[i].label.text = hideFoundryLabel(wrappedResult[i].label.text)
                    }
                }
            }

            return wrappedResult;
        }, 'WRAPPER');

        let dragRulerSupport = game.settings.get("metric-ruler-labels", "dragRulerSupport")

        //Dragruler p2fe game.canvas.dragRuler.rulers.children
        if (foundryGeneration >= 10 && (dragRulerSupport !== "noDragRulerSupport")) {

            //Handling of DragRuler V10
            libWrapper.register("metric-ruler-labels", "Token.prototype._onDragLeftMove", function (wrapped, ...args) {
                let wrappedResult = wrapped(...args);
                let elevationRulerActive = game.modules.get('elevationruler')?.active;

                //Delay, so that drag-ruler does not overwrite
                setTimeout(function () {
                    let rulers = [];
                    if (dragRulerSupport === "dragRulerSupport") {
                        rulers = game.canvas.controls.rulers.children;

                    } else if (dragRulerSupport === "pf2eDragRulerSupport") {
                        rulers = game.canvas.dragRuler.rulers.children;
                    }
                    for (let i = 0; i < rulers.length; i++) {
                        if ((rulers[i].isDragRuler && dragRulerSupport === "dragRulerSupport") || (dragRulerSupport === "pf2eDragRulerSupport")) {
                            let dragRulerSegments = rulers[i].segments;
                            if (dragRulerSegments && Array.isArray(dragRulerSegments) && dragRulerSegments.length > 0) {
                                for (let i = 0; i < dragRulerSegments.length; i++) {
                                    if (dragRulerSegments[i].label.text.split("\n").length === (elevationRulerActive ? 2 : 1)) {
                                        dragRulerSegments[i].label.text = addMetricLabels(dragRulerSegments[i].label.text);
                                        dragRulerSegments[i].label.text = addCustomConversionLabels(dragRulerSegments[i].label.text);
                                        dragRulerSegments[i].label.text = addTravelTime(dragRulerSegments[i].label.text, dragRulerSegments.length > 1);
                                        dragRulerSegments[i].label.text = hideFoundryLabel(dragRulerSegments[i].label.text)
                                    }
                                }
                            }
                        }
                    }
                }, 60);

                return wrappedResult;
            }, 'WRAPPER');
        }
    }
})
;

function registerSettings() {
    game.settings.register("metric-ruler-labels", "measureTemplateSupport", {
        name: "metric-ruler-labels.settings.measureTemplateSupport.name",
        hint: "metric-ruler-labels.settings.measureTemplateSupport.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("metric-ruler-labels", "dragRulerSupport", {
        name: "metric-ruler-labels.settings.dragRulerSupport.name",
        hint: "metric-ruler-labels.settings.dragRulerSupport.hint",
        scope: "client",
        config: true,
        type: String,
        default: "dragRulerSupport",
        choices:{
            "noDragRulerSupport": "metric-ruler-labels.settings.dragRulerSupport.disabled",
            "dragRulerSupport" : "Drag Ruler (by Staebchenfish)",
            "pf2eDragRulerSupport" : "PF2e Drag Ruler (System built in or others) "
        }
    });
    game.settings.register("metric-ruler-labels", "hideFoundryMeasurement", {
        name: "metric-ruler-labels.settings.hideFoundryMeasurement.name",
        hint: "metric-ruler-labels.settings.hideFoundryMeasurement.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("metric-ruler-labels", "disableBuiltInConversion", {
        name: "metric-ruler-labels.settings.disableBuiltInConversion.name",
        hint: "metric-ruler-labels.settings.disableBuiltInConversion.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("metric-ruler-labels", "enableTravelTime", {
        name: "metric-ruler-labels.settings.enableTravelTime.name",
        hint: "metric-ruler-labels.settings.enableTravelTime.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("metric-ruler-labels", "travelTimeOnlyTotalTimeLastSegment", {
        name: "metric-ruler-labels.settings.travelTimeOnlyTotalTimeLastSegment.name",
        hint: "metric-ruler-labels.settings.travelTimeOnlyTotalTimeLastSegment.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("metric-ruler-labels", "travelTimeDistanceLabel", {
        name: "metric-ruler-labels.settings.travelTimeDistanceLabel.name",
        hint: "metric-ruler-labels.settings.travelTimeDistanceLabel.hint",
        scope: "world",
        config: true,
        type: String,
        default: "mi.,mi,miles",
    });
    game.settings.register("metric-ruler-labels", "travelTime-TimeUnit", {
        name: "metric-ruler-labels.settings.travelTime-TimeUnit.name",
        hint: "metric-ruler-labels.settings.travelTime-TimeUnit.hint",
        scope: "world",
        config: true,
        type: String,
        default: "Days",
    });
    game.settings.register("metric-ruler-labels", "travelTimePerUnitSlow", {
        name: "metric-ruler-labels.settings.travelTimePerUnitSlow.name",
        hint: "metric-ruler-labels.settings.travelTimePerUnitSlow.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 18,
    });
    game.settings.register("metric-ruler-labels", "travelTimePerUnitNormal", {
        name: "metric-ruler-labels.settings.travelTimePerUnitNormal.name",
        hint: "metric-ruler-labels.settings.travelTimePerUnitNormal.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 24,
    });
    game.settings.register("metric-ruler-labels", "travelTimePerUnitFast", {
        name: "metric-ruler-labels.settings.travelTimePerUnitFast.name",
        hint: "metric-ruler-labels.settings.travelTimePerUnitFast.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 30,
    });
    game.settings.register("metric-ruler-labels", "useCustomConversions", {
        name: "metric-ruler-labels.settings.useCustomConversions.name",
        hint: "metric-ruler-labels.settings.useCustomConversions.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("metric-ruler-labels", "customConversionOriginalLabelsSmall", {
        name: "metric-ruler-labels.settings.customConversionOriginalLabelsSmall.name",
        hint: "metric-ruler-labels.settings.customConversionOriginalLabelsSmall.hint",
        scope: "world",
        config: true,
        type: String,
        default: "ft.,ft,feet",
    });
    game.settings.register("metric-ruler-labels", "customConversionOriginalLabelsBig", {
        name: "metric-ruler-labels.settings.customConversionOriginalLabelsBig.name",
        hint: "metric-ruler-labels.settings.customConversionOriginalLabelsBig.hint",
        scope: "world",
        config: true,
        type: String,
        default: "mi.,mi,miles",
    });
    game.settings.register("metric-ruler-labels", "customConversionFactorSmall", {
        name: "metric-ruler-labels.settings.customConversionFactorSmall.name",
        hint: "metric-ruler-labels.settings.customConversionFactorSmall.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 0.3,
    });
    game.settings.register("metric-ruler-labels", "customConversionFactorBig", {
        name: "metric-ruler-labels.settings.customConversionFactorBig.name",
        hint: "metric-ruler-labels.settings.customConversionFactorBig.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 1.61,
    });
    game.settings.register("metric-ruler-labels", "customConversionLabelSmall", {
        name: "metric-ruler-labels.settings.customConversionLabelSmall.name",
        hint: "metric-ruler-labels.settings.customConversionLabelSmall.hint",
        scope: "world",
        config: true,
        type: String,
        default: "m",
    });
    game.settings.register("metric-ruler-labels", "customConversionLabelBig", {
        name: "metric-ruler-labels.settings.customConversionLabelBig.name",
        hint: "metric-ruler-labels.settings.customConversionLabelBig.hint",
        scope: "world",
        config: true,
        type: String,
        default: "km",
    });
}


/**
 * Adds metric labels to a given text by converting distances in the first line of the text.
 *
 * This function checks if built-in metric conversions are enabled and, if so, converts any distances
 * found in the first line of the input text from imperial units ("ft.","ft","feet" and "ft.","ft","feet") to metric units ("m" and "km").
 * The converted values are appended as additional lines to the original text.
 *
 * @param {string} text -  The text that contains the distances (e.g. the ruler label)
 * @returns {string} The input text with appended metric conversions, if applicable.
 */
function addMetricLabels(text) {
    let dontUseMetricConversions = game.settings.get("metric-ruler-labels", "disableBuiltInConversion");
    const textLines = text ? text.split("\n") : "";
    if (dontUseMetricConversions === false && textLines.length > 0) {
        let convertedText = convertDistanceString(textLines[0],["ft.","ft","feet"],"m",0.3);
        if(convertedText !== textLines[0]){
            text += " \n "
            text += convertedText;
        }
        convertedText = convertDistanceString(textLines[0],["mi.","mi","miles"],"km",1.61);
        if(convertedText !== textLines[0]){
            text += " \n "
            text += convertedText;
        }
    }
    return text;
}

/**
 * Adds custom conversion labels to a given text based on user-defined conversion settings.
 *
 * This function retrieves custom conversion factors and labels from game settings and applies
 * these conversions to the first line of the input text. If conversions are applicable, they
 * are appended as additional lines to the original text.
 *
 * @param {string} text -  The text that contains the distances (e.g. the ruler label)
 * @returns {string} The input text with appended custom conversions, if applicable.
 */
function addCustomConversionLabels(text) {
    let conversionFactorSmall = game.settings.get("metric-ruler-labels", "customConversionFactorSmall");
    let conversionFactorBig = game.settings.get("metric-ruler-labels", "customConversionFactorBig");
    let customConversionLabelSmall = game.settings.get("metric-ruler-labels", "customConversionLabelSmall");
    let customConversionLabelBig = game.settings.get("metric-ruler-labels", "customConversionLabelBig");
    let originalLabelsSmall = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsSmall");
    let originalLabelsBig = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsBig");
    let useCustomConversions = game.settings.get("metric-ruler-labels", "useCustomConversions");

    if (useCustomConversions) {
        originalLabelsSmall = originalLabelsSmall === "" ? null : originalLabelsSmall.split(",");
        originalLabelsBig = originalLabelsBig === "" ? null : originalLabelsBig.split(",");

        const textLines = text ? text.split("\n") : "";
        if ((!originalLabelsSmall && !conversionFactorSmall)
            && (!originalLabelsBig && !originalLabelsBig)) {
            text += " \n " + game.i18n.localize("metric-ruler-labels.warnings.customConversionNoValues.text");
        } else if(textLines.length > 0) {
            if(originalLabelsBig && originalLabelsBig){
                let convertedText = convertDistanceString(textLines[0],originalLabelsSmall,customConversionLabelSmall,conversionFactorSmall);
                if(convertedText !== textLines[0]){
                    text += " \n "
                    text += convertedText;
                }
            }
            if(originalLabelsBig && originalLabelsBig){
                let convertedText = convertDistanceString(textLines[0],originalLabelsBig,customConversionLabelBig,conversionFactorBig);
                if(convertedText !== textLines[0]){
                    text += " \n "
                    text += convertedText;
                }
            }
        }
    }
    return text;
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
 * @returns {string} The input text with added travel time calculations and/or segment times.
 */
function addTravelTime(text, hasSegments = false) {
    let conversionFactorSlow = game.settings.get("metric-ruler-labels", "travelTimePerUnitSlow");
    let conversionFactorNormal = game.settings.get("metric-ruler-labels", "travelTimePerUnitNormal");
    let conversionFactorFast = game.settings.get("metric-ruler-labels", "travelTimePerUnitFast");
    let travelTimeLabel = game.settings.get("metric-ruler-labels", "travelTimeDistanceLabel");
    let travelTimeActivated = game.settings.get("metric-ruler-labels", "enableTravelTime");
    let timeUnit = game.settings.get("metric-ruler-labels", "travelTime-TimeUnit");
    let travelTimeOnlyTotalTimeLastSegment = game.settings.get("metric-ruler-labels", "travelTimeOnlyTotalTimeLastSegment");

    if (travelTimeActivated) {
        travelTimeLabel = travelTimeLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        travelTimeLabel = travelTimeLabel.replaceAll(",", "|");

        let regex = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + travelTimeLabel + ")\\s(?:\\[(-?\\d*\\.?\\d*)\\s?(?:" + travelTimeLabel + ")\\])?");
        let regexResult = regex.exec(text.split("\n")[0]);

        if (!travelTimeLabel) {
            text += " \n " + game.i18n.localize("metric-ruler-labels.warnings.travelTimeNoValues.text");
        } else if (regexResult && regexResult.length === 3 && regexResult[1] && (hasSegments === false || regexResult[2] === undefined)) {
            //The Ruler only has one segment
            text += " \n "
            //Calculate Traveltimes
            text = text + roundToQuarters(parseFloat((regexResult[1] / conversionFactorSlow).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[1] / conversionFactorNormal).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[1] / conversionFactorFast).toFixed(2))) + " " + timeUnit;
            text = text.replaceAll("Infinity", "-");
        } else if (regexResult && regexResult.length === 3 && regexResult[2] && hasSegments) {
            //The Ruler has multiple segments
            if (travelTimeOnlyTotalTimeLastSegment === false) {
                //Calculate Traveltime
                text += " \n "
                text = text + roundToQuarters(parseFloat((regexResult[1] / conversionFactorSlow).toFixed(2))) + " | "
                    + roundToQuarters(parseFloat((regexResult[1] / conversionFactorNormal).toFixed(2))) + " | "
                    + roundToQuarters(parseFloat((regexResult[1] / conversionFactorFast).toFixed(2))) + " " + timeUnit;
            }
            //Total Traveltime
            text += " \n "
            text = text + "[" + roundToQuarters(parseFloat((regexResult[2] / conversionFactorSlow).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[2] / conversionFactorNormal).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[2] / conversionFactorFast).toFixed(2))) + " " + timeUnit + "]";
            text = text.replaceAll("Infinity", "-");
        }

    }
    return text;
}
/**
 * Removes the first line (which is the Foundry measurement label) from the given text if the corresponding setting is enabled.
 *
 * This function checks if the "hideFoundryMeasurement" setting is enabled. If it is, it removes
 * the first line of the input text, unless it starts with the special "↕" character used by the elevation ruler.
 * IMPORTANT: This function should only be called after all label conversions are done
 *
 * @param {string} text - The input text containing the measurement label to be potentially hidden.
 * @returns {string} The input text with the Foundry label hidden, if applicable.
 */
//IMPORTANT... ONLY USE AS LAST FUNCTION CALL
function hideFoundryLabel(text) {
    let hideFoundry = game.settings.get("metric-ruler-labels", "hideFoundryMeasurement");
    let elevationRulerActive = game.modules.get('elevationruler')?.active;

    if (hideFoundry) {
        let labelLines = text.split("\n");
        if (labelLines[0].startsWith(" ") === false) {
            if (!elevationRulerActive || (elevationRulerActive && !labelLines[0].startsWith("↕"))) {
                labelLines.shift();
            }
        }
        return labelLines.join("\n");
    } else {
        return text;
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
    const regex = new RegExp("(-?\\d*\\.?\\d+)(\\s*)(" + searchLabels.join('|') + ")", 'g');

    //Searches for the sections where we have a distance followed by a label and replaces them.
    return text.replace(regex, (match, distance, whiteSpaces) => {
        const convertedDistance = (parseFloat(distance) * conversionFactor).toFixed(2);
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

function showIncompatibilityDialog(generation) {
    new Dialog({
        title: `Roger's Additional Metric Ruler Labels`,
        content: "<h2>" + game.i18n.localize("metric-ruler-labels.incompatibility.title") + "<br> Current Generation: " + generation + " </h2>" +
            "<p>" + game.i18n.localize("metric-ruler-labels.incompatibility.infotext") + "</p> <br>",
        buttons: {
            dismiss: {
                icon: '<i class="fas fa-times"></i>',
                label: "Got it!"
            }
        }
    }, {width: 600}).render(true);
}

/**
 * Retrieves and converts ruler data from the current Foundry canvas, based on the active segments.
 *
 * This function checks the current Foundry release generation and, if version 10 or greater, retrieves
 * the ruler data (in feet, miles, meters, and kilometers) from the segments of the ruler. It then converts
 * between different units as necessary and returns the data in a structured format.
 *
 * @returns {Array<Object>} An array of objects containing the converted ruler data, with the following properties:
 *   - `feet` {string} The distance in feet.
 *   - `miles` {string} The distance in miles.
 *   - `meters` {string} The distance in meters.
 *   - `kilometers` {string} The distance in kilometers.
 *   Returns an empty array if Foundry version is lower than 10 or if no segments are available.
 */
export function getRulerData() {
    let foundryGeneration = game.release.generation;

    if (foundryGeneration >= 10) {
        let rulerData = [];
        let text = "";
        let segments = canvas.controls.ruler.segments;
        let regexFeet = new RegExp("\\s?(-?\\d*\\.?\\d*)\\s?(?:ft\\.?|feet)");
        let regexMiles = new RegExp("\\s?(-?\\d*\\.?\\d*)\\s?(?:mi\\.?|miles|mile)");
        let regexMeters = new RegExp("\\s?(-?\\d*\\.?\\d*)\\s?(?:m\\.?|meters|meter)");
        let regexKilometers = new RegExp("\\s?(-?\\d*\\.?\\d*)\\s?(?:km\\.?|kilometers|kilometer)");

        if (segments && segments.length > 0) {
            for (let i = 0; i < segments.length; i++) {

                let regexMetersResult, regexKilometersResult;
                //add Metric labels
                text = addMetricLabels(segments[i].label.text.split("\n")[0].trim());

                let regexFeetResult = regexFeet.exec(text.split("\n")[0].trim());
                let regexMilesResult = regexMiles.exec(text.split("\n")[0].trim());

                if (text.split("\n")[1]) {
                    regexMetersResult = regexMeters.exec(text.split("\n")[1].trim());
                    regexKilometersResult = regexKilometers.exec(text.split("\n")[1].trim());
                } else {
                    //Fallback if user used directly meters or kilomenters
                    regexMetersResult = regexMeters.exec(text.split("\n")[0].trim());
                    regexKilometersResult = regexKilometers.exec(text.split("\n")[0].trim());
                }

                let feet = (regexFeetResult && regexFeetResult[1]) ? Number.parseFloat(regexFeetResult[1]) : null;
                let miles = (regexMilesResult && regexMilesResult[1]) ? Number.parseFloat(regexMilesResult[1]) : null;
                let meters = (regexMetersResult && regexMetersResult[1]) ? Number.parseFloat(regexMetersResult[1]) : null;
                let kilometers = (regexKilometersResult && regexKilometersResult[1]) ? Number.parseFloat(regexKilometersResult[1]) : null;

                if (feet && !miles) {
                    miles = feet / 5280;
                } else if (miles && !feet) {
                    feet = miles * 5280;
                }

                if (meters && !kilometers) {
                    kilometers = meters / 1000;
                } else if (kilometers && !meters) {
                    meters = kilometers * 1000;
                }
                rulerData.push({
                    feet: feet.toFixed(2),
                    miles: miles.toFixed(2),
                    meters: meters.toFixed(2),
                    kilometers: kilometers.toFixed(2)
                })
            }
        }
        return rulerData;
    } else {
        return [];
    }
}