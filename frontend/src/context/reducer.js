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
            // localStorage.setItem('currentUser',JSON.stringify(action.payload))
            if (action.payload) {
                localStorage.setItem('currentUser', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('currentUser');
            }
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
        case 'RESET_TRAIL':
            return {...state,images:[],details:{title:'',description:'',price:0},slocation:{lng:0,lat:0},flocation:{lng:0,lat:0},checkpoints:[]}
        case 'UPDATE_TRAILS':
            return {...state,trails:action.payload,addressFilter:null,priceFilter:150,filteredTrails:state.trails}
        case 'FILTER_PRICE':
            return {...state,priceFilter:action.payload,filteredTrails:applyFilter(
                state.trails,
                state.addressFilter,
                action.payload
            )}
        case 'FILTER_ADDRESS':
            return {...state,addressFilter:action.payload,filteredTrails:applyFilter(
                state.trails,
                action.payload,
                state.priceFilter
            )}
        case 'CLEAR_ADDRESS':
            return {...state,addressFilter:null,priceFilter:150}
        case 'UPDATE_TRAIL':
            return {...state,trail:action.payload}
       
            
        default:
            throw new Error('No matched action:')
    }
}
export default reducer;

const applyFilter=(trails,address,price)=>{
    let filteredtrails=trails
    if(address){
        const {lng,lat}=address
        filteredtrails=filteredtrails.filter(trail=>{
            
            const lngDiff=lng>trail.sloc[0]?lng-trail.sloc[0]:trail.sloc[0]-lng
            const latDiff=lat>trail.sloc[1]?lat-trail.sloc[1]:trail.sloc[1]-lat
            return lngDiff<=1 && latDiff<=1
        })
    }
    if(price<150){
        filteredtrails=filteredtrails.filter(trail=>trail.price<=price)
    }
    return filteredtrails
}