import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import { useSelector } from 'react-redux';
import Contact from './Contact';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';

export default function Listing() {
  const { currentUser } = useSelector((state) => state.user);
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
   const backendUrl=import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/listing/getListing/${params.id}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
        } else {
          setListing(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  if (loading) return <p className="text-center mt-6 text-lg">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-600 text-lg">Something went wrong</p>;

  return (
    <main className="w-screen">
      {listing?.imageUrls?.length > 0 && (
        <>
          <Swiper
            modules={[Navigation]}
            navigation
            className="w-screen h-[250px] sm:h-[300px] md:h-[400px] lg:h-[700px]"
          >
            {listing.imageUrls.map((url, idx) => (
              <SwiperSlide key={idx}>
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={url}
                    alt={`listing-${idx}`}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Share button */}
          <div
            className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <FaShare className="text-slate-500" />
          </div>

          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}

          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            {/* Title and Price */}
           <p className="text-2xl font-semibold">
  {listing.name} –{' '}
  {listing.offer
    ? (typeof listing.discountPrice === 'number'
        ? `₹ ${listing.discountPrice.toLocaleString('en-IN')}`
        : 'Price not available')
    : (typeof listing.regularPrice === 'number'
        ? `₹ ${listing.regularPrice.toLocaleString('en-IN')}`
        : 'Price not available')}
  {listing.type === 'rent' && ' / month'}
</p>

            {/* Address */}
            <p className="flex items-center mt-6 gap-2 text-slate-600 text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>

            {/* Tags */}
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </p>

              {/* ✅ Discount section (NaN fixed) */}
              {listing.offer &&
                typeof listing.regularPrice === 'number' &&
                typeof listing.discountPrice === 'number' && (
                  <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                    ₹
                    {(listing.regularPrice - listing.discountPrice).toLocaleString('en-IN')} off
                  </p>
                )}
            </div>

            {/* Description */}
            <p className="text-slate-800">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>

            {/* Icons */}
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : '1 Bed'}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : '1 Bath'}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaParking className="text-lg" />
                {listing.parking ? 'Parking spot' : 'No Parking'}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaChair className="text-lg" />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>

            {/* Contact Landlord */}
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3"
                onClick={() => setContact(true)}
              >
                Contact Landlord
              </button>
            )}

            {contact && <Contact listing={listing} />}
          </div>
        </>
      )}
    </main>
  );
}
