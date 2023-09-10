/*
 * Copyright (C) 2023  Annosmart Technologies Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback, useEffect, useState, } from "react";
import { ModuleRow } from "./landmark-module.styled";
import { FaCircle } from "react-icons/fa";
import ToolButton from "./controls/tool-button";
import TagsInput from "react-tagsinput";

function LandmarkModule({
    file,
    setFile,
    dataType,
    currentTool,
    setCurrentTool,
    mouseEvent,
    toolData,
    setToolData,
    displayMenu,
    labelSelected, setUsedLabels,
    labelAssignment, labelExclusivity, setFormats,
    reset, setReset, selectedType, changeSelectedType,
    setValidateAnnotation, validateAnnotation,
    fileName, options,
}) {
    const [localData, setLocalData] = useState({ points: [], startPos: { x: 0, y: 0 } })
    const [selectedPointIndex, setSelectedPointIndex] = useState(-1)
    const POINT_RATIO = 5;
    const [imageDim, setImageDim] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);

    const unit = useCallback((value) => {
        return value * scale / options._zoom;
    }, [scale, options._zoom])

    const handleReset = () => {
        setLocalData({ points: [], startPos: { x: 0, y: 0 } })
    }

    useEffect(() => {
        if (mouseEvent.type === 'scalechange') {
            setScale(mouseEvent.scale);
            return;
        }
        switch (currentTool?.name) {
            case 'point-create':
                switch (mouseEvent.type) {
                    case "mousedown":
                        if (mouseEvent.buttons === 1) {
                            setLocalData({ ...localData, startPos: { ...fixPoint(mouseEvent.point) }, creating: true })
                        }
                        break;
                    case "mouseup":
                        if (localData.creating) {
                            createPoint(localData.startPos)
                            displayMenu(mouseEvent.e)
                        }
                        break;
                }
                break;
            case 'point-modify':
                switch (mouseEvent.type) {
                    case "mousedown":
                        if (mouseEvent.e.target.tagName !== "circle") {
                            selectPoint(-1)
                        }
                        break;
                    case "mousemove":
                        if (mouseEvent.buttons === 1) {
                            moveSelectedPoint(mouseEvent)
                        }
                        break;
                }
                break;
        }
    }, [mouseEvent]);

    const createPoint = (point) => {
        setLocalData({
            ...localData, points: [...localData.points.map(p => {
                return { ...p, selected: false }
            }), { x: point.x, y: point.y, selected: true }],
            creating: false,
        })
    }
    const fixPoint = (point) => {
        return {
            ...point,
            x: Math.max(0, Math.min(point.x, imageDim.width)),
            y: Math.max(0, Math.min(point.y, imageDim.height)),
        }
    }
    useEffect(() => {
        setToolData({ svg: getSVG() })
    }, [localData, scale, options._zoom])

    useEffect(() => {
        setUsedLabels(getAllLabels(localData.points))
        const valid = localData.points?.length > 0 && localData.points.every(r => r.labels?.length > 0)
        let currentAnnotation = getAnnotation();
        setValidateAnnotation({
            valid: valid,
            error: valid ? null : "It's necessary to complete all the labels",
            'tjson': currentAnnotation,
            'txml': currentAnnotation,
        })
    }, [localData.points])

    useEffect(() => {
        if (validateAnnotation.metaData) {
            let result = loadMetaData({ ...validateAnnotation.metaData })
            setValidateAnnotation(
                { ...validateAnnotation, runningError: result.error, warnings: result.warnings, metaData: null }
            )
        }
    }, [validateAnnotation])

    useEffect(() => {
        setPointLabel()
    }, [labelSelected])
    useEffect(() => {
        if (reset) {
            handleReset()
            setReset(false)
        }
    }, [reset])

    useEffect(() => {
        setFormats([
            { 'value': 'tjson', 'label': 'tika-json', 'parser': 'json' },
            { 'value': 'txml', 'label': 'tika-xml', 'parser': 'xml' },
        ])
    }, []);

    useEffect(() => {
        if (file) {
            const img = new Image;
            img.onload = function () {
                setImageDim({ width: img.width, height: img.height });
            };
            img.src = file;
        }
    }, [file])

    const handlePointMouseDown = (e, index) => {
        selectPoint(index)
    }
    const getAnnotation = () => {
        return {
            "data_filename": fileName?.name,
            "data_type": dataType,
            "image_width": imageDim.width,
            "image_height": imageDim.height,
            "data_annotation": {
                "landmark": localData.points.map(r => {
                    const pointAnnotation = r.type ? { type: r.type } : {}
                    pointAnnotation["classification_label"] = r.labels?.map(l => l.tags.join('::')) ?? [];
                    pointAnnotation["point_2D"] = `${r.x.toFixed(1)}, ${r.y.toFixed(1)}`;
                    return pointAnnotation;
                })
            }
        }
    }
    const loadMetaData = (meta) => {
        let result = { error: null, warnings: [] }
        if (meta.data_type !== dataType) {
            return { error: `Meta file must have the same data type. Expected: ${dataType} and got ${meta.data_type}` }
        }
        if (dataType === 'image' && (meta.image_width !== imageDim.width || meta.image_height !== imageDim.height)) {
            result['warnings'].push('Width or height of Meta file are different of current image')
        }
        if (!(meta.data_annotation && meta.data_annotation.landmark && meta.data_annotation.landmark.length > 0))
            return { error: `Meta file format error` }
        try {
            let points = meta.data_annotation.landmark.map(lm => {
                return {
                    'type': lm.type ?? null,
                    'labels': (lm.classification_label.map ? lm.classification_label : [lm.classification_label]).map(cl => {
                        return { 'tags': cl.split('::') }
                    }),
                    'x': parseFloat(lm.point_2D.split(',')[0]),
                    'y': parseFloat(lm.point_2D.split(',')[1])
                }
            })
            setLocalData({
                ...localData,
                points: [...(validateAnnotation.metaOptions?.overwrite ? [] : localData.points), ...points]
            })
        } catch (e) {
            console.error(e);
            return { error: `Meta file format error` }
        }

        return result
    }
    const selectPoint = (index) => {
        index = index < localData.points.length ? index : -1
        setSelectedPointIndex(index);
        setLocalData({
            ...localData,
            points: localData.points.map((p, i) => {
                return { ...p, selected: i === index }
            })
        });
        if (index >= 0 && !currentTool)
            changeTool('point-modify', true)
        if (index < 0)
            changeTool(null, true)
    }

    const moveSelectedPoint = (e) => {
        if (selectedPointIndex >= 0) {
            setLocalData({
                ...localData, points: localData.points.map((p, i) => {
                    return p.selected ? fixPoint({ ...p, x: e.point.x, y: e.point.y, }) : p;
                })
            })
        }
    }

    const removeSelectedPoint = (e) => {
        setLocalData({
            ...localData, points: localData.points.map(p => {
                return p.selected ? null : p;
            }).filter(p => p)
        })
    }
    const getAllLabels = (points) => {
        return [].concat.apply([], points?.map(p => p.labels ?? []));
    }
    const containsLabel = (labels, label) => {
        return labels && label && labels.some(l => l.tags.length === label.tags.length && l.tags.every((e, i) => e === label.tags[i]))
    }
    const setPointLabel = () => {
        const { fullPath, label, format } = labelSelected
        const fullLabel = { tags: [...fullPath ?? [], label] }
        const resultLabels = (point) => {
            const allLabels = getAllLabels(localData.points)
            if (labelExclusivity && containsLabel(allLabels, fullLabel))
                return point.labels
            if (labelAssignment) {
                return containsLabel(point.labels, fullLabel) ? point.labels : [...point.labels ?? [], fullLabel]
            }
            return [fullLabel]
        }
        const points = localData.points.map(p => {
            return p.selected ? { ...p, labels: resultLabels(p), ...format } : p;
        }).filter(p => p)
        setLocalData({ ...localData, points: points })
    }

    const changeTool = (tool, select) => {
        switch (tool) {
            case 'point-create':
                setCurrentTool(currentTool?.name === tool && !select ? null : { name: tool, cursor: 'crosshair' })
                break;
            case 'point-modify':
                if (!select)
                    selectPoint(-1)
                setCurrentTool(currentTool?.name === tool && !select ? null : { name: tool, cursor: 'default' })
                break;
            case 'point-remove':
                removeSelectedPoint()
                setCurrentTool(null)
                break;
            default:
                setCurrentTool(null)
        }
    }

    const handleContextMenu = (e) => {
        displayMenu(e)
    }
    const getColor = (p) => {
        if ("labels" in p) {
            return {
                textColor: p.selected || p.creating ? "red" : (p.textColor ?? "yellow"),
                pointColor: p.selected || p.creating ? "red" : "black",
            }
        }
        else {
            return {
                textColor: p.selected || p.creating ? "red" : (p.textColor ?? "yellow"),
                pointColor: p.selected || p.creating ? "red" : "orange",
            }
        }
    }
    const getSVG = () => {
        function getPoint(p, index) {
            return <React.Fragment>
                {p.labels &&
                    <text x={p.x} y={p.y - unit(10 + POINT_RATIO)}
                        fill={getColor(p).textColor}
                        style={{
                            fontSize: `${unit(18)}px`,
                            textShadow: "rgb(70, 70, 70) 1px 1px, rgb(70, 70, 70) -1px 1px, rgb(70, 70, 70) 1px -1px, rgb(70, 70, 70) -1px -1px"
                        }}
                    >
                        <tspan>{p.labels.map(l => l.tags.join("::")).join(':')}</tspan>
                    </text>}
                <circle key={`s-point-${index}`} onContextMenu={(e) => handleContextMenu(e)}
                    onMouseDown={(e) => handlePointMouseDown(e, index)}
                    cx={p.x} cy={p.y} r={unit(POINT_RATIO)} fill={getColor(p).pointColor} stroke={"gray"}
                    strokeWidth={unit(1)}
                />
            </React.Fragment>;
        }

        return <React.Fragment>
            {localData.points.map((p, index) => (!p.selected && getPoint(p, index)))}
            {localData.points.map((p, index) => (p.selected && getPoint(p, index)))}
        </React.Fragment>
    }


    const handleChange = (tagsLabels) => {
        const points = localData.points.map(p => {
            return p.selected ? { ...p, labels: p.labels.filter(l => tagsLabels.includes(l.tags.join(':'))) } : p;
        }).filter(r => r)
        setLocalData({ ...localData, points: points })
    }

    function disabled() {
        return false;
    }


    return <React.Fragment>
        <ModuleRow className={'toolbar flex-column'}>
            <label className={'full-width'} htmlFor={'tool-tag-input'}><b>Current Labels</b></label>
            <TagsInput onlyUnique={true} id={'tool-tag-input'}
                value={selectedPointIndex >= 0 && selectedPointIndex < localData.points.length ? localData.points[selectedPointIndex].labels?.map(l => l.tags.join(':')) ?? [] : []}
                onChange={handleChange} disabled={disabled()} inputProps={{
                    className: 'react-tagsinput-input',
                    placeholder: ''
                }} />
        </ModuleRow>
        <ModuleRow className={'toolbar'}>
            <ToolButton name={'point-create'} title={"create"} toolName={currentTool?.name} changeTool={changeTool}>
                <FaCircle color={'black'} />
            </ToolButton>
            <ToolButton name={'point-modify'} title={"modify"} toolName={currentTool?.name} changeTool={changeTool}>
                <FaCircle color={'green'} />
            </ToolButton>
            <ToolButton name={'point-remove'} title={"remove"} toolName={currentTool?.name} changeTool={changeTool}>
                <FaCircle color={'red'} />
            </ToolButton>
        </ModuleRow>
    </React.Fragment>
}

export default LandmarkModule