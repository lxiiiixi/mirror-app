import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layout/AdminLayout";
import { TokenDetailPage } from "./pages/TokenDetailPage";
import { TokenListPage } from "./pages/TokenListPage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate replace to="/tokens" />} />
            <Route element={<AdminLayout />}>
                <Route path="/tokens" element={<TokenListPage />} />
                <Route path="/tokens/:tokenId" element={<TokenDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate replace to="/tokens" />} />
        </Routes>
    );
}
