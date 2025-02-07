import { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
const wss = new WebSocketServer({port:8080});
import { JWT_SECRET } from '@repo/backend-common/config';

wss.on('connection',function connection(ws,request){
    
    const url = request.url;

    if(!url){
        return;
    }
    const params = new URLSearchParams(url?.split('?')[1]);

    const token = params.get('token') || '';
    const decoded = jwt.verify(token,JWT_SECRET);

    if(typeof(decoded)==="string"){
        return;
    }

    if(!decoded.userId){
        ws.close();
        return;
    }

})