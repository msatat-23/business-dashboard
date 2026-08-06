'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createPageApi,
    deletePageApi,
    getPages,
    getPublicPageBySlug,
    updatePageBySlug,
    type PageApiRecord,
} from '@/lib/api';

const PAGES_QUERY_KEY = ['pages'];

export function usePublicPageQuery(slug: string) {
    return useQuery({
        queryKey: ['page', slug],
        queryFn: () => getPublicPageBySlug(slug),
        enabled: Boolean(slug),
    });
}

export function usePagesQuery() {
    return useQuery({
        queryKey: PAGES_QUERY_KEY,
        queryFn: getPages,
    });
}

export function useCreatePageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPageApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
        },
    });
}

export function useUpdatePageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ slug, content }: { slug: string; content: Record<string, any> }) =>
            updatePageBySlug(slug, { content }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['page', variables.slug] });
            queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
        },
    });
}

export function useDeletePageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePageApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
        },
    });
}

export function mapPageApiToDashboard(page: PageApiRecord) {
    return {
        id: page.id,
        slug: page.slug,
        content: page.content,
        updatedByEmail: page.updatedByEmail,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
    };
}
