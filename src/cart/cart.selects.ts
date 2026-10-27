export const cartInclude = {
    items: {
      orderBy: { id: 'asc' as const },
      include: {
        variant: {
          include: {
            images: { orderBy: { displayOrder: 'asc' as const } },
          },
        },
      },
    },
  };