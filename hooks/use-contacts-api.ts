'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getContactsApi,
    createContactApi,
    updateContactStatusApi,
    deleteContactApi,
    type ContactApiRecord,
} from '@/lib/api';
import type { ContactStatus } from '@/lib/types';

const CONTACTS_QUERY_KEY = ['contacts'];

export function useContactsQuery() {
    return useQuery({
        queryKey: CONTACTS_QUERY_KEY,
        queryFn: getContactsApi,
    });
}

export function useCreateContactMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createContactApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
        },
    });
}

export function useUpdateContactStatusQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, contactStatus }: { id: string; contactStatus: ContactStatus }) =>
            updateContactStatusApi(id, contactStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
        },
    });
}

export function useDeleteContactMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteContactApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
        },
    });
}

export function mapContactApiToDashboard(contact: ContactApiRecord) {
    return {
        id: contact.id,
        fullName: contact.fullName,
        phone: contact.phone,
        jobTitle: contact.jobTitle,
        email: contact.email,
        submittedByUserId: contact.submittedByUserId,
        createdAt: contact.createdAt,
        status: contact.contactStatus || 'new',
    };
}