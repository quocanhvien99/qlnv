import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../../config/axios';

interface ICheckin {
	_id: string;
	at: Date;
	late: Number;
	roll: Number;
}

interface CheckinState {
	loading: boolean;
	errorMessage: string | null;
	entities: ICheckin[];
}

const initialState: CheckinState = {
	loading: false,
	errorMessage: null,
	entities: [],
};

export const getEntities = createAsyncThunk('checkin/fetch_entity_list', async (_, thunkAPI) => {
	try {
		const res = await axios.get('/attendance/');
		return res.data;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(error.response.data.msg);
	}
});

const checkinSlice = createSlice({
	name: 'checkin',
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(getEntities.pending, (state: CheckinState) => {
				state.loading = true;
			})
			.addCase(getEntities.fulfilled, (state: CheckinState, action) => {
				state.loading = false;
				state.entities = action.payload;
			})
			.addCase(getEntities.rejected, (state, action) => {
				state.loading = false;
				state.errorMessage = action.payload as string;
			});
	},
});

export default checkinSlice.reducer;
