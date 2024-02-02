import React, { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';

export default function SettingsPage(props){
    // const [activeIndex, setActiveIndex] = useState(0);

    // const onClick = (itemIndex) => {
    //     let _activeIndex = activeIndex ? [...activeIndex] : [];

    //     if (_activeIndex.length === 0) {
    //         _activeIndex.push(itemIndex);
    //     }
    //     else {
    //         const index = _activeIndex.indexOf(itemIndex);
    //         if (index === -1) {
    //             _activeIndex.push(itemIndex);
    //         }
    //         else {
    //             _activeIndex.splice(index, 1);
    //         }
    //     }

    //     setActiveIndex(_activeIndex);
    // }

    return (
        <div className="w-full">
            <Accordion
                className="accordion-custom"
                activeIndex={props.activeIndex && props.multiple?props.activeIndex:0}
                multiple={props.multiple?props.multiple:false}
            >
                {props.tabs.map((tab,index)=>{
                    return(
                        <AccordionTab key={index} header={
                            <div className='flex gap-2'>
                                <i className={tab?.icon}></i>
                                <span>{tab?.header}</span>
                            </div>
                        }>{tab?.body}</AccordionTab>
                    )
                })}
            </Accordion>
        </div>
    )
}

