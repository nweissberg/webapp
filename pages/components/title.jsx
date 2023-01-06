import React from "react";
export default class HeaderTitle extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return(<>
            <div className="flex flex-wrap justify-content-start align-items-center gap-2"
                    style={{position:"relative",height:"100%",marginTop:"auto",display:"flex",color:"var(--text)"}}>
                <h4 style={{fontWeight:100, color:"var(--text-c)"}}>{this.props.title}:</h4>
                
                <h4>{this.props.value}</h4>
            </div>
        </>)
    }
}