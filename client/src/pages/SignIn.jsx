import  { React,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import { signInStart,signInFailure,signInSuccess } from '../redux/user/userslice';
import OAuth from '../components/OAuth'

function SignIn() {
  const [formData, setFormData] = useState({});
  const {loading,error}=useSelector((state)=>state.user);
  
  const state = useSelector((state) => state.user);
  console.log('Redux State:', state);

  const navigate = useNavigate();
  const dispatch= useDispatch();
  const backendUrl=import.meta.env.VITE_BACKEND_URL
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
     dispatch(signInStart());

    try {
      const res = await fetch(`${backendUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ This allows cookies (JWT) to be sent
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
         dispatch(signInFailure(data.message));
         return;
      }

       dispatch(signInSuccess(data)); // ✅ Correct
       navigate('/');
       console.log('Logged in:', data);
        
    } 
    catch (err) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-5">
      <h1 className="text-3xl text-center font-semibold my-7">Sign in</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
          required
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-85"
          
        >
          {loading ? 'Loading...' : 'Sign in'}
        </button>
        <OAuth/>
        <div className="flex gap-2 mt-5">
          <p>Don't have an account?</p>
          <Link to="/signup" className="text-blue-700">
            Sign up
          </Link>
        </div>
        
      </form>
      {error && <p className="text-red-500 text-sm mt-2 ">{error}</p>}
    </div>
  );
}

export default SignIn;
