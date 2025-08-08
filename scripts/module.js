/*
This package converts measurements of the ruler tool from feet to meters and from miles to kilometers.
5 ft -> 1.5 meter
1  mile -> 1,61 kilometers
In case there is an unknown unit nothing happens.
 */

import {
    handlePreV10MeasurementTemplates,
    handleV10MeasurementTemplates,
    handleV13MeasurementTemplates,
    handleV11ToV12MeasurementTemplates,
    handlePreV11TemplatePreview
} from './templateHandlers.js';
import {addMetricLabels} from "./conversionHandlers.js";
import {
    handleFoundryV13Rulers,
    handlePreV10Ruler,
    handleV10To12DragRuler,
    handleV10ToV12Ruler,
    setCurrentMinWidth,
    adjustLabelCSSClass
} from "./rulerHandlers.js";
import {libWrapperNotFoundDialog, libWrapperNotFoundDialogV2, showIncompatibilityDialog} from "./Dialogs.js";
import {safeGetCSSRules} from "./helper.js";

Hooks.on("init", () => {
    registerSettings();
    window.metricRuler = {
        getRulerData: getRulerData
    }
});

Hooks.once('ready',  () => {
    let foundryGeneration = game.release.generation;

    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        if(foundryGeneration >= 13){
            libWrapperNotFoundDialogV2();
        }else{
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
                if(measureTemplateSupport){
                    return handlePreV10MeasurementTemplates(wrappedResult);
                }else{
                    return wrappedResult;
                }
            }, 'MIXED');
            //Handling of MeasureTemplate Preview
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftMove", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if(measureTemplateSupport){
                    wrappedResult = handlePreV11TemplatePreview(foundryGeneration, wrappedResult);
                }
                return wrappedResult;
            }, 'WRAPPER');

        } else if (foundryGeneration === 10) {
            //Handling of MeasureTemplate Drag (V10)
            libWrapper.register("metric-ruler-labels", "CONFIG.MeasuredTemplate.layerClass.prototype._onDragLeftDrop", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if(measureTemplateSupport){
                    handleV10MeasurementTemplates();
                }
                return wrappedResult;
            }, 'MIXED');
            //Handling of MeasureTemplate Preview
            libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftMove", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if(measureTemplateSupport){
                    wrappedResult = handlePreV11TemplatePreview(foundryGeneration, wrappedResult);
                }
                return wrappedResult;
            }, 'WRAPPER');
        }else if (foundryGeneration === 11 || foundryGeneration === 12) {
            //Handling of MeasureTemplate Drag and Drop (V11/12)
            libWrapper.register("metric-ruler-labels", "MeasuredTemplate.prototype._refreshRulerText", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if(measureTemplateSupport){
                    handleV11ToV12MeasurementTemplates();
                }
                return wrappedResult;
            }, 'MIXED');
        }else if(foundryGeneration >= 13){
            //Handling of MeasureTemplate Drag and Drop (V13)
            libWrapper.register("metric-ruler-labels", "foundry.canvas.placeables.MeasuredTemplate.prototype._refreshRulerText", async function (wrapped, ...args) {
                let wrappedResult = await wrapped(...args);
                let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");
                if(measureTemplateSupport){
                    handleV13MeasurementTemplates();
                }
                return wrappedResult;
            }, 'WRAPPER');
        }

        //=============================================================================
        // RULERS
        //=============================================================================

        if(foundryGeneration >= 13) {
            initializeV13RulerCSS();
            libWrapper.register("metric-ruler-labels", "foundry.canvas.interaction.Ruler.prototype._refresh", function (wrapped, ...args) {
                let wrappedResult = wrapped(...args);
                let rulers = document.getElementsByClassName("distance-ruler-labels");
                setTimeout(() => {
                    handleFoundryV13Rulers(rulers)
                }, 5);
                return wrappedResult;

            }, 'WRAPPER');
            libWrapper.register("metric-ruler-labels", "foundry.canvas.interaction.Ruler.prototype._onDragStart", function (wrapped, ...args) {
                let wrappedResult = wrapped(...args);
                setCurrentMinWidth(0);
                adjustLabelCSSClass();
                return wrappedResult;

            }, 'WRAPPER');
        }else{
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

        if(foundryGeneration >= 13){
            initializeV13RulerCSS();
            //Handling of Token Drag
            libWrapper.register("metric-ruler-labels", "foundry.canvas.placeables.Token.prototype._refreshRuler", function (wrapped, ...args) {
                let wrappedResult = wrapped(...args);
                let rulers = document.getElementsByClassName("token-ruler-labels");
                //Delay, so that ruler labels are not overwritten
                setTimeout(() => {
                    handleFoundryV13Rulers(rulers);
                }, 5);
                return wrappedResult;
            }, 'WRAPPER');
            libWrapper.register("metric-ruler-labels", "foundry.canvas.placeables.Token.prototype._onDragStart", function (wrapped, ...args) {
                let wrappedResult = wrapped(...args);
                setCurrentMinWidth(0);
                adjustLabelCSSClass();
                return wrappedResult;

            }, 'WRAPPER');
        }else if (foundryGeneration >= 10 && foundryGeneration < 13) {
            //Dragruler + p2fe Drag Measurement
            let dragRulerSupport = game.settings.get("metric-ruler-labels", "dragRulerSupport")
            if(dragRulerSupport !== "noDragRulerSupport"){
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
    if(foundryGeneration < 13){
        game.settings.register("metric-ruler-labels", "dragRulerSupport", {
            name: "metric-ruler-labels.settings.dragRulerSupport.name",
            hint: "metric-ruler-labels.settings.dragRulerSupport.hint",
            scope: "client",
            config: true,
            type: String,
            default: "dragRulerSupport",
            choices:{
                "noDragRulerSupport": "metric-ruler-labels.settings.dragRulerSupport.disabled",
                "dragRulerSupport" : "metric-ruler-labels.settings.dragRulerSupport.dragRuler",
                "pf2eDragRulerSupport" : "metric-ruler-labels.settings.dragRulerSupport.pf2eTokenDragRuler"
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
 * Updates the CSS rules of the existing stylesheets in the document to apply specific modifications for ruler labels.
 * The method scans through all the stylesheets to locate a specific rule containing "metric-ruler-labels" in their href property.
 * Once identified, it applies new rules to update the alignment and padding for measurement waypoint labels and icons.
 *
 * @return {void} No return value. The function modifies the stylesheets directly.
 */
function initializeV13RulerCSS(){
    let CSSSheets = document.styleSheets;
    let found = false;
    for(let i = 0; i < CSSSheets.length; i++){
        if(found){
            break;
        }
        if(safeGetCSSRules(CSSSheets[i]) === null){
            continue;
        }
        for (let j = 0; j < CSSSheets[i].cssRules.length; j++) {
            if(CSSSheets[i].cssRules[j].href && CSSSheets[i].cssRules[j].href.includes("metric-ruler-labels")){
                let sheet = CSSSheets[i].cssRules[j].styleSheet;
                sheet.insertRule("#measurement .waypoint-label{align-items: flex-start !important;padding-top: 8px !important;padding-bottom: 8px !important;}",0);
                sheet.insertRule("#measurement .waypoint-label .icon{align-self: center !important}",1);
                found = true;
                break;
            }
        }
    }
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

