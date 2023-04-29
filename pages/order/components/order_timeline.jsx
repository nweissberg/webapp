import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { capitalize, time_ago } from '../../utils/util';
import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';
import UserIcon from '../../components/user_icon';

export default class OrderTimeline extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    get_icon(action){
        switch (action) {
            case "enviado":
                return({
                    icon:"pi pi-send",
                    color:"var(--primary-c)"
                })
            case "rejeitado":
                return({icon:"pi pi-times",
                color:"var(--error-c)"
            })
                break;
            case "aprovado":
                return({icon:"pi pi-check",
                color:"var(--success-b)"
            })
                break;
            case "devolvido":
                return({
                    icon:"pi pi-replay",
                    color:"var(--warn-b)"
                })
                break;
            default:
                break;
        }
    }
    
    render(){
        const customizedMarker = (item) => {
            const icon = this.get_icon(item.action)
            return (
                <span className="custom-marker shadow-1" >
                    <Button
                        className="p-button-rounded"
                        icon={icon.icon}
                        style={{
                            color:"var(--text)",
                            backgroundColor:icon.color,
                            outline:"2px solid var(--text)"
                        }}
                    />
                </span>
            );
        };

        const customizedContent = (item) => {
            const action_date = new Date(item.date)
            return (
                <Card
                    // className="flex justify-content-end"
                    style={{
                        borderRadius:"10px",
                        width:"256px",
                        marginBottom:"20px",
                        backgroundColor:"var(--glass-b)",
                        overflow:"hidden"
                    }}
                    title={capitalize(item.action)}
                    subTitle={action_date.toDateString()}
                    >
                    <h6 style={{
                        color:"var(--text-c)",
                        marginTop:"-20px",
                        marginBottom:"20px"
                    }}>Às {action_date.toLocaleTimeString().split(":").slice(0,2).join("h")}</h6>
                        {item.comment && <div className="mt-2 ml-2 mb-4">
                            <h6 style={{color:"var(--secondary)"}}>Motivo:</h6>
                            <span>{item.comment}</span>    
                        </div>}

                    <UserIcon uid={item.user}/>
                    <h6>{time_ago(item.date)}</h6>
                </Card>
            );
        };

        return(<>
            <Timeline 
                style={{
                    right:"0px",
                    marginLeft:"-30px"
                }}
                align="left"
                className="customized-timeline mt-2"
                marker={customizedMarker}
                content={customizedContent}
                value={[...this.props.history].reverse()}
            />
        </>)
    }
}