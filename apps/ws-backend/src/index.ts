import { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
const wss = new WebSocketServer({port:8080});
import { JWT_SECRET } from '@repo/backend-common/config';



function userExists(token:string):string | null{
    const decoded = jwt.verify(token,JWT_SECRET);

    if(typeof(decoded)==="string"){
        return null;
    }

    if(!decoded.userId){
        return null;
    }

    return decoded.userId;



}



wss.on('connection',function connection(ws,request){
    
    const url = request.url;

    if(!url){
        return;
    }
    const params = new URLSearchParams(url?.split('?')[1]);

    const token = params.get('token') || '';
    const userId = userExists(token);
    if(!userId){
        ws.close();
    }
})