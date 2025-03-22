import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Assistant from './pages/Assistant'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Interview />}/>
        <Route path="/assistant" element={<Assistant />}/>
      </Routes>
    </Router>
  )
}

export default App
