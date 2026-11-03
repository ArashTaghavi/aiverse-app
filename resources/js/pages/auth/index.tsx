import { Head } from '@inertiajs/react';
import AuthLayout from './layout';
import LoginCard from './_components/LoginCard';

export default function Auth() {
    return (
        <>
            <Head title="Sign in or sign up" />
            <LoginCard />
        </>
    );
}

Auth.layout = AuthLayout;
