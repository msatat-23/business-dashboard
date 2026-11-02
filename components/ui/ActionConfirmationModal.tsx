'use client';

import React, { useEffect, useState } from 'react';
import {
    AnimatePresence,
    motion,
    type Variants,
} from 'framer-motion';
import {
    AlertTriangle,
    Archive,
    Ban,
    CheckCircle2,
    Eye,
    Loader2,
    RotateCcw,
    Trash2,
    X,
} from 'lucide-react';

export type ConfirmationAction =
    | 'delete'
    | 'archive'
    | 'restore'
    | 'disable'
    | 'enable'
    | 'publish'
    | 'unpublish';

interface ActionConfig {
    title: string;
    defaultDescription: string;
    confirmLabel: string;
    icon: React.ReactNode;
    iconWrapperClass: string;
    confirmButtonClass: string;
}

const ACTION_CONFIG: Record<ConfirmationAction, ActionConfig> = {
    delete: {
        title: 'Delete Item',
        defaultDescription:
            'This action cannot be undone. The selected item will be permanently removed.',
        confirmLabel: 'Delete',
        icon: <Trash2 size={22} />,
        iconWrapperClass: 'bg-rose-50 border-rose-200 text-[#e11d48]',
        confirmButtonClass:
            'bg-[#e11d48] hover:bg-rose-700 shadow-[0_4px_15px_rgba(225,29,72,0.25)]',
    },

    archive: {
        title: 'Archive Item',
        defaultDescription:
            'The selected item will be archived and will no longer be active.',
        confirmLabel: 'Archive',
        icon: <Archive size={22} />,
        iconWrapperClass: 'bg-amber-50 border-amber-200 text-amber-600',
        confirmButtonClass:
            'bg-amber-500 hover:bg-amber-600 shadow-[0_4px_15px_rgba(245,158,11,0.25)]',
    },

    restore: {
        title: 'Restore Item',
        defaultDescription:
            'The selected item will be restored and made active again.',
        confirmLabel: 'Restore',
        icon: <RotateCcw size={22} />,
        iconWrapperClass: 'bg-emerald-50 border-emerald-200 text-emerald-600',
        confirmButtonClass:
            'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.25)]',
    },

    disable: {
        title: 'Disable Item',
        defaultDescription:
            'The selected item will be disabled and will no longer be available.',
        confirmLabel: 'Disable',
        icon: <Ban size={22} />,
        iconWrapperClass: 'bg-rose-50 border-rose-200 text-[#e11d48]',
        confirmButtonClass:
            'bg-[#e11d48] hover:bg-rose-700 shadow-[0_4px_15px_rgba(225,29,72,0.25)]',
    },

    enable: {
        title: 'Enable Item',
        defaultDescription:
            'The selected item will be enabled and available again.',
        confirmLabel: 'Enable',
        icon: <CheckCircle2 size={22} />,
        iconWrapperClass: 'bg-emerald-50 border-emerald-200 text-emerald-600',
        confirmButtonClass:
            'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.25)]',
    },

    publish: {
        title: 'Publish Item',
        defaultDescription:
            'The selected item will become publicly available.',
        confirmLabel: 'Publish',
        icon: <Eye size={22} />,
        iconWrapperClass: 'bg-purple-50 border-purple-200 text-[#9333ea]',
        confirmButtonClass:
            'bg-[#9333ea] hover:bg-purple-700 shadow-[0_4px_15px_rgba(147,51,234,0.25)]',
    },

    unpublish: {
        title: 'Unpublish Item',
        defaultDescription:
            'The selected item will no longer be publicly available.',
        confirmLabel: 'Unpublish',
        icon: <Eye size={22} />,
        iconWrapperClass: 'bg-slate-100 border-slate-200 text-slate-600',
        confirmButtonClass:
            'bg-slate-700 hover:bg-slate-800 shadow-[0_4px_15px_rgba(51,65,85,0.25)]',
    },
};

interface ActionConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;

    /**
     * Defaults to "delete".
     */
    action?: ConfirmationAction;

    /**
     * Optional item name displayed in the confirmation message.
     */
    itemName?: string;

    /**
     * Optional custom title.
     */
    title?: string;

    /**
     * Optional custom description.
     */
    description?: string;

    /**
     * Optional custom confirm button label.
     */
    confirmLabel?: string;

    /**
     * Optional custom cancel button label.
     */
    cancelLabel?: string;
}

const backdropVariants: Variants = {
    hidden: {
        opacity: 0,
    },

    visible: {
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },

    exit: {
        opacity: 0,
        transition: {
            duration: 0.18,
            ease: 'easeIn',
        },
    },
};

const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
        y: 16,
    },

    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 380,
            damping: 28,
            mass: 0.8,
        },
    },

    exit: {
        opacity: 0,
        scale: 0.96,
        y: 10,
        transition: {
            duration: 0.18,
            ease: 'easeIn',
        },
    },
};

const contentVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 6,
    },

    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.06,
            duration: 0.2,
            ease: 'easeOut',
        },
    },

    exit: {
        opacity: 0,
        y: 3,
        transition: {
            duration: 0.1,
        },
    },
};

const iconVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.7,
        rotate: -8,
    },

    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            delay: 0.04,
            type: 'spring',
            stiffness: 420,
            damping: 18,
        },
    },

    exit: {
        opacity: 0,
        scale: 0.85,
        transition: {
            duration: 0.12,
        },
    },
};

export function ActionConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    action = 'delete',
    itemName,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Cancel',
}: ActionConfirmationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const config = ACTION_CONFIG[action];

    /*
     * Reset submitting state whenever the modal opens.
     */
    useEffect(() => {

        const initializeSubmitting = () => {
            setIsSubmitting(false);
        };

        if (isOpen) {
            initializeSubmitting();
        }
    }, [isOpen]);

    /*
     * Close with Escape.
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    const handleConfirm = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await onConfirm();
        } catch {
            /*
             * Keep the modal open if the action fails.
             * The parent component handles the error toast.
             */
            setIsSubmitting(false);
        }
    };

    const resolvedTitle = title || config.title;

    const resolvedDescription =
        description ||
        (itemName
            ? `Are you sure you want to ${action} "${itemName}"? ${config.defaultDescription}`
            : config.defaultDescription);

    const resolvedConfirmLabel = confirmLabel || config.confirmLabel;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Backdrop */}
                    <motion.button
                        type="button"
                        aria-label="Close confirmation dialog"
                        onClick={() => {
                            if (!isSubmitting) {
                                onClose();
                            }
                        }}
                        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] cursor-default"
                        variants={backdropVariants}
                    />

                    {/* Modal */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmation-modal-title"
                        variants={modalVariants}
                        className="
              relative w-full max-w-md
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-2xl
            "
                    >
                        {/* Top accent */}
                        <motion.div
                            className="h-1 w-full bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea]"
                            initial={{ scaleX: 0, transformOrigin: 'left' }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0, transformOrigin: 'right' }}
                            transition={{
                                duration: 0.35,
                                ease: 'easeOut',
                            }}
                        />

                        <div className="p-6">
                            {/* Header */}
                            <motion.div
                                variants={contentVariants}
                                className="flex items-start gap-4"
                            >
                                {/* Icon */}
                                <motion.div
                                    variants={iconVariants}
                                    className={`
                    shrink-0
                    w-12 h-12
                    rounded-xl
                    border
                    flex items-center justify-center
                    ${config.iconWrapperClass}
                  `}
                                >
                                    {config.icon}
                                </motion.div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <h2
                                        id="confirmation-modal-title"
                                        className="text-lg font-black text-slate-900 tracking-tight"
                                    >
                                        {resolvedTitle}
                                    </h2>

                                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                                        {resolvedDescription}
                                    </p>
                                </div>

                                {/* Close button */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="
                    shrink-0
                    p-1.5
                    rounded-lg
                    text-slate-400
                    hover:text-slate-700
                    hover:bg-slate-100
                    transition-colors
                    cursor-pointer
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                                    aria-label="Close"
                                >
                                    <X size={17} />
                                </button>
                            </motion.div>

                            {/* Delete warning */}
                            <AnimatePresence initial={false}>
                                {action === 'delete' && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -4,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            height: 'auto',
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -4,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            ease: 'easeOut',
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3">
                                            <AlertTriangle
                                                size={15}
                                                className="mt-0.5 shrink-0 text-[#e11d48]"
                                            />

                                            <p className="text-[11px] leading-4.5 text-rose-700">
                                                This action is permanent and cannot be undone.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <motion.div
                                variants={contentVariants}
                                className="mt-6 flex items-center justify-end gap-2.5"
                            >
                                <motion.button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    whileHover={{
                                        scale: 1.02,
                                    }}
                                    whileTap={{
                                        scale: 0.97,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 25,
                                    }}
                                    className="
                    min-h-[40px]
                    px-4
                    rounded-xl
                    border border-slate-200
                    bg-white
                    text-slate-700
                    text-xs font-bold
                    hover:bg-slate-50
                    transition-colors
                    cursor-pointer
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                                >
                                    {cancelLabel}
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={isSubmitting}
                                    whileHover={
                                        !isSubmitting
                                            ? {
                                                scale: 1.025,
                                            }
                                            : undefined
                                    }
                                    whileTap={
                                        !isSubmitting
                                            ? {
                                                scale: 0.97,
                                            }
                                            : undefined
                                    }
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 25,
                                    }}
                                    className={`
                    min-h-[40px]
                    px-4
                    rounded-xl
                    text-white
                    text-xs font-bold
                    transition-colors
                    cursor-pointer
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                    ${config.confirmButtonClass}
                  `}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            {config.icon}
                                            <span>{resolvedConfirmLabel}</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}