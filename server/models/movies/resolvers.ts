export default {
  Query: {
    movie() {
      return {
        name: 'movie1'
      }
    }
  },

  Mutation: {
    addMovie(name: String) {
      return {
        name
      }
    }
  }
}
