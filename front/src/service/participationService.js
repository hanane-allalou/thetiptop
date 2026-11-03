import api from './apiInstance';

class ParticipationService {
  
  createParticipation(ticketCode) {
    return api.post('/participations', { ticketCode });
  }

  getMyParticipations() {
    return api.get('/participations/my');
  }
  
}

const participationService = new ParticipationService();

export default participationService;

