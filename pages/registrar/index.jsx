import React, { useRef, useState, useEffect } from "react"
import { ProgressBar } from 'primereact/progressbar';
import ObjectComponent from "../components/object"
import {Form, Card, Alert} from 'react-bootstrap'
import "bootstrap/dist/css/bootstrap.min.css"
import { useAuth } from "../api/auth"
import { useRouter } from 'next/router'
import { Button } from "primereact/button";

export default function Signup() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmRef = useRef()
    const { signup, currentUser } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e){
        e.preventDefault()

        if(passwordRef.current.value !== passwordConfirmRef.current.value){
            return setError('Senhas não são iguais')
        }
        try{
            setError("")
            setLoading(true)
            await signup(emailRef.current.value, passwordRef.current.value).then((res)=>{
                
                router.push('/login')
            })
        }catch(error){
            const errorCode = error.message.split('(')[1].split(')')[0]
            switch (errorCode){ 
                case "auth/weak-password":
                    setError("Sua senha deve conter no mínimo 6 caracteres")
                    break;

                case "auth/email-already-in-use":
                    setError("Este email já foi cadastrado")
                    break;

                default:
                    setError(error.message)
                    break;
            }
        }
        setLoading(false)
    }

    useEffect(()=>{
        if(currentUser) router.push('/')
    }, [currentUser])

    if(currentUser !== null) return(<><ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}></ProgressBar></>)

	return (
		<ObjectComponent
            noUser={true}
            alerts={false} onLoad={(e)=>{
			document.title = "Registro"
		}}>
            <div className="flex justify-content-center align-items-center h-screen w-full">
                
                    <div className='w-100' style={{maxWidth:"400px"}}>
                    <Card style={{
                            backgroundColor:"var(--glass)",
                            backdropFilter: "blur(5px)"
                            }}>
                            <Card.Body>
                                <h2 style={{color:"var(--text)"}} className="text-center mb-4">Crie Seu Perfil</h2>
                                {/* {currentUser?.email} */}
                                {error && <Alert variant="danger">{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group id="email">
                                        <Form.Label style={{color:"var(--info)"}}  className="m-2">Email</Form.Label>
                                        <Form.Control type="email" ref={emailRef} required />
                                    </Form.Group>
                                    <Form.Group id="password">
                                        <Form.Label style={{color:"var(--info)"}}  className="m-2">Senha</Form.Label>
                                        <Form.Control type="password" ref={passwordRef} required />
                                    </Form.Group>
                                    <Form.Group id="password-confirm">
                                        <Form.Label style={{color:"var(--info)"}}  className="m-2">Confirmar Senha</Form.Label>
                                        <Form.Control type="password" ref={passwordConfirmRef} required />
                                    </Form.Group>
                                    <Button
                                        style={{
                                            width:"100%",
                                            background:"var(--primary)",
                                            borderColor:"var(--primary-b)",
                                            color:"var(--text)"
                                        }}
                                        label="Criar"
                                        disabled={loading}
                                        className="w-100 text-center mt-4"
                                        type="submit" />
                                </Form>
                            </Card.Body>
                        </Card>
                       
                        <div className="w-100 text-center mt-3" style={{color:"var(--text)"}}>
                            <Button label="Entre na sua conta" className="p-button-outlined p-button-secondary mt-3" onClick={()=>{
                                router.push('/login')
                            }}/>
                        </div>
                    </div>
                
            </div>
		</ObjectComponent>
	)
}
