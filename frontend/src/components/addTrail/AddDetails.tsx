'use client';

import { useState, type ChangeEvent } from 'react';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';
import InfoField from './InfoField';

interface Day {
  dayNumber: number;
  activities: string;
}

function AddDetails() {
  const {
    state: {
      details: { title, description, price },
    },
    dispatch,
  } = useValue();

  const [costType, setCostType] = useState(price ? 1 : 0);
  const [days, setDays] = useState<Day[]>([]);

  const handleCostTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setCostType(next);
    dispatch({ type: 'UPDATE_DETAILS', payload: { price: next === 0 ? 0 : 500 } });
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = Math.max(0, Math.min(100000, Number(e.target.value) || 0));
    dispatch({ type: 'UPDATE_DETAILS', payload: { price: value } });
  };

  const handleDayChange = (index: number, value: string) => {
    const updated = days.map((d, i) => (i === index ? { ...d, activities: value } : d));
    setDays(updated);
    // The description is the whole itinerary, combined from all days.
    const newDescription = updated.map((d) => `Day ${d.dayNumber}:\n${d.activities}`).join('\n\n');
    dispatch({ type: 'UPDATE_DETAILS', payload: { description: newDescription } });
  };

  return (
    <Stack sx={{ alignItems: 'center', '& .MuiTextField-root': { width: '100%', maxWidth: 500, m: 1 } }}>
      <FormControl>
        <RadioGroup name="costType" value={costType} row onChange={handleCostTypeChange}>
          <FormControlLabel value={0} control={<Radio />} label="Free Hike" />
          <FormControlLabel value={1} control={<Radio />} label="Nominal Fee" />
          {Boolean(costType) && (
            <TextField
              sx={{ width: '14ch !important' }}
              variant="standard"
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">Rs</InputAdornment> },
                htmlInput: { type: 'number', min: 1, max: 100000, 'aria-label': 'Price' },
              }}
              value={price}
              onChange={handlePriceChange}
              name="price"
            />
          )}
        </RadioGroup>
      </FormControl>

      <InfoField name="title" label="Title" value={title} minLength={5} />

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 500, m: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>Itinerary</Typography>
          <Button
            variant="contained"
            onClick={() => setDays([...days, { dayNumber: days.length + 1, activities: '' }])}
            startIcon={<Add />}
            size="small"
          >
            Add Day
          </Button>
        </Stack>

        {days.map((day, index) => (
          <TextField
            key={day.dayNumber}
            multiline
            rows={3}
            label={`Day ${day.dayNumber}`}
            value={day.activities}
            onChange={(e) => handleDayChange(index, e.target.value)}
            variant="outlined"
          />
        ))}

        <InfoField
          name="description"
          label={days.length ? 'Complete Itinerary' : 'Description'}
          value={description}
          minLength={10}
          optionalProps={{ multiline: true, rows: 4, disabled: days.length > 0 }}
        />
      </Stack>
    </Stack>
  );
}

export default AddDetails;
