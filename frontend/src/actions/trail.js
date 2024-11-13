import fetchData from './utils/fetchData'


const url ='http://localhost:5000/trial'

export const createTrail =async(trail,currentUser,dispatch,setPage)=>{
    dispatch({type:'START_LOADING'})

    const result=await fetchData({url,body:trail,token:''},dispatch)   
    if(result){
        dispatch({type:'UPDATE_ALERT',payload:{open:true,message:'Trail has been created successfully',severity:'success'}})
    dispatch({type:'RESET_TRAIL'})
    setPage(0)
    }

    dispatch({type:"END_LOADING"})
};
export const getTrails =async(dispatch)=>{
    const result =await fetchData({url,method:'GET'},dispatch)

    if(result){
        dispatch({type:'UPDATE_TRAILS',payload:result})
    }
}