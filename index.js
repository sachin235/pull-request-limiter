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
    var { payload } = context

    // get author of the pull request
    var author = getAuthor(payload)

    // get the repository from context
    var repo = getRepository(payload)

    // labels to be applied before closing
    var closingLabels = ["invalid"]

    // maximum number of allowed pull requests
    var threshold = 2

    // construct query string to get all pull requests
    // created by an author in the current repository
    var queryString = `repo:${repo} author:${author} is:pr type:pr`
    app.log(queryString)

    // search github using the constructed query string
    var response = await context.github.search.issuesAndPullRequests({q: queryString})
    var count = getCountOfValidPullRequests(response)

    if(count > threshold) {
      addLabelAndClosePullRequest(context, closingLabels)
    }


    // const issueComment = context.issue({ body: 'Thanks for editing the issue!' })
    // return context.github.issues.createComment(issueComment)
  }

  function getAuthor(payload) {
    return payload.issue.user.login
  }

  function getRepository(payload) {
    return payload.repository.full_name
  }

  function getCountOfValidPullRequests(response) {
    var { data } = response
    var { items } = data

    var filteredPullRequests = items.filter(item => {
      var labels = item.labels.map(label => label.name)
      return !filterPullRequestsUsingLabels(labels)
    })

    return filteredPullRequests.length
  }

  function filterPullRequestsUsingLabels(labels) {
    invalidLabel = "invalid"
    return labels.includes(invalidLabel)
  }

  function addLabelAndClosePullRequest(context, labels) {

  }

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
