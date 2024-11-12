import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavBar from './components/NavBar'
import Login from './components/user/Login'
import Notification from './components/notifications/Notification'
import Loading from './components/Loading'
import ChatComponent from './components/ChatComponent'
import BottomNav from './components/BottomNav'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Loading />
      <Notification />
      <Login />
      <NavBar />
      {/* <ChatComponent /> */}
      <BottomNav />

    </>
  )
}

export default App
