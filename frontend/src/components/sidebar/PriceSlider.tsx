'use client';

import { Box, Slider, Typography } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import { formatPrice, niceCeiling } from '@/utils/format';

/** Max-price filter. Its range follows the most expensive trail, so every trail can be reached. */
const PriceSlider = () => {
  const {
    state: { priceFilter, trails },
    dispatch,
  } = useValue();
  const max = niceCeiling(Math.max(0, ...trails.map((t) => Number(t.price) || 0)));
  const step = max / 20;
  const value = priceFilter ?? max;

  return (
    <Box sx={{ mt: 4, px: 1 }}>
      <Typography id="price-filter-label" gutterBottom>
        Max price: <strong>{priceFilter === null ? 'Any' : formatPrice(value)}</strong>
      </Typography>
      <Slider
        aria-labelledby="price-filter-label"
        min={0}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => formatPrice(v)}
        getAriaValueText={(v) => formatPrice(v)}
        marks={[
          { value: 0, label: 'Free' },
          { value: max, label: formatPrice(max) },
        ]}
        value={value}
        onChange={(_e, v) => {
          const price = v as number;
          dispatch({ type: 'FILTER_PRICE', payload: price >= max ? null : price });
        }}
      />
    </Box>
  );
};

export default PriceSlider;
