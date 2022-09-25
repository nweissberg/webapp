import React from 'react'
import { Button } from "primereact/button";
import { SlideMenu } from 'primereact/slidemenu';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'next/router'
import { auth, get_user } from '../api/firebase';
import { signOut, onAuthStateChanged } from "firebase/auth";

export default withRouter(class Object extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		
		this.items = [
			{
				label:'Dashboard',
				icon:'pi pi-fw pi-home',
				"command":(()=>{
					this.props.router.push('/');
				})
			},
			{
			  label:'SQL to REST',
			  icon:'pi pi-fw pi-home',
			  "command":(()=>{
				this.props.router.push('/restapi');
			  })
			},
			{
				label:'Vendas',
				icon:'pi pi-fw pi-shopping-cart',
				"command":(()=>{
					this.props.router.push('/sales');
				})
			},
			{
			  label:'Relatórios',
			  icon:'pi pi-fw pi-file',
			  "command":(()=>{
				this.props.router.push('/upload');
			  })
			},
			{
				label:'Arquivos',
				icon:'pi pi-fw pi-folder',
				"command":(()=>{
					this.props.router.push('/files');
				})
			},
			{
				label:'Perfil',
				icon:'pi pi-fw pi-user',
				"command":(()=>{
					this.props.router.push('/profile');
				})
			},
			{
				label:'Logout',
				icon:'pi pi-fw pi-power-off',
				"command":((event)=>{
				  signOut(auth).then(() => {
					this.menu.toggle(event)
					this.props.router.push('/login')
				  }).catch((error) => {
					// An error happened.
				  });
				})
			}
		  ];
	}
	componentDidMount () {
		this.setState({currentUser:this.props.user})
		this.props.onLoad?.(this)
		this.props.onMount?.(this)
	}
	render () {
		return (
			<div>
				{this.props?.header!= false && <div>
					<SlideMenu
						ref={(el) => this.menu = el}
						model={this.items}
						popup
						viewportHeight={48*this.items.length}
						// menuWidth={175}
					/>
					<Toolbar
						style={{
							color:"var(--text)",
							background:"var(--primary)",
							border:"5px",
							borderRadius:"0px",
							borderColor:"var(--primary-b)",
							// paddingTop:"20px",
							zIndex:2
						}}
						left={
							<div style={{
							display: "flex",
							justifyContent: "center"
							}}>
								{/* {this.state.currentUser && <span style={{position:"absolute", left:"30px", top:"32px", color:"var(--info)"}}>{this.state.currentUser.email}</span>} */}
								<img src='/images/logo_a.svg' alt={"logo"} style={{ marginLeft:"50vw", height:"60px", transform:"translateX(-50%)" }}/>
								{/* <h6 style={{ marginLeft:"10px", marginTop:"12px",color:"var(--info)"}}>{process.env.NEXT_PUBLIC_VERSION}</h6> */}
							</div>
						}
						right={
							<>
								{this.state.currentUser && 
								<Button
									className='p-button-outlined'
									icon="pi pi-bars"
									label={window.innerWidth > 500? "Menu": ""}
									style={{color:"var(--secondary)"}}
									onClick={(event) => this.menu.toggle(event)}
								/>}
							</>
						}
					/>
          
				</div>}

				<div>
					{this.props.children}
				</div>
			</div>
		)
	}
})