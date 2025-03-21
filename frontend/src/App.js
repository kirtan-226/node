import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import UserQuestionnaire from './components/UserQuestionnaire';
import HomePage from './components/home';
import PlateCustomization from './components/PlateCustomization';
import './App.css';

const App = () => {
    const [dishes, setDishes] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const response = await fetch("https://15.207.254.20:5000/api/dish");
                const data = await response.json();
                setDishes(data);
            } catch (error) {
                console.error("Error fetching dishes:", error);
            }
        };

        fetchDishes();
    }, []);

    return (
        <Router>
            <Routes>
                <Route 
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
                
                <Route
                    path="/login"
                    element={
                        <Login
                            onLoginSuccess={() => setIsAuthenticated(true)}
                        />
                    }
                />
                
                <Route
                    path="/questionnaire"
                    element={
                        isAuthenticated ? (
                            <UserQuestionnaire />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="/plate"
                    element={
                        isAuthenticated ? (
                            <PlateCustomization dishes={dishes} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="/home"
                    element={
                        isAuthenticated ? (
                            <HomePage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;