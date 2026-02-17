import { useState, useTransition } from "react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";

interface AdminDeleteGrievanceFormProps {
    grievanceId: string;
    onDelete: (formData: FormData) => Promise<void>;
}

export default function AdminDeleteGrievanceForm({ grievanceId, onDelete }: AdminDeleteGrievanceFormProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (formData: FormData) => {
        startTransition(async () => {
            await onDelete(formData);
            setIsModalOpen(false);
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-4 font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all group"
            >
                <TrashIcon className="h-5 w-5 group-hover:animate-bounce" />
                Delete Grievance Permanently
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mx-auto">
                        <ExclamationTriangleIcon className="h-10 w-10 animate-pulse" />
                    </div>

                    <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">Are you absolutely sure?</p>
                        <p className="mt-2 text-slate-500">
                            This action will permanently delete the grievance and all its associated history and notifications. This cannot be undone.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 rounded-xl border border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <form action={handleDelete} className="flex-1">
                            <input type="hidden" name="grievanceId" value={grievanceId} />
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full rounded-xl bg-red-600 py-3 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 disabled:opacity-50 transition-all"
                            >
                                {isPending ? "Deleting..." : "Delete Now"}
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
}
