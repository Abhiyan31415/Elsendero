const reducer=(state,action)=>{
    switch(action.type){
        case 'OPEN_LOGIN':
            return {...state,openLogin:true}
        case 'CLOSE_LOGIN':
            return {...state,openLogin:false}
        case 'START_LOADING':
                return {...state,loading:true}
        case 'END_LOADING':
                return {...state,loading:false} 
        case 'UPDATE_USER':
            localStorage.setItem('currentUser',JSON.stringify(action.payload))
            return {...state,currentUser:action.payload}
        case 'UPDATE_ALERT':
            return {...state,alert:action.payload}
        case 'UPDATE_PROFILE':
            return {...state,profile:action.payload}
        case'UPDATE_IMAGES':
            return {...state,images:[...state.images,action.payload]}
        case 'UPDATE_DETAILS':
            return {...state,details:{...state.details,...action.payload}}
        case 'UPDATE_SLOCATION':
            return {...state,slocation:action.payload}
        case 'UPDATE_FLOCATION':
            return {...state,flocation:action.payload}
        case 'ADD_CHECKPOINT':
                return { ...state, checkpoints: [...state.checkpoints, action.payload] };
        case 'DELETE_CHECKPOINT':
                return {
                      ...state,
                      checkpoints: state.checkpoints.filter((_, index) => index !== action.payload)
                    };
        case 'UPDATE_CHECKPOINT':
                        const updatedCheckpoints = [...state.checkpoints];
                        updatedCheckpoints[action.payload.index] = {
                          ...updatedCheckpoints[action.payload.index],
                          description: action.payload.description
                        };
                        return {
                          ...state,
                          checkpoints: updatedCheckpoints
                        };
        default:
            throw new Error('No matched action:')
    }
}
export default reducer;