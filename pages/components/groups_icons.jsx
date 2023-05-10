import React from 'react';
import GroupCard from '../sales/components/group_card';
import ScrollWrapper from './scroll_wrapper';

export default class GroupIcons extends React.Component{
    constructor(props){
        super(props)
        this.default={}
        this.state={...this.default}
    }

    render(){
        return(<div className='flex align-items-start md:align-items-center left-0 w-screen lg:h-26rem'>
            <ScrollWrapper className={`
                scrollbar-none
                overflow-y-scroll
                flex
                relative
                justify-content-center
                align-items-start
                lg:overflow-y-hidden 
                lg:align-items-start
                lg:horizontal-scrollbar
                md:align-items-start
                sm:align-items-center
                py-8
                sm:h-full
                lg:h-75 w-full
                overflow-x-scroll
            `} speed={150}>
                <div className={`
                    flex-wrap
                    flex relative
                    justify-content-center
                    align-content-start
                    lg:align-items-center
                    lg:absolute lg:left-0
                    w-full lg:w-max
                    md:top-0
                    mb-8
                    h-max 
                `}>
                    {this.props.client && this.props.selected != 0 && <div className="sm:m-0 ml-7 p-2">
                        <GroupCard 
                            key={0} 
                            load_products_group={this.props.load}
                            load_products_client={this.props.load_client}
                            group={{
                                id:0,
                                nome:"Itens do Cliente",
                                client:this.props.client
                            }}
                            searchGroup={(data)=>{
                                this.props.searchGroup(data,0);
                            }}
                        />
                    </div>}
                    {this.props.groups.map((group,group_index)=>{
                        if(this.props.selected?.id == group.id) return(<></>)
                        return(<div key={"group_"+group_index} className="sm:m-0 ml-7 p-2">
                            <GroupCard 
                                key={"group_"+group_index} 
                                load_products_group={this.props.load}
                                load_products_client={this.props.load_products_client}
                                group={group}
                                searchGroup={(data)=>{
                                    this.props.searchGroup(data,group);
                                }}
                            />
                        </div>)
                    })
                }
                </div>
            </ScrollWrapper>
        </div>)
    }
}