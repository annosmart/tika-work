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

import React, {useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {WaveForm, WaveSurfer} from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import {AudioViewContainer, CurrentTime, DurationTime, TimerBar} from "../data-view.styled";
import ReactTooltip from "react-tooltip";
import ReactAudioPlayer from "react-audio-player";

function AudioView({audio, hasVideo, options, toolName, setMouseEvent, toolData, dimensions, reset}) {
    const wavesurferRef = useRef();
    let [minWaveZoom, setMinWaveZoom] = useState(20)
    let [maxWaveZoom, setMaxWaveZoom] = useState(800)
    let [currentTime, setCurrentTime] = useState(0)
    let [audioURL, setAudioURL] = useState(null)
    let [audioVolume, setAudioVolume] = useState(1)
    const videoRef = useRef();
    const containerRef = useRef();
    const margin = 30

    const resetZoom = () => {
        if (wavesurferRef.current) {
            let zoom = wavesurferRef.current.container.offsetWidth / wavesurferRef.current.getDuration()
            setMinWaveZoom(zoom)
            setMaxWaveZoom(wavesurferRef.current.container.offsetWidth / 0.1)
            wavesurferRef.current.zoom(zoom)
        }
    }

    // update zoom of wavesurfer component
    useEffect(() => {
        let zoom = Math.min(maxWaveZoom, Math.max(minWaveZoom, minWaveZoom * options._zoom));
        if (wavesurferRef.current)
            wavesurferRef.current.zoom(zoom)
    }, [maxWaveZoom, minWaveZoom, options._zoom])

    // handle wavesurfer component wheel event
    useEffect(() => {
        if (wavesurferRef.current)
            wavesurferRef.current.container.onwheel = (e) => {
                if (e.deltaY !== 0) {
                    setMouseEvent({type: e.type, buttons: e.buttons, e: e})
                }
            }
        return () => {
            if (wavesurferRef.current)
                wavesurferRef.current.container.onwheel = null;
        }
    }, [wavesurferRef.current])

    const resizeListener = useCallback(() => {
        resetZoom()
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resizeListener);
        return () => {
            resetAudio();
            window.removeEventListener('resize', resizeListener);
            setAudioURL(null)
        }
    }, [])

    useEffect(() => {
        if (audio) {
            const reader = new FileReader();
            reader.addEventListener("load", function () {
                setAudioURL(reader.result)
            }, false);
            reader.readAsDataURL(audio);
        }
    }, [audio])

    // update file of wavesurfer component
    useEffect(() => {
        if (audioURL && wavesurferRef.current) {
            wavesurferRef.current.load(hasVideo ? videoRef.current : audioURL);
        }
    }, [audioURL])

    useEffect(() => {
        if (wavesurferRef.current && audio) {
            wavesurferRef.current.playPause();
        }
    }, [options._playpause])

    useEffect(() => {
        if (wavesurferRef.current && audio) {
            let seekCount = 0.01 * (options._seekBack ? -1 : 1);
            let current = wavesurferRef.current.getCurrentTime() / wavesurferRef.current.getDuration();
            let progress = Math.max(0, Math.min(1, current + seekCount))
            wavesurferRef.current.seekAndCenter(progress)
            setCurrentTime(`${wavesurferRef.current.getCurrentTime()}`.toHHMMSS())
        }
    }, [options._seek])

    function resetAudio() {
        if (wavesurferRef.current) {
            wavesurferRef.current.seekAndCenter(0)
            wavesurferRef.current.stop()
            setCurrentTime(`${wavesurferRef.current.getCurrentTime()}`.toHHMMSS())
        }
    }

    useEffect(() => {
        if (reset) {
            resetAudio();
        }
    }, [reset])

    const handleMouseEvent = (e) => {
        if (e.type !== "mousedown" && e.type !== "mouseup")
            e.preventDefault();
        setMouseEvent({type: e.type, buttons: e.buttons, e: e})
    }

    const preventDragHandler = (e) => {
        e.preventDefault();
    }

    // for timeline format
    function formatTimeCallback(seconds, pxPerSec) {
        seconds = Number(seconds);
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        // fill up seconds with zeroes
        let secondsStr = Math.round(seconds).toString();
        if (pxPerSec >= 25 * 10) {
            secondsStr = seconds.toFixed(2);
        } else if (pxPerSec >= 25 * 1) {
            secondsStr = seconds.toFixed(1);
        }

        if (minutes > 0) {
            if (seconds < 10) {
                secondsStr = '0' + secondsStr;
            }
            return `${minutes}:${secondsStr}`;
        }
        return secondsStr;
    }

    function timeInterval(pxPerSec) {
        let appsec = wavesurferRef.current.container.offsetWidth / pxPerSec
        let time = Math.ceil(0.01 * appsec);
        return appsec > 10 ? time : (appsec > 1 ? time / 10 : time / 100);
    }

    // plugins for wavesurfer component
    const plugins = useMemo(() => {
        return [
            options._allowRegions && {
                plugin: RegionsPlugin,
                options: {dragSelection: true}
            },
            options._allowTimeLine && {
                plugin: TimelinePlugin,
                options: {
                    container: "#timeline",
                    formatTimeCallback: formatTimeCallback,
                    timeInterval: timeInterval,
                    primaryColor: 'blue',
                    secondaryColor: 'red',
                    primaryFontColor: 'blue',
                    secondaryFontColor: 'red'
                }
            }
        ].filter(Boolean);
    }, [options]);


    const regionCreatedHandler = useCallback(
        region => {
            setMouseEvent({
                type: "regionCreated",
                buttons: 0,
                e: {},
                region: region,
                regions: wavesurferRef.current.regions.list
            })
        }, []);

    const handleRegionOver = useCallback((region) => {
        wavesurferRef.current.container.setAttribute('data-for', "region-tip");
        wavesurferRef.current.container.setAttribute('data-tip', region.id);
        ReactTooltip.show(wavesurferRef.current.container)
    }, []);

    const handleRegionLeave = useCallback((region) => {
        ReactTooltip.hide(wavesurferRef.current.container)
    }, []);

    // handle wavesurfer component mount event
    const handleWSMount = useCallback(
        waveSurfer => {
            wavesurferRef.current = waveSurfer;
            if (wavesurferRef.current && audio) {
                // wavesurferRef.current.load(videoRef.current);
                wavesurferRef.current.on("region-created", regionCreatedHandler);
                wavesurferRef.current.on("region-mouseenter", handleRegionOver);
                wavesurferRef.current.on("region-mouseleave", handleRegionLeave);
                wavesurferRef.current.on("ready", () => {
                    resetZoom()
                });
                wavesurferRef.current.on("audioprocess", () => {
                    setCurrentTime(`${wavesurferRef.current.getCurrentTime()}`.toHHMMSS())
                });
                wavesurferRef.current.setWaveColor(wavesurferRef.current.getProgressColor())
            }
        },
        [regionCreatedHandler, audio]
    );

    const handleContextMenu = useCallback((e) => {
        if (e.target.nodeName === "REGION" && e.target.className === "wavesurfer-region") {
            e.preventDefault();
            let region = wavesurferRef.current.regions.list[e.target.dataset.id];
            if (region)
                setMouseEvent({type: "regionContextMenu", buttons: e.buttons, e: e, region: region})
        }
    }, []);

    useEffect(() => {
        document.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    });

    const getViewDim = () => {
        return {
            width: (dimensions?.screen.width ?? 0) - (dimensions?.leftPanel.width ?? 0),
            height: dimensions?.screen.height ?? 0
        }
    }

    return <React.Fragment>
        <AudioViewContainer ref={containerRef} draggable={false} margin={margin} dim={getViewDim()}
                            onMouseDown={handleMouseEvent} onMouseMove={handleMouseEvent}
                            onMouseUp={handleMouseEvent} onDragStart={preventDragHandler}
                            onContextMenu={handleMouseEvent}>
            {/* add video control if it's necessary */}
            {hasVideo && audioURL && <video ref={videoRef} controls={!options._waveViewer} src={audioURL}/>}
            {/* add wave surfer control if it's necessary */}
            {audio && options._waveViewer && <WaveSurfer className="zoom" plugins={plugins} onMount={handleWSMount}>
                <WaveForm id="waveform" backend={hasVideo ? 'MediaElement' : 'WebAudio'}>
                    {toolData?.regions}
                </WaveForm>
                <div id="timeline"/>
            </WaveSurfer>}
            {/* simple audio control when it's necessary*/}
            {!hasVideo && audioURL && !options._waveViewer && <ReactAudioPlayer
                src={audioURL}
                controls
                style={{width: '100%'}}
                title={audio.name}
                volume={audioVolume}
                onVolumeChanged={(e) => setAudioVolume(e.target.volume)}
            />}
            {!options._allowTimeLine && wavesurferRef.current && <TimerBar>
                <CurrentTime>{currentTime}</CurrentTime>
                <DurationTime>{`${wavesurferRef.current.getDuration()}`.toHHMMSS()}</DurationTime>
            </TimerBar>}
            {audio && toolData?.info}
        </AudioViewContainer>
    </React.Fragment>
}

// extra function for time format
String.prototype.toHHMMSS = function () {
    let sec_num = parseInt(this, 10); // don't forget the second param
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

export default AudioView
