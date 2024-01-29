import React, { useRef, useState, useEffect } from "react"
import { useAuth } from "../../api/auth"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import localForage from "localforage";
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { add_data, get_all_data, set_data } from "../../api/firebase";
import upload_file, { get_folder } from "../../api/storage";

var vendedores_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'vendedores'
});

export default function IframeExternalURL(props){
    const { currentUser } = useAuth()
    const [rp_user, set_rp_user] = useState(null);
    const [loading_data, set_loading_data] = useState(false)
    const [editing_data, set_editing_data] = useState(props.edit?props.edit:false)
    const [dashboard_frame, set_dashboard_frame] = useState('');
	const [dashboard_name, set_dashboard_name] = useState('');
    const [iframeKey, setIframeKey] = useState(0);
    const iframeRef = useRef(null);
	const [iframe_uid, set_iframe_uid] = useState(null);
    const [selected_option_type, set_selected_option_type] = useState(null);
    const [selected_option_local, set_selected_option_local] = useState(null);
    const [dashbord_variables, set_dashbord_variables] = useState([])
    const [selected_image, set_selected_image] = useState(null);
    
 
    const toastTL = useRef(null);

    const showTopLeftToast = () => {
        toastTL.current.show({
            severity: 'info',
            summary: 'Sucesso',
            detail: 'Alterações foram salvas na nuvem.',
            life: 3000
        });
    }
	
    const handleSyncButtonClick = () => {
        // Increment the key to force a full reload of the iframe
        if (iframeRef.current) {
            // console.log(iframeRef,dashboard_frame)
            setIframeKey(iframeKey + 1);
            // iframeRef.current.contentWindow.location.reload();
        }
    };
    const handleSaveButtonClick = () => {
		
		let IframeState = {
			dashboard_name,
			dashboard_frame,
			selected_option_type,
			selected_option_local,
			dashbord_variables,
			selected_image
		}
		if(iframe_uid){
			IframeState.uid = iframe_uid
			console.log("Update Iframe on firebase", IframeState)
			set_data("external_url",iframe_uid,IframeState).then((e)=>{
				set_editing_data(false)
				props.onSave?.()
			})
		}else{
			if(selected_image){
				upload_file(selected_image,"iframe_image").then((data_url)=>{
					console.log(data_url)
					set_selected_image(data_url)
					IframeState.selected_image = data_url
					const frame_uid = add_data("external_url",IframeState)
					IframeState.uid = frame_uid
					// console.log(IframeState,frame_uid)
					set_editing_data(false)
					props.onSave?.()
				})
			}else{
				const frame_uid = add_data("external_url",IframeState)
				IframeState.uid = frame_uid
				set_iframe_uid(frame_uid)
				set_editing_data(false)
				props.onSave?.()
				// console.log(IframeState,frame_uid)
			}
		}
    };

    useEffect(()=>{
        // console.log(currentUser)
		
        vendedores_db.getItem(currentUser.email).then((seller)=>{
            if(seller){
                set_rp_user(seller)
            }
        })
    },[currentUser])

    useEffect(()=>{
        // console.log(test_context("test_action",{Numero:49}))
        // initFilters1()
		// console.log(props)
		if(props.data){
			set_dashboard_name(props.data.dashboard_name)
			set_dashboard_frame(props.data.dashboard_frame)
			set_selected_option_type(props.data.selected_option_type)
			set_selected_option_local(props.data.selected_option_local)
			set_dashbord_variables(props.data.dashbord_variables)
			set_selected_image(props.data.selected_image)
			set_iframe_uid(props.data.uid)
		}
    },[props.data])
    
    
    function siteFinalURL(){
        let final_url = dashboard_frame
        if(dashbord_variables.length>0){
            final_url +="?"
            if(selected_option_type==1){
                final_url+="params=%7B"
            }
            dashbord_variables.map((key,i)=>{
                if(selected_option_type==1){
                    final_url += "%22"+key.variavel +"%22:%22include%25EE%2580%25801%25EE%2580%2580IN%25EE%2580%2580"+ key.valor +"%22"
                    if(dashbord_variables.length-1 > i){
                        final_url += ","
                    }else{
                        final_url +="%7D"
                    }
                }else{
                    final_url += key.variavel +"="+ key.valor
                    if(dashbord_variables.length-1 > i) final_url += "&"
                }
            })
        }
        // console.log(currentUser)
        if(final_url.indexOf("USER_ID")!=-1 && rp_user){
            final_url =  final_url.replace("USER_ID",rp_user.id).replace("COMPANY_ID",rp_user.EMPRESA)    
        }
        return(final_url)
        
    }
	if(dashboard_frame==""){
		return(<div>
			{props.editable &&
			<Button
				className="w-full p-button-outlined mt-2"
				label="Adicionar um link novo"
				onClick={(e)=>{
					set_editing_data(true)
					set_dashboard_frame(" ")
					set_dashboard_name("")
					set_selected_option_type(null)
					set_selected_option_local(null)
					set_dashbord_variables([])
					set_selected_image(null)
					set_iframe_uid(null)
				}}
			/>}
		</div>)
	}
	if(editing_data==false){
		return(<div>
			{props.editable && <Button
				className="absolute p-button-lg text-blue-500 hover:text-white bg-glass-c hover:bg-bluegray-800 p-3 border-circle w-3rem h-3rem right-0 mr-4 mt-2" 
				icon="pi pi-pencil text-2xl"
				tooltip="Editar"
				tooltipOptions={{
					position:"left"
				}}
				onClick={(e)=>{
					set_editing_data(true)
				}}
			/>}
			<iframe key={iframeKey} src={siteFinalURL()} ref={iframeRef}/>
		</div>)
	}
    return(<div>
			<Button
				className="w-full p-button-outlined mt-2 p-button-danger"
				label={iframe_uid?"Cancelar edição do link":"Cancelar link novo"}
				onClick={(e)=>{
					set_editing_data(false)
					set_dashboard_frame("")
				}}
			/>
		<div className="grid flex flex-wrap mt-2">
			<div className="col-1 w-min max-w-10rem h-min justify-content-center flex flex-wrap flex-grow-1">
				<label htmlFor="image_icon" className="text-center mb-2">Imagem</label>
				{selected_image && <>
				<img
					className="w-full h-auto flex flex-grow-1 "
					alt={selected_image.name}
					role="presentation"
					src={selected_image.objectURL?selected_image.objectURL:selected_image}
					// height={100}
				/>
				<Button className="p-button-danger p-button-text mt-2"
					label="Remover"
					icon="pi pi-times"
					onClick={(e)=>{set_selected_image(null)}}
				/>
				</>}
				{!selected_image && <FileUpload mode="basic" onSelect={(event)=>{
					const files = Array.from(event.files);
					console.log(files)
					if(files.length >0) set_selected_image(files[0])
				}} accept="image/*" />}
			</div>
		<div className="col-5 flex-grow-1">
			<div className="gap-2 flex justify-content-between grid flex-grow-1">
				<span className=" p-float-label mt-4 flex-grow-1">
					<InputText className="w-full" id="name_input"
						value={dashboard_name}
						onChange={(e)=>{
							set_dashboard_name(e.target.value)
						}}
					/>
					<label htmlFor="name_input">Nome</label>
				</span>
				<span className="p-float-label mt-4 flex-grow-1">
					<Dropdown
						className="w-full"
						id="type_input"
						placeholder="Escolha uma opção"
						optionLabel="label"
						value={selected_option_type}
						onChange={(e)=>{
							set_selected_option_type(e.value)
						}}
						options={[
						{label:"Dashboard",value:1,var:"", and:","},
						{label:"Relatório",value:2,var:"", and:"&"},
						{label:"Câmera",value:3, and:""},
						{label:"Outros",value:4, and:""}
					]}/>
					<label htmlFor="type_input">Tipo</label>
				</span>
				{selected_option_type==1&&<span className="p-float-label mt-4 flex-grow-1">
					<Dropdown
						className="w-full"
						id="local_input"
						placeholder="Escolha uma opção"
						optionLabel="label"
						value={selected_option_local}
						onChange={(e)=>{
							set_selected_option_local(e.value)
						}}
						options={[
						{label:"Tela de Perfil",value:1},
						{label:"Tela de Agenda",value:2},
						{label:"Menu Dashbords",value:3}
					]}/>
					<label htmlFor="local_input">Local</label>
				</span>}
				<span className="p-float-label mt-4 w-full">
					<InputTextarea
						id="url_input"
						style={{
							width:"100%",
							minHeight:"40px",
							height:"40px",
							maxHeight:"300px"
						}}
						onPasteCapture={(e)=>{
							e.preventDefault()
							// console.log(e.clipboardData.getData('Text'));
							let isDash = false
							let url = e.clipboardData.getData('Text')
							if(url.indexOf("/u/0/")!=-1){
								set_selected_option_type(1)
								url = url.replace("/u/0/","/embed/")
								isDash = true
							}
							const query = url.split('?');
							const queryString = query[1]
							if (!queryString) {
								return [];
							}
							let extractedParameters = [];
							var queryParams = ""
							if(isDash){
								queryParams = new URLSearchParams(queryString);
								// console.log(queryParams)
								let index = 0
								queryParams.forEach((params) => {
									// extractedParameters[key] = value;
									const parameters = JSON.parse(params)
									// console.log(parameters)
									Object.keys(parameters).map((key, id) => {
										const entry = {
											id: index,
											variavel: key,
											tipo: "Valor Fixo",
											valor: parameters[key].replace("include%EE%80%801%EE%80%80IN%EE%80%80",""),
										};
										extractedParameters.push(entry);
										index+=1
									})
								});

								// return extractedParameters;
							}else{
								queryParams = queryString.split('&');

								queryParams.forEach((param, index) => {
									const paramParts = param.split('=');
									if (paramParts.length === 2) {
									const variable = paramParts[0];
									const value = paramParts[1];
									const entry = {
										id: index,
										variavel: variable,
										tipo: "Valor Fixo",
										valor: value,
									};
									extractedParameters.push(entry);
									}
								});
							}
							console.log(query[0],extractedParameters)
							set_dashbord_variables(extractedParameters)
							set_dashboard_frame(query[0])
							// return extractedParameters;
						}}
						value={dashboard_frame}
						onChange={(e) => {
						    set_dashboard_frame(e.target.value)
						}}
					/>
					<label htmlFor="url_input">URL</label>
				</span>
				
			</div>
			</div>
			
			<div className="sm:col-12 md:col-5 flex-grow-1">
				{dashbord_variables.map((row_data,index)=>{
					return(<div key={"url_var_"+index} className={(index%2==0?"bg-gray-800":"bg-gray-700")+" w-full flex justify-content-between p-1"}>
						<span className={index == 0?"p-float-label mt-4 w-full":"w-full"}>
							<InputText
								id="variable_name_input"
								style={{
									width:"100%"
								}}
								type="text"
								value={row_data.variavel}
								onChange={(e) => {
									let _dashbord_variables=[...dashbord_variables]
									_dashbord_variables[index].variavel = e.target.value
									set_dashbord_variables(_dashbord_variables)
								}}
							/>
							{index == 0 && <label htmlFor="variable_name_input">Variável</label>}
						</span>
						<span className={index == 0?"p-float-label mt-4 w-full":"w-full"}>

						<Dropdown 
							style={{width:"100%"}}
							value={row_data.tipo}
							options={[
								{ label: 'Sistema', value: "Sistema" },
								{ label: 'Manual', value: "Valor Fixo" },
							]}
							optionLabel="label"
							optionValue="value"
							onChange={(e) => {
								let _dashbord_variables=[...dashbord_variables]
								_dashbord_variables[index].tipo = e.value
								set_dashbord_variables(_dashbord_variables)
							}}
							placeholder="Tipo da variável"
						/>
						{index == 0 && <label htmlFor="variable_type_input">Tipo</label>}
						</span>
						{row_data.tipo == "Sistema"?
							<span className={index == 0?"p-float-label mt-4 w-full":"w-full"}>

								<Dropdown 
									style={{
									width:"100%"
									}}
									value={row_data.valor}
									options={[
										{ label: 'Client', value: 'CLIENT_ID' },
										{ label: 'Vendedor', value: 'USER_ID' },
										{ label: 'Empresa', value: 'COMPANY_ID' }
									]}
									optionLabel="label"
									optionValue="value"
									onChange={(e) => {
										let _dashbord_variables=[...dashbord_variables]
										_dashbord_variables[index].valor = e.value
										set_dashbord_variables(_dashbord_variables)
									}}
									placeholder="Valor da variável"
									// itemTemplate={(option) => {
									//     return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
									// }}
								/>
								{index == 0 && <label htmlFor="variable_value_input">Valor</label>}
							</span>
							:
							<span className={index == 0?"p-float-label mt-4 w-full":"w-full"}>
							<InputText
								id="variable_name_input"
								style={{
									width:"100%"
								}}
								type="text"
								value={row_data.valor}
								onChange={(e) => {
									let _dashbord_variables=[...dashbord_variables]
									_dashbord_variables[index].valor = e.target.value
									set_dashbord_variables(_dashbord_variables)
								}}
							/>
							{index == 0 && <label htmlFor="variable_value_input">Valor</label>}
						</span>
						}
						<span>
							{index == 0 && <label className="text-xs text-500">Excluir</label>}
							<Button className="p-button-text p-button-sm p-button-danger"
								icon="pi pi-times"
								onClick={(e)=>{
									let _dashbord_variables=[...dashbord_variables.slice(0,index), ...dashbord_variables.slice(index+1)]
									// console.log(_dashbord_variables)
									set_dashbord_variables(_dashbord_variables)
								}}
							/>
						</span>
					</div>)
				})}
				<Button className="p-button-success w-full p-button-text p-button-lg"
					icon="pi pi-plus"
					iconPos="right"
					label="Adicionar Variável" onClick={(e)=>{
					let _dashbord_variables = [...dashbord_variables];
					_dashbord_variables.push({
						id:dashbord_variables.length,
						variavel:"",
						tipo:"",
						valor:""
					})
					set_dashbord_variables(_dashbord_variables);
				}}/>
			</div>
			
			
			
			<div className='w-full h-full flex flex-wrap'>
				
				<div className="flex justify-content-between w-full p-2 surface-ground"> 
					<Button
						className="shadow-none w-full max-w-10rem p-button-text p-button-lg p-button-secondary"
						label="Recarregar" icon="pi pi-sync"
						onClick={handleSyncButtonClick}
					/>
					<Button className="shadow-none p-button-secondary w-full h-full border-round-md text-gray-500 hover:text-gray-100 surface-50 "
					><h6 className="pt-2 white-space-nowrap hover:white-space-normal overflow-hidden text-overflow-ellipsis">{JSON.stringify(siteFinalURL()).substring(1).replace('"','')}</h6></Button>
					<Button 
						className="shadow-none w-full max-w-10rem p-button-text p-button-lg"
						iconPos="right"
						label={iframe_uid?"Atualizar":"Salvar"}
						icon="pi pi-save"
						onClick={handleSaveButtonClick}
					/>

				</div>
				{dashboard_frame!= " " && <iframe key={iframeKey} src={siteFinalURL()} ref={iframeRef}/>}
			</div>
		</div>
	</div>);
}