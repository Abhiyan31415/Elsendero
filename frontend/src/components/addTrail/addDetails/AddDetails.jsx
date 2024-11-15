import { FormControl, FormControlLabel, InputAdornment, Radio, RadioGroup, Stack, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useValue } from '../../../context/ContextProvider'
import { Info } from '@mui/icons-material'
import InfoField from './InfoField'
import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'

function AddDetails() {
  const {
    state: { details: { title, description, price } },
    dispatch
  } = useValue()

  const [costType, setCostType] = useState(price ? 1 : 0)
  const [days, setDays] = useState([])

  const handleTrailTypeChange = (e) => {
    const costType = Number(e.target.value)
    setCostType(costType)
    if (costType === 0) {
      dispatch({ type: 'UPDATE_DETAILS', payload: { price: 0 } })
    } else {
      dispatch({ type: 'UPDATE_DETAILS', payload: { price: 15 } })
    }
  }

  const handlePriceChange = (e) => {
    dispatch({ type: "UPDATE_DETAILS", payload: { price: e.target.value } })
  }

  const handleAddDay = () => {
    setDays([...days, { dayNumber: days.length + 1, activities: '' }])
  }

  const handleDayChange = (index, value) => {
    const updatedDays = [...days]
    updatedDays[index].activities = value
    
    // Update the description by combining all days
    const newDescription = updatedDays
      .map(day => `Day ${day.dayNumber}:\n${day.activities}`)
      .join('\n\n')
    
    dispatch({ type: 'UPDATE_DETAILS', payload: { description: newDescription } })
  }

  return (
    <Stack
      sx={{
        alignItems: 'center',
        "& .MuiTextField-root": { width: '100%', maxWidth: 500, m: 1 },
      }}
    >
      <FormControl>
        <RadioGroup
          name="costType"
          value={costType}
          row
          onChange={handleTrailTypeChange}
        >
          <FormControlLabel value={0} control={<Radio />} label='Free Hike' />
          <FormControlLabel value={1} control={<Radio />} label='Nominal Fee' />
          {Boolean(costType) &&
            <TextField
              sx={{ width: '7ch !important' }}
              variant='standard'
              InputProps={{
                startAdornment: (<InputAdornment position='start'> $ </InputAdornment>)
              }}
              inputProps={{ type: 'number', min: 1, max: 100 }}
              value={price}
              onChange={handlePriceChange}
              name='price'
            />}
        </RadioGroup>
      </FormControl>

      <InfoField
        mainProps={{ name: 'title', label: 'Title', value: title }}
        minLength={5}
      />

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 500, m: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>Itinerary</span>
          <FormControl>
            <Button
              variant="contained"
              onClick={handleAddDay}
              startIcon={<Add />}
              size="small"
            >
              Add Day
            </Button>
          </FormControl>
        </Stack>

        {days.map((day, index) => (
          <TextField
            key={index}
            multiline
            rows={3}
            label={`Day ${day.dayNumber}`}
            value={day.activities}
            onChange={(e) => handleDayChange(index, e.target.value)}
            variant="outlined"
          />
        ))}

        <InfoField
          mainProps={{ name: 'description', label: 'Complete Itinerary', value: description }}
          minLength={10}
          optionalProps={{ multiline: true, rows: 4, disabled: true }}
        >
          
        </InfoField>
      </Stack>
    </Stack>
  )
}

export default AddDetails