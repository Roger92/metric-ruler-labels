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
                    wrappedResult._object.ruler.text = addConvertedLabels(wrappedResult._object.ruler.text);
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
                                rulerSegments[i].label.text = addConvertedLabels(rulerSegments[i].label.text);
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
                        templates[i].ruler.text = addConvertedLabels(templates[i].ruler.text);
                        templates[i].ruler.text = hideFoundryLabel(templates[i].ruler.text);
                    }
                }
                templates = game.canvas.templates.children[1].children;
                for (let i = 0; i < templates.length; i++) {
                    if (measureTemplateSupport && templates[i].ruler && templates[i].ruler.text.split("\n").length === 1) {
                        templates[i].ruler.text = addMetricLabels(templates[i].ruler.text);
                        templates[i].ruler.text = addConvertedLabels(templates[i].ruler.text);
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
                        wrappedResult.hud.ruler.text = addConvertedLabels(wrappedResult.hud.ruler.text);
                        wrappedResult.hud.ruler.text = hideFoundryLabel(wrappedResult.hud.ruler.text)
                    }
                } else if (foundryGeneration === 10) {
                    if (measureTemplateSupport && wrappedResult && wrappedResult.ruler) {
                        wrappedResult.ruler.text = addMetricLabels(wrappedResult.ruler.text);
                        wrappedResult.ruler.text = addConvertedLabels(wrappedResult.ruler.text);
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
                        segment.label.text = addConvertedLabels(segment.label.text);
                        segment.label.text = addTravelTime(segment.label.text);
                        segment.label.text = hideFoundryLabel(segment.label.text)

                        // Go to prior segment and convert label -> For the case that the ruler has waypoints
                        segment = segment.prior_segment;
                    } while (segment !== undefined && Object.keys(segment).length > 0);

                } else if ((dragRulerSupport === "dragRulerSupport") && Array.isArray(wrappedResult) && wrappedResult.length > 0) { //Handling for Dragruler Support
                    for (let i = 0; i < wrappedResult.length; i++) {
                        wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addConvertedLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addTravelTime(wrappedResult[i].label.text, wrappedResult.length > 1);
                        wrappedResult[i].label.text = hideFoundryLabel(wrappedResult[i].label.text)
                    }
                }
            } else {
                if (Array.isArray(wrappedResult) && wrappedResult.length > 0) {
                    for (let i = 0; i < wrappedResult.length; i++) {
                        wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
                        wrappedResult[i].label.text = addConvertedLabels(wrappedResult[i].label.text);
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
                                        dragRulerSegments[i].label.text = addConvertedLabels(dragRulerSegments[i].label.text);
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
            "pf2eDragRulerSupport" : "PF2e Token Drag Ruler (by 7H3LaughingMan)"
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

function addMetricLabels(text) {
    let regexFeet = /^(-?\d*\.?\d*)\s?(?:ft\.?|feet)\s?x?(\s?(-?\d*\.?\d*)\s?(?:ft\.?|feet))?(?:\[(-?\d*\.?\d*)\s?(?:ft\.?|feet)\])?$/;
    let regexMiles = /^(-?\d*\.?\d*)\s?(?:mi\.?|miles)\s?x?(\s?(-?\d*\.?\d*)\s?(?:mi\.?|miles))?(?:\[(-?\d*\.?\d*)\s(?:mi\.?|miles)\])?$/;
    let regexResult = regexFeet.exec(text.split("\n")[0]);
    let dontUseMetricConversions = game.settings.get("metric-ruler-labels", "disableBuiltInConversion");

    if (dontUseMetricConversions === false) {
        if (regexResult && regexResult.length === 5 && regexResult[1]) {
            text += " \n "
            //Convert to meters and set label
            text = text + parseFloat(((regexResult[1] / 10) * 3).toFixed(2)) + " m";
            if (regexResult[3]) {
                text = text + " x " + parseFloat(((regexResult[3] / 10) * 3).toFixed(2)) + " m";
            } else if (regexResult[4]) {
                text = text + " [" + parseFloat(((regexResult[4] / 10) * 3).toFixed(2)) + " m]";
            }
        } else {
            //Check if measurement is in miles
            regexResult = regexMiles.exec(text);
            //Convert to kilometers and set label
            if (regexResult && regexResult.length === 5 && regexResult[1]) {
                text += " \n "
                text = text + parseFloat((regexResult[1] / 0.62137).toFixed(2)) + " km";
                if (regexResult[3]) {
                    text = text + " x " + parseFloat((regexResult[3] / 0.62137).toFixed(2)) + " km";
                } else if (regexResult[4]) {
                    text = text + " [" + parseFloat((regexResult[4] / 0.62137).toFixed(2)) + " km]";
                }
            }
        }
    }
    return text;
}

function addConvertedLabels(text) {
    let conversionFactorSmall = game.settings.get("metric-ruler-labels", "customConversionFactorSmall");
    let conversionFactorBig = game.settings.get("metric-ruler-labels", "customConversionFactorBig");
    let customConversionLabelSmall = game.settings.get("metric-ruler-labels", "customConversionLabelSmall");
    let customConversionLabelBig = game.settings.get("metric-ruler-labels", "customConversionLabelBig");
    let originalLabelsSmall = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsSmall");
    let originalLabelsBig = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsBig");
    let useCustomConversions = game.settings.get("metric-ruler-labels", "useCustomConversions");

    if (useCustomConversions) {
        originalLabelsSmall = originalLabelsSmall.replaceAll(".", "\\.");
        originalLabelsSmall = originalLabelsSmall.replaceAll(",", "|");
        originalLabelsBig = originalLabelsBig.replaceAll(".", "\\.");
        originalLabelsBig = originalLabelsBig.replaceAll(",", "|");

        let regexSmall = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsSmall + ")\\s?x?(\\s?(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsSmall + "))?(?:\\[(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsSmall + ")\\])?");
        let regexBig = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsBig + ")\\s?x?(\\s?(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsBig + "))?(?:\\[(-?\\d*\\.?\\d*)\\s(?:" + originalLabelsBig + ")\\])?");
        let regexResult = regexSmall.exec(text.split("\n")[0]);

        if ((!originalLabelsSmall && !conversionFactorSmall)
            && (!originalLabelsBig && !conversionFactorBig)) {
            text += " \n " + game.i18n.localize("metric-ruler-labels.warnings.customConversionNoValues.text");
        } else {
            if (regexResult && regexResult.length === 5 && regexResult[1]) {
                text += " \n "
                //Convert to meters and set label
                text = text + parseFloat((regexResult[1] * conversionFactorSmall).toFixed(2)) + " " + customConversionLabelSmall;
                if (regexResult[3]) {
                    text = text + " x " + parseFloat((regexResult[3] * conversionFactorSmall).toFixed(2)) + " " + customConversionLabelSmall;
                } else if (regexResult[4]) {
                    text = text + " [" + parseFloat((regexResult[4] * conversionFactorSmall).toFixed(2)) + " " + customConversionLabelSmall + "]";
                }
            } else {
                //Check if measurement is in miles
                regexResult = regexBig.exec(text.split("\n")[0]);
                //Convert to kilometers and set label
                if (regexResult && regexResult.length === 5 && regexResult[1]) {
                    text += " \n "
                    text = text + parseFloat((regexResult[1] * conversionFactorBig).toFixed(2)) + " " + customConversionLabelBig;
                    if (regexResult[3]) {
                        text = text + " x " + parseFloat((regexResult[3] * conversionFactorBig).toFixed(2)) + " " + customConversionLabelBig;
                    } else if (regexResult[4]) {
                        text = text + " [" + parseFloat((regexResult[4] * conversionFactorBig).toFixed(2)) + " " + customConversionLabelBig + "]";
                    }
                }
            }
        }
    }
    return text;
}

function addTravelTime(text, hasSegments = false) {
    let conversionFactorSlow = game.settings.get("metric-ruler-labels", "travelTimePerUnitSlow");
    let conversionFactorNormal = game.settings.get("metric-ruler-labels", "travelTimePerUnitNormal");
    let conversionFactorFast = game.settings.get("metric-ruler-labels", "travelTimePerUnitFast");
    let travelTimeLabel = game.settings.get("metric-ruler-labels", "travelTimeDistanceLabel");
    let travelTimeActivated = game.settings.get("metric-ruler-labels", "enableTravelTime");
    let timeUnit = game.settings.get("metric-ruler-labels", "travelTime-TimeUnit");
    let travelTimeOnlyTotalTimeLastSegment = game.settings.get("metric-ruler-labels", "travelTimeOnlyTotalTimeLastSegment");

    if (travelTimeActivated) {
        travelTimeLabel = travelTimeLabel.replaceAll(".", "\\.");
        travelTimeLabel = travelTimeLabel.replaceAll(",", "|");

        let regex = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + travelTimeLabel + ")\\s(?:\\[(-?\\d*\\.?\\d*)\\s?(?:" + travelTimeLabel + ")\\])?");
        let regexResult = regex.exec(text.split("\n")[0]);

        if (!travelTimeLabel) {
            text += " \n " + game.i18n.localize("metric-ruler-labels.warnings.travelTimeNoValues.text");
        } else if (regexResult && regexResult.length === 3 && regexResult[1] && (hasSegments === false || regexResult[2] === undefined)) {
            text += " \n "
            //Calculate Traveltime
            text = text + roundToQuarters(parseFloat((regexResult[1] / conversionFactorSlow).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[1] / conversionFactorNormal).toFixed(2))) + " | "
                + roundToQuarters(parseFloat((regexResult[1] / conversionFactorFast).toFixed(2))) + " " + timeUnit;
            text = text.replaceAll("Infinity", "-");
        } else if (regexResult && regexResult.length === 3 && regexResult[2] && hasSegments) {
            //Calculate Traveltime
            if (travelTimeOnlyTotalTimeLastSegment === false) {
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

/*
Returns an Array of measurement data for the ruler.
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