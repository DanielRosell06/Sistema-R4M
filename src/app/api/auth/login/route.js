import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {prisma} from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {

try{
    const {username,senha} = await request.json();
    //verfica user e senha
    if (!username || !senha) {
      return new Response(
        JSON.stringify({ message: "Username e senha são obrigatórios." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    //buscar username 
    const usuario = await prisma.usuario.findUnique({
        where : {username}
    });

    if(!usuario){
        return new Response(
            json.stringify({mensage: "usuario não encontrado."}),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    //buscar senha 
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return new Response(
        JSON.stringify({ message: "Credenciais inválidas." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
//gera token jwt 
 if (!JWT_SECRET) {
      throw new Error("JWT_SECRET não está definido no ambiente.");
    }
    const token = jwt.sign(
      {
        userId: usuario.id,
        username: usuario.username,
        tipo: usuario.tipo,
      },
      JWT_SECRET,
      {
        expiresIn: "7d", // ou outro prazo que desejar
      }
    );

    //remove a senha do objeto de retorno
        const { senha: _, ...dadosUsuario } = usuario;

     return  new Response(
        JSON.stringify({user: dadosUsuario, token}),
        {
            status : 200,
            headers: { "Content-Type":"application/json"}
        }
     );
 } catch (error) {
    console.error(" Erro na rota /api/auth/login:", error);
    return new Response(
      JSON.stringify({ message: "Erro interno no servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}