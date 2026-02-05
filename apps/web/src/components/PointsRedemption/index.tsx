import { images } from "@mirror/assets";
import { useNavigate } from "react-router-dom";

export const PointsRedemptionLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#030620] text-white w-dvw" role="presentation">
            <header className="absolute top-0 left-0 right-0 z-20 flex h-[50px] items-center justify-between px-[20px]">
                <button type="button" className={`w-[18px]`} onClick={() => navigate(-1)}>
                    <img
                        src={images.works.backBtn}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-contain"
                    />
                </button>
                <h1 className="text-2xl font-bold">Points Redemption</h1>
            </header>
            {children}
        </div>
    );
};
