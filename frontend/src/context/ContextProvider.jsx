import React, { createContext, useContext, useEffect } from 'react';
import reducer from './reducer';
import { useReducer } from 'react';
const initialState = {
    currentUser:null,
    openLogin:false,
    loading:false,
    alert:{open:false,severity:'info',message:''},
    profile:{open:false,file:null,photo:''},
    images:[],
    details:{title:'',description:'',price:0},
    slocation:{lng:0,lat:0},
    flocation:{lng:0,lat:0},
    checkpoints:[],
    trails:[],
}
const Context=createContext(initialState)
export const useValue=()=>{
    return useContext(Context)
}


const ContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(()=>{
        const currentUser=JSON.parse(localStorage.getItem('currentUser'))
        if(currentUser){
            dispatch({type:'UPDATE_USER',currentUser})
        }

    },[])
    return (
        <Context.Provider value={{state,dispatch}}> {children} </Context.Provider>
    );
}
export default ContextProvider;