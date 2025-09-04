import {
    addCustomConversionLabels,
    addMetricLabels,
    addTravelTime,
    addTravelTimeV13,
    convertDeltaStrings,
    hideFoundryLabel
} from "./conversionHandlers.js";
import {setCssVarById,removeCssVarById} from "../helpers/cssHelper.js";
import { getCurrentMinWidth, setCurrentMinWidth, cleanUpMinWidths } from "../helpers/cssHelper.js";

/**
 /**
 * Handles the modification and formatting of Foundry V13 ruler and token-drag measurements.
 * Applies metric conversions, custom conversions, travel time calculations,
 * and hides default Foundry labels where appropriate.
 *
 * @param {Array} rulers - An array of DOM elements representing rulers in the Foundry VTT interface.
 * Each ruler may contain child nodes or be a collection of ruler segments.
 *
 * @return {void} This function does not return a value. It directly modifies the DOM elements
 * representing the rulers in the Foundry VTT interface.
 */
function handleFoundryV13Rulers(rulers){
    let hideFoundry = game.settings.get("metric-ruler-labels", "hideFoundryMeasurement");
    let numberOfActiveConversions = 0;
    for (let i = 0; i < rulers.length; i++) {
        let rulerSegments = rulers[i].childNodes.length > 0 ? rulers[i].childNodes : rulers[i];
        for (let j = 0; j < rulerSegments.length; j++) {
            let measurements = [];
            measurements.push({
                total: rulerSegments[j].getElementsByClassName("total-measurement")[0],
                delta: rulerSegments[j].getElementsByClassName("delta-measurement")[0]
            })
            measurements.push({
                labelWidth: rulerSegments[j].style.clientWidth,
                total: rulerSegments[j].getElementsByClassName("total-elevation")[0],
                delta: rulerSegments[j].getElementsByClassName("delta-elevation")[0]
            })
            let conversion,splittedRulerLabel;

            measurements.forEach(measurement => {
                if(measurement.total){
                    splittedRulerLabel = measurement.total.innerHTML.split("<br>");
                    if(splittedRulerLabel.length === 1){
                        numberOfActiveConversions = 0;
                        //METRIC
                        conversion = addMetricLabels(measurement.total.innerHTML,true)
                        measurement.total.innerHTML =  conversion.converted ? conversion.text : measurement.total.innerHTML;
                        if(measurement.delta  && conversion.converted){
                            measurement.delta.innerHTML = convertDeltaStrings(measurement.delta.innerHTML,conversion.usedConversionFactor, true);
                        }
                        if(conversion.converted){
                            numberOfActiveConversions++;
                        }
                        //CUSTOM CONVERSION
                        conversion = addCustomConversionLabels(measurement.total.innerHTML,true)
                        measurement.total.innerHTML =  conversion.converted ? conversion.text : measurement.total.innerHTML;
                        if(measurement.delta && conversion.converted){
                            measurement.delta.innerHTML = convertDeltaStrings(measurement.delta.innerHTML,conversion.usedConversionFactor, true);
                        }
                        if(conversion.converted){
                            numberOfActiveConversions++;
                        }
                        //TRAVEL TIME
                        conversion = addTravelTimeV13(measurement.total.innerHTML,true,false)
                        measurement.total.innerHTML =  conversion.converted ? conversion.text : measurement.total.innerHTML;
                        if(measurement.delta && conversion.converted){
                            measurement.delta.innerHTML = convertDeltaStrings(measurement.delta.innerHTML,conversion.usedConversionFactor, true, true);
                        }
                        if(conversion.converted){
                            numberOfActiveConversions++;
                        }
                        //HIDE FOUNDRY LABEL
                        conversion = hideFoundryLabel(measurement.total.innerHTML,true);
                        measurement.total.innerHTML =  conversion.converted ? conversion.text : measurement.total.innerHTML;
                        if(measurement.delta ){
                            conversion = hideFoundryLabel(measurement.delta.innerHTML,true);
                            measurement.delta.innerHTML = conversion.text;
                        }
                        if(getCurrentMinWidth(rulers[i].id) < measurement.total.parentNode.clientWidth){
                            setCurrentMinWidth(rulers[i].id,measurement.total.parentNode.clientWidth);
                            adjustLabelCSS(rulers[i].id,numberOfActiveConversions,8,getCurrentMinWidth(rulers[i].id),hideFoundry);
                        }
                    }
                }
            })
        }
    }
}
/**
 * Processes and updates drag ruler labels for compatibility between version 10 to version 12,
 * supporting specific drag ruler implementations and optionally accounting for elevation.
 *
 * @param {string} dragRulerSupport - Specifies the type of drag ruler support. Should be either "dragRulerSupport" or "pf2eDragRulerSupport".
 * @param {boolean} elevationRulerActive - Indicates whether elevation ruler is active, determining label text structure.
 * @return {void} This function does not return a value; it updates drag ruler labels directly.
 */
