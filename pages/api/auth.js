import React, { useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth, readUserData } from "./firebase";
import localForage from "localforage";
import { api_get } from "./connect";

var profile_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'perfil'
});

var companies_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'empresas'
});

var vendedores_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'vendedores'
});

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}

export function AuthProvider({children}){
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true)

    // const {
    //     isLoading,
    //     error,
    //     data,
    //   } = useVisitorData();

    function signup(email,password){
        return createUserWithEmailAndPassword(auth, email, password)
    }
    function login(email,password){
        return signInWithEmailAndPassword(auth, email, password)
    }
    function resetPassword(email){
        return sendPasswordResetEmail(auth,email)
    }
    
    function updateUser(user){
        // console.log(user)
        profile_db.setItem(user.uid,user)
        setCurrentUser(user)
    }

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, user => {
            // console.log(user)
            if(user != null){
                // get_fingerprint(user).then((fp_data)=>{
                // console.log('Fingerprint:',fp_data)
                
                api_get({
                    keys:[],
                    query:"PEcsyXZlvljEV1Stxey5",
                    credentials:"0pRmGDOkuIbZpFoLnRXB"
                }).then((companies)=>{
                    if(companies){
                        companies.map((company)=>{
                            companies_db.setItem(company.id.toString(),company)
                        })
                    }
                })

                var _user = {
                    uid:user.uid,
                    name:user.displayName,
                    email:user.email,
                    photo:user.photoURL,
                    metadata:user.metadata
                }
                

                readUserData(user.uid).then(async (userdata)=>{
                    if(userdata !== null){
                        await vendedores_db.getItem(user.email).then((user_RP)=>{
                            // console.log(user_RP)
                            if(user_RP){
                                userdata.id = user_RP.id
                            }
                        })

                        _user.role = userdata.role || 0
                        _user.name = userdata.name || user.email.split("@")[0]
                        _user.photo = userdata.photo || "male_1"
                        _user.banner = userdata.banner || "1"
                        _user.metadata = userdata.metadata || {}
                        _user.discount = userdata.discount || 0
                        _user.id = userdata.id || null
                        profile_db.setItem(user.uid,_user)
                    }
                    // console.log(_user)
                    setCurrentUser(_user)
                    setLoading(false)
                })
                // })
            }else{
                setCurrentUser(user)
                setLoading(false)
            }
        })
        return unsubscribe
    }, [])

    const value ={
        currentUser,
        login,
        signup,
        resetPassword,
        updateUser,
        loading
    }

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // if (error) {
    //     return <div>An error occurred: {error.message}</div>;
    // }

    // if (data) {
    //     // console.log(data)
    //     // perform some logic based on the visitor data
    //     return (
    //         <AuthContext.Provider value={value}>
    //             {/* <div style={{position:"absolute", color:"white"}}>
    //                 Welcome {data.visitorFound ? `back ${data.visitorId}` : ''}!
    //             </div> */}
    //             {!loading && children}
    //         </AuthContext.Provider>
    //     )

    // } else {
    //     return null;
    // }

    return (
        <AuthContext.Provider value={value}>
            {/* <div style={{position:"absolute", color:"white"}}>
                Welcome {data.visitorFound ? `back ${data.visitorId}` : ''}!
            </div> */}
            {!loading && children}
        </AuthContext.Provider>
    )
    
}