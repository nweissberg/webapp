import React from "react";
import { Button } from 'primereact/button';
import { moneyMask } from "../../utils/util";
import { Badge } from 'primereact/badge';
import { api_get } from "../../api/connect";
import handleViewport from 'react-in-viewport';
import { ProgressSpinner } from 'primereact/progressspinner';

class ProductCardBock extends React.Component {
    constructor(props){
        super(props)
        this.state={
            addToSale:false,
            interval:null,
            blockedPanel:true,
            photo:null,
            item:this.props.item
        }
    }
    
    // componentWillUnmount(){
    //     // this.setState({photo:null})
    // }
    // componentDidMount(){
    //     // this.getImage()
    //     this.props.onLoad?.(this)
    // }

    render(){
        const { inViewport } = this.props;
        if(inViewport && this.state.item.pid != this.props.item.pid){
            this.setState({item:this.props.item},()=>{this.props.loadPhoto(this)})
        }
        // var item = this.props.item
        return(
            
            <div>
                <div style={{
                    width:"40vw",
                    maxWidth:"170px",
                    minWidth:"130px",
                    height:"250px",
                    background:"var(--card)",
                    borderRadius:"5px",
                    overflow:"hidden",
                    pointerEvents:this.state.addToSale?"none":"all",
                    textAlign:"center",
                    cursor:"pointer",
                    marginBottom:"5px",
                    paddingBottom:"10px",
                }}

                onClick={(event)=>{
                    // console.log(event)
                    if(!this.state.addToSale) this.setState({addToSale:true})
                    // this.setState({addToSale:!this.state.addToSale})
                    this.props.onClick?.(this.state.item)
                }}

                onPointerEnter={(event)=>{
                    if(this.state.interval) clearInterval(this.state.interval)
                }}
                onPointerLeave={(event)=>{
                    this.setState({interval:setInterval(()=>{
                        if(this.state.addToSale){
                            this.setState({addToSale:false})
                        }
                        clearInterval(this.state.interval)
                    },2000)})
                }}
                
                >
                    
                    {this.state.addToSale &&
                        <div style={{
                            position:"relative",
                            textAlign:"center",
                            zIndex:2,
                            pointerEvents:this.state.addToSale?"all":"none",
                        }}>
                            <div style={{
                        position:"absolute", 
                        backgroundColor:"var(--glass)",
                        width:"100%",
                        height:"100%",
                        // marginBottom:"-140%",
                        zIndex:10000
                    }}>
                    </div>
                            <div className="flex justify-content-center flex-wrap p-inputgroup"
                                style={{
                                    position:"absolute",
                                    marginTop:"90px",
                                }}>
                                {this.props.quantity>0 && 
                                <Button
                                    className="p-button-secondary"//{this.props.quantity == 1?"p-button-danger":"p-button-primary"}
                                    icon={this.props.quantity == 1?"pi pi-times":"pi pi-minus"}
                                    onClick={(event)=>{
                                        event.stopPropagation()
                                        this.props.onSubProduct?.(this.state.item)
                                    }}
                                    style={{minWidth:"50px"}}
                                />}
                                <Button
                                    icon="pi pi-plus"
                                    iconPos="right"
                                    className="p-button-secondary"//{this.props.quantity>0?"p-button-success":"p-button-secondary"}
                                    label={this.props.quantity>0?"":"Vender"}
                                    onClick={(event)=>{
                                        event.stopPropagation()
                                        // console.log(this.state.item)
                                        this.props.onAddProduct?.(this.state.item)
                                        // this.setState({addToSale:false})
                                    }}
                                    style={{minWidth:"50px"}}
                                />
                            </div>
                            <Button 
                                icon="pi pi-eye"
                                className=" p-button-secondary p-button-lg"
                                style={{
                                    outlineOffset:"-2px",
                                    outline:"2px solid white",
                                    position:"absolute",
                                    width:"47px",
                                    height:"47px",
                                    right:"5px",
                                    top:"5px",
                                    color:"white",
                                    borderRadius:"24px"
                                }}
                                onClick={(event)=>{
                                    event.stopPropagation()
                                    this.props.show_mobile_info?.(this.state.item)
                                }}
                            />
                            
                        </div>}
                        
                    
                    <div style={{paddin:"0px", position:"relative"}}>
                        {this.props.quantity>0 &&
                            <Badge
                                size="xlarge"
                                style={{
                                    backgroundColor:"var(--primary-c)",
                                    color:"white",
                                    position:"absolute",
                                    // display:"block",
                                    zIndex:2,
                                    top:"0px",
                                    left:"0px",
                                    margin:"5px",
                                    // marginLeft:"auto",
                                    borderRadius:"10px",
                                    outlineOffset:"-2px",
                                    outline:"2px solid white"
                                }}
                                value={this.props.quantity}
                                // severity="warning"
                            />}
                        <img alt="Product Card"
                            src={this.state.item.photo?.img?  this.state.item.photo.img: this.props.item.photo == undefined? "images/carregando_foto.jpg" : "images/sem_foto.jpg"}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                position:"relative",
                                zIndex:0,
                                width:'100%'
                            }}
                        />
                        {this.props.item.photo == undefined && <div>
                            <ProgressSpinner
                                style={{
                                    position:"absolute",
                                    width: '50px',
                                    height: '50px',
                                    top:"50%",
                                    left:"50%",
                                    transform:"translate(-50%, -50%)"
                                }}
                                strokeWidth="5"
                                animationDuration="1.5s"
                            />
                        </div>}
                    </div>
                        
                    <h6 style={{color:"black",fontSize:"13px", margin:"10px", textAlign:"left"}}>
                        {this.state.item.name}
                    </h6>
                    {/* <h5>{moneyMask(this.state.item.price)}</h5> */}
                    {/* <div style={{
                        alignItems:"center",
                        position:"absolute",
                        color:"black",
                        width:"100%",
                        bottom:"-2px",
                    }}>
                        <h5>{moneyMask(this.state.item.price)}</h5>
                    </div> */}
                </div>
                
                <div style={{
                    alignItems:"center",
                    // position:"absolute",
                    color:"white",
                    // width:"100%",
                    // bottom:"-10px",
                    // backgroundColor:"#333",
                    textAlign:"center"
                }}>
                    <h5 style={{
                        backgroundColor:"var(--primary-b)",
                        // backdropFilter: "blur(5px)",
                        // width:"70%",
                        // marginLeft:"5px",
                        zIndex:2,
                        position:"relative",
                        paddingInline:"10px",
                        borderRadius:"20px"
                    }}>{moneyMask(this.state.item.price)}</h5>
                </div>
                {this.state.addToSale && <div style={{
                    zIndex:1,
                    position:"relative",
                    backdropFilter: "blur(2px)",
                    width:"100%",
                    height:"100%",
                    top:"-100%",
                    pointerEvents:"none"
                }}>
                </div>}
            </div>
        )
    }
}

const ProductCard = handleViewport(ProductCardBock, { rootMargin: '100px' });

export default ProductCard