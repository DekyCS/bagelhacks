import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Start from './pages/Start'
import InterviewReport from './pages/Report'
import { useGLTF} from '@react-three/drei'

function App() {

  useGLTF.preload("/models/Interview_girl.glb");
  console.log("done preloading")

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/start" element={<Start />}/>
        <Route path="/interview" element={<Interview />}/>
        <Route path="/report" element={<InterviewReport />}/>
      </Routes>
    </Router>
  )
}

export default App