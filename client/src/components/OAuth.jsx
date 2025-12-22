import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userslice'; // make sure this is correct
import {useNavigate} from 'react-router-dom';


function OAuth() {
  const dispatch = useDispatch(); // ✅ Use at top level
  const navigate=useNavigate()
  
  const backendUrl=import.meta.env.VITE_BACKEND_URL
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      // Send user data to backend
      const res = await fetch(`${backendUrl}/api/user/google1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      const data = await res.json();

      dispatch(signInSuccess(data));
      navigate('/') // ✅ Correct usage
      console.log('User signed in:', data);
    } catch (error) {
      console.log('Could not sign in with Google:', error);
    }
  };

  return (
    <button
      className='bg-red-700 text-white p-3 rounded-lg uppercase'
      onClick={handleGoogleClick}
    >
      Continue with Google
    </button>
  );
}

export default OAuth;
