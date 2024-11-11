import React from 'react'
import { useValue } from '../../context/ContextProvider'
import Dialog from '@mui/material/Dialog'
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


function Profile() {
    const{state:{profile,currentUser},dispatch}=useValue()
    const nameRef=useRef()
    const handleClose=()=>{
        dispatch({type:'UPDATE_PROFILE',payload:{...profile,open:false}})
    }
    const handleSubmit=(e)=>{
        e.preventDefault()
    }
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
                    You can update your profile
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
                defaultValue={currentUser.name}
            />}
           <label htmlFor='profilePhoto'>
            <input accept='image/*' id='profilePhoto' type='file' style={{display:'none'}} onChange={handleChange}/>
            
           
           </label>
            
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

export default Profile