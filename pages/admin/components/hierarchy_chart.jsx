import React, { useState, useEffect } from 'react';
import { OrganizationChart } from 'primereact/organizationchart';
import { Button } from 'primereact/button';
// import './OrganizationChartDemo.css';

export default function HierarchyChart(props) {
    const [selection, setSelection] = useState([]);
    const [hierarchy_data, set_hierarchy_data] = useState([])

    function user_to_node(user_data, last_parent){
        if(!user_data) return({expanded:false})
        // console.log(user_data, last_parent)
        var _profile = props.profiles.find((profile)=>profile.id == user_data.role+1)
        var user_node = {
            label:_profile?.name,
            icon:_profile?.icon,
            type: 'person',
            className: 'p-person',
            expanded: true,
            data: props.users.find((parent_data)=>parent_data.email==user_data.email),
            children:user_data.parent?.map((parent)=>{
                var _parent_data = props.users.find((parent_data)=>parent_data.email==parent.email)
                if(last_parent){
                    if(_parent_data.email == last_parent.email){
                        return({
                            className: 'p-loop',
                            label:"Volta",
                            expanded:false,
                            type: 'loop',
                            name:last_parent.name
                        })
                    }
                }
                return(user_to_node(_parent_data,user_data))
            })
        }
        return(user_node)
    }
    useEffect(()=>{
        var _hierarchy_data = []
        
        _hierarchy_data.push(user_to_node(props.user))
        set_hierarchy_data(_hierarchy_data)
        // console.log(props)
    },[])


    const nodeTemplate = (node) => {
        if (node.type === "person") {
            return (
                <div>
                    <div className="flex justify-content-center align-items-center node-header mb-2 gap-2"><i style={{color:"var(--text-c)"}} className={'pi pi-'+node.icon}></i>{node.label}</div>
                    <div className="node-content">
                        <img alt={node.data.photo}
                        src={`images/avatar/${node.data.photo}.jpg`}
                        onError={(e) => e.target.src='images/sem_foto.jpg'}
                        style={{ width: '32px', borderRadius:"5px" }} />
                        <div>{node.data.name}</div>
                    </div>
                </div>
            );
        }
        if (node.type === "loop") {
            return(
                <Button
                    label={node.name.split(" ")[0]}
                    className='p-button-text'
                    icon="pi pi-sync" //pi-history
                />
            )
        }
        return node.label;
    }

    return (
        <div className="organizationchart-demo">
            {hierarchy_data.length > 0 && <div className='flex justify-content-center p-3'
                style={{
                    minWidth:"max-content",
                    width:"50vw",
                    backgroundColor:" var(--glass-b)"
                }}
            >
                <OrganizationChart
                    style={{
                        width:"min-content"
                    }}
                    value={hierarchy_data}
                    nodeTemplate={nodeTemplate}
                    selection={selection}
                    selectionMode="single"
                    onSelectionChange={(event) => {
                        console.log(event.data)
                        setSelection(event.data)
                    }}
                    className="company"
                />
            </div>}
        </div>
    )
}