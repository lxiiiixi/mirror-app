import { images } from "@mirror/assets";
import { useSafeBack } from "../../hooks/useSafeBack";

export const BlackBarHeader = ({ title }: { title: string }) => {
    const handleSafeBack = useSafeBack();

    return (
        <header className="flex h-[50px] items-center gap-4 px-[20px] bg-black shadow-[0px_10px_40px_0px_#A916E340]">
            <button type="button" className={`w-[18px]`} onClick={handleSafeBack}>
                <img
                    src={images.works.backBtn}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                />
            </button>
            <h1 className="text-[18px] font-bold">{title}</h1>
        </header>
    );
};
