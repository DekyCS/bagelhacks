import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Start from './pages/Start'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/start" element={<Start />}/>
        <Route path="/interview" element={<Interview />}/>
      </Routes>
    </Router>
  )
}

export default App
