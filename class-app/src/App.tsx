import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ClassroomPage from './pages/ClassroomPage'
import BuyinDashboard from './pages/BuyinDashboard'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClassroomPage />} />
        <Route path="/classroom" element={<ClassroomPage />} />
        <Route path="/buyin-dashboard" element={<BuyinDashboard />} />
        <Route path="/buyin-dashboard/:tab" element={<BuyinDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
