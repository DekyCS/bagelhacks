import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Assistant from './pages/Assistant'
import Start from './pages/Start'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/start" element={<Start />}/>
        <Route path="/interview" element={<Interview />}/>
        <Route path="/assistant" element={<Assistant />}/>
      </Routes>
    </Router>
  )
}

export default App
