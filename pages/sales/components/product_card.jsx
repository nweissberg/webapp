import React from "react";
import { Button } from 'primereact/button';
import { isDeepEqual, moneyMask, scrollToBottom } from "../../utils/util";
import { Badge } from 'primereact/badge';
import { api_get } from "../../api/connect";
import handleViewport from 'react-in-viewport';
import { ProgressSpinner } from 'primereact/progressspinner';
import localForage from "localforage";

const photos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'fotografias'
});

class ProductCard extends React.Component {
    constructor(props){
        super(props)
        this.state={
            addToSale:false,
            interval:null,
            photo:null,
            item:this.props.item,
            view_state:'hidden',
            show_math:true
        }
        // this.timeout = null
        // this.wrapper = React.createRef();
    }
    componentDidUpdate(){
        // const { inViewport } = this.props;
        // if(this.timeout != null && inViewport == false){
        //     // console.log(this.timeout)
        //     clearTimeout(this.timeout)
        //     this.timeout = null
        // }
    }

    componentWillUnmount() {
        // if (this.timeout) {
        //     clearTimeout(this.timeout)
        // }
    }
    // componentDidMount(){
        
        // }
    componentDidCatch(){
        console.log("DID catch")
        this.setState({item:null,photo:null})   
    }
    render(){

        // const { inViewport } = this.props;
        // if(inViewport && this.state.item?.PRODUTO_ID != this.props.item?.PRODUTO_ID ){
        //     this.setState({item:this.props.item},()=>{
        //         if(this.timeout == null){
        //             this.timeout = setTimeout(function() {
        //                 this.props.loadPhoto(this)
        //                 this.timeout = null
        //             }.bind(this), 1000)
        //         }
        //     })
        //     // this.setState({item:this.props.item})
        // }

        // const { inViewport } = this.props;
        if(this.props.item?.photo_uid && this.state.photo == null){
            photos_db.getItem(this.props.item.photo_uid).then((photo_data)=>{
                if(photo_data){
                    const _photo ="data:image/png;base64," + new Buffer.from(photo_data.img_buffer).toString("base64")
                    // console.log(photo_data)
                    this.setState({photo:_photo})
                }
            })
        }
        
        if(this.state.item?.PRODUTO_ID != this.props.item?.PRODUTO_ID ){
            this.setState({photo:null,item:this.props.item})
            // this.setState({item:this.props.item},()=>{
            //     if(this.props.item.photo_uid != undefined){
            //         photos_db.getItem(this.props.item.photo_uid).then((photo_data)=>{
            //             const _photo ="data:image/png;base64," + new Buffer.from(photo_data.img_buffer).toString("base64")
            //             // console.log(photo_data)
            //             this.setState({photo:_photo})
            //         })
            //     }
            // })
        
            // this.setState({item:this.props.item})
        }
        
        // var item = this.props.item
        return(
            
            <div>
                <div style={{
                    width:"40vw",
                    maxWidth:"170px",
                    minWidth:"130px",
                    height:"270px",
                    background:"var(--card)",
                    borderRadius:"5px",
                    overflow:"hidden",
                    pointerEvents:this.state.addToSale?"none":"all",
                    textAlign:"center",
                    cursor:"pointer",
                    marginBottom:"5px",
                    paddingBottom:"10px",
                }}
                
                // Show Card Actions
                onClick={(event)=>{
                    // console.log(this.props.item)
                    // console.log(this.state.view_state)
                    // console.log("CLICK",event)
                    clearInterval(this.state.interval)
                    if(this.state.view_state == 'actions'){
                        event.stopPropagation()
                        event.preventDefault()
                        scrollToBottom()
                        this.props.show_mobile_info?.(this.state.item)
                        // this.props.onClick?.(this.state.item)
                        this.setState({view_state:'actions'})
                    }
                    if(this.state.view_state == 'hidden'){
                        this.setState({
                            view_state:"hover"
                        },(data)=>{
                            // console.log(this.state.view_state)
                        })
                    }
                }}
                
                onPointerEnter={(event)=>{
                    
                    // console.log(this.state.view_state)
                    if(this.state.view_state == 'hover'){
                        // console.log(event)
                        // event.stopPropagation()
                        scrollToBottom()
                        // this.props.show_mobile_info?.(this.state.item)
                        // this.props.onClick?.(this.state.item)
                        if(this.state.interval) clearInterval(this.state.interval)
                        this.setState({view_state:'actions'})
                    }
                    
                    if(this.state.view_state == 'hidden'){
                        // console.log(event)
                        this.setState({
                            addToSale:true,
                            view_state:"hover"
                        })
                        scrollToBottom()
                        // this.setState({addToSale:!this.state.addToSale})
                        // this.props.onClick?.(this.state.item)
                        if(this.state.interval) clearInterval(this.state.interval)
                        
                    }
                }}
                onPointerLeave={(event)=>{
                    clearInterval(this.state.interval)
                    this.setState({interval:setInterval(()=>{
                        if(this.state.addToSale){
                            this.setState({view_state:'hidden',addToSale:false, view_state:"hidden"})
                        }
                        // clearInterval(this.state.interval)
                    },(window.innerWidth > 960? 500: 2000))})
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
                            <Button 
                                // icon="pi pi-eye"
                                style={{
                                    outlineOffset:"-2px",
                                    // outline:"2px solid white",
                                    border:"0px",
                                    position:"absolute",
                                    width:"100%",
                                    height:"270px",
                                    left:"0px",
                                    top:"0px",
                                    color:"white",
                                    // borderRadius:"2px",
                                    background:"#0000",
                                    backdropFilter:"blur(3px) brightness(110%) contrast(150%)"
                                }}
                                onClick={(event)=>{
                                    if(this.state.view_state == 'hidden' || (this.state.view_state == 'hover' && window.innerWidth > 500)){
                                        // console.log(event)
                                        event.stopPropagation()
                                        scrollToBottom()
                                        this.props.show_mobile_info?.(this.props.item)
                                        // this.props.onClick?.(this.state.item)
                                        this.setState({view_state:'actions'})
                                    }
                                }}
                            />
                            <div className="flex justify-content-center flex-wrap p-inputgroup"
                                style={{
                                    position:"absolute",
                                    marginTop:"90px",
                                }}>
                                {this.props.quantity > 0 && 
                                <Button
                                    className="p-button-secondary"//{this.props.quantity == 1?"p-button-danger":"p-button-primary"}
                                    icon={this.props.quantity == 1?"pi pi-times":"pi pi-minus"}
                                    onClick={(event)=>{
                                        event.stopPropagation()
                                        event.preventDefault()
                                        this.props.onSubProduct?.(this.props.item)
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
                                        event.preventDefault()
                                        // console.log(this.state.item)
                                        this.props.onAddProduct?.(this.props.item)
                                        // this.setState({addToSale:false})
                                    }}
                                    style={{minWidth:"50px"}}
                                />
                            </div>
                            
                            
                        </div>}
                        
                    
                    <div style={{paddin:"0px", position:"relative"}}>
                    {this.props.item?.sold && <div style={{
                        position:"absolute",
                        width:"40px",
                        height:"40px",
                        zIndex:2,
                        right:"5px",
                        top:"5px",
                        padding:"3px",
                        borderRadius:"50%",
                        backgroundColor:"var(--glass)"
                    }}>
                        <i className="pi pi-star-fill" style={{color:"gold",'fontSize': '2em'}}></i>
                    </div>}
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
                            src={this.state.photo? this.state.photo : `images/grupos/${this.props.item?.ID_CATEGORIA}_null.jpg`}
                            onError={(e) => e.target.src='images/sem_foto.jpg'}
                            style={{
                                position:"relative",
                                zIndex:0,
                                width:'100%'
                            }}
                        />
                        
                    </div>
                    <div style={{
                        display: "table-cell",
                        verticalAlign: "middle",
                        // padding: "10% 0",
                        height:"100px"
                    }}>
                        <h6 style={{
                            position:"relative",
                            zIndex:2,
                            color:"black",
                            fontSize:"13px",
                            margin:"10px",
                            textAlign:"left"
                        }}>
                            {this.props.item?.PRODUTO_NOME}
                        </h6>
                    </div>
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
                    
                    <h5 className={this.props.discount > 0.0? "price-tag-discount":this.props.quantity <= 1?"price-tag":"price-tag-multiple"}
                        style={{
                            // backgroundColor:this.props.quantity <= 1?"var(--primary-b)":"var(--primary-c)",
                            // backdropFilter: "blur(5px)",
                            // width:"70%",
                            // marginLeft:"5px",
                            zIndex:2,
                            position:"relative",
                            paddingInline:"10px",
                            borderRadius:"10px",
                            paddingBottom:"3px"
                        }}
                        onClick={(event)=>{
                            if(this.props.quantity > 1 || this.props.discount > 0.0) this.setState({show_math:!this.state.show_math})
                        }}
                    >
                        {this.state.show_math && (this.props.quantity > 1 || this.props.discount > 0.0) &&
                            <div style={{paddingTop:"3px"}}>
                                {this.props.discount > 0.0 && <div className="flex justify-content-between">
                                    <h6 style={{color:"var(--text-c)"}}>{moneyMask(this.props.item?.PRECO)}</h6>
                                    <h6 style={{color:"var(--warn)"}}> - {Math.round(this.props.discount)}%</h6>                                
                                </div>}
                                {this.props.quantity > 1 && <div className="flex justify-content-between">
                                    <h6 style={{color:"var(--text)"}}>{moneyMask(this.props.item?.PRECO-(this.props.item?.PRECO*(this.props.discount/100)))}</h6>
                                    <h6 style={{color:"var(--success)"}}> x {this.props.quantity} {this.props.item.ABREVIATURA.toLowerCase()}</h6>                                
                                </div>}
                            </div>
                        }
                        {this.props.quantity == 0 ? moneyMask(this.props.item?.PRECO) : moneyMask((this.props.item?.PRECO-(this.props.item?.PRECO*(this.props.discount/100))) * this.props.quantity)}
                    </h5>
                </div>
                {this.props.addToSale && <div style={{
                    zIndex:1,
                    position:"relative",
                    backdropFilter: "blur(2px)",
                    width:"100%",
                    height:"100%",
                    top:"-100%",
                    // cursor:"pointer"
                    // pointerEvents:"none"
                }}>
                </div>}
            </div>
        )
    }
}

// const ProductCard = handleViewport(ProductCardBock, { rootMargin: '100px' });

export default ProductCard