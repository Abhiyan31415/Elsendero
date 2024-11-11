import fetchData from './utils/fetchData.js'
import {v4 as uuidv4} from 'uuid'
const url ='http://localhost:5000/user';
import uploadFile from '../firebase/uploadFile';

export const register=async(user,dispatch)=>{
    dispatch({type:'START_LOADING'})
    //SEND REQWUEST with fetch
    const result =await fetchData({url:url+'/register',body:user},dispatch)
    if(result){
        dispatch({type:'UPDATE_USER',payload:result})
        dispatch({type:'CLOSE_LOGIN'})
        dispatch({type:'UPDATE_ALERT',payload:{open:true,message:'ACCOUNT HAS BEEN CREATED SUCCESSFULLY ',severity:'success'}})
    }

    dispatch({type:"END_LOADING"})
};
export const login=async(user,dispatch)=>{
    dispatch({type:'START_LOADING'})
    //SEND REQWUEST with fetch
    const result =await fetchData({url:url+'/login',body:user},dispatch)
    if(result){
        dispatch({type:'UPDATE_USER',payload:result})
        dispatch({type:'CLOSE_LOGIN'})
        
    }

    dispatch({type:"END_LOADING"})
}
export const updateProfile=async(currentUser,updatedFields,dispatch)=>{
    dispatch({type:'START_LOADING'})
    //SEND REQWUEST with fetch
    const {name,file}=updatedFields;
    try{
        if(file){
            const imageName=uuidv4()+file?.name?.split('.')?.pop()
            const photoURL=await uploadFile(file,`profile/${currentUser.id}/${imageName}`)
            body={...body,photoURL}
            const result =await fetchData({url:url+'/updateProfile',body,method:'PATCH',body,token:currentUser.token},dispatch)
            if(result){
                dispatch({type:'UPDATE_USER',payload:{...currentUser,...result}})   
                dispatch({type:'UPDATE_ALERT',payload:{open:true,message:'Your profile has been updated successfully',severity:'success'}})
                dispatch({type:'UPDATE_PROFILE',payload:{open:false,file:null,photoURL:result.photoURL}})
            }
        }
    }catch(error){
        dispatch({type:'UPDATE_ALERT',payload:{open:true,message:error.message,severity:'error'}})
        console.log(error)
    }

    dispatch({type:"END_LOADING"})
}