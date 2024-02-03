import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript'; // Or the generator of your choice
import * as Brasil from 'blockly/msg/pt-br';
import { copyToClipBoard, var_get, var_set } from '../../utils/util';
import Swal from 'sweetalert2';
import { z } from "zod";
import { add_data, del_data, get_data, get_all_data, get_public_data, set_data } from '../../api/firebase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import UserIcon from '../../components/user_icon';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import fetch from 'isomorphic-unfetch';
import localForage from "localforage";
import CreateBlock, { block_object } from './create_block';

const clientes_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'clientes'
});

Blockly.setLocale(Brasil);


Blockly.Blocks['get_IndexedDB'] = {
    init: function() {
        this.setColour(230);
        this.appendDummyInput()
            .appendField("Em")
            .appendField(new Blockly.FieldTextInput(""), "TABLE");

        this.appendDummyInput()
            .appendField("item com ID");
        this.appendValueInput("KEY")
            .setCheck("String");
        
        this.appendDummyInput()
            .appendField("define");
        this.appendValueInput("TO_VAR")
            .setCheck("Any");

        this.appendDummyInput()
            .appendField("ao concluir");
        this.appendValueInput("CALLBACK")
            .setCheck("Any");

        this.setInputsInline(true);
        this.setPreviousStatement(true,"Any")
        this.setNextStatement(true,"Any")
        // this.setOutput(true, null);
        this.setTooltip("Retrieves an item from IndexedDB using LocalForage's getItem method and executes the callback function synchronously");
    }
};

javascriptGenerator['get_IndexedDB'] = function(block) {
    // Get the key for the item to be retrieved
    var key = javascriptGenerator.valueToCode(block, 'KEY', javascriptGenerator.ORDER_ATOMIC);
    var TO_VAR = javascriptGenerator.valueToCode(block, 'TO_VAR', javascriptGenerator.ORDER_ATOMIC);
    var CALLBACK = javascriptGenerator.valueToCode(block, 'CALLBACK', javascriptGenerator.ORDER_FUNCTION_CALL);
    var table = block.getFieldValue('TABLE');
    // Generate the JavaScript code to retrieve the item from IndexedDB using LocalForage's getItem method and execute the callback function synchronously
    var code = `
(async()=>{
    const databases = await indexedDB.databases({ blocking: true });
    
    let databaseVersion;
    for (const db of databases) {
        if (db.name === 'pilarpapeis_db') {
            databaseVersion = db.version;
            break;
        }
    }

    if (databaseVersion) {
        const request = indexedDB.open('pilarpapeis_db', databaseVersion, { blocking: true });
        
        request.onsuccess = async function() {
            const db = request.result;
            const transaction = db.transaction(['${table}']);
            const objectStore = transaction.objectStore('${table}');

            const request_data = objectStore.get(${key});

            request_data.onsuccess = await function() {
                ${TO_VAR} = retorno(request_data.result);
            };

            request_data.onerror = function() {
                console.error('Error getting data from object store');
            };
        };

        request.onerror = function() {
            console.error('Error opening database');
        };
    } else {
        console.log("The 'pilarpapeis_db' database does not exist");
    } 
})();`;
    return(code)
};


  
Blockly.Blocks['key_value'] = {
    init: function() {
        this.appendValueInput("KEY")
            .setCheck(null)
            .appendField("Nome");
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("Valor");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(20);
        this.setTooltip("");
    }
};

javascriptGenerator['key_value'] = function(block) {
    var value_key = javascriptGenerator.valueToCode(block, 'KEY', javascriptGenerator.ORDER_ATOMIC);
    var value_value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
    var code = '{'+value_key+':'+value_value+'}';
    return [code, javascriptGenerator.ORDER_NONE];
};

