import { Box, ImageListItem, ImageListItemBar } from '@mui/material'
import React from 'react'
import { Card } from '@mui/material'
import {Swiper,SwiperSlide} from 'swiper/react'
import { Pagination,Autoplay,Virtual } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/virtual'
import { useValue } from '../../context/ContextProvider'

const PopupTrail = ({popupInfo}) => {
    const {title,description,price,images,sloca,floc,checkpoints}=popupInfo
    console.log(popupInfo)
    const {dispatch}=useValue()
    return (
    <Card
    sx={{
        maxWidth:400,
        minWidth:400,
    }}
    >
        <ImageListItem sx={{display:'block'}}>
            <ImageListItemBar
            sx={{
                background:
                'linear-gradient(to bottom, rgba(0,0,0,0.7)0%, rgba(0,0,0,0.3)70%, rgba(0,0,0,0)100%)',
                zIndex:2,

            }}
            title={price===0?'Free Stay':'$'+price}
            position='top'
            
            />
            <ImageListItemBar
            title={title}
            subtitle={description.substr(0,30)+'...'}
            sx={{zIndex:2}}

            
            
            
            />
            <Swiper
            modules={[Pagination,Autoplay,Virtual]}
            autoplay={{delay:2000}}
            virtual
            pagination={{clickable:true}}
            style={{
                '--swiper-pagination-color': 'rgba(255,255,255,0.8)',

                '--swiper-pagination-bullet-inactive-color': '#fff',
                '--swiper-pagination-bullet-inactive-opacity': '0.5',

                zIndex:1}}

            >
                {images[0].map((url,index)=>(
                    <SwiperSlide key={url}>
                        <Box
                        component='img'
                        src={url}
                        alt='trail'
                        sx={{
                            height:255,
                            dusplay:'block',
                            width:'100%',
                            overflow:'hidden',
                            cursor:'pointer',
                            objectFit:'cover'
                        }}
                        onClick={()=>dispatch({type:'UPDATE_TRAIL',payload:popupInfo})}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </ImageListItem>
    </Card>
  )
}

export default PopupTrail