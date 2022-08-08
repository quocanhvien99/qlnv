import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axios from '../../config/axios';

interface IPaidLeave {
	_id: string;
	employee: string;
	date: Date;
	department: string;
	describe: String;
	state: 'pending' | 'approve' | 'reject';
	createAt: Date;
}

interface PaidLeaveState {
	loading: boolean;
	errorMessage: string | null;
	entities: IPaidLeave[];
	leaderEntities: IPaidLeave[];
	updateSuccess: boolean;
	updating: boolean;
}

const initialState: PaidLeaveState = {
	loading: false,
	errorMessage: null,
	entities: [],
	leaderEntities: [],
	updateSuccess: false,
	updating: false,
};

export const getEntities = createAsyncThunk('paidleave/fetch_entity_list', async (_, { rejectWithValue }) => {
	try {
		const res = await axios.get('/attendance/paidleave', { params: { isLeader: false } });
		return res.data;
	} catch (error: any) {
		if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
		return rejectWithValue(error.response.data.msg);
	}
});

export const createEntity = createAsyncThunk(
	'paidleave/create_entity',
	async (params: { entity: FormData; cb: Function; isLeader: boolean }, thunkAPI) => {
		try {
			await axios.post('/attendance/paidleave', params.entity);
			params.cb();
			thunkAPI.dispatch(getEntities());
			return 'ok';
		} catch (error: any) {
			if (!error.response.data) return thunkAPI.rejectWithValue('Đã có lỗi xảy ra.');
			return thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const getLeaderEntities = createAsyncThunk(
	'paidleave/fetch_leader_entity_list',
	async (_, { rejectWithValue }) => {
		try {
			const res = await axios.get('/attendance/paidleave', { params: { isLeader: true } });
			return res.data;
		} catch (error: any) {
			if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const approveEntity = createAsyncThunk(
	'paidleave/approve_entity',
	async (id: string, { rejectWithValue, dispatch }) => {
		try {
			const res = await axios.get('/attendance/paidleave/approve/' + id);
			dispatch(getLeaderEntities());
			return res.data;
		} catch (error: any) {
			if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const rejectEntity = createAsyncThunk(
	'paidleave/approve_entity',
	async (id: string, { rejectWithValue, dispatch }) => {
		try {
			const res = await axios.get('/attendance/paidleave/reject/' + id);
			dispatch(getLeaderEntities());
			return res.data;
		} catch (error: any) {
			if (!error.response.data) return rejectWithValue('Đã có lỗi xảy ra.');
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const PaidLeaveSlice = createSlice({
	name: 'PaidLeave',
	initialState,
	reducers: {
		clearState(state: PaidLeaveState) {
			state.errorMessage = null;
			state.updateSuccess = false;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(getEntities.fulfilled, (state: PaidLeaveState, action) => {
				state.entities = action.payload;
				state.loading = false;
			})
			.addCase(getEntities.pending, (state: PaidLeaveState) => {
				state.loading = true;
			})
			.addCase(getEntities.rejected, (state: PaidLeaveState, action) => {
				state.errorMessage = action.payload as string;
				state.loading = true;
			})
			.addCase(getLeaderEntities.fulfilled, (state: PaidLeaveState, action) => {
				state.leaderEntities = action.payload;
				state.loading = false;
			})
			.addCase(getLeaderEntities.pending, (state: PaidLeaveState) => {
				state.loading = true;
			})
			.addCase(getLeaderEntities.rejected, (state: PaidLeaveState, action) => {
				state.errorMessage = action.payload as string;
				state.loading = true;
			})
			.addMatcher(
				isAnyOf(createEntity.pending, approveEntity.pending, rejectEntity.pending),
				(state: PaidLeaveState) => {
					state.updating = true;
					state.updateSuccess = false;
				}
			)
			.addMatcher(
				isAnyOf(createEntity.rejected, approveEntity.rejected, rejectEntity.rejected),
				(state: PaidLeaveState, action) => {
					state.errorMessage = action.payload as string;
					state.updating = false;
				}
			)
			.addMatcher(
				isAnyOf(createEntity.fulfilled, approveEntity.fulfilled, rejectEntity.fulfilled),
				(state: PaidLeaveState) => {
					state.updating = false;
					state.updateSuccess = true;
				}
			);
	},
});

export default PaidLeaveSlice.reducer;
export const { clearState } = PaidLeaveSlice.actions;
