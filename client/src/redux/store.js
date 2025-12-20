import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userslice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// 1. Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
});

// 2. Create persist config
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

// 3. Wrap root reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer, // ✅ Correct
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
  devTools: true,
});

// 5. Export persistor
export const persistor = persistStore(store);
