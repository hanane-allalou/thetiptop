import axios from 'axios';
import API_BASE_URL from './apiBase';

class PrizeService {

  getPrize() {
    return axios.get(`${API_BASE_URL}/api/prizes`);
  }

  getPublicPrize() {
    return axios.get(`${API_BASE_URL}/api/prizes/public`);
  }
  
}

const prizeService = new PrizeService();

export default prizeService;