import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { InputText } from 'primereact/inputtext';
import { copyToClipBoard, downloadURI, NodeService } from "../utils/util";
import { useAuth } from "../api/auth"
import {
    getStorage,
    ref,
    getMetadata,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
} from "firebase/storage";

// Create a root reference
const storage = getStorage();

export default function Uploader() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteFileDialog, setDeleteFileDialog] = useState(false);
    const [uploadedFiles, set_uploadedFiles] = useState([])
    const [totalSize, setTotalSize] = useState(0);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const { currentUser } = useAuth()
    const [currentFile, setCurrentFile] = useState('');
    const [datatableMessage, setDatatableMessage] = useState('Carregando...');
    const [updateRender, setUpdateRender] = useState(false);
    
    const [nodes, setNodes] = useState([]);
    const [globalFileFilter, setGlobalFileFilter] = useState(null);
    const nodeservice = new NodeService();

    // useEffect(() => {
    //     nodeservice.getTreeTableNodes().then(data => {
    //         // console.log(data)
    //         setNodes(data)
    //     });
    // }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(()=>{
        if(totalSize == 0 && currentUser){
            // Create a reference under which you want to list
            const listRef = ref(storage, 'reports/');
    
            var _uploaded = []
            var _uploadedFiles = []
            // Find all the prefixes and items.
            listAll(listRef).then(async(res) => {
                
                res.items.map((itemRef)=>{
                    _uploaded.push(getMetadata(itemRef).then((data)=>{
                        if(data.customMetadata){
                            // console.log(data.customMetadata)
                            if(data.customMetadata.isPublic === 'true'){
                                _uploadedFiles.push({Nome:itemRef.name, ref:itemRef, Publico:'Sim', user:data.customMetadata.user_uid})
                            }else if(data.customMetadata.user_uid === currentUser.uid){
                                _uploadedFiles.push({Nome:itemRef.name, ref:itemRef, Publico:'Não', user:data.customMetadata.user_uid})
                            }
                        }else{
                            _uploadedFiles.push({ Nome:itemRef.name, ref:itemRef , Publico:'Sim', user:null})
                        }
                    }))
                })
                
                await Promise.all(_uploaded)
                // console.log(_uploadedFiles)
                if(_uploadedFiles.length == 0){
                    setDatatableMessage("Faça o upload de um arquivo.")
                }
                set_uploadedFiles(_uploadedFiles)
            }).catch((error) => {
                // Uh-oh, an error occurred!
            });
        }
        // console.log(currentUser.uid)
        
    },[totalSize, currentUser])

    const onUpload = () => {
        toast.current.show({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
    }

    const onTemplateSelect = (event) => {
        const files = Array.from(event.files);

        if (files.length > 10) {
            Swal.fire('Warning !', 'Maximum files upload limit is 10', 'warning')
            return false
        }

        files.forEach((file) => {
            // if(this.validateFile(file)) {
            file.isPublic = false; // <-- This will add the new property to the object reference stored for that file object.
            // this.setState((prevState) => {
            //     return {
            //     ...prevState,
            //     selectedFiles: this.uniqueFiles([...prevState.selectedFiles, file]),
            //     }
            // });
            // }
        });
    }

    const onTemplateUpload = (e) => {
        let _totalSize = 0;
        e.files.forEach(file => {
            _totalSize += (file.size || 0);
        });

        // setTotalSize(_totalSize);
        toast.current.show({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
    }

    const onTemplateRemove = (file, callback) => {
        // setTotalSize(totalSize - file.size);
        callback();
    }

    const onTemplateClear = () => {
        setCurrentFile('')
        setTotalSize(0);
    }
    
    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        // const value = totalSize/10000;
        // const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0';

        return (
            <div className={className} style={{ display: 'flex', alignItems: 'center'}}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                {/* <h6 style={{ marginTop:"10px",marginLeft: 'auto'}}>{currentFile}</h6> */}
                <ProgressBar
                    value={totalSize}
                    displayValueTemplate={() => `${Math.floor(totalSize)}%`}
                    style={{width: '100px', height: '20px', marginLeft: 'auto'}}>
                </ProgressBar>
            </div>
        );
    }

    const itemTemplate = (file, props) => {
        file.remove = props.onRemove
        // console.log(file)
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{width: '40%'}}>
                    {/* <img alt={file.name} role="presentation" src={file.objectURL} width={100} /> */}
                    <i className="pi pi-file p-2"
                        style={{
                            'fontSize': '3em',
                            color: 'var(--info)'
                        }}>
                    </i>
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="success" className="px-3 py-2 " />

                <ToggleButton 
                    checked={file.isPublic}
                    onChange={function(e){
                        file.isPublic = !file.isPublic
                        setUpdateRender(!updateRender)
                    }}
                    onLabel="Público"
                    offLabel="Privado"
                    onIcon="pi pi-users"
                    offIcon="pi pi-user"
                    style={{marginLeft:'auto'}}
                />
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
            </div>
        )
    }
    
    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-copy p-5"
                    style={{
                        'fontSize': '5em',
                        borderRadius: '50%',
                        backgroundColor: 'var(--surface-b)',
                        color: 'var(--surface-d)'
                    }}>
                </i>
                <span style={{'fontSize': '1.2em', color: 'var(--text-color-secondary)'}} className="mt-4">Para subir arquivos, arraste-os aqui.</span>
            </div>
        )
    }

    const firebaseUploader = async (event) => {
        // convert file to base64 encoded 
        // console.log(event.files)
        const file = event.files.shift();
        setCurrentFile(file.name)
        // Upload file and metadata to the object 'images/mountains.jpg'
        const metadata = {
            customMetadata:{
                'isPublic':file.isPublic,
                'user_uid':currentUser.uid
            }
        }
        const storageRef = ref(storage, 'reports/' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            setTotalSize(progress)
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log('Upload is running');
                break;
            }
        }, 
        (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
            case 'storage/canceled':
                // User canceled the upload
                break;

            case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
        }, 
        () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                file.remove()
                // setTotalSize(totalSize - file.size);
                if(event.files.length > 0){
                    firebaseUploader(event)
                }else{
                    onTemplateClear()
                }
            });
        }
        );
    }

    const chooseOptions = {icon: 'pi pi-fw pi-folder-open', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined'};
    const uploadOptions = {icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'};
    const cancelOptions = {icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'};

    const confirmDeleteFile = (file) => {
        console.log(file)
        setSelectedFile(file);
        setDeleteFileDialog(true);
    }

    const hideDeleteFileDialog = () => {
        setDeleteFileDialog(false);
    }

    const deleteFileFirebase = () => {
        console.log("DELETE", selectedFile)
        
        // Delete the file
        deleteObject(selectedFile.ref).then(() => {
            // File deleted successfully
            let _files = uploadedFiles.filter(val => val.Nome !== selectedFile.Nome);
            console.log(_files)
            set_uploadedFiles(_files);
            setDeleteFileDialog(false);
            setSelectedFile(null);
            toast.current.show({ severity: 'success', summary: 'Successo', detail: 'Arquivo Excluído', life: 3000 });
        }).catch((error) => {
            // Uh-oh, an error occurred!
        });
    }

    const getLink = (file) => {
        console.log(file)
        getDownloadURL(file.ref).then((downloadURL) => {
            console.log(file.ref.name,"no link:", downloadURL)
            toast.current.show({ severity: 'info', summary: 'Ctrl+C', detail: "Link copiado para área de transferência!" });
            copyToClipBoard(downloadURL)
        })
    }

    const downloadFile = (file) => {
        // console.log(file)
        getDownloadURL(file.ref).then((downloadURL) => {
            downloadURI(downloadURL, file.ref.name)
        })
    }

    const deleteFileDialogFooter = (
        <React.Fragment>
            <Button label="Sim" icon="pi pi-check" className="p-button-danger" onClick={deleteFileFirebase} />
            <Button label="Não" icon="pi pi-times" className="p-button-success" onClick={hideDeleteFileDialog} />
        </React.Fragment>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button
                    icon="pi pi-cloud-download"
                    className="p-button-rounded p-button-success mx-1 my-1"
                    onClick={() => downloadFile(rowData)}
                    tooltip="Download"
                    tooltipOptions={{ position: 'right', mouseTrack: true, mouseTrackLeft: 20 }}
                />
                <Button
                    icon="pi pi-link"
                    className="p-button-rounded p-button-info mx-1 my-1"
                    onClick={() => getLink(rowData)}
                    tooltip="Copiar Link"
                    tooltipOptions={{ position: 'right', mouseTrack: true, mouseTrackLeft: 20 }}
                />
                {(rowData.user === currentUser?.uid ) && <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-warning mx-1  my-1"
                    onClick={() => confirmDeleteFile(rowData)}
                    tooltip="Excluir"
                    tooltipOptions={{ position: 'right', mouseTrack: true, mouseTrackLeft: 20 }}
                />}
            </React.Fragment>
        );
    }

    const getHeader = (globalFilterKey) => {
        return (
            <div className="text-right">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => setGlobalFileFilter(e.target.value)} placeholder="Global Search" size="50" />
                </div>
            </div>
        );
    }

    let filesHeader = getHeader('globalFileFilter');

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Upload"
            }}
        >
            
            <Toast ref={toast}></Toast>

            <Dialog
                visible={deleteFileDialog}
                style={{ width: '450px' }}
                header="Confirmar"
                modal
                footer={deleteFileDialogFooter}
                onHide={hideDeleteFileDialog}
            >
                <div className="confirmation-content" style={{textAlign:"center"}}>
                    <div><i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '3rem'}} /></div>
                    {selectedFile && <span>Tem certeza, excluir <b>{selectedFile.Nome}</b>?</span>}
                </div>
            </Dialog>

            {/* <div className="grid" style={{position:"absolute", backgroundColor:"transparent"}}> */}
                <div 
                    style={{
                        position:"absolute",
                        padding:"10px",
                        maxWidth:"800px",
                        backgroundColor:"var(--glass)",
                        width:"100%",
                        textAlign:"center",
                        borderRadius:"5px",
                        backdropFilter: "blur(30px)",
                        marginTop:"10px",
                        left:"50%",
                        transform:"translateX(-50%)"
                    }}
                >
                    
                    <h5 style={{color:"white"}}>Upload de Arquivos</h5>
                        <FileUpload
                            ref={fileUploadRef}
                            name="demo[]"
                            multiple
                            customUpload
                            // accept=".mrt"
                            // maxFileSize={1000000}
                            // onUpload={onTemplateUpload}
                            onSelect={onTemplateSelect}
                            onError={onTemplateClear}
                            onClear={onTemplateClear}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemTemplate}
                            emptyTemplate={emptyTemplate}
                            chooseOptions={chooseOptions}
                            uploadOptions={uploadOptions}
                            cancelOptions={cancelOptions}
                            uploadHandler={firebaseUploader}
                        />

                    <DataTable
                        style={{marginTop:"10px"}}
                        showGridlines
                        size="small"
                        value={uploadedFiles}
                        emptyMessage={datatableMessage}
                        responsiveLayout="scroll"
                        paginator={uploadedFiles.length > 10?true:false}
                        paginatorTemplate={uploadedFiles.length > 10?"CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown":null}
                        currentPageReportTemplate={uploadedFiles.length > 10?"Exibindo {first} à {last} de {totalRecords} registros":null}
                        rows={uploadedFiles.length > 10?10:0}
                        rowsPerPageOptions={uploadedFiles.length > 10?[10,20,50,100]:null}
                        >
                            <Column header="Ações" body={actionBodyTemplate} exportable={false} style={{ width: '170px', textAlign:"center" }}></Column>
                        {uploadedFiles && uploadedFiles[0] && Object.keys(uploadedFiles?.[0]).map((col,i) => {
                            if(col != "ref" && col != "user") return <Column sortable key={col} field={col} header={col} />;
                        })}
                        
                    </DataTable>
                </div>
                {/* <div className={`col-12 pl-4 pr-4`}
                    style={{
                        padding:"10px",
                        maxWidth:"800px",
                        backgroundColor:"var(--glass)",
                        width:"100%",
                        textAlign:"center",
                        borderRadius:"5px",
                        backdropFilter: "blur(30px)",
                        marginTop:"10px",
                    }}
                >
                    <TreeTable value={nodes} globalFilter={globalFileFilter} header={filesHeader}>
                        <Column field="name" header="Name" expander filter filterPlaceholder="Filter by name"></Column>
                        <Column field="size" header="Size" filter filterPlaceholder="Filter by size"></Column>
                        <Column field="type" header="Type" filter filterPlaceholder="Filter by type"></Column>
                    </TreeTable>
                </div>               */}
            {/* </div> */}
        </ObjectComponent>
    );
}