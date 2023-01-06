import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { readUserData, writeUserData } from "../../api/firebase";
import { InputText } from "primereact/inputtext";
import { SelectButton } from 'primereact/selectbutton';
import { MultiSelect } from "primereact/multiselect";

export default class ProfileInfo extends React.Component{
    constructor(props){
        super(props)
        this.state={
            show: false,
            name:"",
            banner:"1",
            photo_index:"1",
            sex: 'male',
            user: {},
        }

        this.options = [
            {label:'Masculino', value:'male'},
            {label:'Feminino', value:'female'},
            // {label:'Super', value:'super'}
        ];

        this.photoOptions = ['1','2','3','4'];
        this.photoTemplate = this.photoTemplate.bind(this);

        this.bannerOptions = ['1','2','3','4','5'];
        this.bannerTemplate = this.bannerTemplate.bind(this);
    }
    setCurrentUser(){
        if(this.props.user) this.setState({
            user: this.props.user,
            name: this.props.user.name,
            sex: this.props.user.photo.split('_')[0],
            photo_index: this.props.user.photo.split('_')[1],
            banner: this.props.user.banner,
            metadata: this.props.user.metadata,
        })
    }
    componentDidMount(){
        this.setCurrentUser()
    }
    
    photoTemplate(option) {
        return <img src={`images/avatar/${this.state.sex}_${option}.jpg`}
        style={{
            width:"100%",
            borderRadius:"10px"
        }}/>;
    }
    bannerTemplate(option) {
        return <img src={`images/background/bg_${option}_icon.jpg`}
        style={{
            width:"100%",
            borderRadius:"10px"
        }}/>;
    }

    render(){
        return(
            <>
            <Dialog
                blockScroll
                header={<>
                    {this.state.user?.email}
                </>}
                draggable={false}
                visible={ this.props.show }
                style={{ width: '90vw', maxWidth:"800px"}}

                onHide={()=>{
                    this.setCurrentUser()
                    this.props?.onHide()
                }}

                footer={
                    <div className="flex justify-content-between" style={{marginTop:"10px", width:"100%"}}>
                        <Button
                            icon="pi pi-undo"
                            className="p-button-outlined p-button-sm p-button-info"
                            label="Desfazer"
                            onClick={(event)=>{
                                this.setCurrentUser()
                            }}
                            />
                        <Button
                            icon="pi pi-check"
                            className="p-button-outlined p-button-sm"
                            label="Salvar Alteração"
                            onClick={(event)=>{
                                writeUserData(
                                    this.state.user.uid,
                                    this.state.user.name,
                                    this.state.user.email,
                                    this.state.user.photo,
                                    this.state.user.role,
                                    this.state.user.banner,
                                    this.state.user.metadata,
                                    this.state.user.fingerprints
                                )
                                console.log(this.state.user)
                                this.props.updateUser(this.state.user);
                            }}
                        />
                    </div>
                }
            >

                <div className="flex p-fluid grid formgrid">
                    <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
                        <label>Nome Completo</label>
                        <InputText value={this.state.name} onChange={(event)=>{
                            // console.log(event.target.value)
                            var _user = {...this.state.user}
                            _user.name = event.target.value
                            this.setState({user:_user,name:event.target.value})
                        }}/>
                    </div>
                    
                    <div className="flex-grow-1 field sm:col-6 md:col-3 lg:col-3">
                        <label>Pronome</label>
                        <SelectButton
                            value={this.state.sex}
                            options={this.options}
                            onChange={(event) => {
                                if(event.value == null) return
                                var _user = {...this.state.user}
                                _user.photo = event.value+"_"+this.state.photo_index
                                this.setState({user:_user, sex: event.value })
                            }}
                        />
                    </div>
                    <div className="flex-grow-1 field col-12">
                        <label>Photo do Perfil</label>
                        <SelectButton
                            style={{padding:"0px"}}
                            value={this.state.photo_index}
                            options={this.photoOptions}
                            itemTemplate={this.photoTemplate}
                            optionLabel="value"
                            onChange={(event) => {
                                if(event.value == null) return
                                var _user = {...this.state.user}
                                _user.photo = this.state.sex+"_"+event.value
                                this.setState({user:_user, photo_index: event.value })
                            }}
                        />
                    </div>

                    <div className="flex-grow-1 field col-12">
                        <label>Photo do Banner</label>
                        <SelectButton
                            style={{padding:"0px"}}
                            value={this.state.banner}
                            options={this.bannerOptions}
                            itemTemplate={this.bannerTemplate}
                            optionLabel="value"
                            onChange={(event) => {
                                if(event.value == null) return
                                var _user = {...this.state.user}
                                _user.banner = event.value
                                this.setState({user:_user, banner: event.value })
                            }}
                        />
                    </div>

                </div>

            </Dialog>
            </>
        )
    }
}