import { Box } from '@mui/material'
import React, { useEffect, useRef } from 'react'
import ReactMapGL, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl'
import { useValue } from '../../../context/ContextProvider'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Navigation } from '@mui/icons-material'
import Geocoder from './Geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
function AddFinalLocation() {
  const {state:{flocation:{lng,lat}},dispatch}=useValue()
  const mapRef=useRef()
  useEffect(()=>{
    if(!lng&&!lat){
      fetch('https://ipapi.co/json/').then(
        res=>{return res.json()})
        .then(data=>{
          mapRef.current.flyTo({
            center:[data.longitude,data.latitude],
          })
          
         dispatch({type:'UPDATE_FLOCATION',payload:{lat:data.latitude,lng:data.longitude}})
        })
    }


  },[])
  return (
    <Box
    sx={{
      height:400,
      position:'realtive',
    }}
    >
      <ReactMapGL
      ref={mapRef}
      mapboxAccessToken={'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'}
        initialViewState={{
          latitude:lat,
          longitude:lng,
          zoom:8,
        }}
        mapStyle='mapbox://styles/mapbox/streets-v11'
        >
          <Marker
          latitude={lat}
          longitude={lng}
          draggable
          onDragEnd={(e)=>{
            dispatch({
              type:'UPDATE_FLOCATION',
              payload:{
                lat:e.lngLat.lat,
                lng:e.lngLat.lng
              }
            })
          }}
          />
          <NavigationControl position='bottom-right'/>
          <GeolocateControl
          position='top-left'
          trackUserLocation
          onGeolocate={(e)=>{dispatch({
            type:'UPDATE_FLOCATION',
            payload:{
              lat:e.coords.latitude,
              lng:e.coords.longitude
            }})}}
          />
          <Geocoder/>
      </ReactMapGL>
    </Box>
  )
}

export default AddFinalLocation