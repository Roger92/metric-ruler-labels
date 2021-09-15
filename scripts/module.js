/*
This package converts measurements of the ruler tool from feet to meters and from miles to kilometers.
5 ft -> 1.5 meter
1  mile -> 1,61 kilometers
In case there is an unknown unit nothing happens.
 */
Hooks.once('ready', () => {
    if(!game.modules.get('libruler')?.active && game.user.isGM){
        console.error("metric-ruler-labels | Module requires the 'libruler' module. Please install and activate it.");
    }else if(!game.modules.get('lib-wrapper')?.active && game.user.isGM){
        console.error("metric-ruler-labels | Module requires the 'libWrapper' module. Please install and activate it.");
    }else {
        /*libWrapper.register("metric-ruler-labels", "window.libRuler.RulerSegment.prototype.drawDistanceLabel", function (wrapped, ...args) {
            let label = wrapped();
            let regexFeet = /(\d*\.?\d*)\s?(?:ft\.?|feet)\.?\s?\[(\d*\.?\d*)\s?(?:ft\.?|feet)\.?\]/;
            let regexMiles = /(\d*\.?\d*)\s?(?:mi\.?|miles)\.?\s?\[(\d*\.?\d*)\s(?:mi\.?|miles)\.?\]/;
            //Check if measurement is in feet
            let result = regexFeet.exec(label._text);
            if (result && result.length === 3) {
                //Convert to meters and set label
                label._text = label._text + " \n " + parseFloat(((result[1] / 10) * 3).toFixed(2)) + " m [" + parseFloat(((result[2] / 10) * 3).toFixed(2)) + " m]"
            } else {
                //Check if measurement is in miles
                result = regexMiles.exec(label._text);
                //Convert to kilometers
                if (result && result.length === 3) {
                    label._text = label._text + " \n " + parseFloat((result[1] / 0.62137).toFixed(2)) + " km [" + parseFloat((result[2] / 0.62137).toFixed(2)) + " km]"
                }
            }
            return label;
        }, 'MIXED');
    }*/

        libWrapper.register("metric-ruler-labels", "Ruler.prototype.measure", function (wrapped, ...args) {
            let label = wrapped(...args);
            let regexFeet = /^(\d*\.?\d*)\s?(?:ft\.?|feet)\s?(?:\[(\d*\.?\d*)\s?(?:ft\.?|feet)\])?$/;
            let regexMiles = /^(\d*\.?\d*)\s?(?:mi\.?|miles)\s?(?:\[(\d*\.?\d*)\s(?:mi\.?|miles)\])?$/;

            console.log(label);
            if(label.label){
                //Check if measurement is in feet
                let result = regexFeet.exec( label.label._text);
                if (result && result.length === 3) {
                    //Convert to meters and set label
                    label.label._text = label.label._text + " \n " + parseFloat(((result[1] / 10) * 3).toFixed(2)) + " m [" + parseFloat(((result[2] / 10) * 3).toFixed(2)) + " m]"
                } else {
                    //Check if measurement is in miles
                    result = regexMiles.exec( label.label._text);
                    //Convert to kilometers
                    if (result && result.length === 3) {
                        label.label._text = label.label._text + " \n " + parseFloat((result[1] / 0.62137).toFixed(2)) + " km [" + parseFloat((result[2] / 0.62137).toFixed(2)) + " km]"
                    }
                }
            }else if(Array.isArray(label) && label.length > 0){ //Handling for Dragruler Support
                for (let i = 0; i < label.length; i++) {
                    //Check if measurement is in feet
                    let result = regexFeet.exec(label[i].label.text);
                    if (result && result.length === 3) {
                        //Convert to meters and set label
                        label[i].label.text = label[i].label.text + " \n " + parseFloat(((result[1] / 10) * 3).toFixed(2)) + " m";
                        if(result[2]){
                            label[i].label.text = label[i].label.text + " [" + parseFloat(((result[2] / 10) * 3).toFixed(2)) + " m]";
                        }
                    } else {
                        //Check if measurement is in miles
                        result = regexMiles.exec(label[i].label.text);
                        //Convert to kilometers
                        if (result && result.length === 3) {
                            label[i].label.text = label[i].label.text + " \n " + parseFloat((result[1] / 0.62137).toFixed(2)) + " km [" + parseFloat((result[2] / 0.62137).toFixed(2)) + " km]";
                            if(result[2]){
                                label[i].label.text = label[i].label.text + " [" + parseFloat((result[2] / 0.62137).toFixed(2)) + " km]";
                            }
                        }
                    }
                }
            }


            return label;
        }, 'WRAPPER');
    }

});