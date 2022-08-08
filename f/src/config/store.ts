import { AnyAction, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import authentication from '../shared/reducers/authentication';
import employee from '../pages/Employee/reducer';
import department from '../pages/Department/reducer';
import checkin from '../pages/Checkin/reducer';
import paidleave from '../pages/PaidLeave/reducer';
import ot from '../pages/Ot/reducer';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
	authentication,
	employee,
	department,
	checkin,
	paidleave,
	ot,
});

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['authentication'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;
export const persistor = persistStore(store);
