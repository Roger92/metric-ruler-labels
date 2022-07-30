/*
This package converts measurements of the ruler tool from feet to meters and from miles to kilometers.
5 ft -> 1.5 meter
1  mile -> 1,61 kilometers
In case there is an unknown unit nothing happens.
 */

Hooks.on("init", () => {
    registerSettings();
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
        if (foundryGeneration < 9 || foundryGeneration > 10) {
            showIncompatibilityDialog(foundryGeneration);
        }

        if (foundryGeneration < 10) {
            //Handling of MeasureTemplate Drop (Only needed before V10)
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftDrop", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                let useCustomConversions = game.settings.get("metric-ruler-labels", "useCustomConversions");
                let dontUseMetricConversions = game.settings.get("metric-ruler-labels", "disableBuiltInConversion");

                if (measureTemplateSupport && wrappedResult._object && wrappedResult._object.ruler) {
                    if (dontUseMetricConversions === false)
                        wrappedResult._object.ruler.text = addMetricLabels(wrappedResult._object.ruler.text);
                    if (useCustomConversions)
                        wrappedResult._object.ruler.text = addConvertedLabels(wrappedResult._object.ruler.text);
                }

                return wrappedResult;
            }, 'MIXED');
        }


        //Handling of MeasureTemplate Preview
        libWrapper.register("metric-ruler-labels", "MeasuredTemplate.prototype.refresh", async function (wrapped, ...args) {
            let wrappedResult = await wrapped(...args);
            let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
            let useCustomConversions = game.settings.get("metric-ruler-labels", "useCustomConversions");
            let dontUseMetricConversions = game.settings.get("metric-ruler-labels", "disableBuiltInConversion");

            if (foundryGeneration < 10) {
                if (measureTemplateSupport && wrappedResult && wrappedResult.hud.ruler) {
                    if (dontUseMetricConversions === false)
                        wrappedResult.hud.ruler.text = addMetricLabels(wrappedResult.hud.ruler.text);
                    if (useCustomConversions)
                        wrappedResult.hud.ruler.text = addConvertedLabels(wrappedResult.hud.ruler.text);
                }
            } else {
                if (measureTemplateSupport && wrappedResult && wrappedResult.ruler) {
                    if (dontUseMetricConversions === false) {
                        wrappedResult.ruler.text = addMetricLabels(wrappedResult.ruler.text);
                    }
                    if (useCustomConversions) []
                    wrappedResult.ruler.text = addConvertedLabels(wrappedResult.ruler.text);
                }
            }

            return wrappedResult;
        }, 'MIXED');

        //Handling of Ruler and DragRuler
        libWrapper.register("metric-ruler-labels", "Ruler.prototype.measure", function (wrapped, ...args) {
            let wrappedResult = wrapped(...args);
            let dragRulerSupportActive = game.settings.get("metric-ruler-labels", "dragRulerSupport");
            let useCustomConversions = game.settings.get("metric-ruler-labels", "useCustomConversions");
            let dontUseMetricConversions = game.settings.get("metric-ruler-labels", "disableBuiltInConversion");
            let foundryGeneration = game.release.generation;
            if (foundryGeneration < 10) {
                if (wrappedResult.label) {
                    let segment = wrappedResult;
                    //Loop over all prior segments of the ruler
                    do {
                        if (dontUseMetricConversions === false)
                            segment.label.text = addMetricLabels(segment.label.text);
                        if (useCustomConversions)
                            segment.label.text = addConvertedLabels(segment.label.text);

                        // Go to prior segment and convert label -> For the case that the ruler has waypoints
                        segment = segment.prior_segment;
                    } while (segment !== undefined && Object.keys(segment).length > 0);

                } else if (dragRulerSupportActive && Array.isArray(wrappedResult) && wrappedResult.length > 0) { //Handling for Dragruler Support
                    for (let i = 0; i < wrappedResult.length; i++) {
                        if (dontUseMetricConversions === false)
                            wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
                        if (useCustomConversions)
                            wrappedResult[i].label.text = addConvertedLabels(wrappedResult[i].label.text);
                    }
                }
            } else {
                /* if (wrappedResult && wrappedResult.label) {
                     let segment = wrappedResult;
                     //Loop over all prior segments of the ruler
                     do {
                         if (dontUseMetricConversions === false)
                             segment.text = addMetricLabels(segment.text);
                         if (useCustomConversions)
                             segment.text = addConvertedLabels(segment.text);

                         // Go to prior segment and convert label -> For the case that the ruler has waypoints
                         segment = segment.prior_segment;
                     } while (segment !== undefined && Object.keys(segment).length > 0);

                 } else*/
                if (Array.isArray(wrappedResult) && wrappedResult.length > 0) {
                    for (let i = 0; i < wrappedResult.length; i++) {
                        if (dontUseMetricConversions === false)
                            wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
                        if (useCustomConversions)
                            wrappedResult[i].label.text = addConvertedLabels(wrappedResult[i].label.text);

                    }
                }
            }

            return wrappedResult;
        }, 'WRAPPER');
    }

});

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
        type: Boolean,
        default: true,
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
    let hideFoundry = game.settings.get("metric-ruler-labels", "hideFoundryMeasurement");
    let regexResult = regexFeet.exec(text);

    if (regexResult && regexResult.length === 5 && regexResult[1]) {
        if (hideFoundry) {
            text = "";
        } else {
            text += " \n "
        }
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
            if (hideFoundry) {
                text = "";
            } else {
                text += " \n "
            }
            text = text + parseFloat((regexResult[1] / 0.62137).toFixed(2)) + " km";
            if (regexResult[3]) {
                text = text + " x " + parseFloat((regexResult[3] / 0.62137).toFixed(2)) + " km";
            } else if (regexResult[4]) {
                text = text + " [" + parseFloat((regexResult[4] / 0.62137).toFixed(2)) + " km]";
            }
        }
    }

    return text;
}

