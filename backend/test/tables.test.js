const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

let adminToken;

before((done) => {
  chai.request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@restaurant.com', password: 'admin123' })
    .end((err, res) => {
      adminToken = res.body.token;
      done();
    });
});

describe('Table Routes', () => {
  it('GET /api/tables - should return list of tables', (done) => {
    chai.request(app)
      .get('/api/tables')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('POST /api/tables - should fail without auth token', (done) => {
    chai.request(app)
      .post('/api/tables')
      .send({ seats: 4, location: 'Test', babyHighChair: false })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('POST /api/tables - should create table with admin token', (done) => {
    chai.request(app)
      .post('/api/tables')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ seats: 4, location: 'Test Table', babyHighChair: false })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        done();
      });
  });
});