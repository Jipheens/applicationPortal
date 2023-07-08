import React from 'react';
import './App.css';
import LoginPage from "./components/Login";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPage from './components/register';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Fetchdata from './components/ListOfRfq'; 
import ApplicationForm from './components/ApplicationForm';
// import Admindashboard from './Admindashboard';
function App() {

  return (
  
<div className='App'>
     <Router>
    <Routes>
    {/* <Route path="/" element={<LoginPage />} />  
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/register" element={<RegisterPage  />} />
    
     <Route path='/' element={<Fetchdata />} />*/}
     <Route path='/' element={<ApplicationForm />} />


       </Routes>
    </Router>  
    </div>





    );
}

export default App;
