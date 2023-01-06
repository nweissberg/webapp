import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { ColorPicker } from 'primereact/colorpicker';
import { ToggleButton } from 'primereact/togglebutton';

import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript'; // Or the generator of your choice
import * as Brasil from 'blockly/msg/pt-br';

import beautify_js from 'js-beautify';
import 'highlight.js/styles/androidstudio.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import BlocklyWorkspace from './blockly_workspace';
import { normalize, replaceAll, scrollToTop, toIdTag } from '../../utils/util';
import { add_data } from '../../api/firebase';
hljs.registerLanguage('javascript', javascript);

Blockly.setLocale(Brasil);

export class block_object {
	constructor( data = {} ) {
		this.data = data
        this.init = function() {
            this.appendDummyInput("NAME").appendField(data.name);
            for (var i = 0; i < data.inputs.length; i++) {
                let attributes = data.inputs[i]
                this.appendValueInput(attributes.Input)
                    .setCheck(attributes.Check)
                    .appendField(attributes.Field);
            }
            if(data.previous) this.setPreviousStatement(true, data.previous.type || null);
            if(data.next) this.setNextStatement(true, data.next.type || null);
            if(data.output) this.setOutput(true, data.output.type || null);
            if(data.inline) this.setInputsInline(true);
            
            this.setColour(data.colour || 210);
            this.setTooltip(data.tooltip || "");   
        }

        this.values = {}

        this.function = function(block) {
            for (var i = 0; i < data.inputs.length; i++) {
                let attributes = data.inputs[i]
                this.values[attributes.Input] = javascriptGenerator.valueToCode(block, attributes.Input, javascriptGenerator.ORDER_ATOMIC);
                this.values[attributes.Input] = eval(this.values[attributes.Input])
            }
            // console.log(this.values)
            var code = `(()=>{
                let values = '${JSON.stringify(this.values)}';
                ${data.code}
            })();`;
            if(data.output){
                return [`${code}`,javascriptGenerator.ORDER_FUNCTION_CALL];
            }else{
                return code
            }
        };
    }
}

