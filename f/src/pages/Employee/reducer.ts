import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axios from '../../config/axios';

interface IEmployee {
	_id: string;
	full_name: string;
	email: string;
	date_of_birth: Date;
	first_day_work: Date;
	phone_number: string;
	avatar: string;
	countryside: string;
	role: string;
	department: any;
	password?: string;
}

interface EmployeeState {
	loading: boolean;
	errorMessage: string | null;
	entities: IEmployee[];
	entity: IEmployee | null;
	totalItems: number;
	updateSuccess: boolean;
	updating: boolean;
	deleteSuccess: boolean;
}

const initialState: EmployeeState = {
	loading: false,
	errorMessage: null,
	entities: [],
	entity: null,
	totalItems: 0,
	updateSuccess: false,
	updating: false,
	deleteSuccess: false,
};

interface IQueryParams {
	limit?: number;
	skip?: number;
	sortBy?: string;
	orderBy?: -1 | 1;
	keyword?: string;
}

export const getEntities = createAsyncThunk(
	'employee/fetch_entity_list',
	async (params: IQueryParams, { rejectWithValue }) => {
		try {
			const res = await axios.get('/employee/', { params });
			return res.data;
		} catch (error: any) {
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const getEntity = createAsyncThunk('employee/fetch_entity', async (id: string | number, { rejectWithValue }) => {
	try {
		const res = await axios.get('/employee/' + id);
		return res.data;
	} catch (error: any) {
		return rejectWithValue(error.response.data.msg);
	}
});

export const createEntity = createAsyncThunk(
	'employee/create_entity',
	async (params: { entity: FormData; cb: Function }, thunkAPI) => {
		try {
			await axios.post('/employee', params.entity);
			params.cb();
			return 'ok';
		} catch (error: any) {
			thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const updateEntity = createAsyncThunk('employee/update_entity', async (entity: FormData, thunkAPI) => {
	try {
		const result = await axios.put('/employee', entity);
		await thunkAPI.dispatch(getEntity(result.data._id));
		return 'ok';
	} catch (error: any) {
		thunkAPI.rejectWithValue(error.response.data.msg);
	}
});

export const deleteEntity = createAsyncThunk(
	'employee/delete_entity',
	async ({ id, params }: { id: string; params: IQueryParams }, thunkAPI) => {
		try {
			await axios.delete('/employee/' + id);
			thunkAPI.dispatch(getEntities(params));
			return 'ok';
		} catch (error: any) {
			thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const EmployeeSlice = createSlice({
	name: 'employee',
	initialState,
	reducers: {
		clearState(state: EmployeeState) {
			state.errorMessage = null;
			state.updateSuccess = false;
			state.deleteSuccess = false;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(getEntities.fulfilled, (state: EmployeeState, action) => {
				state.entities = action.payload.list;
				state.totalItems = action.payload.count;
				state.loading = false;
			})
			.addCase(getEntity.fulfilled, (state: EmployeeState, action) => {
				state.entity = action.payload;
				state.loading = false;
			})
			.addCase(deleteEntity.pending, (state: EmployeeState) => {
				state.deleteSuccess = false;
				state.updating = true;
			})
			.addCase(deleteEntity.fulfilled, (state: EmployeeState) => {
				state.deleteSuccess = true;
				state.updating = false;
			})
			.addCase(deleteEntity.rejected, (state: EmployeeState, action) => {
				state.errorMessage = action.payload as string;
				state.updating = false;
			})
			.addMatcher(isAnyOf(getEntities.pending, getEntity.pending), (state: EmployeeState) => {
				state.loading = true;
			})
			.addMatcher(isAnyOf(getEntities.rejected, getEntity.rejected), (state, action) => {
				state.loading = false;
				state.errorMessage = action.payload as string;
			})
			.addMatcher(isAnyOf(createEntity.pending, updateEntity.pending), (state: EmployeeState) => {
				state.updating = true;
				state.updateSuccess = false;
			})
			.addMatcher(isAnyOf(createEntity.fulfilled, updateEntity.fulfilled), (state: EmployeeState, action) => {
				state.updating = false;
				state.updateSuccess = true;
			})
			.addMatcher(isAnyOf(createEntity.rejected, updateEntity.rejected), (state: EmployeeState, action) => {
				state.updating = false;
				state.errorMessage = action.payload as string;
			});
	},
});

export default EmployeeSlice.reducer;
export const { clearState } = EmployeeSlice.actions;
