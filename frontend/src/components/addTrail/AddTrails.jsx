import { Step, StepButton, Stepper } from '@mui/material'
import { Container } from '@mui/material'
import React, { useState } from 'react'

function AddTrails() {
  const [activeStep, setActiveStep] =useState(0)
  const [steps, setSteps] =useState([
    {label:'Start Location',completed:false},
    {label:'Final Location',completed:false},
    {label:'Details',completed:false},
    {label:'Checkpoints',completed:false},
    {label:'Images',completed:false},
    
  ])
  return (
    <Container
    sx={{my:4}}
    >
      <Stepper 
      alternativeLabel
      nonLinear
      activeStep={activeStep}
      sx={{mb:3}}
      >
        {steps.map((step,index)=>(
          <Step key={step.label} completed={step.completed}>
            <StepButton onClick={()=>setActiveStep(index)}>
              {step.label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

    </Container>
  )
}

export default AddTrails