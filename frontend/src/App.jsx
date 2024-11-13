import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavBar from './components/NavBar'
import Login from './components/user/Login'
import Notification from './components/notifications/Notification'
import Loading from './components/Loading'
import ChatComponent from './components/ChatComponent'
import BottomNav from './components/BottomNav'
import ClusterMap from './components/map/ClusterMap'
import EventsAdd from './components/events/EventsAdd'
import AddTrails from './components/addTrail/AddTrails'
import Protected from './components/protected/Protected'

function App() {
  return (
    <Router>
      <Loading />
      <Notification />
      <Login />
      <NavBar />
      
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<ClusterMap />} />
        <Route path="/events" element={<EventsAdd />} />
        <Route path="/add-trails" element={<Protected><AddTrails /></Protected>} />
        <Route path="/chat" element={<ChatComponent />} />
      </Routes>

      <BottomNav />
    </Router>
  )
}

export default App
