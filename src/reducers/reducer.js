import BackgroundMap from "../map/BackgroundMap";
//import {ADD_SOURCE_LAYER} from "../actions/actions";
//import CREATE_MAP_OVERLAY from "../actions/actions";
function urlIsValid(url, layersUrls) {
    if (url === "" | url === undefined | layersUrls.includes(url) | (!url.startsWith("http://") & !url.startsWith("https://"))) {
        return false;
    }
    return true;
}

const reducer = function(state={
    layersUrls: [],
    map: new BackgroundMap(),
    showMainDrawer: false,
    feature: null
}, action) {
    console.log("ACAO EXECUTADA: " + action.type);
    switch (action.type) {
        case "ADD_SOURCE_LAYER":
            console.log("Trying to add Layer: " + action.url);
            if (!urlIsValid(action.url, state.layersUrls)) {       
                return state;
            }
            let newLayersUrls = state.layersUrls.slice();
            newLayersUrls.push(action.url);
            return {...state, layersUrls: newLayersUrls};

        case "SET_FEATURE_PROPERTIES":
            //console.log(action.feature)
            return {...state, featureProperties: action.featureProperties};
            /*
        case "TOGGLE_MAIN_DRAWER":
            if(state.showMainDrawer) {
                return {...state, showMainDrawer: false};
            } else {
                return {...state, showMainDrawer: true};
            }
            */
        /*case CREATE_MAP_OVERLAY:
            let newMap = {...state.map}
            newMap.on("singleclick", function(event) {
                //var clickedPixel = event.pixel;
                var content = document.getElementById('popup-content');        
                content.innerHTML = "<h1>ola</h1>"//_getFeaturePropertiesList(clickedPixel);
                action.overlay.setPosition(event.coordinate);
                
                var overlayCloser = document.getElementById('popup-closer');
                overlayCloser.onclick = function() {
                    action.overlay.setPosition(undefined);
                    this.blur();
                    return false;
                }                
            });
            return {map: newMap};*/

        default:
            return state;
    }
}

export default reducer;