function keys_from(_code){
    var keys = []

    try{
        while(_code.indexOf("$") != -1){
            const key = _code.split("'$").slice(1)[0].split("'")[0];
            _code = _code.replace("'$"+key+"'","'@"+key+"'")
            keys.push(key)
        }
    }catch(error){
        while(_code.indexOf("$") != -1){
            const key = _code.split('"$').slice(1)[0].split('"')[0];
            _code = _code.replace('"$'+key+'"','"@'+key+'"')
            keys.push(key)
        }
    }
    // console.log(keys)
    return(keys)
}

export function setKeysTo(_code,values){
    const keys = keys_from(_code)
    keys.map((key)=>{
        var key_value_type = key.split("¨")
        var value = values[key_value_type[0]]

        if(key_value_type.length > 1 && key_value_type[1] == "String"){
            _code = _code.replace("('$"+key+"')", "'"+value+"'")
            _code = _code.replace('("$'+key+'")', '"'+value+'"')
            _code = _code.replace('$'+key, value)
        }else{
            _code = _code.replace("('$"+key+"')", value)
            _code = _code.replace('("$'+key+'")', value)
        }
    })
    return(_code)
}

Blockly.Blocks['key_var'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Chave")
            .appendField(new Blockly.FieldTextInput(""), "var_key");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(20);
        this.setTooltip("Valor dessa variável será definido no momento da execução.");
    }
};

javascriptGenerator['key_var'] = function(block) {
    var text_var_key = block.getFieldValue('var_key');
    // TODO: Assemble JavaScript into code variable.
    var code = text_var_key != ''?"'$"+text_var_key+"¨String'":'0';
    // TODO: Change ORDER_NONE to the correct strength.
    // console.log(code)
    return [code, javascriptGenerator.ORDER_NONE];
};

Blockly.Blocks['return_block'] = {
    init: function() {
        this.appendValueInput("ret")
            .setCheck(null)
            .appendField("Retorna");
        this.setInputsInline(false,"Any");
        this.setPreviousStatement(true,"Any")
        this.setColour(0);
        this.setTooltip("Retorna o valor da entrada");
    }
};

javascriptGenerator['return_block'] = function(block) {
    const retorna = javascriptGenerator.valueToCode(block, 'ret', javascriptGenerator.ORDER_ATOMIC);
    return 'return  ' + retorna + ';';
};


Blockly.Blocks['key_var_type'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Chave")
            .appendField(new Blockly.FieldDropdown([["Texto","String"], ["Numero","Number"], ["Lista","Array"], ["Objeto", "Object"]]), "var_type");
        this.appendDummyInput()
            .appendField("Nome")
            .appendField(new Blockly.FieldTextInput(""), "var_key");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(20);
        this.setTooltip("Valor dessa variável será definido no momento da execução.");
    }
};

javascriptGenerator['key_var_type'] = function(block) {
    var var_key = block.getFieldValue('var_key');
    var var_type = block.getFieldValue('var_type');
    // TODO: Assemble JavaScript into code variable.
    var code = var_key != ''?"'$"+var_key+"¨"+var_type+"'":'0';
    // TODO: Change ORDER_NONE to the correct strength.
    // console.log(code)
    return [code, javascriptGenerator.ORDER_NONE];
};

Blockly.Blocks['send_webhook'] = {
    init: function() {
        // this.appendDummyInput()
        //     .appendField("Web Hook");
        this.appendDummyInput()
            .appendField("enviar")
            .appendField(new Blockly.FieldDropdown([["POST", "POST"], ["GET", "GET"], ["PUT", "PUT"], ["DELETE", "DELETE"]]), "METHOD");
        this.appendValueInput("URL")
            .setCheck("String")
            .appendField("para");
        this.appendValueInput("BODY")
            .setCheck("Object")
            .appendField("body");
        this.setInputsInline(true);
        this.setOutput(true, "Any");
        this.setColour(230);
    this.setTooltip("Send a webhook request and wait for the response");
    this.setHelpUrl("");
    }
};
  
