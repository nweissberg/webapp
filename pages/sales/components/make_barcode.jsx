import React from 'react';
import JsBarcode from 'jsbarcode';

export default class Barcode extends React.Component{
    constructor(props){
        super(props)
        this.state={generated:false}
    }
    componentDidMount(){
        this.setState({generated:true})
        try {
            JsBarcode("#barcode_"+this.props.data, this.props.data, { format: "EAN13",width:3,height:100 })
        } catch (error) {
            this.setState({generated:false})
        }
    }

    render(){
        return(
            <div className='flex flex-wrap w-full justify-content-center'>
                <div className='w-full mb-3'>
                    <img
                    className={this.props?.className}
                    style={{borderRadius:"5px", width:"220px", ...this.props?.style}}
                    id={"barcode_"+this.props.data}/>
                </div>
                {this.props.show_code != false && <h5>{this.props.data}</h5>}
            </div>
        )
    }
}