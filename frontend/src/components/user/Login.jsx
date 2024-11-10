import React, { useState,useRef, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import {useValue} from '../../context/ContextProvider'
import { DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import PasswordField from './PasswordField'
import { Close, Send } from '@mui/icons-material';
import {
  Button,
 Icon,
  DialogActions,
  
  IconButton,
  TextField,
} from '@mui/material';

function Login() {
    const {state:{openLogin},dispatch}=useValue()
    const[title,setTitle]=useState('Login')
    const[isRegister,setIsRegister]=useState(false)
    const nameRef=useRef()
    const emailRef=useRef()
    const passwordRef=useRef()
    const confirmPasswordRef=useRef()


    const handleClose=()=>{
        dispatch({type:'CLOSE_LOGIN'})
    }
    const handleSubmit=(e)=>{
        e.preventDefault()
        //testing loading
        dispatch({type:'START_LOADING'})
        setTimeout(()=>dispatch({type:'END_LOADING'}),3000)



        //testing notification feature'
        const password=passwordRef.current.value
        const confirmPassword=confirmPasswordRef.current.value
        if(password!==confirmPassword){
            return dispatch({type:'UPDATE_ALERT',payload:{open:true,severity:'error',message:'Password does not match'}})
        }
    }
    useEffect(()=>{
        isRegister?setTitle('Register'):setTitle('Login')
    },[isRegister])
  return (
    <Dialog
    open={openLogin}
    onClose={handleClose}
    >
        <DialogTitle>
            {title}
            <IconButton
            sx={{position:'absolute',top:8,right:8,color:(theme)=>theme.palette.grey[500]}}
            onClick={handleClose}
            >
                <Close/>
            </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
            <DialogContent>
                <DialogContentText dividers>
                    Please Fill Your Information In the Fields Below
                </DialogContentText>
                {isRegister &&
                <TextField
                autoFocus
                margin="normal"
                variant='standard'
                id='name'
                label='Name'
                type='text'
                fullWidth
                inputRef={nameRef}
                inputProps={{minLength:3}}
                required
            
            />}
            <TextField
                autoFocus={!isRegister}
                margin="normal"
                variant='standard'
                id='email'
                label='Email'
                type='email'
                fullWidth
                inputRef={emailRef}
                inputProps={{minLength:3}}
                required
            
            />
            <PasswordField {...{passwordRef}} />
            {isRegister &&
            <PasswordField passwordRef={confirmPasswordRef} id='confirmPassword' label='Confirm PassWord' />
            }
            </DialogContent>
            <DialogActions>
                <Button type="submit" variant='contained' endIcon={<Send/>}>

                </Button>
            </DialogActions>
        </form>
        <DialogActions sx={{justifyContent:'left',p:'5px 24px'}}>
            {isRegister?'Do you have an account? Sign in':'Dont`t have an account? Register now'}
            <Button onClick={()=>setIsRegister(!isRegister)}>
                {isRegister?'Sign in':'Register'}
            </Button>
            <DialogActions sx={{justifyContent:'center',py:'24px'}}>
                
            </DialogActions>
        </DialogActions>
    </Dialog>
  )
}

export default Login