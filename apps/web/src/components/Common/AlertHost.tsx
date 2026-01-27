import { Alert } from "../../ui";
import { useAlertStore } from "../../store/useAlertStore";

export function AlertHost() {
    const { open, title, message, variant } = useAlertStore();

    return (
        <Alert
            open={open}
            title={title}
            message={message}
            variant={variant}
        />
    );
}
