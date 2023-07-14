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
            }else if(this.props.client_id) await clients_db.getItem(this.props.client_id.toString())
			.then((client_data)=>{
                console.log(client_data)
                client = client_data
            })
			this.setState({client:client})
            
        }
    }
    componentDidMount(){
        console.log(this.props.client)
        this.getClient()
    }
    // componentDidUpdate(){
	// 	console.log(this.props.client)
    //     this.getClient()
    // }
    render(){
        const size = !this.props.pointer?(this.props.size || 50):30
        if(this.state.client == null){
            return(<><Skeleton className={this.props.className } key={this.props.key +'_tmp'} width={size+"px"} height={size+"px"} borderRadius="5px"/></>)
        }
        if(this.props.onClick){
            return(<div>
                <Button
					iconPos="right"
					icon='pi pi-building text-lg icon-right'
					label={this.state.client.name || this.state.client.fantasia}
					className='sm:icon-only w-full p-button-text p-button-glass-dark border-none shadow-none '
                    onClick={this.props.onClick}
				/>
            </div>)
        }
        return(<div>
            <Link
				// as={"/profile#"+this.props.uid}
				prefetch={true}
				passHref
				legacyBehavior
				href={{
					pathname: '/client',
					query:{p:"chamado", id:this.state.client.id}
				}}
			>
				<Button
					iconPos="right"
					icon='pi pi-building text-lg icon-right'
					label={this.state.client.name || this.state.client.fantasia}
					className='sm:icon-only w-full p-button-text p-button-glass-dark border-none shadow-none '
				/>
			</Link>
            
        </div>)
    }
}