import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';

export default function ListingItem({ listing }) {
  if (!listing) return null; // ✅ Prevents crash if listing is undefined

  const imageUrl =
    listing?.imageUrls?.[0] ||
    'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg';

  // ✅ Safely calculate price
  const price = listing?.offer
    ? listing?.discountPrice ?? listing?.regularPrice
    : listing?.regularPrice;

  const formattedPrice = price ? price.toLocaleString('en-US') : 'N/A';

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]">
      <Link to={`/listing/${listing?._id}`}>
        <img
          src={imageUrl}
          alt={listing?.name || 'listing cover'}
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-transform duration-300"
        />

        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="truncate text-lg font-semibold text-slate-700">
            {listing?.name || 'No Name'}
          </p>

          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate w-full">
              {listing?.address || 'No Address'}
            </p>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {listing?.description || 'No Description'}
          </p>

          <p className="text-slate-500 mt-2 font-semibold">
            ${formattedPrice}
            {listing?.type === 'rent' && ' / month'}
          </p>

          <div className="text-slate-700 flex gap-4">
            <div className="font-bold text-xs">
              {listing?.bedrooms > 1
                ? `${listing?.bedrooms} beds`
                : `${listing?.bedrooms || 0} bed`}
            </div>

            <div className="font-bold text-xs">
              {listing?.bathrooms > 1
                ? `${listing?.bathrooms} baths`
                : `${listing?.bathrooms || 0} bath`}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
