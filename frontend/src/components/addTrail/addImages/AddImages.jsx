import { Paper } from '@mui/material'
import React, { useCallback, useState } from 'react'
import {useDropzone} from 'react-dropzone'

function AddImages() {
  const [files,setFiles]=useState([])
  const onDrop =useCallback((acceptedFiles)=>{
    setFiles(
      
    )

  })
  return (
    
   <Paper
   sx={{
    cursor:'pointer',
    background:'#fafafa',
    color:'#333',
    border:'1px dashed #ccc',
    '&:hover':{border:'1px solid #ccc'}
   }}
   >
    <div
    style={{padding:'16px'}}
    >
      <input/>

    </div>

   </Paper>
  )
}

export default AddImages