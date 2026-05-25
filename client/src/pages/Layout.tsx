import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const Layout: FC = () => {
    return (
        <div className="font-roboto min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
