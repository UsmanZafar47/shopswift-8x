import { Confirmation } from '@/components/orders';
export const metadata={title:'Your good finds are confirmed'};
export default async function ConfirmationPage({params}:{params:Promise<{id:string}>}){return <Confirmation id={(await params).id}/>;}
