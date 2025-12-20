import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';

function SignUp() {
  const [FormData, setFormData] = useState({});
  const [Loading,setLoading]=useState(false)
  const[error,setError]=useState(null)
  const navigate=useNavigate()
  const backendUrl=import.meta.env.VITE_BACKEND_URL
  const handlechange = (e) => {
    
    setFormData({ ...FormData, [e.target.id]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    const res = await fetch(`${backendUrl}/api/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(FormData),
    });

    const data = await res.json();
    if(data.success==false){
      setError(data.message);
      setLoading(false);
      return;
    }
    setLoading(false)
    setError(null)
    console.log(data);
    navigate('/signin')
    

    

  };


  console.log(FormData);

  return (
    <div className='max-w-lg mx-auto p-5'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input type="text" placeholder='Username' className='border p-3 rounded-lg' id='username' onChange={handlechange} />
        <input type="email" placeholder='Email' className='border p-3 rounded-lg' id='email' onChange={handlechange} />
        <input type="password" placeholder='Password' className='border p-3 rounded-lg' id='password' onChange={handlechange} />
        <button className='bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-85'>{Loading?'Loading..':'Sign Up'}</button>
        <div className='flex gap-2 mt-5'>
          <p>Already have an account?</p>
          <Link to="/signin">
            <span className="text-blue-700 hover:underline">Sign in</span>
          </Link>
        </div>
      </form>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </div>
  );
}

export default SignUp;
