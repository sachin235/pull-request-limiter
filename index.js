/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('issues.edited', handlePullRequestCreated)

  // main function entry-point
  async function handlePullRequestCreated(context) {
    // get payload from context
    var payload = context.payload

    // get author of the pull request
    var author = getAuthor(payload)

    // get the repository from context
    var repo = getRepository(payload)

    // construct query string to get all pull requests
    // created by an author in the current repository
    var queryString = `repo:${repo} author:${author} is:pr`

    // search github using the constructed query string
    var searchedPullRequestsContext = await context.github.search.issues({q : queryString})


    const issueComment = context.issue({ body: 'Thanks for editing the issue!' })
    return context.github.issues.createComment(issueComment)
  }

  function getAuthor(payload) {
    return payload.issue.user.login
  }

  function getRepository(payload) {
    return payload.repository.full_name
  }

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
