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

import styled from 'styled-components';

export const ViewContainer = styled.div.attrs(props => ({
    style: {
        left: `${props.left}px`,
    }
}))`
  display: block;
  position: absolute;
  right: 0;
  top: 0;
`

export const ImageViewContainer = styled.div.attrs(props => ({
    style: {
        width: `${Math.max(0, props.dim.width - props.margin * 4)}px`,
        height: `${Math.max(0, props.dim.height - props.margin * 3)}px`,
        margin: ` ${props.margin / 2 - 4}px ${props.margin}px 0 `,
        padding: `${props.margin}px`,
    }
}))`
  position: relative;
  display: inline-block;
  border: solid 4px;
  overflow: hidden;

  > svg {
    width: 100%;

    &.tool-default.zoomed {
      cursor: move;
    }
  }
`
export const TextViewContainer = styled.div.attrs(props => ({
    style: {
        width: `${Math.max(0, props.dim.width - props.margin * 2)}px`,
        height: `${Math.max(0, props.dim.height - props.margin * 1.5)}px`,
        margin: ` ${props.margin / 2 - 4}px ${props.margin}px 0 `,
        padding: `${props.margin}px`,
    }
}))`
  position: relative;
  display: inline-block;
  border: solid 4px;
  overflow: auto;
`
export const TextContent = styled.div`
  position: relative;
  display: block;
  width: 100%;
  font-size: ${props => props.options?.fontSize}px;
  font-weight: ${props => props.options?.bold ? "bold" : "normal"};
  word-wrap: ${props => props.options?.wordWrap ? "break-word" : "normal"};
  text-align: ${props => props.options?.textAlign ?? ""};
  white-space: pre-line;
`

export const MenuSearch = styled.div.attrs(props => {
    return props.extra ? {
        style: {
            width: '100%',
            position: 'relative',
            marginTop: 0,
        }
    } : {
        style: {
            width: '200px',
            position: 'fixed',
            marginTop: '-38px',
        }
    }
})`
  background: #ffffff;
  padding: 6px;
  display: inline-block;
  z-index: 100;

  > input {
    width: 100%;
  }
`

export const AudioViewContainer = styled.div.attrs(props => ({
    style: {
        width: `${Math.max(0, props.dim.width - props.margin * 2)}px`,
        height: `${Math.max(0, props.dim.height - props.margin * 1.5)}px`,
        margin: ` ${props.margin / 2 - 4}px ${props.margin}px 0 `,
        padding: `${props.margin}px`,
    }
}))`
  position: relative;
  display: inline-block;
  border: solid 4px;
  overflow: auto;

  video {
    width: 100%;
  }
`

export const TimerBar = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
`
export const CurrentTime = styled.div`

`
export const DurationTime = styled.div`

`
