import { Box, Button, Stack, Step, StepButton, Stepper } from '@mui/material'
import { Container } from '@mui/material'
import React, { useState } from 'react'
import AddStartLocation from './addLocation/AddStartLocation'
import AddFinalLocation from './addLocation/AddFinalLocation'
import AddDetails from './addDetails/AddDetails'
import AddCheckpoints from './addCheckpoints/AddCheckpoints'
import AddImages from './addImages/AddImages'

function AddTrails() {
  const [activeStep, setActiveStep] =useState(0)
  const [steps, setSteps] =useState([
    {label:'Start Location',completed:false},
    {label:'Final Location',completed:false},
    {label:'Details',completed:false},
    {label:'Checkpoints',completed:false},
    {label:'Images',completed:false},
    
  ])
  const handleNext=()=>{
    if(activeStep<steps.length-1){
      setActiveStep((prev)=>prev+1)
    }else{
      const stepIndex=findUnfinished()
      setActiveStep(stepIndex)
    }
  }
  const checkDisbaled=()=>{
    if(activeStep<steps.length-1){
      return false
    }
    const index=steps.findIndex((step)=>!step.completed)
    if(index!==-1){
      return false
    }
    return true
  }
  const findUnfinished=()=>{
    return steps.findIndex((step)=>!step.completed)
  }

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
      <Box>
        {{
          0:<AddStartLocation/>,
          1:<AddFinalLocation/>,
          2:<AddDetails/>,
          3:<AddCheckpoints/>,
          4:<AddImages/>,
        }[activeStep]}
      </Box>
      <Stack
      direction='row'
      sx={{pt:2,pb:7,justifyContent:'space-around'}}
      >
        <Button
        color='inherit'
        disabled={!activeStep}
        onClick={()=>setActiveStep((prev)=>prev-1)}
        >
          Back
        </Button>
        <Button
        color='inherit'
        disabled={checkDisbaled()}
        onClick={handleNext}
        >
          Next
        </Button>
      </Stack>

    </Container>
  )
}

export default AddTrails