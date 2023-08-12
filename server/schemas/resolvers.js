// const { AuthenticationError } = require('apollo-server-express');
const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({
          _id: context.user._id,
        });
        return userData;
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const userData = await User.create({ username, email, password });
      const token = signToken(userData);
      return { token, userData };
    },

    login: async (parent, { email, password }) => {
      const userData = await User.findOne({ email });

      if (!userData) {
        throw AuthenticationError;
      }

      const correctPw = await userData.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(userData);

      return { token, userData };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (!context.user) {
        throw AuthenticationError;
      } else {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );

        return updatedUser;
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw AuthenticationError;
      } else {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: book } },
          { new: true }
        );

        return updatedUser;
      }
    },
  },
};

module.exports = resolvers;
