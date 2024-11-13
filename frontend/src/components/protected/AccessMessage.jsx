import { Alert, AlertTitle, Button, Container } from '@mui/material'
import React from 'react'
import { useValue } from '../../context/ContextProvider'
import { Lock } from '@mui/icons-material'

const AccessMessage = () => {
    const {dispatch}=useValue()
  return (
    <Container
    sx={{py:5}}
    >
        <Alert
        severity='error'
        variant='outlined'
        >
            <AlertTitle>Forbidden Access</AlertTitle>
        Please Login or register to access this page
        <Button
        variant='outlined'
        sx={{ml:2}}
        startIcon={<Lock/>}
        onClick={()=>dispatch({type:'OPEN_LOGIN'})}
        >
            Login
        </Button>
        </Alert>
    </Container>
  )
}

export default AccessMessage