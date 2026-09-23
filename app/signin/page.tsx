import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';
import { LoadingState } from '@/components/ui';
export const metadata={title:'Welcome to ShopSwift'};
export default function SignInPage(){return <Suspense fallback={<LoadingState/>}><AuthForm/></Suspense>;}
