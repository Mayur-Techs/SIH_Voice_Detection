import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/ui/NavBar'
import Landing from './pages/Landing'
import Input from './pages/Input'
import Analysis from './pages/Analysis'
import Report from './pages/Report'
import History from './pages/History'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-canvas text-text-primary font-ui antialiased">
        <NavBar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/input" element={<Input />} />
          <Route path="/analysis/:sessionId" element={<Analysis />} />
          <Route path="/report/:sessionId" element={<Report />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