function handleV10To12DragRuler(dragRulerSupport, elevationRulerActive) {
    let rulers = [];
    if (dragRulerSupport === "dragRulerSupport" && game.canvas.controls.rulers) {
        rulers = game.canvas.controls.rulers.children;

    } else if (dragRulerSupport === "pf2eDragRulerSupport" && game.canvas.dragRuler && game.canvas.dragRuler.rulers) {
        rulers = game.canvas.dragRuler.rulers.children;
    }
    for (let i = 0; i < rulers.length; i++) {
        if ((rulers[i].isDragRuler && dragRulerSupport === "dragRulerSupport") || (dragRulerSupport === "pf2eDragRulerSupport")) {
            let dragRulerSegments = rulers[i].segments;
            if (dragRulerSegments && Array.isArray(dragRulerSegments) && dragRulerSegments.length > 0) {
                for (let i = 0; i < dragRulerSegments.length; i++) {
                    if (dragRulerSegments[i].label.text.split("\n").length === (elevationRulerActive ? 2 : 1)) {
                        dragRulerSegments[i].label.text = addMetricLabels(dragRulerSegments[i].label.text).text;
                        dragRulerSegments[i].label.text = addCustomConversionLabels(dragRulerSegments[i].label.text).text;
                        dragRulerSegments[i].label.text = addTravelTime(dragRulerSegments[i].label.text, dragRulerSegments.length > 1).text;
                        dragRulerSegments[i].label.text = hideFoundryLabel(dragRulerSegments[i].label.text).text;
                    }
                }
            }
        }
    }
}

/**
 * Handles labeling and custom processing for pre V10 ruler functionality.
 * Processes metric labels, custom conversions, travel time, and hides default labels for either a single segment or an array of segments.
 *
 * @param {Object|Array} wrappedResult - The input ruler data to be processed. It can be a single ruler segment object or an array of them.
 * @param {string} dragRulerSupport - A flag indicating if drag ruler support is enabled. Typically, it should be set to "dragRulerSupport".
 * @return {Object|Array} The processed ruler data with updated labels, maintaining the input structure (object or array).
 */
function handlePreV10Ruler(wrappedResult, dragRulerSupport) {
    if (wrappedResult.label) {
        let segment = wrappedResult;
        //Loop over all prior segments of the ruler
        do {
            segment.label.text = addMetricLabels(segment.label.text).text;
            segment.label.text = addCustomConversionLabels(segment.label.text).text;
            segment.label.text = addTravelTime(segment.label.text).text;
            segment.label.text = hideFoundryLabel(segment.label.text).text;

            // Go to prior segment and convert label -> For the case that the ruler has waypoints
            segment = segment.prior_segment;
        } while (segment !== undefined && Object.keys(segment).length > 0);

    } else if ((dragRulerSupport === "dragRulerSupport") && Array.isArray(wrappedResult) && wrappedResult.length > 0) { //Handling for Dragruler Support
        for (let i = 0; i < wrappedResult.length; i++) {
            wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text).text;
            wrappedResult[i].label.text = addCustomConversionLabels(wrappedResult[i].label.text).text;
            wrappedResult[i].label.text = addTravelTime(wrappedResult[i].label.text, wrappedResult.length > 1).text;
            wrappedResult[i].label.text = hideFoundryLabel(wrappedResult[i].label.text).text;
        }
    }
    return wrappedResult;
}

/**
 * Processes the given wrapped result data to modify and update label texts by applying
 * specific transformations such as adding metric labels, custom conversion labels, travel times,
 * and hiding foundry labels.
 *
 * @param {Array} wrappedResult - The array of label data objects that need to be transformed. Each object in the array is expected to have a `label` property containing a `text` field.
 * @return {Array} The updated wrapped result array with transformed label texts.
 */
function handleV10ToV12Ruler(wrappedResult) {
    if (Array.isArray(wrappedResult) && wrappedResult.length > 0) {
        for (let i = 0; i < wrappedResult.length; i++) {
            wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text).text;
            wrappedResult[i].label.text = addCustomConversionLabels(wrappedResult[i].label.text).text;
            wrappedResult[i].label.text = addTravelTime(wrappedResult[i].label.text, wrappedResult.length > 1).text;
            wrappedResult[i].label.text = hideFoundryLabel(wrappedResult[i].label.text).text;
        }
    }
    return wrappedResult;
}

/**
 * Adjusts CSS styling for ruler labels based on specified parameters.
 *
 * @param {string} elementID - The ID of the element to adjust CSS for
 * @param {number|null} numberOfActiveConversions - Number of active unit conversions (determines label height). Null means no height adjustment.
 * @param {number} paddingPx - Padding in pixels to add to the height calculation. Default 0.
 * @param {number|null} minWidthPx - Minimum width in pixels for the label. Null means no min-width set.
 * @param {boolean} hideFoundryLabel - Whether the Foundry label is hidden. Default false.
 * @returns {void} This function does not return a value. It directly modifies CSS variables.
 */
function adjustLabelCSS(elementID, numberOfActiveConversions = null, paddingPx = 0, minWidthPx = null, hideFoundryLabel = false) {
    let cssHeight = numberOfActiveConversions ? (numberOfActiveConversions * 30) + (2 * paddingPx) : null
    if (cssHeight && hideFoundryLabel === false) {
        cssHeight += 30;
    }

    if (cssHeight) {
        setCssVarById(elementID, "--waypoint-label-height", cssHeight + "px")
    }
    if (minWidthPx) {
        setCssVarById(elementID, "--waypoint-label-min-width", minWidthPx + "px")
    } else {
        removeCssVarById(elementID, "--waypoint-label-min-width");
    }
}


export {
    handleFoundryV13Rulers,
    handlePreV10Ruler,
    handleV10ToV12Ruler,
    handleV10To12DragRuler,
    getCurrentMinWidth,
    setCurrentMinWidth,
    cleanUpMinWidths,
    adjustLabelCSS
};
