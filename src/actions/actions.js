//export const ADD_SOURCE_LAYER = "ADD_SOURCE_LAYER";
//export const CREATE_MAP_OVERLAY = "CREATE_MAP_OVERLAY";
export const addLayerUrl = function(url) {
    return {
        type: "ADD_SOURCE_LAYER",
        url: url
    }
}

export const setFeatureProperties = function(featureProperties) {
    return {
        type: "SET_FEATURE_PROPERTIES",
        featureProperties: featureProperties
    }
}
/*
export const toggleMainDrawer = function() {
    return {
        type: "TOGGLE_MAIN_DRAWER"
    }
}
*/
/*
const createMapOverlay = function(overlay) {
    return {
        type: CREATE_MAP_OVERLAY,
        overlay: overlay
    }
}
*/
export default addLayerUrl;