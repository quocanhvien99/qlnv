import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axios from '../../config/axios';

interface IOt {
	_id: string;
	employee: string;
	to: Date;
	department: string;
	describe: String;
	state: 'pending' | 'approve' | 'reject';
	createAt: Date;
}

interface OtState {
	loading: boolean;
	errorMessage: string | null;
	entities: IOt[];
	leaderEntities: IOt[];
	updateSuccess: boolean;
	updating: boolean;
}

const initialState: OtState = {
	loading: false,
	errorMessage: null,
	entities: [],
	leaderEntities: [],
	updateSuccess: false,
	updating: false,
};

export const getEntities = createAsyncThunk('ot/fetch_entity_list', async (_, { rejectWithValue }) => {
	try {
		const res = await axios.get('/attendance/ot', { params: { isLeader: false } });
		return res.data;
	} catch (error: any) {
		if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
		return rejectWithValue(error.response.data.msg);
	}
});

export const createEntity = createAsyncThunk(
	'ot/create_entity',
	async (params: { entity: FormData; cb: Function }, thunkAPI) => {
		try {
			await axios.post('/attendance/ot', params.entity);
			params.cb();
			thunkAPI.dispatch(getEntities());
			return 'ok';
		} catch (error: any) {
			if (!error.response.data) return thunkAPI.rejectWithValue('Đã có lỗi xảy ra.');
			return thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const getLeaderEntities = createAsyncThunk('ot/fetch_leader_entity_list', async (_, { rejectWithValue }) => {
	try {
		const res = await axios.get('/attendance/ot', { params: { isLeader: true } });
		return res.data;
	} catch (error: any) {
		if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
		return rejectWithValue(error.response.data.msg);
	}
});

export const approveEntity = createAsyncThunk(
	'ot/approve_entity',
	async (id: string, { rejectWithValue, dispatch }) => {
		try {
			const res = await axios.get('/attendance/ot/approve/' + id);
			dispatch(getLeaderEntities());
			return res.data;
		} catch (error: any) {
			if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const rejectEntity = createAsyncThunk('ot/approve_entity', async (id: string, { rejectWithValue, dispatch }) => {
	try {
		const res = await axios.get('/attendance/ot/reject/' + id);
		dispatch(getLeaderEntities());
		return res.data;
	} catch (error: any) {
		if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
		return rejectWithValue(error.response.data.msg);
	}
});

export const OtSlice = createSlice({
	name: 'Ot',
	initialState,
	reducers: {
		clearState(state: OtState) {
			state.errorMessage = null;
			state.updateSuccess = false;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(getEntities.fulfilled, (state: OtState, action) => {
				state.entities = action.payload;
				state.loading = false;
			})
			.addCase(getEntities.pending, (state: OtState) => {
				state.loading = true;
			})
			.addCase(getEntities.rejected, (state: OtState, action) => {
				state.errorMessage = action.payload as string;
				state.loading = true;
			})
			.addCase(getLeaderEntities.fulfilled, (state: OtState, action) => {
				state.leaderEntities = action.payload;
				state.loading = false;
			})
			.addCase(getLeaderEntities.pending, (state: OtState) => {
				state.loading = true;
			})
			.addCase(getLeaderEntities.rejected, (state: OtState, action) => {
				state.errorMessage = action.payload as string;
				state.loading = true;
			})
			.addMatcher(isAnyOf(createEntity.pending, approveEntity.pending, rejectEntity.pending), (state: OtState) => {
				state.updating = true;
				state.updateSuccess = false;
			})
			.addMatcher(
				isAnyOf(createEntity.rejected, approveEntity.rejected, rejectEntity.rejected),
				(state: OtState, action) => {
					state.errorMessage = action.payload as string;
					state.updating = false;
				}
			)
			.addMatcher(
				isAnyOf(createEntity.fulfilled, approveEntity.fulfilled, rejectEntity.fulfilled),
				(state: OtState) => {
					state.updating = false;
					state.updateSuccess = true;
				}
			);
	},
});

export default OtSlice.reducer;
export const { clearState } = OtSlice.actions;
