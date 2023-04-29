
import React from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter';

export default function SplitterDemo(props){
    return (
        <div>
            <div className="card">
                <h5>Horizontal</h5>
                <Splitter gutterSize={10} className="mb-5">
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        {props.matrix[0][0]()}
                    </SplitterPanel>
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        
                        <Splitter gutterSize={10} style={{height: '300px'}} layout="vertical">
                            <SplitterPanel className="flex align-items-center justify-content-center">
                                {props.matrix[0][1][0]()}
                            </SplitterPanel>
                            <SplitterPanel className="flex align-items-center justify-content-center">
                                {props.matrix[0][1][1]()}
                            </SplitterPanel>
                        </Splitter>
                    </SplitterPanel>
                </Splitter>
            </div>

            <div className="card">
                <h5>Vertical</h5>
                
            </div>

            <div className="card">
                <h5>Nested</h5>
                <Splitter style={{height: '300px'}}>
                    <SplitterPanel className="flex align-items-center justify-content-center" size={20} minSize={10}>
                        Panel 1
                    </SplitterPanel>
                    <SplitterPanel size={80}>
                        <Splitter layout="vertical">
                            <SplitterPanel className="flex align-items-center justify-content-center" size={15}>
                                Panel 2
                            </SplitterPanel>
                            <SplitterPanel size={85}>
                                <Splitter>
                                    <SplitterPanel className="flex align-items-center justify-content-center" size={20}>
                                        Panel 3
                                    </SplitterPanel>
                                    <SplitterPanel className="flex align-items-center justify-content-center" size={80}>
                                        Panel 4
                                    </SplitterPanel>
                                </Splitter>
                            </SplitterPanel>
                        </Splitter>
                    </SplitterPanel>
                </Splitter>
            </div>
        </div>
    )
}
                 