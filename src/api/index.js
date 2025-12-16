import axios from '@/config/api';

export const getAll = async (table) => {
  try {
    let {data} = await axios.get(`/${table}`);
    return data;
  } catch (err) {
    console.log(err);
  }
}; 

export const getById = async (url) => {
  try {
    let {data} = await axios.get('/' + url); 
    return data;
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

export const deleteById = async (url, { arg: id }) => {
  await axios.delete(`${url}/${id}`); 
};