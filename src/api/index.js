import axios from '@/config/api';

export const getAll = async (table) => {
  try {
    let response= await axios.get(`/${table}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
}; 

export const getById = async (table, id) => {
  try {
    let response = await axios.get(`/${table}/${id}`); 
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const save = async (url, {arg}) => {
  const {id, ...data} = arg;
  return await axios({
    method: id ? 'PUT' : 'POST',
    url: `${url}/${id ?? ''}`,
    data,
  });
};