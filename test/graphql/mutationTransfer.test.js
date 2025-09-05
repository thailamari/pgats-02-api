const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

describe('Transfer Mutation', () => {
        describe('POST /transfers', () =>{   

            beforeEach(async() =>{
            // Capturar o token
            const respostaLogin = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                "query": "mutation LoginUser($username: String!, $password: String!) { loginUser(password: $password username: $username) {user {username} token}}",
                    "variables": {
                         "username": "thaila",
                            "password": "123456"
                     }
            });

             token = respostaLogin.body.data.loginUser.token;
              
        });

        it('Tranferência com sucesso', async () =>{
           
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "query": "mutation CreateTransfer($from: String!, $to: String!, $value: Float!) { createTransfer(from: $from, to: $to, value: $value) { from to value } }",
                    "variables": {
                        "from": "julio",
                        "to": "priscila",
                        "value": 1
                    }
                });
            expect(resposta.status).to.equal(200);    
        });

        it('Sem saldo disponível para transferência', async () =>{
           
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    "query": "mutation CreateTransfer($from: String!, $to: String!, $value: Float!) { createTransfer(from: $from, to: $to, value: $value) { from to value } }",
                    "variables": {
                        "from": "thaila",
                        "to": "julio",
                        "value": 100000
                    }
                });

            expect(resposta.status).to.equal(200);   
            expect(resposta.body.errors[0].message).to.equal("Saldo insuficiente");     
        });

         it('Token de autenticação não informado', async () =>{
            const tokenInvalido = '123456'
           
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${tokenInvalido}`)
                .send({
                    "query": "mutation CreateTransfer($from: String!, $to: String!, $value: Float!) { createTransfer(from: $from, to: $to, value: $value) { from to value } }",
                    "variables": {
                        "from": "thaila",
                        "to": "julio",
                        "value": 1
                    }
                });

            expect(resposta.status).to.equal(200);   
            expect(resposta.body.errors[0].message).to.equal("Autenticação obrigatória");     
        });
    });
});