javascriptGenerator['send_webhook'] = function(block) {
    const url = javascriptGenerator.valueToCode(block, 'URL', javascriptGenerator.ORDER_ATOMIC);
    const method = block.getFieldValue('METHOD');
    const body = javascriptGenerator.valueToCode(block, 'BODY', javascriptGenerator.ORDER_ATOMIC);
    
    // const code = `sendWebhook(${url}, '${method}', ${body}, ${headers})`;
    const code = `(()=>{
        var body_req = ${body};
        var body_obj = {};
        if(typeof(body_req) == "object" &&  body_req.length){
            body_req.map((item)=>{
                body_obj[Object.keys(item)[0]] = Object.values(item)[0]
            });
        }else{
            body_obj = body_req;
        };
        
        if(typeof window === 'undefined') {
            const request = require("request");
            const options = {
                method: '${method}',
                uri: ${url},
                body: JSON.stringify(body_obj),
                headers: {
                    "Content-Type": "application/json"
                }
            };
            
            request(options, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return
                };
                console.log(JSON.stringify(body));
                
            });
        } else {
            console.log("Running on a browser");
            const request = new XMLHttpRequest();
            request.open('${method}', ${url}, false);
            request.setRequestHeader("Content-Type", "application/json");
            
            request.send(JSON.stringify(body_obj));
            return request.responseText;
        }
    })()`
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
};

function sendWebhook(url, method, body, header) {
    const request = new XMLHttpRequest();
    request.open(method, url, false);
    request.send(body);
    return request.responseText;
};

Blockly.Blocks["json_block"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("texto");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["para", "parse"], ["de", "stringify"]]), "METHOD");
        this.appendValueInput("JSON_OBJECT")
            .setCheck("JSON")
            .appendField("objeto");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(230);
        this.setTooltip("Recebe um texto JSON e converte para uma lista de objetos.");
        this.setHelpUrl("");
    }
};

javascriptGenerator["json_block"] = function(block) {
    const method = block.getFieldValue('METHOD');
    var value_json_object = javascriptGenerator.valueToCode(block, 'JSON_OBJECT', javascriptGenerator.ORDER_ATOMIC);
    var code = `JSON.${method}(${value_json_object})`;
    return [code, javascriptGenerator.ORDER_NONE];
    // return(code)
};

Blockly.Blocks['get_object_value'] = {
    init: function() {
        this.appendValueInput('PROPERTY')
            .setCheck('String')
            .appendField('retorna');

        this.appendValueInput('OBJECT')
            .setCheck('Object')
            .appendField('de');
        
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(260);
    }
};

javascriptGenerator['get_object_value'] = function(block) {
    var object = javascriptGenerator.valueToCode(block, 'OBJECT', javascriptGenerator.ORDER_ATOMIC);
    var property = javascriptGenerator.valueToCode(block, 'PROPERTY', javascriptGenerator.ORDER_ATOMIC);
    var code = object + '[' + property + ']';
    return [code, javascriptGenerator.ORDER_ATOMIC];
};
  

Blockly.Blocks['find_item'] = {
    init: function() {
        this.setColour(260);
        this.appendValueInput("ARRAY")
            .setCheck("Array")
            .appendField("buscar em");
        this.appendValueInput("KEY")
            .setCheck("String")
            .appendField("onde");
        this.appendValueInput("VALUE")
            .setCheck("String")
            .appendField("for igual a");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setTooltip('');
    }
};

javascriptGenerator['find_item'] = function(block) {
    var key = javascriptGenerator.valueToCode(block, 'KEY', javascriptGenerator.ORDER_NONE);
    var value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_NONE);
    var array = javascriptGenerator.valueToCode(block, 'ARRAY', javascriptGenerator.ORDER_NONE);
    // var code = 'Array.find(' + array + ', function(item) { return item['+key+'] === ' + value + '; })\n';
    // var code = 'Array.find(array, function(item) { return item[key] === value })\n';
    var code = `${array}.find((item) => item[${key}] == ${value})`
    return [code, javascriptGenerator.ORDER_NONE];
};

