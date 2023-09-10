import React, {useCallback, useEffect, useState,} from "react";
import {ModuleRow} from "./bbox-module.styled";
import {FaCircle, FaRegSquare} from "react-icons/fa";
import ToolButton from "./controls/tool-button";
import TagsInput from "react-tagsinput";

function BBoxLandmarkModule({
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
                                fileName, options
                            }) {
    const [localData, setLocalData] = useState({rects: [], points: [], startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}})
    const [selectedRectIndex, setSelectedRectIndex] = useState(-1)
    const [selectedPointIndex, setSelectedPointIndex] = useState(-1)
    const POINT_RATIO = 5;
    const [imageDim, setImageDim] = useState({width: 0, height: 0});
    const [scale, setScale] = useState(1);

    const unit = useCallback((value) => {
        return value * scale / options._zoom;
    }, [scale, options._zoom])

    const handleReset = () => {
        setLocalData({rects: [], points: [], startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}})
    }

    useEffect(() => {
        if (localData.resizeActive) {
            rectResize(mouseEvent)
            return;
        }
        if (mouseEvent.type === 'scalechange') {
            setScale(mouseEvent.scale);
            return;
        }
        switch (currentTool?.name) {
            case 'rect-create':
                switch (mouseEvent.type) {
                    case "mousedown":
                        if (mouseEvent.buttons === 1) {
                            setLocalData({
                                ...localData, startPos: fixPoint(mouseEvent.point), endPos: fixPoint(mouseEvent.point),
                                creating: true,
                            });
                        }
                        break;
                    case "mousemove":
                        if (mouseEvent.buttons === 1) {
                            setSelectedRectIndex(-1)
                            setLocalData({
                                ...localData, endPos: fixPoint(mouseEvent.point), rects: localData.rects.map((r, i) => {
                                    return {...r, selected: false}
                                })
                            });
                        }
                        break;
                    case "mouseup":
                        setLocalData({
                            ...localData,
                            rects: renderTempRect() ? [...localData.rects, getTempRect(true)] : [...localData.rects],
                            startPos: {x: 0, y: 0},
                            endPos: {x: 0, y: 0},
                            creating: false
                        });
                        break;
                }
                break;
            case 'shape-modify':
                switch (mouseEvent.type) {
                    case "mousedown":
                        if (mouseEvent.e.target.tagName === "rect") {
                            selectPoint(-1, fixPoint(mouseEvent.point))
                        } else if (mouseEvent.e.target.tagName === "circle") {
                            selectRect(-1)
                        } else {
                            deselectAll()
                        }
                        break;
                    case "mousemove":
                        if (mouseEvent.buttons === 1) {
                            moveSelectedRect(mouseEvent)
                            moveSelectedPoint(mouseEvent)
                        }
                        break;
                    case "mouseup":
                    case "mouseleave":
                        break;
                }
                break;
            case 'point-create':
                switch (mouseEvent.type) {
                    case "mousedown":
                        if (mouseEvent.buttons === 1) {
                            setLocalData({...localData, startPos: {...fixPoint(mouseEvent.point)}, creating: true})
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
        }
    }, [mouseEvent]);

    const rectResize = (mouseEvent) => {
        if (currentTool?.name !== 'shape-modify')
            return
        switch (mouseEvent.type) {
            case "mousedown":
                if (mouseEvent.buttons === 1) {
                    setLocalData({
                        ...localData,
                        resizePos: fixPoint(mouseEvent.point),
                        resizeRect: {...(localData.rects[selectedRectIndex] ?? localData.rects.last)}
                    });
                }
                break;
            case "mousemove":
                if (mouseEvent.buttons === 1) {
                    const rc = resizeCircles.find(rc => rc.c === localData.resizeKind);
                    const diff = {
                        x: fixPoint(mouseEvent.point).x - localData.resizePos.x,
                        y: fixPoint(mouseEvent.point).y - localData.resizePos.y
                    }
                    setLocalData({
                        ...localData,
                        rects: localData.rects.map(r => {
                            return r.selected ? fixRect({
                                ...r,
                                x: localData.resizeRect.x + (rc.sx === 0 ? Math.min(diff.x, localData.resizeRect.width - 1) : 0),
                                y: localData.resizeRect.y + (rc.sy === 0 ? Math.min(diff.y, localData.resizeRect.height - 1) : 0),
                                width: localData.resizeRect.width + (rc.sx === 1 ? Math.max(diff.x, -localData.resizeRect.width + 1) : 0) - (rc.sx === 0 ? Math.min(diff.x, localData.resizeRect.width - 1) : 0),
                                height: localData.resizeRect.height + (rc.sy === 1 ? Math.max(diff.y, -localData.resizeRect.height + 1) : 0) - (rc.sy === 0 ? Math.min(diff.y, localData.resizeRect.height - 1) : 0),
                            }) : r
                        })
                    });
                }
                break;
            case "mouseup":
                setLocalData({...localData, resizeActive: false,});
                break;
        }
    }
    const createPoint = (point) => {
        const index = localData.points.length
        setLocalData({
            ...localData, points: [...localData.points.map(p => {
                return {...p, selected: false}
            }), {x: point.x, y: point.y, selected: true}],
            creating: false,
            startPos: {x: 0, y: 0},
        })
        setSelectedPointIndex(index)
    }

    const fixPoint = (point) => {
        return {
            ...point,
            x: Math.max(0, Math.min(point.x, imageDim.width)),
            y: Math.max(0, Math.min(point.y, imageDim.height)),
        }
    }
    const fixRect = (rect) => {
        return {
            ...rect,
            x: Math.max(0, rect.x),
            y: Math.max(0, rect.y),
            width: Math.min(imageDim.width - rect.x, rect.width),
            height: Math.min(imageDim.height - rect.y, rect.height),
        }
    }
    useEffect(() => {
        setToolData({svg: getSVG()})
    }, [localData, scale, options._zoom])

    useEffect(() => {
        setUsedLabels(getAllLabels([...localData.rects, ...localData.points]))
        const valid = (localData.rects?.length > 0 || localData.points?.length > 0) && localData.rects.every(r => r.labels?.length > 0) && localData.points.every(r => r.labels?.length > 0)
        let currentAnnotation = getAnnotation();
        setValidateAnnotation({
            valid: valid,
            error: valid ? null : "It's necessary to complete all the labels",
            'tjson': currentAnnotation,
            'txml': currentAnnotation,
        })


    }, [localData.rects, localData.points])

    useEffect(() => {
        if (validateAnnotation.metaData) {
            let result = loadMetaData({...validateAnnotation.metaData})
            setValidateAnnotation(
                {...validateAnnotation, runningError: result.error, warnings: result.warnings, metaData: null}
            )
        }
    }, [validateAnnotation])

    useEffect(() => {
        setShapeLabel()
    }, [labelSelected])

    useEffect(() => {
        if (reset) {
            handleReset()
            setReset(false)
        }
    }, [reset])

    useEffect(() => {
        setFormats([
            {'value': 'tjson', 'label': 'tika-json', 'parser': 'json'},
            {'value': 'txml', 'label': 'tika-xml', 'parser': 'xml'},
        ])
    }, []);

    useEffect(() => {
        if (file) {
            const img = new Image;
            img.onload = function () {
                setImageDim({width: img.width, height: img.height});
            };
            img.src = file;
        }
    }, [file])

    const handleRectMouseDown = (e, index) => {
        if (currentTool?.name !== 'point-create')
            selectRect(index)
    }
    const handlePointMouseDown = (e, index) => {
        if (currentTool?.name !== 'rect-create')
            selectPoint(index)
    }
    const getAnnotation = () => {
        return {
            "data_filename": fileName?.name,
            "data_type": dataType,
            "image_width": imageDim.width,
            "image_height": imageDim.height,
            "data_annotation": {
                "bounding_box": localData.rects.map(r => {
                    const rectAnnotation = r.type ? {type: r.type} : {}
                    rectAnnotation[
                        "classification_label"] = r.labels?.map(l => l.tags.join('::')) ?? [];
                    rectAnnotation["point_2D"] = [
                        `${r.x.toFixed(1)}, ${r.y.toFixed(1)}`,
                        `${(r.x + r.width).toFixed(1)}, ${(r.y + r.height).toFixed(1)}`,
                    ];
                    return rectAnnotation;
                }),
                "landmark": localData.points.map(r => {
                    const pointAnnotation = r.type ? {type: r.type} : {}
                    pointAnnotation["classification_label"] = r.labels?.map(l => l.tags.join('::')) ?? [];
                    pointAnnotation["point_2D"] = `${r.x.toFixed(1)}, ${r.y.toFixed(1)}`;
                    return pointAnnotation;
                })
            }
        }
    }
    const loadMetaData = (meta) => {
        let result = {error: null, warnings: []}
        if (meta.data_type !== dataType) {
            return {error: `Meta file must have the same data type. Expected: ${dataType} and got ${meta.data_type}`}
        }
        if (dataType === 'image' && (meta.image_width !== imageDim.width || meta.image_height !== imageDim.height)) {
            result['warnings'].push('Width or height of Meta file are different of current image')
        }
        if (!(meta.data_annotation && (
            (meta.data_annotation.bounding_box && meta.data_annotation.bounding_box.length > 0) || (meta.data_annotation.landmark && meta.data_annotation.landmark.length > 0))))
            return {error: `Meta file format error`}
        try {
            let rects = meta.data_annotation.bounding_box?.map(lm => {
                let points = (lm.point_2D.map ? lm.point_2D : [lm.point_2D]).map(p => {
                    return {
                        'x': parseFloat(p.split(',')[0]),
                        'y': parseFloat(p.split(',')[1])
                    }
                })
                return {
                    'type': lm.type ?? null,
                    'labels': (lm.classification_label.map ? lm.classification_label : [lm.classification_label]).map(cl => {
                        return {'tags': cl.split('::')}
                    }),
                    'x': Math.min(points[0].x, points[1].x),
                    'y': Math.min(points[0].y, points[1].y),
                    'width': Math.abs(points[0].x - points[1].x),
                    'height': Math.abs(points[0].y - points[1].y),
                }
            }) ?? []
            let points = meta.data_annotation.landmark?.map(lm => {
                return {
                    'type': lm.type ?? null,
                    'labels': (lm.classification_label.map ? lm.classification_label : [lm.classification_label]).map(cl => {
                        return {'tags': cl.split('::')}
                    }),
                    'x': parseFloat(lm.point_2D.split(',')[0]),
                    'y': parseFloat(lm.point_2D.split(',')[1])
                }
            }) ?? []
            setLocalData({
                ...localData,
                rects: [...(validateAnnotation.metaOptions?.overwrite ? [] : localData.rects), ...rects],
                points: [...(validateAnnotation.metaOptions?.overwrite ? [] : localData.points), ...points],
            })
        } catch (e) {
            console.error(e);
            return {error: `Meta file format error`}
        }
        return result
    }

    const deselectAll = () => {
        const index = -1
        setSelectedRectIndex(index);
        setSelectedPointIndex(index);
        setLocalData({
            ...localData,
            endPos: (!currentTool || currentTool?.name === 'shape-modify') && index >= 0 ? localData.rects[index] : localData.endPos,
            rects: localData.rects.map((r, i) => {
                return {...r, selected: i === index}
            }),
            points: localData.points.map((p, i) => {
                return {...p, selected: i === index}
            })
        });
        changeTool(null, true)
    }
    const selectRect = (index) => {
        index = index < localData.rects.length ? index : -1
        setSelectedRectIndex(index);
        setLocalData({
            ...localData,
            endPos: (!currentTool || currentTool?.name === 'shape-modify') && index >= 0 ? localData.rects[index] : localData.endPos,
            rects: localData.rects.map((r, i) => {
                return {...r, selected: i === index}
            })
        });
        if (localData.rects[index]?.type) {
            changeSelectedType(localData.rects[index]?.type)
        }
        if (index >= 0 && !currentTool)
            changeTool('shape-modify', true)
    }

    const selectPoint = (index, startPos) => {
        index = index < localData.points.length ? index : -1
        setSelectedPointIndex(index);
        setLocalData({
            ...localData,
            points: localData.points.map((p, i) => {
                return {...p, selected: i === index}
            }),
            startPos: startPos ?? localData.startPos
        });
        if (index >= 0 && !currentTool)
            changeTool('shape-modify', true)
    }

    const moveSelectedRect = (e) => {
        if (selectedRectIndex >= 0) {
            setLocalData({
                ...localData, rects: localData.rects.map((r, i) => {
                    return r.selected ? fixBounding({
                        ...r,
                        x: e.point.x - localData.startPos.x + localData.endPos.x,
                        y: e.point.y - localData.startPos.y + localData.endPos.y,
                    }) : r;
                })
            })
        }
    }

    const moveSelectedPoint = (e) => {
        if (selectedPointIndex >= 0) {
            setLocalData({
                ...localData, points: localData.points.map((p, i) => {
                    return p.selected ? fixPoint({...p, x: e.point.x, y: e.point.y,}) : p;
                })
            })
        }
    }


    const removeSelectedShape = (e) => {
        setLocalData({
            ...localData,
            rects: localData.rects.map(r => {
                return r.selected ? null : r;
            }).filter(r => r),
            points: localData.points.map(p => {
                return p.selected ? null : p;
            }).filter(p => p)
        })
    }

    const fixBounding = (rect, select = true) => {
        let diffX = Math.min(rect.x, 0) + Math.max((rect.x + rect.width - imageDim.width - 1), 0)
        let diffY = Math.min(rect.y, 0) + Math.max((rect.y + rect.height - imageDim.height - 1), 0)
        return {
            ...rect,
            x: rect.x - diffX,
            y: rect.y - diffY,
            selected: select
        }
    }

    const getAllLabels = (shapes) => {
        return [].concat.apply([], shapes?.map(r => r.labels ?? []));
    }
    const containsLabel = (labels, label) => {
        return labels && label && labels.some(l => l.type === label.type && l.tags.length === label.tags.length && l.tags.every((e, i) => e === label.tags[i]))
    }
    const setShapeLabel = () => {
        const {fullPath, label, format} = labelSelected
        const fullLabel = {type: selectedType?.name, tags: [...fullPath ?? [], label]}
        const resultLabels = (rect) => {
            const allLabels = getAllLabels([...localData.rects, ...localData.points])
            if (labelExclusivity && containsLabel(allLabels, fullLabel))
                return rect.labels
            if (labelAssignment) {
                return containsLabel(rect.labels, fullLabel) ? rect.labels : [...rect.labels ?? [], fullLabel]
            }
            return [fullLabel]
        }
        const rects = localData.rects.map(r => {
            return r.selected ? {...r, labels: resultLabels(r), type: r.type ?? selectedType?.name, ...format} : r;
        }).filter(r => r)
        const points = localData.points.map(p => {
            return p.selected ? {...p, labels: resultLabels(p), type: p.type ?? selectedType?.name, ...format} : p;
        }).filter(p => p)
        setLocalData({...localData, rects: rects, points: points})
    }

    const renderTempRect = () => {
        return currentTool?.name === 'rect-create' && localData.creating && (Math.abs(localData.startPos.x - localData.endPos.x) > 1 || Math.abs(localData.startPos.y - localData.endPos.y) > 1)
    };
    const getTempRect = (selected = false, creating = false) => {
        return {
            x: Math.min(localData.startPos.x, localData.endPos.x),
            y: Math.min(localData.startPos.y, localData.endPos.y),
            width: Math.abs(localData.startPos.x - localData.endPos.x),
            height: Math.abs(localData.startPos.y - localData.endPos.y),
            selected: selected,
            creating: creating,
        };
    }
    const resizeCircles = [
        {c: 'nw', sx: 0, sy: 0}, {c: 'n', sx: 0.5, sy: 0}, {c: 'ne', sx: 1, sy: 0}, {c: 'e', sx: 1, sy: 0.5},
        {c: 'se', sx: 1, sy: 1}, {c: 's', sx: 0.5, sy: 1}, {c: 'sw', sx: 0, sy: 1}, {c: 'w', sx: 0, sy: 0.5},
    ]
    const changeTool = (tool, select) => {
        switch (tool) {
            case 'rect-create':
            case 'point-create':
                deselectAll();
                setCurrentTool(currentTool?.name === tool && !select ? null : {name: tool, cursor: 'crosshair'})
                break;
            case 'shape-modify':
                if (!select) {
                    deselectAll()
                }
                setCurrentTool(currentTool?.name === tool && !select ? null : {name: tool, cursor: 'default'})
                break;
            case 'shape-remove':
                removeSelectedShape()
                setCurrentTool(null)
                break;
            default:
                setCurrentTool(null)
        }
    }
    const toggleResize = (e, kind) => {
        switch (e.type) {
            case "mousedown":
                if (e.buttons === 1)
                    setLocalData({
                        ...localData,
                        resizeActive: true,
                        resizeKind: kind,
                    })
                break;
        }
    }
    const handleContextMenu = (e, shape) => {
        if (shape.type && shape.type !== selectedType?.name) {
            changeSelectedType(shape.type)
        }
        displayMenu(e)
    }
    const getColor = (p) => {
        if ("labels" in p) {
            return {
                boxColor: p.selected || p.creating ? "rgb(0,158,15)" : (p.boxColor ?? "black"),
                textColor: p.selected || p.creating ? "red" : (p.textColor ?? "yellow"),
                pointColor: p.selected || p.creating ? "red" : "black",
            }
        }
        else {
            return {
                boxColor: "orange",
                textColor: "yellow",
                pointColor: "red",
            }
        }
    }
    const getSVG = () => {
        function getRect(r, index) {
            return <React.Fragment>
                {r.labels &&
                <text x={r.x} y={r.y - unit(8)}
                      fill={getColor(r).textColor}
                      style={{
                          fontSize: `${unit(18)}px`,
                          textShadow: "rgb(70, 70, 70) 1px 1px, rgb(70, 70, 70) -1px 1px, rgb(70, 70, 70) 1px -1px, rgb(70, 70, 70) -1px -1px"
                      }}
                >{r.type && <React.Fragment>
                    <tspan style={{textDecoration: "underline"}}>{r.type}</tspan>
                    <tspan>:</tspan>
                </React.Fragment>}
                    <tspan>{r.labels.map(l => l.tags.join("::")).join(':')}</tspan>
                </text>}
                <rect key={`s-rect-${index}`} onContextMenu={(e) => handleContextMenu(e, r)}
                      onMouseDown={(e) => handleRectMouseDown(e, index)}
                      x={r.x} y={r.y} width={r.width} height={r.height}
                      stroke={getColor(r).boxColor} fill="transparent" strokeWidth={unit(2)}/>
            </React.Fragment>;
        }

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
                <circle key={`s-point-${index}`} onContextMenu={(e) => handleContextMenu(e, p)}
                        onMouseDown={(e) => handlePointMouseDown(e, index)}
                        cx={p.x} cy={p.y} r={unit(POINT_RATIO)} fill={getColor(p).pointColor} stroke={"gray"}
                        strokeWidth={unit(1)}
                />
            </React.Fragment>;
        }

        return <React.Fragment>
            {[...localData.rects, renderTempRect() ? getTempRect(true) : null].filter(r => r).map((r, index) =>
                (!r.selected && <React.Fragment>
                    {getRect(r, index)}
                </React.Fragment>)
            )}
            {localData.points.map((p, index) => (!p.selected && getPoint(p, index)))}
            {[...localData.rects, renderTempRect() ? getTempRect(false, true) : null].filter(r => r).map((r, index) =>
                ((r.selected || r.creating) && <React.Fragment>
                    {getRect(r, index)}
                    {resizeCircles.map(rc =>
                        <circle key={`c-${rc.c}-${index}`} cx={r.x + rc.sx * r.width} cy={r.y + rc.sy * r.height}
                                r={unit(5)} fill={getColor(r).pointColor} cursor={`${rc.c}-resize`}
                                onMouseDown={(e) => toggleResize(e, rc.c)}
                                onMouseUp={(e) => rectResize(e, rc.c)}
                        />
                    )}
                </React.Fragment>)
            )}
            {localData.points.map((p, index) => (p.selected && getPoint(p, index)))}
        </React.Fragment>
    }

    const handleChange = (tagsLabels) => {
        const rects = localData.rects.map(r => {
            return r.selected ? {...r, labels: r.labels.filter(l => tagsLabels.includes(l.tags.join(':')))} : r;
        }).filter(r => r)
        const points = localData.points.map(p => {
            return p.selected ? {...p, labels: p.labels.filter(l => tagsLabels.includes(l.tags.join(':')))} : p;
        }).filter(r => r)
        setLocalData({...localData, rects: rects, points: points})
    }

    function disabled() {
        return false;
    }

    const getTagsValue = () => {
        if (selectedRectIndex >= 0 && selectedRectIndex < localData.rects.length)
            return localData.rects[selectedRectIndex].labels?.map(l => l.tags.join(':')) ?? []
        if (selectedPointIndex >= 0 && selectedPointIndex < localData.points.length)
            return localData.points[selectedPointIndex].labels?.map(l => l.tags.join(':')) ?? []
        return []
    }
    return <React.Fragment>
        <ModuleRow className={'toolbar flex-column'}>
            <label className={'full-width'} htmlFor={'tool-tag-input'}><b>Current Labels</b></label>
            <TagsInput onlyUnique={true} id={'tool-tag-input'}
                       value={getTagsValue()}
                       onChange={handleChange} disabled={disabled()} inputProps={{
                className: 'react-tagsinput-input',
                placeholder: ''
            }}/>
        </ModuleRow>
        <ModuleRow className={'toolbar'}>
            <ToolButton name={'rect-create'} title={"create"} toolName={currentTool?.name} changeTool={changeTool}
                        style={{width: '3.8rem'}}>
                <FaRegSquare style={{transform: 'scale(2, 1)'}}/>
            </ToolButton>
            <ToolButton name={'point-create'} title={"create"} toolName={currentTool?.name} changeTool={changeTool}>
                <FaCircle color={'black'}/>
            </ToolButton>
            <ToolButton name={'shape-modify'} title={"modify"} toolName={currentTool?.name} changeTool={changeTool}>
                <FaCircle color={'green'}/>
            </ToolButton>
            <ToolButton name={'shape-remove'} title={"remove"} toolName={currentTool?.name} changeTool={changeTool}>
                <FaCircle color={'red'}/>
            </ToolButton>
        </ModuleRow>
    </React.Fragment>
}

export default BBoxLandmarkModule