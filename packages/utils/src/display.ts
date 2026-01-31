export const displayAddress = (address?: string) => {
    if (!address) return "";
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const displayNumber = (value?: string | number, maximumFractionDigits = 4) => {
    if (value === undefined || value === null || value === "") return "0";
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return String(value);
    return numberValue.toLocaleString(undefined, {
        maximumFractionDigits,
    });
};
