import React, { useState,useEffect } from 'react';
import { Box, Button, FormControl, RadioGroup, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Navigation, Save ,Delete} from '@mui/icons-material';
import InfoField from './InfoField'
import { useValue } from '../../../context/ContextProvider';
import ReactMapGL, { Marker, NavigationControl, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Geocoder from '../addLocation/Geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

function AddDetails() {
  const { state: { slocation, flocation, checkpoints ,title}, dispatch } = useValue();
  const [days, setDays] = useState([]);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [description, setDescription] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: slocation.lat,
    longitude: slocation.lng,
    zoom: 8,
    bearing: 0,
    pitch: 0
  });
  const [mapOpen, setMapOpen] = useState(false);
  const routeLayer = {
    id: 'route-layer',
    type: 'line',
    paint: {
      'line-color': '#3887be',
      'line-width': 4,
    },
  };


  
  const handleAddDay = () => {
    setDays([...days, { dayNumber: days.length + 1, activities: '', checkpoints: [] }]);
  };

  const handleDayChange = (index, value) => {
    const updatedDays = [...days];
    updatedDays[index].activities = value;
    setDays(updatedDays);
  };

  const handleMapClick = (event) => {
    if (event.features && event.features.length > 0) return;
    const { lng, lat } = event.lngLat;

    const newCheckpoint = { lng, lat, description: '' };
    dispatch({
      type: 'ADD_CHECKPOINT',
      payload: newCheckpoint
    });

    setSelectedPoint({
      ...newCheckpoint,
      index: checkpoints.length
    });
    setDescription('');
  };

  const fetchRouteData = async () => {
    if (!slocation || !flocation) return;

    const waypoints = [
      [slocation.lng, slocation.lat],
      ...checkpoints.map(checkpoint => [checkpoint.lng, checkpoint.lat]),
      [flocation.lng, flocation.lat]
    ];

    if (waypoints.length < 2) return;

    try {
      const coordinates = waypoints.map(coord => coord.join(',')).join(';');
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`
      );

      const data = await response.json();

      if (data.routes && data.routes[0]) {
        setRouteGeometry({
          type: 'Feature',
          properties: {},
          geometry: data.routes[0].geometry
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleSaveDescription = (index) => {
    dispatch({
      type: 'UPDATE_CHECKPOINT',
      payload: { index, description }
    });
    setSelectedPoint(null);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveDescription(selectedPoint.index);
    }
  };

  const CheckpointMarker = ({ checkpoint, index }) => (
    <Box
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2">Checkpoint {index + 1}</Typography>
            <Typography variant="body2">
              {checkpoint.description || 'No description added'}
            </Typography>
          </Box>
        }
        placement="top"
        arrow
        enterDelay={200}
        leaveDelay={0}
      >
        <Navigation
          onDoubleClick={(e) => handleMarkerDoubleClick(checkpoint, index, e)}
          sx={{
            color: 'error.main',
            transform: 'scale(1.5)',
            '&:hover': { transform: 'scale(1.8)' },
            cursor: 'pointer'
          }}
        />
      </Tooltip>

      {hoveredIndex === index && (
        <Box
          onClick={(e) => handleDeleteCheckpoint(index, e)}
          sx={{
            position: 'absolute',
            left: '100%',
            ml: 1,
            bgcolor: 'error.main',
            color: 'white',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: 'error.dark'
            }
          }}
        >
          <Delete sx={{ fontSize: 16 }} />
        </Box>
      )}
    </Box>
  );

  useEffect(() => {
    fetchRouteData();
  }, [slocation, flocation, checkpoints]);

  return (
    <Box>
      <FormControl>
        <RadioGroup name="costType" row>
          {/* Your existing RadioGroup code */}
        </RadioGroup>
      </FormControl>

      <InfoField
        mainProps={{ name: 'title', label: 'Title', value: title }}
        minLength={5}
      />

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 500, m: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>Itinerary</span>
          <Button
            variant="contained"
            onClick={handleAddDay}
            startIcon={<Add />}
            size="small"
          >
            Add Day
          </Button>
        </Stack>
        {days.map((day, index) => (
          <Box key={index}>
            <TextField
              label={`Day ${day.dayNumber} Activities`}
              value={day.activities}
              onChange={(e) => handleDayChange(index, e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              onClick={() => setMapOpen(true)}
              startIcon={<Navigation />}
              size="small"
            >
              Add Checkpoints
            </Button>
          </Box>
        ))}
      </Stack>

      {mapOpen && (
        <Box
          sx={{
            height: 400,
            position: 'relative',
            '& .mapboxgl-marker': {
              transition: 'transform 0.2s',
            },
          }}
        >
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100%"
            mapboxAccessToken='pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'
            onMove={evt => setViewport(evt.viewport)}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onClick={handleMapClick}
            interactiveLayerIds={['route']}
          >
            {routeGeometry && (
              <Source type="geojson" data={routeGeometry}>
                <Layer {...routeLayer} />
              </Source>
            )}

            <Marker
              latitude={slocation.lat}
              longitude={slocation.lng}
              offsetLeft={-12}
              offsetTop={-24}
            >
              <Tooltip title="Start Location" arrow placement="top">
                <Navigation
                  sx={{
                    color: 'primary.main',
                    transform: 'scale(1.5)',
                    '&:hover': { transform: 'scale(1.8)' }
                  }}
                />
              </Tooltip>
            </Marker>

            {checkpoints.map((checkpoint, index) => (
              <Marker
                key={index}
                latitude={checkpoint.lat}
                longitude={checkpoint.lng}
                offsetLeft={-12}
                offsetTop={-24}
              >
                <CheckpointMarker checkpoint={checkpoint} index={index} />
              </Marker>
            ))}

            <Marker
              latitude={flocation.lat}
              longitude={flocation.lng}
              offsetLeft={-12}
              offsetTop={-24}
            >
              <Tooltip title="End Location" arrow placement="top">
                <Navigation
                  sx={{
                    color: 'secondary.main',
                    transform: 'scale(1.5)',
                    '&:hover': { transform: 'scale(1.8)' }
                  }}
                />
              </Tooltip>
            </Marker>

            {selectedPoint && (
              <Popup
                latitude={selectedPoint.lat}
                longitude={selectedPoint.lng}
                closeOnClick={false}
                onClose={() => setSelectedPoint(null)}
                offset={25}
              >
                <Box sx={{ p: 1, minWidth: 200 }}>
                  <Box sx={{ mb: 1 }}>
                    Checkpoint {selectedPoint.index + 1}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box
                      onClick={() => handleSaveDescription(selectedPoint.index)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    >
                      <Save sx={{ mr: 1 }} />
                      Save
                    </Box>
                  </Box>
                </Box>
              </Popup>
            )}

            <NavigationControl position="bottom-right" />
            <Geocoder />
          </ReactMapGL>
        </Box>
      )}
    </Box>
  );
}

export default AddDetails;