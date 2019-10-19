export const addLayerUrl = function(url) {
    return {
        type: "ADD_SOURCE_LAYER",
        url: url
    }
}

export const addImageLayerUri = function(uri) {
    return {
        type: "ADD_IMAGE_SOURCE_LAYER",
        uri: uri
    }
}

export const showLayerOptionsInModal = function(uri) {
    return {
        type: "SHOW_LAYER_OPTIONS_IN_MODAL",
        uri: uri
    }
}

export const closeOptionsLayerModal = function() {
    return {
        type: "CLOSE_LAYER_OPTIONS_MODAL"
    }
}

export default addLayerUrl;