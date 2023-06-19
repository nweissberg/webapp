import React from 'react';
import { query_data } from '../api/firebase';
import { time_ago, time_until } from '../utils/util';
import { Button } from 'primereact/button';
import UserIcon from './user_icon';
import Link from 'next/link'
import ClientIcon from './client_icon';

export default class UserCalls extends React.Component{
    constructor(props){
        super(props)
        this.default={}
        this.state={...this.default}
		this.channels = {
			"WHATS":"Whatsapp",
			"CALL":"Telefone",
			"EMAIL":"Email",
			"APP":"Mensagem",
			"FACE":"Facebook",
			"INSTA":"Instagram",
			"LOCAL":"Visita",
			"WEB":"Site Cliente"
		}
		this.footer_button = "flex w-auto p-4 h-full pt-1 pb-1 m-0 pl-2 pr-2 shadow-none p-button-lg p-button-rounded "
    }
	
    componentDidMount(){
		this.get_calls()
    }

	get_calls(){
		query_data('calls',{
			"users": {
				"mode":"or",
				"user_uid": ['==', this.props.user.uid],
				"help_user.uid": ['==', this.props.user.uid]
			}
		}).then(data => {
			var promises = []
			var _docs = []
			data.forEach((doc)=>{
				var doc_data = doc.data()
				doc_data.call_return_date = doc_data.call_return_date.toDate()
				doc_data.enviado = doc_data.enviado.toDate()
				// promises.push(clients_db.getItem(doc_data.client.toString()).then(data=>{
					// 	doc_data.client=data
					// }))
				_docs.push(doc_data)
			})
			// this.setState({calls:_docs})
			// Promise.all(promises).then(e=>{
			// })
			console.log(_docs)
			this.setState({client_calls:_docs})
		})
	}

    render(){
		if(!this.state.client_calls)return(<></>)
        return(<div className='flex overflow-x-scroll overflow-y-hidden flex w-screen horizontal-scrollbar'>
			<div className="align-items-start flex h-auto text-white gap-2 justify-content-center w-max mb-8">
			{this.state.client_calls.map((call,i)=>{
				return(<div key={'call_'+i} className=" p-3 border-2 border-blue-700 bg-glass-b border-round-md w-30rem h-full">
					<div className=" w-full h-full align-content-between">
						{/* <Link
							href={{
								pathname: '/client',
								query:{p:"chamado", id:call.client.id}
							}}
							// as={"/profile#"+this.props.uid}
							prefetch={true}
							passHref
							legacyBehavior
						>
							<Button
								iconPos="right"
								icon='pi pi-eye text-2xl icon-right'
								label={call.client.name}
								className='w-full p-button-text text-2xl text-blue-200 shadow-none '
							/>
						</Link> */}
						<ClientIcon client={call.client}/>
						<UserIcon
							currentUser={this.props.currentUser}
							uid={call.user_uid}
							size="50"
							inline
							// role
							className='my-4'
						/>
						<div className="flex justify-content-between align-items-end col-12">
							<h4>O contato{call.enviado?' ':' não '}foi realizado</h4><h5 className="text-sm text-green-500 text-right font-bold">Via {this.channels[call.selectedChannel]} {time_ago(call.enviado)}</h5>
						</div>
						<label className="col-12 line-height-4 text-justify">{call.call_description}</label>
						<div className="flex justify-content-between align-items-start col-12">
							<h5 className="font-bold">Retornar { time_until(call.call_return_date).toLowerCase() }</h5>
							<span className="text-right">
								{call.call_return_date - Date.now() < 0 && <h5 className="underline-red">Atrasado {time_ago(call.call_return_date).toLocaleLowerCase()}</h5>}
								{call.call_return_date - Date.now() > 0 && <label className="text-green-500 text-right font-bold">{
									call.call_return_date.toLocaleDateString("pt-br", {
										hour12: false,
										month: 'long',
										day: "2-digit",
										year: "numeric",
										weekday: 'long'
									})}
								</label>}
							</span>
						</div>
						
						{call.help_user.uid != this.props.currentUser.uid && <label className="col-12 line-height-4 text-justify">Foi solicitada a ajuda de <span className="font-bold text-purple-300">{call.help_user.name}</span>: {call.help_description}</label>}
						{call.help_user.uid == this.props.currentUser.uid && <label className="col-12 line-height-4 text-justify"><span className="font-bold"><span className="text-purple-300">Você</span> foi solicitado para ajudar:</span> {call.help_description}</label>}
						<UserIcon
							currentUser={this.props.currentUser}
							uid={call.help_user.uid}
							size="50"
							inline
							// role
						/>
					</div>
					{(call.help_user.uid == this.props.currentUser.uid || call.user_uid == this.props.currentUser.uid) && <div className='bottom-0'>
						<Button label='Retornar'
							className={this.footer_button}
							icon='pi pi-phone'
							iconPos="right"
							onClick={(e)=>{
								// this.setState({all_channels:!this.state.all_channels})
							}}
						/>
					</div>}
				</div>)
			})}
		</div>
	</div>)
    }
}