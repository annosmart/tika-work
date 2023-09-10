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

import React, {useRef,} from "react";
import {TextContent, TextViewContainer} from "../data-view.styled";

import "react-contexify/dist/ReactContexify.css";


function TextView({text, options, toolName, setMouseEvent, toolData, dimensions}) {
    const containerRef = useRef();
    const margin = 50

    const handleMouseEvent = (e) => {
        if (e.type === "contextmenu") {
            e.preventDefault();
            e.stopPropagation();
        }
        if (e.type === "mouseup") {
            let selection = window.getSelection() ?? document.getSelection();
            if (selection) {
                setMouseEvent({type: "textselected", e: e, selection: selection})
                return;
            }
        }
        setMouseEvent({type: e.type, buttons: e.buttons, e: e})
    }

    const preventDragHandler = (e) => {
        e.preventDefault();
    }

    const getViewDim = () => {
        return {
            width: (dimensions?.screen.width ?? 0) - (dimensions?.leftPanel.width ?? 0),
            height: dimensions?.screen.height ?? 0
        }
    }

    return <React.Fragment>
        <TextViewContainer ref={containerRef} draggable={false} margin={margin} dim={getViewDim()}>
            {(toolData?.html ?? text) &&
            <TextContent options={options._text ?? {}}
                         onMouseDown={handleMouseEvent} onMouseMove={handleMouseEvent}
                         onMouseUp={handleMouseEvent} onDragStart={preventDragHandler}
                         onContextMenu={handleMouseEvent}
            >{toolData?.html ?? text}</TextContent>}
            {/* insert html if main module has it otherwise plain text */}
        </TextViewContainer>
    </React.Fragment>
}

export default TextView