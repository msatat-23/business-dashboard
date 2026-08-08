'use client';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import {
    createContentApi,
    deleteContentApi,
    getContents,
    getPublicContentBySlug,
    updateContentBySlug,
    type ContentApiRecord,
} from '@/lib/api';

import type { ContentData } from '@/lib/types';

const CONTENTS_QUERY_KEY = ['contents'];

export function useContentsQuery() {
    return useQuery({
        queryKey: CONTENTS_QUERY_KEY,
        queryFn: getContents,
    });
}

export function usePublicContentQuery(slug: string) {
    return useQuery({
        queryKey: ['content', slug],
        queryFn: () => getPublicContentBySlug(slug),
        enabled: Boolean(slug),
    });
}

export function useCreateContentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createContentApi,

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: CONTENTS_QUERY_KEY,
            });

            queryClient.invalidateQueries({
                queryKey: ['content', variables.slug],
            });
        },
    });
}

export function useUpdateContentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            slug,
            content,
        }: {
            slug: string;
            content: ContentData;
        }) =>
            updateContentBySlug(slug, {
                content,
            }),

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: CONTENTS_QUERY_KEY,
            });

            queryClient.invalidateQueries({
                queryKey: ['content', variables.slug],
            });
        },
    });
}

export function useDeleteContentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteContentApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: CONTENTS_QUERY_KEY,
            });
        },
    });
}

export function mapContentApiToDashboard(
    content: ContentApiRecord,
) {
    return content;
}
