'use client';

import { Box, Slider, Typography } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import { MAX_PRICE_FILTER } from '@/context/state';

const marks = [0, 50, 100, 150].map((value) => ({ value, label: `$${value}` }));

const PriceSlider = () => {
  const {
    state: { priceFilter },
    dispatch,
  } = useValue();
  return (
    <Box sx={{ mt: 5 }}>
      <Typography id="price-filter-label">Max Price: {'$' + priceFilter}</Typography>
      <Slider
        aria-labelledby="price-filter-label"
        min={0}
        max={MAX_PRICE_FILTER}
        valueLabelDisplay="auto"
        marks={marks}
        value={priceFilter}
        onChange={(_e, price) => dispatch({ type: 'FILTER_PRICE', payload: price as number })}
      />
    </Box>
  );
};

export default PriceSlider;
