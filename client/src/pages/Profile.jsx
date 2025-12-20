// src/pages/Profile.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { storage, ID, Permission, Role } from '../appwrite';
import { updateUserFailure,updateUserStart,updateUserSuccess,deleteUserFailure,deleteUserStart,deleteUserSuccess,signOutUserFailure,signOutUserStart,signOutUserSuccess } from '../redux/user/userslice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CreateListing from './CreateListing';
import { useNavigate } from 'react-router-dom';


export default function Profile() {
  const { currentUser,loading,error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const dispatch=useDispatch()
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userListings,setUserListings]=useState([])


  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [showListingLoading,setshowListingLoading]=useState(false)
   const [showListingError,setshowListingError]=useState(false)
  const backendUrl=import.meta.env.VITE_BACKEND_URL
   const navigate=useNavigate()
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: currentUser?.password||"",
    avatar: currentUser?.avatar || '',
  });
  console.log(formData)

  useEffect(() => {
    if (file) handleAppwriteUpload(file);
  }, [file]);

  const handleAppwriteUpload = async (file) => {
    try {
      setFilePerc(0);
      setFileUploadError(false);

      const uploadedFile = await storage.createFile(
        '684441d20019600fa554', // Your bucket ID
        ID.unique(),
        file,
        [Permission.read(Role.any())],
        [Permission.write(Role.any())]
      );

      console.log('uploadedFile:', uploadedFile);

      const fileURL = `https://fra.cloud.appwrite.io/v1/storage/buckets/684441d20019600fa554/files/${uploadedFile.$id}/view?project=68444194002bfb6f87a6`;
      console.log('Image URL:', fileURL);


      console.log('Image URL:', fileURL);

      setFormData((prev) => ({
        ...prev,
        avatar: fileURL,
      }));

      setFilePerc(100);
    } catch (err) {
      console.error('Upload error:', err);
      setFileUploadError(true);
      setFilePerc(0);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    dispatch(updateUserStart())
    
    const res = await fetch(`${backendUrl}/api/auth/update/${currentUser._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
  dispatch(updateUserFailure(data.message));
  throw new Error(data.message || 'Failed to update');
}
    dispatch(updateUserSuccess(data));

    setUpdateSuccess(true)

    console.log('Updated user:', data);
    alert('Profile updated successfully!');
  } catch (err) {
    dispatch(updateUserFailure(err.message))
    console.error(err);
    alert('Error updating profile');
    
  }
};
 const handleDelete=async ()=>{
  try{
    dispatch(deleteUserStart());
    const res=await fetch(`${backendUrl}/api/auth/delete/${currentUser._id}`,{method:'DELETE',credentials: 'include',

     
  });
  const data=await res.json();
  if(data.success===false){
    dispatch(deleteUserFailure(data.message))
    return ;
  }
  dispatch(deleteUserSuccess(data))
}
  catch(error){
    dispatch(deleteUserFailure(error.message))
  }
 };
 const handleSignOut=async ()=>{
  try{
    dispatch(signOutUserStart())
    const res=await fetch(`${backendUrl}/api/user/signOut`)
    const data=await res.json()
      if(data.sucees==false){
        dispatch(signOutUserFailure(data.message))
        return 
      }
      dispatch(signOutUserSuccess(data))
    }
  
  catch(error){
     dispatch(signOutUserFailure(error.message))
  }
 }
 const handleShowListing=async()=>{
  try{
    setshowListingError(false)
     const res=await fetch(`${backendUrl}/api/auth/listings/${currentUser._id}`);
     const data=await res.json();
     if(data.success==false){
      setshowListingError(true)
       return ; 
     }
     setUserListings(data)
     setshowListingError(false)
  }
  catch(error){
    setshowListingError(true)
     
  }
 }
 const handleListdelete = async (e, id) => {
  e.preventDefault();
  try {
    const res = await fetch(`${backendUrl}/api/listing/delete/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Add if using cookies (like JWT auth)
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      console.error('Failed to delete listing:', data.message);
      return; // stop further execution
    }

    // ✅ Properly update state — RETURN the filtered array
    setUserListings((prevData) =>
      prevData.filter((listing) => listing._id !== id)
    );

    console.log('Deleted:', data);
  } catch (error) {
    console.error('Error deleting listing:', error);
  }
};


  

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>

      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input
          type='file'
          ref={fileRef}
          onChange={(e) => setFile(e.target.files[0])}
          hidden
          accept='image/*'
        />

        <img
          onClick={() => fileRef.current.click()}
          src={formData?.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>Image upload failed</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>Uploading {filePerc}%</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Upload successful</span>
          ) : (
            ''
          )}
        </p>

        <input
          type='text'
          id='username'
          value={formData.username}
          onChange={handleChange}
          placeholder='Username'
          className='border p-3 rounded-lg'
          required
         
        />
        <input
          type='email'
          id='email'
          value={formData.email}
          onChange={handleChange}
          placeholder='Email'
          className='border p-3 rounded-lg'
          required
          
        />
        <input
          type='password'
          id='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='Password'
          className='border p-3 rounded-lg'
          
          
        />

        <button disabled={loading}
          type='submit'
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95'
        >
        {loading? 'Loading...':'Update'}  
        </button>
        <Link to='/CreateListing' className='bg-green-700 uppercase rounded-lg p-3 text-center hover:opacity-90'>create listing
        </Link>

        <div className='flex justify-between'>
          <span  onClick={handleDelete} className='text-red-700 cursor-pointer'>Delete Account</span>
          <span className='text-red-700 cursor-pointer' onClick={handleSignOut} >Logout</span>
        </div>
        <p className='text-red-700'>{error}</p>

      </form >
      <p className='text-green-700'>{updateSuccess?'upadted suceesfully':''}</p>
      <button  onClick={handleShowListing}  className='text-green-700 w-full text-1xl'>Show Listings

      </button>
      {userListings && userListings.length > 0 && (
  <div>
    <h1 className="text-center mt-4 text-2xl font-semibold">Your Listings</h1>

    {userListings.map((item) => (
      <div key={item._id} className="mt-5 border rounded-lg">
        <div className="flex justify-between items-center uppercase border p-3 gap-4">
          <Link to={`/listing/${item._id}`}>
            <img
              src={item.imageUrls[0]} // ✅ show only the first image
              alt="listing cover"
              className="w-16 h-16 object-contain"
            />
          </Link>
          <Link to={`/listing/${item._id}`}>
            <p className="text-slate-700 hover:underline truncate">
              {item.name}
            </p>
          </Link>
          <div className="flex flex-col font-semibold">
            <button
              className="uppercase text-red-700 rounded-lg"
              onClick={(e) => handleListdelete(e, item._id)}
            >
              delete
            </button>
            <Link to={`/update-listing/${item._id}`}>
              <button className="uppercase text-green-700">
                edit
              </button>
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>
)}



    </div>
  );
}
