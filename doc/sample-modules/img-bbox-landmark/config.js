export default {
    value: "bounding_box+landmark", label: "bounding_box+landmark",
    dataType: "image",
    index: {file: "img-bbox-landmark/bbox-module", args: {}},
    priority: 520,
    modeTypes: [
        {
            value: "single-type", label: "single-type",
            levelTypes: [
                {value: "single-level", label: "simple"},
                {value: "two-level", label: "attribute-based"},
		{value: "multi-level", label: "multi-level"}
            ]
        },
        {
            value: "multi-type", label: "multi-type",
            levelTypes: [
                {value: "single-level", label: "simple"},
                {value: "two-level", label: "attribute-based"},
		{value: "multi-level", label: "multi-level"}
            ]
        },
    ]
}
