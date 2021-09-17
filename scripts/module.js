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
            content: "<h2>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.title") +"</h2>"+
                "<p>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.infotext") + "</p> <br>",
            buttons: {
                dismiss: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Got it!"
                }
            }
        }, { width: 600 }).render(true);
    } else {

        //Handling of MeasureTemplate
        libWrapper.register("metric-ruler-labels", "TemplateLayer.prototype._onDragLeftDrop", async function (wrapped, ...args) {
            let wrappedResult = await wrapped(...args);
            let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");

            if(measureTemplateSupport && wrappedResult._object && wrappedResult._object.ruler){
                wrappedResult._object.ruler.text = addMetricLabels(wrappedResult._object.ruler.text);
            }
            return wrappedResult;
        }, 'MIXED');

        //Handling of MeasureTemplate Preview
        libWrapper.register("metric-ruler-labels", "MeasuredTemplate.prototype.refresh", async function (wrapped, ...args) {
            let wrappedResult = await wrapped(...args);
            let measureTemplateSupport = game.settings.get("metric-ruler-labels", "measureTemplateSupport");

            if(measureTemplateSupport && wrappedResult && wrappedResult.ruler){
                wrappedResult.ruler.text = addMetricLabels(wrappedResult.ruler.text);
            }
            return wrappedResult;
        }, 'MIXED');

        //Handling of Ruler and DragRuler
        libWrapper.register("metric-ruler-labels", "Ruler.prototype.measure", function (wrapped, ...args) {
            let wrappedResult = wrapped(...args);
            let dragRulerSupportActive = game.settings.get("metric-ruler-labels", "dragRulerSupport");

            if (wrappedResult.label) {
                let segment = wrappedResult;
                //Loop over all prior segments of the ruler
                do {
                    segment.label.text = addMetricLabels(segment.label.text);
                    // Go to prior segment and convert label -> For the case that the ruler has waypoints
                    segment = segment.prior_segment;
                } while (segment !== undefined && Object.keys(segment).length > 0);

            } else if (dragRulerSupportActive && Array.isArray(wrappedResult) && wrappedResult.length > 0) { //Handling for Dragruler Support
                for (let i = 0; i < wrappedResult.length; i++) {
                    wrappedResult[i].label.text = addMetricLabels(wrappedResult[i].label.text);
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
}

function addMetricLabels(text){
    let regexFeet = /^(-?\d*\.?\d*)\s?(?:ft\.?|feet)\s?x?(\s?(-?\d*\.?\d*)\s?(?:ft\.?|feet))?(?:\[(-?\d*\.?\d*)\s?(?:ft\.?|feet)\])?$/;
    let regexMiles = /^(-?\d*\.?\d*)\s?(?:mi\.?|miles)\s?x?(\s?(-?\d*\.?\d*)\s?(?:mi\.?|miles))?(?:\[(-?\d*\.?\d*)\s(?:mi\.?|miles)\])?$/;

    let regexResult = regexFeet.exec(text);
    if (regexResult && regexResult.length === 5 && regexResult[1]) {
        //Convert to meters and set label
        text = text + " \n " + parseFloat(((regexResult[1] / 10) * 3).toFixed(2)) + " m";
        if(regexResult[3]) {
            text = text + " x " + parseFloat(((regexResult[3] / 10) * 3).toFixed(2)) + " m";
        }else if(regexResult[4]) {
            text = text + " [" + parseFloat(((regexResult[4] / 10) * 3).toFixed(2)) + " m]";
        }
    } else {
        //Check if measurement is in miles
        regexResult = regexMiles.exec(text);
        //Convert to kilometers and set label
        if (regexResult && regexResult.length === 5 && regexResult[1]) {
            text = text + " \n " + parseFloat((regexResult[1] / 0.62137).toFixed(2)) + " km";
            if (regexResult[3]) {
                text = text + " x " + parseFloat((regexResult[3] / 0.62137).toFixed(2)) + " km";
            }else if(regexResult[4]){
                text = text + " [" + parseFloat((regexResult[4] / 0.62137).toFixed(2)) + " km]";
            }
        }
    }

    return text;
}
