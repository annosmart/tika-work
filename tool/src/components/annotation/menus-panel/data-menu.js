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

import React, {useEffect} from "react";
import {
    FaAlignCenter,
    FaAlignJustify,
    FaAlignLeft,
    FaAlignRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaCircle,
    FaMinus,
    FaPauseCircle,
    FaPlayCircle,
    FaPlus,
    FaRegPlayCircle,
    FaRegTimesCircle,
    FaSearchMinus,
    FaSearchPlus
} from "react-icons/fa";
import {MenuButton, MenuRow} from "../annotation-tool.styled";
import Toggle from "react-toggle";
import {DataTypes} from "../../enums";

const DEFAULT_FONT_SIZE = 14

function DataMenu({file, dataType, options, setOptions, mouseEvent}) {
    useEffect(() => {
        changeFontSize(0)
    }, [])
    useEffect(() => {
        zoomReset()
    }, [file])
    useEffect(() => {
        if (options._zoomReset) {
            setOptions({...options, _zoomReset: false})
        }
    }, [options._zoomReset])

    useEffect(() => {
        if (mouseEvent.type === "wheel") {
            if (mouseEvent.e.deltaY < 0) {
                zoomIn()
            }
            if (mouseEvent.e.deltaY > 0) {
                zoomOut()
            }
        }
    }, [mouseEvent])


    const changeZoom = (factor, reset = false) => {
        if (!options._hideZoom)
            setOptions({...options, _zoom: Math.max(1, options._zoom * factor), _zoomReset: reset});
    }
    const zoomIn = () => {
        changeZoom(1.25)
    }
    const zoomOut = () => {
        changeZoom(0.8)
    }
    const zoomReset = () => {
        changeZoom(0, true)
    }
    const playPause = () => {
        setOptions({...options, _playpause: !options._playpause});
    }
    const regionPlayLoop = () => {
        setOptions({...options, _regionPlayLoop: !options._regionPlayLoop});
    }
    const clearRegion = () => {
        setOptions({...options, _clearRegion: !options._clearRegion});
    }
    const seek = (back = false) => {
        setOptions({...options, _seek: !options._seek, _seekBack: back});
    }
    const changeFontSize = (diff) => {
        setOptions({
            ...options,
            _text: {
                ...options._text ?? {},
                fontSize: Math.max(6, (options._text?.fontSize ?? DEFAULT_FONT_SIZE) + diff)
            }
        });
    }
    const fontSizePlus = () => {
        changeFontSize(2)
    }
    const fontSizeMinus = () => {
        changeFontSize(-2)
    }
    const handleTextBold = (e) => {
        e.preventDefault();
        setOptions({...options, _text: {...options._text ?? {}, bold: !options._text?.bold}});
    }
    const handleTextWordWrap = (e) => {
        e.preventDefault();
        setOptions({...options, _text: {...options._text ?? {}, wordWrap: !options._text?.wordWrap}});
    }
    const textAlign = (align) => {
        setOptions({...options, _text: {...options._text ?? {}, textAlign: align}});
    }

    // tool menus by data type
    return <React.Fragment>
        {dataType === DataTypes.Image &&
        <MenuRow className={'toolbar'}>
            <MenuButton className={'icon'} onClick={zoomOut} title={"zoom out"}><FaSearchMinus/></MenuButton>
            <MenuButton className={'icon'} onClick={zoomIn} title={"zoom in"}><FaSearchPlus/></MenuButton>
            <MenuButton className={'icon'} onClick={zoomReset} title={"zoom reset"}><FaCircle/></MenuButton>
        </MenuRow>}
        {dataType === DataTypes.Text && <React.Fragment>
            {!options._hideFontSize && <MenuRow className={'toolbar small middle'}>
                <MenuButton className={'icon'} onClick={fontSizePlus} title={"font size plus"}><FaPlus/></MenuButton>
                <label><b>{options._text?.fontSize ?? DEFAULT_FONT_SIZE}</b></label>
                <MenuButton className={'icon'} onClick={fontSizeMinus} title={"font size minus"}><FaMinus/></MenuButton>
            </MenuRow>}
            {!options._hideFontFormat && <React.Fragment>
                <MenuRow className={"toolbar"}>
                    <label className={"toggle-label"}>
                        <span className={"left"}>Bold</span>
                        <Toggle
                            className='black-toggle'
                            checked={options._text?.bold}
                            aria-labelledby='Text Bold'
                            onChange={handleTextBold}
                        />
                    </label>
                </MenuRow>
                <MenuRow className={"toolbar"}>
                    <label className={"toggle-label"}>
                        <span className={"left"}>Word Wrap</span>
                        <Toggle
                            className='black-toggle'
                            checked={options._text?.wordWrap}
                            aria-labelledby='Word Wrap'
                            onChange={handleTextWordWrap}
                        />
                    </label>
                </MenuRow>
            </React.Fragment>}
            {!options._hideTextAlign && <MenuRow className={'toolbar small'}>
                <MenuButton className={`icon ${options._text?.textAlign === 'left' ? 'active' : ''}`}
                            onClick={() => textAlign('left')} title={"align left"}><FaAlignLeft/></MenuButton>
                <MenuButton className={`icon ${options._text?.textAlign === 'center' ? 'active' : ''}`}
                            onClick={() => textAlign('center')} title={"align center"}><FaAlignCenter/></MenuButton>
                <MenuButton className={`icon ${options._text?.textAlign === 'right' ? 'active' : ''}`}
                            onClick={() => textAlign('right')} title={"align right"}><FaAlignRight/></MenuButton>
                <MenuButton className={`icon ${options._text?.textAlign === 'justify' ? 'active' : ''}`}
                            onClick={() => textAlign('justify')} title={"align justify"}><FaAlignJustify/></MenuButton>
            </MenuRow>}
        </React.Fragment>
        }
        {(dataType === DataTypes.Audio || dataType === DataTypes.Video) && options._waveViewer &&
        <MenuRow className={'toolbar'}>
            {!options._hideZoom &&
            <MenuButton className={'icon'} onClick={zoomOut} title={"zoom out"}><FaSearchMinus/></MenuButton>}
            {!options._hideZoom &&
            <MenuButton className={'icon'} onClick={zoomIn} title={"zoom in"}><FaSearchPlus/></MenuButton>}
            {!options._hideZoom &&
            <MenuButton className={'icon'} onClick={zoomReset} title={"zoom reset"}><FaCircle/></MenuButton>}
            <MenuButton className={'icon'} onClick={playPause}
                        title={"play/pause"}><FaPlayCircle/><FaPauseCircle/></MenuButton>
            {!options._hideZoom &&
            <MenuButton className={'icon'} onClick={regionPlayLoop}
                        title={"play region"}><FaRegPlayCircle/></MenuButton>}
            {!options._hideZoom &&
            <MenuButton className={'icon'} onClick={clearRegion} title={"discard"}><FaRegTimesCircle/></MenuButton>}
            {!options._hideSeek &&
            <MenuButton className={'icon'} onClick={() => seek(true)}
                        title={"seek forward"}><FaAngleDoubleLeft/></MenuButton>}
            {!options._hideSeek &&
            <MenuButton className={'icon'} onClick={() => seek(false)}
                        title={"seek backward"}><FaAngleDoubleRight/></MenuButton>}
        </MenuRow>}
    </React.Fragment>
}

export default DataMenu