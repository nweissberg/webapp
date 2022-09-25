import React, { useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}

export function AuthProvider({children}){
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true)

    function signup(email,password){
        return createUserWithEmailAndPassword(auth, email, password)
    }
    function login(email,password){
        return signInWithEmailAndPassword(auth, email, password)
    }
    function resetPassword(email){
        return sendPasswordResetEmail(auth,email)
    }
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    const value ={
        currentUser,
        login,
        signup,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}