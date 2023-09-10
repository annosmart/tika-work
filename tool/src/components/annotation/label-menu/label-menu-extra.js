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

import React from "react";
import {Item, Submenu} from "react-contexify";

function LabelMenuExtra({data}) {

    function handleItemEvent(item, eventName, e = null) {
        if (item[eventName]) {
            item[eventName](e)
        }
    }

    const keyStopPropagation = (e) => {
        e.stopPropagation();
    }

    const getItems = (l) => {
        return l.map((item, i) => {
            switch (item.type) {
                case 'item':
                    return <Item className={'extra-data'} key={i} onClick={() => handleItemEvent(item, 'click')}>
                        {item.label}
                    </Item>
                case 'submenu':
                    return item.subItems ? <Submenu className={'extra-data'} label={item.label}
                                                    arrow={"⯈"}>{getItems(item.subItems)}</Submenu> : null
                case 'input':
                    return <Item className={'extra-data'} key={i}>
                        <input type={item.inputType} value={item.value ?? ''}
                               placeholder={item.placeholder ?? ''}
                               onChange={(e) => handleItemEvent(item, 'change', e)}
                               onClick={keyStopPropagation}
                               onKeyDown={keyStopPropagation}
                               onKeyPress={keyStopPropagation}
                        />
                    </Item>
                default:
                    return null
            }
        })
    }
    return <React.Fragment>{getItems(data)}</React.Fragment>
}

export default LabelMenuExtra