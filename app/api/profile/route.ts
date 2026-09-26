import {shop,respond,input,textField,ApiError} from '@/lib/database';
export async function POST(request:Request){return respond(async()=>{const d=await input(request);const name=textField(d.name,'name',100),email=textField(d.email,'email',254);if(name.length<2||!/^[^ @]+@[^ @]+\.[^ @]+$/.test(email))throw new ApiError('Enter your name and a valid email');return shop('profile',{name,email});});}
