export const ToggleLayer = function(layerUrl, switchState) {
    return {
        type: "TOGGLE_LAYER",
        layerUrl: layerUrl,
        switchState: switchState
    }
}

export default ToggleLayer;