const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

let adminToken;
let tableId;
let reservationId;

before(function(done) {
  this.timeout(15000);
  chai.request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@restaurant.com', password: 'admin123' })
    .end(() => {
      chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@restaurant.com', password: 'admin123' })
        .end((err, res) => {
          adminToken = res.body.token;
          chai.request(app)
            .post('/api/tables')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ seats: 4, location: 'Test Reservation Table', babyHighChair: false })
            .end((err, res) => {
              tableId = res.body._id;
              done();
            });
        });
    });
});

describe('Reservation Routes', () => {
  it('GET /api/reservations - should fail without token', (done) => {
    chai.request(app)
      .get('/api/reservations')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('GET /api/reservations - should return all reservations with admin token', (done) => {
    chai.request(app)
      .get('/api/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('GET /api/tables/available - should return available tables', (done) => {
    chai.request(app)
      .get('/api/tables/available')
      .query({ dateTime: '2028-01-01T18:00:00', numGuests: 2 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});