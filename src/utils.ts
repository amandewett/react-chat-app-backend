export const userDetailsSelect = {
  name: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  id: true,
  profilePicture: true,
};

export const chatResponseInclude = {
  participants: {
    select: userDetailsSelect,
  },
  groupAdmin: {
    select: userDetailsSelect,
  },
  latestMessage: {
    include: {
      sender: {
        select: userDetailsSelect,
      },
    },
  },
};

export const messageResponseInclude = {
  chat: true,
  sender: {
    select: userDetailsSelect,
  },
};
