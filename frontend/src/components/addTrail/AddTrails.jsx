import { Box, Button, Stack, Step, StepButton, Stepper } from '@mui/material'
import { Container } from '@mui/material'
import React, { useState ,useEffect} from 'react'
import AddStartLocation from './addLocation/AddStartLocation'
import AddFinalLocation from './addLocation/AddFinalLocation'
import AddDetails from './addDetails/AddDetails'
import AddCheckpoints from './addCheckpoints/AddCheckpoints'
import AddImages from './addImages/AddImages'
import { useValue } from '../../context/ContextProvider'
import { Send } from '@mui/icons-material'
import { createTrail } from '../../actions/trail'

function AddTrails({setPage}) {
  const {state:{images,details,slocation,flocation,checkpoints,currentUser},dispatch}=useValue()
  const [activeStep, setActiveStep] =useState(0)
  const [steps, setSteps] =useState([
    {label:'Start Location',completed:false},
    {label:'Final Location',completed:false},
    {label:'Details',completed:false},
    {label:'Checkpoints',completed:false},
    {label:'Images',completed:false},
    
  ])
  const [showSubmit,setShowSubmit]=useState(false)


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

  useEffect(() => {
    
    if (images.length>0) {
      if (!steps[4].completed) setComplete(4, true);
    } else {
      if (steps[4].completed) setComplete(4, false);
    }
  }, [images.length]);
  useEffect(() => {
    if (details.title.length > 4 && details.description.length > 9) {
      if (!steps[2].completed) setComplete(2, true);
    } else {
      if (steps[2].completed) setComplete(2, false);
    }
  }, [details]);
  useEffect(() => {
    
    if (slocation.lng && slocation.lat) {
      if (!steps[0].completed) setComplete(0, true);
    } else {
      if (steps[0].completed) setComplete(0, false);
    }
  }, [slocation]);
  useEffect(() => {
    console.log(flocation);
    if (flocation.lng && flocation.lat) {
      if (!steps[1].completed) setComplete(1, true);
    } else {
      if (steps[1].completed) setComplete(1, false);
    }
  }, [flocation]);
  useEffect(() => {
    if (checkpoints.length > 0) {
      if (!steps[3].completed) setComplete(3, true);
    } else {
      if (steps[3].completed) setComplete(3, false);
    }
  }, [checkpoints]);



  const setComplete = (index, status) => {
    setSteps((steps) => {
      steps[index].completed = status;
      return [...steps];
    });
  };

    useEffect(()=>{
      if(findUnfinished()===-1){
        if(!showSubmit) {setShowSubmit(true)}
        }
      else{
        if(showSubmit) {setShowSubmit(false)}
      }
    },[steps])

  const handleSubmit=()=>{
    const trail={
      currentUser,
      sloc:[slocation.lng,slocation.lat],
      floc:[flocation.lng,flocation.lat],
      checkp:checkpoints.map(({lng,lat,description})=>[lng,lat,description]),
      price:details.price,
      title:details.title,
      description:details.description,
      images:images.map((image)=>image)
    }
    createTrail(trail,currentUser,dispatch,setPage)


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
      <Box sx={{pb:7}}>
        {{
          0:<AddStartLocation/>,
          1:<AddFinalLocation/>,
          2:<AddDetails/>,
          3:<AddCheckpoints/>,
          4:<AddImages/>,
        }[activeStep]}
      
      <Stack
      direction='row'
      sx={{pt:2,justifyContent:'space-around'}}
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
        {showSubmit&&(
          <Stack
          sx={{alignItems:'center'
          }}
          >
            <Button
            variant ='contained'
            endIcon={<Send/>}
            onClick={handleSubmit}
            >
              Submit
            </Button>
          </Stack>
        )}
        </Box>
    </Container>
  )
}

export default AddTrails