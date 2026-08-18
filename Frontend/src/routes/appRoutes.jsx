import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import UserLogin from '../pages/UserLogin'
import UserRegister from '../pages/UserRegister'
import PartnerLogin from '../pages/PartnerLogin'
import PartnerRegister from '../pages/PartnerRegister'
import UserFeed from '../pages/user/UserFeed'
import PartnerDashboard from '../pages/partner/PartnerDashboard'
import StorePage from '../pages/user/StorePage'
import LikedReelsPage from '../pages/user/LikedReelsPage'
import SavedReelsPage from '../pages/user/SavedReelsPage'

const appRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/partner/login" element={<PartnerLogin />} />
                <Route path="/partner/register" element={<PartnerRegister />} />
                <Route path="/feed" element={<UserFeed />} />
                <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                <Route path="/store/:partnerId" element={<StorePage />} />
                <Route path="/user/liked" element={<LikedReelsPage />} />
                <Route path="/user/saved" element={<SavedReelsPage />} />
            </Routes>
        </Router>
    )
}

export default appRoutes