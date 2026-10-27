export const orderInclude = {
    items: true,
    statusHistory: { orderBy: { createdAt: 'asc' as const } },
};