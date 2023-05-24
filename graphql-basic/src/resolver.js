import path, { dirname } from "path";
import { readFileSync } from "fs";
import { books, libraries } from "./data";
import { fileURLToPath } from "url";
import { PubSub } from "graphql-subscriptions";
import Dataloader from "dataloader";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pubsub = new PubSub();

let currentNumber = 0;
function incrementNumber() {
  currentNumber++;
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
  setTimeout(incrementNumber, 1000);
}
incrementNumber();

const getLibraryByBranchName = (name) => {
  console.log("Find branch name for books: ", name);
  return libraries.find((lib) => lib.branch === name);
}

const getBookByBranchName = (name) => {
  const data = books.filter((book) => book.branch === name);
  console.log("filter for book: ", data)
  return data;
}

const getBookByBranchNames = (names) => {
  console.log('From dataloader, ', names);
  const data = names.map((name) => getBookByBranchName(name));
  console.log("return from loader ", data);
  return Promise.resolve(data);
}

const domain = new Dataloader(getBookByBranchNames);

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
      //      return getBookByBranchName(parent.branch);
      return domain.load(parent.branch); 
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
