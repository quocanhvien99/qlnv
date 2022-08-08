import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';

import axios from '../../config/axios';
import { AppThunk } from '../../config/store';

interface AuthenticationState {
	loading: boolean;
	isAuthenticated: boolean;
	errorMessage: any;
	account: any;
}

const initialState: AuthenticationState = {
	loading: false,
	isAuthenticated: false,
	errorMessage: undefined,
	account: {},
};

export interface IAuthParams {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export const login = createAsyncThunk('authentication/login', async (auth: IAuthParams, { rejectWithValue }) => {
	try {
		const res = await axios.post<any>('/auth/login', auth);
		return res.data.user;
	} catch (error: any) {
		return rejectWithValue(error.response.data.msg);
	}
});

export const logout = (): AppThunk => async (dispatch, getState) => {
	axios.get('/auth/logout');
	dispatch(clearAuth());
	message.info('Đăng xuất thành công.');
};

export const updateEntity = createAsyncThunk(
	'authentication/update_entity',
	async ({ entity, id }: { entity: FormData; id: string }, thunkAPI) => {
		try {
			const result = await axios.put('/employee/' + id, entity);
			return result.data;
		} catch (error: any) {
			thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const AuthenticationSlice = createSlice({
	name: 'authentication',
	initialState: initialState,
	reducers: {
		clearAuth(state: AuthenticationState) {
			state.account = {};
			state.isAuthenticated = false;
		},
		clearErrorMsg(state: AuthenticationState) {
			state.errorMessage = undefined;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(login.pending, (state) => {
				state.loading = true;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.loading = false;
				state.isAuthenticated = true;
				state.account = action.payload;
			})
			.addCase(login.rejected, (state, action) => {
				state.loading = false;
				state.errorMessage = action.payload;
			})
			.addCase(updateEntity.pending, (state) => {
				state.loading = true;
			})
			.addCase(updateEntity.rejected, (state, action) => {
				state.loading = false;
				state.errorMessage = action.payload;
			})
			.addCase(updateEntity.fulfilled, (state, action) => {
				state.loading = false;
				state.account = action.payload;
			});
	},
});

export const { clearAuth, clearErrorMsg } = AuthenticationSlice.actions;
export default AuthenticationSlice.reducer;
