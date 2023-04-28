import path, { dirname } from "path";
import { readFileSync } from "fs";
import { books, libraries } from "./data";
import { fileURLToPath } from "url";
import { PubSub } from "graphql-subscriptions";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pubsub = new PubSub();

let currentNumber = 0;
function incrementNumber() {
  currentNumber++;
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
  setTimeout(incrementNumber, 1000);
}
incrementNumber();

//Resolver
export const resolvers = {
  Query: {
    books() {
      return books;
    },
    libraries() {
      return libraries;
    },
    findBookByBranch(_, { branchName }, context) {
      context.hello = "world";
      return books.find((book) => book.branch === branchName);
    },
    currentNumber() {
      return currentNumber;
    },
    throwError() {
      try {
        throw new Error("Example demo throw an error ");
      } catch (error) {
        return {
          message: error.message,
          error: "Demo error"
        };
      }
    }
  },
  Mutation: {
    insertNewBook: (_, { book }) => {
      books.push(book);
      return book;
    }
  },
  Subscription: {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"])
    }
  },
  Library: {
    books(parent) {
      return books.filter((book) => book.branch === parent.branch);
    }
  },
  Book: {
    author(parent) {
      return {
        name: parent.author
      };
    },
    test(parent, args, context) {
      return "test";
    }
  }
};

export const typeDefs = readFileSync(path.join(__dirname, "demo.graphql"), {
  encoding: "utf-8"
});
