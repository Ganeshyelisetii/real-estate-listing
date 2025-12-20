import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PriviteRoute from './components/PriviteRoute';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Listing from './pages/Listing';
import Search from './pages/Search'

function App() {
  return (
    <BrowserRouter>
      <Header />
      {/* Toast container should be placed at the top level */}
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path='/listing/:id' element={<Listing />} />
        <Route path='/search' element={<Search/>}/>
        <Route element={<PriviteRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/createListing' element={<CreateListing />} />
          <Route path='/update-listing/:id' element={<EditListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
