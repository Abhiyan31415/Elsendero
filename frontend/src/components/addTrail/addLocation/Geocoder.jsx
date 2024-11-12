import React from 'react'
import MapBoxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { useValue } from '../../../context/ContextProvider'
import { useControl } from 'react-map-gl'
function Geocoder() {
    const {dispatch}=useValue()
    const ctrl=new MapBoxGeocoder({
        accessToken:'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g',
        marker:false,
        collapsed:true,
    })
    useControl(()=>ctrl)
    ctrl.on('result',(e)=>{
       const coords=e.result.geometry.coordinates
       dispatch({type:'UPDATE_SLOCATION',payload:{lat:coords[1],lng:coords[0]}})
    })
  return (
    null
  )
}

export default Geocoder