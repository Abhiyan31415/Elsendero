import React, { createContext, useContext, useEffect } from 'react';
import reducer from './reducer';
import { useReducer } from 'react';
const initialState = {
    currentUser:null,
    openLogin:false,
    loading:false,
    alert:{open:false,severity:'info',message:''},
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

    },[state])
    return (
        <Context.Provider value={{state,dispatch}}> {children} </Context.Provider>
    );
}
export default ContextProvider;