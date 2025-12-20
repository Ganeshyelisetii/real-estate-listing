
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import myPhoto from '../assets/myphoto.jpg';
import { useState,useEffect } from 'react';

function Header() {
  const currentuser = useSelector(state => state.user.currentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('searchTerm', searchTerm); // ✅ fixed
  const searchQuery = urlParams.toString();
  navigate(`/search?${searchQuery}`);
};

   useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('search');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);
  

  return (
    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center p-3 max-w-6xl mx-auto'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-slate-500'>Ganesh</span>
            <span className='text-slate-700'>Estate</span>
          </h1>
        </Link>
        <form className='bg-slate-100 p-3 rounded-lg flex items-center' onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Search...'
            className='bg-transparent focus:outline-none sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // fixed
          />
          <button>
            <FaSearch className='text-slate-500' />
          </button>
        </form>
        <ul className='flex gap-4'>
          <Link to='/'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              Home
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              About
            </li>
          </Link>

          <Link to='/profile'>
            {currentuser ? (
              <img
                src={currentuser.avatar || myPhoto}
                alt='profile'
                className='rounded-full h-7 w-7 object-cover'
              />
            ) : (
              <li className='text-slate-700 hover:underline'>Signin</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}

export default Header;
