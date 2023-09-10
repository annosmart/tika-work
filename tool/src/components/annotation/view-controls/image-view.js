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

import React, {useCallback, useEffect, useRef, useState,} from "react";
import {ImageViewContainer} from "../data-view.styled";

import "react-contexify/dist/ReactContexify.css";


function ImageView({image, options, toolName, setMouseEvent, toolData, dimensions}) {
    const [containerDim, setContainerDim] = useState({inner: {width: 0, height: 0}, outer: {width: 0, height: 0},});
    const [ratio, setRatio] = useState(1);
    const [pos, setPos] = useState({x: 0, y: 0, zoom: 1});
    const [imageDim, setImageDim] = useState({width: 0, height: 0});
    const [mouse, setMouse] = useState({startPosX: 0, startPosY: 0, startX: 0, startY: 0, currentX: 0, currentY: 0});
    const [zoomPoint, setZoomPoint] = useState();
    const containerRef = useRef();
    const margin = 30

    const getContainerDimensions = () => {
        let outerWidth = containerRef.current?.clientWidth - margin * 2 ?? 0;
        let outerHeight = containerRef.current?.clientHeight - margin * 2 ?? 0;
        let outerRatio = outerHeight / outerWidth;
        // compare image vs view component ratio to fit image on view
        let innerDim = ratio < outerRatio ? {
            width: outerWidth,
            height: outerWidth * ratio
        } : {width: outerHeight / ratio, height: outerHeight}
        return {
            inner: innerDim,
            outer: {width: outerWidth, height: outerHeight},
        }
    }

    // reset image position when change
    useEffect(() => {
        let contDim = getContainerDimensions()
        setContainerDim(contDim)
        setPos(checkBoundary({x: 0, y: 0}, contDim, 1))
    }, [image, ratio])

    useEffect(() => {
        setPos(checkBoundary(pos))
    }, [containerDim, dimensions])

    useEffect(() => {
        let newPos = pos
        // recalculate position when zoom is by wheel
        if (zoomPoint) {
            newPos = zoomPosition(zoomPoint, options._zoom)
            setZoomPoint(null)
        }
        // recalculate position is zoom was reset
        if (options._zoomReset) {
            let contDim = getContainerDimensions()
            setPos(checkBoundary({x: 0, y: 0}, contDim, 1))
        } else {
            setPos(checkBoundary(newPos, null, options._zoom))
        }
    }, [options._zoom, options._zoomReset])

    useEffect(() => {
        if (image) {
            const img = new Image;
            img.onload = function () {
                const r = img.height / img.width;
                setRatio(r);
                setImageDim({width: img.width, height: img.height});
            };
            img.src = image;
        }
    }, [image])

    useEffect(() => {
        setMouseEvent({type: "scalechange", scale: imageDim.width / containerDim.inner.width})
    }, [imageDim.width, containerDim.inner])

    // check boundary for a point in the view
    const checkBoundary = (p, contDim, zoom) => {
        zoom = zoom ?? options._zoom
        p = contDim ? {
            x: (contDim.outer.width - contDim.inner.width) / 2,
            y: (contDim.outer.height - contDim.inner.height) / 2,
        } : p
        contDim = contDim ?? containerDim
        return {
            x: Math.min(Math.max(-1 * zoom * contDim.inner.width, p.x), contDim.outer.width),
            y: Math.min(Math.max(-1 * zoom * contDim.inner.height, p.y), contDim.outer.height),
            zoom: zoom,
        }
    }
    // calculate offset of event coords from view area
    const eventOffset = useCallback((e) => {
        const currentTargetRect = e.currentTarget.getBoundingClientRect();
        return {x: e.clientX - currentTargetRect.left, y: e.clientY - currentTargetRect.top}
    }, [pos, imageDim, containerDim])

    const getImgScale = () => {
        return imageDim.width / containerDim.inner.width;
    }

    // calculate relative point of event coords
    const relativePoint = useCallback((e, scale) => {
        const offset = eventOffset(e);
        scale = scale ?? getImgScale();
        return {x: (offset.x - pos.x) * scale / pos.zoom, y: (offset.y - pos.y) * scale / pos.zoom};
    }, [pos, imageDim, containerDim]);

    const zoomPosition = useCallback(({point, offset}, zoom) => {
        const scale = imageDim.width / containerDim.inner.width;
        return {x: offset.x - (point.x * zoom / scale), y: offset.y - (point.y * zoom / scale)};
    }, [pos.zoom, imageDim, containerDim]);

    const screenScroll = (e) => {
        return {x: e.screenX + e.pageX - e.clientX, y: e.screenY + e.pageY - e.clientY}
    }
    const handleMouseEvent = (e) => {
        e.preventDefault();
        if (e.type === 'mousedown' && e.buttons === 1) {
            setMouse({
                ...mouse,
                startPosX: pos.x,
                startPosY: pos.y,
                startX: screenScroll(e).x,
                startY: screenScroll(e).y
            })
        }
        if (e.type === 'mousemove' && e.buttons === 1) {
            setMouse({...mouse, currentX: screenScroll(e).x, currentY: screenScroll(e).y})
            if (!toolName) {
                setPos(checkBoundary({
                    x: mouse.startPosX + screenScroll(e).x - mouse.startX,
                    y: mouse.startPosY + screenScroll(e).y - mouse.startY
                }))
            }
        }
        if (e.type === 'wheel') {
            if (e.deltaY !== 0) {
                let offset = eventOffset(e)
                let scale = getImgScale()
                let point = relativePoint(e, scale)
                setZoomPoint({point: point, offset: offset})
            }
        }
        setMouseEvent({type: e.type, buttons: e.buttons, point: relativePoint(e), e: e})
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
        <ImageViewContainer ref={containerRef} draggable={false} margin={margin} dim={getViewDim()}>
            {image &&
            <svg width={containerDim.outer.width} height={containerDim.outer.height} xmlns="http://www.w3.org/2000/svg"
                 className={`tool-${toolName ?? "default"} ${pos.zoom > 1 ? "zoomed" : ""}`}
                 onMouseDown={handleMouseEvent} onMouseMove={handleMouseEvent}
                 onMouseUp={handleMouseEvent}
                 onMouseLeave={handleMouseEvent}
                 onDragStart={preventDragHandler}
                 onContextMenu={handleMouseEvent}
                 onWheel={handleMouseEvent}
            >
                <g transform={`translate(${pos.x},${pos.y})`}>
                    <g transform={`scale(${pos.zoom})`}>
                        <image href={image} width={containerDim.inner.width} height={containerDim.inner.height}
                               preserveAspectRatio={"none"}/>
                        <g transform={`scale(${containerDim.inner.width / imageDim.width})`}>
                            {/* insert svg object send by the active component */}
                            {toolData?.svg}
                        </g>
                    </g>
                </g>
            </svg>}
        </ImageViewContainer>
    </React.Fragment>
}

export default ImageView