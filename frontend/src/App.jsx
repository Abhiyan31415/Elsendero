import { useState ,useRef,useEffect} from 'react'
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
// import EventsAdd from './components/events/EventsAdd'
// import EventPage from './components/events/EventPage'
import AddTrails from './components/addTrail/AddTrails'
import Protected from './components/protected/Protected'
import TrailsInfo from './components/trailsInfo/TrailsInfo'
import TrailInfo from './components/trailsInfo/TrailInfo'
import EventCard from './components/events/EventCard'
// import Login from './components/user/Login'

function App() {
  const [value, setValue] = useState(0);
  const ref = useRef();
  useEffect(() => {
    
  }, [value]);
  return (
    <Router>
      <Loading />
      <Notification />
      <Login />
      <NavBar />
      <TrailInfo/>
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<ClusterMap />} />
        <Route path="/events" element={<EventCard/>} />
        <Route path='/trail' element={<TrailsInfo/>}/>
        <Route path="/add-trails" element={<Protected><AddTrails setPage={setValue}/></Protected>} />
        <Route path="/chat" element={<ChatComponent />} />
      </Routes>

      <BottomNav />
    </Router>
  )
}

export default App
