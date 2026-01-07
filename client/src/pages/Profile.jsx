// src/pages/Profile.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { storage, ID, Permission, Role } from '../appwrite';
import { 
  updateUserFailure, updateUserStart, updateUserSuccess,
  deleteUserFailure, deleteUserStart, deleteUserSuccess,
  signOutUserFailure, signOutUserStart, signOutUserSuccess 
} from '../redux/user/userslice';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '', // always empty initially
    avatar: currentUser?.avatar || '',
  });

  const [file, setFile] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);

  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListingLoading, setShowListingLoading] = useState(false);
  const [showListingError, setShowListingError] = useState(false);

  // Upload image to Appwrite
  useEffect(() => {
    if (file) handleAppwriteUpload(file);
  }, [file]);

  const handleAppwriteUpload = async (file) => {
    try {
      setFilePerc(0);
      setFileUploadError(false);

      const uploadedFile = await storage.createFile(
        '684441d20019600fa554', // Bucket ID
        ID.unique(),
        file,
        [Permission.read(Role.any())],
        [Permission.write(Role.any())]
      );

      const fileURL = `https://fra.cloud.appwrite.io/v1/storage/buckets/684441d20019600fa554/files/${uploadedFile.$id}/view?project=68444194002bfb6f87a6`;

      setFormData((prev) => ({ ...prev, avatar: fileURL }));
      setFilePerc(100);
    } catch (err) {
      console.error('Upload error:', err);
      setFileUploadError(true);
      setFilePerc(0);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  // Update Profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      const res = await fetch(`${backendUrl}/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(updateUserFailure(data.message || 'Failed to update'));
        throw new Error(data.message || 'Failed to update');
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      alert('Profile updated successfully!');
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      console.error('Update error:', err);
      alert('Error updating profile');
    }
  };

  // Delete Account
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;

    try {
      dispatch(deleteUserStart());

      const res = await fetch(`${backendUrl}/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(deleteUserFailure(data.message || 'Failed to delete account'));
        return;
      }

      dispatch(deleteUserSuccess());
      alert('Account deleted successfully!');
      navigate('/');
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      console.error('Delete error:', error);
    }
  };

  // Logout
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());

      const res = await fetch(`${backendUrl}/api/auth/signout`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(signOutUserFailure(data.message || 'Failed to logout'));
        return;
      }

      dispatch(signOutUserSuccess());
      alert('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
      console.error('Logout error:', error);
    }
  };

  // Fetch User Listings
  const handleShowListing = async () => {
    try {
      setShowListingError(false);
      setShowListingLoading(true);

      const res = await fetch(`${backendUrl}/api/user/listings/${currentUser._id}`, {
        credentials: 'include',
      });

      const data = await res.json();
      setUserListings(data);
      setShowListingLoading(false);
    } catch (error) {
      setShowListingError(true);
      setShowListingLoading(false);
      console.error('Fetch listings error:', error);
    }
  };

  // Delete individual listing
  const handleListDelete = async (e, id) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/listing/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to delete listing:', data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== id));
      console.log('Deleted listing:', data);
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
          src={formData?.avatar || currentUser?.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
          {fileUploadError
            ? <span className='text-red-700'>Image upload failed</span>
            : filePerc > 0 && filePerc < 100
              ? <span className='text-slate-700'>Uploading {filePerc}%</span>
              : filePerc === 100
                ? <span className='text-green-700'>Upload successful</span>
                : ''
          }
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

        <button
          disabled={loading}
          type='submit'
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>

        <Link to='/CreateListing' className='bg-green-700 uppercase rounded-lg p-3 text-center hover:opacity-90'>
          Create Listing
        </Link>

        <div className='flex justify-between mt-3'>
          <span onClick={handleDelete} className='text-red-700 cursor-pointer'>Delete Account</span>
          <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Logout</span>
        </div>
        <p className='text-red-700'>{error}</p>
        <p className='text-green-700'>{updateSuccess ? 'Updated successfully' : ''}</p>
      </form>

      <button onClick={handleShowListing} className='text-green-700 w-full text-1xl mt-5'>
        {showListingLoading ? 'Loading Listings...' : 'Show Listings'}
      </button>

      {showListingError && <p className='text-red-700'>Failed to load listings</p>}

      {userListings.length > 0 && (
        <div className='mt-5'>
          <h1 className="text-center text-2xl font-semibold mb-4">Your Listings</h1>
          {userListings.map((item) => (
            <div key={item._id} className="mt-5 border rounded-lg p-3 flex justify-between items-center uppercase gap-4">
              <Link to={`/listing/${item._id}`}>
                <img src={item.imageUrls[0]} alt="listing cover" className="w-16 h-16 object-contain" />
              </Link>
              <Link to={`/listing/${item._id}`}>
                <p className="text-slate-700 hover:underline truncate">{item.name}</p>
              </Link>
              <div className="flex flex-col gap-1">
                <button onClick={(e) => handleListDelete(e, item._id)} className="uppercase text-red-700">Delete</button>
                <Link to={`/update-listing/${item._id}`}>
                  <button className="uppercase text-green-700">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
