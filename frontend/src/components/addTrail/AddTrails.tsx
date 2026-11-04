'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, Stack, Step, StepButton, Stepper } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';
import { createTrail } from '@/actions/trail';
import { recordId, type LngLat, type NewTrail } from '@/types';
import LocationPicker from './LocationPicker';
import AddDetails from './AddDetails';
import AddCheckpoints from './AddCheckpoints';
import AddImages from './AddImages';

const STEP_LABELS = ['Start Location', 'Final Location', 'Details', 'Checkpoints', 'Images'] as const;

function AddTrails() {
  const {
    state: { images, details, slocation, flocation, checkpoints, currentUser },
    dispatch,
  } = useValue();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Completion is derived from the wizard state.
  const completed = [
    Boolean(slocation.lng && slocation.lat),
    Boolean(flocation.lng && flocation.lat),
    details.title.trim().length > 4 && details.description.trim().length > 9,
    checkpoints.length > 0,
    images.length > 0,
  ];
  const firstUnfinished = completed.findIndex((c) => !c);
  const allDone = firstUnfinished === -1;
  const isLast = activeStep === STEP_LABELS.length - 1;

  const setStart = useCallback((loc: LngLat) => dispatch({ type: 'UPDATE_SLOCATION', payload: loc }), [dispatch]);
  const setFinal = useCallback((loc: LngLat) => dispatch({ type: 'UPDATE_FLOCATION', payload: loc }), [dispatch]);

  const handleNext = () => {
    if (!isLast) setActiveStep((prev) => prev + 1);
    else if (!allDone) setActiveStep(firstUnfinished);
  };

  const handleSubmit = async () => {
    if (!currentUser || !allDone) return;
    const trail: NewTrail = {
      sloc: [slocation.lng, slocation.lat],
      floc: [flocation.lng, flocation.lat],
      checkp: checkpoints.map(({ lng, lat, description }) => [lng, lat, description]),
      price: Number(details.price) || 0,
      title: details.title.trim(),
      description: details.description.trim(),
      images,
    };
    const created = await createTrail(trail, currentUser, dispatch);
    if (created) {
      setActiveStep(0);
      const id = recordId(created);
      router.push(id ? `/trails/${id}` : '/trails');
    }
  };

  return (
    <Container sx={{ my: 4, pb: 8 }}>
      <Stepper alternativeLabel nonLinear activeStep={activeStep} sx={{ mb: 3 }}>
        {STEP_LABELS.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton onClick={() => setActiveStep(index)}>{label}</StepButton>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ pb: 7 }}>
        {activeStep === 0 && <LocationPicker label="Start location" value={slocation} onChange={setStart} />}
        {activeStep === 1 && <LocationPicker label="Final location" value={flocation} onChange={setFinal} />}
        {activeStep === 2 && <AddDetails />}
        {activeStep === 3 && <AddCheckpoints />}
        {activeStep === 4 && <AddImages />}

        <Stack direction="row" sx={{ pt: 2, justifyContent: 'space-around' }}>
          <Button color="inherit" disabled={!activeStep} onClick={() => setActiveStep((prev) => prev - 1)}>
            Back
          </Button>
          <Button color="inherit" disabled={isLast && allDone} onClick={handleNext}>
            Next
          </Button>
        </Stack>
        {allDone && (
          <Stack sx={{ alignItems: 'center' }}>
            <Button variant="contained" endIcon={<Send />} onClick={handleSubmit}>
              Submit
            </Button>
          </Stack>
        )}
      </Box>
    </Container>
  );
}

export default AddTrails;
