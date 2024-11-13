import React from 'react'
import { useValue } from '../../context/ContextProvider'
import { MapboxGeocoder } from 'mapbox-gl'
const ctrl = new MapboxGeocoder({
    marker:false,
    
    accessToken:'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'
})

const GeocoderInput = () => {
    const {mapRef,containerRef,dispatch}=useValue()
    useEffect((
        
    )=>{
        if(containerRef?.current?.children[0]){
            containerRef.current.removeChild(containerRef.current.children[0])
        }
        containerRef.current.appendChild(ctrl.onAdd(mapRef.current.getMap()))
        ctrl.on('result',(e)=>{
            const coords=e.result.geometry.coordinates
        })
    },[])
  return (
    null
  )
}

export default GeocoderInput