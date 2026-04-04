Testing Questions:
- How does the developer input his db_url and make the endUser register into his database? cos this current setup is saving to my endUser database.

- How does the email verifcation for the endUser work with the developer?

- How does will the token change work with the developer? Research how token works with other auth tools.

- for google, github, and other oauth authentication, users should no thave to input their clientID and secret into the app, they should have in their .env.

## TODO
- Research how tokens (both access tokens and refresh token work) in other auth tools.
- Fix the total registrations and login count (EndUser count for the developer)
- Store access and refresh token in a database field and make it work exactly as it works right now.