import React, { useState, useRef } from 'react';
import { storage, ID } from '../appwrite';
import { Permission, Role } from 'appwrite';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularprice: 0,
    discountprice: 0,
    offer: false,
    parking: false,
    furnished: false,
    imageUrls: [],
  });

  const fileInputRef = useRef(null);
  const [imageUpLoadError, setImageUploadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createListLoading, setCreateListLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const params=useParams()
  const backendUrl=import.meta.env.VITE_BACKEND_URL
  useEffect(()=>{
        const fetchListing=async()=>{
            const listingid=params.id
            const res=await fetch(`${backendUrl}/api/listing/getlisting/${listingid}`)
            const data= await res.json()
            setFormData(data)
        }
        fetchListing();
  },[]);

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const maxImages = 6;
    const totalImages = files.length + formData.imageUrls.length;

    if (files.length > 0 && totalImages <= maxImages) {
      const promises = files.map((file) => storeImage(file));

      try {
        const urls = await Promise.all(promises);
        fileInputRef.current.value = null;
        setFiles([]);
        setFormData((prevData) => ({
          ...prevData,
          imageUrls: [...prevData.imageUrls, ...urls.filter(Boolean)],
        }));
        setImageUploadError(false);
      } catch (err) {
        console.error('One or more image uploads failed:', err);
        setImageUploadError('Image upload failed (2MB max per image)');
      }
    } else {
      if (files.length === 0) {
        setImageUploadError('Please select at least one file');
      } else {
        setImageUploadError('You can only upload up to 6 images per listing');
      }
    }

    setLoading(false);
  };

  const storeImage = async (file) => {
    try {
      const uniqueId = ID.unique();
      const uploadedFile = await storage.createFile(
        '684441d20019600fa554',
        uniqueId,
        file,
        [Permission.read(Role.any())]
      );
      return `https://fra.cloud.appwrite.io/v1/storage/buckets/684441d20019600fa554/files/${uploadedFile.$id}/view?project=68444194002bfb6f87a6`;
    } catch (err) {
      console.error('Upload failed:', err.message);
      throw err;
    }
  };

  const handleImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleOnChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const Handlesubmit = async (e) => {
  e.preventDefault();
  setCreateListLoading(true);
  setError(false);

  if (!currentUser || !currentUser._id) {
    console.error("User is not logged in or _id is missing");
    setError("User is not logged in");
    setCreateListLoading(false);
    return;
  }

  if (formData.imageUrls.length < 1) {
    setError('You must upload at least one image');
    setCreateListLoading(false);
    return;
  }

  if (+formData.regularprice < +formData.discountprice) {
    setError('Discount price should be less than regular price');
    setCreateListLoading(false);
    return;
  }

  try {
    const payload = {
      ...formData,
      userRef: currentUser._id,
    };
    const id = params.id;

    const res = await fetch(`${backendUrl}/api/listing/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get('content-type');

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    if (data.success === false) {
      setError(data.message);
    } else {
      navigate(`/listing/${data._id}`);
    }

    setCreateListLoading(false);
  } catch (error) {
    console.error('Create listing error:', error.message);
    setError(error.message);
    setCreateListLoading(false);
  }
};


  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">update Listing</h1>
      <form className="flex flex-col sm:flex-row gap-4" onSubmit={Handlesubmit}>
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg"
            maxLength="62"
            minLength="10"
            required
            value={formData.name}
            onChange={handleOnChange}
          />
          <textarea
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
            value={formData.description}
            onChange={handleOnChange}
          />
          <input
            type="text"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
            value={formData.address}
            onChange={handleOnChange}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleOnChange}
                checked={formData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleOnChange}
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleOnChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleOnChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleOnChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                defaultvalue={formData.bedrooms}
                onChange={handleOnChange}
              />
              <p>Bedrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                defaultValue={formData.bathrooms}
                onChange={handleOnChange}
              />
              <p>Bathrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularprice"
                min="0"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                value={formData.regularprice}
                onChange={handleOnChange}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountprice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  defaultValue={formData.discountprice}
                  onChange={handleOnChange}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  <span className="text-xs">($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              onChange={(e) => setFiles([...e.target.files])}
              type="file"
              id="images"
              accept="image/*"
              multiple
              ref={fileInputRef}
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={createListLoading || loading}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {loading ? 'Loading...' : 'Upload'}
            </button>
          </div>
          <p className="text-red-700">{imageUpLoadError && imageUpLoadError}</p>

          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, idx) => (
              <div className="flex justify-between p-3 gap-2 items-center" key={idx}>
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-90"
                  onClick={() => handleImageRemove(idx)}
                >
                  Delete
                </button>
              </div>
            ))}

          <button
            disabled={createListLoading || loading}
            type="submit"
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {createListLoading ? 'Loading...' : 'Edit Listing'}
          </button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
