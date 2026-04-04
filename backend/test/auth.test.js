const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Auth Routes', () => {
  const testEmail = `test_${Date.now()}@test.com`;

  it('POST /api/auth/register - should register a new user', (done) => {
    chai.request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('POST /api/auth/login - should login with valid credentials', (done) => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('POST /api/auth/login - should fail with wrong password', (done) => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});