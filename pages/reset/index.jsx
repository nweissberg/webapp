import React, { Component, useRef, useEffect, useState } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from "primereact/button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabView, TabPanel } from 'primereact/tabview';
import ObjectComponent from "../components/object";
import { InputText } from 'primereact/inputtext';
import { Menubar } from 'primereact/menubar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import Swal from 'sweetalert2';
import { api_get } from '../api/connect';
import { Toast } from 'primereact/toast';
import { useAuth } from "../api/auth"
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/router'
import { add_data, get_data, set_data, del_data} from '../api/firebase';
import { uid, copyToClipBoard, syntaxHighlight, createId } from '../utils/util';
import { Tree } from 'primereact/tree';
import { ToggleButton } from 'primereact/togglebutton';
import { Editor } from 'primereact/editor';
import 'primeflex/primeflex.css';
import { Dialog } from 'primereact/dialog';
// import Localbase from "./utils/localbase"



export default function Home() {
  // let db_localbase = new Localbase('sql_to_rest')
  const router = useRouter()

  const newDB = function(){
    return({
      "name":"",
      "user":"",
      "password":"",
      "server":"",
      "database":""
    })
	}

  const credentials = newDB()

  const { currentUser } = useAuth()
  const toast = useRef(null)
  const [SQL, setSQL] = useState({text:'', html:''})
  const [outSQL, setOutSQL] = useState('')
  const [bodySQL, setBodySQL] = useState({})
  const [databases, setDatabases] = useState({})
  const [editDB, setEditDB] = useState(false)
  const [selectedDB, setSelectedDB] = useState({...credentials})
  const [configDB, setConfigDB] = useState(false)
  const [queryData, setQueryData] = useState(null)
  const [keyVars, setKeyVars] = useState([])
  const [canSave, setCanSave] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [editingRows, setEditingRows] = useState({})
  const [editLast, setEditLast] = useState(false)
  const [runQuery, setRunQuery] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectItem, setSelectItem] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileName, setFileName] = useState('');
  const [queryFiles, setQueryFiles] = useState([]);
  const [linkToAPI, setLinkToAPI] = useState(false);
  const [reloadFiles, setReloadFiles] = useState(false);
  

  const [userStorage, setUserStorage] = useState([
    {
      "key": "0",
      "label": "Documentos",
      "data": "Documents Folder",
      "icon": "pi pi-fw pi-inbox",
      "children": []
    },
    {
      "key": "1",
      "label": "Database",
      "data": "Movies Folder",
      "icon": "pi pi-fw pi-database",
      "children": []
    }
  ])
  const [menuOptions, setMenuOptions] = useState([
    {
      label: 'Arquivo',
      icon: 'pi pi-fw pi-file',
      items: [
        {
          label: 'Novo',
          icon: 'pi pi-fw pi-plus',
          command:(()=>{
            setSQL({text:'', html:''})
            setOutSQL('')
            setBodySQL({credentials: selectedDB.id, keys:[], sql:''})
            setActiveTabIndex(0)
            setSelectedFile('')
            setRunQuery(false)
            setFileName('')
            setKeyVars([])
            setQueryData(null)
          })
        },
        {
            separator: true
        },
        // {
        //     label: 'Exportar',
        //     icon: 'pi pi-fw pi-external-link'
        // }
      ]
    },
    {
      label: 'Banco de Dados',
      icon: 'pi pi-fw pi-server',
      items: [
        {
          label: 'Novo',
          icon: 'pi pi-fw pi-plus',
          command:(()=>{
            setConfigDB(true)
            setSelectedDB(newDB())
          })
        },
        {
          separator: true
        }
      ]
    }
  ])

  const statuses = [
    { label: 'Booleno', value: 'BOOL' },
    { label: 'Caractere', value: 'CHAR' },
    { label: 'String', value: 'STRING' },
    { label: 'Inteiro', value: 'INT' },
    { label: 'Float', value: 'FLOAT' },
    { label: 'Data', value: 'DATE' },
    { label: 'Dinheiro', value: 'MONEY' },
  ];

  useEffect(()=>{
    var _databases = {...databases};
    var _menuOptions = [...menuOptions];
    var _userStorage = [...userStorage];
    var _queryFiles = [...queryFiles];
    // console.log(_menuOptions[0].items[1].items)

    get_data("query").then((data)=>{
      _userStorage[0].children = []
      data.forEach((doc) => {
        const file = doc.data()
        // console.log(file.uid)
        if(_queryFiles[file.name]) return
        _queryFiles[file.name] = file

        var index = _userStorage[0].children.length
        _userStorage[0].children.push({
          "key": `0-${index}`,
          "icon": "pi pi-fw pi-file",
          "label": file.name,
          "data": file,
          "type": "file"
        })

        if(_menuOptions[0].items.map((i)=>i.label).includes(file.name) == false){
          _menuOptions[0].items.push({
            label: file.name,
            icon: 'pi pi-fw pi-file',
            command:(()=>{
              // const file = event.node.data
              setSQL(file)
              setFileName(file.name)
              setSelectedFile(file.uid)
              var _bodySQL = {
                credentials: selectedDB.id,
                keys:file.keys?file.keys:[],
                sql:file.uid
              }
              if(file.keys) {
                setKeyVars(file.keys)
              }else{
                setKeyVars([])
              }
              setBodySQL(_bodySQL)
            })
          })
        }
      })
    })

    get_data("database").then((data)=>{
      data.forEach((doc) => {
        const db_credentials = doc.data()
        db_credentials.id = doc.id
        // console.log(db_credentials)
        if(!_databases[doc.id]){
          _databases[doc.id] = db_credentials;
          if(_menuOptions[1].items.map((i)=>i.label).includes(db_credentials.name) == false){
            var index = _userStorage[1].children.length
            _userStorage[1].children.push({
              "key": `1-${index}`,
              "icon": "pi pi-fw pi-folder",
              "label": db_credentials.name,
              "data": db_credentials,
              "leaf": false,
              "children": []
            })
            _menuOptions[1].items.push({
              label: db_credentials.name,
              icon: 'pi pi-fw pi-database',
              command:(()=>{
                setSelectedDB(db_credentials)
                setEditDB(false)
                setConfigDB(false)
                setCanSave(false)
              })
            })
          }
        }
        // console.log(`${doc.id} => ${JSON.stringify(doc.data())}`); 
      });
      if(Object.keys(_databases).length == 1) setSelectedDB(_databases[Object.keys(_databases)[0]])
      setMenuOptions(_menuOptions)
      setDatabases(_databases)
      setUserStorage(_userStorage)
      setQueryFiles(_queryFiles)
      // console.log(_databases)
    })
  },[reloadFiles])

  useEffect(()=>{
    if(editLast){
      setActiveRowIndex(keyVars.length-1)
      setEditLast(false)
    }
  }, [keyVars])

  useEffect(()=>{
    // console.log(currentUser)
    if(!currentUser) router.push('/login')
  }, [currentUser])

  useEffect(()=>{
    // console.log(selectedKeys)
    if(selectedKeys.length >= 1){
      setCanDelete(true)
    }else{
      setCanDelete(false)
    }
  },[selectedKeys])

  if(!currentUser) return(<><ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}></ProgressBar></>)

  const end = <InputText placeholder="Pesquisar" type="text" />;

  const textEditor = (options) => {
    return <InputText
      style={{
        width:"100%"
      }}
      type="text"
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
    />;
  }

  const statusEditor = (options) => {
    return (
      <Dropdown 
        style={{
          width:"100%"
        }}
        value={options.value}
        options={statuses}
        optionLabel="label"
        optionValue="value"
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Tipo da variável"
        // itemTemplate={(option) => {
        //     return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
        // }}
      />
    );
  }

  const onRowEditComplete = (e) => {
    let _keyVars = [...keyVars];
    let { newData, index } = e;

    _keyVars[index] = newData;

    setKeyVars(_keyVars);
  }

  const setActiveRowIndex = (index) => {
    let _editingRows = { ...editingRows, ...{ [`${keyVars[index].key}`]: true } };
    setEditingRows(_editingRows);
  }

  const onRowEditChange = (e) => {
    setEditingRows(e.data);
  }
  
  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" className="p-button-outlined" onClick={clearFilter1} />
          <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilterValue1} onChange={onGlobalFilterChange1} placeholder="Keyword Search" />
          </span>
      </div>
    )
  }
  
  return (
    <ObjectComponent
      user={currentUser}
      onLoad={(e)=>{
        document.title = "Home"
      }}
    >
      <div style={{
        position:"absolute",
        // backgroundColor:"rgba(255,255,255,0.1)",
        // backdropFilter: "blur(5px)",
        width:"100%",
        
      }}>
        <Toast ref={toast} position="bottom-right"/>
        {/*/==>   Formulário do Banco SQL   <==/*/}

        <div className='flex justify-content-between align-items-start flex-wrap card-container'>
        {configDB &&
          <div
            style={{
              minWidth:"400px",
              backgroundColor:"var(--glass)",
              width:"100%",
              height:"100%",
              borderRadius:"5px",
              backdropFilter: "blur(30px)"
            }}
            className="
              flex-1
              flex-order-2
              md:flex-order-0
              p-2
              justify-content-center
              md:w-20rem
              font-bold
              text-white
              border-round
              m-2"
          >
          <div>
            <div
              style={{
                // background:"black",
                minWidth:"200px",
                width:'100%',
                height:"100%"
              }}>

                <h6>Nome</h6>
                <InputText
                  disabled={!editDB}
                  className='p-inputtext-sm mb-2'
                  style={{width:"100%"}}
                  value={selectedDB.name}
                  onChange={(e) => {
                    var _selectedDB = {...selectedDB}
                    _selectedDB.name = e.target.value
                    setSelectedDB(_selectedDB)
                    setCanSave(true)
                  }}
                />

                <h6>Servidor</h6>
                <InputText
                  disabled={!editDB}
                  className='p-inputtext-sm mb-2'
                  style={{width:"100%"}}
                  value={selectedDB.server}
                  onChange={(e) => {
                    var _selectedDB = {...selectedDB}
                    _selectedDB.server = e.target.value
                    setSelectedDB(_selectedDB)
                  }}
                />
                
                <h6>Database</h6>
                <InputText
                  disabled={!editDB}
                  className='p-inputtext-sm mb-2'
                  style={{width:"100%"}}
                  value={selectedDB.database}
                  onChange={(e) => {
                    var _selectedDB = {...selectedDB}
                    _selectedDB.database = e.target.value
                    setSelectedDB(_selectedDB)
                  }}
                />

                <h6>Usuário</h6>
                <InputText
                  disabled={!editDB}
                  className='p-inputtext-sm mb-2'
                  style={{width:"100%"}}
                  value={selectedDB.user}
                  onChange={(e) => {
                    var _selectedDB = {...selectedDB}
                    _selectedDB.user = e.target.value
                    setSelectedDB(_selectedDB)
                  }}
                />

                <h6>Senha</h6>
                <Password
                  disabled={!editDB}
                  toggleMask
                  feedback={false}
                  className='p-inputtext-sm mb-2'
                  style={{width:"100%"}}
                  value={selectedDB.password}
                  onChange={(e) => {
                    var _selectedDB = {...selectedDB}
                    _selectedDB.password = e.target.value
                    setSelectedDB(_selectedDB)
                  }}
                />

              </div>
            </div>
              <div>
                {editDB?
                <Button
                  className='p-button-danger'
                  iconPos="right"
                  icon="pi pi-trash"
                  style={{
                    width:"48%",
                    marginRight:"4%",
                    background:"var(--orange-700)",
                    borderColor:"var(--orange-800)",
                    color:"var(--text)"
                  }}
                  label='Excluir'
                  onClick={()=>{
                    
                    Swal.fire({
                      title: 'Tem certeza?',
                      text: "Você não poderá desfazer essa ação!",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: 'var(--teal-700)',
                      cancelButtonColor: 'var(--orange-700)',
                      confirmButtonText: 'Sim, deletar!'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        Swal.fire(
                          'Excluído!',
                          `O banco de dados "${selectedDB.name}" foi excluído.`,
                          'success'
                        )
                        setSelectedDB(newDB())
                        setConfigDB(false)
                      }
                      setEditDB(false)
                    })
                  }}
                />
                :
                <Button
                  className='p-button-secondary'
                  iconPos="right"
                  icon="pi pi-pencil"
                  style={{
                    width:"48%",
                    marginRight:"4%"
                  }}
                  label='Editar'
                  onClick={()=>{
                    setEditDB(true)
                  }}
                />}
                <Button
                  // className='p-button-success'
                  iconPos="right"
                  icon="pi pi-save"
                  style={{
                    width:"48%",
                    background:"var(--teal-700)",
                    borderColor:"var(--teal-800)",
                    color:"var(--text)"
                  }}
                  disabled={!canSave}
                  label='Salvar'
                  onClick={()=>{
                    setCanSave(false)

                    add_data('database',selectedDB);
                    
                    Swal.fire(
                      selectedDB.name,
                      'Credenciais registradas com sucesso!',
                      'success'
                    ).then(()=>{
                      setConfigDB(false)
                    })
                  }}
                />
              </div>
          </div>
        }

          <div 
            className="flex-grow-1 md:flex-1 flex align-items-center justify-content-center border-round m-2"
            style={{
              maxWidth:"100%",
              width:"100%",
              minWidth:"auto"
            }}>
          <div
            style={{
              backgroundColor:"var(--glass)",
              width:"100%",
              height:"100%",
              borderRadius:"5px",
              backdropFilter: "blur(30px)"
            }}
          >
            <div className='mb-4'>
              <Menubar
                model={menuOptions}
                end={
                  <Button
                    iconPos='right'
                    icon="pi pi-cog"
                    label={selectedDB.name}
                    className="p-button-link"
                    onClick={()=>{
                      setConfigDB(!configDB)
                      setEditDB(false)
                    }}
                  />
                }
              />
            </div>
            <div className="grid">
              <div className={`col-12 pl-4 pr-4`}>
              <TabView
                activeIndex={activeTabIndex}
                onTabChange={(e)=>{
                  setActiveTabIndex(e.index)
                  if(e.index == 2){
                    var _bodySQL = {
                      credentials: selectedDB.id,
                      keys:[...keyVars],
                      sql:SQL.uid
                    }
                    setBodySQL(_bodySQL)
                  }
                }}
              >
                <TabPanel header="Script SQL">
                <Editor
                  headerTemplate={
                    <div>
                      <InputText
                        value={fileName}
                        placeholder='Nome_do_arquivo'
                        style={{
                          position:"absolute",
                          right:"38px",
                          width:"calc(100% - 76px)",
                          textAlign:"right",
                          color:"var(--info)",
                          backgroundColor:"rgba(0,0,0,0)",
                          border:"0px"
                        }}
                        onChange={(e) => setFileName(e.target.value)}
                      />
                      <Button
                        style={{
                          width:"auto",
                          height:"40px",
                          color:"var(--text)",
                          // zIndex:1
                        }}
                        label='Salvar'
                        className='p-button-text'
                        icon={selectedFile === ''?'pi pi-save':'pi pi-sync'}
                        onClick={()=>{
                          if(selectedFile !== ''){
                            console.log(selectedFile,keyVars)
                            var _SQL = {...SQL}
                            _SQL.keys = [...keyVars]
                            if(!_SQL.uid || _SQL.uid == '') _SQL.uid = selectedFile
                            set_data(selectedFile,_SQL).then(()=>{
                              toast.current.show({ severity: 'success', summary: 'Sucesso', detail: "Arquivo atualizado na nuvem!" });
                            })
                          }else{
                            if(SQL.text == '' || SQL.html == '' || queryData == null){
                              Swal.fire({
                                title: 'Query Incompleta',
                                text: "Crie e depois execute sua query, antes de salvar.",
                                icon: 'error',
                                // showCancelButton: true,
                                // confirmButtonColor: 'var(--teal-700)',
                                // cancelButtonColor: 'var(--orange-700)',
                                // confirmButtonText: 'Sim, deletar!'
                              })
                              return
                            }
                            if(fileName && fileName != ''){
                              SQL.name = fileName
                            }else{
                              SQL.name = 'Query_'+ createId(14)
                              setFileName(SQL.name)
                            }
                            add_data('query',SQL).then((fileID)=>{
                              var _SQL = {...SQL}
                              _SQL.uid = fileID
                              setSQL(_SQL)
                              setSelectedFile(fileID)
                            })
                            setReloadFiles(true)
                            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: "Arquivo salvo na nuvem!" });
                          }
                        }}
                      />
                      
                    </div>
                  }
                  style={{ height: 'auto' }}
                  value={SQL.html}
                  onTextChange={(e) => setSQL({html:e.htmlValue, text:e.textValue, uid:selectedFile})}
                />
                  {/* <InputTextarea
                    autoResize
                    style={{
                      width:"100%",
                      // fontWeight:"bold"
                    }}
                    value={SQL}
                    onChange={(e) => setSQL(e.target.value)}
                  /> */}
                </TabPanel>
                <TabPanel header="Variáveis">
                  <div className='grid mb-2'>
                    {canDelete && <div className='col-6'>
                      <Button
                        icon="pi pi-trash"
                        style={{
                          width:"100%",
                          background:"var(--orange-700)",
                          borderColor:"var(--orange-800)",
                          color:"var(--text)"
                        }}
                        disabled={!canDelete}
                        label={selectedKeys.length>1?`Excluir Selecionadas (${selectedKeys.length})`:"Excluir Selecionada"}
                        onClick={()=>{
                          const delArray = selectedKeys.map((i)=>i.key)
                          let _keyVars = keyVars.filter(val => {
                            if(!delArray.includes(val.key)) return(val)
                          });
                          setKeyVars(_keyVars)
                          setCanDelete(false)
                        }}
                      />
                    </div>}
                    <div className={`col${canDelete?'-6':''}`}>
                      <Button
                        icon="pi pi-plus"
                        style={{
                          width:"100%",
                          background:"var(--teal-700)",
                          borderColor:"var(--teal-800)",
                          color:"var(--text)"
                        }}
                        label='Adicionar Variável'
                        onClick={()=>{
                          var _keyVars = [...keyVars]
                          _keyVars.push({key:`var_${uid()}`,value:"",type:null})
                          setKeyVars(_keyVars)
                          setEditLast(true)
                        }}
                      />
                    </div>
                  </div>
                  <DataTable
                    
                    editMode="row"
                    showGridlines
                    stripedRows
                    resizableColumns
                    columnResizeMode="fit"
                    size="small"
                    value={keyVars}
                    onRowEditComplete={onRowEditComplete}
                    selectionMode="checkbox"
                    editingRows={editingRows}
                    onRowEditChange={onRowEditChange}
                    // dragSelection
                    emptyMessage="Adicione uma variável"
                    selection={selectedKeys}
                    onSelectionChange={e => setSelectedKeys(e.value)}
                    dataKey="key"
                    responsiveLayout="scroll">
                      <Column selectionMode="multiple" headerStyle={{width: '3em'}}></Column>
                      {keyVars && keyVars[0] && Object.keys(keyVars?.[0]).map((col,i) => {
                        return <Column
                          sortable
                          key={col}
                          field={col}
                          header={col}
                          editor={(options) => {
                            if(options.field == "type") return(statusEditor(options))
                            return(textEditor(options))
                          }}
                        />;
                      })}
                      <Column
                        rowEditor
                        headerStyle={{ width: '10%', minWidth: '8rem' }}
                        bodyStyle={{ textAlign: 'center' }}>  
                      </Column>
                  </DataTable>
                  
                </TabPanel>
                <TabPanel header="Query Body">
                  <div>
                    <Editor
                      headerTemplate={
                        <span>
                          <Button
                            icon="pi pi-copy"
                            label="Copiar Query"
                            className="p-button-secondary"
                            style={{
                              margin:"-9px",
                              height:"40px",
                              width:"calc(100% + 18px)",
                              background:"var(--teal-700)",
                              borderColor:"var(--teal-800)",
                              color:"var(--text)",
                              // zIndex:1
                            }}
                            onClick={()=>{
                              toast.current.show({ severity: 'info', summary: 'Ctrl+C', detail: "Copiado para área de transferência!" });
                              copyToClipBoard(JSON.stringify(bodySQL, undefined, 2).split('\\n').join(' ').split('    ').join(''))
                            }}
                          />
                        </span>
                      }
                      style={{ height: 'auto' }}
                      value={syntaxHighlight(JSON.stringify(bodySQL, undefined, 2).split('\\n').join('\n\t'))}
                      // onTextChange={(e) => setSQL(e.htmlValue)}
                    />
                    {/* <pre id="json">{syntaxHighlight(JSON.stringify(bodySQL, undefined, 2).split('\\n').join('\n\t'))}</pre> */}
                    
                  </div>
                </TabPanel>
              </TabView>
                
              </div>
              
              {selectedDB.name != '' && <div className={`col-12 pl-4 pr-4 mb-1`}>
                <Button
                  iconPos="right"
                  icon="pi pi-send"
                  loading={runQuery}
                  style={{
                    width:"100%",
                    background:"var(--primary)",
                    borderColor:"var(--primary-b)",
                    color:"var(--text)"
                  }}
                  label={runQuery?'Carregando...':'Executar'}
                  onClick={()=>{
                    if(!SQL.text) return
                    var _bodySQL = {credentials: selectedDB.id, keys:[...keyVars], sql:SQL.text}
                    // setBodySQL(_bodySQL)
                    setRunQuery(true)
                    api_get(
                      _bodySQL
                    ).then((data)=>{
                      // console.log(data)
                      setQueryData(data)
                      setOutSQL(JSON.stringify(data))
                      setRunQuery(false)
                    })
                  }}
                />
              </div>}
              
              {queryData && <div className="col-12 pl-4 pr-4 mb-1">
                <TabView>
                  <TabPanel header="Tabela">
                      <DataTable
                        
                        stripedRows
                        resizableColumns
                        columnResizeMode="fit"
                        showGridlines
                        size="small"
                        value={queryData}
                        emptyMessage="Nenhum resultado encontrado..."
                        responsiveLayout="scroll"
                        paginator={queryData.length > 10?true:false}
                        paginatorTemplate={queryData.length > 10?"CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown":null}
                        currentPageReportTemplate={queryData.length > 10?"Exibindo {first} à {last} de {totalRecords} registros":null}
                        rows={queryData.length > 10?10:0}
                        rowsPerPageOptions={queryData.length > 10?[10,20,50,100]:null}
                        >
                          {queryData && queryData[0] && Object.keys(queryData?.[0]).map((col,i) => {
                            return <Column sortable key={col} field={col} header={col} />;
                          })}
                      </DataTable>
                  </TabPanel>
                  <TabPanel header="JSON">
                    <pre id="json">{JSON.stringify(queryData, undefined, 2)}</pre>
                  </TabPanel>
                  <TabPanel header="Texto">
                    <InputTextarea
                      autoResize 
                      style={{
                        width:"100%",
                        height:"100%"
                        // marginLeft:"5%",
                      }}
                      value={outSQL}
                      // onChange={(e) => setOutSQL(e.target.value)}
                    />
                  </TabPanel>
                </TabView>
              </div>}
            </div>
            <div className='mr-3 ml-3'>
            {queryData && <><Button
              className='mb-2'
              style={{
                width:"100%",
                fontWeight:"bold"
              }}
              icon="pi pi-link"
              iconPos='right'
              label='Gerar link para API'
              onClick={()=> setLinkToAPI(true)}
            />
            <Dialog
              header={`Link para "${fileName}"`}
              visible={linkToAPI}
              onHide={() => setLinkToAPI(false)}
              style={{
                width: '100vw',
                maxWidth:"600px",
                margin:"10px"
              }}
            >
                <InputTextarea
                  autoResize
                  style={{width:"100%"}}
                  value={`${process.env.NEXT_PUBLIC_DB_CLOUD_URL}api/query/${selectedDB.id}/${SQL.uid}`.replace(" ","")}
                />
                <Button
                  icon="pi pi-copy"
                  label="Copiar URL"
                  className="p-button-secondary"
                  style={{
                    marginTop:"10px",
                    marginBottom:"20px",
                    height:"40px",
                    width:"100%",
                    background:"var(--teal-700)",
                    borderColor:"var(--teal-800)",
                    color:"var(--text)"
                  }}
                  onClick={()=>{
                    toast.current.show({ severity: 'info', summary: 'Ctrl+C', detail: "Copiada para área de transferência!" });
                    copyToClipBoard(`${process.env.NEXT_PUBLIC_DB_CLOUD_URL}api/query/${selectedDB.id}/${SQL.uid}`.replace(" ",""))
                  }}
                />

                <InputTextarea
                  autoResize
                  style={{width:"100%"}}
                  value={keyVars.map((v,i)=>{return((i>0?';':'')+`${v.key},${v.value},${v.type}`)}).join('')}
                />
                <Button
                  icon="pi pi-copy"
                  label="Copiar Variáveis"
                  // className="p-button-secondary"
                  style={{
                    marginTop:"10px",
                    height:"40px",
                    width:"100%",
                    background:"var(--purple-700)",
                    borderColor:"var(--purple-800)",
                    color:"var(--text)"
                  }}
                  onClick={()=>{
                    toast.current.show({ severity: 'info', summary: 'Ctrl+C', detail: "Copiada para área de transferência!" });
                    copyToClipBoard(keyVars.map((v,i)=>{return((i>0?';':'')+`${v.key},${v.value},${v.type}`)}).join(''))
                  }}
                />

            </Dialog></>}
            </div>
          </div>
          </div>
          
            <div
              style={{
                backgroundColor:"var(--glass)",
                backdropFilter: "blur(30px)",
              }}
              className="flex-1 border-round m-2"
            >
            
            <div 
              style={{
                width:"100%",
                height:"100%"
              }}>
              {/* <Toolbar className='pl-3 pr-1 pt-2 pb-2'
              left={<div style={{fontWeight:"normal", color:"var(--info)"}}>{currentUser.email}</div>}
              right={<Button icon="pi pi-user-edit" className="p-button-rounded p-button-secondary p-button-text" />}/> */}
              <ToggleButton
                checked={selectItem}
                onChange={(e) => setSelectItem(e.value)}
                onLabel="Cancelar"
                offLabel="Selecionar"
                onIcon="pi pi-bars"
                offIcon="pi pi-list"
                style={{width: selectedFiles.length > 0?'50%':'100%', pading:"0px"}}
                aria-label="Confirmation"
              />
              
              {selectedFiles.length > 0 &&
              <Button
                className='p-button-secondary'
                label={selectedFiles.length>1?`Excluir ${selectedFiles.length} arquivos`:'Excluir arquivo'}
                style={{width: '50%', pading:"0px"}}
                onClick={(event)=>{
                  
                  Swal.fire({
                    title: 'Tem certeza?',
                    text: "Você não poderá desfazer essa ação!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--teal-700)',
                    cancelButtonColor: 'var(--orange-700)',
                    confirmButtonText: 'Sim, deletar!'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      Swal.fire(
                        'Excluído!',
                        `Os arquivos foram excluído.`,
                        'success'
                      )
                      selectedFiles.map((file_uid)=>{
                        del_data(file_uid).then(()=>{
                          setReloadFiles(true)
                        })
                      })
                      setSelectedFiles([])
                      setSelectedItems([])
                      setSelectItem(false)
                    }
                  })

                  
                }}
              />}
              
              <Tree
                filter
                filterMode="strict"
                loading={loadingItems}
                // onSelect={(event)=>{
                //   console.log(event)
                // }}
                onNodeDoubleClick={(event) =>{
                  if(event.node.type == 'file'){
                    const file = event.node.data
                    setSQL(file)
                    setFileName(file.name)
                    setSelectedFile(file.uid)
                    var _bodySQL = {
                      credentials: selectedDB.id,
                      keys:file.keys?file.keys:[],
                      sql:file.uid
                    }
                    if(file.keys) {
                      setKeyVars(file.keys)
                    }else{
                      setKeyVars([])
                    }
                    setBodySQL(_bodySQL)
                  }
                }}
                onExpand={(event) => {
                  // toast.current.show({ severity: 'success', summary: 'Node Expanded', detail: event.node.label });
                  let node = { ...event.node };
                  console.log(node.children.length)
                  if (node.children.length == 0) {
                    console.log(node.children)
                    var db_credentials = node.data
                    setLoadingItems(true);
                    
                    var _bodySQL = {
                      credentials: db_credentials.id,
                      keys:[],
                      sql:"SELECT * FROM INFORMATION_SCHEMA.TABLES"
                    }
                    api_get(_bodySQL).then((data)=>{
                      
                      // console.log(node,data)

                    
                      // node.children.push({
                      //   "key": node.key +"-0",
                      //   "label": "Tables",
                      //   "icon": "pi pi-fw pi-book",
                      //   "data": "Table Schema",
                      //   "leaf":false,
                      //   "children":data.map((item,index)=>{
                      //     if(item.TABLE_TYPE != "VIEW"){
                      //       // console.log(item, index)
                      //       return({
                      //         key: node.key + '-0-' + index,
                      //         label:item.TABLE_NAME
                      //       })
                      //     }
                      //   })
                      // })

                      // node.children.push({
                      //   "key": node.key +"-1",
                      //   "label": "Views",
                      //   "icon": "pi pi-fw pi-book",
                      //   "data": "View Schema",
                      //   "leaf":false,
                      //   "children":
                      // })

                      data.map((item,index)=>{
                        node.children.push({
                          "key": node.key + '-1-' + index,
                          "label":item.TABLE_NAME,
                          "className":"p-button-warning p-button-text",
                          "icon":item.TABLE_TYPE == "VIEW"?"pi pi-fw pi-eye":"pi pi-fw pi-book"
                        })
                      })

                      // let value = [...userStorage];
                      // value[parseInt(event.node.key, 10)] = node;
                      // setUserStorage(value);
                      
                      setLoadingItems(false);
                    })
                }
                }}
                value={userStorage}
                selectionMode={selectItem?"checkbox":null}
                selectionKeys={selectedItems}
                onSelectionChange={(e) => {
                  // console.log(userStorage)
                  var userStorageSelect = e.value

                  setSelectedFiles(Object.keys(userStorageSelect).map((item)=>{
                    if(userStorageSelect[item].checked){
                      const indexArray = item.split("-")
                      if(indexArray.length>1) {
                        // console.log(userStorage[indexArray[0]].children[indexArray[1]].label)
                        return(userStorage[indexArray[0]].children[indexArray[1]].data.uid)
                      }
                    }
                  }).filter((doc)=>{if(doc)return(doc)}))

                  setSelectedItems(userStorageSelect)
                }} 
              />
              </div>
              
          </div>
        </div>
      </div>
    </ObjectComponent>
  )
	
}