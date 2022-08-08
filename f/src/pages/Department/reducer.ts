import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axios from '../../config/axios';

interface IDepartment {
	_id: string;
	departmentName: string;
	leader: any;
	members: any;
	createAt: Date;
}

interface DepartmentState {
	loading: boolean;
	errorMessage: string | null;
	entities: IDepartment[];
	entity: IDepartment | null;
	totalItems: number;
	updateSuccess: boolean;
	updating: boolean;
	deleteSuccess: boolean;
}

const initialState: DepartmentState = {
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
	'department/fetch_entity_list',
	async (params: IQueryParams, { rejectWithValue }) => {
		try {
			const res = await axios.get('/department/', { params });
			return res.data;
		} catch (error: any) {
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const getEntity = createAsyncThunk(
	'department/fetch_entity',
	async (id: string | number, { rejectWithValue }) => {
		try {
			const res = await axios.get('/department/' + id);
			return res.data[0];
		} catch (error: any) {
			return rejectWithValue(error.response.data.msg);
		}
	}
);

export const deleteEntity = createAsyncThunk(
	'department/delete_entity',
	async ({ id, params }: { id: string; params: IQueryParams }, thunkAPI) => {
		try {
			await axios.delete('/department/' + id);
			thunkAPI.dispatch(getEntities(params));
			return 'ok';
		} catch (error: any) {
			thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const createEntity = createAsyncThunk(
	'department/create_entity',
	async (params: { entity: FormData; cb: Function; params: IQueryParams }, thunkAPI) => {
		try {
			await axios.post('/department', params.entity);
			params.cb();
			thunkAPI.dispatch(getEntities(params.params));
			return 'ok';
		} catch (error: any) {
			thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);
export const updateEntity = createAsyncThunk(
	'department/create_entity',
	async (params: { id: string; entity: FormData; cb: Function; params: IQueryParams }, thunkAPI) => {
		try {
			await axios.put('/department/' + params.id, params.entity);
			params.cb();
			thunkAPI.dispatch(getEntities(params.params));
			return 'ok';
		} catch (error: any) {
			thunkAPI.rejectWithValue(error.response.data.msg);
		}
	}
);

export const DepartmentSlice = createSlice({
	name: 'department',
	initialState,
	reducers: {
		clearState(state: DepartmentState) {
			state.errorMessage = null;
			state.updateSuccess = false;
			state.deleteSuccess = false;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(getEntities.fulfilled, (state: DepartmentState, action) => {
				state.entities = action.payload.list;
				state.totalItems = action.payload.count;
				state.loading = false;
			})
			.addCase(getEntity.fulfilled, (state: DepartmentState, action) => {
				state.entity = action.payload;
				state.loading = false;
			})
			.addCase(deleteEntity.pending, (state: DepartmentState) => {
				state.deleteSuccess = false;
				state.updating = true;
			})
			.addCase(deleteEntity.fulfilled, (state: DepartmentState) => {
				state.deleteSuccess = true;
				state.updating = false;
			})
			.addCase(deleteEntity.rejected, (state: DepartmentState, action) => {
				state.errorMessage = action.payload as string;
				state.updating = false;
			})
			.addMatcher(isAnyOf(getEntities.pending, getEntity.pending), (state: DepartmentState) => {
				state.loading = true;
			})
			.addMatcher(isAnyOf(getEntities.rejected, getEntity.rejected), (state: DepartmentState, action) => {
				state.loading = false;
				state.errorMessage = action.payload as string;
			})
			.addMatcher(isAnyOf(createEntity.pending, updateEntity.pending), (state: DepartmentState) => {
				state.updating = true;
				state.updateSuccess = false;
			})
			.addMatcher(isAnyOf(createEntity.fulfilled, updateEntity.fulfilled), (state: DepartmentState, action) => {
				state.updating = false;
				state.updateSuccess = true;
			})
			.addMatcher(isAnyOf(createEntity.rejected, updateEntity.rejected), (state: DepartmentState, action) => {
				state.updating = false;
				state.errorMessage = action.payload as string;
			});
	},
});

export default DepartmentSlice.reducer;
export const { clearState } = DepartmentSlice.actions;
