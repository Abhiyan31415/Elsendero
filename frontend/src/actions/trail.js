import fetchData from './utils/fetchData'


const url ='http://localhost:5000/trial'

export const createTrail =async(trail,currentUser,dispatch)=>{
    dispatch({type:'START_LOADING'})

    const result=await fetchData({url,body:trail,token:currentUser.token},dispatch)   
    if(result){
        dispatch({type:'UPDATE_ALERT',payload:{open:true,message:'Trail has been created successfully',severity:'success'}})
    }

    dispatch({type:"END_LOADING"})
}