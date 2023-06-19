import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import React from "react";
// import { readRealtimeData } from "../api/firebase";
import localForage from "localforage";
import Link from 'next/link'

var clients_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'clientes'
});

export default class ClientIcon extends React.Component{
    constructor(props){
        super(props)
        this.state={client:null}
    }
    async getClient(){
        if(this.state.client?.id != this.props.client?.id || (this.props.client_id && this.state.client?.id != this.props.client_id)){
            var client = null
            if(this.props.client){
                client = this.props.client
            }else if(this.props.uid) await clients_db.getItem(this.props.client.id.toString())
			.then((client_data)=>{
                console.log(client_data)
                client = client_data
            })
			this.setState({client:client})
            
        }
    }
    componentDidMount(){
        this.getClient()
    }
    componentDidUpdate(){
		console.log(this.props.client)
        this.getClient()
    }
    render(){
        const size = !this.props.pointer?(this.props.size || 50):30
        if(this.props.client == null){
            return(<><Skeleton className={this.props.className } key={this.props.key +'_tmp'} width={size+"px"} height={size+"px"} borderRadius="50%"/></>)
        }
        return(<div key={this.props?.key +'_cursor'} className={(this.props.pointer?'shadow-3 ':" ") +this.props.className }
        style={this.props.pointer?{
            backgroundColor:"white",
            borderRadius:"2px 50% 50% 50%",
            padding:"2px"
        }:{}}>
            <Link
				// as={"/profile#"+this.props.uid}
				prefetch={true}
				passHref
				legacyBehavior
				href={{
					pathname: '/client',
					query:{p:"chamado", id:this.props.client.id}
				}}
			>
				<Button
					iconPos="right"
					icon='pi pi-building text-lg icon-right'
					label={this.props.client.name || this.props.client.fantasia}
					className='sm:icon-only w-full p-button-text p-button-glass-dark border-none shadow-none '
				/>
			</Link>
            
        </div>)
    }
}