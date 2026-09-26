import {shop,respond,input,quantity,textField} from '@/lib/database';
export async function GET(){return respond(()=>shop('state'));}
export async function POST(request:Request){return respond(async()=>{const d=await input(request);quantity(d.quantity);return shop('add',{productId:textField(d.productId,'product'),variant:textField(d.variant,'variant'),quantity:d.quantity});},201);}
