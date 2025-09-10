const request = require('supertest');
const sinon = require('sinon');
const { expect, use } = require('chai');

const chaiExclude = require('chai-exclude');
use(chaiExclude);


describe('Transfer Mutation', () => {
        describe('POST /transfers', () =>{   
            
            before(async() =>{
            const loginUser = require('../fixture/request/login/loginUser.json');
            const respostaLogin = await request('http://localhost:4000')
            .post('/graphql')
            .send(loginUser);

             token = respostaLogin.body.data.loginUser.token;
              
        });

        beforeEach(() =>{
            createTransfer = require('../fixture/request/tranferencia/createTransfer.json');
        })

        it('Transferência com sucesso', async () =>{
            const respostaEsperada = require('../fixture/request/respostas/transferencia/tranferenciaComSucesso.json')
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(createTransfer);
            expect(resposta.status).to.equal(200);  
            expect(resposta.body.data.createTransfer).excluding('date').to.deep.equal(respostaEsperada.data.createTransfer)  
             
        });

        it('Sem saldo disponível para transferência', async () =>{
            createTransfer.variables.value = 100001;
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(createTransfer);

            expect(resposta.status).to.equal(200);   
            expect(resposta.body.errors[0].message).to.equal("Saldo insuficiente");     
        });

         it('Token de autenticação não informado', async () =>{
            const tokenInvalido = '123456'
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${tokenInvalido}`)
                .send(createTransfer);

            expect(resposta.status).to.equal(200);   
            expect(resposta.body.errors[0].message).to.equal("Autenticação obrigatória");     
        });
    });
});
