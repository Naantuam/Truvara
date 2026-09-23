import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import api from "../api";
import { AUTH_DISABLED } from "../config";

const TEST_USER = { username: "Test User", email: "test@example.com", is_superuser: true };

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        if (AUTH_DISABLED) {
            setUser(TEST_USER);
            setLoadingAuth(false);
            return;
        }

        const fetchAuthData = async () => {
            setLoadingAuth(true);
            try {
                const meRes = await api.get("/auth/me/");
                setUser((prev) => {
                    const merged = { ...prev, ...meRes.data };
                    try {
                        localStorage.setItem("user", JSON.stringify(merged));
                    } catch {
                        // ignore storage failure (e.g. private browsing)
                    }
                    return merged;
                });
            } catch (err) {
                console.error("Failed to fetch current user:", err);
                setUser(null);
            } finally {
                setLoadingAuth(false);
            }
        };

        fetchAuthData();
    }, []);

    return (
        <div className="h-screen font-sans flex flex-col relative bg-gray-50 dark:bg-gray-950">
            {/* Fixed TopBar */}
            <TopBar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                user={user}
                loadingAuth={loadingAuth}
            />

            {/* Main Layout Container */}
            <div className="flex flex-1 overflow-hidden transition-all duration-300 ease-in-out relative">

                {/* MOBILE OVERLAY (Backdrop)
            - Visible only on mobile (md:hidden)
            - Visible only when sidebar is OPEN
            - Click to close sidebar
        */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar
            - We wrap it in a div to ensure it sits above the backdrop (z-30)
            - On desktop, z-index resets (md:z-auto)
        */}
                <div className="">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        user={user}
                    />
                </div>

                {/* Main Content
            - Removed direct 'ml-55' on mobile.
            - Added 'md:ml-55': This ensures the "push" only happens on Desktop.
            - On Mobile, it stays 'ml-0' so the content remains full width behind the sidebar.
        */}
                <main
                    className={`flex-1 transition-all duration-300 ease-in-out overflow-x-auto ${sidebarOpen ? "md:ml-55" : "ml-0"
                        }`}
                >
                    <Outlet context={{ user, loadingAuth }} />
                </main>
            </div>
        </div>
    );
}
