/**
 * This is the main entrypoint to the Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.on('pull_request.opened', handlePullRequestCreated)

  /**
   * This method is executed when {pull_request.opened} event is fired
   * and is the main entry point
   * @param {import('probot').Context} context
   */
  async function handlePullRequestCreated (context) {
    // get payload from context
    var { payload } = context

    // get author of the pull request
    var author = getAuthor(payload)

    // get the repository from context
    var repo = getRepository(payload)

    // labels to be applied before closing
    var closingLabels = ['invalid']

    // maximum number of allowed pull requests
    var threshold = 2

    // construct query string to get all pull requests
    // created by an author in the current repository
    var queryString = `repo:${repo} author:${author} is:pr type:pr`
    app.log(queryString)

    // search github using the constructed query string
    var response = await context.github.search.issuesAndPullRequests({ q: queryString })
    var count = getCountOfValidPullRequests(response)

    if (count > threshold - 1) {
      addLabelAndClosePullRequest(context, closingLabels)
    }
  }

  /**
   * This method returns author of pull request
   * @param payload - the payload data provided by Github
   */
  function getAuthor (payload) {
    return payload.pull_request.user.login
  }

  /**
   * This method returns the full name of the base repository in the format
   * organisation/repository or
   * user/repository
   * @param payload - the payload data provided by Github
   */
  function getRepository (payload) {
    return payload.repository.full_name
  }

  /**
   * This method returns a list of valid pull requests
   * @param response - the response returned from request
   */
  function getValidPullRequests (response) {
    var { data } = response
    var { items } = data

    var filteredPullRequests = items.filter(item => {
      var labels = item.labels.map(label => label.name)
      return !filterPullRequestsUsingLabels(labels)
    })

    return filteredPullRequests
  }

  /**
   * This method returns count of valid pull requests
   * @param response - the response returned from request
   */
  function getCountOfValidPullRequests (response) {
    return getValidPullRequests(response).length
  }

  /**
   * This method checks if the specified label
   * is present in the list of given labels or not
   * @param labels - the list of labels to check in
   */
  function filterPullRequestsUsingLabels (labels) {
    var invalidLabel = 'invalid'
    return labels.includes(invalidLabel)
  }

  /**
   * This method adds labels and closes the current pull request
   * @param context - the context of the event
   * @param labels - the list of labels to apply
   */
  function addLabelAndClosePullRequest (context, labels) {
    addLabels(context, labels)
    closePullRequest(context)
  }

  /**
   * This method applies labels to the current pull request
   * @param context - the context of the event
   * @param labels - the list of labels to apply
   */
  function addLabels (context, labels) {
    var pullRequestLabels = context.issue({ labels: labels })
    context.github.issues.addLabels(pullRequestLabels)
  }

  /**
   * This method closes the current pull request
   * @param context - the context of the event
   */
  function closePullRequest (context) {
    var pullRequestClosedState = context.issue({ state: 'closed' })
    context.github.pulls.update(pullRequestClosedState)
  }
}
