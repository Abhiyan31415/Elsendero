import React, { useEffect, useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import { getTrails } from '../../actions/trail';
import ReactMapGL from 'react-map-gl';
import SuperCluster from 'supercluster';

function ClusterMap() {
  const { state: { trails }, dispatch } = useValue();
  const [viewport, setViewport] = useState({
    latitude: 37.7749, // Example latitude
    longitude: -122.4194, // Example longitude
    zoom: 1.5,
  });

  useEffect(() => {
    getTrails(dispatch);
  }, [dispatch]);

  useEffect(() => {
    // Handle trails update if needed
  }, [trails]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapboxAccessToken={'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
      >
        {/* Add markers or other map elements here */}
      </ReactMapGL>
    </div>
  );
}

export default ClusterMap;