function setKey(_code,key,value){
    var key_value_type = key.split("¨")
    // console.log(key_value_type,_code)

    if(key_value_type.length > 1 && key_value_type[1] == "String"){
        _code = _code.replace("('$"+key+"')", "'"+value+"'")
        _code = _code.replace('("$'+key+'")', '"'+value+'"')
        // _code = _code.replace("'$"+key+"'", "'"+value+"'")
        _code = _code.replace('$'+key, value)
    }else{
        _code = _code.replace("'$"+key+"'", value)
        _code = _code.replace('"$'+key+'"', value)
    }

    // console.log(_code)

    return(_code)
}

export function runCode(code) {
    var _code = code
    var keys = keys_from(_code) || []
    var key = keys[0]
    
    if(keys.length <= 1){
        if(keys.length == 0){
            // console.log(_code)
            const fn = new Function(_code);
            fn();
        }else{
            Swal.fire({
            icon: 'question',
            title: 'Valor para a variável '+ key.replace("$","").split('¨')[0],
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'aplicar',
            showLoaderOnConfirm: true,
            preConfirm: (valor) => {
                if( valor == ""){
                    Swal.showValidationMessage("Informe um valor")
                }else{
                    _code = setKey(_code,key,valor)
                }
            },
                allowOutsideClick: () => !Swal.isLoading()
            })
            .then((result) => {
                if (result.isConfirmed) {
                    // console.log(_code)
                    const fn = new Function(_code);
                    fn();
                }
            })
        }
    }else{
        Swal.fire({
        icon: 'question',
        title: 'Valor para as variáveis:',
        inputAttributes: {
            autocapitalize: 'off'
        },
        html:keys.map((key)=>{return (`<div class="swal-html-input"><h4>${key.split('¨')[0]}</h4> <input id="swal-input-${key.split('¨')[0]}" required class="swal2-input" value=""></div>`)}).join("</br>"),
        showCancelButton: true,
        confirmButtonText: 'aplicar',
        showLoaderOnConfirm: true,
        preConfirm: (valor) => {

            for (let index = 0; index < keys.length; index++) {
                const key = keys[index]

                const key_value = document.getElementById('swal-input-'+key.split('¨')[0]).value;
                    if( key_value == ""){
                    Swal.showValidationMessage("Informe um valor para "+ key.split('¨')[0])
                    return
                }else{
                    // console.log(key_value)
                    _code = setKey(_code,key,key_value)
                }
            }
            
        },
            allowOutsideClick: () => !Swal.isLoading()
        })
        .then((result) => {
            if (result.isConfirmed) {
                // console.log(_code)
                const fn = new Function(_code);
                fn();
            }
        })
    }
}
  
export function generate_code(_workspace){
    return javascriptGenerator.workspaceToCode(_workspace)
}

export function add_new_block(_workspace, block){

    Blockly.Blocks[block.data.block] = block
    javascriptGenerator[block.data.block] = block.function

    var _toolbox = _workspace.toolbox_
    var category = _toolbox.contents_.pop()
    
    category.flyoutItems_.push({
        kind:"block",
        type:block.data.block,
        enabled:true
    })
    _toolbox.contents_.push(category)

}

