//--> Template <--//
import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
//--> Comonents <--//
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { BreadCrumb } from 'primereact/breadcrumb';
import { FileUpload } from 'primereact/fileupload';
//--> Alerts <--//
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';

export default function Files(){

    const { currentUser } = useAuth()
    const [directory, setDirectory] = useState([]);
    const home = { icon: 'pi pi-home', url: 'https://pilarpapeisrest.web.app/files' }
    
    const breadCrumbClick = function(event){
        // console.log(event.item.id)
        var _directory = [...items]
        _directory =  _directory.slice( 0, event.item.id+1 )
        setDirectory( _directory )
    }

    const items = [
        {
            id:0,
            label: 'Arquivos',
            command:breadCrumbClick
        },
        {
            id:1,
            label: 'Campanhas',
            command:breadCrumbClick
        },
        {
            id:2,
            label: 'Nova campanha',
            command:breadCrumbClick
        },
        
    ];

    useEffect(()=>{
        setDirectory([...items])
        // console.log(currentUser)
    },[currentUser])

    const customBase64Uploader = async (event) => {
        // convert file to base64 encoded
        const file = event.files[0];
        const reader = new FileReader();
        let blob = await fetch(file.objectURL).then(r => r.blob()); //blob:url
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            const base64data = reader.result;
            console.log(base64data);
        }
    }

    const chooseOptions = {label: 'Subir arquivo', icon: 'pi pi-fw pi-cloud-upload'};
    const uploadOptions = {label: 'Fazer Uplaod', icon: 'pi pi-upload', className: 'p-button-success'};
    const cancelOptions = {label: 'Cancelar', icon: 'pi pi-times', className: 'p-button-danger'};

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Arquivos"
            }}
        >
            <div style={{
                position:"absolute",
                width:"100vw"
            }}>
                <Toolbar
                    left={
                        <div
                            style={{
                                display:"flex",
                                justifyContent:"center"
                            }}>

                                <BreadCrumb model={directory} home={home} />
                            
                                <Button
                                    icon="pi pi-plus"
                                    label="Nova Pasta"
                                    className="p-button-outlined ml-2"
                                ></Button>
                        </div>
                    }
                    right={
                        <div>
                            <FileUpload
                                mode="basic"
                                name="demo[]"
                                // accept="image/*"
                                chooseOptions={chooseOptions}
                                uploadOptions={uploadOptions}
                                cancelOptions={cancelOptions}
                                customUpload
                                uploadHandler={customBase64Uploader}
                            />
                        </div>
                    }
                />
            </div>
        </ObjectComponent>
    );
}