'use client';

import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
    mapContentApiToDashboard,
    useContentsQuery,
    useDeleteContentMutation,
    useUpdateContentMutation,
} from '@/hooks/use-contents-api';

import type { Content, ContentData } from '@/lib/types';
import { ContentEditorModal } from './ContentEditorModal';
import { ContentPageHeader } from './ContentPageHeader';
import { ContentRoleBanner } from './ContentRoleBanner';
import { ContentSearchBar } from './ContentSearchBar';
import { ContentList } from './ContentList';

import { ActionConfirmationModal } from '@/components/ui/ActionConfirmationModal';

interface ContentManagementProps {
    onShowToast?: (
        msg: string,
        type?: 'success' | 'error' | 'info',
    ) => void;
}

const EMPTY_CONTENT: Content = {
    id: 0,
    slug: '',
    content: {},
    updatedByEmail: null,
    createdAt: '',
    updatedAt: '',
};

export function ContentManagement({
    onShowToast,
}: ContentManagementProps) {
    const { showToast: contextToast } = useToast();
    const showToast = onShowToast ?? contextToast;

    const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);
    const { currentUser } = useAuth();

    const {
        data: contentApiData = [],
        isLoading,
        isError,
        error,
    } = useContentsQuery();

    const updateContentMutation = useUpdateContentMutation();
    const deleteContentMutation = useDeleteContentMutation();

    const contents = contentApiData.map(mapContentApiToDashboard);

    const [searchTerm, setSearchTerm] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<Content | null>(null);

    const userRole = currentUser?.role ?? 'user';
    const canEdit = userRole === 'admin' || userRole === 'editor';

    const filteredContents = contents.filter((content) =>
        content.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const openCreateEditor = () => {
        setSelectedContent(EMPTY_CONTENT);
        setEditorOpen(true);
    };

    const openEditEditor = (content: Content) => {
        setSelectedContent(content);
        setEditorOpen(true);
    };

    const closeEditor = () => {
        if (updateContentMutation.isPending) return;

        setEditorOpen(false);
        setSelectedContent(null);
    };

    const handleDeleteContent = (content: Content) => {
        setDeleteTarget(content);
    };

    const confirmDeleteContent = () => {
        if (!deleteTarget) {
            return;
        }

        return new Promise<void>((resolve, reject) => {
            deleteContentMutation.mutate(deleteTarget.id, {
                onSuccess: () => {
                    showToast('Content removed successfully.', 'success');
                    setDeleteTarget(null);
                    resolve();
                },

                onError: (mutationError) => {
                    const error =
                        mutationError instanceof Error
                            ? mutationError
                            : new Error('Content delete failed.');

                    showToast(error.message, 'error');
                    reject(error);
                },
            });
        });
    };

    const handleSaveContent = (slug: string, content: ContentData) => {
        if (!slug.trim()) {
            showToast('Content slug is required.', 'error');
            return;
        }

        updateContentMutation.mutate(
            { slug: slug.trim(), content },
            {
                onSuccess: () => {
                    showToast('Content saved successfully.', 'success');
                    closeEditor();
                },
                onError: (mutationError) => {
                    showToast(
                        mutationError instanceof Error
                            ? mutationError.message
                            : 'Content save failed.',
                        'error',
                    );
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full font-sans">
            <ContentPageHeader
                contentCount={contents.length}
                canEdit={canEdit}
                onCreateClick={openCreateEditor}
            />

            <ContentRoleBanner role={userRole} canEdit={canEdit} />

            <ContentSearchBar value={searchTerm} onChange={setSearchTerm} />

            <ContentList
                contents={filteredContents}
                isLoading={isLoading}
                isError={isError}
                errorMessage={error instanceof Error ? error.message : undefined}
                canEdit={canEdit}
                onEdit={openEditEditor}
                onDelete={handleDeleteContent}
            />

            <ActionConfirmationModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDeleteContent}
                action="delete"
                title="Delete Content"
                itemName={deleteTarget ? `/${deleteTarget.slug}` : undefined}
                confirmLabel="Delete Content"
            />

            {selectedContent && (
                <ContentEditorModal
                    isOpen={editorOpen}
                    onClose={closeEditor}
                    slug={selectedContent.slug}
                    initialContent={selectedContent.content}
                    onSave={handleSaveContent}
                    isSaving={updateContentMutation.isPending}
                />
            )}
        </div>
    );
}