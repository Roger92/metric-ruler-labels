import {
    handlePreV10MeasurementTemplates,
    handleV10MeasurementTemplates,
    handleV13MeasurementTemplates,
    handleV11ToV12MeasurementTemplates,
    handlePreV11TemplatePreview
} from './handlers/templateHandlers.js';
import {addMetricLabels} from "./handlers/conversionHandlers.js";
import {
    handleFoundryV13Rulers, handlePreV10Ruler, handleV10To12DragRuler, handleV10ToV12Ruler
} from "./handlers/rulerHandlers.js";
import {libWrapperNotFoundDialog, libWrapperNotFoundDialogV2, showIncompatibilityDialog} from "./Dialogs.js";

Hooks.on("init", () => {
    registerSettings();
    window.metricRuler = {
        getRulerData: getRulerData
    }
});
Hooks.on("canvasReady", () => {
    // Select the measurement node you want to observe for Ruler and Token Drag Changes
    const targetNode = document.getElementById('measurement');

    const config = {
        childList: true, subtree: true, attributeFilter: []
    };

    // The callback function that executes when mutations are observed
    const callback = function (mutationsList, observer) {
        // mutationsList is an array of all mutations that occurred.
        for (const mutation of mutationsList) {
            //console.log('DOM mutation detected before next render:', mutation);
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                let rulers = [];
                if (mutation.target.matches(".token-ruler-labels, .distance-ruler-labels")) {
                    let elem = document.getElementById(mutation.target.id);
                    if (elem) {
                        rulers.push(elem);
                    }
                }
                handleFoundryV13Rulers(rulers)
            }
        }
    };

    //Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    //Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    console.log("[Additional-Metric-Ruler] MutationObserver is now watching the #measurement element.");
});

Hooks.once('ready', () => {
    let foundryGeneration = game.release.generation;

    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        if (foundryGeneration >= 13) {
            libWrapperNotFoundDialogV2();
        } else {
            libWrapperNotFoundDialog();
        }
    } else {


        //Check foundry generation
        if (foundryGeneration < 9 || foundryGeneration > 13) {
            showIncompatibilityDialog(foundryGeneration);
        }

        //=============================================================================
        // MEASUREMENT TEMPLATES
        //=============================================================================

        if (foundryGeneration < 10) {
            //Handling of MeasureTemplate Drop (Only needed before V10)
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftDrop", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (measureTemplateSupport) {
                    return handlePreV10MeasurementTemplates(wrappedResult);
                } else {
                    return wrappedResult;
                }
            }, 'MIXED');
            //Handling of MeasureTemplate Preview
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftMove", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (measureTemplateSupport) {
                    wrappedResult = handlePreV11TemplatePreview(foundryGeneration, wrappedResult);
                }
                return wrappedResult;
            }, 'WRAPPER');

        } else if (foundryGeneration === 10) {
            //Handling of MeasureTemplate Drag (V10)
            libWrapper.register("metric-ruler-labels", "CONFIG.MeasuredTemplate.layerClass.prototype._onDragLeftDrop", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (measureTemplateSupport) {
                    handleV10MeasurementTemplates();
                }
                return wrappedResult;
            }, 'MIXED');
            //Handling of MeasureTemplate Preview
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftMove", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (measureTemplateSupport) {
                    wrappedResult = handlePreV11TemplatePreview(foundryGeneration, wrappedResult);
                }
                return wrappedResult;
            }, 'WRAPPER');
        } else if (foundryGeneration === 11 || foundryGeneration === 12) {
            //Handling of MeasureTemplate Drag and Drop (V11/12)
            libWrapper.register("metric-ruler-labels", "MeasuredTemplate.prototype._refreshRulerText", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (measureTemplateSupport) {
                    handleV11ToV12MeasurementTemplates();
                }
                return wrappedResult;
            }, 'MIXED');
        } else if (foundryGeneration >= 13) {
            //Handling of MeasureTemplate Drag and Drop (V13)
            libWrapper.register("metric-ruler-labels", "foundry.canvas.placeables.MeasuredTemplate.prototype._refreshRulerText", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if (measureTemplateSupport) {
                    handleV13MeasurementTemplates();
                }
                return wrappedResult;
            }, 'WRAPPER');
        }

        //=============================================================================
        // RULERS
        //=============================================================================

        if (foundryGeneration < 13) {
            //Handling of Ruler + Elevation Ruler
            libWrapper.register("metric-ruler-labels", "Ruler.prototype.measure", function (wrapped, ...args) {
                let wrappedResult = wrapped(...args);
                let dragRulerSupport = game.settings.get("metric-ruler-labels", "dragRulerSupport");
                let foundryGeneration = game.release.generation;

                if (foundryGeneration < 10) {
                    wrappedResult = handlePreV10Ruler(wrappedResult, dragRulerSupport);
                } else {
                    wrappedResult = handleV10ToV12Ruler(wrappedResult);
                }

                return wrappedResult;
            }, 'WRAPPER');
        }

        //=============================================================================
        // TOKEN DRAG
        //=============================================================================

        if (foundryGeneration >= 10 && foundryGeneration < 13) {
            //Dragruler + p2fe Drag Measurement
            let dragRulerSupport = game.settings.get("metric-ruler-labels", "dragRulerSupport")
            if (dragRulerSupport !== "noDragRulerSupport") {
                //Handling of DragRuler V10
                libWrapper.register("metric-ruler-labels", "Token.prototype._onDragLeftMove", function (wrapped, ...args) {
                    let wrappedResult = wrapped(...args);
                    let elevationRulerActive = game.modules.get('elevationruler')?.active;

                    //Delay, so that drag-ruler does not overwrite
                    setTimeout(function () {
                        handleV10To12DragRuler(dragRulerSupport, elevationRulerActive);
                    }, 60);

                    return wrappedResult;
                }, 'WRAPPER');
            }
        }
    }
});

