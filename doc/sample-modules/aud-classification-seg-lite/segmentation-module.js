import React, {useCallback, useEffect, useState,} from "react";
import {Region} from "wavesurfer-react";
import ReactTooltip from "react-tooltip";
import {InfoTable} from "./segmentation-module.styled";
import {FaTrash} from "react-icons/fa";
import {generateNum} from "../../utils";
import {ModuleRow} from "../aud-classification/classification-module.styled";
import TagsInput from "react-tagsinput";

function ClassificationSegmentationModule({
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
                                              options, setOptions,
                                              fileName
                                          }) {

    const [localData, setLocalData] = useState({
        annotations: [],
        selectedRegion: null,
        timelineVis: true,
        selectedRegionColor: `rgba(255, 0, 0, 0.8)`,
        labels: [],
    })
    const [colorsKeys, setColorsKeys] = useState([])
    const [colors, setColors] = useState([])

    const handleReset = () => {
        setLocalData({
            annotations: [],
            selectedRegion: null,
            timelineVis: true,
            selectedRegionColor: `rgba(255, 0, 0, 0.8)`,
            labels: [],
        })
        setColorsKeys([])
        setColors([])
    }

    useEffect(() => {
        setOptions({
            ...options,
            _allowRegions: true,
            _allowTimeLine: localData.timelineVis,
            _hideSeek: true,
            _waveViewer: true
        });
        setFormats([
            {'value': 'tjson', 'label': 'tika-json', 'parser': 'json'},
            {'value': 'txml', 'label': 'tika-xml', 'parser': 'xml'},
        ]);
    }, []);


    useEffect(() => {
        if (localData.selectedRegion && typeof localData.selectedRegion?.playLoop === 'function') {
            localData.selectedRegion.playLoop(undefined);
        }
    }, [options._regionPlayLoop])

    useEffect(() => {
        clearSelection()
    }, [options._clearRegion])

    useEffect(() => {
        let region = mouseEvent.region
        switch (mouseEvent.type) {
            case "regionCreated":
                region.color = localData.selectedRegionColor
                region.formatTime = () => ''
                setLocalData({
                    ...localData,
                    selectedRegion: region,
                    annotations: localData.annotations.map(a => {
                        return a.region.element ? a : {
                            ...a, region: mouseEvent.regions[a.region.id] ?? a.region
                        }
                    })
                })
                break;
            case "regionContextMenu":
                selectRegion(region)
                displayMenu(mouseEvent.e)
                break;
            case "contextmenu":
                selectRegion(null)
                displayMenu(mouseEvent.e)
                break;
        }
    }, [mouseEvent]);

    useEffect(() => {
        setToolData({regions: getRegionNodes(), info: getRegionInfo()})
    }, [localData])

    useEffect(() => {
        setUsedLabels(getAllLabels(localData.annotations))
        const valid = localData.annotations?.length > 0 && localData.annotations.every(p => p.labels?.length > 0)
        let currentAnnotation = getAnnotation();
        setValidateAnnotation({
            valid: valid,
            error: valid ? null : "It's necessary to complete all the labels",
            'tjson': currentAnnotation,
            'txml': currentAnnotation,
        })
    }, [localData.annotations])

    useEffect(() => {
        if (validateAnnotation.metaData) {
            let result = loadMetaData({...validateAnnotation.metaData})
            setValidateAnnotation(
                {...validateAnnotation, runningError: result.error, warnings: result.warnings, metaData: null}
            )
        }
    }, [validateAnnotation])

    useEffect(() => {
        if (labelSelected.label) {
            if (localData.selectedRegion) {
                setRegionLabel()
            } else {
                setLabel()
            }
        }
    }, [labelSelected])

    useEffect(() => {
        if (reset) {
            handleReset()
            setReset(false)
        }
    }, [reset])
    const selectRegion = (region) => {
        setLocalData({...localData, selectedRegion: region})
    }
    const clearSelection = () => {
        selectRegion(null);
    }
    const getAnnotation = () => {
        return {
            "data_filename": fileName?.name,
            "data_type": dataType,
            "data_annotation": {
                "classification_label": localData.labels?.map(l => l.tags.join('::')) ?? [],
                "audio_segmentation": localData.annotations.map(a => {
                    const annotation = a.type ? {type: a.type} : {};
                    annotation['startPos'] = a.startPos;
                    annotation['stopPos'] = a.stopPos;
                    annotation["label"] = a.labels?.map(l => l.tags.join('::')) ?? [];
                    return annotation;
                }),
            }
        }
    }

    function onlyUniqueAnnotation(value, index, self) {
        return self.findIndex(a => a.region.id === value.region.id) === index;
    }

    const loadMetaData = (meta) => {
        let result = {error: null, warnings: []}
        if (!fileName) {
            return {error: `Please, upload the ${dataType} file first`}
        }
        if (meta.data_type !== dataType) {
            return {error: `Meta file must have the same data type. Expected: ${dataType} and got ${meta.data_type}`}
        }
        if (!(meta.data_annotation && ((
            meta.data_annotation.audio_segmentation && meta.data_annotation.audio_segmentation.length > 0) || (
            meta.data_annotation.classification_label && meta.data_annotation.classification_label.length > 0))))
            return {error: `Meta file format error`}
        try {
            let annotations = meta.data_annotation.audio_segmentation?.map((ad, index) => {
                let labels = (ad.label.map ? ad.label : [ad.label]).map(l => {
                    return {'tags': l.split('::')}
                })
                return {
                    'type': ad.type ?? null,
                    'region': {id: `wavesurfer_${index}`, start: parseFloat(ad.startPos), end: parseFloat(ad.stopPos)},
                    'startPos': parseFloat(ad.startPos),
                    'stopPos': parseFloat(ad.stopPos),
                    'labels': labels,
                }
            }) ?? []
            updateColors(annotations.map(a => a.labels[0]))
            let l = meta.data_annotation.classification_label;
            let labels = l ? (l.map ? l : [l]).map(cl => {
                return {'tags': cl.split('::')}
            }) : []
            setLocalData({
                ...localData,
                annotations: [...(validateAnnotation.metaOptions?.overwrite ? [] : localData.annotations), ...annotations].filter(onlyUniqueAnnotation),
                labels: [...(validateAnnotation.metaOptions?.overwrite ? [] : localData.labels), ...labels],
            })
        } catch (e) {
            console.error(e);
            return {error: `Meta file format error`}
        }

        return result
    }

    const updateColors = (labels) => {
        function onlyUniqueLabels(value, index, self) {
            return self.indexOf(value) === index && !containsLabel(colorsKeys, value);
        }

        let newColors = labels.filter(onlyUniqueLabels).map(label => {
            return {label: label, color: {r: generateNum(2, 250), g: generateNum(2, 250), b: generateNum(2, 250)}}
        })
        setColorsKeys([...colorsKeys, ...newColors.map(nc => nc.label)])
        setColors([...colors, ...newColors.map(nc => nc.color)])
    }
    const getAllLabels = (annotations) => {
        return [].concat.apply([], annotations?.map(r => r.labels ?? []));
    }
    const indexOfLabel = (labels, label) => {
        return labels && label ? labels.findIndex(l => l.type === label.type && l.tags.length === label.tags.length && l.tags.every((e, i) => e === label.tags[i])) : -1;
    }
    const containsLabel = (labels, label) => {
        return labels && label && labels.some(l => l.type === label.type && l.tags.length === label.tags.length && l.tags.every((e, i) => e === label.tags[i]))
    }
    const setRegionLabel = () => {
        const {fullPath, label, format} = labelSelected
        const fullLabel = {type: selectedType?.name, tags: [...fullPath ?? [], label]}
        const resultLabels = (sa) => {
            const allLabels = getAllLabels(localData.annotations)
            if (labelExclusivity && containsLabel(allLabels, fullLabel))
                return sa.labels
            if (labelAssignment) {
                return containsLabel(sa.labels, fullLabel) ? sa.labels : [...sa.labels ?? [], fullLabel]
            }
            return [fullLabel]
        }
        let selectedAnnotation = getAnnotationFrom(localData.selectedRegion) ?? addAnnotation();
        selectedAnnotation.labels = resultLabels(selectedAnnotation)
        if (!labelAssignment)
            updateColors([selectedAnnotation.labels[0]])
        updateAnnotationList(selectedAnnotation)
    }

    const setLabel = () => {
        const {fullPath, label, format} = labelSelected
        if (!label)
            return;
        const fullLabel = {tags: [...fullPath ?? [], label]}
        const resultLabels = () => {
            if (labelAssignment) {
                return localData.labels.map(l => l.tags.join("::")).includes(fullLabel.tags.join("::")) ? localData.labels : [...localData.labels, fullLabel]
            }
            return [fullLabel]
        }
        setLocalData({...localData, labels: resultLabels()})
    }

    const getColor = (annotation) => {
        let color = labelAssignment ? {
            r: 50,
            g: 50,
            b: 250
        } : colors[indexOfLabel(colorsKeys, annotation.labels && annotation.labels.length > 0 ? annotation.labels[0] : null)]
        color = color ?? {r: 50, g: 50, b: 50}
        return localData.selectedRegion?.id === annotation.region.id ? localData.selectedRegionColor : `rgba(${color.r},${color.g},${color.b},0.5)`
    }

    const getRegions = useCallback(() => {
        return [...localData.annotations.map(a => {
            a.region['color'] = getColor(a);
            return a.region
        }), localData.annotations.some(a => a.region.id === localData.selectedRegion?.id) ? null : localData.selectedRegion].filter(r => Boolean(r))
    }, [localData.annotations, localData.selectedRegion])

    const getAnnotationFrom = (region) => {
        return localData.annotations.find(a => a.region.id === region?.id);
    }
    const addAnnotation = () => {
        let newAnnotation = {region: localData.selectedRegion}
        updateAnnotationPos(newAnnotation);
        return newAnnotation;
    }
    const updateAnnotationPos = (annotation) => {
        annotation.startPos = annotation.region.start.toFixed(4)
        annotation.stopPos = annotation.region.end.toFixed(4)
    }
    const updateAnnotationList = (annotation, remove = false, select = false, drop = false) => {
        let oldAnnotations = localData.annotations.filter(a => a.region.id !== annotation.region.id)
        setLocalData({
            ...localData,
            annotations: [...oldAnnotations, remove ? null : annotation].filter(a => Boolean(a)).sort((a, b) => a.startPos - b.startPos),
            selectedRegion: select ? annotation.region : (drop ? null : localData.selectedRegion),
        })
    }

    const handleRegionUpdateEnd = useCallback((region) => {
        let annotation = getAnnotationFrom(region);
        if (annotation) {
            updateAnnotationPos(annotation)
            updateAnnotationList(annotation, false, true)
        }
    }, [localData.annotations]);

    const handleRegionLeave = useCallback((region) => {
        ReactTooltip.hide()
    }, [localData.annotations, localData.selectedRegion]);

    const handleRegionUpdate = useCallback((region) => {
        handleRegionLeave(region);
    }, [localData.annotations]);

    const deleteRegion = (region = null) => {
        let selectedAnnotation = getAnnotationFrom(region ?? localData.selectedRegion)
        if (selectedAnnotation) {
            updateAnnotationList(selectedAnnotation, true, false, true)
        }
    }
    const getRegionNodes = () => {
        return <React.Fragment>
            {getRegions().map(region => (
                <Region
                    onUpdate={handleRegionUpdate}
                    onUpdateEnd={handleRegionUpdateEnd}
                    onClick={(e) => selectRegion(region)}
                    key={region.id}
                    {...region}
                />
            ))}
        </React.Fragment>
    }

    const getRegionInfo = () => {
        return <React.Fragment>
            <InfoTable>
                <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Time-Stamps</th>
                    <th scope="col">Label</th>
                    <th scope="col">Delete</th>
                </tr>
                </thead>
                <tbody>
                {localData.annotations.map((row, index) => {
                    return <tr>
                        <th scope="row">{index + 1}</th>
                        <td>{row['startPos']}--{row['stopPos']}</td>
                        <td>{row.labels.map(l => l.tags.join("::")).join(':')}</td>
                        <td style={{textAlign: "center"}}><FaTrash onClick={() => deleteRegion(row.region)}/></td>
                    </tr>
                })
                }
                </tbody>
            </InfoTable>
            <ReactTooltip id='region-tip'
                          getContent={(regionId) => {
                              let region = getRegions().find(r => r.id === regionId);
                              let annotation = getAnnotation(region);
                              const renderAnnotation = (a) => {
                                  return a ? [<p>{a.level1}</p>, <p>{a.level2}</p>, <p>{a.review}</p>] : null;
                              }
                              return region ? <div className={'region-tooltip'}>
                                  <p>{region.start.toFixed(4)}--{region.end.toFixed(4)}</p>
                                  {renderAnnotation(annotation)}
                              </div> : null;
                          }
                          }
                          effect='solid'
                          delayUpdate={500}
                          border={true}
                          type={'light'}
                          place={'bottom'}
                          overridePosition={(position, currentEvent, currentTarget, refNode, place, desiredPlace, effect, offset) => {
                              let rect = document.querySelectorAll(`[data-id="${currentTarget.dataset.tip}"]`)[0]?.getBoundingClientRect();
                              let w = refNode.getBoundingClientRect().width;
                              return rect ? {left: rect.left + (rect.width - w) / 2, top: position.top} : position;
                          }
                          }
            />
        </React.Fragment>
    }
    const handleChange = (tags, changed, changedIndexes) => {
        setLocalData({
            ...localData,
            labels: localData.labels.map((l, i) => changedIndexes.includes(i) ? null : l).filter(l => l)
        })
    }

    function disabled() {
        return false;
    }

    return <React.Fragment>
        <ModuleRow className={'toolbar flex-column'}>
            <label className={'full-width'} htmlFor={'tool-tag-input'}><b>Current Labels</b></label>
            <TagsInput onlyUnique={true} id={'tool-tag-input'}
                       value={localData.labels?.map(l => l.tags.join(':')) ?? []}
                       onChange={handleChange} disabled={disabled()} inputProps={{
                className: 'react-tagsinput-input',
                placeholder: ''
            }}/>
        </ModuleRow>
    </React.Fragment>

}

export default ClassificationSegmentationModule