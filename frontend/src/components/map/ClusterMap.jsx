import React, { useEffect, useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import { getTrails } from '../../actions/trail';
import ReactMapGL, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl';
import SuperCluster from 'supercluster';
import './cluster.css'
import { Avatar, Paper, Tooltip } from '@mui/material';
import { Typography } from '@mui/material';
import GeocoderInput from '../sidebar/GeocoderInput';
import PopupTrail from './PopupTrail';

const supercluster = new SuperCluster({
  radius: 75,
  maxZoom: 20
});

function ClusterMap() {
  const { state: { filteredTrails }, dispatch, mapRef } = useValue();
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [checkpointData, setCheckpointData] = useState(null);
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [bounds, setBounds] = useState([-180, -85, 180, 85]);
  const [zoom, setZoom] = useState(0);
  const [popupInfo, setPopupInfo] = useState(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);

  useEffect(() => {
    getTrails(dispatch);
  }, []);

  useEffect(() => {
    const points = filteredTrails.map((trail) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        trailId: trail._id,
        title: trail.title,
        description: trail.description,
        images: trail.images,
        floc: trail.floc,
        sloc: trail.sloc,
        checkpoints: trail.checkp,
        uPhoto: trail.uPhoto,
        uName: trail.uName,
        uid: trail.uid,
        price: trail.price,
      },
      geometry: {
        type: 'Point',
        coordinates: [trail.sloc[0], trail.sloc[1]],
      },
    }));
    setPoints(points);
  }, [filteredTrails]);

  useEffect(() => {
    supercluster.load(points);
    setClusters(supercluster.getClusters(bounds, zoom));
  }, [points, zoom, bounds]);

  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef.current.getMap().getBounds().toArray().flat());
    }
  }, [mapRef?.current]);

  const handlePopupOpen = (properties) => {
    setPopupInfo(properties);
    fetchRouteData(properties);
  };

  const handleCheckpointClick = (event) => {
    const features = mapRef.current.getMap().queryRenderedFeatures(event.point, {
      layers: ['checkpoint-layer']
    });
    
    if (features.length > 0) {
      const clickedCheckpoint = features[0];
      setSelectedCheckpoint({
        description: clickedCheckpoint.properties.description,
        coordinates: clickedCheckpoint.geometry.coordinates
      });
    } else {
      setSelectedCheckpoint(null);
    }
  };

  const fetchRouteData = async (prop) => {
    if (!prop.sloc || !prop.floc) return null;
    const waypoints = [
      [prop.sloc[0], prop.sloc[1]],
      ...prop.checkpoints.map(checkpoint => [checkpoint[0], checkpoint[1]]),
      [prop.floc[0], prop.floc[1]],
    ];

    if (waypoints.length < 2) return null;

    try {
      const coordinates = waypoints.map((coord) => coord.join(',')).join(';');
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRouteGeometry({
          type: 'Feature',
          properties: {},
          geometry: data.routes[0].geometry,
        });
      }
      const checkpointsData = {
        type: 'FeatureCollection',
        features: prop.checkpoints.map((checkpoint, index) => ({
          type: 'Feature',
          properties: { description: `${checkpoint[2]}` },
          geometry: { type: 'Point', coordinates: [checkpoint[0], checkpoint[1]] }
        }))
      };
      setCheckpointData(checkpointsData);
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactMapGL
        initialViewState={{ latitude: 27, longitude: 88, zoom: 6 }}
        mapboxAccessToken={'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        ref={mapRef}
        onZoomEnd={(e) => setZoom(Math.round(e.viewState.zoom))}
        onClick={handleCheckpointClick}
      >
        {/* Existing markers and clusters code... */}
        {clusters.map((cluster) => {
          const { cluster: isCluster, point_count } = cluster.properties;
          const [longitude, latitude] = cluster.geometry.coordinates;
          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
              >
                <div
                  id="cluster"
                  style={{
                    width: `${10 + (point_count / points.length) * 20}px`,
                    height: `${10 + (point_count / points.length) * 20}px`,
                  }}
                  onClick={() => {
                    const zoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20);
                    mapRef.current.flyTo({
                      center: [longitude, latitude],
                      zoom,
                      speed: 1,
                    });
                  }}
                >
                  {point_count}
                </div>
              </Marker>
            );
          }
          return (
            <Marker
              key={`trial-${cluster.properties.trailId}`}
              longitude={longitude}
              latitude={latitude}
            >
              <Tooltip title={cluster.properties.uName}>
                <Avatar
                  src={cluster.properties.uPhoto}
                  component={Paper}
                  elevation={2}
                  onMouseEnter={() => handlePopupOpen(cluster.properties)}
                />
              </Tooltip>
            </Marker>
          );
        })}
        <GeocoderInput />
        {popupInfo && (
          <Popup
            longitude={popupInfo.sloc[0]}
            latitude={popupInfo.sloc[1]}
            maxWidth="auto"
            closeOnClick={false}
            focusAfterOpen={false}
            onClose={() => setPopupInfo(null)}
          >
            <PopupTrail {...{ popupInfo }} />
            {popupInfo.sloc && popupInfo.floc && (
              <Source
                id="route"
                type="geojson"
                data={routeGeometry}
              >
                <Layer
                  id="route-layer"
                  type="line"
                  paint={{
                    'line-color': '#3887be',
                    'line-width': 4,
                  }}
                />
              </Source>
            )}
            {checkpointData && (
              <>
                <Source id="checkpoints" type="geojson" data={checkpointData}>
                  <Layer
                    id="checkpoint-layer"
                    type="circle"
                    paint={{
                      'circle-radius': 6,
                      'circle-color': '#FFFF00',
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#fff'
                    }}
                  />
                  <Layer
                    id="checkpoint-label"
                    type="symbol"
                    layout={{
                      'text-field': ['get', 'description'],
                      'text-offset': [0, -1.5],
                      'text-anchor': 'bottom',
                      'text-size': 12
                    }}
                    paint={{
                      'text-color': '#000',
                      'text-halo-color': '#fff',
                      'text-halo-width': 1
                    }}
                  />
                </Source>
              </>
            )}
          </Popup>
        )}
         {selectedCheckpoint && (
          <Popup
            longitude={selectedCheckpoint.coordinates[0]}
            latitude={selectedCheckpoint.coordinates[1]}
            onClose={() => setSelectedCheckpoint(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <div 
              style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                minWidth: '150px',
                maxWidth: '300px'
              }}
            >
              <Typography
                variant="body1"
                style={{
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: 0,
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  lineHeight: 1.5
                }}
              >
                {selectedCheckpoint.description}
              </Typography>
            </div>
          </Popup>
        )}
        
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
      </ReactMapGL>
    </div>
  );
}

export default ClusterMap;