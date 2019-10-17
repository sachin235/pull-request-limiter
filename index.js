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
    var payload = context.payload

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
