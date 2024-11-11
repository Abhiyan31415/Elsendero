import fetchData from './utils/fetchData.js'

const url ='http://localhost:5000/user';

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