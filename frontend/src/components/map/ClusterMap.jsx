import React, { useEffect, useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import { getTrails } from '../../actions/trail';
import ReactMapGL, { Marker } from 'react-map-gl';
import SuperCluster from 'supercluster';
import './cluster.css'
import { Avatar, Paper, Tooltip } from '@mui/material';
import GeocoderInput from '../sidebar/GeocoderInput';

const supercluster = new SuperCluster({
  radius:75,
  maxZoom:20
});


function ClusterMap() {
  const { state: {  filteredTrails }, dispatch ,mapRef} = useValue();

   const [points,setPoints]=useState([])
   const [clusters,setClusters]=useState([])
   const [bounds,setBounds]=useState([-180, -85, 180, 85])
  const [zoom,setZoom]=useState(0)

 

  useEffect(() => {
    getTrails(dispatch);
  }, []);

  useEffect(() => {
    // Handle trails update if needed
    const points =  filteredTrails.map((trail) => ({
      type: 'Feature',
      properties: { cluster: false, trailId: trail._id, price:trail.price,
        title:trail.title,
        description:trail.description,
        images:trail.images,
        floc:trail.floc,
        sloca:trail.sloc,
        checkpoints:trail.checkpoints,
        uPhoto:trail.uPhoto,
        uName:trail.uName,
        uid:trail.uid,
      },
     
      geometry: {
        type: 'Point',
        coordinates: [trail.sloc[0], trail.sloc[1]],
      },
    }));
    setPoints(points);
  }, [ filteredTrails]);
  useEffect(() => {
    supercluster.load(points);
    setClusters(supercluster.getClusters(bounds, zoom));
  },[points,zoom,bounds])
  useEffect(() => {
    if(mapRef.current){
      setBounds(mapRef.current.getMap().getBounds().toArray().flat())
    }



  },[mapRef?.current])
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactMapGL
         initialViewState={{ latitude: 27, longitude: 88, zoom:6 }}
         mapboxAccessToken={'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'}
         mapStyle="mapbox://styles/mapbox/streets-v11"
         ref={mapRef}
         onZoomEnd={(e) => setZoom(Math.round(e.viewState.zoom))}
      >
        {/* Add markers or other map elements here */}
        {
          clusters.map((cluster)=>{
            const {cluster:isCluster,point_count} = cluster.properties
            const [longitude,latitude]=cluster.geometry.coordinates
            if(isCluster){
              return(
                <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                >
                  <div
                  id='cluster'
                  style={{
                    width:`${10+(point_count/points.length)*20}px`,
                    height:`${10+(point_count/points.length)*20}px`

                  }}
                  onClick={()=>{
                    const zoom =Math.min(supercluster.getClusterExpansionZoom(cluster.id),20)
                    mapRef.current.flyTo({
                      center:[longitude,latitude],
                      zoom,
                      speed:1

                    })
                  }}
                  >
                    {point_count}
                  </div>
                </Marker>
              )
            }
            return(
              <Marker
              key={`trial-${cluster.properties.trailId}`}
              longitude={longitude}
              latitude={latitude}
              >
                <Tooltip
                title={cluster.properties.uName}
                >
                  <Avatar
                  
                  src={cluster.properties.uPhoto}
                  component={Paper}
                  elevation={2}
                  >
                    

                  </Avatar>

                </Tooltip>
              </Marker>
            )
          })
        }
        <GeocoderInput/>
      </ReactMapGL>
    </div>
  );
}

export default ClusterMap;