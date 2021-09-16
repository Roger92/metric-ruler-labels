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
        libWrapper.register("metric-ruler-labels", "Ruler.prototype.measure", function (wrapped, ...args) {
            let wrappedResult = wrapped(...args);
            let regexFeet = /^(\d*\.?\d*)\s?(?:ft\.?|feet)\s?(?:\[(\d*\.?\d*)\s?(?:ft\.?|feet)\])?$/;
            let regexMiles = /^(\d*\.?\d*)\s?(?:mi\.?|miles)\s?(?:\[(\d*\.?\d*)\s(?:mi\.?|miles)\])?$/;
            let dragRulerSupportActive = game.settings.get("metric-ruler-labels", "dragRulerSupport");

            if (wrappedResult.label) {
                let segment = wrappedResult;
                //Loop over all prior segments of the ruler
                do {
                    //Check if measurement is in feet
                    let regexResult = regexFeet.exec(segment.label._text);
                    if (regexResult && regexResult.length === 3 && regexResult[1]) {
                        //Convert to meters and set label
                        segment.label._text = segment.label._text + " \n " + parseFloat(((regexResult[1] / 10) * 3).toFixed(2)) + " m";
                        if (regexResult[2]) {
                            segment.label._text = segment.label._text + " [" + parseFloat(((regexResult[2] / 10) * 3).toFixed(2)) + " m]";
                        }
                    } else {
                        //Check if measurement is in miles
                        regexResult = regexMiles.exec(segment.label._text);
                        //Convert to kilometers and set label
                        if (regexResult && regexResult.length === 3 && regexResult[1]) {
                            segment.label._text = segment.label._text + " \n " + parseFloat((regexResult[1] / 0.62137).toFixed(2)) + " km";
                            if (regexResult[2]) {
                                segment.label._text = segment.label._text + " [" + parseFloat((regexResult[2] / 0.62137).toFixed(2)) + " km]";
                            }
                        }
                    }
                    // Go to prior segment and convert label -> For the case that the ruler has waypoints
                    segment = segment.prior_segment;
                } while (segment !== undefined && Object.keys(segment).length > 0);

            } else if (dragRulerSupportActive && Array.isArray(wrappedResult) && wrappedResult.length > 0) { //Handling for Dragruler Support
                for (let i = 0; i < wrappedResult.length; i++) {
                    //Check if measurement is in feet
                    let regexResult = regexFeet.exec(wrappedResult[i].label.text);
                    if (regexResult && regexResult.length === 3 && regexResult[1]) {
                        //Convert to meters and set label
                        wrappedResult[i].label.text = wrappedResult[i].label.text + " \n " + parseFloat(((regexResult[1] / 10) * 3).toFixed(2)) + " m";
                        if (regexResult[2]) {
                            wrappedResult[i].label.text = wrappedResult[i].label.text + " [" + parseFloat(((regexResult[2] / 10) * 3).toFixed(2)) + " m]";
                        }
                    } else {
                        //Check if measurement is in miles and set label
                        regexResult = regexMiles.exec(wrappedResult[i].label.text);
                        //Convert to kilometers
                        if (regexResult && regexResult.length === 3 && regexResult[1]) {
                            wrappedResult[i].label.text = wrappedResult[i].label.text + " \n " + parseFloat((regexResult[1] / 0.62137).toFixed(2)) + " km";
                            if (regexResult[2]) {
                                wrappedResult[i].label.text = wrappedResult[i].label.text + " [" + parseFloat((regexResult[2] / 0.62137).toFixed(2)) + " km]";
                            }
                        }
                    }
                }
            }
            return wrappedResult;
        }, 'WRAPPER');
    }

});

function registerSettings() {
    game.settings.register("metric-ruler-labels", "dragRulerSupport", {
        name: "metric-ruler-labels.settings.dragRulerSupport.name",
        hint: "metric-ruler-labels.settings.dragRulerSupport.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });
}