export default class CreateBlock extends React.Component {
    constructor(props){
        super(props)
        this.state={
            workspace:null,
            block_colour:'A5745B',
            block_tooltip:"",
            block_name:"",
            block_id:"",
            inline:true,
            previous:false,
            next:false
        }
    }
    componentWillUnmount(){
        this.setState({
            workspace:null,
            block_colour:'A5745B',
            block_name:"",
            block_id:"",
            inline:true,
            previous:false,
            next:false
        })
    }
    render(){
        return(
            <Dialog
                header={'Novo Bloco "'+this.state.block_id+'"'}
                visible={this.props.block}
                // maximizable
                blockScroll={true}
                onShow={()=>{scrollToTop()}}
                modal
                style={{
                    minWidth:"70vw",
                    width:"100vw",
                    maxWidth: 'min-content',
                }}
                footer={()=>{
                    return(
                        <div className='mt-3'>
                            <Button 
                                className='p-button-outlined p-button-rounded'
                                label='Criar Bloco'
                                icon='pi pi-bolt'
                                onClick={(event)=>{
                                    var _custom_block = {...this.props.block}
                                    _custom_block.name = this.state.block_name
                                    _custom_block.colour = this.state.block_colour
                                    _custom_block.tooltip = this.state.block_tooltip
                                    _custom_block.inline = this.state.inline
                                    _custom_block.previous = this.state.previous
                                    _custom_block.next = this.state.next
                                    _custom_block.block = this.state.block_id
                                    // console.log(_custom_block, this.state)

                                    // this.props.add_new_block(new block_object(_custom_block))
                                    // this.props.onHide()

                                    add_data('custom_blocks',_custom_block).then((ret)=>{
                                        this.props.add_new_block(new block_object(_custom_block))
                                        this.props.onHide()
                                    })
                                }}
                            />
                        </div>
                    )
                }}
                onHide={() => {
                    this.props.onHide?.()
                }}>
                {this.props.block.code &&
                    <div className='flex flex-wrap p-fluid grid formgrid'>
                        <div style={{ width:"max-content"}} className='flex flex-wrap flex-grow-1 field sm:col-12 md:col-4 lg:col-6' >
                            <h6>Visualização</h6>
                            
                            <BlocklyWorkspace 
                                onMount={(obj)=>{
                                    // console.log(obj,this.props.block)
                                    this.setState({
                                        workspace:obj,
                                        block_name:this.props.block.name,
                                        block_id:toIdTag(this.props.block.name)
                                    })
                                }} 
                                block={this.props.block}
                            />
                        </div>
                        <div className='flex-grow-1 flex sm:col-6 md:col-3 lg:col-3 flex-wrap gap-2 p-fluid grid formgrid' >
                            <div className='field flex-grow-1 col-1'>
                                <h6>Cor</h6>
                                <ColorPicker
                                    value={this.state.block_colour}
                                    onChange={(e) => {
                                        this.state.workspace.state.block.setColour(e.value)
                                        this.state.workspace.state.block.render()
                                        this.setState({ block_colour: e.value })}
                                    }
                                />
                            </div>
                            
                            <div className='flex-grow-1 field col-6'>
                                <h6>Nome</h6>
                                <InputText
                                    value={this.state.block_name}
                                    onChange={(event) => {
                                        const field = this.state.workspace.state.block.getInput('NAME').fieldRow[0];
                                        field.setValue(event.target.value);
                                        this.state.workspace.state.block.render()
                                        this.setState({ block_name: event.target.value })
                                    }}
                                />
                            </div>
                            {/* <div className='flex-grow-1 field col-3'>
                                <h6>ID Tag</h6>
                                <InputText disabled value={this.state.block_id}/>
                            </div> */}
                            <div className='flex-grow-1 field col-12'>
                                <h6>Descrição</h6>
                                <InputText onChange={(event)=>{
                                    // console.log(event.target.value)
                                    this.state.workspace.state.block.setTooltip(event.target.value)
                                    this.state.workspace.state.block.render()
                                    this.setState({block_tooltip: event.target.value})
                                }}/>
                            </div>
                            <div className='flex-grow-1 field col-3'>
                                <h6>Entradas</h6>
                                <ToggleButton
                                    checked={this.state.inline}
                                    onChange={(e) => {
                                        this.state.workspace.state.block.setInputsInline(e.value)
                                        this.state.workspace.state.block.render()
                                        this.setState({inline: e.value})}
                                    }
                                    onLabel="Incorporadas"
                                    offLabel="Externas"
                                    onIcon="pi pi-ellipsis-h"
                                    offIcon="pi pi-ellipsis-v"
                                    aria-label="Confirmation"
                                />
                            </div>
                            <div className='flex-grow-1 field col-3'>
                                <h6>Anterior</h6>
                                <ToggleButton
                                    checked={this.state.previous}
                                    onChange={(e) => {
                                        this.state.workspace.state.block.setPreviousStatement(e.value, "Any")
                                        this.state.workspace.state.block.render()
                                        this.setState({previous: e.value})}
                                    }
                                    onLabel="Sim"
                                    offLabel="Não"
                                    onIcon="pi pi-arrow-up"
                                    offIcon="pi pi-times"
                                    aria-label="Confirmation"
                                />
                            </div>
                            <div className='flex-grow-1 field col-3'>
                                <h6>Próximo</h6>
                                <ToggleButton
                                    checked={this.state.next}
                                    onChange={(e) => {
                                        this.state.workspace.state.block.setNextStatement(e.value, "Any")
                                        this.state.workspace.state.block.render()
                                        this.setState({next: e.value})}
                                    }
                                    onLabel="Sim"
                                    offLabel="Não"
                                    onIcon="pi pi-arrow-down"
                                    offIcon="pi pi-times"
                                    aria-label="Confirmation"
                                />
                            </div>
                        </div>
                        <div className='flex-grow-1 field col-12'>
                            <h6>Javascript</h6>
                            <pre>
                                <code className="hljs language-javascript">
                                    <div dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(beautify_js(this.props.block.code)).value }} />
                                </code>
                            </pre>
                        </div>
                    </div>
                }
            </Dialog>
        )
    }
}