function addConvertedLabels(text) {
    let hideFoundry = game.settings.get("metric-ruler-labels", "hideFoundryMeasurement");
    let conversionFactorSmall = game.settings.get("metric-ruler-labels", "customConversionFactorSmall");
    let conversionFactorBig = game.settings.get("metric-ruler-labels", "customConversionFactorBig");
    let customConversionLabelSmall = game.settings.get("metric-ruler-labels", "customConversionLabelSmall");
    let customConversionLabelBig = game.settings.get("metric-ruler-labels", "customConversionLabelBig");
    let originalLabelsSmall = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsSmall");
    let originalLabelsBig = game.settings.get("metric-ruler-labels", "customConversionOriginalLabelsBig");
    originalLabelsSmall = originalLabelsSmall.replaceAll(".", "\\.");
    originalLabelsSmall = originalLabelsSmall.replaceAll(",", "|");
    originalLabelsBig = originalLabelsBig.replaceAll(".", "\\.");
    originalLabelsBig = originalLabelsBig.replaceAll(",", "|");
    let regexSmall = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsSmall + ")\\s?x?(\\s?(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsSmall + "))?(?:\\[(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsSmall + ")\\])?");
    let regexBig = new RegExp("(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsBig + ")\\s?x?(\\s?(-?\\d*\\.?\\d*)\\s?(?:" + originalLabelsBig + "))?(?:\\[(-?\\d*\\.?\\d*)\\s(?:" + originalLabelsBig + ")\\])?");
    let regexResult = regexSmall.exec(text);

    if (regexResult && regexResult.length === 5 && regexResult[1]) {
        if (hideFoundry) {
            text = "";
        } else {
            text += " \n "
        }
        //Convert to meters and set label
        text = text + parseFloat((regexResult[1] * conversionFactorSmall).toFixed(2)) + " " + customConversionLabelSmall;
        if (regexResult[3]) {
            text = text + " x " + parseFloat((regexResult[3] * conversionFactorSmall).toFixed(2)) + " " + customConversionLabelSmall;
        } else if (regexResult[4]) {
            text = text + " [" + parseFloat((regexResult[4] * conversionFactorSmall).toFixed(2)) + " " + customConversionLabelSmall + "]";
        }
    } else {
        //Check if measurement is in miles
        regexResult = regexBig.exec(text);
        //Convert to kilometers and set label
        if (regexResult && regexResult.length === 5 && regexResult[1]) {
            if (hideFoundry) {
                text = "";
            } else {
                text += " \n "
            }
            text = text + parseFloat((regexResult[1] * conversionFactorBig).toFixed(2)) + " " + customConversionLabelBig;
            if (regexResult[3]) {
                text = text + " x " + parseFloat((regexResult[3] * conversionFactorBig).toFixed(2)) + " " + customConversionLabelBig;
            } else if (regexResult[4]) {
                text = text + " [" + parseFloat((regexResult[4] * conversionFactorBig).toFixed(2)) + " " + customConversionLabelBig + "]";
            }
        }
    }

    return text;
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
