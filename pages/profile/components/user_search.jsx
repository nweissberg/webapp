
import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import UserIcon from '../../components/user_icon';
import { alphabetically, swap_array } from '../../utils/util';

export default function UserSearch(props){

    const [selectedusers, setSelectedUsers] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // console.log(props.currentUser)
        setCurrentUser(props.currentUser)
    },[]); // eslint-disable-line react-hooks/exhaustive-deps

    const onUsersChange = (e) => {
        setSelectedUsers(e.value);
        props.onChange?.(e.value);
    }

    const selectedusersTemplate = (option, props) => {
        if (option) {
            return (<UserIcon
                currentUser={currentUser}
                user={option}
                size="25"
                inline
                role
                fullname={false}
            />);
        }

        return (
            <span>
                {props.placeholder}
            </span>
        );
    }
    function sortUsers(){
        if(!currentUser)return(props.all_users)
        if(props?.hideUser){
            var _all_users = props.all_users?.filter((u)=>u.uid!=currentUser.uid)
        }else{
            var _all_users = swap_array(props.all_users,0,props.all_users?.findIndex((u)=>u.uid==currentUser.uid))
        }

        return _all_users.sort((a, b) => {
            if (a !== _all_users[0] && b !== _all_users[0]) {
              return alphabetically(a,b,"name")
            }
        })
    }
    const usersOptionTemplate = (option) => {
        return (
            <div className="users-item">
                <UserIcon
                    currentUser={currentUser}
                    user={option}
                    size="50"
                    inline
                    role
                />
            </div>
        );
    }

    return (
        <div className="flex w-full">
            <Dropdown
                disabled={props?.disabled}
                className='flex w-full'
                value={selectedusers}
                options={sortUsers()}
                onChange={onUsersChange}
                optionLabel="name"
                filter showClear filterBy="name"
                placeholder={'Encontre uma pessoa...'}
                valueTemplate={selectedusersTemplate}
                itemTemplate={usersOptionTemplate}
            />
        </div>
    );
}
                 