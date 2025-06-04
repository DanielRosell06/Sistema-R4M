import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';
import { data } from 'autoprefixer';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export async function POST (request) {
    
try{
 const { username, senha, nome,status, tipo } = await request.json();



// verifica se os campos estao prenchidos 

if (!username || !senha || !nome){
    return new Response(

JSON.stringify({message: "Os dados nao foram prenchidos!"}),
{status:400 , headers :{"Content-Type": "application/json"}}
    );
}


//verifica se ja existe user com este username
const uservago = await prisma.usuario.findUnique({
    where : {username},
});
if (uservago) {
      return new Response(
        JSON.stringify({ message: "Username já está em uso." }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

//faz o hash da senha ates de salvar 
const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);


//declara o objeto para criação
const dadosParaCriar ={
username,
senha: senhaHash,
nome,
tipo,
};


//criar usuario no banco 
const novoUsuario = await prisma.usuario.create({
data : dadosParaCriar,
})

// gera o token 
 if (!JWT_SECRET) {
      throw new Error("JWT_SECRET não definido no ambiente.");
    }
    const token = jwt.sign(
      {
        userId: novoUsuario.id,
        username: novoUsuario.username,
        tipo: novoUsuario.tipo,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
//remove a senha do objeto a ser retornado
    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    return new Response(
      JSON.stringify({ user: usuarioSemSenha, token }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro em /api/auth/register:", error);
    return new Response(
      JSON.stringify({ message: "Erro interno do servidor." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}