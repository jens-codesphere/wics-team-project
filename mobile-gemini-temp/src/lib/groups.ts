import { supabase } from '@/lib/supabase';

export type GroupSummary = {
    id: string;
    name: string;
    budget: number | null;
    join_code: string | null;
    created_by: string;
    created_at: string | null;
    };

    export type GroupMember = {
    id: string;
    displayName: string;
    budget: number | null;
    interests: string[];
    transportation: string | null;
    };

    export async function createGroup(
    name: string,
    budget: number | null
    ): Promise<string> {
    const { data, error } = await supabase.rpc('create_group', {
        group_name: name.trim(),
        group_budget: budget ?? undefined,
    });

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error('Group was created without returning an ID.');
    }

    return data;
    }

    export async function joinGroup(joinCode: string): Promise<string> {
    const { data, error } = await supabase.rpc('join_group_by_code', {
        join_code_input: joinCode.trim().toUpperCase(),
    });

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error('Group join did not return a group ID.');
    }

    return data;
    }

    export async function getMyGroups(): Promise<GroupSummary[]> {
    const { data: authData, error: authError } =
        await supabase.auth.getUser();

    if (authError) {
        throw authError;
    }

    const user = authData.user;

    if (!user) {
        throw new Error('Not authenticated.');
    }

    const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

    if (membershipError) {
        throw membershipError;
    }

    const groupIds = (memberships ?? []).map(
        (membership) => membership.group_id
    );

    if (groupIds.length === 0) {
        return [];
    }

    const { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('id, name, budget, join_code, created_by, created_at')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

    if (groupError) {
        throw groupError;
    }

    return groups ?? [];
    }

    export async function getGroup(groupId: string): Promise<GroupSummary> {
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, budget, join_code, created_by, created_at')
        .eq('id', groupId)
        .single();

    if (error) {
        throw error;
    }

    return data;
    }

    export async function getGroupMembers(
    groupId: string
    ): Promise<GroupMember[]> {
    const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

    if (membershipError) {
        throw membershipError;
    }

    const userIds = (memberships ?? []).map(
        (membership) => membership.user_id
    );

    if (userIds.length === 0) {
        return [];
    }

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, budget, interests, transportation')
        .in('id', userIds);

    if (profileError) {
        throw profileError;
    }

    return (profiles ?? []).map((profile) => ({
        id: profile.id,
        displayName: profile.display_name,
        budget: profile.budget,
        interests: profile.interests ?? [],
        transportation: profile.transportation,
    }));
}