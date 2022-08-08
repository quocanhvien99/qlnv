import axios from 'axios';

const instance = axios.create({
	baseURL: 'http://localhost:3000',
	withCredentials: true,
});

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		const { code } = error.response.data;
		if (code === 1) return instance.get('/auth/token').then(() => instance(error.response.config));
		return error;
	}
);

export default instance;
