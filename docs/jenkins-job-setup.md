# Jenkins Job Setup

If the Jenkins build log only says this:

```text
Started by GitLab push by Sabbir Hossain Shuvo
Running as SYSTEM
Building in workspace /var/jenkins_home/workspace/doc-backend
Finished: SUCCESS
```

then Jenkins received the GitLab webhook, but it did not run this repository's `Jenkinsfile`.

A real run should show stages like:

```text
[Pipeline] stage
[Pipeline] { (Checkout)
[Pipeline] { (Install)
[Pipeline] { (Quality Gate)
[Pipeline] { (Build Image)
```

## Fix

Create or reconfigure the Jenkins job as a Pipeline job.

1. Open Jenkins.
2. Open the `doc-backend` job.
3. Click **Configure**.
4. In **Definition**, choose **Pipeline script from SCM**.
5. In **SCM**, choose **Git**.
6. Set **Repository URL** to this GitLab repository URL.
7. Set credentials if the repository is private.
8. Set **Branch Specifier** to the branch you deploy from, for example:

```text
*/main
```

or:

```text
*/dev
```

9. Set **Script Path** to:

```text
Jenkinsfile
```

10. Enable your GitLab webhook trigger.
11. Save.
12. Click **Build Now** once manually.

## Required Jenkins Plugins

- Pipeline
- Git
- GitLab
- SSH Agent
- Credentials Binding
- AnsiColor

The Jenkins agent also needs:

- Node.js and npm
- Docker CLI
- Docker permission for the Jenkins user
- SSH access to the VPS

## Required Credentials

These IDs must exist in Jenkins because the `Jenkinsfile` references them:

- `dockerhub-creds`
- `doc-vps-ssh`
- `doc-backend-env-production`
- `doc-backend-env-prerelease`

## Important

Do not configure this as a Freestyle job with only a GitLab trigger. A Freestyle job can be triggered successfully and still do nothing useful. The pipeline must load `Jenkinsfile` from SCM.