export default function Rules(props) {
    const [workspace, set_workspace] = useState(null);
    const [saved_data, set_saved_data] = useState(null);
    const [code, set_code] = useState('');
    const [loading, set_loading] = useState(null);
    const [blockly_docs, set_blockly_docs] = useState([])
    const [show_files, set_show_files] = useState(false);
    const [new_block, set_new_block] = useState(false);
    const [toolbox_data, set_toolbox_data] = useState([]);
    const file_menu = useRef(null);
    const toast = useRef(null);

    const items = [
        {
            label: 'Suas Ações',
            items: [
                {
                    label: 'Atualizar',
                    icon: 'pi pi-cloud-upload',
                    command: () => {
                        console.log(code)
                        var _saved_data = {...saved_data}
                        _saved_data.workspace = JSON.stringify(Blockly.serialization.workspaces.save(workspace))
                        _saved_data.code = JSON.stringify(code)
                        _saved_data.keys = keys_from(code)
                        set_data("blockly", saved_data.uid, _saved_data).then((ret)=>{
                            set_saved_data(_saved_data)
                            load_blockly_docs()
                            toast.current.show({
                                severity: 'info',
                                summary: 'Update',
                                detail: 'Script "'+saved_data.name+'" atualizado na nuvem.',
                                life: 3000
                            });
                        })
                    }
                },
                {
                    label: 'Modificar',
                    icon: 'pi pi-pencil',
                    command: () => {
                        saveBlocksCloud()
                        // set_saved_data(null)
                    }
                },
                {
                    label: 'Deletar',
                    icon: 'pi pi-trash',
                    command: () => {
                        delete_blockly_file(saved_data.uid)
                    }
                },
                {
                    label: 'Gerar Bloco',
                    icon: 'pi pi-bolt',
                    command: () => {
                        var save_code = code
                        var keys = keys_from(save_code) || []
                        
                        for (let index = 0; index < keys.length; index++) {
                            const key = keys[index]
                            // save_code = setKey(save_code,key,'variaveis.'+key.split('¨')[0]+"_input")
                            save_code = save_code.replace("'$"+key+"'", 'variaveis.'+key.split('¨')[0]+"_input")
                        }
                        // console.log(save_code)
                        const _new_block = {
                            block:"new_block",
                            name:saved_data.name,
                            tooltip:"",
                            next:false,
                            previous:false,
                            inline:true,
                            output:(save_code.indexOf("return  ")!=-1?true:false),
                            colour:20,
                            inputs:keys.map((key)=>{
                                return ({
                                    Input:key.split('¨')[0]+"_input",
                                    Check:null,
                                    Field:key.split('¨')[0]
                                })
                            }),
                            code:`const variaveis = JSON.parse(values);${eval(JSON.stringify(save_code).replace(/\s+/g, ' '))}`
                        }
                        set_new_block(_new_block)
                        console.log(_new_block)

                        // delete_blockly_file(saved_data.uid)
                    }
                }
            ]
        },
        {
            label: 'Opções',
            items: [
                {
                    label: 'Recaregar',
                    icon: 'pi pi-sync',
                    command: () => {
                        // open_blockly_file(saved_data)
                        // console.log(saved_data,blockly_docs)
                        load_blockly_docs().then(()=>{
                            open_blockly_file(blockly_docs.find(doc=>doc.uid==saved_data.uid))
                        })
                    }
                },
                {
                    label: 'Copiar UID',
                    icon: 'pi pi-tag',
                    command: () => {
                        copyToClipBoard(saved_data.uid)
                        toast.current.show({
                            severity: 'success',
                            summary: saved_data.uid,
                            detail: 'UID de "'+saved_data.name+'" copiado pra área de transferência.',
                            life: 3000
                        });
                    }
                },
                {
                    label: 'Duplicar',
                    icon: 'pi pi-copy',
                    command: () => {
                        set_saved_data(null)
                    }
                },
                {
                    label: 'Fechar',
                    icon: 'pi pi-times',
                    command: () => {
                        var_set("workspace_saved",null,false)
                        var_set("workspace",null,false)
                        workspace.clear()
                        set_saved_data(null)
                    }
                }
            ]
        }
    ];

    const open_blockly_file = (blockly_data) => {
        if(workspace) workspace.clear()
        const _workspace_data = JSON.parse(blockly_data.workspace)
        Blockly.serialization.workspaces.load(_workspace_data, workspace)
        
        set_saved_data(blockly_data)
        var_set("workspace_saved",JSON.stringify(blockly_data),false)
    }

    const delete_blockly_file = (file_uid) =>{

        Swal.fire({
            title: 'Aviso',
            text: `Você tem certeza? Essa ação é permanente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--teal-700)',
            cancelButtonColor: 'var(--orange-700)',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Melhor não...'
        }).then((result) => {
            // console.log(this)
            if (result.isConfirmed) {
                del_data('blockly',file_uid).then(()=>{
                    var _blockly_docs = blockly_docs.filter(doc=>doc.uid!=file_uid)
                    set_blockly_docs(_blockly_docs)
                    set_saved_data(null)
                    var_set("workspace_saved",null,false)
                    var_set("workspace",null,false)
                    workspace.clear()
                })
            }
        })
    }
    // validador de formulário ZOD
    const fileName = z.preprocess((val) => {
        try { return eval(val) } catch (error) { return val }
    }, z.string({
        required_error:"Nome é obrigatório",
        invalid_type_error:"Nome deve ser texto"
    }).min(3,{message:"Nome deve ter no mínimo 3 caracteres"}));


    const loadData = () => {
        set_loading(false)
        fetch('data/default_toolbox.json')
        .then(response => response.json())
        .then(json => {
            console.log(json)
            set_toolbox_data(json)  
            set_loading(true)
        })
        .catch(error => console.error(error));
    }
    
    var toolbox = {}

    useEffect(()=>{
        if(loading == null){
            loadData()
        }
        if(loading == false){
            set_workspace(null)
        }
    },[])

    const add_custom_block = (data) => {
        // Cria o bloco novo a partir da classe block_object
        var test_obj = new block_object(data)
        // adiciona o novo bloco aos Blocks do Blockly
        Blockly.Blocks[test_obj.data.block] = test_obj
        javascriptGenerator[test_obj.data.block] = test_obj.function
        // Adiciona o bloco ao toolbox
        var _toolbox = {...toolbox_data}
        var objects = _toolbox.contents.pop()
        objects.contents.push({kind:"block",type:test_obj.data.block})
        _toolbox.contents.push(objects)
        set_toolbox_data(_toolbox)
    }

    useEffect(()=>{
        if(Object.keys(toolbox_data).length > 0){
            toolbox = {...toolbox_data}
            get_all_data('custom_blocks').then((blocks_data)=>{
                blocks_data.forEach((block_data)=>{
                    add_custom_block(block_data.data())
                })

                if(loading == true){
                    var _workspace = Blockly.inject('blocklyDiv', {
                        toolbox: toolbox_data,
                    });
                    _workspace.addChangeListener(()=>{
                        updateCode()
                        saveBlocksLocal(_workspace)
                    });
                    load_blockly_docs()
                    set_workspace(_workspace)
                    set_loading(false)
                }
            })
        }
    },[loading])

    const load_blockly_docs = async () =>{
        var _blockly_docs = []
        await get_data("blockly").then((blockly_data)=>{
            blockly_data.forEach((doc)=>{
                _blockly_docs.push(doc.data())
            })
        })
        const loaded_docs = _blockly_docs.map(doc=>doc.uid)

        await get_public_data("blockly").then((blockly_data)=>{
            blockly_data.forEach((doc)=>{
                if(loaded_docs.indexOf(doc.data().uid) == -1){
                    _blockly_docs.push(doc.data())
                }
            })
        })
        set_blockly_docs(_blockly_docs)
        console.log(_blockly_docs)
    }

    const saveBlocksLocal = (workspace)=>{
        // console.log(workspace)
        if(workspace){
            const save_blockly = Blockly.serialization.workspaces.save(workspace)
            // console.log(save_blockly)
            var_set("workspace",JSON.stringify(save_blockly),false)
            // .then((ret)=>{
            //     // console.log(ret)
            // })
        }
    }

    const saveBlocksCloud = ()=>{
        // console.log(workspace)

        Swal.fire({
            icon: 'question',
            html: 
            '<h4>Nome do arquivo:</h4><input id="swal-input1" required autoComplete="filename" class="swal2-input" value="'+(saved_data?saved_data.name:'')+'">' +
            '</br>'+
            '<input type="checkbox" id="swal-input2" class="swal2-checkbox" '+(saved_data?.isPublic?'checked="true"':'')+'"><label for="swal2-checkbox">Arquivo público</label></input>',
            
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: function(comment) {
                const name = document.getElementById('swal-input1').value;
                const isPublic = document.getElementById('swal-input2').checked
                
                const zodTest = fileName.safeParse(name)
                
                if (!zodTest.success) {
                    Swal.showValidationMessage(zodTest.error.issues[0].message)
                }else{
                    return new Promise(function(resolve) {
                        if (true) {
                            resolve([name,isPublic]);
                        }
                    });
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if(!result.value) return
            const [name, isPublic] = result.value
            console.log(name, isPublic)
            if (result.isConfirmed) {
                const save_blockly = Blockly.serialization.workspaces.save(workspace)
                if(saved_data){
                    
                    var _saved_data = {...saved_data}
                    _saved_data.name = name
                    _saved_data.isPublic = isPublic
                    _saved_data.workspace = JSON.stringify(save_blockly)
                    _saved_data.code = code
                    
                    _saved_data.keys = keys_from(code)

                    console.log(_saved_data)
                    set_data("blockly",_saved_data.uid, _saved_data).then(()=>{
                        var_set("workspace_saved",JSON.stringify(_saved_data),false).then(()=>{
                            set_saved_data(_saved_data)
                            load_blockly_docs()
                            Swal.fire({
                                icon: 'success',
                                title: 'Sucesso!',
                                text: '"'+name + '" salvo na nuvem como ' + (isPublic?"público":"privado"),
                                // footer: '<a href="">Why do I have this issue?</a>'
                            })
                        })
                    })
                }else{
                    var _workspace = {
                        name,
                        isPublic,
                        workspace:JSON.stringify(save_blockly)
                    }
                    add_data("blockly",_workspace).then((file_uid)=>{
                        console.log(file_uid)
    
                        _workspace.uid = file_uid
                        _workspace.user_uid = props.currentUser.uid
                        var _blockly_docs = [...blockly_docs]
                        _blockly_docs.unshift(_workspace)
    
                        set_blockly_docs(_blockly_docs)
                        set_saved_data(_workspace)
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesso!',
                            text: '"'+name + '" salvo na nuvem como ' + (isPublic?"público":"privado"),
                            // footer: '<a href="">Why do I have this issue?</a>'
                        })
                    })
                }
            }
        })

        // if(workspace){
        //     const save_blockly = Blockly.serialization.workspaces.save(workspace)
        //     // console.log(save_blockly)
        //     var_set("workspace",JSON.stringify(save_blockly),false).then((ret)=>{
        //         // console.log(ret)
        //     })
        // }
    }

    useEffect(()=>{
        if(workspace != null){
            var_get("workspace_saved").then((data)=>{
                // console.log(data)
                if(data && data != "null"){
                    const _workspace_data = JSON.parse(data)
                    set_saved_data(_workspace_data)
                }
                var_get("workspace").then((data)=>{
                    if(data && data != "null"){
                        const _workspace_data = JSON.parse(data)
                        const _workspace = Blockly.serialization.workspaces.load(_workspace_data, workspace)
                    }
                })
            
            })
        }
    },workspace)

    const updateCode = (event) => {
        const code = generate_code(workspace);
        // console.log(code)
        set_code(code)
    }
    
    return (
        <div>
            <div className="flex justify-content-between flex-wrap p-2 gap-2"
                style={{background:"var(--glass-b)"}}>
                <Button
                    icon="pi pi-play"
                    className="p-button-outlined"
                    iconPos="right"
                    // disabled={this.state.selected_products.length == 0}
                    label={window.innerWidth > 500? "Executar":""}
                    onClick={()=>{
                        // console.log(code)
                        runCode(code)
                    }}
                />
                {saved_data == null?
                code != "" && <Button
                    icon="pi pi-cloud-upload"
                    className="p-button-outlined p-button-rounded p-button-success"
                    // disabled={this.state.selected_products.length == 0}
                    label="Salvar"
                    onClick={(event)=>{
                        saveBlocksCloud()
                    }}
                />:
                <div className='flex align-items-center gap-2'>
                    
                    <Button
                        icon="pi pi-bars"
                        label={saved_data?.name}
                        className='p-button-text p-button-rounded'
                        style={{
                            color:"var(--text-c)",
                            fontWeight:"bold",
                            fontSize:"18px",
                            padding:"3px",
                            paddingInline:"10px"
                        }}
                        onClick={(event) => file_menu.current.toggle(event)}
                    />
                </div>
                }
                <Button
                    icon={show_files?"pi pi-folder-open":"pi pi-folder"}
                    className="p-button-outlined p-button-secondary"
                    // disabled={this.state.selected_products.length == 0}
                    label={window.innerWidth > 500? "Scripts":""}
                    onClick={(event)=>{
                        set_show_files(!show_files)
                        // saveBlocksLocal()
                    }}
                />
            </div>
            
            <div id="blocklyDiv" style={{height: "calc(100vh - 150px)", width: "100%"}}></div>    
            
            <Sidebar
                style={{
                    backgroundColor:"var(--glass)",
                    backdropFilter:"blur(10px)",
                    padding:"0px",
                    maxWidth:"100%",
                    width:"400px"
                }}
                position='right'
                visible={show_files}
                onHide={()=>{
                    set_show_files(false)
                }}
            >
                <DataTable
                        value={blockly_docs}
                        responsiveLayout="scroll"

                    >
                        <Column field='isPublic'
                            body={(row_data)=>{
                                return(
                                    <icon style={{color:row_data.isPublic?"var(--success)":"var(--warn)"}}
                                        className={row_data.isPublic?"pi pi-users":"pi pi-user"}
                                    />
                                )
                            }} 
                        />
                        <Column field='name' />
                        <Column body={(row_data)=>{
                            return(
                                <div className='flex gap-2'>
                                    <Button 
                                        className={'p-button-rounded '+(row_data.uid != saved_data?.uid?"p-button-outlined":"")}
                                        icon={row_data.uid == saved_data?.uid?'pi pi-folder-open':'pi pi-folder'}
                                        tooltip={row_data.uid == saved_data?.uid?'Aberto':'Abrir Script'}
                                        tooltipOptions={{position:"left"}}
                                        onClick={(event)=>{
                                            open_blockly_file(row_data)
                                        }}
                                    />
                                    {row_data.user_uid == props.currentUser.uid ? <Button 
                                        className='p-button-rounded p-button-danger p-button-outlined'
                                        icon='pi pi-trash'
                                        onClick={(event)=>{
                                            delete_blockly_file(row_data.uid)
                                        }}
                                    />:<UserIcon uid={row_data.user_uid} name={false} size={38}/>}
                                </div>
                            )
                        }} />
                    </DataTable>
            </Sidebar>
            <Menu model={saved_data!=null && saved_data.user_uid == props.currentUser.uid?items:items.slice(1)} popup ref={file_menu} id="popup_menu" />
            <Toast ref={toast}></Toast>
            <CreateBlock
                block={new_block}
                onHide={()=>{set_new_block(false)}}
                add_new_block={(block)=>{
                    add_new_block(workspace,block)
                    toast.current.show({
                        severity: 'success',
                        summary: "Bloco Novo",
                        detail: 'Bloco "'+block.data.name+'" foi adicionado na categoria "Custom".',
                        life: 3000
                    });
                }}
            />
        </div>
    )
}