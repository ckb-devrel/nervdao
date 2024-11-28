
interface IckbModalProps {
    isOpen: boolean;
    onClose: () => void;
    infos: React.JSX.Element
}
export function IckbModal({
    onClose,
    infos
}: IckbModalProps) {
    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleClose}
        >
            <div
                className="bg-gray-800 rounded-lg p-6 w-4/5 max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 bg-gray-950 rounded-full p-2 text-gray-400 hover:text-white"
                >
                    <img src="./svg/close.svg" alt="Close" width={18} height={18} />
                </button>
                {infos}

            </div>
        </div>
    )
}