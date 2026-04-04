const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

let adminToken;
let tableId;

before((done) => {
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

describe('Reservation Routes', () => {
  it('POST /api/reservations - should create a reservation', (done) => {
    chai.request(app)
      .post('/api/reservations')
      .send({
        customerName: 'Test Customer',
        email: 'test@test.com',
        phoneNum: '0400000000',
        reservedDate: '2027-01-01T18:00:00',
        numGuests: 2,
        tableId: tableId
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.reservation).to.have.property('_id');
        done();
      });
  });

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
});