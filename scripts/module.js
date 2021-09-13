Hooks.once('ready', () => {
    if(!game.modules.get('libruler')?.active && game.user.isGM){
        console.error("metric-ruler-labels | Module requires the 'libruler' module. Please install and activate it.");
    }else if(!game.modules.get('lib-wrapper')?.active && game.user.isGM){
        console.error("metric-ruler-labels | Module requires the 'libWrapper' module. Please install and activate it.");
    }else{
        libWrapper.register("metric-ruler-labels", "window.libRuler.RulerSegment.prototype.drawDistanceLabel", function (wrapped, ...args) {
            let label = wrapped();
            let regexFeet = /(\d*\.?\d*)\s?(?:ft\.?|feet)\.?\s?\[(\d*\.?\d*)\s?(?:ft\.?|feet)\.?\]/;
            let regexMiles = /(\d*\.?\d*)\s?(?:mi\.?|miles)\.?\s?\[(\d*\.?\d*)\s(?:mi\.?|miles)\.?\]/;
            let result = regexFeet.exec(label._text);
            if(result && result.length === 3) {
                //Convert to meters and set label
                label._text = label._text + " \n " + parseFloat(((result[1]/10)*3).toFixed(2)) + " m [" + parseFloat(((result[2]/10)*3).toFixed(2)) + " m]"
            }else{
                result = regexMiles.exec(label._text);
                if(result && result.length === 3){
                    label._text = label._text + " \n " + parseFloat((result[1]/0.62137).toFixed(2)) + " km [" + parseFloat((result[2]/0.62137).toFixed(2)) + " km]"
                }
            }
            return label;
        },'MIXED');
    }
});
