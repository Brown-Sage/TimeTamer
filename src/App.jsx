import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Login from './components/Login'
import SignIn from './components/Signin'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SignIn />
    </>
  )
}

export default App
