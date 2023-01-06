import React, { createRef } from "react";

export default class FlipCard extends React.Component{
    
    constructor(props){
        super(props)
        this.state={
            card_face: false,
            timeout:null,
            listener:null
        }
        this.card_ref = createRef()
        this.flip = this.flip.bind(this);
    }

    flip() {
        const parent = this
        if(this.props.auto != false){
            document.addEventListener("click",function clicked(event){
                if (parent.card_ref?.current && !parent.card_ref?.current.contains(event.target)) {
                    parent.setState({card_face: false},parent.flip)
                    document.removeEventListener("click", clicked, true);
                }
            }, true)
        }
        if(!this.props.vertical){
            if(this.state.card_face){
                this.card_ref.current.childNodes[0].style.transform= 'rotateY(180deg)'
                this.card_ref.current.childNodes[1].style.transform= 'rotateY(360deg)'
            }else{
                this.card_ref.current.childNodes[0].style.transform= 'rotateY(0deg)'
                this.card_ref.current.childNodes[1].style.transform= 'rotateY(180deg)'
            }
        }else{
            if(this.state.card_face){
                this.card_ref.current.childNodes[0].style.transform= 'rotateX(180deg)'
                this.card_ref.current.childNodes[1].style.transform= 'rotateX(360deg)'
            }else{
                this.card_ref.current.childNodes[0].style.transform= 'rotateX(0deg)'
                this.card_ref.current.childNodes[1].style.transform= 'rotateX(180deg)'
            }
        }
    }

    render(){
        return(
            <div
                ref={this.card_ref}
                className="wrapper"
                style={{
                    width:"100%",
                    height:"100%",
                    ...this.props.style,
                }}
                onClick={(event)=>{
                    this.setState({card_face: !this.state.card_face},this.flip)
                }}

                onPointerLeave={(event)=>{
                    if(window.innerWidth > 960){
                        this.setState({timeout:setTimeout(()=>{
                            this.setState({card_face: false, timeout:null},this.flip)
                        },2000)})
                    }
                }}
                
                onPointerEnter={(event)=>{
                    if(this.state.timeout != null){
                        clearTimeout(this.state.timeout)
                    }
                }}
            >
                <div
                    // className="shadow-8"
                    id="card_front"
                    style={{
                        overflow:"hidden"
                    }}
                >
                    {this.props.front?this.props.front:"Frente"}
                </div>
                <div
                    // className="shadow-8"
                    id={!this.props.vertical?"card_back_y":"card_back_x"}
                    style={{
                        overflow:"hidden"
                    }}
                >
                    {this.props.back?this.props.back:"Verso"}
                </div>
            </div>
        )
    }
}