import React from 'react'
import {updateProfile} from "../../actions/user.js"
import { useValue } from '../../context/ContextProvider'
import Dialog from '@mui/material/Dialog'
import { Avatar, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useRef } from 'react'
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
        e.preventDefault();
        const name=nameRef.current.value
        //pass user name and photo to new function in user actions
        updateProfile(currentUser,{name,file:profile.file},dispatch)

    }
    const handleChange=(e)=>{

        const file=e.target.files[0]
        if(file){
            const photoURL=URL.createObjectURL(file)
            dispatch({type:'UPDATE_PROFILE',payload:{...profile,photoURL,file}})
        }
    }
  return (
    <Dialog
    open={profile.open}
    onClose={handleClose}
    >
        <DialogTitle>
            Profile
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
            />
           <label htmlFor='profilePhoto'>
            <input accept='image/*' id='profilePhoto' type='file' style={{display:'none'}} onChange={handleChange}/>
            <Avatar src={profile.photoURL}
            sx={{width:75,height:75,cursor:'pointer'}}
            />
           
           </label>
            
            </DialogContent>
            <DialogActions>
                <Button type="submit" variant='contained' endIcon={<Send/>}>
                    UPDATE
                </Button>
            </DialogActions>
        </form>
        
    </Dialog>
  )
}

export default Profile