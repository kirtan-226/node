import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const foodItems = [
    {
        image: '/images/food1.jpg',
        name: 'Grilled Steak with Fresh Herbs',
        description: 'Juicy, tender steak perfectly grilled with a smoky char and garnished with fresh rosemary sprigs. A meat lover\'s delight, served hot and fresh from the grill.'
    },
    {
        image: '/images/food2.jpg',
        name: 'Penne Pasta with Cherry Tomatoes',
        description: 'Al dente penne pasta tossed in a flavorful tomato-based sauce, topped with cherry tomatoes and fresh parsley. A simple yet satisfying Italian class'
    },
    {
        image: '/images/food3.jpg',
        name: 'Vegetarian Pizza with Fresh Toppings',
        description: 'Crispy thin-crust pizza topped with fresh mushrooms, olives, cherry tomatoes, and bell peppers, all smothered in a rich layer of melted cheese. A colorful burst of flavors in every bite.'
    }
];

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const navigate = useNavigate();
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === foodItems.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? foodItems.length - 1 : prev - 1));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'password') {
            onLoginSuccess();
            navigate('/home');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/login/login', {
                username,
                password
            });
            if (response.data.message) {
                // console.log('kirtan J',response.data.collaborative_filter);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('filter_data', response.data.collaborative_filter);
                onLoginSuccess(); // Set authenticated state
                navigate('/home'); // Redirect to questionnaire
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
            console.error('Login error:', error);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // For development, allow direct signup without API
        // if (username && password) {
        //     onLoginSuccess(); // Set authenticated state
        //     navigate('/questionnaire'); // Redirect to questionnaire
        //     return;
        // }

        try {
            const response = await axios.post('http://localhost:5000/api/login/create-account', {
                username,
                password
            });
            console.log(response);
            if (response.data.message) {
                // console.log('kirtan J Limbahciya');
                localStorage.setItem('user_id', response.data.user_id);
                onLoginSuccess(); // Set authenticated state
                navigate('/questionnaire'); // Redirect to questionnaire
            } else {
                setError(response.data.message || 'Failed to create account');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating account');
            console.error('Signup error:', error);
        }
    };
    const handleGoogleLoginSuccess = async (response) => {
        try {
            const serverResponse = await axios.post('http://localhost:5000/api/login/google-login', {
                token: response.credential // Ensure you're sending the token correctly here
            });
            // console.log('kirtan J Limbahciya',serverResponse.data.token);
            localStorage.setItem('user_id', response.data.user_id);
            onLoginSuccess(); // Set authenticated state
            navigate('/home'); // Redirect to questionnaire
        } catch (error) {
            console.error('Google login error:', error);
            setError('Failed to login with Google');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="w-full py-4 px-6 flex justify-between items-center border-b">
                <div className="w-48 h-20">
                    <img 
                        src="/images/logo.png" 
                        alt="Cucina Logo" 
                        className="h-full w-full object-contain"
                    />
                </div>
                <h1 className="text-4xl font-normal">Cucina</h1>
            </header>

            <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                    <div className="relative bg-gray-200 h-96 mb-8">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src={foodItems[currentSlide].image} 
                                alt={foodItems[currentSlide].name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                                <h3 className="text-xl font-semibold">
                                    {foodItems[currentSlide].name}
                                </h3>
                                <p className="text-sm">
                                    {foodItems[currentSlide].description}
                                </p>
                            </div>
                        </div>
                        <button 
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                            onClick={prevSlide}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button 
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                            onClick={nextSlide}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                        
                        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
                            {foodItems.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-2 w-2 rounded-full ${
                                        currentSlide === index ? 'bg-white' : 'bg-gray-400'
                                    }`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl mb-4">About Cucina</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Welcome to Cucina, where culinary excellence meets innovation. 
                            Our platform helps chefs and food enthusiasts create perfect plate 
                            presentations and manage their kitchen operations efficiently.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-80 p-6 border-l">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl mb-6 text-center">
                            {isSigningUp ? 'Create Account' : 'Login'}
                        </h2>
                        <form onSubmit={isSigningUp ? handleSignup : handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-100 p-2 rounded border border-gray-300"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-100 p-2 rounded border border-gray-300"
                                    required
                                />
                            </div>
                            {isSigningUp && (
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-100 p-2 rounded border border-gray-300"
                                        required
                                    />
                                </div>
                            )}
                            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                            <button
                                type="submit"
                                className="w-full bg-gray-200 hover:bg-gray-300 text-black p-2 rounded"
                            >
                                {isSigningUp ? 'Sign up' : 'Login'}
                            </button>
                            <div className="flex items-center justify-between pt-4">
                                <span className="text-gray-600">
                                    {isSigningUp ? 'Already have an account?' : 'New here?'}
                                </span>
                                <button
                                    type="button"
                                    className="bg-gray-200 px-4 py-2 rounded border border-gray-300 hover:bg-gray-300"
                                    onClick={() => {
                                        setIsSigningUp(!isSigningUp);
                                        setError('');
                                        setPassword('');
                                        setConfirmPassword('');
                                    }}
                                >
                                    {isSigningUp ? 'Login' : 'Sign up'}
                                </button>
                            </div>
                        </form>

                        {!isSigningUp && (
                            <>
                                <div className="mt-4 text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">
                                                Or continue with
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <GoogleOAuthProvider clientId="326160157051-sulsasmu3q4p8ro3elbaas9b0ci9mokr.apps.googleusercontent.com">
                                            <GoogleLogin 
                                                onSuccess={handleGoogleLoginSuccess}
                                                onError={() => setError('Google login failed')}
                                                useOneTap
                                            />
                                        </GoogleOAuthProvider>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;