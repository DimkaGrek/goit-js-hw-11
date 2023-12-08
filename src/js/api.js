import axios from 'axios';

export const fetchSearch = async (query, page, per_page) => {
  const API_KEY = '41149387-11b3abb10087771675872f0df';
  const params = new URLSearchParams({
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: per_page,
    page: page,
  });
  const URL =
    'https://pixabay.com/api/?key=' +
    API_KEY +
    '&q=' +
    encodeURIComponent(query) +
    '&' +
    params;

  try {
    const response = await axios.get(URL);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
