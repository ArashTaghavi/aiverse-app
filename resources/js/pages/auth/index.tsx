import { Head } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import LoginCard from './components/LoginCard';

export default function Auth() {
    return (
        <>
            <Head title="Sign in or sign up" />
            <LoginCard />
        </>
    );
}

Auth.layout = AuthLayout;
