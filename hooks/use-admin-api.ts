'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminStatsApi, type AdminStatsApiRecord } from '@/lib/api';

const ADMIN_STATS_QUERY_KEY = ['admin', 'stats'];

export function useAdminStatsQuery() {
    return useQuery({
        queryKey: ADMIN_STATS_QUERY_KEY,
        queryFn: getAdminStatsApi,
    });
}

export function mapAdminStatsApiToDashboard(stats: AdminStatsApiRecord) {
    return {
        users: stats.users,
        pages: stats.pages,
        contacts: stats.contacts,
    };
}
