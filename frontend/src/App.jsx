import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Login from './components/user/Login'
import Notification from './components/notifications/Notification'
import Loading from './components/Loading'
import ChatComponent from './components/ChatComponent'
import BottomNav from './components/BottomNav'
import ClusterMap from './components/map/ClusterMap'
import AddTrails from './components/addTrail/AddTrails'
import Protected from './components/protected/Protected'
import TrailsInfo from './components/trailsInfo/TrailsInfo'
import TrailInfo from './components/trailsInfo/TrailInfo'
import EventCard from './components/events/EventCard'
import useCheckToken from './components/hooks/useCheckToken'

function App() {
  // AddTrails resets its step via setPage after a successful submit.
  const [, setPage] = useState(0)
  useCheckToken()

  return (
    <Router>
      <Loading />
      <Notification />
      <Login />
      <NavBar />
      <TrailInfo />
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<ClusterMap />} />
        <Route path="/events" element={<EventCard />} />
        <Route path="/trail" element={<TrailsInfo />} />
        <Route path="/add-trails" element={<Protected><AddTrails setPage={setPage} /></Protected>} />
        <Route path="/chat" element={<Protected><ChatComponent /></Protected>} />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
      <BottomNav />
    </Router>
  )
}

export default App
