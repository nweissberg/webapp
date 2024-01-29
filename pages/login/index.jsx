import React, { useRef, useState, useEffect } from "react"
import { ProgressBar } from 'primereact/progressbar';
import ObjectComponent from "../components/object"
import { Form, Card, Alert } from 'react-bootstrap'
import "bootstrap/dist/css/bootstrap.min.css"
import { useAuth } from "../api/auth"
import { useRouter } from 'next/router'
import { Button } from "primereact/button";


export default function Login() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const { login, currentUser } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e){
        e.preventDefault()

        try{
            setError("")
            setLoading(true)
            await login(emailRef.current.value, passwordRef.current.value).then((user)=>{
                // console.log(user)
                router.push('/')
            })
        }catch(error){
            const errorCode = error.message.split('(')[1].split(')')[0]
            switch (errorCode){
                case "auth/user-not-found":
                    setError("Usuário não cadastrado")
                    break;
                case "auth/wrong-password":
                    setError("Senha incorreta")
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

    if(currentUser !== null) return(<>
        <ProgressBar mode="indeterminate" style={{ height: '6px', marginBottom:"-6px" }}></ProgressBar>
    </>)

	return (
		<ObjectComponent
            noUser={true}
            alerts={false} onLoad={(e)=>{
			document.title = "Login"
		}}>
            <div className="flex justify-content-center align-items-center h-screen w-full">
                
                
                <div className='w-100' style={{maxWidth:"400px"}}>
                    <Card style={{
                        backgroundColor:"rgba(33,35,40,0.5)",
                        backdropFilter: "blur(5px)"
                        }}>
                        <Card.Body>
                            <h2 style={{color:"var(--text)"}} className="text-center mb-4">Bem-vindo</h2>
                            {/* {currentUser?.email} */}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email">
                                    <Form.Label style={{color:"var(--info)"}} className="m-2">Email</Form.Label>
                                    <Form.Control className="form-input" type="email" ref={emailRef} required autoComplete="username"/>
                                </Form.Group>
                                <Form.Group id="password">
                                    <Form.Label style={{color:"var(--info)"}} className="m-2">Senha</Form.Label>
                                    <Form.Control style={{color:"var(--text)", backgroundColor:"var(--surface-d)", borderColor:"var(--info)"}} type="password" ref={passwordRef} required autoComplete="current-password" />
                                </Form.Group>
                                <Button
                                    style={{
                                        width:"100%",
                                        background:"var(--primary)",
                                        borderColor:"var(--primary-b)",
                                        color:"var(--text)"
                                    }}
                                    label="Entrar"
                                    disabled={loading}
                                    className="w-100 text-center mt-4"
                                    type="submit"
                                />
                            </Form>
                            <div className="w-100 text-center mt-3">
                                {/* <a href={"/reset"}>Esqueci minha senha</a> */}
                                <Button label="Esqueci minha senha" className="p-button-link" onClick={()=>{
                                    router.push('/reset')
                                }}/>
                            </div>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-3" style={{color:"var(--text)"}}>
                        <Button label="Crie uma conta" className="p-button-outlined p-button-secondary mt-3" onClick={()=>{
                            router.push('/registrar')
                        }}/>
                    </div>
                </div>
            </div>
		</ObjectComponent>
	)
}