/**
 * Registers all module settings in Foundry VTT.
 * @function registerSettings
 * @description Registers various configuration settings for the metric ruler labels module
 */
function registerSettings() {
    let foundryGeneration = game.release.generation;

    game.settings.register("metric-ruler-labels", "measureTemplateSupport", {
        name: "metric-ruler-labels.settings.measureTemplateSupport.name",
        hint: "metric-ruler-labels.settings.measureTemplateSupport.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });
    if (foundryGeneration < 13) {
        game.settings.register("metric-ruler-labels", "dragRulerSupport", {
            name: "metric-ruler-labels.settings.dragRulerSupport.name",
            hint: "metric-ruler-labels.settings.dragRulerSupport.hint",
            scope: "client",
            config: true,
            type: String,
            default: "dragRulerSupport",
            choices: {
                "noDragRulerSupport": "metric-ruler-labels.settings.dragRulerSupport.disabled",
                "dragRulerSupport": "metric-ruler-labels.settings.dragRulerSupport.dragRuler",
                "pf2eDragRulerSupport": "metric-ruler-labels.settings.dragRulerSupport.pf2eTokenDragRuler"
            }
        });
    }

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
    game.settings.register("metric-ruler-labels", "travelTimeRoundingMode", {
        name: "metric-ruler-labels.settings.travelTimeRoundingMode.name",
        hint: "metric-ruler-labels.settings.travelTimeRoundingMode.hint",
        scope: "world",
        config: true,
        type: String,
        default: "roundToFullQuarters",
        choices: {
            "roundToFullTenths": "metric-ruler-labels.settings.travelTimeRoundingMode.roundToFullTenths",
            "roundToFullQuarters": "metric-ruler-labels.settings.travelTimeRoundingMode.roundToFullQuarters",
            "roundToFullHalves": "metric-ruler-labels.settings.travelTimeRoundingMode.roundToFullHalves",
            "roundToFull": "metric-ruler-labels.settings.travelTimeRoundingMode.roundToFull",
            "noSpecialRounding": "metric-ruler-labels.settings.travelTimeRoundingMode.noSpecialRounding"
        }
    });
    if (foundryGeneration < 13) {

        game.settings.register("metric-ruler-labels", "travelTimeOnlyTotalTimeLastSegment", {
            name: "metric-ruler-labels.settings.travelTimeOnlyTotalTimeLastSegment.name",
            hint: "metric-ruler-labels.settings.travelTimeOnlyTotalTimeLastSegment.hint",
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
        });
    }
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
    game.settings.register("metric-ruler-labels", "customConversionFactorSmall", {
        name: "metric-ruler-labels.settings.customConversionFactorSmall.name",
        hint: "metric-ruler-labels.settings.customConversionFactorSmall.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 0.3,
    });
    game.settings.register("metric-ruler-labels", "customConversionLabelSmall", {
        name: "metric-ruler-labels.settings.customConversionLabelSmall.name",
        hint: "metric-ruler-labels.settings.customConversionLabelSmall.hint",
        scope: "world",
        config: true,
        type: String,
        default: "m",
    });
    game.settings.register("metric-ruler-labels", "customConversionOriginalLabelsBig", {
        name: "metric-ruler-labels.settings.customConversionOriginalLabelsBig.name",
        hint: "metric-ruler-labels.settings.customConversionOriginalLabelsBig.hint",
        scope: "world",
        config: true,
        type: String,
        default: "mi.,mi,miles",
    });
    game.settings.register("metric-ruler-labels", "customConversionLabelBig", {
        name: "metric-ruler-labels.settings.customConversionLabelBig.name",
        hint: "metric-ruler-labels.settings.customConversionLabelBig.hint",
        scope: "world",
        config: true,
        type: String,
        default: "km",
    });
    game.settings.register("metric-ruler-labels", "customConversionFactorBig", {
        name: "metric-ruler-labels.settings.customConversionFactorBig.name",
        hint: "metric-ruler-labels.settings.customConversionFactorBig.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 1.61,
    });
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

    if (foundryGeneration >= 10 && foundryGeneration <= 12) {
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
                text = addMetricLabels(segments[i].label.text.split("\n")[0].trim()).text;

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

